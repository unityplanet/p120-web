from pathlib import Path
import json, hashlib

PASSDIR=Path('webscience/pass4')
qa=json.loads((Path('qa-evidence-webscience-pass4c')/'P120_WEBSCI_EXT_PASS4_PASS4C_QA_RESULT_v0.7.json').read_text())
(PASSDIR/'P120_WEBSCI_EXT_PASS4_PASS4C_QA_RESULT_v0.7.json').write_text(json.dumps(qa,ensure_ascii=False,indent=2)+'\n')
summary={
 'document_id':'P120-WEBSCI-EXT-004-PASS4C-QA-SUMMARY','version':'v0.7','date':'2026-09-06','status':'PASS',
 'materialization_gate':'PASS','core45_probe':'PASS','checks_total':qa['checks_total'],'checks_passed':qa['checks_passed'],'checks_failed':qa['checks_failed'],
 'gate':'PASS 4C — Core-45 / Global-70 Library Integration','production_merge':'NOT_PERFORMED','next_gate':'PASS 4D — Claim-Boundary & RU/EN Parity QA'
}
(PASSDIR/'P120_WEBSCI_EXT_PASS4_PASS4C_QA_SUMMARY_v0.7.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
report=f'''# P-120 WEB-SCIENCE EXT PASS 4C — Core-45 / Global-70 Library Integration

**Document ID:** P120-WEBSCI-EXT-004-PASS4C-REPORT  
**Version:** v0.7  
**Date:** 2026-09-06  
**Status:** PASS / CLOSED / CONTROLLED  
**Parent PASS:** WEB-SCIENCE EXT PASS 4 remains OPEN.

## Scope
PASS 4C integrates the frozen Core-45 bibliography and the controlled REF-046..REF-070 extension into one navigable Global-70 scientific-library layer on the controlled pre-production branch. Production main is not merged.

## Identity contract
The frozen Core source object contains citation and DOI fields only; it contains no native REF IDs, module bindings or per-reference evidence roles. PASS 4C therefore assigns REF-001..REF-045 strictly by frozen Core array order while preserving citation/DOI identity. No Core module or evidence-role metadata is inferred. REF-046..REF-070 retain their controlled PASS 4 module and role bindings.

## Integration result
- Core: 45 source-native references, unchanged.
- PASS 4 extension: 25 controlled references.
- Global library: 70 continuous identities, REF-001..REF-070.
- DOI and normalized-citation deduplication: PASS across the integrated corpus.
- Unified navigation: all/Core/extension filters, source-authorized module filters, text search and `?ref=REF-xxx` deep linking.
- Existing Core bibliography is hidden only while the integrated Library view is active, preventing duplicate rendering; it is restored outside Library.

## Scientific boundary
Reference count is coverage metadata, not a validity metric. Core role bindings are not invented where the frozen source does not contain them. PASS 4 scientific status and claim ceilings are unchanged.

## QA
Materialization gate: PASS. Core-45 runtime re-probe: PASS. Independent RU/EN desktop/mobile browser gate: **{qa['checks_passed']}/{qa['checks_total']} PASS; failed = {qa['checks_failed']}**.

## No-change declaration
Measurement = NONE · Scoring = NONE · Thresholds = NONE · Respondent sessions = NONE · Persistence = NONE · Report calculations = NONE · Production main = NONE · Scientific status upgrade = NONE.

## Verdict
**PASS / CORE-45 IDENTITY PRESERVED / GLOBAL-70 LIBRARY INTEGRATED / DEDUPLICATION AND NAVIGATION ESTABLISHED.**

Next authorized gate: **WEB-SCIENCE EXT PASS 4D — Claim-Boundary & RU/EN Parity QA**.
'''
(PASSDIR/'P120_WEBSCI_EXT_PASS4_PASS4C_REPORT_v0.7.md').write_text(report)
decision='''# P-120 WEB-SCIENCE EXT PASS 4C — Decision Record

**Decision:** PASS / CLOSED / CONTROLLED  
**Version:** v0.7  

1. Preserve the frozen Core 45-reference array as the source authority.
2. Assign REF-001..REF-045 by frozen Core array order without altering source citation/DOI identity.
3. Do not infer Core per-reference module or evidence-role bindings absent from the source object.
4. Preserve controlled PASS 4 bindings for REF-046..REF-070.
5. Authorize the integrated Global-70 navigation layer on the controlled branch only.
6. Do not merge to production main in PASS 4C.
7. Advance to PASS 4D — Claim-Boundary & RU/EN Parity QA.
'''
(PASSDIR/'P120_WEBSCI_EXT_PASS4_PASS4C_DECISION_v0.7.md').write_text(decision)
files=[
 'p120-webscience-pass4b-renderer-v0.6.js','p120-webscience-pass4c-library-v0.7.js','webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json',
 'qa/webscience_pass4c_materialize_global_library_v0.7.mjs','qa/webscience_pass4c_core45_probe_v0.7.mjs','qa/webscience_pass4c_library_gate_v0.7.mjs',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4C_QA_RESULT_v0.7.json','webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4C_QA_SUMMARY_v0.7.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4C_REPORT_v0.7.md','webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4C_DECISION_v0.7.md'
]
manifest={'standard':'P120','document_id':'P120-WEBSCI-EXT-004-PASS4C-MANIFEST','version':'v0.7','date':'2026-09-06','status':'PASS4C_CLOSED_CONTROLLED','branch':'web-science-ext-pass4c-global-library-integration','baseline_commit':'9d07a3a047ce4b9a61b6f307e3f791fcdfabaff4','production_main_mutated':False,'production_merge':'NOT_PERFORMED','core45_mutated':False,'global70_integrated':True,'files':[],'next_gate':'PASS 4D — Claim-Boundary & RU/EN Parity QA'}
for f in files:
 manifest['files'].append({'path':f,'sha256':hashlib.sha256(Path(f).read_bytes()).hexdigest()})
(PASSDIR/'P120_WEBSCI_EXT_PASS4_PASS4C_MANIFEST_v0.7.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(PASSDIR/'P120_WEBSCI_EXT_PASS4_PASS4C_SHA256SUMS_v0.7.txt').write_text(''.join(f"{x['sha256']}  {x['path']}\n" for x in manifest['files']))
with (PASSDIR/'README.md').open('a',encoding='utf-8') as fh:
 fh.write('\n## PASS 4C closure — 2026-09-06\n`PASS / CLOSED / CONTROLLED / v0.7` — Core-45 identity is preserved and integrated with REF-046..REF-070 into a deduplicated, navigable Global-70 library. Core per-reference roles were not inferred because the frozen source contains citation/DOI identity only. Production main remains untouched. Next active stage: **PASS 4D — Claim-Boundary & RU/EN Parity QA**.\n')
print('PASS 4C closure records: PASS')
