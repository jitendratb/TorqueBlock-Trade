"use client";

import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button, FormError, FormFields } from "@/ui";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/authStore";
import { DETAILS_FIELDS, profileToBilling, validateFields } from "@/forms/AccountForms";

export default function RegistrationForm({ onSaved }) {
    const profile = useAuthStore((s) => s.profile);
    const saveDetails = useAuthStore((s) => s.saveDetails);
    const notify = useUiStore((s) => s.notify);
    // Prefilled from what is already saved, so resubmitting only needs the changed fields.
    const [form, setForm] = useState(() => profileToBilling(profile));
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const onChange = (name, value) => {
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
    };

    const submit = async (e) => {
        e.preventDefault();
        const found = validateFields(DETAILS_FIELDS, form);
        setErrors(found);
        if (Object.keys(found).length) return setError("Please fix the highlighted fields.");

        setError("");
        setSaving(true);
        try {
            const saved = await saveDetails(form);
            notify("success", saved?.isApproved ? "Business details updated." : "Details saved. Our team will verify your GSTIN and activate your trade account.");
            onSaved?.(saved);
        } catch (err) {
            setError(err.message || "Could not save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <FormFields fields={DETAILS_FIELDS} values={form} errors={errors} onChange={onChange} idPrefix="register-" />
            <FormError>{error}</FormError>
            <Button type="submit" full loading={saving} loadingText="Saving Details…" rightIcon={<FiArrowRight />}>
                {profile?.address?.id ? "Save Details" : "Submit Details"}
            </Button>
        </form>
    );
}
