import OrderHistory from "@/modules/orders/components/OrderHistory";

export const metadata = {
    title: "My Orders | Torque Block Dealers",
    description: "Track all your dealer tyre orders, dispatch status, and order history in one place."
};

export default function OrdersPage() {
    return (
        <main className="min-h-screen bg-[#0B0F19] pt-24 md:pt-28 pb-20">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <OrderHistory />
            </div>
        </main>
    );
}
