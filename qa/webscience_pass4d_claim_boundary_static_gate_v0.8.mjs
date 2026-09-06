import fs from 'node:fs';
import path from 'node:path';

const PROJECTION='webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json';
const LIBRARY='webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json';
const INTEGRATED='webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json';
const OUT='qa-evidence-webscience-pass4d';
fs.mkdirSync(OUT,{recursive:true});

const p=JSON.parse(fs.readFileSync(PROJECTION,'utf8'));
const l=JSON.parse(fs.readFileSync(LIBRARY,'utf8'));
const g=JSON.parse(fs.readFileSync(INTEGRATED,'utf8'));
const checks=[]; const failures=[];
function check(id,pass,detail={}){const row={id,pass:Boolean(pass),...detail};checks.push(row);if(!pass)failures.push(row);return Boolean(pass);}
const has=(v,s)=>String(v||'').toLowerCase().includes(String(s).toLowerCase());
const mod=id=>p.modules.find(x=>x.module_id===id);

check('schema: publication projection',p.schema_id==='P120-WEBSCI-PUBLICATION-PROJECTION-001',{actual:p.schema_id});
check('schema: library projection',l.schema_id==='P120-WEBSCI-GLOBAL-LIBRARY-PROJECTION-001',{actual:l.schema_id});
check('schema: integrated library',g.schema_id==='P120-WEBSCI-GLOBAL-LIBRARY-INTEGRATED-001',{actual:g.schema_id});
check('projection: RU/EN semantic parity required',p.projection_rules?.ru_en_semantic_parity_required===true);
check('projection: normative/diagnostic claims prohibited',p.projection_rules?.normative_or_diagnostic_claims_allowed===false);
check('projection: measurement mutation prohibited',p.projection_rules?.measurement_mutation_allowed===false);
check('projection: scoring mutation prohibited',p.projection_rules?.scoring_mutation_allowed===false);
check('projection: threshold mutation prohibited',p.projection_rules?.threshold_mutation_allowed===false);
check('projection: session storage access prohibited',p.projection_rules?.session_storage_access==='PROHIBITED');
check('projection: Extended total prohibited',p.projection_rules?.extended_total_allowed===false);
check('projection: DYADIC public activation prohibited',p.projection_rules?.dyadic_public_activation===false);
check('projection: RPE detailed public activation prohibited',p.projection_rules?.rpe_detailed_public_activation===false);

const pairs=[];
function walk(v,where='root'){
  if(Array.isArray(v)){v.forEach((x,i)=>walk(x,`${where}[${i}]`));return;}
  if(!v||typeof v!=='object')return;
  const hasRu=Object.prototype.hasOwnProperty.call(v,'ru');
  const hasEn=Object.prototype.hasOwnProperty.call(v,'en');
  if(hasRu||hasEn){
    const ru=v.ru, en=v.en;
    const pair={path:where,ru,en};pairs.push(pair);
    check(`pair ${where}: both languages present`,hasRu&&hasEn,{ru,en});
    check(`pair ${where}: RU non-empty`,typeof ru==='string'&&ru.trim().length>0,{ru});
    check(`pair ${where}: EN non-empty`,typeof en==='string'&&en.trim().length>0,{en});
    check(`pair ${where}: EN contains no Cyrillic`,typeof en==='string'&&!/[А-Яа-яЁё]/.test(en),{en});
  }
  for(const [k,x] of Object.entries(v))if(k!=='ru'&&k!=='en')walk(x,`${where}.${k}`);
}
walk(p,'publication'); walk(l,'library');
check('bilingual pair corpus is substantial',pairs.length>=80,{pair_count:pairs.length});

const matrix=[];
function claim(id,title,pass,authority,detail={}){const row={id,title,pass:Boolean(pass),authority,...detail};matrix.push(row);check(`claim ${id}: ${title}`,pass,{authority,...detail});}

claim('CB-01','E1 is explicitly not empirical psychometric validation',
  has(p.system_positioning?.internal_verification_boundary?.ru,'не равна эмпирической психометрической валидации')&&
  has(p.system_positioning?.internal_verification_boundary?.en,'is not equivalent to empirical psychometric validation'),
  'system_positioning.internal_verification_boundary');

const e1=p.evidence_ladder?.find(x=>x.level==='E1');
claim('CB-02','E1 does not claim reliability/factor validity/norms/generalizability',
  has(e1?.does_not_mean?.ru,'Надёжность')&&has(e1?.does_not_mean?.ru,'факторную валидность')&&has(e1?.does_not_mean?.ru,'нормы')&&
  has(e1?.does_not_mean?.en,'Reliability')&&has(e1?.does_not_mean?.en,'factor validity')&&has(e1?.does_not_mean?.en,'norms'),
  'evidence_ladder.E1.does_not_mean');

claim('CB-03','All public Extended/Outcomes modules keep E3/E4 NOT_ESTABLISHED',
  p.modules.every(m=>m.evidence_state?.E3==='NOT_ESTABLISHED'&&m.evidence_state?.E4==='NOT_ESTABLISHED'),
  'modules[*].evidence_state',{states:p.modules.map(m=>({id:m.module_id,E3:m.evidence_state?.E3,E4:m.evidence_state?.E4}))});

claim('CB-04','Cross-layer empirical validity remains not established and causal/synergy claims unauthorized',
  p.cross_layer?.empirical_state?.empirical_cross_layer_discriminant_validity==='NOT_ESTABLISHED'&&
  p.cross_layer?.empirical_state?.empirical_incremental_validity==='NOT_ESTABLISHED'&&
  p.cross_layer?.empirical_state?.validated_cross_layer_synergy==='NOT_AUTHORIZED'&&
  p.cross_layer?.empirical_state?.causal_cross_layer_effects==='NOT_AUTHORIZED',
  'cross_layer.empirical_state',{state:p.cross_layer?.empirical_state});

claim('CB-05','Cross-layer public statement says research programme, not demonstrated validity',
  has(p.cross_layer?.system_statement?.ru,'исследовательская программа')&&has(p.cross_layer?.system_statement?.ru,'не доказанная межмодульная валидность')&&
  has(p.cross_layer?.system_statement?.en,'research programme')&&has(p.cross_layer?.system_statement?.en,'not demonstrated cross-module validity'),
  'cross_layer.system_statement');

const rpe=mod('RPE-MOD');
claim('CB-06','RPE detailed constructs and reference payload remain suppressed',
  Array.isArray(rpe?.candidate_architecture)&&rpe.candidate_architecture.length===0&&Array.isArray(rpe?.selected_reference_ids)&&rpe.selected_reference_ids.length===0,
  'modules[RPE-MOD]');

claim('CB-07','DYADIC remains hidden',p.bases?.find(b=>b.base_id==='DYADIC')?.visibility==='hidden','bases[DYADIC]');

const com=mod('COM-12');
claim('CB-08','COM ceiling rejects factor confirmation, total, production scoring, norms, diagnosis and consent-validity classification',
  ['общий показатель COM','производственный расчёт баллов','нормы','диагностика','классификация валидности согласия'].every(x=>has(com?.publication_ceiling?.ru,x))&&
  ['COM Total','production scoring','norms','diagnosis','consent-validity classification'].every(x=>has(com?.publication_ceiling?.en,x)),
  'modules[COM-12].publication_ceiling');

const mot=mod('MOT-12');
claim('CB-09','MOT ceiling rejects total and healthy/unhealthy motive classification',
  has(mot?.publication_ceiling?.ru,'общий показатель MOT')&&has(mot?.publication_ceiling?.ru,'здоров')&&has(mot?.publication_ceiling?.en,'MOT Total')&&has(mot?.publication_ceiling?.en,'healthy/unhealthy'),
  'modules[MOT-12].publication_ceiling');

const self=mod('SELF-12');
claim('CB-10','SELF ceiling rejects confirmed seven-factor model, norms and participant-level interpretation',
  has(self?.publication_ceiling?.ru,'семифактор')&&has(self?.publication_ceiling?.ru,'норм')&&has(self?.publication_ceiling?.en,'seven-factor')&&has(self?.publication_ceiling?.en,'norm'),
  'modules[SELF-12].publication_ceiling');

const life=mod('LIFE-12/18');
claim('CB-11','LIFE ceiling rejects total, causal attribution, productivity/health promises and confirmed factor model',
  ['LIFE Total','причин','продуктив','здоров','фактор'].every(x=>has(life?.publication_ceiling?.ru,x))&&
  ['LIFE Total','causal','productivity','health','factor'].every(x=>has(life?.publication_ceiling?.en,x)),
  'modules[LIFE-12/18].publication_ceiling');

claim('CB-12','Library count is explicitly not a validity metric',
  l.contract?.count_is_not_validity_metric===true&&has(l.claim_boundary?.ru,'не является количественным доказательством валидности')&&has(l.claim_boundary?.en,'not a count-based proof'),
  'global_library_projection.claim_boundary');

claim('CB-13','Integrated Core roles are not inferred',
  g.binding_model?.no_inferred_core_roles===true&&g.references.filter(r=>r.source_layer==='CORE45').every(r=>Array.isArray(r.modules)&&r.modules.length===0&&r.role===null),
  'global_library_integrated.binding_model');

claim('CB-14','Global library preserves 45/25/70 identity contract',
  g.contract?.core_reference_count===45&&g.contract?.extension_reference_count===25&&g.contract?.global_reference_count===70&&g.references?.length===70,
  'global_library_integrated.contract');

const roleCodes=l.references.map(r=>r.role);
claim('CB-15','Extension evidence-role metadata remains canonical technical identifiers',
  roleCodes.length===25&&roleCodes.every(x=>/^[A-Z0-9_]+$/.test(x)),
  'global_library_projection.references[*].role',{role_count:roleCodes.length});

const result={
  standard:'P120',document_id:'P120-WEBSCI-EXT-004-PASS4D-STATIC-QA',version:'v0.8',date:'2026-09-06',
  status:failures.length?'FAIL':'PASS',checks_total:checks.length,checks_passed:checks.length-failures.length,checks_failed:failures.length,
  bilingual_pair_count:pairs.length,checks,failures
};
const claimMatrix={
  standard:'P120',document_id:'P120-WEBSCI-EXT-004-PASS4D-CLAIM-MATRIX',version:'v0.8',date:'2026-09-06',
  status:matrix.every(x=>x.pass)?'PASS':'FAIL',rule:'Boundary claims are assessed against sealed PASS 4A/4C source authorities; no scientific status is upgraded by this QA.',
  claims:matrix
};
fs.writeFileSync(path.join(OUT,'P120_WEBSCI_EXT_PASS4_PASS4D_STATIC_QA_RESULT_v0.8.json'),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(path.join(OUT,'P120_WEBSCI_EXT_PASS4_PASS4D_CLAIM_MATRIX_v0.8.json'),JSON.stringify(claimMatrix,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checks_total:result.checks_total,checks_failed:result.checks_failed,bilingual_pair_count:pairs.length,claim_count:matrix.length},null,2));
if(failures.length)process.exit(1);
