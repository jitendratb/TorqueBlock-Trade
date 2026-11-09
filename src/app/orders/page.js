import PageHero from "@/components/site/PageHero";
import OrderHistory from "@/components/orders/OrderHistory";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "My Orders | Torque Block Trade",
    description: "Track all your tyre orders, live dispatch status, delivery tracking, and tax invoice history.",
    robots: { index: false, follow: true },
};

export default function OrdersPage() {
    return (
        <main className="relative min-h-[calc(100vh-120px)]">
            <PageHero
                eyebrow="Order Tracking"
                title="My Trade"
                accent="Orders"
                description="Monitor live dispatch status, download GST invoices, and reorder tyre stock for your workshop or dealership."
                titleClassName="text-lg sm:text-xl md:text-2xl lg:text-3xl"
            />
            <div className="relative bg-[#0B0F19] pb-20 pt-2 sm:pt-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-gradient-to-b from-[#A35229]/10 to-transparent blur-3xl opacity-50" />
                </div>
                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="w-full rounded-2xl sm:rounded-3xl bg-[#22262E]/95 border border-white/10 p-5 sm:p-7 md:p-9 shadow-2xl shadow-black/80 backdrop-blur-xl text-white">
                        <OrderHistory />
                    </div>
                </div>
            </div>
        </main>
    );
}
