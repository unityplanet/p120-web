from pathlib import Path
import json, hashlib

V='v1.0'
DATE='2026-09-06'
BRANCH='web-science-ext-pass4f-closure-reconciliation'
BASE='cd71bf494f72090e0a81cfd3702fd6049ab89bb0'
W=Path('webscience/pass4')
E=Path('qa-evidence-webscience-pass4f')
Q=E/'P120_WEBSCI_EXT_PASS4_PASS4F_RECONCILIATION_QA_RESULT_v1.0.json'
qa=json.loads(Q.read_text())
if qa.get('status')!='PASS' or qa.get('checks_failed')!=0:
    raise SystemExit('PASS 4F reconciliation evidence is not fully PASS')

chain={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-PASS4F-AUTHORITY-CHAIN','version':V,'date':DATE,
 'authority_model':'FORWARD_ONLY_WITH_EXPLICIT_RUNTIME_SUPERSESSION',
 'parent_workstream':'WEB-SCIENCE EXT PASS 4',
 'stages':[
   {'stage':'PASS 4A','version':'v0.5','baseline':'5295b50d1082e83e6e4e36f26286cdc2ccaca841','closure_commit':'a775606fcbe061f27184c1800cc5f5bf15f84679','post_package_head':'2759e288fec90064858fb99b137c07e6505f6257','authority':'RU_EN_PUBLICATION_PROJECTION'},
   {'stage':'PASS 4B','version':'v0.6','baseline':'2759e288fec90064858fb99b137c07e6505f6257','closure_commit':'9d07a3a047ce4b9a61b6f307e3f791fcdfabaff4','authority':'CONTROLLED_RENDERER_ACTIVATION'},
   {'stage':'PASS 4C','version':'v0.7','baseline':'9d07a3a047ce4b9a61b6f307e3f791fcdfabaff4','closure_commit':'211c0f4f0d2601c46bc2d4d283ade84aee474c47','authority':'CORE45_GLOBAL70_LIBRARY_INTEGRATION'},
   {'stage':'PASS 4D','version':'v0.8','baseline':'211c0f4f0d2601c46bc2d4d283ade84aee474c47','closure_commit':'89683b678b76dde7df1cdeccc05d6e8541573b5b','authority':'CLAIM_BOUNDARY_AND_RU_EN_PARITY_QA'},
   {'stage':'PASS 4E','version':'v0.9','baseline':'89683b678b76dde7df1cdeccc05d6e8541573b5b','closure_commit':BASE,'authority':'BROWSER_RESPONSIVE_TYPOGRAPHY_QA'},
   {'stage':'PASS 4F','version':V,'baseline':BASE,'closure_commit':'TO_BE_BOUND_BY_CLOSURE_COMMIT','authority':'CLOSURE_RECONCILIATION'}
 ],
 'historical_manifest_rule':'Pass-local hashes remain historical evidence; a later authorized runtime delta does not retroactively rewrite an earlier manifest.',
 'authorized_supersessions':[
   {'path':'p120-webscience-pass4b-renderer-v0.6.js','from_stage':'PASS 4B','to_stage':'PASS 4C','reason':'controlled PASS 4C additive integration loader'},
   {'path':'p120-webscience-pass4c-library-v0.7.js','from_stage':'PASS 4C','to_stage':'PASS 4E','reason':'controlled PASS 4E additive presentation stylesheet loader'}
 ],
 'production_main':'UNTOUCHED_BY_PASS4A_TO_PASS4F','production_merge':'NOT_PERFORMED',
 'next_gate':'PASS 4G — Mandatory Full PASS Package / Final PASS 4 Sealing'
}
(W/'P120_WEBSCI_EXT_PASS4_PASS4F_AUTHORITY_CHAIN_v1.0.json').write_text(json.dumps(chain,ensure_ascii=False,indent=2)+'\n')

matrix={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-PASS4F-RECONCILIATION-MATRIX','version':V,'date':DATE,
 'status':'RECONCILED','parent_pass4_status':'OPEN_PENDING_PASS4G',
 'dimensions':{
   'scientific_authority':{'state':'CONSISTENT','source':'PASS 4A projection + pre-4A adjudication','upgrade_in_PASS4F':False},
   'evidence_ladder':{'state':'CONSISTENT','levels':['E0','E1','E2','E3','E4'],'E1_equals_empirical_validation':False},
   'library_contract':{'state':'CONSISTENT','core':45,'extension':25,'global':70,'count_is_validity_metric':False},
   'module_publication':{'state':'CONSISTENT','modules':['COM-12','MOT-12','SELF-12','RPE-MOD','LIFE-12/18'],'mode':'summary_only'},
   'RPE':{'state':'CONSISTENT','detail':'SUPPRESSED'},
   'DYADIC':{'state':'CONSISTENT','visibility':'HIDDEN'},
   'cross_layer':{'state':'CONSISTENT','discriminant_validity':'NOT_ESTABLISHED','incremental_validity':'NOT_ESTABLISHED','validated_synergy':'NOT_AUTHORIZED','causal_effects':'NOT_AUTHORIZED'},
   'renderer':{'state':'CONSISTENT','activation':'CONTROLLED_BRANCH_PRE_PRODUCTION','production_merge':'NOT_PERFORMED'},
   'ru_en_claim_parity':{'state':'PASS','authority':'PASS 4D'},
   'browser_responsive_typography':{'state':'PASS','authority':'PASS 4E','matrix_states':70,'checks':'952/952'},
   'measurement_scoring_thresholds':{'state':'UNCHANGED','measurement':False,'scoring':False,'thresholds':False},
   'respondent_session_persistence_report_calculation':{'state':'UNCHANGED'},
   'production_main':{'state':'UNTOUCHED'}
 },
 'reconciliation_verdict':'NO_UNRESOLVED_CONTRADICTION_OR_UNAUTHORIZED_STATUS_UPGRADE',
 'next_gate':'PASS 4G — Mandatory Full PASS Package / Final PASS 4 Sealing'
}
(W/'P120_WEBSCI_EXT_PASS4_PASS4F_RECONCILIATION_MATRIX_v1.0.json').write_text(json.dumps(matrix,ensure_ascii=False,indent=2)+'\n')

delta={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-PASS4F-DELTA-LEDGER','version':V,'date':DATE,
 'baseline':BASE,
 'entries':[
   {'stage':'PASS 4A','delta':'public-safe RU/EN projection + 25-reference extension projection','scientific_status_upgrade':False,'runtime_delta':False},
   {'stage':'PASS 4B','delta':'controlled Science renderer activation','scientific_status_upgrade':False,'runtime_delta':True},
   {'stage':'PASS 4C','delta':'Core-45 / Global-70 unified library + explicit Core identity rule','scientific_status_upgrade':False,'runtime_delta':True},
   {'stage':'PASS 4D','delta':'claim-boundary and semantic-parity QA only','scientific_status_upgrade':False,'runtime_delta':False},
   {'stage':'PASS 4E','delta':'presentation-only responsive/typography correction + hardened visual QA','scientific_status_upgrade':False,'runtime_delta':False,'presentation_delta':True},
   {'stage':'PASS 4F','delta':'closure reconciliation records and QA only','scientific_status_upgrade':False,'runtime_delta':False,'presentation_delta':False}
 ],
 'final_current_state':{
   'publication_projection_sha256':'2621ae1317b0161f3c3a819f79b2b874dfd9ba6e0c32e2d7ecb580841114758d',
   'global_library_projection_sha256':'a32623e1b058d3658ae0f3afbb1e6fdc4b3503a6132634ecc1868b6e335d146a',
   'global70_integrated_sha256':'af1fede5aeb36f2e4dc11fb55ad0f31fe5a74e2bd59fa9a0bb1aa7d405e8bdf8',
   'pass4b_renderer_sha256':'3a97e8838c73c56913b2cda03a5ea12afc579b1b085440b946ef800f2adbcc7b',
   'pass4c_library_runtime_sha256':'c8dd6b1c88706a2bb0c879099f5db0f87b2401b11fb5ca493037480781833425',
   'pass4e_visual_sha256':'d2fac104c534f0ea90e77d207887557afa8abd2ce246ac4f85c7f8ddbad48aeb'
 },
 'unresolved_delta_count':0
}
(W/'P120_WEBSCI_EXT_PASS4_PASS4F_DELTA_LEDGER_v1.0.json').write_text(json.dumps(delta,ensure_ascii=False,indent=2)+'\n')

(W/Q.name).write_bytes(Q.read_bytes())
summary={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-PASS4F-QA-SUMMARY','version':V,'date':DATE,'status':'PASS',
 'reconciliation_checks_total':qa['checks_total'],'reconciliation_checks_passed':qa['checks_passed'],'reconciliation_checks_failed':qa['checks_failed'],
 'upstream_authorities':{'PASS4A':'2970/2970 PASS','PASS4B':'198/198 PASS','PASS4C':'88/88 PASS','PASS4D_static':'448/448 PASS','PASS4D_browser':'448/448 PASS','PASS4E':'952/952 PASS'},
 'authority_chain':'CONSISTENT','historical_hash_disposition':'RECONCILED_WITH_EXPLICIT_SUPERSESSION_ONLY',
 'current_public_ceiling':'UNCHANGED','scientific_content_mutated':False,'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,'renderer_mutated':False,'presentation_mutated':False,
 'production_merge':'NOT_PERFORMED','parent_pass4_status':'OPEN_PENDING_PASS4G','next_gate':'PASS 4G — Mandatory Full PASS Package / Final PASS 4 Sealing'
}
(W/'P120_WEBSCI_EXT_PASS4_PASS4F_QA_SUMMARY_v1.0.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')

report=f'''# P-120 WEB-SCIENCE EXT PASS 4F — Closure Reconciliation

**Document ID:** P120-WEBSCI-EXT-004-PASS4F-REPORT  
**Version:** {V}  
**Date:** {DATE}  
**Status:** PASS / CLOSED / CONTROLLED  
**Baseline authority:** PASS 4E final closure `{BASE}`  
**Parent workstream:** WEB-SCIENCE EXT PASS 4 remains **OPEN** pending PASS 4G.

## 1. Purpose
PASS 4F performs closure reconciliation only. It does not reopen scientific adjudication, add references, change claims, alter module status, modify renderer/presentation code, touch measurement/scoring/threshold logic, or merge any Science work to production `main`.

## 2. Reconciled authority line
The controlled forward line is:

`PASS 4A publication projection → PASS 4B renderer → PASS 4C Global-70 integration → PASS 4D claim/parity QA → PASS 4E browser/responsive/typography QA → PASS 4F reconciliation`.

All stage manifests are present and remain `CLOSED_CONTROLLED`. Commit ancestry from the PASS 4A post-package head through the PASS 4E final closure is forward-only and contains no branch reversal in the authority chain.

## 3. Historical hashes versus final current state
PASS 4F preserves pass-local manifests as historical evidence. It does **not** rewrite an older manifest merely because a later authorized pass changed the same runtime file.

Two and only two historical/current differences are authorized:

1. `p120-webscience-pass4b-renderer-v0.6.js`: PASS 4B historical renderer hash → PASS 4C controlled integration state.
2. `p120-webscience-pass4c-library-v0.7.js`: PASS 4C historical library-runtime hash → PASS 4E additive presentation-loader state.

Every other manifest-listed artifact is required to remain identical to its historical pass-local SHA-256. Any additional drift is a PASS 4F blocker.

## 4. Reconciled scientific/public ceiling
The final public ceiling remains exactly the pre-existing controlled ceiling:

- evidence ladder: **E0 / E1 / E2 / E3 / E4**;
- **E1 is not empirical psychometric validation**;
- library contract: **45 Core + 25 PASS 4 extension = 70 Global**;
- reference count is coverage metadata, **not** a validity metric;
- COM-12, MOT-12, SELF-12, RPE-MOD and LIFE-12/18 remain `summary_only`;
- RPE detailed publication remains **SUPPRESSED**;
- DYADIC remains **HIDDEN**;
- no Extended super-score/total is authorized;
- cross-layer discriminant validity and incremental validity remain **NOT ESTABLISHED**;
- validated cross-layer synergy and causal effects remain **NOT AUTHORIZED**.

PASS 4F makes no scientific-status upgrade.

## 5. QA reconciliation
Upstream controlled evidence reconciles as:

- PASS 4A projection: **2970/2970 PASS**;
- PASS 4B renderer: **198/198 PASS**;
- PASS 4C Global-70: **88/88 PASS**;
- PASS 4D static claim/parity: **448/448 PASS**;
- PASS 4D browser parity: **448/448 PASS**;
- PASS 4E browser/responsive/typography: **952/952 PASS**.

PASS 4F additionally executes its own authority/hash/lineage reconciliation gate: **{qa['checks_passed']}/{qa['checks_total']} PASS; failed = {qa['checks_failed']}**.

The PASS 4A projection and PASS 4D static claim-boundary gates are re-run during the PASS 4F seal workflow; Global-70 is re-materialized and required to reproduce byte-for-byte.

## 6. No-change declaration
Scientific content = NONE · References = NONE · Evidence-state upgrade = NONE · Measurement = NONE · Scoring = NONE · Thresholds = NONE · Renderer = NONE · Presentation = NONE · Respondent sessions = NONE · Persistence = NONE · Report calculations = NONE · Production merge = NOT PERFORMED.

## 7. Reconciliation verdict
**PASS / AUTHORITY CHAIN RECONCILED / HISTORICAL HASHES DISPOSITIONED / CURRENT STATE BOUND / PUBLIC CEILING UNCHANGED / NO UNRESOLVED DELTA.**

PASS 4F closes the reconciliation subpass only. It does **not** close the parent WEB-SCIENCE EXT PASS 4.

**Next exact gate:** `WEB-SCIENCE EXT PASS 4G — Mandatory Full PASS Package / Final PASS 4 Sealing`.
'''
(W/'P120_WEBSCI_EXT_PASS4_PASS4F_REPORT_v1.0.md').write_text(report)

decision=f'''# P-120 WEB-SCIENCE EXT PASS 4F — Decision Record

**Decision:** PASS / CLOSED / CONTROLLED  
**Version:** {V}  
**Baseline:** `{BASE}`

1. Accept PASS 4A–4E as one forward authority chain with no unresolved contradiction.
2. Preserve all earlier manifests as immutable historical pass-local records.
3. Recognize only the two explicitly authorized runtime supersessions recorded in the PASS 4F authority chain.
4. Bind the final current Science state to the PASS 4E closure hashes without changing scientific content or public status.
5. Preserve Core-45 / Extension-25 / Global-70, the E0–E4 evidence ladder and all claim ceilings exactly as sealed upstream.
6. Preserve RPE detailed suppression, DYADIC hidden state, `summary_only` module publication and the prohibition on unsupported totals/synergy/causal claims.
7. Confirm no measurement, scoring, thresholds, respondent session, persistence or report-calculation mutation in PASS 4F.
8. Confirm production `main` is not merged or mutated by PASS 4F.
9. Keep parent `WEB-SCIENCE EXT PASS 4` OPEN until the mandatory full PASS 4 package and final sealing gate is completed.
10. Authorize only the next gate: **PASS 4G — Mandatory Full PASS Package / Final PASS 4 Sealing**.
'''
(W/'P120_WEBSCI_EXT_PASS4_PASS4F_DECISION_v1.0.md').write_text(decision)

files=[
 'qa/webscience_pass4f_closure_reconciliation_gate_v1.0.py',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4F_RECONCILIATION_QA_RESULT_v1.0.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4F_QA_SUMMARY_v1.0.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4F_AUTHORITY_CHAIN_v1.0.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4F_RECONCILIATION_MATRIX_v1.0.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4F_DELTA_LEDGER_v1.0.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4F_REPORT_v1.0.md',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4F_DECISION_v1.0.md'
]
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
manifest={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-PASS4F-MANIFEST','version':V,'date':DATE,
 'status':'PASS4F_CLOSED_CONTROLLED','branch':BRANCH,'baseline_commit':BASE,
 'parent_pass4_status':'OPEN_PENDING_PASS4G','production_main_mutated':False,'production_merge':'NOT_PERFORMED',
 'scientific_content_mutated':False,'references_mutated':False,'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,'renderer_mutated':False,'presentation_mutated':False,
 'authority_chain_reconciled':True,'historical_hashes_reconciled':True,'authorized_supersession_count':2,'unresolved_delta_count':0,
 'public_ceiling_unchanged':True,'files':[{'path':p,'sha256':sha(p)} for p in files],
 'next_gate':'PASS 4G — Mandatory Full PASS Package / Final PASS 4 Sealing'
}
(W/'P120_WEBSCI_EXT_PASS4_PASS4F_MANIFEST_v1.0.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(W/'P120_WEBSCI_EXT_PASS4_PASS4F_SHA256SUMS_v1.0.txt').write_text(''.join(f"{x['sha256']}  {x['path']}\n" for x in manifest['files']))

readme=W/'README.md'
text=readme.read_text()
marker='## PASS 4F closure — 2026-09-06'
if marker not in text:
    text += f'''\n\n{marker}\n`PASS / CLOSED / CONTROLLED / v1.0` — PASS 4A–4E authority chain, historical/current SHA dispositions, final public claim ceiling and no-change boundaries reconciled with zero unresolved delta. Parent WEB-SCIENCE EXT PASS 4 remains **OPEN**. Next and only authorized stage: **PASS 4G — Mandatory Full PASS Package / Final PASS 4 Sealing**.\n'''
    readme.write_text(text)
print(json.dumps(summary,ensure_ascii=False,indent=2))
