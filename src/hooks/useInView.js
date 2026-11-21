"use client";

import { useEffect, useRef, useState } from "react";

// True once the element has come within `rootMargin` of the viewport; stays true after that.
export function useInView({ rootMargin = "300px" } = {}) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || inView) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [inView, rootMargin]);

    return [ref, inView];
}

export default useInView;
