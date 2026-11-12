import "./product.css";

const painPoints = [
  ["01", "商品数据散落在多个平台", "同一 SKU 在店铺、广告、平台后台和表格里各有一份版本。运营团队无法确认哪一份才是正确数据。"],
  ["02", "问题总在上架或投放后才暴露", "缺图、价格异常、变体混乱、属性缺失，会直接影响审核、展示、自然流量和广告效果。"],
  ["03", "排查依赖人工、经验和反复沟通", "运营、商品、设计和技术团队看到的是不同问题，修复没有共同优先级，也无法量化效果。"],
];
const workflow = [
  ["连接", "汇聚商品来源", "以安全 API 连接为中心，逐步接入 Shopify、Amazon、Walmart、Google Merchant 与自定义系统。"],
  ["理解", "建立统一质量视图", "把字段完整度、价格、图片、变体、库存和渠道要求统一到同一个商品健康模型。"],
  ["行动", "生成可执行优先级", "不只告诉团队哪里有问题，而是指出影响范围、修复动作和应优先处理的商品。"],
  ["增长", "验证修复后的结果", "持续观察目录健康度，让商品运营从救火变成可衡量、可复制的增长流程。"],
];

export default function ChineseProductPage() {
  return <main className="product-page"><header className="product-nav"><a href="/zh" className="product-logo"><i>✦</i> ListingScore <small>中文</small></a><nav><a href="#pain">痛点</a><a href="#workflow">解决方案</a><a href="#roadmap">产品能力</a></nav><a className="product-login" href="/zh">进入工作空间 →</a></header><section className="product-hero"><p>跨平台商品数据运营中枢</p><h1>把商品数据从<br/><em>运营负担</em>变成增长能力。</h1><span>ListingScore 帮助跨境团队统一商品数据来源、提前识别影响上架与转化的问题，并把问题转成可执行的运营动作。</span><div><a className="product-primary" href="/zh">创建工作空间</a><a className="product-secondary" href="#workflow">看看如何解决问题 ↓</a></div><aside><b>从“发现问题”到“完成修复”</b><span>为运营、商品、广告和管理者提供同一份可信的商品健康视图。</span></aside></section><section id="pain" className="product-section"><p className="section-tag">你真正面对的问题</p><h2>不是缺少一张 CSV，<br/>而是缺少商品运营的控制台。</h2><div className="pain-grid">{painPoints.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section><section id="workflow" className="product-solution"><div><p className="section-tag">ListingScore 的解决方式</p><h2>连接数据，识别风险，推动修复，持续增长。</h2><p>产品主线是围绕多平台商品数据的“连接—理解—行动—增长”闭环，而不是单次文件检查。</p></div><ol>{workflow.map(([step, title, copy], index) => <li key={step}><b>0{index + 1}</b><div><span>{step}</span><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></section><section id="roadmap" className="product-section product-capabilities"><p className="section-tag">产品能力规划</p><h2>先建立可信的数据入口，<br/>再让团队跑得更快。</h2><div className="capability-grid"><article className="available"><span>当前可用</span><h3>安全工作空间</h3><p>账户隔离、JWT 鉴权、API 凭据 AES-GCM 加密、注册限流与私密报告历史。</p></article><article className="available"><span>当前可用</span><h3>商品质量诊断工具</h3><p>CSV 是轻量入口，用于快速体验规则诊断、修复清单和数据健康评分。</p></article><article><span>下一阶段</span><h3>原生平台同步</h3><p>Shopify OAuth、定时拉取、渠道字段映射与变更检测，让数据不再依赖人工导出。</p></article><article><span>下一阶段</span><h3>团队协作与预警</h3><p>角色权限、问题分派、修复 SLA、健康趋势和渠道异常提醒。</p></article></div></section><section className="product-cta"><p>让商品运营从“人工救火”变成可控流程。</p><h2>从一个可信的商品健康视图开始。</h2><a className="product-primary" href="/zh">进入中文工作空间 →</a><small>已有英文工作空间？账户与数据可直接复用。</small></section><footer>ListingScore · Cross-border catalog intelligence</footer></main>;
}
