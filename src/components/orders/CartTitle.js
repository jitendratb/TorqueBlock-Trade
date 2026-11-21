import clsx from "clsx";
import { IoCartOutline } from "react-icons/io5";

// "N items" pill — cart drawer / cart page title and the mobile menu cart row.
export function CartCountBadge({ units = 0, className }) {
    if (units <= 0) return null;
    return (
        <span
            className={clsx(
                "shrink-0 rounded-lg border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-black text-orange-400",
                className
            )}
        >
            {units} {units === 1 ? "item" : "items"}
        </span>
    );
}

// "Shopping Cart" heading + item count — used by the cart drawer and the /cart page.
export default function CartTitle({ units = 0, as: Tag = "h2", className = "text-xs" }) {
    return (
        <div className="flex items-center gap-2">
            <IoCartOutline aria-hidden="true" className="text-2xl text-orange-500" />
            <Tag className={`font-black uppercase tracking-widest text-white ${className}`}>Shopping Cart</Tag>
            <CartCountBadge units={units} className="ml-2" />
        </div>
    );
}
