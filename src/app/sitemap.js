import { getSettings } from "@/services/SiteService";
import { getStock } from "@/services/CatalogService";
import { tyreHref } from "@/lib/catalog.utils";

export default async function sitemap() {
    const settings = getSettings();
    const baseUrl = settings.siteUrl;

    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/search`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/support-and-policy/policy-shipping`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${baseUrl}/support-and-policy/policy-return`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${baseUrl}/support-and-policy/policy-terms-and-condition`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${baseUrl}/support-and-policy/policy-privacy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
    ];

    try {
        const stock = await getStock();
        const products = stock?.products || [];

        const productRoutes = products
            .filter((p) => p.identifier)
            .map((p) => ({
                url: `${baseUrl}${tyreHref(p)}`,
                lastModified: new Date(),
                changeFrequency: "weekly",
                priority: 0.9,
            }));

        return [...staticRoutes, ...productRoutes];
    } catch {
        return staticRoutes;
    }
}
