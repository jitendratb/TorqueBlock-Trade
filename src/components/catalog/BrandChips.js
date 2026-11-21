"use client";

import { Chip, HorizontalScroller } from "@/components/ui";
import { useStockFilters } from "@/hooks/useStockFilters";

// One-row brand filter. "All Brands" is first and selected by default; brands come from the backend.
export default function BrandChips({ brands = [] }) {
    const [filters, setFilters] = useStockFilters();
    if (!brands.length) return null;

    const select = (name) => setFilters({ brand: filters.brand === name ? "" : name });

    return (
        <HorizontalScroller label="Filter stock by brand" trackClassName="lg:justify-center-safe">
            <Chip active={!filters.brand} onClick={() => setFilters({ brand: "" })} className="backdrop-blur-sm">
                All Brands
            </Chip>
            {brands.map((brand) => (
                <Chip
                    key={brand.id || brand.name}
                    active={filters.brand === brand.name}
                    onClick={() => select(brand.name)}
                    className="backdrop-blur-sm"
                >
                    {brand.name}
                </Chip>
            ))}
        </HorizontalScroller>
    );
}
