"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { Button, FormError, FormFields } from "@/ui";
import { digitsOnly, validate } from "@/lib/validation";
import { whatsappLink } from "@/lib/format";
import { useSettings } from "@/components/site/SettingsProvider";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/authStore";
import { useAccountStore } from "@/store/accountStore";
import { registerBusinessAccount, verifyRegistrationOtp } from "@/services/AccountService";
import { ADDRESS_FIELDS, REGISTRATION_FIELDS, validateFields } from "@/forms/AccountForms";

const DETAIL_FIELDS = [...REGISTRATION_FIELDS, ...ADDRESS_FIELDS];
const BLANK_ADDRESS = Object.fromEntries(ADDRESS_FIELDS.map((f) => [f.name, ""]));
const SECTION_TITLE = "border-t border-white/10 pt-4 text-xs sm:text-[13px] font-bold uppercase tracking-[0.08em] text-[#F59E0B]";

// Trade self-registration: business details -> WhatsApp OTP for the owner's mobile -> business account.
export default function RegistrationForm() {
    const searchParams = useSearchParams();
    const token = useAuthStore((s) => s.token);
    const profile = useAuthStore((s) => s.profile);
    const loadProfile = useAuthStore((s) => s.loadProfile);
    const notify = useUiStore((s) => s.notify);
    const openLogin = useUiStore((s) => s.openLogin);
    const { contact } = useSettings();

    const queryPhone = digitsOnly(searchParams?.get("phone") || "").slice(-10);
    const loginPhone = digitsOnly(profile?.phone).slice(-10);
    const initialPhone = queryPhone || loginPhone;

    const [form, setForm] = useState(() => ({
        primaryOwnerName: profile?.name || "",
        primaryOwnerNumber: initialPhone,
    }));
    const [errors, setErrors] = useState({});
    const [separateShipping, setSeparateShipping] = useState(false);
    const [shipping, setShipping] = useState(BLANK_ADDRESS);
    const [shippingErrors, setShippingErrors] = useState({});
    const [otp, setOtp] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const [registered, setRegistered] = useState(null);
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const phone = form.primaryOwnerNumber;

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

    const onRegistered = async (res) => {
        setOtpToken("");
        setOtp("");
        useAccountStore.getState().reset();
        notify("success", res.message || "Business account registered.");
        if (token && loginPhone === phone) await loadProfile();
        else setRegistered(res.account || {});
    };

    const onChange = (name, value) => {
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
    };

    const onShippingChange = (name, value) => {
        setShipping((s) => ({ ...s, [name]: value }));
        if (shippingErrors[name]) setShippingErrors((e) => ({ ...e, [name]: "" }));
    };

    const submitDetails = (e) => {
        e.preventDefault();
        const found = validateFields(DETAIL_FIELDS, form);
        const foundShipping = separateShipping ? validateFields(ADDRESS_FIELDS, shipping) : {};
        setErrors(found);
        setShippingErrors(foundShipping);
        if (Object.keys(found).length || Object.keys(foundShipping).length) return setError("Please fix the highlighted fields.");
        run(async () => {
            const res = await registerBusinessAccount(form, separateShipping ? shipping : null);
            setOtpToken(res.otpVerifyToken);
            setCooldown(30);
        });
    };

    const confirmOtp = (e) => {
        e.preventDefault();
        const message = validate({ otp });
        if (message) return setError(message);
        run(async () => onRegistered(await verifyRegistrationOtp(otp, otpToken)));
    };

    const resendOtp = () =>
        run(async () => {
            const res = await registerBusinessAccount(form, separateShipping ? shipping : null);
            setOtpToken(res.otpVerifyToken);
            setOtp("");
            setCooldown(30);
            notify("info", res.message || "A new OTP was sent on WhatsApp.");
        });

    const editDetails = () => {
        setOtpToken("");
        setOtp("");
        setError("");
    };

    if (registered) {
        const approvalLink = whatsappLink(
            contact?.whatsapp,
            `Hi Torque Block! I registered ${registered.businessName || "my business"} on the Trade Portal (mobile ${phone}). Please approve my business profile.`
        );
        return (
            <div className="space-y-6 text-center py-4">
                <FiCheckCircle className="mx-auto text-6xl text-emerald-400" />
                <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white">
                        BUSINESS REGISTERED SUCCESSFULLY
                    </h2>
                    <p className="mx-auto max-w-md text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        {registered.businessName ? <strong className="text-white">{registered.businessName}</strong> : "Your business"} is registered and awaiting approval by our trade team. Once approved, you can log in with{" "}
                        <span className="font-bold text-[#F59E0B]">+91 {phone}</span>.
                    </p>
                </div>
                <div className="flex flex-col justify-center gap-3 sm:flex-row pt-2">
                    {approvalLink && (
                        <button
                            type="button"
                            onClick={() => window.open(approvalLink, "_blank")}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A35229] hover:bg-[#8F4420] py-3.5 px-5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-all shadow-lg shadow-[#A35229]/25"
                        >
                            <FaWhatsapp className="text-lg" />
                            <span>Speed Up via WhatsApp</span>
                            <span>→</span>
                        </button>
                    )}
                    <Button href="/#stock" variant="outline" className="justify-center">
                        Browse Stock
                    </Button>
                    <Button onClick={openLogin} variant="ghost" className="justify-center">
                        Trade Login
                    </Button>
                </div>
            </div>
        );
    }

    if (otpToken) {
        return (
            <div className="space-y-5 max-w-lg mx-auto">
                <div>
                    <h2 className="text-base sm:text-lg font-black tracking-[0.1em] uppercase text-white">
                        AUTHENTICATION
                    </h2>
                    <p className="mt-1 text-xs sm:text-[13px] text-zinc-400">
                        Enter the 6-digit OTP sent on WhatsApp to <span className="font-bold text-white">+91 {phone}</span>. This number becomes your Trade login.
                    </p>
                </div>

                <form onSubmit={confirmOtp} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="register-otp" className="block text-xs sm:text-[13px] font-bold text-zinc-200">
                            One-Time Password
                        </label>
                        <div className="flex items-center rounded-xl bg-[#2D323B] border border-white/10 px-4 py-3 sm:py-3.5 focus-within:border-white/30 transition-all">
                            <input
                                id="register-otp"
                                autoFocus
                                type="tel"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="••••••"
                                value={otp}
                                onChange={(e) => setOtp(digitsOnly(e.target.value))}
                                className="w-full bg-transparent text-center text-lg tracking-[0.5em] font-bold text-white placeholder:text-zinc-600 outline-none"
                            />
                        </div>
                    </div>

                    {error && <FormError>{error}</FormError>}

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#A35229] hover:bg-[#8F4420] active:scale-[0.99] py-3.5 px-4 text-xs sm:text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-all disabled:opacity-50 shadow-lg shadow-[#A35229]/25"
                    >
                        {loading ? (
                            <span>Registering…</span>
                        ) : (
                            <>
                                <span>VERIFY &amp; REGISTER</span>
                                <span className="text-base leading-none">→</span>
                            </>
                        )}
                    </button>

                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                        <button type="button" disabled={loading} onClick={editDetails} className="hover:text-white disabled:opacity-50 transition-colors">
                            Edit details
                        </button>
                        <button
                            type="button"
                            disabled={loading || cooldown > 0}
                            onClick={resendOtp}
                            className="hover:text-white disabled:opacity-50 transition-colors"
                        >
                            {cooldown > 0 ? `Resend OTP (${cooldown}s)` : "Resend OTP"}
                        </button>
                    </div>

                    <p className="text-center text-[11px] sm:text-xs text-zinc-400 font-normal">
                        Note: Verification code (OTP) will be delivered to your number on WhatsApp.
                    </p>
                </form>
            </div>
        );
    }

    return (
        <form onSubmit={submitDetails} className="space-y-5 w-full">
            <div>
                <h2 className="text-base sm:text-lg font-black tracking-[0.1em] uppercase text-white"> BUSINESS DETAILS </h2>
            </div>

            <FormFields fields={REGISTRATION_FIELDS} values={form} errors={errors} onChange={onChange} idPrefix="register-" />

            <h3 className={SECTION_TITLE}>Billing address</h3>
            <FormFields fields={ADDRESS_FIELDS} values={form} errors={errors} onChange={onChange} idPrefix="register-billing-" />

            <label className="flex cursor-pointer items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-300 pt-1">
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-[#A35229]"
                    checked={separateShipping}
                    onChange={(e) => setSeparateShipping(e.target.checked)}
                />
                Deliver to a different address
            </label>

            {separateShipping && (
                <>
                    <h3 className={SECTION_TITLE}>Delivery address</h3>
                    <FormFields fields={ADDRESS_FIELDS} values={shipping} errors={shippingErrors} onChange={onShippingChange} idPrefix="register-shipping-" />
                </>
            )}

            {error && <FormError>{error}</FormError>}

            {errorCode === "ACCOUNT_EXISTS" && (
                <Button variant="outline" full onClick={openLogin}>
                    Log In
                </Button>
            )}

            <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#A35229] hover:bg-[#8F4420] active:scale-[0.99] py-3.5 px-4 text-xs sm:text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-all shadow-lg shadow-[#A35229]/25 disabled:opacity-50"
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

            <p className="text-center text-[11px] sm:text-xs text-zinc-400 font-normal">
                Note: Verification code (OTP) will be delivered to your number on WhatsApp.
            </p>

            <p className="border-t border-white/10 pt-3 text-center text-xs text-zinc-400">
                Already registered?{" "}
                <button type="button" onClick={openLogin} className="font-bold text-[#F59E0B] hover:text-amber-300 transition-colors">
                    Log in
                </button>
            </p>
        </form>
    );
}
