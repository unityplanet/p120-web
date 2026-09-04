import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE=os.environ.get('P120_QA_BASE','http://127.0.0.1:4173').rstrip('/')
OUT=Path('qa-artifacts/contact-pass5'); OUT.mkdir(parents=True,exist_ok=True)
WIDTHS=[320,360,390,430,768,1024,1366,1920]
THEMES=['ivory','graphite','museum']
ROUTES=[('/contact/','ru','ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА'),('/en/contact/','en','RESEARCH ARCHITECTURE')]
ENDPOINT='https://hvjgrpssjnnprazwhikn.supabase.co/functions/v1/p120-contact-submit'
failures=[]; results=[]

def fail(case,check,detail=''):
    failures.append({'case':case,'check':check,'detail':str(detail)})

def check_case(page,case,locale,descriptor,theme,width):
    data=page.evaluate("""() => {
      const d=document.querySelector('.brand-sub'); const dr=d?.getBoundingClientRect();
      const h=document.querySelector('.contact-header'); const hr=h?.getBoundingClientRect();
      const form=document.querySelector('[data-p120-contact-form]');
      const cta=document.querySelector('.contact-submit');
      return {
        descriptor:d?.textContent?.trim()||'', visible:!!(d&&getComputedStyle(d).display!=='none'&&dr?.width&&dr?.height),
        contained:!!(dr&&hr&&dr.left>=hr.left-1&&dr.right<=hr.right+1&&dr.top>=hr.top-1&&dr.bottom<=hr.bottom+1),
        width:document.documentElement.scrollWidth, viewport:innerWidth,
        mega:!!document.querySelector('.p120-brand53-mega'), themeControl:!!document.querySelector('.p120-brand53-theme'),
        runtime:window.P120_CONTACT?.version||'', transport:window.P120_CONTACT?.transport||'', endpoint:window.P120_CONTACT?.endpoint||'',
        form:!!form, action:form?.getAttribute('action'), method:form?.getAttribute('method'),
        ctaType:cta?.getAttribute('type')||'', ctaDisabled:!!cta?.disabled,
        honeypot:!!document.querySelector('[data-contact-honeypot]'),
        status:document.querySelector('[data-contact-status]')?.textContent?.trim()||'',
        labels:[...document.querySelectorAll('.contact-form label')].filter(l=>!l.closest('.contact-honeypot')).every(l=>!!l.htmlFor&&!!document.getElementById(l.htmlFor)),
        theme:document.body.dataset.theme||''
      }
    }""")
    checks={
      'descriptor':data['descriptor']==descriptor,'descriptor-visible':data['visible'],'descriptor-contained':data['contained'],
      'no-overflow':data['width']<=data['viewport']+1,'mega-preserved':data['mega'],'theme-preserved':data['themeControl'],
      'runtime-1.1':data['runtime']=='1.1','transport':data['transport']=='edge-function-v1','endpoint':data['endpoint']==ENDPOINT,
      'form':data['form'],'no-native-action':data['action'] in (None,''),'no-native-method':data['method'] in (None,''),
      'submit-enabled':data['ctaType']=='submit' and not data['ctaDisabled'],'honeypot':data['honeypot'],'labels':data['labels'],'theme':data['theme']==theme
    }
    for k,v in checks.items():
        if not v: fail(case,k,json.dumps(data,ensure_ascii=False))
    return data,checks

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width in WIDTHS:
      height=900 if width>=1024 else 840
      for theme in THEMES:
        ctx=browser.new_context(viewport={'width':width,'height':height})
        ctx.add_init_script(f"localStorage.setItem('p120_web_theme_v16',{json.dumps(theme)});")
        for route,locale,descriptor in ROUTES:
          page=ctx.new_page(); case=f'{width}px {theme} {locale}'
          errors=[]
          page.on('console',lambda m,bag=errors: bag.append(m.text) if m.type=='error' else None)
          page.on('pageerror',lambda e,bag=errors: bag.append(str(e)))
          page.route(ENDPOINT,lambda r:r.fulfill(status=201,content_type='application/json',body='{"ok":true,"code":"RECEIVED","message_id":"00000000-0000-0000-0000-000000000001","received_at":"2026-09-04T00:00:00Z"}'))
          try:
            resp=page.goto(BASE+route,wait_until='domcontentloaded',timeout=30000)
            if not resp or resp.status>=400: fail(case,'http',resp.status if resp else 'none'); page.close(); continue
            page.wait_for_selector('html[data-p120-contact="1.1"]',timeout=15000); page.wait_for_timeout(250)
            data,checks=check_case(page,case,locale,descriptor,theme,width)
            if errors: fail(case,'console-errors',errors)
            if width in (320,390,1366,1920): page.screenshot(path=str(OUT/f'{width}-{theme}-{locale}.png'),full_page=True)
            results.append({'case':case,'data':data,'checks':checks,'errors':errors})
          except Exception as e: fail(case,'exception',repr(e))
          finally: page.close()
        ctx.close()

    # Success experience: mocked accepted backend clears fields and confirms receipt.
    ctx=browser.new_context(viewport={'width':390,'height':844}); page=ctx.new_page()
    page.route(ENDPOINT,lambda r:r.fulfill(status=201,content_type='application/json',body='{"ok":true,"code":"RECEIVED","message_id":"00000000-0000-0000-0000-000000000001","received_at":"2026-09-04T00:00:00Z"}'))
    page.goto(BASE+'/contact/',wait_until='domcontentloaded'); page.wait_for_selector('html[data-p120-contact="1.1"]')
    page.fill('#contact-email','qa@example.com'); page.fill('#contact-subject','QA success'); page.fill('#contact-message','Controlled user-facing success state verification message.')
    page.click('.contact-submit'); page.wait_for_timeout(300)
    success=page.evaluate("""() => ({state:document.querySelector('.contact-form').dataset.contactState,status:document.querySelector('[data-contact-status]').textContent,email:document.querySelector('#contact-email').value,message:document.querySelector('#contact-message').value})""")
    if success['state']!='success' or success['email'] or success['message']: fail('success-state','success-reset',success)
    page.close(); ctx.close()

    # Failure experience: content must remain and retry must be possible.
    ctx=browser.new_context(viewport={'width':390,'height':844}); page=ctx.new_page()
    page.route(ENDPOINT,lambda r:r.fulfill(status=500,content_type='application/json',body='{"ok":false,"code":"SERVER_ERROR"}'))
    page.goto(BASE+'/en/contact/',wait_until='domcontentloaded'); page.wait_for_selector('html[data-p120-contact="1.1"]')
    page.fill('#contact-email','qa@example.com'); page.fill('#contact-subject','QA failure'); msg='Controlled failure state keeps the original message available for retry.'; page.fill('#contact-message',msg)
    page.click('.contact-submit'); page.wait_for_timeout(300)
    failure=page.evaluate("""() => ({state:document.querySelector('.contact-form').dataset.contactState,status:document.querySelector('[data-contact-status]').textContent,message:document.querySelector('#contact-message').value,disabled:document.querySelector('.contact-submit').disabled})""")
    if failure['state']!='error' or failure['message']!=msg or failure['disabled']: fail('failure-state','retry-preserves-content',failure)
    page.close(); ctx.close(); browser.close()

report={'gate':'P-120 WEB CONTACT PASS 5 BACKEND + SECURITY QA','status':'PASS' if not failures else 'FAIL','matrixCases':len(results),'failureCount':len(failures),'failures':failures,'results':results}
(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(f"CONTACT PASS 5 BROWSER QA — {report['status']} · {len(results)} matrix cases · {len(failures)} failures")
if failures:
    for f in failures[:60]: print('FAIL',f['case'],f['check'],f['detail'][:800])
    raise SystemExit(1)
