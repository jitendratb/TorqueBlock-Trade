"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { create } from "zustand";
import { EMPTY_FILTERS, readFilters, scrollToStock, stockHref } from "@/lib/catalog.utils";

const useFilterStore = create((set) => ({
    filters: EMPTY_FILTERS,
    setFiltersState: (patch) =>
        set((state) => ({
            filters: { ...state.filters, ...(typeof patch === "function" ? patch(state.filters) : patch) },
        })),
}));

export function useStockFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const filters = useFilterStore((s) => s.filters);
    const setFiltersState = useFilterStore((s) => s.setFiltersState);

    // Sync from URL search params into store on mount and on browser navigation
    useEffect(() => {
        const fromUrl = readFilters(searchParams);
        setFiltersState(fromUrl);
    }, [searchParams, setFiltersState]);

    const setFilters = useCallback(
        (patch) => {
            const current = useFilterStore.getState().filters;
            const nextFilters = { ...current, ...(typeof patch === "function" ? patch(current) : patch) };

            // 1. Immediately update client state so UI re-renders instantly (0ms)
            setFiltersState(nextFilters);

            // 2. Update the browser URL without full-page reloads
            if (typeof window !== "undefined") {
                const currentPath = window.location.pathname;
                const href = stockHref(nextFilters, currentPath);
                const target = new URL(href, window.location.origin);

                if (target.pathname !== window.location.pathname) {
                    router.push(href);
                } else {
                    router.replace(href, { scroll: false });
                }
            }
            scrollToStock();
        },
        [router, setFiltersState]
    );

    return [filters, setFilters];
}

export default useStockFilters;
