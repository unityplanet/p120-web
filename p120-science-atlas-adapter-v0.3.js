/* P-120 WEB-SCIENCE EXT PASS 3 — Core-Preserving Registry Renderer Adapter v0.3
   Purpose: connect the normalized scientific registry to the existing Scientific Base runtime
   without replacing the current Core renderer or visibly activating Atlas/Extended states.
   No questionnaire, scoring, persistence, Supabase or report calculation behavior is touched. */
(() => {
  'use strict';

  const DISABLE_PARAM='p120_science_adapter';
  const REGISTRY_FILE='P120_WEBSCI_EXT_runtime_registry_v0.3_2026-09-02.json';
  const EXPECTED_SCHEMA='P120-WEBSCI-RUNTIME-003';
  const ALLOWED_VISIBILITY=new Set(['published','summary_only','roadmap','hidden']);
  const LEGACY_ANCHORS=['science-layers','science-constructs','science-evidence','science-validation','science-ethics','science-refs'];
  const CORE_KEYS=['metrics','layers','p72','p72d','evidenceMap','discriminantBoundaries','hypotheses','validation','ethics','limitations','internalSources','references'];
  const isDedicated=/(?:^|\/)(?:en\/)?science\/?$/i.test(location.pathname);
  const disabled=new URLSearchParams(location.search).get(DISABLE_PARAM)==='off';

  if(!isDedicated){
    document.documentElement.dataset.p120ScienceRegistry='not-dedicated-route';
    return;
  }
  if(disabled){
    document.documentElement.dataset.p120ScienceRegistry='adapter-off';
    return;
  }
  if(window.P120ScienceAtlas?.version==='0.3') return;

  const currentScript=document.currentScript;
  const scriptUrl=currentScript?.src||new URL('p120-science-atlas-adapter-v0.3.js',location.href).href;
  const registryUrl=new URL(REGISTRY_FILE,scriptUrl).href;
  const state={
    version:'0.3',
    phase:'loading',
    pass:false,
    errors:[],
    warnings:[],
    registry:null,
    runtime:null,
    currentBaseId:'CORE',
    counts:null,
    routes:{ru:'/science/',en:'/en/science/'},
    activation:'CORE_ONLY_EQUIVALENCE'
  };

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const visibleBases=registry=>registry.bases.filter(b=>b.public_visibility!=='hidden');
  const moduleById=(registry,id)=>registry.modules.find(m=>m.module_id===id)||null;
  const baseById=(registry,id)=>registry.bases.find(b=>b.base_id===id)||null;
  const countRuntime=D=>Object.fromEntries(CORE_KEYS.map(k=>[k,Array.isArray(D?.[k])?D[k].length:null]));
  const stableStringify=value=>{
    if(Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    if(value&&typeof value==='object'){const keys=Object.keys(value).sort();return `{${keys.map(k=>`${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;}
    return JSON.stringify(value);
  };
  const sha256=async text=>{const data=new TextEncoder().encode(text);const digest=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');};
  const isEn=()=>document.documentElement.lang?.toLowerCase().startsWith('en')||/\/en\//i.test(location.pathname);
  const label=(obj,key)=>obj?.[`${key}_${isEn()?'en':'ru'}`]||obj?.[`${key}_en`]||obj?.[`${key}_ru`]||'';

  function addError(message){ state.errors.push(message); }
  function addWarning(message){ state.warnings.push(message); }

  function validateRegistry(registry){
    if(!registry||registry.schema_id!==EXPECTED_SCHEMA) addError(`registry schema mismatch: ${registry?.schema_id||'missing'}`);
    if(registry?.pass3_activation?.mode!=='CORE_ONLY_EQUIVALENCE') addError('PASS 3 activation mode must remain CORE_ONLY_EQUIVALENCE');
    if(registry?.pass3_activation?.atlas_selector_visible!==false) addError('PASS 3 must not visibly activate the Atlas selector');
    if(registry?.measurement_mutation_allowed!==false) addError('measurement mutation must remain prohibited');
    if(registry?.visual_mutation_allowed!==false) addError('Core visual mutation must remain prohibited');
    (registry?.bases||[]).forEach(b=>{ if(!ALLOWED_VISIBILITY.has(b.public_visibility)) addError(`invalid base public_visibility: ${b.base_id}`); });
    (registry?.modules||[]).forEach(m=>{
      if(!ALLOWED_VISIBILITY.has(m.public_visibility)) addError(`invalid module public_visibility: ${m.module_id}`);
      if(m.is_total_allowed!==false) addError(`module total unexpectedly allowed: ${m.module_id}`);
    });
    const dyadic=baseById(registry,'DYADIC');
    if(!dyadic||dyadic.public_visibility!=='hidden') addError('DYADIC must remain hidden in PASS 3');
  }

  async function validateRuntime(registry,D){
    if(!D) { addError('window.P120_SCIENCE unavailable'); return; }
    state.counts=countRuntime(D);
    const expected=registry?.core_runtime_contract?.expected_counts||{};
    for(const key of CORE_KEYS){
      if(state.counts[key]!==expected[key]) addError(`Core count mismatch ${key}: ${state.counts[key]} != ${expected[key]}`);
    }
    if(!document.querySelector('.science-page')) addError('current Scientific Base visual root missing');
    const required=['.science-hero','.science-status','.science-doc-card','.science-metrics','.science-subnav'];
    required.forEach(sel=>{if(!document.querySelector(sel)) addError(`required Core component missing: ${sel}`);});
    LEGACY_ANCHORS.forEach(id=>{if(!document.getElementById(id)) addError(`legacy anchor missing: #${id}`);});
    const refs=D.references||[];
    const doi=new Set(refs.map(r=>r?.doi).filter(Boolean));
    if(refs.length!==45) addError(`reference corpus changed: ${refs.length}`);
    if(doi.size!==44) addWarning(`unique DOI count differs from PASS 2 reconciliation: ${doi.size}`);
    if(registry?.one_active_deep_base!==true) addError('one_active_deep_base contract missing');
    try{
      const normalized=JSON.parse(JSON.stringify(D));
      normalized.document=JSON.parse(JSON.stringify(registry.core_canonical_normalization.document));
      normalized.positioning=JSON.parse(JSON.stringify(registry.core_canonical_normalization.positioning));
      normalized.metrics=JSON.parse(JSON.stringify(registry.core_canonical_normalization.metrics));
      const digest=await sha256(stableStringify(normalized));
      state.coreSha256=digest;
      const expectedSha=registry?.core_runtime_contract?.canonical_sha256;
      if(expectedSha&&digest!==expectedSha) addError(`Core canonical SHA-256 mismatch: ${digest} != ${expectedSha}`);
    }catch(error){ addError(`Core fingerprint failed: ${error?.message||error}`); }
  }

  function publicationSafeModule(registry,moduleId){
    const m=moduleById(registry,moduleId);
    if(!m||m.public_visibility==='hidden') return null;
    return {
      module_id:m.module_id,
      base_id:m.base_id,
      name:label(m,'name'),
      measurement_state:m.measurement_state,
      public_visibility:m.public_visibility,
      public_science_label:m.public_science_label,
      public_summary:m.public_summary,
      validation_stage:m.validation_stage,
      is_total_allowed:false,
      cross_layer_status:m.cross_layer_status
    };
  }

  function renderScienceAtlas(){
    const r=state.registry;
    if(!r) return '';
    return `<div class="science-atlas-selector" data-science-atlas-selector data-pass3-preview="true" hidden aria-hidden="true">${visibleBases(r).map(b=>`<button type="button" class="evidence-pill" data-science-base="${esc(b.base_id)}">${esc(label(b,'label'))}</button>`).join('')}</div>`;
  }

  function renderScienceModule(moduleId){
    const r=state.registry;
    const m=r?publicationSafeModule(r,moduleId):null;
    if(!m) return '';
    const summary=m.public_summary||'';
    return `<article class="science-layer-card" data-science-module="${esc(m.module_id)}" data-public-visibility="${esc(m.public_visibility)}"><span class="science-code">${esc(m.module_id)}</span><h3>${esc(m.name)}</h3><p>${esc(summary)}</p><div class="boundary-note">${esc(m.public_science_label)} · ${esc(m.measurement_state)}</div></article>`;
  }

  function renderScienceBase(baseId='CORE'){
    const r=state.registry;
    if(!r) return '';
    const b=baseById(r,String(baseId).toUpperCase());
    if(!b||b.public_visibility==='hidden') return '';
    if(b.base_id==='CORE') return document.querySelector('.science-page')?.outerHTML||'';
    const modules=(b.module_ids||[]).map(renderScienceModule).filter(Boolean).join('');
    return `<section class="science-section" data-science-base-preview="${esc(b.base_id)}" hidden aria-hidden="true"><div class="section-split-head"><div><span class="eyebrow">${esc(label(b,'label'))}</span><h2>${esc(label(b,'label'))}</h2></div><p>${esc(b.role||'')}</p></div><div class="science-layer-grid">${modules}</div></section>`;
  }

  function renderScienceLibrary(filters={}){
    const refs=state.runtime?.references||[];
    const query=String(filters.query||'').trim().toLowerCase();
    const visible=query?refs.filter(ref=>`${ref.citation||''} ${ref.doi||''}`.toLowerCase().includes(query)):refs;
    return visible.map((ref,i)=>`<div class="ref-item" data-science-registry-ref="${i+1}"><span class="ref-num">${String(i+1).padStart(2,'0')}</span><div>${esc(ref.citation||'')}${ref.doi?` <a class="doi-link" href="${esc(ref.doi)}" target="_blank" rel="noopener">DOI ↗</a>`:''}</div></div>`).join('');
  }

  function bindScienceAtlas(){
    if(!state.registry||!state.runtime) return false;
    document.documentElement.dataset.p120ScienceRegistry='pass3-core-equivalent';
    document.documentElement.dataset.p120ScienceAtlasVisibility='disabled-pass3';
    document.documentElement.dataset.p120ScienceActiveBase='CORE';
    return true;
  }

  function publicApi(){
    return Object.freeze({
      version:'0.3',
      get status(){return Object.freeze({phase:state.phase,pass:state.pass,errors:[...state.errors],warnings:[...state.warnings],counts:state.counts?{...state.counts}:null,coreSha256:state.coreSha256||null,activation:state.activation});},
      get registry(){return state.registry;},
      get activeBaseId(){return state.currentBaseId;},
      getBase:id=>state.registry?baseById(state.registry,String(id).toUpperCase()):null,
      getModule:id=>state.registry?publicationSafeModule(state.registry,id):null,
      renderScienceAtlas,
      renderScienceBase,
      renderScienceModule,
      renderScienceLibrary,
      bindScienceAtlas
    });
  }

  async function waitForRuntime(attempt=0){
    const D=window.P120_SCIENCE;
    const root=document.querySelector('.science-page');
    if(D&&root) return D;
    if(attempt>=100) return null;
    await new Promise(r=>setTimeout(r,40));
    return waitForRuntime(attempt+1);
  }

  async function start(){
    try{
      const response=await fetch(registryUrl,{cache:'no-store',credentials:'same-origin'});
      if(!response.ok) throw new Error(`registry HTTP ${response.status}`);
      const registry=await response.json();
      state.registry=registry;
      validateRegistry(registry);
      const D=await waitForRuntime();
      state.runtime=D;
      await validateRuntime(registry,D);
      state.phase=state.errors.length?'failed':'ready';
      state.pass=state.errors.length===0;
      window.P120ScienceAtlas=publicApi();
      if(state.pass) bindScienceAtlas();
      else document.documentElement.dataset.p120ScienceRegistry='pass3-failed';
      window.dispatchEvent(new CustomEvent('p120:science-registry-ready',{detail:{pass:state.pass,errors:[...state.errors],warnings:[...state.warnings]}}));
    }catch(error){
      addError(error?.message||String(error));
      state.phase='failed';state.pass=false;
      window.P120ScienceAtlas=publicApi();
      document.documentElement.dataset.p120ScienceRegistry='pass3-failed';
      window.dispatchEvent(new CustomEvent('p120:science-registry-ready',{detail:{pass:false,errors:[...state.errors]}}));
      console.error('[P120 WEB-SCIENCE PASS 3]',error);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
