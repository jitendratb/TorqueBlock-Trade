"use client";

import { useEffect, useState } from "react";
import { FiBriefcase, FiCreditCard, FiMapPin, FiUsers } from "react-icons/fi";
import { Card, ErrorState, FilterTabs, SkeletonRows, StatCard } from "@/components/ui";
import useIsTradeVerified from "@/hooks/useIsTradeVerified";
import { formatINR } from "@/lib/format";
import { useAccountStore, selectIsOwner } from "@/store/accountStore";
import { useAuthStore } from "@/store/authStore";
import BranchesPanel from "./BranchesPanel";
import CreditPanel from "./CreditPanel";
import TeamPanel from "./TeamPanel";
import TradeProfilePanel from "./TradeProfilePanel";

const TABS = [
    { id: "profile", label: "PROFILE", Icon: FiBriefcase },
    { id: "credit", label: "CREDIT", Icon: FiCreditCard, needsCredit: true },
    { id: "team", label: "TEAM", Icon: FiUsers, ownerOnly: true },
    { id: "branches", label: "BRANCHES", Icon: FiMapPin, needsAccount: true },
];

export default function BusinessAccount() {
    const profile = useAuthStore((s) => s.profile);
    const account = useAccountStore((s) => s.account);
    const accountStatus = useAccountStore((s) => s.accountStatus);
    const loadAccount = useAccountStore((s) => s.loadAccount);
    const isOwner = useAccountStore(selectIsOwner);
    const verified = useIsTradeVerified();
    const [tab, setTab] = useState("profile");

    useEffect(() => {
        loadAccount();
    }, [loadAccount]);

    const tabs = TABS.filter((t) => {
        if (t.ownerOnly && !isOwner) return false;
        if (t.needsAccount && !account) return false;
        if (t.needsCredit && (!account || account.creditStatus === "none")) return false;
        return true;
    });
    const active = tabs.some((t) => t.id === tab) ? tab : "profile";
    const businessName = account?.businessName || profile?.address?.businessName || "Business Account";
    const hasTab = (id) => tabs.some((t) => t.id === id);

    return (
        <div className="space-y-4 sm:space-y-5">
            {/* Top 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <StatCard
                    label="BUSINESS PROFILE"
                    value={verified ? "VERIFIED" : "PENDING"}
                    Icon={FiBriefcase}
                    tone="orange"
                    active={active === "profile"}
                    onClick={() => setTab("profile")}
                />
                <StatCard
                    label="CREDIT LINE"
                    value={account?.creditLimit ? formatINR(account.creditLimit) : "PAY ONLINE"}
                    Icon={FiCreditCard}
                    tone="sky"
                    active={active === "credit"}
                    onClick={() => hasTab("credit") && setTab("credit")}
                />
                <StatCard
                    label="BRANCHES"
                    value={account?.branches?.length || 1}
                    Icon={FiMapPin}
                    tone="emerald"
                    active={active === "branches"}
                    onClick={() => hasTab("branches") && setTab("branches")}
                />
                <StatCard
                    label="TEAM MEMBERS"
                    value={account?.team?.length || 1}
                    Icon={FiUsers}
                    tone="rose"
                    active={active === "team"}
                    onClick={() => hasTab("team") && setTab("team")}
                />
            </div>

            {/* Navigation / Tabs Strip */}
            <FilterTabs
                tabs={tabs}
                activeTab={active}
                onChange={setTab}
                rightClassName="hidden md:block"
                right={
                    <div className="flex items-center gap-2 px-2 text-xs text-zinc-400">
                        <span className="truncate font-mono text-[11px] text-zinc-400">
                            {account?.gstin ? `GSTIN: ${account.gstin}` : businessName}
                        </span>
                    </div>
                }
            />

            {/* Active Panel Content Card */}
            <Card variant="frosted" className="space-y-4 p-4 sm:p-6">
                {active === "profile" ? (
                    <TradeProfilePanel />
                ) : accountStatus === "loading" && !account ? (
                    <SkeletonRows count={3} />
                ) : accountStatus === "error" && !account ? (
                    <ErrorState
                        compact
                        title="Failed to Load Account Details"
                        message="Could not load your business account information."
                        onRetry={() => loadAccount({ force: true })}
                    />
                ) : active === "credit" ? (
                    <CreditPanel />
                ) : active === "team" ? (
                    <TeamPanel />
                ) : (
                    <BranchesPanel />
                )}
            </Card>
        </div>
    );
}
