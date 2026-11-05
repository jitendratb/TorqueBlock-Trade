import { BsSpeedometer2 } from "react-icons/bs";

// Compact dark hero for inner pages; sits under the fixed header.
export default function PageHero({ eyebrow, title, accent, description, children, titleClassName = "text-xl sm:text-2xl md:text-3xl lg:text-4xl" }) {
    return (
        <section className="relative overflow-hidden bg-[#0B0F19] pt-20 pb-5 sm:pt-24 sm:pb-6 md:pt-28 md:pb-6">
            {/* <span aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-orange-500/15 blur-3xl" /> */}
            {/* <span aria-hidden="true" className="hero-apex-line pointer-events-none absolute inset-x-0 bottom-0 h-px" /> */}

            <div className="relative mx-auto max-w-7xl px-4 text-white">
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
