"use client";

import clsx from "clsx";

/**
 * Enterprise Reusable Spinner Primitive
 * Multiple sizes (sm, md, lg, xl) and theme color tones
 */
export default function Spinner({
    size = "md",
    tone = "orange",
    className,
    label = "Loading..."
}) {
    const sizeClasses = {
        xs: "h-3.5 w-3.5 border",
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-3",
        xl: "h-12 w-12 border-3"
    };

    const toneClasses = {
        orange: "border-orange-500 border-t-transparent",
        white: "border-white border-t-transparent",
        zinc: "border-zinc-400 border-t-transparent",
        purple: "border-indigo-500 border-t-transparent"
    };

    return (
        <span
            role="status"
            aria-label={label}
            className={clsx(
                "inline-block shrink-0 animate-spin rounded-full",
                sizeClasses[size] || sizeClasses.md,
                toneClasses[tone] || toneClasses.orange,
                className
            )}
        />
    );
}
