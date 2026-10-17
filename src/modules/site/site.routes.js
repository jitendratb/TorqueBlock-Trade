export const NAV_LINKS = [
    { label: "Stock & Prices", href: "/" },
    // { label: "Dealer Registration", href: "/register" },
];

export const stockLink = (type, value) =>
    `/?${encodeURIComponent(type)}=${encodeURIComponent(value)}#stock`;
