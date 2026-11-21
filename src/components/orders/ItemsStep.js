"use client";

import { FaArrowRightLong } from "react-icons/fa6";
import { Button } from "@/components/ui";
import { formatINR, formatPercent } from "@/lib/format";
import CartLineItem from "./CartLineItem";

const SummaryRow = ({ label, value, strong }) => (
    <div className="flex items-center justify-between">
        <span className={strong ? "text-xs font-black uppercase tracking-widest text-zinc-400" : "text-[11px] font-semibold text-zinc-400"}>
            {label}
        </span>
        <span className={strong ? "text-base font-black tracking-tight text-white" : "text-xs font-bold text-zinc-200"}>
            {value}
        </span>
    </div>
);

// Step 1 — cart items (website cart layout) with trade GST split.
export default function ItemsStep({ lines, units, totals, gstRate, isApproved, billing, onRemove, onQuantity, onNext }) {
    return (
        <>
            <div className="custom-scroll flex-1 space-y-4 overflow-y-auto px-4 py-4">
                {lines.map((line) => (
                    <CartLineItem key={line.id} line={line} onQuantity={onQuantity} onRemove={onRemove} />
                ))}
            </div>

            <footer className="space-y-4 border-t border-white/[0.06] px-4 py-4">
                <div className="space-y-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
                    {isApproved ? (
                        <>
                            <SummaryRow label={`${units} ${units === 1 ? "tyre" : "tyres"} · taxable`} value={formatINR(totals.taxable)} />
                            <SummaryRow label={`GST @ ${formatPercent(gstRate)}`} value={formatINR(totals.gst)} />
                            <div className="border-t border-white/[0.06] pt-2">
                                <SummaryRow strong label="Subtotal" value={formatINR(totals.total)} />
                            </div>
                        </>
                    ) : (
                        <>
                            <SummaryRow strong label="Items" value={`${units} ${units === 1 ? "tyre" : "tyres"}`} />
                            <p className="text-[11px] text-zinc-400">Trade prices and GST apply once your trade account is verified.</p>
                        </>
                    )}
                </div>

                {isApproved && billing?.businessName && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-xs">
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Invoicing Entity</p>
                            <p className="truncate font-bold text-white">{billing.businessName}</p>
                            {billing.city && (
                                <p className="truncate text-[11px] text-zinc-400">
                                    {billing.city} · GSTIN: {billing.gstin || "Unregistered"}
                                </p>
                            )}
                        </div>
                        <Button variant="link" size="sm" uppercase={false} onClick={onNext}>
                            Edit →
                        </Button>
                    </div>
                )}

                <Button
                    variant="gradient"
                    size="lg"
                    full
                    onClick={onNext}
                    rightIcon={<FaArrowRightLong className="text-xs transition-transform duration-300 group-hover:translate-x-1" />}
                    className="group"
                >
                    Proceed to Checkout
                </Button>

                <p className="text-center text-[10px] text-zinc-400">
                    Every trade order includes a GST tax invoice for input tax credit.
                </p>
            </footer>
        </>
    );
}
