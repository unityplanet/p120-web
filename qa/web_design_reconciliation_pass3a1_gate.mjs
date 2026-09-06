import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const BASELINE='8756e23e2d2831e58e4a36aa5ec8718985ba3999';
const ROOT=process.cwd();
const OUT=path.join(ROOT,'qa-evidence-web-design-pass3a1');
fs.mkdirSync(OUT,{recursive:true});

const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const git=(...args)=>execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim();
const checks=[];
const check=(id,pass,detail='')=>checks.push({id,pass:Boolean(pass),detail});
const blob=p=>git('rev-parse',`HEAD:${p}`);
const baselineBlob=p=>git('rev-parse',`${BASELINE}:${p}`);

const visual=read('p120-visual-grammar-v1.0.css');
const instrument=read('p120-instrument-shell-v1.0.css');
const ru=read('research/how-we-decide/index.html');
const en=read('en/research/how-we-decide/index.html');

const expectedBlobs={
  'research/how-we-decide/index.html':'15cb691f9d5acc137d228c32cc768ed4bfe3f9f5',
  'research/how-we-decide/how-we-decide-human-relevance-v1.0.css':'959904e56d9553164d937156894933398c6b2d75',
  'research/how-we-decide/how-we-decide-v0.2.css':'5f6f8b06bfc46abd05ccdc6558b2173089d7eba1',
  'research/how-we-decide/how-we-decide-v0.2.js':'08f4327eb1bc9d3ad298166103ab9b1c947481a7',
  'en/research/how-we-decide/index.html':'40e48ad74371324a3d9f783cae2c7cc85e1e122f',
  'p120-brand-system-v1.0.css':'fc19106f89789c77355fce74dc7ff9cd8d74aedd'
};
for(const [p,sha] of Object.entries(expectedBlobs)){
  check(`BLOB_${p.replace(/[^a-z0-9]/gi,'_').toUpperCase()}`,blob(p)===sha,`${p} must remain at PASS 1I blob ${sha}`);
  check(`BASELINE_MATCH_${p.replace(/[^a-z0-9]/gi,'_').toUpperCase()}`,blob(p)===baselineBlob(p),`${p} must be byte-identical to ${BASELINE}`);
}

const markers=[
  'data-part="human-entry"',
  'data-example="relationship"',
  'data-example="relocation"',
  'data-example="supplier"',
  'data-part="synthesis"',
  'data-part="authority-close"'
];
const orderCheck=(html)=>{
  const positions=markers.map(m=>html.indexOf(m));
  return positions.every((p,i)=>p>=0&&(i===0||p>positions[i-1]));
};
check('RU_FROZEN_SEMANTIC_ORDER',orderCheck(ru),'Human Entry → Relationship → Relocation → Supplier → Synthesis → Human Authority Close');
check('EN_FROZEN_SEMANTIC_ORDER',orderCheck(en),'Human Entry → Relationship → Relocation → Supplier → Synthesis → Human Authority Close');
for(const m of markers){
  const key=m.replace(/[^a-z0-9]/gi,'_').toUpperCase();
  check(`RU_MARKER_${key}`,ru.includes(m),`RU contains ${m}`);
  check(`EN_MARKER_${key}`,en.includes(m),`EN contains ${m}`);
}

check('DERIVED_RESEARCH_FAMILY',visual.includes('data-p120-page-kind="research/how-we-decide"')&&visual.includes('--p120-family-kind:derived-research'),'HG-CGA is admitted as Derived Research family.');
check('VISUAL_GRAMMAR_OPT_IN',visual.includes('adoption remains opt-in')||visual.includes('adoption remains opt-in until'),'Shared grammar is not self-activating.');

for(const forbidden of ['.hgcga-','.decision-field','.example-section','.grammar-grid','.supplier-list','.authority-close','[data-example=','[data-part=']){
  check(`NO_HGCGA_SELECTOR_LEAK_${forbidden.replace(/[^a-z0-9]/gi,'_').toUpperCase()}`,!visual.includes(forbidden)&&!instrument.includes(forbidden),`Shared authorities do not own HG-CGA route selector ${forbidden}`);
}

const changed=git('diff','--name-only',BASELINE,'HEAD').split(/\r?\n/).filter(Boolean);
const allowed=new Set([
  'p120-visual-grammar-v1.0.css',
  'p120-instrument-shell-v1.0.css',
  'P120_HGCGA_DESIGN_UNIFICATION_INPUT_PASS1I_FREEZE.md',
  'P120_WEB_DESIGN_RECONCILIATION_PASS3A1.md',
  'P120_WEB_DESIGN_RECONCILIATION_PASS3A1_CLOSURE.md',
  'qa/web_design_reconciliation_pass3a1_gate.mjs',
  '.github/workflows/p120-web-design-reconciliation-pass3a1.yml'
]);
check('CHANGESET_SCOPE',changed.every(p=>allowed.has(p)),`Changed paths: ${changed.join(', ')}`);

for(const protectedPath of [
  'research/how-we-decide',
  'en/research/how-we-decide',
  'p120-brand-system-v1.0.css',
  'p120-brand-system-v1.0.js',
  'why-p120',
  'en/why-p120',
  'science',
  'en/science',
  'system',
  'en/system'
]){
  let diff='';
  try{diff=git('diff','--name-only',BASELINE,'HEAD','--',protectedPath);}catch(_){diff='ERROR';}
  check(`PRESERVE_${protectedPath.replace(/[^a-z0-9]/gi,'_').toUpperCase()}`,diff==='',`No PASS 3A.1 mutation: ${protectedPath}`);
}

const brand=read('p120-brand-system-v1.0.css');
check('NO_GLOBAL_GRAMMAR_ACTIVATION',!brand.includes('p120-visual-grammar-v1.0.css')&&!brand.includes('p120-instrument-shell-v1.0.css'),'PASS 3A.1 does not alter live Brand 5.3 loading.');

const pass=checks.every(c=>c.pass);
const result={
  document_id:'P120-WEB-DESIGN-REC-PASS3A1-QA',
  version:'1.0',
  baseline:BASELINE,
  head:git('rev-parse','HEAD'),
  status:pass?'PASS':'FAIL',
  scope:'POST-PASS-1I HG-CGA BASELINE RECONCILIATION',
  hgcga_authority:'HG-CGA-WEB-HR-MB-001 v1.0',
  frozen_sequence:'Human Entry → Relationship PRIMARY → Relocation SECONDARY → Supplier TRANSFERABILITY → Synthesis → Human Authority Close',
  live_route_mutation:'NONE',
  scientific_authority_changes:'NONE',
  respondent_runtime_changes:'NONE',
  checks,
  failures:checks.filter(c=>!c.pass).map(c=>c.id)
};
fs.writeFileSync(path.join(OUT,'P120_WEB_DESIGN_PASS3A1_QA.json'),JSON.stringify(result,null,2));
fs.writeFileSync(path.join(OUT,'P120_WEB_DESIGN_PASS3A1_QA.md'),[
  '# P-120 WEB DESIGN RECONCILIATION PASS 3A.1 — QA','',
  `**Status:** ${result.status}`,
  `**Baseline:** \`${BASELINE}\``,
  `**Head:** \`${result.head}\``,
  `**HG-CGA authority:** \`${result.hgcga_authority}\``,
  '',
  '| Check | Status |','|---|---|',
  ...checks.map(c=>`| ${c.id} | ${c.pass?'PASS':'FAIL'} |`),
  '',`Failures: ${result.failures.length?result.failures.join(', '):'NONE'}`
].join('\n'));
console.log(JSON.stringify(result,null,2));
if(!pass) process.exit(1);
