"use client";

import { useEffect, useState } from "react";
import { FiTrash2, FiX } from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";
import CustomImage from "@/components/ui/CustomImage";
import { useTrade } from "@/context/TradeContext";
import { GST_RATE, formatINR, formatPercent } from "@/lib/pricing";

// Order list for multi-line orders. Single sizes can be ordered straight from the stock list.
export default function OrderDrawer() {
    const { summary, items, cartOpen, setCartOpen, updateQuantity, removeItem, placeCartOrder, business, setDetailsRequest, saveBusiness } = useTrade();
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!cartOpen) return;
        const onKey = (e) => e.key === "Escape" && setCartOpen(false);
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [cartOpen, setCartOpen]);

    if (!cartOpen) return null;

    const submit = async () => {
        setSending(true);
        try {
            await placeCartOrder();
        } catch {
            // Toast already shows the reason.
        } finally {
            setSending(false);
        }
    };

    const editDetails = () =>
        setDetailsRequest({ onSave: (d) => { saveBusiness(d); setDetailsRequest(null); }, onCancel: () => setDetailsRequest(null) });

    return (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Order list">
            <button aria-label="Close order list" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <aside className="animate-drawer-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0B0F19] text-white shadow-2xl">
                <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <h2 className="text-xl font-black tracking-tight">Order <span className="text-orange-500">List</span></h2>
                    <button onClick={() => setCartOpen(false)} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10">
                        <FiX className="text-lg" />
                    </button>
                </header>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                        <IoCartOutline className="text-6xl text-zinc-600" />
                        <p className="text-lg font-black">No items yet</p>
                        <p className="text-sm text-zinc-400">Use the cart icon next to any size to collect several sizes into one order.</p>
                    </div>
                ) : (
                    <>
                        <div className="custom-scroll flex-1 space-y-2 overflow-y-auto px-5 py-4">
                            {items.map((l) => (
                                <div key={l.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                                    <div className="relative h-14 w-14 shrink-0">
                                        <CustomImage src={l.image} alt={l.productName} fill sizes="56px" imageClassName="object-contain" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-black">{l.productName}</p>
                                        <p className="text-xs text-zinc-400">{l.size} · {l.position} · {formatINR(l.price)}</p>
                                    </div>
                                    <input
                                        type="number"
                                        min={1}
                                        aria-label={`Quantity for ${l.productName} ${l.size}`}
                                        value={l.quantity}
                                        onChange={(e) => updateQuantity(l.id, parseInt(e.target.value, 10) || 1)}
                                        className="no-spin h-9 w-12 rounded-lg border border-white/15 bg-black/20 text-center text-sm font-black outline-none focus:border-orange-500"
                                    />
                                    <button onClick={() => removeItem(l.id)} aria-label={`Remove ${l.productName} ${l.size}`} className="text-zinc-500 hover:text-red-400">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <footer className="space-y-3 border-t border-white/10 px-5 py-4">
                            <dl className="space-y-1 text-sm">
                                <div className="flex justify-between text-zinc-400"><dt>{summary.units} tyres · taxable</dt><dd>{formatINR(summary.taxable)}</dd></div>
                                <div className="flex justify-between text-zinc-400"><dt>GST @ {formatPercent(GST_RATE)}</dt><dd>{formatINR(summary.gst)}</dd></div>
                                <div className="flex justify-between pt-1 text-lg font-black"><dt>Total</dt><dd>{formatINR(summary.total)}</dd></div>
                            </dl>
                            {business && (
                                <p className="text-xs text-zinc-400">
                                    Billing to <span className="font-bold text-white">{business.businessName}</span> · {business.gstin} ·{" "}
                                    <button onClick={editDetails} className="font-bold text-orange-500 hover:text-orange-400">Change</button>
                                </p>
                            )}
                            <button onClick={submit} disabled={sending} className="w-full rounded-xl bg-orange-500 py-3.5 text-sm font-black uppercase tracking-wider hover:bg-orange-600 disabled:opacity-60">
                                {sending ? "Placing order…" : "Place Order"}
                            </button>
                        </footer>
                    </>
                )}
            </aside>
        </div>
    );
}
