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

Static assets (images, resume PDF) go in `uploads/`.

## i18n

All user-visible text must have entries in **both** `en` and `zh` inside the `i18n` object in the `<script>` block. DOM elements reference their key via `data-i18n="key"`. Missing a key in either language will cause that element to go blank on language switch.

Pattern for adding new text:
1. Add `data-i18n="my_key"` to the HTML element
2. Add `my_key: '...'` to both `i18n.en` and `i18n.zh`

## Key Conventions

- **Accent color** is defined via CSS custom property `--accent` (oklch warm orange); keep the palette consistent when adding new UI.
- Scroll-reveal animations use the `.reveal` class + IntersectionObserver in `initReveal()`. Add `.reveal` to any new block-level element that should animate in.
- The GitHub modal fetches repos live from the GitHub API; no mock data needed.
- The contact form uses `mailto:` — there is no backend.
