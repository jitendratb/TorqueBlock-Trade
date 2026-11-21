"use client";

import { useState } from "react";
import { FiEdit2, FiSave } from "react-icons/fi";
import { Badge, Button, DetailList, FormActions, FormError, FormFields, Notice, PanelHeader } from "@/components/ui";
import { DETAILS_FIELDS } from "@/constants/forms";
import { useSettings } from "@/context/SettingsContext";
import useAsyncAction from "@/hooks/useAsyncAction";
import useForm from "@/hooks/useForm";
import { whatsappLink } from "@/lib/format";
import { formatAddress, profileToBilling } from "@/lib/formHelpers";
import { useAccountStore } from "@/store/accountStore";
import { useAuthStore, selectHasDetails } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";

function DetailsForm({ onDone }) {
    const profile = useAuthStore((s) => s.profile);
    const saveDetails = useAuthStore((s) => s.saveDetails);
    const account = useAccountStore((s) => s.account);
    const notify = useUiStore((s) => s.notify);
    const { values, errors, onChange, validate } = useForm(() => profileToBilling(profile, account));
    const { run, busy, error, setError } = useAsyncAction();

    const submit = (e) => {
        e.preventDefault();
        if (!validate(DETAILS_FIELDS)) return setError("Please fix the highlighted fields.");

        run(() => saveDetails(values), {
            fallback: "Could not save your details. Please try again.",
            onSuccess: () => {
                notify("success", "Your details are updated.");
                onDone();
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <FormFields fields={DETAILS_FIELDS} values={values} errors={errors} onChange={onChange} idPrefix="profile-" />
            <Notice>This address is used as the default billing and delivery address at checkout.</Notice>
            <FormError>{error}</FormError>
            <FormActions onCancel={onDone} busy={busy} submitLabel="Save Details" icon={<FiSave />} />
        </form>
    );
}

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

    const changeLink = whatsappLink(
        contact?.whatsapp,
        `Hi Torque Block! Please update the business details of ${account?.businessName || "my trade account"}.`
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
                {profile.isApproved ? (
                    <Badge tone="green">Verified trade account</Badge>
                ) : (
                    <Badge tone="sky">Awaiting activation</Badge>
                )}
                {!profile.isApproved && (
                    <span className="text-xs text-zinc-400">
                        Our team activates trade prices and ordering after verifying your GSTIN.
                    </span>
                )}
            </div>

            {account && (
                <section className="space-y-3">
                    <PanelHeader
                        title="Business Account"
                        description="Set up by Torque Block and printed on every invoice."
                    />
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
                            <a
                                href={changeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-orange-400 hover:text-orange-300"
                            >
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
