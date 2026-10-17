import Image from "next/image";
import { BsSpeedometer2 } from "react-icons/bs";
import { FiChevronDown } from "react-icons/fi";

export default function StockHero({ heroImage, companyName, stats }) {
    const tiles = [
        { value: stats?.products ?? 0, label: "Products" },
        { value: stats?.sizes ?? 0, label: "Sizes" },
        { value: stats?.inStock ?? 0, label: "Sizes in stock" },
    ];

    return (
        <section className="relative w-full min-h-[460px] h-[58svh] bg-[#0B0F19]" aria-label="Dealer portal">
            {heroImage && <Image src={heroImage} alt={`Motorcycle tyres for dealers | ${companyName}`} fill priority sizes="100vw" quality={75} className="object-cover" />}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 hero-scrim" />
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 hero-vignette" />

            <div className="absolute inset-0 z-10 flex items-end pb-10 md:pb-14">
                <div className="mx-auto w-full max-w-7xl px-4 text-white">
                    <div className="flex items-center gap-3 animate-slide-down-fade">
                        <BsSpeedometer2 aria-hidden="true" className="text-orange-500 text-lg" />
                        <span className="text-white text-xs font-bold md:tracking-[0.25em] uppercase [text-shadow:0_0_10px_rgba(249,115,22,0.9)]">Dealer Portal</span>
                    </div>

                    <h1 className="mt-3 flex flex-col font-black tracking-tighter animate-slide-down-fade">
                        <span className="text-3xl md:text-5xl xl:text-6xl text-white">Live Stock.</span>
                        <span className="text-3xl md:text-5xl xl:text-6xl text-orange-500">Dealer Prices.</span>
                        <span className="text-3xl md:text-5xl xl:text-6xl text-white">One-Click To Order.</span>
                    </h1>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        {tiles.map(({ value, label }) => (
                            <div key={label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-xl">
                                <p className="text-xl md:text-2xl font-black leading-none">{value}</p>
                                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/70">{label}</p>
                            </div>
                        ))}
                        {/* <a href="#stock" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-black uppercase tracking-wider hover:bg-orange-600 transition-colors">
                            Check Stock <FiChevronDown />
                        </a> */}
                    </div>

                </div>
            </div>
        </section>
    );
}
