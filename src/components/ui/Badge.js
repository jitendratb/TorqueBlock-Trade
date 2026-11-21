import clsx from "clsx";

const TONES = {
    green: "bg-green-500/15 text-green-400 border-green-500/25",
    emerald: "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30",
    orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    sky: "bg-sky-500/15 text-sky-400 border-sky-500/25",
    red: "bg-red-500/15 text-red-400 border-red-500/25",
    rose: "bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/30",
    zinc: "bg-white/5 text-zinc-300 border-white/10",
};

export default function Badge({
    tone = "orange",
    pill = false,
    bordered = false,
    icon,
    className,
    children,
}) {
    return (
        <span
            className={clsx(
                "inline-flex items-center gap-1.5 text-[11px] font-bold",
                pill ? "rounded-full px-2.5 py-0.5" : "rounded-md px-2 py-1",
                bordered && "border",
                TONES[tone] || TONES.orange,
                className
            )}
        >
            {icon}
            {children}
        </span>
    );
}
