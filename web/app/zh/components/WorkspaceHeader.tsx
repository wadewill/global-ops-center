"use client";

import Link from "next/link";
import LocaleLink from "../../../components/LocaleLink";
import type { Locale } from "../../../lib/locale-routes";
import styles from "./WorkspaceHeader.module.css";

export type WorkspaceSection = "home" | "overview" | "diagnosis" | "connections" | "tasks";

export default function WorkspaceHeader({ active, displayName, onSignOut, locale = "zh-CN" }: {
  active: WorkspaceSection;
  displayName?: string;
  onSignOut?: () => void;
  locale?: Locale;
}) {
  const en = locale === "en";
  const base = en ? "/en" : "/zh";
  const home = en ? "/en/product" : "/";
  const t = (zh: string, english: string) => en ? english : zh;
  const sections: { id: WorkspaceSection; label: string; href: string }[] = [
    { id: "home", label: t("产品首页", "Home"), href: home },
    { id: "overview", label: t("个人中心", "Workspace"), href: base },
    { id: "diagnosis", label: t("目录诊断", "Diagnosis"), href: `${base}?tab=diagnosis` },
    { id: "connections", label: t("API 连接", "API links"), href: `${base}?tab=connections` },
    { id: "tasks", label: t("任务中心", "Tasks"), href: `${base}/tasks` },
  ];
  const loginHref = active === "tasks" ? `${base}?mode=login&next=${encodeURIComponent(`${base}/tasks`)}` : active === "diagnosis" || active === "connections" ? `${base}?tab=${active}&mode=login` : `${base}?mode=login`;
  return <header className={styles.header}>
    <div className={styles.utility}><div><span>{t("ListingScore 商家服务", "ListingScore merchant services")}</span><nav aria-label={t("快捷导航", "Quick navigation")}><Link href={home}>{t("返回产品首页", "Product home")}</Link><Link href={`${home}#help`}>{t("帮助中心", "Help")}</Link><LocaleLink locale={en ? "zh-CN" : "en"} /></nav></div></div>
    <div className={styles.masthead}>
      <Link href={home} className={styles.logo} aria-label={t("ListingScore 产品首页", "ListingScore product home")}><b aria-hidden="true">LS</b><span>ListingScore<small>{t("商品检查 · 运营工具", "PRODUCT CHECKS · MERCHANT TOOLS")}</small></span></Link>
      <span className={styles.caption}>{t("商家个人中心", "Merchant workspace")}</span>
      <div className={styles.account}>{displayName && <span className={styles.name} title={displayName}>{displayName}</span>}{onSignOut ? <button type="button" onClick={onSignOut}>{t("退出", "Sign out")}</button> : <Link href={loginHref}>{t("登录 / 注册", "Sign in / Register")}</Link>}</div>
    </div>
    <nav className={styles.navigation} aria-label={t("工作空间导航", "Workspace navigation")}><div>{sections.map(({ id, label, href }) => <Link key={id} href={href} aria-current={active === id ? "page" : undefined}>{label}</Link>)}</div></nav>
  </header>;
}
