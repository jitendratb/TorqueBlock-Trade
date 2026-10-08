import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TradeProvider } from "@/context/TradeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import OrderDrawer from "@/components/trade/OrderDrawer";
import BusinessDetailsModal from "@/components/trade/BusinessDetailsModal";
import Toast from "@/components/trade/Toast";
import LoginModal from "@/components/trade/LoginModal";

// Same font setup as the B2C store.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://trade.torqueblock.com"),
  title: {
    default: "Torque Block Dealer Portal - Live Stock & Dealer Prices",
    template: "%s | Torque Block Dealers",
  },
  description:
    "Check live stock and dealer prices for premium and value performance motorcycle tyres, and order in one click with a GST invoice.",
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0B0F19]">
        <TradeProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <OrderDrawer />
          <BusinessDetailsModal />
          <Toast />
          <LoginModal />
        </TradeProvider>
      </body>
    </html>
  );
}
