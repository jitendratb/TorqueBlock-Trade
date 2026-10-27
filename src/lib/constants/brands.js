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
 * Optimized helper: filters and deduplicates stock brands so only active tyre brands are shown.
 * O(N) complexity using a fast Set lookup.
 */
export function getActiveBrands(stockBrands = []) {
    const list = Array.isArray(stockBrands) ? stockBrands : [];
    const seen = new Set();
    const result = [];

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const name = (typeof item === "string" ? item : item?.name || "").trim();
        if (!name) continue;

        const lower = name.toLowerCase();
        if (ACTIVE_BRAND_SET.has(lower) && !seen.has(lower)) {
            seen.add(lower);
            result.push(typeof item === "string" ? { id: lower, name, logo: "" } : item);
        }
    }

    // Fallback: If no stock brands were supplied, use default active list
    if (!result.length) {
        return ACTIVE_BRANDS.map((name) => ({ id: name.toLowerCase(), name, logo: "" }));
    }

    return result;
}
