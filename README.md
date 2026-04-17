# Teemo Weng Personal Website

Live site: https://teemoweng.github.io/

This repository contains the source code for Teemo Weng's personal website, hosted with GitHub Pages and built with Jekyll. The site serves as a personal homepage, portfolio, and resume hub, with sections for background, news, projects, education, internships, skills, and awards.

## What is in this repo

- `/_pages/about.md`: homepage content
- `/_pages/resume.md`: resume page
- `/_config.yml`: site-wide metadata and configuration
- `/images`: avatar, project visuals, favicon, and other static assets
- `/_includes`, `/_layouts`, `/_sass`: shared templates and styling
- `/google_scholar_crawler`: optional script for generating Google Scholar citation data

## Main sections on the site

- About Me
- News
- Projects
- Education
- Internships
- Skills
- Honors and Awards
- Resume

## Local preview

```bash
bundle install
bundle exec jekyll serve
```

Then open `http://127.0.0.1:4000`.

If you prefer the helper script in this repo, you can also run:

```bash
bash run_server.sh
```

## Deployment

The site is intended to be deployed through GitHub Pages at:

https://teemoweng.github.io/

After pushing changes to the connected GitHub Pages repository, the updated site can be published online.

## Optional Google Scholar automation

If you want to generate citation data automatically:

1. Find your Google Scholar ID from the `user=` parameter in your Scholar profile URL.
2. Add a repository secret named `GOOGLE_SCHOLAR_ID`.
3. Fill in `author.googlescholar` in `_config.yml`.

The optional crawler in `/google_scholar_crawler` writes citation data files that can be displayed on the site when configured.
