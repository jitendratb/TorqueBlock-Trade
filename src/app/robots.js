import { siteUrl } from "@/api";

export default function robots() {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/cart", "/orders", "/account"],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}

