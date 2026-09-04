# P-120 WEB — GLOBAL HEADER BRAND LOCKUP CLEANING / PASS 2.1
## Упрочнение кода и консолидация единого источника управления

**Идентификатор документа:** P120-WEB-HDR-P21-HARDEN  
**Версия:** 1.0  
**Статус:** PASS / CODE HARDENED / REGRESSION-GATED / CODE FROZEN  
**Дата:** 2026-09-04  
**Рабочий поток:** P-120 Web / Global Public Shell  
**Базовый PASS 1:** `2f64cb6d821d7d4f15acec13ebfc929a7230ff76`  
**PASS 2 Technical Audit:** `P120_WEB_GLOBAL_HEADER_BRAND_LOCKUP_CLEANING_PASS2_CODE_AUDIT.md`  
**Production hardening commit:** `a9a5621f09752b1d3477bde6fd837fe2199c18fe`  
**Принятый QA head:** `99ca9f021d9a08ddf8e14c70baadbd8ad20bab78`  
**Научная / измерительная / scoring-логика:** БЕЗ ИЗМЕНЕНИЙ  
**Визуальный редизайн:** НЕ РАЗРЕШЁН / НЕ ВЫПОЛНЯЛСЯ  
**Why P-120:** FROZEN / КОМПОЗИЦИЯ НЕ ПЕРЕОТКРЫВАЛАСЬ

---

## 00 — Управляющее решение

PASS 2.1 завершён как presentation-preserving техническое упрочнение общего header / brand-lockup слоя P-120 Web.

Исходный дефект PASS 1 остаётся закрыт. Выявленные PASS 2 competing-authority и lifecycle-риски устранены в production-источниках, а отдельный постоянный CI gate теперь контролирует как исходный regression, так и более строгие требования PASS 2.1.

**Решение:** область **Global Header Brand Lockup / Canonical Header Authority** переводится в состояние **CODE FROZEN**. Любое последующее изменение этой области требует отдельного change-control решения и повторного прохождения обоих regression gates.

---

## 01 — Preservation Firewall

PASS 2.1 не изменял и не имел полномочий изменять:

- состав, порядок или формулировки assessment items;
- scoring, формулы, индексы или report calculations;
- scientific claims, evidence ledger или методологическую интерпретацию;
- Supabase / Auth / RLS / persistence architecture;
- содержание правовых документов;
- утверждённую narrative composition страницы Why P-120;
- принятую визуальную геометрию brand lockup.

Изменения ограничены источником рендеринга общего header, first-paint CSS authority, удалением устаревших competing rules, idempotency shared runtime и соответствующей QA-инфраструктурой.

---

## 02 — Production implementation

Production hardening зафиксирован commit:

`a9a5621f09752b1d3477bde6fd837fe2199c18fe`

Commit содержит **24 production files**, **202 additions / 95 deletions**. После этого production-commit последующие изменения до cleanup-head касались только постоянного QA gate и удаления одноразовой apply-инфраструктуры; production header sources повторно не менялись.

### 02.1 — Canonical first-paint authority

Для 20 governed RU/EN HTML routes canonical brand stylesheet и correction stylesheet теперь присутствуют статически в `<head>` до runtime reconciliation. Одновременно ранний bootstrap устанавливает `p120-brand53-ready`, поэтому page-local legacy CSS больше не получает самостоятельное first-paint окно управления brand lockup.

Canonical resources:

- `p120-brand-system-v1.0.css?v=532`;
- `p120-pass53-visual-corrections-v1.0.css?v=532`;
- bootstrap marker `data-p120-brand-bootstrap="5.3.2"`.

### 02.2 — Удаление competing responsive authority

Устаревшее правило `.brand-mark { display:none }` удалено из всех шести live RU/EN Main / Science / System source files, где оно оставалось после PASS 1.

Историческая preview-копия не является production authority и не использовалась как governed runtime source.

### 02.3 — Source-canonical brand rendering

Main / Science / System теперь маркируют уже создаваемый ими canonical orbit markup как `data-p120-canonical-brand="5.3"`; shared runtime не переписывает корректный brand node после render.

Explore (`extended`, `together`, RU/EN) и Founder (`creator`, RU/EN) получили canonical brand markup, canonical navigation / tools в исходном HTML. Старые Explore / Founder desktop brand/control placeholders больше не создают параллельную authority до canonical runtime.

### 02.4 — Why P-120 freeze preservation

Why P-120 не переводился на новую narrative/header composition. В frozen RU source canonicalизирован только brand lockup с сохранением compatibility classes; EN proxy продолжает использовать существующий controlled localisation transport. Навигационная и editorial composition страницы не переоткрывались.

### 02.5 — Shared runtime 5.3.2

`p120-brand-system-v1.0.js` переведён на revision `5.3.2`:

- canonical CSS устанавливается немедленно при исполнении runtime как fallback, а не ждёт `DOMContentLoaded`;
- `patchBrand()` распознаёт уже canonical source markup и не делает ненужный `innerHTML` rewrite;
- `patchResumeRail()` выполняет DOM write только при реальном изменении значения;
- broad reconciliation заменён filtered/coalesced mutation handling для релевантных header / resume / footer surfaces;
- добавлен диагностический `getReconcileCount()` для QA;
- loaders используют cache-bust `?v=532`.

---

## 03 — Закрытие findings PASS 2

| Finding | Статус PASS 2.1 | Закрытие |
|---|---|---|
| P2-N01 — legacy `.brand-mark { display:none }` | **CLOSED** | Удалён из всех шести live production source families; source gate проверяет отсутствие правила. |
| P2-N02 — runtime-injected canonical CSS / first-paint window | **CLOSED** | Canonical CSS + correction CSS статически находятся в `<head>` 20 governed routes; bootstrap активирует ready-state до body render; runtime сохраняет immediate fallback. |
| P2-N03 — broad MutationObserver + non-idempotent resume write | **CLOSED** | Resume write value-idempotent; mutation reconciliation filtered и coalesced; отдельный saved-session idempotency test = PASS. |
| P2-N04 — hidden → visible orbit-mark phase | **CLOSED** | Новый lifecycle gate не обнаружил такой фазы в 40 route/viewport cases. |
| P2-N05 — distributed pre-canonical brand authority | **CLOSED / CONTROLLED** | Main-family рендерит сразу canonical markup; Explore / Founder имеют canonical source header; Why сохраняет frozen composition, но brand node canonical с первого source render; Legal использует одну runtime authority без competing local brand implementation. |

---

## 04 — Принятый QA gate

**Workflow:** `P120 WEB Global Header PASS 2.1 Hardened QA`  
**Run ID:** `33870861947`  
**Job ID:** `101016248424`  
**QA head:** `99ca9f021d9a08ddf8e14c70baadbd8ad20bab78`  
**Заключение:** **SUCCESS**

Результат PASS 2.1 hardened gate:

- governed source routes: **20**;
- runtime route/viewport cases: **40**;
- viewport widths: **390 px / 1440 px**;
- saved-session idempotency cases: **1**;
- failures: **0**.

На каждом runtime case gate проверяет canonical runtime revision, единственность stylesheet/runtime/header/brand host/orbit mark, orbit structure, отсутствие hidden→visible и visible→hidden transitions, отсутствие duplicate visible mark, отсутствие видимых legacy controls и отсутствие console/page errors.

В том же accepted workflow повторно выполнен исходный PASS 1 gate:

**GLOBAL HEADER BRAND LOCKUP CLEANING / PASS 1 — PASS (32 route/viewport cases).**

Таким образом PASS 2.1 не только прошёл новый более строгий gate, но и не открыл исходный regression PASS 1.

---

## 05 — QA trace note

Первый запуск нового PASS 2.1 QA workflow был отклонён из-за неверного тестового fixture: он заполнял assessment-session key, тогда как Main editorial resume rail создаётся из отдельного editorial-state key. Это не было production defect.

Fixture был исправлен исключительно в QA-коде: accepted run использует согласованный editorial + assessment local fixture. Production code после исправления fixture не изменялся.

Этот rejected run не является release evidence. Единственный принимаемый PASS 2.1 gate для closure — run `33870861947`.

---

## 06 — Controlled QA evidence

**Artifact:** `P120_WEB_GLOBAL_HEADER_PASS21_HARDENED_QA`  
**Artifact ID:** `9935882149`  
**Размер:** 10,020,103 bytes  
**SHA-256:** `d13bd585a841db36b9fef032c18daf8a5cbaee70cdc997a0daed9c9086f1c0f2`

Artifact включает PASS 2.1 report / screenshots и повторный PASS 1 evidence corpus.

---

## 07 — Одноразовая implementation infrastructure

После принятого QA одноразовые apply-компоненты удалены из main:

- `.github/workflows/apply-global-header-pass21.yml`;
- `qa/apply_global_header_pass21.py`;
- `qa/run_global_header_pass21.py`.

Они были необходимы только для детерминированного применения large-file source changes и не должны оставаться повторно исполняемой production-maintenance authority.

Постоянно остаются:

- `qa/global_header_brand_lockup_cleaning_pass1.mjs`;
- `qa/global_header_code_integrity_pass2.mjs`;
- `qa/global_header_code_hardening_pass21.mjs`;
- `.github/workflows/qa-global-header-pass2-code-audit.yml`;
- `.github/workflows/qa-global-header-pass21-code-hardened.yml`.

---

## 08 — Freeze boundary

**FROZEN:**

- canonical orbit mark structure;
- P-120 brand lockup structure;
- canonical descriptor authority;
- first-paint brand CSS authority;
- source/runtime ownership model для governed header brand surfaces;
- PASS 1 + PASS 2.1 regression expectations.

**Не означает freeze:**

- всех страниц P-120 Web;
- содержимого других workstreams;
- будущих separately-authorized navigation/content improvements;
- assessment / account / report development.

Если будущий change затрагивает frozen header authority, изменение должно быть явно авторизовано, не менять scientific / measurement substance и обязано пройти permanent PASS 2.1 hardened QA вместе с PASS 1 original regression gate.

---

## 09 — Final gate

**VISUAL STATE:** PASS / PRESERVED  
**PASS 1 ORIGINAL REGRESSION:** CLOSED / PASS  
**PASS 2 AUDIT FINDINGS:** CLOSED  
**PASS 2.1 HARDENING:** PASS  
**PASS 2.1 QA:** PASS / 40 OF 40  
**SAVED-SESSION IDEMPOTENCY:** PASS  
**PASS 1 RE-RUN:** PASS / 32 OF 32  
**BLOCKING DEFECTS:** 0  
**CODE FROZEN — GLOBAL HEADER BRAND AUTHORITY:** YES  
**SCIENTIFIC / MEASUREMENT / SCORING CHANGE:** NONE

**PASS 2.1 CLOSED.**
