import { memo } from "react";
import CustomImage from "@/ui/CustomImage";
import Badge from "@/ui/Badge";
import StockRow, { STOCK_GRID } from "./StockRow";
import { CategoryIcon } from "../catalog.utils";

const COLUMNS = ["Size", "Position", "Load · Speed", "Stock", "Price"];

function ProductCard({ product, isDealer, dealerPrices }) {
    return (
        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition-colors hover:border-orange-500/30">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
                <div className="border-b border-white/10 md:border-b-0 md:border-r">
                    <div className="flex items-center gap-4 p-4 md:sticky md:top-28 md:flex-col md:items-start">
                        <div className="relative h-20 w-20 shrink-0 md:h-36 md:w-full">
                            <CustomImage src={product.image} alt={product.name} fill sizes="(max-width: 768px) 80px, 190px" imageClassName="object-contain" />
                        </div>
                        <div className="space-y-1.5">
                            {product.brand && <Badge tone="brand">{product.brand.name}</Badge>}
                            <h3 className="text-lg font-black leading-tight tracking-tight text-white">{product.name}</h3>
                            {product.category && (
                                <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <CategoryIcon name={product.category.name} className="h-3.5 w-3.5 text-orange-500" /> {product.category.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-1 md:px-5">
                    <div className={`hidden gap-4 border-b border-white/10 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 md:grid ${STOCK_GRID}`}>
                        {COLUMNS.map((c) => (
                            <span key={c}>{c === "Price" && isDealer ? "Dealer Price" : c}</span>
                        ))}
                        <span className="text-right">Order</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {product.sizes.map((size) => (
                            <StockRow key={size.id} product={product} size={size} isDealer={isDealer} dealerPrice={dealerPrices?.[size.id]} />
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default memo(ProductCard);
