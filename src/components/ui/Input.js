"use client";

import { forwardRef } from "react";
import clsx from "clsx";

/**
 * Enterprise Reusable Input Component
 * Consistent dark theme, border hover/focus states, disabled states
 */
export const Input = forwardRef(function Input(
    { className, error, ...props },
    ref
) {
    return (
        <input
            ref={ref}
            className={clsx(
                "w-full rounded-xl border bg-[#111827] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition-all",
                "focus:ring-2 focus:ring-orange-500/20",
                error
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 hover:border-white/20 focus:border-orange-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            {...props}
        />
    );
});

export default Input;
