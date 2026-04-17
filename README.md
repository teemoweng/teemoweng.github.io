# Academic Homepage Starter
https://teemoweng.github.io/
This repository is now a ready-to-customize GitHub Pages academic homepage with the overall structure: sticky profile sidebar, one-page anchor navigation, and clean sections for research, experience, and achievements.

## What to edit first

1. Update personal metadata in `_config.yml`.
2. Replace the placeholder content in `_pages/about.md`.
3. Swap the placeholder graphics in `images/` with your own avatar, project figures, and favicon.
4. Change `repository` in `_config.yml` to `USERNAME/USERNAME.github.io`.
5. Push to a GitHub repository named `USERNAME.github.io` and enable GitHub Pages.

## Main sections included

- `About Me`
- `News`
- `Publications`
- `Educations`
- `Internships`
- `Honors and Awards`
- `Resume` page linked from the sidebar

## Local preview

```bash
bundle install
bundle exec jekyll serve
```

Then open [http://127.0.0.1:4000](http://127.0.0.1:4000).

## Optional Google Scholar automation

If you want automatic citation data:

1. Find your Google Scholar ID from the `user=` parameter in your Scholar URL.
2. Add a repository secret named `GOOGLE_SCHOLAR_ID`.
3. Fill in `author.googlescholar` in `_config.yml`.

The workflow now skips itself when that secret is not set, so the homepage works fine without Scholar integration.

## Credits

This starter is based on [RayeRen/acad-homepage.github.io](https://github.com/RayeRen/acad-homepage.github.io), which in turn builds on Minimal Mistakes and Academic Pages.
