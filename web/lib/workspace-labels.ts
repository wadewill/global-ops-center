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

const fields: Record<string, string> = {
  sku: "商品 SKU", title: "商品标题", description: "商品描述", price: "价格", image_link: "图片链接", imageUrl: "图片链接", image_url: "图片链接",
  availability: "库存状态", inventory: "库存", brand: "品牌", gtin: "商品条码 GTIN", item_group_id: "变体分组", size: "尺码", color: "颜色", link: "商品链接",
};
export function fieldLabel(value: string, locale: AppLocale): string {
  return locale === "zh-CN" ? fields[value] ?? value : value;
}
