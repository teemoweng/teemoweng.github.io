import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pageUrl = process.env.BASE_URL || pathToFileURL(new URL('../index.html', import.meta.url).pathname).href;
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(chromePath) ? { executablePath: chromePath } : {}),
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));
await page.addInitScript(() => {
  window.__qaAudio = { contexts: 0, starts: 0 };
  const NativeAudioContext = window.AudioContext;
  if (!NativeAudioContext) return;
  window.AudioContext = new Proxy(NativeAudioContext, {
    construct(Target, args) {
      window.__qaAudio.contexts++;
      const audio = new Target(...args);
      const createOscillator = audio.createOscillator.bind(audio);
      audio.createOscillator = () => {
        const oscillator = createOscillator();
        const start = oscillator.start.bind(oscillator);
        oscillator.start = (...startArgs) => { window.__qaAudio.starts++; return start(...startArgs); };
        return oscillator;
      };
      return audio;
    },
  });
});

const snapshot = () => page.evaluate(() => window.TeemoHandheld.snapshot());
const action = name => page.locator(`[data-handheld-action="${name}"]`).click();
const waitMode = mode => page.waitForFunction(expected => window.TeemoHandheld.snapshot().mode === expected, mode);
const language = lang => page.locator('.lang-btn').filter({ hasText: lang === 'zh' ? '中' : 'EN' }).click();
const focusConsole = () => page.locator('#handheld-console').focus();
const layoutFindings = [];
const menu = async index => {
  assert.equal((await snapshot()).mode, 'home');
  for (let i = 0; i < 5 && (await snapshot()).homeIndex !== index; i++) await action('down');
  assert.equal((await snapshot()).homeIndex, index);
  await action('a');
};
const home = async () => {
  for (let i = 0; i < 4 && (await snapshot()).mode !== 'home'; i++) await action('b');
  await waitMode('home');
};

async function assertDisplayFits(label) {
  const overflow = await page.locator('#handheld-display').evaluate(display => {
    const bounds = display.getBoundingClientRect();
    const walker = document.createTreeWalker(display, NodeFilter.SHOW_TEXT);
    const failures = [];
    let node;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim()) continue;
      const parent = node.parentElement;
      let visible = true;
      for (let ancestor = parent; ancestor && ancestor !== display.parentElement; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) visible = false;
      }
      if (!visible || parent.closest('[aria-hidden="true"], .sr-only, .visually-hidden')) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (!rect.width || !rect.height) continue;
        if (rect.left < bounds.left - 2 || rect.right > bounds.right + 2 || rect.top < bounds.top - 2 || rect.bottom > bounds.bottom + 2) {
          failures.push({ text: node.textContent.trim(), left: rect.left - bounds.left, right: rect.right - bounds.right, top: rect.top - bounds.top, bottom: rect.bottom - bounds.bottom });
        }
      }
    }
    return failures;
  });
  if (overflow.length) layoutFindings.push({ label, problem: 'LCD text outside display', overflow });
  const dimensions = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (dimensions.scrollWidth > dimensions.width + 1) layoutFindings.push({ label, problem: 'horizontal page overflow', dimensions });
}

// Plan a route using the public read-only diagnostic map, but execute every step
// through the same D-pad buttons available to a visitor. No state is injected.
function route(quest, target) {
  const queue = [{ x: quest.x, y: quest.y, steps: [] }];
  const seen = new Set([`${quest.x},${quest.y}`]);
  const directions = [['up', 0, -1], ['right', 1, 0], ['down', 0, 1], ['left', -1, 0]];
  while (queue.length) {
    const current = queue.shift();
    if (current.x === target.x && current.y === target.y) return current.steps;
    for (const [name, dx, dy] of directions) {
      const x = current.x + dx, y = current.y + dy, key = `${x},${y}`;
      if (x < 0 || y < 0 || y >= quest.map.length || x >= quest.map[y].length || quest.map[y][x] === '#' || seen.has(key)) continue;
      seen.add(key);
      queue.push({ x, y, steps: [...current.steps, name] });
    }
  }
  throw new Error(`No route from ${quest.x},${quest.y} to ${target.x},${target.y}`);
}

try {
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.TeemoHandheld?.snapshot().initialized);
  await page.locator('#handheld-console').scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const initial = await snapshot();
  assert.equal(initial.mode, 'title');
  assert.equal(initial.soundEnabled, false, 'sound starts muted without a gesture');
  assert.equal(await page.evaluate(() => window.__qaAudio.contexts), 0, 'no audio context is created before opt-in');
  assert.ok((await page.locator('#handheld-display').innerText()).trim().length > 10);
  await action('start');
  await waitMode('home');
  console.log('PASS title and physical Start boot');

  await focusConsole();
  const selected = (await snapshot()).homeIndex;
  await page.keyboard.press('ArrowDown');
  assert.equal((await snapshot()).homeIndex, (selected + 1) % 5, 'focused arrow keys navigate the menu');
  await page.keyboard.press('ArrowUp');
  assert.equal((await snapshot()).homeIndex, selected);
  await menu(0);
  await waitMode('player');
  assert.match(await page.locator('#handheld-display').innerText(), /Teemo|翁呈轩/i);
  await action('b');
  await waitMode('home');

  await menu(1);
  await waitMode('projects');
  const expectedProjects = [
    ['CareerBuddy', 'https://careerdesk-production.up.railway.app/'],
    ['AI', 'https://ai-shopping-agent.vercel.app/case-study'],
    ['RepoLens', 'https://repolens-hi6hjkfvkpqltmetdvxs4v.streamlit.app/'],
    ['CiteCook', 'https://citecook-rag-6j2jfyw4c67synm8lpxvub.streamlit.app/'],
  ];
  for (let index = 0; index < 4; index++) {
    assert.equal((await snapshot()).projectIndex, index);
    await action('a');
    await waitMode('project-detail');
    assert.match(await page.locator('#handheld-display').innerText(), new RegExp(expectedProjects[index][0], 'i'));
    const demo = page.locator(`#handheld-display a[href="${expectedProjects[index][1]}"]`);
    assert.equal(await demo.count(), 1, 'project detail links to its real demo');
    assert.equal(await demo.getAttribute('target'), '_blank');
    assert.match(await demo.getAttribute('rel') || '', /noopener/);
    const firstPage = await page.locator('#handheld-display').innerText();
    await action('right');
    assert.equal((await snapshot()).detailPage, 1);
    assert.notEqual(await page.locator('#handheld-display').innerText(), firstPage, 'project pagination reveals its design decision');
    assert.equal(await demo.count(), 1, 'demo stays accessible on the second detail page');
    await action('a');
    assert.equal((await snapshot()).detailPage, 0, 'A returns to the first detail page');
    await action('b');
    await waitMode('projects');
    if (index < 3) await action('down');
  }
  await home();
  await menu(2);
  await waitMode('skills');
  assert.ok((await page.locator('#handheld-display').innerText()).trim().length > 30);
  await home();
  await menu(3);
  await waitMode('contact');
  assert.ok(await page.locator('#handheld-display a[href^="mailto:"]').count());
  console.log('PASS keyboard, pointer navigation, profile, four projects, skills and contact');

  const beforeLanguage = await snapshot();
  await language('zh');
  const afterLanguage = await snapshot();
  assert.equal(afterLanguage.mode, beforeLanguage.mode, 'language switching preserves the open view');
  assert.equal(afterLanguage.projectIndex, beforeLanguage.projectIndex);
  assert.equal(afterLanguage.language, 'zh');
  assert.match(await page.locator('#handheld-display').innerText(), /[\u4e00-\u9fff]/);
  await page.locator('#handheld-sound').click();
  assert.equal((await snapshot()).soundEnabled, true);
  await page.waitForFunction(() => window.__qaAudio.starts > 0);
  await page.locator('#handheld-sound').click();
  assert.equal((await snapshot()).soundEnabled, false);
  const mutedStarts = await page.evaluate(() => window.__qaAudio.starts);
  await action('select');
  assert.equal(await page.evaluate(() => window.__qaAudio.starts), mutedStarts, 'muted controls schedule no sound');
  assert.notEqual((await snapshot()).palette, afterLanguage.palette, 'Select changes the LCD palette');
  await page.locator('#handheld-power').click();
  await waitMode('off');
  await action('down');
  assert.equal((await snapshot()).mode, 'off', 'controls cannot play while powered off');
  await page.locator('#handheld-power').click();
  await waitMode('boot');
  await page.locator('#handheld-power').click();
  await page.waitForTimeout(900);
  assert.equal((await snapshot()).mode, 'off', 'powering off during boot cancels its pending completion');
  await page.locator('#handheld-power').click();
  await waitMode('home');
  console.log('PASS language continuity, opt-in sound, palette and power cycle');

  await menu(4);
  await waitMode('quest-intro');
  await action('a');
  await waitMode('quest');
  let quest = (await snapshot()).quest;
  assert.equal(quest.map.length, 8);
  assert.ok(quest.map.every(row => row.length === 12));
  assert.equal(quest.total, 3);
  assert.equal(quest.items.length, 3);
  const questStart = { x: quest.x, y: quest.y };
  await action('up');
  await action('left');
  assert.deepEqual({ x: (await snapshot()).quest.x, y: (await snapshot()).quest.y }, questStart, 'maze walls block movement');
  await page.locator('#f-name').scrollIntoViewIfNeeded();
  await page.locator('#f-name').click();
  await page.waitForFunction(() => window.TeemoHandheld.snapshot().quest.paused);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.type('Ada');
  assert.equal(await page.locator('#f-name').inputValue(), 'Ada');
  assert.deepEqual({ x: (await snapshot()).quest.x, y: (await snapshot()).quest.y }, questStart, 'unfocused arrow keys must not move the player');
  await page.locator('#handheld-console').scrollIntoViewIfNeeded();
  await action('a');
  assert.equal((await snapshot()).quest.paused, false);
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.TeemoHandheld.snapshot().quest.paused);
  await page.locator('#handheld-console').scrollIntoViewIfNeeded();
  await action('a');
  assert.equal((await snapshot()).quest.paused, false);
  // Headless Chrome keeps background tabs visible. Exercise the browser event
  // handlers explicitly in addition to the real focus and scroll checks above.
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  assert.equal((await snapshot()).quest.paused, true, 'window blur pauses the game');
  await action('a');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    delete document.hidden;
  });
  assert.equal((await snapshot()).quest.paused, true, 'hidden-document event pauses the game');
  await action('a');
  console.log('PASS focus-out, form keyboard isolation and offscreen pause/resume');

  for (const [itemIndex, target] of quest.items.entries()) {
    quest = (await snapshot()).quest;
    for (const move of route(quest, target)) await action(move);
    if (itemIndex === 0) {
      const progress = (await snapshot()).quest;
      for (const lang of ['en', 'zh']) {
        await language(lang);
        const localized = (await snapshot()).quest;
        assert.deepEqual([localized.x, localized.y, localized.collected], [progress.x, progress.y, progress.collected], 'language switching preserves the current maze position and collected tokens');
      }
      await page.locator('#handheld-console').scrollIntoViewIfNeeded();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await action('a');
      assert.equal((await snapshot()).quest.paused, false);
    }
  }
  quest = (await snapshot()).quest;
  assert.equal(quest.collected.length, 3, 'all three tokens are collected by real D-pad presses');
  for (const move of route(quest, quest.exit)) await action(move);
  await waitMode('quest-win');
  assert.match(await page.locator('#handheld-display').innerText(), /[\u4e00-\u9fff]/);
  await action('a');
  await waitMode('home');
  console.log('PASS 12×8 maze, token collection and exit completion');

  for (const width of [320, 390, 900, 1440]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    for (const lang of ['en', 'zh']) {
      await language(lang);
      await page.locator('#handheld-console').scrollIntoViewIfNeeded();
      await assertDisplayFits(`${width}px ${lang} home`);
      for (const [index, mode] of [[0, 'player'], [1, 'projects'], [2, 'skills'], [3, 'contact'], [4, 'quest-intro']]) {
        await menu(index);
        await waitMode(mode);
        await assertDisplayFits(`${width}px ${lang} ${mode}`);
        if (mode === 'projects') {
          for (let project = 0; project < 4; project++) {
            await action('a');
            await waitMode('project-detail');
            const projectName = await page.locator('#handheld-display h3').innerText();
            await assertDisplayFits(`${width}px ${lang} ${projectName} challenge`);
            await action('right');
            await assertDisplayFits(`${width}px ${lang} ${projectName} decision`);
            await action('b');
            if (project < 3) await action('down');
          }
        }
        await home();
      }
    }
  }
  assert.deepEqual(layoutFindings, [], 'all responsive views must fit the LCD and page');
  console.log('PASS English/Chinese LCD text and page bounds at 320, 390, 900 and 1440px');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.TeemoHandheld?.snapshot().initialized);
  await page.locator('#handheld-console').scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await action('start');
  await waitMode('home');
  await menu(4);
  await action('a');
  await waitMode('quest');
  const firstToken = (await snapshot()).quest.items[0];
  for (const move of route((await snapshot()).quest, firstToken)) await action(move);
  assert.equal((await snapshot()).quest.collected.length, 1, 'reduced-motion mode keeps the game playable');

  const touchContext = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const touchPage = await touchContext.newPage();
  await touchPage.goto(pageUrl, { waitUntil: 'domcontentloaded' });
  await touchPage.waitForFunction(() => window.TeemoHandheld?.snapshot().initialized);
  await touchPage.locator('#handheld-console').scrollIntoViewIfNeeded();
  await touchPage.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await touchPage.locator('[data-handheld-action="start"]').tap();
  await touchPage.waitForFunction(() => window.TeemoHandheld.snapshot().mode === 'home');
  await touchPage.locator('[data-handheld-action="down"]').tap();
  await touchPage.locator('[data-handheld-action="a"]').tap();
  assert.equal(await touchPage.evaluate(() => window.TeemoHandheld.snapshot().mode), 'projects');
  await touchPage.locator('[data-handheld-action="b"]').tap();
  assert.equal(await touchPage.evaluate(() => window.TeemoHandheld.snapshot().mode), 'home');
  await touchContext.close();
  console.log('PASS mobile touch buttons without double activation');

  const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(pageUrl, { waitUntil: 'domcontentloaded' });
  assert.ok((await noJsPage.locator('#handheld-display').innerText()).trim().length > 10, 'LCD has useful static fallback content');
  assert.ok(await noJsPage.locator('#projects a[href^="https:"]').count() >= 8, 'normal project links remain available without JavaScript');
  await noJsPage.locator('#projects').scrollIntoViewIfNeeded();
  assert.equal(await noJsPage.locator('#projects .project-card').first().evaluate(card => getComputedStyle(card).opacity), '1', 'no-JS project cards stay visible');
  await noJsContext.close();
  assert.equal((await snapshot()).error, null, 'guarded controller operations should not hide errors');
  assert.deepEqual(pageErrors, [], 'handheld integration should produce no uncaught JavaScript errors');
  console.log('PASS reduced motion, no-JS content and no uncaught page errors');
} catch (error) {
  if (process.env.ARTIFACT_DIR) {
    mkdirSync(process.env.ARTIFACT_DIR, { recursive: true });
    await page.screenshot({ path: `${process.env.ARTIFACT_DIR}/handheld-failure.png`, fullPage: true }).catch(() => {});
  }
  console.error('State at failure:', await snapshot().catch(() => null));
  throw error;
} finally {
  await browser.close();
}
