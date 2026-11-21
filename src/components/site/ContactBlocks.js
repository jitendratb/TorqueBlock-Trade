import Link from "next/link";
import { FaInstagram, FaFacebookF, FaYoutube, FaLinkedinIn, FaPhoneAlt, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaChevronRight, FaArrowRight, FaGlobe } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { whatsappLink } from "@/lib/format";

const SOCIAL_ICONS = { instagram: FaInstagram, facebook: FaFacebookF, youtube: FaYoutube, linkedin: FaLinkedinIn, x: FaXTwitter, twitter: FaXTwitter };

const externalProps = (href = "") => (/^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {});

export function ContactLinks({ contact }) {
    if (!contact) return null;
    const items = [
        contact.whatsapp && { href: whatsappLink(contact.whatsapp, contact.whatsappMessage), icon: FaWhatsapp, label: "WhatsApp Us", hover: "hover:text-green-400" },
        contact.phone && { href: `tel:${contact.phone}`, icon: FaPhoneAlt, label: contact.phoneDisplay || contact.phone },
        contact.email && { href: `mailto:${contact.email}`, icon: FaEnvelope, label: contact.email },
    ].filter(Boolean);

    return (
        <ul className="space-y-3.5">
            {items.map(({ href, icon: Icon, label, hover = "hover:text-white" }) => (
                <li key={href}>
                    <a href={href} {...externalProps(href)} className={`flex w-fit items-center gap-3 text-zinc-200 transition-colors ${hover}`}>
                        <Icon className="shrink-0 text-base text-zinc-300" />
                        <span className="text-[15px] break-all">{label}</span>
                    </a>
                </li>
            ))}
        </ul>
    );
}

export function HubList({ hubs = [] }) {
    if (!hubs.length) return null;
    return (
        <ul className="space-y-5">
            {hubs.map((hub) => (
                <li key={hub.name}>
                    <a href={hub.mapUrl} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 text-zinc-400 transition-colors hover:text-white">
                        <FaMapMarkerAlt className="mt-0.5 shrink-0 text-base text-orange-500" />
                        <span className="min-w-0">
                            <span className="mb-1 block text-xs font-black uppercase tracking-wider text-orange-500">{hub.name}</span>
                            <span className="block max-w-sm text-[13px] leading-5">{hub.address}</span>
                            {hub.mapUrl && (
                                <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-orange-400 transition-colors group-hover:text-orange-300">
                                    View on Map <FaChevronRight className="text-[8px]" />
                                </span>
                            )}
                        </span>
                    </a>
                </li>
            ))}
        </ul>
    );
}

export function SocialLinks({ socials = [], companyName }) {
    if (!socials.length) return null;
    return (
        <div className="flex items-center gap-3">
            {socials.map(({ platform, label, href }) => {
                const Icon = SOCIAL_ICONS[platform?.toLowerCase()] || FaGlobe;
                return (
                    <a
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Follow ${companyName || "us"} on ${label}`}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition-all duration-300 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                    >
                        <Icon />
                    </a>
                );
            })}
        </div>
    );
}

const LINK_ROW = "group flex w-full items-center gap-2.5 py-0.5 text-left text-[15px] text-zinc-400 transition-colors hover:text-orange-400 cursor-pointer";

// Links are { label, href } or, for actions like opening the login modal, { label, onClick }.
export function LinkColumn({ icon: Icon, title, links = [], cta, className }) {
    return (
        <div className={className}>
            <h3 className="mb-5 flex items-center gap-3 text-lg lg:text-xl font-bold text-white">
                <Icon className="shrink-0 text-2xl text-orange-500" />
                {title}
            </h3>
            <ul className="space-y-2.5">
                {links.map((link) => {
                    const content = (
                        <>
                            <FaChevronRight className="shrink-0 text-[10px] text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-orange-400" />
                            <span>{link.label}</span>
                        </>
                    );
                    return (
                        <li key={link.label}>
                            {link.onClick ? (
                                <button type="button" onClick={link.onClick} className={LINK_ROW}>{content}</button>
                            ) : (
                                <Link href={link.href} {...externalProps(link.href)} className={LINK_ROW}>{content}</Link>
                            )}
                        </li>
                    );
                })}
            </ul>
            {cta && (
                <Link href={cta.href} className="group mt-4 inline-flex items-center gap-2 text-base font-bold text-orange-500 transition-colors hover:text-orange-400">
                    {cta.label}
                    <FaArrowRight className="text-sm transition-transform group-hover:translate-x-0.5" />
                </Link>
            )}
        </div>
    );
}
