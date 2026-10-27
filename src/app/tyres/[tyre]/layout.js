import StockHero from "@/components/catalog/StockHero";
import { getStock } from "@/services/CatalogService";
import { toSearchIndex } from "@/lib/catalog.utils";
import { getSettings } from "@/services/SiteService";
import { getHeroImages } from "@/lib/heroImages";

// Shared by /tyres/<tyre> and /tyres/<tyre>/<size>: the home hero (search, brand chips) above the tyre.
export default async function TyreLayout({ children }) {
  const [stock, settings] = [await getStock(), getSettings()];
  return (
    <main className="bg-[#0B0F19]">
      <StockHero
        heroImages={getHeroImages(settings.heroImage)}
        companyName={settings.companyName}
        brands={stock.brands}
        searchIndex={toSearchIndex(stock.products)}
        titleAs="p"
      />
      <section id="stock" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-10">
        {children}
      </section>
    </main>
  );
}
