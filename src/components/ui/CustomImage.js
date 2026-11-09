"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

// Shown when a product has no image or its image fails to load.
const FALLBACK_SRC = "/newlogo.webp";

const parseImageUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') {
        const trimmed = img.trim();
        if (trimmed.startsWith('//')) return `https:${trimmed}`;
        return trimmed;
    }
    if (typeof img === 'object' && img !== null) {
        if (img.url && typeof img.url === 'string') return parseImageUrl(img.url);
        if (img.src && typeof img.src === 'string') return parseImageUrl(img.src);
        if (img.secure_url && typeof img.secure_url === 'string') return parseImageUrl(img.secure_url);
        if (img.heroImage && typeof img.heroImage === 'string') return parseImageUrl(img.heroImage);
        if (img.image && typeof img.image === 'string') return parseImageUrl(img.image);

        const numericKeys = Object.keys(img)
            .filter(k => k !== '_id' && !isNaN(k))
            .sort((a, b) => Number(a) - Number(b));
        if (numericKeys.length > 0) {
            return numericKeys.map(k => img[k]).join('').trim();
        }
    }
    return '';
};

export default function CustomImage({
    src,
    alt = "image",
    width,
    height,
    fill = false,
    className = "",
    imageClassName = "",
    priority = false,
    sizes,
    quality = 85,
    skeletonClassName = "",
    fallback = FALLBACK_SRC,
    fetchPriority,
    caption,
    unoptimized = true,
    ...props
}) {
    const [loading, setLoading] = useState(!priority);
    const [error, setError] = useState(false);
    const imgRef = useRef(null);

    const actualSrc = parseImageUrl(src);
    const safeSrc = (typeof actualSrc === "string" && actualSrc.trim()) ? actualSrc.trim() : fallback;
    const [prevSafeSrc, setPrevSafeSrc] = useState(safeSrc);

    if (prevSafeSrc !== safeSrc) {
        setPrevSafeSrc(safeSrc);
        setError(false);
    }

    const finalAlt = (alt && alt !== "image") ? alt : (typeof src === 'object' && src?.alt ? src.alt : alt);
    // The fallback keeps the caller's fill layout so it sits inside the same box as the real image.
    const renderFill = Boolean(fill);

    const defaultSizes = renderFill ? "100vw" : undefined;
    const finalSizes = sizes !== undefined ? sizes : defaultSizes;
    const resolvedWidth = renderFill ? undefined : (width ?? 1200);
    const resolvedHeight = renderFill ? undefined : (height ?? 800);

    const finalFetchPriority = fetchPriority ?? (priority ? "high" : undefined);

    const finalCaption = caption ?? (typeof src === 'object' ? src?.caption : undefined);
    const Wrapper = finalCaption ? "figure" : "div";

    useEffect(() => {
        if (imgRef.current && (imgRef.current.complete || imgRef.current.naturalWidth > 0)) {
            setLoading(false);
        }
    }, [safeSrc]);

    return (
        <Wrapper className={clsx("relative overflow-hidden", fill ? "w-full h-full" : "", className)} style={!fill ? { width, height } : undefined} >
            {loading && !error && !priority && (
                <div className={clsx("absolute inset-0 animate-pulse bg-zinc-800 pointer-events-none z-0", skeletonClassName)}>
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#999_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>
            )}
            <Image
                ref={imgRef}
                src={error ? fallback : safeSrc}
                alt={finalAlt}
                fill={renderFill}
                width={resolvedWidth}
                height={resolvedHeight}
                priority={priority}
                unoptimized={unoptimized}
                quality={quality}
                sizes={finalSizes}
                className={clsx(
                    "transition-opacity duration-200",
                    imageClassName
                )}
                onLoad={() => {
                    setLoading(false);
                }}
                onError={() => {
                    if (!error) {
                        setError(true);
                    }
                    setLoading(false);
                }}
                {...props}
            />
            {finalCaption && (
                <figcaption className={clsx("sr-only")}>
                    {finalCaption}
                </figcaption>
            )}
        </Wrapper>
    );
}
