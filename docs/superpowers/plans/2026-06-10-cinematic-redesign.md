# Cinematic Scroll-Narrative Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `index.html` as an 8-scene scroll-driven cinematic portfolio (spec: `docs/superpowers/specs/2026-06-10-cinematic-redesign-design.md`), preserving 100% of the current site's information and bilingual i18n.

**Architecture:** Single self-contained `index.html` (inline CSS/JS, no build step). GSAP 3 + ScrollTrigger + Lenis from CDN drive scene animations; content is fully visible without JS (animations are progressive enhancement gated on a `html.motion` class). Old site already backed up at `v1/`.

**Tech Stack:** Vanilla HTML/CSS/JS · GSAP 3.13 + ScrollTrigger · Lenis · Google Fonts (Hanken Grotesk, JetBrains Mono) · GitHub Pages

**Execution notes:**
- Local preview: `python3 -m http.server 8000` → http://127.0.0.1:8000 (per project CLAUDE.md)
- Visual verification via Chrome automation screenshots at each task
- Invoke `frontend-design` skill before Task 2 (sets design-quality bar for all subsequent tasks)
- Build the new file as `index-v2.html` during development; swap to `index.html` only at Task 10 (so the repo never holds a broken homepage)
- Commit after every task; do NOT push until user approves (push = deploy)

---

### Task 1: Avatar sticker asset

**Files:**
- Create: `uploads/avatar-sticker.png` (transparent-background cutout of existing avatar)

- [ ] **Step 1:** Invoke `hyperframes-media` skill → remove-background on `uploads/avatar-1776542946551.jpg`, output `uploads/avatar-sticker.png`
- [ ] **Step 2:** Verify output: PNG with alpha channel, subject edges clean (`Read` the image to inspect visually)
- [ ] **Step 3:** Commit: `git add uploads/avatar-sticker.png && git commit -m "Add avatar cutout for finale sticker"`

### Task 2: Scaffold — tokens, fonts, CDN, degradation gate, i18n plumbing

**Files:**
- Create: `index-v2.html`

- [ ] **Step 1:** Head: copy/adapt meta+OG tags from `index.html:4-18`; fonts: Hanken Grotesk 500/700/800 + JetBrains Mono 400; favicon: peach `tw` glyph; CDN scripts (deferred, end of body):
  - `https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js`
  - `https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js`
  - `https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js`
- [ ] **Step 2:** Design tokens + vignette:

```css
:root {
  --cream:#faf3ea; --cream-2:#f6e8d7; --sky-1:#f7b98f; --sky-2:#f8e8d8;
  --peach:#f0a868; --peach-deep:#d9854a; --accent:var(--peach-deep);
  --ink:#3e3228; --ink-2:#7a6a58; --ink-3:#b3a18c;
  --radius:16px;
}
/* fixed full-viewport soft vignette above content, below nav */
.vignette { position:fixed; inset:0; pointer-events:none; z-index:50;
  box-shadow: inset 0 0 18vmin 6vmin rgba(140,80,40,0.16); }
```

- [ ] **Step 3:** Degradation gate + Lenis/GSAP bridge (official pattern):

```js
const motionOK = matchMedia('(prefers-reduced-motion: no-preference)').matches
  && window.gsap && window.ScrollTrigger && window.Lenis;
if (motionOK) {
  document.documentElement.classList.add('motion');
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  initScenes(); // defined per-scene in later tasks
}
```

  All animation initial states (hidden/offset) are applied **only** via `html.motion` CSS rules or `gsap.set()` inside `initScenes()` — never in base CSS. No JS / no CDN ⇒ static readable page.
- [ ] **Step 4:** i18n plumbing: copy `i18n` object skeleton + `setLang()` from `index.html:943-1061`, drop theme/typing/particles/tweaks code. Keep `localStorage('tw-lang')`.
- [ ] **Step 5:** Verify: serve, open `http://127.0.0.1:8000/index-v2.html`, console shows no errors, cream page + vignette renders. Commit `feat: scaffold v2 shell`.

### Task 3: Scene 1 — Opening + pill nav

**Files:**
- Modify: `index-v2.html`

- [ ] **Step 1:** Fixed pill nav: center group About(`#why`) / `tw` logo / Work(`#chapters`); right group: lang toggle EN·中, Email(mailto), in(LinkedIn), gh(opens GitHub modal). Frosted pills (`backdrop-filter`), all entries i18n-keyed.
- [ ] **Step 2:** Scene markup: full-viewport sky gradient (`--sky-1→--sky-2`), giant `Teemo Weng` (clamp(64px,14vw,200px), weight 800, cream-white, soft peach text-shadow), mono subline `STRATEGY × PRODUCT × AI — IMPERIAL COLLEGE LONDON`, scroll hint.
- [ ] **Step 3:** Animation: load-in fade/rise; pinned scrub — name scales to ~0.6 / fades as scene scrolls away.
- [ ] **Step 4:** Screenshot desktop + 375px. Commit `feat: opening scene`.

### Task 4: Scene 2 — Statement word-lighting

**Files:**
- Modify: `index-v2.html`

- [ ] **Step 1:** Markup: `<h2 class="statement" data-i18n="statement">` EN: `I turn <em>strategy</em> into products people <em>love</em>:` / zh: `我把<em>战略</em>，做成<em>被人喜爱的产品</em>：`(em = peach highlight after lit).
- [ ] **Step 2:** Splitter (re-run after every `setLang`): wrap word tokens (EN: split on spaces; zh: split per char, keep `<em>` grouping) in `span.w`. Base color `--ink-3`; lit color: `--ink`, or `--peach-deep` if inside `em`.

```js
function splitStatement() {
  document.querySelectorAll('.statement').forEach(el => {
    const frag = document.createDocumentFragment();
    el.childNodes.forEach(node => {
      const hl = node.nodeName === 'EM';
      const text = node.textContent;
      const tokens = /[一-鿿]/.test(text) ? [...text] : text.split(/(?<= )/);
      tokens.forEach(tk => { const s = document.createElement('span');
        s.className = 'w' + (hl ? ' hl' : ''); s.textContent = tk; frag.appendChild(s); });
    });
    el.replaceChildren(frag);
    if (motionOK) ScrollTrigger.refresh();
  });
}
```

- [ ] **Step 3:** Scrub: pinned scene, `gsap.to('.statement .w', {color:..., stagger:..., scrollTrigger:{scrub:0.4}})`; rebuild tween on lang switch.
- [ ] **Step 4:** Verify lighting in both languages (screenshots mid-scroll). Commit `feat: statement scene`.

### Task 5: Scenes 3-5 — Chapters (Strategy / Product / Founder)

**Files:**
- Modify: `index-v2.html`

- [ ] **Step 1:** Shared chapter component: mono kicker (`CHAPTER 01 — CONSULTING`), giant peach title, one-line sub, horizontal floating card strip (desktop: parallax drift via scrub; mobile: `overflow-x:auto` + scroll-snap).
- [ ] **Step 2:** Content (all links verbatim from old site §3 spec checklist):
  - **Strategy:** cards BCG·2024(华为/NEV) / ZS·2023-24(骨科) / JQ·2023(东南亚GTM) / 财通·2022(食品饮料) / BDA·2021(复合调味品) — text-only cards, mono year, role line
  - **Product:** Beike AI·2025 (uploads/pasted-1776544288128-0.png, contact link) / LuxePop (uploads/Project2.png, Slides https://drive.google.com/file/d/14uT5YCMrzA3ab5zLMBuhzVeRDOuSm8id/view + Video https://www.bilibili.com/video/BV1GTQQBcEHR/) / POIZON·2023 (text card, 海外增长)
  - **Founder:** Hinbor (uploads/combined_hd.png, App Store https://apps.apple.com/us/app/hinbor/id1561569206 + Play https://play.google.com/store/apps/details?id=com.hinbor, 0→1 story)
- [ ] **Step 3:** All card text i18n-keyed (titles, descriptions, link labels).
- [ ] **Step 4:** Screenshots ×3 scenes ×2 langs. Commit `feat: chapter scenes`.

### Task 6: Scene 6 — Why me (pure typography)

**Files:**
- Modify: `index-v2.html`

- [ ] **Step 1:** Full-bleed deep warm-brown gradient block (`#4a3a30→#8a6a52`) — `#why` anchor; DOM hook `<div class="why-bg">` reserved for future photo (`background-image` swap).
- [ ] **Step 2:** Copy: kicker `Teams work with me because of my` + giant `rigor + builder's instinct` (zh: `严谨 + 产品手感`); 3 checklist items (consulting framework × product sense / BCG analysis → 0-to-1 launch / bilingual, China × global). i18n both langs.
- [ ] **Step 3:** Scrub: giant text rises; checklist items light up sequentially (opacity 0.3→1, check turns peach).
- [ ] **Step 4:** Screenshots. Commit `feat: why-me scene`.

### Task 7: Scene 7 — The Record (ledger)

**Files:**
- Modify: `index-v2.html`

- [ ] **Step 1:** Ledger sections with mono headers: EXPERIENCE(7: Beike/BCG/ZS/POIZON/JQ/财通/BDA + periods `2025.07–2025.09` etc + role + one-line desc) → EDUCATION(3: Imperial 2025–26 MSc / Fudan 2023–24 exchange / UBC 2021–25 Finance) → SKILLS(4 groups: Data Analysis SQL·Python·R·Excel / Visualization Tableau·Power BI / Product Design Figma·Axure·Stitch / Vibe Coding Claude Code·Codex) → NEWS(6 items 2022.03–2026.03, emoji kept) → tool-stack CTA link `https://teemoweng.github.io/html-lab/tech-stack/tech-stack-v2.html`. All rows from old `index.html` content, all i18n-keyed.
- [ ] **Step 2:** Row interaction: border-bottom hairlines; hover = row scales ~1.01 + peach gradient wash + year turns peach. Rows reveal staggered on scroll.
- [ ] **Step 3:** Screenshots both langs, verify 7+3+4+6 counts match spec §3. Commit `feat: record ledger`.

### Task 8: Scene 8 — Finale + avatar sticker + GitHub modal

**Files:**
- Modify: `index-v2.html`

- [ ] **Step 1:** Reverse sky gradient (`--sky-2→--sky-1`). Giant `Let's talk →` (mailto:teemow0106@163.com). Contact row: email / LinkedIn / GitHub(modal) / Resume download (`uploads/Resume CW.pdf` via JS, keep `downloadResume()`), tool-stack link, credits line `Designed & built with GSAP · Lenis · Claude Code · v1 ↗`(links to /v1/).
- [ ] **Step 2:** Avatar sticker: `uploads/avatar-sticker.png`, sticker outline via stacked `drop-shadow(0 0 0 2px #fff)`-style filters, gentle idle bob+tilt loop (`gsap.to` yoyo, motion-gated), waving `👋` chip. Positioned beside Let's talk.
- [ ] **Step 3:** Giant name footer: full-width `Teemo Weng`, translucent peach, rises from bottom on scrub.
- [ ] **Step 4:** Port GitHub modal from `index.html:897-1327` (markup+JS as-is), reskin to cream/peach tokens.
- [ ] **Step 5:** Test: modal opens/loads repos/closes (Esc+backdrop), resume downloads, sticker animates. Commit `feat: finale scene`.

### Task 9: i18n completeness + responsive + degradation passes

**Files:**
- Modify: `index-v2.html`

- [ ] **Step 1:** In-browser parity check (Chrome automation console):

```js
(() => { const en = Object.keys(i18n.en), zh = Object.keys(i18n.zh);
  return {enOnly: en.filter(k=>!i18n.zh[k]), zhOnly: zh.filter(k=>!i18n.en[k]),
          blank: [...document.querySelectorAll('[data-i18n]')].filter(e=>!e.textContent.trim()).map(e=>e.dataset.i18n)};})()
```

  Expected: all three arrays empty, in both languages.
- [ ] **Step 2:** 375px pass: every scene stacks, giant type clamps, card strips swipe, nav collapses gracefully (hide About/Work pills, keep logo+lang+gh).
- [ ] **Step 3:** Degradation: load with `?nojs` test (temporarily block CDN via DevTools or comment scripts) → all content visible/readable; `prefers-reduced-motion` emulation → no pins/scrubs.
- [ ] **Step 4:** Commit `feat: i18n + responsive + degradation hardening`.

### Task 10: Swap, full verification, docs

**Files:**
- Modify: `index.html` (replace with v2), delete `index-v2.html`
- Modify: `CLAUDE.md` (project)

- [ ] **Step 1:** Spec §3 information checklist — tick every line against rendered page (both langs).
- [ ] **Step 2:** Spec §9 acceptance: scroll smoothness, i18n switch, 375px, no-JS, console clean.
- [ ] **Step 3:** `mv index-v2.html index.html`; serve from `/` and re-smoke-test.
- [ ] **Step 4:** Update project `CLAUDE.md`: architecture note (8 scenes, GSAP/Lenis CDN, motion gate, v1/ archive), accent token rename, bump Schema footer v1.0→v1.1.
- [ ] **Step 5:** Commit `feat: ship cinematic redesign as index.html`. **Ask user before `git push`** (push = production deploy). Offer side-by-side: localhost preview vs v1/.

---

## Self-review notes

- Spec coverage: §3 info → Tasks 5/7/8; §4 deletions → Task 2 (not ported); §5 visual system → Tasks 2-8; §6 scenes 1-8 → Tasks 3-8; §7 tech → Tasks 2,9; §9 acceptance → Tasks 9,10. v1 backup + spec commit already done pre-plan.
- 终章动画形象（用户追加需求，规格 §6 幕8 之外的增量）→ Task 1 + Task 8 Step 2.
- No TBDs; all external URLs copied verbatim from current `index.html`.
