import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('P120_QA_BASE', 'http://127.0.0.1:4173').rstrip('/')
OUT = Path('qa-artifacts/brand-header-pass2')
OUT.mkdir(parents=True, exist_ok=True)

WIDTHS = [320, 360, 390, 430, 768, 1024, 1366, 1440, 1920, 2560]
THEMES = ['ivory', 'graphite', 'museum']
ROUTES = [
    ('/', 'ru'),
    ('/en/', 'en'),
    ('/extended/', 'ru'),
    ('/en/extended/', 'en'),
    ('/creator/', 'ru'),
    ('/en/creator/', 'en'),
    ('/why-p120/', 'ru'),
    ('/en/why-p120/', 'en'),
    ('/science/', 'ru'),
    ('/en/science/', 'en'),
]
EXPECTED = {
    'ru': 'ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА',
    'en': 'RESEARCH ARCHITECTURE',
}

failures = []
results = []

def fail(case, check, detail):
    failures.append({'case': case, 'check': check, 'detail': detail})

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for width in WIDTHS:
        height = 820 if width < 1366 else 900
        for theme in THEMES:
            context = browser.new_context(viewport={'width': width, 'height': height})
            context.add_init_script(f"localStorage.setItem('p120_web_theme_v16', {json.dumps(theme)});")
            for route, locale in ROUTES:
                page = context.new_page()
                console_errors = []
                page.on('console', lambda msg, bag=console_errors: bag.append(msg.text) if msg.type == 'error' else None)
                page.on('pageerror', lambda exc, bag=console_errors: bag.append(str(exc)))
                case = f'{width}px {theme} {route}'
                try:
                    response = page.goto(BASE + route, wait_until='domcontentloaded', timeout=30000)
                    if not response or response.status >= 400:
                        fail(case, 'http', 'no response' if not response else str(response.status))
                        page.close()
                        continue

                    early = page.evaluate("""() => {
                      const h=document.querySelector('.topbar,.explore-topbar,.creator-topbar,.wp-header,.p120-brand53-header');
                      return h ? h.getBoundingClientRect().height : null;
                    }""")

                    page.wait_for_selector('html[data-p120-brand-system="5.3"]', timeout=15000)
                    page.wait_for_timeout(140)
                    data = page.evaluate("""() => {
                      const brand=document.querySelector('.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand');
                      const descriptor=brand?.querySelector('.brand-sub');
                      const mark=brand?.querySelector('.brand-mark');
                      const header=document.querySelector('.topbar,.explore-topbar,.creator-topbar,.wp-header,.p120-brand53-header');
                      const inner=document.querySelector('.topbar-inner,.explore-topbar__inner,.creator-topbar__inner,.wp-header-inner,.p120-brand53-header__inner');
                      const tools=document.querySelector('.topbar-tools,.p120-brand53-tools');
                      const br=brand?.getBoundingClientRect();
                      const dr=descriptor?.getBoundingClientRect();
                      const mr=mark?.getBoundingClientRect();
                      const hr=header?.getBoundingClientRect();
                      const tr=tools?.getBoundingClientRect();
                      const ds=descriptor?getComputedStyle(descriptor):null;
                      const overlap = br && tr && Math.min(br.bottom,tr.bottom)>Math.max(br.top,tr.top)
                        ? Math.max(0, Math.min(br.right,tr.right)-Math.max(br.left,tr.left)) : 0;

                      const visibleChildren = inner ? Array.from(inner.children).filter(el => {
                        const s=getComputedStyle(el), r=el.getBoundingClientRect();
                        return s.display!=='none' && s.visibility!=='hidden' && r.width>0 && r.height>0;
                      }) : [];
                      const childBounds = visibleChildren.map(el => {
                        const r=el.getBoundingClientRect();
                        return {tag:el.tagName, cls:el.className||'', left:r.left, right:r.right, top:r.top, bottom:r.bottom};
                      });
                      const visibleChildOutOfViewport = childBounds.some(r => r.left < -1 || r.right > window.innerWidth + 1);

                      const docWidth=document.documentElement.scrollWidth;
                      let withoutDescriptorHeight = hr?.height || 0;
                      let withoutDescriptorDocWidth = docWidth;
                      if(descriptor){
                        const prev=descriptor.getAttribute('style');
                        descriptor.style.setProperty('display','none','important');
                        void document.documentElement.offsetWidth;
                        withoutDescriptorHeight=header?.getBoundingClientRect().height || 0;
                        withoutDescriptorDocWidth=document.documentElement.scrollWidth;
                        if(prev===null) descriptor.removeAttribute('style'); else descriptor.setAttribute('style',prev);
                        void document.documentElement.offsetWidth;
                      }

                      return {
                        runtime:document.documentElement.dataset.p120BrandSystem||'',
                        descriptor:descriptor?.textContent?.trim()||'',
                        descriptorDisplay:ds?.display||'',
                        descriptorVisibility:ds?.visibility||'',
                        descriptorFontSize:ds?parseFloat(ds.fontSize):0,
                        descriptorWidth:dr?.width||0,
                        descriptorHeight:dr?.height||0,
                        brandWidth:br?.width||0,
                        markWidth:mr?.width||0,
                        headerHeight:hr?.height||0,
                        withoutDescriptorHeight,
                        descriptorHeightDelta:(hr?.height||0)-withoutDescriptorHeight,
                        docWidth,
                        withoutDescriptorDocWidth,
                        descriptorDocWidthDelta:docWidth-withoutDescriptorDocWidth,
                        innerClientWidth:inner?.clientWidth||0,
                        innerScrollWidth:inner?.scrollWidth||0,
                        descriptorInsideHeader:!!(dr&&hr&&dr.left>=hr.left-1&&dr.right<=hr.right+1&&dr.top>=hr.top-1&&dr.bottom<=hr.bottom+1),
                        brandToolsOverlap:overlap,
                        visibleChildOutOfViewport,
                        childBounds,
                        viewport:window.innerWidth,
                        aria:brand?.getAttribute('aria-label')||'',
                        theme:document.body?.dataset?.theme||'',
                      };
                    }""")
                    page.wait_for_timeout(260)
                    late = page.evaluate("""() => {
                      const h=document.querySelector('.topbar,.explore-topbar,.creator-topbar,.wp-header,.p120-brand53-header');
                      return h ? h.getBoundingClientRect().height : null;
                    }""")

                    checks = {
                        'runtime': data['runtime'] == '5.3',
                        'descriptor-text': data['descriptor'] == EXPECTED[locale],
                        'descriptor-visible': data['descriptorDisplay'] != 'none' and data['descriptorVisibility'] != 'hidden' and data['descriptorWidth'] > 0 and data['descriptorHeight'] > 0,
                        'descriptor-readable-floor': data['descriptorFontSize'] >= (6.2 if width <= 359 else 6.4 if width <= 430 else 6.9),
                        'descriptor-contained': data['descriptorInsideHeader'],
                        'brand-mark-visible': data['markWidth'] >= (30 if width <= 359 else 33 if width <= 430 else 35),
                        'descriptor-document-growth': data['descriptorDocWidthDelta'] <= 1,
                        'visible-header-child-bounds': not data['visibleChildOutOfViewport'],
                        'brand-tools-overlap': data['brandToolsOverlap'] <= 1,
                        'descriptor-header-growth': data['descriptorHeightDelta'] <= 3,
                        'header-stability': early is None or late is None or abs(late - early) <= 3,
                        'localized-aria': ('home' in data['aria'].lower()) if locale == 'en' else ('главн' in data['aria'].lower()),
                        'console-errors': len(console_errors) == 0,
                    }
                    for name, ok in checks.items():
                        if not ok:
                            fail(case, name, json.dumps({'data': data, 'early': early, 'late': late, 'console': console_errors}, ensure_ascii=False))

                    capture = width in (320, 360, 390, 430, 1366, 1920, 2560) and route in ('/', '/en/')
                    capture = capture or (width in (320,360,390,430) and route in ('/extended/','/en/extended/','/why-p120/','/en/why-p120/','/science/','/en/science/'))
                    if capture:
                        slug = route.strip('/').replace('/','-') or ('en' if locale=='en' else 'ru')
                        if route == '/en/': slug='en'
                        if route == '/': slug='ru'
                        page.screenshot(path=str(OUT / f'{width}-{theme}-{slug}.png'), full_page=False)

                    results.append({'case': case, 'locale': locale, 'data': data, 'earlyHeaderHeight': early, 'lateHeaderHeight': late, 'consoleErrors': console_errors, 'checks': checks})
                except Exception as exc:
                    fail(case, 'exception', repr(exc))
                finally:
                    page.close()
            context.close()
    browser.close()

report = {
    'gate': 'P-120 WEB — BRAND / HEADER PASS 2',
    'status': 'PASS' if not failures else 'FAIL',
    'matrix': {'widths': WIDTHS, 'themes': THEMES, 'routes': ROUTES},
    'cases': len(results),
    'failureCount': len(failures),
    'failures': failures,
    'results': results,
}
(OUT / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"BRAND / HEADER PASS 2 QA — {report['status']} · {len(results)} cases · {len(failures)} failures")
if failures:
    for item in failures[:100]:
        print(f"FAIL · {item['case']} · {item['check']} · {item['detail'][:900]}")
    raise SystemExit(1)
