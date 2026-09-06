import fs from 'node:fs';
import crypto from 'node:crypto';

const CORE_RU='science/index.html';
const CORE_EN='en/science/index.html';
const EXT='webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json';
const OUT='webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json';

const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const normDoi=v=>{
  if(!v)return null;
  return String(v).trim().toLowerCase().replace(/^https?:\/\/(?:dx\.)?doi\.org\//,'').replace(/^doi:\s*/,'');
};
const normCitation=v=>String(v||'').toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
function extractScience(file){
  const html=fs.readFileSync(file,'utf8');
  const marker='window.P120_SCIENCE=';
  const start=html.indexOf(marker);
  if(start<0)throw new Error(`${file}: P120_SCIENCE marker missing`);
  const bodyStart=start+marker.length;
  const end=html.indexOf(';</script>',bodyStart);
  if(end<0)throw new Error(`${file}: P120_SCIENCE terminator missing`);
  return JSON.parse(html.slice(bodyStart,end));
}
const ru=extractScience(CORE_RU);
const en=extractScience(CORE_EN);
const ruRefs=ru.references||[];
const enRefs=en.references||[];
if(ruRefs.length!==45||enRefs.length!==45)throw new Error(`Core counts RU=${ruRefs.length} EN=${enRefs.length}`);
for(let i=0;i<45;i++){
  if(normDoi(ruRefs[i].doi)!==normDoi(enRefs[i].doi)||normCitation(ruRefs[i].citation)!==normCitation(enRefs[i].citation))
    throw new Error(`Core RU/EN identity mismatch at index ${i}`);
}
const ext=JSON.parse(fs.readFileSync(EXT,'utf8'));
if(ext.schema_id!=='P120-WEBSCI-GLOBAL-LIBRARY-PROJECTION-001')throw new Error('Extension schema mismatch');
if((ext.references||[]).length!==25)throw new Error('Extension count mismatch');
const core=ruRefs.map((r,i)=>({
  id:`REF-${String(i+1).padStart(3,'0')}`,
  source_layer:'CORE45',
  source_index:i,
  citation:r.citation,
  doi:normDoi(r.doi),
  modules:[],
  role:null,
  binding_state:'SOURCE_NATIVE_CITATION_DOI_ONLY',
  identity_rule:'FROZEN_CORE_ARRAY_ORDER'
}));
const extension=ext.references.map((r,i)=>({
  id:r.id,
  source_layer:'PASS4_EXTENSION',
  source_index:i,
  citation:r.citation,
  doi:normDoi(r.doi),
  modules:[...(r.modules||[])],
  role:r.role||null,
  binding_state:'SOURCE_AUTHORIZED_MODULE_ROLE_BINDING',
  identity_rule:'PASS4_CONTROLLED_REFERENCE_ID'
}));
const refs=[...core,...extension];
const expected=Array.from({length:70},(_,i)=>`REF-${String(i+1).padStart(3,'0')}`);
if(JSON.stringify(refs.map(r=>r.id))!==JSON.stringify(expected))throw new Error('Global REF-001..070 continuity failed');
const doiSeen=new Map(), citationSeen=new Map(), doiDuplicates=[], citationDuplicates=[];
for(const r of refs){
  if(r.doi){if(doiSeen.has(r.doi))doiDuplicates.push([doiSeen.get(r.doi),r.id,r.doi]);else doiSeen.set(r.doi,r.id);}
  const c=normCitation(r.citation);if(citationSeen.has(c))citationDuplicates.push([citationSeen.get(c),r.id]);else citationSeen.set(c,r.id);
}
if(doiDuplicates.length||citationDuplicates.length)throw new Error(`Global dedup failed DOI=${JSON.stringify(doiDuplicates)} citation=${JSON.stringify(citationDuplicates)}`);
const payload={
  standard:'P120',
  schema_id:'P120-WEBSCI-GLOBAL-LIBRARY-INTEGRATED-001',
  document_id:'P120-WEBSCI-EXT-004-PASS4C-GLOBAL-LIBRARY',
  version:'v0.7',date:'2026-09-06',
  status:'CONTROLLED_CORE45_GLOBAL70_LIBRARY_INTEGRATION__PASS4C',
  production_state:'NOT_MERGED_TO_MAIN',
  source_authorities:{core:'window.P120_SCIENCE.references frozen Core array',extension:'P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json'},
  contract:{core_reference_count:45,extension_reference_count:25,global_reference_count:70,core_id_range:'REF-001..REF-045',extension_id_range:'REF-046..REF-070',core_array_mutated:false,core_identity_assignment:'REF-ID assigned by frozen Core array order; source citation/DOI unchanged',count_is_not_validity_metric:true},
  identity:{core_ru_sha256:sha(JSON.stringify(ruRefs)),core_en_sha256:sha(JSON.stringify(enRefs)),core_ru_en_identity_match:true,global_identity_sha256:sha(JSON.stringify(refs.map(r=>[r.id,r.citation,r.doi,r.source_layer])))},
  binding_model:{core:'Citation/DOI identity only because no per-reference module/role binding exists in the frozen Core source object.',extension:'Preserve source-authorized module and evidence-role bindings from PASS 4.',no_inferred_core_roles:true},
  deduplication:{doi_duplicate_pairs:[],citation_duplicate_pairs:[],non_null_doi_count:refs.filter(r=>r.doi).length,unique_non_null_doi_count:doiSeen.size,global_reference_identity_unique:true},
  navigation_contract:{unified_list:true,filters:['ALL','CORE45','PASS4_EXTENSION','COM-12','MOT-12','SELF-12','LIFE-12/18','METHODS','EXT-SYS'],text_search:true,reference_deep_link_query:'ref',no_persistence:true},
  references:refs,
  next_gate:'WEB-SCIENCE EXT PASS 4D — Claim-Boundary & RU/EN Parity QA'
};
fs.writeFileSync(OUT,JSON.stringify(payload,null,2)+'\n');
console.log(JSON.stringify({out:OUT,core:core.length,extension:extension.length,global:refs.length,nonNullDoi:payload.deduplication.non_null_doi_count,globalIdentity:payload.identity.global_identity_sha256},null,2));
