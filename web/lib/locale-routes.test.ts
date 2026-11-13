import assert from "node:assert/strict";
import test from "node:test";
import { localeHref } from "./locale-routes";

const origin = "https://example.test";

test("product homes and task centers keep the same destination when switching languages", () => {
  for (const home of ["/", "/zh/product", "/en/product"]) {
    assert.equal(localeHref(home, "", "en"), "/en/product");
    assert.equal(localeHref(home, "", "zh-CN"), "/");
  }
  for (const tasks of ["/zh/tasks", "/en/tasks"]) {
    assert.equal(localeHref(tasks, "", "en"), "/en/tasks");
    assert.equal(localeHref(tasks, "", "zh-CN"), "/zh/tasks");
  }
});

test("workspace language switches retain the selected tab and authentication mode", () => {
  for (const tab of ["diagnosis", "connections"]) {
    for (const mode of ["login", "register"]) {
      const english = new URL(localeHref("/zh", `tab=${tab}&mode=${mode}`, "en"), origin);
      assert.equal(english.pathname, "/en");
      assert.equal(english.searchParams.get("tab"), tab);
      assert.equal(english.searchParams.get("mode"), mode);
      const chinese = new URL(localeHref(english.pathname, english.search, "zh-CN"), origin);
      assert.equal(chinese.pathname, "/zh");
      assert.equal(chinese.searchParams.get("tab"), tab);
      assert.equal(chinese.searchParams.get("mode"), mode);
    }
  }
});

test("login return destinations are rewritten to the selected language", () => {
  for (const suffix of ["", "/tasks", "?tab=diagnosis", "?tab=connections"]) {
    const source = new URLSearchParams({ mode: "login", next: `/zh${suffix}` });
    const english = new URL(localeHref("/zh", source.toString(), "en"), origin);
    assert.equal(english.searchParams.get("mode"), "login");
    assert.equal(english.searchParams.get("next"), `/en${suffix}`);
    const chinese = new URL(localeHref("/en", english.search, "zh-CN"), origin);
    assert.equal(chinese.searchParams.get("next"), `/zh${suffix}`);
  }
});

test("external, encoded, nested and unrecognized return destinations are discarded", () => {
  const unsafe = [
    "https://evil.example", "//evil.example", "javascript:alert(1)",
    "%2F%2Fevil.example", "/%2Fen/tasks", "/zh/../en", "/zh/../../evil.example",
    "/zh/tasks?next=https://evil.example", "/en?tab=diagnosis&next=//evil.example",
    "/zh/tasks#external", "/en/product", "/zh?tab=unknown", "/zh\\tasks",
  ];
  for (const next of unsafe) {
    const query = new URLSearchParams({ tab: "diagnosis", mode: "login", next });
    const target = new URL(localeHref("/zh", query.toString(), "en"), origin);
    assert.equal(target.origin, origin);
    assert.equal(target.pathname, "/en");
    assert.equal(target.searchParams.get("next"), null, next);
    assert.equal(target.searchParams.get("tab"), "diagnosis");
    assert.equal(target.searchParams.get("mode"), "login");
  }
});

test("unknown query settings are dropped rather than forwarded into a new locale", () => {
  assert.equal(localeHref("/zh", "tab=unknown&mode=reset&redirect=https%3A%2F%2Fevil.example", "en"), "/en");
  assert.equal(localeHref("/en", "mode=register&debug=true", "zh-CN"), "/zh?mode=register");
});

test("language switches keep a selected diagnosis report and discard unrelated or malformed IDs", () => {
  const report = "3b4d89f0-469c-4d37-b881-fbd0115f8cc2";
  const english = new URL(localeHref("/zh", `tab=diagnosis&report=${report}`, "en"), origin);
  assert.equal(english.pathname, "/en");
  assert.equal(english.searchParams.get("report"), report);
  const chinese = new URL(localeHref("/en", english.search, "zh-CN"), origin);
  assert.equal(chinese.searchParams.get("report"), report);
  assert.equal(new URL(localeHref("/zh", `tab=connections&report=${report}`, "en"), origin).searchParams.get("report"), null);
  for (const invalid of ["bad-id", `${report}/extra`, `https://example.test/${report}`, `${report}&next=//evil.example`]) {
    const query = new URLSearchParams({ tab: "diagnosis", report: invalid });
    assert.equal(new URL(localeHref("/zh", query.toString(), "en"), origin).searchParams.get("report"), null);
  }
});
