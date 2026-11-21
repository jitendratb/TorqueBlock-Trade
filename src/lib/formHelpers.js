import { ADDRESS_KEYS } from "@/constants/forms";
import { validate } from "@/lib/validation";

const pick = (source = {}, keys) => Object.fromEntries(keys.map((key) => [key, source?.[key] || ""]));

// { key: trimmed string } for the given keys; missing values become "". Safe on null/undefined sources.
export const trimValues = (source, keys) =>
    Object.fromEntries(keys.map((key) => [key, String(source?.[key] ?? "").trim()]));

// Indian postal address in the shape every backend endpoint expects.
export const toAddressBody = (source) => ({ ...trimValues(source, ADDRESS_KEYS), country: "India" });

export const profileToBilling = (profile, account) => {
    const address = profile?.address || {};
    return {
        businessName: address.businessName || account?.businessName || "",
        contactName: address.contactName || profile?.name || "",
        phone: String(address.phone || profile?.phone || "").replace(/\D/g, "").slice(-10),
        email: address.email || profile?.email || "",
        gstin: address.gstin || account?.gstin || profile?.gstin || "",
        ...pick(address, ADDRESS_KEYS),
    };
};

export const formatAddress = (address) => address?.addressLine1 ? [address.addressLine1, address.addressLine2, `${address.city}, ${address.state} - ${address.pincode}`]
    .filter(Boolean)
    .join(", ") : "";

const RULE_FOR = {
    phone: "phone",
    primaryOwnerNumber: "phone",
    contactNumber: "phone",
    gstin: "gstin",
    pan: "pan",
    panNumber: "pan",
    pincode: "pincode",
    email: "email",
};

export const validateFields = (fields, values) => fields.reduce((errors, { name, label, required }) => {
    const value = String(values?.[name] ?? "").trim();
    if (!value) {
        if (required) errors[name] = `${label} is required.`;
        return errors;
    }
    const rule = RULE_FOR[name];
    if (rule) {
        const error = validate({ [rule]: value });
        if (error) errors[name] = error;
    }
    return errors;
}, {});

