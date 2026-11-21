import clsx from "clsx";
import { FiX } from "react-icons/fi";

const TOGGLE_STYLES = {
    on: "border-orange-500 bg-orange-500 text-white",
    off: "border-white/15 bg-white/5 text-zinc-300 hover:border-orange-500/60",
};

/**
 * Rounded chip button.
 * - default: toggle chip (brand filters) — `active` highlights it.
 * - `removable`: applied-filter chip with an × (click removes it).
 */
export default function Chip({ active, removable = false, className, children, ...props }) {
    if (removable) {
        return (
            <button
                type="button"
                className={clsx(
                    "inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-500/40 bg-black/30 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:border-orange-500",
                    className
                )}
                {...props}
            >
                {children}
                <FiX aria-hidden="true" className="text-orange-400" />
            </button>
        );
    }

    return (
        <button
            type="button"
            aria-pressed={active}
            className={clsx(
                "shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                active ? TOGGLE_STYLES.on : TOGGLE_STYLES.off,
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
