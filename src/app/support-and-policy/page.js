import SupportAndPolicyClient from "@/components/support/SupportAndPolicyClient";

export const metadata = {
    title: "Shipping & Delivery Policy | Torque Block Trade",
    description: "Wholesale motorcycle tyre delivery schedules, transport safety, and receiving guidelines for trade businesses across India.",
};

export default function SupportAndPolicyIndexPage() {
    return <SupportAndPolicyClient activeSlug="policy-shipping" />;
}
