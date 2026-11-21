
import axios from "axios";

// ============================================================================
// 1. ENVIRONMENT LINKS
// Switch environment by commenting/uncommenting the pair below.
// Environment variables (NEXT_PUBLIC_API_URL / NEXT_PUBLIC_SITE_URL) override these.
// ============================================================================

// --- 1) PRODUCTION ---
// const API_URL = "https://api.torqueblock.com/api/v1";
// const SITE_URL = "https://trade.torqueblock.com";

// --- 2) TESTING / STAGING ---
// const API_URL = "https://test.torqueblock.com/api/v1";
// const SITE_URL = "https://test-trade.torqueblock.com";

// --- 3) LOCALHOST ---
const API_URL = "http://localhost:4000/api/v1";
const SITE_URL = "http://localhost:3000";

const trimUrl = (url = "") => url.trim().replace(/\/+$/, "");

// Backend API base URL
export const baseURL = trimUrl(process.env.NEXT_PUBLIC_API_URL || API_URL);

// Trade Portal frontend URL (used for metadata, sitemap, links)
export const siteUrl = trimUrl(process.env.NEXT_PUBLIC_SITE_URL || SITE_URL);

export const API_TIMEOUT = 15000;

// ============================================================================
// 2. ERRORS — every failed request is normalised to an ApiError
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

export function toApiError(error) {
    if (error instanceof ApiError) return error;
    const status = error.response?.status ?? (error.code === "ECONNABORTED" ? 408 : 0);
    const data = error.response?.data ?? null;
    const message = data?.message || (status ? `Request failed with status ${status}` : "Network error. Please check your connection.");
    return new ApiError(message, status, data);
}

// ============================================================================
// 3. SESSION — auth token cookies, persisted store, handlers from authStore
// ============================================================================

export const AUTH_COOKIE_NAME = "TB_AUTH";
export const ROLE_COOKIE_NAME = "TB_ROLE";
export const AUTH_STORAGE_KEY = "trade-auth";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const EXPIRED = "expires=Thu, 01 Jan 1970 00:00:00 GMT";

const sessionHandlers = {
    getToken: () => null,
    setToken: () => { },
    clear: () => { },
};

// Called once by store/authStore so the API layer can read/update the token without importing the store.
export function configureSession(handlers = {}) {
    Object.assign(sessionHandlers, handlers);
}

export function getCookie(name) {
    if (typeof document === "undefined") return null;
    const parts = `; ${document.cookie}`.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(";").shift() : null;
}

export function setAuthCookie(token) {
    if (typeof document === "undefined" || !token) return;
    document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax;`;
}

// Store first, then persisted localStorage copy, then cookie.
export function getResolvedToken() {
    if (typeof window === "undefined") return null;

    let token = sessionHandlers.getToken();

    if (!token) {
        try {
            const raw = localStorage.getItem(AUTH_STORAGE_KEY);
            if (raw) token = JSON.parse(raw)?.state?.token || null;
        } catch {
            // Ignore storage errors
        }
    }

    return token || getCookie(AUTH_COOKIE_NAME);
}

export function updateSessionToken(token) {
    setAuthCookie(token);
    try {
        sessionHandlers.setToken(token);
    } catch {
        // Ignore store update errors
    }
}

export function clearAuthCookies() {
    if (typeof document === "undefined") return;
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; ${EXPIRED}; SameSite=Lax;`;
    document.cookie = `${ROLE_COOKIE_NAME}=; path=/; ${EXPIRED}; SameSite=Lax;`;
}

export function clearAuthState() {
    if (typeof window === "undefined") return;
    clearAuthCookies();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("auth-storage");
    try {
        sessionHandlers.clear();
    } catch (e) {
        console.error("Failed to reset auth state:", e);
    }
}

// ============================================================================
// 4. AXIOS CLIENT — auth header + automatic 401 token refresh
// ============================================================================

export const apiClient = axios.create({
    baseURL,
    withCredentials: true,
    timeout: API_TIMEOUT,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

let refreshPromise = null;

// Concurrent 401s share one refresh request.

function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true })
            .then((res) => res.data?.token || res.data?.data?.token || null)
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

function isAuthRoute(url = "") {
    const cleanPath = String(url)
        .replace(baseURL, "")
        .split("?")[0]
        .replace(/^\/+/, "");
    return /^(auth\/(login|verify-otp|resend-otp|refresh-token)|trade\/(login|register)(\/verify-otp)?)\b/.test(cleanPath);
}

apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = getResolvedToken();
            if (token && !config.headers?.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {
        if (response.data?.success === false) {
            return Promise.reject(
                new ApiError(response.data.message || "Request failed", response.status, response.data)
            );
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
                        updateSessionToken(newToken);
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return apiClient(originalRequest);
                    }
                } catch {
                    // Refresh failed, clear session below
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

// Shorthands that resolve to the response body (what every service needs).
const body = (request) => request.then((res) => res.data);
export const api = {
    get: (url, config) => body(apiClient.get(url, config)),
    post: (url, data, config) => body(apiClient.post(url, data, config)),
    put: (url, data, config) => body(apiClient.put(url, data, config)),
    delete: (url, config) => body(apiClient.delete(url, config)),
};

export default apiClient;
