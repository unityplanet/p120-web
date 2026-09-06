import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE=(process.env.P120_PRODUCTION_BASE||'https://unityplanet.github.io/p120-web/').replace(/\/?$/,'/');
const OUT='qa-evidence-webscience-prod-g1-live';
fs.mkdirSync(OUT,{recursive:true});
const cases=[
  {locale:'RU',route:'science/',width:1440,height:1000},
  {locale:'RU',route:'science/',width:390,height:844},
  {locale:'EN',route:'en/science/',width:1440,height:1000},
  {locale:'EN',route:'en/science/',width:390,height:844},
];
const checks=[];const failures=[];
function ck(id,pass,detail={}){const r={id,pass:Boolean(pass),...detail};checks.push(r);if(!r.pass)failures.push(r);}
async function waitBase(page){
  await page.waitForFunction(()=>document.documentElement.dataset.p120ScientificBaseStatus==='pass'&&window.P120ScientificBase?.status?.pass===true,null,{timeout:20000});
}
async function selectBase(page,id){
  await page.evaluate(id=>window.P120ScientificBase.setBase(id),id);
  await page.waitForFunction(id=>window.P120ScientificBase?.activeBaseId===id,id,{timeout:10000});
  await page.waitForTimeout(120);
}

const browser=await chromium.launch({headless:true});
try{
  for(const c of cases){
    const ctx=await browser.newContext({viewport:{width:c.width,height:c.height}});
    await ctx.addInitScript(()=>{
      localStorage.setItem('__p120_live_local','LIVE_LOCAL');
      sessionStorage.setItem('__p120_live_session','LIVE_SESSION');
    });
    const page=await ctx.newPage();
    const errors=[];const failedRequests=[];const responses=[];
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('requestfailed',r=>failedRequests.push({url:r.url(),failure:r.failure()?.errorText||''}));
    page.on('response',r=>{if(r.url().includes('/p120-web/'))responses.push({url:r.url(),status:r.status()});});
    const url=BASE+c.route;
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>null);
    const tag=`${c.locale}-${c.width}`;
    ck(`${tag}: live document HTTP success`,!!response&&response.status()>=200&&response.status()<400,{status:response?.status()??null,url});
    let ready=true;
    try{await waitBase(page);}catch(e){ready=false;}
    const snap=await page.evaluate(()=>({
      baseStatus:window.P120ScientificBase?.status||null,
      activeBase:window.P120ScientificBase?.activeBaseId||null,
      registry:window.P120ScientificBase?.registry||null,
      coreRefs:window.P120_SCIENCE?.references?.length??null,
      scripts:[...document.scripts].map(s=>s.src).filter(Boolean),
      styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.href).filter(Boolean),
      width:[document.documentElement.scrollWidth,document.documentElement.clientWidth],
      storage:[localStorage.getItem('__p120_live_local'),sessionStorage.getItem('__p120_live_session')]
    }));
    ck(`${tag}: Scientific Base ready`,ready&&snap.baseStatus?.pass===true,{status:snap.baseStatus});
    ck(`${tag}: Core default active`,snap.activeBase==='CORE',{activeBase:snap.activeBase});
    ck(`${tag}: Core45 retained`,snap.coreRefs===45,{coreRefs:snap.coreRefs});
    ck(`${tag}: registry measurement/scoring/session boundaries`,snap.registry?.measurement_mutation_allowed===false&&snap.registry?.scoring_mutation_allowed===false&&snap.registry?.session_storage_access==='PROHIBITED',{registry:snap.registry});
    ck(`${tag}: storage sentinel isolation`,snap.storage[0]==='LIVE_LOCAL'&&snap.storage[1]==='LIVE_SESSION',{storage:snap.storage});
    ck(`${tag}: no horizontal document overflow`,snap.width[0]-snap.width[1]<=1,{scrollWidth:snap.width[0],clientWidth:snap.width[1]});
    const projectResources=[...snap.scripts,...snap.styles].filter(u=>u.includes('unityplanet.github.io'));
    ck(`${tag}: project scripts/styles stay inside /p120-web/`,projectResources.every(u=>u.startsWith('https://unityplanet.github.io/p120-web/')),{resources:projectResources});
    ck(`${tag}: Scientific Base runtime loaded`,snap.scripts.some(u=>u.includes('/p120-web/p120-scientific-base-runtime-v1.0.js')));
    ck(`${tag}: PASS4B renderer loaded`,snap.scripts.some(u=>u.includes('/p120-web/p120-webscience-pass4b-renderer-v0.6.js')));
    ck(`${tag}: PASS4C library runtime loaded`,snap.scripts.some(u=>u.includes('/p120-web/p120-webscience-pass4c-library-v0.7.js')));
    ck(`${tag}: PASS4E visual CSS loaded`,snap.styles.some(u=>u.includes('/p120-web/p120-webscience-pass4e-visual-v0.9.css')));
    ck(`${tag}: no page errors`,errors.length===0,{errors});
    ck(`${tag}: no failed project requests`,failedRequests.filter(x=>x.url.includes('/p120-web/')).length===0,{failedRequests});
    ck(`${tag}: all project responses successful`,responses.filter(x=>x.status>=400).length===0,{bad:responses.filter(x=>x.status>=400)});

    if(ready){
      const dyadic=await page.locator('[data-p120-science-base="DYADIC"], [data-p120-science-module="DYADIC"]').count();
      ck(`${tag}: DYADIC control/module absent`,dyadic===0,{dyadic});

      await selectBase(page,'EXTENDED');
      for(const id of ['COM-12','MOT-12','SELF-12','RPE-MOD']){
        const visible=await page.locator(`[data-p120-science-module="${id}"]`).isVisible().catch(()=>false);
        ck(`${tag}: ${id} summary visible in EXTENDED`,visible);
      }
      const extSummary=await page.locator('#p120-science-active-base [data-public-visibility="summary_only"]').count();
      ck(`${tag}: Extended exactly four summary-only modules`,extSummary===4,{count:extSummary});

      await selectBase(page,'OUTCOMES');
      const life=page.locator('[data-p120-science-module="LIFE-12/18"]');
      ck(`${tag}: LIFE-12/18 visible in OUTCOMES`,await life.isVisible().catch(()=>false));
      ck(`${tag}: LIFE-12/18 remains summary-only`,await life.getAttribute('data-public-visibility').catch(()=>null)==='summary_only');

      await selectBase(page,'METHODS');
      ck(`${tag}: validation remains visible in METHODS`,await page.locator('#science-validation').isVisible().catch(()=>false));
      ck(`${tag}: ethics remains visible in METHODS`,await page.locator('#science-ethics').isVisible().catch(()=>false));

      await selectBase(page,'LIBRARY');
      await page.waitForFunction(()=>window.P120ScienceGlobalLibrary?.status?.pass===true&&document.querySelector('[data-p120-pass4c-library="integrated-v0.7"]'),null,{timeout:15000});
      const lib=await page.evaluate(()=>({
        global:window.P120ScienceGlobalLibrary?.library?.references?.length,
        domAll:document.querySelectorAll('[data-p120-global-reference]').length,
        domCore:document.querySelectorAll('[data-p120-global-reference][data-source-layer="CORE45"]').length,
        domExt:document.querySelectorAll('[data-p120-global-reference][data-source-layer="PASS4_EXTENSION"]').length,
        renderer:window.P120SciencePublicationRenderer?.status?.pass,
        active:window.P120ScientificBase?.activeBaseId,
        oldCoreHidden:document.getElementById('science-refs')?.classList.contains('p120-pass4c-core-native-hidden')
      }));
      ck(`${tag}: Global70 exact`,lib.global===70&&lib.domAll===70,lib);
      ck(`${tag}: Global70 partition 45+25`,lib.domCore===45&&lib.domExt===25,lib);
      ck(`${tag}: PASS4B preserved in LIBRARY`,lib.renderer===true&&lib.active==='LIBRARY',lib);
      ck(`${tag}: native Core bibliography de-duplicated`,lib.oldCoreHidden===true,lib);

      await page.locator('[data-pass4c-filter="COM-12"]').click();
      await page.waitForTimeout(60);
      ck(`${tag}: COM-12 library binding count 5`,await page.locator('[data-p120-global-reference]').count()===5);
      await page.locator('[data-pass4c-filter="PASS4_EXTENSION"]').click();
      await page.waitForTimeout(60);
      ck(`${tag}: extension library binding count 25`,await page.locator('[data-p120-global-reference]').count()===25);
      await page.locator('[data-pass4c-filter="ALL"]').click();
      await page.waitForTimeout(60);

      if(c.locale==='EN'){
        await selectBase(page,'CORE');
        const visibleCyr=await page.evaluate(()=>{
          const root=document.querySelector('.science-page');if(!root)return [];
          const out=[];for(const el of root.querySelectorAll('*')){const s=getComputedStyle(el);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0||el.children.length)continue;const t=(el.textContent||'').trim();if(/[А-Яа-яЁё]/.test(t))out.push(t);}return [...new Set(out)].slice(0,20);
        });
        ck(`${tag}: no visible Cyrillic in EN Core`,visibleCyr.length===0,{visibleCyr});
      }
    }
    await page.screenshot({path:path.join(OUT,`${tag}.png`),fullPage:false});
    await ctx.close();
  }

  // Live deep-link contract on both locales.
  for(const locale of ['RU','EN']){
    const route=locale==='RU'?'science/':'en/science/';
    const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
    const page=await ctx.newPage();
    const response=await page.goto(`${BASE}${route}?science=extended&module=COM-12`,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>null);
    ck(`${locale} deep-link: HTTP success`,!!response&&response.status()<400,{status:response?.status()??null});
    let ready=true;try{await waitBase(page);}catch{ready=false;}
    const state=await page.evaluate(()=>({base:window.P120ScientificBase?.activeBaseId,module:window.P120ScientificBase?.activeModuleId}));
    ck(`${locale} deep-link: runtime ready`,ready);
    ck(`${locale} deep-link: EXTENDED selected`,state.base==='EXTENDED',{state});
    ck(`${locale} deep-link: COM-12 selected`,state.module==='COM-12',{state});
    ck(`${locale} deep-link: COM-12 highlighted`,await page.locator('[data-p120-science-module="COM-12"][data-active-module="true"]').isVisible().catch(()=>false));
    await ctx.close();
  }
}finally{await browser.close();}

const result={document_id:'P120-WEBSCI-PROD-G1-LIVE-SMOKE',version:'v1.0',date:'2026-09-06',production_base:BASE,status:failures.length?'FAIL':'PASS',checks_total:checks.length,checks_passed:checks.length-failures.length,checks_failed:failures.length,qa_semantics:'SEALED SCIENTIFIC BASE / PASS4C SELECTOR-AND-STATE CONTRACTS; NO WHOLE-PAGE KEYWORD HEURISTICS',checks,failures};
fs.writeFileSync(path.join(OUT,'P120_WEBSCI_PROD_G1_LIVE_SMOKE_v1.0.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checks_total:result.checks_total,checks_passed:result.checks_passed,checks_failed:result.checks_failed},null,2));
if(failures.length)process.exit(1);
