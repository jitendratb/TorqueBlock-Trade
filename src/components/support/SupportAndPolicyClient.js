import Link from "next/link";
import { Breadcrumbs, Card } from "@/components/ui";
import { DEFAULT_POLICY, POLICIES, findPolicy } from "@/constants/policies";
import PrivacyPolicyContent from "./privacy";
import ReturnPolicyContent from "./return";
import ShippingPolicyContent from "./shipping";
import TermsPolicyContent from "./terms";

// Page body for each policy; titles, labels and routes come from constants/policies.
const CONTENT = {
    "policy-shipping": ShippingPolicyContent,
    "policy-return": ReturnPolicyContent,
    "policy-terms-and-condition": TermsPolicyContent,
    "policy-privacy": PrivacyPolicyContent,
};

export default function SupportAndPolicyClient({ activeSlug = DEFAULT_POLICY.slug }) {
    const activePolicy = findPolicy(activeSlug) || DEFAULT_POLICY;
    const ActiveComponent = CONTENT[activePolicy.slug];
    const [headingStart, headingAccent] = activePolicy.heading;

    return (
        <main className="min-h-screen bg-[#080B11] text-white pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <Breadcrumbs
                    variant="centered"
                    className="mb-8"
                    items={[
                        { label: "Home", href: "/" },
                        { label: "Support & Policies", href: DEFAULT_POLICY.href },
                        { label: activePolicy.label },
                    ]}
                />

                <header className="text-center mb-8 space-y-3">
                    <p className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-500">
                        TRADE POLICIES
                    </p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                        <span>{headingStart}</span>
                        <span className="text-orange-500">{headingAccent}</span>
                    </h1>
                </header>

                <div className="mb-10 flex items-center justify-center">
                    <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#0e121b] border border-white/10 shadow-lg">
                        {POLICIES.map((policy) => {
                            const isActive = policy.slug === activePolicy.slug;
                            return (
                                <Link
                                    key={policy.slug}
                                    href={policy.href}
                                    className={`rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                                        isActive
                                            ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                    {policy.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <Card className="rounded-2xl sm:rounded-3xl border-white/10 bg-[#0e121b]/95 p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-sm">
                    <ActiveComponent />
                </Card>
            </div>
        </main>
    );
}
