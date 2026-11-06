"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
    FiArrowLeft,
    FiChevronLeft,
    FiChevronRight,
    FiChevronDown,
    FiChevronUp,
    FiMinus,
    FiPlus,
    FiShoppingCart,
    FiLock,
    FiCheckCircle,
    FiShield,
    FiTruck,
    FiSliders,
    FiFileText,
} from "react-icons/fi";
import { BsLightningChargeFill } from "react-icons/bs";
import { CustomImage, ShareButtons } from "@/ui";
import { formatINR } from "@/lib/format";
import {
    tyreHref,
    parseTyreSize,
    buildProductParagraphs,
    getProductHighlights,
} from "@/lib/catalog.utils";
import { useAuthStore, selectIsApproved } from "@/store/authStore";
import { useCatalogStore } from "@/store/catalogStore";
import { useOrderListStore, toLine } from "@/store/orderStore";
import { useUiStore } from "@/store/ui.store";
import { fetchProductFamily } from "@/services/CatalogService";
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
    const [showAllSizes, setShowAllSizes] = useState(false);

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

    // Match backend size data from familyData.sizesIds if available
    const matchedBackendSize = useMemo(() => {
        if (!size || !Array.isArray(familyData?.sizesIds)) return null;
        return (
            familyData.sizesIds.find(
                (s) => String(s._id) === String(size.id) || s.size === size.size
            ) || null
        );
    }, [size, familyData]);

    const parsedSpec = useMemo(
        () => (size ? parseTyreSize(size.size, size.spec, matchedBackendSize || size) : null),
        [size, matchedBackendSize]
    );

    const paragraphs = useMemo(
        () => buildProductParagraphs(product, familyData),
        [product, familyData]
    );

    const highlights = useMemo(
        () => getProductHighlights(product, familyData),
        [product, familyData]
    );

    // Sizes to display (either the single requested size or all sizes)
    const sizesToDisplay = size ? [size] : (product.sizes || []);
    // Limit to 4 sizes initially unless toggled
    const visibleSizes = showAllSizes || sizesToDisplay.length <= 4 ? sizesToDisplay : sizesToDisplay.slice(0, 4);

    const handleAddToCart = (targetSize) => {
        const line = toLine(product, targetSize, 1);
        add(line);
        notify("success", `Added ${product.name} ${targetSize.size} to order list.`);
    };

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Top Navigation & Breadcrumbs - Clean Spacing */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-zinc-400">
                    <Link
                        href="/#stock"
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <FiArrowLeft className="text-xs" />
                        <span>All Tyres</span>
                    </Link>
                    <span>/</span>
                    <Link href="/" className="hover:text-white transition-colors">
                        Catalog
                    </Link>
                    {product.brand && (
                        <>
                            <span>/</span>
                            <span className="text-zinc-300">{product.brand.name}</span>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-white font-bold" aria-current="page">
                        {size ? `${product.name} (${size.size})` : product.name}
                    </span>
                </div>

                <ShareButtons path={path} title={title} text={`${title} – Trade stock & wholesale pricing on Torque Block`} />
            </div>

            {/* Main Product Card Container - Compact 1-Page Layout */}
            <div className="rounded-xl sm:rounded-2xl bg-[#22262E]/95 border border-white/10 p-3.5 sm:p-5 lg:p-6 shadow-xl backdrop-blur-xl text-white">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
                    {/* LEFT COLUMN: Premium Tyre Showcase + Compact Specs / Assurance */}
                    <div className="lg:col-span-5 flex flex-col space-y-3">
                        {/* Premium Studio Showcase Image Box */}
                        <div className="relative w-full max-w-[270px] sm:max-w-[290px] mx-auto aspect-square rounded-2xl bg-gradient-to-b from-[#1E232E] via-[#141822] to-[#0D1017] border border-white/15 p-3 sm:p-4 flex items-center justify-center overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] group/img">
                            {/* Studio Lighting Vignette */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07)_0%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />

                            {/* Brand Badge */}
                            {product.brand && (
                                <div className="absolute top-2.5 left-2.5 z-10">
                                    <span className="rounded-md border border-orange-500/30 bg-black/75 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-orange-400 backdrop-blur-md shadow-sm">
                                        {product.brand.name}
                                    </span>
                                </div>
                            )}

                            {/* Main Tyre Photo with Depth Drop Shadow */}
                            <CustomImage
                                src={currentImage}
                                alt={`${product.name} - image ${safeActiveIdx + 1}`}
                                fill
                                sizes="(max-width: 1024px) 270px, 290px"
                                imageClassName="object-contain w-full h-full p-2 transition-transform duration-300 group-hover/img:scale-105 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.75)]"
                            />

                            {/* Image Counter Badge */}
                            {allImages.length > 1 && (
                                <div className="absolute bottom-2.5 right-2.5 z-10 rounded-full border border-white/10 bg-black/70 px-2 py-0.5 text-[9px] font-bold text-zinc-300 backdrop-blur-sm">
                                    {safeActiveIdx + 1} / {allImages.length}
                                </div>
                            )}

                            {/* Next / Prev Controls */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
                                        }}
                                        aria-label="Previous image"
                                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white border border-white/20 transition-all hover:border-orange-500 hover:text-orange-400 active:scale-95 shadow-md"
                                    >
                                        <FiChevronLeft size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveIdx((prev) => (prev + 1) % allImages.length);
                                        }}
                                        aria-label="Next image"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white border border-white/20 transition-all hover:border-orange-500 hover:text-orange-400 active:scale-95 shadow-md"
                                    >
                                        <FiChevronRight size={14} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails Row */}
                        {allImages.length > 1 && (
                            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-0.5">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveIdx(idx)}
                                        aria-label={`View photo ${idx + 1}`}
                                        className={`relative h-10 w-10 shrink-0 rounded-lg bg-black border p-0.5 overflow-hidden transition-all ${
                                            idx === safeActiveIdx
                                                ? "border-orange-500 ring-2 ring-orange-500/30 scale-105"
                                                : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                                        }`}
                                    >
                                        <CustomImage src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="40px" imageClassName="object-contain p-0.5" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Compact Technical Specifications (when size is opened) */}
                        {size && parsedSpec ? (
                            <div className="rounded-xl border border-white/10 bg-[#262A34] p-2.5 sm:p-3 space-y-2 shadow-md">
                                <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                                    <div className="flex items-center gap-1.5">
                                        <FiSliders className="text-[#F59E0B] text-xs shrink-0" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                                            Tyre Specifications
                                        </h3>
                                    </div>
                                    <span className="rounded border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-1.5 py-0.5 text-[10px] font-black text-[#F59E0B]">
                                        {size.size}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                                    <div className="rounded bg-black/30 px-2 py-1 border border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400">Width</span>
                                        <span className="font-bold text-white">{parsedSpec.width}</span>
                                    </div>
                                    <div className="rounded bg-black/30 px-2 py-1 border border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400">Aspect</span>
                                        <span className="font-bold text-white">{parsedSpec.aspect}</span>
                                    </div>
                                    <div className="rounded bg-black/30 px-2 py-1 border border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400">Rim</span>
                                        <span className="font-bold text-white">{parsedSpec.rim}</span>
                                    </div>
                                    <div className="rounded bg-black/30 px-2 py-1 border border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400">Position</span>
                                        <span className="font-bold text-white">{size.position || "F / R"}</span>
                                    </div>
                                    <div className="rounded bg-black/30 px-2 py-1 border border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400">Construction</span>
                                        <span className="font-bold text-white truncate max-w-[85px]" title={parsedSpec.construction}>
                                            {parsedSpec.construction}
                                        </span>
                                    </div>
                                    <div className="rounded bg-black/30 px-2 py-1 border border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400">Load/Speed</span>
                                        <span className="font-bold text-white">{parsedSpec.loadSpeed}</span>
                                    </div>
                                    <div className="rounded bg-black/30 px-2 py-1 border border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400">Type</span>
                                        <span className="font-bold text-white">{parsedSpec.tubeType}</span>
                                    </div>
                                    <div className="rounded bg-black/30 px-2 py-1 border border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400">Segment</span>
                                        <span className="font-bold text-white truncate max-w-[85px]" title={product.category?.name || "Motorcycle Tyre"}>
                                            {product.category?.name || "Tyre"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Trade Assurance Highlights (Compact) */
                            <div className="grid grid-cols-1 gap-1.5 text-xs text-zinc-300">
                                <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-[#262A34] px-2.5 py-1.5">
                                    <FiCheckCircle className="text-emerald-400 shrink-0 text-xs" />
                                    <span className="text-[11px]">100% Genuine Direct Supply from Brand</span>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-[#262A34] px-2.5 py-1.5">
                                    <FiShield className="text-[#F59E0B] shrink-0 text-xs" />
                                    <span className="text-[11px]">Official GST Tax Invoice &amp; 18% ITC Eligible</span>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-[#262A34] px-2.5 py-1.5">
                                    <FiTruck className="text-sky-400 shrink-0 text-xs" />
                                    <span className="text-[11px]">Direct Commercial Dispatch Across India</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Product Header, 4 Sizes Showcase, Cart Action & Overview */}
                    <div className="lg:col-span-7 flex flex-col justify-start space-y-3.5">
                        {/* Clean Product Header */}
                        <div>
                            <div className="inline-flex items-center gap-1 rounded border border-[#A35229]/40 bg-[#A35229]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F59E0B] mb-1.5">
                                <BsLightningChargeFill className="text-[10px]" />
                                <span>{product.category?.name || "MOTORCYCLE TYRE"}</span>
                            </div>

                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                                {product.name}
                            </h1>
                        </div>

                        {/* SIZES LIST SECTION - Displays 4 sizes, no spec tags, premium automotive cart vibe */}
                        <div className="space-y-2 pt-2 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-white">
                                    AVAILABLE TYRE SIZES ({visibleSizes.length}{sizesToDisplay.length > 4 && !showAllSizes ? ` of ${sizesToDisplay.length}` : ""})
                                </h2>
                                {size && product.sizes.length > 1 && (
                                    <Link
                                        href={modelHref}
                                        className="text-xs font-bold text-[#F59E0B] hover:text-amber-300 transition-colors"
                                    >
                                        View all {product.sizes.length} sizes →
                                    </Link>
                                )}
                            </div>

                            {/* List of 4 sizes - clean cards with vibrant cart & trade controls */}
                            <div className="space-y-1.5">
                                {visibleSizes.map((s) => {
                                    const availability = getAvailabilityLevel(s);
                                    const tradePrice = tradePrices?.[s.id] ?? s.tradePrice;
                                    const cartItem = items.find((i) => i.id === s.id);
                                    const isOutOfStock = availability === "out";

                                    return (
                                        <div
                                            key={s.id}
                                            className="rounded-xl border border-white/10 bg-[#262A34] hover:bg-[#2B303B] hover:border-orange-500/30 transition-colors px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2.5 shadow-sm"
                                        >
                                            {/* Size, Position & Stock Badge */}
                                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                                {size ? (
                                                    <span className="text-[15px] sm:text-base font-black text-white tracking-tight shrink-0">
                                                        {s.size}
                                                    </span>
                                                ) : (
                                                    <Link
                                                        href={tyreHref(product, s)}
                                                        className="text-[15px] sm:text-base font-black text-white hover:text-orange-400 tracking-tight transition-colors inline-flex items-center gap-1 group/size shrink-0"
                                                        title={`View ${product.name} ${s.size} specifications`}
                                                    >
                                                        <span>{s.size}</span>
                                                        <span className="text-[10px] text-zinc-500 group-hover/size:text-orange-400 transition-colors">→</span>
                                                    </Link>
                                                )}
                                                {s.position && (
                                                    <span className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-300 shrink-0">
                                                        {s.position}
                                                    </span>
                                                )}
                                                <div className="shrink-0">
                                                    <StockBadge size={s} />
                                                </div>
                                            </div>

                                            {/* Pricing & Cart Action Controls */}
                                            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                                                {/* Price */}
                                                <div className="text-right leading-none">
                                                    {isApproved ? (
                                                        tradePrice ? (
                                                            <div>
                                                                <p className="text-[14px] sm:text-[15px] font-black text-amber-400 leading-none">
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

                                                {/* Cart Controls */}
                                                <div>
                                                    {cartItem ? (
                                                        <div className="flex items-center gap-1 bg-[#171A23] border border-orange-500/40 rounded-lg p-0.5 shadow-sm">
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
                                                            <span>{isOutOfStock ? "Out" : "Add to Cart"}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Show More / Show 4 Sizes Toggle when product has > 4 sizes */}
                            {sizesToDisplay.length > 4 && (
                                <div className="flex justify-end pt-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowAllSizes((prev) => !prev)}
                                        className="text-[11px] font-bold text-[#F59E0B] hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                                    >
                                        <span>
                                            {showAllSizes
                                                ? "Show 4 Sizes"
                                                : `+ View All ${sizesToDisplay.length} Sizes`}
                                        </span>
                                        {showAllSizes ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* PRODUCT OVERVIEW BOX - Shows ONLY 2-3 lines initially, expandable via Read More */}
                        <div className="rounded-xl border border-white/10 bg-[#262A34] p-3 sm:p-3.5 shadow-md space-y-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                                <div className="flex items-center gap-1.5">
                                    <FiFileText className="text-[#F59E0B] text-xs shrink-0" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                                        Product Overview
                                    </h3>
                                </div>
                                {(paragraphs.length > 1 || highlights.length > 0) && (
                                    <button
                                        type="button"
                                        onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F59E0B] hover:text-amber-300 transition-colors"
                                    >
                                        <span>{isDescriptionExpanded ? "Show Less" : "Read More"}</span>
                                        {isDescriptionExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                                    </button>
                                )}
                            </div>

                            {/* Description Content: exactly 2 to 3 lines when collapsed! */}
                            <div className="text-xs text-zinc-300 leading-relaxed">
                                {isDescriptionExpanded ? (
                                    <div className="max-h-[160px] sm:max-h-[200px] overflow-y-auto custom-scroll pr-1.5 space-y-2">
                                        {paragraphs.map((para, idx) => (
                                            <p key={idx} className="text-zinc-300">
                                                {para}
                                            </p>
                                        ))}

                                        {highlights.length > 0 && (
                                            <div className="pt-2 border-t border-white/10 space-y-1.5">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
                                                    Key Highlights
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                    {highlights.map((h, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-start gap-1.5 rounded bg-black/30 p-1.5 text-[11px] text-zinc-300 border border-white/5"
                                                        >
                                                            <FiCheckCircle className="text-emerald-400 shrink-0 text-xs mt-0.5" />
                                                            <span>{h}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="line-clamp-2 sm:line-clamp-3 text-zinc-300 font-normal">
                                        {paragraphs[0] || ""}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
