"use client";

import { Notice, PanelHeader, Stat } from "@/components/ui";
import { formatINR } from "@/lib/format";
import { useAccountStore, selectCreditApproved } from "@/store/accountStore";

const STATUS_NOTICE = {
    pending: "Your credit request is with our team. Pay on Credit unlocks once it is approved.",
    suspended: "Your credit line is suspended. Pay online for now, or contact Torque Block to restore it.",
    revoked: "Credit is no longer available on this account. Please contact Torque Block for details.",
};

export default function CreditPanel() {
    const account = useAccountStore((s) => s.account);
    const approved = useAccountStore(selectCreditApproved);

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <PanelHeader title="Business Credit" description="Pay on Credit terms granted and approved by admin." />

                {approved ? (
                    <>
                        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:grid-cols-3 [&>*:first-child]:col-span-2 sm:[&>*:first-child]:col-span-1">
                            <Stat
                                label="Credit status"
                                value="Approved"
                                tone="text-emerald-400"
                                hint={`Terms: Net ${account.creditDays} days`}
                            />
                            <Stat
                                label="Available credit"
                                value={formatINR(account.availableCredit || 0)}
                                tone="text-emerald-400"
                                hint={`Limit: ${formatINR(account.creditLimit || 0)}`}
                            />
                            <Stat
                                label="Outstanding"
                                value={formatINR(account.outstandingAmount || 0)}
                                tone="text-amber-400"
                                hint="Unpaid credit invoices"
                            />
                        </div>

                        {!account.canOrderOnCredit && (
                            <Notice tone="amber">
                                Add a branch to your business account to start ordering on credit.
                            </Notice>
                        )}
                    </>
                ) : (
                    <Notice tone="amber">
                        {STATUS_NOTICE[account?.creditStatus] ||
                            "Pay on Credit is an admin-granted feature. Please contact the Torque Block team to apply for credit terms."}
                    </Notice>
                )}
            </div>
        </div>
    );
}
