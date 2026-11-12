export type ValueInputKey = "visits" | "currentRate" | "targetRate" | "orderValue" | "margin" | "budget";
export type ValueInputs = Record<ValueInputKey, string>;

export const valueFields: { key: ValueInputKey; label: string; unit: string; min: number; max: number; step: string; hint: string }[] = [
  { key: "visits", label: "每月店铺访问量", unit: "次", min: 0, max: 10_000_000, step: "1", hint: "两种情景使用相同访问量" },
  { key: "currentRate", label: "当前下单转化率", unit: "%", min: 0, max: 100, step: "0.01", hint: "下单数 ÷ 访问量 × 100%" },
  { key: "targetRate", label: "你设定的目标转化率", unit: "%", min: 0, max: 100, step: "0.01", hint: "自行设定，不是产品效果预测" },
  { key: "orderValue", label: "平均每单金额", unit: "元", min: 0, max: 1_000_000, step: "0.01", hint: "客单价，按人民币统一测算" },
  { key: "margin", label: "商品毛利率", unit: "%", min: 0, max: 100, step: "0.01", hint: "不含广告、人工等其他费用" },
  { key: "budget", label: "工具月预算", unit: "元", min: 0, max: 10_000_000, step: "0.01", hint: "预算假设，不是 ListingScore 售价" },
];

export const defaultValueInputs: ValueInputs = {
  visits: "20000", currentRate: "1.5", targetRate: "1.8", orderValue: "200", margin: "30", budget: "299",
};

export type ValueResult = {
  beforeOrders: number;
  afterOrders: number;
  extraOrders: number;
  percentagePoints: number;
  extraRevenue: number;
  extraGrossProfit: number;
  afterBudget: number;
};

const roundMoney = (number: number) => Math.round((number + Number.EPSILON) * 100) / 100;

export function calculateValue(inputs: ValueInputs): { errors: Partial<Record<ValueInputKey, string>>; result: ValueResult | null } {
  const errors: Partial<Record<ValueInputKey, string>> = {};
  const values = {} as Record<ValueInputKey, number>;
  for (const field of valueFields) {
    const raw = inputs[field.key].trim();
    const value = Number(raw);
    if (!raw || !Number.isFinite(value)) {
      errors[field.key] = `请填写有效的${field.label}`;
    } else if (value < field.min || value > field.max) {
      errors[field.key] = `请输入 ${field.min} 至 ${field.max.toLocaleString("zh-CN")} 之间的数值`;
    } else if (field.key === "visits" && !Number.isInteger(value)) {
      errors[field.key] = "访问量请填写整数";
    } else if (field.key !== "visits" && Math.abs(value * 100 - Math.round(value * 100)) > 0.000001) {
      errors[field.key] = "请最多保留 2 位小数";
    }
    values[field.key] = value;
  }
  if (Object.keys(errors).length) return { errors, result: null };

  const beforeOrders = Math.round(values.visits * values.currentRate / 100);
  const afterOrders = Math.round(values.visits * values.targetRate / 100);
  const extraOrders = afterOrders - beforeOrders;
  const extraRevenue = roundMoney(extraOrders * values.orderValue);
  const extraGrossProfit = roundMoney(extraRevenue * values.margin / 100);
  return { errors, result: {
    beforeOrders,
    afterOrders,
    extraOrders,
    percentagePoints: roundMoney(values.targetRate - values.currentRate),
    extraRevenue,
    extraGrossProfit,
    afterBudget: roundMoney(extraGrossProfit - values.budget),
  } };
}
