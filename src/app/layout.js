import Script from "next/script";
import { LoginModal } from "@/components/auth";
import { OrderDrawer } from "@/components/orders";
import { Footer, Header, MobileTabBar } from "@/components/site";
import { Toast } from "@/components/ui";
import { getSettings } from "@/constants/site";
import { getStock } from "@/services/CatalogService";
import AppProviders from "./AppProviders";
import "./globals.css";

const title = "Torque Block Trade | Motorcycle Tyres for Your Business";
const description =
    "Find the right motorcycle tyres, check stock availability and access business pricing. Order online with ease, with delivery across India.";

export const viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#0B0F19",
};

export async function generateMetadata() {
    return {
        metadataBase: new URL(getSettings().siteUrl),
        title,
        description,
        openGraph: {
            title,
            description,
            url: "/",
            siteName: "Torque Block Trade",
            type: "website",
            locale: "en_IN",
        },
        twitter: { card: "summary_large_image", title, description },
        icons: {
            icon: [
                { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
                { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
                { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
                { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
            ],
            shortcut: "/favicon.ico",
            apple: [{ url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" }],
        },
    };
}

export default async function RootLayout({ children }) {
    const [settings, stock] = await Promise.all([getSettings(), getStock()]);

    return (
        <html lang="en" className="h-full antialiased">
            <body className="min-h-full flex flex-col bg-[#0B0F19]">
                <Script
                    id="razorpay-checkout-script"
                    src="https://checkout.razorpay.com/v1/checkout.js"
                    strategy="lazyOnload"
                />
                <AppProviders settings={settings}>
                    <Header />
                    <div className="flex-1">{children}</div>
                    <Footer settings={settings} brands={stock.brands} />
                    <MobileTabBar />
                    <OrderDrawer />
                    <LoginModal />
                    <Toast />
                </AppProviders>
            </body>
        </html>
    );
}
