import clsx from "clsx";
import { formatINR } from "@/lib/format";

const LAYOUTS = {
    stack: "text-center text-[15px] lg:text-base",
    inline: "text-right text-lg",
};

// Trade unit price. layout "stack" for the table column, "inline" for the mobile price strip.
export default function TradePrice({ price, layout = "stack", className }) {
    if (!price) {
        return (
            <p className={clsx("text-xs font-semibold text-zinc-500 whitespace-nowrap", className)} title="No trade price set yet">
                On request
            </p>
        );
    }

    return (
        <p className={clsx("font-black leading-none tracking-tight text-white whitespace-nowrap tabular-nums", LAYOUTS[layout] || LAYOUTS.stack, className)}>
            {formatINR(price)}
        </p>
    );
}
