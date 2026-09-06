/* P-120 WEB-SCIENCE EXT PASS 4B Renderer v0.6
   Activates PASS 4A public-safe projection on dedicated RU/EN Science routes.
   Additive presentation layer only. No questionnaire, scoring, thresholds,
   respondent-session, persistence or report-calculation access. */
(()=>{
  'use strict';

  const VERSION='0.6';
  const PROJECTION_FILE='webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json';
  const LIBRARY_FILE='webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json';
  const EXPECTED_PROJECTION='P120-WEBSCI-PUBLICATION-PROJECTION-001';
  const EXPECTED_LIBRARY='P120-WEBSCI-GLOBAL-LIBRARY-PROJECTION-001';
  const MODULE_IDS=['COM-12','MOT-12','SELF-12','RPE-MOD','LIFE-12/18'];
  const dedicated=/(?:^|\/)(?:en\/)?science\/?(?:index\.html)?$/i.test(location.pathname);
  if(!dedicated)return;
  if(window.P120SciencePublicationRenderer?.version===VERSION)return;

  const currentScript=document.currentScript;
  const scriptUrl=currentScript?.src||new URL('p120-webscience-pass4b-renderer-v0.6.js',location.href).href;
  const projectionUrl=new URL(PROJECTION_FILE,scriptUrl).href;
  const libraryUrl=new URL(LIBRARY_FILE,scriptUrl).href;
  const state={
    version:VERSION,phase:'loading',pass:false,errors:[],warnings:[],
    projection:null,library:null,activeBaseId:null,activeModuleId:null
  };

  const isEn=()=>document.documentElement.lang?.toLowerCase().startsWith('en')||/\/en\/science\/?/i.test(location.pathname);
  const L=()=>isEn()?'en':'ru';
  const local=v=>v&&typeof v==='object'&&!Array.isArray(v)?(v[L()]??v.en??v.ru??''):String(v??'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fail=m=>state.errors.push(String(m));
  const moduleById=id=>state.projection?.modules?.find(m=>m.module_id===id)||null;
  const baseById=id=>state.projection?.bases?.find(b=>b.base_id===id)||null;

  function validateProjection(p,l){
    if(!p||p.schema_id!==EXPECTED_PROJECTION)fail(`projection schema mismatch: ${p?.schema_id||'missing'}`);
    if(!l||l.schema_id!==EXPECTED_LIBRARY)fail(`library schema mismatch: ${l?.schema_id||'missing'}`);
    if(p?.production_state!=='NOT_ACTIVATED')fail('PASS 4A projection production_state must remain NOT_ACTIVATED');
    if(l?.production_state!=='NOT_ACTIVATED')fail('PASS 4A library production_state must remain NOT_ACTIVATED');
    const r=p?.projection_rules||{};
    if(r.renderer_consumes_public_safe_fields_only!==true)fail('public-safe renderer rule missing');
    if(r.core_scientific_content_preserved!==true)fail('Core preservation rule missing');
    if(r.measurement_mutation_allowed!==false)fail('measurement mutation boundary broken');
    if(r.scoring_mutation_allowed!==false)fail('scoring mutation boundary broken');
    if(r.threshold_mutation_allowed!==false)fail('threshold mutation boundary broken');
    if(r.session_storage_access!=='PROHIBITED')fail('session storage boundary broken');
    if(r.extended_total_allowed!==false)fail('Extended total boundary broken');
    if(r.dyadic_public_activation!==false)fail('DYADIC publication boundary broken');
    if(r.rpe_detailed_public_activation!==false)fail('RPE detail boundary broken');

    const ids=(p?.modules||[]).map(m=>m.module_id);
    if(JSON.stringify(ids)!==JSON.stringify(MODULE_IDS))fail(`module projection identity mismatch: ${ids.join(',')}`);
    for(const m of p?.modules||[]){
      if(m.visibility!=='summary_only')fail(`${m.module_id} must remain summary_only`);
      if(m.evidence_state?.E3!=='NOT_ESTABLISHED')fail(`${m.module_id} E3 unexpectedly established`);
      if(m.evidence_state?.E4!=='NOT_ESTABLISHED')fail(`${m.module_id} E4 unexpectedly established`);
    }
    const rpe=moduleById('RPE-MOD');
    if(!rpe||rpe.candidate_architecture?.length)fail('RPE detailed construct payload must remain suppressed');
    if(rpe?.selected_reference_ids?.length)fail('RPE public reference payload must remain suppressed');
    const dyadic=baseById('DYADIC');
    if(!dyadic||dyadic.visibility!=='hidden')fail('DYADIC must remain hidden');

    const cross=p?.cross_layer;
    if(cross?.visibility!=='research_only_summary')fail('cross-layer visibility must remain research_only_summary');
    if(cross?.empirical_state?.empirical_cross_layer_discriminant_validity!=='NOT_ESTABLISHED')fail('cross-layer discriminant validity upgraded');
    if(cross?.empirical_state?.empirical_incremental_validity!=='NOT_ESTABLISHED')fail('cross-layer incremental validity upgraded');
    if(cross?.empirical_state?.validated_cross_layer_synergy!=='NOT_AUTHORIZED')fail('cross-layer synergy upgraded');
    if(cross?.empirical_state?.causal_cross_layer_effects!=='NOT_AUTHORIZED')fail('cross-layer causal effects upgraded');
    if((cross?.questions||[]).length!==10)fail('cross-layer research-question count mismatch');

    const c=l?.contract||{};
    if(c.core_reference_count!==45||c.extension_reference_count!==25||c.global_reference_count!==70)fail('Core45/Extension25/Global70 contract mismatch');
    const refs=l?.references||[];
    if(refs.length!==25)fail(`extension reference count mismatch: ${refs.length}`);
    const expected=Array.from({length:25},(_,i)=>`REF-${String(i+46).padStart(3,'0')}`);
    if(JSON.stringify(refs.map(x=>x.id))!==JSON.stringify(expected))fail('extension reference identity/range mismatch');
    if(new Set(refs.map(x=>x.doi.toLowerCase())).size!==25)fail('extension DOI deduplication failed');
  }

  function ensureStyle(){
    if(document.getElementById('p120-webscience-pass4b-style'))return;
    const style=document.createElement('style');
    style.id='p120-webscience-pass4b-style';
    style.textContent=`
      .p120-pass4b-section{margin:clamp(18px,2.6vw,34px) 0}
      .p120-pass4b-positioning{border:1px solid var(--line);border-radius:20px;background:var(--soft-2);padding:clamp(22px,3vw,38px)}
      .p120-pass4b-positioning-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:20px}
      .p120-pass4b-positioning-card,.p120-pass4b-module,.p120-pass4b-method-card,.p120-pass4b-reference{border:1px solid var(--line);border-radius:16px;background:var(--card);padding:18px}
      .p120-pass4b-positioning-card h3,.p120-pass4b-module h3,.p120-pass4b-method-card h3{margin-top:6px}
      .p120-pass4b-module-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      .p120-pass4b-module{display:flex;flex-direction:column;gap:13px}
      .p120-pass4b-module[data-active-module="true"]{outline:2px solid currentColor;outline-offset:3px}
      .p120-pass4b-label{font-size:11px;letter-spacing:.11em;text-transform:uppercase;color:var(--muted);font-weight:800}
      .p120-pass4b-question{font-family:"Noto Serif",Georgia,serif;font-size:clamp(18px,1.4vw,23px);line-height:1.35}
      .p120-pass4b-constructs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .p120-pass4b-construct{border-top:1px solid var(--line);padding-top:9px;font-size:13px}
      .p120-pass4b-construct code,.p120-pass4b-evidence code{font-family:"IBM Plex Mono",monospace;font-size:11px}
      .p120-pass4b-evidence{display:flex;flex-wrap:wrap;gap:7px}
      .p120-pass4b-evidence span{border:1px solid var(--line);border-radius:999px;padding:6px 9px;font-size:11px}
      .p120-pass4b-ceiling{border-left:3px solid var(--ink);padding:12px 14px;background:var(--soft)}
      .p120-pass4b-references{display:flex;flex-wrap:wrap;gap:7px}
      .p120-pass4b-reference-id{font-family:"IBM Plex Mono",monospace;border:1px solid var(--line);border-radius:999px;padding:5px 8px;font-size:11px}
      .p120-pass4b-method-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .p120-pass4b-method-card p{margin-bottom:0}
      .p120-pass4b-question-list{display:grid;gap:10px;margin-top:16px}
      .p120-pass4b-cross-question{border-top:1px solid var(--line);padding:14px 0}
      .p120-pass4b-cross-question:first-child{border-top:0}
      .p120-pass4b-cross-question strong{display:block;margin-bottom:5px}
      .p120-pass4b-library-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:18px 0}
      .p120-pass4b-library-stat{border-top:1px solid var(--line);padding-top:12px}
      .p120-pass4b-library-stat strong{font-family:"Noto Serif",Georgia,serif;font-size:32px;display:block}
      .p120-pass4b-reference-list{display:grid;gap:9px}
      .p120-pass4b-reference{font-size:13px}
      .p120-pass4b-reference .doi-link{display:inline-block;margin-top:8px}
      .p120-pass4b-boundary-note{margin-top:16px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--soft-2)}
      @media(max-width:820px){.p120-pass4b-positioning-grid,.p120-pass4b-module-grid,.p120-pass4b-method-grid{grid-template-columns:1fr}}
      @media(max-width:560px){.p120-pass4b-constructs{grid-template-columns:1fr}.p120-pass4b-library-summary{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function positioningCopy(){
    return isEn()?{
      eyebrow:'SCIENTIFIC POSITIONING',
      external:'External scientific foundation',
      integration:'P-120 integration architecture',
      boundary:'Internal verification boundary',
      admission:'Module admission principle',
      evidence:'Evidence ladder',
      notMean:'Does not mean'
    }:{
      eyebrow:'НАУЧНОЕ ПОЗИЦИОНИРОВАНИЕ',
      external:'Внешняя научная основа',
      integration:'Интеграционная архитектура P-120',
      boundary:'Граница внутренней проверки',
      admission:'Принцип включения модуля',
      evidence:'Лестница доказательств',
      notMean:'Не означает'
    };
  }

  function renderPositioning(){
    let section=document.getElementById('p120-science-publication-positioning');
    if(section)return section;
    const atlas=document.getElementById('p120-science-atlas');
    if(!atlas?.parentNode){fail('Atlas missing for publication positioning');return null;}
    const p=state.projection.system_positioning;
    const c=positioningCopy();
    section=document.createElement('section');
    section.id='p120-science-publication-positioning';
    section.className='science-section p120-pass4b-section p120-pass4b-positioning';
    section.dataset.p120Pass4bProjection='system-positioning';
    section.innerHTML=`
      <span class="eyebrow">${esc(c.eyebrow)}</span>
      <h2>${esc(local(p.title))}</h2>
      <div class="p120-pass4b-positioning-grid">
        <article class="p120-pass4b-positioning-card"><span class="p120-pass4b-label">${esc(c.external)}</span><p>${esc(local(p.external_scientific_foundation))}</p></article>
        <article class="p120-pass4b-positioning-card"><span class="p120-pass4b-label">${esc(c.integration)}</span><p>${esc(local(p.integration_architecture))}</p></article>
        <article class="p120-pass4b-positioning-card"><span class="p120-pass4b-label">${esc(c.boundary)}</span><p>${esc(local(p.internal_verification_boundary))}</p></article>
        <article class="p120-pass4b-positioning-card"><span class="p120-pass4b-label">${esc(c.admission)}</span><p>${esc(local(p.module_admission_principle))}</p></article>
      </div>`;
    atlas.insertAdjacentElement('afterend',section);
    return section;
  }

  function moduleCard(m){
    const active=window.P120ScientificBase?.activeModuleId===m.module_id;
    const showDetail=m.module_id!=='RPE-MOD';
    const architecture=showDetail?(m.candidate_architecture||[]):[];
    const refs=showDetail?(m.selected_reference_ids||[]):[];
    const evidence=Object.entries(m.evidence_state||{}).map(([k,v])=>`<span><code>${esc(k)}</code> ${esc(v)}</span>`).join('');
    return `<article class="p120-pass4b-module" data-p120-science-module="${esc(m.module_id)}" data-public-visibility="${esc(m.visibility)}" data-active-module="${active?'true':'false'}" ${m.module_id==='RPE-MOD'?'data-p120-rpe-detail="suppressed"':''}>
      <span class="p120-pass4b-label">${esc(m.module_id)} · ${esc(local(m.public_science_label))}</span>
      <h3>${esc(local(m.name))}</h3>
      <div class="p120-pass4b-question">${esc(local(m.research_question))}</div>
      <p>${esc(local(m.role))}</p>
      ${architecture.length?`<div class="p120-pass4b-constructs">${architecture.map(a=>`<div class="p120-pass4b-construct"><code>${esc(a.code)}</code><br><strong>${esc(local(a.label))}</strong><br><span class="small">${esc(a.state)}</span></div>`).join('')}</div>`:''}
      <div><span class="p120-pass4b-label">${esc(isEn()?'Development state':'Состояние разработки')}</span><p>${esc(local(m.development_summary))}</p></div>
      <div class="p120-pass4b-evidence">${evidence}</div>
      ${refs.length?`<div class="p120-pass4b-references">${refs.map(id=>`<span class="p120-pass4b-reference-id">${esc(id)}</span>`).join('')}</div>`:''}
      <div class="p120-pass4b-ceiling"><strong>${esc(isEn()?'Publication ceiling':'Публикационный предел')}</strong><br>${esc(local(m.publication_ceiling))}</div>
    </article>`;
  }

  function renderModuleBase(baseId){
    const base=baseById(baseId);
    const ids=base?.module_ids||[];
    const modules=ids.map(moduleById).filter(Boolean);
    return `
      <div class="section-split-head">
        <div><span class="eyebrow">${esc(baseId)}</span><h2>${esc(local(base?.label))}</h2></div>
        <p>${esc(isEn()?'Public-safe scientific projection. Development status is not a psychometric validation claim.':'Публичная научная проекция. Статус разработки не является заявлением о психометрической валидации.')}</p>
      </div>
      <div class="p120-pass4b-module-grid">${modules.map(moduleCard).join('')}</div>`;
  }

  function renderMethods(){
    const p=state.projection;
    const c=p.cross_layer;
    const copy=isEn()?{
      title:'Methods, evidence states and cross-layer research questions',
      lead:'Cross-layer synthesis is research-only at this stage. Independent source coordinates are retained; no Extended super-score is authorized.',
      questionTitle:'Pre-registered cross-layer questions',
      state:'Current state',
      evidenceTitle:'Evidence ladder',
      notMean:'Does not mean'
    }:{
      title:'Методы, состояния доказательств и межслойные исследовательские вопросы',
      lead:'Межслойный синтез на текущем этапе остаётся исследовательским. Независимые исходные координаты сохраняются; единый суммарный показатель Extended не разрешён.',
      questionTitle:'Предварительно сформулированные межслойные вопросы',
      state:'Текущее состояние',
      evidenceTitle:'Лестница доказательств',
      notMean:'Не означает'
    };
    return `
      <div class="section-split-head"><div><span class="eyebrow">METHODS</span><h2>${esc(copy.title)}</h2></div><p>${esc(copy.lead)}</p></div>
      <div class="p120-pass4b-method-grid">
        ${(p.evidence_ladder||[]).map(e=>`<article class="p120-pass4b-method-card" data-evidence-level="${esc(e.level)}"><span class="p120-pass4b-label">${esc(e.level)} · ${esc(local(e.label))}</span><p>${esc(local(e.meaning))}</p><p class="small"><strong>${esc(copy.notMean)}:</strong> ${esc(local(e.does_not_mean))}</p></article>`).join('')}
      </div>
      <div class="p120-pass4b-boundary-note">${esc(local(c.system_statement))}</div>
      <h3>${esc(copy.questionTitle)}</h3>
      <div class="p120-pass4b-question-list">
        ${(c.questions||[]).map(q=>`<article class="p120-pass4b-cross-question" data-p120-cross-layer-question="${esc(q.id)}"><strong>${esc(q.id)} · ${esc(local(q.theme))}</strong><span>${esc(local(q.question))}</span><div class="small">${esc(q.layers.join(' × '))} · ${esc(q.empirical_state)}</div></article>`).join('')}
      </div>`;
  }

  function renderLibrary(){
    const l=state.library;
    const copy=isEn()?{
      title:'Global Scientific Library',
      lead:'The Core 45-reference corpus remains intact. PASS 4 adds a separate 25-reference extension, producing a 70-reference global library without renumbering the Core.',
      core:'Core references',
      ext:'PASS 4 extension',
      global:'Global library',
      coreLink:'View preserved Core bibliography',
      boundary:'Reference count is not a validity metric.'
    }:{
      title:'Глобальная научная библиотека',
      lead:'Корпус Core из 45 источников сохраняется без изменений. PASS 4 добавляет отдельное расширение из 25 источников, формируя глобальную библиотеку из 70 источников без перенумерации Core.',
      core:'Источники Core',
      ext:'Расширение PASS 4',
      global:'Глобальная библиотека',
      coreLink:'Перейти к сохранённой библиографии Core',
      boundary:'Количество источников не является показателем валидности.'
    };
    return `
      <div class="section-split-head"><div><span class="eyebrow">LIBRARY</span><h2>${esc(copy.title)}</h2></div><p>${esc(copy.lead)}</p></div>
      <div class="p120-pass4b-library-summary" data-p120-global-library-extension="true">
        <div class="p120-pass4b-library-stat"><strong>45</strong><span>${esc(copy.core)}</span></div>
        <div class="p120-pass4b-library-stat"><strong>25</strong><span>${esc(copy.ext)}</span></div>
        <div class="p120-pass4b-library-stat"><strong>70</strong><span>${esc(copy.global)}</span></div>
      </div>
      <div class="p120-pass4b-boundary-note">${esc(local(l.claim_boundary))} ${esc(copy.boundary)}</div>
      <div class="p120-pass4b-reference-list">
        ${(l.references||[]).map(r=>`<article class="p120-pass4b-reference" data-p120-global-reference="${esc(r.id)}"><span class="p120-pass4b-label">${esc(r.id)} · ${esc(r.modules.join(' · '))}</span><div>${esc(r.citation)}</div><a class="doi-link" href="https://doi.org/${esc(r.doi)}" target="_blank" rel="noopener noreferrer">doi:${esc(r.doi)}</a></article>`).join('')}
      </div>
      <p><a class="doi-link" href="#science-refs">${esc(copy.coreLink)} →</a></p>`;
  }

  function renderActivePanel(baseId){
    if(baseId==='CORE')return;
    const panel=document.getElementById('p120-science-active-base');
    if(!panel)return;
    panel.classList.add('p120-pass4b-section');
    panel.dataset.p120Pass4bRenderer='active';
    if(baseId==='EXTENDED'||baseId==='OUTCOMES')panel.innerHTML=renderModuleBase(baseId);
    else if(baseId==='METHODS')panel.innerHTML=renderMethods();
    else if(baseId==='LIBRARY')panel.innerHTML=renderLibrary();
  }

  function renderCurrent(){
    const baseId=window.P120ScientificBase?.activeBaseId||'CORE';
    const moduleId=window.P120ScientificBase?.activeModuleId||null;
    state.activeBaseId=baseId;state.activeModuleId=moduleId;
    document.documentElement.dataset.p120Pass4bActiveBase=baseId;
    renderPositioning();
    renderActivePanel(baseId);
  }

  function exposeApi(){
    const api=Object.freeze({
      version:VERSION,
      get status(){return Object.freeze({phase:state.phase,pass:state.pass,errors:[...state.errors],warnings:[...state.warnings],activeBaseId:state.activeBaseId,activeModuleId:state.activeModuleId});},
      get projection(){return state.projection;},
      get library(){return state.library;},
      render:()=>renderCurrent()
    });
    window.P120SciencePublicationRenderer=api;
  }

  async function waitForBaseRuntime(attempt=0){
    if(window.P120ScientificBase?.status?.pass===true&&document.getElementById('p120-science-atlas'))return true;
    if(attempt>=180)return false;
    await new Promise(r=>setTimeout(r,35));
    return waitForBaseRuntime(attempt+1);
  }

  async function start(){
    try{
      const ready=await waitForBaseRuntime();
      if(!ready)throw new Error('Scientific Base v1.0 runtime not ready');
      const [pr,lr]=await Promise.all([
        fetch(projectionUrl,{cache:'no-store',credentials:'same-origin'}),
        fetch(libraryUrl,{cache:'no-store',credentials:'same-origin'})
      ]);
      if(!pr.ok)throw new Error(`projection HTTP ${pr.status}`);
      if(!lr.ok)throw new Error(`library HTTP ${lr.status}`);
      state.projection=await pr.json();
      state.library=await lr.json();
      validateProjection(state.projection,state.library);
      if(state.errors.length)throw new Error(state.errors.join('; '));
      ensureStyle();
      renderCurrent();
      addEventListener('p120:scientific-base-change',event=>{
        state.activeBaseId=event.detail?.baseId||window.P120ScientificBase?.activeBaseId||'CORE';
        state.activeModuleId=event.detail?.moduleId||window.P120ScientificBase?.activeModuleId||null;
        requestAnimationFrame(renderCurrent);
      });
      addEventListener('popstate',()=>requestAnimationFrame(renderCurrent));
      state.phase='ready';state.pass=true;
      exposeApi();
      document.documentElement.dataset.p120WebsciencePass4b='renderer-v0.6';
      document.documentElement.dataset.p120WebsciencePass4bStatus='pass';
      window.dispatchEvent(new CustomEvent('p120:webscience-pass4b-ready',{detail:{pass:true,version:VERSION}}));
    }catch(error){
      if(!state.errors.length)fail(error?.message||String(error));
      state.phase='failed';state.pass=false;exposeApi();
      document.documentElement.dataset.p120WebsciencePass4b='renderer-v0.6';
      document.documentElement.dataset.p120WebsciencePass4bStatus='fail';
      window.dispatchEvent(new CustomEvent('p120:webscience-pass4b-ready',{detail:{pass:false,version:VERSION,errors:[...state.errors]}}));
      console.error('[P120 WEB-SCIENCE PASS 4B]',error);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();