"use client";

import { FiTrash2 } from "react-icons/fi";
import { CustomImage, QuantityInput } from "@/ui";
import { formatINR, formatPercent } from "@/lib/format";

// Step 1 — Review tyres, quantities, trade discount and GST split.
export default function ItemsStep({ lines, units, totals, gstRate, isApproved, billing, onRemove, onQuantity, onNext }) {
    return (
        <>
            <div className="custom-scroll flex-1 space-y-3 overflow-y-auto px-4 sm:px-5 py-4">
                {lines.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-sm p-3 sm:p-3.5 transition-all hover:border-white/20">
                        <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl bg-black/60 border border-white/10 p-1 overflow-hidden">
                            <CustomImage src={l.image} alt={l.productName} fill sizes="64px" imageClassName="object-contain w-full h-full" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <p className="truncate text-xs sm:text-sm font-bold text-white">{l.productName}</p>
                            <p className="text-[11px] sm:text-xs text-zinc-400">
                                {[l.size, l.position, l.price != null && formatINR(l.price)].filter(Boolean).join(" · ")}
                            </p>
                            <QuantityInput value={l.quantity} onChange={(q) => onQuantity(l.id, q)} label={`Quantity for ${l.productName} ${l.size}`} />
                        </div>
                        <button
                            type="button"
                            onClick={() => onRemove(l.id)}
                            aria-label={`Remove ${l.productName} ${l.size}`}
                            className="p-2 text-zinc-400 transition-colors hover:text-red-400 active:scale-95"
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <footer className="space-y-3.5 border-t border-white/10 bg-black/40 backdrop-blur-xl px-4 sm:px-5 py-4">
                {isApproved ? (
                    <dl className="space-y-1.5 text-xs sm:text-sm">
                        <div className="flex justify-between text-zinc-400">
                            <dt>{units} tyres · taxable</dt>
                            <dd className="font-semibold text-zinc-200">{formatINR(totals.taxable)}</dd>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                            <dt>GST @ {formatPercent(gstRate)}</dt>
                            <dd className="font-semibold text-zinc-200">{formatINR(totals.gst)}</dd>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2 text-sm sm:text-base font-black text-white">
                            <dt>Total Amount</dt>
                            <dd className="text-orange-400">{formatINR(totals.total)}</dd>
                        </div>
                    </dl>
                ) : (
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-zinc-400">
                        <p className="font-bold text-white">{units} tyres selected</p>
                        <p className="mt-0.5 text-[11px] text-zinc-400">Trade prices and GST apply once your trade account is verified.</p>
                    </div>
                )}

                {isApproved && billing?.businessName && (
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-xs">
                        <div className="truncate">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Invoicing Entity</p>
                            <p className="truncate font-bold text-white">{billing.businessName}</p>
                            {billing.city && <p className="text-[11px] text-zinc-400">{billing.city} · GSTIN: {billing.gstin || "Unregistered"}</p>}
                        </div>
                        <button type="button" onClick={onNext} className="ml-3 shrink-0 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors">
                            Edit Address →
                        </button>
                    </div>
                )}

                {/* Main CTA matching screenshot style */}
                <button
                    type="button"
                    onClick={onNext}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.99] py-3.5 px-4 text-xs sm:text-[13px] font-black uppercase tracking-[0.08em] text-white transition-all shadow-lg shadow-orange-500/25"
                >
                    <span>PROCEED TO BILLING ADDRESS</span>
                    <span className="text-base leading-none">→</span>
                </button>

                <p className="text-center text-[10px] sm:text-[11px] text-zinc-400">
                    Note: Wholesale orders include an official GST tax invoice for input tax credit.
                </p>
            </footer>
        </>
    );
}
