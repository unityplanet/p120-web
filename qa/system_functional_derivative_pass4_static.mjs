import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const ROOT=process.cwd();
const BASELINE='d656835b2926f0fd7aede2606bb5da8b99841e25';
const RU_SYSTEM_BLOB='ad95e98eeb8b6ec228ed221d54fdc31d550caf6e';
const EN_SYSTEM_BLOB='56e8e96a627f15f8bb5ca5b87bbc1e178a9b7426';
const ROUTE_GUARD_PREFIX_SHA256='b5fd957b6236e670a6e451bd02c9e97d4e8e34d256720e3e9f9dbbee13eaf2d6';
const MARKER='/* P-120 Architecture Narrative — System Functional / Strategic Derivative PASS 4 v1.0';
const OUT=path.join(ROOT,'qa-evidence-system-pass4');
fs.mkdirSync(OUT,{recursive:true});

const failures=[];
const checks=[];
const check=(label,ok,detail=null)=>{checks.push({label,ok,detail});if(!ok)failures.push({label,detail});};
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const sha256=s=>crypto.createHash('sha256').update(s).digest('hex');
const blob=p=>execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim();

const guard=read('p120-system-route-guard-v1.0.js');
const ru=read('system/index.html');
const en=read('en/system/index.html');

check('RU System HTML remains byte-identical to entry production baseline',blob('system/index.html')===RU_SYSTEM_BLOB,{actual:blob('system/index.html'),expected:RU_SYSTEM_BLOB});
check('EN System HTML remains byte-identical to entry production baseline',blob('en/system/index.html')===EN_SYSTEM_BLOB,{actual:blob('en/system/index.html'),expected:EN_SYSTEM_BLOB});

const markerIndex=guard.indexOf(MARKER);
check('PASS 4 marker exists exactly once',markerIndex>=0&&guard.indexOf(MARKER,markerIndex+1)===-1,{markerIndex});
if(markerIndex>=0){
  let prefix=guard.slice(0,markerIndex);
  if(prefix.endsWith('\n\n')) prefix=prefix.slice(0,-1);
  check('Pre-existing System Route Guard bytes are preserved',sha256(prefix)===ROUTE_GUARD_PREFIX_SHA256,{actual:sha256(prefix),expected:ROUTE_GUARD_PREFIX_SHA256});
}

const required=[
  'Что происходит с вашими ответами.',
  'Ответ','Измерение','Вычисление','Интерпретация','Статус знания',
  'What happens to your answers.',
  'Response','Measurement','Computation','Interpretation','Evidence status',
  'Research Candidate',
  'не превращаются в один общий «балл сексуальности»',
  'not collapsed into one overall “sexuality score.”',
  'не является диагнозом',
  'is not a diagnosis',
  'не устанавливает совместимость конкретной пары по данным одного человека',
  'cannot establish the compatibility of a specific couple from one person’s data',
  'data-p120-system-functional-derivative="pass4-v1.0"'
];
for(const token of required) check(`controlled derivative token: ${token}`,guard.includes(token));

check('RU About route remains project-prefix-safe',guard.includes("href:'about/'"));
check('EN About route remains project-prefix-safe',guard.includes("href:'en/about/'"));
check('Derivative is preflight-only',guard.includes("document.querySelector('.luxury-preflight .preflight-main')")&&guard.includes("main.querySelector('.luxury-ritual-grid')"));
check('Derivative is idempotent',guard.includes("main.querySelector('[data-p120-system-functional-derivative=\"pass4-v1.0\"]')")&&guard.includes("P120SystemFunctionalDerivative?.version==='1.0'"));

const appended=markerIndex>=0?guard.slice(markerIndex):'';
const forbiddenRuntime=[
  'localStorage','sessionStorage','indexedDB','XMLHttpRequest','fetch(',
  'window.P120_INSTRUMENT','window.P120_SCORING','buildPrototypeResult','/api/',
  'state.responses','P120_SESSION_KEY','createClient('
];
for(const token of forbiddenRuntime) check(`no protected runtime access: ${token}`,!appended.includes(token));

check('No questionnaire source mutation marker introduced',!appended.includes('window.P120_INSTRUMENT ='));
check('No score or threshold engine mutation introduced',!appended.includes('scoring.js')&&!appended.includes('scoreDomain')&&!appended.includes('thresholdMap'));
check('No respondent controls are rebound',!appended.includes("querySelector('#consent')")&&!appended.includes("querySelector('#start')")&&!appended.includes("getElementById('consent')")&&!appended.includes("getElementById('start')"));

check('RU System still owns canonical frozen respondent runtime',ru.includes('data-p120-runtime="frozen"')&&ru.includes('p120_runtime_session_ru_v1'));
check('EN System still owns canonical frozen respondent runtime',en.includes('data-p120-runtime="frozen"')&&en.includes('p120_runtime_session_en_v1'));
check('RU disclaimer retained',ru.includes('Результат не является диагнозом, не определяет сексуальную ориентацию и не устанавливает психологическую травму.'));
check('EN route retains controlled native locale identity',en.includes('data-p120-locale="en"')&&en.includes('data-p120-route-authority="native-en"'));

const changed=execFileSync('git',['diff','--name-only',BASELINE,'HEAD'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const allowed=p=>p==='p120-system-route-guard-v1.0.js'||p.startsWith('qa/system_functional_derivative_pass4_')||p.startsWith('.github/workflows/p120-system-functional-derivative-pass4')||p.startsWith('P120_SYSTEM_IMPLEMENTATION_PASS4_');
check('PASS 4 delta remains within controlled allowlist',changed.every(allowed),{changed});

const result={schema:'p120.system.functional_derivative.pass4.static.v1',baseline:BASELINE,verdict:failures.length?'FAIL':'PASS',checks:checks.length,failures,changed};
fs.writeFileSync(path.join(OUT,'static-result.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(failures.length) process.exit(1);
