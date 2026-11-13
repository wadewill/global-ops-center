import assert from "node:assert/strict";
import test from "node:test";
import { ApiError, apiRequest, localizedError, problemMessage } from "./localized-api";
import { fieldLabel, workspaceLabel } from "./workspace-labels";

test("Chinese UI uses stable codes when an old API returns English", () => {
  const message = problemMessage("zh-CN", 400, { code: "INVALID_CREDENTIALS", detail: "Email or password is incorrect." }, "en");
  assert.match(message, /邮箱或密码/);
  assert.doesNotMatch(message, /incorrect/);
  assert.match(problemMessage("zh-CN", 400, { code: "UNKNOWN", detail: "Internal implementation details" }, null), /提交的信息/);
});

test("matching localized server detail remains specific; mismatched languages are hidden", () => {
  assert.equal(problemMessage("zh-CN", 400, { code: "VALIDATION_FAILED", detail: "密码至少需要 12 个字符。" }, "zh-CN"), "密码至少需要 12 个字符。");
  assert.match(problemMessage("en", 400, { code: "INVALID_CREDENTIALS", detail: "邮箱或密码错误。" }, "zh-CN"), /Email or password/);
  assert.match(problemMessage("zh-CN", 503, "upstream error", null), /服务暂时不可用/);
});

test("network exceptions and unknown runtime messages never leak into Chinese UI", () => {
  assert.match(localizedError(new Error("Failed to fetch secret-debug-value"), "zh-CN"), /服务暂时不可用/);
  assert.match(problemMessage("zh-CN", 429, null, null), /过于频繁/);
});

test("requests explicitly carry page language and handle empty success responses", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("Accept-Language"), "zh-CN");
    assert.equal(headers.get("Authorization"), "Bearer test-token");
    assert.equal(headers.get("Content-Type"), "application/json");
    return new Response(null, { status: 204 });
  };
  try { assert.equal(await apiRequest("zh-CN", "/api/v1/example", "test-token", { method: "POST", body: "{}", headers: { "Accept-Language": "en" } }), undefined); }
  finally { globalThis.fetch = originalFetch; }
});

test("non-JSON proxy errors preserve status while showing localized fallback", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("<h1>Bad Gateway</h1>", { status: 502 });
  try { await assert.rejects(apiRequest("zh-CN", "/api/v1/example"), cause => cause instanceof ApiError && cause.status === 502 && /服务暂时不可用/.test(cause.message)); }
  finally { globalThis.fetch = originalFetch; }
});

test("malformed JSON success, timeouts, and transport failures have localized messages", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response("not-json", { status: 200 });
    await assert.rejects(apiRequest("zh-CN", "/api/v1/example"), cause => cause instanceof ApiError && cause.code === "INVALID_RESPONSE" && /格式异常/.test(cause.message));
    globalThis.fetch = async () => { throw new DOMException("request aborted", "TimeoutError"); };
    await assert.rejects(apiRequest("zh-CN", "/api/v1/example"), cause => cause instanceof ApiError && cause.code === "REQUEST_TIMEOUT" && /超时/.test(cause.message));
    globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
    await assert.rejects(apiRequest("en", "/api/v1/example"), cause => cause instanceof ApiError && cause.code === "NETWORK_ERROR" && /Could not reach/.test(cause.message));
  } finally { globalThis.fetch = originalFetch; }
});

test("rate limiting preserves Retry-After and localizes response", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ code: "RATE_LIMITED", detail: "Too many attempts." }), { status: 429, headers: { "Retry-After": "60", "Content-Language": "en" } });
  try { await assert.rejects(apiRequest("zh-CN", "/api/v1/example"), cause => cause instanceof ApiError && cause.retryAfter === "60" && /频繁/.test(cause.message)); }
  finally { globalThis.fetch = originalFetch; }
});

test("machine statuses and fields have readable labels in both languages", () => {
  assert.equal(workspaceLabel("CONFIGURED", "zh-CN"), "已配置");
  assert.equal(workspaceLabel("IN_PROGRESS", "en"), "In progress");
  assert.equal(workspaceLabel("API_KEY", "zh-CN"), "API 密钥");
  assert.equal(fieldLabel("price", "zh-CN"), "价格");
});
