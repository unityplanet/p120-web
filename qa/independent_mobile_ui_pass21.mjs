import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const TARGET_SHA = 'ef6020afa0df6035bbbfe540a1ace815341589d4';
const LOCAL_BASE = process.env.P120_LOCAL_BASE || 'http://127.0.0.1:4173';
const LIVE_BASE = process.env.P120_LIVE_BASE || 'https://unityplanet.github.io/p120-web';
const outDir = path.resolve('qa-artifacts/mobile-ui-pass21-independent');
fs.mkdirSync(outDir, { recursive: true });

const widths = [360, 390, 430, 480];
const themes = ['ivory', 'graphite', 'museum'];
const locales = [
  { id: 'ru', root: '/', system: '/system/', sessionKey: 'p120_runtime_session_ru_v1' },
  { id: 'en', root: '/en/', system: '/en/system/', sessionKey: 'p120_runtime_session_en_v1' },
];
const systemStates = [
  { id: 'preflight', seedScreen: 'preflight', responseCount: 0 },
  { id: 'test', seedScreen: 'test', responseCount: 7 },
  { id: 'transition', seedScreen: 'transition', responseCount: 18 },
  { id: 'results', seedScreen: 'results', responseCount: 'all' },
  { id: 'resume', seedScreen: 'home', responseCount: 7 },
];

const expected = {
  ivory: { starts: ['rgb(23, 23, 21)', 'rgb(36, 54, 51)'], color: 'rgb(255, 255, 255)' },
  graphite: { starts: ['rgb(88, 112, 108)', 'rgb(73, 99, 95)'], color: 'rgb(245, 239, 229)' },
  museum: { starts: ['rgb(47, 117, 111)', 'rgb(37, 95, 92)'], color: 'rgb(255, 249, 236)' },
};

const report = {
  targetSha: TARGET_SHA,
  startedAt: new Date().toISOString(),
  source: {}, contrast: {}, environments: {}, failures: [], warnings: [],
  counts: { publicCases: 0, systemCases: 0, progressCases: 0, switchCases: 0, pressCases: 0 },
};

function fail(scope, message, detail = null) { report.failures.push({ scope, message, detail }); }
function warn(scope, message, detail = null) { report.warnings.push({ scope, message, detail }); }
function assert(scope, condition, message, detail = null) { if (!condition) fail(scope, message, detail); }
function hexToRgb(hex) { const h = hex.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => { const x = v / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) { const l1 = luminance(a), l2 = luminance(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
function mixHex(a, b, ratioA) {
  const A = hexToRgb(a), B = hexToRgb(b);
  const vals = A.map((v, i) => Math.round(v * ratioA + B[i] * (1 - ratioA)));
  return '#' + vals.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}
function cleanBase(base) { return base.replace(/\/$/, ''); }
function urlFor(base, route) { return cleanBase(base) + route; }

function sourceAudit() {
  const cta = fs.readFileSync('p120-mobile-primary-cta-pass2.css', 'utf8');
  const pass53 = fs.readFileSync('p120-pass53-visual-corrections-v1.0.css', 'utf8');
  const ruSystem = fs.readFileSync('system/index.html', 'utf8');
  const enSystem = fs.readFileSync('en/system/index.html', 'utf8');
  const ruRoot = fs.readFileSync('index.html', 'utf8');
  const enRoot = fs.readFileSync('en/index.html', 'utf8');
  const checks = {
    ctaActivePair: /button\.cta,\s*[\s\S]*button\.cta\.active/.test(cta),
    graphiteHardened: cta.includes('#58706C') && cta.includes('#49635F'),
    museumHardened: cta.includes('#2F756F') && cta.includes('#255F5C'),
    ruSystemScopedAuthority: pass53.includes('body[data-p120-page="system"][data-p120-locale="ru"] .mobile-bottom-nav button.cta.active'),
    progressGrid: pass53.includes('.mobile-menu-progress-top > div:first-child') && pass53.includes('display:grid') && pass53.includes('gap:4px'),
    progressCounterNowrap: pass53.includes('.mobile-menu-progress-top > span:last-child') && pass53.includes('white-space:nowrap'),
    ruSystemIdentity: ruSystem.includes('data-p120-page="system"') && ruSystem.includes('data-p120-locale="ru"'),
    enSystemIdentity: enSystem.includes('data-p120-page="system"') && enSystem.includes('data-p120-locale="en"'),
    ruRootDedicatedCta: ruRoot.includes('data-p120-mobile-primary-cta="pass2"'),
    enRootDedicatedCta: enRoot.includes('data-p120-mobile-primary-cta="pass2"'),
    enSystemDedicatedCta: enSystem.includes('data-p120-mobile-primary-cta="pass2"'),
  };
  report.source = checks;
  for (const [k, v] of Object.entries(checks)) assert('source:' + k, v, 'Source authority check failed');

  const ivoryEnd = mixHex('#171715', '#4A8E89', 0.74);
  const ratios = {
    ivoryStart: contrast('#FFFFFF', '#171715'), ivoryEnd: contrast('#FFFFFF', ivoryEnd),
    graphiteStart: contrast('#F5EFE5', '#58706C'), graphiteEnd: contrast('#F5EFE5', '#49635F'),
    museumStart: contrast('#FFF9EC', '#2F756F'), museumEnd: contrast('#FFF9EC', '#255F5C'),
  };
  report.contrast = { ratios, ivoryEnd };
  for (const [k, ratio] of Object.entries(ratios)) assert('contrast:' + k, ratio >= 4.5, `Contrast ${ratio.toFixed(2)} is below 4.5:1`);
}

async function instrumentMeta(page) {
  await page.waitForFunction(() => Array.isArray(window.P120_INSTRUMENT?.items) && window.P120_INSTRUMENT.items.length > 0);
  return page.evaluate(() => window.P120_INSTRUMENT.items.map(i => ({ id: i.id, value: Array.isArray(i.choices) && i.choices.length ? String(i.choices[0].value) : '1' })));
}
function makeResponses(items, count) {
  const n = count === 'all' ? items.length : Math.min(Number(count), items.length);
  return Object.fromEntries(items.slice(0, n).map(i => [i.id, i.value]));
}
async function setStorage(page, key, state, theme) {
  await page.evaluate(({ key, state, theme }) => {
    localStorage.setItem(key, JSON.stringify(state));
    localStorage.setItem('p120_web_theme_v16', theme);
  }, { key, state, theme });
}
async function inspectCta(page) {
  const loc = page.locator('.mobile-bottom-nav button.cta').first();
  await loc.waitFor({ state: 'visible', timeout: 10000 });
  return loc.evaluate(el => {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    const icon = el.querySelector('.mobile-nav-icon'), ics = icon ? getComputedStyle(icon) : null;
    return {
      className: el.className, text: el.textContent.trim(), backgroundImage: cs.backgroundImage,
      backgroundColor: cs.backgroundColor, color: cs.color, borderColor: cs.borderColor, boxShadow: cs.boxShadow,
      width: r.width, left: r.left, right: r.right, viewport: innerWidth,
      iconColor: ics?.color || null, iconBackground: ics?.backgroundColor || null,
      bodyTheme: document.body.getAttribute('data-theme'), bodyPage: document.body.getAttribute('data-p120-page'), bodyLocale: document.body.getAttribute('data-p120-locale'),
    };
  });
}
function assertThemeSurface(scope, surface, theme) {
  const exp = expected[theme];
  assert(scope, surface.bodyTheme === theme, `Body theme is ${surface.bodyTheme}, expected ${theme}`);
  assert(scope, surface.color === exp.color, `CTA text color ${surface.color}, expected ${exp.color}`);
  for (const rgb of exp.starts) assert(scope, surface.backgroundImage.includes(rgb), `CTA gradient missing ${rgb}`, surface.backgroundImage);
  assert(scope, surface.left >= -0.5 && surface.right <= surface.viewport + 0.5, 'CTA is clipped or overflows viewport', surface);
}

async function inspectProgress(page, expectedCount, totalItems, scope) {
  if (expectedCount <= 0) return null;
  await page.locator('[data-mobile-menu]').first().click();
  await page.waitForFunction(() => document.body.classList.contains('mobile-menu-open'));
  const card = page.locator('.mobile-menu-progress').first();
  await card.waitFor({ state: 'visible' });
  const data = await card.evaluate(el => {
    const top = el.querySelector('.mobile-menu-progress-top');
    const left = top?.querySelector(':scope > div:first-child');
    const label = left?.querySelector('span'), metric = left?.querySelector('strong'), counter = top?.querySelector(':scope > span:last-child');
    const rect = x => x ? (() => { const r = x.getBoundingClientRect(); return { left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height }; })() : null;
    const lcs = left ? getComputedStyle(left) : null, menu = el.closest('.mobile-menu');
    return {
      labelText: label?.textContent.trim() || '', metricText: metric?.textContent.trim() || '', counterText: counter?.textContent.trim() || '',
      left: rect(left), label: rect(label), metric: rect(metric), counter: rect(counter),
      leftDisplay: lcs?.display || null, leftRowGap: lcs?.rowGap || null,
      menuOverflow: menu ? menu.scrollWidth - menu.clientWidth : 0, cardOverflow: el.scrollWidth - el.clientWidth,
    };
  });
  const pct = Math.round(expectedCount / totalItems * 100);
  assert(scope, data.leftDisplay === 'grid', `Progress left cluster display is ${data.leftDisplay}, expected grid`, data);
  assert(scope, data.metricText === `${pct}%`, `Metric is ${data.metricText}, expected ${pct}%`, data);
  assert(scope, data.counterText.includes(String(expectedCount)) && data.counterText.includes(String(totalItems)), 'Counter text does not match seeded progress', data);
  assert(scope, data.metric && data.label && data.metric.top >= data.label.bottom + 2.5, 'Label and metric are not vertically separated', data);
  assert(scope, data.left && data.counter && data.left.right <= data.counter.left + 0.5, 'Left cluster overlaps counter', data);
  assert(scope, data.menuOverflow <= 1 && data.cardOverflow <= 1, 'Progress drawer has horizontal overflow', data);
  report.counts.progressCases++;
  await page.locator('[data-drawer-close]').first().click().catch(() => {});
  return data;
}

async function seedSystem(page, base, locale, theme, spec) {
  const url = urlFor(base, locale.system);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const items = await instrumentMeta(page), responses = makeResponses(items, spec.responseCount), count = Object.keys(responses).length;
  const state = {
    participantId: 'P120-AUDIT', sessionLocale: locale.id, screen: spec.seedScreen,
    itemIndex: spec.id === 'results' ? items.length : Math.min(count, Math.max(0, items.length - 1)),
    responses, adminModes: { P72D: 'General Pattern' }, telemetry: [],
    startedAt: new Date().toISOString(), consentAt: new Date().toISOString(), lastSavedAt: new Date().toISOString(),
  };
  await setStorage(page, locale.sessionKey, state, theme);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('.mobile-bottom-nav button.cta', { timeout: 10000 });
  return { items, count };
}
async function seedPublic(page, base, locale, theme, progress) {
  const url = urlFor(base, locale.root);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const items = await instrumentMeta(page), key = locale.id === 'ru' ? 'p120_editorial_state_ru_v1' : 'p120_editorial_state_en_v1';
  const responses = makeResponses(items, progress ? 7 : 0);
  const state = { participantId:'P120-AUDIT-EDITORIAL', screen:'home', itemIndex:0, responses, adminModes:{}, telemetry:[], startedAt:null, consentAt:null, lastSavedAt:new Date().toISOString() };
  await setStorage(page, key, state, theme);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('.mobile-bottom-nav button.cta', { timeout: 10000 });
  return { items, count: Object.keys(responses).length };
}

async function clickVisibleTheme(page, theme) {
  const candidates = page.locator(`[data-set-theme="${theme}"]`);
  const n = await candidates.count();
  for (let i = 0; i < n; i++) {
    const c = candidates.nth(i);
    if (await c.isVisible()) { await c.click(); return true; }
  }
  return false;
}

async function runEnvironment(name, base, fullMatrix) {
  const browser = await chromium.launch({ headless: true });
  const env = { base, public: [], system: [], switches: [], press: [], pageErrors: [], consoleErrors: [] };
  report.environments[name] = env;
  const matrixWidths = fullMatrix ? widths : [390];

  for (const locale of locales) {
    for (const width of matrixWidths) {
      for (const theme of themes) {
        for (const progress of [false, true]) {
          const context = await browser.newContext({ viewport: { width, height: 900 } }), page = await context.newPage();
          const scope = `${name}:public:${locale.id}:${width}:${theme}:${progress ? 'resume' : 'fresh'}`;
          page.on('pageerror', e => env.pageErrors.push({ scope, message: e.message }));
          page.on('console', m => { if (m.type() === 'error') env.consoleErrors.push({ scope, message: m.text() }); });
          try {
            await seedPublic(page, base, locale, theme, progress);
            const surface = await inspectCta(page); report.counts.publicCases++;
            assert(scope, !surface.className.split(/\s+/).includes('active'), 'Public editorial CTA unexpectedly has generic active state', surface.className);
            assertThemeSurface(scope, surface, theme); env.public.push({ scope, surface });
          } catch (e) { fail(scope, e.message, e.stack); }
          await context.close();
        }

        for (const spec of systemStates) {
          const context = await browser.newContext({ viewport: { width, height: 900 } }), page = await context.newPage();
          const scope = `${name}:system:${locale.id}:${width}:${theme}:${spec.id}`;
          page.on('pageerror', e => env.pageErrors.push({ scope, message: e.message }));
          page.on('console', m => { if (m.type() === 'error') env.consoleErrors.push({ scope, message: m.text() }); });
          try {
            const seeded = await seedSystem(page, base, locale, theme, spec), surface = await inspectCta(page); report.counts.systemCases++;
            assert(scope, surface.className.split(/\s+/).includes('active'), 'System CTA lost active state on assessment runtime', surface.className);
            assertThemeSurface(scope, surface, theme);
            const matchingPublic = env.public.find(x => x.scope.includes(`public:${locale.id}:${width}:${theme}:fresh`));
            if (matchingPublic) {
              assert(scope, surface.backgroundImage === matchingPublic.surface.backgroundImage, 'Active System CTA primary surface differs from inactive public CTA', { system:surface.backgroundImage, public:matchingPublic.surface.backgroundImage });
              assert(scope, surface.color === matchingPublic.surface.color, 'Active System CTA text color differs from inactive public CTA', { system:surface.color, public:matchingPublic.surface.color });
            }
            let progressData = null;
            if (seeded.count > 0) progressData = await inspectProgress(page, seeded.count, seeded.items.length, scope + ':progress');
            env.system.push({ scope, surface, seededCount:seeded.count, totalItems:seeded.items.length, progressData });
          } catch (e) { fail(scope, e.message, e.stack); }
          await context.close();
        }
      }
    }
  }

  for (const locale of locales) {
    for (const width of matrixWidths) {
      const context = await browser.newContext({ viewport: { width, height: 900 } }), page = await context.newPage();
      const scope = `${name}:switch:${locale.id}:${width}`;
      try {
        await seedSystem(page, base, locale, 'ivory', systemStates[1]);
        for (const theme of ['graphite', 'museum', 'ivory']) {
          if (!await page.evaluate(() => document.body.classList.contains('mobile-menu-open'))) await page.locator('[data-mobile-menu]').first().click();
          await page.waitForFunction(() => document.body.classList.contains('mobile-menu-open'));
          assert(`${scope}:${theme}`, await clickVisibleTheme(page, theme), `No visible theme control found for ${theme}`);
          await page.waitForFunction(t => document.body.getAttribute('data-theme') === t, theme);
          const s = await inspectCta(page); assertThemeSurface(`${scope}:${theme}`, s, theme);
          if (await page.evaluate(() => document.body.classList.contains('mobile-menu-open'))) await page.locator('[data-drawer-close]').first().click().catch(() => {});
        }
        report.counts.switchCases++; env.switches.push({ scope, ok:true });
      } catch (e) { fail(scope, e.message, e.stack); }
      await context.close();
    }
  }

  for (const locale of locales) {
    for (const theme of themes) {
      const context = await browser.newContext({ viewport: { width:390, height:900 } }), page = await context.newPage();
      const scope = `${name}:press:${locale.id}:${theme}`;
      try {
        await seedSystem(page, base, locale, theme, systemStates[1]);
        const loc = page.locator('.mobile-bottom-nav button.cta').first(), before = await inspectCta(page), box = await loc.boundingBox();
        await page.mouse.move(box.x + box.width/2, box.y + box.height/2); await page.mouse.down();
        const during = await inspectCta(page); await page.mouse.up();
        assert(scope, during.backgroundImage === before.backgroundImage, 'Press state changes primary CTA surface', { before:before.backgroundImage, during:during.backgroundImage });
        assert(scope, during.color === before.color, 'Press state changes CTA text contrast', { before:before.color, during:during.color });
        report.counts.pressCases++; env.press.push({ scope, ok:true });
      } catch (e) { fail(scope, e.message, e.stack); }
      await context.close();
    }
  }

  for (const e of env.pageErrors) fail(e.scope, 'Runtime pageerror', e.message);
  if (env.consoleErrors.length) warn(`${name}:console`, `${env.consoleErrors.length} console error messages observed; inspect evidence before classification`, env.consoleErrors.slice(0, 20));
  await browser.close();
}

sourceAudit();
await runEnvironment('local', LOCAL_BASE, false);
await runEnvironment('production', LIVE_BASE, true);
report.completedAt = new Date().toISOString();
report.verdict = report.failures.length === 0 ? (report.warnings.length ? 'PASS_WITH_NOTES' : 'PASS') : 'FAIL';
fs.writeFileSync(path.join(outDir, 'independent-mobile-ui-pass21-report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outDir, 'summary.txt'), [
  'P-120 WEB — INDEPENDENT MOBILE UI REGRESSION AUDIT', `Target SHA: ${TARGET_SHA}`, `Verdict: ${report.verdict}`,
  `Public CTA cases: ${report.counts.publicCases}`, `System CTA cases: ${report.counts.systemCases}`, `Progress layout cases: ${report.counts.progressCases}`,
  `Theme-switch cases: ${report.counts.switchCases}`, `Press-state cases: ${report.counts.pressCases}`, `Failures: ${report.failures.length}`, `Warnings: ${report.warnings.length}`,
].join('\n') + '\n');
console.log(JSON.stringify({ verdict:report.verdict, counts:report.counts, failures:report.failures.slice(0,20), warnings:report.warnings.slice(0,10) }, null, 2));
if (report.failures.length) process.exit(1);
