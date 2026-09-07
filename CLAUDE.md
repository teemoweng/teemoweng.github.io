# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local Preview

```bash
python3 -m http.server 8000
# open http://127.0.0.1:8000
```

## Deployment

Push to the `main` branch — GitHub Pages serves it automatically at `teemoweng.github.io`.

## Architecture

**Pocket System is the approved main homepage direction (2026-09-07, Teemo's decision).** Earlier versions remain as historical pages.

| Path | What | Status |
|------|------|--------|
| `index.html` (root) | **Pocket System portfolio** (single-page sections, retro handheld materials, playable handheld, capability map, full-color portrait, light/dark themes) | **Main entry — maintain this one** |
| `v2/index.html` | **Historical cinematic scroll narrative** (8-scene GSAP redesign) | Retain files and assets; no homepage entrance and no content-sync requirement |
| `v1/index.html` | Frozen pre-redesign archive (self-contained with own `uploads/`) | **Do not modify or delete** |

Homepage navigation must not offer a “Cinematic version / 动效版” entrance to `/v2/`. The historical v2 finale credits still link back to `/` with their original "classic version" wording. `v2/index.html` references root assets by absolute path (`/uploads/...`) — preserve these files and references. The earlier handheld review preview at `https://teemo-pocket-review.vercel.app/` remains available.

Each version lives in a single HTML file with all CSS and JavaScript inlined. **Do not split into separate files.** There is no build step, no package manager, no bundler.

Content update checklist (new job/news/resume): update root `index.html` (news + timeline + projects + hero_desc + i18n en/zh). There is no ongoing requirement to update `v2/index.html`. Resume PDFs live at `uploads/resume-cw-{zh,en}-YYYYMM.pdf`; the root `downloadResume()` serves zh/en by `currentLang`. Preserve historical PDFs referenced by archived versions.

The following v2 implementation notes describe the retained historical page, not the active homepage or a requirement to keep v2 updated. The v2 site is an **8-scene cinematic scroll narrative** (2026-06 redesign, spec in `docs/superpowers/specs/2026-06-10-cinematic-redesign-design.md`):

1. `#s1` Opening (giant name on peach sky) → 2. `#s2` Statement (word-by-word lighting, pinned) → 3-5. `.chapter` ×3 Strategy/Product/Founder (pinned horizontal card strips) → 6. `#why` Why-me (dark warm typography scene, checklist lighting) → 7. `#record` ledger (experience/education/toolkit/news rows) → 8. `#s8` Finale (Let's talk + avatar sticker + giant name footer).

- **Animation stack**: GSAP 3 + ScrollTrigger + Lenis, loaded from jsdelivr CDN with `defer`.
- **Progressive enhancement gate**: all animation init happens only if `prefers-reduced-motion: no-preference` AND all three libs loaded (`motionOK` in the script). Initial hidden/offset states are applied **only via `gsap.from()`/`gsap.set()`** — never in base CSS. No JS / blocked CDN / reduced motion ⇒ fully readable static page. Keep it that way.
- **GSAP vs CSS conflict rule**: never put `transform` in a CSS `transition` on an element GSAP animates. Hover lifts use the standalone CSS properties `translate` / `scale` / `rotate` instead (they compose with GSAP's `transform`). Entrance tweens use `clearProps: 'transform'`.
- The statement word-splitter (`buildStatement()`) re-runs on every language switch (CJK splits per character, Latin per word).

Static assets (images, resume PDF) go in `uploads/`. The finale avatar sticker is `uploads/avatar-sticker.png` (background-removed cutout; regenerate via `npx hyperframes remove-background`).

**The root Pocket System site** uses the same i18n pattern (`data-i18n` + `i18n.en`/`i18n.zh` object), with `.pocket-homepage` material/color tokens, a dark/light theme toggle (`data-theme`, stored under `tw-pocket-theme`), and a typing-roles effect that becomes static with reduced motion. The background particles are disabled. The portrait retains its original colors inside the handheld frame; the capability map retains its central FDE label and independent flips without decorative edge circles.

## i18n

All user-visible text must have entries in **both** `en` and `zh` inside the `i18n` object in the `<script>` block. DOM elements reference their key via `data-i18n="key"`. Missing a key in either language will cause that element to go blank on language switch.

Pattern for adding new text:
1. Add `data-i18n="my_key"` to the HTML element
2. Add `my_key: '...'` to both `i18n.en` and `i18n.zh`

Parity check (run in the browser console): keys of `i18n.en` and `i18n.zh` must be identical, and no `[data-i18n]` element may be blank after switching either language.

## Key Conventions

- **Root palette** uses gray-green/cream shell materials, green LCD surfaces and purple-red controls, with corresponding dark-theme tokens. The historical **v2 palette** retains its peach/cream tokens and single-theme behavior.
- **Root fonts**: self-hosted Silkscreen for the name, brand and selected short labels; readable system Chinese/English fonts for body text. Historical v2 uses Hanken Grotesk and JetBrains Mono from Google Fonts.
- The GitHub modal fetches repos live from the GitHub API; no mock data needed. The root modal pauses the handheld while open; historical v2 pauses Lenis.
- Contact actions use `mailto:` / direct links. The root contact form opens a mail draft; there is no submission backend.

---

*Schema 版本：v1.3 — 2026-09-07*
*v1.3 变更：用户批准 Pocket System 作为正式主页并合入 main，合并与线上验证待执行；移除主页动效版入口要求，v2 保留为历史页面且不再要求内容同步；保留 v1/v2 历史资源及原掌机预览。更新根页面的主题、字体、原色照片、能力卡与联系表单约定，历史 v2 实现说明继续保留。*
*Schema 版本：v1.2 — 2026-07-08*
*v1.2 变更：站点重构为「经典版为主入口」双版本结构（Teemo 拍板：经典版更像求职个人主页）。root = 经典版（从 v1 复刻并更新：阿里实习进 hero/news/timeline/projects、双语简历 PDF 下载、✨动效版跳转按钮）；/v2/ = 电影式滚动叙事版（资产改用绝对路径 /uploads/，credits 回链经典版）；/v1/ = 冻结档案不动。新增「内容更新 checklist」：经历变动要同时改 root 和 v2 两处 + i18n 双语。*
*Schema 版本：v1.1 — 2026-06-10*
*v1.1 变更：电影式滚动叙事重设计上线。记录 8 幕结构、GSAP/Lenis CDN + motionOK 渐进增强门、GSAP 与 CSS transition 冲突规则（hover 用 translate/scale/rotate 独立属性）、蜜桃奶油单主题 token、v1/ 旧版归档不可动。删除已不存在的约定（--accent oklch、.reveal/initReveal、联系表单、明暗切换）。*
*v1.0 初版：项目级 Claude 操作规则*
