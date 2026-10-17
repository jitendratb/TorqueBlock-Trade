"use client";

import { FiArrowRight, FiMapPin } from "react-icons/fi";
import Link from "next/link";
import Button from "@/ui/Button";
import FormFields from "@/ui/FormFields";
import { formatINR } from "@/lib/format";
import { BILLING_FIELDS } from "@/modules/account/account.forms";

// Step 2 — billing & delivery details used for the GST invoice.
export default function BillingStep({ values, errors, onChange, units, total, onBack, onNext, onClose }) {
    return (
        <>
            <div className="custom-scroll flex-1 space-y-4 overflow-y-auto px-5 py-4">
                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-3 text-xs text-zinc-300">
                    <p className="flex items-center gap-1.5 font-bold text-orange-400">
                        <FiMapPin /> Wholesale Delivery &amp; Invoicing
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                        We generate the B2B GST tax invoice with these details and save them as your billing address for the next order.{" "}
                        <Link href="/account" onClick={onClose} className="font-bold text-orange-400 hover:text-orange-300">
                            Edit full business profile →
                        </Link>
                    </p>
                </div>

                <FormFields fields={BILLING_FIELDS} values={values} errors={errors} onChange={onChange} idPrefix="billing-" />
            </div>

            <footer className="space-y-3 border-t border-white/10 bg-[#0D121B] px-5 py-4">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{units} tyres selected</span>
                    <span className="text-base font-black text-white">
                        Total: <span className="text-orange-400">{formatINR(total)}</span>
                    </span>
                </div>
                <Button full onClick={onNext} className="relative justify-center py-3.5 shadow-lg shadow-orange-500/20">
                    Continue to Payment <FiArrowRight />
                </Button>
                <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                    <button type="button" onClick={onBack} className="transition-colors hover:text-white">
                        ← Back to Review Items
                    </button>
                    <span>Step 2 of 3</span>
                </div>
            </footer>
        </>
    );
}
