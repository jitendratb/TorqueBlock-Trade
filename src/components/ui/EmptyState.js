"use client";

import clsx from "clsx";
import { FiPackage } from "react-icons/fi";
import Button from "./Button";

/**
 * Standardized Empty State across TorqueBlock Trade.
 * Used for empty tables, zero search results, no orders, or empty cart/drawer.
 */
export default function EmptyState({
    icon,
    title = "No data found",
    description,
    action,
    actionText,
    onAction,
    href,
    secondaryAction,
    compact = false,
    className,
}) {
    return (
        <div
            className={clsx(
                "rounded-3xl border border-white/10 bg-[#141824] text-center shadow-lg shadow-black/20",
                compact ? "p-6" : "px-6 py-14 md:py-16",
                className
            )}
        >
            <div
                className={clsx(
                    "mx-auto flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400",
                    compact ? "h-12 w-12 text-xl" : "h-14 w-14 text-2xl"
                )}
            >
                {icon || <FiPackage />}
            </div>

            <h3
                className={clsx(
                    "font-black text-white",
                    compact ? "mt-3 text-base" : "mt-4 text-lg"
                )}
            >
                {title}
            </h3>

            {description && (
                <p
                    className={clsx(
                        "mx-auto mt-1 max-w-md text-zinc-400 leading-relaxed",
                        compact ? "text-[11px]" : "text-xs"
                    )}
                >
                    {description}
                </p>
            )}

            {(action || actionText || secondaryAction) && (
                <div
                    className={clsx(
                        "flex flex-wrap items-center justify-center gap-3",
                        compact ? "mt-4" : "mt-6"
                    )}
                >
                    {secondaryAction}

                    {action ? (
                        action
                    ) : actionText ? (
                        <Button
                            href={href}
                            onClick={onAction}
                            size={compact ? "sm" : "md"}
                        >
                            {actionText}
                        </Button>
                    ) : null}
                </div>
            )}
        </div>
    );
}
