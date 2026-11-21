"use client";

import { CartTitle, CheckoutFlow, OrderSuccessModal } from "@/components/orders";
import { Card } from "@/components/ui";
import { useCheckout } from "@/hooks/useCheckout";

export default function CartPage() {
    const checkout = useCheckout();
    const { units } = checkout;

    return (
        <main className="relative min-h-[calc(100dvh-120px)] pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <CartTitle as="h1" units={units} className="text-lg sm:text-xl" />
                    <p className="mt-1 text-xs text-zinc-400 sm:text-sm">Review your tyres, billing details and payment.</p>
                </div>

                <Card variant="frosted" className="flex min-h-[460px] flex-col overflow-hidden">
                    <CheckoutFlow checkout={checkout} />
                </Card>
            </div>

            <OrderSuccessModal
                open={Boolean(checkout.confirmedOrder)}
                onClose={checkout.clearConfirmedOrder}
                order={checkout.confirmedOrder}
            />
        </main>
    );
}
