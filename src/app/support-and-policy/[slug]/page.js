import { notFound } from "next/navigation";
import SupportAndPolicyClient from "../components/SupportAndPolicyClient";
import { shippingMetadata } from "../components/shipping";
import { returnMetadata } from "../components/return";
import { termsMetadata } from "../components/terms";
import { privacyMetadata } from "../components/privacy";

function normalizeSlug(rawSlug) {
    if (!rawSlug) return "policy-shipping";
    const decoded = decodeURIComponent(rawSlug).toLowerCase();
    if (decoded.includes("ship")) return "policy-shipping";
    if (decoded.includes("ret")) return "policy-return";
    if (decoded.includes("term")) return "policy-terms-and-condition";
    if (decoded.includes("priv")) return "policy-privacy";
    return null;
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const normalized = normalizeSlug(slug);

    if (normalized === "policy-shipping") return shippingMetadata;
    if (normalized === "policy-return") return returnMetadata;
    if (normalized === "policy-terms-and-condition") return termsMetadata;
    if (normalized === "policy-privacy") return privacyMetadata;

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

