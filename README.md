# Teemo Weng Personal Website

Live site: https://teemoweng.github.io/

Single-page personal homepage designed in [Claude Design](https://claude.ai/design) and served as static HTML via GitHub Pages.

## Structure

- `index.html` — the full homepage (styles and scripts inlined)
- `uploads/` — avatar, project images, and downloadable resume PDF
- `.nojekyll` — tells GitHub Pages to skip Jekyll and serve files as-is

## Features

- Light / dark theme toggle
- English / 中文 language switch
- Particle background, typing animation, scroll reveal
- News, Projects, Experience timeline, Education, Skills, Contact
- Downloadable PDF resume

## Local preview

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000`.

## Deployment

Push to the `main` branch of `teemoweng/teemoweng.github.io`. GitHub Pages (Settings → Pages → Source: `main`) will serve the site at https://teemoweng.github.io/ within a minute or two.
