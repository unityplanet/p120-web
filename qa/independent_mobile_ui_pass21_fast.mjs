import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const TARGET_SHA='ef6020afa0df6035bbbfe540a1ace815341589d4';
const BASE=process.env.P120_LIVE_BASE||'https://unityplanet.github.io/p120-web';
const widths=[360,390,430,480], themes=['ivory','graphite','museum'];
const locales=[
  {id:'ru',root:'/',system:'/system/',session:'p120_runtime_session_ru_v1',editorial:'p120_editorial_state_ru_v1'},
  {id:'en',root:'/en/',system:'/en/system/',session:'p120_runtime_session_en_v1',editorial:'p120_editorial_state_en_v1'},
];
const states=[
  {id:'preflight',screen:'preflight',count:0},
  {id:'test4',screen:'test',count:7},
  {id:'transition10',screen:'transition',count:18},
  {id:'results',screen:'results',count:'all'},
  {id:'resume',screen:'home',count:7},
];
const expected={
  ivory:{colors:['rgb(23, 23, 21)','rgb(36, 54, 51)'],text:'rgb(255, 255, 255)'},
  graphite:{colors:['rgb(88, 112, 108)','rgb(73, 99, 95)'],text:'rgb(245, 239, 229)'},
  museum:{colors:['rgb(47, 117, 111)','rgb(37, 95, 92)'],text:'rgb(255, 249, 236)'},
};
const out=path.resolve('qa-artifacts/mobile-ui-pass21-independent-fast');fs.mkdirSync(out,{recursive:true});
const R={targetSha:TARGET_SHA,startedAt:new Date().toISOString(),cases:[],failures:[],pageErrors:[],consoleErrors:[],counts:{public:0,system:0,progress:0,switch:0,press:0}};
const fail=(scope,msg,detail=null)=>R.failures.push({scope,msg,detail});
const assert=(scope,c,msg,d=null)=>{if(!c)fail(scope,msg,d)};
const u=r=>BASE.replace(/\/$/,'')+r;

async function itemMeta(page){
  await page.waitForFunction(()=>Array.isArray(window.P120_INSTRUMENT?.items)&&window.P120_INSTRUMENT.items.length>0,{timeout:10000});
  return page.evaluate(()=>window.P120_INSTRUMENT.items.map(i=>({id:i.id,value:String(i.choices?.[0]?.value??'1')})));
}
function responses(items,n){const k=n==='all'?items.length:Math.min(n,items.length);return Object.fromEntries(items.slice(0,k).map(i=>[i.id,i.value]));}
async function store(page,key,state,theme){await page.evaluate(({key,state,theme})=>{localStorage.setItem(key,JSON.stringify(state));localStorage.setItem('p120_web_theme_v16',theme)},{key,state,theme});}
async function reload(page){await page.reload({waitUntil:'domcontentloaded',timeout:15000});await page.waitForSelector('.mobile-bottom-nav button.cta',{state:'visible',timeout:10000});}
async function cta(page){return page.locator('.mobile-bottom-nav button.cta').first().evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return{cls:el.className,bg:s.backgroundImage,color:s.color,left:r.left,right:r.right,vw:innerWidth,theme:document.body.dataset.theme,page:document.body.dataset.p120Page||'',locale:document.body.dataset.p120Locale||''}})}
function checkCta(scope,x,theme,active){const e=expected[theme];assert(scope,x.theme===theme,`theme ${x.theme} != ${theme}`,x);assert(scope,x.color===e.text,`text ${x.color} != ${e.text}`,x);for(const c of e.colors)assert(scope,x.bg.includes(c),`gradient missing ${c}`,x.bg);assert(scope,x.left>=-0.5&&x.right<=x.vw+0.5,'CTA overflow/clipping',x);assert(scope,x.cls.split(/\s+/).includes('active')===active,`active state mismatch: ${x.cls}`,x)}
async function progress(page,count,total,scope){
  if(!count)return;
  await page.locator('[data-mobile-menu]').first().click();await page.waitForFunction(()=>document.body.classList.contains('mobile-menu-open'));
  const x=await page.locator('.mobile-menu-progress').first().evaluate(el=>{const top=el.querySelector('.mobile-menu-progress-top'),left=top?.querySelector(':scope > div:first-child'),lab=left?.querySelector('span'),met=left?.querySelector('strong'),cnt=top?.querySelector(':scope > span:last-child'),rect=n=>{const r=n?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom}:null},menu=el.closest('.mobile-menu');return{display:left?getComputedStyle(left).display:null,gap:left?getComputedStyle(left).rowGap:null,label:lab?.textContent.trim(),metric:met?.textContent.trim(),counter:cnt?.textContent.trim(),lr:rect(left),ar:rect(lab),mr:rect(met),cr:rect(cnt),menuOverflow:menu?menu.scrollWidth-menu.clientWidth:0,cardOverflow:el.scrollWidth-el.clientWidth}});
  const pct=Math.round(count/total*100);assert(scope,x.display==='grid',`left display ${x.display}`,x);assert(scope,x.metric===`${pct}%`,`metric ${x.metric} != ${pct}%`,x);assert(scope,x.counter?.includes(String(count))&&x.counter?.includes(String(total)),'counter mismatch',x);assert(scope,x.mr&&x.ar&&x.mr.top>=x.ar.bottom+2.5,'label/metric overlap or insufficient separation',x);assert(scope,x.lr&&x.cr&&x.lr.right<=x.cr.left+0.5,'left cluster overlaps counter',x);assert(scope,x.menuOverflow<=1&&x.cardOverflow<=1,'horizontal overflow',x);R.counts.progress++;
  await page.locator('[data-drawer-close]').first().click().catch(()=>{});
}
async function clickTheme(page,t){const n=await page.locator(`[data-set-theme="${t}"]`).count();for(let i=0;i<n;i++){const z=page.locator(`[data-set-theme="${t}"]`).nth(i);if(await z.isVisible()){await z.click();return true}}return false}

const browser=await chromium.launch({headless:true});
for(const width of widths){
  for(const loc of locales){
    const context=await browser.newContext({viewport:{width,height:900}});
    await context.route(/fonts\.bunny\.net/,route=>route.abort());
    const page=await context.newPage();
    page.on('pageerror',e=>R.pageErrors.push({width,locale:loc.id,msg:e.message}));
    page.on('console',m=>{if(m.type()==='error')R.consoleErrors.push({width,locale:loc.id,msg:m.text()})});
    await page.goto(u(loc.root),{waitUntil:'domcontentloaded',timeout:15000});
    const items=await itemMeta(page);
    for(const theme of themes){
      for(const n of [0,7]){
        const scope=`public:${loc.id}:${width}:${theme}:${n?'resume':'fresh'}`;
        const state={participantId:'AUDIT-EDITORIAL',screen:'home',itemIndex:0,responses:responses(items,n),adminModes:{},telemetry:[],lastSavedAt:new Date().toISOString()};
        await store(page,loc.editorial,state,theme);await reload(page);const x=await cta(page);checkCta(scope,x,theme,false);R.counts.public++;R.cases.push({scope,cta:x});
      }
    }
    await page.goto(u(loc.system),{waitUntil:'domcontentloaded',timeout:15000});
    const sysItems=await itemMeta(page);
    for(const theme of themes){
      for(const st of states){
        const rs=responses(sysItems,st.count),count=Object.keys(rs).length,scope=`system:${loc.id}:${width}:${theme}:${st.id}`;
        const state={participantId:'AUDIT',sessionLocale:loc.id,screen:st.screen,itemIndex:st.id==='results'?sysItems.length:Math.min(count,sysItems.length-1),responses:rs,adminModes:{P72D:'General Pattern'},telemetry:[],startedAt:new Date().toISOString(),consentAt:new Date().toISOString(),lastSavedAt:new Date().toISOString()};
        await store(page,loc.session,state,theme);await reload(page);const x=await cta(page);checkCta(scope,x,theme,true);R.counts.system++;if(count)await progress(page,count,sysItems.length,scope+':progress');R.cases.push({scope,cta:x,count,total:sysItems.length});
      }
    }
    // Theme switch on active test state.
    let rs=responses(sysItems,7),state={participantId:'AUDIT-SWITCH',sessionLocale:loc.id,screen:'test',itemIndex:7,responses:rs,adminModes:{P72D:'General Pattern'},telemetry:[],startedAt:new Date().toISOString(),consentAt:new Date().toISOString(),lastSavedAt:new Date().toISOString()};
    await store(page,loc.session,state,'ivory');await reload(page);
    for(const t of ['graphite','museum','ivory']){await page.locator('[data-mobile-menu]').first().click();await page.waitForFunction(()=>document.body.classList.contains('mobile-menu-open'));assert(`switch:${loc.id}:${width}:${t}`,await clickTheme(page,t),`no visible theme control ${t}`);await page.waitForFunction(tt=>document.body.dataset.theme===tt,t);const x=await cta(page);checkCta(`switch:${loc.id}:${width}:${t}`,x,t,true);if(await page.evaluate(()=>document.body.classList.contains('mobile-menu-open')))await page.locator('[data-drawer-close]').first().click().catch(()=>{});}R.counts.switch++;
    // Press state for all themes at 390 only.
    if(width===390){for(const t of themes){await store(page,loc.session,state,t);await reload(page);const z=page.locator('.mobile-bottom-nav button.cta').first(),before=await cta(page),box=await z.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();const during=await cta(page);await page.mouse.up();assert(`press:${loc.id}:${t}`,during.bg===before.bg,'press changes CTA primary surface',{before:before.bg,during:during.bg});assert(`press:${loc.id}:${t}`,during.color===before.color,'press changes CTA text color',{before:before.color,during:during.color});R.counts.press++;}}
    await context.close();
  }
}
await browser.close();
for(const e of R.pageErrors)fail(`pageerror:${e.locale}:${e.width}`,e.msg);
R.completedAt=new Date().toISOString();R.verdict=R.failures.length?'FAIL':'PASS';
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(R,null,2));fs.writeFileSync(path.join(out,'summary.txt'),`Target SHA: ${TARGET_SHA}\nVerdict: ${R.verdict}\nPublic: ${R.counts.public}\nSystem: ${R.counts.system}\nProgress: ${R.counts.progress}\nSwitch: ${R.counts.switch}\nPress: ${R.counts.press}\nFailures: ${R.failures.length}\nPage errors: ${R.pageErrors.length}\nConsole errors: ${R.consoleErrors.length}\n`);
console.log(JSON.stringify({verdict:R.verdict,counts:R.counts,failures:R.failures.slice(0,30),pageErrors:R.pageErrors.slice(0,10),consoleErrors:R.consoleErrors.slice(0,10)},null,2));
if(R.failures.length)process.exit(1);
