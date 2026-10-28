"use client";

import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import ShippingPolicyContent from "./shipping";
import ReturnPolicyContent from "./return";
import TermsPolicyContent from "./terms";
import PrivacyPolicyContent from "./privacy";

const POLICIES = [
    {
        id: "policy-shipping",
        label: "Shipping Policy",
        href: "/support-and-policy/policy-shipping",
        whiteTitle: "SHIPPING & ",
        orangeTitle: "DELIVERY POLICY",
        component: ShippingPolicyContent,
    },
    {
        id: "policy-return",
        label: "Return Policy",
        href: "/support-and-policy/policy-return",
        whiteTitle: "RETURN & ",
        orangeTitle: "CANCELLATION POLICY",
        component: ReturnPolicyContent,
    },
    {
        id: "policy-terms-and-condition",
        label: "Terms & Conditions",
        href: "/support-and-policy/policy-terms-and-condition",
        whiteTitle: "TERMS & ",
        orangeTitle: "CONDITIONS OF BUSINESS",
        component: TermsPolicyContent,
    },
    {
        id: "policy-privacy",
        label: "Privacy Policy",
        href: "/support-and-policy/policy-privacy",
        whiteTitle: "PRIVACY & ",
        orangeTitle: "DATA PROTECTION POLICY",
        component: PrivacyPolicyContent,
    },
];

export default function SupportAndPolicyClient({ activeSlug = "policy-shipping" }) {
    const activePolicy = POLICIES.find((p) => p.id === activeSlug) || POLICIES[0];
    const ActiveComponent = activePolicy.component;

    return (
        <main className="min-h-screen bg-[#080B11] text-white pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-zinc-500">
                    <Link href="/" className="hover:text-orange-400 transition-colors">
                        Home
                    </Link>
                    <FiChevronRight className="text-zinc-600 text-xs shrink-0" />
                    <Link href="/support-and-policy/policy-shipping" className="hover:text-orange-400 transition-colors">
                        Support &amp; Policies
                    </Link>
                    <FiChevronRight className="text-zinc-600 text-xs shrink-0" />
                    <span className="text-orange-400" aria-current="page">
                        {activePolicy.label}
                    </span>
                </nav>

                {/* Hero Title Section - Matching torqueblock.com reference image */}
                <header className="text-center mb-8 space-y-3">
                    <p className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-500">
                        TRADE POLICIES
                    </p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                        <span>{activePolicy.whiteTitle}</span>
                        <span className="text-orange-500">{activePolicy.orangeTitle}</span>
                    </h1>
                </header>

                {/* Policy Switcher Tabs */}
                <div className="mb-10 flex items-center justify-center">
                    <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#0e121b] border border-white/10 shadow-lg">
                        {POLICIES.map((policy) => {
                            const isActive = policy.id === activePolicy.id;
                            return (
                                <Link
                                    key={policy.id}
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

                {/* Main Policy Content Card - Centered container from reference screenshot */}
                <article className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0e121b]/95 p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-sm">
                    <ActiveComponent />
                </article>
            </div>
        </main>
    );
}
