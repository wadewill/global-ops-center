import type { AppLocale } from "./localized-api";

const labels: Record<string, readonly [string, string]> = {
  SHOPIFY: ["Shopify", "Shopify"], CUSTOM_API: ["自定义 REST API", "Custom REST API"],
  AMAZON_SELLER: ["亚马逊卖家平台", "Amazon Seller Central"], WALMART: ["沃尔玛电商平台", "Walmart Marketplace"], GOOGLE_MERCHANT: ["Google 商家中心", "Google Merchant Center"],
  ACCESS_TOKEN: ["访问令牌", "Access token"], API_KEY: ["API 密钥", "API key"], BEARER_TOKEN: ["Bearer 令牌", "Bearer token"],
  CONFIGURED: ["已配置", "Configured"], VERIFIED: ["已标记验证", "Marked verified"], ERROR: ["连接异常", "Connection error"], DISCONNECTED: ["未连接", "Disconnected"],
  MEMBER: ["成员", "Member"], ADMIN: ["管理员", "Administrator"],
  BLOCKER: ["阻断", "Blocker"], HIGH: ["高优先级", "High priority"], MEDIUM: ["中优先级", "Medium priority"], OPPORTUNITY: ["优化建议", "Opportunity"],
  OPEN: ["待处理", "Open"], IN_PROGRESS: ["处理中", "In progress"], DONE: ["已完成", "Done"],
};

export function workspaceLabel(value: string, locale: AppLocale): string {
  return labels[value]?.[locale === "zh-CN" ? 0 : 1] ?? (locale === "zh-CN" ? "其他" : "Other");
}

const fields: Record<string, readonly [string, string]> = {
  sku: ["商品 SKU", "SKU"], title: ["商品标题", "Product title"], description: ["商品描述", "Description"], price: ["价格", "Price"],
  image_link: ["图片链接", "Image URL"], imageUrl: ["图片链接", "Image URL"], image_url: ["图片链接", "Image URL"],
  availability: ["库存状态", "Availability"], inventory: ["库存", "Inventory"], brand: ["品牌", "Brand"], gtin: ["商品条码 GTIN", "GTIN"],
  item_group_id: ["变体分组", "Variant group"], size: ["尺码", "Size"], color: ["颜色", "Color"], link: ["商品链接", "Product URL"],
};
export function fieldLabel(value: string, locale: AppLocale): string {
  return fields[value]?.[locale === "zh-CN" ? 0 : 1] ?? value;
}
