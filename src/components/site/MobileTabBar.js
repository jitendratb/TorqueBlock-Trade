"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiFileText, FiHome, FiSearch, FiUser } from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";
import { useAuthStore } from "@/store/authStore";
import { selectUnits, useOrderListStore } from "@/store/orderStore";
import { useUiStore } from "@/store/uiStore";

const TAB = "relative flex flex-1 flex-col items-center justify-center gap-1 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors active:scale-95";
const tabTone = (active) => (active ? "text-orange-500" : "text-zinc-400 hover:text-white");

function ActiveDot({ active }) {
    return active ? <span aria-hidden="true" className="absolute top-0 h-0.5 w-8 rounded-full bg-orange-500" /> : null;
}

// Phone-only bottom navigation; md and up use the header.
export default function MobileTabBar() {
    const pathname = usePathname();
    const router = useRouter();
    const token = useAuthStore((s) => s.token);
    const units = useOrderListStore(selectUnits);
    const openLogin = useUiStore((s) => s.openLogin);
    const setOrderListOpen = useUiStore((s) => s.setOrderListOpen);

    const guarded = (path) => () => (token ? router.push(path) : openLogin());
    const isActive = (path) => (path === "/" ? pathname === "/" : pathname?.startsWith(path));

    const links = [
        { label: "Home", href: "/", Icon: FiHome },
        { label: "Search", href: "/search", Icon: FiSearch },
    ];
    const guardedTabs = [
        { label: "Orders", path: "/orders", Icon: FiFileText },
        { label: token ? "Account" : "Login", path: "/account", Icon: FiUser },
    ];

    return (
        <nav
            aria-label="Primary"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0B0F19]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        >
            <div className="mx-auto flex h-16 max-w-md items-stretch">
                {links.map(({ label, href, Icon }) => (
                    <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined} className={`${TAB} ${tabTone(isActive(href))}`}>
                        <ActiveDot active={isActive(href)} />
                        <Icon className="text-xl" />
                        {label}
                    </Link>
                ))}

                <button type="button" onClick={() => setOrderListOpen(true)} aria-label={`Cart, ${units} items`} className={`${TAB} ${tabTone(false)}`}>
                    <span className="relative">
                        <IoCartOutline className="text-[22px]" />
                        {units > 0 && (
                            <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-black leading-none text-white">
                                {units > 99 ? "99+" : units}
                            </span>
                        )}
                    </span>
                    Cart
                </button>

                {guardedTabs.map(({ label, path, Icon }) => (
                    <button
                        key={path}
                        type="button"
                        onClick={guarded(path)}
                        aria-current={isActive(path) ? "page" : undefined}
                        className={`${TAB} ${tabTone(isActive(path))}`}
                    >
                        <ActiveDot active={isActive(path)} />
                        <Icon className="text-xl" />
                        {label}
                    </button>
                ))}
            </div>
        </nav>
    );
}
