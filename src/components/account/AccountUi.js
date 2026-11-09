import clsx from "clsx";

export function Stat({ label, value, hint, tone = "text-white" }) {
    return (
        <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-3.5 sm:p-4 shadow-sm">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
            <p className={clsx("mt-1 text-lg font-black", tone)}>{value}</p>
            {hint && <p className="mt-1 text-[10px] text-zinc-400">{hint}</p>}
        </div>
    );
}

export function PanelHeader({ title, description, action }) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
            <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">{title}</h3>
                {description && <p className="mt-0.5 text-xs text-zinc-400">{description}</p>}
            </div>
            {action}
        </div>
    );
}

export function Notice({ tone = "zinc", children }) {
    const tones = {
        zinc: "border-white/10 bg-white/[0.03] backdrop-blur-sm text-zinc-300",
        amber: "border-amber-500/20 bg-amber-500/10 backdrop-blur-sm text-amber-300",
        green: "border-emerald-500/20 bg-emerald-500/10 backdrop-blur-sm text-emerald-300",
        orange: "border-orange-500/20 bg-orange-500/10 backdrop-blur-sm text-orange-300",
    };
    return <div className={clsx("rounded-xl sm:rounded-2xl border p-4 text-xs leading-relaxed", tones[tone])}>{children}</div>;
}

export function DetailList({ items }) {
    return (
        <dl className="grid grid-cols-1 gap-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4 text-sm sm:grid-cols-2 shadow-sm">
            {items.map(([label, value, span]) => (
                <div key={label} className={span ? "sm:col-span-2" : ""}>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</dt>
                    <dd className="mt-0.5 font-semibold text-white break-words">{value || "—"}</dd>
                </div>
            ))}
        </dl>
    );
}
