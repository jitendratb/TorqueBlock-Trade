import { notFound } from "next/navigation";
import ProductDetail from "@/components/catalog/ProductDetail";
import { getStock } from "@/services/CatalogService";
import { findProduct, findSize, tyreHref } from "@/lib/catalog.utils";
import { getSettings } from "@/services/SiteService";

const loadSize = async (params) => {
  const { tyre, size: slug } = await params;
  const stock = await getStock();
  if (stock.unavailable) throw new Error("Trade stock is temporarily unavailable.");
  const product = findProduct(stock.products, tyre);
  const size = findSize(product, decodeURIComponent(slug).toLowerCase());
  return product && size ? { product, size } : null;
};

export async function generateMetadata({ params }) {
  const found = await loadSize(params);
  if (!found) return { title: "Tyre Not Found" };

  const { product, size } = found;
  const url = `${getSettings().siteUrl}${tyreHref(product, size)}`;
  const title = `${product.name} ${size.size} ${size.position || ""} Tyre Trade Price`.replace(/\s+/g, " ");
  const description = `${product.name} ${size.size}${size.spec ? ` (${size.spec})` : ""}: live stock and business price for trade customers.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", images: product.image ? [product.image] : [] },
  };
}

export default async function TyreSizePage({ params }) {
  const found = await loadSize(params);
  if (!found) notFound();
  return <ProductDetail product={found.product} size={found.size} />;
}
