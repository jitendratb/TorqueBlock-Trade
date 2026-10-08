"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { useTrade } from "@/context/TradeContext";
import { sendOtp, verifyOtp } from "@/services/tradeService";

const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-zinc-500 outline-none focus:border-orange-500";

// WhatsApp OTP login on the existing /auth endpoints (same as the B2C login).
export default function LoginModal() {
    const { loginOpen, setLoginOpen, login } = useTrade();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!loginOpen) return null;

    const close = () => {
        setOtp("");
        setOtpToken("");
        setError("");
        setLoginOpen(false);
    };

    const requestOtp = async (e) => {
        e.preventDefault();
        setError("");
        if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit mobile number.");
        setLoading(true);
        try {
            const res = await sendOtp(phone);
            setOtpToken(res.otpVerifyToken);
        } catch (err) {
            setError(err.message || "Could not send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const confirmOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await verifyOtp(otp, otpToken);
            login(res.token, res.user);
            close();
        } catch (err) {
            setError(err.message || "Invalid OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Dealer login">
            <button aria-label="Close login" onClick={close} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="animate-fade-in-up relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0B0F19] p-6 text-white shadow-2xl">
                <button onClick={close} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 hover:bg-white/10">
                    <FiX />
                </button>
                <Image src="/newlogo.webp" alt="Torque Block" width={120} height={50} className="h-auto w-[110px]" />
                <h2 className="mt-4 text-2xl font-black tracking-tight">
                    Dealer <span className="text-orange-500">Login</span>
                </h2>
                <p className="mt-1 text-sm text-zinc-400">Sign in with your registered mobile number.</p>

                {!otpToken ? (
                    <form onSubmit={requestOtp} className="mt-5 space-y-3">
                        <div className="flex gap-2">
                            <span className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-bold text-zinc-300">+91</span>
                            <input autoFocus className={inputClass} placeholder="Mobile number" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
                        </div>
                        {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
                        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-black uppercase tracking-wider hover:bg-orange-600 disabled:opacity-60">
                            <FaWhatsapp className="text-lg" /> {loading ? "Sending…" : "Get OTP on WhatsApp"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={confirmOtp} className="mt-5 space-y-3">
                        <input autoFocus className={`${inputClass} text-center tracking-[0.5em] font-black`} placeholder="••••••" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
                        {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
                        <button disabled={loading || otp.length !== 6} className="w-full rounded-xl bg-orange-500 py-3 text-sm font-black uppercase tracking-wider hover:bg-orange-600 disabled:opacity-60">
                            {loading ? "Verifying…" : "Verify & Continue"}
                        </button>
                        <button type="button" onClick={() => setOtpToken("")} className="w-full text-xs font-semibold text-zinc-400 hover:text-white">
                            Change number
                        </button>
                    </form>
                )}

                <p className="mt-5 border-t border-white/10 pt-4 text-center text-xs text-zinc-400">
                    New dealer?{" "}
                    <Link href="/register" onClick={close} className="font-bold text-orange-500 hover:text-orange-400">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
