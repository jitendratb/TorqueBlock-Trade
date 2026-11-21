import Link from "next/link";
import clsx from "clsx";
import { FiChevronRight } from "react-icons/fi";

const BASE =
    "group flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left text-white transition hover:border-[#FF5B26]/40 hover:bg-white/[0.07] active:scale-[0.98]";

const externalProps = (href = "") => (/^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {});

/**
 * Menu row (same as the website side menu): orange icon + label on the left, `trailing` (default chevron) on the right.
 * Renders a <Link> when `href` is set, otherwise a <button>.
 */
export default function ListButton({ href, icon, title, trailing, className, ...props }) {
    const content = (
        <>
            <span className="flex min-w-0 items-center gap-3">
                {icon && <span className="inline-flex shrink-0 text-lg text-[#FF5B26]">{icon}</span>}
                <span className="truncate text-xs sm:text-[13px] font-bold text-zinc-100 transition-colors group-hover:text-white">{title}</span>
            </span>
            {trailing === undefined ? (
                <FiChevronRight aria-hidden="true" className="shrink-0 text-sm text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
            ) : (
                trailing
            )}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={clsx(BASE, className)} {...externalProps(href)} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" className={clsx(BASE, className)} {...props}>
            {content}
        </button>
    );
}
