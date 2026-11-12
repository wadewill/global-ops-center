import Link from "next/link";
import ValueCalculator from "./ValueCalculator";
import styles from "./MarketingHome.module.css";

const outcomes = [
  { number: "01", title: "减少本可以避免的上架问题", text: "缺失的价格、重复的 SKU、格式错误的图片链接——把这些问题留在检查清单里，别带进下一次上新。", label: "先解决影响发布的问题", icon: "↗" },
  { number: "02", title: "让商品信息更完整、更可信", text: "找到缺失的标题、描述和变体信息，为消费者提供更充分的购买信息，也为转化优化打好基础。", label: "给每一次访问更好的承接", icon: "◉" },
  { number: "03", title: "把排查时间还给经营", text: "问题按严重程度排列，修复建议直接生成任务。知道先改什么、哪些已处理，少一些重复查表。", label: "让运营精力回到高价值工作", icon: "↳" },
];

const faqs = [
  ["页面里的订单提升是真实客户案例吗？", "不是。页面用同等月访问量 20,000、转化率从 1.5% 到 1.8% 的假设说明改善的价值：订单从 300 到 360。它是可复算的情景示例，不是客户实绩，也不代表使用产品必然带来这些结果。"],
  ["现在注册后，我实际能使用哪些功能？", "当前可以运行商品目录诊断、查看质量评分和问题清单、保存历史报告、管理自动生成的修复任务，以及加密保存 API 连接配置。CSV 是现阶段快速诊断的辅助入口。"],
  ["能直接从 Shopify 等平台同步商品吗？", "目前还不能。Shopify 和自定义 API 可保存连接配置；原生授权、商品拉取和定时同步仍在开发规划中。Amazon、Walmart、Google Merchant 等平台也属于后续规划。"],
  ["会自动修改我的店铺商品吗？", "不会。当前诊断提供问题和修复建议，任务完成状态由你更新；你需要在原平台完成修改。自动写回与结果归因尚未上线。"],
  ["现在需要付费吗？", "当前功能可免费体验，在线订阅支付尚未开放。收益测算中的“工具月预算”由你自行设定，只用于判断投入是否值得，不是产品报价。正式套餐与权益会在开放付费前明确公布。"],
];

export default function MarketingHome() {
  return (
    <div className={styles.page} lang="zh-CN">
      <a className={styles.skip} href="#main">跳到正文</a>
      <header className={styles.header}>
        <Link className={styles.logo} href="/" aria-label="ListingScore 产品首页"><span aria-hidden="true">✦</span>ListingScore<small>商品增长，从质量开始</small></Link>
        <nav aria-label="首页导航"><a href="#outcomes">使用价值</a><a href="#example">效果示例</a><a href="#value">收益测算</a><a href="#capabilities">产品能力</a></nav>
        <Link className={styles.navCta} href="/zh">进入工作空间 <span aria-hidden="true">↗</span></Link>
      </header>

      <main id="main">
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span /> 为认真经营每一个商品的团队而造</p>
            <h1>流量来之不易。<br />让你的商品，<br /><em>更值得被下单。</em></h1>
            <p className={styles.lead}>找到影响上架与展示的商品数据问题，把“哪里不对”变成“下一步怎么改”。让每一份运营投入，都有明确的方向。</p>
            <div className={styles.actions}><Link className={styles.primary} href="/zh?tab=diagnosis">免费诊断我的商品 <span aria-hidden="true">↗</span></Link><a className={styles.heroLink} href="#example">看看改善意味着什么 <span aria-hidden="true">↓</span></a></div>
            <p className={styles.heroNote}>当前版本免费体验 · 原始商品数据不会被修改</p>
          </div>

          <div className={styles.preview} aria-label="商品优化价值示意，非真实经营数据">
            <div className={styles.previewTop}><span><i /> <i /> <i /></span><b>LISTINGSCORE / GROWTH OPPORTUNITY</b><small>示意数据</small></div>
            <div className={styles.previewBody}>
              <div className={styles.previewTitle}><div><p>每一次小改善，都值得算清楚</p><h2>同样的流量，更多成交的可能。</h2></div><span aria-hidden="true">↗</span></div>
              <div className={styles.orderStats}><div><span>当前情景 · 月订单</span><b>300</b><small>转化率 1.5%</small></div><span className={styles.orderArrow} aria-hidden="true">→</span><div><span>目标情景 · 月订单</span><b>360<span> 单</span></b><small>假设转化率 1.8%</small></div></div>
              <svg className={styles.chart} viewBox="0 0 460 150" role="img" aria-label="示意趋势图：目标情景高于当前情景，非真实时间序列">
                <defs><linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d4ed95" stopOpacity=".55" /><stop offset="100%" stopColor="#d4ed95" stopOpacity="0" /></linearGradient></defs>
                <path d="M0 25H460M0 75H460M0 125H460" stroke="#dbe3d8" strokeDasharray="4 5" />
                <path d="M0 120 C60 114 70 90 130 97 S210 55 260 61 S355 15 460 12 L460 150H0Z" fill="url(#growth-fill)" />
                <path d="M0 120 C60 114 70 90 130 97 S210 55 260 61 S355 15 460 12" fill="none" stroke="#477344" strokeWidth="3" />
                <path d="M0 120 C65 116 110 108 160 110 S270 88 310 92 S395 78 460 79" fill="none" stroke="#a8b4ae" strokeWidth="2" strokeDasharray="6 6" />
              </svg>
              <div className={styles.chartLegend}><span>— 目标情景</span><span>┄ 当前情景</span><span>趋势仅为示意</span></div>
              <div className={styles.opportunity}><span>转化率差异 <b>+0.3 个百分点</b></span><strong>+60 <small>单 / 月</small></strong></div>
              <p className={styles.previewNote}>假设月访问量均为 20,000。此为情景测算，非客户实绩或效果承诺。</p>
            </div>
          </div>
        </section>

        <div className={styles.audience}><span>为这些运营时刻而设计</span><b>新品上架前</b><i /><b>商品投放前</b><i /><b>目录集中排查</b><i /><b>日常问题跟进</b></div>

        <section id="outcomes" className={styles.section}>
          <div className={styles.sectionHead}><div><p className={styles.kicker}>从经营问题出发</p><h2>你想要的，是更好的生意。<br />先把商品的基础做好。</h2></div><p>流量、价格和服务都会影响成交。<br />ListingScore 聚焦其中可执行的一步：<br />发现商品数据问题，推动修复。</p></div>
          <div className={styles.outcomeGrid}>{outcomes.map(item => <article key={item.number}><div className={styles.outcomeNumber}><span>{item.number}</span><i aria-hidden="true">{item.icon}</i></div><h3>{item.title}</h3><p>{item.text}</p><small>{item.label}</small></article>)}</div>
        </section>

        <section id="example" className={styles.example}>
          <div className={styles.exampleCopy}><p className={styles.kicker}>一笔看得懂的增长账 · 假设示例</p><h2>多 0.3 个百分点，<br />可能意味着什么？</h2><p>假设每月有 20,000 次商品访问，转化率由 1.5% 提升至 1.8%。访问量没有增加，订单量的差异却可以很具体。</p><a href="#value">换成你的数字，算一算 <span aria-hidden="true">↗</span></a></div>
          <div className={styles.exampleTable}><table><caption>同等访问量下的情景对比，不代表产品实际效果</caption><thead><tr><th scope="col">经营指标</th><th scope="col">当前情景</th><th scope="col">目标情景</th></tr></thead><tbody><tr><th scope="row">月访问量</th><td>20,000</td><td>20,000</td></tr><tr><th scope="row">下单转化率</th><td>1.5%</td><td>1.8%</td></tr><tr><th scope="row">月订单量</th><td>300</td><td>360 <small>+60 单</small></td></tr><tr><th scope="row">月成交额</th><td>¥60,000</td><td>¥72,000</td></tr></tbody></table><p>假设客单价 ¥200。成交额 ≠ 利润；真实效果受商品、渠道、流量质量与修复执行影响。</p></div>
        </section>

        <section id="workflow" className={styles.workflow}>
          <div className={styles.sectionHead}><div><p className={styles.kicker}>从问题到行动</p><h2>知道改哪里，<br />才有机会让结果不同。</h2></div><Link className={styles.textLink} href="/zh?tab=diagnosis">体验一次完整诊断 ↗</Link></div>
          <div className={styles.workflowGrid}>
            <article><span>01 / CHECK</span><h3>看见容易遗漏的问题</h3><p>检查 SKU、标题、价格、图片链接与变体等字段，形成商品质量评分和问题清单。</p><div className={styles.sampleIssue}><b>高优先级</b><span>商品缺少主图链接</span><small>建议：补充可公开访问的商品主图</small></div></article>
            <article><span>02 / ACT</span><h3>把问题变成下一步动作</h3><p>诊断发现自动生成修复任务。你可以筛选状态，按优先级推进处理。</p><div className={styles.sampleSteps}><span>待处理</span><i>→</i><span>处理中</span><i>→</i><b>已完成 ✓</b></div></article>
            <article><span>03 / REVIEW</span><h3>用实际结果判断价值</h3><p>在原平台修复后重新诊断，并结合店铺后台的访问与订单数据，评估自己的改善效果。</p><div className={styles.sampleReview}><b>你的验收标准</b><span>问题是否减少？<br />处理是否更快？<br />经营指标是否改善？</span></div></article>
          </div>
          <p className={styles.workflowNote}>流程示意。当前不自动修改店铺商品，也不自动归因流量与订单变化。</p>
        </section>

        <ValueCalculator />

        <section id="capabilities" className={styles.section}>
          <div className={styles.sectionHead}><div><p className={styles.kicker}>你现在能获得什么</p><h2>先体验可执行的价值，<br />再决定长期投入。</h2></div><p>每一项投入，都应该服务于<br />更少的问题、更明确的行动，<br />以及你自己验证过的收益。</p></div>
          <div className={styles.offerGrid}>
            <article className={styles.currentOffer}><span className={styles.available}>现在可用</span><h3>商品运营工作空间</h3><p className={styles.offerPrice}>免费体验<small>无需绑定支付方式</small></p><ul><li>商品质量诊断、评分与修复建议</li><li>私密保存的历史诊断报告</li><li>自动生成任务，跟进处理状态</li><li>API 连接配置加密保存</li></ul><Link className={styles.primary} href="/zh">创建我的工作空间 ↗</Link><p className={styles.offerNote}>当前可通过 CSV 辅助入口运行诊断。</p></article>
            <article className={styles.futureOffer}><span className={styles.planned}>后续规划 · 尚未上线</span><h3>让持续运营更轻松</h3><p>当商品越来越多、渠道越来越复杂，下一阶段将围绕自动化与协作继续完善。</p><ul><li><span>平台数据同步</span><small>原生授权、定时拉取与字段映射</small></li><li><span>团队任务协作</span><small>负责人、权限与处理时限</small></li><li><span>持续监控与预警</span><small>健康趋势与商品异常提醒</small></li></ul><p className={styles.futureNote}>正式付费套餐与价格将随服务开放公布。当前没有在线订阅扣费。</p></article>
          </div>
        </section>

        <section className={styles.faq}><div><p className={styles.kicker}>开始之前</p><h2>把你关心的，<br />先说明白。</h2></div><div className={styles.faqList}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

        <section className={styles.finalCta}><p>下一次上架之前，先让问题浮出水面。</p><h2>把下一小时的运营精力，<br />用在最值得改的地方。</h2><Link className={styles.primary} href="/zh?tab=diagnosis">开始免费诊断 <span aria-hidden="true">↗</span></Link><small>从一次检查开始，看看你的商品还有哪些改善空间。</small></section>
      </main>
      <footer className={styles.footer}><Link className={styles.logo} href="/"><span aria-hidden="true">✦</span>ListingScore</Link><p>商品质量更清晰，运营行动更有方向。</p><nav aria-label="页脚导航"><Link href="/zh">中文工作空间</Link><Link href="/en">English workspace</Link><a href="#main">返回顶部 ↑</a></nav></footer>
    </div>
  );
}
