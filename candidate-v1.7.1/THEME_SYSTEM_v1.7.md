# P-120 Theme System v1.7 — Final

The final v1.7 frontend uses semantic roles as the authoritative color/surface system. Theme parity is not implemented as color inversion.

## Core surface tokens

- `--canvas`
- `--canvas-elevated`
- `--surface`
- `--surface-soft`
- `--surface-deep`

## Ink tokens

- `--ink-primary`
- `--ink-secondary`
- `--ink-muted`

## Line / frame architecture

- `--line-soft`
- `--line`
- `--line-strong`
- `--frame-primary`
- `--frame-secondary`
- `--frame-soft`
- `--frame-accent`
- `--frame-scientific`
- `--frame-interactive`

## Accent / light

- `--accent-primary`
- `--accent-secondary`
- `--accent-warm`
- `--glow-soft`
- `--glow-node`
- `--glow-cta`

## Orbital architecture

- `--orbit-line`
- `--orbit-node`
- `--sphere-core`

## Interaction materials

- `--cta-start`
- `--cta-end`
- `--cta-ink`
- `--selection-start`
- `--selection-end`
- `--selection-ink`
- `--control-overlay`

Primary CTA and selected questionnaire responses intentionally use a restrained cream/champagne material across all themes. This is an identity material, not Ivory-theme inheritance.

## Theme identities

### Ivory / Light Editorial

Museum catalogue / luxury scientific publication. Warm ivory, parchment and bone surfaces; graphite ink; muted bronze/champagne and restrained teal. Frames remain structurally visible without dashboard-like card weight.

### Graphite

Architectural drawing room / editorial studio. Medium charcoal and warm gray surfaces with muted cream typography, aged brass and desaturated teal. It deliberately remains materially lighter than Dark Museum.

### Dark Museum

Private museum after dark / digital installation. Warm near-black canvas, charcoal surfaces, cream typography, aged champagne/bronze and muted teal. No pure-black/white-on-black UI, neon or cyberpunk behavior.

## Backward-compatibility aliases

Legacy component names such as `--paper`, `--card`, `--ink`, `--muted`, `--accent`, `--shadow` remain only as compatibility aliases.

**Critical final rule:** they are redeclared inside each theme scope and resolve to that theme's semantic tokens. This prevents old components from accidentally receiving Ivory values in Graphite or Dark Museum.

## Component parity rule

CTA, selected/active questionnaire states, semantic distinctions, science surfaces, central architecture, report preview, drawer, bottom navigation, status surfaces and focus/hover states consume semantic roles.

The raw legacy-selector removal record is in `qa/legacy_theme_rules_removed.txt`; the mapping is documented in `SELECTOR_AUDIT_v1.7.md`.

Final theme-parity status: **PASS**.
