import Link from "next/link";
import OrderHistory from "@/components/orders/OrderHistory";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "My Orders | Torque Block Trade",
    description: "Track all your tyre orders, live dispatch status, delivery tracking, and tax invoice history.",
    robots: { index: false, follow: true },
};

export default function OrdersPage() {
    return (
        <main className="bg-[#0B0E17] min-h-[calc(100vh-120px)] pt-[100px] min-[400px]:pt-[104px] sm:pt-[110px] lg:pt-[116px] pb-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
                {/* Breadcrumbs matching reference screenshot */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm font-semibold pt-1">
                    <Link href="/" className="text-sky-400 hover:text-sky-300 transition-colors">
                        Home
                    </Link>
                    <span className="text-zinc-600">›</span>
                    <span className="text-white font-bold" aria-current="page">
                        My Orders
                    </span>
                </nav>

                <OrderHistory />
            </div>
        </main>
    );
}
