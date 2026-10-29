"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { ShareButtons } from "@/ui";
import { useAuthStore, selectIsApproved } from "@/store/authStore";
import { useCatalogStore } from "@/store/catalogStore";
import { tyreHref } from "@/lib/catalog.utils";
import ProductCard from "./ProductCard";

// /tyres/<tyre> shows every trade size; /tyres/<tyre>/<size> shows just that size.
export default function ProductDetail({ product, size = null }) {
    const isApproved = useAuthStore(selectIsApproved);
    const tradePrices = useCatalogStore((s) => s.tradePrices);
    const loadTradePrices = useCatalogStore((s) => s.loadTradePrices);

    useEffect(() => {
        if (isApproved) loadTradePrices();
    }, [isApproved, loadTradePrices]);

    const modelHref = tyreHref(product);
    const path = tyreHref(product, size);
    const title = size ? `${product.name} ${size.size}` : product.name;
    const shown = size ? { ...product, sizes: [size] } : product;

    return (
        <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-zinc-400">
                    <Link href="/" className="hover:text-orange-400 transition-colors">Stock</Link>
                    <FiChevronRight aria-hidden="true" />
                    {size ? (
                        <>
                            <Link href={modelHref} className="hover:text-orange-400 transition-colors">{product.name}</Link>
                            <FiChevronRight aria-hidden="true" />
                            <span className="text-white" aria-current="page">{size.size}</span>
                        </>
                    ) : (
                        <span className="text-white" aria-current="page">{product.name}</span>
                    )}
                </nav>
                <ShareButtons path={path} title={title} text={`${title} – trade stock & business prices on Torque Block Trade`} />
            </div>

            <ProductCard product={shown} isApproved={isApproved} tradePrices={tradePrices} titleAs="h1" />

            {size && product.sizes.length > 1 && (
                <div className="mt-4 text-center">
                    <Link href={modelHref} className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors">
                        View all {product.sizes.length} sizes of {product.name}
                    </Link>
                </div>
            )}
        </div>
    );
}
