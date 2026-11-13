"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import WorkspaceHeader from "../../app/zh/components/WorkspaceHeader";
import { workspaceTab } from "../../app/zh/workspace-navigation";
import { ApiError, apiRequest, downloadApiFile, localizedError, type AppLocale } from "../../lib/localized-api";
import { clearFieldValidity, localizeInvalidField } from "../../lib/localized-forms";
import { fieldLabel, workspaceLabel } from "../../lib/workspace-labels";
import { localeHref } from "../../lib/locale-routes";
import WorkspaceAuth from "./WorkspaceAuth";
import "../../app/zh/zh.css";

export type User = { id: string; email: string; displayName: string; role: string };
type Severity = "BLOCKER" | "HIGH" | "MEDIUM" | "OPPORTUNITY";
type Issue = { rowNumber: number; sku: string; ruleId: string; severity: Severity; field: string; message: string; repairAction: string };
type Report = { importId: string; sourceName: string; totalRows: number; catalogScore: number; createdAt: string };
type Result = { importId: string; sourceName: string; totalRows: number; catalogScore: number; summary: { blockers: number; high: number; medium: number; opportunities: number }; issues: Issue[] };
type Connection = { id: string; platform: string; label: string; authType: string; endpointUrl?: string; status: string; lastCheckedAt?: string };
type Copy = (zh: string, en: string) => string;
const translate = (locale: AppLocale): Copy => (zh, en) => locale === "zh-CN" ? zh : en;
const severityOrder: Severity[] = ["BLOCKER", "HIGH", "MEDIUM", "OPPORTUNITY"];
const reportIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function usePendingRequests() {
  const active = useRef(true);
  const pending = useRef(new Set<AbortController>());
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; pending.current.forEach(controller => controller.abort()); pending.current.clear(); };
  }, []);
  function begin() { const controller = new AbortController(); pending.current.add(controller); return controller; }
  function finish(controller: AbortController) { pending.current.delete(controller); }
  return { active, begin, finish };
}

export default function Workspace({ locale }: { locale: AppLocale }) {
  const t = translate(locale);
  return <Suspense fallback={<><WorkspaceHeader locale={locale} active="overview" /><main className="zh-shell"><div className="zh-content zh-loading" role="status">{t("正在加载工作空间…", "Loading workspace…")}</div></main></>}><WorkspaceContent locale={locale} /></Suspense>;
}

function WorkspaceContent({ locale }: { locale: AppLocale }) {
  const t = translate(locale);
  const base = locale === "zh-CN" ? "/zh" : "/en";
  const router = useRouter();
  const params = useSearchParams();
  const section = workspaceTab(params.get("tab"));
  const requestedReturn = params.get("next");
  const returnTo = requestedReturn && [base, `${base}?tab=diagnosis`, `${base}?tab=connections`, `${base}/tasks`].includes(requestedReturn) ? requestedReturn : null;
  const requestedReport = params.get("report");
  const reportId = section === "diagnosis" && requestedReport && reportIdPattern.test(requestedReport) ? requestedReport : null;
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [dataError, setDataError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => { setToken(localStorage.getItem("listingscore-token")); setReady(true); }, []);
  useEffect(() => {
    if (!token) return;
    let current = true;
    const controller = new AbortController();
    setSessionError(""); setDataError("");
    async function load() {
      try {
        const me = await apiRequest<User>(locale, "/api/v1/auth/me", token!, { signal: controller.signal });
        if (!current) return;
        setUser(me);
        const [history, linked] = await Promise.allSettled([
          apiRequest<Report[]>(locale, "/api/v1/imports", token!, { signal: controller.signal }),
          apiRequest<Connection[]>(locale, "/api/v1/connections", token!, { signal: controller.signal }),
        ]);
        if (!current) return;
        if ([history, linked].some(result => result.status === "rejected" && result.reason instanceof ApiError && result.reason.status === 401)) { signOut(); return; }
        if (history.status === "fulfilled") setReports(history.value);
        if (linked.status === "fulfilled") setConnections(linked.value);
        if (history.status === "rejected" || linked.status === "rejected") setDataError(t("部分工作空间数据未能加载，请重试。", "Some workspace data could not be loaded. Please retry."));
      } catch (cause) {
        if (!current) return;
        if (cause instanceof ApiError && cause.status === 401) signOut();
        else setSessionError(t("暂时无法读取账号信息，请重试。你的登录状态已保留。", "Your account could not be loaded. Your session has been kept; please retry."));
      }
    }
    void load();
    return () => { current = false; controller.abort(); };
  }, [token, reload, locale]);
  useEffect(() => { if (token && user && returnTo) router.replace(returnTo); }, [token, user, returnTo, router]);
  useEffect(() => {
    if (!ready || (token && !user)) return;
    const page = !token || !user ? (params.get("mode") === "login" ? t("登录", "Sign in") : t("注册", "Register")) : section === "connections" ? t("API 连接", "API connections") : section === "diagnosis" ? (reportId ? t("诊断报告", "Catalog report") : t("目录诊断", "Catalog diagnosis")) : t("个人中心", "My workspace");
    document.title = `ListingScore | ${page}`;
  }, [ready, token, user, section, reportId, locale, params]);

  function signOut() {
    localStorage.removeItem("listingscore-token");
    setToken(null); setUser(null); setReports([]); setConnections([]); setSessionError(""); setDataError("");
    const query = new URLSearchParams(params.toString());
    query.set("mode", "login");
    router.replace(localeHref(base, query.toString(), locale), { scroll: false });
  }
  function onSuccess(nextToken: string, nextUser: User) {
    localStorage.setItem("listingscore-token", nextToken);
    setToken(nextToken); setUser(nextUser);
  }
  const active = returnTo === `${base}/tasks` ? "tasks" : section;
  const header = <WorkspaceHeader locale={locale} active={active} loginReturnTo={returnTo ?? undefined} displayName={user?.displayName} onSignOut={token && user ? signOut : undefined} />;
  if (sessionError && token) return <>{header}<main className="zh-shell"><div className="zh-content"><section className="zh-panel zh-session-error"><p role="alert">{sessionError}</p><button className="zh-primary" onClick={() => setReload(value => value + 1)}>{t("重新加载", "Retry loading")}</button></section></div></main></>;
  if (!ready || (token && !user) || (token && user && returnTo)) return <>{header}<main className="zh-shell"><div className="zh-content zh-loading" role="status">{t("正在加载工作空间…", "Loading workspace…")}</div></main></>;
  if (!token || !user) return <>{header}<WorkspaceAuth key={`${locale}-${params.get("mode")}`} locale={locale} loginFirst={params.get("mode") === "login"} onSuccess={onSuccess} /></>;
  return <>{header}<main className="zh-shell" lang={locale}><section className="zh-content">
    {dataError && <div className="zh-error zh-data-error" role="alert">{dataError}<button type="button" onClick={() => setReload(value => value + 1)}>{t("重新加载", "Retry loading")}</button></div>}
    {section === "overview" && <Overview locale={locale} reports={reports} connections={connections} />}
    {section === "diagnosis" && <Diagnosis key={`${locale}-${reportId ?? "new"}`} locale={locale} token={token} reportId={reportId} onReport={report => setReports(current => [report, ...current.filter(item => item.importId !== report.importId)])} onUnauthorized={signOut} />}
    {section === "connections" && <Connections key={locale} locale={locale} token={token} items={connections} setItems={setConnections} onUnauthorized={signOut} />}
  </section></main></>;
}

function Overview({ locale, reports, connections }: { locale: AppLocale; reports: Report[]; connections: Connection[] }) {
  const t = translate(locale);
  const base = locale === "zh-CN" ? "/zh" : "/en";
  const score = reports[0]?.catalogScore;
  const average = reports.length ? Math.round(reports.reduce((sum, item) => sum + item.catalogScore, 0) / reports.length) : "—";
  return <>
    <section className="zh-hero"><div><p>{t("商品运营控制台", "MERCHANT WORKSPACE")}</p><h1>{t("检查商品问题，逐项推进修复", "Find catalog issues. Track every repair.")}</h1><span>{t("查看诊断报告、处理修复任务，并安全管理平台连接配置。原生平台同步仍在规划中。", "Review catalog reports, track repair tasks and safely manage connection settings. Native platform sync is still planned.")}</span><div className="zh-hero-actions"><Link className="zh-primary" href={`${base}?tab=connections`}>{t("管理 API 连接 →", "Manage API connections →")}</Link><Link className="zh-secondary" href={`${base}/tasks`}>{t("查看修复任务", "View repair tasks")}</Link><Link className="zh-secondary" href={`${base}?tab=diagnosis`}>{t("使用 CSV 快速诊断", "Run a CSV check")}</Link></div></div><div className="zh-score"><b>{score ?? "—"}</b><span>/ 100<br />{t("最近一次评分", "Latest catalog score")}</span></div></section>
    <div className="zh-metrics"><Metric title={t("已完成诊断", "Diagnoses run")} value={String(reports.length)} note={t("历史报告私密保存", "Reports saved privately")} /><Metric title={t("平均健康分", "Average quality score")} value={String(average)} note={t("基于历史诊断", "Across saved diagnoses")} /><Metric title={t("已保存连接", "Saved connections")} value={String(connections.length)} note={t("API 凭据加密保存", "Credentials stored encrypted")} /></div>
    <section className="zh-panel"><div className="zh-title"><div><p>{t("最近活动", "RECENT ACTIVITY")}</p><h2>{t("目录诊断报告", "Catalog reports")}</h2></div><Link className="zh-text-link" href={`${base}?tab=diagnosis`}>{t("新建诊断", "New diagnosis")}</Link></div>
      {reports.length ? reports.map(item => <div className="zh-report" key={item.importId}><div><Link className="zh-report-link" href={`${base}?tab=diagnosis&report=${encodeURIComponent(item.importId)}`}>{item.sourceName}</Link><span>{item.totalRows} {t("个商品", "products")} · {new Date(item.createdAt).toLocaleDateString(locale)}</span></div><b>{item.catalogScore}</b><small>{t("质量分", "quality score")}</small><Link className="zh-text-link" href={`${base}?tab=diagnosis&report=${encodeURIComponent(item.importId)}`} aria-label={`${t("查看报告", "View report")}: ${item.sourceName}`}>{t("查看报告 →", "View report →")}</Link></div>) : <div className="zh-empty"><b>{t("还没有诊断报告", "No diagnoses yet")}</b><span>{t("使用 CSV 辅助入口检查商品数据，生成问题清单和修复任务。", "Use the CSV check to find product data issues and create repair tasks.")}</span><Link className="zh-inline-button" href={`${base}?tab=diagnosis`}>{t("使用 CSV 快速诊断", "Run a CSV check")}</Link></div>}
    </section>
  </>;
}

function Metric({ title, value, note }: { title: string; value: string; note: string }) {
  return <article className="zh-metric"><span>{title}</span><b>{value}</b><small>{note}</small></article>;
}

function Connections({ locale, token, items, setItems, onUnauthorized }: { locale: AppLocale; token: string; items: Connection[]; setItems: React.Dispatch<React.SetStateAction<Connection[]>>; onUnauthorized: () => void }) {
  const t = translate(locale);
  const requests = usePendingRequests();
  const [label, setLabel] = useState("");
  const [platform, setPlatform] = useState("SHOPIFY");
  const [authType, setAuthType] = useState("ACCESS_TOKEN");
  const [endpoint, setEndpoint] = useState("");
  const [credential, setCredential] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Connection | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  function handleError(cause: unknown) {
    if (cause instanceof ApiError && cause.status === 401) onUnauthorized();
    else setNotice({ kind: "error", text: localizedError(cause, locale) });
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    const controller = requests.begin();
    setBusy(true); setNotice(null);
    try {
      const created = await apiRequest<Connection>(locale, "/api/v1/connections", token, { method: "POST", signal: controller.signal, body: JSON.stringify({ platform, label: label.trim(), authType, endpointUrl: endpoint.trim() || undefined, credential }) });
      if (!requests.active.current || controller.signal.aborted) return;
      setItems(current => [created, ...current]); setLabel(""); setEndpoint(""); setCredential("");
      setNotice({ kind: "success", text: t("连接配置已保存，凭据已加密。尚未执行平台连通性验证或商品同步。", "Connection settings saved and credentials encrypted. Platform connectivity and product sync have not been performed.") });
    } catch (cause) { if (requests.active.current && !controller.signal.aborted) handleError(cause); }
    finally { requests.finish(controller); if (requests.active.current) setBusy(false); }
  }
  async function verify(item: Connection) {
    if (actionId) return;
    const controller = requests.begin();
    setActionId(item.id); setNotice(null);
    try {
      const updated = await apiRequest<Connection>(locale, `/api/v1/connections/${item.id}/verify`, token, { method: "POST", signal: controller.signal });
      if (!requests.active.current || controller.signal.aborted) return;
      setItems(current => current.map(value => value.id === item.id ? updated : value));
      setNotice({ kind: "success", text: t("已标记配置检查完成。此操作仅更新检查记录，未测试平台连通性或执行同步。", "Configuration marked as checked. This only updates the review record; it does not test platform connectivity or run a sync.") });
    } catch (cause) { if (requests.active.current && !controller.signal.aborted) handleError(cause); }
    finally { requests.finish(controller); if (requests.active.current) setActionId(null); }
  }
  async function remove(item: Connection) {
    if (actionId) return;
    const controller = requests.begin();
    setActionId(item.id); setNotice(null);
    try {
      await apiRequest(locale, `/api/v1/connections/${item.id}`, token, { method: "DELETE", signal: controller.signal });
      if (!requests.active.current || controller.signal.aborted) return;
      setItems(current => current.filter(value => value.id !== item.id)); setDeleting(null);
      setNotice({ kind: "success", text: t("连接配置已删除。", "Connection settings removed.") });
    } catch (cause) { if (requests.active.current && !controller.signal.aborted) handleError(cause); }
    finally { requests.finish(controller); if (requests.active.current) setActionId(null); }
  }
  return <>
    <section className="zh-page-title"><p>{t("API 连接", "API CONNECTIONS")}</p><h1>{t("集中管理平台连接配置", "Manage your platform connection settings")}</h1><span>{t("当前支持安全保存 Shopify 和自定义 REST API 的连接信息。原生授权、连通性验证、商品拉取和定时同步仍在规划中。", "Securely store Shopify and custom REST API connection settings. Native authorization, connectivity checks, product imports and scheduled sync are still planned.")}</span><div className="zh-roadmap"><b>{t("后续平台：", "Planned platforms: ")}</b>{["AMAZON_SELLER", "WALMART", "GOOGLE_MERCHANT"].map(value => <span key={value}>{workspaceLabel(value, locale)}</span>)}</div></section>
    {notice && <div className={notice.kind === "success" ? "zh-success" : "zh-error"} role={notice.kind === "success" ? "status" : "alert"}>{notice.text}</div>}
    <div className="zh-connection-layout"><section className="zh-panel"><div className="zh-title"><div><p>{t("连接列表", "CONNECTION SETTINGS")}</p><h2>{t("已保存的连接", "Saved connections")}</h2></div><span className="zh-count">{items.length}</span></div>
      {items.length ? items.map(item => <div className="zh-connection" key={item.id}><b aria-hidden="true">{item.platform === "SHOPIFY" ? "S" : "A"}</b><div className="zh-connection-info"><strong>{item.label}</strong><span>{workspaceLabel(item.platform, locale)} · {workspaceLabel(item.authType, locale)}</span>{item.endpointUrl && <span className="zh-endpoint">{item.endpointUrl}</span>}{item.lastCheckedAt && <span>{t("配置检查记录：", "Configuration reviewed: ")}{new Date(item.lastCheckedAt).toLocaleDateString(locale)}</span>}</div><small>{item.status === "VERIFIED" ? t("已标记配置检查", "Marked as checked") : workspaceLabel(item.status, locale)}</small><div className="zh-connection-actions"><button type="button" className="zh-text-link" disabled={Boolean(actionId)} onClick={() => verify(item)}>{actionId === item.id ? t("处理中…", "Working…") : t("标记配置检查", "Mark as checked")}</button><button type="button" className="zh-text-link zh-danger-link" disabled={Boolean(actionId)} onClick={() => setDeleting(item)} aria-label={`${t("删除连接", "Remove connection")}: ${item.label}`}>{t("删除", "Remove")}</button></div></div>) : <div className="zh-empty"><b>{t("尚未保存连接", "No saved connections")}</b><span>{t("添加连接配置后，可在这里管理凭据和检查记录。商品诊断仍通过 CSV 辅助入口进行。", "Save a connection to manage its settings and review records here. Catalog checks currently use the CSV input.")}</span></div>}
      {deleting && <section className="zh-remove-confirm" role="alertdialog" aria-labelledby="remove-connection-title" aria-describedby="remove-connection-description" onKeyDown={event => { if (event.key === "Escape" && !actionId) setDeleting(null); }}><h3 id="remove-connection-title">{t("删除这条连接配置？", "Remove this connection?")}</h3><p id="remove-connection-description">{t("将删除已保存的配置和凭据，无法撤销。不会修改原平台商品。", "The saved settings and credential will be permanently removed. Products on the original platform will not be changed.")}<strong>{deleting.label}</strong></p><div><button type="button" className="zh-secondary" disabled={Boolean(actionId)} onClick={() => setDeleting(null)} autoFocus>{t("取消", "Cancel")}</button><button type="button" className="zh-primary" disabled={Boolean(actionId)} onClick={() => remove(deleting)}>{actionId ? t("正在删除…", "Removing…") : t("确认删除", "Remove connection")}</button></div></section>}
    </section><form className="zh-panel zh-connect-form" onSubmit={save} onInvalid={event => localizeInvalidField(event.target, locale)} onInput={event => clearFieldValidity(event.target)}><p>{t("添加连接", "ADD CONNECTION")}</p><label>{t("平台", "Platform")}<select value={platform} disabled={busy} onChange={event => setPlatform(event.target.value)}><option value="SHOPIFY">Shopify</option><option value="CUSTOM_API">{t("自定义 REST API", "Custom REST API")}</option></select></label><label>{t("连接名称", "Connection name")}<input value={label} required maxLength={100} disabled={busy} onChange={event => setLabel(event.target.value)} placeholder={t("例如：美国 Shopify 店铺", "e.g. US Shopify store")} /></label><label>{t("认证方式", "Authentication type")}<select value={authType} disabled={busy} onChange={event => setAuthType(event.target.value)}>{["ACCESS_TOKEN", "API_KEY", "BEARER_TOKEN"].map(value => <option value={value} key={value}>{workspaceLabel(value, locale)}</option>)}</select></label><label>{t("API 地址（选填）", "API endpoint (optional)")}<input type="url" value={endpoint} maxLength={500} disabled={busy} onChange={event => setEndpoint(event.target.value)} placeholder="https://api.example.com" /><small>{t("如填写，必须使用 HTTPS 地址。保存时不会请求此地址。", "If provided, use an HTTPS URL. Saving does not call this endpoint.")}</small></label><label>{t("访问令牌或 API 密钥", "Access token or API key")}<textarea value={credential} required maxLength={4096} disabled={busy} onChange={event => setCredential(event.target.value)} placeholder={t("保存后会立即加密，页面不会回显", "Encrypted after saving and never shown again")} /></label><button className="zh-primary" disabled={busy}>{busy ? t("正在安全保存…", "Saving securely…") : t("保存加密连接", "Save encrypted connection")}</button></form></div>
  </>;
}

function Diagnosis({ locale, token, reportId, onReport, onUnauthorized }: { locale: AppLocale; token: string; reportId: string | null; onReport: (report: Report) => void; onUnauthorized: () => void }) {
  const t = translate(locale);
  const requests = usePendingRequests();
  const base = locale === "zh-CN" ? "/zh" : "/en";
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [level, setLevel] = useState<"ALL" | Severity>("ALL");
  const [reload, setReload] = useState(0);
  const shown = useMemo(() => result?.issues.filter(issue => level === "ALL" || issue.severity === level) ?? [], [result, level]);

  useEffect(() => {
    if (!reportId) return;
    const controller = new AbortController();
    let current = true;
    setBusy(true); setError(""); setResult(null);
    apiRequest<Result>(locale, `/api/v1/imports/${reportId}`, token, { signal: controller.signal })
      .then(value => { if (current) setResult(value); })
      .catch(cause => { if (current) handleError(cause); })
      .finally(() => { if (current) setBusy(false); });
    return () => { current = false; controller.abort(); };
  }, [reportId, token, locale, reload]);

  function handleError(cause: unknown) {
    if (cause instanceof ApiError && cause.status === 401) onUnauthorized();
    else setError(localizedError(cause, locale));
  }
  async function upload() {
    if (!file || busy) return;
    const controller = requests.begin();
    setBusy(true); setError("");
    try {
      const data = new FormData(); data.append("file", file);
      const next = await apiRequest<Result>(locale, "/api/v1/imports", token, { method: "POST", body: data, signal: controller.signal });
      if (!requests.active.current || controller.signal.aborted) return;
      setResult(next); setLevel("ALL");
      onReport({ importId: next.importId, sourceName: next.sourceName, totalRows: next.totalRows, catalogScore: next.catalogScore, createdAt: new Date().toISOString() });
    } catch (cause) { if (requests.active.current && !controller.signal.aborted) handleError(cause); }
    finally { requests.finish(controller); if (requests.active.current) setBusy(false); }
  }
  async function download(path: string, filename: string) {
    setError(""); setDownloading(true);
    try { await downloadApiFile(locale, path, filename, token); }
    catch (cause) { if (requests.active.current) handleError(cause); }
    finally { if (requests.active.current) setDownloading(false); }
  }
  return <>
    <section className="zh-page-title"><p>{t("目录诊断", "CATALOG DIAGNOSIS")}</p><h1>{reportId ? t("查看已保存的诊断报告", "Review a saved catalog report") : t("在上架前发现商品数据问题", "Find product data issues before listing")}</h1><span>{t("支持 UTF-8 编码 CSV，最大 5 MB。系统不会修改你的原始商品数据。", "UTF-8 CSV files up to 5 MB are supported. Your original product data is never changed.")}</span><div className="zh-page-actions">{reportId ? <Link className="zh-text-link" href={`${base}?tab=diagnosis`}>{t("新建诊断 →", "Start a new diagnosis →")}</Link> : <button type="button" className="zh-text-link" disabled={downloading} onClick={() => download("/api/v1/imports/template", "listingscore-template.csv")}>{t("下载标准 CSV 模板 ↓", "Download starter CSV ↓")}</button>}<Link className="zh-text-link" href={base}>{t("返回个人中心", "Back to workspace")}</Link></div></section>
    {!reportId && <section className="zh-upload"><label><input type="file" accept=".csv,text/csv" aria-label={t("选择 CSV 文件", "Choose a CSV file")} disabled={busy} onChange={(event: ChangeEvent<HTMLInputElement>) => { setFile(event.target.files?.[0] ?? null); setResult(null); setError(""); setLevel("ALL"); }} /><b>{file ? file.name : t("选择或拖入 CSV 文件", "Choose or drop a CSV file")}</b><small>{file ? `${Math.ceil(file.size / 1024)} KB · ${t("等待分析", "ready to analyze")}` : t("SKU、标题、描述、价格、图片、库存、品牌、GTIN、变体字段均可识别", "Check SKU, title, description, price, images, availability, brand, GTIN and variants")}</small></label><button className="zh-primary" disabled={!file || busy} onClick={upload}>{busy ? t("正在分析…", "Analyzing…") : t("开始目录诊断", "Run catalog check")}</button></section>}
    {error && <div className="zh-error zh-data-error" role="alert">{error}{reportId && !result && <button type="button" disabled={busy} onClick={() => setReload(value => value + 1)}>{t("重新加载", "Retry loading")}</button>}</div>}
    {reportId && busy && <div className="zh-panel zh-loading" role="status">{t("正在加载诊断报告…", "Loading catalog report…")}</div>}
    {result && <section className="zh-panel zh-result"><div className="zh-title"><div><p>{t("诊断报告", "CATALOG REPORT")}</p><h2>{result.sourceName}</h2><span>{result.totalRows} {t("个商品已检查", "products checked")}</span></div><b className="zh-result-score">{result.catalogScore}<small>/100</small></b></div>
      <div className="zh-issues">{severityOrder.map(item => { const key = ({ BLOCKER: "blockers", HIGH: "high", MEDIUM: "medium", OPPORTUNITY: "opportunities" } as const)[item]; return <button className={level === item ? "selected" : ""} aria-pressed={level === item} key={item} onClick={() => setLevel(level === item ? "ALL" : item)}><span>{workspaceLabel(item, locale)}</span><b>{result.summary[key]}</b></button>; })}</div>
      <div className="zh-result-actions"><h3>{t("修复建议", "Suggested repairs")}</h3><button type="button" className="zh-text-link" disabled={downloading} onClick={() => download(`/api/v1/imports/${result.importId}/export`, "listingscore-repair-package.csv")}>{downloading ? t("正在下载…", "Downloading…") : t("下载修复 CSV ↓", "Download repair CSV ↓")}</button></div>
      {shown.length ? shown.map((item, index) => <article className="zh-issue" key={`${item.ruleId}-${index}`}><span>{workspaceLabel(item.severity, locale)}</span><div><b>{item.message}</b><small>{t("第", "Row ")} {item.rowNumber}{t(" 行", "")}{item.sku ? ` · ${item.sku}` : ""} · {t("字段：", "Field: ")}{fieldLabel(item.field, locale)}<br />{t("建议：", "Suggested fix: ")}{item.repairAction}</small></div></article>) : <div className="zh-empty"><b>{result.issues.length ? t("当前优先级没有匹配问题", "No issues match this priority") : t("本次检查未发现问题", "No issues found in this check")}</b><span>{result.issues.length ? t("再次点击已选优先级可查看全部问题。", "Click the selected priority again to view all issues.") : t("这表示已通过当前规则检查，请继续核对平台的完整上架要求。", "Your data passed the current checks. Review your platform’s full listing requirements as well.")}</span></div>}
      <Link className="zh-inline-button" href={`${base}/tasks`}>{t("前往任务中心 →", "Open task center →")}</Link>
    </section>}
  </>;
}
