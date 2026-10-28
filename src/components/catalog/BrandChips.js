"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import { FiChevronLeft, FiChevronRight, FiChevronUp } from "react-icons/fi";
import { Chip } from "@/ui";
import { useStockFilters } from "@/hooks/useStockFilters";

const VISIBLE_BRANDS = 20;

export default function BrandChips({ brands = [] }) {
    const [filters, setFilters] = useStockFilters();
    const [open, setOpen] = useState(false);
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const atStart = el.scrollLeft <= 6;
        const atEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth - 6;
        setCanScrollLeft(!atStart);
        setCanScrollRight(!atEnd);
    }, []);

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", checkScroll, { passive: true });
        window.addEventListener("resize", checkScroll);
        return () => {
            el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [checkScroll, brands]);

    if (!brands.length) return null;

    const hasMore = brands.length > VISIBLE_BRANDS;
    const visible = open || !hasMore ? brands : brands.filter((brand, i) => i < VISIBLE_BRANDS || brand.name === filters.brand);

    const handleScrollRight = () => {
        const el = scrollRef.current;
        if (!el) return;
        if (canScrollRight) {
            el.scrollBy({ left: 160, behavior: "smooth" });
        } else if (hasMore && !open) {
            setOpen(true);
        }
    };

    const handleScrollLeft = () => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: -160, behavior: "smooth" });
    };

    return (
        <div className="relative">
            {/* Left Scroll Arrow on Mobile */}
            {canScrollLeft && !open && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center z-10 pl-0.5 sm:hidden">
                    <button
                        type="button"
                        onClick={handleScrollLeft}
                        aria-label="Scroll brands left"
                        className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#121622]/90 border border-white/30 text-white shadow-[0_4px_12px_rgba(0,0,0,0.6)] backdrop-blur-md active:scale-90 transition-all hover:border-orange-500 hover:text-orange-400"
                    >
                        <FiChevronLeft className="text-sm stroke-[2.5]" aria-hidden="true" />
                    </button>
                </div>
            )}

            <div
                ref={scrollRef}
                role="group"
                aria-label="Filter stock by brand"
                className={clsx(
                    "flex gap-2 py-1 scroll-smooth",
                    open ? "flex-wrap justify-center" : "overflow-x-auto scrollbar-hide px-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
                )}
            >
                <Chip active={!filters.brand} onClick={() => setFilters({ brand: "" })} className="backdrop-blur-sm shrink-0">
                    All Brands
                </Chip>
                {visible.map((brand) => (
                    <Chip
                        key={brand.id || brand.name}
                        active={filters.brand === brand.name}
                        onClick={() => setFilters({ brand: filters.brand === brand.name ? "" : brand.name })}
                        className="backdrop-blur-sm shrink-0"
                    >
                        {brand.name}
                    </Chip>
                ))}
                {open ? (
                    <Chip onClick={() => setOpen(false)} aria-expanded className="inline-flex items-center gap-1 border-orange-500/50 text-orange-400 shrink-0">
                        <FiChevronUp aria-hidden="true" /> Show less
                    </Chip>
                ) : hasMore && (
                    <Chip onClick={() => setOpen(true)} aria-expanded={false} className="inline-flex items-center gap-1 border-orange-500/50 text-orange-400 shrink-0">
                        More +{brands.length - VISIBLE_BRANDS}
                    </Chip>
                )}
            </div>

            {/* Right Scroll Arrow on Mobile - Hides when scrolled to the end */}
            {canScrollRight && !open && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center z-10 pr-0.5 sm:hidden">
                    <button
                        type="button"
                        onClick={handleScrollRight}
                        aria-label="Scroll brands right"
                        className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#121622]/90 border border-white/30 text-white shadow-[0_4px_12px_rgba(0,0,0,0.6)] backdrop-blur-md active:scale-90 transition-all hover:border-orange-500 hover:text-orange-400"
                    >
                        <FiChevronRight className="text-sm stroke-[2.5]" aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
}
