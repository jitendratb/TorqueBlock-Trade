import Image from "next/image";
import Link from "next/link";
import {
    FaInstagram, FaFacebookF, FaYoutube, FaLinkedinIn, FaPhoneAlt, FaWhatsapp, FaEnvelope, FaMapMarkerAlt,
    FaChevronRight, FaBoxes, FaLayerGroup, FaHeadset, FaShieldAlt, FaFileInvoice, FaTruck,
} from "react-icons/fa";
import { getBrands } from "@/lib/catalog";

const dealerLinks = [
    { label: "Stock & Prices", href: "/" },
    { label: "Dealer Registration", href: "/register" },
    { label: "Retail Store", href: "https://www.torqueblock.com" },
];

const supportLinks = [
    { label: "Shipping Policy", href: "https://www.torqueblock.com/shipping-policy" },
    { label: "Return Policy", href: "https://www.torqueblock.com/return-policy" },
    { label: "Terms & Conditions", href: "https://www.torqueblock.com/terms" },
    { label: "Privacy Policy", href: "https://www.torqueblock.com/privacy-policy" },
];

const trustBadges = [
    { icon: FaShieldAlt, label: "100% Genuine Products" },
    { icon: FaFileInvoice, label: "GST Invoice" },
    { icon: FaTruck, label: "Pan-India Dispatch" },
];

const socialLinks = [
    { icon: <FaInstagram />, href: "https://www.instagram.com/torque_block", label: "Instagram" },
    { icon: <FaFacebookF />, href: "https://www.facebook.com/torqueblock", label: "Facebook" },
    { icon: <FaYoutube />, href: "https://www.youtube.com/@torqueblock", label: "YouTube" },
    { icon: <FaLinkedinIn />, href: "https://www.linkedin.com/company/torque-block", label: "LinkedIn" },
];

const HUBS = [
    { name: "Bengaluru Hub", address: "8, Andree Rd, Shanti Nagar, Bengaluru, Karnataka 560027", href: "https://share.google/4KLMb3GXpf429cCFn" },
    { name: "Delhi Hub", address: "Basement, Community Center, Naraina, New Delhi, Delhi 110028", href: "https://share.google/tUeXufqut8begnL9f" },
];

const FooterLink = ({ href, children }) => (
    <li>
        <Link href={href} className="group flex w-full items-center gap-2.5 text-zinc-400 hover:text-orange-500 transition text-[15px]">
            <FaChevronRight className="text-[10px] text-zinc-600 group-hover:text-orange-500 group-hover:translate-x-0.5 transition" />
            {children}
        </Link>
    </li>
);

const Column = ({ icon: Icon, title, links }) => (
    <div>
        <div className="flex items-center gap-3 mb-5">
            <Icon className="text-2xl text-orange-500" />
            <h3 className="text-white font-bold text-xl">{title}</h3>
        </div>
        <ul className="space-y-2">
            {links.map((l) => <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>)}
        </ul>
    </div>
);

export default async function Footer() {
    const brands = await getBrands();
    const brandLinks = brands.slice(0, 5).map((b) => ({ label: `${b.name} Tyres`, href: `/?brand=${encodeURIComponent(b.name)}#stock` }));

    return (
        <footer className="bg-black/95 border-t border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 pt-14 md:pb-4">
                <div className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-8">
                    <div>
                        <Link href="/" className="inline-block mb-4">
                            <Image src="/newlogo.webp" alt="Torque Block Logo" width={130} height={120} className="h-auto w-[110px] lg:w-[150px]" style={{ height: "auto" }} />
                        </Link>
                        <p className="text-zinc-400 text-[15px] leading-relaxed max-w-xs">Dealer supply of premium &amp; value performance motorcycle tyres across India.</p>
                        <div className="mt-6 space-y-3">
                            <a href="https://wa.me/916366625625?text=Hi%20Torque%20Block%2C%20I%27m%20a%20dealer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-zinc-300 hover:text-green-400 transition">
                                <FaWhatsapp className="text-lg" /><span className="text-[15px]">WhatsApp Us</span>
                            </a>
                            <a href="tel:+916366625625" className="flex items-center gap-3 text-zinc-300 hover:text-white transition">
                                <FaPhoneAlt className="text-sm" /><span className="text-[15px]">+91 6366 625 625</span>
                            </a>
                            <a href="mailto:ops@torqueblock.com" className="flex items-center gap-3 text-zinc-300 hover:text-white transition">
                                <FaEnvelope className="text-sm" /><span className="text-[15px]">ops@torqueblock.com</span>
                            </a>
                        </div>
                        <div className="flex items-center gap-3 mt-6">
                            {socialLinks.map((item) => (
                                <Link key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`Follow Torque Block on ${item.label}`} className="h-11 w-11 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all duration-300">
                                    {item.icon}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <Column icon={FaBoxes} title="Dealers" links={dealerLinks} />
                            <Column icon={FaLayerGroup} title="Brands" links={brandLinks} />
                            <Column icon={FaHeadset} title="Support" links={supportLinks} />
                            <div className="space-y-4">
                                {HUBS.map((hub) => (
                                    <a key={hub.name} href={hub.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-zinc-400 hover:text-white transition">
                                        <FaMapMarkerAlt className="mt-1 text-sm text-orange-500 shrink-0" />
                                        <div>
                                            <span className="text-[11px] font-black uppercase tracking-wider text-orange-500 block mb-1">{hub.name}</span>
                                            <p className="text-xs leading-5">{hub.address}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <p className="text-zinc-400 text-xs md:text-sm">© {new Date().getFullYear()} Torque Block. All Rights Reserved.</p>
                            <div className="hidden md:flex items-center gap-4">
                                {trustBadges.map(({ icon: Icon, label }) => (
                                    <div key={label} className="flex items-center gap-2 text-zinc-400 text-xs">
                                        <Icon className="text-orange-500" /><span>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
