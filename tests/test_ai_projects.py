from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
CLASSIC = (ROOT / "index.html").read_text(encoding="utf-8")
CINEMATIC = (ROOT / "v2" / "index.html").read_text(encoding="utf-8")

REPOLENS_DEMO = "https://repolens-hi6hjkfvkpqltmetdvxs4v.streamlit.app/"
CITECOOK_DEMO = "https://citecook-rag-6j2jfyw4c67synm8lpxvub.streamlit.app/"
REPOLENS_REPO = "https://github.com/teemoweng/repolens"
CITECOOK_REPO = "https://github.com/teemoweng/citecook-rag"


class AIProjectPortfolioTest(unittest.TestCase):
    def test_both_versions_link_each_demo_and_repository(self) -> None:
        for page in (CLASSIC, CINEMATIC):
            with self.subTest(page="classic" if page is CLASSIC else "cinematic"):
                for url in (
                    REPOLENS_DEMO,
                    CITECOOK_DEMO,
                    REPOLENS_REPO,
                    CITECOOK_REPO,
                ):
                    self.assertIn(url, page)

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

    def test_external_project_links_are_safe(self) -> None:
        for page in (CLASSIC, CINEMATIC):
            for url in (REPOLENS_DEMO, CITECOOK_DEMO, REPOLENS_REPO, CITECOOK_REPO):
                link_start = page.index(f'href="{url}"')
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


if __name__ == "__main__":
    unittest.main()
