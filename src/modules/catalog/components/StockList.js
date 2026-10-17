"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { useAuthStore, selectIsDealer } from "@/modules/auth/auth.store";
import { useCatalogStore } from "../catalog.store";
import { EMPTY_FILTERS, filterProducts } from "../catalog.utils";
import StockFilters from "./StockFilters";
import ProductCard from "./ProductCard";

const PAGE_SIZE = 10;

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

export default function StockList({ stock, initialFilters }) {
    const [filters, setFilters] = useState({ ...EMPTY_FILTERS, ...initialFilters });
    const [currentPage, setCurrentPage] = useState(1);
    const [bestSellersOnly, setBestSellersOnly] = useState(!initialFilters.query && !initialFilters.brand && !initialFilters.category);
    const isDealer = useAuthStore(selectIsDealer);
    const dealerPrices = useCatalogStore((s) => s.dealerPrices);
    const loadDealerPrices = useCatalogStore((s) => s.loadDealerPrices);

    // Filter base products: top 5 best sellers by default
    const baseProducts = useMemo(() => {
        if (!bestSellersOnly) return stock.products || [];
        const bestSellers = (stock.products || []).filter((p) => p.isBestSeller);
        const pool = bestSellers.length >= 5 ? bestSellers : stock.products || [];
        return pool.slice(0, 5);
    }, [stock.products, bestSellersOnly]);

    // Typing stays responsive; filtering sizes runs on the deferred value.
    const deferredFilters = useDeferredValue(filters);
    const filtered = useMemo(() => filterProducts(baseProducts, deferredFilters), [baseProducts, deferredFilters]);
    const sizeCount = useMemo(() => filtered.reduce((n, p) => n + p.sizes.length, 0), [filtered]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
    const currentProducts = useMemo(() => filtered.slice(startIndex, endIndex), [filtered, startIndex, endIndex]);

    const pageNumbers = useMemo(() => getPageNumbers(safeCurrentPage, totalPages), [safeCurrentPage, totalPages]);

    useEffect(() => {
        if (isDealer) loadDealerPrices();
    }, [isDealer, loadDealerPrices]);

    const scrollToStock = () => {
        if (typeof window !== "undefined") {
            const el = document.getElementById("stock");
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    const goToPage = (p) => {
        if (p < 1 || p > totalPages || p === safeCurrentPage) return;
        setCurrentPage(p);
        scrollToStock();
    };

    const updateFilters = (next) => {
        setFilters(next);
        setCurrentPage(1);
    };

    const hasFilters = Object.entries(filters).some(([key, value]) => value !== EMPTY_FILTERS[key]);

    if (stock.unavailable) {
        return (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center" role="alert">
                <p className="text-xl font-black text-white">Stock is temporarily unavailable</p>
                <p className="mt-2 text-sm text-zinc-400">We couldn&apos;t reach the stock service. Please refresh in a minute.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <StockFilters filters={filters} onChange={updateFilters} brands={stock.brands || []} categories={stock.categories || []} />

            {/* Mode Toggle: Top 5 Best Sellers vs All Products */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setBestSellersOnly(false);
                            setCurrentPage(1);
                        }}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${!bestSellersOnly ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 ring-2 ring-orange-400/50" : "border border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                    >
                        <span>All Products ({stock.products?.length || 0})</span>
                    </button>
                </div>
            </div>

            {/* Results count & page indicators */}
            <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-zinc-400">
                        {filtered.length > 0 ? (
                            <>
                                Showing <span className="font-black text-white">{startIndex + 1}–{endIndex}</span> of{" "}
                                <span className="font-black text-white">{filtered.length}</span> {bestSellersOnly ? "best-seller products" : "products"} ·{" "}
                                <span className="font-black text-white">{sizeCount}</span> sizes
                            </>
                        ) : (
                            <span className="font-black text-white">0 products · 0 sizes</span>
                        )}
                    </p>
                    {totalPages > 1 && (
                        <p className="mt-0.5 text-xs font-medium text-zinc-500"> Page <span className="font-bold text-zinc-300">{safeCurrentPage}</span> of{" "}
                            <span className="font-bold text-zinc-300">{totalPages}</span> (10 products per page)
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={() => updateFilters(EMPTY_FILTERS)}
                            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-orange-500 hover:text-orange-400"
                        >
                            <FiX /> Clear filters
                        </button>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => goToPage(safeCurrentPage - 1)}
                                disabled={safeCurrentPage <= 1}
                                title="Previous page"
                                className="rounded-lg p-1.5 text-zinc-300 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                            >
                                <FiChevronLeft className="text-sm" />
                            </button>
                            <span className="px-2 text-zinc-400">
                                {safeCurrentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => goToPage(safeCurrentPage + 1)}
                                disabled={safeCurrentPage >= totalPages}
                                title="Next page"
                                className="rounded-lg p-1.5 text-zinc-300 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                            >
                                <FiChevronRight className="text-sm" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 10 products for the active page */}
            {currentProducts.length ? (
                <div className="space-y-4">
                    {currentProducts.map((product) => (
                        <ProductCard key={product.id} product={product} isDealer={isDealer} dealerPrices={dealerPrices} />
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
                    <p className="text-xl font-black text-white">No sizes match</p>
                    <p className="mt-2 text-sm text-zinc-400">Try another size, or message us on WhatsApp — we source sizes on request.</p>
                </div>
            )}

            {/* Bottom Pagination Controls */}
            {totalPages > 1 && (
                <nav
                    aria-label="Stock pagination"
                    className="mt-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="text-xs font-semibold text-zinc-400">
                        Showing <span className="font-bold text-white">{startIndex + 1}–{endIndex}</span> of{" "}
                        <span className="font-bold text-white">{filtered.length}</span> products
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => goToPage(safeCurrentPage - 1)}
                            disabled={safeCurrentPage <= 1}
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
                                    aria-current={p === safeCurrentPage ? "page" : undefined}
                                    className={`min-w-[38px] h-9 rounded-xl px-2.5 text-xs font-black transition-all ${p === safeCurrentPage
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
                            onClick={() => goToPage(safeCurrentPage + 1)}
                            disabled={safeCurrentPage >= totalPages}
                            className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-wider text-white transition-all hover:border-orange-500/50 hover:bg-orange-500/10 disabled:pointer-events-none disabled:opacity-30"
                            aria-label="Next page"
                        >
                            <span>Next</span>
                            <FiChevronRight className="text-sm" />
                        </button>
                    </div>

                    <div className="hidden text-right text-xs font-semibold text-zinc-400 sm:block">
                        Page <span className="font-bold text-white">{safeCurrentPage}</span> of{" "}
                        <span className="font-bold text-white">{totalPages}</span>
                    </div>
                </nav>
            )}
        </div>
    );
}
