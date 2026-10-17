import { cache } from "react";
import { http } from "@/api/http";

const UNAVAILABLE = { unavailable: true, products: [], brands: [], categories: [], stats: { products: 0, sizes: 0, inStock: 0 } };

// GET /trade/stock — every active size grouped by product, with live stock and selling price.
// Cached by Next.js for 60s (the payload is ~150 KB, well under the fetch-cache limit).
export const getStock = cache(async () => {
    try {
        const res = await http.get("/trade/stock", { revalidate: 60 });
        return res.data;
    } catch (error) {
        console.warn("[catalog] stock unavailable:", error.message);
        return UNAVAILABLE;
    }
});

// GET /trade/prices — { [sizeId]: dealerPrice }, only for approved dealers.
export const fetchDealerPrices = () => http.get("/trade/prices", { auth: true }).then((res) => res.data);
