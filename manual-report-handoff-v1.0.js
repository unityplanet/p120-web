/* P-120 Manual Report Handoff v1.0
   Temporary respondent-facing transport layer for the controlled experimental phase.
   Measurement/scoring/question wording: unchanged.
   No server upload is performed unless a future intake endpoint is explicitly configured. */
(() => {
  'use strict';

  const ROOT_ID = 'p120-manual-report-handoff';
  const STYLE_ID = 'p120-manual-report-handoff-style';
  const isEn = /(^|\/)en(?:\/|$)/i.test(location.pathname);
  const STORAGE_KEY = window.P120_SESSION_KEY || (isEn ? 'p120_runtime_session_en_v1' : 'p120_runtime_session_ru_v1');
  let timer = 0;

  const copy = isEn ? {
    eyebrow: 'EXPERIMENTAL REPORT · MANUAL HANDOFF',
    title: 'Your answers are saved. The report can be calculated manually.',
    body: 'Automatic scoring and the language-model report layer are not connected yet. During the experimental phase, you can send the pseudonymous response package to the P-120 research team. It contains your Participant ID and scored-item responses needed for controlled manual calculation.',
    privacy: 'The package does not add your name, e-mail or phone number. Keep your Participant ID: it is the key used to match the response package with the experimental report.',
    idLabel: 'Participant ID',
    download: 'Download response package (.json)',
    share: 'Share response package',
    copyId: 'Copy Participant ID',
    copied: 'Participant ID copied.',
    downloaded: 'Response package prepared. Send this JSON file to the researcher for manual calculation.',
    shared: 'Response package shared.',
    shareFallback: 'File sharing is not available in this browser. The JSON package has been downloaded instead.',
    error: 'Could not prepare the response package. Please keep your Participant ID and contact the researcher.',
    status: 'Research Candidate · manual experimental calculation only'
  } : {
    eyebrow: 'ЭКСПЕРИМЕНТАЛЬНЫЙ ОТЧЁТ · РУЧНАЯ ПЕРЕДАЧА',
    title: 'Ваши ответы сохранены. Отчёт можно рассчитать вручную.',
    body: 'Автоматический scoring и языковая модель отчёта пока не подключены. На экспериментальном этапе вы можете передать исследовательской команде P-120 псевдонимный пакет ответов. В нём есть ваш Participant ID и ответы на scored-items, необходимые для контролируемого ручного расчёта.',
    privacy: 'Пакет не добавляет ваше имя, e-mail или телефон. Сохраните Participant ID: по нему пакет ответов связывается с экспериментальным отчётом.',
    idLabel: 'Participant ID',
    download: 'Скачать пакет ответов (.json)',
    share: 'Передать пакет ответов',
    copyId: 'Скопировать Participant ID',
    copied: 'Participant ID скопирован.',
    downloaded: 'Пакет ответов подготовлен. Передайте этот JSON-файл исследователю для ручного расчёта.',
    shared: 'Пакет ответов передан через системное меню.',
    shareFallback: 'Передача файла через системное меню недоступна. JSON-пакет скачан на устройство.',
    error: 'Не удалось подготовить пакет ответов. Сохраните Participant ID и свяжитесь с исследователем.',
    status: 'Research Candidate · только экспериментальный ручной расчёт'
  };

  function readState(){
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function coverage(state, instrument){
    const items = Array.isArray(instrument?.items) ? instrument.items : [];
    const responses = state?.responses || {};
    const answered = items.reduce((n,item) => {
      const v = responses[item.id];
      return n + (v !== undefined && v !== null && v !== '' ? 1 : 0);
    },0);
    return {
      answered,
      total: items.length,
      pct: items.length ? Math.round(answered / items.length * 100) : 0
    };
  }

  function buildPackage(){
    const state = readState();
    const instrument = window.P120_INSTRUMENT || {};
    if (!state?.participantId || !state?.responses || !Array.isArray(instrument.items)) {
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
      if (window.P120Scoring?.buildPrototypeResult) {
        prototypeResult = window.P120Scoring.buildPrototypeResult(state,instrument);
      }
    } catch (_) {}

    return {
      schema: 'p120.web.raw-response-package.v1.0',
      status: 'RESEARCH_CANDIDATE_MANUAL_HANDOFF',
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
        exported_at: new Date().toISOString()
      },
      administration_modes: state.adminModes || {},
      coverage: cov,
      responses: state.responses,
      response_records: responseRecords,
      prototype_result: prototypeResult,
      web_capture_scope: {
        scored_items_in_current_web_flow: instrument.items.length,
        non_scored_qa_and_qualitative_fields_included: false,
        note: 'Current web handoff preserves the scored-item response set available in the live web flow. Missing non-scored/qualitative metadata must not be invented during interpretation.'
      },
      privacy: {
        pseudonymous_id_only: true,
        direct_name_email_phone_added_by_handoff: false,
        telemetry_included: false
      }
    };
  }

  function fileFor(pkg){
    const json = JSON.stringify(pkg,null,2);
    const blob = new Blob([json],{type:'application/json;charset=utf-8'});
    const safeId = String(pkg.participant_id || 'P120').replace(/[^A-Za-z0-9_-]/g,'_');
    return {
      blob,
      name: `${safeId}_P120_manual_report_handoff.json`,
      file: new File([blob],`${safeId}_P120_manual_report_handoff.json`,{type:'application/json'})
    };
  }

  function downloadBlob(blob,name){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url),1200);
  }

  async function copyText(text){
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }

  function setMessage(root,text,isError=false){
    const el = root.querySelector('[data-handoff-message]');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('is-error',!!isError);
  }

  function ensureStyles(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}{margin-top:22px;padding:clamp(24px,3vw,44px);border:1px solid var(--frame-line,var(--line));border-radius:var(--radius,24px);background:var(--card);box-shadow:var(--frame-shadow,var(--shadow-soft));}
      #${ROOT_ID} .p120-handoff-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr);gap:clamp(22px,3vw,44px);align-items:start;}
      #${ROOT_ID} h3{margin:10px 0 14px;font-size:clamp(27px,2.5vw,42px);line-height:1.08;}
      #${ROOT_ID} p{max-width:900px;}
      #${ROOT_ID} .p120-handoff-id{padding:18px;border:1px solid var(--line);border-radius:16px;background:var(--soft-2);}
      #${ROOT_ID} .p120-handoff-id code{display:block;margin-top:7px;font-size:clamp(18px,2vw,26px);font-weight:800;letter-spacing:.06em;overflow-wrap:anywhere;}
      #${ROOT_ID} .p120-handoff-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px;}
      #${ROOT_ID} .p120-handoff-message{min-height:1.4em;margin-top:14px;font-size:13px;color:var(--ok,var(--ink));}
      #${ROOT_ID} .p120-handoff-message.is-error{color:var(--danger,#7a3b36);}
      #${ROOT_ID} .p120-handoff-status{margin-top:14px;font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:var(--muted);font-weight:800;}
      body[data-theme='graphite'] #${ROOT_ID}{background:var(--card);}
      @media(max-width:760px){#${ROOT_ID} .p120-handoff-grid{grid-template-columns:1fr;}#${ROOT_ID} .p120-handoff-actions .btn{width:100%;}}
    `;
    document.head.appendChild(style);
  }

  function makeCard(state){
    const section = document.createElement('section');
    section.id = ROOT_ID;
    section.setAttribute('aria-labelledby','p120-handoff-title');
    section.innerHTML = `
      <div class="p120-handoff-grid">
        <div>
          <div class="eyebrow">${copy.eyebrow}</div>
          <h3 id="p120-handoff-title">${copy.title}</h3>
          <p>${copy.body}</p>
          <p class="small">${copy.privacy}</p>
          <div class="p120-handoff-actions">
            <button type="button" class="btn" data-handoff-download>${copy.download}</button>
            <button type="button" class="btn secondary" data-handoff-share>${copy.share}</button>
            <button type="button" class="btn ghost" data-handoff-copy-id>${copy.copyId}</button>
          </div>
          <div class="p120-handoff-message" data-handoff-message aria-live="polite"></div>
          <div class="p120-handoff-status">${copy.status}</div>
        </div>
        <aside class="p120-handoff-id">
          <div class="eyebrow">${copy.idLabel}</div>
          <code>${String(state.participantId).replace(/[&<>"']/g,'')}</code>
        </aside>
      </div>`;
    return section;
  }

  function bind(root){
    const download = root.querySelector('[data-handoff-download]');
    const share = root.querySelector('[data-handoff-share]');
    const copyId = root.querySelector('[data-handoff-copy-id]');

    download?.addEventListener('click',() => {
      try {
        const pkg = buildPackage();
        const f = fileFor(pkg);
        downloadBlob(f.blob,f.name);
        setMessage(root,copy.downloaded);
      } catch (_) {
        setMessage(root,copy.error,true);
      }
    });

    share?.addEventListener('click',async() => {
      try {
        const pkg = buildPackage();
        const f = fileFor(pkg);
        const canFiles = !!navigator.share && (!navigator.canShare || navigator.canShare({files:[f.file]}));
        if (canFiles) {
          await navigator.share({
            files:[f.file],
            title:`P-120 · ${pkg.participant_id}`,
            text:isEn ? `P-120 experimental response package · Participant ID ${pkg.participant_id}` : `P-120 · экспериментальный пакет ответов · Participant ID ${pkg.participant_id}`
          });
          setMessage(root,copy.shared);
        } else {
          downloadBlob(f.blob,f.name);
          setMessage(root,copy.shareFallback);
        }
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setMessage(root,copy.error,true);
      }
    });

    copyId?.addEventListener('click',async() => {
      try {
        const state = readState();
        if (!state?.participantId) throw new Error('missing_id');
        await copyText(state.participantId);
        setMessage(root,copy.copied);
      } catch (_) {
        setMessage(root,copy.error,true);
      }
    });
  }

  function install(){
    timer = 0;
    if (document.getElementById(ROOT_ID)) return;
    const state = readState();
    if (!state?.participantId) return;
    const results = document.querySelector('.luxury-results-hero');
    if (!results) return;
    ensureStyles();
    const card = makeCard(state);
    results.insertAdjacentElement('afterend',card);
    bind(card);
  }

  function schedule(){
    if (timer) clearTimeout(timer);
    timer = setTimeout(install,80);
  }

  function start(){
    const watch = document.getElementById('app') || document.body;
    new MutationObserver(schedule).observe(watch,{childList:true,subtree:true});
    install();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
