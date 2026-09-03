(() => {
  'use strict';

  const KEYS = Object.freeze({
    responses: 'p120_founder_alpha_ru_v1',
    feedback: 'p120_founder_alpha_feedback_ru_v1',
    log: 'p120_founder_alpha_runtime_log_ru_v1',
    manifest: 'p120_founder_alpha_source_manifest_ru_v1'
  });

  const ALLOWED_TYPES = new Set(['likert', 'comparative', 'single_choice']);
  const now = () => new Date().toISOString();
  const uid = () => `FA01-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
  const $ = (id) => document.getElementById(id);

  let corpus = null;
  let corpusRaw = null;
  let state = load(KEYS.responses, freshState());

  function freshState() {
    return {schema:'p120.fa01.responses.v1', participant_id:uid(), item_index:0, responses:{}, started_at:null, consent_at:null, completed_at:null};
  }

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch (_) { return fallback; }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function log(type, data = {}) {
    // Operational telemetry intentionally excludes response values and free-text notes.
    const existing = load(KEYS.log, {schema:'p120.fa01.runtime-log.v1', participant_id:state.participant_id, events:[]});
    existing.participant_id = state.participant_id;
    existing.events.push({at:now(), type, ...data});
    if (existing.events.length > 5000) existing.events = existing.events.slice(-5000);
    save(KEYS.log, existing);
  }

  async function sha256(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function validateCorpus(raw) {
    let c;
    try { c = JSON.parse(raw); } catch (_) { throw new Error('JSON корпуса не читается.'); }
    if (c.schema !== 'p120.fa01.corpus.v1') throw new Error('Неверный schema корпуса.');
    if (c.locale !== 'ru') throw new Error('Founder Alpha-01 PASS 1.1 разрешает только RU corpus.');
    if (!c.manifest || !Array.isArray(c.modules) || !Array.isArray(c.items)) throw new Error('Неполная структура корпуса.');
    if (Number(c.manifest.item_count) !== c.items.length) throw new Error('item_count не совпадает с фактическим количеством items.');
    const ids = new Set();
    const moduleIds = new Set(c.modules.map(m => m.id));
    for (const item of c.items) {
      if (!item.id || ids.has(item.id)) throw new Error(`Неуникальный или пустой item_id: ${item.id || '(empty)'}`);
      ids.add(item.id);
      if (!moduleIds.has(item.module)) throw new Error(`Неизвестный module_id у ${item.id}.`);
      if (!ALLOWED_TYPES.has(item.type)) throw new Error(`Неподдерживаемый response model у ${item.id}.`);
      if (!Array.isArray(item.choices) || !item.choices.length) throw new Error(`Нет choices у ${item.id}.`);
      if (item.candidate_scoring === true) throw new Error(`Candidate scoring запрещён: ${item.id}.`);
    }
    if (c.manifest.payload_sha256) {
      // The protected build hashes the canonical module+item payload, not the file that contains the hash itself.
      const actual = await sha256(JSON.stringify({modules:c.modules, items:c.items}));
      if (actual.toLowerCase() !== String(c.manifest.payload_sha256).toLowerCase()) throw new Error('SHA-256 корпуса не совпадает с manifest.');
    }
    return c;
  }

  function moduleFor(item) { return corpus.modules.find(m => m.id === item.module) || {name:item.module}; }

  function setStatus(text, good = null) {
    const el = $('loadStatus'); el.textContent = text; el.className = `status ${good === true ? 'ok' : good === false ? 'bad' : 'muted'}`;
  }

  async function loadSelectedCorpus() {
    const file = $('corpusFile').files[0];
    if (!file) return setStatus('Выбери локальный JSON корпуса.', false);
    try {
      corpusRaw = await file.text();
      corpus = await validateCorpus(corpusRaw);
      const sourceHash = await sha256(JSON.stringify({modules:corpus.modules, items:corpus.items}));
      const existingManifest = load(KEYS.manifest, null)?.manifest || null;
      if (state.started_at && existingManifest && (existingManifest.corpus_id !== corpus.manifest.corpus_id || existingManifest.corpus_version !== corpus.manifest.corpus_version || existingManifest.verified_sha256 !== sourceHash)) {
        throw new Error('Активная Alpha-сессия привязана к другому корпусу. Сначала экспортируй evidence и очисти локальные данные Alpha.');
      }
      const safeManifest = {...corpus.manifest, verified_sha256:sourceHash, loaded_at:now(), local_filename:file.name};
      save(KEYS.manifest, {schema:'p120.fa01.source-manifest.v1', manifest:safeManifest});
      log('corpus_loaded', {corpus_id:corpus.manifest.corpus_id, corpus_version:corpus.manifest.corpus_version, item_count:corpus.items.length});
      setStatus(`PASS: ${corpus.manifest.corpus_id} · ${corpus.items.length} records · SHA-256 verified locally.`, true);
      $('consentCard').classList.remove('hidden');
      restoreIfStarted();
    } catch (e) {
      corpus = null; corpusRaw = null; setStatus(`BLOCKED: ${e.message}`, false); log('corpus_rejected', {reason:String(e.message).slice(0,180)});
    }
  }

  function restoreIfStarted() {
    if (!state.started_at || !corpus) return;
    $('consentCard').classList.add('hidden');
    $('questionCard').classList.remove('hidden');
    $('feedbackCard').classList.remove('hidden');
    render();
  }

  function start() {
    if (!corpus || !$('consent').checked) return;
    if (!state.started_at) {
      state.started_at = now(); state.consent_at = now(); save(KEYS.responses, state); log('alpha_started', {item_count:corpus.items.length});
    }
    $('consentCard').classList.add('hidden'); $('questionCard').classList.remove('hidden'); $('feedbackCard').classList.remove('hidden'); render();
  }

  function render() {
    if (!corpus) return;
    if (state.item_index >= corpus.items.length) return finish();
    const item = corpus.items[state.item_index];
    const mod = moduleFor(item);
    $('questionMeta').textContent = `${mod.name || mod.id} · ${item.id} · ${state.item_index + 1} / ${corpus.items.length}`;
    $('questionText').textContent = item.text;
    const compare = $('compare');
    if (item.type === 'comparative') {
      compare.classList.remove('hidden'); $('optionA').textContent = item.optionA || ''; $('optionB').textContent = item.optionB || '';
    } else compare.classList.add('hidden');
    const existing = state.responses[item.id]?.value;
    $('choices').innerHTML = '';
    for (const c of item.choices) {
      const b = document.createElement('button'); b.className = `choice ${existing === c.value ? 'selected' : ''}`; b.textContent = c.label;
      b.onclick = () => select(item, c); $('choices').appendChild(b);
    }
    $('prev').disabled = state.item_index === 0;
    $('next').disabled = !state.responses[item.id];
    logOncePresented(item);
  }

  function logOncePresented(item) {
    const l = load(KEYS.log, {events:[]});
    const seen = (l.events || []).some(e => e.type === 'item_presented' && e.item_id === item.id);
    if (!seen) log('item_presented', {item_id:item.id, module_id:item.module});
  }

  function classifyResponseState(choice) {
    if (choice && choice.response_state) return String(choice.response_state);
    const v = String(choice?.value ?? '').toUpperCase();
    if (['NA','N/A','NOT_APPLICABLE'].includes(v)) return 'NOT_APPLICABLE';
    if (['NO_EXPERIENCE','INSUFFICIENT_EXPERIENCE'].includes(v)) return 'NO_EXPERIENCE';
    if (['PREFER_NOT_ANSWER','PNA'].includes(v)) return 'PREFER_NOT_ANSWER';
    if (['UNKNOWN','DONT_KNOW'].includes(v)) return 'UNKNOWN';
    return 'ANSWERED';
  }

  function select(item, choice) {
    const old = state.responses[item.id];
    state.responses[item.id] = {item_id:item.id, module_id:item.module, value:choice.value, response_state:classifyResponseState(choice), answered_at:now()};
    save(KEYS.responses, state);
    // No response value is sent to runtime log.
    log(old ? 'response_changed' : 'response_recorded', {item_id:item.id, module_id:item.module, response_state:state.responses[item.id].response_state});
    render();
  }

  function next() {
    if (!corpus) return; const item = corpus.items[state.item_index]; if (!state.responses[item.id]) return;
    state.item_index += 1; save(KEYS.responses, state); log('navigation_next', {from_item_id:item.id}); render();
  }

  function prev() {
    if (state.item_index <= 0) return; state.item_index -= 1; save(KEYS.responses, state); log('navigation_prev', {to_index:state.item_index}); render();
  }

  function saveFeedback() {
    if (!corpus) return;
    const note = $('feedbackNote').value.trim(); if (!note) return;
    const item = corpus.items[Math.min(state.item_index, corpus.items.length - 1)] || null;
    const f = load(KEYS.feedback, {schema:'p120.fa01.feedback.v1', participant_id:state.participant_id, records:[]});
    f.participant_id = state.participant_id;
    f.records.push({at:now(), scope:item ? 'ITEM' : 'SESSION', item_id:item?.id || null, module_id:item?.module || null, category:$('feedbackCategory').value, severity:$('feedbackSeverity').value, note, proposed_action:null});
    save(KEYS.feedback, f); $('feedbackNote').value=''; log('founder_feedback_saved', {scope:item ? 'ITEM' : 'SESSION', item_id:item?.id || null, category:$('feedbackCategory').value, severity:$('feedbackSeverity').value});
  }

  function finish() {
    if (!state.completed_at) { state.completed_at = now(); save(KEYS.responses, state); log('alpha_completed', {answered:Object.keys(state.responses).length}); }
    $('questionCard').classList.add('hidden'); $('feedbackCard').classList.add('hidden'); $('finishCard').classList.remove('hidden');
  }

  function download(name, value) {
    const blob = new Blob([JSON.stringify(value, null, 2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  }

  function exportEvidence(kind) {
    const stamp = new Date().toISOString().replace(/[:.]/g,'-');
    const values = {
      responses: load(KEYS.responses, freshState()),
      feedback: load(KEYS.feedback, {schema:'p120.fa01.feedback.v1',participant_id:state.participant_id,records:[]}),
      log: load(KEYS.log, {schema:'p120.fa01.runtime-log.v1',participant_id:state.participant_id,events:[]}),
      manifest: load(KEYS.manifest, {schema:'p120.fa01.source-manifest.v1',manifest:null})
    };
    if (kind === 'bundle') return download(`FA01_EVIDENCE_BUNDLE_${stamp}.json`, {schema:'p120.fa01.evidence-bundle.v1', exported_at:now(), ...values});
    download(`FA01_${kind.toUpperCase()}_${stamp}.json`, values[kind]);
  }

  function clearAll() {
    if (!confirm('Удалить локальные ответы, feedback, runtime log и source manifest Founder Alpha?')) return;
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    state = freshState(); corpus = null; corpusRaw = null; location.reload();
  }

  $('loadCorpus').onclick = loadSelectedCorpus;
  $('clearAll').onclick = clearAll;
  $('consent').onchange = () => { $('start').disabled = !$('consent').checked; };
  $('start').onclick = start;
  $('next').onclick = next;
  $('prev').onclick = prev;
  $('saveFeedback').onclick = saveFeedback;
  document.querySelectorAll('[data-export]').forEach(b => b.onclick = () => exportEvidence(b.dataset.export));
})();
