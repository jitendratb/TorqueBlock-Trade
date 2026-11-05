// Session & Auth State Management (Dashboard Style)
const sessionHandlers = {
    getToken: () => null,
    setToken: () => { },
    clear: () => { },
};

export const configureSession = (handlers = {}) => {
    Object.assign(sessionHandlers, handlers);
};

export const getSessionToken = () => sessionHandlers.getToken();

export const setSessionToken = (token) => sessionHandlers.setToken(token);

// Cookies only — safe to call from the store's logout.
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

export const getCookie = (name) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
};

