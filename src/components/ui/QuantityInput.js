import { FiMinus, FiPlus } from "react-icons/fi";

export default function QuantityInput({ value, onChange, min = 1, max = 999, disabled, label = "Quantity" }) {
    const set = (n) => onChange(Math.min(max, Math.max(min, Number.isFinite(n) ? n : min)));

    return (
        <div className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-black/20">
            <button type="button" aria-label="Decrease quantity" disabled={disabled || value <= min} onClick={() => set(value - 1)} className="flex h-full w-7 items-center justify-center text-zinc-300 hover:text-orange-500 disabled:opacity-30">
                <FiMinus />
            </button>
            <input
                type="number"
                inputMode="numeric"
                aria-label={label}
                min={min}
                max={max}
                value={value}
                disabled={disabled}
                onChange={(e) => set(parseInt(e.target.value, 10))}
                className="no-spin h-full w-9 bg-transparent text-center text-sm font-black text-white outline-none"
            />
            <button type="button" aria-label="Increase quantity" disabled={disabled || value >= max} onClick={() => set(value + 1)} className="flex h-full w-7 items-center justify-center text-zinc-300 hover:text-orange-500 disabled:opacity-30">
                <FiPlus />
            </button>
        </div>
    );
}
