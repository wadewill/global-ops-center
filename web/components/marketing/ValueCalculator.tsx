"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { calculateValue, defaultValueInputs, valueFields, type ValueInputs } from "./value-model";
import styles from "./ValueCalculator.module.css";

const number = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 });
function signed(value: number) { return `${value > 0 ? "+" : ""}${number.format(value)}`; }
function money(value: number) { return `${value < 0 ? "−" : ""}¥${number.format(Math.abs(value))}`; }

export default function ValueCalculator() {
  const [inputs, setInputs] = useState<ValueInputs>({ ...defaultValueInputs });
  const { errors, result } = useMemo(() => calculateValue(inputs), [inputs]);

  return (
    <section id="value" className={styles.section} aria-labelledby="value-title">
      <div className={styles.heading}>
        <div><p className={styles.eyebrow}>算一笔属于你的账</p><h2 id="value-title">一次小幅改善，<br />对你的生意值多少钱？</h2></div>
        <p>填入自己的经营数据，比较当前与目标情景。先看清改善空间，再判断值得投入多少。</p>
      </div>
      <div className={styles.calculator}>
        <div className={styles.inputs}>
          <div className={styles.inputHeader}><span>01 / 你的经营假设</span><button type="button" onClick={() => setInputs({ ...defaultValueInputs })}>恢复示例</button></div>
          <div className={styles.fields}>
            {valueFields.map(field => (
              <div className={styles.field} key={field.key}>
                <label htmlFor={`value-${field.key}`}>{field.label}</label>
                <div className={styles.inputWrap}>
                  <input id={`value-${field.key}`} type="number" inputMode={field.key === "visits" ? "numeric" : "decimal"} min={field.min} max={field.max} step={field.step} value={inputs[field.key]} aria-invalid={Boolean(errors[field.key])} aria-describedby={`value-${field.key}-help${errors[field.key] ? ` value-${field.key}-error` : ""}`} onChange={event => setInputs(current => ({ ...current, [field.key]: event.target.value }))} />
                  <span aria-hidden="true">{field.unit}</span>
                </div>
                <small id={`value-${field.key}-help`}>{field.hint}</small>
                {errors[field.key] && <span className={styles.error} id={`value-${field.key}-error`}>{errors[field.key]}</span>}
              </div>
            ))}
          </div>
          <p className={styles.privacy}>仅在当前页面计算，不上传或保存你的经营数据。</p>
        </div>
        <div className={styles.results} aria-live="polite" aria-atomic="true">
          <div className={styles.resultHeader}><span>02 / 目标情景测算</span><span className={styles.example}>假设测算</span></div>
          {result ? <>
            <div className={styles.orderComparison}>
              <div><span>当前月订单</span><strong>{number.format(result.beforeOrders)}</strong></div>
              <span className={styles.arrow} aria-hidden="true">→</span>
              <div><span>目标月订单</span><strong>{number.format(result.afterOrders)}</strong></div>
            </div>
            <p className={styles.change}>同等访问量，转化率变化 <b>{signed(result.percentagePoints)} 个百分点</b></p>
            <div className={styles.total}><span>潜在增量订单 / 月</span><strong>{signed(result.extraOrders)}<small> 单</small></strong></div>
            <dl className={styles.breakdown}>
              <div><dt>潜在增量营收</dt><dd>{money(result.extraRevenue)}</dd></div>
              <div><dt>潜在增量毛利</dt><dd>{money(result.extraGrossProfit)}</dd></div>
              <div className={styles.net}><dt>增量毛利 − 工具月预算</dt><dd>{money(result.afterBudget)}</dd></div>
            </dl>
            <p className={styles.resultNote}>{result.afterBudget > 0 ? "如果达到你设定的目标，以上是扣除工具预算后的毛利余额。" : result.afterBudget === 0 ? "在当前假设下，增量毛利刚好覆盖工具预算。" : "在当前假设下，增量毛利不足以覆盖工具预算，可以调整目标或预算重新评估。"}销售额不等于利润，结果未扣除其他新增费用。</p>
          </> : <div className={styles.invalid}><b>完善数据，看看你的改善空间</b><p>请修正左侧标出的数值，结果会自动更新。</p></div>}
          <Link href="/zh?tab=diagnosis" className={styles.cta}>先找出我的商品问题 <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <div className={styles.method}>
        <p><b>这些数字如何得出？</b> 月订单 = 访问量 × 转化率（四舍五入为整数）；增量营收 = 增量订单 × 客单价；增量毛利 = 增量营收 × 毛利率。</p>
        <p>这是你设定目标后的数学情景，并非客户实绩或效果承诺。ListingScore 当前不采集浏览量、订单或广告归因数据；实际改善需要通过店铺数据验证。</p>
      </div>
    </section>
  );
}
