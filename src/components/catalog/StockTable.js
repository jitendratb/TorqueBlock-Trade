import clsx from "clsx";
import StockRow, { STOCK_GRID } from "./StockRow";

const COLUMNS = ["Tyre Size", "Fitment", "Availability", "Business Price", "Action"];

// Size rows for one tyre model: column header from md up, StockRow per size.
export default function StockTable({ product, sizes = product.sizes, isApproved, tradePrices, className }) {
    return (
        <div className={className}>
            <div
                className={clsx(
                    "hidden gap-4 border-b border-white/10 pt-2 pb-3 text-[11px] xl:text-xs font-bold uppercase tracking-wider xl:tracking-[0.12em] whitespace-nowrap text-zinc-300 md:grid",
                    STOCK_GRID
                )}
            >
                {COLUMNS.map((col) => (
                    <span key={col} className="text-center">
                        {col}
                    </span>
                ))}
            </div>
            <div className="divide-y divide-white/5">
                {sizes.map((size) => (
                    <StockRow key={size.id} product={product} size={size} isApproved={isApproved} tradePrice={tradePrices?.[size.id]} />
                ))}
            </div>
        </div>
    );
}
