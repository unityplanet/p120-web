from pathlib import Path
import hashlib, json, os, subprocess
from datetime import datetime, timezone

ROOT=Path('.')
OUT=Path(os.environ.get('P120_REGISTRY_FINAL_OUT','_release/P120_WEBSCI_PROD_G1_REGISTRY_v1.1'))
OUT.mkdir(parents=True,exist_ok=True)
ACTIVATION='cf11a176bb0db87aec046d5694c302285b275f90'
SEALED='d095cae40b33da2118e5090be2a2c837205d8b64'
DATE='2026-09-06'

def sh(*args): return subprocess.check_output(args,text=True).strip()
def load(p): return json.loads(Path(p).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def dump(name,obj): (OUT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')

head=sh('git','rev-parse','HEAD')
branch=os.environ.get('GITHUB_REF_NAME') or sh('git','rev-parse','--abbrev-ref','HEAD')
phase='POSTMERGE_FINAL_PRODUCTION_SEAL' if branch=='main' else 'PREMERGE_FINAL_SEAL_CANDIDATE'
status='CLOSED_CONTROLLED_SEALED' if branch=='main' else 'PREMERGE_FINAL_SEAL_PASS_CANDIDATE'

qa_path=Path('qa-evidence-webscience-prod-g1-registry-final-seal/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_SEAL_QA_v1.1.json')
qa=load(qa_path)
if qa.get('status')!='PASS' or qa.get('checks_failed')!=0:
    raise SystemExit('final registry seal QA is not PASS')

old='P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json'
new='P120_WEBSCI_PRODUCTION_registry_v1.1_2026-09-06.json'
old_sha='38b706b38f8f19f60c5917874b8371661340bb0cf30059fe9a7de98d16251f5e'
if sha(old)!=old_sha: raise SystemExit('historical executable registry SHA mismatch')

status_record={
 'standard':'P120',
 'document_id':'P120-WEBSCI-PROD-G1-REGISTRY-FINAL-STATUS',
 'version':'v1.1','date':DATE,'phase':phase,'status':status,
 'child_gate':'WEB-SCIENCE PROD-G1.1 — Production Registry Reconciliation',
 'parent_prod_g1_status':'CLOSED_CONTROLLED_SEALED_ACTIVE_IN_PRODUCTION',
 'registry_activation_head':ACTIVATION,
 'closure_authority_head':head,
 'repository':'unityplanet/p120-web','branch':branch,
 'sealed_science_authority':SEALED,
 'historical_executable_registry':old,
 'historical_executable_registry_sha256':old_sha,
 'current_production_governance_registry':new,
 'runtime_registry_binding':'v1.0 remains executable input; v1.1 is governance state only',
 'final_seal_qa':{'checks_total':qa['checks_total'],'checks_passed':qa['checks_passed'],'checks_failed':qa['checks_failed']},
 'activation_postmerge_runs':{
   'registry_reconciliation':34037744613,
   'actions_governance':34037744596,
   'pages_deployment':34037744158,
   'prod_g1_full_postmerge_verification':34037744605,
   'scientific_base_production_qa':34037744585,
   'pass4a_deployment_path':34037744604
 },
 'unresolved_delta_count':0,
 'scientific_status_upgrade':False,'scientific_content_mutated':False,'runtime_mutated':False,'science_routes_mutated':False,
 'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,'respondent_state_mutated':False,
 'persistence_mutated':False,'report_calculation_mutated':False,'supabase_mutated':False,
 'public_evidence_ceiling':'UNCHANGED; E1 IS NOT EMPIRICAL VALIDATION; E2 PENDING; E3 NOT ESTABLISHED',
 'next_action':'AFTER POSTMERGE FINAL SEAL, FURTHER WEB-SCIENCE IMPLEMENTATION MUST START FROM THE THEN-CURRENT CONTROLLED MAIN UNDER A NEW EXPLICIT GOVERNED GATE.'
}
dump('P120_WEBSCI_PROD_G1_REGISTRY_FINAL_STATUS_v1.1.json',status_record)

manifest={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-REGISTRY-FINAL-MANIFEST','version':'v1.1','date':DATE,
 'phase':phase,'status':status,'repository':'unityplanet/p120-web','branch':branch,
 'registry_activation_head':ACTIVATION,'closure_authority_head':head,'sealed_science_authority':SEALED,
 'parent_prod_g1_status':'CLOSED_CONTROLLED_SEALED_ACTIVE_IN_PRODUCTION',
 'global_library_contract':{'core':45,'extension':25,'global':70},
 'public_ceiling_unchanged':True,'unresolved_delta_count':0,
 'protected_executable_registry_sha256':old_sha,
 'final_seal_qa':{'checks_total':qa['checks_total'],'checks_passed':qa['checks_passed'],'checks_failed':qa['checks_failed']},
 'package_sha256':'RECORDED_EXTERNALLY_IN_ZIP_SIDECAR_TO_AVOID_SELF_REFERENCE',
 'scientific_authority_reopened':False,'runtime_authority_reopened':False,
 'production_registry_disposition':{'v1.0':'FROZEN EXECUTABLE INPUT','v1.1':'CURRENT PRODUCTION GOVERNANCE REGISTRY'}
}
dump('P120_WEBSCI_PROD_G1_REGISTRY_FINAL_MANIFEST_v1.1.json',manifest)

repro={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-REGISTRY-FINAL-REPRODUCIBILITY','version':'v1.1','date':DATE,
 'repository':'unityplanet/p120-web','branch':branch,'closure_authority_head':head,'registry_activation_head':ACTIVATION,
 'environment':{'runner':'ubuntu-latest','git_fetch_depth':0},
 'commands':[
   'python3 qa/webscience_prod_g1_registry_final_seal_gate_v1.1.py',
   'python3 qa/webscience_prod_g1_postmerge_gate_v1.0.py',
   'node qa/webscience_pass4a_projection_gate_v0.5.mjs',
   'python3 .github/scripts/p120_webscience_prod_g1_registry_final_closure.py'
 ],
 'package_integrity_rule':'PACKAGE_CONTENT_SHA256SUMS.txt IS EXCLUDED FROM ITS OWN CHECKSUM SET; ZIP SHA SIDECAR AND INTERNAL LEDGER ARE VERIFIED AFTER BUILD.'
}
dump('P120_WEBSCI_PROD_G1_REGISTRY_FINAL_REPRODUCIBILITY_v1.1.json',repro)

index={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-REGISTRY-FINAL-PACKAGE-INDEX','version':'v1.1','date':DATE,
 'phase':phase,'closure_authority_head':head,
 'records':[
  'P120_WEBSCI_PROD_G1_REGISTRY_FINAL_STATUS_v1.1.json',
  'P120_WEBSCI_PROD_G1_REGISTRY_FINAL_MANIFEST_v1.1.json',
  'P120_WEBSCI_PROD_G1_REGISTRY_FINAL_REPRODUCIBILITY_v1.1.json',
  'P120_WEBSCI_PROD_G1_REGISTRY_FINAL_PACKAGE_INDEX_v1.1.json'
 ],
 'source_authority':[
  old,new,
  'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json',
  'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_AUTHORITY_INDEX_v1.1.json'
 ],
 'governance_records':[
  'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_RECONCILIATION_REPORT_v1.1.md',
  'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_RECONCILIATION_DECISION_v1.1.md',
  'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_RECONCILIATION_MANIFEST_v1.1.json',
  'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_EVIDENCE_v1.1.json',
  'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_EXACT_DELTA_v1.1.json',
  'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_RECONCILIATION_v1.1.md',
  'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_SEAL_MANIFEST_v1.1.json'
 ],
 'qa':[
  'qa-evidence-webscience-prod-g1-registry-final-seal/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_SEAL_QA_v1.1.json'
 ],
 'reproducibility_sources':[
  'qa/webscience_prod_g1_registry_final_seal_gate_v1.1.py',
  'qa/webscience_prod_g1_registry_reconciliation_gate_v1.1.py',
  'qa/webscience_prod_g1_postmerge_gate_v1.0.py',
  '.github/scripts/p120_webscience_prod_g1_registry_final_closure.py',
  '.github/workflows/p120-webscience-prod-g1-registry-final-seal-v1.1.yml'
 ]
}
dump('P120_WEBSCI_PROD_G1_REGISTRY_FINAL_PACKAGE_INDEX_v1.1.json',index)

print(json.dumps({'status':'PASS','phase':phase,'gate_status':status,'closure_authority_head':head,'qa_checks':qa['checks_total'],'out':str(OUT)},indent=2))
