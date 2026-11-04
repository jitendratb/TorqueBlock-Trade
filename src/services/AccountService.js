import axios from "axios";
import { baseURL } from "@/api/http";

// Trade business account management (business details, ledger, team, branches).
// Follows the enterprise Service layer pattern used in TorqueBlock-Dashboard.
class AccountService {
    // --- Trade registration (public, no login needed) ---
    // 1. registerBusinessAccount: checks the details and sends a WhatsApp OTP to the owner's mobile; nothing is saved yet.
    // 2. verifyRegistrationOtp: checks the OTP and creates the business account, its address and head office branch. It does not sign in.

    // Registration form values -> POST /trade/register body. The shipping address is optional.
    static toRegistrationBody(values, shipping = null) {
        const clean = (source, key) => String(source?.[key] ?? "").trim();
        const toAddress = (source) => ({
            addressLine1: clean(source, "addressLine1"),
            addressLine2: clean(source, "addressLine2"),
            city: clean(source, "city"),
            state: clean(source, "state"),
            pincode: clean(source, "pincode"),
            country: "India",
        });
        return {
            primaryOwnerName: clean(values, "primaryOwnerName"),
            primaryOwnerNumber: clean(values, "primaryOwnerNumber"),
            businessName: clean(values, "businessName"),
            businessType: clean(values, "businessType"),
            contactNumber: clean(values, "contactNumber"),
            gstin: clean(values, "gstin").toUpperCase(),
            pan: clean(values, "pan").toUpperCase(),
            billingAddress: toAddress(values),
            ...(shipping ? { shippingAddress: toAddress(shipping) } : {}),
        };
    }

    // The registration form shows every failure (400 wrong OTP, 502 WhatsApp down…), so these requests are
    // `silent`: no console.error, which Next dev would raise as an error overlay.

    // -> { otpVerifyToken }; calling it again resends (the backend limits sends per number).
    static async registerBusinessAccount(values, shipping) {
        const { data } = await axios.post(`${baseURL}/trade/register`, AccountService.toRegistrationBody(values, shipping), { silent: true });
        return data;
    }

    // -> { account }
    static async verifyRegistrationOtp(otp, otpVerifyToken) {
        const { data } = await axios.post(`${baseURL}/trade/register/verify-otp`, { otp, otpVerifyToken }, { silent: true });
        return data;
    }

    // --- Business Account & Ledger ---

    static async getBusinessAccount() {
        const { data } = await axios.get(`${baseURL}/trade/credit/account`);
        return data;
    }

    static async getLedger({ page = 1, limit = 20 } = {}) {
        try {
            const { data } = await axios.get(`${baseURL}/trade/credit/ledger`, { params: { page, limit } });
            return data;
        } catch {
            return { success: true, ledger: [], meta: { page: 1, totalPages: 1 } };
        }
    }

    // --- Team / Salesmen ---

    static async getSalesmen() {
        const { data } = await axios.get(`${baseURL}/trade/credit/salesmen`);
        return data.data || [];
    }

    static async addSalesman(payload) {
        const { data } = await axios.post(`${baseURL}/trade/credit/salesmen`, payload);
        return data;
    }

    static async updateSalesman(id, payload) {
        const { data } = await axios.put(`${baseURL}/trade/credit/salesmen/${id}`, payload);
        return data;
    }

    static async removeSalesman(id) {
        const { data } = await axios.delete(`${baseURL}/trade/credit/salesmen/${id}`);
        return data;
    }

    // --- Branches ---

    static async getBranches() {
        const { data } = await axios.get(`${baseURL}/trade/credit/branches`);
        return data.data || [];
    }

    static async addBranch(payload) {
        const { data } = await axios.post(`${baseURL}/trade/credit/branches`, payload);
        return data;
    }

    static async updateBranch(branchCode, payload) {
        const { data } = await axios.put(`${baseURL}/trade/credit/branches/${encodeURIComponent(branchCode)}`, payload);
        return data;
    }

    static async removeBranch(branchCode) {
        const { data } = await axios.delete(`${baseURL}/trade/credit/branches/${encodeURIComponent(branchCode)}`);
        return data;
    }
}

export default AccountService;

// Convenience exports matching existing API signatures
export const verifyRegistrationOtp = AccountService.verifyRegistrationOtp;
export const registerBusinessAccount = AccountService.registerBusinessAccount;
export const fetchBusinessAccount = AccountService.getBusinessAccount;
export const fetchLedger = AccountService.getLedger;
export const fetchSalesmen = AccountService.getSalesmen;
export const addSalesman = AccountService.addSalesman;
export const updateSalesman = AccountService.updateSalesman;
export const removeSalesman = AccountService.removeSalesman;
export const fetchBranches = AccountService.getBranches;
export const addBranch = AccountService.addBranch;
export const updateBranch = AccountService.updateBranch;
export const removeBranch = AccountService.removeBranch;
