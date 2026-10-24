import { redirect } from "next/navigation";
import { connection } from "next/server";
import StockHero from "@/components/catalog/StockHero";
import StockList from "@/components/catalog/StockList";
import { getStock } from "@/services/CatalogService";
import { readFilters, stockHref, toSearchIndex } from "@/lib/catalog.utils";
import { getSettings } from "@/services/SiteService";

export default async function HomePage({ searchParams }) {
  // Older shared links put the filters on the home page (/?q=...); results live on /search now.
  const filters = readFilters(new URLSearchParams(await searchParams));
  if (filters.query || filters.brand || filters.category) redirect(stockHref(filters));

  await connection();
  const stock = await getStock();
  const settings = getSettings();

  return (
    <main className="bg-[#0B0F19]">
      <StockHero heroImage={settings.heroImage} companyName={settings.companyName} brands={stock.brands} searchIndex={toSearchIndex(stock.products)} />
      <section id="stock" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-10">
        <StockList stock={stock} />
      </section>
    </main>
  );
}
