import { FiCompass, FiActivity, FiMap, FiWind, FiZap, FiDisc } from "react-icons/fi";
import { TbMountain } from "react-icons/tb";

// Same category icon mapping as the B2C store (performanceBrandPresets.js).
const PRESETS = [
    { match: ["dual sport", "dual-sport"], Icon: FiCompass, label: "Dual Sport" },
    { match: ["racing slick", "slick", "racing"], Icon: FiActivity, label: "Racing Slicks" },
    { match: ["sport touring", "touring"], Icon: FiMap, label: "Sport Touring" },
    { match: ["off-road", "off road", "offroad", "motocross", "enduro", "trail", "mx"], Icon: TbMountain, label: "Off-Roading" },
    { match: ["cruiser", "cruising"], Icon: FiWind, label: "Cruiser" },
    { match: ["super sport", "supersport", "superbike", "sport"], Icon: FiZap, label: "Super Sport" },
];

export function getCategoryPreset(name) {
    const raw = typeof name === "string" ? name.trim() : "";
    const key = raw.toLowerCase();
    if (!key) return { Icon: FiDisc, label: "" };
    const hit = PRESETS.find((preset) => preset.match.some((m) => key.includes(m)));
    return { Icon: hit ? hit.Icon : FiDisc, label: raw || (hit ? hit.label : "") };
}

export function getImageUrl(img) {
    if (!img) return "";
    if (typeof img === "string") return img;
    return img.url || "";
}

export function getProductImages(product) {
    const images = (product?.productImages || []).map(getImageUrl).filter(Boolean);
    if (images.length) return images;
    return product?.hero?.heroImage ? [product.hero.heroImage] : [];
}

export function getProductSizes(product) {
    return [...new Set([...(product?.frontSizes || []), ...(product?.rearSizes || [])])].filter(Boolean);
}

export const WHATSAPP_NUMBER = "916366625625";
export const TRADE_DESK_PHONE = "+91 6366 625 625";
export const TRADE_EMAIL = "ops@torqueblock.com";
