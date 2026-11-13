import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ListingScore | Workspace",
  description: "Your private workspace for catalog diagnosis and remediation tasks.",
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <div lang="en">{children}</div>;
}
