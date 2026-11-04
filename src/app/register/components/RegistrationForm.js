"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { Button, FormError, FormFields, Input } from "@/ui";
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
const SECTION_TITLE = "border-t border-white/10 pt-4 text-sm font-black text-white";

// Trade self-registration: business details -> WhatsApp OTP for the owner's mobile -> business account.
export default function RegistrationForm() {
    const token = useAuthStore((s) => s.token);
    const profile = useAuthStore((s) => s.profile);
    const loadProfile = useAuthStore((s) => s.loadProfile);
    const notify = useUiStore((s) => s.notify);
    const openLogin = useUiStore((s) => s.openLogin);
    const { contact } = useSettings();
    const loginPhone = digitsOnly(profile?.phone).slice(-10);
    // A logged-in user without a business account starts from their own login.
    const [form, setForm] = useState(() => ({ primaryOwnerName: profile?.name || "", primaryOwnerNumber: loginPhone }));
    const [errors, setErrors] = useState({});
    const [separateShipping, setSeparateShipping] = useState(false);
    const [shipping, setShipping] = useState(BLANK_ADDRESS);
    const [shippingErrors, setShippingErrors] = useState({});
    const [otp, setOtp] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const [registered, setRegistered] = useState(null);
    const [error, setError] = useState("");
    // ACCOUNT_EXISTS: the number already has an approved business, so it should log in instead.
    const [errorCode, setErrorCode] = useState("");
    const [loading, setLoading] = useState(false);
    const phone = form.primaryOwnerNumber;

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
        // Registering does not sign in. Already signed in with this number: the reloaded profile shows the account status.
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
            setOtpToken((await registerBusinessAccount(form, separateShipping ? shipping : null)).otpVerifyToken);
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
            notify("info", res.message || "A new OTP was sent on WhatsApp.");
        });

    const editDetails = () => {
        setOtpToken("");
        setOtp("");
        setError("");
    };

    if (registered) {
        const approvalLink = whatsappLink(contact?.whatsapp, `Hi Torque Block! I registered ${registered.businessName || "my business"} on the Trade Portal (mobile ${phone}). Please approve my business profile.`);
        return (
            <div className="space-y-5 text-center">
                <FiCheckCircle className="mx-auto text-6xl text-green-500" />
                <div>
                    <h2 className="text-2xl font-black text-white">Business Registered</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                        {registered.businessName ? `${registered.businessName} is` : "Your business is"} registered and awaiting approval by our team. Once it is approved you can log in with{" "}
                        <span className="font-bold text-white">+91 {phone}</span>.
                    </p>
                </div>
       </div>
        );
    }

    if (otpToken) {
        return (
            <form onSubmit={confirmOtp} className="space-y-3">
                <h2 className="text-xl font-black text-white">Verify owner mobile</h2>
                <p className="text-sm text-zinc-400">
                    Enter the OTP sent on WhatsApp to <span className="font-bold text-white">+91 {phone}</span>. This number becomes your Trade login.
                </p>
                <Input autoFocus aria-label="OTP" className="text-center tracking-[0.5em] font-black" placeholder="••••••" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(digitsOnly(e.target.value))} />
                <FormError>{error}</FormError>
                <Button type="submit" full loading={loading} loadingText="Registering…" disabled={otp.length !== 6}> Verify & Register </Button>
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                    <button type="button" disabled={loading} onClick={editDetails} className="hover:text-white disabled:opacity-50">Edit details</button>
                    <button type="button" disabled={loading} onClick={resendOtp} className="hover:text-white disabled:opacity-50">Resend OTP</button>
                </div>
            </form>
        );
    }

    return (
        <form onSubmit={submitDetails} className="space-y-4">
            <div>
                <h2 className="mb-1 text-xl font-black text-white">Business details</h2>
                <p className="text-sm text-zinc-400">Used for your GST invoice and delivery. We&apos;ll verify the owner&apos;s mobile with an OTP on WhatsApp.</p>
            </div>
            <FormFields fields={REGISTRATION_FIELDS} values={form} errors={errors} onChange={onChange} idPrefix="register-" />

            <h3 className={SECTION_TITLE}>Billing address</h3>
            <FormFields fields={ADDRESS_FIELDS} values={form} errors={errors} onChange={onChange} idPrefix="register-billing-" />
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-zinc-300">
                <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={separateShipping} onChange={(e) => setSeparateShipping(e.target.checked)} />
                Deliver to a different address
            </label>
            {separateShipping && (
                <>
                    <h3 className={SECTION_TITLE}>Delivery address</h3>
                    <FormFields fields={ADDRESS_FIELDS} values={shipping} errors={shippingErrors} onChange={onShippingChange} idPrefix="register-shipping-" />
                </>
            )}

            <FormError>{error}</FormError>
            {errorCode === "ACCOUNT_EXISTS" && (
                <Button variant="outline" full onClick={openLogin}>
                    Log In
                </Button>
            )}
            <Button type="submit" full loading={loading} loadingText="Sending OTP…" icon={<FaWhatsapp className="text-lg" />}>
                Get OTP on WhatsApp
            </Button>
            <p className="text-center text-xs text-zinc-400">
                Already registered?{" "}
                <button type="button" onClick={openLogin} className="font-bold text-orange-500 hover:text-orange-400">
                    Log in
                </button>
            </p>
        </form>
    );
}
