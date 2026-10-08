"use client";

import { useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import CustomImage from "@/components/ui/CustomImage";
import StockRow from "./StockRow";
import { getCategoryPreset } from "@/lib/presets";

const chipClass = (active) =>
    `shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${active ? "border-orange-500 bg-orange-500 text-white" : "border-white/15 bg-white/5 text-zinc-300 hover:border-orange-500/60"}`;

function ProductStock({ product }) {
    const { Icon, label } = getCategoryPreset(product.categoryName);
    return (
        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition-colors hover:border-orange-500/30">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
                <div className="border-b border-white/10 md:border-b-0 md:border-r">
                    <div className="flex items-center gap-4 p-4 md:sticky md:top-28 md:flex-col md:items-start">
                    <div className="relative h-20 w-20 shrink-0 md:h-36 md:w-full">
                        <CustomImage src={product.image} alt={product.productName} fill sizes="(max-width: 768px) 80px, 190px" imageClassName="object-contain" />
                    </div>
                    <div className="space-y-1.5">
                        <span className="inline-block rounded-lg border border-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-500">{product.brandName}</span>
                        <h3 className="text-lg font-black leading-tight tracking-tight text-white">{product.productName}</h3>
                        {label && (
                            <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                <Icon className="h-3.5 w-3.5 text-orange-500" /> {label}
                            </p>
                        )}
                    </div>
                    </div>
                </div>

                <div className="px-4 pb-1 md:px-5">
                    <div className="hidden grid-cols-[1.2fr_0.7fr_0.9fr_1fr_1fr_240px] gap-4 border-b border-white/10 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 md:grid">
                        <span>Size</span>
                        <span>Position</span>
                        <span>Load · Speed</span>
                        <span>Stock</span>
                        <span>Dealer Price</span>
                        <span className="text-right">Order</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {product.sizes.map((size) => (
                            <StockRow key={size.id} product={product} size={size} />
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function StockList({ products, brands, categories, initialQuery = "", initialBrand = "" }) {
    const [query, setQuery] = useState(initialQuery);
    const [brand, setBrand] = useState(initialBrand);
    const [category, setCategory] = useState("");
    const [inStockOnly, setInStockOnly] = useState(false);

    const brandNames = useMemo(() => {
        const present = new Set(products.map((p) => p.brandName));
        return brands.map((b) => b.name).filter((n) => present.has(n));
    }, [products, brands]);

    const filtered = useMemo(() => {
        const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        return products
            .filter((p) => !brand || p.brandName === brand)
            .filter((p) => !category || p.categoryName === category)
            .map((p) => {
                const productText = `${p.productName} ${p.brandName} ${p.categoryName}`.toLowerCase();
                const sizes = p.sizes.filter((s) => {
                    if (inStockOnly && s.availability !== "in_stock") return false;
                    if (!words.length) return true;
                    const text = `${productText} ${s.size} ${s.position} ${s.spec}`.toLowerCase();
                    // Match sizes typed with or without spaces/dashes: "110/70r17", "110/70 R17".
                    const compact = text.replace(/[\s-]/g, "");
                    return words.every((w) => text.includes(w) || compact.includes(w.replace(/-/g, "")));
                });
                return { ...p, sizes };
            })
            .filter((p) => p.sizes.length);
    }, [products, brand, category, query, inStockOnly]);

    const sizeCount = filtered.reduce((n, p) => n + p.sizes.length, 0);
    const hasFilters = query || brand || category || inStockOnly;

    return (
        <div className="space-y-5">
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex flex-col gap-3 md:flex-row">
                    <label className="flex flex-1 items-center rounded-xl border border-white/15 bg-black/20 focus-within:border-orange-500">
                        <FiSearch className="ml-4 shrink-0 text-zinc-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search size (150/60 R17), brand or tyre name"
                            aria-label="Search stock"
                            className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder:text-zinc-500 outline-none"
                        />
                    </label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category" className="rounded-xl border border-white/15 bg-[#111827] px-4 py-3 text-sm font-bold text-white outline-none focus:border-orange-500">
                        <option value="">All categories</option>
                        {categories.map((c) => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <button onClick={() => setInStockOnly((v) => !v)} className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${inStockOnly ? "border-green-500 bg-green-500/15 text-green-400" : "border-white/15 text-zinc-300 hover:border-green-500/60"}`}>
                        In stock only
                    </button>
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    <button className={chipClass(!brand)} onClick={() => setBrand("")}>All Brands</button>
                    {brandNames.map((name) => (
                        <button key={name} className={chipClass(brand === name)} onClick={() => setBrand(brand === name ? "" : name)}>{name}</button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-400">
                    <span className="font-black text-white">{filtered.length}</span> products · <span className="font-black text-white">{sizeCount}</span> sizes
                </p>
                {hasFilters && (
                    <button onClick={() => { setQuery(""); setBrand(""); setCategory(""); setInStockOnly(false); }} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-orange-500 hover:text-orange-400">
                        <FiX /> Clear
                    </button>
                )}
            </div>

            {filtered.length ? (
                <div className="space-y-4">
                    {filtered.map((p) => <ProductStock key={p.identifier} product={p} />)}
                </div>
            ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
                    <p className="text-xl font-black text-white">No sizes match</p>
                    <p className="mt-2 text-sm text-zinc-400">Try another size, or WhatsApp us — we source sizes on request.</p>
                </div>
            )}
        </div>
    );
}
