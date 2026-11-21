// Helper functions to read product image URLs returned by the backend.

export function parseImageUrl(img) {
    if (!img) return "";

    if (typeof img === "string") {
        const url = img.trim();
        if (url.startsWith("//")) return `https:${url}`;
        return url;
    }

    if (typeof img === "object") {
        const directUrl = img.url || img.imageUrl || img.src || img.secure_url || img.heroImage || img.image;
        if (typeof directUrl === "string" && directUrl.trim()) {
            return parseImageUrl(directUrl);
        }

        // Some MongoDB docs store strings as { "0": "h", "1": "t", ... }
        const numberKeys = Object.keys(img)
            .filter((k) => k !== "_id" && !isNaN(k))
            .sort((a, b) => Number(a) - Number(b));

        if (numberKeys.length > 0) {
            const joined = numberKeys.map((k) => img[k]).join("").trim();
            if (joined) {
                return joined.startsWith("//") ? `https:${joined}` : joined;
            }
        }
    }

    return "";
}

export function extractProductImages(product, familyData = null) {
    const images = [];

    function add(item) {
        const url = parseImageUrl(item);
        if (url && !images.includes(url)) {
            images.push(url);
        }
    }

    // 1. Product images from /trade/stock

    add(product?.image);
    if (Array.isArray(product?.images)) product.images.forEach(add);
    if (Array.isArray(product?.productImages)) product.productImages.forEach(add);
    add(product?.hero?.heroImage);

    // 2. Family images from /intent/:identifier

    if (Array.isArray(familyData?.productImages)) familyData.productImages.forEach(add);
    add(familyData?.hero?.heroImage);
    add(familyData?.hero?.mobileHeroImage);
    if (Array.isArray(familyData?.gallery)) familyData.gallery.forEach(add);
    if (Array.isArray(familyData?.images)) familyData.images.forEach(add);

    // 3. Size-specific images from backend
    
    if (Array.isArray(familyData?.sizesIds)) {
        familyData.sizesIds.forEach((s) => {
            if (Array.isArray(s?.sizeSpecificImages)) s.sizeSpecificImages.forEach(add);
            add(s?.hero?.heroImage);
            add(s?.image);
        });
    }

    if (Array.isArray(product?.sizes)) {
        product.sizes.forEach((s) => {
            add(s?.image);
            if (Array.isArray(s?.images)) s.images.forEach(add);
            if (Array.isArray(s?.sizeSpecificImages)) s.sizeSpecificImages.forEach(add);
        });
    }

    return images;
}

export function extractOrderItemImage(item) {
    if (!item) return "";

    const possibleImages = [
        item.image,
        item.productId?.availableTyres?.hero?.heroImage,
        ...(Array.isArray(item.productId?.availableTyres?.productImages) ? item.productId.availableTyres.productImages : []),
        ...(Array.isArray(item.productId?.sizeSpecificImages) ? item.productId.sizeSpecificImages : []),
        item.productId?.hero?.heroImage,
        ...(Array.isArray(item.productId?.availableTyres?.gallery) ? item.productId.availableTyres.gallery : []),
        item.tubeId?.images?.[0],
    ];

    for (const candidate of possibleImages) {
        const url = parseImageUrl(candidate);
        if (url) return url;
    }

    return "";
}
