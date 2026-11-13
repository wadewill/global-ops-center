"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LocaleLink from "../../components/LocaleLink";
import styles from "./navigation.module.css";

export default function EnglishLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/en/product" || pathname === "/en/tasks") return <div lang="en">{children}</div>;
  return <div lang="en" className="english-workspace"><div className={styles.utility}><span>ListingScore merchant services</span><LocaleLink locale="zh-CN" /></div><header className={styles.header}><Link href="/en/product" className={styles.logo} aria-label="ListingScore product home"><b aria-hidden="true">LS</b><span>ListingScore<small>PRODUCT CHECKS · MERCHANT TOOLS</small></span></Link><nav aria-label="Product navigation" className={styles.navigation}><Link href="/en/product">Product home</Link><Link href="/en" aria-current="page">My workspace</Link><Link href="/en/tasks">Tasks</Link></nav></header>{children}</div>;
}
