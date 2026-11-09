"use client";

import { useEffect, useState } from "react";
import { FiBriefcase, FiCreditCard, FiMapPin, FiUsers } from "react-icons/fi";
import { formatINR } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { useAccountStore, selectIsOwner } from "@/store/accountStore";
import TradeProfilePanel from "./TradeProfilePanel";
import CreditPanel from "./CreditPanel";
import TeamPanel from "./TeamPanel";
import BranchesPanel from "./BranchesPanel";
import { SkeletonRows, ErrorState } from "@/ui";

const TABS = [
    { id: "profile", label: "Profile", Icon: FiBriefcase },
    { id: "credit", label: "Credit", Icon: FiCreditCard, needsCredit: true },
    { id: "team", label: "Team", Icon: FiUsers, ownerOnly: true },
    { id: "branches", label: "Branches", Icon: FiMapPin, needsAccount: true },
];

export default function BusinessAccount() {
    const profile = useAuthStore((s) => s.profile);
    const account = useAccountStore((s) => s.account);
    const accountStatus = useAccountStore((s) => s.accountStatus);
    const loadAccount = useAccountStore((s) => s.loadAccount);
    const isOwner = useAccountStore(selectIsOwner);
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

    return (
        <div className="space-y-4 sm:space-y-5">
            {/* Top 4 Stat Cards - Light Frosted Blur */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. BUSINESS PROFILE */}
                <div
                    onClick={() => setTab("profile")}
                    className={`cursor-pointer relative overflow-hidden rounded-2xl border transition-all p-4 sm:p-5 flex items-center justify-between select-none backdrop-blur-xl shadow-lg ${
                        active === "profile"
                            ? "bg-gradient-to-br from-orange-500/15 via-white/[0.04] to-transparent border-orange-500/40 shadow-orange-500/10 ring-1 ring-orange-500/30"
                            : "bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border-white/10 hover:border-white/25 hover:bg-white/[0.05]"
                    }`}
                >
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">BUSINESS PROFILE</p>
                        <p className="mt-1 text-xl sm:text-2xl font-black text-white leading-none">
                            {profile?.isApproved ? "VERIFIED" : "PENDING"}
                        </p>
                    </div>
                    <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 shrink-0 shadow-sm">
                        <FiBriefcase className="text-lg sm:text-xl" />
                    </div>
                </div>

                {/* 2. CREDIT LINE */}
                <div
                    onClick={() => {
                        if (tabs.some((t) => t.id === "credit")) setTab("credit");
                    }}
                    className={`cursor-pointer relative overflow-hidden rounded-2xl border transition-all p-4 sm:p-5 flex items-center justify-between select-none backdrop-blur-xl shadow-lg ${
                        active === "credit"
                            ? "bg-gradient-to-br from-sky-500/15 via-white/[0.04] to-transparent border-sky-500/40 shadow-sky-500/10 ring-1 ring-sky-500/30"
                            : "bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border-white/10 hover:border-white/25 hover:bg-white/[0.05]"
                    }`}
                >
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">CREDIT LINE</p>
                        <p className="mt-1 text-xl sm:text-2xl font-black text-white leading-none">
                            {account?.creditLimit ? formatINR(account.creditLimit) : "PAY ONLINE"}
                        </p>
                    </div>
                    <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shrink-0 shadow-sm">
                        <FiCreditCard className="text-lg sm:text-xl" />
                    </div>
                </div>

                {/* 3. BRANCHES */}
                <div
                    onClick={() => {
                        if (tabs.some((t) => t.id === "branches")) setTab("branches");
                    }}
                    className={`cursor-pointer relative overflow-hidden rounded-2xl border transition-all p-4 sm:p-5 flex items-center justify-between select-none backdrop-blur-xl shadow-lg ${
                        active === "branches"
                            ? "bg-gradient-to-br from-emerald-500/15 via-white/[0.04] to-transparent border-emerald-500/40 shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                            : "bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border-white/10 hover:border-white/25 hover:bg-white/[0.05]"
                    }`}
                >
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">BRANCHES</p>
                        <p className="mt-1 text-xl sm:text-2xl font-black text-white leading-none">
                            {account?.branches?.length || 1}
                        </p>
                    </div>
                    <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0 shadow-sm">
                        <FiMapPin className="text-lg sm:text-xl" />
                    </div>
                </div>

                {/* 4. TEAM MEMBERS */}
                <div
                    onClick={() => {
                        if (tabs.some((t) => t.id === "team")) setTab("team");
                    }}
                    className={`cursor-pointer relative overflow-hidden rounded-2xl border transition-all p-4 sm:p-5 flex items-center justify-between select-none backdrop-blur-xl shadow-lg ${
                        active === "team"
                            ? "bg-gradient-to-br from-rose-500/15 via-white/[0.04] to-transparent border-rose-500/40 shadow-rose-500/10 ring-1 ring-rose-500/30"
                            : "bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border-white/10 hover:border-white/25 hover:bg-white/[0.05]"
                    }`}
                >
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">TEAM MEMBERS</p>
                        <p className="mt-1 text-xl sm:text-2xl font-black text-white leading-none">
                            {account?.team?.length || 1}
                        </p>
                    </div>
                    <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0 shadow-sm">
                        <FiUsers className="text-lg sm:text-xl" />
                    </div>
                </div>
            </div>

            {/* Navigation / Tabs Strip - Light Frosted Blur */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-2 sm:p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-xl shadow-lg">
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                    {tabs.map(({ id, label, Icon }) => {
                        const isActive = active === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setTab(id)}
                                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider transition ${
                                    isActive
                                        ? "bg-white/[0.12] text-white border border-white/20 shadow-sm backdrop-blur-sm"
                                        : "text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent"
                                }`}
                            >
                                <Icon className="text-xs shrink-0" />
                                <span>{label.toUpperCase()}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2 px-2 text-xs text-zinc-400">
                    <span className="font-mono text-[11px] text-zinc-400">
                        {account?.gstin ? `GSTIN: ${account.gstin}` : businessName}
                    </span>
                </div>
            </div>

            {/* Active Panel Content Card - Light Frosted Glass */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-4 sm:p-5 md:p-6 space-y-4 shadow-xl backdrop-blur-xl">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
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
            </div>
        </div>
    );
}
