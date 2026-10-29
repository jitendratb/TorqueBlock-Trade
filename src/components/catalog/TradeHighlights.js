import { FiPackage, FiTag, FiTruck } from "react-icons/fi";

const HIGHLIGHTS = [
    { Icon: FiTag, label: "Business Pricing After Account Approval" },
    { Icon: FiPackage, label: "Real-Time Product Availability" },
    { Icon: FiTruck, label: "Pan-India Delivery" },
];

// Trust row under the hero search.
export default function TradeHighlights() {
    return (
        <ul aria-label="Why order on the trade portal" className="grid grid-cols-3 gap-2 sm:gap-4 lg:flex lg:flex-wrap lg:items-center lg:justify-center lg:gap-x-12">
            {HIGHLIGHTS.map(({ Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-1.5 text-center lg:flex-row lg:gap-2.5 lg:text-left">
                    <Icon aria-hidden="true" className="shrink-0 text-lg sm:text-xl md:text-2xl text-orange-500" />
                    <span className="text-xs sm:text-sm md:text-base font-bold leading-tight text-white">{label}</span>
                </li>
            ))}
        </ul>
    );
}
