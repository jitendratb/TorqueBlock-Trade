// Active motorcycle tyre brands in Torque Block trade catalog
export const ACTIVE_BRANDS = [
    "Pirelli",
    "Metzeler",
    "Michelin",
    "Eurogrip",
    "CEAT",
    "Apollo",
    "MRF",
    "Maxxis",
    "Reise",
    "Vredestein",
    "Bridgestone",
    "Ralco",
    "Avon",
];

const ACTIVE_BRAND_SET = new Set(ACTIVE_BRANDS.map((b) => b.toLowerCase()));

/**
 * Returns all active trade brands, merging live stock metadata when available.
 * Guarantees that all active motorcycle tyre brands are always presented to dealers.
 */
export function getActiveBrands(stockBrands = []) {
    const list = Array.isArray(stockBrands) ? stockBrands : [];
    const stockMap = new Map();

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const name = (typeof item === "string" ? item : item?.name || "").trim();
        if (name) {
            stockMap.set(name.toLowerCase(), typeof item === "string" ? { id: name.toLowerCase(), name, logo: "" } : item);
        }
    }

    const seen = new Set();
    const result = [];

    // Always include all configured active brands
    for (let i = 0; i < ACTIVE_BRANDS.length; i++) {
        const name = ACTIVE_BRANDS[i];
        const lower = name.toLowerCase();
        seen.add(lower);
        const existing = stockMap.get(lower);
        result.push(existing || { id: lower, name, logo: "" });
    }

    // Append any other brands present in stock
    for (const [lower, item] of stockMap.entries()) {
        if (!seen.has(lower)) {
            seen.add(lower);
            result.push(item);
        }
    }

    return result;
}
