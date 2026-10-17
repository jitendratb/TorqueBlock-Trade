import { FaShoppingCart, FaLayerGroup, FaThLarge, FaHeadset, FaShieldAlt, FaTruck, FaFileInvoice, FaStore } from "react-icons/fa";
import Logo from "@/ui/Logo";
import { ContactLinks, HubList, LinkColumn, SocialLinks } from "./ContactBlocks";
import { NAV_LINKS, stockLink } from "../site.routes";

const TRUST_BADGES = [
    { icon: FaShieldAlt, label: "100% Genuine Products" },
    { icon: FaFileInvoice, label: "GST Invoice" },
    { icon: FaTruck, label: "Pan-India Delivery" },
];

// Same structure as the B2C footer. Every value comes from /trade/settings and /trade/stock.
export default function Footer({ settings, brands = [], categories = [] }) {
    const name = settings.companyName;

    return (
        <footer className="bg-black/95 border-t border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 pt-16 md:pb-4">
                <div className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-4">
                    <div className="space-y-6">
                        <div>
                            <Logo name={name} className="w-[110px] lg:w-[150px]" />
                            {settings.tagline && <p className="mt-4 text-zinc-400 text-[15px] leading-relaxed max-w-xs">{settings.tagline}</p>}
                        </div>
                        <ContactLinks contact={settings.contact} />
                        <HubList hubs={settings.hubs} />
                        <SocialLinks socials={settings.socials} companyName={name} />
                    </div>

                    <div className="flex lg:justify-between flex-col gap-8 mt-8 md:mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <LinkColumn icon={FaShoppingCart} title="Dealers" links={NAV_LINKS} cta={{ label: "View All Stock", href: "/#stock" }} />

                            {brands.length > 0 && (
                                <LinkColumn
                                    icon={FaLayerGroup}
                                    title="Brands"
                                    links={brands.slice(0, 5).map((b) => ({ label: `${b.name} Tyres`, href: stockLink("brand", b.name) }))}
                                    cta={{ label: "View All Brands", href: "/#stock" }}
                                />
                            )}

                            {categories.length > 0 && (
                                <LinkColumn icon={FaThLarge} title="Categories" links={categories.map((c) => ({ label: c.name, href: stockLink("category", c.name) }))}>
                                    {settings.retailUrl && (
                                        <a href={settings.retailUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex flex-col items-start gap-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 hover:border-orange-500/50 transition">
                                            <span className="flex items-center gap-2 text-white font-bold text-sm">
                                                <FaStore className="text-orange-500" /> {name} Store
                                            </span>
                                            <span className="text-zinc-500 text-xs">Retail store for riders</span>
                                        </a>
                                    )}
                                </LinkColumn>
                            )}

                            {settings.supportLinks?.length > 0 && <LinkColumn icon={FaHeadset} title="Support" links={settings.supportLinks} />}
                        </div>

                        <div className="border-t border-zinc-800">
                            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <p className="text-zinc-400 text-xs md:text-sm">© {new Date().getFullYear()} {name}. All Rights Reserved.</p>
                                <div className="hidden md:flex items-center gap-2 md:gap-4 flex-wrap justify-center">
                                    {TRUST_BADGES.map(({ icon: Icon, label }) => (
                                        <div key={label} className="flex items-center gap-2 text-zinc-400 text-xs">
                                            <Icon className="text-orange-500" />
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
