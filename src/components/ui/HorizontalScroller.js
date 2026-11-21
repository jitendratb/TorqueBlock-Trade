"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Button from "./Button";

const EDGE = 6;

/**
 * Single-row horizontal scroller: touch/trackpad scroll everywhere, arrow
 * buttons + edge fades only when there is more content in that direction.
 */
export default function HorizontalScroller({
    children,
    label,
    step = 0.8,
    className,
    trackClassName,
}) {
    const trackRef = useRef(null);
    const [edges, setEdges] = useState({ left: false, right: false });

    const update = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        const left = el.scrollLeft > EDGE;
        const right = Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth - EDGE;
        setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
    }, []);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        update();
        el.addEventListener("scroll", update, { passive: true });
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => {
            el.removeEventListener("scroll", update);
            observer.disconnect();
        };
    }, [update]);

    const scroll = (dir) => {
        const el = trackRef.current;
        if (el) el.scrollBy({ left: dir * el.clientWidth * step, behavior: "smooth" });
    };

    const arrow = (dir) => {
        const isLeft = dir < 0;
        if (!(isLeft ? edges.left : edges.right)) return null;
        return (
            <div
                className={clsx(
                    "pointer-events-none absolute inset-y-0 z-10 flex items-center",
                    isLeft
                        ? "left-0 pr-6 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/70 to-transparent"
                        : "right-0 pl-6 bg-gradient-to-l from-[#0B0F19] via-[#0B0F19]/70 to-transparent"
                )}
            >
                <Button
                    variant="glass"
                    size="sm"
                    iconOnly
                    pill
                    onClick={() => scroll(dir)}
                    aria-label={`Scroll ${label ? label.toLowerCase() : ""} ${isLeft ? "left" : "right"}`.replace(/\s+/g, " ")}
                    icon={isLeft ? <FiChevronLeft className="stroke-[2.5]" /> : <FiChevronRight className="stroke-[2.5]" />}
                    className="pointer-events-auto"
                />
            </div>
        );
    };

    return (
        <div className={clsx("relative", className)}>
            {arrow(-1)}
            <div
                ref={trackRef}
                role="group"
                aria-label={label}
                className={clsx("flex flex-nowrap gap-2 overflow-x-auto scroll-smooth py-1", trackClassName)}
            >
                {children}
            </div>
            {arrow(1)}
        </div>
    );
}
