import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/*
 P-120 WEB — GLOBAL HEADER BRAND LOCKUP CLEANING / PASS 2
 TECHNICAL / CODE INTEGRITY AUDIT ONLY.
 No production DOM/CSS/JS mutation. The script inventories the current source graph
 and verifies the rendered header lifecycle on representative RU/EN public routes.
*/

const BASE=process.env.P120_QA_BASE||'http://127.0.0.1:4173';
const OUT='qa-artifacts/header-code-pass2';
const ROOT=process.cwd();
const widths=[390,1440];
const routes=['/','/extended/','/together/','/creator/','/why-p120/','/science/','/en/','/en/why-p120/'];
const skipDirs=new Set(['.git','node_modules','qa-artifacts']);
const sourceExt=new Set(['.html','.css','.js','.mjs']);
fs.mkdirSync(OUT,{recursive:true});

function walk(dir){
  const out=[];
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(skipDirs.has(ent.name)) continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) out.push(...walk(p));
    else if(sourceExt.has(path.extname(ent.name))) out.push(p);
  }
  return out;
}
function rel(p){return path.relative(ROOT,p).replaceAll('\\','/');}
function lineAt(text,index){return text.slice(0,index).split('\n').length;}
function collect(text,re){
  const rows=[];
  re.lastIndex=0;
  let m;
  while((m=re.exec(text))){
    rows.push({line:lineAt(text,m.index),match:m[0].replace(/\s+/g,' ').slice(0,220)});
    if(m.index===re.lastIndex)re.lastIndex++;
  }
  return rows;
}

const files=walk(ROOT);
const inventory={
  scannedFiles:files.length,
  brandMarkRules:[],
  brandMarkHideRules:[],
  brandSubHideRules:[],
  brandRuntimeRefs:[],
  brandCssRefs:[],
  brandReadyRefs:[],
  mutationObservers:[],
  runtimeInnerHtmlWrites:[]
};
for(const file of files){
  const text=fs.readFileSync(file,'utf8');
  const name=rel(file);
  const push=(key,re)=>{
    const found=collect(text,re);
    if(found.length)inventory[key].push({file:name,occurrences:found});
  };
  push('brandMarkRules',/\.brand-mark[^,{]*\{[^}]*\}/gms);
  push('brandMarkHideRules',/\.brand-mark[^,{]*\{[^}]*display\s*:\s*none(?:\s*!important)?[^}]*\}/gms);
  push('brandSubHideRules',/\.brand-sub[^,{]*\{[^}]*display\s*:\s*none(?:\s*!important)?[^}]*\}/gms);
  push('brandRuntimeRefs',/p120-brand-system-v1\.0\.js(?:\?[^'\"\s<)]*)?/g);
  push('brandCssRefs',/p120-brand-system-v1\.0\.css(?:\?[^'\"\s<)]*)?/g);
  push('brandReadyRefs',/p120-brand53-ready/g);
  push('mutationObservers',/new\s+MutationObserver\s*\(/g);
  if(name==='p120-brand-system-v1.0.js'){
    push('runtimeInnerHtmlWrites',/(?:\.innerHTML\s*=|replaceChildren\s*\()/g);
  }
}

const canonicalCss=fs.readFileSync(path.join(ROOT,'p120-brand-system-v1.0.css'),'utf8');
const canonicalJs=fs.readFileSync(path.join(ROOT,'p120-brand-system-v1.0.js'),'utf8');
const canonicalChecks={
  canonicalCssHasMobileBrandHide:/\.brand-mark[^,{]*\{[^}]*display\s*:\s*none/gms.test(canonicalCss),
  canonicalBrandMarkup:canonicalJs.includes('function brandMarkup()')&&canonicalJs.includes('brand-orbit')&&canonicalJs.includes('brand-node-a')&&canonicalJs.includes('brand-node-b'),
  patchBrandGuard:canonicalJs.includes("node.dataset.p120CanonicalBrand==='5.3'"),
  globalRuntimeGuard:canonicalJs.includes("window.P120_BRAND_SYSTEM?.version === '5.3'"),
  cssLoadedFromRuntime:canonicalJs.includes("function ensureCss()")&&canonicalJs.includes("p120-brand-system-v1.0.css?v=53"),
  cssStartDeferredToDomContentLoaded:canonicalJs.includes("document.addEventListener('DOMContentLoaded',start,{once:true})"),
  broadBodyMutationObserver:canonicalJs.includes("observe(document.body,{childList:true,subtree:true})"),
  resumeRailUnconditionalInnerHtml:/function patchResumeRail\([\s\S]*?info\.innerHTML\s*=/.test(canonicalJs)
};

const browser=await chromium.launch({headless:true});
const runtime=[];
const blocking=[];

function visibleSnapshot(s){return s.display!=='none'&&s.visibility!=='hidden'&&s.width>0&&s.height>0;}

for(const width of widths){
  for(const route of routes){
    const context=await browser.newContext({viewport:{width,height:900}});
    const page=await context.newPage();
    const errors=[];
    page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
    page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));

    await page.addInitScript(()=>{
      window.__p120Pass2={timeline:[],moCreated:0,moCallbacks:0,started:performance.now()};
      const NativeMO=window.MutationObserver;
      window.MutationObserver=class P120AuditMutationObserver extends NativeMO{
        constructor(cb){
          window.__p120Pass2.moCreated++;
          super((...args)=>{window.__p120Pass2.moCallbacks++;return cb(...args)});
        }
      };
      const sample=()=>{
        const candidates=[...document.querySelectorAll('.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand')];
        const marks=[...document.querySelectorAll('.brand-mark')];
        const state=marks.map(mark=>{
          const cs=getComputedStyle(mark);const r=mark.getBoundingClientRect();
          return {display:cs.display,visibility:cs.visibility,width:r.width,height:r.height};
        });
        window.__p120Pass2.timeline.push({
          t:Math.round(performance.now()-window.__p120Pass2.started),
          ready:document.documentElement.classList.contains('p120-brand53-ready'),
          hostCount:candidates.length,
          markCount:marks.length,
          visibleMarks:state.filter(s=>s.display!=='none'&&s.visibility!=='hidden'&&s.width>0&&s.height>0).length,
          state
        });
        if(performance.now()-window.__p120Pass2.started<1800)requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });

    const response=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForSelector('html[data-p120-brand-system="5.3"]',{timeout:15000});
    await page.waitForTimeout(900);

    const data=await page.evaluate(()=>{
      const vis=el=>{
        if(!el)return false;const cs=getComputedStyle(el),r=el.getBoundingClientRect();
        return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0;
      };
      const headerSelectors='.topbar,.explore-topbar,.creator-topbar,.wp-header,.p120-brand53-header';
      const hostSelectors='.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand';
      const timeline=window.__p120Pass2.timeline||[];
      const firstWithMark=timeline.findIndex(x=>x.markCount>0);
      const firstVisible=timeline.findIndex(x=>x.visibleMarks>0);
      const firstReady=timeline.findIndex(x=>x.ready);
      const visibleThenHidden=[];
      let seen=false;
      for(const x of timeline){
        if(x.visibleMarks>0)seen=true;
        if(seen&&x.markCount>0&&x.visibleMarks===0)visibleThenHidden.push(x);
      }
      const visibleThenDuplicate=timeline.filter(x=>x.visibleMarks>1);
      const brandLinks=[...document.querySelectorAll('link[data-p120-brand-system]')].map(x=>x.href);
      const correctionLinks=[...document.querySelectorAll('link[data-p120-pass53-visual-corrections]')].map(x=>x.href);
      const brandScripts=[...document.querySelectorAll('script[src*="p120-brand-system-v1.0.js"]')].map(x=>x.src);
      const hosts=[...document.querySelectorAll(hostSelectors)];
      const marks=[...document.querySelectorAll('.brand-mark')];
      const descriptors=[...document.querySelectorAll('.brand-sub')];
      const languageControls=[...document.querySelectorAll('.p120-brand53-language,.explore-lang-switch,.creator-language,.wp-lang-switch,.p120-language-switch')];
      const themeControls=[...document.querySelectorAll('.p120-brand53-theme,.explore-theme-menu,.header-theme-menu,.wp-theme')];
      return {
        runtime:document.documentElement.dataset.p120BrandSystem||'',
        pageKind:document.documentElement.dataset.p120PageKind||'',
        brandLinks,correctionLinks,brandScripts,
        headersTotal:document.querySelectorAll(headerSelectors).length,
        headersVisible:[...document.querySelectorAll(headerSelectors)].filter(vis).length,
        hostsTotal:hosts.length,hostsVisible:hosts.filter(vis).length,
        marksTotal:marks.length,marksVisible:marks.filter(vis).length,
        canonicalHosts:document.querySelectorAll('[data-p120-canonical-brand="5.3"]').length,
        descriptors:descriptors.map(x=>({text:x.textContent.trim(),visible:vis(x)})),
        visibleLanguageControls:languageControls.filter(vis).length,
        visibleThemeControls:themeControls.filter(vis).length,
        timelineCount:timeline.length,firstWithMark,firstVisible,firstReady,
        initialMarkHidden:firstWithMark>=0&&firstVisible>firstWithMark,
        visibleThenHidden:visibleThenHidden.slice(0,8),
        visibleThenDuplicate:visibleThenDuplicate.slice(0,8),
        moCreated:window.__p120Pass2.moCreated,
        moCallbacks:window.__p120Pass2.moCallbacks
      };
    });

    const row={width,route,http:response?.status()||0,errors,data};
    runtime.push(row);
    const prefix=`${width} ${route}`;
    if(!response||response.status()>=400)blocking.push(`${prefix}: HTTP ${response?.status()||'none'}`);
    if(data.runtime!=='5.3')blocking.push(`${prefix}: brand runtime not active`);
    if(data.brandLinks.length!==1)blocking.push(`${prefix}: canonical brand CSS link count ${data.brandLinks.length}`);
    if(data.brandScripts.length!==1)blocking.push(`${prefix}: brand runtime script count ${data.brandScripts.length}`);
    if(data.headersVisible!==1)blocking.push(`${prefix}: visible header count ${data.headersVisible}`);
    if(data.marksVisible!==1)blocking.push(`${prefix}: final visible mark count ${data.marksVisible}`);
    if(data.visibleThenHidden.length)blocking.push(`${prefix}: visible-to-hidden mark transition detected`);
    if(data.visibleThenDuplicate.length)blocking.push(`${prefix}: duplicate visible mark detected`);
    if(errors.length)blocking.push(`${prefix}: ${errors.join(' | ')}`);
    await context.close();
  }
}
await browser.close();

const notes=[];
if(inventory.brandMarkHideRules.length){
  notes.push({id:'P2-N01',severity:'MEDIUM',title:'Legacy .brand-mark hide rules remain outside canonical CSS',detail:`${inventory.brandMarkHideRules.length} source file(s) contain a .brand-mark display:none rule. They are currently overridden by the canonical ready-state cascade but preserve a competing responsive authority.`});
}
if(canonicalChecks.cssLoadedFromRuntime&&canonicalChecks.cssStartDeferredToDomContentLoaded){
  notes.push({id:'P2-N02',severity:'MEDIUM',title:'Canonical brand CSS is runtime-injected after DOM readiness',detail:'The shared stylesheet is installed inside start(), while start() is deferred to DOMContentLoaded when the script is parsed during loading. This leaves an avoidable pre-canonical paint window and makes first-paint stability dependent on legacy page CSS.'});
}
if(canonicalChecks.broadBodyMutationObserver&&canonicalChecks.resumeRailUnconditionalInnerHtml){
  notes.push({id:'P2-N03',severity:'MEDIUM',title:'Broad reconciliation observer can be retriggered by unconditional resume-rail DOM writes',detail:'The brand runtime observes body childList/subtree and patchResumeRail assigns info.innerHTML whenever a saved session is available. The pattern is not header-specific and should be made value-idempotent before the shared runtime is declared code-frozen.'});
}
const initiallyHidden=runtime.filter(x=>x.data.initialMarkHidden);
if(initiallyHidden.length){
  notes.push({id:'P2-N04',severity:'LOW',title:'Some routes expose a hidden-before-visible mark phase',detail:`Observed in ${initiallyHidden.length}/${runtime.length} audited route/viewport cases. PASS 1 correctly prevents visible→hidden regression, but the lifecycle gate should also constrain hidden→visible first-paint transitions.`});
}
const multiVisibleControls=runtime.filter(x=>x.data.visibleLanguageControls>1||x.data.visibleThemeControls>1);
if(multiVisibleControls.length){
  notes.push({id:'P2-N05',severity:'LOW',title:'More than one visible utility-control family exists in some rendered headers',detail:`Observed in ${multiVisibleControls.length}/${runtime.length} audited cases; review whether each is intentional (main-page native controls vs canonical static-page controls).`});
}

const status=blocking.length?'HOLD':'PASS_WITH_HARDENING_NOTES';
const report={
  document:'P-120 WEB — GLOBAL HEADER BRAND LOCKUP CLEANING / PASS 2',
  classification:'TECHNICAL / CODE INTEGRITY AUDIT ONLY',
  baseline:process.env.GITHUB_SHA||'local',
  status,
  blocking,
  notes,
  canonicalChecks,
  inventory,
  runtime
};
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));

const lines=[];
lines.push(`# P-120 WEB — GLOBAL HEADER BRAND LOCKUP CLEANING / PASS 2`);
lines.push('');
lines.push(`STATUS: ${status}`);
lines.push(`BLOCKING FINDINGS: ${blocking.length}`);
lines.push(`HARDENING NOTES: ${notes.length}`);
lines.push(`SOURCE FILES SCANNED: ${inventory.scannedFiles}`);
lines.push(`RUNTIME CASES: ${runtime.length}`);
lines.push(`LEGACY BRAND-MARK HIDE FILES: ${inventory.brandMarkHideRules.length}`);
lines.push(`INITIAL HIDDEN→VISIBLE CASES: ${initiallyHidden.length}`);
lines.push('');
for(const n of notes)lines.push(`- ${n.id} / ${n.severity} — ${n.title}: ${n.detail}`);
if(blocking.length){lines.push('');for(const b of blocking)lines.push(`- BLOCKER — ${b}`)}
fs.writeFileSync(path.join(OUT,'summary.md'),lines.join('\n')+'\n');

console.log(lines.join('\n'));
if(blocking.length)process.exit(1);
