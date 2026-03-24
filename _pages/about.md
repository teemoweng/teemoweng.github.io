---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

<div class="starter-note" markdown="1">
**Starter template:** this homepage already matches the one-page academic layout you referenced. Replace the placeholder values in `_config.yml` and `_pages/about.md`, then swap the files in `images/` with your own portrait, project thumbnails, and favicon assets.
</div>

Hi! I am **Your Name**, and this is an English-first academic homepage starter built for GitHub Pages. It keeps the same information architecture as the reference site: a fixed left profile card, anchor-based navigation, and a clean single-page flow for your research story.

My work broadly spans **AI systems**, **LLM applications**, and **human-centered tooling**. This placeholder copy is here to show the right tone and length for a strong first-screen introduction: who you are, what you work on, what you are currently seeking, and where people should contact you.

{% if site.author.googlescholar %}
I also maintain a Google Scholar profile with total citations shown here: <a href='{{ site.author.googlescholar }}'><strong><span id='total_cit'>Loading...</span></strong></a>. You can enable the automatic badge after adding your Scholar ID to repository secrets. <a href='{{ site.author.googlescholar }}'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=0f766e&style=flat&label=citations"></a>
{% endif %}

# 🔥 News

<div class="section-intro" markdown="1">
Use this section for short, timestamped updates: new papers, internships, collaborations, demos, scholarships, or application cycles.
</div>

- *2026.03*: Launched this GitHub Pages homepage starter and adapted the structure to match a modern academic profile.
- *2026.02*: Add your latest milestone here, such as a paper submission, lab visit, internship offer, or project release.
- *2025.11*: Add one more update to create an immediate sense of momentum for visitors and recruiters.

# 📝 Publications

<div class="section-intro" markdown="1">
If you do not have many papers yet, keep this section title and use project-style cards. Once you have publications, swap the labels and links without changing the layout.
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Research Project</div><img src='images/project-blueprint.svg' alt="project blueprint" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

**Project / Paper Slot 01**

Your Name, Collaborator Name, Advisor Name

A one- or two-sentence summary works best here. State the problem, your contribution, and why it matters. Keep the writing concrete and specific.

<div class="inline-links">
  <a href="https://arxiv.org/">Paper</a>
  <a href="https://github.com/">Code</a>
  <a href="/resume/">Notes</a>
</div>
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Selected Project</div><img src='images/project-lab.svg' alt="project lab" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

**Project / Paper Slot 02**

Your Name, Teammate Name

Use this card for a systems project, open-source tool, benchmark, or research prototype. The thumbnail can be a paper figure, architecture diagram, or screenshot.

<div class="inline-links">
  <a href="https://github.com/">GitHub</a>
  <a href="https://huggingface.co/">Demo</a>
  <a href="/resume/">Overview</a>
</div>
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">In Progress</div><img src='images/project-systems.svg' alt="project systems" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

**Project / Paper Slot 03**

Your Name, Research Group

This slot is useful for upcoming work, a thesis topic, or an application-focused project that represents your current direction.

<div class="inline-links">
  <a href="https://github.com/">Repository</a>
  <a href="https://scholar.google.com/">Citation Profile</a>
  <a href="/resume/">Summary</a>
</div>
</div>
</div>

# 📖 Educations
- *2024.09 - Present*: M.S. or Ph.D. student in **Your Department**, **Your University**, City, Country.
- *2020.09 - 2024.06*: B.S. in **Your Major**, **Your University**, City, Country.

# 💻 Internships
- *2025.06 - 2025.09*: Research Intern, **Lab or Company Name**, team focus and a short description of your work.
- *2024.07 - 2024.10*: Software Engineer / AI Intern, **Organization Name**, with a one-line outcome or responsibility.

# 🎖 Honors and Awards
- *2026.01*: Add your scholarship, fellowship, competition result, or best paper nomination here.
- *2025.05*: Add another award with the awarding institution or event name.
