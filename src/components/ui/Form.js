"use client";

import clsx from "clsx";

// Labelled form field wrapper and inline error message.

export function Field({ label, htmlFor, error, className, children }) {
    return (
        <div className={clsx("space-y-1.5", className)}>
            {label && (
                <label
                    htmlFor={htmlFor}
                    className="block text-[11px] font-black uppercase tracking-widest text-zinc-400"
                >
                    {label}
                </label>
            )}
            {children}
            {error && <FormError>{error}</FormError>}
        </div>
    );
}

export function FormError({ children, className }) {
    if (!children) return null;
    return (
        <p className={clsx("text-xs font-semibold text-red-400", className)}>
            {children}
        </p>
    );
}
