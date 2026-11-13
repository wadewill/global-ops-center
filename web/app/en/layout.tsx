import type { Metadata } from "next";
import EnglishLayoutShell from "./EnglishLayoutShell";
import "./workspace.css";

export const metadata: Metadata = {
  title: "ListingScore | English workspace",
  description: "Your private workspace for catalog diagnosis and remediation tasks.",
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <EnglishLayoutShell>{children}</EnglishLayoutShell>;
}
