import Link from "next/link";
import { FaInstagram, FaFacebookF, FaYoutube, FaLinkedinIn, FaPhoneAlt, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaChevronRight, FaArrowRight, FaGlobe, } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { whatsappLink } from "@/lib/format";

const SOCIAL_ICONS = { instagram: FaInstagram, facebook: FaFacebookF, youtube: FaYoutube, linkedin: FaLinkedinIn, x: FaXTwitter, twitter: FaXTwitter };

const externalProps = (href = "") => (/^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {});

export function ContactLinks({ contact }) {
    if (!contact) return null;
    const items = [
        contact.whatsapp && { href: whatsappLink(contact.whatsapp, contact.whatsappMessage), icon: FaWhatsapp, label: "WhatsApp Us", hover: "hover:text-green-400", external: true },
        contact.phone && { href: `tel:${contact.phone}`, icon: FaPhoneAlt, label: contact.phoneDisplay || contact.phone },
        contact.email && { href: `mailto:${contact.email}`, icon: FaEnvelope, label: contact.email },
    ].filter(Boolean);

    return (
        <div className="space-y-3">
            {items.map(({ href, icon: Icon, label, hover = "hover:text-white", external }) => (
                <a key={href} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`flex items-center gap-3 text-zinc-300 transition ${hover}`}>
                    <Icon className="text-sm" />
                    <span className="text-[15px]">{label}</span>
                </a>
            ))}
        </div>
    );
}

export function HubList({ hubs = [] }) {
    if (!hubs.length) return null;
    return (
        <div className="space-y-4">
            {hubs.map((hub) => (
                <a key={hub.name} href={hub.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-zinc-400 hover:text-white transition">
                    <FaMapMarkerAlt className="mt-1 text-sm text-orange-500 shrink-0" />
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-orange-500 block mb-1">{hub.name}</span>
                        <p className="text-xs leading-5">{hub.address}</p>
                        {hub.mapUrl && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-orange-400 hover:text-orange-300 transition">
                                View on Map <FaChevronRight className="text-[8px]" />
                            </span>
                        )}
                    </div>
                </a>
            ))}
        </div>
    );
}

export function SocialLinks({ socials = [], companyName }) {
    if (!socials.length) return null;
    return (
        <div className="flex items-center gap-3">
            {socials.map(({ platform, label, href }) => {
                const Icon = SOCIAL_ICONS[platform?.toLowerCase()] || FaGlobe;
                return (
                    <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Follow ${companyName || "us"} on ${label}`} className="h-11 w-11 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all duration-300">
                        <Icon />
                    </a>
                );
            })}
        </div>
    );
}

export function LinkColumn({ icon: Icon, title, links = [], cta, children }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3 mb-6">
                <Icon className="text-2xl text-orange-500" />
                <h3 className="text-white font-bold text-xl">{title}</h3>
            </div>
            <ul className="space-y-2">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link href={link.href} {...externalProps(link.href)} className="group flex w-full items-center gap-2.5 text-zinc-400 hover:text-orange-500 transition text-[15px]">
                            <FaChevronRight className="text-[10px] text-zinc-600 group-hover:text-orange-500 group-hover:translate-x-0.5 transition" />
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
            {cta && (
                <Link href={cta.href} className="inline-flex items-center gap-2 text-orange-500 font-bold text-[15px] hover:gap-3 transition-all">
                    {cta.label} <FaArrowRight className="text-sm" />
                </Link>
            )}
            {children}
        </div>
    );
}
