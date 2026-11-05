"use client";

import clsx from "clsx";

export const STOCK_BADGES = {
    out: { label: "Out of stock", className: "bg-rose-500/10 text-rose-400 border-rose-500/20", dot: "bg-rose-400" },
    limited: { label: "Limited stock", className: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
    in: { label: "In stock", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
};

export function getAvailabilityLevel(size) {
    if (!size) return "out";
    if (size.availability === "out_of_stock") return "out";
    if (size.availability === "backorder" || (size.stock != null && size.stock <= 5)) return "limited";
    return "in";
}

/**
 * Reusable inventory availability badge for tyre products and sizes.
 */
export default function StockBadge({ size = null, availability = null, className = "" }) {
    const level = availability || getAvailabilityLevel(size);
    const badge = STOCK_BADGES[level] || STOCK_BADGES.out;

    return (
        <span
            className={clsx(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide",
                badge.className,
                className
            )}
        >
            <span className={clsx("h-1.5 w-1.5 rounded-full", badge.dot)} />
            {badge.label}
        </span>
    );
}

