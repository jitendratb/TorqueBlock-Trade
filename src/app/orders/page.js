import PageHero from "@/components/site/PageHero";
import OrderHistory from "@/components/orders/OrderHistory";

export const metadata = {
    title: "My Orders | Torque Block Trade",
    description: "Track all your tyre orders, live dispatch status, delivery tracking, and tax invoice history.",
    robots: { index: false, follow: true },
};

export default function OrdersPage() {
    return (
        <main>
            <PageHero
                eyebrow="Order Tracking"
                title="My Trade"
                accent="Orders"
                description="Monitor live dispatch status, download GST invoices, and reorder tyre stock for your workshop or dealership."
            />
            <div className="bg-[#0B0F19] pb-20">
                <div className="mx-auto max-w-6xl px-4 md:px-6">
                    <OrderHistory />
                </div>
            </div>
        </main>
    );
}
