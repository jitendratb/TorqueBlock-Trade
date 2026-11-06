const FILTER_PARAMS = { query: "query", brand: "brand", category: "category" };

export const EMPTY_FILTERS = { query: "", brand: "", category: "" };

export const readFilters = (searchParams) => {
    const get = (key) => (typeof searchParams?.get === "function" ? searchParams.get(key) : searchParams?.[key]);
    return {
        query: String(get("query") || get("q") || get("search") || "").trim(),
        brand: String(get("brand") || "").trim(),
        category: String(get("category") || "").trim(),
    };
};

export const stockHref = (filters = {}, currentPath = "/search") => {
    const params = new URLSearchParams();
    const query = String(filters.query ?? "").trim();
    const brand = String(filters.brand ?? "").trim();
    const category = String(filters.category ?? "").trim();

    if (query) params.set("query", query);
    if (brand) params.set("brand", brand);
    if (category) params.set("category", category);

    const qs = params.toString();
    if (qs) return `/search?${qs}`;
    return currentPath === "/" ? "/#stock" : "/search";
};

export const scrollToStock = () => document.getElementById("stock")?.scrollIntoView({ behavior: "smooth", block: "start" });

// Same slugs as www.torqueblock.com (backend services/search/normalizer.js sizeSlug):
// /tyres/ceat-sportrad and /tyres/ceat-sportrad/110-70-zr17.
export const sizeSlug = (size) => String(size || "").toLowerCase().replace(/[\s/]/g, "-");

export const tyreHref = (product, size) => {
    if (!product?.identifier) return null;
    const base = `/tyres/${product.identifier}`;
    return size?.size ? `${base}/${sizeSlug(size.size)}` : base;
};

export const findProduct = (products = [], identifier) => products.find((p) => p.identifier === identifier) || null;

export const findSize = (product, slug) => product?.sizes.find((s) => sizeSlug(s.size) === slug) || null;

// Sizes typed with or without spaces/dashes match: "110/70r17", "110/70 R17", "90/90-21".
const compact = (text) => text.replace(/[\s-]/g, "");

// matchedIds: size ids the smart search returned for the query (bike models, typos, size formats);
// a size shows when it matches the typed words or the smart search picked it.
export function filterProducts(products, { query, brand, category }, matchedIds = null) {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return products.reduce((result, product) => {
        if (brand && product.brand?.name !== brand) return result;
        if (category && product.category?.name !== category) return result;

        const productText = `${product.name} ${product.brand?.name || ""} ${product.category?.name || ""}`.toLowerCase();
        const sizes = words.length
            ? product.sizes.filter((size) => {
                if (matchedIds?.has(size.id)) return true;
                const text = `${productText} ${size.size} ${size.position} ${size.spec}`.toLowerCase();
                return words.every((w) => text.includes(w) || compact(text).includes(compact(w)));
            })
            : product.sizes;

        if (sizes.length) result.push(sizes.length === product.sizes.length ? product : { ...product, sizes });
        return result;
    }, []);
}

// The fields search needs, so the hero search can match tyres without the whole stock payload.
export const toSearchIndex = (products = []) =>
    products.map((p) => ({
        id: p.id,
        identifier: p.identifier,
        name: p.name,
        brand: p.brand ? { name: p.brand.name } : null,
        category: p.category ? { name: p.category.name } : null,
        sizes: p.sizes.map((s) => ({ id: s.id, size: s.size, position: s.position, spec: s.spec })),
    }));

const normalize = (text) => String(text || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// The tyre page a search lands on: an exact tyre name, or the only tyre (and size) that matches. null -> /search.
export function findSearchTarget(index, query) {
    const typed = normalize(query);
    if (!typed) return null;

    const exact = index.find((p) => [p.name, `${p.brand?.name || ""} ${p.name}`, p.identifier].some((name) => normalize(name) === typed));
    if (exact) return tyreHref(exact);

    const matches = filterProducts(index, { ...EMPTY_FILTERS, query });
    if (matches.length !== 1) return null;
    const [product] = matches;
    return product.sizes.length === 1 && /\d/.test(query) ? tyreHref(product, product.sizes[0]) : tyreHref(product);
}

// Suggestions from the trade stock itself, used when the smart search can't be reached.
export function localSuggestions(index, query, limit = 8) {
    const matches = filterProducts(index, { ...EMPTY_FILTERS, query });
    const products = matches.slice(0, 4).map((p) => ({ type: "product", id: p.id, text: p.name, query: p.name, path: tyreHref(p) }));
    const sizes = /\d/.test(query)
        ? matches.flatMap((p) => p.sizes.map((s) => ({ type: "size", id: s.id, text: `${p.name} ${s.size}`, query: s.size, path: tyreHref(p, s) })))
        : [];
    return [...products, ...sizes].slice(0, limit);
}

/**
 * Parses a tyre size string into structured technical specifications.
 * Supports metric formats (e.g. "120/70 ZR 17", "140/70-17", "90/90-21")
 * and imperial formats (e.g. "3.00-18").
 * If a backend size object is supplied, its structured database fields take precedence.
 */
export function parseTyreSize(rawSize = "", spec = "", sizeObj = null) {
    const str = String(rawSize || "").trim();
    const rawSpec = String(spec || "").trim();

    // 1. Check if backend database object already provides parsed dimensions
    if (sizeObj && typeof sizeObj === "object") {
        const bWidth = sizeObj.width ? `${sizeObj.width} mm` : "";
        const bAspect = sizeObj.aspectRatio ? `${sizeObj.aspectRatio}%` : "";
        const bRim = sizeObj.rimDiameter ? `${sizeObj.rimDiameter}"` : (sizeObj.rimSize ? `${sizeObj.rimSize}"` : "");
        const bTube = Array.isArray(sizeObj.tubeType) && sizeObj.tubeType.length > 0
            ? sizeObj.tubeType.join(" / ")
            : (sizeObj.tubeType || "");
        const bLoadSpeed = [sizeObj.loadIndex, sizeObj.speedIndex].filter(Boolean).join("");

        if (bWidth || bAspect || bRim) {
            let bConstr = "Radial";
            if (str.toUpperCase().includes("ZR")) bConstr = "Radial (ZR High Speed)";
            else if (str.toUpperCase().includes("R")) bConstr = "Radial (R)";
            else if (str.toUpperCase().includes("B")) bConstr = "Bias-Belted (B)";
            else if (sizeObj.compoundTechnology) bConstr = sizeObj.compoundTechnology;

            return {
                width: bWidth || "Standard",
                aspect: bAspect || "Standard",
                rim: bRim || "Standard",
                construction: bConstr,
                tubeType: bTube || "Tubeless (TL)",
                loadSpeed: bLoadSpeed || rawSpec || "Standard",
            };
        }
    }

    let width = "";
    let aspect = "";
    let rim = "";
    let construction = "Radial";

    // Standard metric motorcycle tyre: e.g. 120/70 ZR 17, 140/70-17, 90/90 - 21
    const metricMatch = str.match(/^(\d{2,3})\s*[\/xX]\s*(\d{2,3})\s*([A-Za-z\s\-]+)?\s*(\d{2})/);
    if (metricMatch) {
        width = `${metricMatch[1]} mm`;
        aspect = `${metricMatch[2]}%`;
        rim = `${metricMatch[4]}"`;
        const constrRaw = (metricMatch[3] || "").toUpperCase().trim();
        if (constrRaw.includes("ZR")) construction = "Radial (ZR High Speed)";
        else if (constrRaw.includes("R")) construction = "Radial (R)";
        else if (constrRaw.includes("B")) construction = "Bias-Belted (B)";
        else construction = "Bias-Ply / Cross-Ply";
    } else {
        // Imperial/inch sizing e.g. 3.00-18 or 2.75-17
        const inchMatch = str.match(/^(\d(?:\.\d{1,2})?)\s*[-xX]\s*(\d{1,2})/);
        if (inchMatch) {
            width = `${inchMatch[1]} inch`;
            aspect = "100% (Square Profile)";
            rim = `${inchMatch[2]}"`;
            construction = "Bias-Ply";
        }
    }

    // Determine Tube Type (TL vs TT)
    const combined = `${str} ${rawSpec}`.toUpperCase();
    let tubeType = "Tubeless (TL)";
    if (combined.includes("TT") && !combined.includes("TL")) {
        tubeType = "Tube Type (TT)";
    } else if (combined.includes("TT/TL") || combined.includes("TL/TT")) {
        tubeType = "Tubeless / Tube Compatible";
    } else if (combined.includes("TL") || combined.includes("TUBELESS")) {
        tubeType = "Tubeless (TL)";
    }

    // Extract Load & Speed Index from spec or size (e.g. "54W", "58W", "69H", "73W")
    const loadSpeedMatch = rawSpec.match(/(\d{2,3}[A-Z])/i) || str.match(/(\d{2,3}[A-Z])/i);
    const loadSpeed = loadSpeedMatch ? loadSpeedMatch[1].toUpperCase() : (rawSpec || "Standard");

    return {
        width: width || "Standard",
        aspect: aspect || "Standard",
        rim: rim || "Standard",
        construction,
        tubeType,
        loadSpeed,
    };
}

/**
 * Generates an informative, rich, and attractive fallback description based on tyre product category.
 */
export function getProductDescription(product) {
    if (product?.description && product.description.trim().length > 15) {
        return product.description.trim();
    }
    const name = product?.name || "Motorcycle Tyre";
    const brand = product?.brand?.name ? `${product.brand.name} ` : "";
    const cat = `${product?.category?.name || ""} ${product?.name || ""}`.toLowerCase();

    if (cat.includes("track") || cat.includes("race") || cat.includes("supersport") || cat.includes("superbike") || cat.includes("slick")) {
        return `Engineered for intense track performance and high-speed precision, the ${brand}${name} delivers maximum cornering grip and razor-sharp feedback at extreme lean angles. Its racing-derived compound enables rapid temperature buildup and consistent heat cycles, while the specialized profile maximizes the contact patch under aggressive braking and hard cornering exits.`;
    }
    if (cat.includes("sport") || cat.includes("hypersport") || cat.includes("rad")) {
        return `Crafted for spirited road carving and agile street performance, the ${brand}${name} blends rapid directional agility with reassuring edge grip. Featuring advanced silica-infused compounds, it ensures quick warm-up in all weather conditions, outstanding wet-road braking distances, and extended tread life for everyday performance enthusiasts.`;
    }
    if (cat.includes("adventure") || cat.includes("adv") || cat.includes("trail") || cat.includes("dual") || cat.includes("enduro")) {
        return `Built for riders who demand unrestricted freedom across tarmac and rough trails, the ${brand}${name} features a heavy-duty reinforced carcass and optimized multi-pitch tread blocks. Delivering aggressive off-road bite, high resistance to cuts and punctures, and smooth high-speed highway stability, it's the ultimate dual-purpose companion.`;
    }
    if (cat.includes("touring") || cat.includes("tour") || cat.includes("highway") || cat.includes("gt")) {
        return `Designed for marathon cross-country journeys and all-weather touring, the ${brand}${name} prioritizes rider comfort, heavy-payload stability, and exceptional tread longevity. Deep water-dispersion sipes prevent hydroplaning in torrential rain, while its dual-compound construction resists center-tread squaring over thousands of highway kilometers.`;
    }
    if (cat.includes("cruiser") || cat.includes("custom") || cat.includes("classic") || cat.includes("retro") || cat.includes("chopper")) {
        return `Specially engineered for heavyweight cruisers and retro classics, the ${brand}${name} delivers effortless straight-line tracking, smooth road-vibration absorption, and dependable wet braking. Constructed with high-strength belt plies to comfortably handle high kerb weights, it pairs authentic classic aesthetics with modern high-mileage rubber.`;
    }
    if (cat.includes("scooter") || cat.includes("moped")) {
        return `Tailored for agile city mobility and everyday convenience, the ${brand}${name} provides nimble handling, low road noise, and plush ride quality. Its specialized commuter profile allows effortless maneuvering through dense traffic, with responsive braking and dependable all-weather traction.`;
    }
    if (cat.includes("commuter") || cat.includes("city") || cat.includes("street") || cat.includes("urban")) {
        return `Engineered for daily urban commuting and grueling city road conditions, the ${brand}${name} is built for long-lasting tread wear, puncture resistance, and low rolling resistance. Its high-mileage compound and optimized water-channeling grooves provide instant braking response and confident grip over wet asphalt, potholes, and painted road markings.`;
    }
    if (cat.includes("cross") || cat.includes("dirt") || cat.includes("motocross") || cat.includes("mx")) {
        return `Developed for extreme off-road dominance across mud, sand, and gravel, the ${brand}${name} features deep, aggressive self-cleaning knobs with reinforced bases to resist tearing. It provides relentless forward drive, powerful braking bite, and maximum steering control on challenging loose surfaces.`;
    }
    return `The ${brand}${name} is a premium motorcycle tyre engineered for optimal performance, durability, and superior wet & dry grip. Designed with high-tensile casing plies and an optimized compound architecture, it delivers confident cornering, short braking distances, and consistent reliability across diverse road surfaces.`;
}

/**
 * Extracts and formats multi-paragraph product overview, highlights, and technical details.
 * Prioritizes backend intent data (familyData) from MongoDB /intent/:identifier API.
 */
export function buildProductParagraphs(product, familyData) {
    const paragraphs = [];

    // 1. Primary description: check familyData.description or product.description
    const rawDesc = familyData?.description || product?.description || "";
    if (typeof rawDesc === "string" && rawDesc.trim()) {
        const parts = rawDesc
            .split(/\n{2,}|\r\n\r\n|\n/)
            .map((p) => p.trim())
            .filter((p) => p.length > 25);
        if (parts.length > 0) {
            paragraphs.push(...parts);
        }
    }

    // 2. AI Search Summary from backend
    const aiSummary = familyData?.aiSearch?.summary?.trim();
    if (aiSummary && !paragraphs.some((p) => p.includes(aiSummary.slice(0, 30)))) {
        paragraphs.push(aiSummary);
    }

    // 3. Best Suited For / Operational Use Cases from backend
    const bestSuited = Array.isArray(familyData?.bestSuitedFor) ? familyData.bestSuitedFor.filter(Boolean) : [];
    const useCases = Array.isArray(familyData?.useCases) ? familyData.useCases.filter(Boolean) : [];
    if (bestSuited.length > 0 || useCases.length > 0) {
        const suitParts = [];
        if (bestSuited.length > 0) {
            suitParts.push(`Best Suited For: ${bestSuited.join(", ")}.`);
        }
        if (useCases.length > 0) {
            suitParts.push(`Recommended Application: ${useCases.join(", ")}.`);
        }
        const suitText = suitParts.join(" ");
        if (suitText && !paragraphs.some((p) => p.includes("Best Suited For"))) {
            paragraphs.push(suitText);
        }
    }

    // 4. Ensure we have at least 3 descriptive paragraphs
    if (paragraphs.length < 3) {
        const catDesc = getProductDescription(product);
        if (!paragraphs.some((p) => p.includes(catDesc.slice(0, 30)))) {
            paragraphs.unshift(catDesc);
        }
    }

    const brand = product?.brand?.name ? `${product.brand.name} ` : "";
    const name = product?.name || "this tyre";

    if (paragraphs.length < 2) {
        paragraphs.push(
            `Engineered with advanced compound blending and heat-dissipating carcass belts, the ${brand}${name} is built to endure sustained high-speed loads, unpredictable asphalt conditions, and thermal cycles without compromising grip consistency.`
        );
    }

    if (paragraphs.length < 3) {
        paragraphs.push(
            `Precision-tested for demanding Indian road environments, it delivers confident directional stability, short braking distances in wet and dry conditions, and extended tread wear life for motorcycle enthusiasts and commercial riders alike.`
        );
    }

    return paragraphs;
}

/**
 * Extracts bullet highlights from backend family data (hero.highlights, aiSearch.keyTakeaways, pros).
 */
export function getProductHighlights(product, familyData) {
    const highlights = [];
    if (Array.isArray(familyData?.hero?.highlights)) {
        familyData.hero.highlights.forEach((h) => {
            const trimmed = String(h || "").trim();
            if (trimmed && !highlights.includes(trimmed)) highlights.push(trimmed);
        });
    }
    if (Array.isArray(familyData?.aiSearch?.keyTakeaways)) {
        familyData.aiSearch.keyTakeaways.forEach((k) => {
            const trimmed = String(k || "").trim();
            if (trimmed && !highlights.includes(trimmed)) highlights.push(trimmed);
        });
    }
    if (Array.isArray(familyData?.pros)) {
        familyData.pros.forEach((p) => {
            const trimmed = String(p || "").trim();
            if (trimmed && !highlights.includes(trimmed)) highlights.push(trimmed);
        });
    }
    return highlights;
}
