import { FiPackage, FiTag, FiTruck } from "react-icons/fi";

const HIGHLIGHTS = [
    { Icon: FiTag, title: "Business pricing after account approval", text: "Exclusive rates for verified businesses" },
    { Icon: FiPackage, title: "Stock availability", text: "Real-time product availability" },
    { Icon: FiTruck, title: "Pan-India delivery", text: "To your workshop, store or service centre" },
];

// Why businesses order here — shown at the bottom of the home hero.
export default function TradeHighlights() {
    return (
        <ul aria-label="Why order on the trade portal" className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            {HIGHLIGHTS.map(({ Icon, title, text }) => (
                <li
                    key={title}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md transition-colors hover:border-orange-500/40 sm:p-5"
                >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/25 to-orange-500/5 text-xl text-orange-400 sm:h-12 sm:w-12">
                        <Icon aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-bold leading-snug text-white">{title}</p>
                        <p className="mt-1 text-xs leading-snug text-zinc-400">{text}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}
