"use client";

import { whatsappLink } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { selectUnits, useOrderListStore } from "@/store/orderStore";
import { useUiStore } from "@/store/ui.store";
import { Drawer, Logo } from "@/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiChevronRight, FiCreditCard, FiFileText, FiHome, FiLogOut, FiPackage, FiRotateCcw, FiSearch, FiShield, FiTruck, FiUser } from "react-icons/fi";
import { IoMdMenu } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { useSettings } from "./SettingsProvider";

const TRADE_SERVICES = [
    {
        title: "Live Stock & Inventory",
        subtitle: "Real-time tyre availability & quantities",
        path: "/stock",
        Icon: FiPackage,
    },
    {
        title: "Tyre Size & Fitment Search",
        subtitle: "Instant lookup by width, profile, rim & bike",
        path: "/search",
        Icon: FiSearch,
    },
    {
        title: "Trade Credit & Invoicing",
        subtitle: "18% GST input tax credit & credit terms",
        path: "/account",
        requireAuth: true,
        Icon: FiCreditCard,
    },
    {
        title: "Order Tracking & LR",
        subtitle: "Real-time courier dispatch status & tracking",
        path: "/orders",
        requireAuth: true,
        Icon: FiTruck,
    },
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
        const onScroll = () => {
            const top = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
            setScrolled(top > 12);
        };
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
            <header
                data-scrolled={scrolled}
                className={`fixed top-0 left-0 right-0 w-full z-50 pointer-events-none transition-all duration-300 ${scrolled
                    ? "pt-1.5 sm:pt-2 px-2.5 sm:px-6 lg:px-8 bg-transparent"
                    : "pt-0 px-0 bg-white/[0.11] backdrop-blur-xl border-b border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                    }`}
                style={
                    !scrolled ? {
                        background: "rgba(255, 255, 255, 0.11)",
                        backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 100%)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                    } : undefined
                }
            >
                <nav
                    data-scrolled={scrolled}
                    className={`pointer-events-auto mx-auto w-full max-w-7xl flex items-center justify-between gap-2.5 min-[360px]:gap-3 sm:gap-4 lg:gap-6 text-white transition-all duration-300 ${scrolled
                        ? "glass-header-pill backdrop-blur-xl px-3.5 min-[360px]:px-4 sm:px-5 md:px-6 lg:px-7 py-2 sm:py-2.5 lg:py-2.5 rounded-2xl lg:rounded-3xl min-h-[54px] sm:min-h-[58px] lg:min-h-[62px]"
                        : "px-4 min-[360px]:px-5 sm:px-6 md:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3 rounded-none min-h-[56px] sm:min-h-[60px] lg:min-h-[64px]"
                        }`}
                    style={
                        scrolled ? {
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                        } : undefined
                    }
                >
                    {/* Brand Left: Company Logo + TRADE BUSINESS PORTAL */}
                    <Link href="/" className="flex shrink-0 items-center gap-2 min-[360px]:gap-2.5 sm:gap-3 select-none group" aria-label="Torque Block Trade Home">
                        <Logo
                            href={null}
                            name={settings.companyName}
                            priority
                            className="w-[74px] min-[360px]:w-[84px] min-[400px]:w-[95px] sm:w-[108px] md:w-[115px] lg:w-[125px] h-auto shrink-0"
                        />
                        <span className="h-5 min-[360px]:h-5.5 sm:h-6 md:h-6.5 lg:h-7 w-px bg-white/20 shrink-0 block" />
                        <span className="flex shrink-0 flex-col">
                            <span className="text-xs min-[360px]:text-sm min-[400px]:text-[15px] sm:text-base md:text-lg lg:text-xl font-black uppercase tracking-tight text-orange-500 leading-none">TRADE</span>
                            <span className="text-[5.5px] min-[360px]:text-[6.5px] min-[400px]:text-[7px] sm:text-[7.5px] md:text-[8px] lg:text-[8.5px] font-black uppercase tracking-[0.12em] min-[360px]:tracking-[0.14em] sm:tracking-[0.16em] text-zinc-300 group-hover:text-white transition-colors leading-tight mt-0.5 whitespace-nowrap">BUSINESS PORTAL</span>
                        </span>
                    </Link>

                    {/* Right Action Buttons */}
                    <div className="flex shrink-0 items-center justify-end gap-1.5 min-[360px]:gap-2 sm:gap-2.5">
                        {!token && (
                            <>
                                {/* Business Login Button - Hidden on mobile, visible on tablet & laptop */}
                                <button
                                    type="button"
                                    onClick={() => openLogin()}
                                    aria-label="Business Login"
                                    className="hidden md:inline-flex h-9 sm:h-9.5 lg:h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#161B26]/85 hover:bg-[#1F2636] hover:border-white/25 backdrop-blur-sm px-3 lg:px-4 text-xs lg:text-[13px] font-semibold text-white transition-all active:scale-95 shadow-sm whitespace-nowrap"
                                >
                                    <FiUser className="text-sm text-zinc-300 shrink-0" />
                                    <span>Business Login</span>
                                </button>

                                {/* Register Your Business Button - Hidden on mobile, visible on tablet & laptop */}
                                <Link
                                    href="/register"
                                    aria-label="Register Your Business"
                                    className="hidden md:inline-flex h-9 sm:h-9.5 lg:h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-3 lg:px-4 text-xs lg:text-[13px] font-bold text-white transition-all hover:bg-orange-600 shadow-md shadow-orange-500/25 active:scale-95 whitespace-nowrap"
                                >
                                    <FiFileText className="text-sm text-white shrink-0" />
                                    <span className="hidden lg:inline">Register Your Business</span>
                                    <span className="inline lg:hidden">Register</span>
                                </Link>
                            </>
                        )}

                        {/* Cart Button */}
                        <button
                            type="button"
                            aria-label="Open order list"
                            onClick={() => setOrderListOpen(true)}
                            className="relative inline-flex h-9 min-[360px]:h-9.5 lg:h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#161B26]/85 hover:bg-[#1F2636] hover:border-white/25 backdrop-blur-sm px-2.5 min-[360px]:px-3 sm:px-3.5 text-xs lg:text-[13px] font-bold text-white transition-all active:scale-95 shadow-sm whitespace-nowrap"
                        >
                            <IoCartOutline className="text-base sm:text-lg shrink-0 text-white" />
                            <span className="hidden sm:inline">Cart</span>
                            {units > 0 && (
                                <span className="flex items-center justify-center min-w-4.5 h-4.5 px-1 bg-orange-500 text-white text-[9px] font-bold rounded-full shadow-lg"> {units} </span>
                            )}
                        </button>

                        {/* Menu Drawer Button */}
                        <button
                            type="button"
                            aria-label="Open navigation menu"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen(true)}
                            className="inline-flex h-9 w-9 min-[360px]:h-9.5 min-[360px]:w-9.5 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#161B26]/85 hover:bg-[#1F2636] hover:border-white/25 backdrop-blur-sm text-white transition-all active:scale-95 shadow-sm"
                        >
                            <IoMdMenu className="text-lg sm:text-xl text-white" />
                        </button>
                    </div>
                </nav>
            </header>

            {/* Right-Side Flyout Drawer */}
            <Drawer
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                label="Menu"
                className="max-w-md w-full bg-[#0D111A]/95 backdrop-blur-2xl border-l border-white/10"
                header={
                    <div className="flex items-center gap-2">
                        <Logo href={null} name={settings.companyName} className="w-[84px] sm:w-[100px] shrink-0" />
                        <span className="h-5 sm:h-6 w-px bg-white/20 shrink-0 block" />
                        <span className="flex flex-col">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-orange-500 leading-none"> TRADE </span>
                            <span className="text-[6.5px] sm:text-[8px] font-black uppercase tracking-[0.14em] text-zinc-300 leading-tight mt-0.5 whitespace-nowrap"> BUSINESS PORTAL </span>
                        </span>
                    </div>
                }
            >
                <div className="flex flex-1 flex-col overflow-y-auto px-4 sm:px-5 py-4 sm:py-5 space-y-5 sm:space-y-6 pb-6">
                    {/* Unauthenticated Quick Access - Mobile Phone Only */}
                    {!token && (
                        <div className="grid grid-cols-2 gap-2.5 sm:hidden">
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    openLogin();
                                }}
                                className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3 px-3 text-xs font-bold text-white hover:bg-white/10 active:scale-95 transition"
                            >
                                <FiUser className="text-sm text-orange-400" />
                                <span>Business Login</span>
                            </button>
                            <Link
                                href="/register"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3 px-3 text-xs font-bold text-white hover:bg-orange-600 shadow-md shadow-orange-500/20 active:scale-95 transition"
                            >
                                <FiFileText className="text-sm" />
                                <span>Register</span>
                            </Link>
                        </div>
                    )}

                    {/* PORTAL NAVIGATION */}
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF5B26] mb-3"> PORTAL NAVIGATION </p>

                        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                            {/* HOME */}
                            <button
                                type="button"
                                onClick={() => handleNavigate("/")}
                                className={`rounded-2xl border transition-all p-3.5 text-left flex flex-col justify-between h-24 ${pathname === "/"
                                    ? "bg-orange-500/15 border-orange-500/40 shadow-sm shadow-orange-500/10 backdrop-blur-sm"
                                    : "bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.08] backdrop-blur-sm"
                                    }`}
                            >
                                <FiHome className="text-xl text-zinc-300" />
                                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white"> HOME </span>
                            </button>

                            {/* MY ORDERS */}
                            <button
                                type="button"
                                onClick={() => handleNavigate("/orders")}
                                className={`rounded-2xl border transition-all p-3.5 text-left flex flex-col justify-between h-24 ${pathname === "/orders"
                                    ? "bg-orange-500/15 border-orange-500/40 shadow-sm shadow-orange-500/10 backdrop-blur-sm"
                                    : "bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.08] backdrop-blur-sm"
                                    }`}
                            >
                                <FiFileText className="text-xl text-[#FF5B26]" />
                                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#FF5B26]"> MY ORDERS </span>
                            </button>

                            {/* MY ACCOUNT */}
                            <button
                                type="button"
                                onClick={() => (token ? handleNavigate("/account") : openLogin())}
                                className={`rounded-2xl border transition-all p-3.5 text-left flex flex-col justify-between h-24 ${pathname === "/account"
                                    ? "bg-orange-500/15 border-orange-500/40 shadow-sm shadow-orange-500/10 backdrop-blur-sm"
                                    : "bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.08] backdrop-blur-sm"
                                    }`}
                            >
                                <FiUser className="text-xl text-zinc-300" />
                                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
                                    MY ACCOUNT
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* TRADE SERVICES */}
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF5B26] mb-3">
                            TRADE SERVICES
                        </p>

                        <div className="space-y-2.5">
                            {TRADE_SERVICES.map((service) => (
                                <button
                                    key={service.title}
                                    type="button"
                                    onClick={() => {
                                        if (service.requireAuth && !token) {
                                            openLogin();
                                        } else {
                                            handleNavigate(service.path);
                                        }
                                    }}
                                    className="w-full flex items-center justify-between rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#FF5B26]/40 p-3 sm:p-3.5 text-left text-white backdrop-blur-sm transition group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-[#FF5B26] group-hover:scale-105 group-hover:bg-orange-500/20 transition-all">
                                            <service.Icon className="text-base sm:text-lg" />
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <div className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                                                {service.title}
                                            </div>
                                            <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
                                                {service.subtitle}
                                            </div>
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-zinc-600 text-sm group-hover:text-white group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* POLICIES & LEGAL */}
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF5B26] mb-3">
                            POLICIES & LEGAL
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                href="/policy-shipping"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 rounded-2xl bg-[#131823] border border-white/10 p-3 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/20 transition"
                            >
                                <FiTruck className="text-orange-400 text-base shrink-0" />
                                <span className="truncate">Shipping</span>
                            </Link>
                            <Link
                                href="/policy-return"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 rounded-2xl bg-[#131823] border border-white/10 p-3 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/20 transition"
                            >
                                <FiRotateCcw className="text-orange-400 text-base shrink-0" />
                                <span className="truncate">Returns</span>
                            </Link>
                            <Link
                                href="policy-terms"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 rounded-2xl bg-[#131823] border border-white/10 p-3 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/20 transition"
                            >
                                <FiFileText className="text-orange-400 text-base shrink-0" />
                                <span className="truncate">Terms</span>
                            </Link>
                            <Link
                                href="policy-privacy"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 rounded-2xl bg-[#131823] border border-white/10 p-3 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/20 transition"
                            >
                                <FiShield className="text-orange-400 text-base shrink-0" />
                                <span className="truncate">Privacy</span>
                            </Link>
                        </div>
                    </div>

                    {/* Actions: Logout & Talk to a Tyre Expert */}
                    <div className="pt-4 space-y-3 mt-auto">
                        {token && (
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
                        )}

                        <a
                            href={expertLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 py-3.5 text-center text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-500/25 active:scale-[0.99] transition"
                        >
                            <FaWhatsapp className="text-base sm:text-lg" />
                            <span>Talk to a Tyre Expert</span>
                        </a>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
