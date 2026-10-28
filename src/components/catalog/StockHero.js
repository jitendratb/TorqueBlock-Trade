import { BsShop } from "react-icons/bs";
import { FiChevronDown } from "react-icons/fi";
import { PiBuildingsFill } from "react-icons/pi";
import HeroSearch, { HeroSlides } from "./HeroSearch";
import BrandChips from "./BrandChips";
import TradeHighlights from "./TradeHighlights";

function TrustBadge({ value = "1,500+", label = "Trade Accounts", text = "Trusted by businesses across India" }) {
    return (
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center text-xs sm:text-sm md:text-base text-zinc-300">
            <PiBuildingsFill aria-hidden="true" className="text-base sm:text-lg md:text-xl text-orange-500 shrink-0" />
            <span className="font-bold text-white">
                <span className="text-white">{value}</span> {label}
            </span>
            <span aria-hidden="true" className="text-zinc-500">|</span>
            <span className="text-zinc-300">{text}</span>
        </p>
    );
}

export default function StockHero({ heroImages = [], companyName = "Torque Block", brands = [], searchIndex = [], titleAs: Title = "h1" }) {
    const brandExamples = (brands || [])
        .map((b) => (typeof b === "string" ? b : b?.name || b?.label))
        .filter(Boolean);

    return (
        <section aria-label="Trade portal hero" className="relative flex min-h-svh flex-col overflow-hidden bg-[#080808] pt-20 sm:pt-24 lg:pt-28">
            <HeroSlides images={heroImages} alt={`Premium motorcycle tyres for trade dealers | ${companyName}`} />

            {/* Darken the photo so the copy stays readable */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/60" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/50" />

            <div className="relative z-10 mx-auto my-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    <p className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.1em] text-orange-500 sm:text-sm">
                        <BsShop aria-hidden="true" className="shrink-0 text-lg sm:text-xl" />
                        For Dealers, Workshops &amp; Service Centres
                    </p>

                    <Title className="mt-2 text-[clamp(2rem,min(9vw,7vh),4.5rem)] font-black leading-[1.02] tracking-[-0.04em] drop-shadow-md sm:mt-3">
                        <span className="block text-white">Premium &amp; Value</span>
                        <span className="block text-white">Performance</span>
                        <span className="block text-orange-500">Motorcycle Tyres</span>
                        <span className="block text-white">for Your Business.</span>
                </Title>

                    <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-zinc-300 sm:mt-4 sm:text-base md:text-lg">
                        Find the right tyres, check availability and place orders online.
                    </p>
                </div>

                <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
                    <div className="mt-5 w-full max-w-3xl sm:mt-6"> <HeroSearch searchIndex={searchIndex} examples={brandExamples} /></div>
                    <div className="mt-4 w-full"> <BrandChips brands={brands} /> </div>
                    <div className="mt-4"> <TrustBadge /> </div>
                    <div className="mt-4 w-full sm:mt-5"> <TradeHighlights /> </div>
                </div>
            </div>

            <a
                href="#stock"
                aria-label="Scroll down to live stock"
                className="hero-scroll-cue relative z-10 mx-auto mb-2 p-1 text-zinc-500 transition-colors hover:text-orange-500"
            >
                <FiChevronDown className="text-2xl" />
            </a>
        </section>
    );
}
