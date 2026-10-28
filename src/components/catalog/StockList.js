"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiX, FiSearch } from "react-icons/fi";
import { ErrorState, EmptyState } from "@/ui";
import { useAuthStore, selectIsApproved } from "@/store/authStore";
import { useCatalogStore } from "@/store/catalogStore";
import { searchCatalog } from "@/services/CatalogService";
import { EMPTY_FILTERS, filterProducts, scrollToStock } from "@/lib/catalog.utils";
import { useStockFilters } from "@/hooks/useStockFilters";
import ProductCard from "./ProductCard";

const PAGE_SIZE = 5;

// Relaxed smart-search results ("showing other brands") are left out so they don't mix into the matches.
const toMatchedIds = (res) => {
    if (!res || res.relaxation) return null;
    const items = (res.sections || []).filter((s) => s.type === "products").flatMap((s) => s.items || []);
    return items.length ? new Set(items.map((item) => String(item.id))) : null;
};

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

// Applied filters above the results; each one can be removed on its own.
function ActiveFilters({ filters, productCount, sizeCount, onRemove, onClear }) {
    const active = [
        filters.query && { key: "query", label: `"${filters.query}"` },
        filters.brand && { key: "brand", label: filters.brand },
        filters.category && { key: "category", label: filters.category },
    ].filter(Boolean);
    if (!active.length) return null;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-zinc-300">
                <FiSearch className="text-orange-400 shrink-0" />
                <span>Showing</span>
                {active.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onRemove(key)}
                        aria-label={`Remove filter ${label}`}
                        className="inline-flex items-center gap-1 rounded-full border border-orange-500/40 bg-black/30 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:border-orange-500"
                    >
                        {label}
                        <FiX className="text-orange-400" />
                    </button>
                ))}
                <span className="text-xs text-orange-400 font-semibold">
                    ({productCount} products, {sizeCount} sizes)
                </span>
            </div>
            <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white transition-all"
            >
                <FiX className="text-sm text-orange-400" />
                <span>Clear all</span>
            </button>
        </div>
    );
}

export default function StockList({ stock }) {
    const [filters, setFilters] = useStockFilters();
    const isApproved = useAuthStore(selectIsApproved);
    const tradePrices = useCatalogStore((s) => s.tradePrices);
    const loadTradePrices = useCatalogStore((s) => s.loadTradePrices);

    const [smart, setSmart] = useState({ query: "", ids: null });
    useEffect(() => {
        const query = filters.query.trim();
        // No reset needed for an empty query: matchedIds below only uses a result for the current query.
        if (!query) return;
        let current = true;
        searchCatalog(query).then((res) => {
            if (current) setSmart({ query, ids: toMatchedIds(res) });
        });
        return () => {
            current = false;
        };
    }, [filters.query]);
    const matchedIds = smart.query === filters.query.trim() ? smart.ids : null;

    // Filtering runs on the deferred value so chip clicks and searches stay responsive.
    const deferredFilters = useDeferredValue(filters);
    const filtered = useMemo(
        () => filterProducts(stock.products || [], deferredFilters, matchedIds),
        [stock.products, deferredFilters, matchedIds]
    );
    const sizeCount = useMemo(() => filtered.reduce((n, p) => n + p.sizes.length, 0), [filtered]);

    // Back to page 1 whenever the filters change.
    const filterKey = `${filters.query}|${filters.brand}|${filters.category}`;
    const [paging, setPaging] = useState({ filterKey, page: 1 });
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(paging.filterKey === filterKey ? paging.page : 1, totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
    const currentProducts = filtered.slice(startIndex, endIndex);
    const pageNumbers = getPageNumbers(currentPage, totalPages);

    useEffect(() => {
        if (isApproved) loadTradePrices();
    }, [isApproved, loadTradePrices]);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        setPaging({ filterKey, page });
        scrollToStock();
    };

    if (stock.unavailable) {
        return (
            <ErrorState
                title="Stock Temporarily Unavailable"
                message="We couldn't reach the stock inventory service. Please refresh in a minute."
                onRetry={() => window.location.reload()}
                retryText="Refresh Stock"
            />
        );
    }

    return (
        <div className="space-y-6">
            <ActiveFilters
                filters={filters}
                productCount={filtered.length}
                sizeCount={sizeCount}
                onRemove={(key) => setFilters({ [key]: "" })}
                onClear={() => setFilters(EMPTY_FILTERS)}
            />

            {/* Products for the active page */}
            {currentProducts.length ? (
                <div className="space-y-4">
                    {currentProducts.map((product) => (
                        <ProductCard key={product.id} product={product} isApproved={isApproved} tradePrices={tradePrices} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No Sizes Match Your Filters"
                    description={
                        filters.query
                            ? `No tyres or sizes currently available matching "${filters.query}". Try searching another size, brand or bike model.`
                            : "Try another brand or size, or message us on WhatsApp — we source sizes on request."
                    }
                    actionText="Clear Filters"
                    onAction={() => setFilters(EMPTY_FILTERS)}
                />
            )}

            {/* Bottom Pagination Controls */}
            {totalPages > 1 && (
                <nav
                    aria-label="Stock pagination"
                    className="mt-8 flex flex-col gap-3 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] p-3 sm:p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="text-xs font-semibold text-zinc-400 text-center sm:text-left">
                        Showing <span className="font-bold text-white">{startIndex + 1}–{endIndex}</span> of{" "}
                        <span className="font-bold text-white">{filtered.length}</span> products
                    </div>

                    {/* Mobile Pagination View (< sm) - Clean, Compact, No Wrapping */}
                    <div className="flex sm:hidden items-center justify-between gap-2 w-full pt-1 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                            aria-label="Previous page"
                        >
                            <FiChevronLeft className="text-sm" />
                            <span>Prev</span>
                        </button>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300">
                            <span>Page</span>
                            <span className="font-black text-orange-400">{currentPage}</span>
                            <span className="text-zinc-500">/</span>
                            <span className="text-zinc-400 font-bold">{totalPages}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                            aria-label="Next page"
                        >
                            <span>Next</span>
                            <FiChevronRight className="text-sm" />
                        </button>
                    </div>

                    {/* Desktop Pagination View (sm:) - Full Page Buttons */}
                    <div className="hidden sm:flex items-center justify-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage <= 1}
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
                                    onClick={() => goToPage(p)}
                                    aria-current={p === currentPage ? "page" : undefined}
                                    className={`min-w-[38px] h-9 rounded-xl px-2.5 text-xs font-black transition-all ${p === currentPage
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
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-wider text-white transition-all hover:border-orange-500/50 hover:bg-orange-500/10 disabled:pointer-events-none disabled:opacity-30"
                            aria-label="Next page"
                        >
                            <span>Next</span>
                            <FiChevronRight className="text-sm" />
                        </button>
                    </div>

                    <div className="hidden text-right text-xs font-semibold text-zinc-400 sm:block">
                        Page <span className="font-bold text-white">{currentPage}</span> of{" "}
                        <span className="font-bold text-white">{totalPages}</span>
                    </div>
                </nav>
            )}
        </div>
    );
}
