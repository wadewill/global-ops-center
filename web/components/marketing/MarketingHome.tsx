"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import ValueCalculator from "./ValueCalculator";
import styles from "./MarketingHome.module.css";

const categories = ["全部商品", "服饰鞋包", "家居生活", "数码配件"] as const;
type Category = typeof categories[number];
const products = [
  { id: "shoe", name: "米白轻量运动鞋", category: "服饰鞋包", image: "/images/storefront/sneaker.webp", alt: "米白色运动鞋示意商品图", tag: "变体检查", issue: "同款不同尺码，缺少分组", field: "item_group_id", value: "未填写", severity: "中优先级", rule: "VARIANT_GROUP_MISSING", action: "给同一款商品的不同尺码填写相同的 item_group_id，并为每个尺码保留独立 SKU。", keywords: "运动鞋 鞋子 尺码 颜色 SKU 变体 分组" },
  { id: "mug", name: "日用陶瓷咖啡杯套装", category: "家居生活", image: "/images/storefront/mugs.webp", alt: "白色和浅棕色陶瓷咖啡杯示意商品图", tag: "价格检查", issue: "有商品、有图片，价格却是 0", field: "price", value: "0", severity: "高优先级", rule: "PRICE_INVALID", action: "确认商品的实际售价，在原始数据中填写大于 0 的有效价格，再重新运行诊断。", keywords: "杯子 咖啡 陶瓷 家居 价格 异常" },
  { id: "audio", name: "无线头戴式耳机", category: "数码配件", image: "/images/storefront/headphones.webp", alt: "黑色头戴式耳机示意商品图", tag: "标识检查", issue: "商品 GTIN 位数不符合格式", field: "gtin", value: "12345", severity: "中优先级", rule: "GTIN_FORMAT", action: "核对制造商提供的 GTIN，确认是 8、12、13 或 14 位数字。不要自行编造商品标识。", keywords: "耳机 无线 数码 标识 GTIN 条码" },
];
const faqs = [
  ["这些商品可以直接购买吗？", "这里是商品数据检查的演示，不是实物商城。图片和商品资料用于说明常见问题；你可以进入工作空间检查自己的商品。"],
  ["效果示例里的订单提升有保证吗？", "没有。20,000 次访问、1.5% 到 1.8% 的转化率是可复算的假设，订单相差 60 单。它不是客户实绩或效果承诺，实际改善需要通过店铺数据验证。"],
  ["现在能直接同步平台商品吗？", "当前支持保存 Shopify 和自定义 API 的连接配置。原生授权、商品拉取及定时同步仍在规划中。当前可通过 CSV 辅助入口运行诊断。"],
  ["体验后会自动收费或修改商品吗？", "不会。当前功能免费体验，在线订阅尚未开放。诊断只提供问题与修复建议，实际商品需要你在原平台修改。"],
];

function ServiceIcon({ kind }: { kind: "check" | "report" | "task" | "api" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {kind === "check" ? <><circle cx="10" cy="10" r="6.5" /><path d="m15 15 6 6M7 10l2 2 4-4" /></> : kind === "report" ? <><path d="M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h6" /></> : kind === "task" ? <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v5M16 2v5M7 13l3 3 7-7" /></> : <><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></>}
  </svg>;
}

export default function MarketingHome() {
  const [category, setCategory] = useState<Category>("全部商品");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const searchTerm = query.replace(/\s+/g, "").toLowerCase();
  const visible = products.filter(item => (category === "全部商品" || item.category === category) && `${item.name} ${item.issue} ${item.keywords}`.replace(/\s+/g, "").toLowerCase().includes(searchTerm));

  function findExamples(value: string) {
    setDraft(value);
    setQuery(value);
    setCategory("全部商品");
    document.getElementById("catalog")?.scrollIntoView({ behavior: "auto", block: "start" });
  }
  function search(event: FormEvent) { event.preventDefault(); findExamples(draft); }

  return <div className={styles.page} lang="zh-CN">
    <a className={styles.skip} href="#main">跳到正文</a>
    <div className={styles.utility}><div><span>ListingScore 商家服务</span><nav aria-label="快捷导航"><Link href="/zh">我的工作空间</Link><a href="#help">帮助中心</a><Link href="/en">English</Link></nav></div></div>
    <header className={styles.header}>
      <Link href="/" className={styles.logo} aria-label="ListingScore 产品首页"><b>LS</b><span>ListingScore<small>商品检查 · 运营工具</small></span></Link>
      <div className={styles.searchArea}>
        <form className={styles.search} role="search" aria-label="搜索商品检查示例" onSubmit={search}><label className={styles.srOnly} htmlFor="example-search">搜索商品检查示例</label><input id="example-search" type="search" value={draft} onChange={e => setDraft(e.target.value)} placeholder="搜索商品示例或问题，如运动鞋、价格、GTIN" maxLength={80} /><button type="submit">搜索示例</button></form>
        <div className={styles.hotSearch}>常见问题：{["价格异常", "变体分组", "GTIN"].map(word => <button key={word} onClick={() => findExamples(word === "变体分组" ? "变体" : word === "价格异常" ? "价格" : word)}>{word}</button>)}</div>
      </div>
      <Link href="/zh?tab=diagnosis" className={styles.headerAction}><ServiceIcon kind="check" />检查我的商品</Link>
    </header>
    <div className={styles.navBar}><nav aria-label="首页导航"><a className={styles.categoryNav} href="#catalog">商品检查分类 <span aria-hidden="true">☰</span></a><a className={styles.activeNav} href="#main">首页</a><a href="#catalog">商品示例</a><a href="#services">商家工具</a><a href="#example">效果对比</a><a href="#value">收益测算</a></nav></div>

    <main id="main" className={styles.main}>
      <div className={styles.showcase}>
        <aside className={styles.categoryMenu} aria-label="商品分类">
          <h2>按类目看示例</h2>
          {categories.slice(1).map((item, index) => <button key={item} onClick={() => {setCategory(item);setQuery("");setDraft("");document.getElementById("catalog")?.scrollIntoView({block:"start"});}}><span><b>{item}</b><small>{["运动鞋 / 尺码 / 变体", "杯具 / 家居 / 价格", "耳机 / 标识 / 条码"][index]}</small></span><i aria-hidden="true">›</i></button>)}
          <a href="#services">更多商家服务 <span aria-hidden="true">›</span></a>
        </aside>
        <section className={styles.banner}>
          <div className={styles.bannerCopy}><p>商品上新 · 准备专区</p><h1>上架前先检查，<br />少一点返工。</h1><span>价格、图片链接、SKU、变体信息<br />把容易遗漏的问题，一次理清。</span><Link href="/zh?tab=diagnosis" className={styles.primary}>免费检查我的商品</Link><small>当前免费体验，无需绑定支付方式</small></div>
          <div className={styles.bannerImage}><img src="/images/storefront/sneaker.webp" alt="米白运动鞋商品陈列示意" width="500" height="500" fetchPriority="high" /><span>商品示意 · 变体信息检查</span></div>
        </section>
        <aside className={styles.welcome}><span className={styles.avatar} aria-hidden="true">LS</span><h2>Hi，欢迎来到 ListingScore</h2><p>你的商品，上架准备好了吗？</p><Link href="/zh" className={styles.primary}>进入工作空间</Link><a href="#catalog" className={styles.outline}>先看看检查示例</a><div className={styles.welcomeFacts}><span><b>检查</b><small>发现问题</small></span><span><b>建议</b><small>明确动作</small></span><span><b>任务</b><small>跟进处理</small></span></div><small className={styles.notice}>当前不会自动修改店铺商品</small></aside>
      </div>

      <div className={styles.serviceStrip}><span><b>商品信息检查</b><small>先发现，后上架</small></span><span><b>修复建议清晰</b><small>知道下一步怎么改</small></span><span><b>报告私密保存</b><small>回看每一次诊断</small></span><span><b>当前免费体验</b><small>无自动订阅扣费</small></span></div>

      <section id="catalog" className={styles.catalog}>
        <div className={styles.sectionHeading}><div><h2>商品检查示例</h2><p>点击商品卡片，看看问题出在哪、建议怎么改。</p></div><span className={styles.demoLabel}>示意商品 · 非实物售卖</span></div>
        <div className={styles.categoryTabs} aria-label="示例类目筛选">{categories.map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}<span role="status">{query ? `“${query}” · ` : ""}{visible.length} 个示例</span>{query && <button className={styles.clear} onClick={() => {setQuery("");setDraft("");}}>清除搜索</button>}</div>
        <div className={styles.catalogGrid}>
          <div className={styles.products}>
            {visible.map(item => <article className={styles.productCard} key={item.id}>
              <div className={styles.productImage}><img src={item.image} alt={item.alt} width="400" height="400" loading="lazy" /><span>{item.tag}</span></div>
              <div className={styles.productInfo}><small>{item.category} · 示例商品</small><h3>{item.name}</h3><p className={styles.issue}><i aria-hidden="true">!</i>{item.issue}</p><div className={styles.productMeta}><span>{item.severity}</span><small>1 项示例问题</small></div><details><summary>查看问题与修复建议 <span aria-hidden="true">＋</span></summary><div className={styles.repair}><p><b>问题字段：</b>{item.field}</p><p><b>当前示例值：</b>{item.value}</p><p>{item.action}</p><Link href="/zh?tab=diagnosis">检查我自己的商品 →</Link></div></details></div>
            </article>)}
            {!visible.length && <div className={styles.noResults}><h3>没有找到匹配的商品示例</h3><p>可以试试“运动鞋”“价格”或“GTIN”。搜索仅覆盖这里的演示商品。</p><button onClick={() => {setCategory("全部商品");setQuery("");setDraft("");}}>查看全部示例</button></div>}
          </div>
          <aside className={styles.experience}><p>商家工具体验</p><h3>商品目录诊断</h3><div className={styles.experiencePrice}><small>体验价</small><strong>¥<b>0</b></strong><span>当前免费</span></div><ul><li>检查关键商品字段</li><li>生成问题清单与建议</li><li>自动创建修复任务</li><li>保存私密诊断报告</li></ul><Link href="/zh?tab=diagnosis" className={styles.primary}>立即体验</Link><small>当前通过 CSV 辅助入口诊断<br />不代表平台原生同步已上线</small></aside>
        </div>
        <p className={styles.caption}>商品图为生成的陈列示意，问题与字段为演示数据。实际诊断以你提交的商品数据为准。</p>
      </section>

      <section id="services" className={styles.services}><div className={styles.sectionHeading}><div><h2>商家常用工具</h2><p>从发现问题，到完成一次修复。</p></div><Link href="/zh">全部工具 →</Link></div><div className={styles.toolGrid}>{[
        {kind:"check" as const,title:"商品诊断",copy:"价格、图片链接、商品标识与变体检查",href:"/zh?tab=diagnosis",action:"开始检查"},
        {kind:"report" as const,title:"历史报告",copy:"回看质量评分与历史诊断记录",href:"/zh",action:"查看报告"},
        {kind:"task" as const,title:"修复任务",copy:"待处理、处理中、已完成，逐项跟进",href:"/zh/tasks",action:"进入任务中心"},
        {kind:"api" as const,title:"API 连接配置",copy:"加密保存连接信息，原生同步待上线",href:"/zh?tab=connections",action:"管理配置"},
      ].map(tool => <Link key={tool.kind} href={tool.href} className={styles.tool}><ServiceIcon kind={tool.kind} /><h3>{tool.title}</h3><p>{tool.copy}</p><span>{tool.action} →</span></Link>)}</div></section>

      <section id="example" className={styles.example}><div className={styles.exampleLead}><span>经营效果 · 假设算例</span><h2>同样的流量，<br />差多少订单？</h2><p>假设转化率从 1.5% 到 1.8%，<br />每月 20,000 次访问，对应多 60 单。</p><a href="#value">用自己的数字算一算 →</a></div><div className={styles.exampleNumbers}><div><span>月访问量保持不变</span><b>20,000<small> 次</small></b></div><div><span>当前情景</span><b>300<small> 单</small></b><small>转化率 1.5%</small></div><div><span>目标情景</span><b>360<small> 单</small></b><small>假设转化率 1.8%</small></div><div className={styles.extra}><span>两种情景相差</span><b>+60<small> 单</small></b><small>+0.3 个百分点</small></div><p>仅为数学情景，非客户实绩或效果承诺；实际结果受商品、流量质量与修复执行影响。</p></div></section>
      <ValueCalculator />

      <section id="help" className={styles.help}><div className={styles.sectionHeading}><h2>使用前，你可能想了解</h2><span>帮助中心</span></div><div className={styles.faqGrid}>{faqs.map(([question,answer]) => <details key={question}><summary>{question}<span aria-hidden="true">＋</span></summary><p>{answer}</p></details>)}</div></section>
      <section className={styles.bottomBanner}><div><h2>下一次上新，先把商品检查一遍。</h2><p>找到问题，拿到建议，开始处理。</p></div><Link href="/zh?tab=diagnosis" className={styles.primary}>免费检查我的商品</Link></section>
    </main>
    <footer className={styles.footer}><div><Link href="/" className={styles.footerLogo}>ListingScore</Link><span>商品检查 · 运营工具</span><nav aria-label="页脚导航"><Link href="/zh">中文工作空间</Link><Link href="/en">English workspace</Link><a href="#help">使用帮助</a><a href="#main">返回顶部 ↑</a></nav></div><p>当前提供商品诊断与修复任务管理。平台自动同步、团队分派与在线订阅仍在规划中。</p></footer>
  </div>;
}
