"use client";

import { useEffect, useState } from "react";
import { FiActivity, FiCalendar, FiCheckCircle, FiChevronDown, FiCreditCard, FiFileText, FiMapPin, FiSearch, FiTruck, FiXCircle, } from "react-icons/fi";
import { AuthGateCard } from "@/components/auth";
import { Badge, Button, CustomImage, EmptyState, ErrorState, FilterTabs, Input, Pagination, SkeletonCard, StatCard, } from "@/components/ui";
import { useIsMounted } from "@/hooks/useIsMounted";
import { formatDate, formatINR } from "@/lib/format";
import { extractOrderItemImage } from "@/lib/image";
import { fetchOrders } from "@/services/OrderService";
import { useAccountStore } from "@/store/accountStore";
import { useAuthStore } from "@/store/authStore";

const normalizeStatus = (order) => {
    const raw = (order.delivery?.status || order.orderStatus || "pending").toLowerCase();
    if (["cancelled", "failed", "returned"].includes(raw)) return "cancelled";
    if (
        [
            "confirmed",
            "processing",
            "rtd",
            "shipped",
            "dispatched",
            "in transit",
            "out for delivery",
            "out_for_delivery",
            "partial",
            "delivered",
        ].includes(raw)
    ) {
        return "confirmed";
    }
    return "pending";
};

const STATUS_BADGE = {
    cancelled: { tone: "rose", Icon: FiXCircle, label: "CANCELLED" },
    confirmed: { tone: "emerald", Icon: FiCheckCircle, label: "CONFIRMED" },
    pending: { tone: "amber", Icon: FiActivity, label: "PENDING" },
};

export default function OrderHistory() {
    const isMounted = useIsMounted();
    const token = useAuthStore((s) => s.token);

    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedOrderIds, setExpandedOrderIds] = useState({});
    const [state, setState] = useState({
        status: "idle",
        orders: [],
        stats: { all: 0, pending: 0, confirmed: 0, cancelled: 0 },
        page: 1,
        totalPages: 1,
        error: "",
    });
    const [refreshKey, setRefreshKey] = useState(0);

    const reloadOrders = () => setRefreshKey((k) => k + 1);

    const branches = useAccountStore((s) => s.account?.branches);
    const loadAccount = useAccountStore((s) => s.loadAccount);
    const branchOf = (order) => branches?.find((b) => String(b.id) === String(order.tradeBranch));

    useEffect(() => {
        if (token) loadAccount();
    }, [token, loadAccount]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setState((s) => ({ ...s, page: 1 }));
    };

    const toggleDetails = (orderId) => {
        setExpandedOrderIds((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
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
                    const {
                        pending = 0,
                        confirmed = 0,
                        delivered = 0,
                        cancelled: cancelledCount = 0,
                    } = res.statusStats?.[0] || {};

                    setState((s) => ({
                        ...s,
                        status: "ready",
                        orders: res.orders || [],
                        stats: {
                            all: pending + confirmed + delivered + cancelledCount,
                            pending,
                            confirmed,
                            cancelled: cancelledCount,
                        },
                        totalPages: res.pagination?.totalPages || 1,
                    }));
                })
                .catch((err) => {
                    if (cancelled) return;
                    setState((s) => ({
                        ...s,
                        status: "error",
                        error: err.message || "Failed to load orders",
                    }));
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
            <AuthGateCard
                icon={<FiFileText className="text-2xl" />}
                title="Trade Order Portal"
                description="Log in with your registered trade phone number to view live order tracking, proforma invoices, and dispatch status."
            />
        );
    }

    const { stats, orders, totalPages, page } = state;

    const filterTabs = [
        { id: "all", label: "ALL ORDERS", count: stats.all },
        { id: "pending", label: "PENDING", count: stats.pending },
        { id: "confirmed", label: "CONFIRMED", count: stats.confirmed },
        { id: "cancelled", label: "CANCELLED", count: stats.cancelled },
    ];

    return (
        <div className="space-y-4 sm:space-y-5">
            {/* Top 4 Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    label="ALL ORDERS"
                    value={stats.all}
                    Icon={FiFileText}
                    tone="orange"
                    active={activeTab === "all"}
                    onClick={() => handleTabChange("all")}
                    valueClassName="text-2xl sm:text-3xl"
                />
                <StatCard
                    label="PENDING"
                    value={stats.pending}
                    Icon={FiActivity}
                    tone="sky"
                    active={activeTab === "pending"}
                    onClick={() => handleTabChange("pending")}
                    valueClassName="text-2xl sm:text-3xl"
                />
                <StatCard
                    label="CONFIRMED"
                    value={stats.confirmed}
                    Icon={FiCheckCircle}
                    tone="emerald"
                    active={activeTab === "confirmed"}
                    onClick={() => handleTabChange("confirmed")}
                    valueClassName="text-2xl sm:text-3xl"
                />
                <StatCard
                    label="CANCELLED"
                    value={stats.cancelled}
                    Icon={FiXCircle}
                    tone="rose"
                    active={activeTab === "cancelled"}
                    onClick={() => handleTabChange("cancelled")}
                    valueClassName="text-2xl sm:text-3xl"
                />
            </div>

            {/* Filter Tabs & Search Bar Strip */}
            <FilterTabs
                tabs={filterTabs}
                activeTab={activeTab}
                onChange={handleTabChange}
                right={
                    <div className="w-full md:w-80">
                        <Input
                            pill
                            type="text"
                            leftIcon={<FiSearch className="text-xs" />}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setState((s) => ({ ...s, page: 1 }));
                            }}
                            placeholder="Search order, tyre, tracking #..."
                            className="text-xs"
                        />
                    </div>
                }
            />

            {state.status === "error" && (
                <ErrorState title="Failed to Load Orders" error={state.error} onRetry={reloadOrders} />
            )}

            {state.status === "loading" && !orders.length && <SkeletonCard count={3} />}

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

            <div className="space-y-3.5 sm:space-y-4">
                {orders.map((order) => {
                    const normStatus = normalizeStatus(order);
                    const statusBadge = STATUS_BADGE[normStatus] || STATUS_BADGE.pending;
                    const StatusIcon = statusBadge.Icon;
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
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                        ORDER REFERENCE
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-xs sm:text-sm font-black font-mono text-white">
                                        <span>{orderRef}</span>
                                        <span className="text-zinc-600 font-normal">|</span>
                                        <span className="flex items-center gap-1.5 text-zinc-400 font-medium text-xs font-sans">
                                            <FiCalendar className="text-orange-500 text-xs shrink-0" />
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                    {branch && (
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-400">
                                                <FiMapPin className="text-orange-400" />
                                                Branch:{" "}
                                                <strong className="text-zinc-300">
                                                    {branch.branchName} ({branch.branchCode})
                                                </strong>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-4">
                                    {order.paymentMethod?.toLowerCase().includes("credit") && (
                                        <Badge
                                            tone="amber"
                                            pill
                                            bordered
                                            icon={<FiCreditCard size={11} />}
                                            className="text-[10px] uppercase tracking-wider px-2.5 py-1"
                                        >
                                            Pay on Credit
                                        </Badge>
                                    )}

                                    <Badge
                                        tone={statusBadge.tone}
                                        pill
                                        bordered
                                        icon={<StatusIcon className="text-xs" />}
                                        className="px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs uppercase tracking-wider"
                                    >
                                        {statusBadge.label}
                                    </Badge>

                                    <div className="text-right pl-1">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400"> TOTAL PAID </p>
                                        <p className="text-base sm:text-lg font-black text-amber-400 font-mono leading-tight">{formatINR(paidTotal)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Inner Order Items Box */}
                            <div className="space-y-2.5">
                                {order.items?.map((item, idx) => {
                                    const itemPrice = item.totalPrice ?? (item.unitPrice || 0) * (item.quantity || 1);
                                    const productName = item.productName || item.productId?.availableTyres?.productName || item.productId?.hero?.title || "Motorcycle Tyre";
                                    const sizeLabel = item.size || item.productId?.size || "";
                                    const brandName = item.productId?.brand?.name || item.brand || "EUROGRIP";
                                    const itemImage = extractOrderItemImage(item);

                                    return (
                                        <div
                                            key={item._id || idx}
                                            className="rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 backdrop-blur-sm p-3 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-4 transition-colors"
                                        >
                                            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                                                <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center p-1 overflow-hidden shadow-sm">
                                                    <CustomImage
                                                        src={itemImage}
                                                        alt={productName}
                                                        fill
                                                        sizes="56px"
                                                        imageClassName="object-contain p-0.5"
                                                    />
                                                </div>

                                                <div className="space-y-0.5 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider">{brandName}</span>
                                                        <Badge
                                                            tone="orange"
                                                            bordered
                                                            className="text-[9px] font-black uppercase px-1.5 py-0.5 tracking-wider"
                                                        >
                                                            TYRE
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs sm:text-sm font-bold text-white truncate sm:max-w-md lg:max-w-xl">{productName}</p>
                                                    {sizeLabel && (
                                                        <p className="text-[11px] font-bold text-zinc-400 uppercase">SIZE: {sizeLabel}</p>
                                                    )}
                                                    <p className="text-[11px] font-medium text-zinc-400">Qty: {item.quantity || 1}</p>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="text-sm sm:text-base font-black text-white font-mono">{formatINR(itemPrice)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* View Details Toggle */}
                            <div className="pt-1">
                                <Button
                                    variant="text"
                                    size="xs"
                                    uppercase
                                    onClick={() => toggleDetails(order._id)}
                                    aria-expanded={isExpanded}
                                    rightIcon={
                                        <FiChevronDown className={`text-xs transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                    }
                                >
                                    View details
                                </Button>

                                {isExpanded && (
                                    <div className="mt-3 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs shadow-inner">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500"> DELIVERY DETAILS </p>
                                            {(order.delivery?.trackingNumber || order.trackingNumber) && (
                                                <p className="text-zinc-300 font-semibold flex items-center gap-1">
                                                    <FiTruck className="text-orange-500" /> Tracking #
                                                    {order.delivery?.trackingNumber || order.trackingNumber}
                                                </p>
                                            )}
                                            {(order.delivery?.courierName || order.courierName) && (
                                                <p className="text-zinc-400 font-semibold"> Courier: {order.delivery?.courierName || order.courierName} </p>
                                            )}
                                            <p className="text-zinc-300 font-semibold capitalize"> Status: {order.delivery?.status || order.orderStatus || "Pending"}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">PAYMENT</p>
                                            <p className="text-zinc-300 font-semibold capitalize">Method: {order.paymentMethod || "Bank Transfer"}</p>
                                            <p className="text-zinc-300 font-semibold capitalize">Payment Status: {order.paymentStatus || "Pending"}</p>
                                            {(order.transactionId || order.paymentId) && (
                                                <p className="text-zinc-400 font-mono text-[10px]">Txn: {order.transactionId || order.paymentId}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">DELIVERY ADDRESS</p>
                                            {order.items?.[0]?.address ? (
                                                typeof order.items[0].address === "object" ? (
                                                    <p className="text-zinc-300 font-medium">
                                                        {order.items[0].address.fullName && (
                                                            <span className="block font-bold text-white"> {order.items[0].address.fullName}</span>
                                                        )}
                                                        {order.items[0].address.addressLine1},{" "}
                                                        {order.items[0].address.city},{" "}
                                                        {order.items[0].address.state} -{" "}
                                                        {order.items[0].address.pincode}
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

            <Pagination
                variant="simple"
                page={page}
                totalPages={totalPages}
                onPageChange={(nextPage) => setState((s) => ({ ...s, page: nextPage }))}
                label="Order history pagination"
            />
        </div>
    );
}
