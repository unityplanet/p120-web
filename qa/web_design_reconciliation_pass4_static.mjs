import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT=path.resolve(import.meta.dirname,'..');
const BASE='9597b819679baa261f63d91a34102c7e7a207e45';
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const git=(...args)=>execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim();
const report=[];
function check(name,ok,detail=''){report.push({name,ok:!!ok,detail});if(!ok)console.error(`FAIL ${name}${detail?` — ${detail}`:''}`);else console.log(`PASS ${name}`);}

const js=read('homepage/homepage-design-reconciliation-pass4.js');
const css=read('homepage/homepage-design-reconciliation-pass4.css');
const loader=read('mobile-session-resume-v1.0.js');
const baselineLoader=git('show',`${BASE}:mobile-session-resume-v1.0.js`);

check('BASE_RESOLVES',!!git('rev-parse','--verify',BASE));

const sceneMarkers=[
  'data-p120-home-scene="human-entry"',
  'data-p120-home-scene="definition"',
  'data-p120-home-scene="human-atlas"',
  'data-p120-home-scene="system-depth"',
  'data-p120-home-scene="route-map"',
  'data-p120-home-scene="synthetic-example"',
  'data-p120-home-scene="research-boundary"',
  'data-p120-home-scene="entry-point"'
];
let prev=-1;
for(const marker of sceneMarkers){const idx=js.indexOf(marker);check(`SCENE_PRESENT_${marker}`,idx>=0);check(`SCENE_ORDER_${marker}`,idx>prev);prev=idx;}
check('SCENE_COUNT_8',sceneMarkers.every(x=>js.includes(x)));
check('KUZMICH_HUMAN_ENTRY_RU',js.includes('Почему один человек может затронуть нас сильнее другого?'));
check('KUZMICH_HUMAN_ENTRY_EN',js.includes('Why can one person affect us more deeply than another?'));
check('SYSTEM_DEFINITION_RU',js.includes('Не один тест. Система исследований.'));
check('SYSTEM_DEFINITION_EN',js.includes('Not one test. A system of studies.'));
check('ONE_SYNTHETIC_EXAMPLE_ONLY',js.match(/data-p120-home-scene=\\"synthetic-example\\"/g)?.length===1||js.match(/data-p120-home-scene="synthetic-example"/g)?.length===1);
check('SYNTHETIC_BOUNDARY_RU',js.includes('не валидированная типология')&&js.includes('не результат реального участника'));
check('SYNTHETIC_BOUNDARY_EN',js.includes('not a validated typology')&&js.includes('not a real participant result'));
check('RESEARCH_BOUNDARY_PRESENT',js.includes('P-120 не делает')&&js.includes('P-120 does not'));
check('HGCGA_ROUTE_PRESENT',js.includes('research/how-we-decide/'));
check('ROUTE_SURFACES_PRESENT',['about/','why-p120/','creator/','science/','extended/','together/'].every(x=>js.includes(x)));
check('READ_ONLY_RESUME_API',js.includes('P120MobileSessionResume?.getEligibility?.()'));
check('NO_LOCALSTORAGE_WRITE',!js.includes('localStorage.setItem')&&!js.includes('localStorage.removeItem')&&!js.includes('sessionStorage.setItem'));
check('NO_RUNTIME_STATE_WRITE',!/(?:state|session)\s*\.[A-Za-z_$][\w$]*\s*=/.test(js));
check('NO_SCORING_AUTHORITY',!/(score|threshold|scoring)\s*=\s*(?:function|\(|\{|\[)/i.test(js));
check('NO_SUPABASE_AUTHORITY',!/(supabase|auth\/v1|rls)/i.test(js));
check('PUBLIC_ROOT_GUARD',js.includes('isPublicMain')&&js.includes("document.querySelector('.editorial-home')"));
check('PASS4_LOADER_TARGET',loader.includes('homepage/homepage-design-reconciliation-pass4.js?v=1'));
check('PASS2_LOADER_RETIRED_FROM_SEAM',!loader.includes('homepage/homepage-architecture-pass2.js?v=1'));

function sliceCore(text){const a=text.indexOf('function parseSession(){');const b=text.indexOf('function schedule(){');return a>=0&&b>a?text.slice(a,b):'';}
check('SESSION_CORE_BYTE_PRESERVED',sliceCore(loader)===sliceCore(baselineLoader));
check('SESSION_KEYS_PRESERVED',loader.includes("p120_runtime_session_en_v1")&&loader.includes("p120_runtime_session_ru_v1"));
check('SYSTEM_TARGET_PRESERVED',loader.includes("const systemUrl=new URL(isEn?'en/system/':'system/',rootUrl).href"));

check('CSS_CANONICAL_FONT_ROLES',[
  '--p120-home4-display:var(--p120-vg-display',
  '--p120-home4-reading:var(--p120-vg-reading',
  '--p120-home4-literary:var(--p120-vg-literary',
  '--p120-home4-functional:var(--p120-vg-functional',
  '--p120-home4-technical:var(--p120-vg-technical'
].every(x=>css.includes(x)));
check('CSS_CANONICAL_PALETTE_ALIASES',[
  '--p120-brand-canvas','--p120-brand-surface','--p120-brand-surface-soft','--p120-brand-teal-deep','--p120-brand-ink','--p120-brand-line'
].every(x=>css.includes(x)));
check('CSS_REDUCED_MOTION',css.includes('@media(prefers-reduced-motion:reduce)'));
check('CSS_ROUTE_SCOPED',!css.includes('.hgcga-')&&!css.includes('.science-hero')&&!css.includes('.question-card'));

const changed=git('diff','--name-only',`${BASE}...HEAD`).split(/\r?\n/).filter(Boolean);
const allowed=[
  'homepage/homepage-design-reconciliation-pass4.js',
  'homepage/homepage-design-reconciliation-pass4.css',
  'mobile-session-resume-v1.0.js',
  'qa/web_design_reconciliation_pass4_static.mjs',
  'qa/web_design_reconciliation_pass4_render.mjs',
  '.github/workflows/p120-web-design-reconciliation-pass4.yml',
  'P120_WEB_DESIGN_RECONCILIATION_PASS4.md',
  'P120_WEB_DESIGN_RECONCILIATION_PASS4_CLOSURE.md'
];
check('CHANGESET_SCOPE',changed.every(p=>allowed.includes(p)),changed.filter(p=>!allowed.includes(p)).join(', '));
check('INDEX_HTML_UNCHANGED',!changed.includes('index.html'));
check('SYSTEM_UNCHANGED',!changed.some(p=>p==='system'||p.startsWith('system/')));
check('SCIENCE_UNCHANGED',!changed.some(p=>p==='science'||p.startsWith('science/')));
check('WHY_UNCHANGED',!changed.some(p=>p==='why-p120'||p.startsWith('why-p120/')));
check('HGCGA_RU_UNCHANGED',!changed.some(p=>p.startsWith('research/how-we-decide/')));
check('HGCGA_EN_UNCHANGED',!changed.some(p=>p.startsWith('en/research/how-we-decide/')));

const evidenceDir=path.join(ROOT,'qa-evidence-web-design-pass4');
fs.mkdirSync(evidenceDir,{recursive:true});
const out={schema:'p120.web_design_reconciliation.pass4.static.v1',base:BASE,head:git('rev-parse','HEAD'),changed,passed:report.filter(x=>x.ok).length,failed:report.filter(x=>!x.ok).length,checks:report};
fs.writeFileSync(path.join(evidenceDir,'static-gate.json'),JSON.stringify(out,null,2)+'\n');
if(out.failed)process.exit(1);
