import clsx from "clsx";

// Compact label/value tile (credit limits, balances). For large clickable KPI tiles use StatCard.
export default function Stat({ label, value, hint, tone = "text-white" }) {
    return (
        <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-3 sm:p-4 shadow-sm min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
            <p className={clsx("mt-1 truncate text-base sm:text-lg font-black", tone)}>{value}</p>
            {hint && <p className="mt-1 text-[10px] text-zinc-400">{hint}</p>}
        </div>
    );
}
