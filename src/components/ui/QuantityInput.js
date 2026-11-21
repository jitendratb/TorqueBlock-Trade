"use client";

import clsx from "clsx";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

const STYLES = {
    default: {
        wrap: "h-9 rounded-lg border-white/15 bg-black/20",
        btn: "w-7 text-zinc-300 hover:text-orange-500",
        input: "w-9 text-sm",
        iconSize: 14,
    },
    orange: {
        wrap: "h-9 sm:h-10 rounded-xl border-orange-500/60 bg-orange-500/10 shadow-sm",
        btn: "w-8 sm:w-9 text-orange-400 hover:bg-orange-500/20 hover:text-white",
        input: "w-8 sm:w-9 text-xs sm:text-sm",
        iconSize: 12,
    },
    // Website cart stepper: light glass.
    glass: {
        wrap: "h-7 md:h-8 rounded-lg md:rounded-xl border-white/10 bg-white/10 md:p-0.5",
        btn: "w-6 md:w-7 text-zinc-400 hover:text-white",
        input: "w-6 md:w-8 text-xs font-black",
        iconSize: 10,
    },
    compact: {
        wrap: "h-7 rounded-lg border-orange-500/40 bg-white/[0.05] px-0.5 shadow-sm",
        btn: "h-6 w-6 rounded bg-white/5 text-zinc-300 hover:bg-orange-500/20 hover:text-orange-400 active:scale-95",
        input: "w-7 text-xs",
        iconSize: 10,
    },
};

export default function QuantityInput({
    value,
    onChange,
    onRemove,
    min = 1,
    max = 999,
    disabled = false,
    variant = "default",
    label = "Quantity",
    className,
}) {
    const theme = STYLES[variant] || STYLES.default;

    const handleChange = (nextValue) => {
        if (onRemove && (!Number.isFinite(nextValue) || nextValue <= 0)) {
            onRemove();
            return;
        }
        const safeValue = Number.isFinite(nextValue) ? nextValue : min;
        onChange(Math.min(max, Math.max(min, safeValue)));
    };

    const handleDecrement = () => {
        if (onRemove && value <= min) {
            onRemove();
        } else {
            handleChange(value - 1);
        }
    };

    const showTrash = Boolean(onRemove && value <= min);

    return (
        <div className={clsx("inline-flex items-center border", theme.wrap, className)}>
            <button
                type="button"
                aria-label={showTrash ? "Remove from cart" : "Decrease quantity"}
                disabled={disabled || (!onRemove && value <= min)}
                onClick={handleDecrement}
                className={clsx(
                    "flex h-full items-center justify-center transition-colors disabled:opacity-30",
                    theme.btn
                )}
            >
                {showTrash ? <FiTrash2 size={theme.iconSize} /> : <FiMinus size={theme.iconSize} />}
            </button>

            <input
                type="number"
                inputMode="numeric"
                aria-label={label}
                min={min}
                max={max}
                value={value}
                disabled={disabled}
                onChange={(e) => handleChange(parseInt(e.target.value, 10))}
                className={clsx("no-spin h-full bg-transparent text-center font-black text-white outline-none", theme.input)}
            />

            <button
                type="button"
                aria-label="Increase quantity"
                disabled={disabled || value >= max}
                onClick={() => handleChange(value + 1)}
                className={clsx("flex h-full items-center justify-center transition-colors disabled:opacity-30", theme.btn)}
            >
                <FiPlus size={theme.iconSize} />
            </button>
            
        </div>
    );
}
