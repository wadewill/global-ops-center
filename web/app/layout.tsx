import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ListingScore | Catalog pre-flight",
  description: "Find catalog data problems before products go live or enter paid channels."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
