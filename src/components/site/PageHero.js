import { BsSpeedometer2 } from "react-icons/bs";

// Compact dark hero for inner pages; sits under the fixed header.
export default function PageHero({ eyebrow, title, accent, description, children, titleClassName = "text-xl sm:text-2xl md:text-3xl lg:text-4xl" }) {
    return (
        <section className="relative overflow-hidden bg-[#0B0F19] pt-24 pb-5 sm:pt-28 sm:pb-6 md:pt-32 md:pb-6">
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-white">
                {eyebrow && (
                    <div className="flex items-center gap-2">
                        <BsSpeedometer2 aria-hidden="true" className="text-orange-500 text-sm sm:text-base shrink-0" />
                        <span className="text-orange-500 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase [text-shadow:0_0_10px_rgba(249,115,22,0.9)]">{eyebrow}</span>
                    </div>
                )}
                <h1 className={`mt-1.5 font-black tracking-tight uppercase leading-tight ${titleClassName}`}>
                    {title} {accent && <span className="text-orange-500">{accent}</span>}
                </h1>
                {description && <p className="mt-1.5 max-w-2xl text-xs sm:text-sm font-medium text-zinc-300 leading-relaxed">{description}</p>}
                {children}
            </div>
        </section>
    );
}
