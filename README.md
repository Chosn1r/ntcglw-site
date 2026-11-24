# ntcglw.com 新版网站（样稿）

如东海外经济技术合作有限公司（南通海外出国劳务）官网的重做版。目前是静态样稿：内容取自旧站，页面由脚本生成，还没有后台。

```
node serve.mjs    # 生成页面并本地预览 → http://localhost:5190
node build.mjs    # 只生成页面到 dist/
```

不需要 `npm install`，只要有 Node 18 以上。

## 目录

```
data/site.json    公司信息、公告、简介、各部门联系方式
data/jobs.json    招工简章（样稿里放了 13 条，旧站日本栏目共 1040 条）
data/cases.json   出境照片（目前直接引用旧站 www.ntcglw.cn 上的图片地址）
assets/           样式和脚本
build.mjs         页面模板 + 生成脚本
serve.mjs         本地预览服务器
dist/             生成结果，改内容后重新生成，不要手改
```

改招工信息：编辑 `data/jobs.json` 后重新运行 `node build.mjs`。

## 线上预览

推送到 `main` 后，GitHub Actions 会自动生成页面并发布到 GitHub Pages。

`data/site.json` 里的 `"demo": true` 会在每页顶部显示“设计样稿”提示，并告诉搜索引擎不要收录。正式上线到公司域名时改成 `false`。

## 还没做的

- 报名表没有接后台，点提交只做校验，不会发出去
- 旧站的“资质荣誉、培训考试、境外风采、新闻中心”四个栏目还没搬
- 照片和 logo 还在引用旧站或用占位图，上线前要搬到新站
- 首页“办理流程”五步的文字是草稿，需要公司确认
- 旧网址（`shownews.asp?id=…` 等）到新网址的跳转，上线时要配，否则百度收录会丢
