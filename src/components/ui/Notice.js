import clsx from "clsx";

const TONES = {
    zinc: "border-white/10 bg-white/[0.03] text-zinc-300",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    orange: "border-orange-500/20 bg-orange-500/10 text-orange-300",
};

// Inline info / warning box.
export default function Notice({ tone = "zinc", className, children }) {
    return (
        <div className={clsx("rounded-xl sm:rounded-2xl border p-4 text-xs leading-relaxed backdrop-blur-sm", TONES[tone] || TONES.zinc, className)}>
            {children}
        </div>
    );
}
