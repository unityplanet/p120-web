# P-120 Web Editorial v1.7.1 — Full-Binary Staging Gate

## Input integrity
- v1.7 source ZIP SHA-256: `faaca8821090c50252a8b5e1baf01c0c7ebe68e1599e8ce8cf67c919c923a88b`
- v1.7.1 patch ZIP SHA-256: `b8ca91623a5b788a15ae61bc5c68c19f042df79a1c61b748cc76f1dd5cb2aac5`
- source index SHA-256: `ede354331a4b9f4c3bb606a7a474c17261cadb22d430cf0d6a8d953037b6ce2a`
- patched index SHA-256: `1f77801f864518689bfb0f4e27b7ca0124691d60c25a169b4eafe95278876cde`

## Integration gate
- exact v1.7 Render-Led signatures: PASS
- exact v1.7.1 patch bundle hash: PASS
- deterministic patch application: PASS
- independently reconstructed allowed source delta: PASS
- theme key `museum`: PRESERVED
- Museum runtime theme-color: `#F2EEE2`
- Russian theme label: `Музейная`
- JavaScript syntax: PASS
- CSS structural balance: PASS

## Frozen logic boundary
The integration algorithm permits only the verified Museum Teal CSS cascade plus the two presentation/theme-registry literal substitutions. Measurement, scoring, questions, scientific claims, archetypes, compatibility and result-calculation logic are outside the allowed delta.

## Remaining gate
Browser visual regression QA is still required before production promotion. This candidate must not replace v1.6.1 live until the hosted preview is visually approved.
