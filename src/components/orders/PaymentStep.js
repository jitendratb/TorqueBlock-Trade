"use client";

import clsx from "clsx";
import { FiCheck, FiCheckCircle, FiCreditCard, FiMapPin, FiShield } from "react-icons/fi";
import { SiRazorpay } from "react-icons/si";
import { Button, Select } from "@/ui";
import { formatINR, formatPercent } from "@/lib/format";

function PaymentOption({ selected, disabled, onSelect, Icon, title, tag, tagClass, description, children }) {
    return (
        <div
            role="radio"
            aria-checked={selected}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            onClick={() => !disabled && onSelect()}
            onKeyDown={(e) => !disabled && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect())}
            className={clsx(
                "relative rounded-2xl border-2 p-4 transition-all",
                selected
                    ? "cursor-pointer border-orange-500 bg-orange-500/10 shadow-md shadow-orange-500/10"
                    : disabled
                        ? "cursor-not-allowed border-white/10 bg-white/[0.02] opacity-80"
                        : "cursor-pointer border-white/10 bg-white/5 hover:border-white/20"
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", selected ? "border-orange-500/30 bg-orange-500/20 text-orange-400" : "border-white/10 bg-white/5 text-zinc-400")}>
                        <Icon className="text-xl" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-black text-white">{title}</h3>
                            {tag && <span className={clsx("rounded border px-1.5 py-0.5 text-[10px] font-bold", tagClass)}>{tag}</span>}
                        </div>
                        <p className="mt-0.5 text-[11px] text-zinc-400">{description}</p>
                    </div>
                </div>
                <div className={clsx("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", selected ? "border-orange-500 bg-orange-500 text-black" : "border-white/30")}>
                    {selected && <FiCheck className="stroke-[3] text-xs" />}
                </div>
            </div>
            {children}
        </div>
    );
}

// Credit option body (only rendered for an approved credit line this login may use).
function CreditDetails({ account, total, branchId, onBranch, lockedBranch }) {
    const branches = account.branches || [];
    return (
        <>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-xs">
                <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Available Credit</span>
                    <span className={clsx("text-sm font-black", account.availableCredit >= total ? "text-emerald-400" : "text-rose-400")}>{formatINR(account.availableCredit || 0)}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Credit Limit</span>
                    <span className="text-sm font-black text-zinc-200">{formatINR(account.creditLimit || 0)}</span>
                </div>
            </div>

            {lockedBranch ? (
                <p className="mt-3 border-t border-white/5 pt-2 text-[11px] text-zinc-400">
                    Billed to your branch: <strong className="text-white">{lockedBranch.branchName} ({lockedBranch.branchCode})</strong>
                </p>
            ) : branches.length > 1 ? (
                <div className="mt-3 border-t border-white/5 pt-2 text-xs" onClick={(e) => e.stopPropagation()}>
                    <label htmlFor="checkout-branch" className="mb-1 block text-[10px] font-bold text-zinc-400">Dispatch &amp; bill to branch</label>
                    <Select
                        id="checkout-branch"
                        className="!py-2 !text-xs"
                        value={branchId || ""}
                        onChange={(e) => onBranch(e.target.value)}
                        options={branches.map((b) => ({ value: b.id, label: `${b.branchName} (${b.branchCode})` }))}
                    />
                </div>
            ) : null}

            {account.availableCredit < total && (
                <p className="mt-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-[11px] font-medium text-rose-400">
                    Available credit ({formatINR(account.availableCredit || 0)}) is less than the order total ({formatINR(total)}). Pay online or settle pending invoices.
                </p>
            )}
        </>
    );
}

// Step 3 — choose Razorpay or Pay on Credit and confirm.
export default function PaymentStep({
    billing,
    units,
    totals,
    gstRate,
    mode,
    onMode,
    creditUsable,
    account,
    branchId,
    onBranch,
    lockedBranch,
    sending,
    onPay,
    onBack,
}) {
    const { total } = totals;
    const isCredit = mode === "credit";

    return (
        <>
            <div className="custom-scroll flex-1 space-y-4 overflow-y-auto px-5 py-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                            <FiMapPin className="text-orange-400" /> Invoicing &amp; Delivery Destination
                        </p>
                        <button type="button" onClick={onBack} className="text-[11px] font-bold text-orange-400 transition-colors hover:text-orange-300">
                            Edit
                        </button>
                    </div>
                    <p className="text-sm font-bold text-white">{billing.businessName || billing.contactName}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                        {[billing.contactName, billing.phone, billing.gstin && `GSTIN: ${billing.gstin}`].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-zinc-500">
                        {[billing.addressLine1, billing.addressLine2, `${billing.city}, ${billing.state} - ${billing.pincode}`].filter(Boolean).join(", ")}
                    </p>
                </div>

                <div className="space-y-3" role="radiogroup" aria-label="Payment method">
                    <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Select Payment Method</p>

                    <PaymentOption
                        selected={!isCredit}
                        onSelect={() => onMode("razorpay")}
                        Icon={SiRazorpay}
                        title="Razorpay Payment Gateway"
                        tag="Instant Online"
                        tagClass="border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                        description="UPI, Cards, NetBanking · Instant dispatch priority"
                    >
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-3 text-[10px] text-zinc-300">
                            {["UPI / QR (GPay, PhonePe, Paytm)", "Cards (Visa, Master, RuPay)", "NetBanking (50+ Banks)"].map((label) => (
                                <span key={label} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-medium">{label}</span>
                            ))}
                        </div>
                    </PaymentOption>

                    {account?.canOrderOnCredit && (
                        <PaymentOption
                            selected={isCredit}
                            disabled={!creditUsable}
                            onSelect={() => onMode("credit")}
                            Icon={FiCreditCard}
                            title="Pay on Credit"
                            tag={`Net ${account.creditDays} Days`}
                            tagClass="border-amber-500/30 bg-amber-500/20 text-amber-300"
                            description={`Invoiced to ${account?.businessName || "your business"} · Deducted from your credit limit`}
                        >
                            <CreditDetails account={account} total={total} branchId={branchId} onBranch={onBranch} lockedBranch={lockedBranch} />
                        </PaymentOption>
                    )}
                </div>

                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Order Summary</p>
                    <dl className="space-y-1.5">
                        <div className="flex justify-between text-zinc-300">
                            <dt>{units} tyres · Taxable Amount</dt>
                            <dd className="font-semibold text-white">{formatINR(totals.taxable)}</dd>
                        </div>
                        <div className="flex justify-between text-zinc-300">
                            <dt>GST @ {formatPercent(gstRate)}</dt>
                            <dd className="font-semibold text-white">{formatINR(totals.gst)}</dd>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-black text-white">
                            <dt>Total Amount</dt>
                            <dd className="text-base text-orange-400">{formatINR(total)}</dd>
                        </div>
                        {isCredit && (
                            <div className="flex justify-between pt-1 text-[11px] font-semibold text-amber-400">
                                <dt>Payment Terms</dt>
                                <dd>Net {account.creditDays} Days (Invoice on Dispatch)</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>

            <footer className="space-y-3 border-t border-white/10 bg-[#0D121B] px-5 py-4">
                <Button
                    full
                    onClick={onPay}
                    loading={sending}
                    loadingText={isCredit ? "Confirming Credit Order…" : "Opening Razorpay Gateway…"}
                    icon={isCredit ? <FiCreditCard className="text-amber-400" /> : <FiShield className="text-emerald-400" />}
                    className="relative justify-center py-3.5 shadow-lg shadow-orange-500/25"
                >
                    {isCredit ? `Confirm & Pay on Credit (${formatINR(total)})` : `Pay ${formatINR(total)} via Razorpay`}
                </Button>
                <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                    <button type="button" onClick={onBack} disabled={sending} className="transition-colors hover:text-white">
                        ← Back to Address
                    </button>
                    <span className="flex items-center gap-1 text-emerald-400">
                        <FiCheckCircle size={12} /> {isCredit ? "Verified Business Credit" : "256-bit Secure Gateway"}
                    </span>
                </div>
            </footer>
        </>
    );
}
