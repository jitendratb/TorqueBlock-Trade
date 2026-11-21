"use client";

import { Button, Field, FormError, Input } from "@/components/ui";
import { digitsOnly } from "@/lib/validation";

/**
 * Reusable 6-digit WhatsApp OTP verification step shared by Login (OtpForm) and RegistrationForm.
 */
export default function OtpStep({
    id = "auth-otp",
    phone,
    description,
    otp,
    onOtpChange,
    onSubmit,
    onBack,
    backLabel = "Change number",
    onResend,
    cooldown = 0,
    loading = false,
    loadingText = "Verifying…",
    submitLabel = "VERIFY & CONTINUE",
    error = "",
}) {
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base sm:text-lg font-black tracking-[0.1em] uppercase text-white">AUTHENTICATION</h2>
                <p className="mt-1 text-xs sm:text-[13px] text-zinc-400">
                    {description || (
                        <>
                            Enter the 6-digit OTP sent to{" "}
                            <span className="font-bold text-white">+91 {phone}</span> on WhatsApp
                        </>
                    )}
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <Field label="One-Time Password" htmlFor={id}>
                    <Input
                        id={id}
                        autoFocus
                        type="tel"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => onOtpChange(digitsOnly(e.target.value))}
                        className="py-3 sm:py-3.5 text-center text-lg tracking-[0.5em] font-bold placeholder:text-zinc-600"
                    />
                </Field>

                {error && <FormError>{error}</FormError>}

                <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    full
                    loading={loading}
                    loadingText={loadingText}
                    disabled={otp.length !== 6}
                    rightIcon={<span className="text-base leading-none">→</span>}
                >
                    {submitLabel}
                </Button>

                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <Button variant="text" size="sm" uppercase={false} disabled={loading} onClick={onBack}>
                        {backLabel}
                    </Button>
                    <Button variant="text" size="sm" uppercase={false} disabled={loading || cooldown > 0} onClick={onResend}>
                        {cooldown > 0 ? `Resend OTP (${cooldown}s)` : "Resend OTP"}
                    </Button>
                </div>

                <p className="text-center text-[11px] sm:text-xs text-zinc-400 font-normal leading-relaxed">
                    Note: Verification code (OTP) will be delivered to your number on WhatsApp.
                </p>
            </form>
        </div>
    );
}

