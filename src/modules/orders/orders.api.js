import { http } from "@/api/http";

// POST /user-orders/create — the backend prices every line itself (dealer price for dealers)
// and deducts inventory for non-online payment methods or after Razorpay verification.
export const createOrder = ({ paymentMethod = "Razorpay", addressId, billingAddress, branchCode, lines }) =>
    http.post(
        "/user-orders/create",
        {
            paymentMethod,
            orderType: "b2b",
            billingAddress,
            branchCode,
            items: lines.map((line) => ({
                productId: line.id,
                quantity: line.quantity,
                size: line.size,
                addressId,
                deliveryMode: "standard",
            })),
        },
        { auth: true }
    );

// POST /user-orders/verify-payment — verifies Razorpay signature and deducts inventory
export const verifyOrderPayment = (payload) =>
    http.post("/user-orders/verify-payment", payload, { auth: true });

// GET /user-orders/history
export const fetchOrders = ({ page = 1, limit = 10, status, search, salesmanId } = {}) =>
    http.get("/user-orders/history", {
        auth: true,
        params: {
            page,
            limit,
            status: status && status !== "all" ? status : undefined,
            search: search?.trim() ? search.trim() : undefined,
            salesmanId: salesmanId || undefined,
        },
    });

// POST /cart — adds an item to user's cart
export const addToBackendCart = (payload) =>
    http.post("/cart", payload, { auth: true });

// Business account, credit and team APIs live in modules/account/account.api.js
