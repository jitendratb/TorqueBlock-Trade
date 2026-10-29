"use client";

import { memo } from "react";
import Link from "next/link";
import { FiMinus, FiPlus, FiShoppingCart, FiTrash2, FiLock } from "react-icons/fi";
import { formatINR } from "@/lib/format";
import { ShareButtons } from "@/ui";
import { tyreHref } from "@/lib/catalog.utils";
import { useUiStore } from "@/store/ui.store";
import { useOrderListStore, toLine } from "@/store/orderStore";

export const STOCK_GRID = "md:grid-cols-[1.4fr_0.8fr_1.1fr_1.1fr_210px] lg:grid-cols-[1.3fr_0.8fr_1fr_1.1fr_220px] xl:grid-cols-[1.4fr_0.8fr_1.1fr_1.1fr_260px]";

const STOCK_BADGES = {
    out: { label: "Out of stock", className: "bg-rose-950/60 text-rose-400 border-rose-500/20", dot: "bg-rose-400" },
    limited: { label: "Limited stock", className: "bg-amber-950/60 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
    in: { label: "In stock", className: "bg-emerald-950/60 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
};

function StockBadge({ size }) {
    const level = size.availability === "out_of_stock" ? "out" : size.availability === "backorder" || (size.stock != null && size.stock <= 5) ? "limited" : "in";

    const { label, className, dot } = STOCK_BADGES[level];

    return (
        <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border whitespace-nowrap ${className}`}>
            <span className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0 ${dot}`} />
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
                className="flex items-center justify-center gap-1 text-xs font-semibold text-zinc-400 hover:text-orange-400 transition-colors whitespace-nowrap mx-auto"
                title="Login to unlock trade wholesale prices"
            >
                <FiLock className="text-orange-400 text-xs sm:text-sm shrink-0" />
                <span>Login for trade price</span>
            </button>
        );
    }

    const price = tradePrice ?? size.tradePrice;
    if (!price) {
        return <p className="text-sm sm:text-base lg:text-lg font-bold text-zinc-500 text-center" title="No trade price set yet">–</p>;
    }
    return <p className="text-sm sm:text-base lg:text-lg font-black text-white text-center tracking-tight whitespace-nowrap">{formatINR(price)}</p>;
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

    const renderActionControls = (isMobile = false) => (
        <div className={`flex items-center ${isMobile ? "gap-2" : "gap-2 justify-center"}`}>
            {!inCart ? (
                <button
                    type="button"
                    disabled={unavailable}
                    onClick={handleAddToCart}
                    className="inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-orange-500 bg-transparent px-2.5 sm:px-3 xl:px-4 text-xs sm:text-sm font-semibold text-orange-400 hover:bg-orange-500/10 hover:text-white transition-all disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
                >
                    <FiShoppingCart className="text-sm sm:text-base shrink-0" />
                    <span className="sm:inline md:hidden xl:inline">Add to Cart</span>
                    <span className="hidden md:inline xl:hidden">Add</span>
                </button>
            ) : (
                <div className="inline-flex h-9 sm:h-10 items-center justify-between rounded-xl border border-orange-500/60 bg-orange-500/10 shadow-sm">
                    <button
                        type="button"
                        aria-label={cartQty === 1 ? "Remove from cart" : "Decrease quantity"}
                        disabled={unavailable}
                        onClick={handleDecrement}
                        className="flex h-full w-8 sm:w-9 items-center justify-center text-orange-400 hover:bg-orange-500/20 hover:text-white rounded-l-xl transition-colors disabled:opacity-30"
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
                        className="no-spin h-full w-8 sm:w-9 bg-transparent text-center text-xs sm:text-sm font-black text-white outline-none"
                    />
                    <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={unavailable || cartQty >= max}
                        onClick={handleIncrement}
                        className="flex h-full w-8 sm:w-9 items-center justify-center text-orange-400 hover:bg-orange-500/20 hover:text-white rounded-r-xl transition-colors disabled:opacity-30"
                    >
                        <FiPlus className="text-xs" />
                    </button>
                </div>
            )}
            <button
                type="button"
                disabled={unavailable}
                onClick={orderNow}
                className="inline-flex h-9 sm:h-10 items-center justify-center rounded-xl bg-orange-500 px-3.5 sm:px-4 xl:px-5 text-xs sm:text-sm font-bold text-white hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
            >
                Order
            </button>
        </div>
    );

    return (
        <div className={`py-3 md:py-3.5 transition-colors ${unavailable ? "opacity-50" : ""}`}>
            {/* Mobile View (< md) - Clean 2-Row Balanced Layout */}
            <div className="flex flex-col gap-2.5 md:hidden">
                {/* Row 1: Size & Fitment on left, Stock Badge on right */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {href ? (
                            <Link href={href} className="truncate text-sm sm:text-base font-bold text-white hover:text-orange-400 transition-colors">
                                {size.size}
                            </Link>
                        ) : (
                            <p className="truncate text-sm sm:text-base font-bold text-white">{size.size}</p>
                        )}
                        <span className="shrink-0 text-[10px] font-semibold text-zinc-400 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                            {size.position || "Front / Rear"}
                        </span>
                        {href && <ShareButtons path={href} title={`${product.name} ${size.size}`} size="sm" iconOnly copyOnly />}
                    </div>
                    <div className="shrink-0">
                        <StockBadge size={size} />
                    </div>
                </div>

                {/* Row 2: Price on left, Action buttons on right */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.04]">
                    <div className="min-w-0">
                        <PriceCell size={size} tradePrice={tradePrice} isApproved={isApproved} onLoginClick={openLogin} />
                    </div>
                    <div className="shrink-0">
                        {renderActionControls(true)}
                    </div>
                </div>
            </div>

            {/* Desktop View (md:) - 5-Column High-Precision Table Row */}
            <div className={`hidden md:grid items-center gap-4 ${STOCK_GRID}`}>
                <div className="min-w-0 flex items-center justify-center gap-2.5">
                    {href ? (
                        <Link href={href} className="truncate text-sm lg:text-base font-bold text-white hover:text-orange-400 transition-colors">
                            {size.size}
                        </Link>
                    ) : (
                        <p className="truncate text-sm lg:text-base font-bold text-white">{size.size}</p>
                    )}
                    {href && <ShareButtons path={href} title={`${product.name} ${size.size}`} size="sm" iconOnly copyOnly />}
                </div>
                <p className="text-sm lg:text-base font-medium text-zinc-200 text-center">
                    {size.position || "Front / Rear"}
                </p>
                <div className="justify-self-center">
                    <StockBadge size={size} />
                </div>
                <div className="justify-self-center text-center">
                    <PriceCell size={size} tradePrice={tradePrice} isApproved={isApproved} onLoginClick={openLogin} />
                </div>
                <div className="flex items-center justify-center">
                    {renderActionControls(false)}
                </div>
            </div>
        </div>
    );
}

export default memo(StockRow);
