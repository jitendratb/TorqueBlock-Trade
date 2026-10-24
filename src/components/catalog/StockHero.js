import Image from "next/image";
import { BsShop } from "react-icons/bs";
import { FiChevronDown } from "react-icons/fi";
import HeroSearch from "./HeroSearch";
import BrandChips from "./BrandChips";
import TradeHighlights from "./TradeHighlights";

// Home hero: headline, catalogue search, brand chips and the trade highlights.
export default function StockHero({ heroImage, companyName = "Torque Block", brands = [], searchIndex = [] }) {
    return (
        <section
            className="relative w-full min-h-[560px] lg:min-h-[640px] overflow-hidden bg-[#080808] pt-28 sm:pt-32 md:pt-36 pb-8 sm:pb-10 flex flex-col justify-between"
            aria-label="Trade portal hero"
        >
            {heroImage && (
                <Image
                    src={heroImage}
                    alt={`Premium motorcycle tyres for trade customers | ${companyName}`}
                    fill
                    preload
                    sizes="100vw"
                    quality={85}
                    className="object-cover"
                />
            )}

            {/* Dark linear gradients keep the copy readable over the photo */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/35" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/40" />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-auto">
                <div className="max-w-3xl">
                    <div className="mb-4 sm:mb-5 flex items-center gap-2.5 animate-slide-down-fade">
                        <BsShop aria-hidden="true" className="text-orange-500 text-lg sm:text-xl shrink-0" />
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.1em] text-orange-500">
                            For Trade Customers, Workshops & Service Centres
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[1.02] drop-shadow-md animate-slide-down-fade">
                        <span className="block text-white">Premium &amp; Value Performance</span>
                        <span className="block text-orange-500">Motorcycle Tyres</span>
                        <span className="block text-white">for Your Business.</span>
                    </h1>

                    <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg font-medium leading-relaxed text-zinc-300 max-w-2xl">
                        Find the right tyres, check availability and place orders online.
                    </p>
                </div>

                <div className="mx-auto mt-8 w-full max-w-3xl sm:mt-12">
                    <HeroSearch searchIndex={searchIndex} />
                    <BrandChips brands={brands} />
                </div>

                <div className="mt-10 sm:mt-12">
                    <TradeHighlights />
                </div>
            </div>

            <div className="relative z-10 flex justify-center mt-6">
                <a
                    href="#stock"
                    aria-label="Scroll down to live stock"
                    className="hero-scroll-cue p-1.5 text-zinc-500 transition-colors hover:text-orange-500"
                >
                    <FiChevronDown className="text-2xl" />
                </a>
            </div>
        </section>
    );
}
