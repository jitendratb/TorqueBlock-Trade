import { http } from "@/api/http";

// POST /auth/login → sends a WhatsApp OTP (creates the account on first login).
export const sendOtp = (phone) => http.post("/auth/login", { phone });

// POST /auth/verify-otp → { token, user }
export const verifyOtp = (otp, otpVerifyToken) => http.post("/auth/verify-otp", { otp, otpVerifyToken });

// GET /trade/me → dealer profile with status and billing address
export const fetchProfile = () => http.get("/trade/me", { auth: true }).then((res) => res.data);
