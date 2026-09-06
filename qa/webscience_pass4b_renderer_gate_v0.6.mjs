import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ORIGIN='http://127.0.0.1:4179';
const OUT='qa-evidence-webscience-pass4b';
const SHOTS=path.join(OUT,'screenshots');
await mkdir(SHOTS,{recursive:true});

const checks=[];
const failures=[];
function check(id,pass,detail={}){const row={id,pass:Boolean(pass),...detail};checks.push(row);if(!pass)failures.push(row);return Boolean(pass);}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const viewports={desktop:{width:1440,height:1000},mobile:{width:390,height:844}};
const baseStates=['CORE','EXTENDED','OUTCOMES','METHODS','LIBRARY'];
const SENTINELS={
  legacy:'{"sentinel":"legacy-preserve","responses":{"SAT01":"4"}}',
  ru:'{"sentinel":"ru-session-preserve","responses":{"SAT02":"5"}}',
  en:'{"sentinel":"en-session-preserve","responses":{"SAT02":"2"}}',
  session:'pass4b-session-sentinel'
};

async function seedContext(browser,viewport){
  const context=await browser.newContext({viewport});
  await context.addInitScript(seed=>{
    localStorage.setItem('p120_web_prototype_v01',seed.legacy);
    localStorage.setItem('p120_runtime_session_ru_v1',seed.ru);
    localStorage.setItem('p120_runtime_session_en_v1',seed.en);
    sessionStorage.setItem('p120_pass4b_sentinel',seed.session);
  },SENTINELS);
  return context;
}

async function waitReady(page,label){
  try{
    await page.waitForFunction(()=>document.documentElement.dataset.p120WebsciencePass4bStatus==='pass'&&window.P120SciencePublicationRenderer?.status?.pass===true,null,{timeout:15000});
    check(`${label}: PASS 4B renderer ready`,true);
    return true;
  }catch(error){
    const diag=await page.evaluate(()=>({
      base:window.P120ScientificBase?.status||null,
      renderer:window.P120SciencePublicationRenderer?.status||null,
      dataset:{...document.documentElement.dataset}
    })).catch(()=>null);
    check(`${label}: PASS 4B renderer ready`,false,{error:String(error),diag});
    return false;
  }
}

async function setBase(page,base,module=null){
  await page.evaluate(({base,module})=>window.P120ScientificBase?.setBase(base,module),{base,module});
  await page.waitForFunction(expected=>document.documentElement.dataset.p120ScienceActiveBase===expected,base,{timeout:6000});
  if(base!=='CORE')await page.waitForFunction(expected=>document.querySelector('#p120-science-active-base')?.dataset?.p120Pass4bRenderer==='active'&&document.documentElement.dataset.p120Pass4bActiveBase===expected,base,{timeout:6000});
  await sleep(120);
}

async function verifyCore(page,label){
  await setBase(page,'CORE');
  const core=await page.evaluate(()=>({
    refs:window.P120_SCIENCE?.references?.length,
    anchors:['science-layers','science-constructs','science-evidence','science-hypotheses','science-validation','science-ethics','science-refs'].map(id=>Boolean(document.getElementById(id))),
    projectionPositioning:Boolean(document.getElementById('p120-science-publication-positioning')),
    extensionInCore:document.querySelectorAll('[data-p120-global-reference]').length,
    activePanel:Boolean(document.getElementById('p120-science-active-base'))
  }));
  check(`${label}: Core reference fixture remains 45`,core.refs===45,{refs:core.refs});
  check(`${label}: Core anchors retained`,core.anchors.every(Boolean),{anchors:core.anchors});
  check(`${label}: additive system positioning rendered`,core.projectionPositioning);
  check(`${label}: Global extension not injected into Core bibliography`,core.extensionInCore===0,{count:core.extensionInCore});
  check(`${label}: no non-Core active panel in Core`,core.activePanel===false,{activePanel:core.activePanel});
}

async function verifyExtended(page,label){
  await setBase(page,'EXTENDED');
  const x=await page.evaluate(()=>({
    cards:[...document.querySelectorAll('#p120-science-active-base .p120-pass4b-module')].map(el=>({
      id:el.dataset.p120ScienceModule,
      visibility:el.dataset.publicVisibility,
      constructs:el.querySelectorAll('.p120-pass4b-construct').length,
      refs:el.querySelectorAll('.p120-pass4b-reference-id').length,
      rpe:el.dataset.p120RpeDetail||null
    })),
    dyadic:document.querySelectorAll('[data-p120-science-base="DYADIC"],[data-p120-science-module="DYADIC"]').length
  }));
  check(`${label}: Extended renders four projected modules`,x.cards.length===4,{cards:x.cards});
  check(`${label}: Extended module identity`,JSON.stringify(x.cards.map(c=>c.id))===JSON.stringify(['COM-12','MOT-12','SELF-12','RPE-MOD']),{cards:x.cards});
  check(`${label}: Extended remains summary_only`,x.cards.every(c=>c.visibility==='summary_only'),{cards:x.cards});
  const rpe=x.cards.find(c=>c.id==='RPE-MOD');
  check(`${label}: RPE detail suppression marker`,rpe?.rpe==='suppressed',{rpe});
  check(`${label}: RPE construct detail absent`,rpe?.constructs===0,{rpe});
  check(`${label}: RPE reference detail absent`,rpe?.refs===0,{rpe});
  check(`${label}: non-RPE Extended constructs rendered`,x.cards.filter(c=>c.id!=='RPE-MOD').every(c=>c.constructs>0),{cards:x.cards});
  check(`${label}: non-RPE Extended evidence refs rendered`,x.cards.filter(c=>c.id!=='RPE-MOD').every(c=>c.refs>0),{cards:x.cards});
  check(`${label}: DYADIC remains absent`,x.dyadic===0,{dyadic:x.dyadic});
}

async function verifyOutcomes(page,label){
  await setBase(page,'OUTCOMES');
  const x=await page.evaluate(()=>({
    cards:[...document.querySelectorAll('#p120-science-active-base .p120-pass4b-module')].map(el=>({
      id:el.dataset.p120ScienceModule,
      visibility:el.dataset.publicVisibility,
      constructs:el.querySelectorAll('.p120-pass4b-construct').length,
      refs:el.querySelectorAll('.p120-pass4b-reference-id').length,
      text:el.textContent||''
    }))
  }));
  check(`${label}: Outcomes renders LIFE only`,x.cards.length===1&&x.cards[0].id==='LIFE-12/18',{cards:x.cards});
  check(`${label}: LIFE remains summary_only`,x.cards[0]?.visibility==='summary_only',{cards:x.cards});
  check(`${label}: LIFE candidate architecture rendered`,x.cards[0]?.constructs===8,{cards:x.cards});
  check(`${label}: LIFE selected refs rendered`,x.cards[0]?.refs===8,{cards:x.cards});
}

async function verifyMethods(page,label){
  await setBase(page,'METHODS');
  const x=await page.evaluate(()=>({
    ladder:[...document.querySelectorAll('#p120-science-active-base [data-evidence-level]')].map(el=>el.dataset.evidenceLevel),
    questions:[...document.querySelectorAll('#p120-science-active-base [data-p120-cross-layer-question]')].map(el=>el.dataset.p120CrossLayerQuestion),
    text:document.querySelector('#p120-science-active-base')?.textContent||'',
    projection:window.P120SciencePublicationRenderer?.projection?.cross_layer||null
  }));
  check(`${label}: E0-E4 ladder rendered`,JSON.stringify(x.ladder)===JSON.stringify(['E0','E1','E2','E3','E4']),{ladder:x.ladder});
  check(`${label}: ten cross-layer research questions rendered`,x.questions.length===10,{questions:x.questions});
  check(`${label}: CLQ identity preserved`,JSON.stringify(x.questions)===JSON.stringify(Array.from({length:10},(_,i)=>`CLQ-${String(i+1).padStart(2,'0')}`)),{questions:x.questions});
  check(`${label}: cross-layer discriminant validity withheld`,x.projection?.empirical_state?.empirical_cross_layer_discriminant_validity==='NOT_ESTABLISHED',{state:x.projection?.empirical_state});
  check(`${label}: cross-layer incremental validity withheld`,x.projection?.empirical_state?.empirical_incremental_validity==='NOT_ESTABLISHED',{state:x.projection?.empirical_state});
  check(`${label}: validated synergy withheld`,x.projection?.empirical_state?.validated_cross_layer_synergy==='NOT_AUTHORIZED',{state:x.projection?.empirical_state});
  check(`${label}: causal effects withheld`,x.projection?.empirical_state?.causal_cross_layer_effects==='NOT_AUTHORIZED',{state:x.projection?.empirical_state});
}

async function verifyLibrary(page,label){
  await setBase(page,'LIBRARY');
  const x=await page.evaluate(()=>({
    coreRefs:window.P120_SCIENCE?.references?.length,
    ext:[...document.querySelectorAll('#p120-science-active-base [data-p120-global-reference]')].map(el=>el.dataset.p120GlobalReference),
    dois:[...document.querySelectorAll('#p120-science-active-base [data-p120-global-reference] a[href^="https://doi.org/"]')].map(a=>a.href),
    stats:[...document.querySelectorAll('#p120-science-active-base .p120-pass4b-library-stat strong')].map(el=>el.textContent?.trim()),
    coreAnchor:Boolean(document.getElementById('science-refs'))
  }));
  check(`${label}: Core bibliography fixture still 45`,x.coreRefs===45,{coreRefs:x.coreRefs});
  check(`${label}: 25-reference extension rendered`,x.ext.length===25,{count:x.ext.length});
  const expected=Array.from({length:25},(_,i)=>`REF-${String(i+46).padStart(3,'0')}`);
  check(`${label}: REF-046..070 identity rendered`,JSON.stringify(x.ext)===JSON.stringify(expected),{first:x.ext[0],last:x.ext.at(-1)});
  check(`${label}: 25 DOI links rendered`,x.dois.length===25,{count:x.dois.length});
  check(`${label}: DOI links unique`,new Set(x.dois).size===25,{unique:new Set(x.dois).size});
  check(`${label}: Core45/Extension25/Global70 counters rendered`,JSON.stringify(x.stats)===JSON.stringify(['45','25','70']),{stats:x.stats});
  check(`${label}: preserved Core bibliography anchor remains`,x.coreAnchor);
}

async function verifyStorage(page,label){
  const s=await page.evaluate(()=>({
    legacy:localStorage.getItem('p120_web_prototype_v01'),
    ru:localStorage.getItem('p120_runtime_session_ru_v1'),
    en:localStorage.getItem('p120_runtime_session_en_v1'),
    session:sessionStorage.getItem('p120_pass4b_sentinel')
  }));
  check(`${label}: legacy respondent source unchanged`,s.legacy===SENTINELS.legacy,{actual:s.legacy});
  check(`${label}: RU respondent session unchanged`,s.ru===SENTINELS.ru,{actual:s.ru});
  check(`${label}: EN respondent session unchanged`,s.en===SENTINELS.en,{actual:s.en});
  check(`${label}: sessionStorage sentinel unchanged`,s.session===SENTINELS.session,{actual:s.session});
}

async function verifyLanguageSurface(page,locale,label){
  const x=await page.evaluate(()=>({
    text:document.querySelector('#p120-science-publication-positioning')?.textContent||'',
    panel:document.querySelector('#p120-science-active-base')?.textContent||''
  }));
  if(locale==='en'){
    const cyr=[x.text,x.panel].filter(Boolean).filter(t=>/[А-Яа-яЁё]/.test(t));
    check(`${label}: PASS 4B EN surface contains no Cyrillic`,cyr.length===0,{samples:cyr.map(t=>t.slice(0,120))});
  }else{
    check(`${label}: PASS 4B RU positioning contains Cyrillic`,/[А-Яа-яЁё]/.test(x.text),{sample:x.text.slice(0,120)});
  }
}

async function verifyGeometry(page,label){
  const g=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  check(`${label}: no horizontal overflow`,g.scrollWidth-g.clientWidth<=1,{...g,overflow:g.scrollWidth-g.clientWidth});
}

async function verifyDeepLink(browser,locale){
  const context=await seedContext(browser,viewports.desktop);
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`);});
  const prefix=locale==='en'?'/en':'';
  await page.goto(`${ORIGIN}${prefix}/science/?science=extended&module=COM-12`,{waitUntil:'domcontentloaded'});
  const label=`${locale.toUpperCase()} deep-link`;
  if(await waitReady(page,label)){
    const x=await page.evaluate(()=>({
      base:window.P120ScientificBase?.activeBaseId,
      module:window.P120ScientificBase?.activeModuleId,
      active:document.querySelector('[data-p120-science-module="COM-12"]')?.dataset?.activeModule
    }));
    check(`${label}: Extended selected`,x.base==='EXTENDED',{x});
    check(`${label}: COM-12 selected`,x.module==='COM-12',{x});
    check(`${label}: COM-12 active marker preserved`,x.active==='true',{x});
  }
  check(`${label}: no runtime errors`,errors.length===0,{errors});
  await context.close();
}

const browser=await chromium.launch({headless:true});
try{
  for(const locale of ['ru','en']){
    for(const [viewportName,viewport] of Object.entries(viewports)){
      const context=await seedContext(browser,viewport);
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
      page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`);});
      const prefix=locale==='en'?'/en':'';
      const label=`${locale.toUpperCase()} ${viewportName}`;
      await page.goto(`${ORIGIN}${prefix}/science/`,{waitUntil:'domcontentloaded'});
      if(await waitReady(page,label)){
        const contract=await page.evaluate(()=>({
          base:window.P120ScientificBase?.status||null,
          renderer:window.P120SciencePublicationRenderer?.status||null,
          projectionSchema:window.P120SciencePublicationRenderer?.projection?.schema_id,
          librarySchema:window.P120SciencePublicationRenderer?.library?.schema_id,
          rules:window.P120SciencePublicationRenderer?.projection?.projection_rules||null
        }));
        check(`${label}: base runtime remains PASS`,contract.base?.pass===true,{base:contract.base});
        check(`${label}: projection schema`,contract.projectionSchema==='P120-WEBSCI-PUBLICATION-PROJECTION-001',{schema:contract.projectionSchema});
        check(`${label}: library schema`,contract.librarySchema==='P120-WEBSCI-GLOBAL-LIBRARY-PROJECTION-001',{schema:contract.librarySchema});
        check(`${label}: measurement mutation prohibited`,contract.rules?.measurement_mutation_allowed===false,{rules:contract.rules});
        check(`${label}: scoring mutation prohibited`,contract.rules?.scoring_mutation_allowed===false,{rules:contract.rules});
        check(`${label}: threshold mutation prohibited`,contract.rules?.threshold_mutation_allowed===false,{rules:contract.rules});
        check(`${label}: session storage access prohibited`,contract.rules?.session_storage_access==='PROHIBITED',{rules:contract.rules});
        await verifyCore(page,label);
        await verifyExtended(page,label);
        await verifyOutcomes(page,label);
        await verifyMethods(page,label);
        await verifyLibrary(page,label);
        await verifyLanguageSurface(page,locale,label);
        await verifyStorage(page,label);
        await verifyGeometry(page,label);
        await page.screenshot({path:path.join(SHOTS,`${locale}-${viewportName}-library.png`),fullPage:true});
      }
      const filtered=errors.filter(x=>!x.includes('Failed to load resource'));
      check(`${label}: no runtime/page errors`,filtered.length===0,{errors:filtered,ignored:errors.length-filtered.length});
      await context.close();
    }
    await verifyDeepLink(browser,locale);
  }
} finally {
  await browser.close();
}

const report={
  document_id:'P120-WEBSCI-EXT-004-PASS4B-QA',
  version:'v0.6',
  date:'2026-09-06',
  gate:'WEB-SCIENCE EXT PASS 4B — Renderer Activation',
  status:failures.length?'FAIL':'PASS',
  checks_total:checks.length,
  checks_passed:checks.filter(x=>x.pass).length,
  checks_failed:failures.length,
  failures,
  checks,
  evidence:{routes:['/science/','/en/science/'],viewports,baseStates,screenshots:'screenshots/'},
  next_gate:'PASS 4C — Core-45 / Global-70 Library Integration'
};
await writeFile(path.join(OUT,'P120_WEBSCI_EXT_PASS4_PASS4B_QA_RESULT_v0.6.json'),JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({status:report.status,checks_total:report.checks_total,checks_failed:report.checks_failed},null,2));
if(failures.length)process.exit(1);
