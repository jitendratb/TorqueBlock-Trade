"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Button from "./Button";

function getPageNumbers(currentPage, totalPages) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
        return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

/**
 * Reusable pagination control.
 * Supports `variant="simple"` (Previous / Page X of Y / Next) and `variant="full"` (numbered desktop bar + mobile compact bar).
 */
export default function Pagination({
    page,
    totalPages,
    onPageChange,
    variant = "simple",
    startIndex,
    endIndex,
    totalItems,
    itemLabel = "items",
    label = "Pagination",
}) {
    if (totalPages <= 1) return null;

    if (variant === "simple") {
        return (
            <nav aria-label={label} className="flex items-center justify-center gap-3 pt-4">
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}> Previous </Button>
                <span className="text-xs font-bold text-zinc-400"> Page {page} of {totalPages} </span>
                <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}> Next </Button>
            </nav>
        );
    }

    const pageNumbers = getPageNumbers(page, totalPages);

    return (
        <nav
            aria-label={label}
            className="mt-8 flex flex-col gap-3 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] p-3 sm:p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
        >
            {typeof totalItems === "number" && (
                <div className="text-xs font-semibold text-zinc-400 text-center sm:text-left">
                    Showing <span className="font-bold text-white">{startIndex + 1}–{endIndex}</span> of{" "}
                    <span className="font-bold text-white">{totalItems}</span> {itemLabel}
                </div>
            )}

            {/* Mobile (< sm) */}
            <div className="flex sm:hidden items-center justify-between gap-2 w-full pt-1 border-t border-white/5">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Previous page"
                >
                    <FiChevronLeft className="text-sm" />
                    <span>Prev</span>
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300">
                    <span>Page</span>
                    <span className="font-black text-orange-400">{page}</span>
                    <span className="text-zinc-500">/</span>
                    <span className="text-zinc-400 font-bold">{totalPages}</span>
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Next page"
                >
                    <span>Next</span>
                    <FiChevronRight className="text-sm" />
                </button>
            </div>

            {/* Desktop (sm:) */}
            <div className="hidden sm:flex items-center justify-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-wider text-white transition-all hover:border-orange-500/50 hover:bg-orange-500/10 disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Previous page"
                >
                    <FiChevronLeft className="text-sm" />
                    <span>Prev</span>
                </button>

                {pageNumbers.map((p, idx) =>
                    p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-xs font-bold text-zinc-500">
                            …
                        </span>
                    ) : (
                        <button
                            key={`page-${p}`}
                            type="button"
                            onClick={() => onPageChange(p)}
                            aria-current={p === page ? "page" : undefined}
                            className={`min-w-[38px] h-9 rounded-xl px-2.5 text-xs font-black transition-all ${
                                p === page
                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-400/50"
                                    : "border border-white/10 bg-white/5 text-zinc-300 hover:border-orange-500/30 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-wider text-white transition-all hover:border-orange-500/50 hover:bg-orange-500/10 disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Next page"
                >
                    <span>Next</span>
                    <FiChevronRight className="text-sm" />
                </button>
            </div>

            <div className="hidden text-right text-xs font-semibold text-zinc-400 sm:block">
                Page <span className="font-bold text-white">{page}</span> of{" "}
                <span className="font-bold text-white">{totalPages}</span>
            </div>
        </nav>
    );
}

