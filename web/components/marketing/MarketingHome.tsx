"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import ValueCalculator from "./ValueCalculator";
import { marketingText, type MarketingLocale } from "./marketing-text";
import styles from "./MarketingHome.module.css";

function ServiceIcon({ kind }: { kind: "check" | "report" | "task" | "api" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {kind === "check" ? <><circle cx="10" cy="10" r="6.5" /><path d="m15 15 6 6M7 10l2 2 4-4" /></> : kind === "report" ? <><path d="M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h6" /></> : kind === "task" ? <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v5M16 2v5M7 13l3 3 7-7" /></> : <><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></>}
  </svg>;
}

export default function MarketingHome({ locale = "zh-CN" }: { locale?: MarketingLocale }) {
  const t = (text: string) => marketingText(locale, text);
  const homeHref = locale === "en" ? "/en/product" : "/";
  const workspaceHref = locale === "en" ? "/en" : "/zh";
const categories = [t("全部商品"), t("服饰鞋包"), t("家居生活"), t("数码配件")] as const;
type Category = typeof categories[number];
const navigation = [
  { id: "home", label: t("首页") },
  { id: "catalog", label: t("商品示例") },
  { id: "services", label: t("商家工具") },
  { id: "example", label: t("效果对比") },
  { id: "value", label: t("收益测算") },
] as const;
const products = [
  { id: "shoe", name: t("米白轻量运动鞋"), category: t("服饰鞋包"), image: "/images/storefront/sneaker.webp", alt: t("米白色运动鞋示意商品图"), tag: t("变体检查"), issue: t("同款不同尺码，缺少分组"), field: "item_group_id", value: t("未填写"), severity: t("中优先级"), rule: "VARIANT_GROUP_MISSING", action: t("给同一款商品的不同尺码填写相同的 item_group_id，并为每个尺码保留独立 SKU。"), keywords: t("运动鞋 鞋子 尺码 颜色 SKU 变体 分组") },
  { id: "mug", name: t("日用陶瓷咖啡杯套装"), category: t("家居生活"), image: "/images/storefront/mugs.webp", alt: t("白色和浅棕色陶瓷咖啡杯示意商品图"), tag: t("价格检查"), issue: t("有商品、有图片，价格却是 0"), field: "price", value: "0", severity: t("高优先级"), rule: "PRICE_INVALID", action: t("确认商品的实际售价，在原始数据中填写大于 0 的有效价格，再重新运行诊断。"), keywords: t("杯子 咖啡 陶瓷 家居 价格 异常") },
  { id: "audio", name: t("无线头戴式耳机"), category: t("数码配件"), image: "/images/storefront/headphones.webp", alt: t("黑色头戴式耳机示意商品图"), tag: t("标识检查"), issue: t("商品 GTIN 位数不符合格式"), field: "gtin", value: "12345", severity: t("中优先级"), rule: "GTIN_FORMAT", action: t("核对制造商提供的 GTIN，确认是 8、12、13 或 14 位数字。不要自行编造商品标识。"), keywords: t("耳机 无线 数码 标识 GTIN 条码") },
];
const faqs = [
  [t("这些商品可以直接购买吗？"), t("这里是商品数据检查的演示，不是实物商城。图片和商品资料用于说明常见问题；你可以进入工作空间检查自己的商品。")],
  [t("效果示例里的订单提升有保证吗？"), t("没有。20,000 次访问、1.5% 到 1.8% 的转化率是可复算的假设，订单相差 60 单。它不是客户实绩或效果承诺，实际改善需要通过店铺数据验证。")],
  [t("现在能直接同步平台商品吗？"), t("当前支持保存 Shopify 和自定义 API 的连接配置。原生授权、商品拉取及定时同步仍在规划中。当前可通过 CSV 辅助入口运行诊断。")],
  [t("体验后会自动收费或修改商品吗？"), t("不会。当前功能免费体验，在线订阅尚未开放。诊断只提供问题与修复建议，实际商品需要你在原平台修改。")],
];


  const [activeSection, setActiveSection] = useState<string>("home");
  useEffect(() => {
    let frame = 0;
    function updateSection() {
      frame = 0;
      let current: string = "home";
      for (const item of navigation) {
        const target = document.getElementById(item.id);
        if (target && target.getBoundingClientRect().top <= 100) current = item.id;
      }
      setActiveSection(current);
    }
    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateSection);
    }
    updateSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("hashchange", scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [locale]);
  const [category, setCategory] = useState<Category>(t("全部商品"));
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const searchTerm = query.replace(/\s+/g, "").toLowerCase();
  const visible = products.filter(item => (category === t("全部商品") || item.category === category) && `${item.name} ${item.issue} ${item.keywords}`.replace(/\s+/g, "").toLowerCase().includes(searchTerm));

  function findExamples(value: string) {
    setDraft(value);
    setQuery(value);
    setCategory(t("全部商品"));
    document.getElementById("catalog")?.scrollIntoView({ behavior: "auto", block: "start" });
  }
  function search(event: FormEvent) { event.preventDefault(); findExamples(draft); }

  return <div id="home" className={styles.page} lang={locale}>
    <a className={styles.skip} href="#main">{t("跳到正文")}</a>
    <div className={styles.utility}><div><span>{t("ListingScore 商家服务")}</span><nav aria-label={t("快捷导航")}><Link href={workspaceHref}>{t("我的个人中心")}</Link><a href="#help">{t("帮助中心")}</a><Link href={locale === "en" ? "/" : "/en/product"} lang={locale === "en" ? "zh-CN" : "en"}>{locale === "en" ? "中文" : "English"}</Link></nav></div></div>
    <header className={styles.header}>
      <Link href={homeHref} className={styles.logo} aria-label={t("ListingScore 产品首页")}><b>LS</b><span>ListingScore<small>{t("商品检查 · 运营工具")}</small></span></Link>
      <div className={styles.searchArea}>
        <form className={styles.search} role="search" aria-label={t("搜索商品检查示例")} onSubmit={search}><label className={styles.srOnly} htmlFor="example-search">{t("搜索商品检查示例")}</label><input id="example-search" type="search" value={draft} onChange={e => setDraft(e.target.value)} placeholder={t("搜索商品示例或问题，如运动鞋、价格、GTIN")} maxLength={80} /><button type="submit">{t("搜索示例")}</button></form>
        <div className={styles.hotSearch}>{t("常见问题：")}{[t("价格异常"), t("变体分组"), "GTIN"].map(word => <button key={word} onClick={() => findExamples(word === t("变体分组") ? t("变体") : word === t("价格异常") ? t("价格") : word)}>{word}</button>)}</div>
      </div>
      <Link href={`${workspaceHref}?tab=diagnosis`} className={styles.headerAction}><ServiceIcon kind="check" />{t("检查我的商品")}</Link>
    </header>
    <div className={styles.navBar}><nav aria-label={t("首页导航")}><a className={styles.categoryNav} href="#catalog">{t("商品检查分类")}<span aria-hidden="true">☰</span></a>{navigation.map(item => <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? styles.activeNav : undefined} aria-current={activeSection === item.id ? "location" : undefined}>{item.label}</a>)}<Link className={styles.workspaceNav} href={workspaceHref}>{t("个人中心")}</Link></nav></div>

    <main id="main" className={styles.main}>
      <div className={styles.showcase}>
        <aside className={styles.categoryMenu} aria-label={t("商品分类")}>
          <h2>{t("按类目看示例")}</h2>
          {categories.slice(1).map((item, index) => <button key={item} onClick={() => {setCategory(item);setQuery("");setDraft("");document.getElementById("catalog")?.scrollIntoView({block:"start"});}}><span><b>{item}</b><small>{[t("运动鞋 / 尺码 / 变体"), t("杯具 / 家居 / 价格"), t("耳机 / 标识 / 条码")][index]}</small></span><i aria-hidden="true">›</i></button>)}
          <a href="#services">{t("更多商家服务")}<span aria-hidden="true">›</span></a>
        </aside>
        <section className={styles.banner}>
          <div className={styles.bannerCopy}><p>{t("商品上新 · 准备专区")}</p><h1>{t("上架前先检查，")}<br />{t("少一点返工。")}</h1><span>{t("价格、图片链接、SKU、变体信息")}<br />{t("把容易遗漏的问题，一次理清。")}</span><Link href={`${workspaceHref}?tab=diagnosis`} className={styles.primary}>{t("免费检查我的商品")}</Link><small>{t("当前免费体验，无需绑定支付方式")}</small></div>
          <div className={styles.bannerImage}><img src="/images/storefront/sneaker.webp" alt={t("米白运动鞋商品陈列示意")} width="500" height="500" fetchPriority="high" /><span>{t("商品示意 · 变体信息检查")}</span></div>
        </section>
        <aside className={styles.welcome}><span className={styles.avatar} aria-hidden="true">LS</span><h2>{t("Hi，欢迎来到 ListingScore")}</h2><p>{t("你的商品，上架准备好了吗？")}</p><Link href={workspaceHref} className={styles.primary}>{t("进入工作空间")}</Link><a href="#catalog" className={styles.outline}>{t("先看看检查示例")}</a><div className={styles.welcomeFacts}><span><b>{t("检查")}</b><small>{t("发现问题")}</small></span><span><b>{t("建议")}</b><small>{t("明确动作")}</small></span><span><b>{t("任务")}</b><small>{t("跟进处理")}</small></span></div><small className={styles.notice}>{t("当前不会自动修改店铺商品")}</small></aside>
      </div>

      <div className={styles.serviceStrip}><span><b>{t("商品信息检查")}</b><small>{t("先发现，后上架")}</small></span><span><b>{t("修复建议清晰")}</b><small>{t("知道下一步怎么改")}</small></span><span><b>{t("报告私密保存")}</b><small>{t("回看每一次诊断")}</small></span><span><b>{t("当前免费体验")}</b><small>{t("无自动订阅扣费")}</small></span></div>

      <section id="catalog" className={styles.catalog}>
        <div className={styles.sectionHeading}><div><h2>{t("商品检查示例")}</h2><p>{t("点击商品卡片，看看问题出在哪、建议怎么改。")}</p></div><span className={styles.demoLabel}>{t("示意商品 · 非实物售卖")}</span></div>
        <div className={styles.categoryTabs} aria-label={t("示例类目筛选")}>{categories.map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}<span role="status">{query ? `“${query}” · ` : ""}{visible.length}{t("个示例")}</span>{query && <button className={styles.clear} onClick={() => {setQuery("");setDraft("");}}>{t("清除搜索")}</button>}</div>
        <div className={styles.catalogGrid}>
          <div className={styles.products}>
            {visible.map(item => <article className={styles.productCard} key={item.id}>
              <div className={styles.productImage}><img src={item.image} alt={item.alt} width="400" height="400" loading="lazy" /><span>{item.tag}</span></div>
              <div className={styles.productInfo}><small>{item.category}{t("· 示例商品")}</small><h3>{item.name}</h3><p className={styles.issue}><i aria-hidden="true">!</i>{item.issue}</p><div className={styles.productMeta}><span>{item.severity}</span><small>{t("1 项示例问题")}</small></div><details><summary>{t("查看问题与修复建议")}<span aria-hidden="true">＋</span></summary><div className={styles.repair}><p><b>{t("问题字段：")}</b>{item.field}</p><p><b>{t("当前示例值：")}</b>{item.value}</p><p>{item.action}</p><Link href={`${workspaceHref}?tab=diagnosis`}>{t("检查我自己的商品 →")}</Link></div></details></div>
            </article>)}
            {!visible.length && <div className={styles.noResults}><h3>{t("没有找到匹配的商品示例")}</h3><p>{t("可以试试“运动鞋”“价格”或“GTIN”。搜索仅覆盖这里的演示商品。")}</p><button onClick={() => {setCategory(t("全部商品"));setQuery("");setDraft("");}}>{t("查看全部示例")}</button></div>}
          </div>
          <aside className={styles.experience}><p>{t("商家工具体验")}</p><h3>{t("商品目录诊断")}</h3><div className={styles.experiencePrice}><small>{t("体验价")}</small><strong>¥<b>0</b></strong><span>{t("当前免费")}</span></div><ul><li>{t("检查关键商品字段")}</li><li>{t("生成问题清单与建议")}</li><li>{t("自动创建修复任务")}</li><li>{t("保存私密诊断报告")}</li></ul><Link href={`${workspaceHref}?tab=diagnosis`} className={styles.primary}>{t("立即体验")}</Link><small>{t("当前通过 CSV 辅助入口诊断")}<br />{t("不代表平台原生同步已上线")}</small></aside>
        </div>
        <p className={styles.caption}>{t("商品图为生成的陈列示意，问题与字段为演示数据。实际诊断以你提交的商品数据为准。")}</p>
      </section>

      <section id="services" className={styles.services}><div className={styles.sectionHeading}><div><h2>{t("商家常用工具")}</h2><p>{t("从发现问题，到完成一次修复。")}</p></div><Link href={workspaceHref}>{t("全部工具 →")}</Link></div><div className={styles.toolGrid}>{[
        {kind:"check" as const,title:t("商品诊断"),copy:t("价格、图片链接、商品标识与变体检查"),href:`${workspaceHref}?tab=diagnosis`,action:t("开始检查")},
        {kind:"report" as const,title:t("历史报告"),copy:t("回看质量评分与历史诊断记录"),href:workspaceHref,action:t("查看报告")},
        {kind:"task" as const,title:t("修复任务"),copy:t("待处理、处理中、已完成，逐项跟进"),href:`${workspaceHref}/tasks`,action:t("进入任务中心")},
        {kind:"api" as const,title:t("API 连接配置"),copy:t("加密保存连接信息，原生同步待上线"),href:`${workspaceHref}?tab=connections`,action:t("管理配置")},
      ].map(tool => <Link key={tool.kind} href={tool.href} className={styles.tool}><ServiceIcon kind={tool.kind} /><h3>{tool.title}</h3><p>{tool.copy}</p><span>{tool.action} →</span></Link>)}</div></section>

      <section id="example" className={styles.example}><div className={styles.exampleLead}><span>{t("经营效果 · 假设算例")}</span><h2>{t("同样的流量，")}<br />{t("差多少订单？")}</h2><p>{t("假设转化率从 1.5% 到 1.8%，")}<br />{t("每月 20,000 次访问，对应多 60 单。")}</p><a href="#value">{t("用自己的数字算一算 →")}</a></div><div className={styles.exampleNumbers}><div><span>{t("月访问量保持不变")}</span><b>20,000<small>{t("次")}</small></b></div><div><span>{t("当前情景")}</span><b>300<small>{t("单")}</small></b><small>{t("转化率 1.5%")}</small></div><div><span>{t("目标情景")}</span><b>360<small>{t("单")}</small></b><small>{t("假设转化率 1.8%")}</small></div><div className={styles.extra}><span>{t("两种情景相差")}</span><b>+60<small>{t("单")}</small></b><small>{t("+0.3 个百分点")}</small></div><p>{t("仅为数学情景，非客户实绩或效果承诺；实际结果受商品、流量质量与修复执行影响。")}</p></div></section>
      <ValueCalculator locale={locale} />

      <section id="help" className={styles.help}><div className={styles.sectionHeading}><h2>{t("使用前，你可能想了解")}</h2><span>{t("帮助中心")}</span></div><div className={styles.faqGrid}>{faqs.map(([question,answer]) => <details key={question}><summary>{question}<span aria-hidden="true">＋</span></summary><p>{answer}</p></details>)}</div></section>
      <section className={styles.bottomBanner}><div><h2>{t("下一次上新，先把商品检查一遍。")}</h2><p>{t("找到问题，拿到建议，开始处理。")}</p></div><Link href={`${workspaceHref}?tab=diagnosis`} className={styles.primary}>{t("免费检查我的商品")}</Link></section>
    </main>
    <footer className={styles.footer}><div><Link href={homeHref} className={styles.footerLogo}>ListingScore</Link><span>{t("商品检查 · 运营工具")}</span><nav aria-label={t("页脚导航")}><Link href={workspaceHref}>{t("中文个人中心")}</Link><Link href={locale === "en" ? "/zh" : "/en"}>{locale === "en" ? "中文工作空间" : "English workspace"}</Link><a href="#help">{t("使用帮助")}</a><a href="#home">{t("返回顶部 ↑")}</a></nav></div><p>{t("当前提供商品诊断与修复任务管理。平台自动同步、团队分派与在线订阅仍在规划中。")}</p></footer>
  </div>;
}
