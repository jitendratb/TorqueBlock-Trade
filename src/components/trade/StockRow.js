"use client";

import { useState } from "react";
import { FiCheck, FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import { useTrade } from "@/context/TradeContext";
import { formatINR } from "@/lib/pricing";

function StockBadge({ size }) {
    if (size.availability === "out_of_stock") {
        return <span className="rounded-md bg-red-500/15 px-2 py-1 text-[11px] font-bold text-red-400">Out of stock</span>;
    }
    if (size.availability === "backorder") {
        return <span className="rounded-md bg-sky-500/15 px-2 py-1 text-[11px] font-bold text-sky-400">Backorder</span>;
    }
    const low = size.stock <= 5;
    return (
        <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${low ? "bg-orange-500/15 text-orange-400" : "bg-green-500/15 text-green-400"}`}>
            {low ? `Only ${size.stock} left` : `${size.stock} in stock`}
        </span>
    );
}

export default function StockRow({ product, size }) {
    const { placeOrder, addItem } = useTrade();
    const [qty, setQty] = useState(1);
    const [state, setState] = useState("idle");

    const unavailable = size.availability === "out_of_stock" || !size.price;
    const max = size.availability === "in_stock" ? size.stock : 999;
    const setSafeQty = (n) => setQty(Math.min(max, Math.max(1, Number.isFinite(n) ? n : 1)));

    const line = {
        id: size.id,
        identifier: product.identifier,
        productName: product.productName,
        brandName: product.brandName,
        image: product.image,
        size: size.size,
        position: size.position,
        spec: size.spec,
        price: size.price,
        mrp: size.mrp,
        quantity: qty,
    };

    const orderNow = async () => {
        setState("sending");
        try {
            await placeOrder([line]);
            setState("done");
            setQty(1);
            setTimeout(() => setState("idle"), 4000);
        } catch {
            setState("idle");
        }
    };

    return (
        <div className={`grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-3 md:grid-cols-[1.2fr_0.7fr_0.9fr_1fr_1fr_240px] md:gap-4 ${unavailable ? "opacity-50" : ""}`}>
            <div>
                <p className="whitespace-nowrap text-base font-black text-white">{size.size}</p>
                <p className="text-[11px] font-semibold text-zinc-400 md:hidden">{[size.position, size.spec].filter(Boolean).join(" · ")}</p>
            </div>
            <p className="hidden text-sm font-semibold text-zinc-300 md:block">{size.position}</p>
            <p className="hidden text-sm font-semibold text-zinc-300 md:block">{size.spec || "—"}</p>
            <div className="justify-self-end md:justify-self-start">
                <StockBadge size={size} />
            </div>
            <div>
                <p className="text-lg font-black text-white">{formatINR(size.price)}</p>
                {size.mrp && <p className="text-[11px] text-zinc-500">MRP <span className="line-through">{formatINR(size.mrp)}</span></p>}
            </div>
            <div className="flex items-center justify-end gap-2">
                <div className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-black/20">
                    <button type="button" aria-label="Decrease quantity" disabled={unavailable || qty <= 1} onClick={() => setSafeQty(qty - 1)} className="flex h-full w-7 items-center justify-center text-zinc-300 hover:text-orange-500 disabled:opacity-30">
                        <FiMinus />
                    </button>
                    <input
                        type="number"
                        inputMode="numeric"
                        aria-label={`Quantity for ${product.productName} ${size.size}`}
                        min={1}
                        max={max}
                        value={qty}
                        disabled={unavailable}
                        onChange={(e) => setSafeQty(parseInt(e.target.value, 10))}
                        className="no-spin h-full w-9 bg-transparent text-center text-sm font-black text-white outline-none"
                    />
                    <button type="button" aria-label="Increase quantity" disabled={unavailable || qty >= max} onClick={() => setSafeQty(qty + 1)} className="flex h-full w-7 items-center justify-center text-zinc-300 hover:text-orange-500 disabled:opacity-30">
                        <FiPlus />
                    </button>
                </div>
                <button
                    type="button"
                    aria-label="Add to order list"
                    title="Add to order list"
                    disabled={unavailable}
                    onClick={() => { addItem(line); setQty(1); }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-zinc-300 hover:border-orange-500 hover:text-orange-500 disabled:opacity-30"
                >
                    <FiShoppingCart />
                </button>
                <button
                    type="button"
                    disabled={unavailable || state === "sending"}
                    onClick={orderNow}
                    className={`flex h-9 min-w-[92px] items-center justify-center gap-1 rounded-lg px-3 text-xs font-black uppercase tracking-wider text-white transition-colors disabled:opacity-60 ${state === "done" ? "bg-green-600" : "bg-orange-500 hover:bg-orange-600"}`}
                >
                    {state === "done" ? <><FiCheck /> Ordered</> : state === "sending" ? "Placing…" : "Order"}
                </button>
            </div>
        </div>
    );
}
