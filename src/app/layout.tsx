import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jiovipnumber.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JioVIPNumber.com — Buy Premium VIP Mobile Numbers",
    template: "%s | JioVIPNumber.com",
  },
  description:
    "India's trusted marketplace for premium, fancy and VIP mobile numbers. Search by pattern, price, state and circle. Verified sellers, secure booking.",
  keywords: [
    "VIP number",
    "fancy number",
    "Jio VIP number",
    "premium mobile number",
    "buy VIP number",
    "mirror number",
  ],
  openGraph: {
    type: "website",
    siteName: "JioVIPNumber.com",
    url: siteUrl,
    title: "JioVIPNumber.com — Buy Premium VIP Mobile Numbers",
    description:
      "India's trusted marketplace for premium, fancy and VIP mobile numbers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JioVIPNumber.com",
    description: "Buy premium VIP mobile numbers from verified sellers.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
