import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// Run with `node tests/test_dossier_homepage.mjs`; no server is required.
// Optional: CHROME_PATH overrides the browser, BASE_URL uses a preview server,
// and LIVE_GITHUB=1 adds a real API smoke check to the deterministic scenarios.
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const pageUrl = process.env.BASE_URL || new URL('../index.html', import.meta.url).href;
const apiUrl = 'https://api.github.com/users/teemoweng/repos?sort=updated&per_page=30';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
});
const failures = [];

// Fixtures exercise the API contract; the page itself continues to fetch live data.
const repos = [
  { name: 'fixture-project', description: '<img src=x onerror=alert(1)>', language: 'JavaScript',
    stargazers_count: 2, html_url: 'https://github.com/teemoweng/fixture-project',
    homepage: 'https://example.com/demo', has_pages: false, fork: false },
  { name: 'fixture-pages', description: 'A second repository', language: null,
    stargazers_count: 0, html_url: 'https://github.com/teemoweng/fixture-pages',
    homepage: 'javascript:alert(1)', has_pages: true, fork: false },
  { name: 'fixture-fork', description: 'Filtered fork', fork: true },
  { name: 'teemoweng.github.io', description: 'Filtered homepage', fork: false },
];

async function scenario(name, options, run) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  try {
    await run(page, context);
    assert.deepEqual(pageErrors, [], 'the page must not throw uncaught JavaScript errors');
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.error(`FAIL ${name}: ${error.stack || error}`);
  } finally {
    await context.close();
  }
}

async function visit(page) {
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
}

async function chooseLanguage(page, lang) {
  await page.locator(`.lang-btn[onclick="setLang('${lang}')"]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'), lang === 'zh' ? 'zh-CN' : 'en');
}

async function assertNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    clipped: Array.from(document.querySelectorAll('.hero-text, .project-card, .capability-piece, .contact-info'))
      .filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > document.documentElement.clientWidth + 1);
      }).map(element => element.className),
  }));
  assert.ok(dimensions.page <= dimensions.viewport + 1, `horizontal page overflow: ${JSON.stringify(dimensions)}`);
  assert.deepEqual(dimensions.clipped, [], 'primary readable panels must remain within the viewport');
  const overflowingFaces = await page.locator('.capability-face').evaluateAll(faces =>
    faces.filter(face => face.scrollWidth > face.clientWidth + 1 || face.scrollHeight > face.clientHeight + 1)
      .map(face => ({
        card: face.closest('[data-capability]').dataset.capability,
        face: face.className,
        content: [face.scrollWidth, face.scrollHeight],
        available: [face.clientWidth, face.clientHeight],
      }))
  );
  assert.deepEqual(overflowingFaces, [], 'capability titles and stories must fit on both card faces');
}

try {
  await scenario('language, paper theme, persistence, and bilingual completeness', {}, async page => {
    await visit(page);
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    for (const lang of ['zh', 'en']) {
      await chooseLanguage(page, lang);
      const missing = await page.evaluate(() => {
        const dictionaries = [Object.keys(i18n.en).sort(), Object.keys(i18n.zh).sort()];
        const keysMatch = JSON.stringify(dictionaries[0]) === JSON.stringify(dictionaries[1]);
        const untranslated = Array.from(document.querySelectorAll('[data-i18n], [data-i18n-aria-label]'))
          .filter(element => {
            const key = element.getAttribute('data-i18n') || element.getAttribute('data-i18n-aria-label');
            return !i18n.en[key] || !i18n.zh[key];
          }).map(element => element.getAttribute('data-i18n') || element.getAttribute('data-i18n-aria-label'));
        const blanks = Array.from(document.querySelectorAll('[data-i18n]'))
          .filter(element => !element.textContent.trim()).map(element => element.getAttribute('data-i18n'));
        return { keysMatch, untranslated, blanks };
      });
      assert.deepEqual(missing, { keysMatch: true, untranslated: [], blanks: [] });
      assert.equal(await page.locator('#theme-btn').getAttribute('aria-label'),
        lang === 'zh' ? '切换纸张主题' : 'Switch paper theme');
      await page.locator('#theme-btn').click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), lang === 'zh' ? 'dark' : 'light');
    }
    await chooseLanguage(page, 'zh');
    await page.locator('#theme-btn').click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  });

  await scenario('invalid stored preferences fall back without breaking the page', {}, async page => {
    await page.addInitScript(() => {
      localStorage.setItem('tw-lang', 'unsupported');
      localStorage.setItem('tw-theme', 'unsupported');
    });
    await visit(page);
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await chooseLanguage(page, 'zh');
  });

  await scenario('blocked storage still allows language and theme controls', {}, async page => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() { throw new DOMException('Storage disabled for test', 'SecurityError'); },
      });
    });
    await visit(page);
    await chooseLanguage(page, 'zh');
    await page.locator('#theme-btn').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.ok(await page.locator('[data-project-id="repolens"]').isVisible());
  });

  await scenario('independent capability cards and keyboard access', {}, async page => {
    await visit(page);
    const first = page.locator('[data-capability="consulting"]');
    const second = page.locator('[data-capability="sales"]');
    await first.focus();
    await page.keyboard.press('Enter');
    await second.click();
    assert.equal(await first.getAttribute('aria-pressed'), 'true');
    assert.equal(await second.getAttribute('aria-pressed'), 'true');
    await second.focus();
    await page.keyboard.press('Space');
    assert.equal(await first.getAttribute('aria-pressed'), 'true');
    assert.equal(await second.getAttribute('aria-pressed'), 'false');
    await chooseLanguage(page, 'zh');
    assert.equal(await first.getAttribute('aria-pressed'), 'true', 'translation must preserve card state');
  });

  await scenario('GitHub API success, safe rendering, focus trap, caching, and restoration', {}, async page => {
    let requests = 0;
    await page.route(apiUrl, route => {
      requests += 1;
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(repos) });
    });
    await visit(page);
    const opener = page.locator('button[onclick="openGithubModal()"]');
    await opener.click();
    await page.waitForSelector('.github-repo-card');
    assert.equal(await page.locator('.github-repo-card').count(), 2, 'fork and homepage repository should be filtered');
    assert.equal(await page.locator('.github-repo-desc').first().innerText(), repos[0].description);
    assert.equal(await page.locator('.github-repo-desc img').count(), 0, 'API descriptions must render as text');
    assert.equal(await page.locator('.github-link-live').nth(1).getAttribute('href'), 'https://teemoweng.github.io/fixture-pages');
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    assert.ok(await page.locator('#github-modal').evaluate(modal => modal.contains(document.activeElement)));
    const first = page.locator('#github-modal button[onclick="closeGithubModal()"]');
    const last = page.locator('#github-modal .github-footer-link');
    await last.focus();
    await page.keyboard.press('Tab');
    assert.ok(await first.evaluate(element => element === document.activeElement));
    await page.keyboard.press('Shift+Tab');
    assert.ok(await last.evaluate(element => element === document.activeElement));
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#github-modal').isVisible(), false);
    assert.ok(await opener.evaluate(element => element === document.activeElement));
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    await chooseLanguage(page, 'zh');
    await opener.click();
    assert.equal(requests, 1, 'reopening should reuse the API cache');
    assert.equal(await page.locator('.github-link-code').first().innerText(), '代码');
    await page.locator('#github-modal').click({ position: { x: 3, y: 3 } });
    assert.equal(await page.locator('#github-modal').isVisible(), false);
    assert.ok(await opener.evaluate(element => element === document.activeElement));
  });

  await scenario('GitHub API failure is readable and retryable', {}, async page => {
    let requests = 0;
    await page.route(apiUrl, route => {
      requests += 1;
      return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
    });
    await visit(page);
    await chooseLanguage(page, 'zh');
    const opener = page.locator('button[onclick="openGithubModal()"]');
    await opener.click();
    await page.waitForFunction(() => document.querySelector('#github-repos-body').textContent.includes('加载失败'));
    assert.ok(await page.locator('.github-footer-link').isVisible(), 'direct GitHub link should remain available');
    await page.keyboard.press('Escape');
    await opener.click();
    await page.waitForFunction(() => document.querySelector('#github-repos-body').textContent.includes('加载失败'));
    assert.equal(requests, 2, 'a failed request should be retried on reopening');
  });

  await scenario('reduced motion retains capability content without rotation', { reducedMotion: 'reduce' }, async page => {
    await visit(page);
    const card = page.locator('[data-capability="consulting"]');
    await card.click();
    assert.equal(await card.getAttribute('aria-pressed'), 'true');
    assert.equal(await card.locator('.capability-piece-inner').evaluate(el => getComputedStyle(el).transform), 'none');
    assert.equal(await card.locator('.capability-face--back').evaluate(el => getComputedStyle(el).visibility), 'visible');
    assert.ok(await page.locator('[data-project-id="repolens"]').isVisible());
  });

  for (const reducedMotion of ['no-preference', 'reduce']) {
    await scenario(`no JavaScript keeps projects, links, and capability stories readable (${reducedMotion})`,
      { javaScriptEnabled: false, reducedMotion }, async page => {
        await visit(page);
        for (const selector of ['.hero-name', '.project-card', '.news-item', '.tl-item', '.edu-card', '.skill-group', '.capability-story']) {
          const invisible = await page.locator(selector).evaluateAll(elements => elements.filter(el => {
            const style = getComputedStyle(el);
            return style.visibility !== 'visible' || Number(style.opacity) === 0 || !el.getClientRects().length
              || Array.from(function* () { for (let p = el.parentElement; p; p = p.parentElement) yield p; }())
                .some(parent => { const css = getComputedStyle(parent); return css.visibility !== 'visible' || Number(css.opacity) === 0; });
          }).map(el => el.className));
          assert.deepEqual(invisible, [], `${selector} should remain readable with JavaScript disabled`);
        }
        const resume = page.locator('a[data-i18n="btn_resume"]');
        assert.match(await resume.getAttribute('href'), /\.pdf$/);
        assert.match(await page.locator('a[data-i18n="archive_portfolio"]').getAttribute('href'), /\.pdf$/);
      });
  }

  await scenario('mobile and tablet reading stays inside the viewport in both languages', {}, async page => {
    await visit(page);
    for (const width of [320, 390, 768, 900]) {
      await page.setViewportSize({ width, height: 844 });
      for (const lang of ['en', 'zh']) {
        await chooseLanguage(page, lang);
        await assertNoHorizontalOverflow(page);
      }
    }
  });

  if (process.env.LIVE_GITHUB === '1') {
    await scenario('optional real GitHub API integration', {}, async page => {
      await visit(page);
      const responsePromise = page.waitForResponse(apiUrl, { timeout: 20000 });
      await page.locator('button[onclick="openGithubModal()"]')
        .click();
      const response = await responsePromise;
      assert.ok(response.ok(), `GitHub API returned ${response.status()}`);
      await page.waitForSelector('.github-repo-card');
      console.log(`INFO live GitHub API ${response.status()}, ${await page.locator('.github-repo-card').count()} repositories rendered`);
      await page.keyboard.press('Escape');
    });
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`${failures.length} dossier regression scenario(s) failed.`);
  process.exitCode = 1;
}
