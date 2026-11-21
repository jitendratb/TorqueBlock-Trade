"use client";

import { Suspense, useDeferredValue, useEffect, useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { Button, Chip, EmptyState, ErrorState, Pagination } from "@/components/ui";
import { useStockFilters } from "@/hooks/useStockFilters";
import { EMPTY_FILTERS, filterProducts, scrollToStock } from "@/lib/catalog.utils";
import { searchCatalog } from "@/services/CatalogService";
import { useAuthStore, selectIsApproved } from "@/store/authStore";
import { useCatalogStore } from "@/store/catalogStore";
import ProductCard from "./ProductCard";

const PAGE_SIZE = 5;

const toMatchedIds = (res) => {
    if (!res || res.relaxation) return null;
    const items = (res.sections || [])
        .filter((s) => s.type === "products")
        .flatMap((s) => s.items || []);
    return items.length ? new Set(items.map((item) => String(item.id))) : null;
};

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
                    <Chip key={key} removable onClick={() => onRemove(key)} aria-label={`Remove filter ${label}`}>
                        {label}
                    </Chip>
                ))}
                <span className="text-xs text-orange-400 font-semibold">
                    ({productCount} products, {sizeCount} sizes)
                </span>
            </div>
            <Button variant="subtle" size="sm" uppercase={false} onClick={onClear} icon={<FiX className="text-sm text-orange-400" />}>
                Clear all
            </Button>
        </div>
    );
}

function StockListContent({ stock }) {
    const [filters, setFilters] = useStockFilters();
    const isApproved = useAuthStore(selectIsApproved);
    const tradePrices = useCatalogStore((s) => s.tradePrices);
    const loadTradePrices = useCatalogStore((s) => s.loadTradePrices);

    const [smart, setSmart] = useState({ query: "", ids: null });
    useEffect(() => {
        const query = filters.query.trim();
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

    const deferredFilters = useDeferredValue(filters);
    const filtered = useMemo(
        () => filterProducts(stock.products || [], deferredFilters, matchedIds),
        [stock.products, deferredFilters, matchedIds]
    );
    const sizeCount = useMemo(() => filtered.reduce((n, p) => n + p.sizes.length, 0), [filtered]);

    const filterKey = `${filters.query}|${filters.brand}|${filters.category}`;
    const [paging, setPaging] = useState({ filterKey, page: 1 });
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(paging.filterKey === filterKey ? paging.page : 1, totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
    const currentProducts = filtered.slice(startIndex, endIndex);

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

            {currentProducts.length ? (
                <div className="space-y-4">
                    {currentProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            isApproved={isApproved}
                            tradePrices={tradePrices}
                        />
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

            <Pagination
                variant="full"
                page={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filtered.length}
                itemLabel="products"
                label="Stock pagination"
            />
        </div>
    );
}

export default function StockList({ stock }) {
    return (
        <Suspense
            fallback={
                <div className="min-h-[400px] flex items-center justify-center text-zinc-500 text-sm">
                    Loading stock catalogue…
                </div>
            }
        >
            <StockListContent stock={stock} />
        </Suspense>
    );
}
