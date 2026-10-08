import api from "@/lib/api";
import { formatINR, splitGst } from "@/lib/pricing";

// Every call here hits an existing backend route — nothing new on the server.

export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

// POST /auth/login → sends WhatsApp OTP (creates the AuthUsers record on first login).
export function sendOtp(phone) {
    return api.post("/auth/login", { phone });
}

// POST /auth/verify-otp → { token, user }. user.userType is "dealer" once the team approves.
export function verifyOtp(otp, otpVerifyToken) {
    return api.post("/auth/verify-otp", { otp, otpVerifyToken });
}

// Dealer sign-up → POST /leads/callback-leads, tagged so the sales team can filter it.
export function submitDealerApplication(form) {
    const message = [
        `Business type: ${form.businessType}`,
        `Contact person: ${form.contactName}`,
        `GSTIN: ${form.gstin}`,
        `City: ${form.city}`,
        form.notes ? `Notes: ${form.notes}` : null,
    ]
        .filter(Boolean)
        .join("\n");

    return api.post("/leads/callback-leads", {
        name: form.businessName,
        phone: form.phone,
        email: form.email || undefined,
        model: `TRADE-DEALER | ${form.businessType}`,
        message,
    });
}

// Order → POST /leads/callback-leads tagged TRADE-ORDER with a short reference for WhatsApp follow-up.
export async function submitOrder(business, lines) {
    const reference = `TB-${Date.now().toString(36).toUpperCase()}`;
    const total = lines.reduce((sum, l) => sum + (l.price || 0) * l.quantity, 0);
    const units = lines.reduce((sum, l) => sum + l.quantity, 0);
    const { taxable, gst } = splitGst(total);

    const message = [
        `Order ref: ${reference}`,
        `GSTIN: ${business.gstin}`,
        `Deliver to: ${business.city}`,
        "",
        ...lines.map((l) => `• ${l.productName} ${l.size} (${l.position}) × ${l.quantity} @ ${formatINR(l.price)} = ${formatINR(l.price * l.quantity)}`),
        "",
        `Units: ${units} | Taxable: ${formatINR(taxable)} | GST: ${formatINR(gst)} | Total: ${formatINR(total)}`,
    ].join("\n");

    await api.post("/leads/callback-leads", {
        name: business.businessName,
        phone: business.phone,
        model: `TRADE-ORDER | ${reference}`,
        message,
    });
    return { reference, total, units };
}
