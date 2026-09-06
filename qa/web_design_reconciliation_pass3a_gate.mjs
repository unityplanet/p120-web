import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const BASELINE='cf11a176bb0db87aec046d5694c302285b275f90';
const ROOT=process.cwd();
const OUT=path.join(ROOT,'qa-evidence-web-design-pass3a');
fs.mkdirSync(OUT,{recursive:true});

const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const git=(...args)=>execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim();
const checks=[];
const check=(id,pass,detail='')=>checks.push({id,pass:Boolean(pass),detail});
const braces=s=>[...s].reduce((n,c)=>n+(c==='{')-(c==='}'),0)===0;

const brand=read('p120-brand-system-v1.0.css');
const visual=read('p120-visual-grammar-v1.0.css');
const instrument=read('p120-instrument-shell-v1.0.css');
const sysRu=read('system/index.html');
const sysEn=read('en/system/index.html');

const importHeader='@import url("./p120-visual-grammar-v1.0.css?v=3a1");\n@import url("./p120-instrument-shell-v1.0.css?v=3a1");\n\n';
check('BOOTSTRAP_IMPORT_ORDER',brand.startsWith(importHeader),'Canonical brand CSS loads visual grammar then Instrument Shell before all rules.');

const baselineBrand=git('show',`${BASELINE}:p120-brand-system-v1.0.css`);
check('BRAND53_BYTE_PRESERVATION_AFTER_IMPORT',brand.slice(importHeader.length).trimEnd()===baselineBrand.trimEnd(),'Brand 5.3 body is byte-equivalent after removing the PASS 3A import header.');

check('VISUAL_GRAMMAR_SYNTAX_BALANCE',braces(visual),'Balanced CSS braces.');
check('INSTRUMENT_SHELL_SYNTAX_BALANCE',braces(instrument),'Balanced CSS braces.');

for(const token of ['Noto Serif Display','Noto Serif','Prata','IBM Plex Sans','IBM Plex Mono']){
  check(`FONT_ROLE_${token.replaceAll(' ','_').toUpperCase()}`,visual.includes(token),`Canonical role present: ${token}`);
}
for(const forbidden of ['Arial','Calibri','Inter','JetBrains','Noto Sans Mono']){
  check(`NO_NEW_FONT_${forbidden.replaceAll(' ','_').toUpperCase()}`,!visual.includes(forbidden)&&!instrument.includes(forbidden),`No non-canonical font introduced: ${forbidden}`);
}

for(const kind of ['main','about','why-p120','creator','extended','together','science','privacy','terms','intellectual-property','contact']){
  check(`PAGE_KIND_${kind.toUpperCase().replaceAll('-','_')}`,visual.includes(`data-p120-page-kind="${kind}"`),`Existing Brand 5.3 page-kind marker mapped: ${kind}`);
}
check('INSTRUMENT_ROUTE_MARKER',instrument.includes('body[data-p120-page="system"]')&&visual.includes('body[data-p120-page="system"]'),'Native System marker binds Instrument/System family without new runtime.');

for(const [locale,src] of [['RU',sysRu],['EN',sysEn]]){
  check(`${locale}_SYSTEM_NATIVE_MARKER`,src.includes('data-p120-page="system"'),`${locale} native System marker preserved.`);
  check(`${locale}_SYSTEM_NO_BRAND_JS`,!src.includes('p120-brand-system-v1.0.js'),`${locale} System does not acquire public brand JS runtime.`);
  check(`${locale}_SYSTEM_NO_PUBLIC_RUNTIME`,!src.includes('p120-public-runtime-v1.0.js'),`${locale} System remains isolated from generated public runtime.`);
}

const routeLeakage=['.about-','.founder-','.explore-','.wp-','.science-','.question-card','.choice','.navlink','.topbar'];
for(const selector of routeLeakage){
  check(`NO_ROUTE_LEAK_${selector.replace(/[^a-z0-9]/gi,'_').toUpperCase()}`,!visual.includes(selector)&&!instrument.includes(selector),`Shared PASS 3A sheets do not target existing local selector ${selector}`);
}

const changed=git('diff','--name-only',`${BASELINE}...HEAD`).split(/\r?\n/).filter(Boolean);
const allowed=new Set([
  'p120-brand-system-v1.0.css',
  'p120-visual-grammar-v1.0.css',
  'p120-instrument-shell-v1.0.css',
  'qa/web_design_reconciliation_pass3a_gate.mjs',
  '.github/workflows/p120-web-design-reconciliation-pass3a.yml',
  'P120_WEB_DESIGN_RECONCILIATION_PASS3A_IMPLEMENTATION.md',
  'P120_WEB_DESIGN_RECONCILIATION_PASS3A_CLOSURE.md'
]);
check('CHANGESET_SCOPE',changed.every(p=>allowed.has(p)),`Changed paths: ${changed.join(', ')}`);

for(const protectedPath of ['why-p120','en/why-p120','about/index.html','en/about/index.html','creator/index.html','en/creator/index.html','extended/index.html','en/extended/index.html','together/index.html','en/together/index.html','system/index.html','en/system/index.html','science/index.html','en/science/index.html','p120-public-runtime-v1.0.js','p120-public-styles-v1.0.css']){
  let diff='';
  try{diff=git('diff','--name-only',BASELINE,'HEAD','--',protectedPath);}catch(_){diff='ERROR';}
  check(`PRESERVE_${protectedPath.replace(/[^a-z0-9]/gi,'_').toUpperCase()}`,diff==='',`No PASS 3A mutation: ${protectedPath}`);
}

const pass=checks.every(c=>c.pass);
const result={
  document_id:'P120-WEB-DESIGN-REC-PASS3A-QA',
  version:'1.0',
  baseline:BASELINE,
  head:git('rev-parse','HEAD'),
  status:pass?'PASS':'FAIL',
  scope:'Shared Shell Implementation, Visual-Grammar Bootstrap & Regression Lock',
  production_runtime_changes:'NONE',
  measurement_scoring_changes:'NONE',
  scientific_authority_changes:'NONE',
  respondent_session_changes:'NONE',
  checks,
  failures:checks.filter(c=>!c.pass).map(c=>c.id)
};
fs.writeFileSync(path.join(OUT,'P120_WEB_DESIGN_PASS3A_QA.json'),JSON.stringify(result,null,2));
const md=[
  '# P-120 WEB DESIGN RECONCILIATION PASS 3A — QA',
  '',
  `**Status:** ${result.status}`,
  `**Baseline:** \`${BASELINE}\``,
  `**Head:** \`${result.head}\``,
  '',
  '| Check | Status |',
  '|---|---|',
  ...checks.map(c=>`| ${c.id} | ${c.pass?'PASS':'FAIL'} |`),
  '',
  `Failures: ${result.failures.length?result.failures.join(', '):'NONE'}`
];
fs.writeFileSync(path.join(OUT,'P120_WEB_DESIGN_PASS3A_QA.md'),md.join('\n'));
console.log(JSON.stringify(result,null,2));
if(!pass) process.exit(1);
