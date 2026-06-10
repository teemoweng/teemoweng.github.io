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

Everything lives in a single `index.html` with all CSS and JavaScript inlined. **Do not split into separate files.** There is no build step, no package manager, no bundler.

The site is an **8-scene cinematic scroll narrative** (2026-06 redesign, spec in `docs/superpowers/specs/2026-06-10-cinematic-redesign-design.md`):

1. `#s1` Opening (giant name on peach sky) → 2. `#s2` Statement (word-by-word lighting, pinned) → 3-5. `.chapter` ×3 Strategy/Product/Founder (pinned horizontal card strips) → 6. `#why` Why-me (dark warm typography scene, checklist lighting) → 7. `#record` ledger (experience/education/toolkit/news rows) → 8. `#s8` Finale (Let's talk + avatar sticker + giant name footer).

- **Animation stack**: GSAP 3 + ScrollTrigger + Lenis, loaded from jsdelivr CDN with `defer`.
- **Progressive enhancement gate**: all animation init happens only if `prefers-reduced-motion: no-preference` AND all three libs loaded (`motionOK` in the script). Initial hidden/offset states are applied **only via `gsap.from()`/`gsap.set()`** — never in base CSS. No JS / blocked CDN / reduced motion ⇒ fully readable static page. Keep it that way.
- **GSAP vs CSS conflict rule**: never put `transform` in a CSS `transition` on an element GSAP animates. Hover lifts use the standalone CSS properties `translate` / `scale` / `rotate` instead (they compose with GSAP's `transform`). Entrance tweens use `clearProps: 'transform'`.
- The statement word-splitter (`buildStatement()`) re-runs on every language switch (CJK splits per character, Latin per word).

Static assets (images, resume PDF) go in `uploads/`. The finale avatar sticker is `uploads/avatar-sticker.png` (background-removed cutout; regenerate via `npx hyperframes remove-background`).

**Old site (pre-redesign) is archived in `v1/`** (self-contained with its own `uploads/` copy, reachable at `/v1/`). Do not modify or delete it.

## i18n

All user-visible text must have entries in **both** `en` and `zh` inside the `i18n` object in the `<script>` block. DOM elements reference their key via `data-i18n="key"`. Missing a key in either language will cause that element to go blank on language switch.

Pattern for adding new text:
1. Add `data-i18n="my_key"` to the HTML element
2. Add `my_key: '...'` to both `i18n.en` and `i18n.zh`

Parity check (run in the browser console): keys of `i18n.en` and `i18n.zh` must be identical, and no `[data-i18n]` element may be blank after switching either language.

## Key Conventions

- **Palette** is peach/cream design tokens in `:root`: `--cream`, `--sky-1/2`, `--peach`, `--peach-deep` (accent), `--ink` scale, `--dusk` scale. Single theme — there is no dark/light toggle by design.
- **Fonts**: Hanken Grotesk (display + body) and JetBrains Mono (kicker labels) from Google Fonts; Chinese falls back to system fonts.
- The GitHub modal fetches repos live from the GitHub API; no mock data needed. It pauses Lenis while open.
- All contact actions are `mailto:` / direct links — there is no backend or form.

---

*Schema 版本：v1.1 — 2026-06-10*
*v1.1 变更：电影式滚动叙事重设计上线。记录 8 幕结构、GSAP/Lenis CDN + motionOK 渐进增强门、GSAP 与 CSS transition 冲突规则（hover 用 translate/scale/rotate 独立属性）、蜜桃奶油单主题 token、v1/ 旧版归档不可动。删除已不存在的约定（--accent oklch、.reveal/initReveal、联系表单、明暗切换）。*
*v1.0 初版：项目级 Claude 操作规则*
