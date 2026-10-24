import { validate } from "@/lib/validation";

// Field definitions shared by registration, the profile editor, branches and the checkout billing step (rendered by ui/FormFields).

export const ADDRESS_FIELDS = [
    { name: "addressLine1", label: "Shop / warehouse address", placeholder: "Shop / Plot No., Building, Street", span: true, required: true },
    { name: "addressLine2", label: "Landmark / Area", placeholder: "Near landmark / Industrial estate", span: true },
    { name: "city", label: "City", placeholder: "City", required: true },
    { name: "state", label: "State", placeholder: "State", required: true },
    { name: "pincode", label: "Pincode", placeholder: "6-digit PIN", inputMode: "numeric", maxLength: 6, digits: true, required: true },
];

// What a trade user saves themselves (registration & profile): contact details on the login,
// business name and shop address in their address book. Business account details are set by Torque Block.
export const DETAILS_FIELDS = [
    { name: "businessName", label: "Business / Firm name", placeholder: "Enter Your Business / Firm name", span: true, required: true },
    { name: "contactName", label: "Contact person", placeholder: "Enter Your Full Name", required: true },
    { name: "email", label: "Email", placeholder: "Enter Your Email", type: "email" },
    { name: "gstin", label: "GSTIN", placeholder: "Enter Your GSTIN Number (Optional)", maxLength: 15, upper: true, span: true },
    ...ADDRESS_FIELDS,
];

export const BILLING_FIELDS = [
    { name: "businessName", label: "Trade / Business name", placeholder: "Enter Your Business / Firm name", span: true, required: true },
    { name: "contactName", label: "Contact person", placeholder: "Enter Your Full Name", required: true },
    { name: "phone", label: "Contact phone", placeholder: "Enter Your Mobile Number", type: "tel", inputMode: "numeric", maxLength: 10, digits: true, required: true },
    { name: "email", label: "Email", placeholder: "Enter Your Email", type: "email" },
    { name: "gstin", label: "GSTIN", placeholder: "Enter Your GSTIN Number (Optional)", maxLength: 15, upper: true },
    ...ADDRESS_FIELDS,
];

const pick = (source = {}, keys) => Object.fromEntries(keys.map((key) => [key, source?.[key] || ""]));
export const ADDRESS_KEYS = ADDRESS_FIELDS.map((f) => f.name);

// Saved trade address first (what the user typed last), then the business account, then the login.
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

export const formatAddress = (address) =>
    address?.addressLine1 ? [address.addressLine1, address.addressLine2, `${address.city}, ${address.state} - ${address.pincode}`].filter(Boolean).join(", ") : "";

// Field name -> rule in lib/validation.
const RULE_FOR = { phone: "phone", gstin: "gstin", panNumber: "pan", pincode: "pincode", email: "email" };

// Returns { field: message } for missing required fields and failed format checks.
export const validateFields = (fields, values) =>
    fields.reduce((errors, { name, label, required }) => {
        const value = String(values[name] ?? "").trim();
        if (!value) {
            if (required) errors[name] = `${label} is required.`;
            return errors;
        }
        const rule = RULE_FOR[name];
        if (rule) {
            const error = validate(rule, value);
            if (error) errors[name] = error;
        }
        return errors;
    }, {});

const AccountForms = {
    ADDRESS_FIELDS,
    DETAILS_FIELDS,
    BILLING_FIELDS,
    ADDRESS_KEYS,
    profileToBilling,
    formatAddress,
    validateFields,
};

export default AccountForms;
