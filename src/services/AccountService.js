import axios from "axios";
import { baseURL } from "@/api/http";

// Trade business account management (business details, ledger, team, branches).
// Follows the enterprise Service layer pattern used in TorqueBlock-Dashboard.
class AccountService {
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
