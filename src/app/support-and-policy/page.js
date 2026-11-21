import SupportAndPolicyClient from "@/components/support/SupportAndPolicyClient";
import { DEFAULT_POLICY } from "@/constants/policies";

export const metadata = DEFAULT_POLICY.metadata;

export default function SupportAndPolicyIndexPage() {
    return <SupportAndPolicyClient activeSlug={DEFAULT_POLICY.slug} />;
}
