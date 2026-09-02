from pathlib import Path

p=Path('qa/independent_render_audit_v1_1.mjs')
s=p.read_text(encoding='utf-8')

# A) Mobile language transitions live inside the closed drawer. The audit must open
# the same user-facing mobile menu before requiring those links to be visible.
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

# B) Full-page screenshots must reflect the page after normal scrolling has activated
# intersection/reveal states. Otherwise a static fullPage capture can contain large
# false blank bands even though the live page displays content while scrolling.
settle_marker="async function settle(page){\n  await page.waitForLoadState('networkidle',{timeout:9000}).catch(()=>{});\n  await page.waitForTimeout(700);\n}\n"
reveal_block="""async function settle(page){
  await page.waitForLoadState('networkidle',{timeout:9000}).catch(()=>{});
  await page.waitForTimeout(700);
}

async function primeFullPageVisualState(page){
  await page.evaluate(async()=>{
    const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const step=Math.max(520,Math.floor(window.innerHeight*0.82));
    const height=Math.max(document.documentElement.scrollHeight,document.body?.scrollHeight||0);
    for(let y=0;y<=height;y+=step){
      window.scrollTo(0,y);
      await sleep(32);
    }
    window.scrollTo(0,0);
    await sleep(260);
  });
}
"""
if 'async function primeFullPageVisualState(page)' not in s:
    if settle_marker not in s:
        raise SystemExit('settle marker missing for full-page visual priming')
    s=s.replace(settle_marker,reveal_block,1)

old_nav="    try{const res=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});status=res?.status()??null;await settle(page);}catch(e){navError=String(e)}\n    const metrics=await page.evaluate(()=>({"
new_nav="    try{const res=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});status=res?.status()??null;await settle(page);await primeFullPageVisualState(page);}catch(e){navError=String(e)}\n    const metrics=await page.evaluate(()=>({"
if old_nav in s:
    s=s.replace(old_nav,new_nav,1)
elif new_nav not in s:
    raise SystemExit('render-loop visual priming marker missing')

p.write_text(s,encoding='utf-8')
print('Independent render v1.1 harness corrected: mobile drawer-aware transitions + scroll-primed full-page screenshots.')
