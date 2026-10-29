import axios from "axios";
import { baseURL } from "@/api/http";

// Trade order placement, verification and order history service.
class OrderService {
    static async createOrder({ paymentMethod = "Razorpay", addressId, branchId, lines }) {
        const { data } = await axios.post(`${baseURL}/user-orders/create`, {
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
        return data;
    }

    static async verifyOrderPayment(payload) {
        const { data } = await axios.post(`${baseURL}/user-orders/verify-payment`, payload);
        return data;
    }

    static async fetchOrders({ page = 1, limit = 10, status, search } = {}) {
        const { data } = await axios.get(`${baseURL}/user-orders/history`, {
            params: {
                page,
                limit,
                status: status && status !== "all" ? status : undefined,
                search: search?.trim() ? search.trim() : undefined,
            },
        });
        return data;
    }
}

export default OrderService;
export const createOrder = OrderService.createOrder;
export const verifyOrderPayment = OrderService.verifyOrderPayment;
export const fetchOrders = OrderService.fetchOrders;
