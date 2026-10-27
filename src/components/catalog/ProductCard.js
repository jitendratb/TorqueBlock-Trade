import { memo } from "react";
import Link from "next/link";
import { BsLightningChargeFill } from "react-icons/bs";
import { CustomImage } from "@/ui";
import { tyreHref } from "@/lib/catalog.utils";
import StockRow, { STOCK_GRID } from "./StockRow";

const COLUMNS = ["TYRE SIZE", "FITMENT", "AVAILABILITY", "TRADE PRICE", "ACTION"];

function getProductDescription(product) {
    if (product.description) return product.description;
    const cat = (product.category?.name || "").toLowerCase();
    if (cat.includes("sport") || cat.includes("track") || cat.includes("race")) {
        return "Track-focused performance tyre designed for maximum grip, stability and precise handling.";
    }
    if (cat.includes("touring") || cat.includes("adventure") || cat.includes("trail")) {
        return "All-terrain adventure & touring tyre built for high mileage, durability and all-weather traction.";
    }
    if (cat.includes("cruiser") || cat.includes("retro") || cat.includes("classic")) {
        return "Classic cruiser tyre delivering superior ride comfort, wet grip and long-haul stability.";
    }
    return "Premium motorcycle tyre engineered for optimal performance, durability, and superior wet & dry grip.";
}

// One product with its size table. Links stay inside the portal (/tyres/<tyre> and /tyres/<tyre>/<size>).
function ProductCard({ product, isApproved, tradePrices, titleAs: Title = "h3" }) {
    const description = getProductDescription(product);
    const href = tyreHref(product);

    return (
        <article className="overflow-hidden rounded-2xl border border-orange-500/30 bg-[#0E1118]/90 backdrop-blur-md transition-all hover:border-orange-500/60 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] xl:grid-cols-[260px_1fr]">
                {/* Left column: image and product info */}
                <div className="border-b border-white/10 p-3.5 sm:p-5 grid grid-cols-[80px_1fr] items-center gap-3.5 sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] md:gap-5 lg:block lg:p-5 lg:border-b-0 lg:border-r">
                    {/* Tyre Image */}
                    <div className="relative h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-36 lg:w-full shrink-0 overflow-hidden rounded-xl bg-white lg:mb-3 flex items-center justify-center">
                        <CustomImage
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 80px, (max-width: 1024px) 140px, 260px"
                            imageClassName="object-contain p-1.5 sm:p-2"
                        />
                    </div>

                    <div className="min-w-0">
                    {/* Brand Badge */}
                    {product.brand && (
                        <div className="mb-1.5 sm:mb-2">
                            <span className="inline-block rounded border border-orange-500/50 bg-orange-500/10 px-2 sm:px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-orange-400">
                                {product.brand.name}
                            </span>
                        </div>
                    )}

                    {/* Product Title */}
                    <Title className="text-sm sm:text-base lg:text-lg xl:text-xl font-black leading-tight tracking-tight text-white mb-1 sm:mb-1.5 break-words">
                        {href ? (
                            <Link href={href} className="hover:text-orange-400 transition-colors">
                                {product.name}
                            </Link>
                        ) : (
                            product.name
                        )}
                    </Title>

                    {/* Category Tag with Lightning Bolt */}
                    <div className="mb-2 sm:mb-3 flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-orange-400">
                        <BsLightningChargeFill className="text-xs sm:text-sm shrink-0 text-orange-500" />
                        <span>{product.category?.name || "SUPER SPORT"}</span>
                    </div>

                    {/* Product Description */}
                    <p className="line-clamp-2 text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
                        {description}
                    </p>

                    </div>
                </div>

                {/* Right column: size table */}
                <div className="px-3.5 pb-2 pt-1 sm:px-5 sm:pt-3 lg:px-5 xl:px-6 flex-1 flex flex-col justify-start min-w-0">
                    <div className={`hidden gap-4 border-b border-white/10 pt-2 pb-3 text-[11px] xl:text-xs font-bold uppercase tracking-wider xl:tracking-[0.12em] whitespace-nowrap text-zinc-300 md:grid ${STOCK_GRID}`}>
                        {COLUMNS.map((col, idx) => (
                            <span key={col} className={idx === 0 ? "" : idx === COLUMNS.length - 1 ? "text-right" : "text-center"}>
                                {col}
                            </span>
                        ))}
                    </div>
                    <div className="divide-y divide-white/5">
                        {product.sizes.map((size) => (
                            <StockRow
                                key={size.id}
                                product={product}
                                size={size}
                                isApproved={isApproved}
                                tradePrice={tradePrices?.[size.id]}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default memo(ProductCard);

