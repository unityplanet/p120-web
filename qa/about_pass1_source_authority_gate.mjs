#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const gatePath=path.join(ROOT,'qa/about_pass1_source_authority_gate.json');
const failures=[];
const checks=[];
const check=(id,condition,detail='')=>{const pass=Boolean(condition);checks.push({id,pass,detail});if(!pass)failures.push(id);};

check('gate.file.exists',fs.existsSync(gatePath));
let gate={};
try{gate=JSON.parse(fs.readFileSync(gatePath,'utf8'));check('gate.json.parse',true);}catch(e){check('gate.json.parse',false,String(e));}

const source=gate.source_authority||{};
const rec=gate.reconciliation||{};
const nc=gate.no_change_from_source_freeze||{};

check('source.document_id',source.document_id==='P120-ARCH-SYS-001',source.document_id);
check('source.version',source.version==='v1.0',source.version);
check('source.pass10',source.pass==='PASS 10 — Final Reconciliation / Freeze Recommendation',source.pass);
check('source.status',source.status==='PASS / CLOSED / CONTROLLED / SEALED',source.status);
check('source.freeze',source.freeze_decision==='FREEZE APPROVED',source.freeze_decision);
check('source.authority',source.authority_state==='FROZEN / CANONICAL SYSTEM AUTHORITY / EFFECTIVE',source.authority_state);
check('source.package_hash',source.final_package_sha256==='7e389b53a4575df2f3214a3050d029134562d9e9a19514230ecdc51822a22dcd',source.final_package_sha256);
check('source.controlled_files',source.controlled_files===63,String(source.controlled_files));

check('reconciliation.pass8',rec.pass8_terminology_authority==='BOUND',rec.pass8_terminology_authority);
check('reconciliation.pass9',rec.pass9_derivative_mapping==='BOUND',rec.pass9_derivative_mapping);
check('reconciliation.pass10',rec.pass10_final_master_authority==='BOUND',rec.pass10_final_master_authority);
check('reconciliation.no_material_correction',rec.material_correction_required_for_about===false,String(rec.material_correction_required_for_about));
check('reconciliation.source_hold_cleared',rec.release_hold_due_to_source_authority==='CLEARED',rec.release_hold_due_to_source_authority);

for(const key of ['measurement','scoring','thresholds','evidence_status','safety_privacy','governance_ontology','scientific_status_research_candidate']){
  check(`no_change.${key}`,nc[key]===true,String(nc[key]));
}

const result={
  schema:'p120.about.pass1.source-authority-gate.result.v1',
  generated_at:new Date().toISOString(),
  checks,
  failures,
  verdict:failures.length?'FAIL':'PASS'
};
fs.mkdirSync(path.join(ROOT,'qa-evidence-about-pass1'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'qa-evidence-about-pass1','source-authority-gate.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({verdict:result.verdict,checks:checks.length,failures},null,2));
if(failures.length)process.exit(1);
