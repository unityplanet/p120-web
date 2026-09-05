# P120 Final Report Reference Renderer v1.0

Controlled reference implementation for **P120 Final Report Printable Architecture v1.0** (`P120-REP-ARCH-001/v1.0`).

## Authority boundary

The renderer is downstream of measurement, scoring, claim/evidence construction, report composition and publication authorization. It consumes an **already-authorized, sanitized and evidence-classified print document**. It does not score, infer, classify prose into L1–L4, repair missingness, create new cross-layer bridges, or raise publication authorization.

The reference implementation is deliberately separate from the existing `p120_release/renderer.py`, whose current responsibility is `RenderHandoff` construction and validation. Production wiring is a later integration gate.

## Output profile

- A4, 210 × 297 mm;
- P120 White Print Edition;
- deterministic HTML/CSS paged-media renderer;
- WeasyPrint 68 pinned backend;
- PDF/UA-1 tagged output with document language and semantic structure tree;
- seven canonical VA3 font roles, supplied externally from `P120 Canonical Font Package v1.0` and verified by exact SHA-256;
- no fallback fonts and no faux weights;
- text + line/form semantics for L1–L4, so evidence class is not color-only;
- server-side trace manifest preserves `element_id → source_ids` without printing source IDs into respondent-visible PDF;
- publication authorization remains visible and unchanged.

## Fail-closed invariants

- `NO_PUBLICATION` cannot render;
- architecture ID must equal `P120-REP-ARCH-001/v1.0`;
- all seven reference page classes must be represented by the reference fixture;
- L1/L2 require explicit source state;
- L3/L4 cannot carry numeric values;
- `missing / not_applicable / not_exposed / insufficient_coverage` cannot carry numeric values, including zero;
- visible internal routing IDs, email-like data and phone-like data are rejected;
- canonical font binaries are verified by exact SHA-256 before rendering;
- PDF postflight rejects non-A4 page drift, non-canonical font resources, missing PDF tagging, missing PDF/UA-1 identification, missing document language, or incomplete semantic structure tags.

## Reproducibility adapter

WeasyPrint 68 uses Python process-local object IDs for tagged table-header (`TH`) associations. This makes otherwise equivalent PDF/UA files byte-different. Generated header cells therefore carry renderer-owned stable `data-p120-th-id` values, and a narrow version-pinned adapter maps those values to deterministic numeric structure IDs during PDF generation. All other object IDs retain native behavior. Two independent renders of the synthetic fixture must be byte-identical.

## Synthetic reference run

```bash
python p120_reference_renderer.py \
  fixtures/synthetic_report_ru.json \
  P120_REFERENCE_RENDERER_SYNTHETIC_RU.pdf \
  --font-dir /secure/path/to/P120_Canonical_Font_Package_v1.0 \
  --manifest P120_REFERENCE_RENDERER_SYNTHETIC_RU_MANIFEST.json
```

The font package is **not stored in this repository**. The renderer expects the controlled package to be supplied at execution time and refuses a hash mismatch.

## Contract tests

```bash
python tests/test_reference_renderer.py
```

These tests do not require font binaries and cover the authorization/evidence/missingness/privacy contract. Full PDF rendering is a controlled QA action that additionally requires the canonical font package.
