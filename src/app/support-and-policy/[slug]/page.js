import { notFound } from "next/navigation";
import SupportAndPolicyClient from "../components/SupportAndPolicyClient";

const POLICY_METADATA = {
    "policy-shipping": {
        title: "Shipping & Delivery Policy | Torque Block Trade",
        description: "Wholesale motorcycle tyre delivery schedules, transport safety, and receiving guidelines for trade businesses across India.",
    },
    "policy-return": {
        title: "Return & Cancellation Policy | Torque Block Trade",
        description: "Wholesale trade return eligibility, transit damage claim windows, cancellation terms, and refund processing.",
    },
    "policy-terms-and-condition": {
        title: "Terms & Conditions of Business | Torque Block Trade",
        description: "Wholesale trading terms, pricing, order acceptance, credit line rules, and commercial buyer obligations.",
    },
    "policy-privacy": {
        title: "Privacy & Data Protection Policy | Torque Block Trade",
        description: "How Torque Block collects, protects, and handles business records, trade accounts, and operational data.",
    },
};

function normalizeSlug(rawSlug) {
    if (!rawSlug) return "policy-shipping";
    const decoded = decodeURIComponent(rawSlug).toLowerCase();
    if (decoded.includes("ship")) return "policy-shipping";
    if (decoded.includes("ret")) return "policy-return";
    if (decoded.includes("term")) return "policy-terms-and-condition";
    if (decoded.includes("priv")) return "policy-privacy";
    return null;
}

export function generateStaticParams() {
    return [
        { slug: "policy-shipping" },
        { slug: "policy-return" },
        { slug: "policy-terms-and-condition" },
        { slug: "policy-privacy" },
    ];
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const normalized = normalizeSlug(slug);

    if (normalized && POLICY_METADATA[normalized]) {
        return POLICY_METADATA[normalized];
    }

    return {
        title: "Support & Policies | Torque Block Trade",
    };
}

export default async function PolicyDetailPage({ params }) {
    const { slug } = await params;
    const normalized = normalizeSlug(slug);

    if (!normalized) {
        notFound();
    }

    return <SupportAndPolicyClient activeSlug={normalized} />;
}
