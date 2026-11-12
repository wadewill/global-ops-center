export type WorkspaceTab = "overview" | "diagnosis" | "connections";

export function workspaceTab(value: string | null): WorkspaceTab {
  return value === "diagnosis" || value === "connections" ? value : "overview";
}

export function workspaceHref(tab: WorkspaceTab): string {
  return tab === "overview" ? "/zh" : `/zh?tab=${tab}`;
}

const returnPaths = new Set(["/zh", "/zh?tab=diagnosis", "/zh?tab=connections", "/zh/tasks"]);

// Only application destinations are valid; never redirect to a supplied external URL.
export function workspaceReturnPath(value: string | null): string | null {
  return value !== null && returnPaths.has(value) ? value : null;
}

export const taskLoginHref = "/zh?mode=login&next=%2Fzh%2Ftasks";
