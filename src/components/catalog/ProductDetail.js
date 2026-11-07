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
    const [familyImages, setFamilyImages] = useState(null);
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
            const list = [];
            const addImg = (img) => {
                if (!img) return;
                const u = typeof img === "string" ? img.trim() : (img?.url ? String(img.url).trim() : "");
                if (u && !list.includes(u)) list.push(u);
            };
            if (Array.isArray(family.productImages)) {
                family.productImages.forEach(addImg);
            }
            if (list.length > 0) setFamilyImages(list);
        });
        return () => {
            isMounted = false;
        };
    }, [product?.identifier]);

    const allImages = useMemo(() => {
        if (familyImages && familyImages.length > 0) return familyImages;
        const list = [];
        const addImg = (img) => {
            if (!img) return;
            const u = typeof img === "string" ? img.trim() : (img?.url ? String(img.url).trim() : "");
            if (u && !list.includes(u)) list.push(u);
        };
        if (Array.isArray(product.images)) product.images.forEach(addImg);
        if (product.image) addImg(product.image);
        return list.length > 0 ? list : ["/newlogo.webp"];
    }, [familyImages, product.images, product.image]);

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
        <div className="space-y-8 sm:space-y-10 max-w-7xl mx-auto">
            {/* Top Navigation & Breadcrumbs - Matching Reference Image */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-400">
                    <Link href="/" className="hover:text-white transition-colors">
                        Home
                    </Link>
                    <span className="text-zinc-600">›</span>
                    <Link href="/#stock" className="hover:text-white transition-colors">
                        Tyres
                    </Link>
                    <span className="text-zinc-600">›</span>
                    <span className="text-zinc-200 font-semibold truncate max-w-[260px] sm:max-w-none" aria-current="page">
                        {size ? `${product.name} (${size.size})` : product.name}
                    </span>
                </nav>

                <div className="hidden sm:block">
                    <ShareButtons path={path} title={title} text={`${title} – Trade stock & wholesale pricing on Torque Block`} />
                </div>
            </div>

            {/* MAIN 2-COLUMN HERO SHOWCASE - 50% Image / 50% Details matching Reference Image */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* LEFT COLUMN: 50% Large Showcase Photo Box + Horizontal Thumbnails Carousel */}
                <div className="flex flex-col space-y-4">
                    {/* Big Showcase Photo Box - Floating Clean on Page (No Background, No Border) */}
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsPhotoOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") setIsPhotoOpen(true);
                        }}
                        title="Click to view full photo"
                        className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] flex items-center justify-center group/img cursor-zoom-in select-none"
                    >
                        {/* Zoom / Expand Icon in Bottom-Right Corner (Matching Reference Image) */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsPhotoOpen(true);
                            }}
                            aria-label="Expand image to full size"
                            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white border border-white/15 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-md"
                        >
                            <FiMaximize2 size={14} />
                        </button>

                        {/* Main Tyre Photo - Centered floating tyre without background or border */}
                        <CustomImage
                            src={currentImage}
                            alt={`${product.name} - image ${safeActiveIdx + 1}`}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 600px"
                            imageClassName="object-contain w-full h-full transition-transform duration-500 group-hover/img:scale-105 filter drop-shadow-[0_24px_40px_rgba(0,0,0,0.9)]"
                        />
                    </div>

                    {/* Horizontal Thumbnails Row with Arrow Controls (Matching Reference Image) */}
                    {allImages.length > 1 && (
                        <div className="relative flex items-center gap-1.5 pt-1">
                            {/* Left Scroll Button */}
                            <button
                                type="button"
                                onClick={() => scrollThumbs("left")}
                                aria-label="Scroll thumbnails left"
                                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 hover:bg-black text-white border border-white/15 transition-all active:scale-95 shadow-md"
                            >
                                <FiChevronLeft size={14} />
                            </button>

                            {/* Scrollable Thumbnails Strip */}
                            <div
                                ref={thumbScrollRef}
                                className="flex-1 flex items-center gap-2 overflow-x-auto custom-scroll py-1 px-0.5 scroll-smooth"
                            >
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveIdx(idx)}
                                        aria-label={`View photo ${idx + 1}`}
                                        className={`relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl overflow-hidden transition-all bg-white/5 select-none ${
                                            idx === safeActiveIdx
                                                ? "border-2 border-orange-500 ring-2 ring-orange-500/30 scale-105 shadow-md"
                                                : "border border-white/10 opacity-70 hover:opacity-100"
                                        }`}
                                    >
                                        <CustomImage
                                            src={img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            fill
                                            sizes="64px"
                                            imageClassName="object-contain w-full h-full p-1"
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Right Scroll Button */}
                            <button
                                type="button"
                                onClick={() => scrollThumbs("right")}
                                aria-label="Scroll thumbnails right"
                                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 hover:bg-black text-white border border-white/15 transition-all active:scale-95 shadow-md"
                            >
                                <FiChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: 50% Eyebrow, Big Headline, Feature Pills, Subtitle, Price Range, Button, & 3 Trust Cards */}
                <div className="flex flex-col justify-start">
                    {/* 1. Brand & Category Eyebrow Tag (✦ VREDESTEIN | SUPER SPORT) */}
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                        <span className="text-orange-500 flex items-center gap-1 font-black">
                            <HiSparkles className="text-sm shrink-0" />
                            {product.brand?.name || "VREDESTEIN"}
                        </span>
                        <span className="text-zinc-600 font-normal">|</span>
                        <span className="text-zinc-300 font-bold">
                            {product.category?.name || "SUPER SPORT"}
                        </span>
                    </div>

                    {/* 2. Main Headline: Is Vredestein Centauro NS right for your motorcycle? */}
                    <h1 className="text-2xl sm:text-3xl lg:text-[3rem] font-black text-white tracking-tight leading-[1.08] mb-3 drop-shadow-lg">
                        {headlineParts ? (
                            <>
                                <span className="text-white">Is {headlineParts.brand} </span>
                                <span className="text-orange-500">{headlineParts.model}</span>
                                <span className="block text-zinc-200 font-bold text-xl sm:text-2xl lg:text-[1.85rem] mt-1.5 drop-shadow-md">
                                    right for your motorcycle?
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-white">Is </span>
                                <span className="text-orange-500">{product.name}</span>
                                <span className="block text-zinc-200 font-bold text-xl sm:text-2xl lg:text-[1.85rem] mt-1.5 drop-shadow-md">
                                    right for your motorcycle?
                                </span>
                            </>
                        )}
                    </h1>

                    {/* 3. Feature Highlights Badges Row (Horizontal Pills with Sparkles) */}
                    {featurePills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-3.5">
                            {featurePills.map((pill, idx) => (
                                <div
                                    key={idx}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#141822]/90 px-3 py-1 text-[11px] sm:text-xs font-medium text-zinc-200 shadow-sm"
                                >
                                    <HiSparkles className="text-orange-500 text-xs shrink-0" />
                                    <span>{pill}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 4. Product Subtitle Paragraph Description */}
                    <p className="text-zinc-300 text-xs sm:text-sm lg:text-[14px] leading-relaxed font-normal mb-4">
                        {heroDescription}
                    </p>

                    {/* 5. PRICE RANGE Card Container (Login Required for Wholesale Trade Price) */}
                    <div className="rounded-2xl border border-orange-500/20 bg-[#121622]/95 p-4 sm:p-5 shadow-lg mb-3.5 space-y-1.5">
                        <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-orange-500">
                            PRICE RANGE
                        </div>
                        {isApproved ? (
                            <>
                                <div className="text-2xl sm:text-3xl lg:text-[34px] font-black text-white tracking-tight leading-none">
                                    {displayPriceRange}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400 pt-0.5">
                                    <BsCheckCircleFill className="text-emerald-500 text-xs shrink-0" />
                                    <span>Inclusive of all taxes • Varies by size</span>
                                </div>
                            </>
                        ) : (
                            <div className="pt-0.5 space-y-1">
                                <button
                                    type="button"
                                    onClick={openLogin}
                                    className="inline-flex items-center gap-2 text-xl sm:text-2xl lg:text-[26px] font-black text-orange-400 hover:text-orange-300 transition-colors py-0.5 cursor-pointer group/login text-left"
                                >
                                    <FiLock className="text-lg sm:text-xl text-orange-500 group-hover/login:scale-110 transition-transform shrink-0" />
                                    <span className="underline decoration-orange-500/40 underline-offset-4 group-hover/login:decoration-orange-400">
                                        Login for Trade Price
                                    </span>
                                </button>
                                <p className="text-[11px] sm:text-xs text-zinc-400">
                                    Exclusive trade wholesale pricing for registered dealers
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 6. Primary Action Button: VIEW ALL [N] SIZES ⌄ */}
                    <button
                        type="button"
                        onClick={scrollToSizes}
                        className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] py-3.5 sm:py-4 px-6 text-center text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/25 transition-all cursor-pointer mb-3.5"
                    >
                        <span>VIEW ALL {product.sizes?.length || 1} SIZES</span>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white text-xs">
                            <FiChevronDown />
                        </span>
                    </button>

                    {/* 7. Trust Assurance Cards: 3 Cards in a Row (Matching Reference Image 1) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                        {/* Card 1: Secure Payments */}
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#121622] px-3.5 py-3 transition-colors hover:border-orange-500/30 shadow-sm">
                            <svg
                                className="w-7 h-7 text-orange-500 shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                            <div className="min-w-0">
                                <h4 className="text-xs sm:text-[13px] font-bold text-white leading-snug">
                                    Secure Payments
                                </h4>
                                <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 leading-snug">
                                    Safe online checkout
                                </p>
                            </div>
                        </div>

                        {/* Card 2: 100% Genuine Products */}
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#121622] px-3.5 py-3 transition-colors hover:border-orange-500/30 shadow-sm">
                            <BsPatchCheck className="text-orange-500 text-2xl sm:text-[26px] shrink-0" />
                            <div className="min-w-0">
                                <h4 className="text-xs sm:text-[13px] font-bold text-white leading-snug">
                                    100% Genuine<br className="hidden sm:inline" /> Products
                                </h4>
                                <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 leading-snug">
                                    Authentic branded tyres
                                </p>
                            </div>
                        </div>

                        {/* Card 3: Expert Guidance */}
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#121622] px-3.5 py-3 transition-colors hover:border-orange-500/30 shadow-sm">
                            <BsHeadset className="text-orange-500 text-2xl sm:text-[26px] shrink-0" />
                            <div className="min-w-0">
                                <h4 className="text-xs sm:text-[13px] font-bold text-white leading-snug">
                                    Expert Guidance
                                </h4>
                                <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 leading-snug">
                                    Tyre advice when needed
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESCRIPTION SECTION (Matching Reference Image) */}
            <div className="rounded-2xl border border-white/10 bg-[#121622]/90 p-5 sm:p-6 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
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

                    {paragraphs.length > 1 && (
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

                {/* Description Content */}
                <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-2">
                    {isDescriptionExpanded ? (
                        <div className="max-h-[260px] overflow-y-auto custom-scroll pr-1.5 space-y-2">
                            {paragraphs.map((para, idx) => (
                                <p key={idx} className="text-zinc-300">
                                    {para}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-300 font-normal leading-relaxed">
                            {familyData?.description || familyData?.hero?.subtitle || product?.description || paragraphs[0] || ""}
                        </p>
                    )}
                </div>
            </div>

            {/* LOWER SECTION: Available Sizes Table & Specifications */}
            <div id="available-sizes" className="scroll-mt-28 space-y-6 pt-2">
                {/* Compact Technical Specifications (when size is opened via /tyres/[tyre]/[size]) */}
                {size && parsedSpec && (
                    <div className="rounded-2xl border border-white/10 bg-[#161B26] p-4 sm:p-5 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
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

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="rounded-xl bg-black/40 px-3 py-2 border border-white/5 flex items-center justify-between">
                                <span className="text-zinc-400">Width</span>
                                <span className="font-bold text-white">{parsedSpec.width}</span>
                            </div>
                            <div className="rounded-xl bg-black/40 px-3 py-2 border border-white/5 flex items-center justify-between">
                                <span className="text-zinc-400">Aspect</span>
                                <span className="font-bold text-white">{parsedSpec.aspect}</span>
                            </div>
                            <div className="rounded-xl bg-black/40 px-3 py-2 border border-white/5 flex items-center justify-between">
                                <span className="text-zinc-400">Rim</span>
                                <span className="font-bold text-white">{parsedSpec.rim}</span>
                            </div>
                            <div className="rounded-xl bg-black/40 px-3 py-2 border border-white/5 flex items-center justify-between">
                                <span className="text-zinc-400">Position</span>
                                <span className="font-bold text-white">{size.position || "Front / Rear"}</span>
                            </div>
                            <div className="rounded-xl bg-black/40 px-3 py-2 border border-white/5 flex items-center justify-between">
                                <span className="text-zinc-400">Construction</span>
                                <span className="font-bold text-white truncate max-w-[100px]" title={parsedSpec.construction}>
                                    {parsedSpec.construction}
                                </span>
                            </div>
                            <div className="rounded-xl bg-black/40 px-3 py-2 border border-white/5 flex items-center justify-between">
                                <span className="text-zinc-400">Load / Speed</span>
                                <span className="font-bold text-white">{parsedSpec.loadSpeed}</span>
                            </div>
                            <div className="rounded-xl bg-black/40 px-3 py-2 border border-white/5 flex items-center justify-between">
                                <span className="text-zinc-400">Type</span>
                                <span className="font-bold text-white">{parsedSpec.tubeType}</span>
                            </div>
                            <div className="rounded-xl bg-black/40 px-3 py-2 border border-white/5 flex items-center justify-between">
                                <span className="text-zinc-400">Segment</span>
                                <span className="font-bold text-white truncate max-w-[100px]" title={product.category?.name || "Motorcycle Tyre"}>
                                    {product.category?.name || "Tyre"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* SIZES LIST SECTION - Direct scrollable table with centered SIZE, FITMENT, AVAILABILITY */}
                <div className="rounded-2xl border border-white/10 bg-[#161B26] p-4 sm:p-5 shadow-lg space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
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
                    <div className="hidden sm:grid grid-cols-[1.4fr_0.9fr_1.1fr_1.1fr_125px] gap-2 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/10 text-center">
                        <span>SIZE</span>
                        <span>FITMENT</span>
                        <span>AVAILABILITY</span>
                        <span>BUSINESS PRICE</span>
                        <span>ACTION</span>
                    </div>

                    {/* Directly Scrollable Sizes Container */}
                    <div className="max-h-[320px] overflow-y-auto custom-scroll pr-1 space-y-2">
                        {sizesToDisplay.map((s) => {
                            const availability = getAvailabilityLevel(s);
                            const tradePrice = tradePrices?.[s.id] ?? s.tradePrice;
                            const cartItem = items.find((i) => i.id === s.id);
                            const isOutOfStock = availability === "out";

                            return (
                                <div key={s.id}>
                                    {/* Desktop Table Row (Centered Text Alignment) */}
                                    <div className="hidden sm:grid grid-cols-[1.4fr_0.9fr_1.1fr_1.1fr_125px] items-center gap-2 rounded-xl border border-white/10 bg-[#1E2433] hover:bg-[#252C3D] hover:border-orange-500/30 transition-colors px-3.5 py-2.5 text-center shadow-sm">
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
                                                <div className="flex items-center gap-1 bg-[#121622] border border-orange-500/40 rounded-lg p-0.5 shadow-sm">
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
                                    <div className="flex sm:hidden flex-col gap-2 p-3 rounded-xl border border-white/10 bg-[#1E2433] shadow-sm">
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
                                                    <span className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-300">
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
                                                    <div className="flex items-center gap-1 bg-[#121622] border border-orange-500/40 rounded-lg p-0.5">
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
