import { chromium } from 'playwright';
import fs from 'node:fs';

const ORIGIN='http://127.0.0.1:4179';
const OUT='qa-evidence-webscience-pass4d';
fs.mkdirSync(`${OUT}/screenshots`,{recursive:true});
const checks=[]; const failures=[]; const snapshots={};
function check(name,ok,detail={}){const row={name,pass:Boolean(ok),detail};checks.push(row);if(!ok){failures.push(row);console.error('FAIL',name,detail);}return Boolean(ok);}
const views=[['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]];
const locales=[['ru','science/'],['en','en/science/']];
const forbidden={
  ru:['психометрически валидированная система','межмодульная валидность доказана','причинный эффект установлен','диагностический результат установлен','нормативный балл установлен'],
  en:['psychometrically validated system','cross-module validity has been demonstrated','causal effect has been established','diagnostic result established','normative score established']
};

async function waitReady(page){
  await page.waitForFunction(()=>window.P120SciencePublicationRenderer?.status?.pass===true&&window.P120ScienceGlobalLibrary?.status?.pass===true&&window.P120ScientificBase?.status?.pass===true,null,{timeout:20000});
}
async function setBase(page,base){
  await page.evaluate(base=>window.P120ScientificBase.setBase(base),base);
  await page.waitForFunction(base=>window.P120ScientificBase?.activeBaseId===base,base,{timeout:8000});
  if(base!=='CORE')await page.waitForFunction(base=>document.querySelector('#p120-science-active-base')&&window.P120ScientificBase?.activeBaseId===base,base,{timeout:8000});
  if(base==='LIBRARY')await page.waitForFunction(()=>document.querySelector('[data-p120-pass4c-library="integrated-v0.7"]')&&document.querySelectorAll('[data-p120-global-reference]').length===70,null,{timeout:8000});
  await page.waitForTimeout(80);
}
async function canonicalCheck(page,locale,label){
  const x=await page.evaluate(locale=>{
    const p=window.P120SciencePublicationRenderer.projection;
    const local=v=>v?.[locale]??'';
    const panel=document.querySelector('#p120-science-active-base');
    const pos=document.querySelector('#p120-science-publication-positioning');
    return {
      positionText:pos?.textContent||'', panelText:panel?.textContent||'',
      positioning:Object.fromEntries(Object.entries(p.system_positioning||{}).map(([k,v])=>[k,local(v)])),
      modules:(p.modules||[]).map(m=>({id:m.module_id,base:m.base_id,name:local(m.name),question:local(m.research_question),role:local(m.role),development:local(m.development_summary),ceiling:local(m.publication_ceiling),constructs:(m.candidate_architecture||[]).map(c=>({code:c.code,label:local(c.label)})),refs:m.selected_reference_ids||[],evidence:m.evidence_state||{}})),
      ladder:(p.evidence_ladder||[]).map(e=>({level:e.level,label:local(e.label),meaning:local(e.meaning),not:local(e.does_not_mean)})),
      cross:{statement:local(p.cross_layer?.system_statement),questions:(p.cross_layer?.questions||[]).map(q=>({id:q.id,theme:local(q.theme),question:local(q.question)})),state:p.cross_layer?.empirical_state},
      rules:p.projection_rules,
      bases:p.bases
    };
  },locale);
  for(const [k,v] of Object.entries(x.positioning))check(`${label}: positioning ${k} rendered`,x.positionText.includes(v),{value:v});
  return x;
}
async function verifyExtended(page,locale,label,source){
  await setBase(page,'EXTENDED');
  const dom=await page.evaluate(()=>[...document.querySelectorAll('#p120-science-active-base .p120-pass4b-module')].map(el=>({id:el.dataset.p120ScienceModule,text:el.textContent||'',constructs:[...el.querySelectorAll('.p120-pass4b-construct code')].map(x=>x.textContent.trim()),refs:[...el.querySelectorAll('.p120-pass4b-reference-id')].map(x=>x.textContent.trim()),visibility:el.dataset.publicVisibility,rpe:el.dataset.p120RpeDetail||null})));
  const expected=source.modules.filter(m=>m.base==='EXTENDED');
  check(`${label}: Extended module identity parity`,JSON.stringify(dom.map(x=>x.id))===JSON.stringify(expected.map(x=>x.id)),{dom:dom.map(x=>x.id),expected:expected.map(x=>x.id)});
  for(const m of expected){
    const d=dom.find(x=>x.id===m.id);check(`${label}: ${m.id} card exists`,Boolean(d));if(!d)continue;
    for(const [field,value] of [['name',m.name],['question',m.question],['role',m.role],['development',m.development],['ceiling',m.ceiling]])check(`${label}: ${m.id} ${field} canonical ${locale}`,d.text.includes(value),{value});
    check(`${label}: ${m.id} summary_only marker`,d.visibility==='summary_only',{visibility:d.visibility});
    check(`${label}: ${m.id} E3/E4 withheld in source`,m.evidence.E3==='NOT_ESTABLISHED'&&m.evidence.E4==='NOT_ESTABLISHED',{evidence:m.evidence});
    if(m.id==='RPE-MOD'){
      check(`${label}: RPE detail suppression marker`,d.rpe==='suppressed',{rpe:d.rpe});
      check(`${label}: RPE constructs absent`,d.constructs.length===0,{constructs:d.constructs});
      check(`${label}: RPE references absent`,d.refs.length===0,{refs:d.refs});
    }else{
      check(`${label}: ${m.id} construct code identity`,JSON.stringify(d.constructs)===JSON.stringify(m.constructs.map(x=>x.code)),{dom:d.constructs,expected:m.constructs.map(x=>x.code)});
      check(`${label}: ${m.id} reference identity`,JSON.stringify(d.refs)===JSON.stringify(m.refs),{dom:d.refs,expected:m.refs});
    }
  }
  return {modules:dom.map(x=>({id:x.id,constructs:x.constructs,refs:x.refs,visibility:x.visibility}))};
}
async function verifyOutcomes(page,locale,label,source){
  await setBase(page,'OUTCOMES');
  const dom=await page.evaluate(()=>[...document.querySelectorAll('#p120-science-active-base .p120-pass4b-module')].map(el=>({id:el.dataset.p120ScienceModule,text:el.textContent||'',constructs:[...el.querySelectorAll('.p120-pass4b-construct code')].map(x=>x.textContent.trim()),refs:[...el.querySelectorAll('.p120-pass4b-reference-id')].map(x=>x.textContent.trim()),visibility:el.dataset.publicVisibility})));
  const m=source.modules.find(x=>x.id==='LIFE-12/18');const d=dom[0];
  check(`${label}: LIFE only outcome`,dom.length===1&&d?.id==='LIFE-12/18',{dom:dom.map(x=>x.id)});
  if(d&&m){for(const [field,value] of [['name',m.name],['question',m.question],['role',m.role],['development',m.development],['ceiling',m.ceiling]])check(`${label}: LIFE ${field} canonical ${locale}`,d.text.includes(value),{value});
    check(`${label}: LIFE construct identity`,JSON.stringify(d.constructs)===JSON.stringify(m.constructs.map(x=>x.code)),{dom:d.constructs});
    check(`${label}: LIFE reference identity`,JSON.stringify(d.refs)===JSON.stringify(m.refs),{dom:d.refs});
    check(`${label}: LIFE E3/E4 withheld`,m.evidence.E3==='NOT_ESTABLISHED'&&m.evidence.E4==='NOT_ESTABLISHED',{evidence:m.evidence});
  }
  return {modules:dom.map(x=>({id:x.id,constructs:x.constructs,refs:x.refs,visibility:x.visibility}))};
}
async function verifyMethods(page,locale,label,source){
  await setBase(page,'METHODS');
  const dom=await page.evaluate(()=>({text:document.querySelector('#p120-science-active-base')?.textContent||'',ladder:[...document.querySelectorAll('[data-evidence-level]')].map(x=>x.dataset.evidenceLevel),questions:[...document.querySelectorAll('[data-p120-cross-layer-question]')].map(x=>x.dataset.p120CrossLayerQuestion)}));
  check(`${label}: E0-E4 structural parity`,JSON.stringify(dom.ladder)===JSON.stringify(source.ladder.map(x=>x.level)),{dom:dom.ladder});
  for(const e of source.ladder){check(`${label}: ${e.level} label rendered`,dom.text.includes(e.label),{value:e.label});check(`${label}: ${e.level} meaning rendered`,dom.text.includes(e.meaning),{value:e.meaning});check(`${label}: ${e.level} non-claim rendered`,dom.text.includes(e.not),{value:e.not});}
  check(`${label}: cross-layer statement rendered`,dom.text.includes(source.cross.statement),{value:source.cross.statement});
  check(`${label}: CLQ structural parity`,JSON.stringify(dom.questions)===JSON.stringify(source.cross.questions.map(x=>x.id)),{dom:dom.questions});
  for(const q of source.cross.questions){check(`${label}: ${q.id} theme rendered`,dom.text.includes(q.theme),{value:q.theme});check(`${label}: ${q.id} question rendered`,dom.text.includes(q.question),{value:q.question});}
  check(`${label}: cross-layer states withheld`,source.cross.state.empirical_cross_layer_discriminant_validity==='NOT_ESTABLISHED'&&source.cross.state.empirical_incremental_validity==='NOT_ESTABLISHED'&&source.cross.state.validated_cross_layer_synergy==='NOT_AUTHORIZED'&&source.cross.state.causal_cross_layer_effects==='NOT_AUTHORIZED',{state:source.cross.state});
  return {ladder:dom.ladder,questions:dom.questions};
}
async function verifyLibrary(page,locale,label){
  await setBase(page,'LIBRARY');
  const dom=await page.evaluate(()=>({
    all:document.querySelectorAll('[data-p120-global-reference]').length,
    core:document.querySelectorAll('[data-source-layer="CORE45"]').length,
    ext:document.querySelectorAll('[data-source-layer="PASS4_EXTENSION"]').length,
    ids:[...document.querySelectorAll('[data-p120-global-reference]')].map(x=>x.dataset.p120GlobalReference),
    text:document.querySelector('#p120-science-active-base')?.textContent||'',
    oldCoreHidden:document.getElementById('science-refs')?.classList.contains('p120-pass4c-core-native-hidden'),
    coreRoleLeak:[...document.querySelectorAll('[data-source-layer="CORE45"]')].some(n=>/Evidence role|Роль в доказательной базе/.test(n.textContent||'')),
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
  }));
  check(`${label}: Global70 visible`,dom.all===70&&dom.core===45&&dom.ext===25,{all:dom.all,core:dom.core,ext:dom.ext});
  check(`${label}: REF-001..070 continuous`,JSON.stringify(dom.ids)===JSON.stringify(Array.from({length:70},(_,i)=>`REF-${String(i+1).padStart(3,'0')}`)),{first:dom.ids[0],last:dom.ids.at(-1)});
  check(`${label}: native Core bibliography hidden only in integrated Library`,dom.oldCoreHidden===true,{oldCoreHidden:dom.oldCoreHidden});
  check(`${label}: no inferred Core evidence roles`,dom.coreRoleLeak===false,{coreRoleLeak:dom.coreRoleLeak});
  check(`${label}: Library validity boundary rendered`,locale==='ru'?dom.text.includes('Количество источников отражает покрытие, а не валидность'):dom.text.includes('Reference count is coverage metadata, not a validity metric'),{});
  check(`${label}: no horizontal overflow in Library`,dom.overflow<=1,{overflow:dom.overflow});
  return {count:dom.all,core:dom.core,ext:dom.ext,ids:dom.ids};
}
async function verifyForbidden(page,locale,label){
  const text=await page.locator('body').innerText();
  const found=forbidden[locale].filter(x=>text.toLowerCase().includes(x.toLowerCase()));
  check(`${label}: no affirmative forbidden claim phrases`,found.length===0,{found});
  if(locale==='en')check(`${label}: reader-facing PASS4 surfaces contain no Cyrillic`,!/[А-Яа-яЁё]/.test((await page.locator('#p120-science-publication-positioning').innerText())+' '+(await page.locator('#p120-science-active-base').innerText())),{});
}
async function verifyStorage(page,label){
  const x=await page.evaluate(()=>({l:localStorage.getItem('__p120_4d_local'),s:sessionStorage.getItem('__p120_4d_session')}));
  check(`${label}: storage isolation`,x.l==='LOCAL-4D'&&x.s==='SESSION-4D',x);
}

const browser=await chromium.launch({headless:true});
try{
  for(const [locale,route] of locales){
    for(const [view,viewport] of views){
      const context=await browser.newContext({viewport});
      await context.addInitScript(()=>{localStorage.setItem('__p120_4d_local','LOCAL-4D');sessionStorage.setItem('__p120_4d_session','SESSION-4D');});
      const page=await context.newPage(); const errors=[];
      page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`);});
      const label=`${locale}-${view}`;
      await page.goto(`${ORIGIN}/${route}`,{waitUntil:'domcontentloaded'});await waitReady(page);
      const source=await canonicalCheck(page,locale,label);
      check(`${label}: measurement/scoring/threshold/session boundaries`,source.rules.measurement_mutation_allowed===false&&source.rules.scoring_mutation_allowed===false&&source.rules.threshold_mutation_allowed===false&&source.rules.session_storage_access==='PROHIBITED',{rules:source.rules});
      const ext=await verifyExtended(page,locale,label,source);
      await verifyForbidden(page,locale,`${label}-extended`);
      const out=await verifyOutcomes(page,locale,label,source);
      await verifyForbidden(page,locale,`${label}-outcomes`);
      const methods=await verifyMethods(page,locale,label,source);
      await verifyForbidden(page,locale,`${label}-methods`);
      const library=await verifyLibrary(page,locale,label);
      await verifyForbidden(page,locale,`${label}-library`);
      await verifyStorage(page,label);
      const filtered=errors.filter(x=>!x.includes('Failed to load resource'));
      check(`${label}: no runtime errors`,filtered.length===0,{errors:filtered});
      snapshots[`${locale}-${view}`]={extended:ext,outcomes:out,methods,library};
      await page.screenshot({path:`${OUT}/screenshots/${locale}-${view}-pass4d-library.png`,fullPage:true});
      await context.close();
    }
  }
} finally {await browser.close();}

for(const view of ['desktop','mobile']){
  const ru=snapshots[`ru-${view}`],en=snapshots[`en-${view}`];
  check(`${view}: RU/EN Extended structural signature identical`,JSON.stringify(ru?.extended)===JSON.stringify(en?.extended),{ru:ru?.extended,en:en?.extended});
  check(`${view}: RU/EN Outcomes structural signature identical`,JSON.stringify(ru?.outcomes)===JSON.stringify(en?.outcomes),{ru:ru?.outcomes,en:en?.outcomes});
  check(`${view}: RU/EN Methods structural signature identical`,JSON.stringify(ru?.methods)===JSON.stringify(en?.methods),{ru:ru?.methods,en:en?.methods});
  check(`${view}: RU/EN Library structural signature identical`,JSON.stringify(ru?.library)===JSON.stringify(en?.library),{ru:ru?.library,en:en?.library});
}

const result={standard:'P120',document_id:'P120-WEBSCI-EXT-004-PASS4D-BROWSER-QA',version:'v0.8',date:'2026-09-06',status:failures.length?'FAIL':'PASS',checks_total:checks.length,checks_passed:checks.length-failures.length,checks_failed:failures.length,checks,failures,snapshots};
fs.writeFileSync(`${OUT}/P120_WEBSCI_EXT_PASS4_PASS4D_BROWSER_QA_RESULT_v0.8.json`,JSON.stringify(result,null,2)+'\n');
console.log(`PASS 4D browser gate: ${result.checks_passed}/${result.checks_total}`);if(failures.length)process.exit(1);
