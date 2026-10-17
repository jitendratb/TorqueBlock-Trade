import { createElement } from "react";
import { FiCompass, FiActivity, FiMap, FiWind, FiZap, FiDisc } from "react-icons/fi";
import { TbMountain } from "react-icons/tb";

// Icon per riding category (presentation only — same mapping as the B2C store).
const CATEGORY_ICONS = [
    { match: ["dual sport", "dual-sport"], Icon: FiCompass },
    { match: ["racing", "slick"], Icon: FiActivity },
    { match: ["touring"], Icon: FiMap },
    { match: ["off-road", "off road", "offroad", "enduro", "trail"], Icon: TbMountain },
    { match: ["cruiser"], Icon: FiWind },
    { match: ["sport"], Icon: FiZap },
];

const iconFor = (name = "") => {
    const key = name.toLowerCase();
    return CATEGORY_ICONS.find(({ match }) => match.some((m) => key.includes(m)))?.Icon || FiDisc;
};

export const CategoryIcon = ({ name, className }) => createElement(iconFor(name), { className, "aria-hidden": true });

export const EMPTY_FILTERS = { query: "", brand: "", category: "", inStockOnly: false };

// Sizes typed with or without spaces/dashes match: "110/70r17", "110/70 R17", "90/90-21".
const compact = (text) => text.replace(/[\s-]/g, "");

export function filterProducts(products, { query, brand, category, inStockOnly }) {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return products.reduce((result, product) => {
        if (brand && product.brand?.name !== brand) return result;
        if (category && product.category?.name !== category) return result;

        const productText = `${product.name} ${product.brand?.name || ""} ${product.category?.name || ""}`.toLowerCase();
        const sizes = product.sizes.filter((size) => {
            if (inStockOnly && size.availability !== "in_stock") return false;
            if (!words.length) return true;
            const text = `${productText} ${size.size} ${size.position} ${size.spec}`.toLowerCase();
            return words.every((w) => text.includes(w) || compact(text).includes(compact(w)));
        });

        if (sizes.length) result.push(sizes.length === product.sizes.length ? product : { ...product, sizes });
        return result;
    }, []);
}
