// Same backend as the B2C store (TorqueBlock-Backend). Override with NEXT_PUBLIC_API_URL
// (e.g. http://localhost:4000/api/v1) when running the backend locally.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.torqueblock.com/api/v1";

export const TOKEN_KEY = "tradeAuthToken";
export const USER_KEY = "tradeUser";

async function request(path, { method = "GET", body, params, revalidate, timeout = 15000 } = {}) {
    const url = new URL(`${API_BASE_URL}${path}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) url.searchParams.set(key, value);
        });
    }

    const headers = { "Content-Type": "application/json", Accept: "application/json" };
    if (typeof window !== "undefined") {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: typeof window !== "undefined" ? "include" : undefined,
        signal: AbortSignal.timeout(timeout),
        ...(revalidate !== undefined ? { next: { revalidate } } : {}),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const error = new Error(data?.message || `Request failed (${res.status})`);
        error.status = res.status;
        throw error;
    }
    return data;
}

const api = {
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, body, options) => request(path, { ...options, method: "POST", body }),
};

export default api;
