"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Button, EmptyState, ErrorState, SkeletonRows } from "@/ui";
import { formatDate, formatINR } from "@/lib/format";
import { fetchLedger } from "@/services/AccountService";
import { useAccountStore, selectCreditApproved, selectIsOwner } from "@/store/accountStore";
import { Notice, PanelHeader, Stat } from "./AccountUi";

const STATUS_NOTICE = {
    pending: "Your credit request is with our team. Pay on Credit unlocks once it is approved.",
    suspended: "Your credit line is suspended. Pay online for now, or contact Torque Block to restore it.",
    revoked: "Credit is no longer available on this account. Please contact Torque Block for details.",
};

const ACTIONS = {
    utilized: ["Order on credit", true],
    repayment_recorded: ["Repayment received", false],
    released: ["Credit released", false],
    granted: ["Credit granted", null],
    limit_updated: ["Limit changed", null],
    terms_updated: ["Terms changed", null],
    suspended: ["Credit suspended", null],
    revoked: ["Credit revoked", null],
    requested: ["Credit requested", null],
};

const PAGE_SIZE = 20;

function LedgerEntry({ entry }) {
    const [label, isDebit] = ACTIONS[entry.action] || [entry.action, null];
    const failed = entry.status === "failed";
    const reference = entry.orderReceipt || entry.referenceNo;

    return (
        <li className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
            <div className="min-w-0 space-y-0.5">
                <p className="font-bold text-white">
                    {label}
                    {failed && <span className="ml-2 rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-black uppercase text-red-400">Failed</span>}
                </p>
                <p className="text-[11px] text-zinc-400">
                    {[formatDate(entry.createdAt), entry.branch && `${entry.branch.branchName} (${entry.branch.branchCode})`, entry.user?.name, reference && `Ref ${reference}`].filter(Boolean).join(" · ")}
                </p>
                {(failed ? entry.failureReason : entry.reason) && <p className="truncate text-[11px] text-zinc-500">{failed ? entry.failureReason : entry.reason}</p>}
            </div>
            <div className="shrink-0 text-right">
                {entry.amount > 0 && (
                    <p className={clsx("text-sm font-black", failed ? "text-zinc-500 line-through" : isDebit ? "text-amber-400" : isDebit === false ? "text-emerald-400" : "text-white")}>
                        {isDebit ? "−" : isDebit === false ? "+" : ""}
                        {formatINR(entry.amount)}
                    </p>
                )}
                {!failed && entry.balance?.availableCredit != null && <p className="text-[10px] text-zinc-500">Available {formatINR(entry.balance.availableCredit)}</p>}
            </div>
        </li>
    );
}

// Credit used by orders and repayments recorded by Torque Block (account owner only).
function Ledger() {
    const [state, setState] = useState({ status: "loading", entries: [], page: 1, totalPages: 1 });

    const fetchPage = useCallback(
        (page) =>
            fetchLedger({ page, limit: PAGE_SIZE })
                .then((res) =>
                    setState((s) => ({
                        status: "ready",
                        entries: page === 1 ? res.ledger || [] : [...s.entries, ...(res.ledger || [])],
                        page,
                        totalPages: res.meta?.totalPages || 1,
                    }))
                )
                .catch(() => setState((s) => ({ ...s, status: "error" }))),
        []
    );

    useEffect(() => {
        fetchPage(1);
    }, [fetchPage]);

    const load = (page) => {
        setState((s) => ({ ...s, status: "loading" }));
        fetchPage(page);
    };

    const { status, entries, page, totalPages } = state;

    return (
        <section className="space-y-3">
            <PanelHeader title="Credit Ledger" description="Every credit order and repayment on your account." />
            {status === "error" && !entries.length ? (
                <ErrorState compact title="Failed to Load Ledger" message="Could not load your credit history." onRetry={() => load(1)} />
            ) : status === "loading" && !entries.length ? (
                <SkeletonRows count={3} />
            ) : !entries.length ? (
                <EmptyState compact title="No Credit Activity Yet" description="Orders placed on credit and repayments will show up here." />
            ) : (
                <>
                    <ul className="custom-scroll max-h-[28rem] space-y-2 overflow-y-auto">
                        {entries.map((entry) => (
                            <LedgerEntry key={entry.id} entry={entry} />
                        ))}
                    </ul>
                    {page < totalPages && (
                        <Button variant="ghost" size="sm" full loading={status === "loading"} loadingText="Loading…" onClick={() => load(page + 1)}>
                            Load more
                        </Button>
                    )}
                </>
            )}
        </section>
    );
}

// Credit line overview: limit / available / outstanding, granted and approved by admin.
export default function CreditPanel() {
    const account = useAccountStore((s) => s.account);
    const approved = useAccountStore(selectCreditApproved);
    const isOwner = useAccountStore(selectIsOwner);

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <PanelHeader title="Business Credit" description="Pay on Credit terms granted and approved by admin." />

                {approved ? (
                    <>
                        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                            <Stat label="Credit status" value="Approved" tone="text-emerald-400" hint={`Terms: Net ${account.creditDays} days`} />
                            <Stat label="Available credit" value={formatINR(account.availableCredit || 0)} tone="text-emerald-400" hint={`Limit: ${formatINR(account.creditLimit || 0)}`} />
                            <Stat label="Outstanding" value={formatINR(account.outstandingAmount || 0)} tone="text-amber-400" hint="Unpaid credit invoices" />
                        </div>

                        {!account.canOrderOnCredit && (
                            <Notice tone="amber">Add a branch to your business account to start ordering on credit.</Notice>
                        )}
                    </>
                ) : (
                    <Notice tone="amber">
                        {STATUS_NOTICE[account?.creditStatus] ||
                            "Pay on Credit is an admin-granted feature. Please contact the Torque Block team to apply for credit terms."}
                    </Notice>
                )}
            </div>

            {isOwner && <Ledger />}
        </div>
    );
}
