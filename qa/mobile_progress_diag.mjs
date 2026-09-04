import { chromium } from 'playwright';
const base='https://unityplanet.github.io/p120-web';
const b=await chromium.launch({headless:true});
for (const [locale,route,key] of [['ru','/system/','p120_runtime_session_ru_v1'],['en','/en/system/','p120_runtime_session_en_v1']]) {
 const c=await b.newContext({viewport:{width:390,height:900}}); const p=await c.newPage();
 await p.route(/fonts\.bunny\.net/,r=>r.abort());
 await p.goto(base+route,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.P120_INSTRUMENT?.items?.length>0);
 const items=await p.evaluate(()=>window.P120_INSTRUMENT.items.slice(0,7).map(i=>({id:i.id,v:String(i.choices?.[0]?.value??'1')})));
 const responses=Object.fromEntries(items.map(i=>[i.id,i.v]));
 const state={participantId:'DIAG',sessionLocale:locale,screen:'test',itemIndex:7,responses,adminModes:{P72D:'General Pattern'},telemetry:[],startedAt:new Date().toISOString(),consentAt:new Date().toISOString(),lastSavedAt:new Date().toISOString()};
 await p.evaluate(({key,state})=>{localStorage.setItem(key,JSON.stringify(state));localStorage.setItem('p120_web_theme_v16','ivory')},{key,state});
 await p.reload({waitUntil:'domcontentloaded'}); await p.waitForSelector('.mobile-bottom-nav button.cta');
 const before=await p.evaluate(key=>({url:location.href,key,raw:localStorage.getItem(key),sessionKey:window.P120_SESSION_KEY,cta:document.querySelector('.mobile-bottom-nav button.cta')?.className,menuCount:document.querySelectorAll('.mobile-menu').length,progressCount:document.querySelectorAll('.mobile-menu-progress').length,menuText:document.querySelector('.mobile-menu')?.innerText.slice(0,500)||'',bodyClass:document.body.className,theme:document.body.dataset.theme}),key);
 await p.locator('[data-mobile-menu]').first().click(); await p.waitForTimeout(300);
 const after=await p.evaluate(()=>({progressCount:document.querySelectorAll('.mobile-menu-progress').length,progressHTML:document.querySelector('.mobile-menu-progress')?.outerHTML||'',menuOpen:document.body.classList.contains('mobile-menu-open'),menuText:document.querySelector('.mobile-menu')?.innerText.slice(0,800)||''}));
 console.log(JSON.stringify({locale,before,after},null,2));
 await c.close();
}
await b.close();
