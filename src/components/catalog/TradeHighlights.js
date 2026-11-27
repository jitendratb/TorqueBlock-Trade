import { TRADE_HIGHLIGHTS } from "@/constants/trust";

// Trust bar under the hero search (same layout as the website's hero trust bar, trade content).
export default function TradeHighlights() {
    return (
        <ul aria-label="Why order on the trade portal" className="flex items-start justify-evenly gap-2 text-white sm:gap-4 lg:items-center">
            {TRADE_HIGHLIGHTS.map(({ Icon, label }) => (
                <li
                    key={label}
                    className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 px-1 text-center lg:flex-row lg:gap-2.5"
                >
                    <Icon aria-hidden="true" className="shrink-0 text-lg text-orange-500 drop-shadow sm:text-xl xl:text-2xl" />
                    <span className="max-w-[9rem] text-[10px] font-semibold leading-tight tracking-wide min-[360px]:text-[11px] sm:max-w-none sm:text-xs md:text-sm lg:whitespace-nowrap">
                        {label}
                    </span>
                </li>
            ))}
        </ul>
    );
}
