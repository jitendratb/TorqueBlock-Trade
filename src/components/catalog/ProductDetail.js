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

    const visibleParagraphs = isDescriptionExpanded ? paragraphs : paragraphs.slice(0, 3);

    // Sizes to display (either the single requested size or all sizes)
    const sizesToDisplay = size ? [size] : (product.sizes || []);

    const handleAddToCart = (targetSize) => {
        const line = toLine(product, targetSize, 1);
        add(line);
        notify("success", `Added ${product.name} ${targetSize.size} to order list.`);
    };

    return (
        <div className="space-y-6">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-400">
                    <Link
                        href="/#stock"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <FiArrowLeft />
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

            {/* Main Product Card Container */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#22262E]/95 border border-white/10 p-5 sm:p-7 lg:p-9 shadow-2xl backdrop-blur-xl text-white">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                    {/* LEFT COLUMN: Tyre Image Gallery */}
                    <div className="lg:col-span-5 flex flex-col space-y-4">
                        <div className="relative aspect-square w-full rounded-2xl bg-black border border-white/10 p-6 flex items-center justify-center overflow-hidden group/img">
                            <CustomImage
                                src={currentImage}
                                alt={`${product.name} - image ${safeActiveIdx + 1}`}
                                fill
                                sizes="(max-width: 1024px) 100vw, 450px"
                                imageClassName="object-contain w-full h-full p-2 transition-transform duration-300 group-hover/img:scale-105"
                            />

                            {/* Brand Badge */}
                            {product.brand && (
                                <div className="absolute top-3 left-3 z-10">
                                    <span className="rounded-md border border-white/15 bg-black/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-400">
                                        {product.brand.name}
                                    </span>
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
                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/75 text-white border border-white/20 transition-all hover:scale-110 active:scale-95"
                                    >
                                        <FiChevronLeft size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveIdx((prev) => (prev + 1) % allImages.length);
                                        }}
                                        aria-label="Next image"
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/75 text-white border border-white/20 transition-all hover:scale-110 active:scale-95"
                                    >
                                        <FiChevronRight size={16} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails Row */}
                        {allImages.length > 1 && (
                            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveIdx(idx)}
                                        aria-label={`View photo ${idx + 1}`}
                                        className={`relative h-14 w-14 shrink-0 rounded-xl bg-black border p-1 overflow-hidden transition-all ${
                                            idx === safeActiveIdx
                                                ? "border-[#A35229] ring-2 ring-[#A35229]/40 scale-105"
                                                : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                                        }`}
                                    >
                                        <CustomImage src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="56px" imageClassName="object-contain p-0.5" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* If a size link is opened, display technical specifications in place of Trade Assurance Highlights */}
                        {size && parsedSpec ? (
                            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#2D323B] p-3.5 sm:p-4 space-y-3 shadow-lg">
                                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <FiSliders className="text-[#F59E0B] text-sm shrink-0" />
                                        <h3 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-white">
                                            Tyre Specifications
                                        </h3>
                                    </div>
                                    <span className="rounded-md border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2 py-0.5 text-[11px] font-black text-[#F59E0B]">
                                        {size.size}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                                        <p className="text-[10px] uppercase font-bold text-zinc-400">Section Width</p>
                                        <p className="font-extrabold text-white mt-0.5">{parsedSpec.width}</p>
                                    </div>
                                    <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                                        <p className="text-[10px] uppercase font-bold text-zinc-400">Aspect Ratio</p>
                                        <p className="font-extrabold text-white mt-0.5">{parsedSpec.aspect}</p>
                                    </div>
                                    <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                                        <p className="text-[10px] uppercase font-bold text-zinc-400">Rim Diameter</p>
                                        <p className="font-extrabold text-white mt-0.5">{parsedSpec.rim}</p>
                                    </div>
                                    <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                                        <p className="text-[10px] uppercase font-bold text-zinc-400">Construction</p>
                                        <p className="font-extrabold text-white mt-0.5 truncate" title={parsedSpec.construction}>
                                            {parsedSpec.construction}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                                        <p className="text-[10px] uppercase font-bold text-zinc-400">Position</p>
                                        <p className="font-extrabold text-white mt-0.5">{size.position || "Front / Rear"}</p>
                                    </div>
                                    <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                                        <p className="text-[10px] uppercase font-bold text-zinc-400">Load / Speed</p>
                                        <p className="font-extrabold text-white mt-0.5">{parsedSpec.loadSpeed}</p>
                                    </div>
                                    <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                                        <p className="text-[10px] uppercase font-bold text-zinc-400">Tyre Type</p>
                                        <p className="font-extrabold text-white mt-0.5">{parsedSpec.tubeType}</p>
                                    </div>
                                    <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                                        <p className="text-[10px] uppercase font-bold text-zinc-400">Segment</p>
                                        <p className="font-extrabold text-white mt-0.5 truncate" title={product.category?.name || "Motorcycle Tyre"}>
                                            {product.category?.name || "Motorcycle Tyre"}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-medium text-zinc-400">
                                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                        <FiCheckCircle className="shrink-0" size={12} />
                                        100% Genuine Direct Supply
                                    </span>
                                    <span className="text-zinc-600">•</span>
                                    <span className="flex items-center gap-1 text-sky-400 font-semibold">
                                        <FiTruck className="shrink-0" size={12} />
                                        All-India Dispatch
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* Trade Assurance Highlights (Shown when viewing general tyre model) */
                            <div className="grid grid-cols-1 gap-2 pt-2 text-xs text-zinc-300">
                                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-[#2D323B] p-2.5">
                                    <FiCheckCircle className="text-emerald-400 shrink-0 text-base" />
                                    <span>100% Genuine Direct Supply from Brand</span>
                                </div>
                                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-[#2D323B] p-2.5">
                                    <FiShield className="text-[#F59E0B] shrink-0 text-base" />
                                    <span>Official GST Tax Invoice &amp; 18% ITC Eligible</span>
                                </div>
                                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-[#2D323B] p-2.5">
                                    <FiTruck className="text-sky-400 shrink-0 text-base" />
                                    <span>Direct Commercial Dispatch Across India</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Tyre Details & Size Selector */}
                    <div className="lg:col-span-7 flex flex-col justify-start space-y-5">
                        <div>
                            {/* Category Pill */}
                            <div className="inline-flex items-center gap-1.5 rounded-md border border-[#A35229]/40 bg-[#A35229]/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#F59E0B] mb-2.5">
                                <BsLightningChargeFill className="text-xs" />
                                <span>{product.category?.name || "MOTORCYCLE TYRE"}</span>
                            </div>

                            {/* Product Title */}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                                {product.name}
                            </h1>
                        </div>

                        {/* SIZES LIST SECTION */}
                        <div className="space-y-3 pt-2 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.1em] text-white">
                                    AVAILABLE TYRE SIZES ({sizesToDisplay.length})
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

                            {/* List of sizes - scrollable if multiple sizes */}
                            <div className="max-h-[360px] sm:max-h-[420px] overflow-y-auto custom-scroll pr-1.5 space-y-2.5">
                                {sizesToDisplay.map((s) => {
                                    const availability = getAvailabilityLevel(s);
                                    const tradePrice = tradePrices?.[s.id] ?? s.tradePrice;
                                    const cartItem = items.find((i) => i.id === s.id);
                                    const isOutOfStock = availability === "out";

                                    return (
                                        <div
                                            key={s.id}
                                            className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#2D323B] p-3.5 sm:p-4 transition-all hover:border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                                        >
                                            {/* Size Spec & Fitment */}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {size ? (
                                                        <span className="text-base sm:text-lg font-black text-white tracking-tight">
                                                            {s.size}
                                                        </span>
                                                    ) : (
                                                        <Link
                                                            href={tyreHref(product, s)}
                                                            className="text-base sm:text-lg font-black text-white hover:text-[#F59E0B] tracking-tight transition-colors inline-flex items-center gap-1.5 group/size"
                                                            title={`View ${product.name} ${s.size} specifications`}
                                                        >
                                                            <span>{s.size}</span>
                                                            <span className="text-xs font-normal text-zinc-500 group-hover/size:text-[#F59E0B] transition-colors">→</span>
                                                        </Link>
                                                    )}
                                                    {s.position && (
                                                        <span className="rounded-md border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-300">
                                                            {s.position}
                                                        </span>
                                                    )}
                                                    {s.spec && (
                                                        <span className="text-xs text-zinc-400 font-medium">
                                                            {s.spec}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Stock Status Badge */}
                                                <div className="flex items-center gap-2">
                                                    <StockBadge size={s} />
                                                </div>
                                            </div>

                                            {/* Pricing & Add to Cart Action */}
                                            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                                                {/* Price */}
                                                <div className="text-left sm:text-right">
                                                    {isApproved ? (
                                                        tradePrice ? (
                                                            <div>
                                                                <p className="text-base sm:text-lg font-black text-[#F59E0B]">
                                                                    {formatINR(tradePrice)}
                                                                </p>
                                                                <p className="text-[10px] text-zinc-400">
                                                                    + 18% GST (ITC)
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-zinc-500 font-semibold">–</span>
                                                        )
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={openLogin}
                                                            className="flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-orange-400 transition-colors"
                                                            title="Login to unlock trade wholesale prices"
                                                        >
                                                            <FiLock className="text-orange-400 text-xs shrink-0" />
                                                            <span>Login for Price</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Cart Controls */}
                                                <div>
                                                    {cartItem ? (
                                                        <div className="flex items-center gap-1.5 bg-[#1F242D] border border-white/10 rounded-xl p-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (cartItem.quantity <= 1) remove(s.id);
                                                                    else setQuantity(s.id, cartItem.quantity - 1);
                                                                }}
                                                                aria-label="Decrease quantity"
                                                                className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors active:scale-95"
                                                            >
                                                                <FiMinus size={12} />
                                                            </button>
                                                            <span className="min-w-6 text-center text-xs font-black text-white">
                                                                {cartItem.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setQuantity(s.id, cartItem.quantity + 1)}
                                                                aria-label="Increase quantity"
                                                                className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors active:scale-95"
                                                            >
                                                                <FiPlus size={12} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setOrderListOpen(true)}
                                                                className="ml-1 px-2.5 py-1 rounded-lg bg-[#A35229] hover:bg-[#8F4420] text-[10px] font-bold uppercase text-white transition-all"
                                                            >
                                                                Cart
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled={isOutOfStock}
                                                            onClick={() => handleAddToCart(s)}
                                                            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#A35229] hover:bg-[#8F4420] active:scale-[0.99] py-2.5 px-3.5 text-xs font-bold uppercase tracking-[0.06em] text-white transition-all shadow-md shadow-[#A35229]/25 disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            <FiShoppingCart size={14} />
                                                            <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* PRODUCT DESCRIPTION & HIGHLIGHTS BOX (Dedicated box below sizes) */}
                        <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#2D323B] p-4 sm:p-5 shadow-lg space-y-3.5">
                            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <FiFileText className="text-[#F59E0B] text-sm shrink-0" />
                                    <h3 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-white">
                                        Product Overview &amp; Specifications
                                    </h3>
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-400">
                                    {paragraphs.length} Paragraphs
                                </span>
                            </div>

                            {/* Scrollable Description Container */}
                            <div className="max-h-[260px] sm:max-h-[300px] overflow-y-auto custom-scroll pr-2 space-y-3 text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-normal">
                                {visibleParagraphs.map((para, idx) => (
                                    <p key={idx} className="text-zinc-300">
                                        {para}
                                    </p>
                                ))}

                                {/* If expanded and we have backend highlights/takeaways */}
                                {isDescriptionExpanded && highlights.length > 0 && (
                                    <div className="pt-2 border-t border-white/10 space-y-2">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#F59E0B]">
                                            Key Performance Highlights
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {highlights.map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-2 rounded-lg bg-black/30 p-2 text-xs text-zinc-300 border border-white/5"
                                                >
                                                    <FiCheckCircle className="text-emerald-400 shrink-0 text-sm mt-0.5" />
                                                    <span>{h}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Read More / Show Less Toggle Button */}
                            {(paragraphs.length > 3 || highlights.length > 0) && (
                                <div className="pt-2 border-t border-white/10 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-[#F59E0B] hover:text-amber-300 transition-all active:scale-95"
                                    >
                                        <span>{isDescriptionExpanded ? "Show Less" : "Read More"}</span>
                                        {isDescriptionExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
