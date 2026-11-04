import axios from "axios";
import { baseURL } from "@/api/http";
import AddressService from "./AddressService";

// Authentication & Profile Service (WhatsApp OTP login, session, profile updates).
class AuthService {
    // Trade Portal login (POST /trade/login): an OTP only goes to a number whose business profile Torque Block has
    // approved. Otherwise it fails with err.code NOT_REGISTERED or ACCOUNT_PENDING_APPROVAL, which the login form
    // shows, so the requests are `silent` (no Next dev error overlay).
    static async sendOtp(phone) {
        const { data } = await axios.post(`${baseURL}/trade/login`, { phone }, { silent: true });
        return data;
    }

    // -> { token, user }; also sets the refresh-token cookie.
    static async verifyOtp(otp, otpVerifyToken) {
        const { data } = await axios.post(`${baseURL}/trade/login/verify-otp`, { otp, otpVerifyToken }, { silent: true });
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
            // Set once the user owns or belongs to a trade business account (portal registration or added by Torque Block).
            businessAccountId: user.tradeBusinessAccount ? String(user.tradeBusinessAccount._id ?? user.tradeBusinessAccount) : null,
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
