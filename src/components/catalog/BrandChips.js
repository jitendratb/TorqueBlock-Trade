"use client";

import { Chip } from "@/ui";
import { useStockFilters } from "@/hooks/useStockFilters";

// Brand chips under the hero search. Picking one filters the stock list below; picking it again clears it.
export default function BrandChips({ brands = [] }) {
    const [filters, setFilters] = useStockFilters();
    if (!brands.length) return null;

    return (
        <div className="mt-6 sm:mt-7">
            {/* <p className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Shop by brand</p> */}
            <div role="group" aria-label="Filter stock by brand" className="-mx-4 flex gap-2 overflow-x-auto scrollbar-hide px-4 py-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
                <Chip active={!filters.brand} onClick={() => setFilters({ brand: "" })} className="backdrop-blur-sm">
                    All Brands
                </Chip>
                {brands.map((brand) => (
                    <Chip
                        key={brand.id || brand.name}
                        active={filters.brand === brand.name}
                        onClick={() => setFilters({ brand: filters.brand === brand.name ? "" : brand.name })}
                        className="backdrop-blur-sm"
                    >
                        {brand.name}
                    </Chip>
                ))}
            </div>
        </div>
    );
}
