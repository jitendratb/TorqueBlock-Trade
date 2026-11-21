"use client";

import { useCallback, useEffect, useState } from "react";

export function useCountdown(initialSeconds = 0) {
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        if (seconds <= 0) return;
        const timer = setInterval(() => {
            setSeconds((c) => (c > 1 ? c - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [seconds]);

    const start = useCallback((duration = 30) => setSeconds(duration), []);
    const reset = useCallback(() => setSeconds(0), []);

    return { seconds, start, reset };
}

export default useCountdown;

