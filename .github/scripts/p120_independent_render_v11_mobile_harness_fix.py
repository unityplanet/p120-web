from pathlib import Path

p=Path('qa/independent_render_audit_v1_1.mjs')
s=p.read_text(encoding='utf-8')

old_sig="async function clickTransition(id,source,selector,expected,{mobile=false}={}){"
new_sig="async function clickTransition(id,source,selector,expected,{mobile=false,revealMobileMenu=false}={}){"
if old_sig not in s and new_sig not in s:
    raise SystemExit('clickTransition signature marker missing')
if old_sig in s:
    s=s.replace(old_sig,new_sig,1)

old_probe="    const loc=page.locator(selector).first(); count=await loc.count(); visible=count?await loc.isVisible():false;\n    if(!count) throw new Error(`selector not found: ${selector}`);\n    if(!visible) throw new Error(`selector not visible: ${selector}`);"
new_probe="    const loc=page.locator(selector).first(); count=await loc.count(); visible=count?await loc.isVisible():false;\n    if(revealMobileMenu && count && !visible){\n      const openers=page.locator('.menu-btn,.mobile-menu-toggle,[data-mobile-menu-open],[data-menu-toggle],button[aria-controls*=\"mobile\"]');\n      const openerCount=await openers.count();\n      for(let i=0;i<openerCount;i++){\n        const opener=openers.nth(i);\n        if(await opener.isVisible().catch(()=>false)){\n          await opener.click();\n          await page.waitForTimeout(220);\n          break;\n        }\n      }\n      visible=await loc.isVisible().catch(()=>false);\n    }\n    if(!count) throw new Error(`selector not found: ${selector}`);\n    if(!visible) throw new Error(`selector not visible: ${selector}`);"
if old_probe not in s and new_probe not in s:
    raise SystemExit('mobile reveal probe marker missing')
if old_probe in s:
    s=s.replace(old_probe,new_probe,1)

pairs=[
("await clickTransition('RU System mobile language -> EN System','/system/','.p120-language-mobile-options a[lang=\"en\"]','/en/system/',{mobile:true});",
 "await clickTransition('RU System mobile language -> EN System','/system/','.p120-language-mobile-options a[lang=\"en\"]','/en/system/',{mobile:true,revealMobileMenu:true});"),
("await clickTransition('EN System mobile language -> RU System','/en/system/','.p120-language-mobile-options a[lang=\"ru\"]','/system/',{mobile:true});",
 "await clickTransition('EN System mobile language -> RU System','/en/system/','.p120-language-mobile-options a[lang=\"ru\"]','/system/',{mobile:true,revealMobileMenu:true});")
]
for old,new in pairs:
    if old in s:
        s=s.replace(old,new,1)
    elif new not in s:
        raise SystemExit(f'call marker missing: {old}')

p.write_text(s,encoding='utf-8')
print('Independent render v1.1 mobile harness corrected: drawer is opened before language-link visibility/click checks.')
