"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IoMdMenu } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { FiHome, FiFileText, FiTrendingUp, FiDisc, FiCompass, FiRepeat, FiChevronRight, FiLogOut, FiUser } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Button from "@/ui/Button";
import Logo from "@/ui/Logo";
import { Drawer } from "@/ui/Overlay";
import { useUiStore } from "@/store/ui.store";
import { whatsappLink } from "@/lib/format";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useOrderListStore, selectUnits } from "@/modules/orders/orderList.store";
import { useSettings } from "../SettingsProvider";
import { NAV_LINKS } from "../site.routes";

const STATUS_LABEL = {
    approved: "Verified Dealer",
    pending: "Under Review",
    rejected: "Update Details",
    none: "Complete Registration"
};

const RIDERS_CHOICE = [
    "Scorpion Rally STR",
    "Scorpion Trail III",
    "Michelin Road 6",
    "Anakee Adventure",
    "Tourance Next 2",
    "Metzeler Cruisetec"
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const settings = useSettings();
    const profile = useAuthStore((s) => s.profile);
    const token = useAuthStore((s) => s.token);
    const logout = useAuthStore((s) => s.logout);
    const units = useOrderListStore(selectUnits);
    const menuOpen = useUiStore((s) => s.menuOpen);
    const setMenuOpen = useUiStore((s) => s.setMenuOpen);
    const openLogin = useUiStore((s) => s.openLogin);
    const setOrderListOpen = useUiStore((s) => s.setOrderListOpen);
    const [scrolled, setScrolled] = useState(false);

    // Close the menu after navigation. This writes to the shared UI store, so it must run in an
    // effect — updating a store while rendering triggers React's "setState in render" error.
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname, setMenuOpen]);

    useEffect(() => {
        const onScroll = () => setScrolled((document.documentElement.scrollTop || document.body.scrollTop) > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const accountLabel = token ? STATUS_LABEL[profile?.dealerStatus] || "My Account" : "Dealer Login";
    const contact = settings.contact || {};
    const expertWhatsappMessage = "Hi Torque Block! I'd like to talk to a tyre expert about dealer requirements and stock availability.";
    const expertLink = whatsappLink(contact.whatsapp || "916366625625", expertWhatsappMessage);

    const handleNavigate = (path) => {
        setMenuOpen(false);
        router.push(path);
    };

    const handleRiderChoice = (tyreName) => {
        setMenuOpen(false);
        router.push(`/?q=${encodeURIComponent(tyreName)}#stock`);
    };

    return (
        <div>
            <header className={`header-root fixed left-0 right-0 w-full z-50 transition-all duration-300 ease-in-out ${scrolled ? "bg-transparent" : "bg-white/20 backdrop-blur-sm"}`} data-scrolled={scrolled}>
                <nav className={`header-nav flex text-white justify-between items-center gap-2 md:gap-4 max-w-7xl mx-auto transition-all duration-300 ease-in-out ${scrolled ? "bg-white/20 backdrop-blur-sm border border-white/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" : ""}`}>
                    <Logo name={settings.companyName} priority />

                    <ul className="hidden lg:flex items-center gap-6">
                        {NAV_LINKS.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href} className={`nav-link text-sm font-bold ${pathname === item.href ? "active" : ""}`}>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center justify-end gap-2 md:gap-3">
                        <Button variant="glass" size="md" className="relative !px-3 md:!px-4" aria-label="Open order list" onClick={() => setOrderListOpen(true)}>
                            <IoCartOutline className="text-xl" />
                            <span className="hidden sm:block">Cart</span>
                            {units > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-5 h-5 px-1 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                                    {units}
                                </span>
                            )}
                        </Button>

                        <Button variant="glass" size="md" className="!px-0 w-10" aria-label="Open navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
                            <IoMdMenu className="text-2xl" />
                        </Button>
                    </div>
                </nav>
            </header>

            {/* Right-Side Flyout Drawer matching Image 2 */}
            <Drawer
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                label="Menu"
                className="max-w-md w-full bg-[#10141D]"
                header={<Logo href={null} name={settings.companyName} className="w-[110px]" />}
            >
                <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4 divide-y divide-white/5 space-y-5">
                    {/* CORE EXPLORATION */}
                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF5B26]">
                                CORE EXPLORATION
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {/* HOME Card */}
                            <button
                                type="button"
                                onClick={() => handleNavigate("/")}
                                className={`rounded-2xl border transition-all p-4 text-left flex flex-col justify-between h-24 ${pathname === "/"
                                    ? "bg-[#181E2C] border-white/20 shadow-sm"
                                    : "bg-[#151A24] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                                    }`}
                            >
                                <FiHome className="text-xl text-zinc-300" />
                                <span className="text-xs font-black uppercase tracking-wider text-white">
                                    HOME
                                </span>
                            </button>

                            {/* MY ORDERS Card */}
                            <button
                                type="button"
                                onClick={() => handleNavigate("/orders")}
                                className={`rounded-2xl border transition-all p-4 text-left flex flex-col justify-between h-24 ${pathname === "/orders"
                                    ? "bg-[#251A18] border-[#FF5B26]/40 shadow-sm shadow-[#FF5B26]/5"
                                    : "bg-[#1E1719] border-[#FF5B26]/20 hover:border-[#FF5B26]/40 hover:bg-[#251A18]"
                                    }`}
                            >
                                <FiFileText className="text-xl text-[#FF5B26]" />
                                <span className="text-xs font-black uppercase tracking-wider text-[#FF5B26]">
                                    MY ORDERS
                                </span>
                            </button>

                            {/* MY ACCOUNT Card */}
                            <button
                                type="button"
                                onClick={() => (token ? handleNavigate("/account") : openLogin())}
                                className={`rounded-2xl border transition-all p-4 text-left flex flex-col justify-between h-24 ${pathname === "/account"
                                    ? "bg-[#181E2C] border-white/20 shadow-sm"
                                    : "bg-[#151A24] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                                    }`}
                            >
                                <FiUser className="text-xl text-zinc-300" />
                                <span className="text-xs font-black uppercase tracking-wider text-white">
                                    {token ? "MY ACCOUNT" : "LOGIN"}
                                </span>
                            </button>

                        </div>
                    </div>

                    {/* CATALOGS */}
                    <div className="pt-5">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF5B26] mb-3">
                            CATALOGS
                        </p>

                        <div className="space-y-2">
                            {/* Most Searched Tyres */}
                            <button
                                type="button"
                                onClick={() => handleNavigate("/#stock")}
                                className="w-full flex items-center justify-between rounded-2xl bg-[#151A24] border border-white/5 px-4 py-3.5 text-xs font-bold text-white hover:bg-white/[0.05] hover:border-white/15 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <FiTrendingUp className="text-base text-[#FF5B26]" />
                                    <span>Most Searched Tyres</span>
                                </div>
                                <FiChevronRight className="text-zinc-600 group-hover:text-white transition" />
                            </button>

                            {/* Explore Tyres */}
                            <button
                                type="button"
                                onClick={() => handleNavigate("/#stock")}
                                className="w-full flex items-center justify-between rounded-2xl bg-[#151A24] border border-white/5 px-4 py-3.5 text-xs font-bold text-white hover:bg-white/[0.05] hover:border-white/15 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <FiDisc className="text-base text-[#FF8A3D]" />
                                    <span>Explore Tyres</span>
                                </div>
                                <FiChevronRight className="text-zinc-600 group-hover:text-white transition" />
                            </button>

                            {/* Shop by Motorcycle */}
                            <button
                                type="button"
                                onClick={() => handleNavigate("/#stock")}
                                className="w-full flex items-center justify-between rounded-2xl bg-[#151A24] border border-white/5 px-4 py-3.5 text-xs font-bold text-white hover:bg-white/[0.05] hover:border-white/15 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <FiCompass className="text-base text-[#FF8A3D]" />
                                    <span>Shop by Motorcycle</span>
                                </div>
                                <FiChevronRight className="text-zinc-600 group-hover:text-white transition" />
                            </button>

                            {/* Compare Tyres */}
                            <button
                                type="button"
                                onClick={() => handleNavigate("/#stock")}
                                className="w-full flex items-center justify-between rounded-2xl bg-[#151A24] border border-white/5 px-4 py-3.5 text-xs font-bold text-white hover:bg-white/[0.05] hover:border-white/15 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <FiRepeat className="text-base text-[#FF8A3D]" />
                                    <span>Compare Tyres</span>
                                </div>
                                <FiChevronRight className="text-zinc-600 group-hover:text-white transition" />
                            </button>
                        </div>
                    </div>

                    {/* Rider's Choice */}
                    <div className="pt-5">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF5B26] mb-3">
                            Rider&apos;s Choice
                        </p>

                        <div className="grid grid-cols-2 gap-2.5">
                            {RIDERS_CHOICE.map((tyre) => (
                                <button
                                    key={tyre}
                                    type="button"
                                    onClick={() => handleRiderChoice(tyre)}
                                    className="rounded-xl bg-[#151A24] border border-white/5 px-3.5 py-3 text-xs font-bold text-zinc-300 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition text-left"
                                >
                                    {tyre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions: Logout & Talk to a Tyre Expert */}
                    <div className="pt-5 space-y-3 mt-auto">
                        {token ? (
                            <button
                                type="button"
                                onClick={() => {
                                    logout();
                                    setMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#151A24] border border-white/10 py-3.5 text-xs font-bold text-white hover:bg-white/[0.08] transition"
                            >
                                <FiLogOut className="text-sm" /> Logout
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    openLogin();
                                }}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#151A24] border border-white/10 py-3.5 text-xs font-bold text-white hover:bg-white/[0.08] transition"
                            >
                                <FiUser className="text-sm" /> Dealer Login
                            </button>
                        )}

                        <a
                            href={expertLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5B4DF6] via-[#6B57FF] to-[#7E57FF] py-3.5 text-center text-xs font-black text-white shadow-[0_10px_25px_-5px_rgba(107,87,255,0.4)] hover:brightness-110 active:scale-[0.99] transition"
                        >
                            Talk to a Tyre Expert
                        </a>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}

