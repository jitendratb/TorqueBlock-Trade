"use client";

import clsx from "clsx";
import Spinner from "./Spinner";

// Full-section loading state: spinner with a message and optional subtext.
export default function LoadingState({
    message = "Loading...",
    subtext,
    size = "lg",
    minHeight = "min-h-[220px]",
    className
}) {
    return (
        <div
            className={clsx(
                "flex flex-col items-center justify-center p-8 text-center text-white",
                minHeight,
                className
            )}
        >
            <Spinner size={size} tone="orange" label={message} />
            {message && (
                <p className="mt-4 text-sm font-bold tracking-wide text-zinc-300">
                    {message}
                </p>
            )}
            {subtext && (
                <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                    {subtext}
                </p>
            )}
        </div>
    );
}
