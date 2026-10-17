"use client";

import { useEffect } from "react";
import clsx from "clsx";
import { FiX } from "react-icons/fi";

export function CloseButton({ onClick, className }) {
    return (
        <button type="button" onClick={onClick} aria-label="Close" className={clsx("flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10", className)}>
            <FiX className="text-lg" />
        </button>
    );
}

function useOverlay(open, onClose) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);
}

// Centred dialog used by login and billing details.
export function Modal({ open, onClose, label, children, className }) {
    useOverlay(open, onClose);
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={label}>
            <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className={clsx("animate-fade-in-up relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0B0F19] p-6 text-white shadow-2xl", className)}>
                <CloseButton onClick={onClose} className="absolute right-4 top-4 h-9 w-9" />
                {children}
            </div>
        </div>
    );
}

// Right-side panel used by the menu and the order list.
export function Drawer({ open, onClose, label, header, children, className }) {
    useOverlay(open, onClose);
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={label}>
            <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <aside className={clsx("animate-drawer-in absolute right-0 top-0 flex h-full w-full flex-col border-l border-white/10 bg-[#10141D] text-white shadow-2xl overflow-hidden", className)}>
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    {header}
                    <CloseButton onClick={onClose} />
                </div>
                {children}
            </aside>
        </div>
    );
}
