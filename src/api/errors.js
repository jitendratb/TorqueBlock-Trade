
export class ApiError extends Error {
    constructor(message, status = 500, data = null, code = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code || data?.code || "UNKNOWN_ERROR";
        this.data = data;
    }
}

export const toApiError = (error) => {
    if (error instanceof ApiError) return error;
    const status = error.response?.status ?? (error.code === "ECONNABORTED" ? 408 : 0);
    const data = error.response?.data ?? null;
    const message = data?.message || (status ? `Request failed with status ${status}` : "Network error. Please check your connection.");
    return new ApiError(message, status, data);
};

