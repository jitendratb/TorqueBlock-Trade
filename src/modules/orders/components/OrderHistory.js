"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FiSearch,
    FiCalendar,
    FiChevronDown,
    FiChevronRight,
    FiXCircle,
    FiCheckCircle,
    FiActivity,
    FiFileText,
    FiPackage,
    FiTruck,
    FiClock,
    FiCreditCard,
    FiUserCheck,
    FiX
} from "react-icons/fi";
import Button from "@/ui/Button";
import { formatDate, formatINR } from "@/lib/format";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useAccountStore } from "@/modules/account/account.store";
import { fetchOrders } from "../orders.api";

const normalizeStatus = (order) => {
    const raw = (order.delivery?.status || order.orderStatus || "pending").toLowerCase();
    if (["cancelled", "failed", "returned"].includes(raw)) return "cancelled";
    if (["confirmed", "processing", "rtd", "shipped", "dispatched", "in transit", "out for delivery", "out_for_delivery", "partial"].includes(raw)) return "confirmed";
    if (["delivered"].includes(raw)) return "confirmed";
    return "pending";
};

export default function OrderHistory() {
    const token = useAuthStore((s) => s.token);
    const openLogin = useUiStore((s) => s.openLogin);
    const notify = useUiStore((s) => s.notify);

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

    // Salesman filter is shared with the account page ("Orders" button on a team member)
    const orderFilter = useAccountStore((s) => s.orderFilter);
    const setOrderFilter = useAccountStore((s) => s.setOrderFilter);
    const salesmanFilter = orderFilter?.id || "";

    const filterBySalesman = (filter) => {
        setOrderFilter(filter);
        setState((s) => ({ ...s, page: 1 }));
    };

    const toggleDetails = (orderId) => {
        setExpandedOrderIds((prev) => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    useEffect(() => {
        if (!token) return;
        let cancelled = false;

        // eslint-disable-next-line react-hooks/set-state-in-effect -- start of a fetch for current page / filter
        setState((s) => ({ ...s, status: "loading" }));

        const timer = setTimeout(() => {
            fetchOrders({
                page: state.page,
                status: activeTab === "all" ? undefined : activeTab,
                search: searchQuery,
                salesmanId: salesmanFilter || undefined,
            })
                .then((res) => {
                    if (cancelled) return;
                    const orders = res.orders || [];
                    const resStats = res.stats || {};
                    const totalFromPagination = res.pagination?.total || orders.length;

                    // Fallback local calculation if backend didn't aggregate
                    const allCount = resStats.all ?? totalFromPagination;
                    const pendingCount = resStats.pending ?? orders.filter((o) => normalizeStatus(o) === "pending").length;
                    const confirmedCount = resStats.confirmed ?? orders.filter((o) => normalizeStatus(o) === "confirmed").length;
                    const cancelledCount = resStats.cancelled ?? orders.filter((o) => normalizeStatus(o) === "cancelled").length;

                    setState((s) => ({
                        ...s,
                        status: "ready",
                        orders,
                        stats: {
                            all: allCount,
                            pending: pendingCount,
                            confirmed: confirmedCount,
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
    }, [token, state.page, activeTab, searchQuery, salesmanFilter]);

    if (!token) {
        return (
            <div className="rounded-3xl border border-white/10 bg-[#161B26] p-12 text-center shadow-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
                    <FiFileText className="text-2xl" />
                </div>
                <h2 className="mt-5 text-2xl font-black text-white">Dealer Order Portal</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                    Log in with your registered dealer phone number to view live order tracking, proforma invoices, and dispatch status.
                </p>
                <Button className="mt-6" size="lg" onClick={openLogin}>
                    Dealer Login
                </Button>
            </div>
        );
    }

    const { stats, orders, totalPages, page } = state;

    return (
        <div className="space-y-6">
            {/* Breadcrumb Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <nav className="flex items-center gap-2 text-xs md:text-sm font-semibold text-zinc-400">
                    <Link href="/" className="hover:text-white transition">
                        Home
                    </Link>
                    <FiChevronRight className="text-zinc-600 text-xs" />
                    <span className="text-white font-bold">My Orders</span>
                </nav>
            </div>

            {/* Status Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {/* ALL ORDERS */}
                <div
                    onClick={() => setActiveTab("all")}
                    className={`cursor-pointer rounded-2xl md:rounded-3xl border transition-all p-4 md:p-5 flex items-center justify-between ${activeTab === "all"
                        ? "bg-[#181E2C] border-orange-500/40 shadow-lg shadow-orange-500/5"
                        : "bg-[#141824] border-white/10 hover:border-white/20"
                        }`}
                >
                    <div>
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-zinc-400">ALL ORDERS</p>
                        <p className="mt-1 text-2xl md:text-3xl font-black text-white">{stats.all}</p>
                    </div>
                    <div className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-[#2D2115] border border-orange-500/20 text-[#FF8A3D]">
                        <FiFileText className="text-lg md:text-xl" />
                    </div>
                </div>

                {/* PENDING */}
                <div
                    onClick={() => setActiveTab("pending")}
                    className={`cursor-pointer rounded-2xl md:rounded-3xl border transition-all p-4 md:p-5 flex items-center justify-between ${activeTab === "pending"
                        ? "bg-[#181E2C] border-sky-500/40 shadow-lg shadow-sky-500/5"
                        : "bg-[#141824] border-white/10 hover:border-white/20"
                        }`}
                >
                    <div>
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-zinc-400">PENDING</p>
                        <p className="mt-1 text-2xl md:text-3xl font-black text-white">{stats.pending}</p>
                    </div>
                    <div className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-[#14233D] border border-sky-500/20 text-[#38BDF8]">
                        <FiActivity className="text-lg md:text-xl" />
                    </div>
                </div>

                {/* CONFIRMED */}
                <div
                    onClick={() => setActiveTab("confirmed")}
                    className={`cursor-pointer rounded-2xl md:rounded-3xl border transition-all p-4 md:p-5 flex items-center justify-between ${activeTab === "confirmed"
                        ? "bg-[#181E2C] border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                        : "bg-[#141824] border-white/10 hover:border-white/20"
                        }`}
                >
                    <div>
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-zinc-400">CONFIRMED</p>
                        <p className="mt-1 text-2xl md:text-3xl font-black text-white">{stats.confirmed}</p>
                    </div>
                    <div className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-[#132E27] border border-emerald-500/20 text-[#34D399]">
                        <FiCheckCircle className="text-lg md:text-xl" />
                    </div>
                </div>

                {/* CANCELLED */}
                <div
                    onClick={() => setActiveTab("cancelled")}
                    className={`cursor-pointer rounded-2xl md:rounded-3xl border transition-all p-4 md:p-5 flex items-center justify-between ${activeTab === "cancelled"
                        ? "bg-[#181E2C] border-rose-500/40 shadow-lg shadow-rose-500/5"
                        : "bg-[#141824] border-white/10 hover:border-white/20"
                        }`}
                >
                    <div>
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-zinc-400">CANCELLED</p>
                        <p className="mt-1 text-2xl md:text-3xl font-black text-white">{stats.cancelled}</p>
                    </div>
                    <div className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-[#331824] border border-rose-500/20 text-[#F43F5E]">
                        <FiXCircle className="text-lg md:text-xl" />
                    </div>
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2">
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
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setState((s) => ({ ...s, page: 1 }));
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-wider transition ${active
                                    ? "bg-white/15 text-white border border-white/20 shadow-sm"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                                    }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${active ? "bg-white/20 text-white" : "bg-white/10 text-zinc-400"
                                        }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setState((s) => ({ ...s, page: 1 }));
                        }}
                        placeholder="Search order, tyre, tracking #..."
                        className="w-full rounded-full bg-[#141824] border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50 transition"
                    />
                </div>
            </div>

            {/* Active Salesman Filter Pill */}
            {salesmanFilter && (
                <div className="flex items-center justify-between rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-xs text-orange-300">
                    <span className="flex items-center gap-2">
                        <FiUserCheck className="text-orange-400 text-base" />
                        <span>
                            Viewing orders placed by salesman: <strong className="text-white font-black">{orderFilter?.name}</strong>
                        </span>
                    </span>
                    <button
                        onClick={() => filterBySalesman(null)}
                        className="flex items-center gap-1 font-bold text-orange-400 hover:text-white transition bg-black/30 px-2.5 py-1 rounded-lg"
                    >
                        <FiX size={12} /> Clear Filter
                    </button>
                </div>
            )}

            {/* Error Message */}
            {state.status === "error" && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
                    {state.error}
                </div>
            )}

            {/* Loading Skeleton */}
            {state.status === "loading" && !orders.length && (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-44 animate-pulse rounded-3xl border border-white/10 bg-[#141824]" />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {state.status !== "loading" && !orders.length && (
                <div className="rounded-3xl border border-white/10 bg-[#141824] px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
                        <FiPackage className="text-2xl" />
                    </div>
                    <p className="mt-4 text-lg font-black text-white">No orders found</p>
                    <p className="mt-1 text-xs text-zinc-400">
                        {searchQuery || salesmanFilter ? "Try searching with a different term or clear the filter." : "You have not placed any orders matching this filter."}
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-3">
                        {(searchQuery || salesmanFilter) && (
                            <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); filterBySalesman(null); }}>
                                Clear Search &amp; Filter
                            </Button>
                        )}
                        <Button href="/#stock" size="sm">
                            Check Stock
                        </Button>
                    </div>
                </div>
            )}

            {/* Orders List */}
            <div className="space-y-4">
                {orders.map((order) => {
                    const normStatus = normalizeStatus(order);
                    const isExpanded = !!expandedOrderIds[order._id];
                    const orderRef = order._id ? `#${String(order._id).toUpperCase()}` : `#TB-${String(order.transactionId || "").slice(-8).toUpperCase()}`;
                    const paidTotal = order.paidAmount ?? order.totalAmount ?? (order.items || []).reduce((acc, i) => acc + (i.totalPrice || i.unitPrice * i.quantity || 0), 0);

                    return (
                        <article
                            key={order._id}
                            className="rounded-3xl border border-white/10 bg-[#141824] p-4 md:p-6 transition hover:border-white/20 shadow-lg shadow-black/20"
                        >
                            {/* Order Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">ORDER REFERENCE</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs md:text-sm font-black text-white">
                                        <span>{orderRef}</span>
                                        <span className="text-zinc-600">|</span>
                                        <span className="flex items-center gap-1.5 text-zinc-400 font-semibold text-xs">
                                            <FiCalendar className="text-orange-500 text-xs" />
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                    {/* Salesman & Branch attribution badge */}
                                    {order.orderedBySalesman?.name && (
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px]">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-medium">
                                                <FiUserCheck className="text-orange-400" />
                                                Ordered by: <strong className="text-white">{order.orderedBySalesman.name}</strong>
                                                <span className="text-zinc-500">({order.orderedBySalesman.role || "salesman"})</span>
                                            </span>
                                            {order.branchCode && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-400">
                                                    Branch: <strong className="text-zinc-300">{order.branchCode}</strong>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 md:gap-4">
                                    {/* Credit Terms Badge */}
                                    {order.paymentMethod?.toLowerCase().includes("credit") && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30">
                                            <FiCreditCard size={12} /> Pay on Credit · Net {order.creditTerms?.creditDays || " "}d
                                        </span>
                                    )}

                                    {/* Status Badge */}
                                    {normStatus === "cancelled" ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#F43F5E] bg-[#F43F5E]/10 border border-[#F43F5E]/30">
                                            <FiXCircle className="text-sm" /> CANCELLED
                                        </span>
                                    ) : normStatus === "confirmed" ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/30">
                                            <FiCheckCircle className="text-sm" /> CONFIRMED
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/30">
                                            <FiActivity className="text-sm" /> PENDING
                                        </span>
                                    )}

                                    {/* Total Paid */}
                                    <div className="text-right">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">TOTAL</p>
                                        <p className="text-base md:text-lg font-black text-[#EAB308]">{formatINR(paidTotal)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items List */}
                            <div className="mt-4 space-y-3">
                                {order.items?.map((item, idx) => {
                                    const itemPrice = item.totalPrice ?? ((item.unitPrice || 0) * (item.quantity || 1));
                                    const productName = item.productName || item.productId?.availableTyres?.productName || item.productId?.hero?.title || "Motorcycle Tyre";
                                    const sizeLabel = item.size || item.productId?.size || "";
                                    const itemImage = item.image || item.productId?.availableTyres?.productImages?.[0] || item.productId?.hero?.heroImage || null;
                                    const sku = item.sku || item.productId?.identifier || item.productId?.sku;

                                    return (
                                        <div
                                            key={item._id || idx}
                                            className="rounded-2xl bg-[#1C212E] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5"
                                        >
                                            <div className="flex items-center gap-3 md:gap-4">
                                                {/* Product Image or Fallback Package Icon */}
                                                <div className="relative h-14 w-14 shrink-0 rounded-xl bg-black border border-white/10 flex items-center justify-center p-1.5 overflow-hidden shadow-inner">
                                                    {itemImage ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img
                                                            src={typeof itemImage === "string" ? itemImage : itemImage?.url}
                                                            alt={productName}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <FiPackage className="text-zinc-500 text-xl" />
                                                    )}
                                                </div>

                                                {/* Item Details */}
                                                <div className="space-y-1">
                                                    {sku && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-zinc-300 tracking-wider">
                                                                {sku}
                                                            </span>
                                                            {item.deliveryMode && (
                                                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-wider">
                                                                    {item.deliveryMode}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    <p className="text-sm font-black text-white">{productName}</p>
                                                    {sizeLabel && (
                                                        <p className="text-xs font-bold text-zinc-400 uppercase">
                                                            SIZE: {sizeLabel}
                                                        </p>
                                                    )}
                                                    <p className="text-xs font-semibold text-zinc-400">
                                                        Qty: {item.quantity || 1} {item.unitPrice ? `× ${formatINR(item.unitPrice)}` : ""}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-base md:text-lg font-black text-white">{formatINR(itemPrice)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* View Details Footer */}
                            <div className="mt-4 pt-3 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => toggleDetails(order._id)}
                                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white transition"
                                >
                                    <span>VIEW DETAILS</span>
                                    <FiChevronDown
                                        className={`text-sm transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {isExpanded && (
                                    <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/5 p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
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

                                        {/* Billing Address */}
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
                                                <p className="text-zinc-400">Registered Dealer Hub Address</p>
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
