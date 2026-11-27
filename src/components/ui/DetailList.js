// Read-only label/value grid. items: [label, value, span?][]
export default function DetailList({ items }) {
    return (
        <dl className="grid grid-cols-1 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-3.5 py-1 sm:p-4 text-sm sm:grid-cols-2 sm:gap-3 shadow-sm divide-y divide-white/5 sm:divide-y-0">
            {items.map(([label, value, span]) => (
                <div
                    key={label}
                    className={
                        span
                            ? "py-2.5 sm:py-0 sm:col-span-2"
                            : "flex items-baseline justify-between gap-4 py-2.5 sm:block sm:py-0"
                    }
                >
                    <dt className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</dt>
                    <dd
                        className={
                            span
                                ? "mt-0.5 font-semibold text-white break-words"
                                : "min-w-0 text-right font-semibold text-white break-words sm:mt-0.5 sm:text-left"
                        }
                    >
                        {value || "—"}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
