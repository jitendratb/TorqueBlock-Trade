"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IoMdMenu } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import {
    FiHome,
    FiFileText,
    FiUser,
    FiLogOut,
    FiTrendingUp,
    FiDisc,
    FiCompass,
    FiRepeat,
    FiChevronRight
} from "react-icons/fi";
import { Logo, Drawer } from "@/ui";
import { useUiStore } from "@/store/ui.store";
import { whatsappLink } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { useOrderListStore, selectUnits } from "@/store/orderStore";
import { useSettings } from "./SettingsProvider";

const CATALOG_LINKS = [
    { label: "Most Searched Tyres", Icon: FiTrendingUp },
    { label: "Explore Tyres", Icon: FiDisc },
    { label: "Shop by Motorcycle", Icon: FiCompass },
    { label: "Compare Tyres", Icon: FiRepeat },
];

const EXPERT_WHATSAPP_MESSAGE = "Hi Torque Block! I'd like to talk to a tyre expert about trade requirements and stock availability.";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const settings = useSettings();
    const token = useAuthStore((s) => s.token);
    const logout = useAuthStore((s) => s.logout);
    const units = useOrderListStore(selectUnits);
    const menuOpen = useUiStore((s) => s.menuOpen);
    const setMenuOpen = useUiStore((s) => s.setMenuOpen);
    const openLogin = useUiStore((s) => s.openLogin);
    const setOrderListOpen = useUiStore((s) => s.setOrderListOpen);
    const [scrolled, setScrolled] = useState(false);

    // Close the menu after navigation.
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname, setMenuOpen]);

    useEffect(() => {
        const onScroll = () => setScrolled((document.documentElement.scrollTop || document.body.scrollTop) > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const expertLink = whatsappLink(settings.contact?.whatsapp, EXPERT_WHATSAPP_MESSAGE);

    const handleNavigate = (path) => {
        setMenuOpen(false);
        router.push(path);
    };

    return (
        <div>
            <header className={`header-root fixed left-0 right-0 w-full z-50 transition-all duration-300 ease-in-out ${scrolled ? "bg-black/60 backdrop-blur-md shadow-lg" : "bg-black/30 backdrop-blur-sm"}`} data-scrolled={scrolled}>
                <nav className={`header-nav flex text-white justify-between items-center gap-2 md:gap-4 max-w-7xl mx-auto transition-all duration-300 ease-in-out ${scrolled ? "bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.4)]" : ""}`}>
                    {/* Brand Left: Company Logo + TRADE BUSINESS PORTAL */}
                    <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3.5 select-none group" aria-label="Torque Block Trade Home">
                        <Logo href={null} name={settings.companyName} priority className="w-[78px] min-[400px]:w-[92px] sm:w-[125px] md:w-[140px] shrink-0" />
                        <div className="h-6 sm:h-7 w-px bg-white/20 hidden sm:block" />
                        <div className="flex min-w-0 flex-col">
                            <span className="text-base min-[400px]:text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight text-orange-500 leading-none">
                                TRADE
                            </span>
                            <span className="hidden min-[400px]:block text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300 group-hover:text-white transition-colors leading-tight mt-0.5 whitespace-nowrap">
                                BUSINESS PORTAL
                            </span>
                        </div>
                    </Link>

                    {/* Right Action Buttons - Unified to Same Size (h-10, px-4, text-sm, rounded-xl) */}
                    <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-3">
                        {!token && (
                            <>
                                {/* Business Login Button */}
                                <button
                                    type="button"
                                    onClick={() => openLogin()}
                                    aria-label="Business Login"
                                    className="inline-flex h-9 w-9 sm:h-10 sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 sm:px-4 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/30 active:scale-95 shadow-sm whitespace-nowrap"
                                >
                                    <FiUser className="text-base text-zinc-300 shrink-0" />
                                    <span className="hidden sm:inline">Business Login</span>
                                </button>

                                {/* Register Your Business Button */}
                                <Link
                                    href="/register"
                                    aria-label="Register Your Business"
                                    className="inline-flex h-9 w-9 sm:h-10 sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 sm:px-4 text-sm font-bold text-white transition-all hover:bg-orange-600 shadow-md shadow-orange-500/25 active:scale-95 whitespace-nowrap"
                                >
                                    <FiFileText className="text-base text-white shrink-0" />
                                    <span className="hidden lg:inline">Register Your Business</span>
                                    <span className="hidden sm:inline lg:hidden">Register</span>
                                </Link>
                            </>
                        )}

                        {/* Cart Button */}
                        <button
                            type="button"
                            aria-label="Open order list"
                            onClick={() => setOrderListOpen(true)}
                            className="relative inline-flex h-9 w-9 sm:h-10 sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 sm:px-4 text-sm font-bold text-white transition-all hover:bg-white/20 active:scale-95 whitespace-nowrap"
                        >
                            <IoCartOutline className="text-lg shrink-0" />
                            <span className="hidden sm:inline">Cart</span>
                            {units > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 sm:static flex items-center justify-center min-w-5 h-5 px-1 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                                    {units}
                                </span>
                            )}
                        </button>

                        {/* Menu Drawer Button */}
                        <button
                            type="button"
                            aria-label="Open navigation menu"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen(true)}
                            className="inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95"
                        >
                            <IoMdMenu className="text-2xl" />
                        </button>
                    </div>
                </nav>
            </header>

            {/* Right-Side Flyout Drawer */}
            <Drawer
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                label="Menu"
                className="max-w-md w-full bg-[#0D111A]"
                header={<Logo href={null} name={settings.companyName} className="w-[120px] sm:w-[130px]" />}
            >
                <div className="flex flex-1 flex-col overflow-y-auto px-5 py-5 space-y-6 pb-6">
                    {/* CORE EXPLORATION */}
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF5B26] mb-3">
                            CORE EXPLORATION
                        </p>

                        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                            {/* HOME */}
                            <button
                                type="button"
                                onClick={() => handleNavigate("/")}
                                className={`rounded-2xl border transition-all p-3.5 text-left flex flex-col justify-between h-24 ${
                                    pathname === "/"
                                        ? "bg-[#181E2C] border-white/20 shadow-sm"
                                        : "bg-[#131823] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                                }`}
                            >
                                <FiHome className="text-xl text-zinc-300" />
                                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
                                    HOME
                                </span>
                            </button>

                            {/* MY ORDERS */}
                            <button
                                type="button"
                                onClick={() => handleNavigate("/orders")}
                                className={`rounded-2xl border transition-all p-3.5 text-left flex flex-col justify-between h-24 ${
                                    pathname === "/orders"
                                        ? "bg-[#251A18] border-[#FF5B26]/50 shadow-sm shadow-[#FF5B26]/10"
                                        : "bg-[#221818] border-[#FF5B26]/35 hover:border-[#FF5B26]/55 hover:bg-[#281b1b]"
                                }`}
                            >
                                <FiFileText className="text-xl text-[#FF5B26]" />
                                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#FF5B26]">
                                    MY ORDERS
                                </span>
                            </button>

                            {/* MY ACCOUNT */}
                            <button
                                type="button"
                                onClick={() => (token ? handleNavigate("/account") : openLogin())}
                                className={`rounded-2xl border transition-all p-3.5 text-left flex flex-col justify-between h-24 ${
                                    pathname === "/account"
                                        ? "bg-[#181E2C] border-white/20 shadow-sm"
                                        : "bg-[#131823] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                                }`}
                            >
                                <FiUser className="text-xl text-zinc-300" />
                                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
                                    MY ACCOUNT
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* CATALOGS */}
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF5B26] mb-3">
                            CATALOGS
                        </p>

                        <div className="space-y-2.5">
                            {CATALOG_LINKS.map(({ label, Icon }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => handleNavigate("/#stock")}
                                    className="w-full flex items-center justify-between rounded-2xl bg-[#131823] border border-white/10 px-4 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-white/[0.06] hover:border-white/20 transition group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="text-base text-[#FF5B26]" />
                                        <span>{label}</span>
                                    </div>
                                    <FiChevronRight className="text-zinc-600 text-sm group-hover:text-white transition" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions: Logout & Talk to a Tyre Expert */}
                    <div className="pt-4 space-y-3 mt-auto">
                        {token ? (
                            <button
                                type="button"
                                onClick={() => {
                                    logout();
                                    setMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#131823] border border-white/10 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-white/[0.08] hover:border-white/20 transition"
                            >
                                <FiLogOut className="text-base" />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    openLogin();
                                }}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#131823] border border-white/10 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-white/[0.08] hover:border-white/20 transition"
                            >
                                <FiUser className="text-base" />
                                <span>Trade Login</span>
                            </button>
                        )}

                        <a
                            href={expertLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#5B4DF6] via-[#6855FF] to-[#7E57FF] py-3.5 text-center text-xs sm:text-sm font-bold text-white shadow-[0_10px_25px_-5px_rgba(107,87,255,0.45)] hover:brightness-110 active:scale-[0.99] transition"
                        >
                            Talk to a Tyre Expert
                        </a>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
