import clsx from "clsx";

const VARIANTS = {
    default: "rounded-3xl border border-white/10 bg-[#141824] p-5 md:p-7 shadow-xl",
    frosted: "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-4 sm:p-5 md:p-6 shadow-xl backdrop-blur-xl",
    surface: "rounded-2xl sm:rounded-3xl border border-white/10 bg-[#22262E]/95 p-6 sm:p-7 shadow-2xl shadow-black/80 backdrop-blur-xl",
    glass: "rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md",
    // Light frosted glass panel (same as the drawers), no padding.
    frosted: "rounded-2xl border border-white/[0.08] bg-zinc-950/10 shadow-2xl backdrop-blur-3xl",
    panel: "rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5",
    subtle: "rounded-xl border border-white/5 bg-white/[0.02] p-3",
    interactive: "rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-orange-500/40 hover:bg-white/[0.07]",
};

export default function Card({ variant = "default", className, children, ...props }) {
    return (
        <div className={clsx(VARIANTS[variant] || VARIANTS.default, className)} {...props}>
            {children}
        </div>
    );
}
