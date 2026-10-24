import clsx from "clsx";

const VARIANTS = {
    default: "rounded-3xl border border-white/10 bg-[#141824] p-5 md:p-7 shadow-xl",
    glass: "rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md",
    panel: "rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5",
    subtle: "rounded-xl border border-white/5 bg-white/[0.02] p-3",
    interactive: "rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-orange-500/40 hover:bg-white/[0.07]",
};

/**
 * Reusable Card component for panels, sections, and containers.
 */
export default function Card({ variant = "default", className, children, ...props }) {
    return (
        <div className={clsx(VARIANTS[variant] || VARIANTS.default, className)} {...props}>
            {children}
        </div>
    );
}
