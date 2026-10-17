import { validate } from "@/lib/validation";

// Field definitions shared by the profile editor and the checkout billing step (rendered by ui/FormFields).

export const ADDRESS_FIELDS = [
    { name: "addressLine1", label: "Shop / warehouse address", placeholder: "Shop / Plot No., Building, Street", span: true, required: true },
    { name: "addressLine2", label: "Landmark / Area", placeholder: "Near landmark / Industrial estate", span: true },
    { name: "city", label: "City", placeholder: "City", required: true },
    { name: "state", label: "State", placeholder: "State", required: true },
    { name: "pincode", label: "Pincode", placeholder: "6-digit PIN", inputMode: "numeric", maxLength: 6, digits: true, required: true },
];

export const businessFields = (businessTypes = []) => [
    { name: "businessType", label: "Business type", placeholder: "Select your business type", options: businessTypes, span: true, required: true },
    { name: "businessName", label: "Business / Firm name", placeholder: "Enter Your Business / Firm name", span: true, required: true },
    { name: "contactName", label: "Contact person", placeholder: "Enter Your Full Name", required: true },
    { name: "email", label: "Email", placeholder: "Enter Your Email", type: "email" },
    { name: "gstin", label: "GSTIN", placeholder: "Enter Your GSTIN Number", maxLength: 15, upper: true, required: true },
    { name: "panNumber", label: "PAN", placeholder: "Enter Your PAN Number", maxLength: 10, upper: true },
    { name: "b2bLicense", label: "Trade licence no.", placeholder: "Optional", span: true },
];

export const BILLING_FIELDS = [
    { name: "businessName", label: "Dealership / Business name", placeholder: "Enter Your Business / Firm name", span: true, required: true },
    { name: "contactName", label: "Contact person", placeholder: "Enter Your Full Name", required: true },
    { name: "phone", label: "Contact phone", placeholder: "Enter Your Mobile Number", type: "tel", inputMode: "numeric", maxLength: 10, digits: true, required: true },
    { name: "email", label: "Email", placeholder: "Enter Your Email", type: "email" },
    { name: "gstin", label: "GSTIN", placeholder: "Enter Your GSTIN Number", maxLength: 15, upper: true },
    ...ADDRESS_FIELDS,
];

const pick = (source = {}, keys) => Object.fromEntries(keys.map((key) => [key, source?.[key] || ""]));
const ADDRESS_KEYS = ADDRESS_FIELDS.map((f) => f.name);

export const profileToForm = (profile) => ({
    ...pick(profile, ["businessType", "businessName", "contactName", "email", "gstin", "panNumber", "b2bLicense"]),
    ...pick(profile?.address, ADDRESS_KEYS),
});

export const profileToBilling = (profile) => ({
    ...pick(profile, ["businessName", "contactName", "email", "gstin"]),
    phone: String(profile?.phone || "").replace(/\D/g, "").slice(-10),
    ...pick(profile?.address, ADDRESS_KEYS),
});

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
        const message = RULE_FOR[name] && validate({ [RULE_FOR[name]]: value });
        if (message) errors[name] = message;
        return errors;
    }, {});

// Profile form -> PUT /trade/me body.
export const toProfilePayload = (form) => ({
    businessType: form.businessType,
    businessName: form.businessName.trim(),
    contactName: form.contactName.trim(),
    email: form.email.trim(),
    gstin: form.gstin.trim().toUpperCase(),
    panNumber: form.panNumber.trim().toUpperCase(),
    b2bLicense: form.b2bLicense.trim(),
    address: Object.fromEntries(ADDRESS_KEYS.map((key) => [key, form[key].trim()])),
});
