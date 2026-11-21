"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { FiImage } from "react-icons/fi";
import { parseImageUrl } from "@/lib/image";

/**
 * Image wrapper for backend product & order images.
 * Shows a loading pulse while fetching and a clean empty placeholder if no backend image is available.
 */
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
    fallback = "",
    caption,
    unoptimized = true,
    ...props
}) {
    const [loading, setLoading] = useState(!priority);
    const [error, setError] = useState(false);
    const imgRef = useRef(null);

    const parsedSrc = parseImageUrl(src);
    const activeSrc = error ? fallback : parsedSrc || fallback;
    const [prevSrc, setPrevSrc] = useState(parsedSrc);

    if (prevSrc !== parsedSrc) {
        setPrevSrc(parsedSrc);
        setError(false);
    }

    const finalAlt =
        alt && alt !== "image" ? alt : typeof src === "object" && src?.alt ? src.alt : alt;
    const renderFill = Boolean(fill);
    const finalSizes = sizes !== undefined ? sizes : renderFill ? "100vw" : undefined;
    const resolvedWidth = renderFill ? undefined : width ?? 1200;
    const resolvedHeight = renderFill ? undefined : height ?? 800;
    const finalCaption = caption ?? (typeof src === "object" ? src?.caption : undefined);
    const Wrapper = finalCaption ? "figure" : "div";

    useEffect(() => {
        if (imgRef.current && (imgRef.current.complete || imgRef.current.naturalWidth > 0)) {
            setLoading(false);
        }
    }, [activeSrc]);

    return (
        <Wrapper
            className={clsx("relative overflow-hidden", fill ? "w-full h-full" : "", className)}
            style={!fill ? { width, height } : undefined}
        >
            {activeSrc ? (
                <>
                    {loading && !priority && (
                        <div
                            className={clsx(
                                "absolute inset-0 animate-pulse bg-zinc-800 pointer-events-none z-0",
                                skeletonClassName
                            )}
                        />
                    )}
                    <Image
                        ref={imgRef}
                        src={activeSrc}
                        alt={finalAlt}
                        fill={renderFill}
                        width={resolvedWidth}
                        height={resolvedHeight}
                        priority={priority}
                        unoptimized={unoptimized}
                        quality={quality}
                        sizes={finalSizes}
                        className={clsx("transition-opacity duration-200", imageClassName)}
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setError(true);
                            setLoading(false);
                        }}
                        {...props}
                    />
                </>
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-zinc-600">
                    <FiImage className="text-xl" aria-hidden="true" />
                </div>
            )}

            {finalCaption && <figcaption className="sr-only">{finalCaption}</figcaption>}
        </Wrapper>
    );
}
