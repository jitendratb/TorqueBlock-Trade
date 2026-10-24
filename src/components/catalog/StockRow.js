"use client";

import { memo } from "react";
import Link from "next/link";
import { FiMinus, FiPlus, FiShoppingCart, FiTrash2, FiLock } from "react-icons/fi";
import { formatINR } from "@/lib/format";
import { ShareButtons } from "@/ui";
import { tyreHref } from "@/lib/catalog.utils";
import { useUiStore } from "@/store/ui.store";
import { useOrderListStore, toLine } from "@/store/orderStore";

export const STOCK_GRID = "md:grid-cols-[1.2fr_0.8fr_1fr_1.4fr_180px]";

const STOCK_BADGES = {
    out: { label: "Out of stock", className: "bg-rose-950/60 text-rose-400 border-rose-500/20", dot: "bg-rose-400" },
    limited: { label: "Limited stock", className: "bg-amber-950/60 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
    in: { label: "In stock", className: "bg-emerald-950/60 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
};

function StockBadge({ size }) {
    const level = size.availability === "out_of_stock" ? "out" : size.availability === "backorder" || (size.stock != null && size.stock <= 5) ? "limited" : "in";
    const { label, className, dot } = STOCK_BADGES[level];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border whitespace-nowrap ${className}`}>
            <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
            <span>{label}</span>
        </span>
    );
}

function PriceCell({ size, tradePrice, isApproved, onLoginClick }) {
    if (!isApproved) {
        return (
            <button
                type="button"
                onClick={onLoginClick}
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-orange-400 transition-colors whitespace-nowrap text-left"
                title="Login to unlock trade wholesale prices"
            >
                <FiLock className="text-zinc-400 text-sm shrink-0" />
                <span>Business price after login</span>
            </button>
        );
    }

    return <p className="text-sm sm:text-base font-black text-white">{formatINR(tradePrice ?? size.tradePrice)}</p>;
}

// One size row: stock, business price and the order-list controls (the order list lives in the browser).
function StockRow({ product, size, isApproved, tradePrice }) {
    const add = useOrderListStore((s) => s.add);
    const setQuantity = useOrderListStore((s) => s.setQuantity);
    const remove = useOrderListStore((s) => s.remove);
    const cartQty = useOrderListStore((s) => s.items.find((i) => i.id === size.id)?.quantity || 0);
    const notify = useUiStore((s) => s.notify);
    const openLogin = useUiStore((s) => s.openLogin);
    const setOrderListOpen = useUiStore((s) => s.setOrderListOpen);

    const href = tyreHref(product, size);
    const unavailable = size.availability === "out_of_stock" || !(tradePrice ?? size.tradePrice);
    const max = size.availability === "in_stock" && size.stock ? size.stock : 999;
    const inCart = cartQty > 0;

    const removeLine = () => {
        remove(size.id);
        notify("info", `Removed ${product.name} (${size.size}) from cart.`);
    };

    const handleAddToCart = () => {
        add(toLine(product, size, 1));
        notify("success", `Added 1 × ${product.name} (${size.size}) to cart.`);
    };

    const handleIncrement = () => {
        if (cartQty < max) setQuantity(size.id, cartQty + 1);
    };

    const handleDecrement = () => {
        if (cartQty > 1) setQuantity(size.id, cartQty - 1);
        else removeLine();
    };

    const handleDirectQtyChange = (val) => {
        if (!Number.isFinite(val) || val <= 0) removeLine();
        else setQuantity(size.id, Math.min(max, val));
    };

    const orderNow = () => {
        if (!inCart) add(toLine(product, size, 1));
        setOrderListOpen(true);
    };

    return (
        <div className={`grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-3.5 md:gap-4 ${STOCK_GRID} ${unavailable ? "opacity-50" : ""}`}>
            <div>
                <div className="flex items-center gap-2">
                    {href ? (
                        <Link href={href} className="whitespace-nowrap text-sm sm:text-base font-bold text-white hover:text-orange-400 transition-colors">
                            {size.size}
                        </Link>
                    ) : (
                        <p className="whitespace-nowrap text-sm sm:text-base font-bold text-white">{size.size}</p>
                    )}
                    {href && <ShareButtons path={href} title={`${product.name} ${size.size}`} size="sm" iconOnly />}
                </div>
                <p className="text-[11px] font-medium text-zinc-400 md:hidden">{[size.position, size.spec].filter(Boolean).join(" · ") || "Front / Rear"}</p>
            </div>
            <p className="hidden text-xs sm:text-sm font-medium text-zinc-300 md:block">{size.position || "Front / Rear"}</p>
            <div className="justify-self-end md:justify-self-start">
                <StockBadge size={size} />
            </div>
            <PriceCell size={size} tradePrice={tradePrice} isApproved={isApproved} onLoginClick={openLogin} />
            <div className="col-span-2 flex items-center justify-end gap-2 md:col-span-1">
                {!inCart ? (
                    <button
                        type="button"
                        disabled={unavailable}
                        onClick={handleAddToCart}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-orange-500/80 bg-transparent px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/10 hover:border-orange-500 hover:text-white transition-all uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <FiShoppingCart className="text-sm" />
                        <span>ADD</span>
                    </button>
                ) : (
                    <div className="inline-flex h-8 items-center rounded-lg border border-orange-500/50 bg-orange-500/10 shadow-sm">
                        <button
                            type="button"
                            aria-label={cartQty === 1 ? "Remove from cart" : "Decrease quantity"}
                            disabled={unavailable}
                            onClick={handleDecrement}
                            className="flex h-full w-7 items-center justify-center text-orange-400 hover:bg-orange-500/20 hover:text-white rounded-l-lg transition-colors disabled:opacity-30"
                        >
                            {cartQty === 1 ? <FiTrash2 className="text-xs" /> : <FiMinus className="text-xs" />}
                        </button>
                        <input
                            type="number"
                            inputMode="numeric"
                            aria-label={`Quantity for ${product.name} ${size.size}`}
                            min={1}
                            max={max}
                            value={cartQty}
                            disabled={unavailable}
                            onChange={(e) => handleDirectQtyChange(parseInt(e.target.value, 10))}
                            className="no-spin h-full w-8 bg-transparent text-center text-xs font-black text-white outline-none"
                        />
                        <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={unavailable || cartQty >= max}
                            onClick={handleIncrement}
                            className="flex h-full w-7 items-center justify-center text-orange-400 hover:bg-orange-500/20 hover:text-white rounded-r-lg transition-colors disabled:opacity-30"
                        >
                            <FiPlus className="text-xs" />
                        </button>
                    </div>
                )}
                <button
                    type="button"
                    disabled={unavailable}
                    onClick={orderNow}
                    className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-black text-white hover:bg-orange-600 active:scale-95 transition-all uppercase tracking-wider shadow-sm disabled:opacity-40 disabled:pointer-events-none"
                >
                    ORDER
                </button>
            </div>
        </div>
    );
}

export default memo(StockRow);
