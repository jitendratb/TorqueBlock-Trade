"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaLayerGroup, FaHeadset, FaShieldAlt, FaTruck, FaFileInvoice, FaStore } from "react-icons/fa";
import { Logo } from "@/ui";
import { stockHref } from "@/lib/catalog.utils";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/ui.store";
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

function FooterBrand({ name }) {
    return (
        <Link href="/" className="group inline-flex items-center gap-2.5 sm:gap-3.5 select-none" aria-label={`${name} Trade home`}>
            <Logo href={null} name={name} className="w-[58px] min-[380px]:w-[68px] sm:w-[110px] md:w-[130px] lg:w-[140px] shrink-0" />
            <span className="h-5 sm:h-7 md:h-8 lg:h-9 w-px bg-white/20 shrink-0 block" />
            <span className="flex min-w-0 flex-col">
                <span className="text-xs min-[380px]:text-sm sm:text-lg md:text-xl lg:text-2xl font-black uppercase tracking-tight text-orange-500 leading-none">
                    TRADE
                </span>
                <span className="text-[6px] min-[380px]:text-[7px] sm:text-[8.5px] md:text-[9.5px] lg:text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-[0.18em] lg:tracking-[0.22em] text-zinc-300 group-hover:text-white transition-colors leading-tight mt-0.5 whitespace-nowrap">
                    BUSINESS PORTAL
                </span>
            </span>
        </Link>
    );
}

export function FooterAccountLinks() {
    const router = useRouter();
    const token = useAuthStore((s) => s.token);
    const openLogin = useUiStore((s) => s.openLogin);
    const setOrderListOpen = useUiStore((s) => s.setOrderListOpen);

    const requireLogin = (path) => () => (token ? router.push(path) : openLogin());

    const links = [
        token ? { label: "My Account", onClick: requireLogin("/account") } : { label: "Business Login", onClick: () => openLogin() },
        !token && { label: "Register Your Business", href: "/register" },
        { label: "My Orders", onClick: requireLogin("/orders") },
        { label: "Shopping Cart", onClick: () => setOrderListOpen(true) },
    ].filter(Boolean);

    return <LinkColumn icon={FaStore} title="Trade Account" links={links} />;
}

export default function Footer({ settings, brands = [] }) {
    const name = settings.companyName;

    return (
        <footer className="border-t border-zinc-800 bg-black/95">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:py-14 lg:grid-cols-[1.3fr_1fr_1.2fr] lg:gap-x-12">
                    <div className="col-span-2 space-y-6 lg:col-span-1">
                        <div>
                            <FooterBrand name={name} />
                            {settings.tagline && <p className="mt-4 max-w-sm text-sm sm:text-[15px] leading-relaxed text-zinc-400">{settings.tagline}</p>}
                        </div>
                        <ContactLinks contact={settings.contact} />
                        <HubList hubs={settings.hubs} />
                    </div>

                    {brands.length > 0 && (
                        <div className="col-span-2 sm:col-span-1">
                            <LinkColumn
                                icon={FaLayerGroup}
                                title="Shop by Brand"
                                links={brands.slice(0, 6).map((b) => ({ label: `${b.name} Tyres`, href: stockHref({ brand: b.name }) }))}
                                cta={{ label: "View All Brands", href: stockHref() }}
                            />
                        </div>
                    )}

                    <div className="col-span-2 space-y-8 sm:col-span-1">
                        <FooterAccountLinks />
                        {settings.supportLinks?.length > 0 && (
                            <div className="border-t border-zinc-800 pt-8">
                                <LinkColumn icon={FaHeadset} title="Support & Policies" links={settings.supportLinks} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-5 border-t border-zinc-800 py-6 text-center lg:flex-row lg:justify-between lg:text-left">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                        <SocialLinks socials={settings?.socials?.length ? settings.socials : DEFAULT_SOCIALS} companyName={name} />
                        <span className="hidden h-8 w-px bg-zinc-800 sm:block" />
                        <p className="text-xs sm:text-sm text-zinc-400">© {new Date().getFullYear()} {name}. All Rights Reserved.</p>
                    </div>
                    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:divide-x sm:divide-zinc-800 sm:gap-x-0">
                        {TRUST_BADGES.map(({ icon: Icon, label }) => (
                            <li key={label} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 sm:px-5 sm:first:pl-0 sm:last:pr-0">
                                <Icon className="text-base text-orange-500" />
                                <span>{label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
}
