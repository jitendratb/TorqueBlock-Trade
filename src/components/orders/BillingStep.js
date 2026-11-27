"use client";

import Link from "next/link";
import { FiMapPin } from "react-icons/fi";
import { Button, FormFields } from "@/components/ui";
import { BILLING_FIELDS } from "@/constants/forms";
import { formatINR } from "@/lib/format";

// Step 2 — Billing & delivery details used for the GST invoice.
export default function BillingStep({ values, errors, onChange, units, total, onBack, onNext, onClose, }) {
    return (
        <>
            <div className="custom-scroll flex-1 space-y-4 overflow-y-auto px-4 sm:px-5 py-4">
                <div className="rounded-2xl border border-[#A35229]/30 bg-[#A35229]/10 p-3.5 text-xs text-zinc-300">
                    <p className="flex items-center gap-1.5 font-bold text-[#F59E0B]">
                        <FiMapPin /> Wholesale Delivery &amp; Invoicing
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                        We generate the GST tax invoice with these details and save them as your billing address.{" "}
                        <Link
                            href="/account"
                            onClick={onClose}
                            className="font-bold text-[#F59E0B] hover:text-amber-300 transition-colors"
                        >
                            Edit full profile →
                        </Link>
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <FormFields
                        fields={BILLING_FIELDS}
                        values={values}
                        errors={errors}
                        onChange={onChange}
                        idPrefix="billing-"
                    />
                </div>
            </div>

            <footer className="space-y-3.5 border-t border-white/10 px-4 sm:px-5 py-4">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{units} tyres selected</span>
                    <span className="text-sm sm:text-base font-black text-white">
                        Total: <span className="text-[#F59E0B]">{formatINR(total)}</span>
                    </span>
                </div>

                <Button
                    variant="brand"
                    size="lg"
                    full
                    onClick={onNext}
                    rightIcon={<span className="text-base leading-none">→</span>}
                >
                    CONTINUE TO PAYMENT
                </Button>

                <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                    <Button variant="text" size="xs" uppercase={false} onClick={onBack}>
                        ← Back to Review Items
                    </Button>
                    <span>Step 2 of 3</span>
                </div>
            </footer>
        </>
    );
}
