import { notFound } from "next/navigation";
import SupportAndPolicyClient from "@/components/support/SupportAndPolicyClient";
import { POLICIES, findPolicy, normalizePolicySlug } from "@/constants/policies";

export function generateStaticParams() {
    return POLICIES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    return findPolicy(normalizePolicySlug(slug))?.metadata || { title: "Support & Policies | Torque Block Trade" };
}

export default async function PolicyDetailPage({ params }) {
    const { slug } = await params;
    const policy = findPolicy(normalizePolicySlug(slug));
    if (!policy) notFound();

    return <SupportAndPolicyClient activeSlug={policy.slug} />;
}
