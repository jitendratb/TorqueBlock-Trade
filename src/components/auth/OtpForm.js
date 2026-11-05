"use client";

import { useEffect, useState } from "react";
import { FormError, Button } from "@/ui";
import { digitsOnly, validate } from "@/lib/validation";
import { sendOtp, verifyOtp } from "@/services/AuthService";
import { useAuthStore } from "@/store/authStore";


export default function OtpForm({ onSuccess, onRegister }) {
    const startSession = useAuthStore((s) => s.startSession);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((c) => (c > 1 ? c - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const run = async (task) => {
        setError("");
        setErrorCode("");
        setLoading(true);
        try {
            await task();
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
            setErrorCode(err.code || "");
        } finally {
            setLoading(false);
        }
    };

    const requestOtp = (e) => {
        e.preventDefault();
        const message = validate({ phone });
        setErrorCode("");
        if (message) return setError(message);
        run(async () => {
            const res = await sendOtp(phone);
            setOtpToken(res.otpVerifyToken);
            setCooldown(30);
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

    // Step 1: Request OTP via Mobile Number
    if (!otpToken) {
        return (
            <div>
                {/* Header */}
                <div className="mb-5">
                    <h2 className="text-base sm:text-lg font-black tracking-[0.1em] uppercase text-white">
                        AUTHENTICATION
                    </h2>
                    <p className="mt-1 text-xs sm:text-[13px] text-zinc-400">
                        Enter your mobile number to receive an OTP on WhatsApp
                    </p>
                </div>

                <form onSubmit={requestOtp}>
                    {/* Mobile Number Field */}
                    <div className="space-y-1.5">
                        <label htmlFor="auth-mobile" className="block text-xs sm:text-[13px] font-bold text-zinc-200">
                            Mobile Number
                        </label>
                        <div className="flex items-center rounded-xl bg-[#2D323B] border border-white/10 px-4 py-3 sm:py-3.5 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all">
                            <span className="text-sm font-semibold text-zinc-200 mr-3 select-none">+91</span>
                            <input
                                id="auth-mobile"
                                autoFocus
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="Enter 10 digit number"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(digitsOnly(e.target.value));
                                    if (error) setError("");
                                    if (errorCode) setErrorCode("");
                                }}
                                className="w-full bg-transparent text-sm font-medium text-white placeholder:text-zinc-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Unregistered Dealer Notice */}
                    {errorCode === "NOT_REGISTERED" ? (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center space-y-2 mt-4">
                            <p className="text-xs sm:text-sm font-bold text-amber-300">
                                Business Not Registered
                            </p>
                            <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed">
                                {error || "No business is registered with this mobile number."} Please register your business profile first to get trade access.
                            </p>
                            <Button
                                href={`/register?phone=${phone}`}
                                onClick={onRegister}
                                className="w-full mt-2 py-3 rounded-xl bg-[#A35229] hover:bg-[#8F4420] text-xs sm:text-sm font-bold uppercase tracking-wider text-white justify-center shadow-md shadow-[#A35229]/25"
                            >
                                Register Your Business →
                            </Button>
                        </div>
                    ) : (
                        <>
                            {error && <FormError className="mt-2">{error}</FormError>}

                            {/* Main CTA Button */}
                            <button
                                type="submit"
                                disabled={loading || phone.length !== 10}
                                className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-[#A35229] hover:bg-[#8F4420] active:scale-[0.99] py-3.5 px-4 text-xs sm:text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#A35229]/25"
                            >
                                {loading ? (
                                    <span>Sending OTP…</span>
                                ) : (
                                    <>
                                        <span>GET ONE-TIME PASSWORD</span>
                                        <span className="text-base leading-none">→</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {/* Note at Bottom */}
                    <p className="mt-3.5 text-center text-[11px] sm:text-xs text-zinc-400 font-normal leading-relaxed">
                        Note: Verification code (OTP) will be delivered to your number on WhatsApp.
                    </p>
                </form>
            </div>
        );
    }

    // Step 2: Confirm OTP
    return (
        <div>
            {/* Header */}
            <div className="mb-5">
                <h2 className="text-base sm:text-lg font-black tracking-[0.1em] uppercase text-white">
                    AUTHENTICATION
                </h2>
                <p className="mt-1 text-xs sm:text-[13px] text-zinc-400">
                    Enter the 6-digit OTP sent to <span className="font-bold text-white">+91 {phone}</span> on WhatsApp
                </p>
            </div>

            <form onSubmit={confirmOtp}>
                <div className="space-y-1.5">
                    <label htmlFor="auth-otp" className="block text-xs sm:text-[13px] font-bold text-zinc-200">
                        One-Time Password
                    </label>
                    <div className="flex items-center rounded-xl bg-[#2D323B] border border-white/10 px-4 py-3 sm:py-3.5 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all">
                        <input
                            id="auth-otp"
                            autoFocus
                            type="tel"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="••••••"
                            value={otp}
                            onChange={(e) => {
                                setOtp(digitsOnly(e.target.value));
                                if (error) setError("");
                            }}
                            className="w-full bg-transparent text-center text-lg tracking-[0.5em] font-bold text-white placeholder:text-zinc-600 outline-none"
                        />
                    </div>
                </div>

                {error && <FormError className="mt-2">{error}</FormError>}

                {/* Confirm Button */}
                <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-[#A35229] hover:bg-[#8F4420] active:scale-[0.99] py-3.5 px-4 text-xs sm:text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#A35229]/25"
                >
                    {loading ? (
                        <span>Verifying…</span>
                    ) : (
                        <>
                            <span>VERIFY & CONTINUE</span>
                            <span className="text-base leading-none">→</span>
                        </>
                    )}
                </button>

                {/* Sub Actions */}
                <div className="mt-3.5 flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <button
                        type="button"
                        onClick={() => {
                            setOtpToken("");
                            setOtp("");
                            setError("");
                            setErrorCode("");
                        }}
                        className="hover:text-white transition-colors"
                    >
                        Change number
                    </button>
                    <button
                        type="button"
                        disabled={loading || cooldown > 0}
                        onClick={() =>
                            run(async () => {
                                const res = await sendOtp(phone);
                                setOtpToken(res.otpVerifyToken);
                                setCooldown(30);
                            })
                        }
                        className="hover:text-white disabled:opacity-50 transition-colors"
                    >
                        {cooldown > 0 ? `Resend OTP (${cooldown}s)` : "Resend OTP"}
                    </button>
                </div>

                {/* Note at Bottom */}
                <p className="mt-3 text-center text-[11px] sm:text-xs text-zinc-400 font-normal leading-relaxed">
                    Note: Verification code (OTP) will be delivered to your number on WhatsApp.
                </p>
            </form>
        </div>
    );
}
