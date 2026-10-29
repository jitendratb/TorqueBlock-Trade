"use client";

import { useState } from "react";
import clsx from "clsx";
import { FiAlertTriangle, FiRefreshCw, FiXCircle } from "react-icons/fi";
import Button from "./Button";

/**
 * Standardized Error UI across TorqueBlock Trade.
 * Automatically parses Error/ApiError objects or strings,
 * provides retry logic with integrated spinner, and supports compact inline & full card views.
 */
export default function ErrorState({
    title = "Something went wrong",
    message,
    error,
    onRetry,
    retryText = "Try Again",
    action,
    compact = false,
    tone = "danger",
    className,
}) {
    const [retrying, setRetrying] = useState(false);

    // Extract cleanest user-facing error message
    const resolvedMessage =
        (typeof error === "string" ? error : error?.message) ||
        message ||
        "An unexpected error occurred. Please try again.";

    const handleRetry = async () => {
        if (!onRetry || retrying) return;
        setRetrying(true);
        try {
            await onRetry();
        } finally {
            setRetrying(false);
        }
    };

    const tones = {
        danger: {
            border: "border-rose-500/30",
            bg: "bg-rose-500/10",
            text: "text-rose-300",
            titleText: "text-rose-400",
            iconBg: "bg-rose-500/20 text-rose-400 border-rose-500/30",
            Icon: FiXCircle,
        },
        warning: {
            border: "border-amber-500/30",
            bg: "bg-amber-500/10",
            text: "text-amber-300",
            titleText: "text-amber-400",
            iconBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
            Icon: FiAlertTriangle,
        },
    };

    const activeTone = tones[tone] || tones.danger;
    const { Icon } = activeTone;

    // Compact layout for forms, drawers, and inline banners
    if (compact) {
        return (
            <div
                role="alert"
                className={clsx(
                    "flex items-start gap-3 rounded-2xl border p-4 text-xs",
                    activeTone.border,
                    activeTone.bg,
                    activeTone.text,
                    className
                )}
            >
                <Icon className="mt-0.5 shrink-0 text-base" />
                <div className="flex-1 space-y-1">
                    {title && <p className={clsx("font-black tracking-wide", activeTone.titleText)}>{title}</p>}
                    <p className="leading-relaxed">{resolvedMessage}</p>
                </div>
                {onRetry && (
                    <button
                        type="button"
                        onClick={handleRetry}
                        disabled={retrying}
                        className="shrink-0 flex items-center gap-1 font-bold underline hover:text-white transition disabled:opacity-50"
                    >
                        <FiRefreshCw className={clsx("text-xs", retrying && "animate-spin")} />
                        {retrying ? "Retrying..." : retryText}
                    </button>
                )}
            </div>
        );
    }

    // Full card layout for pages and full sections
    return (
        <div
            role="alert"
            className={clsx(
                "rounded-3xl border border-white/10 bg-[#141824] p-8 text-center shadow-xl shadow-black/30",
                className
            )}
        >
            <div
                className={clsx(
                    "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl",
                    activeTone.iconBg
                )}
            >
                <Icon />
            </div>

            <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-zinc-400 leading-relaxed">
                {resolvedMessage}
            </p>

            {(onRetry || action) && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {onRetry && (
                        <Button
                            variant="primary"
                            size="md"
                            loading={retrying}
                            onClick={handleRetry}
                            icon={<FiRefreshCw className="text-xs" />}
                        >
                            {retryText}
                        </Button>
                    )}
                    {action}
                </div>
            )}
        </div>
    );
}
