"use client";

import { useState } from "react";
import { FiEdit2, FiSave } from "react-icons/fi";
import { Badge, Button, FormError, FormFields } from "@/ui";
import { whatsappLink } from "@/lib/format";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore, selectHasDetails } from "@/store/authStore";
import { useSettings } from "@/components/site/SettingsProvider";
import { DETAILS_FIELDS, formatAddress, profileToBilling, validateFields } from "@/forms/AccountForms";
import { useAccountStore } from "@/store/accountStore";
import { DetailList, Notice, PanelHeader } from "./AccountUi";

function DetailsForm({ onDone }) {
    const profile = useAuthStore((s) => s.profile);
    const saveDetails = useAuthStore((s) => s.saveDetails);
    const account = useAccountStore((s) => s.account);
    const notify = useUiStore((s) => s.notify);
    const [form, setForm] = useState(() => profileToBilling(profile, account));
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
            await saveDetails(form);
            notify("success", "Your details are updated.");
            onDone();
        } catch (err) {
            setError(err.message || "Could not save your details. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <FormFields fields={DETAILS_FIELDS} values={form} errors={errors} onChange={onChange} idPrefix="profile-" />
            <Notice>This address is used as the default billing and delivery address at checkout.</Notice>
            <FormError>{error}</FormError>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" size="md" onClick={onDone} disabled={saving}>
                    Cancel
                </Button>
                <Button type="submit" size="md" loading={saving} loadingText="Saving…">
                    <FiSave /> Save Details
                </Button>
            </div>
        </form>
    );
}

// Profile tab: the business account (set up by Torque Block, read-only here) and the user's own
// contact details and billing address (editable: PUT /auth/:id and the address book).
export default function TradeProfilePanel() {
    const { contact } = useSettings();
    const profile = useAuthStore((s) => s.profile);
    const hasDetails = useAuthStore(selectHasDetails);
    const account = useAccountStore((s) => s.account);
    const [editing, setEditing] = useState(false);

    if (!hasDetails) {
        return (
            <Notice tone="orange">
                You have not added your business details yet.{" "}
                <Button href="/register" variant="outline" size="sm" className="ml-2">
                    Register for Trade
                </Button>
            </Notice>
        );
    }

    const changeLink = whatsappLink(contact?.whatsapp, `Hi Torque Block! Please update the business details of ${account?.businessName || "my trade account"}.`);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
                {profile.isApproved ? <Badge tone="green">Verified trade account</Badge> : <Badge tone="sky">Awaiting activation</Badge>}
                {!profile.isApproved && <span className="text-xs text-zinc-400">Our team activates trade prices and ordering after verifying your GSTIN.</span>}
            </div>

            {account && (
                <section className="space-y-3">
                    <PanelHeader title="Business Account" description="Set up by Torque Block and printed on every invoice." />
                    <DetailList
                        items={[
                            ["Business", account.businessName],
                            ["Business type", account.businessType],
                            ["GSTIN", account.gstin],
                            ["PAN", account.pan],
                            ["Contact number", account.contactNumber],
                            ["Account owner", account.primaryOwner?.name || account.primaryOwner?.phone],
                            ["Billing address", formatAddress(account.billingAddress), true],
                        ]}
                    />
                    {changeLink && (
                        <p className="text-xs text-zinc-400">
                            Need a change here?{" "}
                            <a href={changeLink} target="_blank" rel="noopener noreferrer" className="font-bold text-orange-400 hover:text-orange-300">
                                Message us on WhatsApp
                            </a>
                        </p>
                    )}
                </section>
            )}

            <section className="space-y-3">
                <PanelHeader
                    title="Your Details"
                    description="Your login and the billing address used at checkout."
                    action={
                        !editing && (
                            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                                <FiEdit2 /> Edit Details
                            </Button>
                        )
                    }
                />
                {editing ? (
                    <DetailsForm onDone={() => setEditing(false)} />
                ) : (
                    <DetailList
                        items={[
                            ["Business", profile.address?.businessName],
                            ["Contact person", profile.address?.contactName || profile.name],
                            ["Login mobile", profile.phone],
                            ["Email", profile.email],
                            ["GSTIN", profile.gstin || profile.address?.gstin],
                            ["Billing address", formatAddress(profile.address), true],
                        ]}
                    />
                )}
            </section>
        </div>
    );
}
