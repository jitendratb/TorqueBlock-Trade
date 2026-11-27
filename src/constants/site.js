import { siteUrl } from "@/api";
import { POLICIES } from "./policies";

// Static business info for the trade portal. URLs and environment configuration live in src/api/index.js.
export const TRADE_SETTINGS = {
    companyName: "Torque Block",
    siteUrl,
    tagline: "Trade supply of premium & value performance motorcycle tyres, delivered across India.",
    contact: {
        // Production WhatsApp & Phone:
        // phone: "+916366625625",
        // phoneDisplay: "+91 6366 625 625",
        // whatsapp: "916366625625",

        // Testing WhatsApp & Phone:
        phone: "+916366223601",
        phoneDisplay: "+91 6366 223 601",
        whatsapp: "916366223601",
        email: "ops@torqueblock.com",
        whatsappMessage: "Hi Torque Block! I'm a trade customer and want to check stock and place an order.",
    },
    hubs: [
        {
            name: "Bengaluru Hub",
            address: "8, Andree Rd, next to Bangalore Cafe, Bheemanna Garden, Shanti Nagar, Bengaluru, Karnataka 560027",
            mapUrl: "https://share.google/4KLMb3GXpf429cCFn",
        },
        {
            name: "Delhi Hub",
            address: "Basement, Community Center, NH - 1, behind Block C, Naraina, New Delhi, Delhi 110028",
            mapUrl: "https://share.google/tUeXufqut8begnL9f",
        },
    ],
    socials: [
        { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/torque_block/?hl=en" },
        { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/torqueblock" },
        { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/@torqueblock" },
        { platform: "linkedin", label: "LinkedIn", href: "https://in.linkedin.com/company/torque-block" },
    ],
    supportLinks: POLICIES.map(({ label, href }) => ({ label, href })),
    gstRate: 0.18,
};

export const getSettings = () => TRADE_SETTINGS;
