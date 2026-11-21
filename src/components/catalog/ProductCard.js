"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { BsLightningChargeFill } from "react-icons/bs";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button, CarouselDots, CustomImage } from "@/components/ui";
import useCardLink from "@/hooks/useCardLink";
import useImageCarousel from "@/hooks/useImageCarousel";
import { useInView } from "@/hooks/useInView";
import { useProductFamily } from "@/hooks/useProductFamily";
import { tyreHref } from "@/lib/catalog.utils";
import { extractProductImages } from "@/lib/image";
import StockTable from "./StockTable";

function ProductCard({ product, isApproved, tradePrices, titleAs: Title = "h3" }) {
    const href = tyreHref(product);
    const [cardRef, nearViewport] = useInView();
    const familyData = useProductFamily(product?.identifier, { enabled: nearViewport });

    const heroText = familyData?.hero?.subtitle || familyData?.description || product?.description || "";
    const allImages = useMemo(() => extractProductImages(product, familyData), [product, familyData]);

    const carousel = useImageCarousel(allImages);
    const openCard = useCardLink(href);

    return (
        <article
            ref={cardRef}
            onClick={openCard}
            onAuxClick={openCard}
            className={`group/card overflow-hidden rounded-2xl border border-orange-500/30 bg-[#0E1118]/90 backdrop-blur-md transition-all hover:border-orange-500/60 shadow-xl ${href ? "cursor-pointer" : ""}`}
        >
            <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] xl:grid-cols-[260px_1fr]">
                {/* Left column: image and product info */}
                <div className="border-b border-white/10 p-3.5 sm:p-5 grid grid-cols-[96px_1fr] items-center gap-3.5 sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] md:gap-5 lg:block lg:p-5 lg:border-b-0 lg:border-r">
                    <div className="relative group/img h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-40 lg:w-full shrink-0 overflow-hidden rounded-xl lg:rounded-2xl bg-[#3C3F47] border border-white/10 lg:mb-3 flex items-center justify-center select-none shadow-sm">
                        <CustomImage
                            src={carousel.current}
                            alt={`${product.name} - photo ${carousel.index + 1}`}
                            fill
                            sizes="(max-width: 640px) 96px, (max-width: 1024px) 140px, 260px"
                            imageClassName="object-contain p-1.5 sm:p-2 transition-transform duration-300"
                        />

                        {carousel.hasMany && (
                            <>
                                <Button
                                    variant="overlay"
                                    size="xs"
                                    iconOnly
                                    pill
                                    onClick={carousel.prev}
                                    aria-label="Previous product image"
                                    icon={<FiChevronLeft />}
                                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10"
                                />
                                <Button
                                    variant="overlay"
                                    size="xs"
                                    iconOnly
                                    pill
                                    onClick={carousel.next}
                                    aria-label="Next product image"
                                    icon={<FiChevronRight />}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10"
                                />
                                <CarouselDots
                                    count={carousel.count}
                                    active={carousel.index}
                                    onSelect={carousel.setIndex}
                                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10"
                                />
                            </>
                        )}
                    </div>

                    <div className="min-w-0">
                        {product.brand && (
                            <div className="mb-1.5 sm:mb-2">
                                <span className="inline-block rounded border border-orange-500/50 bg-orange-500/10 px-2 sm:px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-orange-400">
                                    {product.brand.name}
                                </span>
                            </div>
                        )}

                        <Title className="text-sm sm:text-base lg:text-lg xl:text-xl font-black leading-tight tracking-tight text-white mb-1 sm:mb-1.5 break-words">
                            {href ? (
                                <Link href={href} className="transition-colors hover:text-orange-400 group-hover/card:text-orange-400">
                                    {product.name}
                                </Link>
                            ) : (
                                product.name
                            )}
                        </Title>

                        <div className="mb-2 sm:mb-3 flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-orange-400">
                            <BsLightningChargeFill className="text-xs sm:text-sm shrink-0 text-orange-500" />
                            <span>{product.category?.name || "SUPER SPORT"}</span>
                        </div>

                        {heroText && (
                            <p className="line-clamp-2 text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                                {heroText}
                            </p>
                        )}
                    </div>
                </div>

                <StockTable
                    product={product}
                    isApproved={isApproved}
                    tradePrices={tradePrices}
                    className="min-w-0 flex-1 px-3.5 pb-2 pt-1 sm:px-5 sm:pt-3 lg:px-5 xl:px-6"
                />
            </div>
        </article>
    );
}

export default memo(ProductCard);
