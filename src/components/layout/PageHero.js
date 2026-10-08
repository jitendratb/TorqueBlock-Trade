import { BsSpeedometer2 } from "react-icons/bs";

// Compact dark hero for inner pages; sits under the fixed header.
export default function PageHero({ eyebrow, title, accent, description, children }) {
    return (
        <section className="relative overflow-hidden bg-[#0B0F19] pt-32 pb-10 md:pt-40">
            <span aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-orange-500/15 blur-3xl" />
            <span aria-hidden="true" className="hero-apex-line pointer-events-none absolute inset-x-0 bottom-0 h-px" />
            <div className="relative mx-auto max-w-7xl px-4 text-white">
                <div className="flex items-center gap-3">
                    <BsSpeedometer2 aria-hidden="true" className="text-orange-500 text-lg" />
                    <span className="text-orange-500 text-xs font-bold tracking-[0.25em] uppercase [text-shadow:0_0_10px_rgba(249,115,22,0.9)]">{eyebrow}</span>
                </div>
                <h1 className="mt-3 text-3xl md:text-5xl xl:text-6xl font-black tracking-tighter uppercase">
                    {title} {accent && <span className="text-orange-500">{accent}</span>}
                </h1>
                {description && <p className="mt-3 max-w-2xl text-sm md:text-lg font-semibold text-zinc-300">{description}</p>}
                {children}
            </div>
        </section>
    );
}
