import type { Metadata } from "next";
import MarketingHome from "../../../components/marketing/MarketingHome";

export const metadata: Metadata = {
  title: "ListingScore Merchant Services | Catalog Checks & Repair Tasks",
  description: "Check product data before listing. Find pricing, variant and identifier issues, and turn findings into repair tasks.",
  alternates: { languages: { "zh-CN": "/", en: "/en/product" } },
};

export default function EnglishProductHome() {
  return <MarketingHome locale="en" />;
}
