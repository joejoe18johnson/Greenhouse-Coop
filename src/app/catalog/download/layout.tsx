import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Catalog",
  description: "Download or print the Greenhouse Co-Op nursery plant catalog.",
};

export default function CatalogDownloadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
