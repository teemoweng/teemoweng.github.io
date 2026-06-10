# teemoweng.github.io 电影式滚动叙事重设计 — Design Spec

> 日期：2026-06-10
> 状态：待用户确认
> 参考：https://juanmora.co/index.html（视觉骨架参考；内容、文案、信息架构全部为 Teemo 自有）

## 1. 目标

把现有「卡片网格 + 粒子背景」的个人主页重做成**电影式滚动叙事**站点：
整页由 8 幕全屏「场景」组成，滚动驱动文字点亮、巨字缩放、卡片漂浮等动画，
营造设计师作品集级别的高级感；同时**原站全部信息一条不丢**。

## 2. 硬约束

| 约束 | 来源 |
|---|---|
| 单文件 `index.html`，CSS/JS 全部内联，无构建步骤 | 项目 CLAUDE.md |
| 双语 EN/中，沿用 `data-i18n` + `i18n` 对象模式，两边 key 必须齐全 | 项目 CLAUDE.md |
| 静态资源放 `uploads/` | 项目 CLAUDE.md |
| 推 `main` 即上线（GitHub Pages） | 项目 CLAUDE.md |
| 旧版完整保留在 `v1/`（含 uploads 副本），上线后可经 `/v1/` 访问 | 用户要求（已完成） |

## 3. 信息清单（必须全部保留）

- Hero 身份信息：姓名、Imperial College MSc、Strategy × Product × AI 定位
- News 动态 ×6（2022.03 – 2026.03）
- 项目 ×3：LuxePop（Slides + B站视频链接）、Hinbor（App Store + Google Play 链接）、Beike AI
- 实习经历 ×7：Beike / BCG / ZS / POIZON / JQ / 财通 / BDA（含时间段、职位、描述）
- 教育 ×3：Imperial / 复旦交换 / UBC
- 技能 4 组：Data Analysis / Visualization / Product Design / Vibe Coding
- 工具站外链：html-lab/tech-stack
- 联系方式：邮箱 teemow0106@163.com、LinkedIn、GitHub
- 简历下载（uploads/Resume CW.pdf）
- GitHub 仓库弹窗（GitHub API 实时拉取，保留）
- SEO/OG meta 标签（保留，描述文案随新站微调）

## 4. 删除项（用户已确认）

- 明暗主题切换（单一蜜桃奶油气质）
- 粒子背景 canvas
- 打字机效果
- Tweaks 调整面板（accent 色选择器等）
- 联系表单（mailto 表单 → 一个大 "Let's talk" mailto 按钮）

## 5. 视觉系统

| 维度 | 决定 |
|---|---|
| 配色 | 蜜桃 + 奶油暖调：奶油底 `#faf3ea` 系、蜜桃高亮 `#f0a868` 系、深暖棕文字 `#4a3a2e` 系、开场/终章用蜜桃天空渐变（#f7b98f → #f8e8d8） |
| 主字体 | Hanken Grotesk（圆润 grotesque，Google Fonts 免费），800 weight 做巨字 |
| 中文字体 | 系统字体栈（PingFang SC / Microsoft YaHei），不额外加载中文 webfont（体积考虑） |
| 标签字体 | JetBrains Mono（小型 mono 标签，沿用现有） |
| 氛围 | 视口四周柔焦晕影（box-shadow inset / radial 渐变伪元素），整页柔光感 |
| 圆角语言 | 大圆角胶囊（导航、按钮）、卡片 12-16px |

## 6. 八幕结构

| 幕 | 名称 | 内容 | 核心动画 |
|---|---|---|---|
| 1 | Opening | 巨型 "Teemo Weng" + 副标签（STRATEGY × PRODUCT × AI — IMPERIAL）+ 悬浮胶囊导航（About / tw / Work；右侧 EN·中、Email、in、gh） | 进场淡入；滚动时名字缩小上移退场 |
| 2 | Statement | 一句话宣言。默认文案 EN: "I turn strategy into products people love:"；中: "我把战略，做成被人喜爱的产品："（高亮词：strategy/products love；战略/被人喜爱的产品）。用户可随时改文案，机制不变 | 滚动逐词从灰点亮成蜜桃色（ScrollTrigger scrub） |
| 3 | Chapter: Strategy | 巨字 "Strategy" + 副文案；5 段咨询经历（BCG/ZS/JQ/财通/BDA）做成浮动卡片横向漂过 | 巨字浮现 + 卡片视差横移 |
| 4 | Chapter: Product | 巨字 "Product"；贝壳 AI、POIZON、LuxePop 项目卡（含截图 uploads/Project2.png 等 + 全部外链） | 同上 |
| 5 | Chapter: Founder | 巨字 "Founder"；Hinbor 卡片（combined_hd.png + App Store / Play 链接） | 同上 |
| 6 | Why me（纯排版版） | "Teams work with me because of my **rigor + builder's instinct**" 巨字 + 3 条 checklist（咨询框架×产品手感 / 战略分析到 0→1 上线 / 双语跨市场）。**不用照片**；深暖棕底色块替代，DOM 留好背景图挂载位，未来有照片直接换 | 巨字 scrub 浮现，checklist 逐条点亮 |
| 7 | The Record | 行式档案清单：EXPERIENCE ×7 → EDUCATION ×3 → SKILLS 4 组 → NEWS ×6；每行 = 标题 + 副述 + 年份 | 行逐条 reveal；hover 整行放大 + 蜜桃渐变高亮 |
| 8 | Finale | "Let's talk →"（mailto）+ 联系链接（邮箱/LinkedIn/GitHub 弹窗触发/简历下载）+ 工具站外链 + credits（Made with GSAP · Lenis · Claude Code）+ 整屏巨型名字收尾 | 名字从底部升起 |

## 7. 技术方案

- **GSAP 3 + ScrollTrigger**（jsdelivr CDN）：所有滚动驱动动画。GSAP 自 3.13 起全量免费。
- **Lenis**（jsdelivr CDN）：平滑滚动，与 ScrollTrigger 按官方推荐方式桥接（`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`）。
- 两个库挂 CDN；`<script>` 加载失败时（无网/CDN 被墙）**优雅降级**：所有内容默认在 DOM 中可见（动画类只做增强，初始态不用 JS 隐藏内容——用 `gsap.from()` 风格而非 CSS 预隐藏，或 JS 检测后再加隐藏类）。
- **prefers-reduced-motion**：检测到时跳过全部 scrub 动画，静态展示。
- **移动端**：场景纵向堆叠；巨字用 clamp() 缩放；横向漂浮卡片改为可横滑（overflow-x scroll + snap）；晕影减弱。
- **i18n**：保留现有 `setLang()` 机制；逐词点亮的宣言句需要按词 span 切分——切分逻辑在 `setLang()` 后重跑，保证中英文都能逐词（中文按字/短语）点亮。
- **GitHub 弹窗**：现有实现整体迁移，视觉换肤为新配色。
- **性能**：字体仅 Hanken Grotesk（2 个 weight）+ JetBrains Mono（1 个 weight）；GSAP+ScrollTrigger+Lenis 合计 ~90KB gzip；图片沿用现有 uploads。

## 8. 不做的事

- 不引入构建工具、框架、npm
- 不改 `uploads/` 里的简历与图片
- 不动 `v1/`（备份已完成：index.html + uploads 副本）
- 不重做 og-cover.png（本次范围外，文案 meta 微调即可）
- 不加照片（幕 6 纯排版，留挂载位）

## 9. 验收标准

1. 桌面 Chrome/Safari 滚动全程 60fps 无明显卡顿，8 幕动画按设计触发
2. EN/中 切换后所有文案完整（含宣言逐词点亮句），无空白元素
3. 原站信息清单（§3）逐项核对，全部存在且链接可点
4. 手机宽度（375px）排版不破，横滑卡片可用
5. 禁用 JS / CDN 失败时内容仍可读
6. `python3 -m http.server` 本地预览通过后才提交；推 main 前经用户确认

## 10. 实施备注

- 旧版备份：`v1/`（已存在，勿覆盖）
- 提交策略：完成并本地验证后一次性替换根 `index.html`；commit 信息注明 v2 重设计；推送前征求用户同意
- 项目 CLAUDE.md 的 i18n / 单文件约定继续有效；重设计后若 accent 变量名等约定变化，同步更新项目 CLAUDE.md
