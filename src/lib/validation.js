// Client-side checks mirror the backend rules (backend utils/trade.helper.js) so dealers
// see mistakes instantly; the backend still validates every request.

export const digitsOnly = (value = "") => value.replace(/\D/g, "");

const RULES = {
    phone: { test: (v) => /^[6-9]\d{9}$/.test(v), message: "Enter a valid 10-digit mobile number." },
    gstin: { test: (v) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v.toUpperCase()), message: "Enter a valid 15-character GSTIN (e.g. 29ABCDE1234F1Z5)." },
    pan: { test: (v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase()), message: "Enter a valid 10-character PAN (e.g. ABCDE1234F)." },
    pincode: { test: (v) => /^[1-9][0-9]{5}$/.test(v), message: "Enter a valid 6-digit pincode." },
    email: { test: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "Enter a valid email address." },
    otp: { test: (v) => /^\d{6}$/.test(v), message: "Enter the 6-digit OTP." },
};

// Returns the first error message for the given { field: value } pairs, or "".
export const validate = (fields) => {
    for (const [field, value] of Object.entries(fields)) {
        const rule = RULES[field];
        if (rule && !rule.test(String(value ?? "").trim())) return rule.message;
    }
    return "";
};
