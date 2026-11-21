"use client";

import { useRouter } from "next/navigation";
import { FaFileInvoice, FaHeadset, FaLayerGroup, FaShieldAlt, FaStore, FaTruck } from "react-icons/fa";
import { stockHref } from "@/lib/catalog.utils";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import BrandLockup from "./BrandLockup";
import { ContactLinks, HubList, LinkColumn, SocialLinks } from "./ContactBlocks";

const TRUST_BADGES = [
    { icon: FaShieldAlt, label: "100% Genuine Products" },
    { icon: FaFileInvoice, label: "GST Invoice" },
    { icon: FaTruck, label: "Pan-India Delivery" },
];

const DEFAULT_SOCIALS = [
    { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/torque_block/?hl=en" },
    { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/torqueblock" },
    { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/@torqueblock" },
    { platform: "linkedin", label: "LinkedIn", href: "https://in.linkedin.com/company/torque-block" },
];

export function FooterAccountLinks() {
    const router = useRouter();
    const token = useAuthStore((s) => s.token);
    const openLogin = useUiStore((s) => s.openLogin);
    const setOrderListOpen = useUiStore((s) => s.setOrderListOpen);

    const requireLogin = (path) => () => (token ? router.push(path) : openLogin());

    const links = [
        token
            ? { label: "My Account", onClick: requireLogin("/account") }
            : { label: "Business Login", onClick: () => openLogin() },
        !token && { label: "Register Your Business", href: "/register" },
        { label: "My Orders", onClick: requireLogin("/orders") },
        { label: "Shopping Cart", onClick: () => setOrderListOpen(true) },
    ].filter(Boolean);

    return <LinkColumn icon={FaStore} title="Trade Account" links={links} />;
}

export default function Footer({ settings, brands = [] }) {
    const name = settings.companyName;

    return (
        <footer className="border-t border-white/5 bg-[#0D0D0D]">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-12 sm:px-6 lg:grid-cols-[minmax(0,370px)_1fr] lg:gap-12 lg:px-8 lg:pt-16">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <BrandLockup name={name} />
                        {settings.tagline && <p className="max-w-xs text-[15px] leading-relaxed text-zinc-400">{settings.tagline}</p>}
                    </div>
                    <ContactLinks contact={settings.contact} />
                    <HubList hubs={settings.hubs} />
                    <SocialLinks socials={settings?.socials?.length ? settings.socials : DEFAULT_SOCIALS} companyName={name} />
                </div>

                <div className="flex flex-col">
                    <div className="grid flex-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                        {brands.length > 0 && (
                            <LinkColumn
                                icon={FaLayerGroup}
                                title="Shop by Brand"
                                links={brands.slice(0, 6).map((b) => ({ label: `${b.name} Tyres`, href: stockHref({ brand: b.name }) }))}
                                cta={{ label: "View All Brands", href: stockHref() }}
                            />
                        )}
                        <FooterAccountLinks />
                        {settings.supportLinks?.length > 0 && (
                            <LinkColumn icon={FaHeadset} title="Support & Policies" links={settings.supportLinks} />
                        )}
                    </div>

                    <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/10 py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-center md:flex-row md:justify-between md:pb-[max(1.5rem,env(safe-area-inset-bottom))] md:text-left">
                        <p className="text-sm text-zinc-400">
                            © {new Date().getFullYear()} {name}. All Rights Reserved.
                        </p>
                        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                            {TRUST_BADGES.map(({ icon: Icon, label }) => (
                                <li key={label} className="flex items-center gap-2 text-xs text-zinc-300">
                                    <Icon className="text-sm text-orange-500" />
                                    {label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}
