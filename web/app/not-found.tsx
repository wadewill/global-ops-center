"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import styles from "./not-found.module.css";

export default function NotFound() {
  const pathname = usePathname();
  const en = pathname === "/en" || pathname.startsWith("/en/");
  const title = en ? "Page not found" : "页面不存在";

  useEffect(() => {
    document.title = `${title} | ListingScore`;
  }, [title]);

  return <main className={styles.page} lang={en ? "en" : "zh-CN"}>
    <Link className={styles.brand} href={en ? "/en/product" : "/"}>ListingScore</Link>
    <div className={styles.card}>
      <span className={styles.code}>404</span>
      <h1>{title}</h1>
      <p>{en ? "This address is unavailable. Return to the product home or open your workspace." : "当前地址不可用。你可以返回产品首页，或进入工作空间继续操作。"}</p>
      <nav aria-label={en ? "Return navigation" : "返回导航"}>
        <Link className={styles.primary} href={en ? "/en/product" : "/"}>{en ? "Product home" : "返回产品首页"}</Link>
        <Link href={en ? "/en" : "/zh"}>{en ? "My workspace" : "进入个人中心"}</Link>
      </nav>
    </div>
  </main>;
}
