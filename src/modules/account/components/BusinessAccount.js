"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { FiBriefcase, FiCreditCard, FiMapPin, FiUsers } from "react-icons/fi";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useAccountStore, selectIsManager } from "../account.store";
import DealerProfilePanel from "./DealerProfilePanel";
import CreditPanel from "./CreditPanel";
import TeamPanel from "./TeamPanel";
import BranchesPanel from "./BranchesPanel";
import { Skeleton } from "./AccountUi";

const TABS = [
    { id: "profile", label: "Profile", Icon: FiBriefcase },
    { id: "credit", label: "Credit", Icon: FiCreditCard, creditApprovedOnly: true },
    { id: "team", label: "Team", Icon: FiUsers, managerOnly: true },
    { id: "branches", label: "Branches", Icon: FiMapPin },
];

/**
 * B2B Trade Business Account: dealer profile (view / edit), credit line, team, branches.
 * The credit ledger is admin-only and is not shown on the dealer portal.
 * Used by the /account page and the "Business Account" modal on My Orders.
 */
export default function BusinessAccount({ initialTab = "profile", onFilterOrders }) {
    const profile = useAuthStore((s) => s.profile);
    const account = useAccountStore((s) => s.account);
    const accountStatus = useAccountStore((s) => s.accountStatus);
    const loadAccount = useAccountStore((s) => s.loadAccount);
    const isManager = useAccountStore(selectIsManager);
    const [tab, setTab] = useState(initialTab);

    useEffect(() => {
        loadAccount();
    }, [loadAccount]);

    const isCreditApproved = account?.creditStatus === "approved" && (account?.creditLimit || 0) > 0;
    const tabs = TABS.filter((t) => {
        if (t.managerOnly && !isManager) return false;
        if (t.creditApprovedOnly && !isCreditApproved) return false;
        return true;
    });
    const active = tabs.some((t) => t.id === tab) ? tab : "profile";
    const businessName = account?.businessName || profile?.businessName || "Business Account";

    return (
        <div className="space-y-5">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                    <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-orange-400">
                        <FiUsers size={12} />Trade Business Account
                    </span>
                    <h2 className="text-xl font-black text-white">{businessName}</h2>
                    <p className="mt-0.5 text-xs text-zinc-400">
                        {[account?.accountCode, account?.myRole && `You: ${account.myRole}`, account?.gstin && `GSTIN ${account.gstin}`].filter(Boolean).join(" · ") ||
                            "Business profile, credit terms, branches and team in one place."}
                    </p>
                </div>
            </header>

            <nav className="custom-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Account sections">
                {tabs.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setTab(id)}
                        aria-current={active === id ? "page" : undefined}
                        className={clsx(
                            "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition",
                            active === id ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                        )}
                    >
                        <Icon /> {label}
                    </button>
                ))}
            </nav>

            {active === "profile" ? (
                <DealerProfilePanel />
            ) : accountStatus === "loading" && !account ? (
                <Skeleton rows={3} />
            ) : active === "credit" ? (
                <CreditPanel />
            ) : active === "team" ? (
                <TeamPanel onFilterOrders={onFilterOrders} />
            ) : (
                <BranchesPanel />
            )}
        </div>
    );
}
