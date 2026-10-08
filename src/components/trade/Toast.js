"use client";

import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import { useTrade } from "@/context/TradeContext";

const STYLES = {
    success: { Icon: FiCheckCircle, cls: "border-green-500/40 text-green-400" },
    error: { Icon: FiAlertCircle, cls: "border-red-500/40 text-red-400" },
    info: { Icon: FiInfo, cls: "border-orange-500/40 text-orange-400" },
};

export default function Toast() {
    const { toast, setToast } = useTrade();
    if (!toast) return null;
    const { Icon, cls } = STYLES[toast.type] || STYLES.info;

    return (
        <div role="status" className={`animate-toast-slide-in fixed bottom-4 right-4 z-[80] flex max-w-sm items-start gap-3 rounded-2xl border bg-[#0B0F19]/95 p-4 shadow-2xl backdrop-blur ${cls}`}>
            <Icon className="mt-0.5 shrink-0 text-lg" />
            <p className="text-sm font-semibold text-white">{toast.text}</p>
            <button onClick={() => setToast(null)} aria-label="Dismiss" className="text-zinc-500 hover:text-white">
                <FiX />
            </button>
        </div>
    );
}
