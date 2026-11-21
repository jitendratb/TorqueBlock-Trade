import { cache } from "react";
import { api, apiClient } from "@/api";

const UNAVAILABLE = {
    unavailable: true,
    products: [],
    brands: [],
    categories: [],
    stats: { products: 0, sizes: 0, inStock: 0 },
};

const FAMILY_CACHE_TTL_MS = 5 * 60 * 1000;
const FAMILY_CACHE_MAX = 200;
const FAMILY_CONCURRENCY = 2;
const familyCache = new Map();
const familyInflight = new Map();
const familyQueue = [];
let familyActive = 0;
const isBrowser = () => typeof window !== "undefined";

// /intent/:identifier is slow; firing one per card at once made requests queue in the browser and hit the timeout.
function queueFamilyRequest(task) {
    return new Promise((resolve) => {
        const run = () => {
            familyActive += 1;
            task()
                .then(resolve)
                .finally(() => {
                    familyActive -= 1;
                    familyQueue.shift()?.();
                });
        };
        if (familyActive < FAMILY_CONCURRENCY) run();
        else familyQueue.push(run);
    });
}

// Optional, non-critical data (product family, smart search): any failure resolves to null instead of throwing.
// validateStatus keeps 4xx/5xx out of the auth interceptor, so these calls can never log the user out.
async function optionalGet(url, config) {
    try {
        const res = await apiClient.get(url, { silent: true, validateStatus: () => true, ...config });
        return res.status >= 200 && res.status < 300 && res.data?.success ? res.data : null;
    } catch {
        return null;
    }
}

// Stock catalogue, smart search and trade prices.
class CatalogService {
    // Server-rendered stock, revalidated every 60s. Never throws: the page renders an "unavailable" state.
    static getStock = cache(async () => {
        try {
            const body = await api.get("/trade/stock", {
                adapter: "fetch",
                fetchOptions: { next: { revalidate: 60 } },
                silent: true,
            });
            const stock = body?.data || UNAVAILABLE;
            return { ...stock, brands: Array.isArray(stock.brands) ? stock.brands : [] };
        } catch (error) {
            console.warn("[catalog] stock unavailable:", error.message);
            return UNAVAILABLE;
        }
    });

    static fetchTradePrices = async () => (await api.get("/trade/prices")).data;

    // Family details for a tyre page, cached in the browser and de-duplicated while in flight.
    static fetchProductFamily(identifier) {
        if (!identifier) return Promise.resolve(null);

        if (isBrowser()) {
            const cached = familyCache.get(identifier);
            if (cached && Date.now() - cached.ts < FAMILY_CACHE_TTL_MS) return Promise.resolve(cached.data);
            if (familyInflight.has(identifier)) return familyInflight.get(identifier);
        }

        const fetchFamily = () => optionalGet(`/intent/${encodeURIComponent(identifier)}`, { timeout: 15000 });
        const request = (isBrowser() ? queueFamilyRequest(fetchFamily) : fetchFamily())
            .then((body) => {
                const family = body ? body.intentProductData || body.data || null : null;
                if (isBrowser() && family) {
                    if (familyCache.size >= FAMILY_CACHE_MAX) familyCache.delete(familyCache.keys().next().value);
                    familyCache.set(identifier, { data: family, ts: Date.now() });
                }
                return family;
            })
            .finally(() => familyInflight.delete(identifier));

        if (isBrowser()) familyInflight.set(identifier, request);
        return request;
    }

    static smartSearch(path, query, params) {
        const q = typeof query === "string" ? query.trim() : "";
        if (!q) return Promise.resolve(null);
        return optionalGet(path, { params: { q, ...params }, timeout: 6000 });
    }

    static suggestCatalog = (query, { limit = 8 } = {}) =>
        CatalogService.smartSearch("/smart-search/suggest", query, { limit });

    static searchCatalog = (query, { limit = 50 } = {}) =>
        CatalogService.smartSearch("/smart-search", query, { limit });
}

export default CatalogService;
export const { getStock, fetchTradePrices, suggestCatalog, searchCatalog } = CatalogService;
export const fetchProductFamily = (identifier) => CatalogService.fetchProductFamily(identifier);
