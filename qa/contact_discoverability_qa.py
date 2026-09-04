import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE=os.environ.get('P120_QA_BASE','http://127.0.0.1:4173').rstrip('/')
OUT=Path('qa-artifacts/contact-discoverability')
OUT.mkdir(parents=True,exist_ok=True)
WIDTHS=[320,360,390,430,768,1366,1920]
THEMES=['ivory','graphite','museum']
ROOTS=[('/', 'ru'),('/en/','en')]
EXPECTED={
 'ru':{'contact':'Контакты','note':'Связаться с P-120','descriptor':'ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА','contact_path':'/contact/'},
 'en':{'contact':'Contact','note':'Write to P-120','descriptor':'RESEARCH ARCHITECTURE','contact_path':'/en/contact/'},
}
failures=[]
results=[]

def fail(case,check,detail): failures.append({'case':case,'check':check,'detail':detail})

def suffix(path):
    return path if path.startswith('/') else '/'+path

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width in WIDTHS:
        height=820 if width<1366 else 900
        for theme in THEMES:
            for route,locale in ROOTS:
                ctx=browser.new_context(viewport={'width':width,'height':height})
                ctx.add_init_script(f"localStorage.setItem('p120_web_theme_v16',{json.dumps(theme)});")
                page=ctx.new_page(); errors=[]
                page.on('console',lambda msg,bag=errors: bag.append(msg.text) if msg.type=='error' else None)
                page.on('pageerror',lambda exc,bag=errors: bag.append(str(exc)))
                case=f'{width}px {theme} {route}'
                try:
                    r=page.goto(BASE+route,wait_until='domcontentloaded',timeout=30000)
                    if not r or r.status>=400:
                        fail(case,'http','none' if not r else str(r.status)); page.close();ctx.close();continue
                    page.wait_for_selector('html[data-p120-brand-system="5.3"]',timeout=15000)
                    page.wait_for_timeout(220)
                    d=page.evaluate("""() => {
                      const footer=document.querySelector('[data-p120-legal-footer]');
                      const service=footer?.querySelector('.p120-site-footer__service');
                      const contact=service?.querySelector('a');
                      const desc=document.querySelector('.brand-sub');
                      const topnav=document.querySelector('.topnav,.p120-brand53-nav');
                      const bottom=document.querySelector('.mobile-bottom-nav');
                      const drawer=document.querySelector('.mobile-menu');
                      const drawerContact=drawer?.querySelector('[data-p120-contact-discovery]');
                      return {
                        footerCount:footer?.querySelectorAll('.p120-site-footer__service a').length||0,
                        footerText:contact?.textContent?.trim()||'',
                        footerHref:contact?.getAttribute('href')||'',
                        serviceAria:service?.getAttribute('aria-label')||'',
                        descriptor:desc?.textContent?.trim()||'',
                        topContact:[...topnav?.querySelectorAll('a,button')||[]].filter(x=>/contact|контакт/i.test(x.textContent||'')).length,
                        bottomContact:[...bottom?.querySelectorAll('a,button')||[]].filter(x=>/contact|контакт/i.test(x.textContent||'')).length,
                        bottomCount:bottom?.querySelectorAll('button,a').length||0,
                        drawerContactCount:drawer?.querySelectorAll('[data-p120-contact-discovery]').length||0,
                        drawerContactText:drawerContact?.textContent?.replace(/\\s+/g,' ').trim()||'',
                        drawerContactAria:drawerContact?.getAttribute('aria-label')||'',
                        docWidth:document.documentElement.scrollWidth,
                        viewport:innerWidth,
                        theme:document.body?.dataset.theme||'',
                        revision:window.P120_BRAND_SYSTEM?.revision||'',
                      };
                    }""")
                    exp=EXPECTED[locale]
                    checks={
                      'footer-single':d['footerCount']==1,
                      'footer-label':d['footerText']==exp['contact'],
                      'footer-route':d['footerHref'].endswith(exp['contact_path']),
                      'descriptor-frozen':d['descriptor']==exp['descriptor'],
                      'desktop-topnav-unchanged':d['topContact']==0,
                      'bottom-nav-no-contact':d['bottomContact']==0,
                      'bottom-nav-four':d['bottomCount']==4,
                      'no-horizontal-overflow':d['docWidth']<=d['viewport']+1,
                      'theme-preserved':d['theme']==theme,
                      'runtime-revision':d['revision']=='5.3.3',
                      'console-errors':len(errors)==0,
                    }
                    if width<=430:
                        checks.update({
                          'drawer-contact-single':d['drawerContactCount']==1,
                          'drawer-contact-copy':exp['contact'] in d['drawerContactText'] and exp['note'] in d['drawerContactText'],
                          'drawer-contact-aria':exp['contact'] in d['drawerContactAria'],
                        })
                    for name,ok in checks.items():
                        if not ok: fail(case,name,json.dumps({'data':d,'errors':errors},ensure_ascii=False))
                    if width in (320,390,430,1366) and theme in ('ivory','graphite','museum'):
                        page.screenshot(path=str(OUT/f"root-{locale}-{theme}-{width}.png"),full_page=False)
                    results.append({'case':case,'data':d,'checks':checks})
                except Exception as exc: fail(case,'exception',repr(exc))
                finally:
                    if not page.is_closed(): page.close()
                    ctx.close()

    # Static/global footer routes: Contact must be globally discoverable without entering primary nav.
    static_cases=[('/contact/','ru'),('/privacy/','ru'),('/why-p120/','ru'),('/en/contact/','en'),('/en/privacy/','en'),('/en/why-p120/','en')]
    for route,locale in static_cases:
        ctx=browser.new_context(viewport={'width':390,'height':844})
        page=ctx.new_page(); case=f'static {route}'
        try:
            r=page.goto(BASE+route,wait_until='domcontentloaded',timeout=30000)
            if not r or r.status>=400: fail(case,'http','none' if not r else str(r.status)); continue
            page.wait_for_selector('html[data-p120-brand-system="5.3"]',timeout=15000);page.wait_for_timeout(180)
            d=page.evaluate("""() => {
              const a=document.querySelector('.p120-site-footer__service a');
              const nav=document.querySelector('.p120-brand53-nav,.explore-mainnav,.wp-nav,.creator-nav');
              return {text:a?.textContent?.trim()||'',href:a?.getAttribute('href')||'',current:a?.getAttribute('aria-current')||'',topContact:[...nav?.querySelectorAll('a,button')||[]].filter(x=>/contact|контакт/i.test(x.textContent||'')).length,kind:document.documentElement.dataset.p120PageKind||''};
            }""")
            exp=EXPECTED[locale]
            checks={'footer-label':d['text']==exp['contact'],'footer-route':d['href'].endswith(exp['contact_path']),'topnav-no-contact':d['topContact']==0}
            if 'contact/' in route:
                checks['contact-kind']=d['kind']=='contact';checks['aria-current']=d['current']=='page'
            for name,ok in checks.items():
                if not ok: fail(case,name,json.dumps(d,ensure_ascii=False))
            results.append({'case':case,'data':d,'checks':checks})
        except Exception as exc: fail(case,'exception',repr(exc))
        finally: page.close();ctx.close()

    # Real mobile drawer navigation in each locale.
    for route,locale in ROOTS:
        ctx=browser.new_context(viewport={'width':390,'height':844});page=ctx.new_page();case=f'drawer navigation {route}'
        try:
            page.goto(BASE+route,wait_until='domcontentloaded',timeout=30000)
            page.wait_for_selector('[data-p120-contact-discovery]',timeout=15000)
            page.click('[data-p120-contact-discovery]')
            page.wait_for_load_state('domcontentloaded');page.wait_for_timeout(120)
            expected=EXPECTED[locale]['contact_path']
            path=page.evaluate('location.pathname')
            if not path.endswith(expected): fail(case,'navigation-route',path)
            if page.locator('h1').first.text_content().strip()!=EXPECTED[locale]['contact']:
                fail(case,'contact-page-locale',page.locator('h1').first.text_content().strip())
        except Exception as exc: fail(case,'exception',repr(exc))
        finally: page.close();ctx.close()
    browser.close()

report={'gate':'P-120 WEB — CONTACT GLOBAL DISCOVERABILITY ACTIVATION','status':'PASS' if not failures else 'FAIL','matrixCases':len(results),'failureCount':len(failures),'failures':failures,'results':results}
(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(f"CONTACT DISCOVERABILITY QA — {report['status']} · {len(results)} recorded cases · {len(failures)} failures")
if failures:
    for x in failures[:100]: print('FAIL',x['case'],x['check'],x['detail'][:900])
    raise SystemExit(1)
