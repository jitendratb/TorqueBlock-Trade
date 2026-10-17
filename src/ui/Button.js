import Link from "next/link";
import clsx from "clsx";

const LABEL = "font-black uppercase tracking-wider";

// Text style lives in each variant so the header's "glass" buttons keep B2C casing.
const VARIANTS = {
    primary: `${LABEL} bg-orange-500 text-white hover:bg-orange-600`,
    outline: `${LABEL} border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white`,
    ghost: `${LABEL} border border-white/15 text-zinc-300 hover:bg-white/5`,
    glass: "font-bold border border-gray-400 bg-white/10 text-white hover:bg-white/20",
    success: `${LABEL} bg-green-600 text-white`,
};

const SIZES = {
    sm: "h-9 px-3 text-xs rounded-lg",
    md: "h-10 px-4 text-sm rounded-xl",
    lg: "py-3.5 px-6 text-sm rounded-xl",
};

// One button style for the whole portal. Renders a Link when `href` is passed.
export default function Button({ href, variant = "primary", size = "lg", full = false, className, children, ...props }) {
    const classes = clsx(
        "inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        full && "w-full",
        className
    );

    if (href) {
        const external = /^https?:/.test(href);
        return (
            <Link href={href} className={classes} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
                {children}
            </Link>
        );
    }
    return (
        <button type="button" className={classes} {...props}> {children} </button>
    );
}
