import { siteUrl } from "@/api";
import { POLICIES } from "@/constants/policies";
import { tyreHref } from "@/lib/catalog.utils";
import { getStock } from "@/services/CatalogService";

const entry = (path, changeFrequency, priority, lastModified) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
});

export default async function sitemap() {
    const now = new Date();

    const staticRoutes = [
        entry("", "daily", 1.0, now),
        entry("/search", "daily", 0.8, now),
        entry("/register", "monthly", 0.7, now),
        ...POLICIES.map((policy) => entry(policy.href, "monthly", 0.6, now)),
    ];

    // getStock never throws; when the backend is down the sitemap simply has no tyre pages.
    const { products = [] } = await getStock();
    const productRoutes = products
        .map((product) => tyreHref(product))
        .filter(Boolean)
        .map((href) => entry(href, "weekly", 0.9, now));

    return [...staticRoutes, ...productRoutes];
}
