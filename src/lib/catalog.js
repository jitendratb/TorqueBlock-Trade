import api from "./api";
import { FALLBACK_BRANDS, FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "@/data/catalog";
import { getDealerPrice } from "./pricing";
import { getImageUrl } from "./presets";

// Server-side catalogue reads. Every call uses existing public endpoints and falls back to the
// bundled snapshot so the portal still renders if the API is down.

const STOCK_REVALIDATE = 60;
const STATIC_REVALIDATE = 300;

const PREMIUM_ORDER = ["pirelli", "michelin", "metzeler"];

// "Michelin Road 6 110/70 ZR17 M/C 54W TL Front Tyre" → "54W · TL"
function parseSpec(title = "") {
    const loadSpeed = title.match(/\b(\d{2,3}(?:\/\d{2,3})?[A-Z]{1,2})\b(?=\s+(?:TL|TT|TL\/TT|Front|Rear|Tyre|M\/C|$))/);
    const tube = title.match(/\b(TL\/TT|TL|TT)\b/);
    return [loadSpeed?.[1], tube?.[1]].filter(Boolean).join(" · ");
}

function toStockItem(product, detail) {
    const brandName = product.brand?.name || "";
    const sizes = (detail?.sizesIds || [])
        .filter((s) => s?.size)
        .map((s) => ({
            id: s._id,
            size: s.size,
            position: s.position || "",
            spec: parseSpec(s.hero?.title),
            stock: Number(s.quantity) || 0,
            availability: s.availability === "out_of_stock" || !s.quantity ? "out_of_stock" : s.availability || "in_stock",
            mrp: s.price ?? null,
            price: getDealerPrice(s.price, brandName),
        }))
        .sort((a, b) => (a.position === b.position ? a.size.localeCompare(b.size) : a.position === "Front" ? -1 : 1));

    return {
        identifier: product.identifier,
        productName: product.productName,
        brandName,
        categoryName: product.categoryId?.name || "",
        image: getImageUrl(product.productImages?.[0]) || product.hero?.heroImage || "",
        sizes,
    };
}

export async function getStockList() {
    try {
        const res = await api.get("/intent/recommended", {
            params: { isBestSeller: true, limit: 40, page: 1 },
            revalidate: STOCK_REVALIDATE,
        });
        const products = (res?.data || []).filter((p) => p?.identifier && p?.productName);
        if (!products.length) throw new Error("empty product list");

        const details = await Promise.all(
            products.map((p) =>
                api
                    .get(`/intent/${p.identifier}`, { revalidate: STOCK_REVALIDATE })
                    .then((d) => d?.data || d)
                    .catch(() => FALLBACK_PRODUCTS.find((f) => f.identifier === p.identifier) || null)
            )
        );
        return products.map((p, i) => toStockItem(p, details[i])).filter((p) => p.sizes.length);
    } catch (error) {
        console.error("[catalog] stock fallback:", error.message);
        return FALLBACK_PRODUCTS.map((p) => toStockItem(p, p)).filter((p) => p.sizes.length);
    }
}

export async function getCategories() {
    try {
        const res = await api.get("/category-v2", { revalidate: STATIC_REVALIDATE });
        return res?.categories?.length ? res.categories : FALLBACK_CATEGORIES;
    } catch (error) {
        console.error("[catalog] categories fallback:", error.message);
        return FALLBACK_CATEGORIES;
    }
}

export async function getBrands() {
    try {
        const res = await api.get("/brands", { params: { isActive: true }, revalidate: STATIC_REVALIDATE });
        const brands = res?.brands?.length ? res.brands : FALLBACK_BRANDS;
        const premium = brands
            .filter((b) => PREMIUM_ORDER.includes(b?.name?.toLowerCase()))
            .sort((a, b) => PREMIUM_ORDER.indexOf(a.name.toLowerCase()) - PREMIUM_ORDER.indexOf(b.name.toLowerCase()));
        return [...premium, ...brands.filter((b) => !PREMIUM_ORDER.includes(b?.name?.toLowerCase()))];
    } catch (error) {
        console.error("[catalog] brands fallback:", error.message);
        return FALLBACK_BRANDS;
    }
}
