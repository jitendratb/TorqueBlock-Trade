"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

// Clicks on these keep their own behaviour instead of opening the card.
const INTERACTIVE = "a, button, input, select, textarea, label, [role='button'], [data-card-ignore]";

export default function useCardLink(href) {
    const router = useRouter();

    return useCallback(
        (event) => {
            if (!href || event.defaultPrevented || event.button > 1) return; // ignore right-click
            if (event.target.closest?.(INTERACTIVE)) return;
            if (window.getSelection?.()?.toString()) return;

            if (event.metaKey || event.ctrlKey || event.button === 1) {
                window.open(href, "_blank", "noopener");
            } else {
                router.push(href);
            }
        },
        [href, router]
    );
}
