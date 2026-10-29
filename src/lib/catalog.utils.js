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
