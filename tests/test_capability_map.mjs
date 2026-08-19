import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageUrl = pathToFileURL(new URL('../index.html', import.meta.url).pathname).href;

try {
  await page.goto(pageUrl);

  const sectionOrder = await page.locator('body > section').evaluateAll((sections) =>
    sections.map((section) => section.id)
  );
  const capabilitiesIndex = sectionOrder.indexOf('capabilities');
  const newsIndex = sectionOrder.indexOf('news');

  assert.notEqual(capabilitiesIndex, -1, 'capability map should exist on the classic homepage');
  assert.equal(
    capabilitiesIndex + 1,
    newsIndex,
    'capability map should sit immediately above Latest News'
  );
  assert.equal(
    await page.locator('#capabilities .capability-piece').count(),
    4,
    'capability map should contain four interactive puzzle pieces'
  );

  console.log('PASS capability map structure');

  const consulting = page.locator('[data-capability="consulting"]');
  const sales = page.locator('[data-capability="sales"]');

  await consulting.click();
  assert.equal(await consulting.getAttribute('aria-pressed'), 'true');
  assert.equal(await consulting.evaluate((piece) => piece.classList.contains('is-flipped')), true);

  await sales.click();
  assert.equal(await sales.getAttribute('aria-pressed'), 'true');
  assert.equal(await sales.evaluate((piece) => piece.classList.contains('is-flipped')), true);
  assert.equal(
    await consulting.getAttribute('aria-pressed'),
    'true',
    'opening a second piece should preserve the first piece state'
  );

  await sales.click();
  assert.equal(await sales.getAttribute('aria-pressed'), 'false', 'selecting an open piece should close it');
  assert.equal(
    await consulting.getAttribute('aria-pressed'),
    'true',
    'closing one piece should not change another open piece'
  );

  await consulting.click();
  assert.equal(await consulting.getAttribute('aria-pressed'), 'false');

  console.log('PASS capability map flip behavior');

  await page.locator('.lang-btn').filter({ hasText: '中' }).click();
  assert.equal(
    await page.locator('.capability-piece--consulting .capability-name').innerText(),
    '顾问能力'
  );
  assert.equal(
    await page.locator('.capability-piece--engineering .capability-definition').innerText(),
    '把 AI 接入数据、工具与真实业务流程。'
  );
  assert.match(
    await page.locator('.capability-piece--teaching .capability-story').innerText(),
    /Easy 与 Look4Tutor/
  );
  assert.equal(
    await page.locator('.capability-puzzle').getAttribute('aria-label'),
    '交互式 FDE 能力拼图'
  );

  console.log('PASS capability map bilingual content');

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload();
  const desktopPieces = await page.locator('.capability-piece').evaluateAll((pieces) =>
    pieces.map((piece) => {
      const rect = piece.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })
  );
  assert.ok(Math.abs(desktopPieces[0].y - desktopPieces[1].y) < 2, 'top pieces should share a row');
  assert.ok(Math.abs(desktopPieces[2].y - desktopPieces[3].y) < 2, 'bottom pieces should share a row');
  assert.ok(desktopPieces[2].y > desktopPieces[0].y, 'bottom pieces should sit below the top pair');

  const puzzleBox = await page.locator('.capability-puzzle').boundingBox();
  const coreBox = await page.locator('.capability-core').boundingBox();
  assert.ok(puzzleBox && coreBox, 'puzzle and FDE core should be visible');
  assert.ok(
    Math.abs((coreBox.x + coreBox.width / 2) - (puzzleBox.x + puzzleBox.width / 2)) < 3,
    'FDE core should be centered horizontally'
  );
  assert.ok(
    Math.abs((coreBox.y + coreBox.height / 2) - (puzzleBox.y + puzzleBox.height / 2)) < 3,
    'FDE core should be centered vertically'
  );

  await page.locator('[data-capability="consulting"]').click();
  await page.waitForTimeout(750);
  assert.notEqual(
    await page.locator('[data-capability="consulting"] .capability-piece-inner').evaluate(
      (inner) => getComputedStyle(inner).transform
    ),
    'none',
    'selecting a piece should create a visible flip transform'
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const mobilePieces = await page.locator('.capability-piece').evaluateAll((pieces) =>
    pieces.map((piece) => {
      const rect = piece.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })
  );
  assert.ok(Math.abs(mobilePieces[0].y - mobilePieces[1].y) < 2, 'mobile should preserve the 2×2 puzzle');
  assert.ok(mobilePieces[0].width >= 150, 'mobile pieces should remain large enough to read');

  console.log('PASS capability map responsive puzzle geometry');

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload();
  const capabilityNav = page.locator('nav a[href="#capabilities"]');
  assert.equal(await capabilityNav.count(), 1, 'desktop navigation should link to the capability map');
  await page.locator('.lang-btn').filter({ hasText: '中' }).click();
  assert.equal(await capabilityNav.innerText(), '能力图谱');

  console.log('PASS capability map navigation');

  await page.setViewportSize({ width: 900, height: 800 });
  assert.equal(
    await page.locator('.nav-links').evaluate((links) => getComputedStyle(links).display),
    'none',
    'the additional capability link should not crowd navigation at tablet widths'
  );

  console.log('PASS capability map tablet navigation safety');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const reducedMotionPiece = page.locator('[data-capability="consulting"]');
  await reducedMotionPiece.click();
  assert.equal(
    await reducedMotionPiece.locator('.capability-piece-inner').evaluate(
      (inner) => getComputedStyle(inner).transform
    ),
    'none',
    'reduced-motion mode should replace the 3D rotation'
  );
  assert.equal(
    await reducedMotionPiece.locator('.capability-face--back').evaluate(
      (face) => getComputedStyle(face).visibility
    ),
    'visible',
    'reduced-motion mode should reveal the back without rotating it'
  );

  console.log('PASS capability map reduced-motion behavior');
} finally {
  await browser.close();
}
