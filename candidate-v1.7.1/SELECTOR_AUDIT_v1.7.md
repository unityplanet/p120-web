# P-120 Web Editorial v1.7 — Legacy Selector Audit

Final corrective/shipping audit. Scope is limited to removal of inherited theme-specific styling that could bypass the v1.7 semantic token system.

Raw enumeration of removed legacy selector groups: `qa/legacy_theme_rules_removed.txt` (120 entries captured during cleanup).

| Legacy selector / rule family | Affected component | Replacement semantic token / rule | Verified themes |
|---|---|---|---|
| pre-v1.7 `body[data-theme='graphite'|'museum'] .btn*` hard-coded cream/dark surfaces | CTA, secondary/ghost buttons, button links | `--cta-start`, `--cta-end`, `--cta-ink`, `--surface-soft`, `--frame-secondary` | Ivory / Graphite / Dark Museum PASS |
| legacy `.choice`, `.choice:hover`, `.choice.selected` theme overrides | Questionnaire option / active / selected state | `--surface-soft`, `--frame-secondary`, `--frame-interactive`, `--selection-start`, `--selection-end`, `--selection-ink` | Ivory / Graphite / Dark Museum PASS |
| v0.8/v0.9 Museum light-surface overrides | Hero/cards/science/questionnaire/result surfaces | `--canvas`, `--surface`, `--surface-soft`, `--surface-deep`, `--ink-primary` | Ivory / Graphite / Dark Museum PASS |
| v0.9.1 Museum contrast repair hard-coded text colors | labels, muted copy, card text | `--ink-primary`, `--ink-secondary`, `--ink-muted` | Ivory / Graphite / Dark Museum PASS |
| legacy theme-specific `semantic-distinction*` surfaces | A ≠ B distinctions | `--surface`, `--surface-deep`, `--frame-primary`, `--frame-secondary`, `--accent-primary` | Ivory / Graphite / Dark Museum PASS |
| legacy `system-meet strong` / encounter center material | Two Systems intersection node | `--accent-primary`, `--canvas` | Ivory / Graphite / Dark Museum PASS |
| hard-coded orbital node / line colors | Central P-120 architecture, orbital maps, diagrams | `--orbit-line`, `--orbit-node`, `--glow-node`, `--sphere-core` | Ivory / Graphite / Dark Museum PASS |
| v1.6.1 fixed frame values | structural frames, scientific frames, interactive borders | aliases rebound to `--frame-primary`, `--frame-secondary`, `--frame-soft`, `--frame-accent`, `--frame-scientific`, `--frame-interactive` | Ivory / Graphite / Dark Museum PASS |
| legacy mobile Museum palette rules | drawer, menu links, menu meta, bottom navigation | `--surface`, `--surface-soft`, `--frame-primary`, `--frame-secondary`, `--ink-*`, `--cta-*` | Ivory / Graphite / Dark Museum PASS |
| legacy status/pre/compare/arch hard-codes | status messages, technical preview, secondary surfaces | `--surface-soft`, `--surface-deep`, `--ink-secondary`, `--frame-secondary` | Ivory / Graphite / Dark Museum PASS |
| old theme-specific hover / focus values | buttons, choices, header theme menu, mobile controls | `--frame-interactive`, `--accent-primary`, semantic surfaces; global `:focus-visible` | Ivory / Graphite / Dark Museum PASS |
| root-only compatibility aliases (`--ink`, `--paper`, etc.) resolving to Ivory values in descendant themes | legacy components consuming compatibility names | aliases re-declared inside each final theme scope and point to that theme's semantic tokens | Ivory / Graphite / Dark Museum PASS |

## Final selector state

- Theme-specific selectors before the authoritative final v1.7 theme system: **0**.
- Legacy per-component hard-coded theme palette blocks: **removed**.
- Final theme-specific component parity rules consume semantic tokens only.
- Intended cream/champagne materials remain only for primary CTA and selected questionnaire response states; they are deliberate cross-theme identity elements, not inherited Ivory surfaces.

**Known theme-parity defects: NONE.**
