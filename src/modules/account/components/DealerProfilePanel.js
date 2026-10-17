"use client";

import { useState } from "react";
import { FiEdit2, FiSave } from "react-icons/fi";
import Button from "@/ui/Button";
import Badge from "@/ui/Badge";
import FormFields from "@/ui/FormFields";
import { FormError } from "@/ui/Field";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useSettings } from "@/modules/site/SettingsProvider";
import { updateDealerProfile } from "../account.api";
import { ADDRESS_FIELDS, businessFields, profileToForm, toProfilePayload, validateFields } from "../account.forms";
import { useAccountStore } from "../account.store";
import { DetailList, Notice, PanelHeader } from "./AccountUi";

const STATUS_BADGE = {
    approved: ["green", "Verified dealer"],
    pending: ["sky", "Under review"],
    rejected: ["red", "Needs changes"],
    suspended: ["red", "Suspended"],
};

const formatAddress = (address) =>
    address ? [address.addressLine1, address.addressLine2, `${address.city}, ${address.state} - ${address.pincode}`].filter(Boolean).join(", ") : "";

function ProfileForm({ profile, onDone }) {
    const { businessTypes = [] } = useSettings();
    const setProfile = useAuthStore((s) => s.setProfile);
    const refreshAccount = useAccountStore((s) => s.refresh);
    const notify = useUiStore((s) => s.notify);
    const [form, setForm] = useState(() => profileToForm(profile));
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const fields = [...businessFields(businessTypes), ...ADDRESS_FIELDS];

    const onChange = (name, value) => {
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
    };

    const submit = async (e) => {
        e.preventDefault();
        const found = validateFields(fields, form);
        setErrors(found);
        if (Object.keys(found).length) return setError("Please fix the highlighted fields.");

        setError("");
        setSaving(true);
        try {
            const saved = await updateDealerProfile(toProfilePayload(form));
            setProfile(saved);
            refreshAccount();
            notify("success", "Business profile updated.");
            onDone();
        } catch (err) {
            setError(err.message || "Could not save your profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <FormFields fields={fields} values={form} errors={errors} onChange={onChange} idPrefix="profile-" />
            <Notice>This address is used for your GST invoices and as the default delivery address at checkout.</Notice>
            <FormError>{error}</FormError>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" size="md" onClick={onDone} disabled={saving}>
                    Cancel
                </Button>
                <Button type="submit" size="md" disabled={saving}>
                    <FiSave /> {saving ? "Saving…" : "Save Profile"}
                </Button>
            </div>
        </form>
    );
}

// Dealer business profile: view, and edit via PUT /trade/me.
export default function DealerProfilePanel() {
    const profile = useAuthStore((s) => s.profile);
    const [editing, setEditing] = useState(false);

    if (!profile?.registered && profile?.dealerStatus === "none") {
        return (
            <Notice tone="orange">
                You have not registered a business yet.{" "}
                <Button href="/register" variant="outline" size="sm" className="ml-2">
                    Register as Dealer
                </Button>
            </Notice>
        );
    }

    const [tone, label] = STATUS_BADGE[profile?.dealerStatus] || STATUS_BADGE.approved;

    return (
        <div className="space-y-4">
            <PanelHeader
                title="Business Profile"
                description="Business identity and billing address used on every invoice."
                action={
                    !editing && (
                        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                            <FiEdit2 /> Edit Profile
                        </Button>
                    )
                }
            />

            {editing ? (
                <ProfileForm profile={profile} onDone={() => setEditing(false)} />
            ) : (
                <>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={tone}>{label}</Badge>
                        {profile.remarks && <span className="text-xs text-zinc-400">Note from our team: {profile.remarks}</span>}
                    </div>
                    <DetailList
                        items={[
                            ["Business", profile.businessName],
                            ["Business type", profile.businessType],
                            ["Contact person", profile.contactName],
                            ["Login mobile", profile.phone],
                            ["Email", profile.email],
                            ["GSTIN", profile.gstin],
                            ["PAN", profile.panNumber],
                            ["Trade licence", profile.b2bLicense],
                            ["Billing address", formatAddress(profile.address), true],
                        ]}
                    />
                </>
            )}
        </div>
    );
}
