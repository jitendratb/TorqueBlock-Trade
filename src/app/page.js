import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { StockHero, StockList } from "@/components/catalog";
import { getSettings } from "@/constants/site";
import { readFilters, stockHref, toSearchIndex } from "@/lib/catalog.utils";
import { getHeroImages } from "@/lib/heroImages";
import { getStock } from "@/services/CatalogService";

export default async function HomePage({ searchParams }) {
    const filters = readFilters(new URLSearchParams(await searchParams));
    if (filters.query || filters.brand || filters.category) redirect(stockHref(filters));

    await connection();
    const stock = await getStock();
    const settings = getSettings();

    return (
        <main className="bg-[#0B0F19]">
            <StockHero
                heroImages={getHeroImages()}
                companyName={settings.companyName}
                brands={stock.brands}
                searchIndex={toSearchIndex(stock.products)}
            />
            <section id="stock" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <Suspense fallback={<div className="min-h-[400px]" />}>
                    <StockList stock={stock} />
                </Suspense>
            </section>
        </main>
    );
}
