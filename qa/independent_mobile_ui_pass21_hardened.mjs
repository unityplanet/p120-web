import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const TARGET_SHA='ef6020afa0df6035bbbfe540a1ace815341589d4';
const LIVE_BASE=process.env.P120_LIVE_BASE||'https://unityplanet.github.io/p120-web';
const LOCAL_BASE=process.env.P120_LOCAL_BASE||'http://127.0.0.1:4173';
const widths=[360,390,430,480], themes=['ivory','graphite','museum'];
const locales=[
 {id:'ru',root:'/',system:'/system/',session:'p120_runtime_session_ru_v1',editorial:'p120_editorial_state_ru_v1'},
 {id:'en',root:'/en/',system:'/en/system/',session:'p120_runtime_session_en_v1',editorial:'p120_editorial_state_en_v1'}
];
const states=[
 {id:'preflight',screen:'preflight',count:0},
 {id:'test4',screen:'test',count:7},
 {id:'transition10',screen:'transition',count:18},
 {id:'results100',screen:'results',count:'all'},
 {id:'resume4',screen:'home',count:7}
];
const expectedText={ivory:'rgb(255, 255, 255)',graphite:'rgb(245, 239, 229)',museum:'rgb(255, 249, 236)'};
const expectedStops={graphite:['rgb(88, 112, 108)','rgb(73, 99, 95)'],museum:['rgb(47, 117, 111)','rgb(37, 95, 92)']};
const out=path.resolve('qa-artifacts/mobile-ui-pass21-independent-hardened');fs.mkdirSync(out,{recursive:true});
const R={targetSha:TARGET_SHA,startedAt:new Date().toISOString(),environments:{},source:{},contrast:{},failures:[],warnings:[],counts:{public:0,system:0,progress:0,switch:0,press:0}};
const fail=(s,m,d=null)=>R.failures.push({scope:s,message:m,detail:d});
const warn=(s,m,d=null)=>R.warnings.push({scope:s,message:m,detail:d});
const assert=(s,c,m,d=null)=>{if(!c)fail(s,m,d)};
const join=(base,route)=>base.replace(/\/$/,'')+route;
function hexRgb(h){h=h.replace('#','');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16))}
function lum(h){const [r,g,b]=hexRgb(h).map(v=>{const x=v/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*b}
function cr(a,b){const A=lum(a),B=lum(b);return(Math.max(A,B)+.05)/(Math.min(A,B)+.05)}
function mix(a,b,p){const A=hexRgb(a),B=hexRgb(b);return'#'+A.map((v,i)=>Math.round(v*p+B[i]*(1-p)).toString(16).padStart(2,'0')).join('').toUpperCase()}
function staticAudit(){
 const cta=fs.readFileSync('p120-mobile-primary-cta-pass2.css','utf8'), p53=fs.readFileSync('p120-pass53-visual-corrections-v1.0.css','utf8');
 const checks={pair:/button\.cta,\s*[\s\S]*button\.cta\.active/.test(cta),graphite:cta.includes('#58706C')&&cta.includes('#49635F'),museum:cta.includes('#2F756F')&&cta.includes('#255F5C'),ruSystem:p53.includes('body[data-p120-page="system"][data-p120-locale="ru"] .mobile-bottom-nav button.cta.active'),progressGrid:p53.includes('.mobile-menu-progress-top > div:first-child')&&p53.includes('display:grid')&&p53.includes('gap:4px'),counterNowrap:p53.includes('.mobile-menu-progress-top > span:last-child')&&p53.includes('white-space:nowrap')};R.source=checks;for(const[k,v]of Object.entries(checks))assert('source:'+k,v,'source authority check failed');
 const ivoryEnd=mix('#171715','#4A8E89',.74);const ratios={ivoryStart:cr('#FFFFFF','#171715'),ivoryEnd:cr('#FFFFFF',ivoryEnd),graphiteStart:cr('#F5EFE5','#58706C'),graphiteEnd:cr('#F5EFE5','#49635F'),museumStart:cr('#FFF9EC','#2F756F'),museumEnd:cr('#FFF9EC','#255F5C')};R.contrast={ratios,ivoryEnd};for(const[k,v]of Object.entries(ratios))assert('contrast:'+k,v>=4.5,`contrast ${v.toFixed(3)} below 4.5:1`);
}
async function meta(page){await page.waitForFunction(()=>window.P120_INSTRUMENT?.items?.length>0,{timeout:10000});return page.evaluate(()=>window.P120_INSTRUMENT.items.map(i=>({id:i.id,value:String(i.choices?.[0]?.value??'1')})))}
function resp(items,n){const k=n==='all'?items.length:Math.min(Number(n),items.length);return Object.fromEntries(items.slice(0,k).map(i=>[i.id,i.value]))}
async function seedNavigate(page,base,route,key,state,theme){
 await page.goto(join(base,'/.nojekyll'),{waitUntil:'domcontentloaded',timeout:10000});
 await page.evaluate(({key,state,theme})=>{localStorage.setItem(key,JSON.stringify(state));localStorage.setItem('p120_web_theme_v16',theme)},{key,state,theme});
 await page.goto(join(base,route),{waitUntil:'domcontentloaded',timeout:15000});
 await page.waitForSelector('.mobile-bottom-nav button.cta',{state:'visible',timeout:10000});
}
async function inspectCta(page){return page.locator('.mobile-bottom-nav button.cta').first().evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return{className:el.className,bg:s.backgroundImage,color:s.color,left:r.left,right:r.right,vw:innerWidth,theme:document.body.dataset.theme,page:document.body.dataset.p120Page||'',locale:document.body.dataset.p120Locale||''}})}
function checkCta(scope,x,theme,active){assert(scope,x.theme===theme,`theme ${x.theme} != ${theme}`,x);assert(scope,x.color===expectedText[theme],`text ${x.color} != ${expectedText[theme]}`,x);assert(scope,x.bg&&x.bg!=='none','CTA has no primary background',x);if(expectedStops[theme])for(const stop of expectedStops[theme])assert(scope,x.bg.includes(stop),`gradient missing ${stop}`,x.bg);assert(scope,x.left>=-.5&&x.right<=x.vw+.5,'CTA clipped/overflow',x);assert(scope,x.className.split(/\s+/).includes('active')===active,`active-state mismatch: ${x.className}`,x)}
async function inspectProgress(page,count,total,scope){
 if(!count)return null;
 await page.locator('[data-mobile-menu]').first().click();await page.waitForFunction(()=>document.body.classList.contains('mobile-menu-open'),{timeout:5000});await page.waitForTimeout(50);
 const card=page.locator('.mobile-menu-progress').first();if(await card.count()===0){const d=await page.evaluate(()=>({url:location.href,menu:document.querySelector('.mobile-menu')?.innerText.slice(0,700)||'',body:document.body.dataset}));fail(scope,'progress card absent despite seeded responses',d);return null}
 const x=await card.evaluate(el=>{const top=el.querySelector('.mobile-menu-progress-top'),left=top?.querySelector(':scope > div:first-child'),label=left?.querySelector('span'),metric=left?.querySelector('strong'),counter=top?.querySelector(':scope > span:last-child'),rect=n=>{if(!n)return null;const r=n.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom}},menu=el.closest('.mobile-menu');return{display:left?getComputedStyle(left).display:null,gap:left?getComputedStyle(left).rowGap:null,label:label?.textContent.trim()||'',metric:metric?.textContent.trim()||'',counter:counter?.textContent.trim()||'',lr:rect(left),ar:rect(label),mr:rect(metric),cr:rect(counter),menuOverflow:menu?menu.scrollWidth-menu.clientWidth:0,cardOverflow:el.scrollWidth-el.clientWidth}});
 const pct=Math.round(count/total*100);assert(scope,x.display==='grid',`left cluster display ${x.display}`,x);assert(scope,x.metric===`${pct}%`,`metric ${x.metric} != ${pct}%`,x);assert(scope,x.counter.includes(String(count))&&x.counter.includes(String(total)),'counter mismatch',x);assert(scope,x.ar&&x.mr&&x.mr.top>=x.ar.bottom+2.5,'label and metric are not vertically separated',x);assert(scope,x.lr&&x.cr&&x.lr.right<=x.cr.left+.5,'left cluster overlaps counter',x);assert(scope,x.menuOverflow<=1&&x.cardOverflow<=1,'horizontal overflow',x);R.counts.progress++;await page.locator('[data-drawer-close]').first().click().catch(()=>{});return x;
}
async function visibleTheme(page,t){const q=page.locator(`[data-set-theme="${t}"]`);for(let i=0;i<await q.count();i++){if(await q.nth(i).isVisible()){await q.nth(i).click();return true}}return false}
async function runEnv(name,base,matrixWidths){
 const browser=await chromium.launch({headless:true}),env={pageErrors:[],consoleErrors:[],cases:[]};R.environments[name]=env;
 for(const width of matrixWidths)for(const loc of locales){
  const context=await browser.newContext({viewport:{width,height:900}});await context.route(/fonts\.bunny\.net/,r=>r.abort());const page=await context.newPage();
  page.on('pageerror',e=>env.pageErrors.push({width,locale:loc.id,message:e.message}));page.on('console',m=>{if(m.type()==='error')env.consoleErrors.push({width,locale:loc.id,message:m.text()})});
  await page.goto(join(base,loc.root),{waitUntil:'domcontentloaded',timeout:15000});const pubItems=await meta(page);
  for(const theme of themes)for(const n of [0,7]){const rs=resp(pubItems,n),state={participantId:'AUDIT-EDITORIAL',screen:'home',itemIndex:0,responses:rs,adminModes:{},telemetry:[],lastSavedAt:new Date().toISOString()},scope=`${name}:public:${loc.id}:${width}:${theme}:${n?'resume':'fresh'}`;await seedNavigate(page,base,loc.root,loc.editorial,state,theme);const x=await inspectCta(page);checkCta(scope,x,theme,false);R.counts.public++;env.cases.push({scope,cta:x})}
  await page.goto(join(base,loc.system),{waitUntil:'domcontentloaded',timeout:15000});const items=await meta(page);
  for(const theme of themes)for(const st of states){const rs=resp(items,st.count),count=Object.keys(rs).length,state={participantId:'AUDIT',sessionLocale:loc.id,screen:st.screen,itemIndex:st.id==='results100'?items.length:Math.min(count,Math.max(0,items.length-1)),responses:rs,adminModes:{P72D:'General Pattern'},telemetry:[],startedAt:new Date().toISOString(),consentAt:new Date().toISOString(),lastSavedAt:new Date().toISOString()},scope=`${name}:system:${loc.id}:${width}:${theme}:${st.id}`;await seedNavigate(page,base,loc.system,loc.session,state,theme);const raw=await page.evaluate(k=>localStorage.getItem(k),loc.session);const parsed=JSON.parse(raw||'{}');assert(scope,Object.keys(parsed.responses||{}).length===count,`seeded responses were not preserved: ${Object.keys(parsed.responses||{}).length} != ${count}`,parsed);const x=await inspectCta(page);checkCta(scope,x,theme,true);R.counts.system++;if(count)await inspectProgress(page,count,items.length,scope+':progress');env.cases.push({scope,cta:x,count,total:items.length})}
  const rs=resp(items,7),switchState={participantId:'AUDIT-SWITCH',sessionLocale:loc.id,screen:'test',itemIndex:7,responses:rs,adminModes:{P72D:'General Pattern'},telemetry:[],startedAt:new Date().toISOString(),consentAt:new Date().toISOString(),lastSavedAt:new Date().toISOString()};await seedNavigate(page,base,loc.system,loc.session,switchState,'ivory');for(const t of ['graphite','museum','ivory']){await page.locator('[data-mobile-menu]').first().click();await page.waitForFunction(()=>document.body.classList.contains('mobile-menu-open'),{timeout:5000});assert(`${name}:switch:${loc.id}:${width}:${t}`,await visibleTheme(page,t),`no visible theme control ${t}`);await page.waitForFunction(tt=>document.body.dataset.theme===tt,t,{timeout:5000});checkCta(`${name}:switch:${loc.id}:${width}:${t}`,await inspectCta(page),t,true);if(await page.evaluate(()=>document.body.classList.contains('mobile-menu-open')))await page.locator('[data-drawer-close]').first().click().catch(()=>{})}R.counts.switch++;
  if(width===390)for(const t of themes){await seedNavigate(page,base,loc.system,loc.session,switchState,t);const z=page.locator('.mobile-bottom-nav button.cta').first(),before=await inspectCta(page),box=await z.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();const during=await inspectCta(page);await page.mouse.up();assert(`${name}:press:${loc.id}:${t}`,during.bg===before.bg,'press changes CTA primary surface',{before:before.bg,during:during.bg});assert(`${name}:press:${loc.id}:${t}`,during.color===before.color,'press changes CTA text color',{before:before.color,during:during.color});R.counts.press++}
  await context.close();
 }
 for(const e of env.pageErrors)fail(`${name}:pageerror:${e.locale}:${e.width}`,e.message);if(env.consoleErrors.length)warn(`${name}:console`,`${env.consoleErrors.length} console errors observed`,env.consoleErrors.slice(0,30));await browser.close();
}

staticAudit();await runEnv('local',LOCAL_BASE,[390]);await runEnv('production',LIVE_BASE,widths);R.completedAt=new Date().toISOString();R.verdict=R.failures.length?'FAIL':R.warnings.length?'PASS_WITH_NOTES':'PASS';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(R,null,2));fs.writeFileSync(path.join(out,'summary.txt'),`Target SHA: ${TARGET_SHA}\nVerdict: ${R.verdict}\nPublic CTA cases: ${R.counts.public}\nSystem CTA cases: ${R.counts.system}\nProgress cases: ${R.counts.progress}\nTheme-switch cases: ${R.counts.switch}\nPress cases: ${R.counts.press}\nFailures: ${R.failures.length}\nWarnings: ${R.warnings.length}\n`);console.log(JSON.stringify({verdict:R.verdict,counts:R.counts,contrast:R.contrast,failures:R.failures.slice(0,40),warnings:R.warnings.slice(0,10)},null,2));if(R.failures.length)process.exit(1);
