"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Button, FormError, Input } from "@/ui";
import { digitsOnly, validate } from "@/lib/validation";
import { sendOtp, verifyOtp } from "@/services/AuthService";
import { useAuthStore } from "@/store/authStore";

// Two-step WhatsApp OTP sign-in. Calls onSuccess(profile) once the session and profile are loaded.
export default function OtpForm({ onSuccess }) {
    const startSession = useAuthStore((s) => s.startSession);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const run = async (task) => {
        setError("");
        setLoading(true);
        try {
            await task();
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const requestOtp = (e) => {
        e.preventDefault();
        const message = validate({ phone });
        if (message) return setError(message);
        run(async () => {
            const res = await sendOtp(phone);
            setOtpToken(res.otpVerifyToken);
        });
    };

    const confirmOtp = (e) => {
        e.preventDefault();
        const message = validate({ otp });
        if (message) return setError(message);
        run(async () => {
            const res = await verifyOtp(otp, otpToken);
            const profile = await startSession(res.token);
            onSuccess?.(profile);
        });
    };

    if (!otpToken) {
        return (
            <form onSubmit={requestOtp} className="space-y-3">
                <div className="flex gap-2">
                    <span className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-bold text-zinc-300">+91</span>
                    <Input autoFocus aria-label="Mobile number" placeholder="Mobile number" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(digitsOnly(e.target.value))} />
                </div>
                <FormError>{error}</FormError>
                <Button type="submit" full loading={loading} loadingText="Sending OTP…" icon={<FaWhatsapp className="text-lg" />}>
                    Get OTP on WhatsApp
                </Button>
            </form>
        );
    }

    return (
        <form onSubmit={confirmOtp} className="space-y-3">
            <p className="text-sm text-zinc-400">
                OTP sent to <span className="font-bold text-white">+91 {phone}</span> on WhatsApp.
            </p>
            <Input autoFocus aria-label="OTP" className="text-center tracking-[0.5em] font-black" placeholder="••••••" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(digitsOnly(e.target.value))} />
            <FormError>{error}</FormError>
            <Button type="submit" full loading={loading} loadingText="Verifying…" disabled={otp.length !== 6}> Verify & Continue </Button>
            <div className="flex justify-between text-xs font-semibold text-zinc-400">
                <button type="button" onClick={() => { setOtpToken(""); setOtp(""); }} className="hover:text-white">Change number</button>
                <button type="button" disabled={loading} onClick={() => run(async () => setOtpToken((await sendOtp(phone)).otpVerifyToken))} className="hover:text-white disabled:opacity-50">Resend OTP</button>
            </div>
        </form>
    );
}
