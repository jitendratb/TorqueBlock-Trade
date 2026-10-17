"use client";

import { formatINR } from "@/lib/format";
import { useAccountStore, selectCreditApproved } from "../account.store";
import { Notice, PanelHeader, Stat } from "./AccountUi";

// Credit line overview: limit / available / outstanding. Only shown once approved by Admin.
export default function CreditPanel() {
    const account = useAccountStore((s) => s.account);
    const approved = useAccountStore(selectCreditApproved);
    const status = account?.creditStatus || "none";

    return (
        <div className="space-y-4">
            <PanelHeader title="Business Credit" description="Pay on Credit terms granted and approved by admin." />

            {approved ? (
                <>
                    <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                        <Stat
                            label="Credit status"
                            value="Approved"
                            tone="text-emerald-400"
                            hint={`Terms: Net ${account.creditDays || 30} days`}
                        />
                        <Stat label="Available credit" value={formatINR(account?.availableCredit || 0)} tone="text-emerald-400" hint={`Limit: ${formatINR(account?.creditLimit || 0)}`} />
                        <Stat label="Outstanding" value={formatINR(account?.outstandingAmount || 0)} tone="text-amber-400" hint="Unpaid credit invoices" />
                    </div>

                    {!account.canOrderOnCredit && (
                        <Notice tone="amber">Your login is not allowed to order on credit. Ask your account owner to enable it.</Notice>
                    )}
                </>
            ) : (
                <Notice tone="zinc">
                    Pay on Credit is an admin-granted feature. Without admin permission, credit terms are not available on this profile. Please contact Torque Block administrator for approval.
                </Notice>
            )}
        </div>
    );
}
