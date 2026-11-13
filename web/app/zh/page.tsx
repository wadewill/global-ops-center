"use client";

import { ChangeEvent, FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clearFieldValidity, localizeInvalidField } from "../../lib/localized-forms";
import WorkspaceHeader from "./components/WorkspaceHeader";
import LocaleLink from "../../components/LocaleLink";
import { workspaceHref, workspaceReturnPath, workspaceTab } from "./workspace-navigation";
import { ApiError, apiRequest, downloadApiFile, localizedError } from "../../lib/localized-api";
import { fieldLabel, workspaceLabel } from "../../lib/workspace-labels";
import "./zh.css";

type User = { id: string; email: string; displayName: string; role: string };
type Issue = { rowNumber: number; sku: string; ruleId: string; severity: "BLOCKER" | "HIGH" | "MEDIUM" | "OPPORTUNITY"; field: string; message: string; repairAction: string };
type Report = { importId: string; sourceName: string; totalRows: number; catalogScore: number; createdAt: string };
type Result = { importId: string; sourceName: string; totalRows: number; catalogScore: number; summary: { blockers: number; high: number; medium: number; opportunities: number }; issues: Issue[] };
type Connection = { id: string; platform: string; label: string; authType: string; status: string };


export default function ChineseWorkspace() {
  return <Suspense fallback={<><WorkspaceHeader active="overview" /><main className="zh-shell"><div className="zh-content zh-loading" role="status">正在加载工作空间…</div></main></>}><WorkspaceContent /></Suspense>;
}

function WorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = workspaceTab(searchParams.get("tab"));
  const returnTo = workspaceReturnPath(searchParams.get("next"));
  const tab = section === "diagnosis" ? "诊断" : section === "connections" ? "连接" : "概览";
  function setTab(next: "概览" | "诊断" | "连接") {
    router.push(workspaceHref(next === "概览" ? "overview" : next === "诊断" ? "diagnosis" : "connections"));
  }
  const [token, setToken] = useState<string | null>(null); const [user, setUser] = useState<User | null>(null); const [reports, setReports] = useState<Report[]>([]); const [connections, setConnections] = useState<Connection[]>([]);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [dataError, setDataError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => { const saved = localStorage.getItem("listingscore-token"); if (saved) setToken(saved); setSessionReady(true); }, []);
  useEffect(() => {
    if (!token) return;
    let current = true;
    setSessionError("");
    setDataError("");
    async function loadWorkspace() {
      try {
        const me = await call<User>("/api/v1/auth/me", token!);
        if (!current) return;
        setUser(me);
        const [history, linked] = await Promise.allSettled([call<Report[]>("/api/v1/imports", token!), call<Connection[]>("/api/v1/connections", token!)]);
        if (!current) return;
        if (history.status === "fulfilled") setReports(history.value);
        if (linked.status === "fulfilled") setConnections(linked.value);
        if (history.status === "rejected" || linked.status === "rejected") setDataError("部分工作空间数据未能加载，请重试。");
      } catch (cause) {
        if (!current) return;
        if (cause instanceof ApiError && cause.status === 401) signOut();
        else setSessionError("暂时无法读取账号信息，请重试。你的登录状态已保留。");
      }
    }
    void loadWorkspace();
    return () => { current = false; };
  }, [token, reload]);
  useEffect(() => {
    if (token && user && returnTo) router.replace(returnTo);
  }, [token, user, returnTo, router]);
  function signOut() { localStorage.removeItem("listingscore-token"); setToken(null); setUser(null); setReports([]); setConnections([]); setSessionError(""); setDataError(""); }
  const active = returnTo === "/zh/tasks" ? "tasks" : section;
  if (sessionError && token) return <><WorkspaceHeader active={active} onSignOut={signOut} /><main className="zh-shell"><div className="zh-content"><section className="zh-panel zh-session-error"><p role="alert">{sessionError}</p><button className="zh-primary" onClick={() => setReload(value => value + 1)}>重新加载</button></section></div></main></>;
  if (!sessionReady || (token && !user) || (token && user && returnTo)) return <><WorkspaceHeader active={active} /><main className="zh-shell"><div className="zh-content zh-loading" role="status">正在加载工作空间…</div></main></>;
  if (!token || !user) return <><WorkspaceHeader active={active} /><ChineseAuth key={searchParams.get("mode")} loginFirst={searchParams.get("mode") === "login"} onSuccess={(nextToken, nextUser) => { localStorage.setItem("listingscore-token", nextToken); setToken(nextToken); setUser(nextUser); }} /></>;
  return <><WorkspaceHeader active={section} displayName={user.displayName} onSignOut={signOut} /><main className="zh-shell"><section className="zh-content">{dataError && <div className="zh-error zh-data-error" role="alert">{dataError}<button type="button" onClick={() => setReload(value => value + 1)}>重新加载</button></div>}{tab === "概览" && <Overview reports={reports} connections={connections} onDiagnose={() => setTab("诊断")} onConnect={() => setTab("连接")} />}{tab === "诊断" && <Diagnosis token={token} reports={reports} setReports={setReports} />}{tab === "连接" && <Connections token={token} items={connections} setItems={setConnections} />}</section></main></>;
}

function ChineseAuth({ loginFirst, onSuccess }: { loginFirst: boolean; onSuccess: (token: string, user: User) => void }) {
  const [register, setRegister] = useState(!loginFirst); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { const body = await call<{ accessToken: string; user: User }>(`/api/v1/auth/${register ? "register" : "login"}`, undefined, { method: "POST", body: JSON.stringify({ email, password, displayName: register ? name : undefined }) }); onSuccess(body.accessToken, body.user); } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); } }
  return <main className="zh-auth"><section className="zh-auth-hero"><a href="/" className="zh-logo"><i aria-hidden="true">LS</i> ListingScore</a><div><p>商家服务 · 我的工作空间</p><h1>商品先检查，<br/>上架更从容。</h1><span>查看商品数据问题和修复建议，保存诊断报告，逐项跟进处理进度。</span></div><small>其他语言：<LocaleLink locale="en" /></small></section><section className="zh-auth-form"><form onSubmit={submit} onInvalid={event => localizeInvalidField(event.target, "zh-CN")} onInput={event => clearFieldValidity(event.target)}><p>{register ? "创建工作空间" : "欢迎回来"}</p><h2>{register ? "开始使用 ListingScore" : "登录你的工作空间"}</h2>{register && <label>姓名或团队名称<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="例如：Wade 的运营团队" /></label>}<label>邮箱<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" /></label><label>密码<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} placeholder="至少 12 位，包含字母和数字" /><small>注册受频率保护，保障工作空间安全。</small></label>{error && <div className="zh-error">{error}</div>}<button className="zh-primary" disabled={busy}>{busy ? "处理中…" : register ? "创建并进入工作空间" : "登录"}</button><button type="button" className="zh-switch" onClick={() => { setRegister(!register); setError(""); }}>{register ? "已有账号？去登录" : "还没有账号？创建工作空间"}</button></form></section></main>;
}

function Overview({ reports, connections, onDiagnose, onConnect }: { reports: Report[]; connections: Connection[]; onDiagnose: () => void; onConnect: () => void }) { const score = reports[0]?.catalogScore; const avg = reports.length ? Math.round(reports.reduce((sum, item) => sum + item.catalogScore, 0) / reports.length) : "—"; const ready = connections.length > 0; return <><section className="zh-hero"><div><p>商品运营控制台</p><h1>{ready ? "让已连接的数据源持续产出动作" : "从连接商品数据源开始"}</h1><span>{ready ? "目录异常会沉淀为修复任务，让团队可以按优先级完成处理。" : "先安全连接 Shopify 或自定义 API；CSV 诊断保留为快速体验和补充检查入口。"}</span><div className="zh-hero-actions"><button className="zh-primary" onClick={onConnect}>{ready ? "管理数据连接 →" : "连接数据源 →"}</button><button className="zh-secondary" onClick={onDiagnose}>使用 CSV 快速诊断</button></div></div><div className="zh-score"><b>{score ?? "—"}</b><span>/ 100<br/>最近一次评分</span></div></section><div className="zh-metrics"><Metric title="已完成诊断" value={String(reports.length)} note="历史报告私密保存" /><Metric title="平均健康分" value={String(avg)} note="基于历史诊断" /><Metric title="已连接来源" value={String(connections.length)} note="API 凭据加密保存" /></div><section className="zh-panel"><div className="zh-title"><div><p>最近活动</p><h2>目录诊断报告</h2></div><button onClick={onDiagnose}>新建诊断</button></div>{reports.length ? reports.slice(0, 6).map((item) => <div className="zh-report" key={item.importId}><div><strong>{item.sourceName}</strong><span>{item.totalRows} 个商品 · {new Date(item.createdAt).toLocaleDateString("zh-CN")}</span></div><b>{item.catalogScore}</b><small>质量分</small></div>) : <div className="zh-empty"><b>还没有诊断报告</b><span>先连接平台数据源；也可上传 CSV，快速体验商品问题识别与修复任务。</span><button className="zh-inline-button" onClick={onDiagnose}>使用 CSV 快速诊断</button></div>}</section></> }
function Metric({ title, value, note }: { title: string; value: string; note: string }) { return <article className="zh-metric"><span>{title}</span><b>{value}</b><small>{note}</small></article>; }

function Diagnosis({ token, reports, setReports }: { token: string; reports: Report[]; setReports: (next: Report[]) => void }) { const [file, setFile] = useState<File | null>(null); const [result, setResult] = useState<Result | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [level, setLevel] = useState<"ALL" | Issue["severity"]>("ALL"); const shown = useMemo(() => result?.issues.filter((issue) => level === "ALL" || issue.severity === level) ?? [], [result, level]); async function upload() { if (!file) return; setBusy(true); setError(""); try { const data = new FormData(); data.append("file", file); const next = await call<Result>("/api/v1/imports", token, { method: "POST", body: data }); setResult(next); setReports([{ importId: next.importId, sourceName: next.sourceName, totalRows: next.totalRows, catalogScore: next.catalogScore, createdAt: new Date().toISOString() }, ...reports]); } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); } } return <><section className="zh-page-title"><p>目录诊断</p><h1>在上架前发现商品数据问题</h1><span>支持 UTF-8 编码 CSV，最大 5 MB。系统不会修改你的原始商品数据。</span><a href="#download-template" onClick={(event) => { event.preventDefault(); setError(""); void downloadApiFile("zh-CN", "/api/v1/imports/template", "listingscore-template.csv", token).catch(cause => setError(errorMessage(cause))); }}>下载标准 CSV 模板 ↓</a></section><section className="zh-upload"><label><input type="file" accept=".csv,text/csv" onChange={(event: ChangeEvent<HTMLInputElement>) => { setFile(event.target.files?.[0] ?? null); setResult(null); }} /><b>{file ? file.name : "选择或拖入 CSV 文件"}</b><small>{file ? `${Math.ceil(file.size / 1024)} KB，等待分析` : "SKU、标题、描述、价格、图片、库存、品牌、GTIN、变体字段均可识别"}</small></label><button className="zh-primary" disabled={!file || busy} onClick={upload}>{busy ? "正在分析…" : "开始目录诊断"}</button>{error && <div className="zh-error">{error}</div>}</section>{result && <section className="zh-panel zh-result"><div className="zh-title"><div><p>诊断完成</p><h2>{result.sourceName}</h2><span>{result.totalRows} 个商品已检查</span></div><b className="zh-result-score">{result.catalogScore}<small>/100</small></b></div><div className="zh-issues">{(["BLOCKER", "HIGH", "MEDIUM", "OPPORTUNITY"] as const).map((item) => { const key = item === "BLOCKER" ? "blockers" : item === "HIGH" ? "high" : item === "MEDIUM" ? "medium" : "opportunities"; const label = { BLOCKER: "阻断", HIGH: "高优先级", MEDIUM: "中优先级", OPPORTUNITY: "优化建议" }[item]; return <button className={level === item ? "selected" : ""} key={item} onClick={() => setLevel(level === item ? "ALL" : item)}><span>{label}</span><b>{result.summary[key]}</b></button>; })}</div><h3>修复任务</h3>{shown.map((item, index) => <article className="zh-issue" key={`${item.ruleId}-${index}`}><span>{severityLabel(item.severity)}</span><div><b>{item.message}</b><small>第 {item.rowNumber} 行{item.sku ? ` · ${item.sku}` : ""} · 字段：{fieldLabel(item.field, "zh-CN")}<br/>建议：{item.repairAction}</small></div></article>)}</section>}</>; }

function Connections({ token, items, setItems }: { token: string; items: Connection[]; setItems: (next: Connection[]) => void }) { const [label, setLabel] = useState(""); const [platform, setPlatform] = useState("SHOPIFY"); const [credential, setCredential] = useState(""); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); async function save(event: FormEvent) { event.preventDefault(); setBusy(true); setMessage(""); try { const created = await call<Connection>("/api/v1/connections", token, { method: "POST", body: JSON.stringify({ platform, label, authType: "ACCESS_TOKEN", credential }) }); setItems([created, ...items]); setLabel(""); setCredential(""); setMessage("连接已保存。凭据已加密，不会再次显示。"); } catch (cause) { setMessage(errorMessage(cause)); } finally { setBusy(false); } } return <><section className="zh-page-title"><p>API 连接</p><h1>让目录数据逐步接近数据源</h1><span>当前支持安全保存 Shopify 和自定义 REST API 的连接信息；Amazon、Walmart、Google Merchant 正在规划中。</span></section><div className="zh-connection-layout"><section className="zh-panel">{items.length ? items.map((item) => <div className="zh-connection" key={item.id}><b>{item.platform === "SHOPIFY" ? "S" : "A"}</b><div><strong>{item.label}</strong><span>{workspaceLabel(item.platform, "zh-CN")} · {workspaceLabel(item.authType, "zh-CN")}</span></div><small>{workspaceLabel(item.status, "zh-CN")}</small></div>) : <div className="zh-empty"><b>尚未连接数据源</b><span>你可以继续使用 CSV；连接 API 后可逐步实现自动目录同步。</span></div>}</section><form className="zh-panel zh-connect-form" onSubmit={save} onInvalid={event => localizeInvalidField(event.target, "zh-CN")} onInput={event => clearFieldValidity(event.target)}><p>添加连接</p><label>平台<select value={platform} onChange={(e) => setPlatform(e.target.value)}><option value="SHOPIFY">Shopify</option><option value="CUSTOM_API">自定义 REST API</option></select></label><label>连接名称<input value={label} required onChange={(e) => setLabel(e.target.value)} placeholder="例如：美国 Shopify 店铺" /></label><label>访问令牌 / API Key<textarea value={credential} required onChange={(e) => setCredential(e.target.value)} placeholder="保存后会立即加密，页面不会回显" /></label>{message && <div className={message.includes("已保存") ? "zh-success" : "zh-error"}>{message}</div>}<button className="zh-primary" disabled={busy}>{busy ? "正在安全保存…" : "保存加密连接"}</button></form></div></>; }

function call<T>(path: string, token?: string, init: RequestInit = {}): Promise<T> { return apiRequest<T>("zh-CN", path, token, init); }
function errorMessage(cause: unknown) { return localizedError(cause, "zh-CN"); }
function severityLabel(value: Issue["severity"]) { return { BLOCKER: "阻断", HIGH: "高", MEDIUM: "中", OPPORTUNITY: "建议" }[value]; }
