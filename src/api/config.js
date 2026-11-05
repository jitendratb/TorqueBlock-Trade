import axios from "axios";

export const baseURL = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://api.torqueblock.com/api/v1").trim().replace(/\/+$/, "");

export const API_BASE_URL = baseURL;

// Default axios headers and settings
export const setupAxiosDefaults = () => {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common.Accept = "application/json";
    axios.defaults.headers.post["Content-Type"] = "application/json";
    axios.defaults.headers.put["Content-Type"] = "application/json";
    axios.defaults.headers.patch["Content-Type"] = "application/json";
};

setupAxiosDefaults();

