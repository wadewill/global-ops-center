import type { Metadata } from "next";
import Link from "next/link";
import styles from "./navigation.module.css";
import "./workspace.css";

export const metadata: Metadata = {
  title: "ListingScore | English workspace",
  description: "Your private workspace for catalog diagnosis and remediation tasks.",
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <div lang="en" className="english-workspace"><div className={styles.utility}><span>ListingScore merchant services</span><Link href="/zh" lang="zh-CN">中文工作空间 →</Link></div><header className={styles.header}><Link href="/" className={styles.logo} aria-label="ListingScore product home"><b aria-hidden="true">LS</b><span>ListingScore<small>PRODUCT CHECKS · MERCHANT TOOLS</small></span></Link><nav aria-label="Language and product navigation" className={styles.navigation}><Link href="/">Product home</Link><Link href="/en" aria-current="page">My workspace</Link></nav></header>{children}</div>;
}
