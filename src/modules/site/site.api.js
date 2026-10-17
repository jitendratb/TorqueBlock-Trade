import { cache } from "react";
import { http } from "@/api/http";

// Rendered when the API is unreachable, so the portal shows a clear message instead of crashing.
// Next.js revalidates and recovers automatically once the API is back.
const UNAVAILABLE = {
    unavailable: true,
    companyName: "Torque Block",
    tagline: "Dealer supply of premium & value performance motorcycle tyres, delivered across India.",
    heroImage: "https://cdn.torqueblock.com/torqueblock1-1.webp",
    retailUrl: "https://www.torqueblock.com",
    contact: {
        phone: "+916366625625",
        phoneDisplay: "+91 6366 625 625",
        whatsapp: "916366625625",
        email: "ops@torqueblock.com",
        whatsappMessage: "Hi Torque Block! I'm a dealer and want to check stock and place an order.",
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
        { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/torque_block" },
        { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/torqueblock" },
        { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/@torqueblock" },
        { platform: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/torque-block" },
    ],
    supportLinks: [
        { label: "Shipping Policy", href: "https://www.torqueblock.com/shipping-policy" },
        { label: "Return Policy", href: "https://www.torqueblock.com/return-policy" },
        { label: "FAQ", href: "https://www.torqueblock.com/faq" },
        { label: "Terms & Conditions", href: "https://www.torqueblock.com/terms" },
        { label: "Privacy Policy", href: "https://www.torqueblock.com/privacy-policy" },
    ],
    businessTypes: ["Tyre Dealer", "Workshop / Garage", "Authorised Service Centre", "Rental / Fleet", "Race Team / Track Day", "Distributor"],
    gstRate: 0.18,
    orderPaymentMethod: "Razorpay",
};

// GET /trade/settings — company contact, hubs, socials, business types, GST rate, payment method.
// cache() dedupes the call within one render (layout + page + footer share one request).
export const getSettings = cache(async () => {
    try {
        const res = await http.get("/trade/settings", { revalidate: 300 });
        return res.data;
    } catch (error) {
        console.warn("[site] settings unavailable:", error.message);
        return UNAVAILABLE;
    }
});
