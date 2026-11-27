"use client";

import clsx from "clsx";

const TONES = {
    orange: {
        active: "bg-gradient-to-br from-orange-500/15 via-white/[0.04] to-transparent border-orange-500/40 shadow-orange-500/10 ring-1 ring-orange-500/30",
        icon: "bg-orange-500/15 border-orange-500/30 text-orange-400",
    },
    sky: {
        active: "bg-gradient-to-br from-sky-500/15 via-white/[0.04] to-transparent border-sky-500/40 shadow-sky-500/10 ring-1 ring-sky-500/30",
        icon: "bg-sky-500/15 border-sky-500/30 text-sky-400",
    },
    emerald: {
        active: "bg-gradient-to-br from-emerald-500/15 via-white/[0.04] to-transparent border-emerald-500/40 shadow-emerald-500/10 ring-1 ring-emerald-500/30",
        icon: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    },
    rose: {
        active: "bg-gradient-to-br from-rose-500/15 via-white/[0.04] to-transparent border-rose-500/40 shadow-rose-500/10 ring-1 ring-rose-500/30",
        icon: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    },
};

const INACTIVE_CARD =
    "bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border-white/10 hover:border-white/25 hover:bg-white/[0.05]";

export default function StatCard({
    label,
    value,
    Icon,
    tone = "orange",
    active = false,
    onClick,
    valueClassName = "text-base sm:text-2xl",
}) {
    const palette = TONES[tone] || TONES.orange;
    const classes = clsx(
        "w-full text-left relative overflow-hidden rounded-2xl border transition-all p-3 sm:p-5 flex items-center justify-between gap-2 select-none backdrop-blur-xl shadow-lg",
        onClick && "cursor-pointer",
        active ? palette.active : INACTIVE_CARD
    );

    const content = (
        <>
            <div className="relative z-10 min-w-0">
                <p className="truncate text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    {label}
                </p>
                <p className={clsx("mt-1 truncate font-black text-white leading-tight", valueClassName)}>
                    {value}
                </p>
            </div>
            {Icon && (
                <div
                    className={clsx(
                        "relative z-10 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl border shrink-0 shadow-sm",
                        palette.icon
                    )}
                >
                    <Icon className="text-base sm:text-xl" />
                </div>
            )}
        </>
    );

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={classes}>
                {content}
            </button>
        );
    }

    return <div className={classes}>{content}</div>;
}
