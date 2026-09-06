#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT=path.resolve(import.meta.dirname,'..');
const BASE='8437e51b7b862851180e69c4b20ac2741e3bc01e';
const out=path.join(ROOT,'qa-evidence-homepage-pass2');
fs.mkdirSync(out,{recursive:true});
const failures=[];
const checks=[];
const check=(id,ok,detail='')=>{checks.push({id,pass:Boolean(ok),detail});if(!ok)failures.push(id);};
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const git=(...args)=>execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim();

const required=[
  'homepage/homepage-architecture-pass2.js',
  'homepage/homepage-architecture-pass2.css',
  'qa/homepage_pass2_source_authority_gate.json',
  'qa/homepage_pass2_source_authority_gate.mjs',
  'qa/homepage_pass2_static.mjs',
  'qa/homepage_pass2_render.mjs',
  '.github/workflows/p120-homepage-pass2-qa.yml'
];
for(const p of required) check(`exists / ${p}`,fs.existsSync(path.join(ROOT,p)));

const js=read('homepage/homepage-architecture-pass2.js');
const css=read('homepage/homepage-architecture-pass2.css');
const loader=read('mobile-session-resume-v1.0.js');

const ru=[
  'P-120 · ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА',
  'Не один тест. Не один итоговый балл.',
  'многомерная исследовательская архитектура',
  'взрослого эротического, телесного и реляционного опыта',
  'измерение, вычисление, интерпретацию и валидацию',
  'Research Candidate',
  'многомерный профиль',
  'Что такое P-120',
  'Система и её архитектура'
];
const en=[
  'P-120 · RESEARCH ARCHITECTURE',
  'Not one test. Not one final score.',
  'multidimensional research architecture',
  'adult erotic, embodied and relational experience',
  'measurement, computation, interpretation and validation',
  'Research Candidate',
  'multidimensional profile',
  'What P-120 is',
  'System and architecture'
];
for(const text of ru) check(`RU copy / ${text}`,js.includes(text));
for(const text of en) check(`EN copy / ${text}`,js.includes(text));

check('mode declared CONTROLLED_COMPRESSION',js.includes("mode:'CONTROLLED_COMPRESSION'"));
check('Main-only pathname guard',js.includes('isPublicMain')&&js.includes('expectedPath'));
check('About RU/EN routing',js.includes("isEn?'en/about/':'about/'"));
check('single controlled panel authority',js.includes("const PANEL_ATTR='data-p120-homepage-pass2'"));
check('idempotent version guard',js.includes("window.P120HomepageArchitecturePass2?.version==='1.0'"));
check('dynamic rerender observer',js.includes('new MutationObserver(schedule)'));
check('metadata title normalization',js.includes("title:'P-120 — Исследовательская архитектура'")&&js.includes("title:'P-120 — Research Architecture'"));
check('metadata description normalization',js.includes('multidimensional research architecture for structured patterns')&&js.includes('многомерная исследовательская архитектура взрослого'));
check('no iframe',!/<iframe|createElement\(['"]iframe/i.test(js));

const forbiddenRuntime=[
  'P120_INSTRUMENT','P120_SCORE','calculateScore','scoreResponse','supabase','localStorage','sessionStorage','responses','fetch(','XMLHttpRequest','indexedDB'
];
for(const token of forbiddenRuntime) check(`homepage runtime excludes / ${token}`,!js.toLowerCase().includes(token.toLowerCase()));

const forbiddenTransfer=[
  'Core-120','second-order','second order','self-governing','самоуправляем','Founder-governed','Фаундера','orders-of-magnitude','×100','x100','universal compatibility','универсальн% совместимости','causal certainty'
];
for(const token of forbiddenTransfer) check(`prohibited transfer absent / ${token}`,!js.toLowerCase().includes(token.toLowerCase()));

check('loader version unchanged',loader.includes("if(window.P120MobileSessionResume?.version==='1.0') return"));
check('loader retains RU session authority',loader.includes("p120_runtime_session_ru_v1"));
check('loader retains EN session authority',loader.includes("p120_runtime_session_en_v1"));
check('loader adds only Main presentation entrypoint',loader.includes('ensureHomepagePass2')&&loader.includes('homepage/homepage-architecture-pass2.js?v=1'));
check('loader no homepage session write',!loader.includes('localStorage.setItem'));

const braceBalance=(text,open,close)=>[...text].reduce((n,c)=>n+(c===open?1:c===close?-1:0),0);
check('CSS braces balanced',braceBalance(css,'{','}')===0,String(braceBalance(css,'{','}')));
check('CSS mobile breakpoint',css.includes('@media(max-width:430px)'));
check('CSS tablet breakpoint',css.includes('@media(max-width:820px)'));
check('CSS reduced motion',css.includes('@media(prefers-reduced-motion:reduce)'));
check('CSS canonical fonts',css.includes('IBM Plex Sans')&&css.includes('Prata'));

const protectedBlobs={
  'index.html':'88dfc5107ca234420780772844b741d470a4fbf9',
  'en/index.html':'a84b29930d13cd9af56412f79e03174e9d1887c8',
  'why-p120/index.html':'ea04e5105f17e1227d0009f017d9b8cb48cefc71',
  'en/why-p120/index.html':'74da27186b338b7b7d3d56bde33f659b80c765f0',
  'about/index.html':'4d9d3a62aa478820ae5987bca374f434290b4fc9',
  'en/about/index.html':'edc117a1991e9caa45ba12c623e32c25ce5a2a01',
  'science/index.html':'c830808b3fff3e3975aedbcc673b2704978e43d3',
  'en/science/index.html':'ba8480744c6b790f408cb50d3fd650d043a04f33',
  'system/index.html':'ad95e98eeb8b6ec228ed221d54fdc31d550caf6e',
  'en/system/index.html':'56e8e96a627f15f8bb5ca5b87bbc1e178a9b7426'
};
for(const [p,expected] of Object.entries(protectedBlobs)){
  let actual='';
  try{actual=git('rev-parse',`HEAD:${p}`);}catch{actual='ERROR';}
  check(`protected blob unchanged / ${p}`,actual===expected,actual);
}

const changed=git('diff','--name-only',`${BASE}...HEAD`).split(/\r?\n/).filter(Boolean);
const allowed=p=>[
  'homepage/',
  'qa/homepage_pass2_',
  '.github/workflows/p120-homepage-pass2-',
  'mobile-session-resume-v1.0.js',
  'P120_HOMEPAGE_IMPLEMENTATION_PASS2_'
].some(prefix=>p.startsWith(prefix));
for(const p of changed) check(`authorized delta / ${p}`,allowed(p),p);
check('root homepage source unchanged',!changed.includes('index.html'));
check('EN homepage source unchanged',!changed.includes('en/index.html'));
check('Why frozen sources untouched',!changed.some(p=>p.startsWith('why-p120/')||p.startsWith('en/why-p120/')));
check('measurement/localization sources untouched',!changed.some(p=>p.startsWith('localization/')));
check('Supabase untouched',!changed.some(p=>p.startsWith('supabase/')));

const result={schema:'p120.homepage.implementation_pass2.static.v1',baseline:BASE,generated_at:new Date().toISOString(),changed_files:changed,checks,failures,verdict:failures.length?'FAIL':'PASS'};
fs.writeFileSync(path.join(out,'static.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({verdict:result.verdict,checks:checks.length,failures},null,2));
if(failures.length) process.exit(1);
