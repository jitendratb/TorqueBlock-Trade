"use client";

import clsx from "clsx";

export default function FilterTabs({ tabs = [], activeTab, onChange, right, rightClassName, className, }) {
    return (
        <div
            className={clsx(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-2 sm:p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur-xl shadow-lg",
                className
            )}
        >
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto md:flex-wrap" role="tablist">
                {tabs.map(({ id, label, Icon, count }) => {
                    const isActive = activeTab === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => onChange(id)}
                            className={clsx(
                                "flex shrink-0 items-center gap-1.5 sm:gap-2 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider transition border",
                                isActive
                                    ? "bg-white/[0.12] text-white border-white/20 shadow-sm backdrop-blur-sm"
                                    : "text-zinc-400 hover:text-white hover:bg-white/[0.06] border-transparent"
                            )}
                        >
                            {Icon && <Icon className="text-xs shrink-0" />}
                            <span>{label}</span>
                            {count !== undefined && (
                                <span
                                    className={clsx(
                                        "text-[10px] px-1.5 py-0.2 rounded-full font-semibold",
                                        isActive ? "bg-white/15 text-zinc-200" : "bg-white/5 text-zinc-500"
                                    )}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {right && <div className={clsx("shrink-0", rightClassName)}>{right}</div>}
        </div>
    );
}

