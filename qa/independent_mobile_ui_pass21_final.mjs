import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const TARGET='ef6020afa0df6035bbbfe540a1ace815341589d4';
const LIVE=(process.env.P120_LIVE_BASE||'https://unityplanet.github.io/p120-web').replace(/\/$/,'');
const LOCAL=(process.env.P120_LOCAL_BASE||'http://127.0.0.1:4173').replace(/\/$/,'');
const OUT=path.resolve('qa-artifacts/mobile-ui-pass21-independent-final');fs.mkdirSync(OUT,{recursive:true});
const widths=[360,390,430,480],themes=['ivory','graphite','museum'];
const locales=[
 {id:'ru',root:'/',system:'/system/',session:'p120_runtime_session_ru_v1',editorial:'p120_editorial_state_ru_v1'},
 {id:'en',root:'/en/',system:'/en/system/',session:'p120_runtime_session_en_v1',editorial:'p120_editorial_state_en_v1'}
];
const expected={
 ivory:{text:'rgb(255, 255, 255)',stops:['rgb(23, 23, 21)','rgb(36, 54, 51)']},
 graphite:{text:'rgb(245, 239, 229)',stops:['rgb(88, 112, 108)','rgb(73, 99, 95)']},
 museum:{text:'rgb(255, 249, 236)',stops:['rgb(47, 117, 111)','rgb(37, 95, 92)']}
};
const report={targetSha:TARGET,startedAt:new Date().toISOString(),source:{},contrast:{},counts:{cases:0,public:0,system:0,progress:0,switch:0,press:0},failures:[],warnings:[],cases:[]};
const fail=(scope,message,detail=null)=>report.failures.push({scope,message,detail});
const warn=(scope,message,detail=null)=>report.warnings.push({scope,message,detail});
const assert=(scope,ok,message,detail=null)=>{if(!ok)fail(scope,message,detail)};
const url=(base,p)=>base+p;

function staticAudit(){
 const cta=fs.readFileSync('p120-mobile-primary-cta-pass2.css','utf8');
 const p53=fs.readFileSync('p120-pass53-visual-corrections-v1.0.css','utf8');
 const ru=fs.readFileSync('system/index.html','utf8'),en=fs.readFileSync('en/system/index.html','utf8');
 const checks={
  activeCoupled:/button\.cta,\s*[\s\S]*button\.cta\.active/.test(cta),
  graphite:cta.includes('#58706C')&&cta.includes('#49635F'),
  museum:cta.includes('#2F756F')&&cta.includes('#255F5C'),
  progressGrid:p53.includes('.mobile-menu-progress-top > div:first-child')&&p53.includes('display:grid')&&p53.includes('gap:4px'),
  counterNowrap:p53.includes('.mobile-menu-progress-top > span:last-child')&&p53.includes('white-space:nowrap'),
  ruAsset:ru.includes('data-p120-mobile-primary-cta="pass2"'),enAsset:en.includes('data-p120-mobile-primary-cta="pass2"'),
  ruIdentity:ru.includes('data-p120-page="system"')&&ru.includes('data-p120-locale="ru"'),
  enIdentity:en.includes('data-p120-page="system"')&&en.includes('data-p120-locale="en"')
 };
 report.source=checks;for(const[k,v]of Object.entries(checks))assert('source:'+k,v,'source authority check failed');
 const rgb=h=>{h=h.replace('#','');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255)};
 const lum=h=>{const c=rgb(h).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
 const cr=(a,b)=>{const A=lum(a),B=lum(b);return(Math.max(A,B)+.05)/(Math.min(A,B)+.05)};
 const mix=(a,b,p)=>{const A=rgb(a).map(x=>x*255),B=rgb(b).map(x=>x*255);return'#'+A.map((v,i)=>Math.round(v*p+B[i]*(1-p)).toString(16).padStart(2,'0')).join('').toUpperCase()};
 const ivoryEnd=mix('#171715','#4A8E89',.74);
 const ratios={ivoryStart:cr('#FFFFFF','#171715'),ivoryEnd:cr('#FFFFFF',ivoryEnd),graphiteStart:cr('#F5EFE5','#58706C'),graphiteEnd:cr('#F5EFE5','#49635F'),museumStart:cr('#FFF9EC','#2F756F'),museumEnd:cr('#FFF9EC','#255F5C')};
 report.contrast={ivoryEnd,ratios};for(const[k,v]of Object.entries(ratios))assert('contrast:'+k,v>=4.5,`contrast ${v.toFixed(3)} below 4.5:1`);
}

function acceptance(locale){return{schema:'p120.legal-acceptance.v1.0',notice_version:'P120-IP-SANDBOX-v1.0',rightsholder:'DEC',environment:'SANDBOX',acceptance_method:'audit_preseed',accepted_at:new Date().toISOString(),locale};}
function responses(meta,n){const k=n==='all'?meta.length:Math.min(Number(n),meta.length);return Object.fromEntries(meta.slice(0,k).map(x=>[x.id,x.value]));}
async function metaFor(browser,base,loc){
 const ctx=await browser.newContext({viewport:{width:390,height:900}});const page=await ctx.newPage();
 await page.addInitScript(({locale,a})=>{localStorage.setItem('p120_legal_acceptance_v1',JSON.stringify(a));localStorage.setItem('p120_web_theme_v16','ivory')},{locale:loc.id,a:acceptance(loc.id)});
 await page.goto(url(base,loc.system),{waitUntil:'domcontentloaded',timeout:20000});
 await page.waitForFunction(()=>window.P120_INSTRUMENT?.items?.length>0,null,{timeout:10000});
 const m=await page.evaluate(()=>window.P120_INSTRUMENT.items.map(i=>({id:i.id,value:String(i.choices?.[0]?.value??'1')})));
 await ctx.close();return m;
}
async function inspectCta(page){return page.locator('.mobile-bottom-nav button.cta').first().evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect(),i=el.querySelector('.mobile-nav-icon'),is=i?getComputedStyle(i):null;return{className:el.className,label:el.textContent.trim(),bg:s.backgroundImage,bgc:s.backgroundColor,color:s.color,border:s.borderColor,shadow:s.boxShadow,left:r.left,right:r.right,width:r.width,vw:innerWidth,iconColor:is?.color||'',theme:document.body.dataset.theme||'',page:document.body.dataset.p120Page||'',locale:document.body.dataset.p120Locale||'',overflow:document.documentElement.scrollWidth-innerWidth}})}
function checkCta(scope,x,theme,expectedActive){const e=expected[theme];assert(scope,x.theme===theme,`theme ${x.theme} != ${theme}`,x);assert(scope,x.color===e.text,`text ${x.color} != ${e.text}`,x);for(const stop of e.stops)assert(scope,x.bg.includes(stop),`gradient missing ${stop}`,x.bg);assert(scope,x.left>=-.5&&x.right<=x.vw+.5,'CTA clipped or outside viewport',x);assert(scope,x.overflow<=1,'page horizontal overflow',x.overflow);assert(scope,x.className.split(/\s+/).includes('active')===expectedActive,`active class mismatch: ${x.className}`,x)}
async function openMenu(page,scope){
 await page.evaluate(()=>document.querySelector('[data-mobile-menu]')?.click());
 try{await page.waitForFunction(()=>document.body.classList.contains('mobile-menu-open'),null,{timeout:5000})}catch(e){fail(scope,'mobile menu did not open',await page.evaluate(()=>({bodyClass:document.body.className,modal:!!document.querySelector('[data-p120-legal-modal].is-open'),toggle:!!document.querySelector('[data-mobile-menu]')})));return false}
 return true;
}
async function closeMenu(page){await page.evaluate(()=>document.querySelector('[data-drawer-close]')?.click());await page.waitForFunction(()=>!document.body.classList.contains('mobile-menu-open'),null,{timeout:3000}).catch(()=>{})}
async function progressCheck(page,count,total,scope){
 if(!await openMenu(page,scope))return;
 const card=page.locator('.mobile-menu-progress').first();if(await card.count()===0){fail(scope,'progress card absent despite seeded responses',{count,total});await closeMenu(page);return}
 const x=await card.evaluate(el=>{const top=el.querySelector('.mobile-menu-progress-top'),left=top?.querySelector(':scope > div:first-child'),label=left?.querySelector('span'),metric=left?.querySelector('strong'),counter=top?.querySelector(':scope > span:last-child'),R=n=>{if(!n)return null;const r=n.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}},menu=el.closest('.mobile-menu');return{display:left?getComputedStyle(left).display:'',gap:left?getComputedStyle(left).rowGap:'',label:label?.textContent.trim()||'',metric:metric?.textContent.trim()||'',counter:counter?.textContent.trim()||'',L:R(label),M:R(metric),C:R(counter),left:R(left),menuOverflow:menu?menu.scrollWidth-menu.clientWidth:0,cardOverflow:el.scrollWidth-el.clientWidth}});
 const pct=Math.round(count/total*100);assert(scope,x.display==='grid',`progress left display ${x.display} != grid`,x);assert(scope,x.metric===`${pct}%`,`progress metric ${x.metric} != ${pct}%`,x);assert(scope,x.counter.includes(String(count))&&x.counter.includes(String(total)),'progress counter mismatch',x);assert(scope,x.L&&x.M&&x.M.top>=x.L.bottom+2.5,'label and percentage are not vertically separated',x);assert(scope,x.left&&x.C&&x.left.right<=x.C.left+.5,'progress left cluster overlaps counter',x);assert(scope,x.menuOverflow<=1&&x.cardOverflow<=1,'progress drawer horizontal overflow',x);report.counts.progress++;await closeMenu(page);
}
async function runCase(browser,base,env,loc,meta,width,theme,kind,stateSpec){
 const scope=`${env}:${loc.id}:${width}:${theme}:${kind}:${stateSpec.id}`;const ctx=await browser.newContext({viewport:{width,height:900}});await ctx.route(/fonts\.bunny\.net/,r=>r.abort());const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const key=kind==='public'?loc.editorial:loc.session,rs=responses(meta,stateSpec.count),count=Object.keys(rs).length;
 const state=kind==='public'?{participantId:'P120-AUDIT-EDITORIAL',screen:'home',itemIndex:0,responses:rs,adminModes:{},telemetry:[],lastSavedAt:new Date().toISOString()}:{participantId:'P120-AUDIT',sessionLocale:loc.id,screen:stateSpec.screen,itemIndex:stateSpec.id==='results'?Math.max(0,meta.length-1):Math.min(count,Math.max(0,meta.length-1)),responses:rs,adminModes:{P72D:'General Pattern'},telemetry:[],startedAt:new Date().toISOString(),consentAt:new Date().toISOString(),lastSavedAt:new Date().toISOString()};
 await page.addInitScript(({key,state,theme,a})=>{localStorage.setItem(key,JSON.stringify(state));localStorage.setItem('p120_web_theme_v16',theme);localStorage.setItem('p120_legal_acceptance_v1',JSON.stringify(a))},{key,state,theme,a:acceptance(loc.id)});
 try{
  const res=await page.goto(url(base,kind==='public'?loc.root:loc.system),{waitUntil:'domcontentloaded',timeout:20000});assert(scope,(res?.status()||0)<400,`HTTP ${res?.status()}`);
  await page.waitForSelector('.mobile-bottom-nav button.cta',{state:'visible',timeout:10000});await page.waitForTimeout(60);
  const x=await inspectCta(page),expectedActive=kind==='system'&&['preflight','test','transition','results'].includes(stateSpec.screen);checkCta(scope,x,theme,expectedActive);
  if(errors.length)fail(scope,'page errors observed',errors);
  if(kind==='system'&&count>0)await progressCheck(page,count,meta.length,scope+':progress');
  report.cases.push({scope,kind,state:stateSpec.id,count,total:meta.length,cta:x,pageErrors:errors});report.counts.cases++;if(kind==='public')report.counts.public++;else report.counts.system++;
 }catch(e){fail(scope,e.message,e.stack)}
 await ctx.close();
}
async function themeSwitchAndPress(browser,base,loc,meta){
 const width=390,rs=responses(meta,7),state={participantId:'P120-AUDIT-SWITCH',sessionLocale:loc.id,screen:'test',itemIndex:7,responses:rs,adminModes:{P72D:'General Pattern'},telemetry:[],startedAt:new Date().toISOString(),consentAt:new Date().toISOString(),lastSavedAt:new Date().toISOString()};
 const ctx=await browser.newContext({viewport:{width,height:900}});const page=await ctx.newPage();await page.addInitScript(({key,state,a})=>{localStorage.setItem(key,JSON.stringify(state));localStorage.setItem('p120_web_theme_v16','ivory');localStorage.setItem('p120_legal_acceptance_v1',JSON.stringify(a))},{key:loc.session,state,a:acceptance(loc.id)});await page.goto(url(base,loc.system),{waitUntil:'domcontentloaded',timeout:20000});await page.waitForSelector('.mobile-bottom-nav button.cta',{state:'visible',timeout:10000});
 for(const t of ['graphite','museum','ivory']){const scope=`production:${loc.id}:390:switch:${t}`;const clicked=await page.evaluate(t=>{const n=[...document.querySelectorAll(`[data-set-theme="${t}"]`)][0];if(!n)return false;n.click();return true},t);assert(scope,clicked,`theme control ${t} missing`);await page.waitForFunction(t=>document.body.dataset.theme===t,t,{timeout:5000});checkCta(scope,await inspectCta(page),t,true);report.counts.switch++}
 for(const t of themes){await page.evaluate(t=>document.querySelector(`[data-set-theme="${t}"]`)?.click(),t);await page.waitForFunction(t=>document.body.dataset.theme===t,t,{timeout:5000});const z=page.locator('.mobile-bottom-nav button.cta').first(),before=await inspectCta(page),b=await z.boundingBox(),scope=`production:${loc.id}:390:press:${t}`;await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();const during=await inspectCta(page);await page.mouse.up();assert(scope,during.bg===before.bg,'press state changes CTA primary surface',{before:before.bg,during:during.bg});assert(scope,during.color===before.color,'press state changes CTA text color',{before:before.color,during:during.color});report.counts.press++}
 await ctx.close();
}

staticAudit();const browser=await chromium.launch({headless:true});
const meta={};for(const loc of locales)meta[loc.id]=await metaFor(browser,LIVE,loc);
const publicStates=[{id:'fresh',screen:'home',count:0},{id:'resume',screen:'home',count:7}];
const systemStates=[{id:'preflight',screen:'preflight',count:0},{id:'test4',screen:'test',count:7},{id:'transition10',screen:'transition',count:18},{id:'results',screen:'results',count:'all'},{id:'resume4',screen:'home',count:7}];
const jobs=[];for(const loc of locales)for(const width of widths)for(const theme of themes){for(const s of publicStates)jobs.push(()=>runCase(browser,LIVE,'production',loc,meta[loc.id],width,theme,'public',s));for(const s of systemStates)jobs.push(()=>runCase(browser,LIVE,'production',loc,meta[loc.id],width,theme,'system',s))}
const concurrency=6;for(let i=0;i<jobs.length;i+=concurrency)await Promise.all(jobs.slice(i,i+concurrency).map(f=>f()));
// Exact-source local parity at the representative 390px width, all themes and all seeded states.
const localJobs=[];for(const loc of locales)for(const theme of themes){for(const s of publicStates)localJobs.push(()=>runCase(browser,LOCAL,'local',loc,meta[loc.id],390,theme,'public',s));for(const s of systemStates)localJobs.push(()=>runCase(browser,LOCAL,'local',loc,meta[loc.id],390,theme,'system',s))}for(let i=0;i<localJobs.length;i+=concurrency)await Promise.all(localJobs.slice(i,i+concurrency).map(f=>f()));
for(const loc of locales)await themeSwitchAndPress(browser,LIVE,loc,meta[loc.id]);await browser.close();
report.completedAt=new Date().toISOString();report.verdict=report.failures.length?'FAIL':report.warnings.length?'PASS_WITH_NOTES':'PASS';
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(OUT,'SUMMARY.txt'),`P-120 WEB — INDEPENDENT MOBILE UI PASS 2.1 FINAL MATRIX\nTarget SHA: ${TARGET}\nVerdict: ${report.verdict}\nCases: ${report.counts.cases}\nPublic CTA: ${report.counts.public}\nSystem CTA: ${report.counts.system}\nProgress geometry: ${report.counts.progress}\nTheme switches: ${report.counts.switch}\nPress checks: ${report.counts.press}\nFailures: ${report.failures.length}\nWarnings: ${report.warnings.length}\n`);
console.log(JSON.stringify({verdict:report.verdict,counts:report.counts,contrast:report.contrast,failures:report.failures.slice(0,50),warnings:report.warnings.slice(0,20)},null,2));if(report.failures.length)process.exit(1);
