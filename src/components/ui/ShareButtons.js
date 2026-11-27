"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { FiCheck, FiLink, FiShare2 } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useUiStore } from "@/store/uiStore";
import Button from "./Button";

// ShareButtons size -> Button size.
const BUTTON_SIZE = { xs: "xs", sm: "xs", md: "sm" };
const COMPACT_ICON = "!h-6 !w-6 !rounded-md !text-[11px]";

const copyText = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
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

export default function ShareButtons({
    path,
    title,
    text,
    size = "md",
    iconOnly = false,
    copyOnly = false,
    menu = false,
    className,
}) {
    const notify = useUiStore((s) => s.notify);
    const [copied, setCopied] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) return;
        const close = (e) => {
            if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
        };
        const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
        document.addEventListener("mousedown", close);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("keydown", onKey);
        };
    }, [menuOpen]);

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
        window.open(
            `https://wa.me/?text=${encodeURIComponent([text || title, url].filter(Boolean).join(" "))}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // api.whatsapp.com opens the WhatsApp app on phones and WhatsApp Web on desktop
    const shareOnWhatsApp = () => {
        const message = [text || title, getUrl()].filter(Boolean).join("\n");
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    };

    const buttonSize = BUTTON_SIZE[size] || BUTTON_SIZE.md;

    if (menu) {
        const pickAction = (action) => () => {
            setMenuOpen(false);
            action();
        };
        return (
            <div ref={menuRef} className={clsx("relative inline-flex", className)}>
                <Button
                    variant="outline"
                    size={buttonSize}
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label={`Share ${title}`}
                    className="!bg-orange-500/10 tracking-[0.2em]"
                    icon={<FiShare2 />}
                >
                    Share
                </Button>
                {menuOpen && (
                    <div
                        role="menu"
                        className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-white/10 bg-zinc-800/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl"
                    >
                        <button
                            type="button"
                            role="menuitem"
                            onClick={pickAction(copy)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-zinc-100 transition-colors hover:bg-white/10"
                        >
                            {copied ? <FiCheck className="text-lg text-emerald-400" /> : <FiLink className="text-lg text-orange-400" />}
                            <span>{copied ? "Link Copied" : "Copy Product Link"}</span>
                        </button>
                        <button
                            type="button"
                            role="menuitem"
                            onClick={pickAction(shareOnWhatsApp)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-zinc-100 transition-colors hover:bg-white/10"
                        >
                            <FaWhatsapp className="text-lg text-emerald-500" />
                            <span>Share on WhatsApp</span>
                        </button>
                    </div>
                )}
            </div>
        );
    }
    const buttonClassName = size === "xs" && iconOnly ? COMPACT_ICON : undefined;
    const label = (caption) => (iconOnly ? null : <span className="hidden min-[480px]:inline">{caption}</span>);

    return (
        <div className={clsx("inline-flex items-center gap-1.5", className)}>
            {!copyOnly && (
                <Button
                    variant="muted"
                    size={buttonSize}
                    iconOnly={iconOnly}
                    uppercase={false}
                    onClick={share}
                    className={buttonClassName}
                    aria-label={`Share ${title}`}
                    title="Share"
                    icon={<FiShare2 className="text-orange-400" />}
                >
                    {label("Share")}
                </Button>
            )}
            <Button
                variant="muted"
                size={buttonSize}
                iconOnly={iconOnly}
                uppercase={false}
                onClick={copy}
                className={buttonClassName}
                aria-label={`Copy link to ${title}`}
                title="Copy link"
                icon={copied ? <FiCheck className="text-emerald-400" /> : <FiLink className="text-orange-400" />}
            >
                {label(copied ? "Copied" : "Copy link")}
            </Button>
        </div>
    );
}
