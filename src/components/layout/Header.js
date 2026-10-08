"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IoMdMenu } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { FiChevronRight, FiLogOut, FiUser, FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useTrade } from "@/context/TradeContext";
import { WHATSAPP_NUMBER } from "@/lib/presets";

const NAV_ITEMS = [
    { name: "Stock & Prices", href: "/" },
    { name: "Dealer Registration", href: "/register" },
];

const WHATSAPP_MESSAGE = "Hi Torque Block! I'm a dealer and want to check stock and place an order.";

export default function Header() {
    const pathname = usePathname();
    const { summary, setCartOpen, user, isDealer, setLoginOpen, logout } = useTrade();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPath, setMenuPath] = useState(pathname);

    // Close the menu after navigation.
    if (menuPath !== pathname) {
        setMenuPath(pathname);
        setMenuOpen(false);
    }

    useEffect(() => {
        const onScroll = () => setScrolled((document.documentElement.scrollTop || document.body.scrollTop) > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    const accountLabel = user ? (isDealer ? "Verified Dealer" : "Approval Pending") : "Dealer Login";

    return (
        <div>
            <header
                className={`header-root fixed left-0 right-0 w-full z-50 transition-all duration-300 ease-in-out ${scrolled ? "bg-transparent" : "bg-white/20 backdrop-blur-sm"}`}
                data-scrolled={scrolled}
            >
                <nav className={`header-nav flex text-white justify-between items-center gap-2 md:gap-4 max-w-7xl mx-auto transition-all duration-300 ease-in-out ${scrolled ? "bg-white/20 backdrop-blur-sm border border-white/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" : ""}`}>
                    <Link href="/" className="flex-shrink-0" aria-label="Torque Block Dealer Portal Home">
                        <Image src="/newlogo.webp" alt="Torque Block Logo" width={130} height={60} priority className="inline-block h-auto w-[100px] md:w-[130px]" style={{ objectFit: "contain", height: "auto" }} />
                    </Link>

                    <ul className="hidden lg:flex items-center gap-6">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href} className={`nav-link text-sm font-bold ${pathname === item.href ? "active" : ""}`}>
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center justify-end gap-2 md:gap-3">
                        <button
                            onClick={() => (user ? setMenuOpen(true) : setLoginOpen(true))}
                            className="hidden md:flex border border-gray-400 items-center justify-center h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white gap-2"
                        >
                            <FiUser className="text-lg" />
                            <span className="text-sm font-bold">{accountLabel}</span>
                        </button>

                        <button
                            onClick={() => setCartOpen(true)}
                            className="relative flex border border-gray-400 items-center justify-center h-10 px-3 md:px-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white gap-2"
                            aria-label="Open order list"
                        >
                            <IoCartOutline className="text-xl" />
                            <span className="text-sm font-bold hidden sm:block">Order List</span>
                            {summary.units > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-5 h-5 px-1 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                                    {summary.units}
                                </span>
                            )}
                        </button>

                        <button
                            aria-label="Open navigation menu"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen(true)}
                            className="flex justify-center items-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 border border-gray-400 text-white"
                        >
                            <IoMdMenu className="text-2xl" />
                        </button>
                    </div>
                </nav>
            </header>

            {menuOpen && (
                <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Menu">
                    <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <aside className="animate-drawer-in absolute right-0 top-0 flex h-full w-full max-w-xs flex-col gap-6 border-l border-white/10 bg-[#0B0F19] p-5 text-white">
                        <div className="flex items-center justify-between">
                            <Image src="/newlogo.webp" alt="Torque Block" width={110} height={50} className="h-auto w-[100px]" />
                            <button onClick={() => setMenuOpen(false)} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 hover:bg-white/10">
                                <FiX className="text-lg" />
                            </button>
                        </div>

                        {user ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">{accountLabel}</p>
                                <p className="mt-1 text-sm font-bold">{user.name || `+91 ${user.phone}`}</p>
                                {!isDealer && (
                                    <p className="mt-1 text-xs text-zinc-400">Our trade desk verifies your GSTIN and activates dealer pricing.</p>
                                )}
                                <button onClick={() => { logout(); setMenuOpen(false); }} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white">
                                    <FiLogOut /> Log out
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => { setMenuOpen(false); setLoginOpen(true); }} className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-black uppercase tracking-wider hover:bg-orange-600">
                                <FiUser /> Dealer Login
                            </button>
                        )}

                        <ul className="space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="group flex items-center justify-between rounded-xl px-3 py-3 text-base font-bold hover:bg-white/5 hover:text-orange-500">
                                        {item.name}
                                        <FiChevronRight className="text-zinc-600 group-hover:text-orange-500" />
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <a
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 py-3 text-sm font-bold text-green-400 hover:bg-green-500/20"
                        >
                            <FaWhatsapp className="text-lg" /> WhatsApp Us
                        </a>
                    </aside>
                </div>
            )}
        </div>
    );
}
