import Link from "next/link";
import clsx from "clsx";
import Spinner from "./Spinner";

// Filled / bordered "box" buttons.
const VARIANTS = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20",
    brand: "bg-[#A35229] text-white hover:bg-[#8F4420] shadow-lg shadow-[#A35229]/25",
    gradient: "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-[0_4px_20px_rgba(249,115,22,0.15)] hover:shadow-[0_4px_30px_rgba(249,115,22,0.35)]",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    outline: "border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white",
    ghost: "border border-white/15 text-zinc-300 hover:bg-white/5 hover:text-white",
    // Frosted glass — header / overlay controls.
    glass: "border border-white/20 bg-white/[0.08] text-white backdrop-blur-sm hover:bg-white/[0.16] hover:border-white/30 shadow-sm",
    // Low-emphasis bordered button (filters, "clear all", logout).
    subtle: "border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/15 hover:text-white",
    // Quiet icon actions: edit (orange hover) / delete (red hover).
    muted: "border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400",
    "muted-danger": "border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400",
    danger: "bg-red-600 text-white hover:bg-red-500 shadow-sm shadow-red-600/20",
    // Header bar controls (cart / menu) — same look as the main website header.
    header: "!h-10 !min-h-10 !rounded-xl border border-gray-400 bg-white/10 text-white hover:bg-white/20",
    // Dark round controls laid over images (carousel arrows, close preview).
    overlay: "border border-white/20 bg-black/75 text-white backdrop-blur-sm shadow-md hover:border-orange-500 hover:text-orange-400",
};

// Inline text buttons — no box, no padding.
const TEXT_VARIANTS = {
    link: "text-orange-400 hover:text-orange-300",
    text: "text-zinc-400 hover:text-white",
};

// Responsive: slightly tighter on phones, full size from `sm` up.
const SIZES = {
    xs: "min-h-7 py-1 px-2.5 text-[11px] gap-1",
    sm: "min-h-8 sm:min-h-9 py-1.5 px-3 text-xs gap-1.5",
    md: "min-h-9 sm:min-h-10 py-2 px-3.5 sm:px-4 text-xs sm:text-sm gap-1.5 sm:gap-2",
    lg: "min-h-11 py-3 sm:py-3.5 px-5 sm:px-6 text-sm gap-2",
};

// Square icon-only buttons.
const ICON_SIZES = {
    xs: "h-7 w-7 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-9 w-9 sm:h-10 sm:w-10 text-base sm:text-lg",
    lg: "h-11 w-11 text-lg",
};

const RADIUS = { xs: "rounded-lg", sm: "rounded-lg", md: "rounded-xl", lg: "rounded-xl" };

const TEXT_SIZES = {
    xs: "text-[11px] gap-1",
    sm: "text-xs gap-1",
    md: "text-xs sm:text-sm gap-1.5",
    lg: "text-sm sm:text-base gap-2",
    xl: "text-xl sm:text-2xl gap-2",
};

/**
 * The single button used across the app. Renders a <Link> when `href` is set
 * (external http(s) links open in a new tab), otherwise a <button>.
 *
 * @param variant  primary | brand | gradient | secondary | outline | ghost | glass |
 *                 subtle | muted | muted-danger | danger | header | overlay | link | text
 * @param size     xs | sm | md | lg
 * @param iconOnly square button that shows only `icon` (pass an aria-label)
 * @param pill     fully rounded corners
 * @param badge    node rendered after the label (e.g. a cart count)
 * @param uppercase defaults to true for box variants, false for link/text
 */
export default function Button({
    href,
    variant = "primary",
    size = "lg",
    full = false,
    loading = false,
    loadingText,
    icon,
    rightIcon,
    badge,
    iconOnly = false,
    pill = false,
    uppercase,
    disabled = false,
    className,
    children,
    type = "button",
    ...props
}) {
    const isDisabled = disabled || loading;
    const isText = variant in TEXT_VARIANTS;
    const upper = uppercase ?? !isText;

    // Without class merging, a caller's base `hidden` loses to `inline-flex` in Tailwind v4's CSS order.
    const ownsDisplay = /(^|\s)(hidden|block|flex|grid|inline|inline-block)(\s|$)/.test(className || "");

    const classes = clsx(
        !ownsDisplay && "inline-flex",
        "items-center justify-center text-center leading-tight select-none transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        isText
            ? [TEXT_VARIANTS[variant], TEXT_SIZES[size] || TEXT_SIZES.md, "font-bold rounded"]
            : [
                VARIANTS[variant] || VARIANTS.primary,
                iconOnly ? ICON_SIZES[size] || ICON_SIZES.md : SIZES[size] || SIZES.lg,
                pill ? "rounded-full" : RADIUS[size] || RADIUS.lg,
                "active:scale-[0.97]",
            ],
        !isText && (upper ? "font-black uppercase tracking-wider" : "font-bold"),
        isText && upper && "uppercase tracking-wider",
        full && "w-full",
        className
    );

    const leading = loading ? (
        <Spinner size="sm" tone="current" label="" aria-hidden="true" />
    ) : icon ? (
        <span className="inline-flex shrink-0" aria-hidden="true">{icon}</span>
    ) : null;

    const content = iconOnly ? (
        leading
    ) : (
        <>
            {leading}
            {(children != null || (loading && loadingText)) && (
                <span>{loading && loadingText ? loadingText : children}</span>
            )}
            {!loading && rightIcon ? <span className="inline-flex shrink-0" aria-hidden="true">{rightIcon}</span> : null}
            {badge}
        </>
    );

    if (href && !isDisabled) {
        const external = /^https?:/.test(href);
        return (
            <Link
                href={href}
                className={classes}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                {...props}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type={type}
            disabled={isDisabled}
            aria-busy={loading || undefined}
            className={classes}
            {...props}
        >
            {content}
        </button>
    );
}
