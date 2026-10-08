import DealerHero from "@/components/home/DealerHero";
import StockList from "@/components/trade/StockList";
import { getBrands, getCategories, getStockList } from "@/lib/catalog";

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const [products, categories, brands] = await Promise.all([getStockList(), getCategories(), getBrands()]);

  const sizes = products.flatMap((p) => p.sizes);
  const stats = [
    { value: products.length, label: "Products" },
    { value: sizes.length, label: "Sizes" },
    { value: sizes.filter((s) => s.availability === "in_stock").length, label: "Sizes in stock" },
  ];

  return (
    <main className="bg-[#0B0F19]">
      <DealerHero stats={stats} />
      <section id="stock" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-10">
        <StockList
          key={`${params?.q || ""}|${params?.brand || ""}`}
          products={products}
          brands={brands}
          categories={categories}
          initialQuery={params?.q || ""}
          initialBrand={params?.brand || ""}
        />
      </section>
    </main>
  );
}
