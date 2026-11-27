import { api } from "@/api";
import { toAddressBody, trimValues } from "@/lib/formHelpers";

const REGISTRATION_KEYS = ["primaryOwnerName", "primaryOwnerNumber", "businessName", "businessType", "contactNumber", "gstin", "pan"];

// Trade business account management (registration, business details, team, branches).
class AccountService {
    static toRegistrationBody(values, shipping = null) {
        const body = trimValues(values, REGISTRATION_KEYS);
        return {
            ...body,
            gstin: body.gstin.toUpperCase(),
            pan: body.pan.toUpperCase(),
            billingAddress: toAddressBody(values),
            ...(shipping ? { shippingAddress: toAddressBody(shipping) } : {}),
        };
    }

    static registerBusinessAccount = (values, shipping) => api.post("/trade/register", AccountService.toRegistrationBody(values, shipping), { silent: true });

    static verifyRegistrationOtp = (otp, otpVerifyToken) => api.post("/trade/register/verify-otp", { otp, otpVerifyToken }, { silent: true });

    static getBusinessAccount = () => api.get("/trade/credit/account");

    static getSalesmen = async () => (await api.get("/trade/credit/salesmen")).data || [];
    static addSalesman = (payload) => api.post("/trade/credit/salesmen", payload);
    static updateSalesman = (id, payload) => api.put(`/trade/credit/salesmen/${id}`, payload);
    static removeSalesman = (id) => api.delete(`/trade/credit/salesmen/${id}`);
    static getBranches = async () => (await api.get("/trade/credit/branches")).data || [];
    static addBranch = (payload) => api.post("/trade/credit/branches", payload);
    static updateBranch = (branchCode, payload) => api.put(`/trade/credit/branches/${encodeURIComponent(branchCode)}`, payload);
    static removeBranch = (branchCode) => api.delete(`/trade/credit/branches/${encodeURIComponent(branchCode)}`);
}

export default AccountService;

export const { registerBusinessAccount, verifyRegistrationOtp, addSalesman, updateSalesman, removeSalesman, addBranch, updateBranch, removeBranch, } = AccountService;
