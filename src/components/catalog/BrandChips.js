"use client";

import { useState } from "react";
import clsx from "clsx";
import { FiChevronRight, FiChevronUp } from "react-icons/fi";
import { Chip } from "@/ui";
import { useStockFilters } from "@/hooks/useStockFilters";

const VISIBLE_BRANDS = 20;

export default function BrandChips({ brands = [] }) {
    const [filters, setFilters] = useStockFilters();
    const [open, setOpen] = useState(false);
    if (!brands.length) return null;

    const hasMore = brands.length > VISIBLE_BRANDS;
    const visible = open || !hasMore ? brands : brands.filter((brand, i) => i < VISIBLE_BRANDS || brand.name === filters.brand);

    return (
        <div className="relative">
            <div
                role="group"
                aria-label="Filter stock by brand"
                className={clsx(
                    "flex gap-2 py-1",
                    open ? "flex-wrap justify-center" : "overflow-x-auto scrollbar-hide pr-12 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pr-0"
                )}
            >
                <Chip active={!filters.brand} onClick={() => setFilters({ brand: "" })} className="backdrop-blur-sm">
                    All Brands
                </Chip>
                {visible.map((brand) => (
                    <Chip
                        key={brand.id || brand.name}
                        active={filters.brand === brand.name}
                        onClick={() => setFilters({ brand: filters.brand === brand.name ? "" : brand.name })}
                        className="backdrop-blur-sm"
                    >
                        {brand.name}
                    </Chip>
                ))}
                {open ? (
                    <Chip onClick={() => setOpen(false)} aria-expanded className="inline-flex items-center gap-1 border-orange-500/50 text-orange-400">
                        <FiChevronUp aria-hidden="true" /> Show less
                    </Chip>
                ) : hasMore && (
                    <Chip onClick={() => setOpen(true)} aria-expanded={false} className="inline-flex items-center gap-1 border-orange-500/50 text-orange-400 shrink-0">
                        More +{brands.length - VISIBLE_BRANDS}
                    </Chip>
                )}
            </div>

            {!open && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label="Show all brands"
                    aria-expanded={false}
                    className="absolute inset-y-0 right-0 flex w-14 items-center justify-end bg-gradient-to-l from-[#0b0d12] via-[#0b0d12]/90 to-transparent sm:hidden"
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-md shadow-orange-500/30">
                        <FiChevronRight aria-hidden="true" />
                    </span>
                </button>
            )}
        </div>
    );
}
