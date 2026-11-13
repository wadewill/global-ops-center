"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LocaleLink from "../LocaleLink";
import { apiRequest, localizedError, type AppLocale } from "../../lib/localized-api";
import { clearFieldValidity, localizeInvalidField } from "../../lib/localized-forms";
import { localeHref } from "../../lib/locale-routes";

type User = { id: string; email: string; displayName: string; role: string };

export default function WorkspaceAuth({ locale, loginFirst, onSuccess }: {
  locale: AppLocale;
  loginFirst: boolean;
  onSuccess: (token: string, user: User) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = !loginFirst;
  const en = locale === "en";
  const base = en ? "/en" : "/zh";
  const t = (zh: string, english: string) => en ? english : zh;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  function changeMode() {
    const safeHref = localeHref(base, searchParams.toString(), locale);
    const query = new URLSearchParams(safeHref.split("?")[1]);
    query.set("mode", register ? "login" : "register");
    setError("");
    router.replace(`${base}?${query}`, { scroll: false });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest<{ accessToken: string; user: User }>(locale, `/api/v1/auth/${register ? "register" : "login"}`, undefined, {
        method: "POST", signal: controller.signal,
        body: JSON.stringify({ email: email.trim(), password, displayName: register ? name.trim() : undefined }),
      });
      if (!controller.signal.aborted) onSuccess(result.accessToken, result.user);
    } catch (cause) {
      if (!controller.signal.aborted) setError(localizedError(cause, locale));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return <main className="zh-auth" lang={locale}>
    <section className="zh-auth-hero">
      <Link href={en ? "/en/product" : "/"} className="zh-logo"><i aria-hidden="true">LS</i> ListingScore</Link>
      <div>
        <p>{t("商家服务 · 我的工作空间", "MERCHANT SERVICES · MY WORKSPACE")}</p>
        <h1>{t("商品先检查，", "Check before listing.")}<br />{en && " "}{t("上架更从容。", "Save the rework.")}</h1>
        <span>{t("查看商品数据问题和修复建议，保存诊断报告，逐项跟进处理进度。", "Find catalog issues and suggested fixes, save your reports, and track each repair.")}</span>
      </div>
      <small>{t("其他语言：", "Other language: ")}<LocaleLink locale={en ? "zh-CN" : "en"} /></small>
    </section>
    <section className="zh-auth-form">
      <form onSubmit={submit} onInvalid={event => {
        localizeInvalidField(event.target, locale);
        if (event.target instanceof HTMLInputElement && event.target.type === "password" && event.target.validity.patternMismatch) {
          event.target.setCustomValidity(t("密码必须同时包含字母和数字。", "Password must include letters and numbers."));
        }
      }} onInput={event => clearFieldValidity(event.target)}>
        <p>{register ? t("创建工作空间", "CREATE YOUR WORKSPACE") : t("欢迎回来", "WELCOME BACK")}</p>
        <h2>{register ? t("开始使用 ListingScore", "Get started with ListingScore") : t("登录你的工作空间", "Sign in to your workspace")}</h2>
        {register && <label htmlFor="auth-name">{t("姓名或团队名称", "Name or team name")}
          <input id="auth-name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} required minLength={2} maxLength={80} placeholder={t("例如：我的运营团队", "e.g. My operations team")} />
        </label>}
        <label htmlFor="auth-email">{t("邮箱", "Email")}
          <input id="auth-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} placeholder="name@company.com" />
        </label>
        <label htmlFor="auth-password">{t("密码", "Password")}
          <input id="auth-password" type="password" autoComplete={register ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} required minLength={12} maxLength={72} pattern="(?=.*[A-Za-z])(?=.*[0-9]).+" aria-describedby="auth-password-hint" placeholder={t("12–72 位，包含字母和数字", "12–72 characters, letters and numbers")} />
          <small id="auth-password-hint">{register ? t("密码须为 12–72 位，包含字母和数字。注册受频率保护。", "Use 12–72 characters with letters and numbers. Registration is rate limited.") : t("请输入注册时设置的密码。", "Enter the password you used to register.")}</small>
        </label>
        {error && <div className="zh-error" role="alert">{error}</div>}
        <button type="submit" className="zh-primary" disabled={busy}>{busy ? t("处理中…", "Please wait…") : register ? t("创建并进入工作空间", "Create workspace") : t("登录", "Sign in")}</button>
        <button type="button" className="zh-switch" disabled={busy} onClick={changeMode}>{register ? t("已有账号？去登录", "Already have an account? Sign in") : t("还没有账号？创建工作空间", "New here? Create a workspace")}</button>
      </form>
    </section>
  </main>;
}
