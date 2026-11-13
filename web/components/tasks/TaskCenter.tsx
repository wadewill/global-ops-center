"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import WorkspaceHeader from "../../app/zh/components/WorkspaceHeader";
import { ApiError, apiRequest, localizedError, type AppLocale } from "../../lib/localized-api";
import { fieldLabel, workspaceLabel } from "../../lib/workspace-labels";
import "../../app/zh/tasks/tasks.css";

type Status = "OPEN" | "IN_PROGRESS" | "DONE";
type Task = { id: string; importId: string; ruleId: string; severity: string; sku: string; field: string; message: string; repairAction: string; status: Status; createdAt: string };
const priority: Record<string, number> = { BLOCKER: 0, HIGH: 1, MEDIUM: 2, OPPORTUNITY: 3 };
const copy = {
  "zh-CN": {
    loading: "正在加载工作空间…", signIn: "请先登录工作空间", loginCopy: "任务中心会把目录和平台数据问题转成团队可执行的修复动作。", login: "登录后返回任务中心 →",
    eyebrow: "运营任务中心", title: "让每一个商品问题都有下一步动作。", description: "目录诊断和未来的平台同步会自动沉淀为修复任务。团队可按优先级推进，避免问题停留在报告里。",
    open: "待处理任务", board: "修复工作台", boardTitle: "按优先级推进商品质量", all: "全部", retry: "重新加载", loadingTasks: "正在加载任务…",
    noSku: "未填写 SKU", field: "字段：", repair: "修复建议：", change: "修改任务状态", saving: "正在保存…", noDone: "还没有已完成任务", noTasks: "当前没有匹配任务", emptyCopy: "运行目录诊断后，系统会自动创建可执行的修复任务。", diagnose: "前往目录诊断 →",
  },
  en: {
    loading: "Loading workspace…", signIn: "Sign in to your workspace", loginCopy: "Turn catalog issues into actionable remediation tasks.", login: "Sign in and return to tasks →",
    eyebrow: "TASK CENTER", title: "Give every product issue a next step.", description: "Catalog diagnoses create remediation tasks. Track them by priority and turn recommendations into completed work.",
    open: "Open tasks", board: "REMEDIATION WORKSPACE", boardTitle: "Improve catalog quality by priority", all: "All", retry: "Reload", loadingTasks: "Loading tasks…",
    noSku: "SKU missing", field: "Field: ", repair: "Suggested fix: ", change: "Change task status", saving: "Saving…", noDone: "No completed tasks yet", noTasks: "No matching tasks", emptyCopy: "Run a catalog diagnosis to create actionable remediation tasks.", diagnose: "Go to catalog diagnosis →",
  },
};

export default function TaskCenter({ locale }: { locale: AppLocale }) {
  const t = copy[locale];
  const base = locale === "zh-CN" ? "/zh" : "/en";
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Status | "ALL">("OPEN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string[]>([]);
  const loadRequest = useRef<AbortController | null>(null);
  const updates = useRef(new Map<string, AbortController>());

  useEffect(() => {
    const saved = localStorage.getItem("listingscore-token");
    setTasks([]);
    setError("");
    setSaving([]);
    setToken(saved);
    setReady(true);
    if (saved) void load(saved);
    return cancelRequests;
  }, [locale]);

  async function load(value: string) {
    loadRequest.current?.abort();
    const request = new AbortController();
    loadRequest.current = request;
    setLoading(true);
    setError("");
    try {
      const result = await apiRequest<Task[]>(locale, "/api/v1/tasks", value, { signal: request.signal });
      if (!request.signal.aborted) setTasks(result);
    }
    catch (cause) {
      if (request.signal.aborted) return;
      if (cause instanceof ApiError && cause.status === 401) signOut();
      setError(localizedError(cause, locale));
    } finally {
      if (loadRequest.current === request) {
        loadRequest.current = null;
        setLoading(false);
      }
    }
  }

  async function move(task: Task, status: Status) {
    if (!token || task.status === status || updates.current.has(task.id)) return;
    const request = new AbortController();
    updates.current.set(task.id, request);
    setSaving(current => [...current, task.id]);
    setError("");
    try {
      const updated = await apiRequest<Task>(locale, `/api/v1/tasks/${task.id}`, token, { method: "PATCH", body: JSON.stringify({ status }), signal: request.signal });
      if (!request.signal.aborted) setTasks(current => current.map(item => item.id === task.id ? updated : item));
    } catch (cause) {
      if (request.signal.aborted) return;
      if (cause instanceof ApiError && cause.status === 401) signOut();
      setError(localizedError(cause, locale));
    } finally {
      if (updates.current.get(task.id) === request) {
        updates.current.delete(task.id);
        setSaving(current => current.filter(id => id !== task.id));
      }
    }
  }

  function cancelRequests() {
    loadRequest.current?.abort();
    loadRequest.current = null;
    updates.current.forEach(request => request.abort());
    updates.current.clear();
  }

  function signOut() {
    cancelRequests();
    localStorage.removeItem("listingscore-token");
    setToken(null);
    setTasks([]);
    setSaving([]);
    setLoading(false);
    setError("");
  }

  const visible = useMemo(() => tasks
    .filter(task => filter === "ALL" || task.status === filter)
    .sort((left, right) => (priority[left.severity] ?? 4) - (priority[right.severity] ?? 4)), [tasks, filter]);
  return <>
    <WorkspaceHeader locale={locale} active="tasks" onSignOut={token ? signOut : undefined} />
    {!ready ? <main className="task-login"><p role="status">{t.loading}</p></main> : !token ? (
      <main className="task-login"><h1>{t.signIn}</h1><p>{t.loginCopy}</p>{error && <p role="alert">{error}</p>}<Link href={`${base}?mode=login&next=${encodeURIComponent(`${base}/tasks`)}`}>{t.login}</Link></main>
    ) : (
      <main className="task-page">
        <section className="task-hero">
          <div><p>{t.eyebrow}</p><h1>{t.title}</h1><span>{t.description}</span></div>
          <div className="task-stats"><b>{tasks.filter(task => task.status === "OPEN").length}</b><span>{t.open}</span></div>
        </section>
        <section className="task-board">
          <div className="task-board-head"><div><p>{t.board}</p><h2>{t.boardTitle}</h2></div><div className="task-filter">{(["OPEN", "IN_PROGRESS", "DONE", "ALL"] as const).map(item => <button key={item} aria-pressed={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item === "ALL" ? t.all : workspaceLabel(item, locale)}</button>)}</div></div>
          {error && <div className="task-error" role="alert">{error}<button type="button" disabled={loading || saving.length > 0} onClick={() => load(token)}>{t.retry}</button></div>}
          {loading ? <div className="task-empty" role="status">{t.loadingTasks}</div> : visible.length ? visible.map(task => (
            <article className="task-card" key={task.id}>
              <div className={`severity ${task.severity.toLowerCase()}`}>{workspaceLabel(task.severity, locale)}</div>
              <div className="task-copy"><span>{task.sku || t.noSku} · {t.field}{fieldLabel(task.field, locale)}</span><h3>{task.message}</h3><p><b>{t.repair}</b>{task.repairAction}</p></div>
              <div className="task-action"><small role={saving.includes(task.id) ? "status" : undefined}>{saving.includes(task.id) ? t.saving : workspaceLabel(task.status, locale)}</small><select aria-label={`${t.change} · ${task.sku || t.noSku} · ${task.message}`} disabled={saving.includes(task.id)} value={task.status} onChange={event => move(task, event.target.value as Status)}>{(["OPEN", "IN_PROGRESS", "DONE"] as const).map(status => <option key={status} value={status}>{workspaceLabel(status, locale)}</option>)}</select></div>
            </article>
          )) : error ? null : <div className="task-empty"><b>{filter === "DONE" ? t.noDone : t.noTasks}</b><span>{t.emptyCopy}</span><Link href={`${base}?tab=diagnosis`}>{t.diagnose}</Link></div>}
        </section>
      </main>
    )}
  </>;
}
