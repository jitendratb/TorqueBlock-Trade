import axios from "axios";

// ============================================================================
// 1. Environment & Base URL Configuration (Dashboard Style)
// ============================================================================

// local development
// const baseURL = "http://localhost:4000/api/v1";

// test development
const defaultBaseURL = "https://test.torqueblock.com/api/v1";

// production development
// const baseURL = "https://api.torqueblock.com/api/v1";

export const baseURL = (process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || defaultBaseURL).replace(/\/+$/, "");
export const API_BASE_URL = baseURL;

// ============================================================================
// 2. Axios defaults — API modules call axios directly: axios.get(`${baseURL}/trade/stock`)
// ============================================================================

axios.defaults.withCredentials = true;
axios.defaults.headers.common.Accept = "application/json";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";
axios.defaults.headers.patch["Content-Type"] = "application/json";

// ============================================================================
// 3. Session & Auth State Management (Dashboard Style)
// ============================================================================

const sessionHandlers = {
    getToken: () => null,
    setToken: () => { },
    clear: () => { },
};

export const configureSession = (handlers = {}) => {
    Object.assign(sessionHandlers, handlers);
};

// Cookies only — safe to call from the store's logout (clearAuthState below also calls logout).
export const clearAuthCookies = () => {
    if (typeof document === "undefined") return;
    document.cookie = "TB_AUTH=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;";
    document.cookie = "TB_ROLE=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;";
};

export const clearAuthState = () => {
    if (typeof window !== "undefined") {
        clearAuthCookies();
        localStorage.removeItem("trade-auth");
        localStorage.removeItem("auth-storage");
        try {
            sessionHandlers.clear();
        } catch (e) {
            console.error("Failed to reset auth state:", e);
        }
    }
};

export const clearSession = clearAuthState;

// Cookie helper
const getCookie = (name) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
};

// ============================================================================
// 4. Request Interceptor (Dashboard Style)
// ============================================================================

axios.interceptors.request.use(
    async (config) => {
        if (typeof window !== "undefined") {
            // 1. The logged-in session (Zustand) — the cookie can hold an older login's token
            let token = sessionHandlers.getToken();

            // 2. Fallback to localStorage ('trade-auth') before the store has rehydrated
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

            // 3. Fallback to cookie (same as Dashboard)
            if (!token) {
                token = getCookie("TB_AUTH");
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } else {
            // Next.js Server Components / SSR Support
            try {
                const { cookies } = await import("next/headers");
                const cookieStore = await cookies();
                const token = cookieStore.get("TB_AUTH")?.value;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch {
                // Ignore SSR context without cookies
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ============================================================================
// 5. Custom ApiError class — every rejected request becomes one of these, so
//    screens can show the backend's message (err.message) and branch on err.status / err.code.
// ============================================================================

export class ApiError extends Error {
    constructor(message, status = 500, data = null, code = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code || data?.code || "UNKNOWN_ERROR";
        this.data = data;
    }
}

const toApiError = (error) => {
    if (error instanceof ApiError) return error;
    const status = error.response?.status ?? (error.code === "ECONNABORTED" ? 408 : 0);
    const data = error.response?.data ?? null;
    const message = data?.message || (status ? `Request failed with status ${status}` : "Network error. Please check your connection.");
    return new ApiError(message, status, data);
};

// ============================================================================
// 6. Response Interceptor (Dashboard Style with 401 Token Refresh)
// ============================================================================

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

axios.interceptors.response.use(
    (response) => {
        // Some endpoints answer 200 with { success: false }.
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
                        // Persist in cookie (Same as Dashboard)
                        document.cookie = `TB_AUTH=${newToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax;`;

                        // Update Zustand store
                        try {
                            sessionHandlers.setToken(newToken);
                        } catch { }

                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return axios(originalRequest);
                    }
                } catch {
                    // Falls through to clearing the session below.
                }
            }

            // Refresh failed, or the retried request also failed with 401
            console.warn("Session expired. Please log in again.");
            clearAuthState();
        }

        // silent: the caller has a fallback, so a failure is not an error (Next.js dev shows console.error as an overlay).
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
