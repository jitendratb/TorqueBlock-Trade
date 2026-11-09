"use client";

import { buildProductParagraphs, parseTyreSize, tyreHref } from "@/lib/catalog.utils";
import { formatINR } from "@/lib/format";
import { fetchProductFamily } from "@/services/CatalogService";
import { selectIsApproved, useAuthStore } from "@/store/authStore";
import { useCatalogStore } from "@/store/catalogStore";
import { toLine, useOrderListStore } from "@/store/orderStore";
import { useUiStore } from "@/store/ui.store";
import { CustomImage, ShareButtons } from "@/ui";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BsCheckCircleFill, BsHeadset, BsPatchCheck } from "react-icons/bs";
import {
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiChevronUp,
    FiFileText,
    FiLock,
    FiMaximize2,
    FiMinus,
    FiPlus,
    FiShoppingCart,
    FiSliders,
    FiX,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import StockBadge, { getAvailabilityLevel } from "./StockBadge";

// Comprehensive image extractor supporting single image, array, gallery, hero, and size-specific images
const extractImageList = (product, familyData) => {
    const list = [];
    const addImg = (img) => {
        if (!img) return;
        let u = "";
        if (typeof img === "string") {
            u = img.trim();
        } else if (typeof img === "object" && img !== null) {
            u = (img.url || img.src || img.secure_url || img.heroImage || img.image || "").trim();
            if (!u) {
                const numericKeys = Object.keys(img)
                    .filter((k) => k !== "_id" && !isNaN(k))
                    .sort((a, b) => Number(a) - Number(b));
                if (numericKeys.length > 0) {
                    u = numericKeys.map((k) => img[k]).join("").trim();
                }
            }
        }
        if (u) {
            if (u.startsWith("//")) u = `https:${u}`;
            if (!list.includes(u)) list.push(u);
        }
    };

    // 1. Primary product stock image (renders immediately on SSR and page load)
    if (product?.image) addImg(product.image);
    if (Array.isArray(product?.images)) product.images.forEach(addImg);
    if (Array.isArray(product?.productImages)) product.productImages.forEach(addImg);
    if (product?.hero?.heroImage) addImg(product.hero.heroImage);

    // 2. Family product images from intent API
    if (Array.isArray(familyData?.productImages)) familyData.productImages.forEach(addImg);

    // 3. Family hero images
    if (familyData?.hero?.heroImage) addImg(familyData.hero.heroImage);
    if (familyData?.hero?.mobileHeroImage) addImg(familyData.hero.mobileHeroImage);

    // 4. Family gallery & general images
    if (Array.isArray(familyData?.gallery)) familyData.gallery.forEach(addImg);
    if (Array.isArray(familyData?.images)) familyData.images.forEach(addImg);

    // 5. Family sizesIds size-specific images
    if (Array.isArray(familyData?.sizesIds)) {
        familyData.sizesIds.forEach((s) => {
            if (Array.isArray(s?.sizeSpecificImages)) s.sizeSpecificImages.forEach(addImg);
            if (s?.hero?.heroImage) addImg(s.hero.heroImage);
            if (s?.image) addImg(s.image);
        });
    }

    // 6. Product size images
    if (Array.isArray(product?.sizes)) {
        product.sizes.forEach((s) => {
            if (s?.image) addImg(s.image);
            if (Array.isArray(s?.images)) s.images.forEach(addImg);
            if (Array.isArray(s?.sizeSpecificImages)) s.sizeSpecificImages.forEach(addImg);
        });
    }

    return list.length > 0 ? list : ["/newlogo.webp"];
};

export default function ProductDetail({ product, size = null }) {
    const isApproved = useAuthStore(selectIsApproved);
    const tradePrices = useCatalogStore((s) => s.tradePrices);
    const loadTradePrices = useCatalogStore((s) => s.loadTradePrices);

    const items = useOrderListStore((s) => s.items);
    const add = useOrderListStore((s) => s.add);
    const setQuantity = useOrderListStore((s) => s.setQuantity);
    const remove = useOrderListStore((s) => s.remove);

    const openLogin = useUiStore((s) => s.openLogin);
    const setOrderListOpen = useUiStore((s) => s.setOrderListOpen);
    const notify = useUiStore((s) => s.notify);

    const [familyData, setFamilyData] = useState(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isPhotoOpen, setIsPhotoOpen] = useState(false);
    const thumbScrollRef = useRef(null);

    useEffect(() => {
        if (isApproved) loadTradePrices();
    }, [isApproved, loadTradePrices]);

    useEffect(() => {
        if (!product?.identifier) return;
        let isMounted = true;
        fetchProductFamily(product.identifier).then((family) => {
            if (!isMounted || !family) return;
            setFamilyData(family);
        });
        return () => {
            isMounted = false;
        };
    }, [product?.identifier]);

    const allImages = useMemo(() => {
        return extractImageList(product, familyData);
    }, [product, familyData]);

    const safeActiveIdx = activeIdx < allImages.length ? activeIdx : 0;
    const currentImage = allImages[safeActiveIdx] || allImages[0];

    const modelHref = tyreHref(product);
    const path = tyreHref(product, size);
    const title = size ? `${product.name} ${size.size}` : product.name;

    // Price range calculation (from product sizes or backend family intent data)
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
        return { min: 4320, max: 8140 };
    }, [product.sizes, tradePrices, familyData]);

    const displayPriceRange = useMemo(() => {
        if (!priceRange.min && !priceRange.max) return "Wholesale Trade Pricing";
        if (priceRange.min === priceRange.max) return `${formatINR(priceRange.min)}`;
        return `${formatINR(priceRange.min)} - ${formatINR(priceRange.max)}`;
    }, [priceRange]);

    // Headline brand/model separation matching reference image
    const headlineParts = useMemo(() => {
        const fullName = product.name || "";
        const brandName = product.brand?.name || "";
        if (brandName && fullName.toLowerCase().startsWith(brandName.toLowerCase())) {
            const model = fullName.slice(brandName.length).trim();
            return { brand: brandName, model: model || fullName };
        }
        return { brand: brandName, model: fullName };
    }, [product.name, product.brand]);

    // Feature highlights pills matching reference image
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

    // Product Overview & buildProductParagraphs
    const paragraphs = useMemo(
        () => buildProductParagraphs(product, familyData),
        [product, familyData]
    );

    // Hero description text from backend or category fallback
    const heroDescription = useMemo(() => {
        return (
            familyData?.hero?.subtitle ||
            familyData?.description ||
            product.description ||
            paragraphs[0] ||
            "Race-inspired grip, razor-sharp handling, and exceptional high-speed stability for riders who demand premium supersport performance on every road."
        );
    }, [familyData, product.description, paragraphs]);

    // Match backend size data from familyData.sizesIds if available
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

    // Sizes to display (either the single requested size or all sizes)
    const sizesToDisplay = size ? [size] : (product.sizes || []);

    const handleAddToCart = (targetSize) => {
        const line = toLine(product, targetSize, 1);
        add(line);
        notify("success", `Added ${product.name} ${targetSize.size} to order list.`);
    };

    const scrollToSizes = () => {
        const el = document.getElementById("available-sizes");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    const scrollThumbs = (direction) => {
        if (thumbScrollRef.current) {
            thumbScrollRef.current.scrollBy({ left: direction === "left" ? -140 : 140, behavior: "smooth" });
        }
    };

    return (
        <div className="space-y-3.5 sm:space-y-4 max-w-7xl mx-auto">
            {/* Top Navigation & Breadcrumbs + Hero Showcase (Tight spacing matching torqueblock.com) */}
            <div className="space-y-1.5 sm:space-y-2">
                {/* Top Navigation & Breadcrumbs */}
                <div className="flex items-center justify-between gap-3 py-0.5 min-h-[30px]">
                    <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
                        <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[13px] md:text-sm text-zinc-400 truncate">
                            <li className="flex items-center gap-1.5 shrink-0">
                                <Link className="transition-colors text-zinc-400 hover:text-orange-400 shrink-0 font-medium" href="/">
                                    Home
                                </Link>
                                <span className="text-zinc-600 select-none text-[11px] sm:text-xs">›</span>
                            </li>
                            <li className="flex items-center gap-1.5 shrink-0">
                                <Link className="transition-colors text-zinc-400 hover:text-orange-400 shrink-0 font-medium" href="/#stock">
                                    Tyres
                                </Link>
                                <span className="text-zinc-600 select-none text-[11px] sm:text-xs">›</span>
                            </li>
                            <li className="flex items-center gap-1.5 min-w-0 truncate">
                                <span className="text-white font-semibold truncate" aria-current="page">
                                    {size ? `${product.name} (${size.size})` : product.name}
                                </span>
                            </li>
                        </ol>
                    </nav>

                    <div className="flex shrink-0 items-center">
                        <ShareButtons path={path} title={title} text={`${title} – Trade stock & wholesale pricing on Torque Block`} size="sm" />
                    </div>
                </div>

                {/* MAIN 2-COLUMN HERO SHOWCASE - Exact Classes & Spacing from torqueblock.com */}
                <section className="w-full relative">
                    <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-2 lg:gap-8 items-start">
                        {/* LEFT COLUMN: Showcase Photo Box + Horizontal Thumbnails */}
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

                                    {/* Zoom / Expand Icon in Bottom-Right Corner */}
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute right-2.5 bottom-2.5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white/10 bg-white/20 text-white/80 backdrop-blur-xl transition-colors group-hover:border-orange-500/40 group-hover:text-orange-400"
                                    >
                                        <svg
                                            stroke="currentColor"
                                            fill="none"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-xs"
                                            height="1em"
                                            width="1em"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <polyline points="15 3 21 3 21 9" />
                                            <polyline points="9 21 3 21 3 15" />
                                            <line x1="21" y1="3" x2="14" y2="10" />
                                            <line x1="3" y1="21" x2="10" y2="14" />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Horizontal Thumbnails Row */}
                            {allImages.length > 1 && (
                                <div className="relative">
                                    <div
                                        ref={thumbScrollRef}
                                        role="tablist"
                                        aria-label="Product images"
                                        className="relative flex gap-2 sm:gap-2.5 overflow-x-auto pb-0.5 scrollbar-none px-0.5"
                                    >
                                        {allImages.map((img, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                role="tab"
                                                aria-selected={idx === safeActiveIdx}
                                                onClick={() => setActiveIdx(idx)}
                                                aria-label={`View photo ${idx + 1}`}
                                                className={`relative cursor-pointer h-12 w-12 sm:h-14 sm:w-14 lg:h-[54px] lg:w-[54px] shrink-0 overflow-hidden rounded-xl border transition-all duration-300 ${idx === safeActiveIdx
                                                    ? "border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.35)] ring-1 ring-orange-500/40"
                                                    : "border-white/10 bg-white/[0.03] hover:border-white/25"
                                                    }`}
                                            >
                                                <CustomImage
                                                    src={img}
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    fill
                                                    sizes="64px"
                                                    imageClassName="transition-opacity duration-300 object-contain p-1 transition-transform duration-300 hover:scale-105"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Eyebrow, Big Headline, Feature Pills, Subtitle, Price Range, Button, & 3 Trust Badges */}
                        <div className="flex flex-col gap-2.5 sm:gap-3">
                            {/* 1. Brand & Category Eyebrow Tag */}
                            <div className="flex min-w-0 items-center gap-2 pt-0.5">
                                <span className="flex shrink-0 items-center gap-1.5">
                                    <svg
                                        stroke="currentColor"
                                        fill="currentColor"
                                        strokeWidth="0"
                                        viewBox="0 0 24 24"
                                        className="text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                                        aria-hidden="true"
                                        height="13"
                                        width="13"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
                                    </svg>
                                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.25em] text-orange-400">{product.brand?.name} </span>
                                </span>
                                <span className="h-3 w-px shrink-0 bg-white/25" aria-hidden="true" />
                                <span className="truncate text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">{product.category?.name || "SUPER SPORT"} </span>
                            </div>

                            {/* 2. Main Headline: Is Brand Model right for your motorcycle? */}
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] xl:text-[2.5rem] font-black leading-[1.12] tracking-tight text-white">
                                    <span className="sr-only"> {product.name} Motorcycle Tyre </span>
                                    <span aria-hidden="true">
                                        <span className="drop-shadow-lg">
                                            Is <span className="text-white">{headlineParts ? headlineParts.brand : product.name}</span>{" "}
                                            <span className="text-orange-500">{headlineParts ? headlineParts.model : ""}</span>
                                        </span>
                                        <span className="block text-zinc-400 text-lg sm:text-xl lg:text-2xl font-medium tracking-tight mt-0.5 sm:mt-1">
                                            right for your motorcycle?
                                        </span>
                                    </span>
                                </h1>
                            </div>

                            {/* 3. Feature Highlights Badges Row */}
                            {featurePills.length > 0 && (
                                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-none px-0.5">
                                    {featurePills.map((pill, idx) => (
                                        <div
                                            key={idx}
                                            className="shrink-0 flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-white/[0.04] backdrop-blur-sm px-2.5 sm:px-3 py-1 shadow-sm"
                                        >
                                            <svg
                                                stroke="currentColor"
                                                fill="currentColor"
                                                strokeWidth="0"
                                                viewBox="0 0 24 24"
                                                className="text-orange-400 text-[10px] shrink-0"
                                                height="1em"
                                                width="1em"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
                                            </svg>
                                            <span className="text-[10px] sm:text-[11px] font-semibold text-orange-300 whitespace-nowrap">
                                                {pill}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 4. Product Subtitle Paragraph Description */}
                            <p className="text-xs sm:text-[13px] md:text-sm leading-relaxed text-zinc-400 line-clamp-2 md:line-clamp-3">
                                {heroDescription}
                            </p>

                            {/* 5. PRICE RANGE Card Container (Light Frosted Blur matching torqueblock.com) */}
                            <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-orange-500/[0.05] p-3.5 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl group transition-all duration-500 hover:border-orange-500/50">
                                {/* Soft light glow orbs - Subtle ambient reflection */}
                                <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-400/15 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-400/25 transition-colors duration-700" />
                                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="relative">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500 mb-1 drop-shadow-sm">
                                        Price Range
                                    </p>
                                    {isApproved ? (
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
                                                <svg
                                                    stroke="currentColor"
                                                    fill="currentColor"
                                                    strokeWidth="0"
                                                    viewBox="0 0 24 24"
                                                    className="text-green-400 text-sm drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                                                    height="1em"
                                                    width="1em"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path fill="none" d="M0 0h24v24H0z" />
                                                    <path d="m23 12-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" />
                                                </svg>
                                                <p className="text-zinc-400 text-[10px] sm:text-[11px] font-medium tracking-wide">
                                                    Inclusive of all taxes • Varies by size
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="pt-0.5 space-y-1">
                                            <button
                                                type="button"
                                                onClick={openLogin}
                                                className="inline-flex items-center gap-2 text-xl sm:text-2xl font-black text-orange-400 hover:text-orange-300 transition-colors py-0.5 cursor-pointer group/login text-left tracking-tight"
                                            >
                                                <FiLock className="text-lg sm:text-xl text-orange-500 group-hover/login:scale-110 transition-transform shrink-0" />
                                                <span>Login for Trade Price</span>
                                            </button>
                                            <div className="mt-1.5 flex items-center gap-1.5 border-t border-white/10 pt-1.5">
                                                <p className="text-zinc-400 text-[10px] sm:text-[11px] font-medium tracking-wide">
                                                    Exclusive trade wholesale pricing for registered dealers
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 6. Primary Action Button: VIEW ALL [N] SIZES ⌵ */}
                            <div className="w-full">
                                <button
                                    type="button"
                                    onClick={scrollToSizes}
                                    className="group relative w-full flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 sm:py-3.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-lg shadow-orange-500/20"
                                >
                                    <span className="relative z-10 text-xs sm:text-[13px] md:text-sm font-black uppercase tracking-[0.2em] text-white drop-shadow-md">
                                        View All {product.sizes?.length || 1} Sizes
                                    </span>
                                    <div className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0.5">
                                        <svg
                                            stroke="currentColor"
                                            fill="currentColor"
                                            strokeWidth="0"
                                            viewBox="0 0 448 512"
                                            className="text-white text-[11px] drop-shadow-sm"
                                            height="1em"
                                            width="1em"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z" />
                                        </svg>
                                    </div>
                                </button>
                            </div>

                            {/* 7. Trust Assurance Cards: 3 Cards in a Row (Light Frosted Glass) */}
                            <ul aria-label="Why buy from Torque Block" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <li className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm p-2.5 sm:p-3 transition-colors duration-300 hover:border-orange-500/40 shadow-sm">
                                    <svg
                                        stroke="currentColor"
                                        fill="none"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="shrink-0 text-xl sm:text-2xl text-orange-500"
                                        aria-hidden="true"
                                        height="1em"
                                        width="1em"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06" />
                                        <path d="M15 19l2 2l4 -4" />
                                    </svg>
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-xs font-bold leading-tight text-white">Secure Payments</span>
                                        <span className="text-[10px] leading-tight text-zinc-400">Safe online checkout</span>
                                    </span>
                                </li>
                                <li className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm p-2.5 sm:p-3 transition-colors duration-300 hover:border-orange-500/40 shadow-sm">
                                    <svg
                                        stroke="currentColor"
                                        fill="none"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="shrink-0 text-xl sm:text-2xl text-orange-500"
                                        aria-hidden="true"
                                        height="1em"
                                        width="1em"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1" />
                                        <path d="M9 12l2 2l4 -4" />
                                    </svg>
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-xs font-bold leading-tight text-white">100% Genuine Products</span>
                                        <span className="text-[10px] leading-tight text-zinc-400">Authentic branded tyres</span>
                                    </span>
                                </li>
                                <li className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm p-2.5 sm:p-3 transition-colors duration-300 hover:border-orange-500/40 shadow-sm">
                                    <svg
                                        stroke="currentColor"
                                        fill="none"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="shrink-0 text-xl sm:text-2xl text-orange-500"
                                        aria-hidden="true"
                                        height="1em"
                                        width="1em"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
                                        <path d="M18 19c0 1.657 -1.343 3 -3 3l-1 0c-1.657 0 -3 -1.343 -3 -3l0 -2c0 -1.657 1.343 -3 3 -3l1 0c1.657 0 3 1.343 3 3l0 2z" />
                                        <path d="M4 19c0 1.657 1.343 3 3 3l1 0c1.657 0 3 -1.343 3 -3l0 -2c0 -1.657 -1.343 -3 -3 -3l-1 0c-1.657 0 -3 1.343 -3 3l0 2z" />
                                    </svg>
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

            {/* DESCRIPTION SECTION (Light Frosted Blur matching torqueblock.com) */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-3.5">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-500 shrink-0 shadow-sm">
                            <FiFileText size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white leading-tight">
                                DESCRIPTION
                            </h3>
                            <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                                Tyre Details & Overview
                            </p>
                        </div>
                    </div>

                    {(paragraphs.length > 1 || (familyData?.description && familyData.description.length > 200) || (paragraphs[0] && paragraphs[0].length > 200)) && (
                        <button
                            type="button"
                            onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
                        >
                            <span>{isDescriptionExpanded ? "Show Less" : "Read More"}</span>
                            {isDescriptionExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                        </button>
                    )}
                </div>

                {/* Description Content - Only Pure Description */}
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
            </div>

            {/* LOWER SECTION: Available Sizes Table & Specifications */}
            <div id="available-sizes" className="scroll-mt-28 space-y-6 pt-2">
                {/* Compact Technical Specifications (when size is opened via /tyres/[tyre]/[size]) */}
                {size && parsedSpec && (
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent p-4 sm:p-5 backdrop-blur-xl shadow-lg space-y-3">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative flex items-center justify-between pb-2 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <FiSliders className="text-orange-500 text-sm shrink-0" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                                    Selected Tyre Specifications
                                </h3>
                            </div>
                            <span className="rounded-lg border border-orange-500/40 bg-orange-500/10 px-2.5 py-1 text-xs font-black text-orange-400">
                                {size.size}
                            </span>
                        </div>

                        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="rounded-xl bg-white/[0.03] backdrop-blur-sm px-3 py-2 border border-white/10 flex items-center justify-between">
                                <span className="text-zinc-400">Width</span>
                                <span className="font-bold text-white">{parsedSpec.width}</span>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] backdrop-blur-sm px-3 py-2 border border-white/10 flex items-center justify-between">
                                <span className="text-zinc-400">Aspect</span>
                                <span className="font-bold text-white">{parsedSpec.aspect}</span>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] backdrop-blur-sm px-3 py-2 border border-white/10 flex items-center justify-between">
                                <span className="text-zinc-400">Rim</span>
                                <span className="font-bold text-white">{parsedSpec.rim}</span>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] backdrop-blur-sm px-3 py-2 border border-white/10 flex items-center justify-between">
                                <span className="text-zinc-400">Position</span>
                                <span className="font-bold text-white">{size.position || "Front / Rear"}</span>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] backdrop-blur-sm px-3 py-2 border border-white/10 flex items-center justify-between">
                                <span className="text-zinc-400">Construction</span>
                                <span className="font-bold text-white truncate max-w-[100px]" title={parsedSpec.construction}>
                                    {parsedSpec.construction}
                                </span>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] backdrop-blur-sm px-3 py-2 border border-white/10 flex items-center justify-between">
                                <span className="text-zinc-400">Load / Speed</span>
                                <span className="font-bold text-white">{parsedSpec.loadSpeed}</span>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] backdrop-blur-sm px-3 py-2 border border-white/10 flex items-center justify-between">
                                <span className="text-zinc-400">Type</span>
                                <span className="font-bold text-white">{parsedSpec.tubeType}</span>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] backdrop-blur-sm px-3 py-2 border border-white/10 flex items-center justify-between">
                                <span className="text-zinc-400">Segment</span>
                                <span className="font-bold text-white truncate max-w-[100px]" title={product.category?.name || "Motorcycle Tyre"}>
                                    {product.category?.name || "Tyre"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* SIZES LIST SECTION - Direct scrollable table with centered SIZE, FITMENT, AVAILABILITY */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent p-4 sm:p-5 backdrop-blur-xl shadow-lg space-y-3">
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative flex items-center justify-between pb-2 border-b border-white/10">
                        <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-white">
                            AVAILABLE TYRE SIZES ({sizesToDisplay.length})
                        </h2>
                        {size && product.sizes?.length > 1 && (
                            <Link
                                href={modelHref}
                                className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
                            >
                                View all {product.sizes.length} sizes →
                            </Link>
                        )}
                    </div>

                    {/* Table Column Headers (Centered) */}
                    <div className="relative hidden sm:grid grid-cols-[1.4fr_0.9fr_1.1fr_1.1fr_125px] gap-2 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/10 text-center">
                        <span>SIZE</span>
                        <span>FITMENT</span>
                        <span>AVAILABILITY</span>
                        <span>BUSINESS PRICE</span>
                        <span>ACTION</span>
                    </div>

                    {/* Directly Scrollable Sizes Container */}
                    <div className="relative max-h-[320px] overflow-y-auto custom-scroll pr-1 space-y-2">
                        {sizesToDisplay.map((s) => {
                            const availability = getAvailabilityLevel(s);
                            const tradePrice = tradePrices?.[s.id] ?? s.tradePrice;
                            const cartItem = items.find((i) => i.id === s.id);
                            const isOutOfStock = availability === "out";

                            return (
                                <div key={s.id}>
                                    {/* Desktop Table Row (Centered Text Alignment) */}
                                    <div className="hidden sm:grid grid-cols-[1.4fr_0.9fr_1.1fr_1.1fr_125px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-orange-500/30 backdrop-blur-sm transition-colors px-3.5 py-2.5 text-center shadow-sm">
                                        {/* SIZE (Centered) */}
                                        <div className="flex items-center justify-center">
                                            {size ? (
                                                <span className="text-sm lg:text-[15px] font-black text-white tracking-tight">
                                                    {s.size}
                                                </span>
                                            ) : (
                                                <Link
                                                    href={tyreHref(product, s)}
                                                    className="text-sm lg:text-[15px] font-black text-white hover:text-orange-400 tracking-tight transition-colors"
                                                    title={`View ${product.name} ${s.size} specifications`}
                                                >
                                                    {s.size}
                                                </Link>
                                            )}
                                        </div>

                                        {/* FITMENT (Centered) */}
                                        <div className="flex items-center justify-center">
                                            <span className="rounded border border-white/15 bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-300">
                                                {s.position || "Front / Rear"}
                                            </span>
                                        </div>

                                        {/* AVAILABILITY (Centered) */}
                                        <div className="flex items-center justify-center">
                                            <StockBadge size={s} />
                                        </div>

                                        {/* BUSINESS PRICE (Centered) */}
                                        <div className="flex flex-col items-center justify-center text-center leading-none">
                                            {isApproved ? (
                                                tradePrice ? (
                                                    <div>
                                                        <p className="text-sm lg:text-[15px] font-black text-amber-400 leading-none">
                                                            {formatINR(tradePrice)}
                                                        </p>
                                                        <p className="text-[9px] font-medium text-zinc-400 mt-0.5">
                                                            +18% GST
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-zinc-500 font-semibold">–</span>
                                                )
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={openLogin}
                                                    className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300 hover:text-orange-400 transition-colors"
                                                    title="Login to unlock trade wholesale prices"
                                                >
                                                    <FiLock className="text-orange-400 text-[10px] shrink-0" />
                                                    <span>Login</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* ACTION (Centered) */}
                                        <div className="flex items-center justify-center">
                                            {cartItem ? (
                                                <div className="flex items-center gap-1 bg-white/[0.05] border border-orange-500/40 rounded-lg p-0.5 shadow-sm">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (cartItem.quantity <= 1) remove(s.id);
                                                            else setQuantity(s.id, cartItem.quantity - 1);
                                                        }}
                                                        aria-label="Decrease quantity"
                                                        className="h-6 w-6 rounded bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-zinc-300 flex items-center justify-center transition-colors active:scale-95"
                                                    >
                                                        <FiMinus size={10} />
                                                    </button>
                                                    <span className="min-w-5 text-center text-xs font-black text-white">
                                                        {cartItem.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuantity(s.id, cartItem.quantity + 1)}
                                                        aria-label="Increase quantity"
                                                        className="h-6 w-6 rounded bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-zinc-300 flex items-center justify-center transition-colors active:scale-95"
                                                    >
                                                        <FiPlus size={10} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOrderListOpen(true)}
                                                        className="ml-0.5 px-2 py-0.5 rounded bg-orange-500 hover:bg-orange-600 text-[10px] font-black uppercase tracking-wider text-white transition-all shadow-sm"
                                                    >
                                                        Cart
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={isOutOfStock}
                                                    onClick={() => handleAddToCart(s)}
                                                    className="flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 py-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-white transition-all shadow-sm shadow-orange-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    <FiShoppingCart size={12} />
                                                    <span>{isOutOfStock ? "Out" : "Add"}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mobile View (< sm) */}
                                    <div className="flex sm:hidden flex-col gap-2 p-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                {size ? (
                                                    <span className="text-sm font-black text-white">{s.size}</span>
                                                ) : (
                                                    <Link href={tyreHref(product, s)} className="text-sm font-black text-white hover:text-orange-400 transition-colors">
                                                        {s.size}
                                                    </Link>
                                                )}
                                                {s.position && (
                                                    <span className="rounded border border-white/15 bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-300">
                                                        {s.position}
                                                    </span>
                                                )}
                                            </div>
                                            <StockBadge size={s} />
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                                            <div className="leading-none">
                                                {isApproved && tradePrice ? (
                                                    <div>
                                                        <p className="text-sm font-black text-amber-400">{formatINR(tradePrice)}</p>
                                                        <p className="text-[9px] text-zinc-400">+18% GST</p>
                                                    </div>
                                                ) : (
                                                    <button type="button" onClick={openLogin} className="text-[11px] text-orange-400 font-semibold">
                                                        Login for price
                                                    </button>
                                                )}
                                            </div>

                                            <div>
                                                {cartItem ? (
                                                    <div className="flex items-center gap-1 bg-white/[0.05] border border-orange-500/40 rounded-lg p-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (cartItem.quantity <= 1) remove(s.id);
                                                                else setQuantity(s.id, cartItem.quantity - 1);
                                                            }}
                                                            className="h-6 w-6 text-zinc-300 flex items-center justify-center"
                                                        >
                                                            <FiMinus size={10} />
                                                        </button>
                                                        <span className="min-w-4 text-center text-xs font-black text-white">{cartItem.quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setQuantity(s.id, cartItem.quantity + 1)}
                                                            className="h-6 w-6 text-zinc-300 flex items-center justify-center"
                                                        >
                                                            <FiPlus size={10} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setOrderListOpen(true)}
                                                            className="px-2 py-0.5 rounded bg-orange-500 text-[9px] font-black uppercase text-white"
                                                        >
                                                            Cart
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={isOutOfStock}
                                                        onClick={() => handleAddToCart(s)}
                                                        className="flex items-center justify-center gap-1 rounded-lg bg-orange-500 py-1.5 px-3 text-[11px] font-bold uppercase text-white disabled:opacity-40"
                                                    >
                                                        <FiShoppingCart size={12} />
                                                        <span>{isOutOfStock ? "Out" : "Add to Cart"}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FULL-SIZE PHOTO LIGHTBOX MODAL */}
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
                        {/* Close Lightbox Button */}
                        <button
                            type="button"
                            onClick={() => setIsPhotoOpen(false)}
                            aria-label="Close photo preview"
                            className="absolute -top-10 sm:-top-12 right-0 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-orange-500 hover:text-white transition-colors"
                        >
                            <FiX size={20} />
                        </button>

                        {/* Large Photo Display */}
                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/60 border border-white/15 p-4 flex items-center justify-center shadow-2xl">
                            <CustomImage
                                src={currentImage}
                                alt={`${product.name} - large preview`}
                                fill
                                sizes="(max-width: 1200px) 90vw, 1000px"
                                imageClassName="object-contain p-4 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                            />

                            {/* Lightbox Navigation Controls */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
                                        }}
                                        aria-label="Previous photo"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white border border-white/20 transition-all hover:border-orange-500 hover:text-orange-400 active:scale-95 shadow-lg"
                                    >
                                        <FiChevronLeft size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveIdx((prev) => (prev + 1) % allImages.length);
                                        }}
                                        aria-label="Next photo"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white border border-white/20 transition-all hover:border-orange-500 hover:text-orange-400 active:scale-95 shadow-lg"
                                    >
                                        <FiChevronRight size={20} />
                                    </button>

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
