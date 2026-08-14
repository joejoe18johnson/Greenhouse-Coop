import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "Greenhouse Co-Op | Premium Fruit Trees for Belize",
    template: "%s | Greenhouse Co-Op",
  },
  description:
    "Grafted, air-layered, and seedling fruit trees grown for Belize gardens. Shop avocados, mangoes, citrus, and tropical specialties.",
  icons: { icon: "/favicon.png" },
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
