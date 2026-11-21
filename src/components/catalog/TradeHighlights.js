import { TRADE_HIGHLIGHTS } from "@/constants/trust";

// Trust bar under the hero search (same layout as the website's hero trust bar, trade content).
export default function TradeHighlights() {
    return (
        <ul aria-label="Why order on the trade portal" className="flex items-stretch justify-evenly gap-1 text-white">
            {TRADE_HIGHLIGHTS.map(({ Icon, label }) => (
                <li
                    key={label}
                    className="flex flex-1 flex-col items-center justify-center gap-1.5 px-1 text-center xl:flex-row xl:gap-2.5"
                >
                    <Icon aria-hidden="true" className="shrink-0 text-xl text-orange-500 drop-shadow xl:text-2xl" />
                    <span className="text-[11px] font-semibold leading-tight tracking-wide sm:text-xs md:text-sm xl:whitespace-nowrap">
                        {label}
                    </span>
                </li>
            ))}
        </ul>
    );
}
