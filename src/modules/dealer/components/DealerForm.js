"use client";

import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import Button from "@/ui/Button";
import { Field, FormError, Input, Select } from "@/ui/Field";
import { digitsOnly, validate } from "@/lib/validation";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useSettings } from "@/modules/site/SettingsProvider";
import { registerDealer } from "../dealer.api";
import { profileToForm } from "@/modules/account/account.forms";

const BLANK_FORM = {
    businessName: "",
    contactName: "",
    businessType: "",
    gstin: "",
    email: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
};

const FIELDS = [
    { name: "businessName", label: "Business / Firm name", placeholder: "Enter Your Business name", span: true, required: true },
    { name: "contactName", label: "Contact person", placeholder: "Enter Contact Person Name", required: true },
    { name: "gstin", label: "GSTIN", placeholder: "Enter Your GST Number", maxLength: 15, required: true },
    { name: "addressLine1", label: "Shop / warehouse address", placeholder: "Enter Your Address", span: true, required: true },
    { name: "city", label: "City", placeholder: "Enter Your City", required: true },
    { name: "state", label: "State", placeholder: "Enter Your State", required: true },
    { name: "pincode", label: "Pincode", placeholder: "Enter Your Pincode", inputMode: "numeric", maxLength: 6, digits: true, required: true },
    { name: "email", label: "Email (optional)", placeholder: "Enter Your Email", type: "email" },
];

export default function DealerForm({ onSaved }) {
    const { businessTypes = [] } = useSettings();
    const profile = useAuthStore((s) => s.profile);
    const setProfile = useAuthStore((s) => s.setProfile);
    const notify = useUiStore((s) => s.notify);
    // Prefilled from the saved profile, so resubmitting only needs the changed fields.
    const [form, setForm] = useState(() => {
        const saved = profileToForm(profile);
        return Object.fromEntries(Object.keys(BLANK_FORM).map((key) => [key, saved[key] || ""]));
    });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const set = (name, digits) => (e) => setForm((f) => ({ ...f, [name]: digits ? digitsOnly(e.target.value) : e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        const message = validate({ gstin: form.gstin, pincode: form.pincode, email: form.email });
        if (message) return setError(message);

        setError("");
        setSaving(true);
        try {
            const saved = await registerDealer({ ...form, gstin: form.gstin.toUpperCase() });
            setProfile(saved);
            notify("success", saved.isDealer ? "Business details updated." : "Application submitted. We'll verify your GSTIN shortly.");
            onSaved?.(saved);
        } catch (err) {
            setError(err.message || "Could not save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Business type" htmlFor="businessType" className="sm:col-span-2">
                    <Select id="businessType" required placeholder="Select your business type" options={businessTypes} value={form.businessType} onChange={set("businessType")} />
                </Field>
                {FIELDS.map(({ name, label, span, digits, ...input }) => (
                    <Field key={name} label={label} htmlFor={name} className={span ? "sm:col-span-2" : ""}>
                        <Input id={name} value={form[name]} onChange={set(name, digits)} {...input} />
                    </Field>
                ))}
            </div>
            <FormError>{error}</FormError>
            <Button type="submit" full disabled={saving}>
                {saving ? "Saving…" : profile?.dealerStatus === "none" ? "Submit Application" : "Save Details"} <FiArrowRight />
            </Button>
        </form>
    );
}
