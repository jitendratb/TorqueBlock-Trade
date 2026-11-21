import { FiFileText, FiRotateCcw, FiShield, FiTruck } from "react-icons/fi";

// Single source for the trade policy pages: routes, menu/footer labels, page titles and SEO metadata.
// Used by app/support-and-policy, the support page tabs, the header menu, the footer and the sitemap.
const POLICY_BASE = "/support-and-policy";
const policyHref = (slug) => `${POLICY_BASE}/${slug}`;

export const POLICIES = [
    {
        slug: "policy-shipping",
        label: "Shipping Policy",
        shortLabel: "Shipping",
        Icon: FiTruck,
        heading: ["SHIPPING & ", "DELIVERY POLICY"],
        metadata: {
            title: "Shipping & Delivery Policy | Torque Block Trade",
            description: "Wholesale motorcycle tyre delivery schedules, transport safety, and receiving guidelines for trade businesses across India.",
        },
    },
    {
        slug: "policy-return",
        label: "Return Policy",
        shortLabel: "Returns",
        Icon: FiRotateCcw,
        heading: ["RETURN & ", "CANCELLATION POLICY"],
        metadata: {
            title: "Return & Cancellation Policy | Torque Block Trade",
            description: "Wholesale trade return eligibility, transit damage claim windows, cancellation terms, and refund processing.",
        },
    },
    {
        slug: "policy-terms-and-condition",
        label: "Terms & Conditions",
        shortLabel: "Terms",
        Icon: FiFileText,
        heading: ["TERMS & ", "CONDITIONS OF BUSINESS"],
        metadata: {
            title: "Terms & Conditions of Business | Torque Block Trade",
            description: "Wholesale trading terms, pricing, order acceptance, credit line rules, and commercial buyer obligations.",
        },
    },
    {
        slug: "policy-privacy",
        label: "Privacy Policy",
        shortLabel: "Privacy",
        Icon: FiShield,
        heading: ["PRIVACY & ", "DATA PROTECTION POLICY"],
        metadata: {
            title: "Privacy & Data Protection Policy | Torque Block Trade",
            description: "How Torque Block collects, protects, and handles business records, trade accounts, and operational data.",
        },
    },
].map((policy) => ({ ...policy, href: policyHref(policy.slug) }));

export const DEFAULT_POLICY = POLICIES[0];

export const findPolicy = (slug) => POLICIES.find((p) => p.slug === slug) || null;

// Accepts loose slugs ("shipping", "Return", "privacy-policy") and returns the canonical one, or null.
export function normalizePolicySlug(rawSlug) {
    if (!rawSlug) return DEFAULT_POLICY.slug;
    let slug;
    try {
        slug = decodeURIComponent(rawSlug).toLowerCase();
    } catch {
        return null; // malformed %-encoding → 404 instead of a server error
    }
    const match = [
        ["ship", "policy-shipping"],
        ["ret", "policy-return"],
        ["term", "policy-terms-and-condition"],
        ["priv", "policy-privacy"],
    ].find(([key]) => slug.includes(key));
    return match ? match[1] : null;
}
