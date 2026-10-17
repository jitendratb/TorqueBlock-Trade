export const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:4000/api/v1" : "https://api.torqueblock.com/api/v1")).replace(/\/+$/, "");

export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.code = data?.code;
        this.data = data;
    }
}

// The auth module registers how to read/refresh/clear the session, keeping this file free of imports.
const session = { getToken: () => null, setToken: () => { }, clear: () => { } };
export const configureSession = (handlers) => Object.assign(session, handlers);

const buildUrl = (path, params) => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${API_BASE_URL}${cleanPath}`);
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
    });
    return url;
};

let refreshing = null;

// One refresh request at a time; concurrent 401s wait for the same promise.
const refreshToken = () => {
    refreshing ??= fetch(buildUrl("/auth/refresh-token"), { method: "POST", credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
            if (!data?.token) return null;
            session.setToken(data.token);
            return data.token;
        })
        .catch(() => null)
        .finally(() => {
            refreshing = null;
        });
    return refreshing;
};

async function request(path, { method = "GET", body, params, revalidate, auth = false, timeout = 20000 } = {}, retried = false) {
    const isBrowser = typeof window !== "undefined";
    const token = auth && isBrowser ? session.getToken() : null;

    const res = await fetch(buildUrl(path, params), {
        method,
        headers: {
            Accept: "application/json",
            ...(body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: isBrowser ? "include" : undefined,
        signal: AbortSignal.timeout(timeout),
        ...(revalidate !== undefined ? { next: { revalidate } } : {}),
    });

    if (res.status === 401 && token && !retried) {
        if (await refreshToken()) return request(path, { method, body, params, revalidate, auth, timeout }, true);
        session.clear();
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false) {
        throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data);
    }
    return data;
}

export const http = {
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, body, options) => request(path, { ...options, method: "POST", body }),
    put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
    delete: (path, options) => request(path, { ...options, method: "DELETE" }),
    del: (path, options) => request(path, { ...options, method: "DELETE" }),
};
