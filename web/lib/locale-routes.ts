export type Locale = "zh-CN" | "en";

export function localeHref(pathname: string, search: string, locale: Locale): string {
  const base = locale === "en" ? "/en" : "/zh";
  if (["/", "/zh/product", "/en/product"].includes(pathname)) return locale === "en" ? "/en/product" : "/";
  if (pathname === "/zh/tasks" || pathname === "/en/tasks") return `${base}/tasks`;
  const source = new URLSearchParams(search);
  const query = new URLSearchParams();
  const tab = source.get("tab");
  if (tab === "diagnosis" || tab === "connections") query.set("tab", tab);
  const mode = source.get("mode");
  if (mode === "login" || mode === "register") query.set("mode", mode);
  const next = source.get("next");
  if (next && /^\/(zh|en)(\/tasks|\?tab=(diagnosis|connections))?$/.test(next)) {
    query.set("next", next.replace(/^\/(zh|en)/, base));
  }
  return `${base}${query.size ? `?${query}` : ""}`;
}
