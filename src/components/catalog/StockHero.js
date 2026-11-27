import { BsShop } from "react-icons/bs";
import { FiChevronDown } from "react-icons/fi";
import { MdTwoWheeler } from "react-icons/md";
import HeroSearch from "./HeroSearch";
import HeroSlides from "./HeroSlides";
import BrandChips from "./BrandChips";
import TradeHighlights from "./TradeHighlights";
import { TradeProofCard, TradeProofPill } from "./TradeProof";

// Home hero — same structure as the website hero (copy + proof card on top, search + trust bar below), trade content.
export default function StockHero({ heroImages = [], companyName = "Torque Block", brands = [], searchIndex = [], titleAs: Title = "h1" }) {
    const brandExamples = brands.map((b) => b?.name).filter(Boolean);

    return (
        <section aria-label="Trade portal hero" className="relative flex min-h-[calc(100svh-4rem-env(safe-area-inset-bottom))] md:min-h-svh flex-col overflow-hidden bg-[#0B0F19] pt-20 sm:pt-24 lg:pt-28">
            {/* Pinned to one screen height so the photo keeps its framing however tall the hero content grows */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-svh">
                <HeroSlides images={heroImages} alt={`Premium motorcycle tyres for trade dealers | ${companyName}`} />
                <span className="hero-scrim absolute inset-0" />
                <span className="hero-vignette absolute inset-0" />
                <span className="absolute inset-0 hidden bg-gradient-to-r md:block from-black/55 via-black/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0B0F19] to-transparent" />
            </div>

            {/* Top: copy (left) + proof card (right, desktop) */}
            <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 sm:px-6 xl:grid-cols-[1fr_auto] lg:px-8">
                <div className="flex flex-col justify-center space-y-3 sm:space-y-4 lg:space-y-5 short:space-y-2">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-orange-500 min-[400px]:text-xs sm:gap-2.5 sm:text-sm sm:tracking-[0.1em] [text-shadow:0_0_10px_rgba(249,115,22,0.9)]">
                        <BsShop aria-hidden="true" className="shrink-0 text-lg sm:text-xl" />
                        For Dealers, Workshops &amp; Service Centres
                    </p>

                    <Title className="text-[clamp(2rem,min(9vw,7vh),4.5rem)] font-black leading-[1.02] tracking-[-0.04em] drop-shadow-md">
                        <span className="block text-white">Premium &amp; Value</span>
                        <span className="block text-white">Performance</span>
                        <span className="block text-orange-500">Motorcycle Tyres</span>
                        <span className="block text-white">for Your Business.</span>
                    </Title>

                    <p className="max-w-2xl text-sm font-semibold leading-relaxed text-zinc-200 sm:text-base md:text-lg short:hidden">
                        Find the right tyres, check availability and place orders online.
                    </p>

                    <TradeProofPill className="xl:hidden" />
                </div>

                <div className="hidden items-end justify-end pb-2 xl:flex">
                    <TradeProofCard />
                </div>
            </div>

            {/* Bottom: search, brand row, trust bar */}
            <div className="relative z-10 mx-auto mt-4 w-full max-w-xl px-4 pb-12 text-white short:mt-3 short:pb-5 sm:mt-8 sm:px-6 md:max-w-3xl md:pb-14 lg:max-w-4xl">
                <HeroSearch searchIndex={searchIndex} examples={brandExamples} />

                <div className="mt-3 sm:mt-4 short:mt-2">
                    <BrandChips brands={brands} />
                </div>

                <div className="pt-3 sm:pt-4 short:pt-2">
                    <TradeHighlights />
                </div>
            </div>

            <a
                href="#stock"
                aria-label="Scroll down to live stock"
                className="hero-scroll-cue absolute bottom-1 left-1/2 z-10 hidden -translate-x-1/2 p-1 text-white/60 transition-colors hover:text-orange-500 md:block"
            >
                <FiChevronDown className="text-2xl" />
            </a>
        </section>
    );
}
