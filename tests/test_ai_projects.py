from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
CLASSIC = (ROOT / "index.html").read_text(encoding="utf-8")
CINEMATIC = (ROOT / "v2" / "index.html").read_text(encoding="utf-8")

REPOLENS_DEMO = "https://repolens-hi6hjkfvkpqltmetdvxs4v.streamlit.app/"
CITECOOK_DEMO = "https://citecook-rag-6j2jfyw4c67synm8lpxvub.streamlit.app/"
REPOLENS_REPO = "https://github.com/teemoweng/repolens"
CITECOOK_REPO = "https://github.com/teemoweng/citecook-rag"
CAREERBUDDY_REPO = "https://github.com/teemoweng/CareerBuddy"
SHOPPING_REPO = "https://github.com/teemoweng/ai-shopping-agent"
CAREERBUDDY_DEMO = "https://careerdesk-production.up.railway.app/"
SHOPPING_DEMO = "https://ai-shopping-agent.vercel.app/case-study"

PROJECT_IDS = ("repolens", "citecook", "careerbuddy", "ai-shopping")
PROJECT_COVERS = tuple(f"uploads/project-cover-{project_id}.webp" for project_id in PROJECT_IDS)
PAPER_RELATIVE_PATH = "uploads/papers/spark-spectral-post-attention-repair-kernels.pdf"


class AIProjectPortfolioTest(unittest.TestCase):
    def test_both_versions_present_exactly_the_four_independent_projects(self) -> None:
        classic_projects = CLASSIC[
            CLASSIC.index('id="projects"') : CLASSIC.index('id="experience"')
        ]
        cinematic_projects = CINEMATIC[
            CINEMATIC.index('id="s4"') : CINEMATIC.index('id="s5"')
        ]

        for section in (classic_projects, cinematic_projects):
            with self.subTest(page="classic" if section is classic_projects else "cinematic"):
                self.assertEqual(section.count('data-project-id="'), 4)
                for project_id in PROJECT_IDS:
                    self.assertEqual(section.count(f'data-project-id="{project_id}"'), 1)
                self.assertNotIn("Alibaba — AI for Space Leasing", section)
                self.assertNotIn("Beike AI — Overseas Commercialization", section)

    def test_both_versions_link_each_demo_and_repository(self) -> None:
        for page in (CLASSIC, CINEMATIC):
            with self.subTest(page="classic" if page is CLASSIC else "cinematic"):
                for url in (
                    REPOLENS_DEMO,
                    CITECOOK_DEMO,
                    REPOLENS_REPO,
                    CITECOOK_REPO,
                    CAREERBUDDY_REPO,
                    SHOPPING_REPO,
                    CAREERBUDDY_DEMO,
                    SHOPPING_DEMO,
                ):
                    self.assertIn(url, page)

    def test_project_covers_are_local_and_shared_by_both_versions(self) -> None:
        for page in (CLASSIC, CINEMATIC):
            for cover in PROJECT_COVERS:
                self.assertIn(cover, page)

        for cover in PROJECT_COVERS:
            cover_path = ROOT / cover
            self.assertTrue(cover_path.is_file(), f"missing portfolio cover: {cover}")
            self.assertGreater(cover_path.stat().st_size, 20_000, f"cover is suspiciously small: {cover}")

    def test_project_cover_alts_describe_real_product_screens(self) -> None:
        expected_alts = (
            "RepoLens interface showing an evidence dossier",
            "CiteCook interface showing a cited recipe answer",
            "CareerBuddy application board with a sample role",
            "TikTok-inspired AI shopping guide prototype",
        )
        for page in (CLASSIC, CINEMATIC):
            self.assertNotIn("Abstract evidence pipeline", page)
            self.assertNotIn("Abstract recipe retrieval", page)
            for alt in expected_alts:
                self.assertIn(f'alt="{alt}"', page)

    def test_both_versions_expose_bilingual_project_copy(self) -> None:
        expected_keys = (
            "repolens_badge",
            "repolens_title",
            "repolens_meta",
            "repolens_desc",
            "citecook_badge",
            "citecook_title",
            "citecook_meta",
            "citecook_desc",
            "careerbuddy_badge",
            "careerbuddy_title",
            "careerbuddy_meta",
            "careerbuddy_desc",
            "shopping_badge",
            "shopping_title",
            "shopping_meta",
            "shopping_desc",
            "project_live",
            "project_code",
        )
        for page in (CLASSIC, CINEMATIC):
            for key in expected_keys:
                self.assertGreaterEqual(
                    page.count(f"{key}:"),
                    2,
                    f"{key} must exist in both English and Chinese dictionaries",
                )
                self.assertIn(f'data-i18n="{key}"', page)

        self.assertEqual(CLASSIC.count("projects_heading:"), 2)
        self.assertIn('data-i18n="projects_heading"', CLASSIC)

    def test_external_project_links_are_safe(self) -> None:
        for page in (CLASSIC, CINEMATIC):
            for url in (
                REPOLENS_DEMO,
                CITECOOK_DEMO,
                REPOLENS_REPO,
                CITECOOK_REPO,
                CAREERBUDDY_REPO,
                SHOPPING_REPO,
                CAREERBUDDY_DEMO,
                SHOPPING_DEMO,
            ):
                href = f'href="{url}"'
                with self.subTest(url=url):
                    self.assertIn(href, page)
                if href not in page:
                    continue
                link_start = page.index(href)
                link_end = page.index(">", link_start)
                opening_tag = page[link_start:link_end]
                self.assertIn('target="_blank"', opening_tag)
                self.assertIn('rel="noopener"', opening_tag)

    def test_language_switch_updates_document_language(self) -> None:
        expected = "document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');"
        for page in (CLASSIC, CINEMATIC):
            self.assertIn(expected, page)

    def test_cinematic_projects_belong_to_product_chapter(self) -> None:
        product_start = CINEMATIC.index('id="s4"')
        product_end = CINEMATIC.index('id="s5"')
        for key in ('data-i18n="repolens_title"', 'data-i18n="citecook_title"'):
            location = CINEMATIC.index(key)
            self.assertGreater(location, product_start)
            self.assertLess(location, product_end)

    def test_classic_page_exposes_the_accepted_paper_as_a_safe_link(self) -> None:
        self.assertIn('href="#research" data-i18n="nav_research"', CLASSIC)
        self.assertIn('<section id="research">', CLASSIC)

        link_start = CLASSIC.index(f'href="{PAPER_RELATIVE_PATH}"')
        link_end = CLASSIC.index(">", link_start)
        opening_tag = CLASSIC[link_start:link_end]
        self.assertIn('target="_blank"', opening_tag)
        self.assertIn('rel="noopener"', opening_tag)

        projects_position = CLASSIC.index('<section id="projects">')
        research_position = CLASSIC.index('<section id="research">')
        experience_position = CLASSIC.index('<section id="experience">')
        self.assertLess(projects_position, research_position)
        self.assertLess(research_position, experience_position)

    def test_paper_asset_is_served_from_the_stable_public_path(self) -> None:
        paper_path = ROOT / PAPER_RELATIVE_PATH
        self.assertTrue(paper_path.is_file(), f"missing accepted paper: {PAPER_RELATIVE_PATH}")
        self.assertGreater(paper_path.stat().st_size, 500_000)
        self.assertEqual(paper_path.read_bytes()[:5], b"%PDF-")

    def test_classic_research_section_has_complete_bilingual_copy(self) -> None:
        expected_keys = (
            "nav_research",
            "section_research",
            "research_heading",
            "research_status",
            "research_venue",
            "research_desc",
            "research_paper",
        )
        for key in expected_keys:
            self.assertEqual(
                CLASSIC.count(f"{key}:"),
                2,
                f"{key} must exist once in each language dictionary",
            )
            self.assertIn(f'data-i18n="{key}"', CLASSIC)

    def test_acceptance_news_is_synchronized_across_both_site_versions(self) -> None:
        for page in (CLASSIC, CINEMATIC):
            with self.subTest(page="classic" if page is CLASSIC else "cinematic"):
                self.assertEqual(page.count("news_research:"), 2)
                self.assertIn('data-i18n="news_research"', page)
                self.assertIn("2026.08", page)


if __name__ == "__main__":
    unittest.main()
