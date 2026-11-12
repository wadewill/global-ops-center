"use client";

import { ChangeEvent, useMemo, useState } from "react";

type Severity = "BLOCKER" | "HIGH" | "MEDIUM" | "OPPORTUNITY";
type Issue = { rowNumber: number; sku: string; ruleId: string; severity: Severity; field: string; message: string; repairAction: string };
type Result = {
  importId: string;
  sourceName: string;
  totalRows: number;
  catalogScore: number;
  mappedFields: string[];
  summary: { blockers: number; high: number; medium: number; opportunities: number };
  issues: Issue[];
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
const severityOrder: Severity[] = ["BLOCKER", "HIGH", "MEDIUM", "OPPORTUNITY"];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Severity | "ALL">("ALL");

  const visibleIssues = useMemo(
    () => result?.issues.filter((issue) => filter === "ALL" || issue.severity === filter) ?? [],
    [filter, result]
  );

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setResult(null);
    setFile(event.target.files?.[0] ?? null);
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch(`${apiBase}/api/v1/imports`, { method: "POST", body: data });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(body?.detail ?? "The catalog could not be analyzed.");
      }
      setResult((await response.json()) as Result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The catalog could not be analyzed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header className="topbar"><div className="brand"><span>✦</span> ListingScore</div><p>Catalog pre-flight for cross-border sellers</p></header>
      <section className="hero">
        <p className="eyebrow">Catalog quality control</p>
        <h1>Find what blocks products <em>before</em> they go live.</h1>
        <p className="lead">Upload a UTF-8 CSV to identify missing product data, variation problems, and Google-readiness risks. ListingScore does not change your store.</p>
      </section>
      <section className="panel upload-panel" aria-labelledby="upload-heading">
        <div><p className="eyebrow">Step 1</p><h2 id="upload-heading">Analyze your catalog</h2><p>Supported fields include SKU, title, price, image URL, availability, brand, GTIN, variants, and product description.</p></div>
        <div className="upload-action">
          <label className="file-input"><input type="file" accept=".csv,text/csv" onChange={selectFile} /><span>{file ? file.name : "Choose UTF-8 CSV"}</span></label>
          <button type="button" disabled={!file || loading} onClick={analyze}>{loading ? "Analyzing…" : "Run catalog check"}</button>
          <small>CSV only in this MVP · max 5 MB · no store data is changed.</small>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
      </section>
      {result && <Results result={result} filter={filter} setFilter={setFilter} visibleIssues={visibleIssues} />}
    </main>
  );
}

function Results({ result, filter, setFilter, visibleIssues }: { result: Result; filter: Severity | "ALL"; setFilter: (filter: Severity | "ALL") => void; visibleIssues: Issue[] }) {
  const cards: Array<[Severity, number]> = [["BLOCKER", result.summary.blockers], ["HIGH", result.summary.high], ["MEDIUM", result.summary.medium], ["OPPORTUNITY", result.summary.opportunities]];
  return <section className="results" aria-live="polite">
    <div className="result-heading"><div><p className="eyebrow">Step 2</p><h2>{result.sourceName}</h2><p>{result.totalRows} product rows · mapped: {result.mappedFields.join(", ") || "none"}</p></div><div className="score"><strong>{result.catalogScore}</strong><span>/ 100<br />catalog score</span></div></div>
    <div className="summary-grid">{cards.map(([severity, count]) => <button type="button" className={`summary ${filter === severity ? "selected" : ""}`} onClick={() => setFilter(filter === severity ? "ALL" : severity)} key={severity}><span>{severity}</span><strong>{count}</strong></button>)}</div>
    <div className="issues-heading"><h3>Repair tasks</h3><a href={`${apiBase}/api/v1/imports/${result.importId}/export`}>Download repair CSV</a></div>
    {visibleIssues.length === 0 ? <p className="empty">No issues match this filter.</p> : <div className="issue-list">{visibleIssues.map((issue, index) => <article className="issue" key={`${issue.rowNumber}-${issue.ruleId}-${index}`}><div><span className={`badge ${issue.severity.toLowerCase()}`}>{issue.severity}</span><span className="rule">{issue.ruleId} · row {issue.rowNumber}{issue.sku ? ` · ${issue.sku}` : ""}</span></div><h4>{issue.message}</h4><p><b>Field:</b> {issue.field} · <b>Next step:</b> {issue.repairAction}</p></article>)}</div>}
  </section>;
}
