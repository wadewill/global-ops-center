import assert from "node:assert/strict";
import test from "node:test";
import { taskLoginHref, workspaceHref, workspaceReturnPath, workspaceTab } from "./workspace-navigation";

test("all workspace tabs round-trip through their URL", () => {
  for (const tab of ["overview", "diagnosis", "connections"] as const) {
    const url = new URL(workspaceHref(tab), "https://example.test");
    assert.equal(url.pathname, "/zh");
    assert.equal(workspaceTab(url.searchParams.get("tab")), tab);
  }
  assert.equal(workspaceTab("unknown"), "overview");
});

test("the task login link retains its destination and opens login", () => {
  const url = new URL(taskLoginHref, "https://example.test");
  assert.equal(url.pathname, "/zh");
  assert.equal(url.searchParams.get("mode"), "login");
  assert.equal(workspaceReturnPath(url.searchParams.get("next")), "/zh/tasks");
});

test("return targets reject external, encoded, and unrecognized paths", () => {
  for (const value of [null, "", "https://example.test", "//example.test", "javascript:alert(1)", "%2F%2Fexample.test", "/zh/tasks?next=https://example.test", "/zh/../en", "/en"]) {
    assert.equal(workspaceReturnPath(value), null);
  }
  for (const value of ["/zh", "/zh?tab=diagnosis", "/zh?tab=connections", "/zh/tasks"]) {
    assert.equal(workspaceReturnPath(value), value);
  }
});
