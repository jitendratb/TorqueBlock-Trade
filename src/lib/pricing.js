// Dealer pricing. The backend stores one retail price (MRP) per size; the dealer price is
// derived here so no backend change is needed. Change the two numbers below to re-price.

export const PREMIUM_BRANDS = ["pirelli", "michelin", "metzeler", "bridgestone"];

const DEALER_DISCOUNT = { premium: 0.1, value: 0.15 };

export const GST_RATE = 0.18;

export function isPremiumBrand(brandName = "") {
    return PREMIUM_BRANDS.includes(brandName.trim().toLowerCase());
}

export function getDealerDiscount(brandName) {
    return isPremiumBrand(brandName) ? DEALER_DISCOUNT.premium : DEALER_DISCOUNT.value;
}

export function getDealerPrice(mrp, brandName) {
    if (!mrp) return null;
    return Math.round(mrp * (1 - getDealerDiscount(brandName)));
}

// Prices are GST-inclusive, matching the retail store. Split for the invoice preview.
export function splitGst(total) {
    const taxable = Math.round(total / (1 + GST_RATE));
    return { taxable, gst: total - taxable };
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatINR(value) {
    return value == null ? "On request" : inr.format(value);
}

export function formatPercent(value) {
    return `${Math.round(value * 100)}%`;
}
