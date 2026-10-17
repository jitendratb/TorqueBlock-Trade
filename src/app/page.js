import StockHero from "@/modules/catalog/components/StockHero";
import StockList from "@/modules/catalog/components/StockList";
import { getStock } from "@/modules/catalog/catalog.api";
import { getSettings } from "@/modules/site/site.api";

export default async function HomePage({ searchParams }) {
  const [params, stock, settings] = await Promise.all([searchParams, getStock(), getSettings()]);
  const initialFilters = { query: params?.q || "", brand: params?.brand || "", category: params?.category || "" };

  return (
    <main className="bg-[#0B0F19]">
      <StockHero heroImage={settings.heroImage} companyName={settings.companyName} stats={stock.stats} />
      <section id="stock" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-10">
        <StockList key={`${initialFilters.query}|${initialFilters.brand}|${initialFilters.category}`} stock={stock} initialFilters={initialFilters} />
      </section>
    </main>
  );
}
