from pathlib import Path
import json, hashlib, subprocess

V='v0.8'
DATE='2026-09-06'
BASE='211c0f4f0d2601c46bc2d4d283ade84aee474c47'
BRANCH='web-science-ext-pass4d-claim-boundary-parity-qa'
E=Path('qa-evidence-webscience-pass4d')
W=Path('webscience/pass4')
static=json.loads((E/'P120_WEBSCI_EXT_PASS4_PASS4D_STATIC_QA_RESULT_v0.8.json').read_text())
browser=json.loads((E/'P120_WEBSCI_EXT_PASS4_PASS4D_BROWSER_QA_RESULT_v0.8.json').read_text())
matrix=json.loads((E/'P120_WEBSCI_EXT_PASS4_PASS4D_CLAIM_MATRIX_v0.8.json').read_text())
if static['status']!='PASS' or browser['status']!='PASS' or matrix['status']!='PASS':
    raise SystemExit('PASS 4D QA evidence is not fully PASS')

for src,name in [
    (E/'P120_WEBSCI_EXT_PASS4_PASS4D_STATIC_QA_RESULT_v0.8.json','P120_WEBSCI_EXT_PASS4_PASS4D_STATIC_QA_RESULT_v0.8.json'),
    (E/'P120_WEBSCI_EXT_PASS4_PASS4D_BROWSER_QA_RESULT_v0.8.json','P120_WEBSCI_EXT_PASS4_PASS4D_BROWSER_QA_RESULT_v0.8.json'),
    (E/'P120_WEBSCI_EXT_PASS4_PASS4D_CLAIM_MATRIX_v0.8.json','P120_WEBSCI_EXT_PASS4_PASS4D_CLAIM_MATRIX_v0.8.json')]:
    (W/name).write_bytes(src.read_bytes())

summary={
 'document_id':'P120-WEBSCI-EXT-004-PASS4D-QA-SUMMARY','version':V,'date':DATE,'status':'PASS',
 'static_checks_total':static['checks_total'],'static_checks_passed':static['checks_passed'],'static_checks_failed':static['checks_failed'],
 'bilingual_pair_count':static['bilingual_pair_count'],'claim_matrix_count':len(matrix['claims']),
 'browser_checks_total':browser['checks_total'],'browser_checks_passed':browser['checks_passed'],'browser_checks_failed':browser['checks_failed'],
 'scope':'CLAIM_BOUNDARY_AND_RU_EN_PARITY_QA','scientific_content_mutated':False,'production_merge':'NOT_PERFORMED',
 'next_gate':'PASS 4E — Browser / Responsive / Typography Science QA'
}
(W/'P120_WEBSCI_EXT_PASS4_PASS4D_QA_SUMMARY_v0.8.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')

report=f'''# P-120 WEB-SCIENCE EXT PASS 4D — Claim-Boundary & RU/EN Parity QA

**Document ID:** P120-WEBSCI-EXT-004-PASS4D-REPORT  
**Version:** {V}  
**Date:** {DATE}  
**Status:** PASS / CLOSED / CONTROLLED  
**Parent PASS:** WEB-SCIENCE EXT PASS 4 remains OPEN.

## Scope
PASS 4D performs adversarial claim-boundary and RU/EN parity QA over the sealed PASS 4A publication projection, PASS 4B renderer and PASS 4C Global-70 library integration. It introduces no new scientific content and does not upgrade any evidence state.

## Authority and parity rule
Semantic parity is established against the controlled bilingual source projection, not by free translation. Every bilingual reader-facing object that exposes either `ru` or `en` must contain both non-empty language variants; English variants must contain no Cyrillic. Structural identities, construct codes, evidence-state codes, REF identities and canonical technical evidence-role identifiers remain language-invariant.

## Claim-boundary matrix
The controlled matrix contains **{len(matrix['claims'])} critical claims**. It confirms, among other boundaries:
- E1 internal architecture verification is not empirical psychometric validation.
- E3/E4 remain NOT_ESTABLISHED for all Extended/Outcomes modules.
- Cross-layer discriminant/incremental validity is NOT_ESTABLISHED; synergy and causal effects are NOT_AUTHORIZED.
- No Extended total is authorized.
- RPE detailed constructs/references remain suppressed.
- DYADIC remains hidden.
- COM/MOT/SELF/LIFE publication ceilings retain their prohibitions.
- Library count remains coverage metadata, not a validity metric.
- Core per-reference evidence roles are not inferred.

## RU/EN parity result
Static bilingual-object audit: **{static['bilingual_pair_count']} controlled bilingual pairs inspected**. Missing-language, empty-language and English-Cyrillic checks: PASS. Rendered RU/EN parity is checked on desktop and mobile across positioning, EXTENDED, OUTCOMES, METHODS and integrated LIBRARY. Structural signatures match between languages.

Canonical technical library role identifiers remain untranslated because they are controlled metadata identifiers rather than reader-facing narrative prose.

## Browser claim-boundary QA
Independent rendered-surface gate: **{browser['checks_passed']}/{browser['checks_total']} PASS; failed = {browser['checks_failed']}**. The gate verifies canonical source-text presence, module/evidence/ref identity, RPE suppression, cross-layer ceilings, Global-70 identity, no inferred Core roles, storage isolation, forbidden affirmative-claim absence and RU/EN structural parity.

## No-change declaration
Scientific content = NONE · Measurement = NONE · Scoring = NONE · Thresholds = NONE · Respondent sessions = NONE · Persistence = NONE · Report calculations = NONE · Production main = NONE · Scientific status upgrade = NONE.

## Verdict
**PASS / CLAIM BOUNDARIES PRESERVED / CONTROLLED RU-EN SEMANTIC PARITY ESTABLISHED / NO SCIENTIFIC STATUS UPGRADE.**

Next authorized gate: **WEB-SCIENCE EXT PASS 4E — Browser / Responsive / Typography Science QA**.
'''
(W/'P120_WEBSCI_EXT_PASS4_PASS4D_REPORT_v0.8.md').write_text(report)

decision=f'''# P-120 WEB-SCIENCE EXT PASS 4D — Decision Record

**Decision:** PASS / CLOSED / CONTROLLED  
**Version:** {V}  

1. Accept the sealed PASS 4A bilingual projection as the semantic source authority for public Science copy.
2. Confirm claim-boundary preservation across PASS 4B/4C rendered surfaces.
3. Confirm RU/EN parity by canonical bilingual presence plus language-invariant structural identity.
4. Keep E1 distinct from empirical psychometric validation; do not upgrade E2/E3/E4 states.
5. Keep RPE detail suppressed and DYADIC hidden.
6. Keep Global-70 reference count as coverage metadata only and do not infer Core per-reference evidence roles.
7. Treat uppercase extension evidence-role strings as canonical technical identifiers, not translatable narrative copy.
8. Do not merge to production main in PASS 4D.
9. Advance to PASS 4E — Browser / Responsive / Typography Science QA.
'''
(W/'P120_WEBSCI_EXT_PASS4_PASS4D_DECISION_v0.8.md').write_text(decision)

files=[
 'qa/webscience_pass4d_claim_boundary_static_gate_v0.8.mjs',
 'qa/webscience_pass4d_claim_boundary_browser_gate_v0.8.mjs',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4D_STATIC_QA_RESULT_v0.8.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4D_BROWSER_QA_RESULT_v0.8.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4D_CLAIM_MATRIX_v0.8.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4D_QA_SUMMARY_v0.8.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4D_REPORT_v0.8.md',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4D_DECISION_v0.8.md'
]
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
manifest={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-PASS4D-MANIFEST','version':V,'date':DATE,
 'status':'PASS4D_CLOSED_CONTROLLED','branch':BRANCH,'baseline_commit':BASE,
 'production_main_mutated':False,'production_merge':'NOT_PERFORMED','scientific_content_mutated':False,
 'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,
 'claim_boundaries_preserved':True,'ru_en_parity_established':True,
 'files':[{'path':p,'sha256':sha(p)} for p in files],
 'next_gate':'PASS 4E — Browser / Responsive / Typography Science QA'
}
(W/'P120_WEBSCI_EXT_PASS4_PASS4D_MANIFEST_v0.8.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(W/'P120_WEBSCI_EXT_PASS4_PASS4D_SHA256SUMS_v0.8.txt').write_text(''.join(f"{x['sha256']}  {x['path']}\n" for x in manifest['files']))

readme=W/'README.md'
text=readme.read_text()
marker='## PASS 4D closure — 2026-09-06'
if marker not in text:
    text += f'''\n\n{marker}\n`PASS / CLOSED / CONTROLLED / v0.8` — adversarial claim-boundary and RU/EN semantic-parity QA completed over the sealed PASS 4A–4C public Science stack. No scientific content or evidence state was upgraded. Next active stage: **PASS 4E — Browser / Responsive / Typography Science QA**.\n'''
    readme.write_text(text)
print(json.dumps(summary,ensure_ascii=False,indent=2))
