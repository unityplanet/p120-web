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

const legacyState={participantId:'P120-PASS3-LEGACY',screen:'test',itemIndex:1,responses:{SAT01:4},adminModes:{},telemetry:[{type:'legacy_seed',at:'2026-09-02T00:00:00.000Z'}],startedAt:'2026-09-02T00:00:00.000Z',consentAt:'2026-09-02T00:00:01.000Z',lastSavedAt:'2026-09-02T00:00:02.000Z'};
await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
await page.evaluate(([k,v,ru,en,eru,een])=>{localStorage.clear();localStorage.setItem(k,JSON.stringify(v));localStorage.removeItem(ru);localStorage.removeItem(en);localStorage.removeItem(eru);localStorage.removeItem(een);},[LEGACY,legacyState,RU,EN,ERU,EEN]);
const legacyRaw=await page.evaluate(k=>localStorage.getItem(k),LEGACY);

async function systemSnapshot(route){
  await page.goto(BASE+route,{waitUntil:'networkidle'});
  return await page.evaluate(({legacy,ru,en})=>({
    path:location.pathname,
    lang:document.documentElement.lang,
    contract:window.P120_SESSION_CONTRACT||null,
    legacy:localStorage.getItem(legacy),
    ru:localStorage.getItem(ru),
    en:localStorage.getItem(en),
    measurement:{
      items:(window.P120_INSTRUMENT?.items||[]).map(i=>[i.id,i.module,i.type,(i.choices||[]).map(c=>c.value)]),
      modules:(window.P120_INSTRUMENT?.modules||[]).map(m=>m.id),
      scoring:{
        moduleOrder:window.P120Scoring?.moduleOrder||null,
        coverage:String(window.P120Scoring?.coverage||''),
        buildPrototypeResult:String(window.P120Scoring?.buildPrototypeResult||'')
      },
      sample:window.P120Scoring?.coverage?window.P120Scoring.coverage({SAT01:4},window.P120_INSTRUMENT):null
    }
  }),{legacy:LEGACY,ru:RU,en:EN});
}
const sessionTriple=()=>page.evaluate(({legacy,ru,en})=>({legacy:localStorage.getItem(legacy),ru:localStorage.getItem(ru),en:localStorage.getItem(en)}),{legacy:LEGACY,ru:RU,en:EN});

const ru1=await systemSnapshot('/system/');
const ruState1=JSON.parse(ru1.ru||'null');
add('RU contract selects RU session',ru1.contract?.locale==='ru'&&ru1.contract?.sessionKey===RU,{contract:ru1.contract});
add('RU migration preserves legacy payload',ruState1?.responses?.SAT01===4&&ruState1?.sessionLocale==='ru',{sessionLocale:ruState1?.sessionLocale});
add('RU migration does not delete or mutate legacy',ru1.legacy===legacyRaw);
add('RU visit does not create EN session',ru1.en===null);

// Persist a RU-only mutation into the app's in-memory state by reloading the same locale
// before navigating away; otherwise beforeunload would correctly save the pre-mutation state.
await page.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));s.responses.SAT02=5;localStorage.setItem(k,JSON.stringify(s));},RU);
await page.reload({waitUntil:'networkidle'});
const ruPersisted=JSON.parse(await page.evaluate(k=>localStorage.getItem(k),RU));
add('RU-only write is accepted by RU session',ruPersisted?.responses?.SAT02===5);

const en1=await systemSnapshot('/en/system/');
const enState1=JSON.parse(en1.en||'null');
const ruStateAfterEn=JSON.parse(en1.ru||'null');
add('EN contract selects EN session',en1.contract?.locale==='en'&&en1.contract?.sessionKey===EN,{contract:en1.contract});
add('EN migration preserves legacy answer',enState1?.responses?.SAT01===4);
add('EN session does not inherit later RU-only write',enState1?.responses?.SAT02===undefined);
add('RU session survives EN initialization',ruStateAfterEn?.responses?.SAT02===5);
add('EN migration does not mutate legacy',en1.legacy===legacyRaw);

await page.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));s.responses.SAT03=2;localStorage.setItem(k,JSON.stringify(s));},EN);
await page.reload({waitUntil:'networkidle'});
const enPersisted=JSON.parse(await page.evaluate(k=>localStorage.getItem(k),EN));
add('EN-only write is accepted by EN session',enPersisted?.responses?.SAT03===2);

const ru2=await systemSnapshot('/system/');
const ruState2=JSON.parse(ru2.ru||'null');
const enState2=JSON.parse(ru2.en||'null');
add('RU session excludes EN-only write',ruState2?.responses?.SAT03===undefined);
add('EN-only write remains in EN session',enState2?.responses?.SAT03===2);

// Enter Editorial first; the System beforeunload save is legitimate. From this point onward,
// Editorial must not mutate legacy/RU/EN respondent storage.
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
