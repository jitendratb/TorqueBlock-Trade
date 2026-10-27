import { PiHeadsetBold, PiMapTrifoldFill, PiShieldCheckeredFill } from "react-icons/pi";
import { FiPackage, FiTag, FiTruck } from "react-icons/fi";
const HIGHLIGHTS = [
    
    { Icon: FiTag, label: "Business pricing after account approval" },
    { Icon: FiPackage, label: "Stock availability" },
    { Icon: FiTruck, label: "Pan-India delivery" },

];

// Trust row under the hero search.
export default function TradeHighlights() {
    return (
        <ul aria-label="Why order on the trade portal" className="grid grid-cols-3 gap-2 sm:gap-4 lg:flex lg:flex-wrap lg:items-center lg:justify-center lg:gap-x-12">
            {HIGHLIGHTS.map(({ Icon, label}) => (
                <li key={label} className="flex flex-col items-center gap-1.5 text-center lg:flex-row lg:gap-2.5 lg:text-left">
                    <Icon aria-hidden="true" className="shrink-0 text-xl text-orange-500 sm:text-2xl" />
                    <span className="text-[11px] font-bold leading-tight text-white sm:text-base">{label}</span>
                </li>
            ))}
        </ul>
    );
}
