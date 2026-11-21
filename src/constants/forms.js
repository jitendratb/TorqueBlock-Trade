// Field definitions rendered by ui/FormFields. Shared by registration, the profile editor,
// branches and the checkout billing step. Helpers (validateFields, profileToBilling…) live in lib/formHelpers.

export const ADDRESS_FIELDS = [
    { name: "addressLine1", label: "Shop / warehouse address", placeholder: "Shop / Plot No., Building, Street", span: true, required: true },
    { name: "addressLine2", label: "Landmark / Area", placeholder: "Near landmark / Industrial estate", span: true },
    { name: "city", label: "City", placeholder: "City", required: true },
    { name: "state", label: "State", placeholder: "State", required: true },
    { name: "pincode", label: "Pincode", placeholder: "6-digit PIN", inputMode: "numeric", maxLength: 6, digits: true, required: true },
];

export const ADDRESS_KEYS = ADDRESS_FIELDS.map((f) => f.name);

// Reusable single fields, composed into the forms below.
const BUSINESS_NAME = { name: "businessName", label: "Business / Firm name", placeholder: "Enter Your Business / Firm name", span: true, required: true };
const CONTACT_NAME = { name: "contactName", label: "Contact person", placeholder: "Enter Your Full Name", required: true };
const EMAIL = { name: "email", label: "Email", placeholder: "Enter Your Email", type: "email" };
const GSTIN = { name: "gstin", label: "GSTIN", placeholder: "Enter Your GSTIN Number (Optional)", maxLength: 15, upper: true };

// What a trade user saves themselves (registration & profile).
export const DETAILS_FIELDS = [BUSINESS_NAME, CONTACT_NAME, EMAIL, { ...GSTIN, span: true }, ...ADDRESS_FIELDS];

export const BUSINESS_TYPES = ["Dealer / Tyre Shop", "Workshop / Garage", "Fleet Operator", "Distributor / Wholesaler"];

// Trade self-registration. The owner's mobile is verified by WhatsApp OTP and becomes the Trade login.
export const REGISTRATION_FIELDS = [
    { name: "primaryOwnerName", label: "Owner name", placeholder: "Enter Your Full Name", maxLength: 100, required: true },
    { name: "primaryOwnerNumber", label: "Owner mobile (Trade login)", placeholder: "10-digit mobile number", type: "tel", inputMode: "numeric", maxLength: 10, digits: true, required: true },
    { ...BUSINESS_NAME, maxLength: 150 },
    { name: "businessType", label: "Business type", placeholder: "Select business type", options: BUSINESS_TYPES },
    GSTIN,
];

export const BILLING_FIELDS = [
    { ...BUSINESS_NAME, label: "Trade / Business name" },
    CONTACT_NAME,
    { name: "phone", label: "Contact phone", placeholder: "Enter Your Mobile Number", type: "tel", inputMode: "numeric", maxLength: 10, digits: true, required: true },
    EMAIL,
    GSTIN,
    ...ADDRESS_FIELDS,
];
