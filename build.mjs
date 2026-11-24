// 把 data/ 里的内容生成为 dist/ 下的静态网页。运行：node build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const readJson = (f) => JSON.parse(readFileSync(join(root, 'data', f), 'utf8'));
// 样式和脚本的地址带上内容指纹，改动后访客的浏览器不会继续用旧缓存
const ver = (f) => createHash('sha1').update(readFileSync(join(root, 'assets', f))).digest('hex').slice(0, 8);

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const COUNTRY = { jp: '日本', sg: '新加坡' };
const NAV = [
  ['index.html', '首页', 'home'],
  ['jobs.html', '出国信息', 'jobs'],
  ['cases.html', '出境风采', 'cases'],
  ['about.html', '公司简介', 'about'],
  ['contact.html', '联系我们', 'contact'],
];

const icon = {
  phone: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>',
  mark: '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#1556b0"/><path fill="none" stroke="#fff" stroke-width="1.6" d="M20 4v32M4 20h32M7 11c4 3 22 3 26 0M7 29c4-3 22-3 26 0"/><ellipse cx="20" cy="20" rx="8" ry="16" fill="none" stroke="#fff" stroke-width="1.6"/></svg>',
};

function layout(site, { title, description, active, body, depth = 0 }) {
  const p = '../'.repeat(depth);
  const tel = site.hotline.mobile;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description || site.description)}">
<meta name="keywords" content="${esc(site.keywords)}">${site.demo ? '\n<meta name="robots" content="noindex, nofollow">' : ''}
<link rel="stylesheet" href="${p}assets/style.css?v=${ver('style.css')}">
</head>
<body>
<a class="skip" href="#main">跳到正文</a>${site.demo ? `\n<div class="demo-bar">设计样稿，不是官方网站，内容仅供预览。官方网站：${esc(site.domains[0])}</div>` : ''}
<div class="topbar"><div class="wrap">
  <span>国家商务部核发《对外劳务合作经营资格证书》 编号 ${esc(site.license)}</span>
  <span class="topbar-tel">咨询电话 ${site.tels.map(esc).join(' / ')}</span>
</div></div>
<header class="header"><div class="wrap header-in">
  <a class="logo" href="${p}index.html">${icon.mark}
    <span><b>${esc(site.name)}</b><i>${esc(site.brand)} · ${esc(site.tagline)}</i></span>
  </a>
  <button class="nav-toggle" aria-expanded="false" aria-controls="nav" aria-label="打开菜单"><span></span><span></span><span></span></button>
  <nav class="nav" id="nav" aria-label="主导航">
    ${NAV.map(([href, label, key]) => `<a href="${p}${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('\n    ')}
    <a class="btn btn-accent nav-cta" href="${p}apply.html">在线报名</a>
  </nav>
</div></header>
<main id="main">
${body}
</main>
<footer class="footer"><div class="wrap footer-grid">
  <div>
    <h2>${esc(site.name)}</h2>
    <p>从 ${site.since} 年起从事对外劳务合作，持有国家商务部核发的对外劳务合作（外派劳务）经营资格证书，编号 ${esc(site.license)}。</p>
  </div>
  <div>
    <h3>栏目</h3>
    <ul>${NAV.concat([['apply.html', '在线报名']]).map(([href, label]) => `<li><a href="${p}${href}">${label}</a></li>`).join('')}</ul>
  </div>
  <div>
    <h3>联系方式</h3>
    <ul>
      <li>地址：${esc(site.address)}</li>
      <li>电话：${site.tels.map((t) => `<a href="tel:${t.replace(/-/g, '')}">${esc(t)}</a>`).join('　')}</li>
      ${site.contacts.map((c) => `<li>${esc(c.name)}：<a href="tel:${c.mobile}">${esc(c.mobile)}</a>（微信同号）</li>`).join('')}
    </ul>
  </div>
</div>
<div class="wrap footer-bottom">
  <span>© ${new Date().getFullYear()} ${esc(site.name)} 版权所有</span>
  <a href="https://beian.miit.gov.cn/" rel="noopener" target="_blank">${esc(site.icp)}</a>
</div></footer>
<div class="dock">
  <a href="tel:${tel}">${icon.phone}<span>电话咨询</span></a>
  <a class="dock-main" href="${p}apply.html">在线报名</a>
</div>
<script src="${p}assets/main.js?v=${ver('main.js')}" defer></script>
</body>
</html>
`;
}

function jobCard(job, p = '') {
  const facts = [job.headcount && `招 ${job.headcount}`, job.who, job.term && `合同 ${job.term}`].filter(Boolean);
  return `<a class="job" href="${p}jobs/${job.id}.html" data-country="${job.country}">
  <div class="job-top"><span class="tag tag-${job.country}">${COUNTRY[job.country]}${job.region !== COUNTRY[job.country] ? ' · ' + esc(job.region) : ''}</span><time datetime="${job.date}">${job.date}</time></div>
  <h3>${esc(job.title)}</h3>
  <p class="job-trade">${esc(job.trade)}</p>
  <ul class="facts">${facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
  <div class="pay"><b>${esc(job.pay)}</b> ${esc(job.payUnit)}<span>${esc(job.payNote || '')}</span></div>
</a>`;
}

function filterTabs(withAll) {
  return `<div class="tabs" role="group" aria-label="按国家筛选">
  ${withAll ? '<button type="button" data-filter="all" aria-pressed="true">全部</button>' : ''}
  <button type="button" data-filter="jp" aria-pressed="${withAll ? 'false' : 'true'}">日本</button>
  <button type="button" data-filter="sg" aria-pressed="false">新加坡</button>
</div>`;
}

function caseFigure(c, base) {
  return `<figure class="case"><img loading="lazy" src="${esc(encodeURI(base + c.file))}" alt="${esc(c.date + ' ' + c.title)}" width="500" height="667"><figcaption><time datetime="${c.date}">${c.date}</time>${esc(c.title)}</figcaption></figure>`;
}

function contactStrip(site, p = '') {
  return `<section class="cta"><div class="wrap cta-in">
  <div>
    <h2>想了解哪个项目，直接打电话问</h2>
    <p>招工条件、费用、考试时间以电话或当面沟通为准。也可以先在网上报名，工作人员会在一个工作日内联系您。</p>
  </div>
  <div class="cta-actions">
    ${site.contacts.map((c) => `<a class="btn btn-light" href="tel:${c.mobile}">${icon.phone}${esc(c.mobile)}（${esc(c.name)}）</a>`).join('\n    ')}
    <a class="btn btn-accent" href="${p}apply.html">在线报名 ${icon.arrow}</a>
  </div>
</div></section>`;
}

const pageHead = (title, lead, crumbs = []) => `<section class="page-head"><div class="wrap">
  <nav class="crumbs" aria-label="当前位置">${crumbs.map(([href, label]) => (href ? `<a href="${href}">${label}</a>` : `<span>${label}</span>`)).join('<i>/</i>')}</nav>
  <h1>${esc(title)}</h1>
  ${lead ? `<p>${esc(lead)}</p>` : ''}
</div></section>`;

function homePage(site, jobs, cases) {
  const perCountry = (c) => jobs.filter((j) => j.country === c).slice(0, 6);
  const steps = [
    ['咨询报名', '电话、微信或网上报名，了解项目条件和费用。'],
    ['面试考试', '按项目安排现场或视频面试、技能考试。'],
    ['出国前培训', '语言和技能培训，了解当地法律和生活常识。'],
    ['办理手续', '签订合同，办理护照、签证等出境手续。'],
    ['出境上岗', '统一安排出境，境外有人跟进管理和服务。'],
  ];
  return `<section class="hero"><div class="wrap hero-in">
  <div class="hero-text">
    <p class="eyebrow">南通 · 如皋 · 海安 出国劳务</p>
    <h1>正规出国劳务<br>去日本、新加坡工作</h1>
    <p class="hero-lead">持国家商务部核发的对外劳务合作经营资格证书（编号 ${esc(site.license)}），${site.since} 年起开展对外劳务合作。</p>
    <div class="hero-actions">
      <a class="btn btn-accent btn-lg" href="jobs.html">看最新招工 ${icon.arrow}</a>
      <a class="btn btn-ghost btn-lg" href="tel:${site.hotline.mobile}">${icon.phone}${esc(site.hotline.mobile)}</a>
    </div>
  </div>
  <aside class="notice" aria-label="最新公告">
    <h2>${esc(site.notice.title)}</h2>
    <ol>${site.notice.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
    ${site.notice.extra.map((t) => `<p>${esc(t)}</p>`).join('')}
  </aside>
</div></section>

<section class="stats"><div class="wrap stats-in">
  <div><b>${site.since}</b><span>年起开展对外劳务合作</span></div>
  <div><b>3000+</b><span>累计派遣劳务人员</span></div>
  <div><b>东京 · 广岛</b><span>设有日本办事处</span></div>
  <div><b>${esc(site.license)}</b><span>商务部经营资格证书编号</span></div>
</div></section>

<section class="section" id="jobs"><div class="wrap">
  <div class="section-head">
    <div><h2>最新招工</h2><p>每条都写明人数、年龄、工资和考试时间，最终以合约书为准。</p></div>
    ${filterTabs(false)}
  </div>
  <div class="job-grid" data-filter-list>
    ${perCountry('jp').concat(perCountry('sg')).map((j) => jobCard(j)).join('\n    ')}
  </div>
  <p class="more"><a class="btn btn-outline" href="jobs.html">查看全部出国信息 ${icon.arrow}</a></p>
</div></section>

<section class="section section-alt"><div class="wrap">
  <div class="section-head"><div><h2>办理流程</h2><p>从报名到出境，每一步都有专人对接。</p></div></div>
  <ol class="steps">${steps.map(([t, d], i) => `<li><b>${i + 1}</b><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head">
    <div><h2>出境风采</h2><p>近期签约、出境人员的现场照片。</p></div>
    <a class="link" href="cases.html">全部照片 ${icon.arrow}</a>
  </div>
  <div class="case-row">${cases.items.slice(0, 8).map((c) => caseFigure(c, cases.base)).join('')}</div>
</div></section>

<section class="section section-alt"><div class="wrap about-brief">
  <div>
    <h2>关于我们</h2>
    <p>${esc(site.about[1])}</p>
    <p>${esc(site.about[2])}</p>
    <a class="link" href="about.html">了解公司 ${icon.arrow}</a>
  </div>
  <ul class="trades">${site.trades.map((t) => `<li><b>${esc(t.name)}</b><span>${esc(t.detail)}</span></li>`).join('')}</ul>
</div></section>

${contactStrip(site)}`;
}

function jobsPage(site, jobs) {
  return `${pageHead('出国信息', '日本、新加坡等国家的最新招工简章。', [['index.html', '首页'], [null, '出国信息']])}
<section class="section"><div class="wrap">
  <div class="section-head"><div><p>共 ${jobs.length} 条在招项目</p></div>${filterTabs(true)}</div>
  <div class="job-grid" data-filter-list>
    ${jobs.map((j) => jobCard(j)).join('\n    ')}
  </div>
  <p class="empty" hidden>这个国家暂时没有在招项目，可以电话咨询近期计划。</p>
</div></section>
${contactStrip(site)}`;
}

function jobPage(site, job, prev, next) {
  const p = '../';
  const phone = job.phone || site.hotline.mobile;
  const facts = [
    ['前往国家', COUNTRY[job.country] + (job.region !== COUNTRY[job.country] ? `（${job.region}）` : '')],
    ['工种', job.trade + (job.headcount ? ` ${job.headcount}` : '')],
    ['人员要求', job.who],
    job.term && ['合同期', job.term],
    job.exam && ['考试时间', job.exam],
  ].filter(Boolean);
  const list = (title, items) => (items && items.length ? `<h2>${title}</h2><ol>${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>` : '');
  return `${pageHead(job.title + '招工简章', '', [[p + 'index.html', '首页'], [p + 'jobs.html', '出国信息'], [null, job.title]])}
<section class="section"><div class="wrap detail">
  <article class="article">
    <p class="meta"><span class="tag tag-${job.country}">${COUNTRY[job.country]}</span> 发布时间 <time datetime="${job.date}">${job.date}</time></p>
    <div class="pay pay-lg"><b>${esc(job.pay)}</b> ${esc(job.payUnit)}<span>${esc(job.payNote || '')}</span></div>
    <dl class="facts-grid">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <h2>出国要求</h2>
    <p>${esc(job.requirements)}</p>
    ${list('待遇', job.benefits)}
    ${list('报名所需材料', job.materials)}
    <p class="disclaimer">${esc(job.disclaimer || '以上简介最终以合约书为准。')}</p>
    <nav class="pager">
      ${prev ? `<a href="${prev.id}.html">上一条：${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a href="${next.id}.html">下一条：${esc(next.title)}</a>` : '<span></span>'}
    </nav>
  </article>
  <aside class="side">
    <div class="side-card">
      <h2>咨询这个项目</h2>
      <a class="btn btn-accent btn-block" href="${p}apply.html?job=${encodeURIComponent(job.title)}">报名这个项目</a>
      <a class="btn btn-outline btn-block" href="tel:${phone}">${icon.phone}${esc(phone)}</a>
      <p>座机 ${site.tels.map(esc).join(' / ')}</p>
      <p>${esc(site.address)}</p>
    </div>
  </aside>
</div></section>`;
}

function casesPage(site, cases) {
  return `${pageHead('出境风采', '近期签约、出境人员的现场照片，按日期排列。', [['index.html', '首页'], [null, '出境风采']])}
<section class="section"><div class="wrap">
  <div class="case-grid">${cases.items.map((c) => caseFigure(c, cases.base)).join('')}</div>
</div></section>
${contactStrip(site)}`;
}

function aboutPage(site) {
  return `${pageHead('公司简介', '', [['index.html', '首页'], [null, '公司简介']])}
<section class="section"><div class="wrap detail">
  <article class="article">
    ${site.about.map((t) => `<p>${esc(t)}</p>`).join('\n    ')}
    <h2>劳务合作行业</h2>
    <ul class="trades trades-wide">${site.trades.map((t) => `<li><b>${esc(t.name)}</b><span>${esc(t.detail)}</span></li>`).join('')}</ul>
  </article>
  <aside class="side">
    <div class="side-card cert">
      <h2>经营资格</h2>
      <p>《中华人民共和国对外劳务合作（外派劳务）经营资格证书》</p>
      <p class="cert-no">${esc(site.license)}</p>
      <p>发证机关：国家商务部</p>
    </div>
    <div class="side-card">
      <h2>团队</h2>
      <dl class="mini"><div><dt>工作人员</dt><dd>25 人</dd></div><div><dt>专职劳务人员</dt><dd>10 人</dd></div><div><dt>翻译、培训教师</dt><dd>5 人</dd></div><div><dt>外教</dt><dd>2 人</dd></div></dl>
    </div>
  </aside>
</div></section>
${contactStrip(site)}`;
}

function contactPage(site) {
  const person = (x) => {
    const rows = [
      x.mobile && ['手机', [x.mobile, x.mobile2].filter(Boolean).map((m) => `<a href="tel:${m}">${m}</a>`).join('　')],
      x.tel && ['电话', [x.tel, x.tel2].filter(Boolean).map((t) => `<a href="tel:${t.replace(/-/g, '')}">${t}</a>`).join('　')],
      x.wechat && ['微信', esc(x.wechat)],
      x.qq && ['QQ', esc(x.qq)],
    ].filter(Boolean);
    return `<li>${x.label ? `<b>${esc(x.label)}</b>` : ''}<dl class="mini">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></li>`;
  };
  return `${pageHead('联系我们', '各项目咨询、报名都可以直接联系对应部门。', [['index.html', '首页'], [null, '联系我们']])}
<section class="section"><div class="wrap">
  <div class="addr">
    <div><h2>办公地址</h2><p>${esc(site.address)}</p><p>邮编 ${esc(site.postcode)}　传真 ${esc(site.fax)}</p></div>
    <div><h2>网址</h2><p>${site.domains.map(esc).join('　')}</p></div>
  </div>
  <div class="dept-grid">
    ${site.departments.map((d) => `<section class="dept"><h2>${esc(d.name)}<span>${esc(d.note)}</span></h2><ul>${d.people.map(person).join('')}</ul></section>`).join('\n    ')}
  </div>
</div></section>
${contactStrip(site)}`;
}

function applyPage() {
  const field = (label, control, hint = '') => `<label class="field"><span>${label} <em>*</em></span>${control}${hint ? `<small>${hint}</small>` : ''}</label>`;
  return `${pageHead('在线报名', '请如实填写，工作人员将在一个工作日内与您联系。', [['index.html', '首页'], [null, '在线报名']])}
<section class="section"><div class="wrap narrow">
  <form class="form" id="apply-form" novalidate>
    <div class="form-row">
      ${field('姓名', '<input name="name" required autocomplete="name">')}
      <fieldset class="field"><legend>性别 <em>*</em></legend><div class="radios"><label><input type="radio" name="gender" value="男" required> 男</label><label><input type="radio" name="gender" value="女"> 女</label></div></fieldset>
    </div>
    <div class="form-row">
      ${field('出生日期', '<input name="birth" type="date" required>')}
      ${field('联系电话', '<input name="phone" type="tel" inputmode="numeric" pattern="1[0-9]{10}" required autocomplete="tel">', '请保持电话通畅，以便及时与您联系')}
    </div>
    <div class="form-row">
      ${field('籍贯', '<input name="origin" required>')}
      ${field('学历', '<select name="education" required><option value="">请选择</option><option>小学</option><option>初中</option><option>高中 / 中专</option><option>大专</option><option>本科及以上</option></select>')}
    </div>
    <div class="form-row">
      ${field('毕业学校', '<input name="school" required>')}
      ${field('技能特长', '<input name="skill" required placeholder="如：缝纫 8 年、电焊证">')}
    </div>
    ${field('家庭地址', '<input name="address" required autocomplete="street-address">')}
    ${field('意向国家及意向行业', '<input name="intent" required placeholder="如：日本 服装工">')}
    <p class="form-note">提交的信息只用于本公司联系您办理出国劳务事宜。</p>
    <button class="btn btn-accent btn-lg" type="submit">提交报名</button>
    <p class="form-msg" role="status" hidden></p>
  </form>
</div></section>`;
}

export function build() {
  const site = readJson('site.json');
  const jobs = readJson('jobs.json').sort((a, b) => b.date.localeCompare(a.date));
  const cases = readJson('cases.json');
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(join(dist, 'jobs'), { recursive: true });
  cpSync(join(root, 'assets'), join(dist, 'assets'), { recursive: true });

  const seoTitle = '南通出国劳务-南通海外出国劳务公司,如皋出国劳务,海安出国劳务';
  const sub = (t) => `${t}-南通海外出国劳务公司`;
  const out = (file, opts) => writeFileSync(join(dist, file), layout(site, opts));

  out('index.html', { title: seoTitle, active: 'home', body: homePage(site, jobs, cases) });
  out('jobs.html', { title: sub('出国信息'), active: 'jobs', body: jobsPage(site, jobs) });
  out('cases.html', { title: sub('出境风采'), active: 'cases', body: casesPage(site, cases) });
  out('about.html', { title: sub('公司简介'), active: 'about', body: aboutPage(site) });
  out('contact.html', { title: sub('联系我们'), active: 'contact', body: contactPage(site) });
  out('apply.html', { title: sub('在线报名'), active: 'apply', body: applyPage() });
  jobs.forEach((job, i) => {
    out(`jobs/${job.id}.html`, {
      title: `${job.title}招工简章_南通海外出国劳务公司`,
      description: `${COUNTRY[job.country]}${job.title}：${job.trade}，${job.who}，${job.pay}${job.payUnit}。`,
      active: 'jobs', depth: 1, body: jobPage(site, job, jobs[i - 1], jobs[i + 1]),
    });
  });
  return { pages: 6 + jobs.length, dist };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const r = build();
  console.log(`已生成 ${r.pages} 个页面 → ${r.dist}`);
}
