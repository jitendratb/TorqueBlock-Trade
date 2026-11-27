"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BsCheckCircleFill, BsHeadset, BsPatchCheck } from "react-icons/bs";
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp, FiFileText, FiLock, FiMaximize2, FiShield, FiSliders, FiX, } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { Breadcrumbs, Button, Card, CustomImage, ShareButtons } from "@/components/ui";
import useImageCarousel from "@/hooks/useImageCarousel";
import { useProductFamily } from "@/hooks/useProductFamily";
import { buildProductParagraphs, parseTyreSize, tyreHref } from "@/lib/catalog.utils";
import { formatINR } from "@/lib/format";
import { extractProductImages } from "@/lib/image";
import { selectIsApproved, useAuthStore } from "@/store/authStore";
import { useCatalogStore } from "@/store/catalogStore";
import { useUiStore } from "@/store/uiStore";
import StockTable from "./StockTable";

export default function ProductDetail({ product, size = null }) {
    const isApproved = useAuthStore(selectIsApproved);
    const tradePrices = useCatalogStore((s) => s.tradePrices);
    const loadTradePrices = useCatalogStore((s) => s.loadTradePrices);
    const openLogin = useUiStore((s) => s.openLogin);

    const familyData = useProductFamily(product?.identifier);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isPhotoOpen, setIsPhotoOpen] = useState(false);

    useEffect(() => {
        if (isApproved) loadTradePrices();
    }, [isApproved, loadTradePrices]);

    const allImages = useMemo(
        () => extractProductImages(product, familyData),
        [product, familyData]
    );

    const { index: safeActiveIdx, current: currentImage, setIndex: setActiveIdx, prev: showPrevImage, next: showNextImage } =
        useImageCarousel(allImages);

    const modelHref = tyreHref(product);
    const path = tyreHref(product, size);
    const title = size ? `${product.name} ${size.size}` : product.name;

    const priceRange = useMemo(() => {
        const prices = (product.sizes || [])
            .map((s) => tradePrices?.[s.id] ?? s.tradePrice ?? s.price ?? s.mrp)
            .filter((p) => typeof p === "number" && p > 0);

        if (prices.length > 0) {
            return {
                min: Math.min(...prices),
                max: Math.max(...prices),
            };
        }
        if (familyData?.startingPrice && familyData?.endingPrice) {
            return {
                min: familyData.startingPrice,
                max: familyData.endingPrice,
            };
        }
        return null;
    }, [product.sizes, tradePrices, familyData]);

    const headlineParts = useMemo(() => {
        const fullName = product.name || "";
        const brandName = product.brand?.name || "";
        if (brandName && fullName.toLowerCase().startsWith(brandName.toLowerCase())) {
            const model = fullName.slice(brandName.length).trim();
            return { brand: brandName, model: model || fullName };
        }
        return { brand: brandName, model: fullName };
    }, [product.name, product.brand]);

    const featurePills = useMemo(() => {
        if (Array.isArray(familyData?.hero?.highlights) && familyData.hero.highlights.length > 0) {
            return familyData.hero.highlights;
        }
        const categoryName = product.category?.name?.toLowerCase() || "";
        if (categoryName.includes("dual") || categoryName.includes("scrambler") || product.name?.toLowerCase().includes("trailhound")) {
            return [
                "80% road and 20% off-road performance",
                "Designed for scramblers and heritage motorcycles",
                "Radial and X-ply construction options",
            ];
        }
        if (categoryName.includes("sport") || categoryName.includes("racing") || categoryName.includes("track")) {
            return [
                "High Performance Super Sport Radial",
                "Racing-Inspired Design",
                "Dual Compound Technology (Rear)",
            ];
        }
        return [
            "100% Genuine Direct Supply from Brand",
            "High-speed tread stability & wet road braking",
            "Official GST Tax Invoice & 18% ITC Eligible",
        ];
    }, [familyData, product.category, product.name]);

    const paragraphs = useMemo(
        () => buildProductParagraphs(product, familyData),
        [product, familyData]
    );

    const heroDescription = useMemo(() => {
        return (
            familyData?.hero?.subtitle ||
            familyData?.description ||
            product.description ||
            paragraphs[0] ||
            "Race-inspired grip, razor-sharp handling, and exceptional high-speed stability for riders who demand premium supersport performance on every road."
        );
    }, [familyData, product.description, paragraphs]);

    const matchedBackendSize = useMemo(() => {
        if (!size || !Array.isArray(familyData?.sizesIds)) return null;
        return (
            familyData.sizesIds.find((s) => String(s._id) === String(size.id) || s.size === size.size) || null
        );
    }, [size, familyData]);

    const parsedSpec = useMemo(
        () => (size ? parseTyreSize(size.size, size.spec, matchedBackendSize || size) : null),
        [size, matchedBackendSize]
    );

    const sizesToDisplay = size ? [size] : (product.sizes || []);

    const scrollToSizes = () => {
        const el = document.getElementById("available-sizes");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="space-y-3.5 sm:space-y-4 max-w-7xl mx-auto">
            <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between gap-3 py-1 min-h-[32px]">
                    <Breadcrumbs
                        variant="subtle"
                        className="min-w-0 flex-1"
                        items={[
                            { label: "Home", href: "/" },
                            { label: "Tyres", href: "/#stock" },
                            { label: size ? `${product.name} (${size.size})` : product.name },
                        ]}
                    />

                    <div className="flex shrink-0 items-center">
                        <ShareButtons path={path} title={title} text={`${title} – Trade stock & wholesale pricing on Torque Block`} size="sm" menu />
                    </div>
                </div>

                <section className="w-full relative">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:gap-8 items-start">
                        <div className="flex flex-col gap-2.5 sm:gap-3">
                            <div className="relative w-full rounded-2xl overflow-hidden h-[300px] min-[400px]:h-[340px] sm:h-[380px] md:h-[400px] lg:h-[420px] xl:h-[440px] flex items-center justify-center">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    aria-label="View Tyre full screen"
                                    onClick={() => setIsPhotoOpen(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") setIsPhotoOpen(true);
                                    }}
                                    className="group relative w-full cursor-zoom-in touch-pan-y overflow-hidden h-full flex items-center justify-center select-none"
                                >
                                    <CustomImage
                                        src={currentImage}
                                        alt={`${product.name} - image ${safeActiveIdx + 1}`}
                                        fill
                                        priority
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        imageClassName="transition-opacity duration-300 opacity-100 object-contain transition-transform duration-500 group-hover:scale-105"
                                    />

                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute right-2.5 bottom-2.5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white/10 bg-white/20 text-white/80 backdrop-blur-xl transition-colors group-hover:border-orange-500/40 group-hover:text-orange-400"
                                    >
                                        <FiMaximize2 className="text-xs sm:text-sm" />
                                    </span>
                                </div>
                            </div>

                            {allImages.length > 1 && (
                                <div className="relative">
                                    <div
                                        role="tablist"
                                        aria-label="Product images"
                                        className="relative flex gap-2 sm:gap-2.5 overflow-x-auto pb-0.5 px-0.5"
                                    >
                                        {allImages.map((img, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                role="tab"
                                                aria-selected={idx === safeActiveIdx}
                                                onClick={() => setActiveIdx(idx)}
                                                aria-label={`View photo ${idx + 1}`}
                                                className={`relative cursor-pointer h-12 w-12 sm:h-14 sm:w-14 lg:h-[54px] lg:w-[54px] shrink-0 overflow-hidden rounded-xl border transition-all duration-300 bg-transparent ${idx === safeActiveIdx
                                                    ? "border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.35)] opacity-100"
                                                    : "border-transparent opacity-60 hover:opacity-100 hover:border-white/20"
                                                    }`}
                                            >
                                                <CustomImage
                                                    src={img}
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    fill
                                                    sizes="64px"
                                                    imageClassName="transition-opacity duration-300 object-contain p-0.5 transition-transform duration-300 hover:scale-105"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2.5 sm:gap-3">
                            <div className="flex min-w-0 items-center gap-2 pt-0.5">
                                <span className="flex shrink-0 items-center gap-1.5">
                                    <HiSparkles className="text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] text-xs shrink-0" />
                                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.25em] text-orange-400">{product.brand?.name} </span>
                                </span>
                                <span className="h-3 w-px shrink-0 bg-white/25" aria-hidden="true" />
                                <span className="truncate text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">{product.category?.name || "SUPER SPORT"} </span>
                            </div>

                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] xl:text-[2.5rem] font-black leading-[1.12] tracking-tight text-white">
                                    <span className="sr-only"> {product.name} Motorcycle Tyre </span>
                                    <span aria-hidden="true">
                                        <span className="drop-shadow-lg">
                                            <span className="text-white">{headlineParts ? headlineParts.brand : product.name}</span>{" "}
                                            <span className="text-orange-500">{headlineParts ? headlineParts.model : ""}</span>
                                        </span>
                                    </span>
                                </h1>
                            </div>

                            {featurePills.length > 0 && (
                                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 px-0.5 pr-6 [mask-image:linear-gradient(to_right,black_85%,transparent)]">
                                    {featurePills.map((pill, idx) => (
                                        <div
                                            key={idx}
                                            className="shrink-0 flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-white/[0.04] backdrop-blur-sm px-2.5 sm:px-3 py-1 shadow-sm"
                                        >
                                            <HiSparkles className="text-orange-400 text-xs shrink-0" />
                                            <span className="text-[10px] sm:text-[11px] font-semibold text-orange-300 whitespace-nowrap">
                                                {pill}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs sm:text-[13px] md:text-sm leading-relaxed text-zinc-400 line-clamp-2 md:line-clamp-3">
                                {heroDescription}
                            </p>

                            <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-orange-500/[0.05] p-3.5 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl group transition-all duration-500 hover:border-orange-500/50">
                                <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-400/15 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-400/25 transition-colors duration-700" />
                                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="relative">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500 mb-1 drop-shadow-sm">
                                        Price Range
                                    </p>
                                    {isApproved ? (
                                        priceRange ? (
                                            <>
                                                <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                                                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter drop-shadow-md">
                                                        {formatINR(priceRange.min)}
                                                    </span>
                                                    {priceRange.min !== priceRange.max && (
                                                        <>
                                                            <span className="text-lg font-bold text-zinc-500 mx-0.5 drop-shadow-sm">-</span>
                                                            <span className="text-xl sm:text-2xl font-black text-zinc-300 tracking-tighter drop-shadow-md">
                                                                {formatINR(priceRange.max)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="mt-1.5 flex items-center gap-1.5 border-t border-white/10 pt-1.5">
                                                    <BsCheckCircleFill className="text-green-400 text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0" />
                                                    <p className="text-zinc-400 text-[10px] sm:text-[11px] font-medium tracking-wide">
                                                        Inclusive of all taxes • Varies by size
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="pt-0.5 space-y-1">
                                                <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                                    Price on Request
                                                </p>
                                                <div className="mt-1.5 flex items-center gap-1.5 border-t border-white/10 pt-1.5">
                                                    <p className="text-zinc-400 text-[10px] sm:text-[11px] font-medium tracking-wide">
                                                        Select a size below or contact our trade desk for bulk rates
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="pt-0.5 space-y-1">
                                            <Button
                                                variant="link"
                                                size="xl"
                                                uppercase={false}
                                                onClick={openLogin}
                                                icon={<FiLock className="text-orange-500" />}
                                                className="py-0.5 font-black tracking-tight"
                                            >
                                                Login for Trade Price
                                            </Button>
                                            <div className="mt-1.5 flex items-center gap-1.5 border-t border-white/10 pt-1.5">
                                                <p className="text-zinc-400 text-[10px] sm:text-[11px] font-medium tracking-wide">
                                                    Exclusive trade wholesale pricing for registered dealers
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full">
                                <Button
                                    variant="gradient"
                                    size="lg"
                                    full
                                    onClick={scrollToSizes}
                                    rightIcon={
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                                            <FiChevronDown className="text-xs" />
                                        </span>
                                    }
                                >
                                    View All {product.sizes?.length || 1} Sizes
                                </Button>
                            </div>

                            <ul aria-label="Why buy from Torque Block" className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3 gap-2">
                                <li className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm p-2.5 sm:p-3 transition-colors duration-300 hover:border-orange-500/40 shadow-sm">
                                    <FiShield className="shrink-0 text-xl sm:text-2xl text-orange-500" />
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-xs font-bold leading-tight text-white">Secure Payments</span>
                                        <span className="text-[10px] leading-tight text-zinc-400">Safe online checkout</span>
                                    </span>
                                </li>
                                <li className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm p-2.5 sm:p-3 transition-colors duration-300 hover:border-orange-500/40 shadow-sm">
                                    <BsPatchCheck className="shrink-0 text-xl sm:text-2xl text-orange-500" />
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-xs font-bold leading-tight text-white">100% Genuine Products</span>
                                        <span className="text-[10px] leading-tight text-zinc-400">Authentic branded tyres</span>
                                    </span>
                                </li>
                                <li className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm p-2.5 sm:p-3 transition-colors duration-300 hover:border-orange-500/40 shadow-sm">
                                    <BsHeadset className="shrink-0 text-xl sm:text-2xl text-orange-500" />
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-xs font-bold leading-tight text-white">Expert Guidance</span>
                                        <span className="text-[10px] leading-tight text-zinc-400">Tyre advice when needed</span>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>

            {(paragraphs[0] || familyData?.description || product?.description) && (
                <Card variant="section" glow className="space-y-3.5">
                    <div className="relative flex items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-500 shrink-0 shadow-sm">
                                <FiFileText size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.12em] sm:tracking-[0.18em] text-white leading-tight">
                                    DESCRIPTION
                                </h3>
                                <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                                    Tyre Details & Overview
                                </p>
                            </div>
                        </div>

                        {(paragraphs.length > 1 || (familyData?.description && familyData.description.length > 200) || (paragraphs[0] && paragraphs[0].length > 200)) && (
                            <Button
                                variant="link"
                                size="sm"
                                uppercase={false}
                                className="shrink-0 whitespace-nowrap"
                                onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                                aria-expanded={isDescriptionExpanded}
                                rightIcon={isDescriptionExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                            >
                                {isDescriptionExpanded ? "Show Less" : "Read More"}
                            </Button>
                        )}
                    </div>

                    <div className="relative text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-2">
                        {isDescriptionExpanded ? (
                            <div className="max-h-[360px] overflow-y-auto custom-scroll pr-1.5 space-y-2">
                                {paragraphs.length > 0 ? (
                                    paragraphs.map((para, idx) => (
                                        <p key={idx} className="text-zinc-300">
                                            {para}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-zinc-300">
                                        {familyData?.description || product?.description || ""}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-zinc-300 font-normal leading-relaxed line-clamp-3 sm:line-clamp-4">
                                {paragraphs[0] || familyData?.description || product?.description || ""}
                            </p>
                        )}
                    </div>
                </Card>
            )}

            <div id="available-sizes" className="scroll-mt-28 space-y-6 pt-2">
                {size && parsedSpec && (
                    <Card variant="section" glow className="space-y-3">
                        <div className="relative flex items-center justify-between gap-3 pb-2 border-b border-white/10">
                            <div className="flex min-w-0 items-center gap-2">
                                <FiSliders className="text-orange-500 text-sm shrink-0" />
                                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white leading-tight">
                                    Selected Tyre Specifications
                                </h3>
                            </div>
                            <span className="shrink-0 whitespace-nowrap rounded-lg border border-orange-500/40 bg-orange-500/10 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-black text-orange-400">
                                {size.size}
                            </span>
                        </div>

                        <dl className="relative grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                            {[
                                ["Width", parsedSpec.width],
                                ["Aspect", parsedSpec.aspect],
                                ["Rim", parsedSpec.rim],
                                ["Position", size.position || "Front / Rear"],
                                ["Construction", parsedSpec.construction],
                                ["Load / Speed", parsedSpec.loadSpeed],
                                ["Type", parsedSpec.tubeType],
                                ["Segment", product.category?.name || "Tyre"],
                            ].map(([label, value]) => (
                                <div key={label} className="flex min-w-0 flex-col gap-0.5 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 sm:px-3 py-2 backdrop-blur-sm min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between min-[380px]:gap-2">
                                    <dt className="shrink-0 text-[10px] uppercase tracking-wider text-zinc-400 min-[380px]:text-xs min-[380px]:normal-case min-[380px]:tracking-normal">{label}</dt>
                                    <dd className="min-w-0 break-words font-bold leading-snug text-white min-[380px]:text-right" title={String(value ?? "")}>{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </Card>
                )}

                <Card variant="section" glow className="space-y-3">
                    <div className="relative flex items-center justify-between gap-3 pb-2 border-b border-white/10">
                        <h2 className="min-w-0 text-xs sm:text-sm font-bold uppercase tracking-[0.08em] text-white leading-tight">AVAILABLE TYRE SIZES ({sizesToDisplay.length})</h2>
                        {size && product.sizes?.length > 1 && (
                            <Link
                                href={modelHref}
                                className="shrink-0 whitespace-nowrap text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
                            >
                                View all {product.sizes.length} sizes →
                            </Link>
                        )}
                    </div>

                    <StockTable product={product} sizes={sizesToDisplay} isApproved={isApproved} tradePrices={tradePrices} className="relative" />
                </Card>
            </div>

            {isPhotoOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
                    onClick={() => setIsPhotoOpen(false)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="relative max-w-4xl w-full max-h-[88vh] h-[75vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            variant="overlay"
                            size="md"
                            iconOnly
                            pill
                            onClick={() => setIsPhotoOpen(false)}
                            aria-label="Close photo preview"
                            icon={<FiX size={20} />}
                            className="absolute -top-10 sm:-top-12 right-0 z-20"
                        />

                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/60 border border-white/15 p-4 flex items-center justify-center shadow-2xl">
                            <CustomImage
                                src={currentImage}
                                alt={`${product.name} - large preview`}
                                fill
                                sizes="(max-width: 1200px) 90vw, 1000px"
                                imageClassName="object-contain p-4 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                            />

                            {allImages.length > 1 && (
                                <>
                                    <Button
                                        variant="overlay"
                                        size="lg"
                                        iconOnly
                                        pill
                                        onClick={showPrevImage}
                                        aria-label="Previous photo"
                                        icon={<FiChevronLeft size={20} />}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                                    />
                                    <Button
                                        variant="overlay"
                                        size="lg"
                                        iconOnly
                                        pill
                                        onClick={showNextImage}
                                        aria-label="Next photo"
                                        icon={<FiChevronRight size={20} />}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                                    />

                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 rounded-full border border-white/15 bg-black/80 px-3 py-1 text-xs font-bold text-zinc-300">
                                        {safeActiveIdx + 1} of {allImages.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
