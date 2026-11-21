"use client";

import clsx from "clsx";
import Button from "./Button";

/**
 * Reusable inline destructive action confirmation bar.
 */
export default function ConfirmInline({
    prompt,
    confirmText = "Yes, Remove",
    busyText = "Removing…",
    cancelText = "Cancel",
    busy = false,
    onConfirm,
    onCancel,
    className,
}) {
    return (
        <div
            className={clsx(
                "flex flex-wrap items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300",
                className
            )}
        >
            <span className="font-bold text-red-200">{prompt}</span>
            <Button variant="danger" size="xs" uppercase={false} disabled={busy} onClick={onConfirm}>
                {busy ? busyText : confirmText}
            </Button>
            <Button variant="text" size="xs" uppercase={false} disabled={busy} onClick={onCancel} className="px-2">
                {cancelText}
            </Button>
        </div>
    );
}

