import Link from "next/link";
import clsx from "clsx";
import { Logo } from "@/components/ui";

// The one brand mark (logo | TRADE / BUSINESS PORTAL) used in the header,
// the menu drawer and the footer. Sizes live here only, so all three always
// render identically at every breakpoint.
export default function BrandLockup({ name, href = "/", priority = false, className }) {
    const inner = (
        <>
            <Logo
                href={null}
                name={name}
                priority={priority}
                className="w-[80px] min-[360px]:w-[90px] sm:w-[108px] lg:w-[125px] shrink-0"
            />
            <span aria-hidden="true" className="block h-5 sm:h-6 lg:h-7 w-px shrink-0 bg-white/20" />
            <span className="flex shrink-0 flex-col">
                <span className="text-[13px] min-[360px]:text-sm sm:text-base lg:text-xl font-black uppercase tracking-tight leading-none text-orange-500">
                    TRADE
                </span>
                <span className="mt-0.5 whitespace-nowrap text-[6px] min-[360px]:text-[6.5px] sm:text-[7.5px] lg:text-[8.5px] font-black uppercase leading-tight tracking-[0.14em] sm:tracking-[0.16em] text-zinc-300 transition-colors group-hover:text-white">
                    BUSINESS PORTAL
                </span>
            </span>
        </>
    );

    const classes = clsx("group inline-flex shrink-0 items-center gap-2 sm:gap-3 select-none", className);

    if (!href) return <span className={classes}>{inner}</span>;

    return (
        <Link href={href} className={classes} aria-label={`${name || "Torque Block"} Trade home`}>
            {inner}
        </Link>
    );
}
