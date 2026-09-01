# P-120 Web IP / Legal Sandbox Implementation v1.0

**Date:** 2026-09-01  
**Environment:** GitHub Pages sandbox/test deployment  
**Displayed rights-holder:** `DEC`  
**Legal notice version:** `P120-IP-SANDBOX-v1.0`

## Implemented

- Global localized RU/EN copyright footer using `© 2026 DEC`.
- Dedicated RU/EN Intellectual Property & Permitted Use routes.
- Dedicated RU/EN sandbox Terms and Privacy routes.
- Compatibility aliases under `/ru/intellectual-property/`, `/ru/terms/`, `/ru/privacy/`.
- Affirmative pre-assessment clickwrap. No pre-ticked legal acceptance control is used.
- Clickwrap record stored locally as `p120_legal_acceptance_v1` with notice version, rights-holder, environment, acceptance method, timestamp and locale.
- Assessment interaction guard for restored sessions that entered the questionnaire before the current notice version was accepted.
- Result-screen rights notice and IP link.
- Legal layer loaded on RU/EN main assessment, Founder routes and Why P-120 routes.
- Repository-level `RIGHTS_NOTICE.md`.

## Boundary

This implementation changes presentation, legal navigation and assessment-entry access only. It does **not** change frozen item wording, measurement constructs, scoring logic, thresholds, report calculations, scientific claims or Supabase intake rules.

## Production gates still open

- Verify documentary chain of title and replace/confirm `DEC` as the exact production rights-holder identity.
- Issue final production Terms of Use and Privacy Policy after jurisdiction/data-processing review.
- Decide trademark filing strategy for P-120 and related brand identifiers.
- Decide whether legal acceptance evidence should additionally be persisted server-side under the final privacy architecture.

## Primary implementation files

- `p120-legal-runtime-v1.0.js`
- `p120-legal-pages-v1.0.js`
- `p120-legal-v1.0.css`
- `intellectual-property/index.html`
- `en/intellectual-property/index.html`
- `terms/index.html`
- `en/terms/index.html`
- `privacy/index.html`
- `en/privacy/index.html`
- `RIGHTS_NOTICE.md`

## Deployment

GitHub Pages build for current `main` HEAD completed successfully after the implementation commits.
