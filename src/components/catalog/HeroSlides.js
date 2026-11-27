"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

const SLIDE_MS = 6000;

// Landscape photo on wide screens, portrait photo on tall ones, each picking the right resolution for the device.
function HeroPicture({ slide, alt, eager, visible }) {
    return (
        <picture>
            <source media="(min-aspect-ratio: 1/1)" srcSet={slide.desktop.srcSet} sizes="100vw" />
            <source media="(max-aspect-ratio: 1/1)" srcSet={slide.mobile.srcSet} sizes="100vw" />
            <img
                src={slide.mobile.src}
                alt={alt}
                loading={eager ? "eager" : "lazy"}
                fetchPriority={eager ? "high" : "auto"}
                decoding="async"
                className={clsx(
                    "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000",
                    visible ? "opacity-100" : "opacity-0"
                )}
            />
        </picture>
    );
}

// Mounts slides one ahead of the active one so the hero doesn't download every image up front.

export default function HeroSlides({ images = [], alt }) {
    const [active, setActive] = useState(0);
    const [reached, setReached] = useState(1);

    useEffect(() => {
        if (images.length < 2) return;
        const timer = setInterval(() => {
            setActive((i) => (i + 1) % images.length);
            setReached((r) => Math.min(images.length, r + 1));
        }, SLIDE_MS);
        return () => clearInterval(timer);
    }, [images.length]);

    return images.slice(0, reached + 1).map((slide, i) => (
        <HeroPicture key={slide.desktop.src + slide.mobile.src} slide={slide} alt={i === 0 ? alt : ""} eager={i === 0} visible={i === active} />
    ));
}
