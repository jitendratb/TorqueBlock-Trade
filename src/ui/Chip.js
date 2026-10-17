import clsx from "clsx";

const TONES = {
    orange: "border-orange-500 bg-orange-500 text-white",
    green: "border-green-500 bg-green-500/15 text-green-400",
};

// Toggle button used for brand filters and the "In stock only" switch.
export default function Chip({ active, tone = "orange", className, children, ...props }) {
    return (
        <button
            type="button"
            aria-pressed={active}
            className={clsx(
                "shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                active ? TONES[tone] : "border-white/15 bg-white/5 text-zinc-300 hover:border-orange-500/60",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
