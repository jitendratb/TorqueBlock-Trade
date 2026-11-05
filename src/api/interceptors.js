import axios from "axios";
import { baseURL } from "./config";
import { getCookie, getSessionToken, setSessionToken, clearAuthState } from "./session";
import { ApiError, toApiError } from "./errors";

// Refresh tokens rotate on every use, so parallel 401s must share one refresh call.
let refreshing = null;
const refreshAccessToken = () => {
    refreshing ??= axios
        .post(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true })
        .then((res) => res.data?.token || res.data?.data?.token || null)
        .finally(() => {
            refreshing = null;
        });
    return refreshing;
};

// Login, OTP and refresh answer 401 for their own reasons (e.g. "OTP expired") — never refresh for them.
const isAuthRoute = (url = "") => /^\/?auth\/(login|verify-otp|resend-otp|refresh-token)\b/.test(url.replace(baseURL, ""));

let interceptorsInitialized = false;

export const setupInterceptors = () => {
    if (interceptorsInitialized) return;
    interceptorsInitialized = true;

    axios.interceptors.request.use(
        async (config) => {
            if (typeof window !== "undefined") {
                let token = getSessionToken();

                if (!token) {
                    try {
                        const raw = localStorage.getItem("trade-auth");
                        if (raw) {
                            const parsed = JSON.parse(raw);
                            token = parsed?.state?.token || null;
                        }
                    } catch {
                        // Ignore JSON parse errors
                    }
                }

                if (!token) {
                    token = getCookie("TB_AUTH");
                }

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    axios.interceptors.response.use((response) => {
        if (response.data?.success === false) {
            return Promise.reject(new ApiError(response.data.message || "Request failed", response.status, response.data));
        }
        return response;
    },
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && originalRequest && !isAuthRoute(originalRequest.url)) {
                if (typeof window === "undefined") {
                    return Promise.reject(toApiError(error));
                }

                if (!originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const newToken = await refreshAccessToken();

                        if (newToken) {
                            document.cookie = `TB_AUTH=${newToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax;`;

                            try {
                                setSessionToken(newToken);
                            } catch { }

                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return axios(originalRequest);
                        }
                    } catch {
                        // Falls through to clearing session
                    }
                }

                console.warn("Session expired. Please log in again.");
                clearAuthState();
            }

            if (!originalRequest?.silent) {
                if (error.response?.status === 403) {
                    console.error("Forbidden: You do not have permission to perform this action.");
                } else if (error.response?.status >= 500) {
                    console.error("Server Error: An internal server error occurred.");
                }
            }

            return Promise.reject(toApiError(error));
        }
    );
};
