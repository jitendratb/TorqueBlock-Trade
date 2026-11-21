"use client";

import { useState } from "react";
import clsx from "clsx";
import { FiCheck, FiLink, FiShare2 } from "react-icons/fi";
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
    className,
}) {
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
        window.open(
            `https://wa.me/?text=${encodeURIComponent([text || title, url].filter(Boolean).join(" "))}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    const buttonSize = BUTTON_SIZE[size] || BUTTON_SIZE.md;
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
