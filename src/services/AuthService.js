import axios from "axios";
import { baseURL } from "@/api/http";
import AddressService from "./AddressService";

// Authentication & Profile Service (WhatsApp OTP login, session, profile updates).
class AuthService {
    static async sendOtp(phone) {
        const { data } = await axios.post(`${baseURL}/auth/login`, { phone });
        return data;
    }

    static async verifyOtp(otp, otpVerifyToken) {
        const { data } = await axios.post(`${baseURL}/auth/verify-otp`, { otp, otpVerifyToken });
        return data;
    }

    static toProfile(user) {
        if (!user) return null;
        const roles = user.roles || [];
        return {
            id: String(user._id),
            name: user.name || "",
            phone: String(user.phone || ""),
            email: user.email || "",
            gstin: user.gstin || "",
            isApproved: roles.includes("dealer"),
            address: AddressService.pickTradeAddress(user.address),
        };
    }

    static async fetchProfile(userId) {
        const { data } = await axios.get(`${baseURL}/auth/${userId}`);
        return AuthService.toProfile(data.data);
    }

    static async updateUser(userId, fields) {
        const { data } = await axios.put(`${baseURL}/auth/${userId}`, fields);
        return data;
    }
}

export default AuthService;
export const sendOtp = AuthService.sendOtp;
export const verifyOtp = AuthService.verifyOtp;
export const fetchProfile = AuthService.fetchProfile;
export const updateUser = AuthService.updateUser;
