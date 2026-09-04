# P-120 WEB — GLOBAL PRIVACY POLICY / CONTACT PROCESSING RECONCILIATION PASS

**Document ID:** P120-WEB-PRIV-CONTACT-001  
**Version:** v1.0  
**Date:** 2026-09-05  
**Status:** CLOSED / PASS  
**Environment:** SANDBOX / RESEARCH CANDIDATE  
**Authority:** P-120 Research System  

## 01. Objective

Reconcile the global `/privacy/` publication with the factual Contact v1.1 processing model before Contact becomes globally discoverable through footer/mobile navigation.

This pass is a governance/publication reconciliation. It is not a redesign of the Contact backend, not a production-jurisdiction legal opinion, and not a replacement for the later production Privacy Policy.

## 02. Verified processing authority

The reconciliation was performed against the implemented Contact pipeline rather than against assumed behavior.

Verified web/client scope:

- Contact is general correspondence only and is not bound to Participant ID, P-120 responses, assessment results, or reports.
- The submitted Contact payload contains optional name, required e-mail, subject, message, locale, form version, privacy-notice version, plus anti-bot/timing inputs used for validation.
- The browser submits through the `p120-contact-submit` Supabase Edge Function.

Verified server/storage scope:

- Allowed Contact message storage fields are locale, sender name, sender e-mail, subject, message body, status/source metadata, form version, privacy-notice version, received timestamp, and retention timestamp.
- `retention_until` is set to receipt time + 90 days.
- An active daily retention job calls `p120_private.contact_retention_cleanup_v1()` and removes expired Contact messages and expired rate-limit markers.
- Raw IP is used transiently by the Edge Function to derive HMAC rate-limit bucket keys and is not written into the stored Contact message record.
- Rate limiting uses IP-short, IP-day and e-mail-day HMAC buckets. The short IP window is 15 minutes; daily IP/e-mail windows are 24 hours.
- Expired rate-limit markers are removed by the rate-limit path and by the daily retention cleanup.

## 03. Publication change

The global RU and EN Privacy routes now use the dedicated `p120-privacy-pages-v1.1.js` publication authority.

The reconciled policy explicitly documents:

1. sandbox/document status;
2. separation of research intake and Contact correspondence;
3. pseudonymous research Participant ID boundary;
4. research response/operational-data scope;
5. browser local-storage scope;
6. private research-storage boundary;
7. Contact data categories;
8. Contact processing purpose;
9. private Contact storage and 90-day retention;
10. short-lived HMAC rate limiting and raw-IP non-storage in the message record;
11. Contact content boundary for sensitive/research/payment data;
12. the still-open production-level legal/privacy gate.

No statute, jurisdiction, controller identity, lawful-basis claim, international-transfer claim, payment-processing claim, cookie/advertising claim, or production consumer-law statement was added in this sandbox pass.

## 04. Version boundary

The Contact transport contract remains unchanged:

- `P120-CONTACT-FORM-v1.1`
- `P120-CONTACT-PRIVACY-v1.0`

The new global page publication is `Global Privacy Reconciliation v1.1`. This is a publication/governance version and does not alter the Contact endpoint contract or stored privacy-notice version.

## 05. Files

Added:

- `p120-privacy-pages-v1.1.js`
- `P120_WEB_GLOBAL_PRIVACY_CONTACT_PROCESSING_RECONCILIATION_PASS_v1.0.md`

Updated:

- `privacy/index.html`
- `en/privacy/index.html`

Unchanged by design:

- Contact form fields and copy;
- `p120-contact-v1.0.js` transport contract;
- Supabase Edge Function and database functions;
- research measurement/scoring/content;
- Intellectual Property and Terms publication authorities;
- global footer/mobile Contact discoverability.

## 06. Closure decision

**GOV-PRIV-CONTACT-001: CLOSED / PASS.**

The previous major governance dependency is closed at sandbox level: the global Privacy publication now describes the implemented Contact processing model.

**Backend blocker:** NO.  
**Sandbox Privacy reconciliation:** PASS.  
**Contact global activation eligibility:** UNBLOCKED from this dependency.  
**Contact footer/mobile activation:** NOT PERFORMED IN THIS PASS.  
**Production Privacy/legal gate:** OPEN.

The next web pass may activate Contact in global desktop footer and mobile navigation without reopening this reconciliation, provided the Contact processing model and `P120-CONTACT-PRIVACY-v1.0` contract remain unchanged.
