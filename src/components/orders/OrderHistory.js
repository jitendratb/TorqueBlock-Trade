"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FiSearch,
    FiCalendar,
    FiChevronDown,
    FiXCircle,
    FiCheckCircle,
    FiActivity,
    FiFileText,
    FiTruck,
    FiCreditCard,
    FiMapPin
} from "react-icons/fi";
import { Button, ErrorState, EmptyState, SkeletonCard, CustomImage } from "@/ui";
import { formatDate, formatINR } from "@/lib/format";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/authStore";
import { useAccountStore } from "@/store/accountStore";
import { fetchOrders } from "@/services/OrderService";
import useIsMounted from "@/hooks/useIsMounted";

const normalizeStatus = (order) => {
    const raw = (order.delivery?.status || order.orderStatus || "pending").toLowerCase();
    if (["cancelled", "failed", "returned"].includes(raw)) return "cancelled";
    if (["confirmed", "processing", "rtd", "shipped", "dispatched", "in transit", "out for delivery", "out_for_delivery", "partial", "delivered"].includes(raw)) return "confirmed";
    return "pending";
};

export default function OrderHistory() {
    const isMounted = useIsMounted();
    const token = useAuthStore((s) => s.token);
    const openLogin = useUiStore((s) => s.openLogin);

    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedOrderIds, setExpandedOrderIds] = useState({});
    const [state, setState] = useState({
        status: "idle",
        orders: [],
        stats: { all: 0, pending: 0, confirmed: 0, cancelled: 0 },
        page: 1,
        totalPages: 1,
        error: ""
    });
    const [refreshKey, setRefreshKey] = useState(0);

    const reloadOrders = () => setRefreshKey((k) => k + 1);

    const branches = useAccountStore((s) => s.account?.branches);
    const loadAccount = useAccountStore((s) => s.loadAccount);
    const branchOf = (order) => branches?.find((b) => String(b.id) === String(order.tradeBranch));

    useEffect(() => {
        if (token) loadAccount();
    }, [token, loadAccount]);

    const toggleDetails = (orderId) => {
        setExpandedOrderIds((prev) => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    useEffect(() => {
        if (!token) return;
        let cancelled = false;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((s) => ({ ...s, status: "loading" }));

        const timer = setTimeout(() => {
            fetchOrders({
                page: state.page,
                status: activeTab === "all" ? undefined : activeTab,
                search: searchQuery,
            })
                .then((res) => {
                    if (cancelled) return;
                    const { pending = 0, confirmed = 0, delivered = 0, cancelled: cancelledCount = 0 } = res.statusStats?.[0] || {};

                    setState((s) => ({
                        ...s,
                        status: "ready",
                        orders: res.orders || [],
                        stats: {
                            all: pending + confirmed + delivered + cancelledCount,
                            pending,
                            confirmed,
                            cancelled: cancelledCount
                        },
                        totalPages: res.pagination?.totalPages || 1
                    }));
                })
                .catch((err) => {
                    if (cancelled) return;
                    setState((s) => ({ ...s, status: "error", error: err.message || "Failed to load orders" }));
                });
        }, searchQuery ? 300 : 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [token, state.page, activeTab, searchQuery, refreshKey]);

    if (!isMounted) {
        return <SkeletonCard count={3} />;
    }

    if (!token) {
        return (
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-8 sm:p-12 text-center shadow-xl backdrop-blur-xl space-y-4">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 shadow-sm">
                    <FiFileText className="text-2xl" />
                </div>
                <div className="relative">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white">Trade Order Portal</h2>
                    <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        Log in with your registered trade phone number to view live order tracking, proforma invoices, and dispatch status.
                    </p>
                </div>
                <div className="relative pt-2">
                    <Button size="lg" className="justify-center py-3 px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-lg shadow-orange-500/25" onClick={openLogin}>
                        Trade Login
                    </Button>
                </div>
            </div>
        );
    }

    const { stats, orders, totalPages, page } = state;

    return (
        <div className="space-y-4 sm:space-y-5">
            {/* Top 4 Statistics Cards - Matching Reference Screenshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. ALL ORDERS */}
                <div
                    onClick={() => setActiveTab("all")}
                    className={`cursor-pointer relative overflow-hidden rounded-2xl border transition-all p-4 sm:p-5 flex items-center justify-between select-none backdrop-blur-xl shadow-lg ${
                        activeTab === "all"
                            ? "bg-gradient-to-br from-orange-500/15 via-white/[0.04] to-transparent border-orange-500/40 shadow-orange-500/10 ring-1 ring-orange-500/30"
                            : "bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border-white/10 hover:border-white/25 hover:bg-white/[0.05]"
                    }`}
                >
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">ALL ORDERS</p>
                        <p className="mt-1 text-2xl sm:text-3xl font-black text-white leading-none">{stats.all}</p>
                    </div>
                    <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 shrink-0 shadow-sm">
                        <FiFileText className="text-lg sm:text-xl" />
                    </div>
                </div>

                {/* 2. PENDING */}
                <div
                    onClick={() => setActiveTab("pending")}
                    className={`cursor-pointer relative overflow-hidden rounded-2xl border transition-all p-4 sm:p-5 flex items-center justify-between select-none backdrop-blur-xl shadow-lg ${
                        activeTab === "pending"
                            ? "bg-gradient-to-br from-sky-500/15 via-white/[0.04] to-transparent border-sky-500/40 shadow-sky-500/10 ring-1 ring-sky-500/30"
                            : "bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border-white/10 hover:border-white/25 hover:bg-white/[0.05]"
                    }`}
                >
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">PENDING</p>
                        <p className="mt-1 text-2xl sm:text-3xl font-black text-white leading-none">{stats.pending}</p>
                    </div>
                    <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shrink-0 shadow-sm">
                        <FiActivity className="text-lg sm:text-xl" />
                    </div>
                </div>

                {/* 3. CONFIRMED */}
                <div
                    onClick={() => setActiveTab("confirmed")}
                    className={`cursor-pointer relative overflow-hidden rounded-2xl border transition-all p-4 sm:p-5 flex items-center justify-between select-none backdrop-blur-xl shadow-lg ${
                        activeTab === "confirmed"
                            ? "bg-gradient-to-br from-emerald-500/15 via-white/[0.04] to-transparent border-emerald-500/40 shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                            : "bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border-white/10 hover:border-white/25 hover:bg-white/[0.05]"
                    }`}
                >
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">CONFIRMED</p>
                        <p className="mt-1 text-2xl sm:text-3xl font-black text-white leading-none">{stats.confirmed}</p>
                    </div>
                    <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0 shadow-sm">
                        <FiCheckCircle className="text-lg sm:text-xl" />
                    </div>
                </div>

                {/* 4. CANCELLED */}
                <div
                    onClick={() => setActiveTab("cancelled")}
                    className={`cursor-pointer relative overflow-hidden rounded-2xl border transition-all p-4 sm:p-5 flex items-center justify-between select-none backdrop-blur-xl shadow-lg ${
                        activeTab === "cancelled"
                            ? "bg-gradient-to-br from-rose-500/15 via-white/[0.04] to-transparent border-rose-500/40 shadow-rose-500/10 ring-1 ring-rose-500/30"
                            : "bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border-white/10 hover:border-white/25 hover:bg-white/[0.05]"
                    }`}
                >
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">CANCELLED</p>
                        <p className="mt-1 text-2xl sm:text-3xl font-black text-white leading-none">{stats.cancelled}</p>
                    </div>
                    <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0 shadow-sm">
                        <FiXCircle className="text-lg sm:text-xl" />
                    </div>
                </div>
            </div>

            {/* Filter Tabs & Search Bar Strip - Light Frosted Blur */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-2 sm:p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur-xl shadow-lg">
                {/* Filter Tabs on Left */}
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                    {[
                        { id: "all", label: "ALL ORDERS", count: stats.all },
                        { id: "pending", label: "PENDING", count: stats.pending },
                        { id: "confirmed", label: "CONFIRMED", count: stats.confirmed },
                        { id: "cancelled", label: "CANCELLED", count: stats.cancelled },
                    ].map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setState((s) => ({ ...s, page: 1 }));
                                }}
                                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider transition ${
                                    active
                                        ? "bg-white/[0.12] text-white border border-white/20 shadow-sm backdrop-blur-sm"
                                        : "text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent"
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                                        active ? "bg-white/15 text-zinc-200" : "bg-white/5 text-zinc-500"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar on Right */}
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setState((s) => ({ ...s, page: 1 }));
                        }}
                        placeholder="Search order, tyre, tracking #..."
                        className="w-full rounded-full bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 pl-8 pr-4 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/40 backdrop-blur-sm transition"
                    />
                </div>
            </div>

            {/* Error State */}
            {state.status === "error" && (
                <ErrorState
                    title="Failed to Load Orders"
                    error={state.error}
                    onRetry={reloadOrders}
                />
            )}

            {/* Loading Skeleton */}
            {state.status === "loading" && !orders.length && (
                <SkeletonCard count={3} />
            )}

            {/* Empty State */}
            {state.status !== "loading" && state.status !== "error" && !orders.length && (
                <EmptyState
                    title="No Orders Found"
                    description={
                        searchQuery
                            ? "Try searching with a different term."
                            : "You have not placed any orders matching this filter."
                    }
                    actionText="Check Stock"
                    href="/#stock"
                    secondaryAction={
                        searchQuery && (
                            <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                                Clear Search
                            </Button>
                        )
                    }
                />
            )}

            {/* Orders List Cards - Matching Reference Screenshot */}
            <div className="space-y-3.5 sm:space-y-4">
                {orders.map((order) => {
                    const normStatus = normalizeStatus(order);
                    const isExpanded = !!expandedOrderIds[order._id];
                    const orderRef = order._id ? `#${String(order._id).toUpperCase()}` : `#TB-${String(order.transactionId || "").slice(-8).toUpperCase()}`;
                    const paidTotal = order.paidAmount ?? order.totalAmount ?? (order.items || []).reduce((acc, i) => acc + (i.totalPrice || i.unitPrice * i.quantity || 0), 0);
                    const branch = branchOf(order);

                    return (
                        <article
                            key={order._id}
                            className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-4 sm:p-5 md:p-6 space-y-3.5 shadow-xl backdrop-blur-xl transition hover:border-white/20"
                        >
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                            {/* Order Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">ORDER REFERENCE</p>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs sm:text-sm font-black font-mono text-white">
                                        <span>{orderRef}</span>
                                        <span className="text-zinc-600 font-normal">|</span>
                                        <span className="flex items-center gap-1.5 text-zinc-400 font-medium text-xs font-sans">
                                            <FiCalendar className="text-orange-500 text-xs shrink-0" />
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                    {/* Branch Name if present */}
                                    {branch && (
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-400">
                                                <FiMapPin className="text-orange-400" />
                                                Branch: <strong className="text-zinc-300">{branch.branchName} ({branch.branchCode})</strong>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 sm:gap-4">
                                    {/* Credit Terms Badge */}
                                    {order.paymentMethod?.toLowerCase().includes("credit") && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30">
                                            <FiCreditCard size={11} /> Pay on Credit
                                        </span>
                                    )}

                                    {/* Status Badge */}
                                    {normStatus === "cancelled" ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#F43F5E] bg-[#F43F5E]/10 border border-[#F43F5E]/30">
                                            <FiXCircle className="text-xs" /> CANCELLED
                                        </span>
                                    ) : normStatus === "confirmed" ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/30">
                                            <FiCheckCircle className="text-xs" /> CONFIRMED
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30">
                                            <FiActivity className="text-xs" /> PENDING
                                        </span>
                                    )}

                                    {/* Total Paid */}
                                    <div className="text-right pl-1">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">TOTAL PAID</p>
                                        <p className="text-base sm:text-lg font-black text-amber-400 font-mono leading-tight">{formatINR(paidTotal)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Inner Order Items Box - Matching Reference Screenshot */}
                            <div className="space-y-2.5">
                                {order.items?.map((item, idx) => {
                                    const itemPrice = item.totalPrice ?? ((item.unitPrice || 0) * (item.quantity || 1));
                                    const productName = item.productName || item.productId?.availableTyres?.productName || item.productId?.hero?.title || "Motorcycle Tyre";
                                    const sizeLabel = item.size || item.productId?.size || "";
                                    const brandName = item.productId?.brand?.name || item.brand || "EUROGRIP";

                                    const cleanImg = (img) => {
                                        if (!img) return null;
                                        if (typeof img === "string" && img.trim()) return img.trim();
                                        if (typeof img === "object") {
                                            if (img.url && typeof img.url === "string" && img.url.trim()) return img.url.trim();
                                            if (img.imageUrl && typeof img.imageUrl === "string" && img.imageUrl.trim()) return img.imageUrl.trim();
                                            if (img.src && typeof img.src === "string" && img.src.trim()) return img.src.trim();

                                            const numericKeys = Object.keys(img)
                                                .filter((k) => k !== "_id" && !isNaN(k))
                                                .sort((a, b) => Number(a) - Number(b));
                                            if (numericKeys.length > 0) {
                                                const reconstructed = numericKeys.map((k) => img[k]).join("").trim();
                                                if (reconstructed.startsWith("http://") || reconstructed.startsWith("https://") || reconstructed.startsWith("/")) {
                                                    return reconstructed;
                                                }
                                            }
                                        }
                                        return null;
                                    };

                                    const itemImage =
                                        cleanImg(item.image) ||
                                        cleanImg(item.productId?.availableTyres?.hero?.heroImage) ||
                                        (Array.isArray(item.productId?.availableTyres?.productImages) && item.productId.availableTyres.productImages.map(cleanImg).find(Boolean)) ||
                                        (Array.isArray(item.productId?.sizeSpecificImages) && item.productId.sizeSpecificImages.map(cleanImg).find(Boolean)) ||
                                        cleanImg(item.productId?.hero?.heroImage) ||
                                        (Array.isArray(item.productId?.availableTyres?.gallery) && item.productId.availableTyres.gallery.map(cleanImg).find(Boolean)) ||
                                        cleanImg(item.tubeId?.images?.[0]) ||
                                        "/newlogo.webp";

                                    return (
                                        <div
                                            key={item._id || idx}
                                            className="rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 backdrop-blur-sm p-3.5 sm:p-4 flex items-center justify-between gap-4 transition-colors"
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                {/* Tyre Image Box */}
                                                <div className="relative h-14 w-14 shrink-0 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center p-1 overflow-hidden shadow-sm">
                                                    <CustomImage
                                                        src={itemImage}
                                                        alt={productName}
                                                        fill
                                                        sizes="56px"
                                                        imageClassName="object-contain p-0.5"
                                                        fallback="/newlogo.webp"
                                                    />
                                                </div>

                                                {/* Item Metadata */}
                                                <div className="space-y-0.5 min-w-0">
                                                    {/* Brand tag + TYRE badge matching reference */}
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider">
                                                            {brandName}
                                                        </span>
                                                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 tracking-wider">
                                                            TYRE
                                                        </span>
                                                    </div>
                                                    <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[280px] sm:max-w-md lg:max-w-xl">
                                                        {productName}
                                                    </p>
                                                    {sizeLabel && (
                                                        <p className="text-[11px] font-bold text-zinc-400 uppercase">
                                                            SIZE: {sizeLabel}
                                                        </p>
                                                    )}
                                                    <p className="text-[11px] font-medium text-zinc-400">
                                                        Qty: {item.quantity || 1}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Price on Right */}
                                            <div className="text-right shrink-0">
                                                <p className="text-sm sm:text-base font-black text-white font-mono">{formatINR(itemPrice)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* View Details Toggle */}
                            <div className="pt-1">
                                <button
                                    type="button"
                                    onClick={() => toggleDetails(order._id)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition cursor-pointer select-none"
                                >
                                    <span>VIEW DETAILS</span>
                                    <FiChevronDown
                                        className={`text-xs transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {isExpanded && (
                                    <div className="mt-3 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs shadow-inner">
                                        {/* Shipping / Delivery */}
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">DELIVERY DETAILS</p>
                                            {(order.delivery?.trackingNumber || order.trackingNumber) && (
                                                <p className="text-zinc-300 font-semibold flex items-center gap-1">
                                                    <FiTruck className="text-orange-500" /> Tracking #{order.delivery?.trackingNumber || order.trackingNumber}
                                                </p>
                                            )}
                                            {(order.delivery?.courierName || order.courierName) && (
                                                <p className="text-zinc-400 font-semibold">Courier: {order.delivery?.courierName || order.courierName}</p>
                                            )}
                                            <p className="text-zinc-300 font-semibold capitalize">Status: {order.delivery?.status || order.orderStatus || "Pending"}</p>
                                        </div>

                                        {/* Payment */}
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">PAYMENT</p>
                                            <p className="text-zinc-300 font-semibold capitalize">Method: {order.paymentMethod || "Bank Transfer"}</p>
                                            <p className="text-zinc-300 font-semibold capitalize">Payment Status: {order.paymentStatus || "Pending"}</p>
                                            {(order.transactionId || order.paymentId) && (
                                                <p className="text-zinc-400 font-mono text-[10px]">Txn: {order.transactionId || order.paymentId}</p>
                                            )}
                                        </div>

                                        {/* Delivery Address */}
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">DELIVERY ADDRESS</p>
                                            {order.items?.[0]?.address ? (
                                                typeof order.items[0].address === "object" ? (
                                                    <p className="text-zinc-300 font-medium">
                                                        {order.items[0].address.fullName && <span className="block font-bold text-white">{order.items[0].address.fullName}</span>}
                                                        {order.items[0].address.addressLine1}, {order.items[0].address.city}, {order.items[0].address.state} - {order.items[0].address.pincode}
                                                    </p>
                                                ) : (
                                                    <p className="text-zinc-400">Address recorded on order file</p>
                                                )
                                            ) : (
                                                <p className="text-zinc-400">Registered Trade Hub Address</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setState((s) => ({ ...s, page: s.page - 1 }))}
                    >
                        Previous
                    </Button>
                    <span className="text-xs font-bold text-zinc-400">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setState((s) => ({ ...s, page: s.page + 1 }))}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
