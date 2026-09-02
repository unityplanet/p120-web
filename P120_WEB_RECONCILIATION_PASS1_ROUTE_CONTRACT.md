# P120 WEB RECONCILIATION PASS 1 — ROUTE AUTHORITY CONTRACT

**Document ID:** P120-WEB-REC-PASS1-ROUTE-CONTRACT  
**Version:** 1.0  
**Status:** FROZEN FOR RECONCILIATION  

## Route ownership

### `/`
Language: RU  
Role: Editorial public site  
May own: RU editorial navigation, public content, Scientific Base entry points  
Must not own after reconciliation: respondent System rendering, respondent session routing

### `/system/`
Language: RU  
Role: Respondent System  
May own: RU respondent UI, RU item realization, System navigation, shared measurement/scoring calls  
Must not own: EN translation behavior, Editorial DOM mutation

### `/en/`
Language: EN  
Role: English editorial public site  
May own: EN editorial navigation/content, English Scientific Base entry points  
Must not own: RU respondent route or DOM translator into System

### `/en/system/`
Language: EN  
Role: English respondent System  
May own: EN respondent UI, EN item realization, System navigation, shared measurement/scoring calls  
Must not own after reconciliation: post-render RU→EN translation, RU editorial runtime injection

## Shared cross-language authority

The following are language-independent:

- item IDs;
- module IDs;
- item order;
- response-value codes;
- administration-mode codes;
- scoring keys and functions;
- result calculation contract;
- submission response record schema.

Respondent text is not a scoring key.

## Runtime invariant

**Language belongs to presentation. Measurement belongs to item identity. Scoring belongs to coded response values.**

No route may infer scoring behavior from visible RU/EN wording.

## PASS 1 preservation rule

This contract describes the target ownership boundary only. It does not authorize behavioral changes during PASS 1.
