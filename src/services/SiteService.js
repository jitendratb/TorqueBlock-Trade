// Trade portal static site configuration & settings service.
export const TRADE_SETTINGS = {
    companyName: "Torque Block",
    siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://trade.torqueblock.com").replace(/\/+$/, ""),
    tagline: "Trade supply of premium & value performance motorcycle tyres, delivered across India.",
    heroImage: "https://cdn.torqueblock.com/torqueblock1-1.webp",
    contact: {
        phone: "+916366625625",
        phoneDisplay: "+91 6366 625 625",
        whatsapp: "916366625625",
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
    supportLinks: [
        { label: "Shipping Policy", href: "/support-and-policy/policy-shipping" },
        { label: "Return Policy", href: "/support-and-policy/policy-return" },
        { label: "Terms & Conditions", href: "/support-and-policy/policy-terms-and-condition" },
        { label: "Privacy Policy", href: "/support-and-policy/policy-privacy" },
    ],
    businessTypes: [
        "Tyre Retailer",
        "Workshop / Garage",
        "Authorised Service Centre",
        "Rental / Fleet",
        "Race Team / Track Day",
        "Distributor",
    ],
    gstRate: 0.18,
};

class SiteService {
    static getSettings() {
        return TRADE_SETTINGS;
    }
}

export default SiteService;
export const getSettings = SiteService.getSettings;
