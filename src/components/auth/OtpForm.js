"use client";

import { useState } from "react";
import { Button, Field, FormError, Input } from "@/components/ui";
import useAsyncAction from "@/hooks/useAsyncAction";
import { useCountdown } from "@/hooks/useCountdown";
import { digitsOnly, validate } from "@/lib/validation";
import { sendOtp, verifyOtp } from "@/services/AuthService";
import { useAuthStore } from "@/store/authStore";
import OtpStep from "./OtpStep";

export default function OtpForm({ onSuccess, onRegister }) {
    const startSession = useAuthStore((s) => s.startSession);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const { run, busy: loading, error, errorCode, setError } = useAsyncAction();
    const { seconds: cooldown, start: startCooldown } = useCountdown(0);

    const sendCode = () =>
        run(async () => {
            const res = await sendOtp(phone);
            setOtpToken(res.otpVerifyToken);
            startCooldown(30);
        });

    const requestOtp = (e) => {
        e.preventDefault();
        const message = validate({ phone });
        if (message) return setError(message);
        sendCode();
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
            <div>
                <div className="mb-5">
                    <h2 className="text-base sm:text-lg font-black tracking-[0.1em] uppercase text-white">AUTHENTICATION</h2>
                    <p className="mt-1 text-xs sm:text-[13px] text-zinc-400">
                        Enter your mobile number to receive an OTP on WhatsApp
                    </p>
                </div>

                <form onSubmit={requestOtp}>
                    <Field label="Mobile Number" htmlFor="auth-mobile">
                        <Input
                            id="auth-mobile"
                            autoFocus
                            prefix="+91"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="Enter 10 digit number"
                            value={phone}
                            onChange={(e) => {
                                setPhone(digitsOnly(e.target.value));
                                if (error) setError();
                            }}
                        />
                    </Field>

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
                                variant="brand"
                                full
                                className="mt-2"
                            >
                                Register Your Business →
                            </Button>
                        </div>
                    ) : (
                        <>
                            {error && <FormError className="mt-2">{error}</FormError>}

                            <Button
                                type="submit"
                                variant="brand"
                                size="lg"
                                full
                                loading={loading}
                                loadingText="Sending OTP…"
                                disabled={phone.length !== 10}
                                rightIcon={<span className="text-base leading-none">→</span>}
                                className="mt-5"
                            >
                                GET ONE-TIME PASSWORD
                            </Button>
                        </>
                    )}

                    <p className="mt-3.5 text-center text-[11px] sm:text-xs text-zinc-400 font-normal leading-relaxed">
                        Note: Verification code (OTP) will be delivered to your number on WhatsApp.
                    </p>
                </form>
            </div>
        );
    }

    return (
        <OtpStep
            id="auth-otp"
            phone={phone}
            otp={otp}
            onOtpChange={(val) => {
                setOtp(val);
                if (error) setError();
            }}
            onSubmit={confirmOtp}
            onBack={() => {
                setOtpToken("");
                setOtp("");
                setError();
            }}
            onResend={sendCode}
            cooldown={cooldown}
            loading={loading}
            loadingText="Verifying…"
            submitLabel="VERIFY & CONTINUE"
            error={error}
        />
    );
}
