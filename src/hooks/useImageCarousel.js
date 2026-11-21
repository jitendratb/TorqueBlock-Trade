import { useCallback, useState } from "react";

const stop = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
};

export default function useImageCarousel(images = []) {
    const [rawIndex, setIndex] = useState(0);
    const count = images.length;
    const index = rawIndex < count ? rawIndex : 0;

    const prev = useCallback(
        (event) => {
            stop(event);
            if (count) setIndex((i) => (i - 1 + count) % count);
        },
        [count]
    );

    const next = useCallback(
        (event) => {
            stop(event);
            if (count) setIndex((i) => (i + 1) % count);
        },
        [count]
    );

    return { index, current: images[index] || "", count, hasMany: count > 1, setIndex, prev, next };
}
