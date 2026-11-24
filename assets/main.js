// 手机菜单
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  });
}

// 招工按国家筛选
const list = document.querySelector('[data-filter-list]');
const buttons = [...document.querySelectorAll('[data-filter]')];
function applyFilter(value) {
  let shown = 0;
  for (const item of list.children) {
    const hit = value === 'all' || item.dataset.country === value;
    item.hidden = !hit;
    if (hit) shown += 1;
  }
  for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.filter === value));
  const empty = document.querySelector('.empty');
  if (empty) empty.hidden = shown > 0;
}
if (list && buttons.length) {
  for (const b of buttons) b.addEventListener('click', () => applyFilter(b.dataset.filter));
  applyFilter(buttons.find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset.filter || 'all');
}

// 照片加载失败时不留破图
for (const img of document.querySelectorAll('.case img')) {
  const broken = () => img.closest('.case').classList.add('case-broken');
  img.addEventListener('error', broken);
  if (img.complete && img.naturalWidth === 0 && img.currentSrc) broken();
  // HTTPS 页面里浏览器不会加载 HTTP 图片，也不一定触发 error，直接显示占位
  if (location.protocol === 'https:' && img.getAttribute('src').startsWith('http:')) broken();
}

// 报名表：带入项目名、校验。演示版还没有接后台，不会真的提交。
const form = document.querySelector('#apply-form');
if (form) {
  const job = new URLSearchParams(location.search).get('job');
  if (job) form.elements.intent.value = job;
  const msg = form.querySelector('.form-msg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.hidden = false;
    if (!form.checkValidity()) {
      msg.className = 'form-msg form-msg-error';
      msg.textContent = '还有必填项没有填，或手机号格式不对，请检查后再提交。';
      form.querySelector(':invalid')?.focus();
      return;
    }
    msg.className = 'form-msg form-msg-warn';
    msg.textContent = '演示版：报名表还没有接到后台，这次填写没有提交出去。请直接电话联系。';
  });
}
