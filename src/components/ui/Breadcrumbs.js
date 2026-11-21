import Link from "next/link";
import clsx from "clsx";

export default function Breadcrumbs({
    items = [],
    separator = "›",
    variant = "portal", // "portal" | "subtle" | "centered"
    className,
}) {
    const linkStyles = {
        portal: "text-sky-400 hover:text-sky-300 transition-colors",
        subtle: "text-zinc-300 hover:text-orange-400 transition-colors font-medium",
        centered: "text-zinc-500 hover:text-orange-400 transition-colors",
    };

    const currentStyles = {
        portal: "text-white font-bold",
        subtle: "text-white font-bold truncate",
        centered: "text-orange-400",
    };

    return (
        <nav
            aria-label="Breadcrumb"
            className={clsx(
                "flex items-center gap-1.5 sm:gap-2 text-xs font-semibold",
                variant === "portal" && "sm:text-sm pt-1",
                variant === "subtle" && "sm:text-[13px] md:text-sm truncate",
                variant === "centered" && "flex-wrap justify-center",
                className
            )}
        >
            <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                {items.map((item, idx) => {
                    const isLast = idx === items.length - 1;
                    return (
                        <li key={`${item.label}-${idx}`} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            {isLast || !item.href ? (
                                <span
                                    className={currentStyles[variant] || currentStyles.portal}
                                    aria-current={isLast ? "page" : undefined}
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link href={item.href} className={clsx("shrink-0", linkStyles[variant] || linkStyles.portal)}>
                                    {item.label}
                                </Link>
                            )}
                            {!isLast && (
                                <span aria-hidden="true" className="text-zinc-600 select-none shrink-0">
                                    {separator}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

