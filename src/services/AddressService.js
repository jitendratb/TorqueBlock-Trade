import axios from "axios";
import { baseURL } from "@/api/http";

// The logged-in user's address book (backend routes/address.route.js, mounted at /address).
// Handles parsing, picking trade address, and saving billing/shipping details.
class AddressService {
    static toAddress(doc) {
        if (!doc) return null;
        return {
            id: String(doc._id),
            businessName: doc.billingName || "",
            contactName: doc.fullName || "",
            phone: doc.phone || "",
            email: doc.email || "",
            gstin: doc.billingGst || doc.gst || "",
            addressLine1: doc.addressLine1 || "",
            addressLine2: doc.addressLine2 || "",
            city: doc.city || "",
            state: doc.state || "",
            pincode: doc.pincode || "",
        };
    }

    static pickTradeAddress(docs = []) {
        const list = (Array.isArray(docs) ? docs : []).filter((doc) => doc?._id);
        const trade = list.find((doc) => doc.billingName);
        if (trade) return AddressService.toAddress(trade);
        const retail = list.find((doc) => doc.isDefault) || list[0];
        return retail ? { ...AddressService.toAddress(retail), id: null } : null;
    }

    static toBody(values) {
        const clean = (key) => String(values[key] || "").trim();
        const gstin = clean("gstin").toUpperCase();
        return {
            fullName: clean("contactName"),
            phone: clean("phone"),
            email: clean("email"),
            gst: gstin,
            billingName: clean("businessName"),
            billingGst: gstin,
            addressType: "work",
            addressLine1: clean("addressLine1"),
            addressLine2: clean("addressLine2"),
            city: clean("city"),
            state: clean("state"),
            pincode: clean("pincode"),
            country: "India",
        };
    }

    static async saveAddress(values, addressId) {
        if (addressId) {
            const { data } = await axios.put(`${baseURL}/address`, { ...AddressService.toBody(values), addressId });
            if (data.data) return AddressService.toAddress(data.data);
        }
        const { data } = await axios.post(`${baseURL}/address`, AddressService.toBody(values));
        return AddressService.toAddress(data.data);
    }

    static async loadTradeAddress() {
        const { data } = await axios.get(`${baseURL}/address`);
        return AddressService.pickTradeAddress(data.data || []);
    }

    static async saveTradeAddress(values, currentAddressId = null) {
        return await AddressService.saveAddress(values, currentAddressId);
    }

    static isSame(values, saved) {
        const fields = ["businessName", "contactName", "phone", "email", "gstin", "addressLine1", "addressLine2", "city", "state", "pincode"];
        return fields.every((key) => String(values[key] || "").trim() === String(saved?.[key] || "").trim());
    }

    static async ensureTradeAddress(values, saved) {
        return saved?.id && AddressService.isSame(values, saved)
            ? Promise.resolve(saved)
            : AddressService.saveAddress(values, saved?.id);
    }
}

export default AddressService;
export const pickTradeAddress = AddressService.pickTradeAddress;
export const loadTradeAddress = AddressService.loadTradeAddress;
export const saveTradeAddress = AddressService.saveTradeAddress;
export const ensureTradeAddress = AddressService.ensureTradeAddress;
