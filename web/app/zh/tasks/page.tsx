"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WorkspaceHeader from "../components/WorkspaceHeader";
import "./tasks.css";

type Status = "OPEN" | "IN_PROGRESS" | "DONE";
type Task = { id: string; importId: string; ruleId: string; severity: string; sku: string; field: string; message: string; repairAction: string; status: Status; createdAt: string };
const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
const statusLabel: Record<Status, string> = { OPEN: "待处理", IN_PROGRESS: "处理中", DONE: "已完成" };

export default function TaskCenter() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Status | "ALL">("OPEN");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("listingscore-token");
    setToken(saved);
    setReady(true);
    if (saved) load(saved);
  }, []);

  async function load(value: string) {
    try { setTasks(await request<Task[]>("/api/v1/tasks", value)); }
    catch { setError("无法读取任务。请重新登录后再试。"); }
  }

  async function move(task: Task, status: Status) {
    if (!token) return;
    try {
      const updated = await request<Task>(`/api/v1/tasks/${task.id}`, token, { method: "PATCH", body: JSON.stringify({ status }) });
      setTasks(current => current.map(item => item.id === task.id ? updated : item));
    } catch { setError("任务状态未能保存，请稍后重试。"); }
  }

  function signOut() {
    localStorage.removeItem("listingscore-token");
    setToken(null);
    setTasks([]);
    setError("");
  }

  const visible = useMemo(() => tasks.filter(task => filter === "ALL" || task.status === filter), [tasks, filter]);

  return <>
    <WorkspaceHeader active="tasks" onSignOut={token ? signOut : undefined} />
    {!ready ? <main className="task-login"><p role="status">正在加载工作空间…</p></main> : !token ? (
      <main className="task-login">
        <h1>请先登录工作空间</h1>
        <p>任务中心会把目录和平台数据问题转成团队可执行的修复动作。</p>
        <Link href="/zh">进入中文工作空间 →</Link>
      </main>
    ) : (
      <main className="task-page">
        <section className="task-hero">
          <div><p>运营任务中心</p><h1>让每一个商品问题<br />都有下一步动作。</h1><span>目录诊断和未来的平台同步会自动沉淀为修复任务。团队可按优先级推进，避免问题停留在报告里。</span></div>
          <div className="task-stats"><b>{tasks.filter(t => t.status === "OPEN").length}</b><span>待处理<br />任务</span></div>
        </section>
        <section className="task-board">
          <div className="task-board-head">
            <div><p>修复工作台</p><h2>按优先级推进商品质量</h2></div>
            <div className="task-filter">{(["OPEN", "IN_PROGRESS", "DONE", "ALL"] as const).map(item => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item === "ALL" ? "全部" : statusLabel[item]}</button>)}</div>
          </div>
          {error && <div className="task-error">{error}</div>}
          {visible.length ? visible.map(task => (
            <article className="task-card" key={task.id}>
              <div className={`severity ${task.severity.toLowerCase()}`}>{severityName(task.severity)}</div>
              <div className="task-copy"><span>{task.ruleId} · {task.sku || "未填写 SKU"} · 字段：{task.field}</span><h3>{task.message}</h3><p><b>修复建议：</b>{task.repairAction}</p></div>
              <div className="task-action"><small>{statusLabel[task.status]}</small><select value={task.status} onChange={event => move(task, event.target.value as Status)}><option value="OPEN">待处理</option><option value="IN_PROGRESS">处理中</option><option value="DONE">已完成</option></select></div>
            </article>
          )) : (
            <div className="task-empty"><b>{filter === "DONE" ? "还没有已完成任务" : "当前没有匹配任务"}</b><span>运行目录诊断后，系统会自动创建可执行的修复任务。</span><Link href="/zh?tab=diagnosis">前往目录诊断 →</Link></div>
          )}
        </section>
      </main>
    )}
  </>;
}

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${apiBase}${path}`, { ...init, headers });
  if (!response.ok) throw new Error();
  return response.json() as Promise<T>;
}

function severityName(value: string) {
  return ({ BLOCKER: "阻断", HIGH: "高优先级", MEDIUM: "中优先级", OPPORTUNITY: "优化建议" } as Record<string, string>)[value] ?? value;
}
