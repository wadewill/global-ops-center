import type { Metadata } from "next";
import Link from "next/link";
import styles from "./navigation.module.css";

export const metadata: Metadata = {
  title: "ListingScore | English workspace",
  description: "Your private workspace for catalog diagnosis and remediation tasks.",
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <div lang="en"><nav aria-label="Language and product navigation" className={styles.navigation}><Link href="/">← Product home</Link><Link href="/zh" lang="zh-CN">中文工作空间 →</Link></nav>{children}</div>;
}
