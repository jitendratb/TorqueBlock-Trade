"use client";

import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import { useUiStore } from "@/store/uiStore";
import Button from "./Button";

const STYLES = {
    success: { Icon: FiCheckCircle, cls: "border-green-500/40 text-green-400" },
    error: { Icon: FiAlertCircle, cls: "border-red-500/40 text-red-400" },
    info: { Icon: FiInfo, cls: "border-orange-500/40 text-orange-400" },
};

export default function Toast() {
    const toast = useUiStore((s) => s.toast);
    const dismiss = useUiStore((s) => s.dismissToast);
    if (!toast) return null;
    const { Icon, cls } = STYLES[toast.type] || STYLES.info;

    return (
        <div
            key={toast.id}
            role="status"
            className={`animate-toast fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-24 z-[80] flex sm:max-w-sm items-start gap-3 rounded-2xl border bg-[#0B0F19]/95 p-4 shadow-2xl backdrop-blur ${cls}`}
        >
            <Icon className="mt-0.5 shrink-0 text-lg" />
            <p className="text-sm font-semibold text-white">{toast.text}</p>
            <Button variant="text" size="sm" iconOnly onClick={dismiss} aria-label="Dismiss" icon={<FiX />} />
        </div>
    );
}
