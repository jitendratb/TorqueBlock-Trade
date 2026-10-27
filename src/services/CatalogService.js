import { cache } from "react";
import axios from "axios";
import { baseURL } from "@/api/http";
import { getActiveBrands } from "@/lib/constants/brands";

const UNAVAILABLE = { unavailable: true, products: [], brands: [], categories: [], stats: { products: 0, sizes: 0, inStock: 0 } };

// Stock catalogue, smart search, and trade price service.
class CatalogService {
    static getStock = cache(async () => {
        try {
            const { data } = await axios.get(`${baseURL}/trade/stock`, { adapter: "fetch", fetchOptions: { next: { revalidate: 60 } } });
            const stockData = data?.data || UNAVAILABLE;
            return {
                ...stockData,
                brands: getActiveBrands(stockData.brands),
            };
        } catch (error) {
            console.warn("[catalog] stock unavailable:", error.message);
            return {
                ...UNAVAILABLE,
                brands: getActiveBrands([]),
            };
        }
    });

    // GET /trade/prices — { [sizeId]: tradePrice }, only for approved trade accounts.
    static async fetchTradePrices() {
        const { data } = await axios.get(`${baseURL}/trade/prices`);
        return data.data;
    }

    static async smartSearch(path, query, params) {
        const q = typeof query === "string" ? query.trim() : "";
        if (!q) return null;

        try {
            const res = await axios.get(`${baseURL}${path}`, {
                params: { q, ...params },
                timeout: 6000,
                silent: true,
                validateStatus: () => true,
            });
            if (res?.status >= 200 && res?.status < 300 && res?.data?.success) {
                return res.data;
            }
            return null;
        } catch {
            return null;
        }
    }

    // GET /smart-search/suggest → { suggestions: [{ type: bike|brand|product|size, text, query, path? }] }
    static async suggestCatalog(query, { limit = 8 } = {}) {
        return await CatalogService.smartSearch("/smart-search/suggest", query, { limit });
    }

    // GET /smart-search → { sections: [{ type: "products", items: [{ id, path, ... }] }], relaxation }
    static async searchCatalog(query, { limit = 50 } = {}) {
        return await CatalogService.smartSearch("/smart-search", query, { limit });
    }
}

export default CatalogService;
export const getStock = CatalogService.getStock;
export const fetchTradePrices = CatalogService.fetchTradePrices;
export const suggestCatalog = CatalogService.suggestCatalog;
export const searchCatalog = CatalogService.searchCatalog;
