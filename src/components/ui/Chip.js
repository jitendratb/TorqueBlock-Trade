import clsx from "clsx";

// Toggle chip used for the brand filters.
export default function Chip({ active, className, children, ...props }) {
    return (
        <button
            type="button"
            aria-pressed={active}
            className={clsx(
                "shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                active ? "border-orange-500 bg-orange-500 text-white" : "border-white/15 bg-white/5 text-zinc-300 hover:border-orange-500/60",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
