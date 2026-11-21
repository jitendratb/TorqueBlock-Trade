import { api } from "@/api";
import { ADDRESS_KEYS } from "@/constants/forms";
import { toAddressBody, trimValues } from "@/lib/formHelpers";

// Every field of a trade address as the app uses it (contact details + postal address).
const CONTACT_KEYS = ["businessName", "contactName", "phone", "email", "gstin"];
const TRADE_ADDRESS_KEYS = [...CONTACT_KEYS, ...ADDRESS_KEYS];

// Logged-in user's address book: parsing, picking the trade address, saving billing details.
class AddressService {
    // Backend address document → app address.
    static toAddress(doc) {
        if (!doc) return null;
        return {
            id: String(doc._id),
            businessName: doc.billingName || "",
            contactName: doc.fullName || "",
            phone: doc.phone || "",
            email: doc.email || "",
            gstin: doc.billingGst || doc.gst || "",
            ...Object.fromEntries(ADDRESS_KEYS.map((key) => [key, doc[key] || ""])),
        };
    }

    // The saved trade address, else the retail default as a prefill (id null → saving creates a trade copy).
    static pickTradeAddress(docs = []) {
        const list = (Array.isArray(docs) ? docs : []).filter((doc) => doc?._id);
        const trade = list.find((doc) => doc.billingName);
        if (trade) return AddressService.toAddress(trade);
        const retail = list.find((doc) => doc.isDefault) || list[0];
        return retail ? { ...AddressService.toAddress(retail), id: null } : null;
    }

    // App address → backend address document.
    static toBody(values) {
        const contact = trimValues(values, CONTACT_KEYS);
        const gstin = contact.gstin.toUpperCase();
        return {
            fullName: contact.contactName,
            phone: contact.phone,
            email: contact.email,
            gst: gstin,
            billingName: contact.businessName,
            billingGst: gstin,
            addressType: "work",
            ...toAddressBody(values),
        };
    }

    // Updates the address when it has an id (falls back to creating one if the update returns nothing).
    static async saveAddress(values, addressId) {
        const body = AddressService.toBody(values);
        if (addressId) {
            const res = await api.put("/address", { ...body, addressId });
            if (res?.data) return AddressService.toAddress(res.data);
        }
        const res = await api.post("/address", body);
        return AddressService.toAddress(res?.data);
    }

    static isSame(values, saved) {
        const a = trimValues(values, TRADE_ADDRESS_KEYS);
        const b = trimValues(saved, TRADE_ADDRESS_KEYS);
        return TRADE_ADDRESS_KEYS.every((key) => a[key] === b[key]);
    }

    // Reuses the saved address when nothing changed, otherwise saves the new details.
    static async ensureTradeAddress(values, saved) {
        if (saved?.id && AddressService.isSame(values, saved)) return saved;
        return AddressService.saveAddress(values, saved?.id);
    }
}

export default AddressService;
export const ensureTradeAddress = AddressService.ensureTradeAddress;
