import {chromium} from 'playwright';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const BASE=process.env.P120_QA_BASE||'http://127.0.0.1:4173';
const OUT='qa-artifacts/webscience-pass3-reconcile';
const EXPECTED_SHA='93091c0576996867f09690464f1e1f4d2cbfe73bd989efeabeb384134fc36a67';
const EXPECTED_COUNTS={metrics:4,layers:5,p72:12,p72d:10,evidenceMap:14,discriminantBoundaries:10,hypotheses:16,validation:13,ethics:9,limitations:7,internalSources:5,references:45};
const scenarios=[
  {locale:'ru',route:'/science/',width:390,height:844,theme:'graphite'},
  {locale:'ru',route:'/science/',width:1440,height:1000,theme:'museum'},
  {locale:'ru',route:'/science/',width:1920,height:1080,theme:'ivory'},
  {locale:'en',route:'/en/science/',width:390,height:844,theme:'graphite'},
  {locale:'en',route:'/en/science/',width:1440,height:1000,theme:'museum'},
  {locale:'en',route:'/en/science/',width:1920,height:1080,theme:'ivory'}
];
fs.mkdirSync(OUT,{recursive:true});
const results=[];const fail=[];
function check(ok,name,detail=''){results.push({status:ok?'PASS':'FAIL',name,detail});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?` :: ${detail}`:''}`);if(!ok)fail.push(detail?`${name}: ${detail}`:name);}
const browser=await chromium.launch({headless:true});
async function waitStable(page,selector){let last='',same=0;for(let i=0;i<40;i++){const html=await page.locator(selector).evaluate(el=>el.outerHTML);if(html===last)same++;else{same=0;last=html;}if(same>=4)return html;await page.waitForTimeout(200);}return last;}
async function prep(context,s){await context.addInitScript(({theme})=>{try{localStorage.setItem('p120_web_theme_v16',theme)}catch(_){}},{theme:s.theme});const errors=[];const page=await context.newPage();page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(BASE))errors.push(`HTTP${r.status()}:${r.url()}`);});page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errors.push(`console:${m.text()}`);});return{page,errors};}
async function stabilize(page){await page.waitForSelector('.science-page',{timeout:15000});await page.evaluate(async()=>{try{await document.fonts.ready}catch(_){};window.scrollTo(0,0);});await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}html{scroll-behavior:auto!important}'});await waitStable(page,'.science-page');}
function sha(buf){return crypto.createHash('sha256').update(buf).digest('hex');}
function firstDiff(a,b){let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;return {index:i,before:a.slice(Math.max(0,i-100),i+180),after:b.slice(Math.max(0,i-100),i+180)};}

for(const s of scenarios){
  const context=await browser.newContext({viewport:{width:s.width,height:s.height},deviceScaleFactor:1});
  const pattern='**/p120-science-atlas-adapter-v0.3.js*';
  await context.route(pattern,route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* PASS3 QA intercepted baseline */'}));
  const {page,errors}=await prep(context,s);const res=await page.goto(BASE+s.route,{waitUntil:'domcontentloaded',timeout:30000});check(res?.status()===200,`${s.locale}-${s.width} route HTTP 200`,String(res?.status()));
  await stabilize(page);const baselineErrors=[...new Set(errors)];check(baselineErrors.length===0,`${s.locale}-${s.width} local asset/network baseline clean`,JSON.stringify(baselineErrors));
  const beforeDom=await waitStable(page,'.science-page');const beforePng=await page.locator('.science-page').screenshot();
  await page.evaluate(()=>{window.__P120_PASS3_MUTATIONS=[];const root=document.querySelector('.science-page');window.__P120_PASS3_OBSERVER=new MutationObserver(records=>{for(const r of records){const el=r.target.nodeType===1?r.target:r.target.parentElement;window.__P120_PASS3_MUTATIONS.push({type:r.type,attr:r.attributeName||null,tag:el?.tagName||null,id:el?.id||null,cls:el?.className||null,text:r.type==='characterData'?(r.target.data||'').slice(0,120):null});}});window.__P120_PASS3_OBSERVER.observe(root,{subtree:true,childList:true,attributes:true,characterData:true});});
  await context.unroute(pattern);await page.addScriptTag({url:BASE+'/p120-science-atlas-adapter-v0.3.js?qa-reconcile=1'});await page.waitForFunction(()=>window.P120ScienceAtlas?.status?.phase==='ready'||window.P120ScienceAtlas?.status?.phase==='failed',{timeout:15000});await waitStable(page,'.science-page');
  const afterDom=await page.locator('.science-page').evaluate(el=>el.outerHTML);const afterPng=await page.locator('.science-page').screenshot();const mutations=await page.evaluate(()=>{window.__P120_PASS3_OBSERVER?.disconnect();return window.__P120_PASS3_MUTATIONS||[];});const status=await page.evaluate(()=>window.P120ScienceAtlas?.status||null);
  check(status?.pass===true,`${s.locale}-${s.width} Core contract green`,JSON.stringify(status?.errors||[]));check(status?.coreSha256===EXPECTED_SHA,`${s.locale}-${s.width} Core canonical SHA`,String(status?.coreSha256));check(JSON.stringify(status?.counts)===JSON.stringify(EXPECTED_COUNTS),`${s.locale}-${s.width} Core counts exact`,JSON.stringify(status?.counts));
  const domSame=beforeDom===afterDom;const diff=domSame?null:firstDiff(beforeDom,afterDom);check(domSame,`${s.locale}-${s.width} same-page .science-page DOM unchanged`,domSame?'':JSON.stringify({diff,mutations:mutations.slice(0,12)}));
  check(sha(beforePng)===sha(afterPng),`${s.locale}-${s.width} same-page visual pixels unchanged`,`${sha(beforePng).slice(0,12)} / ${sha(afterPng).slice(0,12)}`);
  const api=await page.evaluate(()=>({registry:document.documentElement.dataset.p120ScienceRegistry,atlas:document.documentElement.dataset.p120ScienceAtlasVisibility,active:document.documentElement.dataset.p120ScienceActiveBase,atlasDom:document.querySelectorAll('[data-science-atlas-selector]').length,refs:(window.P120ScienceAtlas.renderScienceLibrary({}).match(/data-science-registry-ref=/g)||[]).length,com:window.P120ScienceAtlas.renderScienceModule('COM-12'),dyadic:window.P120ScienceAtlas.getBase('DYADIC')?.public_visibility,pdf:document.querySelector('a[href*="scientific-concept-paper"]')?.getAttribute('href')||'',anchors:['science-layers','science-constructs','science-evidence','science-validation','science-ethics','science-refs'].every(id=>!!document.getElementById(id))}));
  check(api.registry==='pass3-core-equivalent',`${s.locale}-${s.width} registry marker`,String(api.registry));check(api.atlas==='disabled-pass3'&&api.active==='CORE'&&api.atlasDom===0,`${s.locale}-${s.width} Atlas not publicly activated`);check(api.refs===45,`${s.locale}-${s.width} library 45 refs`,String(api.refs));check(/COM-12/.test(api.com)&&!/<p><\/p>/.test(api.com),`${s.locale}-${s.width} localized public module summary non-empty`);check(api.dyadic==='hidden',`${s.locale}-${s.width} DYADIC hidden`,String(api.dyadic));check(api.anchors,`${s.locale}-${s.width} legacy anchors intact`);check(s.locale==='ru'?api.pdf.includes('p120-scientific-concept-paper-v1.2.pdf'):api.pdf.includes('p120-scientific-concept-paper-en-v1.2.pdf'),`${s.locale}-${s.width} locale PDF v1.2`,api.pdf);
  const afterErrors=[...new Set(errors)];check(afterErrors.length===0,`${s.locale}-${s.width} adapter introduces no local errors`,JSON.stringify(afterErrors));
  const key=`${s.locale}-${s.width}-${s.theme}`;fs.writeFileSync(path.join(OUT,`${key}-before.png`),beforePng);fs.writeFileSync(path.join(OUT,`${key}-after.png`),afterPng);fs.writeFileSync(path.join(OUT,`${key}-before.html`),beforeDom);fs.writeFileSync(path.join(OUT,`${key}-after.html`),afterDom);fs.writeFileSync(path.join(OUT,`${key}-mutations.json`),JSON.stringify(mutations,null,2));await page.close();await context.close();
}
for(const route of ['/','/en/','/system/','/en/system/']){const context=await browser.newContext({viewport:{width:1280,height:800}});const page=await context.newPage();const res=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});check(res?.status()===200,`${route} smoke HTTP 200`,String(res?.status()));await page.waitForTimeout(700);check(await page.evaluate(()=>!window.P120ScienceAtlas),`${route} no Science Atlas runtime leakage`);await context.close();}
await browser.close();const report={document:'WEB-SCIENCE EXT PASS 3 Reconciliation QA',generated_at:new Date().toISOString(),expected_core_sha:EXPECTED_SHA,checks:results.length,failures:fail.length,results,fail};fs.writeFileSync(path.join(OUT,'PASS3_RECONCILE_QA.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(OUT,'PASS3_RECONCILE_QA.txt'),results.map(x=>`${x.status} ${x.name}${x.detail?` :: ${x.detail}`:''}`).join('\n')+`\n\n${fail.length?'FAIL':'PASS'} failures=${fail.length}\n`);console.log(`WEB-SCIENCE PASS3 RECONCILE checks=${results.length} failures=${fail.length}`);if(fail.length)process.exit(1);
