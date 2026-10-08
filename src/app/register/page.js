import DealerForm from "@/components/trade/DealerForm";
import PageHero from "@/components/layout/PageHero";

export const metadata = {
    title: "Dealer Registration",
    description: "Register your business with Torque Block to get dealer prices, live stock and one-click ordering.",
};

export default function RegisterPage() {
    return (
        <main>
            <PageHero eyebrow="Dealer Registration" title="Register as a" accent="Dealer" description="Two minutes. We verify your GSTIN and activate your dealer login." />
            <div className="bg-[#0B0F19] pb-16">
                <div className="mx-auto max-w-2xl px-4">
                    <DealerForm />
                </div>
            </div>
        </main>
    );
}
