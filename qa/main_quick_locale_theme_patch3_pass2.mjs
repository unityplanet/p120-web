import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

/* P-120 WEB — PATCH 3 / PASS 2 — MAIN QUICK LOCALE / THEME CONTROLS QA */
const ROOT=path.resolve(import.meta.dirname,'..');
const BASE=(process.env.P120_QA_BASE||'http://127.0.0.1:4174/p120-web').replace(/\/$/,'');
const OUT=path.join(ROOT,'qa-artifacts','main-quick-locale-theme-patch3-pass2');
fs.mkdirSync(OUT,{recursive:true});
const widths=[360,390,430,480];
const themes=['ivory','graphite','museum'];
const routes=[
  {id:'ru',path:'/',locale:'ru',current:'ru',other:'en',ownKey:'p120_runtime_session_ru_v1'},
  {id:'en',path:'/en/',locale:'en',current:'en',other:'ru',ownKey:'p120_runtime_session_en_v1'}
];
const THEME_KEY='p120_web_theme_v16';
const failures=[];
const checks=[];
const matrix=[];
const add=(id,pass,detail={})=>{checks.push({id,pass:Boolean(pass),...detail});if(!pass)failures.push(id);};
const visibleRect=r=>!!r&&r.width>0&&r.height>0;
const overlap=(a,b)=>!!a&&!!b&&Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))>1;

const brand=fs.readFileSync(path.join(ROOT,'p120-brand-system-v1.0.js'),'utf8');
const brandCss=fs.readFileSync(path.join(ROOT,'p120-brand-system-v1.0.css'),'utf8');
add('STATIC / Main exclusion removed',!brand.includes('function ensureTools(){\n    if(isMain) return;'));
add('STATIC / Main header inner is explicit utility target',brand.includes("document.querySelector('.topbar-inner,.explore-topbar__inner"));
add('STATIC / Main insertion targets topbar-tools',brand.includes("const mainTools=inner.querySelector('.topbar-tools')"));
add('STATIC / Main quick class installed',brand.includes("tools.classList.add('p120-brand53-tools--main-quick')"));
add('STATIC / canonical utility theme bridge present',brand.includes('function applyUtilityTheme(next)'));
add('STATIC / frozen brand revision preserved',brand.includes("revision:'5.3.2'"));
add('STATIC / canonical theme key unchanged',brand.includes("const THEME_KEY = 'p120_web_theme_v16'"));
add('STATIC / Main quick CSS phone-bounded',brandCss.includes('.p120-brand53-tools--main-quick{display:none}')&&brandCss.includes('@media(max-width:820px)'));

const browser=await chromium.launch({headless:true});

async function ready(page){
  await page.waitForFunction(()=>window.P120_BRAND_SYSTEM?.revision==='5.3.2',null,{timeout:15000});
  await page.waitForSelector('[data-p120-brand53-tools]',{state:'attached',timeout:15000});
  await page.waitForTimeout(180);
}
async function snap(page){
  return page.evaluate(()=>{
    const vis=el=>{if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0;};
    const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
    const quick=document.querySelector('.p120-brand53-tools--main-quick');
    const ham=document.querySelector('[data-mobile-menu]');
    const brand=document.querySelector('.brand-button');
    const ru=quick?.querySelector('a[lang="ru"]')||null;
    const en=quick?.querySelector('a[lang="en"]')||null;
    const theme=quick?.querySelector('.p120-brand53-theme')||null;
    return {
      quickCount:document.querySelectorAll('[data-p120-brand53-tools]').length,
      quickVisible:vis(quick),quickRect:rect(quick),quickParent:quick?.parentElement?.className||'',
      hamVisible:vis(ham),hamRect:rect(ham),brandRect:rect(brand),
      ruHref:ru?.href||'',enHref:en?.href||'',ruCurrent:ru?.getAttribute('aria-current')||'',enCurrent:en?.getAttribute('aria-current')||'',
      themeVisible:vis(theme?.querySelector('summary')),themeOpen:theme?.open||false,
      bodyTheme:document.body.dataset.theme||'',storedTheme:localStorage.getItem('p120_web_theme_v16')||'',
      overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth,
      bottomActions:document.querySelectorAll('.mobile-bottom-nav > button').length,
      chapterOwner:document.querySelectorAll('#p120-mobile-quick-chapters').length,
      resumeOwner:document.querySelectorAll('[data-p120-mobile-session-resume-control]').length
    };
  });
}

for(const route of routes){
  for(const width of widths){
    const context=await browser.newContext({viewport:{width,height:900}});
    const page=await context.newPage();
    const errors=[];
    page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
    page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
    const response=await page.goto(BASE+route.path,{waitUntil:'domcontentloaded',timeout:30000});
    await ready(page);
    add(`${route.id}/${width} / route HTTP OK`,!!response&&response.status()<400,{status:response?.status()});
    for(const start of themes){
      errors.length=0;
      await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:THEME_KEY,value:start});
      await page.reload({waitUntil:'domcontentloaded',timeout:30000});
      await ready(page);
      const before=await snap(page);
      const prefix=`${route.id}/${width}/${start}`;
      add(`${prefix} / exactly one canonical utility owner`,before.quickCount===1,{count:before.quickCount});
      add(`${prefix} / Main quick utilities visible`,before.quickVisible);
      add(`${prefix} / utilities live inside topbar-tools`,before.quickParent.includes('topbar-tools'),{parent:before.quickParent});
      add(`${prefix} / hamburger preserved`,before.hamVisible);
      add(`${prefix} / brand and quick utilities do not overlap`,!overlap(before.brandRect,before.quickRect),{brand:before.brandRect,quick:before.quickRect});
      add(`${prefix} / quick utilities and hamburger do not overlap`,!overlap(before.quickRect,before.hamRect),{quick:before.quickRect,hamburger:before.hamRect});
      add(`${prefix} / canonical quick tools precede hamburger`,!!before.quickRect&&!!before.hamRect&&before.quickRect.right<=before.hamRect.left+1,{quick:before.quickRect,hamburger:before.hamRect});
      add(`${prefix} / locale current marker correct`,route.current==='ru'?before.ruCurrent==='page'&&before.enCurrent==='':before.enCurrent==='page'&&before.ruCurrent==='',{ru:before.ruCurrent,en:before.enCurrent});
      add(`${prefix} / RU route points to Main`,new URL(before.ruHref).pathname.endsWith('/p120-web/'),{href:before.ruHref});
      add(`${prefix} / EN route points to EN Main`,new URL(before.enHref).pathname.endsWith('/p120-web/en/'),{href:before.enHref});
      add(`${prefix} / starting theme restored`,before.bodyTheme===start&&before.storedTheme===start,{body:before.bodyTheme,stored:before.storedTheme});
      add(`${prefix} / bottom navigation preserved`,before.bottomActions===4,{count:before.bottomActions});
      add(`${prefix} / PATCH 1 owner preserved`,before.chapterOwner===1,{count:before.chapterOwner});
      add(`${prefix} / no horizontal overflow`,before.overflow<=1,{overflow:before.overflow});

      const target=themes[(themes.indexOf(start)+1)%themes.length];
      const details=page.locator('.p120-brand53-tools--main-quick .p120-brand53-theme');
      await details.locator('summary').click();
      add(`${prefix} / theme popover opens`,await details.getAttribute('open')!==null);
      await details.locator(`[data-p120-theme="${target}"]`).click();
      await page.waitForFunction(t=>document.body.dataset.theme===t,target,{timeout:5000});
      const switched=await page.evaluate(t=>({
        body:document.body.dataset.theme,
        stored:localStorage.getItem('p120_web_theme_v16'),
        quickPressed:document.querySelector(`.p120-brand53-tools--main-quick [data-p120-theme="${t}"]`)?.getAttribute('aria-pressed')||'',
        mainSetTheme:typeof window.setTheme,
        quickOpen:document.querySelector('.p120-brand53-tools--main-quick .p120-brand53-theme')?.open||false
      }),target);
      add(`${prefix} / quick theme changes canonical body + persistence`,switched.body===target&&switched.stored===target,{switched});
      add(`${prefix} / quick theme aria state synchronized`,switched.quickPressed==='true',{pressed:switched.quickPressed});
      add(`${prefix} / Main theme authority bridge available`,switched.mainSetTheme==='function',{type:switched.mainSetTheme});
      add(`${prefix} / theme popover closes after selection`,switched.quickOpen===false);

      await page.locator('[data-mobile-menu]').click();
      await page.waitForTimeout(80);
      add(`${prefix} / hamburger drawer remains functional`,await page.locator('body.mobile-menu-open').count()===1);
      add(`${prefix} / hamburger retains theme controls`,await page.locator('.mobile-menu [data-set-theme]').count()===3,{count:await page.locator('.mobile-menu [data-set-theme]').count()});
      add(`${prefix} / hamburger theme state synchronized`,await page.locator(`.mobile-menu [data-set-theme="${target}"].active`).count()===1);
      await page.locator('.mobile-menu-close').click();
      await page.waitForTimeout(60);

      await page.reload({waitUntil:'domcontentloaded',timeout:30000});
      await ready(page);
      const persisted=await snap(page);
      add(`${prefix} / hard reload preserves selected theme`,persisted.bodyTheme===target&&persisted.storedTheme===target,{body:persisted.bodyTheme,stored:persisted.storedTheme});
      await page.evaluate(()=>{window.P120_BRAND_SYSTEM.reconcile();window.P120_BRAND_SYSTEM.reconcile();});
      add(`${prefix} / repeated reconciliation remains single-owner`,await page.locator('[data-p120-brand53-tools]').count()===1,{count:await page.locator('[data-p120-brand53-tools]').count()});
      add(`${prefix} / no console or page errors`,errors.length===0,{errors:[...errors]});
      matrix.push({route:route.id,width,start,target,before,persisted,errors:[...errors]});
      if(width===390) await page.screenshot({path:path.join(OUT,`${route.id}-390-${start}-to-${target}.png`),fullPage:false});
    }
    await context.close();
  }
}

// Actual bilingual route switching and shared theme persistence.
{
  const context=await browser.newContext({viewport:{width:390,height:900}});
  const page=await context.newPage();
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});await ready(page);
  await page.evaluate(()=>localStorage.setItem('p120_web_theme_v16','museum'));
  await page.reload({waitUntil:'domcontentloaded'});await ready(page);
  await page.click('.p120-brand53-tools--main-quick a[lang="en"]');
  await page.waitForURL(url=>url.pathname.endsWith('/p120-web/en/'),{timeout:10000});await ready(page);
  add('LOCALE SWITCH / RU → EN route',locationSafe(await page.evaluate(()=>location.pathname)).endsWith('/p120-web/en/'));
  add('LOCALE SWITCH / theme persists RU → EN',(await page.evaluate(()=>document.body.dataset.theme))==='museum');
  add('LOCALE SWITCH / EN current marker',await page.locator('.p120-brand53-tools--main-quick a[lang="en"][aria-current="page"]').count()===1);
  await page.click('.p120-brand53-tools--main-quick a[lang="ru"]');
  await page.waitForURL(url=>url.pathname.endsWith('/p120-web/'),{timeout:10000});await ready(page);
  add('LOCALE SWITCH / EN → RU route',(await page.evaluate(()=>location.pathname)).endsWith('/p120-web/'));
  add('LOCALE SWITCH / theme persists EN → RU',(await page.evaluate(()=>document.body.dataset.theme))==='museum');
  await context.close();
}
function locationSafe(value){return String(value||'');}

// PATCH 1 / PATCH 2 coexistence and read-only respondent-session preservation.
for(const route of routes){
  const context=await browser.newContext({viewport:{width:390,height:900}});
  const page=await context.newPage();
  await page.goto(BASE+route.path,{waitUntil:'domcontentloaded'});await ready(page);
  await page.waitForFunction(()=>Array.isArray(window.P120_INSTRUMENT?.items)&&window.P120_INSTRUMENT.items.length===180,null,{timeout:15000});
  const ids=await page.evaluate(()=>window.P120_INSTRUMENT.items.map(x=>x.id));
  const responses=Object.fromEntries(ids.slice(0,18).map(id=>[id,3]));
  const session={participantId:'P120-P3QA',sessionLocale:route.locale,screen:'test',itemIndex:18,responses,adminModes:{},telemetry:[],startedAt:'2026-09-04T12:00:00.000Z',lastSavedAt:'2026-09-04T12:01:00.000Z'};
  await page.evaluate(({key,session})=>localStorage.setItem(key,JSON.stringify(session)),{key:route.ownKey,session});
  const rawBefore=await page.evaluate(k=>localStorage.getItem(k),route.ownKey);
  await page.reload({waitUntil:'domcontentloaded'});await ready(page);
  await page.waitForFunction(()=>window.P120MobileSessionResume?.version==='1.0',null,{timeout:15000});
  const resume=page.locator('[data-p120-mobile-session-resume-control]');
  add(`${route.id}/COEXIST / PATCH 2 resume visible`,await resume.isVisible());
  const qrect=await page.locator('.p120-brand53-tools--main-quick').boundingBox();
  const rrect=await resume.boundingBox();
  add(`${route.id}/COEXIST / quick utilities do not overlap resume`,!overlap(qrect&&{left:qrect.x,right:qrect.x+qrect.width,top:qrect.y,bottom:qrect.y+qrect.height},rrect&&{left:rrect.x,right:rrect.x+rrect.width,top:rrect.y,bottom:rrect.y+rrect.height}),{quick:qrect,resume:rrect});
  await page.locator('.p120-brand53-tools--main-quick .p120-brand53-theme summary').click();
  await page.locator('.p120-brand53-tools--main-quick [data-p120-theme="graphite"]').click();
  const rawAfterTheme=await page.evaluate(k=>localStorage.getItem(k),route.ownKey);
  add(`${route.id}/COEXIST / theme utility does not mutate respondent session`,rawBefore===rawAfterTheme);
  await page.locator('#two-systems').scrollIntoViewIfNeeded();await page.waitForTimeout(240);
  const chapter=page.locator('#p120-mobile-quick-chapters');
  add(`${route.id}/COEXIST / PATCH 1 quick chapters still visible after scroll`,await chapter.isVisible());
  const crect=await chapter.boundingBox();
  const q2=await page.locator('.p120-brand53-tools--main-quick').boundingBox();
  add(`${route.id}/COEXIST / header utilities do not overlap chapter bubble`,!overlap(q2&&{left:q2.x,right:q2.x+q2.width,top:q2.y,bottom:q2.y+q2.height},crect&&{left:crect.x,right:crect.x+crect.width,top:crect.y,bottom:crect.y+crect.height}),{quick:q2,chapter:crect});
  await page.locator('[data-mobile-menu]').click();await page.waitForTimeout(80);
  add(`${route.id}/COEXIST / hamburger remains full navigation surface`,await page.locator('.mobile-menu [data-set-theme]').count()===3&&await page.locator('[data-p120-chapter-mobile] [data-chapter-mobile]').count()===5);
  await context.close();
}

// Desktop preservation: quick Main utility parity remains mobile-only.
for(const route of routes){
  for(const width of [821,1080,1440]){
    const context=await browser.newContext({viewport:{width,height:900}});
    const page=await context.newPage();
    await page.goto(BASE+route.path,{waitUntil:'domcontentloaded'});await ready(page);
    const quick=page.locator('.p120-brand53-tools--main-quick');
    add(`${route.id}/desktop/${width} / Main quick utilities hidden`,!(await quick.isVisible().catch(()=>false)));
    add(`${route.id}/desktop/${width} / single dormant owner only`,await page.locator('[data-p120-brand53-tools]').count()===1);
    add(`${route.id}/desktop/${width} / no horizontal overflow`,await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)<=1);
    await context.close();
  }
}

await browser.close();
const report={document:'P-120 WEB — PATCH 3 / PASS 2 — MAIN QUICK LOCALE / THEME CONTROLS',status:failures.length?'FAIL':'PASS',head:process.env.GITHUB_SHA||'local',mobileCases:routes.length*widths.length*themes.length,checks:checks.length,failures,matrix};
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
const summary=['# P-120 WEB — PATCH 3 / PASS 2 — MAIN QUICK LOCALE / THEME CONTROLS QA','',`STATUS: ${report.status}`,`MOBILE THEME CASES: ${report.mobileCases}`,`CHECKS: ${report.checks}`,`FAILURES: ${failures.length}`,'',...failures.map(x=>`- ${x}`)].join('\n')+'\n';
fs.writeFileSync(path.join(OUT,'SUMMARY.md'),summary);
console.log(summary);
if(failures.length)process.exit(1);
