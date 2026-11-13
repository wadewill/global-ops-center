export type AppLocale = "zh-CN" | "en";

type Problem = { code?: unknown; detail?: unknown };
const messages: Record<string, readonly [string, string]> = {
  INVALID_REQUEST: ["提交的信息不正确，请检查后重试。", "Check the submitted information and try again."],
  VALIDATION_FAILED: ["请检查填写的信息是否完整且符合要求。", "Check that all fields are complete and valid."],
  EMAIL_ALREADY_EXISTS: ["该邮箱已注册，请直接登录或使用其他邮箱。", "An account with this email already exists. Sign in or use another email."],
  DISPLAY_NAME_REQUIRED: ["请填写姓名或团队名称。", "Enter a display name."],
  INVALID_CREDENTIALS: ["邮箱或密码不正确，请重新输入。", "Email or password is incorrect."],
  RATE_LIMITED: ["操作过于频繁，请稍后重试。", "Too many requests. Please try again later."],
  INVALID_ENDPOINT_URL: ["接口地址必须是有效的 HTTPS 地址。", "The endpoint must be a valid HTTPS address."],
  EMPTY_CSV: ["请选择一个非空的 CSV 文件。", "Choose a non-empty CSV file."],
  FILE_TOO_LARGE: ["文件不能超过 5 MB。", "The file must be 5 MB or smaller."],
  UNSUPPORTED_FILE_TYPE: ["目前仅支持 UTF-8 编码的 CSV 文件。", "Only UTF-8 CSV files are supported."],
  CSV_READ_FAILED: ["无法读取 CSV 文件，请检查文件内容和编码。", "The CSV file could not be read. Check its contents and encoding."],
  CSV_HEADER_UNSUPPORTED: ["未在表头中找到支持的商品字段，请参考标准模板。", "No supported product fields were found. Check the starter template."],
  CSV_NO_PRODUCTS: ["文件只有表头，请至少添加一条商品数据。", "The file has a header but no product rows."],
  IMPORT_NOT_FOUND: ["未找到该诊断报告。", "The catalog report was not found."],
  CONNECTION_NOT_FOUND: ["未找到该 API 连接。", "The API connection was not found."],
  TASK_NOT_FOUND: ["未找到该任务。", "The task was not found."],
  AUTHENTICATION_REQUIRED: ["登录状态已过期或尚未登录，请重新登录。", "Your session has expired or you are not signed in. Please sign in."],
  ACCESS_DENIED: ["你没有权限执行此操作。", "You do not have permission to perform this action."],
  MALFORMED_REQUEST: ["提交的数据格式不正确，请检查后重试。", "The submitted data is not in a valid format."],
  MISSING_PARAMETER: ["缺少必要信息，请检查后重试。", "Required information is missing."],
  UNSUPPORTED_MEDIA_TYPE: ["不支持此数据格式，请使用正确的文件或内容类型。", "This content type is not supported."],
  METHOD_NOT_ALLOWED: ["此操作暂不可用，请刷新页面后重试。", "This operation is unavailable. Refresh the page and try again."],
  INTERNAL_ERROR: ["服务暂时不可用，请稍后重试。", "The service is temporarily unavailable. Please try again later."],
  NOT_FOUND: ["未找到请求的内容。", "The requested content was not found."],
  RESOURCE_NOT_FOUND: ["未找到请求的内容。", "The requested content was not found."],
  NETWORK_ERROR: ["无法连接服务器，请检查网络后重试。", "Could not reach the server. Check your connection and try again."],
  REQUEST_TIMEOUT: ["请求超时，请稍后重试。", "The request timed out. Please try again."],
  REQUEST_CANCELLED: ["请求已取消。", "The request was cancelled."],
  INVALID_RESPONSE: ["服务器返回的数据格式异常，请稍后重试。", "The server returned an invalid response. Please try again later."],
};

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string, readonly retryAfter?: string | null) {
    super(message);
    this.name = "ApiError";
  }
}

function text(code: string, locale: AppLocale): string {
  return (messages[code] ?? messages.INVALID_REQUEST)[locale === "zh-CN" ? 0 : 1];
}

function statusCode(status: number): string {
  if (status === 401) return "AUTHENTICATION_REQUIRED";
  if (status === 403) return "ACCESS_DENIED";
  if (status === 404) return "NOT_FOUND";
  if (status === 413) return "FILE_TOO_LARGE";
  if (status === 429) return "RATE_LIMITED";
  if (status >= 500) return "INTERNAL_ERROR";
  return "INVALID_REQUEST";
}

export function problemMessage(locale: AppLocale, status: number, body: unknown, language: string | null): string {
  const problem: Problem = body && typeof body === "object" ? body : {};
  const detail = typeof problem.detail === "string" ? problem.detail.trim() : "";
  const matchingLanguage = language?.toLowerCase().split(",").some(value => locale === "zh-CN" ? value.trim().startsWith("zh") : value.trim().startsWith("en"));
  // Old servers and proxy errors may return English regardless of the requested locale.
  if (detail && matchingLanguage && (locale !== "zh-CN" || /[\u3400-\u9fff]/.test(detail))) return detail;
  const code = typeof problem.code === "string" && messages[problem.code] ? problem.code : statusCode(status);
  return text(code, locale);
}

export function localizedError(cause: unknown, locale: AppLocale): string {
  return cause instanceof ApiError ? cause.message : text("INTERNAL_ERROR", locale);
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

async function fetchApi<T>(locale: AppLocale, path: string, token: string | undefined, init: RequestInit, read: (response: Response) => Promise<T>): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept-Language", locale);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const controller = new AbortController();
  let timedOut = false;
  let responseStatus = 0;
  const abort = () => controller.abort();
  if (init.signal?.aborted) abort();
  else init.signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 60_000);
  try {
    const response = await fetch(`${apiBase}${path}`, { ...init, headers, signal: controller.signal });
    responseStatus = response.status;
    if (!response.ok) {
      const body: Problem | null = await response.json().catch(() => null);
      const code = typeof body?.code === "string" ? body.code : statusCode(response.status);
      throw new ApiError(response.status, code, problemMessage(locale, response.status, body, response.headers.get("Content-Language")), response.headers.get("Retry-After"));
    }
    return await read(response);
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    if (cause instanceof SyntaxError) throw new ApiError(responseStatus, "INVALID_RESPONSE", text("INVALID_RESPONSE", locale));
    const name = cause instanceof Error ? cause.name : "";
    const code = timedOut || name === "TimeoutError" ? "REQUEST_TIMEOUT" : name === "AbortError" ? "REQUEST_CANCELLED" : "NETWORK_ERROR";
    throw new ApiError(0, code, text(code, locale));
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener("abort", abort);
  }
}

export async function apiRequest<T>(locale: AppLocale, path: string, token?: string, init: RequestInit = {}): Promise<T> {
  return fetchApi(locale, path, token, init, async response => response.status === 204 ? undefined as T : await response.json() as T);
}

export async function downloadApiFile(locale: AppLocale, path: string, filename: string, token?: string): Promise<void> {
  const blob = await fetchApi(locale, path, token, {}, response => response.blob());
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
