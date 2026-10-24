import { memo } from "react";
import Link from "next/link";
import { BsLightningChargeFill } from "react-icons/bs";
import { CustomImage, ShareButtons } from "@/ui";
import { tyreHref } from "@/lib/catalog.utils";
import StockRow, { STOCK_GRID } from "./StockRow";

const COLUMNS = ["TYRE SIZE", "FITMENT", "AVAILABILITY", "BUSINESS PRICE", "ACTION"];

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
        <article className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E1118]/90 backdrop-blur-md transition-all hover:border-orange-500/30 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
                {/* Left column: image and product info */}
                <div className="border-b border-white/10 p-5 sm:p-6 grid grid-cols-[96px_1fr] items-center gap-4 sm:grid-cols-[150px_1fr] sm:gap-5 md:grid-cols-[200px_1fr] md:gap-6 lg:block lg:border-b-0 lg:border-r">
                    {/* Tyre Image */}
                    <div className="relative h-24 sm:h-32 md:h-44 lg:h-52 w-full lg:mb-4 flex items-center justify-center">
                        <CustomImage
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 96px, (max-width: 1024px) 200px, 280px"
                            imageClassName="object-contain"
                        />
                    </div>

                    <div className="min-w-0">
                    {/* Brand Badge */}
                    {product.brand && (
                        <div className="mb-2">
                            <span className="inline-block rounded border border-orange-500/50 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-orange-400">
                                {product.brand.name}
                            </span>
                        </div>
                    )}

                    {/* Product Title */}
                    <Title className="text-lg sm:text-xl lg:text-2xl font-black leading-tight tracking-tight text-white mb-2 break-words">
                        {href ? (
                            <Link href={href} className="hover:text-orange-400 transition-colors">
                                {product.name}
                            </Link>
                        ) : (
                            product.name
                        )}
                    </Title>

                    {/* Category Tag with Lightning Bolt */}
                    <div className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-orange-400">
                        <BsLightningChargeFill className="text-sm shrink-0 text-orange-500" />
                        <span>{product.category?.name || "SUPER SPORT"}</span>
                    </div>

                    {/* Product Description */}
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                        {description}
                    </p>

                    {href && (
                        <ShareButtons
                            path={href}
                            title={product.name}
                            text={`${product.name} – trade stock & business prices on Torque Block Trade`}
                            size="sm"
                            className="mt-3 flex-wrap sm:mt-4"
                        />
                    )}
                    </div>
                </div>

                {/* Right column: size table */}
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-start min-w-0">
                    <div className={`hidden gap-4 border-b border-white/10 pb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 md:grid ${STOCK_GRID}`}>
                        {COLUMNS.map((col, idx) => (
                            <span key={col} className={idx === COLUMNS.length - 1 ? "text-right" : ""}>
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

