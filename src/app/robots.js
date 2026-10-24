import { getSettings } from "@/services/SiteService";

export default function robots() {
    const settings = getSettings();
    const baseUrl = settings.siteUrl;

    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/search", "/tyres/*", "/register"],
                disallow: ["/account", "/orders", "/api/*"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
