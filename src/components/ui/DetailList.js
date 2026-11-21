// Read-only label/value grid. items: [label, value, span?][]
export default function DetailList({ items }) {
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
