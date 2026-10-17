"use client";

import { useState } from "react";
import { FiCheckCircle, FiCopy, FiCheck, FiArrowRight, FiPackage, FiShield } from "react-icons/fi";
import Logo from "@/ui/Logo";
import { Modal } from "@/ui/Overlay";
import Button from "@/ui/Button";
import { formatINR } from "@/lib/format";

export default function OrderSuccessModal({ open, onClose, order }) {
    const [copied, setCopied] = useState(false);

    if (!order) return null;

    const orderId = String(order._id || order.id || "").toUpperCase();
    const displayId = orderId ? `#TB-${orderId.slice(-6)}` : "#TB-ORDER";
    const paymentId = order.paymentId || order.transactionId || order.razorpay_payment_id || "";
    const totalAmount = order.paidAmount || order.total || order.amount || 0;
    const address = order.billingAddress || order.address || {};
    const items = order.items || [];

    const handleCopy = () => {
        if (!orderId) return;
        navigator.clipboard?.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            label="Order Confirmed"
            className="max-w-lg border-white/10 bg-[#0B0F19] text-white"
        >
            <div className="flex flex-col items-center text-center">
                {/* Brand Logo */}
                <Logo href={null} className="w-[110px] mx-auto mb-3" />

                {/* Glowing Success Badge */}
                <div className="relative mb-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 text-white animate-bounce-short">
                        <FiCheckCircle size={32} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0B0F19] border border-orange-500/60 flex items-center justify-center text-orange-400 text-xs shadow-md">
                        <FiShield size={12} />
                    </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-orange-500/10 border border-orange-500/30 text-orange-400 mb-2">
                    <FiCheckCircle className="text-orange-500 text-xs" />
                    {order.paymentMethod?.toLowerCase().includes("credit")
                        ? `Approved Pay on Credit · Net ${order.creditDays || " "} Days`
                        : "Payment Verified · Trade Order Placed"}
                </span>

                <h2 className="text-2xl font-black text-white tracking-tight font-display">
                    Order <span className="text-orange-500">Confirmed!</span>
                </h2>
                <p className="mt-1.5 text-xs text-zinc-400 max-w-sm font-sans">
                    {order.paymentMethod?.toLowerCase().includes("credit")
                        ? "Your order has been placed on credit and charged to your approved company credit limit. Our warehouse team is preparing your tyres for dispatch."
                        : "Your B2B tyre order has been successfully placed. Our dispatch team is queuing your tyres from the hub."}
                </p>

                {/* Order ID & Payment Card */}
                <div className="mt-5 w-full rounded-2xl border border-white/10 bg-[#10141D] p-4 text-left space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Order Reference</p>
                            <p className="font-mono text-sm font-bold text-white flex items-center gap-2">
                                {displayId}
                                <button
                                    onClick={handleCopy}
                                    title="Copy Order ID"
                                    className="text-zinc-400 hover:text-orange-400 transition-colors"
                                >
                                    {copied ? <FiCheck className="text-orange-400" /> : <FiCopy size={12} />}
                                </button>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                {order.paymentMethod?.toLowerCase().includes("credit") ? "Credit Invoiced" : "Amount Paid"}
                            </p>
                            <p className="text-base font-black text-orange-400 font-display">{formatINR(totalAmount)}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-zinc-400 font-medium">Payment Method:</span>
                        <span className="font-bold text-orange-400">
                            {order.paymentMethod?.toLowerCase().includes("credit") ? "Pay on Credit" : "Razorpay Online"}
                        </span>
                    </div>

                    {order.paymentMethod?.toLowerCase().includes("credit") ? (
                        <div className="text-xs flex items-center justify-between text-amber-400/90 font-medium bg-amber-500/10 border border-amber-500/20 rounded-xl px-2.5 py-1.5">
                            <span>Payment Terms:</span>
                            <span className="font-bold">Net {order.creditDays || 30} Days (Pay on Credit)</span>
                        </div>
                    ) : paymentId ? (
                        <div className="text-xs flex items-center justify-between text-zinc-400">
                            <span>Payment ID (Razorpay):</span>
                            <span className="font-mono text-[11px] text-zinc-300 font-semibold truncate max-w-[180px]">
                                {paymentId}
                            </span>
                        </div>
                    ) : null}

                    {/* Delivery / Billing Details */}
                    {(address.businessName || address.fullName || address.city) && (
                        <div className="pt-2 border-t border-white/10 text-xs">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                                Delivery & Invoicing To
                            </p>
                            <p className="font-bold text-white">
                                {address.businessName || address.fullName}
                                {address.gstin ? ` · GSTIN ${address.gstin}` : ""}
                            </p>
                            <p className="text-zinc-400 text-[11px] mt-0.5 font-sans leading-relaxed">
                                {[address.addressLine1, address.addressLine2, address.city, address.state, address.pincode]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
                        </div>
                    )}

                    {/* Items Mini-Summary */}
                    {items.length > 0 && (
                        <div className="pt-2 border-t border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 flex items-center gap-1.5">
                                <FiPackage size={12} className="text-orange-400" /> Ordered Tyres ({items.reduce((s, i) => s + (i.quantity || 1), 0)} Units)
                            </p>
                            <div className="max-h-24 overflow-y-auto custom-scroll space-y-1">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs text-zinc-300">
                                        <span className="truncate max-w-[240px] text-[11px]">
                                            {item.productName || item.Name || "Tyre"} {item.size || item.Size ? `(${item.size || item.Size})` : ""}
                                        </span>
                                        <span className="font-bold text-white text-[11px]">x{item.quantity || 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <p className="mt-3 text-[11px] text-zinc-400 font-sans">
                    A confirmation and tax invoice update will also be shared on WhatsApp.
                </p>

                {/* Actions */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                    <Button
                        href="/orders"
                        onClick={onClose}
                        variant="primary"
                        className="w-full justify-center shadow-lg shadow-orange-500/20"
                    >
                        View My Orders <FiArrowRight />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full justify-center"
                    >
                        Continue Shopping
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
