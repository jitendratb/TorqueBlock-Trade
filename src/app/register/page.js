import PageHero from "@/components/site/PageHero";
import TradeRegistration from "@/components/register/TradeRegistration";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Trade Registration | Torque Block Trade",
    description: "Register your workshop, tyre retail store, or dealership to unlock wholesale trade pricing, live inventory, and one-click ordering.",
};

export default function RegisterPage() {
    return (
        <main className="relative min-h-[calc(100vh-120px)]">
            <PageHero
                eyebrow="Trade Registration"
                title="Register your business"
                accent="for Trade"
                titleClassName="text-lg sm:text-xl md:text-2xl lg:text-3xl"
            />
            <div className="relative bg-[#0B0F19] pb-20 pt-2 sm:pt-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-gradient-to-b from-[#A35229]/10 to-transparent blur-3xl opacity-50" />
                </div>
                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <TradeRegistration />
                </div>
            </div>
        </main>
    );
}
