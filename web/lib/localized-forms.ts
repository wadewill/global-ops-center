import type { AppLocale } from "./localized-api";

export function localizeInvalidField(target: EventTarget | null, locale: AppLocale): void {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
  const validity = target.validity;
  const zh = locale === "zh-CN";
  let message = "";
  if (validity.valueMissing) message = zh ? "请填写此项。" : "Please complete this field.";
  else if (validity.typeMismatch) message = target instanceof HTMLInputElement && target.type === "email" ? (zh ? "请输入有效的邮箱地址。" : "Enter a valid email address.") : (zh ? "请输入有效的网址。" : "Enter a valid URL.");
  else if (validity.tooShort && "minLength" in target) message = zh ? `至少需要 ${target.minLength} 个字符。` : `Use at least ${target.minLength} characters.`;
  else if (validity.tooLong && "maxLength" in target) message = zh ? `最多可输入 ${target.maxLength} 个字符。` : `Use no more than ${target.maxLength} characters.`;
  else if (!validity.valid) message = zh ? "请检查输入的信息是否符合要求。" : "Check that this value matches the required format.";
  target.setCustomValidity(message);
}

export function clearFieldValidity(target: EventTarget | null): void {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) target.setCustomValidity("");
}
