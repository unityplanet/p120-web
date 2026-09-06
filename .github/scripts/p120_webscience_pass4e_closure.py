from pathlib import Path
import json, hashlib

V='v0.9'
DATE='2026-09-06'
BASE='89683b678b76dde7df1cdeccc05d6e8541573b5b'
BRANCH='web-science-ext-pass4e-browser-responsive-typography-qa'
E=Path('qa-evidence-webscience-pass4e')
W=Path('webscience/pass4')
Q=E/'P120_WEBSCI_EXT_PASS4_PASS4E_BROWSER_TYPOGRAPHY_QA_RESULT_v0.9.json'
qa=json.loads(Q.read_text())
if qa.get('status')!='PASS' or qa.get('checks_failed')!=0:
    raise SystemExit('PASS 4E browser/typography evidence is not fully PASS')
if qa.get('checks_total')!=952 or qa.get('checks_passed')!=952:
    raise SystemExit(f"PASS 4E final check cardinality mismatch: {qa.get('checks_passed')}/{qa.get('checks_total')}")
if not any('Science subnav labels remain contained' in x.get('id','') for x in qa.get('checks',[])):
    raise SystemExit('PASS 4E final subnav containment assertion is missing')
(W/Q.name).write_bytes(Q.read_bytes())

diagnostic=json.loads((W/'P120_WEBSCI_EXT_PASS4_PASS4E_DIAGNOSTIC_FINDINGS_v0.9.json').read_text())
if len(diagnostic.get('triage',{}).get('confirmed_blockers',[]))!=5:
    raise SystemExit('PASS 4E diagnostic blocker binding mismatch')

summary={
  'document_id':'P120-WEBSCI-EXT-004-PASS4E-QA-SUMMARY','version':V,'date':DATE,'status':'PASS',
  'matrix_state_count':2*7*5,
  'locales':['RU','EN'],
  'viewports':['320x800','390x844','768x1024','1024x900','1440x1000','1920x1080','2560x1440'],
  'bases':['CORE','EXTENDED','OUTCOMES','METHODS','LIBRARY'],
  'diagnostic_blocker_count':5,
  'post_gate_manual_visual_finding_count':1,
  'manual_visual_spotcheck_reconciled':True,
  'mobile_subnav_label_containment_asserted':True,
  'browser_typography_checks_total':qa['checks_total'],'browser_typography_checks_passed':qa['checks_passed'],'browser_typography_checks_failed':qa['checks_failed'],
  'upstream_regressions':{'PASS4A_projection':'2970/2970 PASS','PASS4C_global70':'88/88 PASS','PASS4D_static':'448/448 PASS','PASS4D_browser':'448/448 PASS'},
  'scope':'BROWSER_RESPONSIVE_TYPOGRAPHY_SCIENCE_QA',
  'presentation_corrections_applied':True,'scientific_content_mutated':False,'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,
  'production_merge':'NOT_PERFORMED','next_gate':'PASS 4F — Closure Reconciliation'
}
(W/'P120_WEBSCI_EXT_PASS4_PASS4E_QA_SUMMARY_v0.9.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')

report=f'''# P-120 WEB-SCIENCE EXT PASS 4E — Browser / Responsive / Typography Science QA

**Document ID:** P120-WEBSCI-EXT-004-PASS4E-REPORT  
**Version:** {V}  
**Date:** {DATE}  
**Status:** PASS / CLOSED / CONTROLLED  
**Parent PASS:** WEB-SCIENCE EXT PASS 4 remains OPEN.

## Scope
PASS 4E is the production-grade visual QA gate for the controlled Science stack established in PASS 4A–4D. It tests dedicated RU/EN Science surfaces across Core, Extended, Outcomes, Methods and the integrated Global-70 Library. It does not alter scientific claims, evidence states, measurement, scoring, thresholds, respondent data, persistence or report calculations.

## Diagnostic phase
The pre-correction diagnostic probe executed **70 rendered states**: 2 languages × 7 viewport classes × 5 active Science bases. It established that page-level responsive containment was already stable (zero document-level horizontal overflow and zero runtime-error runs), while identifying **five** presentation blockers requiring bounded correction:
1. long Global-70 evidence-role metadata chips could exceed the 320px content width;
2. several Russian H2 headings exhibited narrow-phone min-content clipping;
3. functional Science labels requested IBM Plex Sans weights 750–900 although the controlled web font request provides real weights only through 700;
4. selected mobile/tablet Science controls were below the 44px touch-target floor;
5. selected reader-facing Core prose remained at 11px on narrow phones.

The diagnostic evidence is bound to GitHub Actions run `{diagnostic['github_actions_run_id']}`, artifact `{diagnostic['github_artifact_id']}`, digest `{diagnostic['github_artifact_sha256']}`.

## Controlled presentation correction
PASS 4E adds `p120-webscience-pass4e-visual-v0.9.css` through an exact additive loader after the sealed PASS 4C library runtime. The stylesheet is scoped to `.science-page` and performs presentation-only corrections:
- maps functional IBM Plex Sans emphasis to real 600/700 weights, eliminating synthetic-weight dependence;
- assigns technical identifiers to IBM Plex Mono;
- adds min-content containment and narrow-phone H2 sizing;
- wraps long Global-70 role identifiers safely;
- establishes 44px mobile/tablet targets for Science subnavigation, Library filters and DOI controls;
- establishes a 12px narrow-phone floor for selected reader-facing scientific prose;
- preserves bottom-navigation reachability with dedicated Science bottom clearance.

## Post-gate manual visual reconciliation
A manual review of the generated narrow-screen evidence identified one additional presentation defect that the first numerical gate did not capture: on RU 320px and EN 390px Science views, horizontally compressed subnavigation pills could keep the page within the viewport while their labels visually collided. This finding did **not** change scientific content or evidence state, but it prevented final sealing.

The final correction makes mobile/tablet Science subnavigation a non-shrinking horizontally scrollable pill row and preserves each label inside its own control. The automated gate was extended with a per-state label-containment and adjacent-overlap assertion, so this defect can no longer pass merely because document-level horizontal overflow is zero.

## Final browser / responsive / typography gate
The final gate re-runs the complete **70-state matrix** and verifies document containment, canonical font inventory and computed-family use, real-weight conformance, IBM Plex Mono technical notation, critical H2 clipping, Global-70 chip containment, responsive control targets, **Science subnavigation label containment**, mobile prose floor, paragraph leading, sticky geometry, fixed-bottom-navigation reachability and runtime-error absence.

Result: **{qa['checks_passed']}/{qa['checks_total']} PASS; failed = {qa['checks_failed']}**.

Upstream scientific and integration regressions were also re-run unchanged: PASS 4A projection 2970/2970; PASS 4C Global-70 browser 88/88; PASS 4D static 448/448; PASS 4D rendered parity 448/448.

## Package seal control
The final package builder excludes `PACKAGE_CONTENT_SHA256SUMS.txt` from its own checksum set, verifies every listed package file, verifies ZIP integrity and verifies the external ZIP sidecar before artifact publication. This closes the earlier self-reference defect in the package checksum ledger without changing any scientific or presentation content.

## No-change declaration
Scientific content = NONE · Evidence-state upgrade = NONE · Measurement = NONE · Scoring = NONE · Thresholds = NONE · Respondent sessions = NONE · Persistence = NONE · Report calculations = NONE · Production main = NONE.

## Verdict
**PASS / RESPONSIVE SCIENCE MATRIX CONTROLLED / TYPOGRAPHY CONFORMANCE ESTABLISHED / GLOBAL-70 NARROW-VIEW CONTAINMENT ESTABLISHED / MANUAL VISUAL RECONCILIATION CLOSED / NO SCIENTIFIC STATUS UPGRADE.**

Next authorized gate: **WEB-SCIENCE EXT PASS 4F — Closure Reconciliation**.
'''
(W/'P120_WEBSCI_EXT_PASS4_PASS4E_REPORT_v0.9.md').write_text(report)

decision=f'''# P-120 WEB-SCIENCE EXT PASS 4E — Decision Record

**Decision:** PASS / CLOSED / CONTROLLED  
**Version:** {V}

1. Accept the PASS 4D closure commit `{BASE}` as the scientific/content baseline for PASS 4E.
2. Accept the scoped PASS 4E visual stylesheet as presentation-only corrective infrastructure.
3. Preserve all PASS 4A–4D scientific claims, evidence states, Core-45 identity, Global-70 identity, RPE suppression and DYADIC hidden state.
4. Require canonical Science typography to use the controlled five-family inventory and real loaded weights; synthetic IBM Plex Sans weights are not accepted.
5. Require technical Science identifiers to use IBM Plex Mono where explicitly bound by PASS 4E.
6. Require responsive containment at 320–2560px, including Global-70 long-role metadata and narrow Russian headings.
7. Require 44px Science interaction targets on mobile/tablet and readable narrow-phone narrative typography.
8. Require mobile/tablet Science subnavigation labels to remain individually contained with no adjacent visual collision; controlled horizontal scrolling is authorized for the pill row.
9. Require final package checksum ledgers to exclude self-reference and pass independent post-build verification.
10. Do not merge to production main in PASS 4E.
11. Advance to PASS 4F — Closure Reconciliation.
'''
(W/'P120_WEBSCI_EXT_PASS4_PASS4E_DECISION_v0.9.md').write_text(decision)

delta='''# P-120 WEB-SCIENCE EXT PASS 4E — Controlled Delta / Changelog

**Version:** v0.9  
**Authority boundary:** presentation only

## Added
- `p120-webscience-pass4e-visual-v0.9.css` — dedicated Science responsive/typography correction layer.
- exact additive PASS 4E stylesheet loader appended after the sealed PASS 4C library runtime.
- 70-state browser / responsive / typography QA gate.
- diagnostic 70-state visual probe and controlled diagnostic provenance record.
- per-state Science subnavigation label-containment and adjacent-overlap assertion after manual visual reconciliation.
- independent post-build package checksum verification.

## Corrected
- 320px Global-70 long evidence-role chip containment.
- 320px Russian H2 min-content clipping.
- synthetic IBM Plex Sans 750–900 functional emphasis replaced by real loaded 600/700 weights on Science surfaces.
- technical identifier family binding to IBM Plex Mono.
- mobile/tablet Science subnavigation, Library filter and DOI touch-target sizing.
- narrow-phone reader-facing scientific prose floor.
- fixed mobile-bottom-navigation content clearance.
- post-gate manual visual finding: mobile/tablet Science subnavigation pills are non-shrinking and horizontally scrollable, preventing RU/EN label collision.
- package checksum ledger self-reference eliminated; ledger is verified before and after ZIP creation.

## Explicitly unchanged
Scientific projection · evidence states · claims · Core-45 · REF-046..070 extension · Global-70 identities · RPE publication suppression · DYADIC visibility · measurement · scoring · thresholds · respondent sessions · persistence · report calculations · production main.
'''
(W/'P120_WEBSCI_EXT_PASS4_PASS4E_DELTA_v0.9.md').write_text(delta)

files=[
 'p120-webscience-pass4c-library-v0.7.js',
 'p120-webscience-pass4e-visual-v0.9.css',
 'qa/webscience_pass4e_visual_probe_v0.9.mjs',
 'qa/webscience_pass4e_browser_typography_gate_v0.9.mjs',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4E_DIAGNOSTIC_FINDINGS_v0.9.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4E_BROWSER_TYPOGRAPHY_QA_RESULT_v0.9.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4E_QA_SUMMARY_v0.9.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4E_REPORT_v0.9.md',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4E_DECISION_v0.9.md',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4E_DELTA_v0.9.md'
]
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
manifest={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-PASS4E-MANIFEST','version':V,'date':DATE,
 'status':'PASS4E_CLOSED_CONTROLLED','branch':BRANCH,'baseline_commit':BASE,
 'production_main_mutated':False,'production_merge':'NOT_PERFORMED','scientific_content_mutated':False,
 'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,
 'responsive_matrix_states':70,'diagnostic_blockers_corrected':5,'post_gate_manual_visual_findings_corrected':1,
 'manual_visual_spotcheck_reconciled':True,'mobile_subnav_label_collision_corrected':True,'mobile_subnav_label_containment_asserted':True,
 'package_ledger_self_reference_prevented':True,'package_post_build_verification_required':True,
 'typography_conformance_established':True,'global70_narrow_view_containment_established':True,
 'presentation_correction_layer':'p120-webscience-pass4e-visual-v0.9.css',
 'diagnostic_provenance':{'run_id':diagnostic['github_actions_run_id'],'artifact_id':diagnostic['github_artifact_id'],'artifact_sha256':diagnostic['github_artifact_sha256']},
 'files':[{'path':p,'sha256':sha(p)} for p in files],
 'next_gate':'PASS 4F — Closure Reconciliation'
}
(W/'P120_WEBSCI_EXT_PASS4_PASS4E_MANIFEST_v0.9.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(W/'P120_WEBSCI_EXT_PASS4_PASS4E_SHA256SUMS_v0.9.txt').write_text(''.join(f"{x['sha256']}  {x['path']}\n" for x in manifest['files']))

readme=W/'README.md'
text=readme.read_text()
marker='## PASS 4E closure — 2026-09-06'
entry=f'''{marker}\n`PASS / CLOSED / CONTROLLED / v0.9` — final 70-state RU/EN browser, responsive and typography QA completed over the sealed PASS 4A–4D Science stack. The final gate includes automated narrow-view Science subnavigation label containment after manual visual reconciliation, plus controlled package-ledger verification. Scientific content remains unchanged. Next active stage: **PASS 4F — Closure Reconciliation**.\n'''
if marker in text:
    before=text.split(marker,1)[0].rstrip()
    text=before+'\n\n'+entry
else:
    text=text.rstrip()+'\n\n'+entry
readme.write_text(text)
print(json.dumps(summary,ensure_ascii=False,indent=2))
