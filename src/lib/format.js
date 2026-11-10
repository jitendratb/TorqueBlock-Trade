const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const formatINR = (value) => (value == null ? "—" : inr.format(value));

export const formatPercent = (value) => `${Math.round((value || 0) * 100)}%`;

export const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

// Prices are GST-inclusive; split for the invoice preview using the rate from trade settings.
export const splitGst = (total, rate = 0) => {
    const taxable = Math.round(total / (1 + rate));
    return { taxable, gst: total - taxable };
};

export const whatsappLink = (number, message = "") => number ? `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}` : "";

/**
 * Formats text into Title Case (1st letter of each word capital, rest small).
 * Pass `{ trim: true }` on submit/save; leave false while typing to preserve spaces.
 */
export const toTitleCase = (value, { trim = false } = {}) => {
    if (value == null) return "";
    let str = String(value);
    if (trim) {
        str = str.replace(/\s+/g, " ").trim();
    }
    return str
        .toLowerCase()
        .replace(/(^|[\s.,/()-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
};
