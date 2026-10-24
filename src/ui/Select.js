"use client";

import { forwardRef } from "react";
import clsx from "clsx";

/**
 * Enterprise Reusable Select Dropdown Component
 * Solid background & explicit option colors for clear readability
 */
export const Select = forwardRef(function Select(
    { options = [], placeholder, className, error, ...props },
    ref
) {
    return (
        <select
            ref={ref}
            className={clsx(
                "w-full rounded-xl border bg-[#111827] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition-all cursor-pointer font-semibold",
                "focus:ring-2 focus:ring-orange-500/20",
                "[&>option]:bg-[#111827] [&>option]:text-white",
                error
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 hover:border-white/20 focus:border-orange-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            {...props}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => {
                const { value, label } =
                    typeof opt === "string" ? { value: opt, label: opt } : opt;
                return (
                    <option key={value} value={value}>
                        {label}
                    </option>
                );
            })}
        </select>
    );
});

export default Select;
