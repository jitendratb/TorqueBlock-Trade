"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { FiCreditCard, FiFileText, FiHome, FiLogOut, FiPackage, FiSearch, FiTruck, FiUser } from "react-icons/fi";
import { IoMdMenu } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import clsx from "clsx";
import { Button, Drawer, ListButton } from "@/components/ui";
import { CartCountBadge } from "@/components/orders/CartTitle";
import BrandLockup from "./BrandLockup";
import { POLICIES } from "@/constants/policies";
import { useSettings } from "@/context/SettingsContext";
import { whatsappLink } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { selectUnits, useOrderListStore } from "@/store/orderStore";
import { useUiStore } from "@/store/uiStore";

const PORTAL_NAV = [
    { label: "Home", path: "/", Icon: FiHome },
    { label: "My Orders", path: "/orders", Icon: FiFileText },
];

const TRADE_SERVICES = [
    { title: "Live Stock & Inventory", path: "/search", Icon: FiPackage },
    { title: "Tyre Size & Fitment Search", path: "/search", Icon: FiSearch },
    { title: "Trade Credit & Invoicing", path: "/account", requireAuth: true, Icon: FiCreditCard },
    { title: "Order Tracking", path: "/orders", requireAuth: true, Icon: FiTruck },
];

const EXPERT_WHATSAPP_MESSAGE = "Hi Torque Block! I'd like to talk to a tyre expert about trade requirements and stock availability.";

function SectionLabel({ children }) {
    return (
        <p className="mb-3 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#FF5B26]">
            {children}
            <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
        </p>
    );
}

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

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname, setMenuOpen]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const expertLink = whatsappLink(settings.contact?.whatsapp, EXPERT_WHATSAPP_MESSAGE);
    const closeMenu = () => setMenuOpen(false);
    const go = (path, requireAuth = false) => () => {
        if (requireAuth && !token) return openLogin();
        closeMenu();
        router.push(path);
    };

    return (
        <div>
            {/* Same behaviour as the main website header: full-width frosted bar at the top,
                floating rounded pill (1rem from the top) once the page is scrolled. */}
            <header
                data-scrolled={scrolled}
                className={`fixed inset-x-0 z-50 w-full pointer-events-none transition-all duration-300 ease-in-out ${scrolled
                    ? "top-4 bg-transparent" : "top-0 bg-white/20 backdrop-blur-sm"}`}
            >
                <nav
                    data-scrolled={scrolled}
                    className={`pointer-events-auto mx-auto flex w-full max-w-7xl items-center justify-between gap-2 md:gap-4 rounded-2xl border p-4 text-white transition-all duration-300 ease-in-out ${scrolled
                        ? "border-white/30 bg-white/20 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)]" : "border-transparent"}`}
                >
                    <BrandLockup name={settings.companyName} priority />

                    <div className="flex shrink-0 items-center justify-end gap-2 md:gap-4">
                        {!token && (
                            <>
                                <Button
                                    variant="glass"
                                    size="md"
                                    uppercase={false}
                                    onClick={() => openLogin()}
                                    icon={<FiUser className="text-zinc-300" />}
                                    className="hidden md:inline-flex"
                                >
                                    Business Login
                                </Button>
                                <Button
                                    href="/register"
                                    variant="primary"
                                    size="md"
                                    uppercase={false}
                                    icon={<FiFileText />}
                                    className="hidden md:inline-flex"
                                >
                                    <span className="hidden lg:inline">Register Your Business</span>
                                    <span className="lg:hidden">Register</span>
                                </Button>
                            </>
                        )}

                        <Button
                            variant="header"
                            size="md"
                            uppercase={false}
                            aria-label="Open cart"
                            onClick={() => setOrderListOpen(true)}
                            icon={<IoCartOutline className="text-xl" />}
                            className="relative hidden md:inline-flex px-4"
                            badge={
                                units > 0 ? (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white shadow-lg">
                                        {units}
                                    </span>
                                ) : null
                            }
                        >
                            Cart
                        </Button>

                        <Button
                            variant="header"
                            size="md"
                            iconOnly
                            aria-label="Open navigation menu"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen(true)}
                            icon={<IoMdMenu className="text-2xl" />}
                            className="!w-10"
                        />
                    </div>
                </nav>
            </header>

            <Drawer
                open={menuOpen}
                onClose={closeMenu}
                label="Menu"
                className="w-full sm:max-w-[360px]"
                header={<BrandLockup name={settings.companyName} href={null} />}
            >
                <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5">
                    <section>
                        <SectionLabel>Portal Navigation</SectionLabel>
                        <div className="grid grid-cols-2 gap-3">
                            {PORTAL_NAV.map(({ label, path, Icon }) => {
                                const active = pathname === path;
                                return (
                                    <button
                                        key={path}
                                        type="button"
                                        onClick={go(path)}
                                        aria-current={active ? "page" : undefined}
                                        className={clsx(
                                            "flex h-[4.5rem] flex-col justify-between rounded-xl border p-3 text-left transition-colors",
                                            active
                                                ? "border-orange-500/50 bg-orange-500/15 text-[#FF5B26]"
                                                : "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-white/20 hover:bg-white/[0.08]"
                                        )}
                                    >
                                        <Icon className="text-xl" />
                                        <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="md:hidden">
                        <SectionLabel>Shopping Cart</SectionLabel>
                        <ListButton
                            onClick={() => setOrderListOpen(true)}
                            icon={<IoCartOutline />}
                            title="Shopping Cart"
                            trailing={units > 0 ? <CartCountBadge units={units} /> : undefined}
                        />
                    </section>

                    <section>
                        <SectionLabel>Trade Services</SectionLabel>
                        <div className="space-y-2.5">
                            {TRADE_SERVICES.map(({ title, path, requireAuth, Icon }) => (
                                <ListButton key={title} onClick={go(path, requireAuth)} icon={<Icon />} title={title} />
                            ))}
                        </div>
                    </section>

                    <section>
                        <SectionLabel>Support</SectionLabel>
                        <div className="space-y-2.5">
                            {expertLink && <ListButton href={expertLink} icon={<FaWhatsapp />} title="Talk to a Tyre Expert" />}
                            {POLICIES.map(({ label, href, Icon }) => (
                                <ListButton key={href} href={href} onClick={closeMenu} icon={<Icon />} title={label} />
                            ))}
                        </div>
                    </section>
                </div>

                <div className="shrink-0 border-t border-white/[0.06] p-4">
                    {token ? (
                        <Button
                            variant="subtle"
                            size="lg"
                            uppercase={false}
                            full
                            icon={<FiLogOut />}
                            onClick={() => {
                                logout();
                                closeMenu();
                            }}
                        >
                            Logout
                        </Button>
                    ) : (
                        <div className="grid grid-cols-2 gap-2.5">
                            <Button variant="subtle" size="lg" uppercase={false} full icon={<FiUser className="text-orange-400" />} onClick={() => openLogin()}>
                                Login
                            </Button>
                            <Button href="/register" variant="primary" size="lg" uppercase={false} full icon={<FiFileText />} onClick={closeMenu}>
                                Register
                            </Button>
                        </div>
                    )}
                </div>
            </Drawer>
        </div>
    );
}
