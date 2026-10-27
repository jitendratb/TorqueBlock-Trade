"use client";

import { useState } from "react";
import clsx from "clsx";
import { FiCheck, FiLink, FiShare2 } from "react-icons/fi";
import { useUiStore } from "@/store/ui.store";

const BUTTON = "inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 font-bold text-zinc-200 transition-all hover:border-orange-500/60 hover:bg-orange-500/10 hover:text-white";
const SIZES = { sm: "h-7 px-2 text-[11px]", md: "h-9 px-3 text-xs", icon: "h-7 w-7 text-base" };

const copyText = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Clipboard API is blocked outside secure contexts (http, some in-app browsers).
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
    }
};

// Share and Copy link for a portal page; the link uses the domain the page is open on.
// copyOnly: just the Copy link button (the per-size link in the stock table).
export default function ShareButtons({ path, title, text, size = "md", iconOnly = false, copyOnly = false, className }) {
    const notify = useUiStore((s) => s.notify);
    const [copied, setCopied] = useState(false);

    const getUrl = () => new URL(path, window.location.origin).toString();

    const copy = async () => {
        if (await copyText(getUrl())) {
            setCopied(true);
            notify("success", "Link copied to clipboard.");
            setTimeout(() => setCopied(false), 2000);
        } else {
            notify("error", "Could not copy the link. Please copy it from the address bar.");
        }
    };

    const share = async () => {
        const url = getUrl();
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
            } catch (error) {
                if (error?.name !== "AbortError") copy();
            }
            return;
        }
        window.open(`https://wa.me/?text=${encodeURIComponent([text || title, url].filter(Boolean).join(" "))}`, "_blank", "noopener,noreferrer");
    };

    return (
        <div className={clsx("inline-flex items-center gap-1.5", className)}>
            {!copyOnly && (
                <button type="button" onClick={share} aria-label={`Share ${title}`} title="Share" className={clsx(BUTTON, SIZES[size])}>
                    <FiShare2 className="text-orange-400" />
                    {!iconOnly && <span>Share</span>}
                </button>
            )}
            <button type="button" onClick={copy} aria-label={`Copy link to ${title}`} title="Copy link" className={clsx(BUTTON, SIZES[size])}>
                {copied ? <FiCheck className="text-emerald-400" /> : <FiLink className="text-orange-400" />}
                {!iconOnly && <span>{copied ? "Copied" : "Copy link"}</span>}
            </button>
        </div>
    );
}
