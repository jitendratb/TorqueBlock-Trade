import clsx from "clsx";

// Image position dots for small carousels; the active dot stretches into a pill.
export default function CarouselDots({ count, active, onSelect, className }) {
    if (count < 2) return null;

    return (
        <div className={clsx("flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 backdrop-blur-sm", className)}>
            {Array.from({ length: count }, (_, idx) => (
                <button
                    key={idx}
                    type="button"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onSelect(idx);
                    }}
                    aria-label={`Go to image ${idx + 1}`}
                    aria-current={idx === active || undefined}
                    className={clsx(
                        "h-1.5 cursor-pointer rounded-full transition-all",
                        idx === active ? "w-3 bg-orange-500" : "w-1.5 bg-white/50 hover:bg-white"
                    )}
                />
            ))}
        </div>
    );
}
