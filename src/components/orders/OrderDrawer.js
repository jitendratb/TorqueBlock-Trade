"use client";

import { FiArrowLeft } from "react-icons/fi";
import { Button, Drawer } from "@/components/ui";
import { useCheckout } from "@/hooks/useCheckout";
import { useUiStore } from "@/store/uiStore";
import CartTitle from "./CartTitle";
import CheckoutFlow from "./CheckoutFlow";
import OrderSuccessModal from "./OrderSuccessModal";

const STEP_TITLES = {
    address: ["Billing &", "Address", "Step 2 of 3 · Invoicing details", "items"],
    payment: ["Payment", "Method", "Step 3 of 3 · Choose how to pay", "address"],
};

function StepHeader({ step, units, hasItems, onBack }) {
    const config = STEP_TITLES[step];
    if (!config) return <CartTitle units={hasItems ? units : 0} />;

    const [title, accent, subtitle, backTo] = config;
    return (
        <div className="flex items-center gap-2.5">
            <Button
                variant="secondary"
                size="sm"
                iconOnly
                onClick={() => onBack(backTo)}
                aria-label="Back"
                icon={<FiArrowLeft size={16} />}
            />
            <div>
                <h2 className="text-sm sm:text-base font-black tracking-[0.08em] uppercase text-white">
                    {title} <span className="text-[#A35229]">{accent}</span>
                </h2>
                <p className="text-[11px] text-zinc-400">{subtitle}</p>
            </div>
        </div>
    );
}

// Checkout drawer: items -> billing & address -> payment (Razorpay or Pay on Credit).
export default function OrderDrawer() {
    const open = useUiStore((s) => s.orderListOpen);
    const setOpen = useUiStore((s) => s.setOrderListOpen);
    const close = () => setOpen(false);

    const checkout = useCheckout({ active: open, onOrderComplete: close });

    return (
        <>
            <Drawer
                open={open}
                onClose={close}
                label="Order list"
                header={
                    <StepHeader
                        step={checkout.currentStep}
                        units={checkout.units}
                        hasItems={checkout.items.length > 0}
                        onBack={checkout.setStep}
                    />
                }
            >
                <CheckoutFlow checkout={checkout} onClose={close} />
            </Drawer>

            <OrderSuccessModal
                open={Boolean(checkout.confirmedOrder)}
                onClose={checkout.clearConfirmedOrder}
                order={checkout.confirmedOrder}
            />
        </>
    );
}
