import clsx from "clsx";

const controlClass = "w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-orange-500";

export function Field({ label, htmlFor, className, children }) {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-black uppercase tracking-widest text-zinc-400">
                    {label}
                </label>
            )}
            {children}
        </div>
    );
}

export function Input({ className, ...props }) {
    return <input className={clsx(controlClass, className)} {...props} />;
}

// Solid background + explicit option colours so the native dropdown list stays readable.
export function Select({ options = [], placeholder, className, ...props }) {
    return (
        <select className={clsx(controlClass, "cursor-pointer font-semibold [&>option]:bg-[#111827] [&>option]:text-white", className)} {...props}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => {
                const { value, label } = typeof opt === "string" ? { value: opt, label: opt } : opt;
                return (
                    <option key={value} value={value}> {label} </option>
                );
            })}
        </select>
    );
}

export function FormError({ children }) {
    if (!children) return null;
    return <p className="text-sm font-semibold text-red-400">{children}</p>;
}
