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
    className = "max-w-sm rounded-3xl p-6"
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
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={label}
        >
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close modal"
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
            />

            {/* Modal Content Box */}
            <div
                className={clsx(
                    "animate-fade-in-up relative w-full max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain border border-white/10 bg-[#0B0F19] text-white shadow-2xl",
                    className
                )}
            >
                <CloseButton
                    onClick={onClose}
                    className="absolute right-4 top-4 h-9 w-9"
                    ariaLabel="Close modal"
                />
                {children}
            </div>
        </div>
    );
}
