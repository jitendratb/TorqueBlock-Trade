"use client";

import clsx from "clsx";

// Loading placeholders: order-style cards and list rows.

export function SkeletonCard({ count = 1, className }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }, (_, i) => (
                <div
                    key={i}
                    className={clsx(
                        "rounded-3xl border border-white/10 bg-[#141824] p-6 animate-pulse",
                        className
                    )}
                >
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="space-y-2">
                            <div className="h-3 w-28 rounded bg-white/10" />
                            <div className="h-4 w-40 rounded bg-white/20" />
                        </div>
                        <div className="h-6 w-20 rounded-full bg-white/10" />
                    </div>
                    <div className="mt-4 space-y-2.5">
                        <div className="h-4 w-3/4 rounded bg-white/10" />
                        <div className="h-3 w-1/2 rounded bg-white/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonRows({ count = 3, className }) {
    return (
        <div className={clsx("space-y-3", className)}>
            {Array.from({ length: count }, (_, i) => (
                <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                />
            ))}
        </div>
    );
}
