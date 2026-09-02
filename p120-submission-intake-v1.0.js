/* P-120 Submission Intake v1.0
   Automatic pseudonymous response persistence for the controlled research phase.
   Scoring, interpretation, question wording and frozen measurement authorities are untouched.
   Client may INSERT only. No respondent-facing SELECT/UPDATE/DELETE path is implemented here.
*/
(() => {
  'use strict';

  const RECEIPT_PREFIX = 'p120_submission_receipt_v10_';
  const STATUS_ID = 'p120-submission-intake-status';
  const isEn = /(^|\/)en(?:\/|$)/i.test(location.pathname);
  const STORAGE_KEY = window.P120_SESSION_KEY || (isEn ? 'p120_runtime_session_en_v1' : 'p120_runtime_session_ru_v1');
  let observer = null;
  let scheduled = 0;
  let running = false;

  const text = isEn ? {
    pending: 'Saving your pseudonymous response package to the private P-120 research store…',
    success: 'Responses received. Keep your Participant ID — it is sufficient to locate this submission for controlled experimental calculation.',
    duplicate: 'This response package is already stored. Keep your Participant ID for the experimental report.',
    failed: 'Server storage could not be confirmed. Your answers remain in this browser; use the JSON download/share fallback below.',
    incomplete: 'Automatic submission waits until all scored items in the current web flow are answered.',
    label: 'P-120 SUBMISSION INTAKE'
  } : {
    pending: 'Сохраняем псевдонимный пакет ответов в приватное исследовательское хранилище P-120…',
    success: 'Ответы приняты. Сохраните Participant ID — его достаточно, чтобы найти эту отправку для контролируемого экспериментального расчёта.',
    duplicate: 'Этот пакет ответов уже сохранён. Сохраните Participant ID для экспериментального отчёта.',
    failed: 'Не удалось подтвердить серверное сохранение. Ответы остаются в этом браузере; используйте резервную загрузку/передачу JSON ниже.',
    incomplete: 'Автоматическая отправка начнётся после ответа на все scored-items текущей web-формы.',
    label: 'P-120 SUBMISSION INTAKE'
  };

  function config(){
    const c = window.P120_SUBMISSION_CONFIG || {};
    return {
      enabled: c.enabled === true,
      provider: c.provider || 'supabase-rest',
      projectUrl: String(c.projectUrl || '').replace(/\/+$/,''),
      publishableKey: String(c.publishableKey || ''),
      table: /^[A-Za-z_][A-Za-z0-9_]*$/.test(String(c.table || '')) ? String(c.table) : 'p120_submissions',
      requireCompleteCoverage: c.requireCompleteCoverage !== false,
      maxPayloadBytes: Number(c.maxPayloadBytes) > 0 ? Number(c.maxPayloadBytes) : 262144,
      requestTimeoutMs: Number(c.requestTimeoutMs) > 0 ? Number(c.requestTimeoutMs) : 15000
    };
  }

  function configured(c){
    return c.enabled && c.provider === 'supabase-rest' && /^https:\/\/[^/]+\.supabase\.co$/i.test(c.projectUrl) && c.publishableKey.length > 20;
  }

  function readState(){
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function coverage(state,instrument){
    const items = Array.isArray(instrument?.items) ? instrument.items : [];
    const responses = state?.responses || {};
    const answered = items.reduce((n,item) => {
      const v = responses[item.id];
      return n + (v !== undefined && v !== null && v !== '' ? 1 : 0);
    },0);
    return { answered, total: items.length, pct: items.length ? Math.round(answered / items.length * 100) : 0 };
  }

  function buildPackage(){
    const state = readState();
    const instrument = window.P120_INSTRUMENT || {};
    if (!state?.participantId || !/^P120-[A-Z0-9]{6}$/.test(state.participantId) || !state.responses || !Array.isArray(instrument.items)) {
      throw new Error('session_state_unavailable');
    }
    const cov = coverage(state,instrument);
    const responseRecords = instrument.items.map((item,index) => ({
      item_id: item.id,
      module: item.module,
      response_value: Object.prototype.hasOwnProperty.call(state.responses,item.id) ? state.responses[item.id] : null,
      presented_position: index + 1
    }));
    let prototypeResult = null;
    try {
      if (window.P120Scoring?.buildPrototypeResult) prototypeResult = window.P120Scoring.buildPrototypeResult(state,instrument);
    } catch (_) {}
    return {
      schema: 'p120.web.raw-response-package.v1.0',
      status: 'RESEARCH_CANDIDATE_AUTOMATIC_INTAKE',
      authority_note: 'Transport package only. Authoritative calculations remain governed by the frozen P-120 Export Schema, Technical Keys, scoring manuals and controlled interpretation rules.',
      participant_id: state.participantId,
      locale: isEn ? 'en' : 'ru',
      instrument: {
        name: instrument.instrument || 'P-120 vNext',
        form_version: instrument.formVersion || null,
        prototype_version: instrument.prototypeVersion || null
      },
      session: {
        started_at: state.startedAt || null,
        consent_at: state.consentAt || null,
        completed_at: state.lastSavedAt || null,
        submitted_at: new Date().toISOString()
      },
      administration_modes: state.adminModes || {},
      coverage: cov,
      responses: state.responses,
      response_records: responseRecords,
      prototype_result: prototypeResult,
      web_capture_scope: {
        scored_items_in_current_web_flow: instrument.items.length,
        non_scored_qa_and_qualitative_fields_included: false,
        note: 'Current web intake preserves the scored-item response set available in the live web flow. Missing non-scored/qualitative metadata must not be invented during interpretation.'
      },
      privacy: {
        pseudonymous_id_only: true,
        direct_name_email_phone_added_by_intake: false,
        telemetry_included: false
      }
    };
  }

  function stableStringify(value){
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
  }

  async function sha256Hex(value){
    if (!window.crypto?.subtle || !window.TextEncoder) throw new Error('webcrypto_unavailable');
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(digest),b => b.toString(16).padStart(2,'0')).join('');
  }

  function receiptKey(participantId){
    return RECEIPT_PREFIX + participantId;
  }

  function loadReceipt(participantId){
    try { return JSON.parse(localStorage.getItem(receiptKey(participantId)) || 'null'); }
    catch (_) { return null; }
  }

  function saveReceipt(receipt){
    try { localStorage.setItem(receiptKey(receipt.participant_id),JSON.stringify(receipt)); }
    catch (_) {}
  }

  function ensureStatusUI(){
    let el = document.getElementById(STATUS_ID);
    if (el) return el;
    const results = document.querySelector('.luxury-results-hero');
    if (!results) return null;
    el = document.createElement('div');
    el.id = STATUS_ID;
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    el.style.cssText = 'margin-top:14px;padding:14px 16px;border:1px solid var(--line);border-radius:14px;background:var(--soft-2);font-size:13px;line-height:1.5;';
    const handoff = document.getElementById('p120-manual-report-handoff');
    if (handoff) {
      const host = handoff.querySelector('.p120-handoff-actions')?.parentElement || handoff;
      const actions = host.querySelector('.p120-handoff-actions');
      if (actions) host.insertBefore(el,actions); else host.appendChild(el);
    } else {
      results.insertAdjacentElement('afterend',el);
    }
    return el;
  }

  function setStatus(kind,message,meta=''){
    const el = ensureStatusUI();
    if (!el) return;
    el.dataset.status = kind;
    el.textContent = `${text.label} · ${message}${meta ? ' · ' + meta : ''}`;
  }

  function delay(ms){ return new Promise(resolve => setTimeout(resolve,ms)); }

  async function postRow(c,row){
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),c.requestTimeoutMs);
    try {
      return await fetch(`${c.projectUrl}/rest/v1/${encodeURIComponent(c.table)}`,{
        method:'POST',
        headers:{
          'apikey': c.publishableKey,
          'Content-Type':'application/json',
          'Prefer':'return=minimal'
        },
        body:JSON.stringify(row),
        signal:controller.signal,
        cache:'no-store',
        credentials:'omit',
        referrerPolicy:'no-referrer'
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  async function submitNow(){
    const c = config();
    if (!configured(c)) return {status:'disabled'};
    if (running) return {status:'busy'};
    running = true;
    try {
      const pkg = buildPackage();
      if (c.requireCompleteCoverage && (!pkg.coverage.total || pkg.coverage.answered !== pkg.coverage.total)) {
        setStatus('incomplete',text.incomplete,`${pkg.coverage.answered}/${pkg.coverage.total}`);
        return {status:'incomplete',coverage:pkg.coverage};
      }

      const fingerprintInput = stableStringify({
        participant_id:pkg.participant_id,
        locale:pkg.locale,
        form_version:pkg.instrument.form_version,
        prototype_version:pkg.instrument.prototype_version,
        administration_modes:pkg.administration_modes,
        responses:pkg.responses
      });
      const payloadHash = await sha256Hex(fingerprintInput);
      const previous = loadReceipt(pkg.participant_id);
      if (previous?.status === 'stored' && previous.payload_sha256 === payloadHash) {
        setStatus('stored',text.duplicate,pkg.participant_id);
        return previous;
      }

      const serialized = JSON.stringify(pkg);
      const payloadBytes = new TextEncoder().encode(serialized).byteLength;
      if (payloadBytes > c.maxPayloadBytes) throw new Error('payload_too_large');

      const row = {
        participant_id:pkg.participant_id,
        schema_version:pkg.schema,
        form_version:pkg.instrument.form_version,
        prototype_version:pkg.instrument.prototype_version,
        status:'received',
        coverage_answered:pkg.coverage.answered,
        coverage_total:pkg.coverage.total,
        payload_sha256:payloadHash,
        payload:pkg,
        client_completed_at:pkg.session.completed_at
      };

      setStatus('pending',text.pending,pkg.participant_id);
      let response = null;
      let lastError = null;
      for (let attempt=0; attempt<3; attempt++) {
        try {
          response = await postRow(c,row);
          if (response.ok || response.status === 409) break;
          const detail = await response.text().catch(()=>'');
          lastError = new Error(`intake_http_${response.status}${detail ? ':' + detail.slice(0,180) : ''}`);
          if (response.status >= 400 && response.status < 500 && response.status !== 409 && response.status !== 429) break;
        } catch (err) {
          lastError = err;
        }
        if (attempt < 2) await delay(attempt === 0 ? 700 : 1800);
      }

      if (!response || (!response.ok && response.status !== 409)) throw lastError || new Error('intake_failed');
      const receipt = {
        schema:'p120.submission-receipt.v1.0',
        status:'stored',
        participant_id:pkg.participant_id,
        payload_sha256:payloadHash,
        stored_at:new Date().toISOString(),
        provider:c.provider,
        duplicate:response.status === 409
      };
      saveReceipt(receipt);
      setStatus('stored',response.status === 409 ? text.duplicate : text.success,pkg.participant_id);
      window.dispatchEvent(new CustomEvent('p120:submission-stored',{detail:receipt}));
      return receipt;
    } catch (err) {
      console.error('[P120 submission intake]',err);
      setStatus('failed',text.failed);
      window.dispatchEvent(new CustomEvent('p120:submission-failed',{detail:{message:String(err?.message || err)}}));
      return {status:'failed',error:String(err?.message || err)};
    } finally {
      running = false;
    }
  }

  function attemptInstall(){
    scheduled = 0;
    const c = config();
    if (!configured(c)) return;
    if (!document.querySelector('.luxury-results-hero')) return;
    ensureStatusUI();
    submitNow();
  }

  function schedule(){
    if (scheduled) clearTimeout(scheduled);
    scheduled = setTimeout(attemptInstall,120);
  }

  function start(){
    const root = document.getElementById('app') || document.body;
    observer = new MutationObserver(schedule);
    observer.observe(root,{childList:true,subtree:true});
    attemptInstall();
  }

  window.P120SubmissionIntake = Object.freeze({
    version:'1.0',
    submitNow,
    buildPackage,
    getReceipt:() => {
      const state = readState();
      return state?.participantId ? loadReceipt(state.participantId) : null;
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
