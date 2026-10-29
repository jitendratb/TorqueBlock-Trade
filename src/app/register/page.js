import PageHero from "@/components/site/PageHero";
import TradeRegistration from "@/components/registration/TradeRegistration";

export const metadata = {
    title: "Trade Registration | Torque Block Trade",
    description: "Register your workshop, tyre retail store, or dealership to unlock wholesale trade pricing, live inventory, and one-click ordering.",
};

export default function RegisterPage() {
    return (
        <main>
            <PageHero eyebrow="Trade Registration" title="Register your business" accent="for Trade" description="Verify your mobile and add your business details to access trade pricing and instant ordering." />
            <div className="bg-[#0B0F19] pb-16">
                <div className="mx-auto max-w-2xl px-4"> <TradeRegistration /></div>
            </div>
        </main>
    );
}
