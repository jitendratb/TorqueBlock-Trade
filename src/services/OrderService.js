import { api } from "@/api";

// Logged-in user's orders live on /user-orders; /orders is a separate router without these endpoints.
const ORDERS_BASE = "/user-orders";

// Trade order placement, payment verification and order history.
class OrderService {
    static createOrder = ({ paymentMethod = "Razorpay", addressId, branchId, lines = [] }) =>
        api.post(`${ORDERS_BASE}/create`, {
            paymentMethod,
            orderType: "trade order",
            tradeBranch: branchId || undefined,
            items: lines.map((line) => ({
                productId: line.id,
                quantity: line.quantity,
                size: line.size,
                image: line.image || line.images?.[0] || undefined,
                addressId,
                deliveryMode: "standard",
            })),
        });

    static verifyOrderPayment = (payload) => api.post(`${ORDERS_BASE}/verify-payment`, payload);

    static fetchOrders = ({ page = 1, limit = 10, status, search } = {}) =>
        api.get(`${ORDERS_BASE}/history`, {
            params: {
                page,
                limit,
                status: status && status !== "all" ? status : undefined,
                search: search?.trim() || undefined,
            },
        });
}

export default OrderService;
export const { createOrder, verifyOrderPayment, fetchOrders } = OrderService;
