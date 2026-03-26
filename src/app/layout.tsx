import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sugar Beauty Lounge — Premium Beauty in Dubai",
  description:
    "Luxury beauty services across Dubai. Hair, nails, facials, waxing, lashes and more. Book online at Mall of the Emirates, Dubai Sports City or Abu Dhabi.",
  keywords: "beauty salon Dubai, nail salon Dubai, hair salon Dubai, waxing Dubai, facials Dubai",
  openGraph: {
    title: "Sugar Beauty Lounge",
    description: "Premium beauty services in Dubai. Book online.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
