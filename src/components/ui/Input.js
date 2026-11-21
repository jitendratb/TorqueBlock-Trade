"use client";

import { forwardRef } from "react";
import clsx from "clsx";

/**
 * Enterprise Reusable Input Component.
 * Supports optional prefix text/icon, rounded pill search style, and error state.
 */
export const Input = forwardRef(function Input(
    { className, wrapperClassName, prefix, leftIcon, error, pill = false, ...props },
    ref
) {
    const baseInput = clsx(
        "w-full text-sm font-medium text-white placeholder:text-zinc-500 outline-none transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed"
    );

    if (prefix || leftIcon) {
        return (
            <div
                className={clsx(
                    "flex items-center border transition-all",
                    pill
                        ? "rounded-full bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-sm px-3.5 py-1.5"
                        : "rounded-xl bg-[#2D323B] px-4 py-3 sm:py-3.5",
                    error
                        ? "border-red-500 focus-within:border-red-500"
                        : pill
                          ? "border-white/10 focus-within:border-orange-500/40"
                          : "border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20",
                    wrapperClassName
                )}
            >
                {prefix && (
                    <span className="mr-3 select-none text-sm font-semibold text-zinc-200">{prefix}</span>
                )}
                {leftIcon && <span className="mr-2.5 shrink-0 text-zinc-400">{leftIcon}</span>}
                <input ref={ref} className={clsx(baseInput, "bg-transparent", className)} {...props} />
            </div>
        );
    }

    return (
        <input
            ref={ref}
            className={clsx(
                baseInput,
                pill
                    ? "rounded-full border bg-white/[0.04] hover:bg-white/[0.06] px-4 py-1.5 text-xs backdrop-blur-sm"
                    : "rounded-xl border bg-[#2D323B] px-4 py-3 focus:ring-2 focus:ring-[#A35229]/20",
                error
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 hover:border-white/20 focus:border-white/30",
                className
            )}
            {...props}
        />
    );
});

export default Input;
