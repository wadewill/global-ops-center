"use client";

import Link from "next/link";
import { taskLoginHref } from "../workspace-navigation";
import styles from "./WorkspaceHeader.module.css";

export type WorkspaceSection = "home" | "overview" | "diagnosis" | "connections" | "tasks";

const sections: { id: WorkspaceSection; label: string; href: string }[] = [
  { id: "home", label: "产品首页", href: "/" },
  { id: "overview", label: "个人中心", href: "/zh" },
  { id: "diagnosis", label: "目录诊断", href: "/zh?tab=diagnosis" },
  { id: "connections", label: "API 连接", href: "/zh?tab=connections" },
  { id: "tasks", label: "任务中心", href: "/zh/tasks" },
];

export default function WorkspaceHeader({ active, displayName, onSignOut }: {
  active: WorkspaceSection;
  displayName?: string;
  onSignOut?: () => void;
}) {
  const loginHref = active === "tasks" ? taskLoginHref : active === "diagnosis" || active === "connections" ? `/zh?tab=${active}&mode=login` : "/zh?mode=login";
  return (
    <header className={styles.header}>
      <div className={styles.utility}><div><span>ListingScore 商家服务</span><nav aria-label="快捷导航"><Link href="/">返回产品首页</Link><Link href="/#help">帮助中心</Link><Link href="/en">English</Link></nav></div></div>
      <div className={styles.masthead}>
        <Link href="/" className={styles.logo} aria-label="ListingScore 产品首页"><b aria-hidden="true">LS</b><span>ListingScore<small>商品检查 · 运营工具</small></span></Link>
        <span className={styles.caption}>商家个人中心</span>
        <div className={styles.account}>
          {displayName && <span className={styles.name} title={displayName}>{displayName}</span>}
          {onSignOut ? <button type="button" onClick={onSignOut}>退出</button> : <Link href={loginHref}>登录 / 注册</Link>}
        </div>
      </div>
      <nav className={styles.navigation} aria-label="工作空间导航">
        <div>
        {sections.map(({ id, label, href }) => (
          <Link key={id} href={href} aria-current={active === id ? "page" : undefined}>
            {label}
          </Link>
        ))}
        </div>
      </nav>
    </header>
  );
}
