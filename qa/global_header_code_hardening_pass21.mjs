import {chromium} from 'playwright';
import fs from 'fs';
import path from 'path';

/*
 P-120 WEB — GLOBAL HEADER BRAND LOCKUP CLEANING / PASS 2.1
 CODE HARDENING & SINGLE-AUTHORITY CONSOLIDATION QA

 Presentation-preserving verification only. No page mutation beyond test-local
 localStorage fixtures. No measurement, scoring, questionnaire or science checks
 are altered by this gate.
*/

const BASE=process.env.P120_QA_BASE||'http://127.0.0.1:4173';
const ROOT=process.cwd();
const OUT='qa-artifacts/header-code-pass21';
const widths=[390,1440];
const routes=[
  '/', '/extended/', '/together/', '/creator/', '/why-p120/', '/science/', '/system/', '/intellectual-property/', '/terms/', '/privacy/',
  '/en/', '/en/extended/', '/en/together/', '/en/creator/', '/en/why-p120/', '/en/science/', '/en/system/', '/en/intellectual-property/', '/en/terms/', '/en/privacy/'
];
const governedHtml=[
  'index.html','extended/index.html','together/index.html','creator/index.html','why-p120/index.html','science/index.html','system/index.html','intellectual-property/index.html','terms/index.html','privacy/index.html',
  'en/index.html','en/extended/index.html','en/together/index.html','en/creator/index.html','en/why-p120/index.html','en/science/index.html','en/system/index.html','en/intellectual-property/index.html','en/terms/index.html','en/privacy/index.html'
];
const liveHideFiles=['index.html','en/index.html','science/index.html','en/science/index.html','system/index.html','en/system/index.html'];
const staticCanonicalBrandFiles=['index.html','en/index.html','science/index.html','en/science/index.html','system/index.html','en/system/index.html','extended/index.html','en/extended/index.html','together/index.html','en/together/index.html','creator/index.html','en/creator/index.html','why-p120/index.html'];

fs.mkdirSync(OUT,{recursive:true});
const failures=[];
const source=[];
const runtime=[];

function fail(label,detail=''){failures.push(detail?`${label}: ${detail}`:label);}
function read(rel){return fs.readFileSync(path.join(ROOT,rel),'utf8');}
function count(text,needle){return text.split(needle).length-1;}

// ---------------------------------------------------------------------------
// Source authority / stale-rule gate
// ---------------------------------------------------------------------------
const hideRe=/\.brand-mark[^,{]*\{[^}]*display\s*:\s*none(?:\s*!important)?[^}]*\}/gms;
for(const rel of governedHtml){
  const text=read(rel);
  const row={rel,
    brandCss:count(text,'data-p120-brand-system="5.3"'),
    correctionCss:count(text,'data-p120-pass53-visual-corrections="5.3.2"'),
    bootstrap:count(text,'data-p120-brand-bootstrap="5.3.2"')
  };
  source.push(row);
  if(row.brandCss!==1)fail(`${rel} canonical brand CSS count`,String(row.brandCss));
  if(row.correctionCss!==1)fail(`${rel} visual correction CSS count`,String(row.correctionCss));
  if(row.bootstrap!==1)fail(`${rel} first-paint bootstrap count`,String(row.bootstrap));
}
for(const rel of liveHideFiles){
  const text=read(rel);
  const matches=[...text.matchAll(hideRe)];
  if(matches.length)fail(`${rel} stale .brand-mark hide rule`,String(matches.length));
}
for(const rel of staticCanonicalBrandFiles){
  const text=read(rel);
  if(!text.includes('data-p120-canonical-brand="5.3"'))fail(`${rel} source canonical brand marker missing`);
}
for(const rel of ['extended/index.html','en/extended/index.html','together/index.html','en/together/index.html']){
  const text=read(rel);
  if(text.includes('explore-brand__mark'))fail(`${rel} legacy Explore brand mark still instantiated`);
}
for(const rel of ['creator/index.html','en/creator/index.html']){
  const text=read(rel);
  if(text.includes('class="creator-mark"'))fail(`${rel} legacy Founder brand mark still instantiated`);
  if(text.includes('data-founder-theme-slot')||text.includes('data-founder-explore-slot'))fail(`${rel} legacy Founder desktop control slot still instantiated`);
}
const brandJs=read('p120-brand-system-v1.0.js');
if(!brandJs.includes("revision:'5.3.2'"))fail('brand runtime revision is not 5.3.2');
if(!brandJs.includes('if(info.innerHTML!==nextInfo) info.innerHTML=nextInfo'))fail('resume rail value-idempotency guard missing');
if(!brandJs.includes('mutationNeedsReconcile'))fail('filtered reconciliation observer missing');
if(!brandJs.includes('ensureCss();\n\n  function kind()'))fail('immediate canonical CSS installation missing');
const exploreJs=read('explore-system-v1.0.js');
if(!exploreJs.includes("inner.querySelector('[data-p120-brand53-tools]')"))fail('Explore legacy desktop-control suppression guard missing');

// ---------------------------------------------------------------------------
// Runtime lifecycle gate
// ---------------------------------------------------------------------------
const browser=await chromium.launch({headless:true});
for(const width of widths){
  for(const route of routes){
    const context=await browser.newContext({viewport:{width,height:900}});
    const page=await context.newPage();
    const errors=[];
    page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
    page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));

    await page.addInitScript(()=>{
      window.__p120Header21={started:performance.now(),timeline:[]};
      const sample=()=>{
        const marks=[...document.querySelectorAll('.brand-mark')];
        const states=marks.map(mark=>{
          const cs=getComputedStyle(mark),r=mark.getBoundingClientRect();
          return {display:cs.display,visibility:cs.visibility,opacity:cs.opacity,width:r.width,height:r.height};
        });
        window.__p120Header21.timeline.push({
          t:Math.round(performance.now()-window.__p120Header21.started),
          ready:document.documentElement.classList.contains('p120-brand53-ready'),
          markCount:marks.length,
          visibleMarks:states.filter(s=>s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&s.width>0&&s.height>0).length,
          states
        });
        if(performance.now()-window.__p120Header21.started<2200)requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });

    const response=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>window.P120_BRAND_SYSTEM?.revision==='5.3.2',{timeout:15000});
    await page.waitForTimeout(900);

    const data=await page.evaluate(()=>{
      const vis=el=>{
        if(!el)return false;const cs=getComputedStyle(el),r=el.getBoundingClientRect();
        return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)!==0&&r.width>0&&r.height>0;
      };
      const headerSel='.topbar,.explore-topbar,.creator-topbar,.wp-header,.p120-brand53-header';
      const headers=[...document.querySelectorAll(headerSel)];
      const marks=[...document.querySelectorAll('.brand-mark')];
      const hosts=[...document.querySelectorAll('.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand')];
      const timeline=window.__p120Header21?.timeline||[];
      const firstWithMark=timeline.findIndex(x=>x.markCount>0);
      const firstVisible=timeline.findIndex(x=>x.visibleMarks>0);
      let seenVisible=false;
      const visibleThenHidden=[];
      const duplicateVisible=[];
      for(const x of timeline){
        if(x.visibleMarks>0)seenVisible=true;
        if(seenVisible&&x.markCount>0&&x.visibleMarks===0)visibleThenHidden.push(x);
        if(x.visibleMarks>1)duplicateVisible.push(x);
      }
      return {
        revision:window.P120_BRAND_SYSTEM?.revision||'',
        runtime:document.documentElement.dataset.p120BrandSystem||'',
        ready:document.documentElement.classList.contains('p120-brand53-ready'),
        bootstrap:document.querySelectorAll('script[data-p120-brand-bootstrap="5.3.2"]').length,
        brandCss:document.querySelectorAll('link[data-p120-brand-system]').length,
        correctionCss:document.querySelectorAll('link[data-p120-pass53-visual-corrections]').length,
        brandScripts:document.querySelectorAll('script[src*="p120-brand-system-v1.0.js"]').length,
        headersTotal:headers.length,headersVisible:headers.filter(vis).length,
        marksTotal:marks.length,marksVisible:marks.filter(vis).length,
        hostsTotal:hosts.length,hostsVisible:hosts.filter(vis).length,
        canonicalHosts:document.querySelectorAll('[data-p120-canonical-brand="5.3"]').length,
        canonicalChildren:marks.map(mark=>mark.querySelectorAll(':scope > .brand-orbit,:scope > .brand-node-a,:scope > .brand-node-b').length),
        firstWithMark,firstVisible,
        hiddenBeforeVisible:firstWithMark>=0&&firstVisible>firstWithMark,
        visibleThenHidden:visibleThenHidden.slice(0,6),
        duplicateVisible:duplicateVisible.slice(0,6),
        descriptor:[...document.querySelectorAll('.brand-sub')].map(n=>({text:n.textContent.trim(),visible:vis(n)})),
        legacyVisibleLanguage:[...document.querySelectorAll('.explore-lang-switch,.creator-language,.wp-lang-switch')].filter(vis).length,
        legacyVisibleTheme:[...document.querySelectorAll('.explore-theme-menu,.creator-tools,.wp-theme')].filter(vis).length,
        canonicalVisibleLanguage:[...document.querySelectorAll('.p120-brand53-language')].filter(vis).length,
        reconcileCount:window.P120_BRAND_SYSTEM?.getReconcileCount?.()??null
      };
    });

    const prefix=`${width} ${route}`;
    if(!response||response.status()>=400)fail(`${prefix} HTTP`,String(response?.status()||'none'));
    if(data.revision!=='5.3.2')fail(`${prefix} runtime revision`,data.revision);
    if(data.runtime!=='5.3'||!data.ready)fail(`${prefix} canonical runtime readiness`,JSON.stringify({runtime:data.runtime,ready:data.ready}));
    if(data.brandCss!==1)fail(`${prefix} canonical CSS multiplicity`,String(data.brandCss));
    if(data.correctionCss!==1)fail(`${prefix} correction CSS multiplicity`,String(data.correctionCss));
    if(data.brandScripts!==1)fail(`${prefix} runtime script multiplicity`,String(data.brandScripts));
    if(data.headersVisible!==1)fail(`${prefix} visible header multiplicity`,String(data.headersVisible));
    if(data.marksVisible!==1)fail(`${prefix} visible orbit mark multiplicity`,String(data.marksVisible));
    if(data.canonicalHosts!==1)fail(`${prefix} canonical host multiplicity`,String(data.canonicalHosts));
    if(data.canonicalChildren.some(n=>n!==3))fail(`${prefix} canonical orbit structure`,JSON.stringify(data.canonicalChildren));
    if(data.hiddenBeforeVisible)fail(`${prefix} hidden→visible canonical mark phase`,JSON.stringify({firstWithMark:data.firstWithMark,firstVisible:data.firstVisible}));
    if(data.visibleThenHidden.length)fail(`${prefix} visible→hidden canonical mark regression`,JSON.stringify(data.visibleThenHidden));
    if(data.duplicateVisible.length)fail(`${prefix} duplicate visible mark phase`,JSON.stringify(data.duplicateVisible));
    if(data.legacyVisibleLanguage>0)fail(`${prefix} visible legacy language control`,String(data.legacyVisibleLanguage));
    if(data.legacyVisibleTheme>0)fail(`${prefix} visible legacy theme/tool control`,String(data.legacyVisibleTheme));
    if(errors.length)fail(`${prefix} console/page errors`,errors.join(' | '));

    const slug=(route==='/'?'home':route.replace(/^\/|\/$/g,'').replaceAll('/','-'));
    await page.screenshot({path:path.join(OUT,`${width}-${slug}.png`),fullPage:false});
    runtime.push({width,route,http:response?.status()||0,errors,data});
    await context.close();
  }
}

// Saved-session idempotency: both the editorial shell and the canonical brand
// runtime need a consistent local fixture so that the resume rail is actually
// rendered before repeated reconciliation is tested.
{
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  await page.addInitScript(()=>{
    const stamp=new Date().toISOString();
    const fixture={participantId:'P120-QA-P21',screen:'home',itemIndex:1,responses:{SAT01:'4'},adminModes:{},startedAt:stamp,lastSavedAt:stamp,telemetry:[]};
    localStorage.setItem('p120_editorial_state_ru_v1',JSON.stringify(fixture));
    localStorage.setItem('p120_web_prototype_v01',JSON.stringify(fixture));
  });
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.P120_BRAND_SYSTEM?.revision==='5.3.2');
  await page.waitForSelector('.p120-resume53__copy',{state:'attached',timeout:15000});
  const idempotency=await page.evaluate(async()=>{
    const info=document.querySelector('.p120-resume53__copy');
    let childMutations=0;
    const mo=new MutationObserver(ms=>{childMutations+=ms.filter(m=>m.type==='childList').length});
    mo.observe(info,{childList:true,subtree:true,characterData:true});
    const before=window.P120_BRAND_SYSTEM.getReconcileCount();
    window.P120_BRAND_SYSTEM.reconcile();
    window.P120_BRAND_SYSTEM.reconcile();
    await new Promise(r=>setTimeout(r,120));
    const after=window.P120_BRAND_SYSTEM.getReconcileCount();
    mo.disconnect();
    return {childMutations,before,after,html:info.innerHTML};
  });
  if(idempotency.childMutations!==0)fail('saved-session resume rail is not value-idempotent',JSON.stringify(idempotency));
  runtime.push({case:'saved-session-idempotency',data:idempotency});
  await context.close();
}

await browser.close();

const report={
  document:'P-120 WEB — GLOBAL HEADER BRAND LOCKUP CLEANING / PASS 2.1',
  classification:'CODE HARDENING & SINGLE-AUTHORITY CONSOLIDATION QA',
  head:process.env.GITHUB_SHA||'local',
  status:failures.length?'FAIL':'PASS',
  sourceCases:source.length,
  runtimeCases:widths.length*routes.length,
  savedSessionCases:1,
  failures,
  source,
  runtime
};
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
const summary=[
  '# P-120 WEB — GLOBAL HEADER BRAND LOCKUP CLEANING / PASS 2.1',
  '',
  `STATUS: ${report.status}`,
  `SOURCE ROUTES: ${report.sourceCases}`,
  `RUNTIME ROUTE/VIEWPORT CASES: ${report.runtimeCases}`,
  `SAVED-SESSION IDEMPOTENCY CASES: ${report.savedSessionCases}`,
  `FAILURES: ${failures.length}`,
  '',
  ...failures.map(x=>`- ${x}`)
].join('\n')+'\n';
fs.writeFileSync(path.join(OUT,'summary.md'),summary);
console.log(summary);
if(failures.length)process.exit(1);
