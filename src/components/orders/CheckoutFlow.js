"use client";

import { IoCartOutline } from "react-icons/io5";
import { Button } from "@/components/ui";
import BillingStep from "./BillingStep";
import ItemsStep from "./ItemsStep";
import PaymentStep from "./PaymentStep";

export default function CheckoutFlow({ checkout, onClose }) {
    const {
        items,
        lines,
        total,
        units,
        totals,
        gstRate,
        isApproved,
        account,
        defaultBilling,
        billing,
        errors,
        currentStep,
        setStep,
        mode,
        setPaymentChoice,
        creditUsable,
        branchId,
        setBranchChoice,
        lockedBranch,
        sending,
        setQuantity,
        remove,
        goToBilling,
        goToPayment,
        onBillingChange,
        pay,
    } = checkout;

    if (items.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 sm:px-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/40 text-zinc-500 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
                    <IoCartOutline className="text-2xl" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Your Cart is Empty</h3>
                    <p className="max-w-[260px] text-xs font-medium leading-relaxed text-zinc-400">
                        Browse live trade stock and add tyre sizes for your business order.
                    </p>
                </div>
                <Button href="/#stock" variant="subtle" size="md" onClick={onClose}>
                    Browse Tyre Stock
                </Button>
            </div>
        );
    }

    if (currentStep === "items") {
        return (
            <ItemsStep
                lines={lines}
                units={units}
                totals={totals}
                gstRate={gstRate}
                isApproved={isApproved}
                billing={defaultBilling}
                onRemove={remove}
                onQuantity={setQuantity}
                onNext={goToBilling}
            />
        );
    }

    if (currentStep === "address") {
        return (
            <BillingStep
                values={billing}
                errors={errors}
                onChange={onBillingChange}
                units={units}
                total={total}
                onBack={() => setStep("items")}
                onNext={goToPayment}
                onClose={onClose || (() => setStep("items"))}
            />
        );
    }

    return (
        <PaymentStep
            billing={billing}
            units={units}
            totals={totals}
            gstRate={gstRate}
            mode={mode}
            onMode={setPaymentChoice}
            creditUsable={creditUsable}
            account={account}
            branchId={branchId}
            onBranch={setBranchChoice}
            lockedBranch={lockedBranch}
            sending={sending}
            onPay={pay}
            onBack={() => setStep("address")}
        />
    );
}

