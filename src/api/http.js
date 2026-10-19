const getDefaultApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:4000/api/v1";
    }
  } else if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev") {
    return "http://localhost:4000/api/v1";
  }
  return "https://api.torqueblock.com/api/v1" || "https://test.torqueblock.com/api/v1";
};

export const API_BASE_URL = getDefaultApiUrl().replace(/\/+$/, "");

// ==========================================
// 2. Custom Error Class
// ==========================================

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = data?.code;
    this.data = data;
  }
}

// ==========================================
// 3. Session Management
// ==========================================

const session = {
  getToken: () => null,
  setToken: (_token) => { },
  clear: () => { },
};

export const configureSession = (handlers) => {
  Object.assign(session, handlers);
};

// ==========================================
// 4. Helper Functions
// ==========================================

const buildUrl = (path, params) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${cleanPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  return url;
};

// ==========================================
// 5. Token Refresh Handling
// ==========================================

let refreshingPromise = null;

const refreshToken = async () => {
  if (!refreshingPromise) {
    refreshingPromise = (async () => {
      try {
        const res = await fetch(buildUrl("/auth/refresh-token"), {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) return null;

        const data = await res.json().catch(() => null);
        if (!data?.token) return null;

        session.setToken(data.token);
        return data.token;
      } catch {
        return null;
      } finally {
        refreshingPromise = null;
      }
    })();
  }
  return refreshingPromise;
};

// ==========================================
// 6. Core Request Engine
// ==========================================

async function request(path, { method = "GET", body, params, revalidate, auth = false, timeout = 20000 } = {}, retried = false) {
  const isBrowser = typeof window !== "undefined";
  const token = auth && isBrowser ? session.getToken() : null;

  const headers = {
    Accept: "application/json",
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res;
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: isBrowser ? "include" : undefined,
      signal: AbortSignal.timeout(timeout),
      ...(revalidate !== undefined ? { next: { revalidate } } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }
    throw new ApiError(error.message || "Network error occurred", 0);
  }

  // Handle Token Expiration & Retry (Once)
  if (res.status === 401 && token && !retried) {
    const newToken = await refreshToken();
    if (newToken) {
      return request(path, { method, body, params, revalidate, auth, timeout }, true);
    }
    session.clear();
  }

  // Safely parse JSON responses
  const data = await res.json().catch(() => ({}));

  if (!res.ok || data?.success === false) {
    throw new ApiError(
      data?.message || `Request failed with status ${res.status}`,
      res.status,
      data
    );
  }

  return data;
}

// ==========================================
// 7. Public HTTP Export Methods
// ==========================================

export const http = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
  del: (path, options) => request(path, { ...options, method: "DELETE" }),
};