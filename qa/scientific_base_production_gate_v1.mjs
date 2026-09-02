import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ORIGIN='http://127.0.0.1:4179';
const OUT='qa-evidence-science-production-v1';
const SHOTS=path.join(OUT,'screenshots');
await mkdir(SHOTS,{recursive:true});

const checks=[];
const failures=[];
function check(id,pass,detail={}){const row={id,pass:Boolean(pass),...detail};checks.push(row);if(!pass)failures.push(row);return pass;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const SENTINELS={
  legacy:'{"sentinel":"legacy-preserve","responses":{"SAT01":"4"}}',
  ru:'{"sentinel":"ru-session-preserve","responses":{"SAT02":"5"}}',
  en:'{"sentinel":"en-session-preserve","responses":{"SAT02":"2"}}'
};
const baseStates=['CORE','EXTENDED','OUTCOMES','METHODS','LIBRARY'];
const viewports={desktop:{width:1440,height:1000},mobile:{width:390,height:844}};

async function seedContext(browser,viewport){
  const context=await browser.newContext({viewport});
  await context.addInitScript(seed=>{
    localStorage.setItem('p120_web_prototype_v01',seed.legacy);
    localStorage.setItem('p120_runtime_session_ru_v1',seed.ru);
    localStorage.setItem('p120_runtime_session_en_v1',seed.en);
    localStorage.removeItem('p120_science_page_state_ru_v1');
    localStorage.removeItem('p120_science_page_state_en_v1');
  },SENTINELS);
  return context;
}

async function waitRuntime(page,label){
  try{
    await page.waitForFunction(()=>document.documentElement.dataset.p120ScientificBaseStatus==='pass'&&window.P120ScientificBase?.status?.pass===true,null,{timeout:12000});
    check(`${label}: Scientific Base runtime ready`,true);
    return true;
  }catch(error){
    const diag=await page.evaluate(()=>({dataset:{...document.documentElement.dataset},api:window.P120ScientificBase?.status||null})).catch(()=>null);
    check(`${label}: Scientific Base runtime ready`,false,{error:String(error),diag});
    return false;
  }
}

async function scrollPage(page){
  await page.evaluate(async()=>{
    const root=document.scrollingElement||document.documentElement;
    const max=Math.max(0,root.scrollHeight-innerHeight);
    const step=Math.max(420,Math.floor(innerHeight*.72));
    for(let y=0;y<=max;y+=step){scrollTo(0,y);await new Promise(r=>setTimeout(r,70));}
    scrollTo(0,0);
  });
  await sleep(120);
}

async function storageSnapshot(page){
  return page.evaluate(()=>({
    legacy:localStorage.getItem('p120_web_prototype_v01'),
    ru:localStorage.getItem('p120_runtime_session_ru_v1'),
    en:localStorage.getItem('p120_runtime_session_en_v1'),
    scienceRu:localStorage.getItem('p120_science_page_state_ru_v1'),
    scienceEn:localStorage.getItem('p120_science_page_state_en_v1')
  }));
}

async function selectBase(page,base){
  if(base==='CORE'){
    await page.evaluate(()=>window.P120ScientificBase?.setBase('CORE'));
  }else{
    const button=page.locator(`[data-p120-science-base="${base}"]`);
    await button.waitFor({state:'visible',timeout:5000});
    await button.click();
  }
  await page.waitForFunction(expected=>document.documentElement.dataset.p120ScienceActiveBase===expected,base,{timeout:5000});
  await sleep(120);
}

async function verifyBase(page,locale,viewportName,base){
  const label=`${locale.toUpperCase()} ${viewportName} ${base}`;
  const active=await page.evaluate(()=>window.P120ScientificBase?.activeBaseId||null);
  check(`${label}: active base`,active===base,{active});
  const atlasVisible=await page.locator('#p120-science-atlas').isVisible().catch(()=>false);
  check(`${label}: Atlas visible`,atlasVisible);
  const dyadicCount=await page.locator('[data-p120-science-base="DYADIC"], [data-p120-science-module="DYADIC"]').count();
  check(`${label}: DYADIC absent`,dyadicCount===0,{dyadicCount});

  if(base==='CORE'){
    for(const id of ['science-layers','science-constructs','science-evidence']){
      const visible=await page.locator(`#${id}`).isVisible().catch(()=>false);
      check(`${label}: #${id} visible`,visible);
    }
  }else{
    for(const id of ['science-layers','science-constructs','science-evidence']){
      const hidden=!(await page.locator(`#${id}`).isVisible().catch(()=>false));
      check(`${label}: #${id} suppressed outside CORE`,hidden);
    }
    const panel=await page.locator('#p120-science-active-base').isVisible().catch(()=>false);
    check(`${label}: active-base panel visible`,panel);
  }

  if(base==='EXTENDED'){
    for(const id of ['COM-12','MOT-12','SELF-12','RPE-MOD']){
      const visible=await page.locator(`[data-p120-science-module="${id}"]`).isVisible().catch(()=>false);
      check(`${label}: ${id} summary visible`,visible);
    }
    const cards=await page.locator('#p120-science-active-base [data-public-visibility="summary_only"]').count();
    check(`${label}: Extended remains summary-only`,cards===4,{cards});
  }
  if(base==='OUTCOMES'){
    const life=await page.locator('[data-p120-science-module="LIFE-12/18"]').isVisible().catch(()=>false);
    check(`${label}: LIFE-12/18 summary visible`,life);
    const vis=await page.locator('[data-p120-science-module="LIFE-12/18"]').getAttribute('data-public-visibility').catch(()=>null);
    check(`${label}: LIFE publication gate summary-only`,vis==='summary_only',{visibility:vis});
  }
  if(base==='METHODS'){
    const validation=await page.locator('#science-validation').isVisible().catch(()=>false);
    const ethics=await page.locator('#science-ethics').isVisible().catch(()=>false);
    check(`${label}: shared validation retained`,validation);
    check(`${label}: shared ethics retained`,ethics);
  }
  if(base==='LIBRARY'){
    const refs=await page.locator('#science-refs').count();
    check(`${label}: shared literature anchor retained`,refs===1,{refs});
  }

  const geom=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  check(`${label}: no horizontal overflow`,geom.scrollWidth-geom.clientWidth<=1,{...geom,overflow:geom.scrollWidth-geom.clientWidth});
  await scrollPage(page);
  await page.screenshot({path:path.join(SHOTS,`${locale}-${viewportName}-${base.toLowerCase()}.png`),fullPage:true});
}

async function verifyAnchorsAndLinks(page,locale){
  const anchors=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(Boolean));
  const broken=[];
  for(const href of new Set(anchors)){
    if(href==='#')continue;
    const id=decodeURIComponent(href.slice(1));
    const exists=await page.evaluate(id=>Boolean(document.getElementById(id)),id);
    if(!exists)broken.push(href);
  }
  check(`${locale.toUpperCase()} anchors: no broken local anchors`,broken.length===0,{broken});

  const urls=await page.evaluate(origin=>[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.href).filter(h=>{
    try{const u=new URL(h);return u.origin===origin&&['http:','https:'].includes(u.protocol);}catch(_){return false;}
  }))],ORIGIN);
  const bad=[];
  for(const url of urls){
    const clean=url.split('#')[0];
    if(!clean)continue;
    const res=await page.request.get(clean,{failOnStatusCode:false,timeout:10000}).catch(error=>({status:()=>0,error:String(error)}));
    const status=res.status();
    if(status>=400||status===0)bad.push({url:clean,status,error:res.error||null});
  }
  check(`${locale.toUpperCase()} links: no broken same-origin targets`,bad.length===0,{checked:urls.length,bad});
}

async function verifyLanguageSwitch(page,locale){
  const target=locale==='ru'?'/en/science/':'/science/';
  const lang=locale==='ru'?'en':'ru';
  const href=await page.locator(`.p120-dedicated-science-lang a[lang="${lang}"]`).getAttribute('href').catch(()=>null);
  let pathname=null;
  if(href){try{pathname=new URL(href,page.url()).pathname}catch(_){}}
  check(`${locale.toUpperCase()} language switch preserves Science route`,Boolean(pathname?.endsWith(target)),{href,pathname,target});
}

async function verifyDeepLink(browser,locale){
  const context=await seedContext(browser,viewports.desktop);
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
  page.on('console',msg=>{if(msg.type()==='error')errors.push(`console: ${msg.text()}`);});
  const prefix=locale==='en'?'/en':'';
  await page.goto(`${ORIGIN}${prefix}/science/?science=extended&module=COM-12`,{waitUntil:'domcontentloaded'});
  const ready=await waitRuntime(page,`${locale.toUpperCase()} deep-link`);
  if(ready){
    const state=await page.evaluate(()=>({base:window.P120ScientificBase.activeBaseId,module:window.P120ScientificBase.activeModuleId,url:location.href}));
    check(`${locale.toUpperCase()} deep-link selects Extended`,state.base==='EXTENDED',{state});
    check(`${locale.toUpperCase()} deep-link selects COM-12`,state.module==='COM-12',{state});
    const highlighted=await page.locator('[data-p120-science-module="COM-12"][data-active-module="true"]').isVisible().catch(()=>false);
    check(`${locale.toUpperCase()} deep-link highlights COM-12`,highlighted);
    await page.evaluate(()=>window.P120ScientificBase.setBase('OUTCOMES'));
    await page.waitForFunction(()=>document.documentElement.dataset.p120ScienceActiveBase==='OUTCOMES');
    await page.goBack({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.p120ScienceActiveBase==='EXTENDED');
    const back=await page.evaluate(()=>({base:window.P120ScientificBase.activeBaseId,module:window.P120ScientificBase.activeModuleId}));
    check(`${locale.toUpperCase()} history restores Extended`,back.base==='EXTENDED',{back});
    check(`${locale.toUpperCase()} history restores COM-12`,back.module==='COM-12',{back});
  }
  check(`${locale.toUpperCase()} deep-link runtime errors`,errors.length===0,{errors});
  await context.close();
}

const browser=await chromium.launch({headless:true});
try{
  for(const locale of ['ru','en']){
    for(const [viewportName,viewport] of Object.entries(viewports)){
      const context=await seedContext(browser,viewport);
      const page=await context.newPage();
      const runtimeErrors=[];
      page.on('pageerror',e=>runtimeErrors.push(`pageerror: ${e.message}`));
      page.on('console',msg=>{if(msg.type()==='error')runtimeErrors.push(`console: ${msg.text()}`);});
      const prefix=locale==='en'?'/en':'';
      await page.goto(`${ORIGIN}${prefix}/science/`,{waitUntil:'domcontentloaded'});
      const ready=await waitRuntime(page,`${locale.toUpperCase()} ${viewportName}`);
      if(ready){
        const registry=await page.evaluate(()=>({
          schema:window.P120ScientificBase.registry?.schema_id,
          defaultBase:window.P120ScientificBase.registry?.default_base_id,
          sessionAccess:window.P120ScientificBase.registry?.session_storage_access,
          measurementMutation:window.P120ScientificBase.registry?.measurement_mutation_allowed,
          scoringMutation:window.P120ScientificBase.registry?.scoring_mutation_allowed,
          refs:window.P120_SCIENCE?.references?.length,
          status:window.P120ScientificBase.status
        }));
        check(`${locale.toUpperCase()} ${viewportName}: registry schema`,registry.schema==='P120-WEBSCI-PRODUCTION-001',{registry});
        check(`${locale.toUpperCase()} ${viewportName}: Core is default`,registry.defaultBase==='CORE',{registry});
        check(`${locale.toUpperCase()} ${viewportName}: session access prohibited`,registry.sessionAccess==='PROHIBITED',{registry});
        check(`${locale.toUpperCase()} ${viewportName}: measurement mutation prohibited`,registry.measurementMutation===false,{registry});
        check(`${locale.toUpperCase()} ${viewportName}: scoring mutation prohibited`,registry.scoringMutation===false,{registry});
        check(`${locale.toUpperCase()} ${viewportName}: 45 Core references`,registry.refs===45,{refs:registry.refs});

        for(const base of baseStates){await selectBase(page,base);await verifyBase(page,locale,viewportName,base);}

        if(locale==='en'){
          await selectBase(page,'CORE');
          const visibleCyrillic=await page.evaluate(()=>{
            const root=document.querySelector('.science-page');
            if(!root)return [];
            const out=[];
            for(const el of root.querySelectorAll('*')){
              const style=getComputedStyle(el);if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0)continue;
              if(el.children.length)continue;
              const text=(el.textContent||'').trim();
              if(/[А-Яа-яЁё]/.test(text))out.push(text);
            }
            return [...new Set(out)].slice(0,30);
          });
          check(`EN ${viewportName}: no visible Cyrillic`,visibleCyrillic.length===0,{visibleCyrillic});
        }

        const after=await storageSnapshot(page);
        check(`${locale.toUpperCase()} ${viewportName}: legacy respondent source unchanged`,after.legacy===SENTINELS.legacy,{after:after.legacy});
        check(`${locale.toUpperCase()} ${viewportName}: RU respondent session unchanged`,after.ru===SENTINELS.ru,{after:after.ru});
        check(`${locale.toUpperCase()} ${viewportName}: EN respondent session unchanged`,after.en===SENTINELS.en,{after:after.en});
        const ownScienceKey=locale==='ru'?after.scienceRu:after.scienceEn;
        check(`${locale.toUpperCase()} ${viewportName}: dedicated Science state isolated`,Boolean(ownScienceKey),{scienceStateKey:locale==='ru'?'p120_science_page_state_ru_v1':'p120_science_page_state_en_v1'});

        await selectBase(page,'CORE');
        await verifyLanguageSwitch(page,locale);
        if(viewportName==='desktop')await verifyAnchorsAndLinks(page,locale);
      }
      const filteredErrors=runtimeErrors.filter(x=>!x.includes('Failed to load resource'));
      check(`${locale.toUpperCase()} ${viewportName}: no runtime/page errors`,filteredErrors.length===0,{errors:filteredErrors,ignoredResourceErrors:runtimeErrors.length-filteredErrors.length});
      await context.close();
    }
    await verifyDeepLink(browser,locale);
  }
} finally {
  await browser.close();
}

const identity={
  ru:['CORE','EXTENDED','OUTCOMES','METHODS','LIBRARY'],
  en:['CORE','EXTENDED','OUTCOMES','METHODS','LIBRARY'],
  modules:['SAT-24','P-72','P-72D','AO-12','SOMA-24','COM-12','MOT-12','SELF-12','RPE-MOD','LIFE-12/18']
};
check('RU/EN Scientific Base identity contract',JSON.stringify(identity.ru)===JSON.stringify(identity.en),identity);

const report={
  document_id:'P120-SCIENCE-PRODUCTION-QA-001',
  version:'1.0',
  date:'2026-09-02',
  scope:'Scientific Base Production Migration / Science QA Gate',
  status:failures.length?'FAIL':'PASS',
  checks_total:checks.length,
  checks_passed:checks.filter(x=>x.pass).length,
  checks_failed:failures.length,
  failures,
  checks,
  evidence:{screenshots:'screenshots/',routes:['/science/','/en/science/'],viewports,baseStates}
};
await writeFile(path.join(OUT,'P120_SCIENCE_PRODUCTION_QA_v1.0.json'),JSON.stringify(report,null,2));
await writeFile(path.join(OUT,'SUMMARY.txt'),`P120 Scientific Base Production QA v1.0\nSTATUS: ${report.status}\nCHECKS: ${report.checks_passed}/${report.checks_total}\nFAILURES: ${report.checks_failed}\n`);
console.log(JSON.stringify(report,null,2));
if(failures.length)process.exit(1);
