"use client";

import { useEffect } from "react";
import clsx from "clsx";
import { FiX } from "react-icons/fi";

export function CloseButton({ onClick, className, ariaLabel = "Close" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            className={clsx(
                "flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-zinc-400 hover:text-white transition-all hover:bg-white/15 active:scale-95",
                className
            )}
        >
            <FiX className="text-lg" />
        </button>
    );
}

/**
 * Enterprise Reusable Drawer Component
 * - Manages Escape key navigation
 * - Body scroll locking during open state
 * - Smooth CSS animations
 * - Accessible ARIA attributes
 */
export default function Drawer({
    open,
    onClose,
    label = "Navigation drawer",
    header,
    children,
    className = "w-full max-w-full sm:max-w-md md:max-w-lg bg-[#10141D]"
}) {
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => e.key === "Escape" && onClose?.();
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[60]"
            role="dialog"
            aria-modal="true"
            aria-label={label}
        >
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close drawer"
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
            />

            {/* Slide-out Panel */}
            <aside
                className={clsx(
                    "animate-drawer-in absolute right-0 top-0 flex h-full max-h-dvh w-full flex-col border-l border-white/10 text-white shadow-2xl overflow-hidden",
                    className
                )}
            >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 shrink-0">
                    {header}
                    <CloseButton onClick={onClose} />
                </div>
                {children}
            </aside>
        </div>
    );
}
