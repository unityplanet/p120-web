import { chromium } from 'playwright';
import fs from 'node:fs';
import crypto from 'node:crypto';

const BASE='http://127.0.0.1:4178';
const outDir='qa-evidence-pass3-session-contract-v1';
fs.mkdirSync(outDir,{recursive:true});
const LEGACY='p120_web_prototype_v01';
const RU='p120_runtime_session_ru_v1';
const EN='p120_runtime_session_en_v1';
const ERU='p120_editorial_state_ru_v1';
const EEN='p120_editorial_state_en_v1';
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const checks=[];
const add=(id,pass,detail={})=>checks.push({id,pass:Boolean(pass),...detail});

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();

const legacyState={participantId:'P120-ABC123',screen:'test',itemIndex:1,responses:{SAT01:'4'},adminModes:{},telemetry:[{type:'legacy_seed',at:'2026-09-02T00:00:00.000Z'}],startedAt:'2026-09-02T00:00:00.000Z',consentAt:'2026-09-02T00:00:01.000Z',lastSavedAt:'2026-09-02T00:00:02.000Z'};
await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
await page.evaluate(([k,v,ru,en,eru,een])=>{localStorage.clear();localStorage.setItem(k,JSON.stringify(v));localStorage.removeItem(ru);localStorage.removeItem(en);localStorage.removeItem(eru);localStorage.removeItem(een);},[LEGACY,legacyState,RU,EN,ERU,EEN]);
const legacyRaw=await page.evaluate(k=>localStorage.getItem(k),LEGACY);

async function systemSnapshot(route){
  await page.goto(BASE+route,{waitUntil:'networkidle'});
  return await page.evaluate(({legacy,ru,en})=>({
    path:location.pathname,
    lang:document.documentElement.lang,
    currentItem:document.querySelector('.qid')?.textContent?.trim()||null,
    contract:window.P120_SESSION_CONTRACT||null,
    legacy:localStorage.getItem(legacy),
    ru:localStorage.getItem(ru),
    en:localStorage.getItem(en),
    intakePackage:window.P120SubmissionIntake?.buildPackage?window.P120SubmissionIntake.buildPackage():null,
    measurement:{
      items:(window.P120_INSTRUMENT?.items||[]).map(i=>[i.id,i.module,i.type,(i.choices||[]).map(c=>c.value)]),
      modules:(window.P120_INSTRUMENT?.modules||[]).map(m=>m.id),
      scoring:{
        moduleOrder:window.P120Scoring?.moduleOrder||null,
        coverage:String(window.P120Scoring?.coverage||''),
        buildPrototypeResult:String(window.P120Scoring?.buildPrototypeResult||'')
      },
      sample:window.P120Scoring?.coverage?window.P120Scoring.coverage({SAT01:'4'},window.P120_INSTRUMENT):null
    }
  }),{legacy:LEGACY,ru:RU,en:EN});
}
const sessionTriple=()=>page.evaluate(({legacy,ru,en})=>({legacy:localStorage.getItem(legacy),ru:localStorage.getItem(ru),en:localStorage.getItem(en)}),{legacy:LEGACY,ru:RU,en:EN});
const readSession=k=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),k);
const invokeChoice=async value=>{
  const locator=page.locator(`.choice[data-value="${value}"]`);
  await locator.waitFor({state:'attached'});
  return locator.evaluate(el=>{
    const key=window.P120_SESSION_KEY;
    const before=key?localStorage.getItem(key):null;
    const handlerType=typeof el.onclick;
    if(handlerType==='function') el.onclick.call(el);
    const after=key?localStorage.getItem(key):null;
    return {handlerType,key,before,after};
  });
};

const ru1=await systemSnapshot('/system/');
const ruState1=JSON.parse(ru1.ru||'null');
add('RU contract selects RU session',ru1.contract?.locale==='ru'&&ru1.contract?.sessionKey===RU,{contract:ru1.contract});
add('RU migration preserves legacy payload',ruState1?.responses?.SAT01==='4'&&ruState1?.sessionLocale==='ru',{sessionLocale:ruState1?.sessionLocale});
add('RU migration does not delete or mutate legacy',ru1.legacy===legacyRaw);
add('RU visit does not create EN session',ru1.en===null);
add('RU current respondent item is SAT02',ru1.currentItem==='SAT02',{currentItem:ru1.currentItem});
add('RU downstream intake reads RU session',ru1.intakePackage?.locale==='ru'&&ru1.intakePackage?.responses?.SAT01==='4',{locale:ru1.intakePackage?.locale});

const ruInvoke=await invokeChoice('5');
add('RU native answer handler is bound',ruInvoke.handlerType==='function',{handlerType:ruInvoke.handlerType,key:ruInvoke.key});
const ruPersisted=await readSession(RU);
add('RU respondent write persists in RU session',ruPersisted?.responses?.SAT02==='5',{value:ruPersisted?.responses?.SAT02,handler:ruInvoke});
const ruPkgAfterWrite=await page.evaluate(()=>window.P120SubmissionIntake?.buildPackage?.());
add('RU intake exports RU respondent write',ruPkgAfterWrite?.locale==='ru'&&ruPkgAfterWrite?.responses?.SAT02==='5');

const en1=await systemSnapshot('/en/system/');
const enState1=JSON.parse(en1.en||'null');
const ruStateAfterEn=JSON.parse(en1.ru||'null');
add('EN contract selects EN session',en1.contract?.locale==='en'&&en1.contract?.sessionKey===EN,{contract:en1.contract});
add('EN migration preserves legacy answer',enState1?.responses?.SAT01==='4');
add('EN session does not inherit RU SAT02 write',enState1?.responses?.SAT02===undefined);
add('RU session survives EN initialization',ruStateAfterEn?.responses?.SAT02==='5',{value:ruStateAfterEn?.responses?.SAT02});
add('EN migration does not mutate legacy',en1.legacy===legacyRaw);
add('EN current respondent item is SAT02',en1.currentItem==='SAT02',{currentItem:en1.currentItem});
add('EN downstream intake reads EN session',en1.intakePackage?.locale==='en'&&en1.intakePackage?.responses?.SAT01==='4'&&en1.intakePackage?.responses?.SAT02===undefined,{locale:en1.intakePackage?.locale});

const enInvoke=await invokeChoice('2');
add('EN native answer handler is bound',enInvoke.handlerType==='function',{handlerType:enInvoke.handlerType,key:enInvoke.key});
const enPersisted=await readSession(EN);
add('EN respondent write persists in EN session',enPersisted?.responses?.SAT02==='2',{value:enPersisted?.responses?.SAT02,handler:enInvoke});
const enPkgAfterWrite=await page.evaluate(()=>window.P120SubmissionIntake?.buildPackage?.());
add('EN intake exports EN respondent write',enPkgAfterWrite?.locale==='en'&&enPkgAfterWrite?.responses?.SAT02==='2');

const ru2=await systemSnapshot('/system/');
const ruState2=JSON.parse(ru2.ru||'null');
const enState2=JSON.parse(ru2.en||'null');
add('RU session retains RU value after EN write',ruState2?.responses?.SAT02==='5',{ru:ruState2?.responses?.SAT02});
add('EN session retains EN value after RU return',enState2?.responses?.SAT02==='2',{en:enState2?.responses?.SAT02});
add('Locale-isolated same-item values remain distinct',ruState2?.responses?.SAT02==='5'&&enState2?.responses?.SAT02==='2');

await page.goto(BASE+'/',{waitUntil:'networkidle'});
const editorialBaseline=await sessionTriple();
await page.waitForTimeout(350);
const afterRuEditorial=await sessionTriple();
add('RU Editorial cannot write respondent session',JSON.stringify(afterRuEditorial)===JSON.stringify(editorialBaseline));
await page.goto(BASE+'/en/',{waitUntil:'networkidle'});
await page.waitForTimeout(350);
const afterEnEditorial=await sessionTriple();
add('EN Editorial cannot write respondent session',JSON.stringify(afterEnEditorial)===JSON.stringify(editorialBaseline));
add('Editorial routes preserve frozen legacy source',afterEnEditorial.legacy===legacyRaw);

const en2=await systemSnapshot('/en/system/');
add('Measurement item count 180/180',ru2.measurement.items.length===180&&en2.measurement.items.length===180,{ru:ru2.measurement.items.length,en:en2.measurement.items.length});
add('Shared coded-response instrument contract',hash(ru2.measurement.items)===hash(en2.measurement.items),{ru_hash:hash(ru2.measurement.items),en_hash:hash(en2.measurement.items)});
add('Shared module order contract',JSON.stringify(ru2.measurement.modules)===JSON.stringify(en2.measurement.modules));
add('Shared scoring function contract',hash(ru2.measurement.scoring)===hash(en2.measurement.scoring),{ru_hash:hash(ru2.measurement.scoring),en_hash:hash(en2.measurement.scoring)});
add('Same coded response yields same scoring coverage',JSON.stringify(ru2.measurement.sample)===JSON.stringify(en2.measurement.sample));

await browser.close();
const pass=checks.every(c=>c.pass);
const result={document_id:'P120-WEB-REC-PASS3-QA',version:'1.0',status:pass?'PASS':'FAIL',scope:'Shared Instrument / Scoring Contract & Locale-Isolated Sessions',checks,measurement:{item_count:ru2.measurement.items.length,manifest_sha256:hash(ru2.measurement.items),scoring_sha256:hash(ru2.measurement.scoring)},storage:{legacy:LEGACY,ru_session:RU,en_session:EN,ru_editorial:ERU,en_editorial:EEN,migration:'COPY_PRESERVE_LEGACY'}};
fs.writeFileSync(`${outDir}/P120_WEB_RECONCILIATION_PASS3_QA.json`,JSON.stringify(result,null,2));
const md=['# P120 Web Runtime Reconciliation — PASS 3 QA','',`**Status:** ${result.status}`,'',`**Checks:** ${checks.filter(c=>c.pass).length}/${checks.length}`,'',`**Measurement:** ${result.measurement.item_count}/180 · manifest \`${result.measurement.manifest_sha256}\` · scoring \`${result.measurement.scoring_sha256}\``,'','| Check | Result |','|---|---|',...checks.map(c=>`| ${c.id} | ${c.pass?'PASS':'FAIL'} |`)];
fs.writeFileSync(`${outDir}/P120_WEB_RECONCILIATION_PASS3_QA.md`,md.join('\n'));
console.log(JSON.stringify(result,null,2));
if(!pass) process.exit(1);
