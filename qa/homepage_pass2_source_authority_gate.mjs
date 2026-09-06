#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT=path.resolve(import.meta.dirname,'..');
const gate=JSON.parse(fs.readFileSync(path.join(ROOT,'qa','homepage_pass2_source_authority_gate.json'),'utf8'));
const failures=[];
const checks=[];
const check=(id,ok,detail='')=>{checks.push({id,pass:Boolean(ok),detail});if(!ok)failures.push(id);};

check('target surface',gate.target_surface==='Homepage/Main',gate.target_surface);
check('inheritance mode',gate.inheritance_mode==='CONTROLLED_COMPRESSION',gate.inheritance_mode);
check('source document',gate.source_authority?.document_id==='P120-ARCH-SYS-001',gate.source_authority?.document_id);
check('source version',gate.source_authority?.version==='v1.0',gate.source_authority?.version);
check('PASS 10 sealed',gate.source_authority?.pass10_status==='PASS / CLOSED / CONTROLLED / SEALED',gate.source_authority?.pass10_status);
check('freeze approved',gate.source_authority?.freeze_decision==='FREEZE APPROVED',gate.source_authority?.freeze_decision);
check('canonical authority effective',gate.source_authority?.authority_state==='FROZEN / CANONICAL SYSTEM AUTHORITY / EFFECTIVE',gate.source_authority?.authority_state);
check('source package digest',gate.source_authority?.package_sha256==='7e389b53a4575df2f3214a3050d029134562d9e9a19514230ecdc51822a22dcd',gate.source_authority?.package_sha256);
check('controlled source files',gate.source_authority?.controlled_files===63,String(gate.source_authority?.controlled_files));
check('PASS 8 bound',gate.derivative_authority?.pass8_terminology==='BOUND',gate.derivative_authority?.pass8_terminology);
check('PASS 9 bound',gate.derivative_authority?.pass9_derivative_mapping==='BOUND',gate.derivative_authority?.pass9_derivative_mapping);
check('About baseline bound',gate.derivative_authority?.about_production_baseline==='8437e51b7b862851180e69c4b20ac2741e3bc01e',gate.derivative_authority?.about_production_baseline);
check('mandatory concept count',Array.isArray(gate.mandatory_concepts)&&gate.mandatory_concepts.length===5,String(gate.mandatory_concepts?.length));
check('prohibited transfer exists',Array.isArray(gate.prohibited_transfer)&&gate.prohibited_transfer.length>=9,String(gate.prohibited_transfer?.length));
check('public narrative only',gate.surface_authority?.public_narrative===true);
check('no evidence authority',gate.surface_authority?.scientific_evidence_authority===false);
check('no measurement authority',gate.surface_authority?.measurement_authority===false);
check('no scoring authority',gate.surface_authority?.scoring_authority===false);
check('no governance authority',gate.surface_authority?.governance_authority===false);

const result={schema:'p120.homepage.implementation_pass2.source_authority_gate.result.v1',generated_at:new Date().toISOString(),checks,failures,verdict:failures.length?'FAIL':'PASS'};
const out=path.join(ROOT,'qa-evidence-homepage-pass2');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'source-authority.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({verdict:result.verdict,checks:checks.length,failures},null,2));
if(failures.length) process.exit(1);
