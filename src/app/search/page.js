import { connection } from "next/server";
import PageHero from "@/components/site/PageHero";
import HeroSearch from "@/components/catalog/HeroSearch";
import BrandChips from "@/components/catalog/BrandChips";
import StockList from "@/components/catalog/StockList";
import { getStock } from "@/services/CatalogService";
import { readFilters, toSearchIndex } from "@/lib/catalog.utils";

export async function generateMetadata({ searchParams }) {
  const { query, brand, category } = readFilters(new URLSearchParams(await searchParams));
  const label = [brand, category, query && `"${query}"`].filter(Boolean).join(" ");
  return {
    title: label ? `${label} | Trade Search` : "Search Trade Stock | Torque Block",
    description: "Search motorcycle tyres by vehicle model, brand, pattern, or tyre size with live trade stock and wholesale pricing.",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage() {
  await connection();
  const stock = await getStock();

  return (
    <main>
      <PageHero
        eyebrow="Live Stock Search"
        title="Search Trade"
        accent="Tyres"
        description="Filter by brand, size, or pattern with real-time stock counts and verified business trade pricing."
      >
        <div className="mx-auto mt-8 max-w-3xl">
          <HeroSearch searchIndex={toSearchIndex(stock.products)} />
          <BrandChips brands={stock.brands} />
        </div>
      </PageHero>

      <div className="bg-[#0B0F19] pb-20">
        <section id="stock" className="scroll-mt-24 mx-auto max-w-7xl px-4 pt-8">
          <StockList stock={stock} />
        </section>
      </div>
    </main>
  );
}
