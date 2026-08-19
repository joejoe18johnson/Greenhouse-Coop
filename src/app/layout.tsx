import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { BRAND } from "@/lib/constants";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: "Greenhouse Co-Op | Premium Fruit Trees for Belize",
    template: "%s | Greenhouse Co-Op",
  },
  description:
    "Grafted, Air-Layered, And Selectively Bred Fruit Trees Grown For Belize Gardens. Shop Avocados, Mangoes, Citrus, And Tropical Specialties.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logos/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logos/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/logos/favicons/apple-touch-icon.png",
  },
  manifest: "/logos/favicons/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2D6A4F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
