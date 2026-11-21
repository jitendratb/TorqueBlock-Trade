"use client";

import { useEffect } from "react";
import clsx from "clsx";
import { FiX } from "react-icons/fi";
import Button from "./Button";

export function CloseButton({ onClick, className, ariaLabel = "Close" }) {
    return (
        <Button
            variant="secondary"
            size="sm"
            iconOnly
            onClick={onClick}
            aria-label={ariaLabel}
            icon={<FiX className="text-lg" />}
            className={className}
        />
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
    className = "w-full sm:max-w-md"
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
                className="absolute inset-0 bg-black/5 backdrop-blur-[1px] cursor-default"
            />

            {/* Slide-out panel: light frosted glass (same as the website drawers) */}
            <aside
                className={clsx(
                    "animate-drawer-in absolute right-0 top-0 flex h-full max-h-dvh w-full max-w-[95vw] flex-col overflow-hidden rounded-l-xl border-l border-white/[0.08] bg-zinc-950/10 text-white backdrop-blur-3xl",
                    className
                )}
            >
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] via-cyan-500/[0.02] to-yellow-500/[0.03] opacity-80 mix-blend-screen" />
                <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <span aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(249,115,22,0.05),transparent)]" />

                <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-4">
                    {header}
                    <CloseButton onClick={onClose} className="hover:rotate-90 duration-300" />
                </div>
                <div className="relative z-10 flex min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">{children}</div>
            </aside>
        </div>
    );
}
