"use client";

import { useEffect } from "react";
import clsx from "clsx";
import { CloseButton } from "./Drawer";

/**
 * Enterprise Reusable Modal Dialog Component
 * - Manages Escape key navigation & body scroll lock
 * - Animated fade-in-up transition
 * - Centered responsive card
 */
export default function Modal({
    open,
    onClose,
    label = "Dialog modal",
    children,
    className = "max-w-[460px] w-full rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-[#22262E]/95 border border-white/10 backdrop-blur-xl shadow-2xl",
    closeButtonClassName = "absolute right-4 top-4 sm:right-5 sm:top-5 h-8 w-8 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-400 hover:text-white"
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
            className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={label}
        >
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close modal"
                onClick={onClose}
                className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-default"
            />

            {/* Modal Content Box */}
            <div
                className={clsx(
                    "animate-fade-in-up relative w-full max-h-[92dvh] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain border border-white/10 text-white shadow-2xl",
                    className,
                    "max-sm:max-w-none max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
                )}
            >
                <span aria-hidden="true" className="mx-auto -mt-2 mb-4 block h-1 w-10 rounded-full bg-white/20 sm:hidden" />
                <CloseButton
                    onClick={onClose}
                    className={closeButtonClassName}
                    ariaLabel="Close modal"
                />
                {children}
            </div>
        </div>
    );
}
