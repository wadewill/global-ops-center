"use client";

import Link from "next/link";
import styles from "./WorkspaceHeader.module.css";

export type WorkspaceSection = "home" | "overview" | "diagnosis" | "connections" | "tasks";

const sections: { id: WorkspaceSection; label: string; href: string }[] = [
  { id: "home", label: "产品首页", href: "/" },
  { id: "overview", label: "工作概览", href: "/zh" },
  { id: "diagnosis", label: "目录诊断", href: "/zh?tab=diagnosis" },
  { id: "connections", label: "API 连接", href: "/zh?tab=connections" },
  { id: "tasks", label: "任务中心", href: "/zh/tasks" },
];

export default function WorkspaceHeader({ active, displayName, onSignOut }: {
  active: WorkspaceSection;
  displayName?: string;
  onSignOut?: () => void;
}) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo} aria-label="ListingScore 产品首页">
        <i aria-hidden="true">✦</i> ListingScore <small>中文</small>
      </Link>
      <nav className={styles.navigation} aria-label="工作空间导航">
        {sections.map(({ id, label, href }) => (
          <Link key={id} href={href} aria-current={active === id ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      <div className={styles.account}>
        {displayName && <span className={styles.name} title={displayName}>{displayName}</span>}
        {onSignOut && <button type="button" onClick={onSignOut}>退出</button>}
      </div>
    </header>
  );
}
