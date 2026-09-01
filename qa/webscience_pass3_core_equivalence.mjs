import {chromium} from 'playwright';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';
import fs from 'fs';
import path from 'path';

const BASE=process.env.P120_QA_BASE||'http://127.0.0.1:4173';
const OUT=process.env.P120_QA_OUT||'qa-artifacts/webscience-pass3';
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
const checks=[];const failures=[];const metrics={};
const check=(ok,msg,detail='')=>{checks.push({status:ok?'PASS':'FAIL',msg,detail});if(!ok)failures.push(detail?`${msg}: ${detail}`:msg);console.log(`${ok?'PASS':'FAIL'} ${msg}${detail?` :: ${detail}`:''}`)};
const browser=await chromium.launch({headless:true});

async function makeContext(s){
  const context=await browser.newContext({viewport:{width:s.width,height:s.height},deviceScaleFactor:1});
  await context.addInitScript(({theme})=>{try{localStorage.setItem('p120_web_theme_v16',theme)}catch(_){}},{theme:s.theme});
  return context;
}

async function stabilize(page){
  await page.waitForSelector('.science-page',{timeout:15000});
  await page.evaluate(async()=>{try{await document.fonts.ready}catch(_){}});
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}html{scroll-behavior:auto!important}'});
  await page.evaluate(()=>{
    const save=document.getElementById('save-status');if(save)save.textContent='saved 00:00';
    document.querySelectorAll('[data-live-time]').forEach(el=>el.textContent='00:00');
    window.scrollTo(0,0);
  });
  await page.waitForTimeout(1500);
}

async function openMode(context,s,enabled){
  const page=await context.newPage();
  const url=BASE+s.route+(enabled?'':'?p120_science_adapter=off');
  const errors=[];
  page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
  page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP ${r.status()} ${r.url()}`)});
  page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  check(!!response&&response.status()<400,`${s.locale} ${s.width} ${s.theme} ${enabled?'ON':'OFF'} HTTP`,String(response?.status()||'none'));
  await stabilize(page);
  if(enabled){
    await page.waitForFunction(()=>window.P120ScienceAtlas?.status?.phase==='ready'||window.P120ScienceAtlas?.status?.phase==='failed',{timeout:15000});
    const status=await page.evaluate(()=>window.P120ScienceAtlas?.status||null);
    check(!!status,`${s.locale} ${s.width} ${s.theme} adapter API exposed`);
    check(status?.pass===true,`${s.locale} ${s.width} ${s.theme} adapter Core contract PASS`,JSON.stringify(status?.errors||[]));
    check(status?.coreSha256===EXPECTED_SHA,`${s.locale} ${s.width} ${s.theme} Core canonical SHA`,String(status?.coreSha256));
    check(JSON.stringify(status?.counts)===JSON.stringify(EXPECTED_COUNTS),`${s.locale} ${s.width} ${s.theme} Core counts exact`,JSON.stringify(status?.counts));
    const api=await page.evaluate(()=>({
      registryState:document.documentElement.dataset.p120ScienceRegistry||'',
      atlasState:document.documentElement.dataset.p120ScienceAtlasVisibility||'',
      activeBase:document.documentElement.dataset.p120ScienceActiveBase||'',
      atlasInDom:document.querySelectorAll('[data-science-atlas-selector]').length,
      atlasPreview:window.P120ScienceAtlas.renderScienceAtlas(),
      extendedPreview:window.P120ScienceAtlas.renderScienceBase('EXTENDED'),
      comPreview:window.P120ScienceAtlas.renderScienceModule('COM-12'),
      dyadicVisibility:window.P120ScienceAtlas.getBase('DYADIC')?.public_visibility||null,
      refsRendered:(window.P120ScienceAtlas.renderScienceLibrary({}).match(/data-science-registry-ref=/g)||[]).length
    }));
    check(api.registryState==='pass3-core-equivalent',`${s.locale} ${s.width} ${s.theme} registry state marker`,api.registryState);
    check(api.atlasState==='disabled-pass3',`${s.locale} ${s.width} ${s.theme} Atlas visually disabled`,api.atlasState);
    check(api.activeBase==='CORE',`${s.locale} ${s.width} ${s.theme} one active base = CORE`,api.activeBase);
    check(api.atlasInDom===0,`${s.locale} ${s.width} ${s.theme} no visible/injected Atlas control`,String(api.atlasInDom));
    check(/hidden/.test(api.atlasPreview)&&!/DYADIC/.test(api.atlasPreview),`${s.locale} ${s.width} ${s.theme} Atlas preview is hidden and excludes DYADIC`);
    check(/COM-12/.test(api.comPreview)&&/summary_only/.test(api.comPreview),`${s.locale} ${s.width} ${s.theme} COM preview respects summary_only`);
    check(/data-science-base-preview="EXTENDED"/.test(api.extendedPreview)&&/hidden/.test(api.extendedPreview),`${s.locale} ${s.width} ${s.theme} Extended prepared but hidden`);
    check(api.dyadicVisibility==='hidden',`${s.locale} ${s.width} ${s.theme} DYADIC hidden`,String(api.dyadicVisibility));
    check(api.refsRendered===45,`${s.locale} ${s.width} ${s.theme} library renderer preserves 45 refs`,String(api.refsRendered));
  }else{
    const off=await page.evaluate(()=>document.documentElement.dataset.p120ScienceRegistry||'');
    check(off==='adapter-off',`${s.locale} ${s.width} ${s.theme} OFF control works`,off);
  }
  const structural=await page.evaluate(()=>({
    html:document.querySelector('.science-page')?.outerHTML||'',
    components:{hero:document.querySelectorAll('.science-hero').length,status:document.querySelectorAll('.science-status').length,doc:document.querySelectorAll('.science-doc-card').length,metrics:document.querySelectorAll('.science-metrics').length,subnav:document.querySelectorAll('.science-subnav').length},
    anchors:['science-layers','science-constructs','science-evidence','science-validation','science-ethics','science-refs'].map(id=>[id,!!document.getElementById(id)]),
    h1:document.querySelector('.science-page h1')?.textContent.trim()||'',
    pdf:document.querySelector('a[href*="scientific-concept-paper"]')?.getAttribute('href')||''
  }));
  check(Object.values(structural.components).every(v=>v===1),`${s.locale} ${s.width} ${s.theme} stable shell components`,JSON.stringify(structural.components));
  check(structural.anchors.every(x=>x[1]),`${s.locale} ${s.width} ${s.theme} legacy anchors preserved`,JSON.stringify(structural.anchors));
  if(s.locale==='ru')check(structural.pdf.includes('p120-scientific-concept-paper-v1.2.pdf'),`${s.locale} ${s.width} ${s.theme} RU PDF v1.2`,structural.pdf);
  else check(structural.pdf.includes('p120-scientific-concept-paper-en-v1.2.pdf'),`${s.locale} ${s.width} ${s.theme} EN PDF v1.2`,structural.pdf);
  return {page,structural,errors};
}

function comparePng(aBuf,bBuf,outFile){
  const a=PNG.sync.read(aBuf),b=PNG.sync.read(bBuf);
  if(a.width!==b.width||a.height!==b.height)return {ratio:1,diffPixels:a.width*a.height};
  const diff=new PNG({width:a.width,height:a.height});
  const diffPixels=pixelmatch(a.data,b.data,diff.data,a.width,a.height,{threshold:0.1,includeAA:true});
  fs.writeFileSync(outFile,PNG.sync.write(diff));
  return {ratio:diffPixels/(a.width*a.height),diffPixels};
}

for(const s of scenarios){
  const context=await makeContext(s);
  const off=await openMode(context,s,false);
  const offPng=await off.page.locator('.science-page').screenshot();
  const on=await openMode(context,s,true);
  const onPng=await on.page.locator('.science-page').screenshot();
  const key=`${s.locale}-${s.width}-${s.theme}`;
  fs.writeFileSync(path.join(OUT,`${key}-off.png`),offPng);
  fs.writeFileSync(path.join(OUT,`${key}-on.png`),onPng);
  const diff=comparePng(offPng,onPng,path.join(OUT,`${key}-diff.png`));
  metrics[key]={pixelDiffRatio:diff.ratio,diffPixels:diff.diffPixels};
  check(diff.ratio<=0.0015,`${key} Scientific Base visual regression <= 0.15%`,`${(diff.ratio*100).toFixed(6)}% (${diff.diffPixels}px)`);
  check(off.structural.html===on.structural.html,`${key} .science-page DOM unchanged`);
  const offErrors=[...new Set(off.errors)].sort();const onErrors=[...new Set(on.errors)].sort();
  check(JSON.stringify(onErrors)===JSON.stringify(offErrors),`${key} adapter introduces no new console/HTTP errors`,JSON.stringify({baseline:offErrors,adapter:onErrors}));
  await off.page.close();await on.page.close();await context.close();
}

await browser.close();
const report={document:'P120 WEB-SCIENCE EXT PASS 3 Core Equivalence QA',generated_at:new Date().toISOString(),base:BASE,expected_sha256:EXPECTED_SHA,scenarios,metrics,totals:{checks:checks.length,pass:checks.filter(x=>x.status==='PASS').length,fail:failures.length},failures,checks};
fs.writeFileSync(path.join(OUT,'PASS3_QA.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(OUT,'PASS3_QA.txt'),checks.map(c=>`${c.status} ${c.msg}${c.detail?` :: ${c.detail}`:''}`).join('\n')+`\n\n${failures.length?'FAIL':'PASS'} ${failures.length}\n`);
console.log(`WEB-SCIENCE PASS3 QA checks=${checks.length} failures=${failures.length}`);
if(failures.length)process.exit(1);
