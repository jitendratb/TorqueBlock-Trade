"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { Button, Checkbox, FormError, FormFields } from "@/components/ui";
import { OtpStep } from "@/components/auth";
import { ADDRESS_FIELDS, REGISTRATION_FIELDS } from "@/constants/forms";
import { useSettings } from "@/context/SettingsContext";
import useAsyncAction from "@/hooks/useAsyncAction";
import { useCountdown } from "@/hooks/useCountdown";
import useForm from "@/hooks/useForm";
import { whatsappLink } from "@/lib/format";
import { digitsOnly, validate } from "@/lib/validation";
import { registerBusinessAccount, verifyRegistrationOtp } from "@/services/AccountService";
import { useAccountStore } from "@/store/accountStore";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";

const DETAIL_FIELDS = [...REGISTRATION_FIELDS, ...ADDRESS_FIELDS];
const BLANK_ADDRESS = Object.fromEntries(ADDRESS_FIELDS.map((f) => [f.name, ""]));
const SECTION_TITLE =
    "border-t border-white/10 pt-4 text-xs sm:text-[13px] font-bold uppercase tracking-[0.08em] text-[#F59E0B]";

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

    const details = useForm(() => ({
        primaryOwnerName: profile?.name || "",
        primaryOwnerNumber: initialPhone,
    }));
    const shipping = useForm(BLANK_ADDRESS);
    const [separateShipping, setSeparateShipping] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const [registered, setRegistered] = useState(null);
    const { run, busy: loading, error, errorCode, setError } = useAsyncAction();
    const { seconds: cooldown, start: startCooldown } = useCountdown(0);
    const form = details.values;
    const phone = form.primaryOwnerNumber;

    // Sends (or re-sends) the WhatsApp OTP for the details entered so far.
    const register = () => registerBusinessAccount(form, separateShipping ? shipping.values : null);

    const onRegistered = async (res) => {
        setOtpToken("");
        setOtp("");
        useAccountStore.getState().reset();
        notify("success", res.message || "Business account registered.");
        if (token && loginPhone === phone) await loadProfile();
        else setRegistered(res.account || {});
    };

    const submitDetails = (e) => {
        e.preventDefault();
        const detailsValid = details.validate(DETAIL_FIELDS);
        const shippingValid = separateShipping ? shipping.validate(ADDRESS_FIELDS) : true;
        if (!detailsValid || !shippingValid) return setError("Please fix the highlighted fields.");
        run(async () => {
            const res = await register();
            setOtpToken(res.otpVerifyToken);
            startCooldown(30);
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
            const res = await register();
            setOtpToken(res.otpVerifyToken);
            setOtp("");
            startCooldown(30);
            notify("info", res.message || "A new OTP was sent on WhatsApp.");
        });

    const editDetails = () => {
        setOtpToken("");
        setOtp("");
        setError();
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
                        {registered.businessName ? (
                            <strong className="text-white">{registered.businessName}</strong>
                        ) : (
                            "Your business"
                        )}{" "}
                        is registered and awaiting approval by our trade team. Once approved, you can log in with{" "}
                        <span className="font-bold text-[#F59E0B]">+91 {phone}</span>.
                    </p>
                </div>
                <div className="flex flex-col justify-center gap-3 sm:flex-row pt-2">
                    {approvalLink && (
                        <Button
                            href={approvalLink}
                            variant="brand"
                            icon={<FaWhatsapp className="text-lg" />}
                            rightIcon={<span>→</span>}
                        >
                            Speed Up via WhatsApp
                        </Button>
                    )}
                    <Button href="/#stock" variant="outline">
                        Browse Stock
                    </Button>
                    <Button onClick={openLogin} variant="ghost">
                        Trade Login
                    </Button>
                </div>
            </div>
        );
    }

    if (otpToken) {
        return (
            <div className="max-w-lg mx-auto">
                <OtpStep
                    id="register-otp"
                    phone={phone}
                    description={
                        <>
                            Enter the 6-digit OTP sent on WhatsApp to{" "}
                            <span className="font-bold text-white">+91 {phone}</span>. This number becomes your Trade login.
                        </>
                    }
                    otp={otp}
                    onOtpChange={setOtp}
                    onSubmit={confirmOtp}
                    onBack={editDetails}
                    backLabel="Edit details"
                    onResend={resendOtp}
                    cooldown={cooldown}
                    loading={loading}
                    loadingText="Registering…"
                    submitLabel="VERIFY & REGISTER"
                    error={error}
                />
            </div>
        );
    }

    return (
        <form onSubmit={submitDetails} className="space-y-5 w-full">
            <div>
                <h2 className="text-base sm:text-lg font-black tracking-[0.1em] uppercase text-white">
                    BUSINESS DETAILS
                </h2>
            </div>

            <FormFields
                fields={REGISTRATION_FIELDS}
                values={form}
                errors={details.errors}
                onChange={details.onChange}
                idPrefix="register-"
            />

            <h3 className={SECTION_TITLE}>Billing address</h3>
            <FormFields
                fields={ADDRESS_FIELDS}
                values={form}
                errors={details.errors}
                onChange={details.onChange}
                idPrefix="register-billing-"
            />

            <Checkbox
                className="pt-1"
                label="Deliver to a different address"
                checked={separateShipping}
                onChange={(e) => setSeparateShipping(e.target.checked)}
            />

            {separateShipping && (
                <>
                    <h3 className={SECTION_TITLE}>Delivery address</h3>
                    <FormFields
                        fields={ADDRESS_FIELDS}
                        values={shipping.values}
                        errors={shipping.errors}
                        onChange={shipping.onChange}
                        idPrefix="register-shipping-"
                    />
                </>
            )}

            {error && <FormError>{error}</FormError>}

            {errorCode === "ACCOUNT_EXISTS" && (
                <Button variant="outline" full onClick={openLogin}>
                    Log In
                </Button>
            )}

            <Button
                type="submit"
                variant="brand"
                size="lg"
                full
                loading={loading}
                loadingText="Sending OTP…"
                rightIcon={<span className="text-base leading-none">→</span>}
                className="mt-4"
            >
                GET ONE-TIME PASSWORD
            </Button>

            <p className="text-center text-[11px] sm:text-xs text-zinc-400 font-normal">
                Note: Verification code (OTP) will be delivered to your number on WhatsApp.
            </p>

            <p className="border-t border-white/10 pt-3 text-center text-xs text-zinc-400">
                Already registered?{" "}
                <Button variant="link" size="sm" uppercase={false} onClick={openLogin}>
                    Log in
                </Button>
            </p>
        </form>
    );
}
