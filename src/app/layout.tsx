import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans, Inter, Poppins, Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});
// VIP homepage redesign — additive fonts, used explicitly via `font-poppins`/
// `font-inter` only in the restyled homepage/header/footer/number-card, so
// `font-sans`/`font-display` (and everything that already relies on them)
// stay exactly as they are.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-poppins",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

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
  themeColor: "#202A38",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${fraunces.variable} ${spaceMono.variable} ${poppins.variable} ${inter.variable}`}
    >
      <body className="min-h-screen font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
