import Link from "next/link";
import clsx from "clsx";

const VARIANTS = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-500/20",
    outline: "border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white",
    ghost: "border border-white/15 text-zinc-300 hover:bg-white/5",
};

const SIZES = {
    sm: "h-9 px-3 text-xs rounded-lg",
    md: "h-10 px-4 text-sm rounded-xl",
    lg: "py-3.5 px-6 text-sm rounded-xl",
};

// Unified button component with built-in loading spinner, icons, and variants.
export default function Button({
    href,
    variant = "primary",
    size = "lg",
    full = false,
    loading = false,
    loadingText,
    icon,
    rightIcon,
    disabled = false,
    className,
    children,
    type = "button",
    ...props
}) {
    const isDisabled = disabled || loading;

    const classes = clsx(
        "inline-flex items-center justify-center gap-2 select-none font-black uppercase tracking-wider transition-all duration-150 active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.lg,
        full && "w-full",
        className
    );

    const content = (
        <>
            {loading ? (
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            ) : icon ? (
                <span className="shrink-0">{icon}</span>
            ) : null}
            <span>{loading && loadingText ? loadingText : children}</span>
            {!loading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
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
            aria-busy={loading}
            className={classes}
            {...props}
        >
            {content}
        </button>
    );
}
