import { BsShop, BsTools } from "react-icons/bs";
import { FiPackage, FiTag, FiTruck } from "react-icons/fi";
import { PiBuildingsFill } from "react-icons/pi";

// Trade social proof shown in the home hero (desktop card + mobile pill).
export const TRADE_PROOF = {
    dealers: "1,500+",
    dealersLabel: "Accounts",
    headline: "Trusted by Businesses",
    subline: "Across India",
    audience: "Dealers, Workshops & Service Centres",
};

// Business types shown as the avatar stack next to the dealer count.
export const TRADE_AUDIENCE = [
    { Icon: BsShop, label: "Tyre dealers", tint: "from-orange-500 to-amber-600" },
    { Icon: BsTools, label: "Workshops", tint: "from-sky-500 to-indigo-600" },
    { Icon: PiBuildingsFill, label: "Service centres", tint: "from-emerald-500 to-teal-600" },
];

// Trust bar under the hero search.
export const TRADE_HIGHLIGHTS = [
    { Icon: FiTag, label: "Business Pricing on Approval" },
    { Icon: FiPackage, label: "Real-Time Stock Availability" },
    { Icon: FiTruck, label: "Pan-India Delivery" },
];
