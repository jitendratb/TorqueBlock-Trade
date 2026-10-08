"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useTrade } from "@/context/TradeContext";
import { GSTIN_PATTERN } from "@/services/tradeService";

const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-orange-500";

// Asked only before the first order; saved on this device so every later order is one click.
export default function BusinessDetailsModal() {
    const { detailsRequest, user } = useTrade();
    const [form, setForm] = useState({ businessName: "", phone: "", gstin: "", city: "" });
    const [error, setError] = useState("");

    if (!detailsRequest) return null;

    const phone = form.phone || user?.phone || "";

    const submit = (e) => {
        e.preventDefault();
        const gstin = form.gstin.trim().toUpperCase();
        if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit mobile number.");
        if (!GSTIN_PATTERN.test(gstin)) return setError("Enter a valid 15-character GSTIN.");
        detailsRequest.onSave({ businessName: form.businessName.trim(), phone, gstin, city: form.city.trim() });
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Business details">
            <button aria-label="Cancel" onClick={detailsRequest.onCancel} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <form onSubmit={submit} className="animate-fade-in-up relative w-full max-w-sm space-y-3 rounded-3xl border border-white/10 bg-[#0B0F19] p-6 text-white shadow-2xl">
                <button type="button" onClick={detailsRequest.onCancel} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 hover:bg-white/10">
                    <FiX />
                </button>
                <h2 className="text-2xl font-black tracking-tight">
                    Billing <span className="text-orange-500">Details</span>
                </h2>
                <p className="text-sm text-zinc-400">Needed once for your GST invoice. Next time, orders go in with one click.</p>
                <input required className={inputClass} placeholder="Business / Firm name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
                <input required className={inputClass} placeholder="Mobile (WhatsApp)" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} />
                <input required className={`${inputClass} uppercase`} placeholder="GSTIN" maxLength={15} value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
                <input required className={inputClass} placeholder="Delivery city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
                <button className="w-full rounded-xl bg-orange-500 py-3 text-sm font-black uppercase tracking-wider hover:bg-orange-600">Save & Place Order</button>
            </form>
        </div>
    );
}
