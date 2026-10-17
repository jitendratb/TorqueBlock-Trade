"use client";

import { FiSearch } from "react-icons/fi";
import Chip from "@/ui/Chip";
import { Select } from "@/ui/Field";

export default function StockFilters({ filters, onChange, brands, categories }) {
    const set = (key, value) => onChange({ ...filters, [key]: value });

    return (
        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex flex-col gap-3 md:flex-row">
                <label className="flex flex-1 items-center rounded-xl border border-white/15 bg-black/20 focus-within:border-orange-500">
                    <FiSearch className="ml-4 shrink-0 text-zinc-400" />
                    <input
                        type="search"
                        value={filters.query}
                        onChange={(e) => set("query", e.target.value)}
                        placeholder="Search size (150/60 R17), brand or tyre name"
                        aria-label="Search stock"
                        className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder:text-zinc-500 outline-none"
                    />
                </label>
                <Select
                    aria-label="Category"
                    className="md:w-56"
                    placeholder="All categories"
                    options={categories.map((c) => c.name)}
                    value={filters.category}
                    onChange={(e) => set("category", e.target.value)}
                />
                <Chip active={filters.inStockOnly} tone="green" className="!rounded-xl !py-3" onClick={() => set("inStockOnly", !filters.inStockOnly)}>
                    In stock only
                </Chip>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <Chip active={!filters.brand} onClick={() => set("brand", "")}>
                    All Brands
                </Chip>
                {brands.map((b) => (
                    <Chip key={b.id} active={filters.brand === b.name} onClick={() => set("brand", filters.brand === b.name ? "" : b.name)}>
                        {b.name}
                    </Chip>
                ))}
            </div>
        </div>
    );
}
