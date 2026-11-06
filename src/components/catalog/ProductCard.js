import { memo, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { BsLightningChargeFill } from "react-icons/bs";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { CustomImage } from "@/ui";
import { tyreHref, getProductDescription } from "@/lib/catalog.utils";
import { fetchProductFamily } from "@/services/CatalogService";
import StockRow, { STOCK_GRID } from "./StockRow";

const COLUMNS = ["TYRE SIZE", "FITMENT", "AVAILABILITY", "BUSINESS PRICE", "ACTION"];



// One product with its size table. Links stay inside the portal (/tyres/<tyre> and /tyres/<tyre>/<size>).
function ProductCard({ product, isApproved, tradePrices, titleAs: Title = "h3" }) {
    const href = tyreHref(product);

    const [familyData, setFamilyData] = useState(null);
    const [familyImages, setFamilyImages] = useState(null);

    useEffect(() => {
        if (!product?.identifier) return;
        let isMounted = true;
        fetchProductFamily(product.identifier).then((family) => {
            if (!isMounted || !family) return;
            setFamilyData(family);
            const list = [];
            const add = (img) => {
                if (!img) return;
                const u = typeof img === "string" ? img.trim() : (img?.url ? String(img.url).trim() : "");
                if (u && !list.includes(u)) list.push(u);
            };
            // Strictly show ONLY the images inside "Product Images" (family.productImages)
            if (Array.isArray(family.productImages)) {
                family.productImages.forEach(add);
            }
            if (list.length > 0) {
                setFamilyImages(list);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [product?.identifier]);

    const heroText = familyData?.hero?.subtitle || familyData?.description || product?.description || "";

    // Collect all available product images including family images, size images, and catalogue stock images
    const allImages = useMemo(() => {
        if (familyImages && familyImages.length > 0) {
            return familyImages;
        }
        const list = [];
        const add = (img) => {
            if (!img) return;
            const u = typeof img === "string" ? img.trim() : (img?.url ? String(img.url).trim() : "");
            if (u && !list.includes(u)) list.push(u);
        };
        if (Array.isArray(product.images)) product.images.forEach(add);
        if (product.image) add(product.image);
        return list.length > 0 ? list : ["/newlogo.webp"];
    }, [familyImages, product.images, product.image]);

    const [activeIdx, setActiveIdx] = useState(0);
    const safeActiveIdx = activeIdx < allImages.length ? activeIdx : 0;

    const handlePrev = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const handleNext = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveIdx((prev) => (prev + 1) % allImages.length);
    };

    const currentImage = allImages[safeActiveIdx] || allImages[0];

    return (
        <article className="overflow-hidden rounded-2xl border border-orange-500/30 bg-[#0E1118]/90 backdrop-blur-md transition-all hover:border-orange-500/60 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] xl:grid-cols-[260px_1fr]">
                {/* Left column: image and product info */}
                <div className="border-b border-white/10 p-3.5 sm:p-5 grid grid-cols-[96px_1fr] items-center gap-3.5 sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] md:gap-5 lg:block lg:p-5 lg:border-b-0 lg:border-r">
                    {/* Tyre Image with arrow controls for browsing all product images */}
                    <div className="relative group/img h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-40 lg:w-full shrink-0 overflow-hidden rounded-xl bg-white lg:mb-3 flex items-center justify-center select-none shadow-sm">
                            <CustomImage
                                src={currentImage}
                                alt={`${product.name} - photo ${safeActiveIdx + 1}`}
                                fill
                                sizes="(max-width: 640px) 96px, (max-width: 1024px) 140px, 260px"
                                imageClassName="object-contain p-1.5 sm:p-2 transition-transform duration-300"
                            />

                            {/* Small Navigation Arrows (only if more than 1 image) */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        aria-label="Previous product image"
                                        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-all hover:bg-black hover:scale-110 active:scale-90 border border-white/20 shadow-md cursor-pointer"
                                    >
                                        <FiChevronLeft className="text-xs" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        aria-label="Next product image"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-all hover:bg-black hover:scale-110 active:scale-90 border border-white/20 shadow-md cursor-pointer"
                                    >
                                        <FiChevronRight className="text-xs" />
                                    </button>

                                    {/* Dot Indicators at bottom */}
                                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 backdrop-blur-sm pointer-events-auto">
                                        {allImages.map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setActiveIdx(idx);
                                                }}
                                                aria-label={`Go to image ${idx + 1}`}
                                                className={`rounded-full transition-all cursor-pointer ${
                                                    idx === safeActiveIdx
                                                        ? "h-1.5 w-3 bg-orange-500"
                                                        : "h-1.5 w-1.5 bg-white/50 hover:bg-white"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </>
                        )}
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

                        {/* Hero Subtitle from Backend (zero hardcoded strings) */}
                        {heroText && (
                            <p className="line-clamp-2 text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                                {heroText}
                            </p>
                        )}

                        {/* Hero Highlights chips if available */}
                        {Array.isArray(familyData?.hero?.highlights) && familyData.hero.highlights.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {familyData.hero.highlights.slice(0, 2).map((h, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 rounded bg-black/40 border border-white/10 px-1.5 py-0.5 text-[9px] font-medium text-zinc-300">
                                        <span className="h-1 w-1 rounded-full bg-orange-400" />
                                        {h}
                                    </span>
                                ))}
                            </div>
                        )}

                    </div>
                </div>

                {/* Right column: size table */}
                <div className="px-3.5 pb-2 pt-1 sm:px-5 sm:pt-3 lg:px-5 xl:px-6 flex-1 flex flex-col justify-start min-w-0">
                    <div className={`hidden gap-4 border-b border-white/10 pt-2 pb-3 text-[11px] xl:text-xs font-bold uppercase tracking-wider xl:tracking-[0.12em] whitespace-nowrap text-zinc-300 md:grid ${STOCK_GRID}`}>
                        {COLUMNS.map((col) => (
                            <span key={col} className="text-center">
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

