"use client";

import { FiArrowRight, FiTrash2 } from "react-icons/fi";
import { Button, CustomImage, QuantityInput } from "@/ui";
import { formatINR, formatPercent } from "@/lib/format";

// Step 1 — review tyres, quantities and the GST split.
export default function ItemsStep({ lines, units, totals, gstRate, isApproved, billing, onRemove, onQuantity, onNext }) {
    return (
        <>
            <div className="custom-scroll flex-1 space-y-2.5 overflow-y-auto px-5 py-4">
                {lines.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="relative h-14 w-14 shrink-0 rounded-xl bg-black/40 p-1">
                            <CustomImage src={l.image} alt={l.productName} fill sizes="56px" imageClassName="object-contain" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <p className="truncate text-sm font-black text-white">{l.productName}</p>
                            <p className="text-xs text-zinc-400">{[l.size, l.position, l.price != null && formatINR(l.price)].filter(Boolean).join(" · ")}</p>
                            <QuantityInput value={l.quantity} onChange={(q) => onQuantity(l.id, q)} label={`Quantity for ${l.productName} ${l.size}`} />
                        </div>
                        <button onClick={() => onRemove(l.id)} aria-label={`Remove ${l.productName} ${l.size}`} className="p-2 text-zinc-500 transition-colors hover:text-red-400">
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <footer className="space-y-3.5 border-t border-white/10 bg-[#0D121B] px-5 py-4">
                {isApproved ? (
                    <dl className="space-y-1 text-sm">
                        <div className="flex justify-between text-zinc-400">
                            <dt>{units} tyres · taxable</dt>
                            <dd>{formatINR(totals.taxable)}</dd>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                            <dt>GST @ {formatPercent(gstRate)}</dt>
                            <dd>{formatINR(totals.gst)}</dd>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-1 text-lg font-black text-white">
                            <dt>Total Amount</dt>
                            <dd className="text-orange-400">{formatINR(totals.total)}</dd>
                        </div>
                    </dl>
                ) : (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-400">
                        <p className="font-semibold text-white">{units} tyres selected</p>
                        <p className="mt-0.5">Trade prices and GST apply once your trade account is verified.</p>
                    </div>
                )}

                {isApproved && billing?.businessName && (
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs">
                        <div className="truncate">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Invoicing Entity</p>
                            <p className="truncate font-bold text-white">{billing.businessName}</p>
                            {billing.city && <p className="text-[11px] text-zinc-400">{billing.city} · GSTIN: {billing.gstin || "Unregistered"}</p>}
                        </div>
                        <button type="button" onClick={onNext} className="ml-3 shrink-0 text-xs font-bold text-orange-400 hover:text-orange-300">
                            Edit Address →
                        </button>
                    </div>
                )}

                <Button full onClick={onNext} className="justify-center py-3.5">
                    Proceed to Billing Address <FiArrowRight />
                </Button>
            </footer>
        </>
    );
}
