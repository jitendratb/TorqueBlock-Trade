import { api } from "@/api";
import AddressService from "./AddressService";

// Authentication & profile (WhatsApp OTP login, profile read / update).
class AuthService {
    static sendOtp = (phone) => api.post("/trade/login", { phone }, { silent: true });

    static verifyOtp = (otp, otpVerifyToken) =>
        api.post("/trade/login/verify-otp", { otp, otpVerifyToken }, { silent: true });

    // Backend user → app profile.
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
            businessAccountId: user.tradeBusinessAccount
                ? String(user.tradeBusinessAccount._id ?? user.tradeBusinessAccount)
                : null,
            address: AddressService.pickTradeAddress(user.address),
        };
    }

    static fetchProfile = async (userId) => AuthService.toProfile((await api.get(`/auth/${userId}`)).data);

    static updateUser = (userId, fields) => api.put(`/auth/${userId}`, fields);
}

export default AuthService;
export const { sendOtp, verifyOtp, fetchProfile, updateUser } = AuthService;
