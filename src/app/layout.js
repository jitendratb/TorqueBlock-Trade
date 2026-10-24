import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import AppProviders from "./AppProviders";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getSettings } from "@/services/SiteService";
import { getStock } from "@/services/CatalogService";
import LoginModal from "@/components/auth/LoginModal";
import OrderDrawer from "@/components/orders/OrderDrawer";
import { Toast } from "@/ui";

// Same font setup as the B2C store.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], display: "swap" });

export async function generateMetadata() {
  const settings = await getSettings();
  const name = settings.companyName;
  return {
    title: { default: `${name} Trade Portal - Live Stock & Trade Prices`, template: `%s | ${name} Trade` },
    description: settings.tagline,
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0B0F19]">
        <Script
          id="razorpay-checkout-script"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        <AppProviders settings={settings}>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer settings={settings} brands={stock.brands} />
          <OrderDrawer />
          <LoginModal />
          <Toast />
        </AppProviders>
      </body>
    </html>
  );
}
