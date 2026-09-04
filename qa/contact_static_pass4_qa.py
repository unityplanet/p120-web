import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('P120_QA_BASE', 'http://127.0.0.1:4173').rstrip('/')
OUT = Path('qa-artifacts/contact-pass4')
OUT.mkdir(parents=True, exist_ok=True)

WIDTHS = [320, 360, 390, 430, 768, 1024, 1366, 1920]
THEMES = ['ivory', 'graphite', 'museum']
ROUTES = [('/contact/', 'ru'), ('/en/contact/', 'en')]
EXPECTED_DESCRIPTOR = {'ru':'ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА','en':'RESEARCH ARCHITECTURE'}
EXPECTED_CTA = {'ru':'Отправить сообщение','en':'Send message'}

failures=[]
results=[]

def fail(case, check, detail):
    failures.append({'case':case,'check':check,'detail':detail})

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width in WIDTHS:
        height=900 if width>=1024 else 840
        for theme in THEMES:
            context=browser.new_context(viewport={'width':width,'height':height})
            context.add_init_script(f"localStorage.setItem('p120_web_theme_v16',{json.dumps(theme)});")
            for route,locale in ROUTES:
                page=context.new_page()
                console_errors=[]
                mutating_requests=[]
                page.on('console',lambda msg,bag=console_errors: bag.append(msg.text) if msg.type=='error' else None)
                page.on('pageerror',lambda exc,bag=console_errors: bag.append(str(exc)))
                page.on('request',lambda req,bag=mutating_requests: bag.append({'method':req.method,'url':req.url}) if req.method not in ('GET','HEAD','OPTIONS') else None)
                case=f'{width}px {theme} {route}'
                try:
                    response=page.goto(BASE+route,wait_until='domcontentloaded',timeout=30000)
                    if not response or response.status>=400:
                        fail(case,'http','no response' if not response else str(response.status)); page.close(); continue
                    page.wait_for_selector('html[data-p120-contact="1.0"]',timeout=15000)
                    page.wait_for_timeout(400)

                    before_url=page.url
                    data=page.evaluate("""() => {
                      const form=document.querySelector('[data-p120-contact-form]');
                      const brand=document.querySelector('.contact-header .p120-brand53-brand');
                      const descriptor=brand?.querySelector('.brand-sub');
                      const cta=document.querySelector('.contact-submit');
                      const ru=document.querySelector('.contact-header .p120-brand53-language a[lang="ru"]');
                      const en=document.querySelector('.contact-header .p120-brand53-language a[lang="en"]');
                      const labels=[...document.querySelectorAll('.contact-form label')];
                      const controls=[...document.querySelectorAll('.contact-form input,.contact-form textarea')];
                      const footer=document.querySelector('[data-p120-legal-footer]');
                      const dr=descriptor?.getBoundingClientRect();
                      const hr=document.querySelector('.contact-header')?.getBoundingClientRect();
                      return {
                        runtime:window.P120_CONTACT_STATIC?.version||'',
                        transport:window.P120_CONTACT_STATIC?.transport||'',
                        bodyTransport:document.body.dataset.p120ContactTransport||'',
                        descriptor:descriptor?.textContent?.trim()||'',
                        descriptorVisible:!!(descriptor && getComputedStyle(descriptor).display!=='none' && dr?.width>0 && dr?.height>0),
                        descriptorContained:!!(dr&&hr&&dr.left>=hr.left-1&&dr.right<=hr.right+1&&dr.top>=hr.top-1&&dr.bottom<=hr.bottom+1),
                        docWidth:document.documentElement.scrollWidth,
                        viewport:window.innerWidth,
                        formExists:!!form,
                        formAction:form?.getAttribute('action'),
                        namedControls:controls.filter(x=>x.hasAttribute('name')).map(x=>x.id),
                        labelsValid:labels.every(l=>{const id=l.getAttribute('for');return !!id&&!!document.getElementById(id)}),
                        ctaDisabled:!!cta?.disabled,
                        ctaType:cta?.getAttribute('type')||'',
                        ctaText:cta?.textContent?.trim()||'',
                        ruPath:ru?new URL(ru.href).pathname:'',
                        enPath:en?new URL(en.href).pathname:'',
                        ruCurrent:ru?.getAttribute('aria-current')||'',
                        enCurrent:en?.getAttribute('aria-current')||'',
                        footer:!!footer,
                        theme:document.body.dataset.theme||'',
                        privacyHref:document.querySelector('.contact-privacy a')?.getAttribute('href')||'',
                        warning:document.querySelector('.contact-boundary')?.textContent?.trim().length||0,
                        transportNote:document.querySelector('.contact-transport-note')?.textContent?.trim().length||0
                      };
                    }""")

                    page.fill('#contact-email','wrong')
                    page.locator('#contact-email').blur()
                    invalid_visible=page.locator('#contact-email-error').is_visible()
                    page.fill('#contact-email','test@example.com')
                    cleared=not page.locator('#contact-email-error').is_visible()
                    page.fill('#contact-subject','Research question')
                    page.fill('#contact-message','This is a static transport-off interface review message.')
                    counter_text=page.locator('[data-contact-counter]').inner_text()
                    page.evaluate("document.querySelector('[data-p120-contact-form]').requestSubmit()")
                    page.wait_for_timeout(100)
                    after_url=page.url

                    expected_ru='/p120-web/contact/' if '/p120-web/' in data['ruPath'] else '/contact/'
                    expected_en='/p120-web/en/contact/' if '/p120-web/' in data['enPath'] else '/en/contact/'
                    checks={
                      'contact-runtime':data['runtime']=='1.0',
                      'transport-off':data['transport']=='off' and data['bodyTransport']=='off',
                      'descriptor':data['descriptor']==EXPECTED_DESCRIPTOR[locale],
                      'descriptor-visible':data['descriptorVisible'],
                      'descriptor-contained':data['descriptorContained'],
                      'document-overflow':data['docWidth']<=data['viewport']+1,
                      'form-exists':data['formExists'],
                      'no-form-action':data['formAction'] in (None,''),
                      'no-named-controls':len(data['namedControls'])==0,
                      'labels-bound':data['labelsValid'],
                      'cta-disabled':data['ctaDisabled'] and data['ctaType']=='button',
                      'cta-copy':data['ctaText']==EXPECTED_CTA[locale],
                      'locale-routes':data['ruPath']==expected_ru and data['enPath']==expected_en,
                      'locale-current':(data['ruCurrent']=='page' and not data['enCurrent']) if locale=='ru' else (data['enCurrent']=='page' and not data['ruCurrent']),
                      'legal-footer':data['footer'],
                      'theme-applied':data['theme']==theme,
                      'privacy-link':bool(data['privacyHref']),
                      'sensitive-warning':data['warning']>80,
                      'transport-note':data['transportNote']>40,
                      'validation-error':invalid_visible,
                      'validation-clears':cleared,
                      'counter-updates':counter_text.startswith(str(len('This is a static transport-off interface review message.'))),
                      'request-submit-blocked':before_url==after_url,
                      'no-mutating-network':len(mutating_requests)==0,
                      'console-errors':len(console_errors)==0,
                    }
                    for name,ok in checks.items():
                        if not ok: fail(case,name,json.dumps({'data':data,'before':before_url,'after':after_url,'network':mutating_requests,'console':console_errors,'counter':counter_text},ensure_ascii=False))

                    if width in (320,390,1366,1920):
                        # Full-page evidence must represent the canonical top-of-page
                        # state, not the scroll position left by field interaction.
                        page.evaluate("window.scrollTo(0,0)")
                        page.wait_for_timeout(120)
                        page.screenshot(path=str(OUT/f'{width}-{theme}-{locale}.png'),full_page=True)
                    results.append({'case':case,'data':data,'checks':checks,'console':console_errors,'network':mutating_requests})
                except Exception as exc:
                    fail(case,'exception',repr(exc))
                finally:
                    page.close()
            context.close()
    browser.close()

report={'gate':'P-120 WEB — CONTACT PASS 4 STATIC FRONTEND / TRANSPORT OFF','status':'PASS' if not failures else 'FAIL','cases':len(results),'failureCount':len(failures),'failures':failures,'results':results}
(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(f"CONTACT PASS 4 QA — {report['status']} · {len(results)} cases · {len(failures)} failures")
if failures:
    for item in failures[:80]: print(f"FAIL · {item['case']} · {item['check']} · {item['detail'][:700]}")
    raise SystemExit(1)
