import fs from 'node:fs';

const projection=JSON.parse(fs.readFileSync('webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json','utf8'));
const library=JSON.parse(fs.readFileSync('webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json','utf8'));
const checks=[];
const failures=[];
const check=(id,pass,detail={})=>{const row={id,pass:Boolean(pass),...detail};checks.push(row);if(!pass)failures.push(row);};
const cyr=/[А-Яа-яЁё]/;

check('projection schema',projection.schema_id==='P120-WEBSCI-PUBLICATION-PROJECTION-001');
check('projection version',projection.version==='v0.5');
check('production not activated',projection.production_state==='NOT_ACTIVATED');
check('renderer public-safe only',projection.projection_rules?.renderer_consumes_public_safe_fields_only===true);
check('source objects remain upstream',projection.projection_rules?.source_scientific_objects_remain_upstream===true);
check('RU/EN semantic parity required',projection.projection_rules?.ru_en_semantic_parity_required===true);
check('Core preserved',projection.projection_rules?.core_scientific_content_preserved===true);
check('measurement mutation prohibited',projection.projection_rules?.measurement_mutation_allowed===false);
check('scoring mutation prohibited',projection.projection_rules?.scoring_mutation_allowed===false);
check('threshold mutation prohibited',projection.projection_rules?.threshold_mutation_allowed===false);
check('session storage prohibited',projection.projection_rules?.session_storage_access==='PROHIBITED');
check('Extended Total prohibited',projection.projection_rules?.extended_total_allowed===false);
check('DYADIC public activation prohibited',projection.projection_rules?.dyadic_public_activation===false);
check('RPE detail public activation prohibited',projection.projection_rules?.rpe_detailed_public_activation===false);

const levels=projection.evidence_ladder||[];
check('E0-E4 evidence ladder',JSON.stringify(levels.map(x=>x.level))===JSON.stringify(['E0','E1','E2','E3','E4']),{actual:levels.map(x=>x.level)});
const bases=projection.bases||[];
const dyadic=bases.find(x=>x.base_id==='DYADIC');
check('DYADIC hidden',dyadic?.visibility==='hidden');
const modules=projection.modules||[];
const expectedModules=['COM-12','MOT-12','SELF-12','RPE-MOD','LIFE-12/18'];
check('PASS4A module count',modules.length===5,{actual:modules.length});
check('PASS4A module identity',JSON.stringify(modules.map(x=>x.module_id))===JSON.stringify(expectedModules),{actual:modules.map(x=>x.module_id)});
check('all projected new modules summary-only',modules.every(x=>x.visibility==='summary_only'));
for(const m of modules){
  check(`${m.module_id}: no E3 claim`,m.evidence_state?.E3==='NOT_ESTABLISHED');
  check(`${m.module_id}: no E4 claim`,m.evidence_state?.E4==='NOT_ESTABLISHED');
}
const rpe=modules.find(x=>x.module_id==='RPE-MOD');
check('RPE construct detail suppressed',Array.isArray(rpe?.candidate_architecture)&&rpe.candidate_architecture.length===0);
check('RPE reference detail suppressed',Array.isArray(rpe?.selected_reference_ids)&&rpe.selected_reference_ids.length===0);

const cl=projection.cross_layer||{};
check('cross-layer research-only summary',cl.visibility==='research_only_summary');
check('empirical cross-layer discriminant validity not established',cl.empirical_state?.empirical_cross_layer_discriminant_validity==='NOT_ESTABLISHED');
check('empirical incremental validity not established',cl.empirical_state?.empirical_incremental_validity==='NOT_ESTABLISHED');
check('validated cross-layer synergy not authorized',cl.empirical_state?.validated_cross_layer_synergy==='NOT_AUTHORIZED');
check('causal cross-layer effects not authorized',cl.empirical_state?.causal_cross_layer_effects==='NOT_AUTHORIZED');
check('ten cross-layer questions',Array.isArray(cl.questions)&&cl.questions.length===10,{actual:cl.questions?.length});
check('join-after-independent-measurement',String(cl.synthesis_rule||'').includes('JOIN_AFTER_INDEPENDENT_MEASUREMENT'));
check('one-person compatibility percentage prohibited',(cl.prohibited_public_inferences||[]).includes('one-person compatibility percentage'));

check('library schema',library.schema_id==='P120-WEBSCI-GLOBAL-LIBRARY-PROJECTION-001');
check('library production not activated',library.production_state==='NOT_ACTIVATED');
check('Core reference contract 45',library.contract?.core_reference_count===45);
check('extension reference contract 25',library.contract?.extension_reference_count===25);
check('global reference contract 70',library.contract?.global_reference_count===70);
check('Core array preserve rule',library.contract?.core_rule==='PRESERVE_EXISTING_CORE_REFERENCE_ARRAY');
check('extension payload has 25 references',Array.isArray(library.references)&&library.references.length===25,{actual:library.references?.length});
const ids=(library.references||[]).map(x=>x.id);
const expectedIds=Array.from({length:25},(_,i)=>`REF-${String(i+46).padStart(3,'0')}`);
check('REF-046..REF-070 sequence',JSON.stringify(ids)===JSON.stringify(expectedIds),{actual:ids});
check('extension reference IDs unique',new Set(ids).size===25);
const dois=(library.references||[]).map(x=>String(x.doi||'').toLowerCase());
check('extension DOI present',dois.every(Boolean));
check('extension DOI unique',new Set(dois).size===25);

function walkBilingual(value,path='root'){
  if(Array.isArray(value)){value.forEach((v,i)=>walkBilingual(v,`${path}[${i}]`));return;}
  if(!value||typeof value!=='object')return;
  if(Object.prototype.hasOwnProperty.call(value,'ru')||Object.prototype.hasOwnProperty.call(value,'en')){
    check(`${path}: RU present`,typeof value.ru==='string'&&value.ru.trim().length>0);
    check(`${path}: EN present`,typeof value.en==='string'&&value.en.trim().length>0);
    if(typeof value.en==='string')check(`${path}: EN contains no Cyrillic`,!cyr.test(value.en),{value:value.en});
  }
  for(const [k,v] of Object.entries(value))walkBilingual(v,`${path}.${k}`);
}
walkBilingual(projection);
walkBilingual(library.claim_boundary,'library.claim_boundary');

const avoidableRuTokens=[
  '24-element','item-level','ownership firewalls','field-наблюдения','freeze adjudication','field-gate','production scoring',
  'communal motive','coping /','automaticity','evidence/boundary audit','challenge territory','landscape','fielding hold',
  'reward architecture','safety/privacy','publication governance','archetypes','respondent-facing','outcome-слой','post-event',
  'relational системы','authority','scope/exposure','discriminant/incremental validity'
];
function walkRu(value,path='root'){
  if(Array.isArray(value)){value.forEach((v,i)=>walkRu(v,`${path}[${i}]`));return;}
  if(!value||typeof value!=='object')return;
  if(typeof value.ru==='string'){
    const low=value.ru.toLowerCase();
    for(const token of avoidableRuTokens)check(`${path}: avoidable EN token absent in RU: ${token}`,!low.includes(token.toLowerCase()),{value:value.ru});
  }
  for(const [k,v] of Object.entries(value))walkRu(v,`${path}.${k}`);
}
walkRu(projection);

const serialized=JSON.stringify(projection);
for(const token of ['exact_item_wording','scoring_keys','norms_payload','participant_labels','restricted_adjudication'])check(`forbidden public payload field absent: ${token}`,!serialized.includes(token));

const report={
  document_id:'P120-WEBSCI-EXT-004-PASS4A-QA',
  version:'v0.5',
  date:'2026-09-06',
  status:failures.length?'FAIL':'PASS',
  checks_total:checks.length,
  checks_passed:checks.filter(x=>x.pass).length,
  checks_failed:failures.length,
  failures,
  checks
};
fs.writeFileSync('webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4A_QA_RESULT_v0.5.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,checks_total:report.checks_total,checks_failed:report.checks_failed},null,2));
if(failures.length)process.exit(1);
