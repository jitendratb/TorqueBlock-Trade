import { notFound } from "next/navigation";
import ProductDetail from "@/components/catalog/ProductDetail";
import { getStock } from "@/services/CatalogService";
import { findProduct, tyreHref } from "@/lib/catalog.utils";
import { getSettings } from "@/services/SiteService";

const loadProduct = async (params) => {
  const { tyre } = await params;
  const stock = await getStock();
  if (stock.unavailable) throw new Error("Trade stock is temporarily unavailable.");
  return findProduct(stock.products, tyre);
};

export async function generateMetadata({ params }) {
  const product = await loadProduct(params);
  if (!product) return { title: "Tyre Not Found" };

  const url = `${getSettings().siteUrl}${tyreHref(product)}`;
  const title = `${product.name} Trade Price & Stock`;
  const description = `${product.name} by ${product.brand?.name || "Torque Block"}: ${product.sizes.length} sizes with live stock and business prices for trade customers.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", images: product.image ? [product.image] : [] },
  };
}

export default async function TyrePage({ params }) {
  const product = await loadProduct(params);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
