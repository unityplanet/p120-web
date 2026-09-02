/* P-120 Scientific Base Production Runtime v1.0
   WEB-SCIENCE production migration: registry-driven Atlas selector + controlled summary panels.
   Presentation/scientific-navigation only. No questionnaire, scoring, persistence or session access. */
(()=>{
  'use strict';

  const REGISTRY_FILE='P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json';
  const EXPECTED_SCHEMA='P120-WEBSCI-PRODUCTION-001';
  const CORE_IDS=['science-layers','science-constructs','science-evidence'];
  const REQUIRED_ANCHORS=['science-foundation','science-layers','science-constructs','science-evidence','science-validation','science-ethics','science-refs'];
  const COUNT_KEYS=['metrics','layers','p72','p72d','evidenceMap','discriminantBoundaries','hypotheses','validation','ethics','limitations','internalSources','references'];
  const dedicated=/(?:^|\/)(?:en\/)?science\/?$/i.test(location.pathname);
  if(!dedicated)return;
  if(window.P120ScientificBase?.version==='1.0')return;

  const currentScript=document.currentScript;
  const scriptUrl=currentScript?.src||new URL('p120-scientific-base-runtime-v1.0.js',location.href).href;
  const registryUrl=new URL(REGISTRY_FILE,scriptUrl).href;
  const isEn=()=>document.documentElement.lang?.toLowerCase().startsWith('en')||/\/en\/science\/?$/i.test(location.pathname);
  const L=()=>isEn()?'en':'ru';
  const local=(obj,key)=>obj?.[`${key}_${L()}`]??obj?.[`${key}_en`]??obj?.[`${key}_ru`]??'';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const state={version:'1.0',phase:'loading',pass:false,errors:[],warnings:[],registry:null,activeBaseId:'CORE',activeModuleId:null};

  function fail(message){state.errors.push(message);}
  function baseById(id){return state.registry?.bases?.find(b=>b.base_id===String(id||'').toUpperCase())||null;}
  function moduleById(id){return state.registry?.modules?.find(m=>m.module_id===String(id||''))||null;}
  function visibleBases(){return (state.registry?.bases||[]).filter(b=>b.public_visibility!=='hidden'&&b.base_id!=='DYADIC');}
  function publicModule(id){
    const m=moduleById(id);
    if(!m||m.public_visibility==='hidden')return null;
    return m;
  }

  function validateRegistry(r){
    if(!r||r.schema_id!==EXPECTED_SCHEMA)fail(`registry schema mismatch: ${r?.schema_id||'missing'}`);
    if(r?.measurement_mutation_allowed!==false)fail('measurement mutation must remain prohibited');
    if(r?.scoring_mutation_allowed!==false)fail('scoring mutation must remain prohibited');
    if(r?.session_storage_access!=='PROHIBITED')fail('session storage access must remain prohibited');
    if(r?.one_active_deep_base!==true)fail('one_active_deep_base contract missing');
    const dyadic=(r?.bases||[]).find(b=>b.base_id==='DYADIC');
    if(!dyadic||dyadic.public_visibility!=='hidden')fail('DYADIC must remain hidden');
    (r?.modules||[]).forEach(m=>{if(m.is_total_allowed!==false)fail(`unexpected module total permission: ${m.module_id}`);});
  }

  function validateCore(D){
    if(!D){fail('window.P120_SCIENCE unavailable');return;}
    const expected=state.registry?.core_runtime_contract?.expected_counts||{};
    COUNT_KEYS.forEach(key=>{
      const actual=Array.isArray(D?.[key])?D[key].length:null;
      if(actual!==expected[key])fail(`Core count mismatch ${key}: ${actual} != ${expected[key]}`);
    });
    REQUIRED_ANCHORS.forEach(id=>{if(!document.getElementById(id))fail(`legacy anchor missing: #${id}`);});
    if(!document.querySelector('.science-page'))fail('Scientific Base visual root missing');
    if((D.references||[]).length!==45)fail(`reference corpus changed: ${(D.references||[]).length}`);
  }

  function ensureStyle(){
    if(document.getElementById('p120-scientific-base-runtime-style-v1'))return;
    const style=document.createElement('style');
    style.id='p120-scientific-base-runtime-style-v1';
    style.textContent=`
      .p120-science-runtime-hidden{display:none!important}
      .p120-science-atlas-section{margin-bottom:clamp(18px,2.6vw,34px)}
      .p120-science-atlas-controls{display:flex;flex-wrap:wrap;gap:9px;margin-top:18px}
      .p120-science-atlas-controls .evidence-pill{appearance:none;cursor:pointer;min-height:44px}
      .p120-science-atlas-controls .evidence-pill[aria-pressed="true"]{outline:2px solid currentColor;outline-offset:2px}
      .p120-science-active-base{margin-bottom:clamp(18px,2.6vw,34px)}
      .p120-science-active-base .science-layer-card[data-active-module="true"]{outline:2px solid currentColor;outline-offset:3px}
      .p120-science-base-role{max-width:860px}
      @media(max-width:680px){.p120-science-atlas-controls{display:grid;grid-template-columns:1fr 1fr}.p120-science-atlas-controls .evidence-pill{width:100%;text-align:center}.p120-science-active-base .science-layer-grid{grid-template-columns:1fr}}
      @media(max-width:420px){.p120-science-atlas-controls{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function atlasCopy(){
    return isEn()?{
      eyebrow:'SCIENTIFIC EVIDENCE ATLAS',
      title:'One Scientific Base. Several controlled research families.',
      body:'Core remains the default scientific foundation. Extended and Outcomes expose only the public detail authorized by their current research status; shared validation, ethics and literature remain common.',
      aria:'Scientific Base family selector',
      openLibrary:'Open scientific literature',
      boundary:'Public summary only. Internal controlled status does not imply validation or standardization.'
    }:{
      eyebrow:'АТЛАС НАУЧНОЙ БАЗЫ',
      title:'Одна Scientific Base. Несколько управляемых исследовательских семейств.',
      body:'Core остаётся основной научной базой. Extended и Outcomes показывают только тот публичный объём, который разрешён их текущим исследовательским статусом; валидация, этика и литература остаются общими.',
      aria:'Выбор подбазы Scientific Base',
      openLibrary:'Открыть научную литературу',
      boundary:'Только публичное резюме. Внутренний controlled-статус не означает валидацию или стандартизацию.'
    };
  }

  function renderAtlas(){
    const existing=document.getElementById('p120-science-atlas');
    if(existing)return existing;
    const target=document.getElementById('science-layers');
    if(!target?.parentNode){fail('Atlas insertion anchor missing');return null;}
    const c=atlasCopy();
    const section=document.createElement('section');
    section.id='p120-science-atlas';
    section.className='science-section p120-science-atlas-section';
    section.setAttribute('aria-labelledby','p120-science-atlas-title');
    section.innerHTML=`
      <div class="section-split-head">
        <div><span class="eyebrow">${esc(c.eyebrow)}</span><h2 id="p120-science-atlas-title">${esc(c.title)}</h2></div>
        <p>${esc(c.body)}</p>
      </div>
      <div class="p120-science-atlas-controls" role="group" aria-label="${esc(c.aria)}">
        ${visibleBases().map(b=>`<button type="button" class="evidence-pill" data-p120-science-base="${esc(b.base_id)}" aria-pressed="false">${esc(local(b,'label'))}</button>`).join('')}
      </div>`;
    target.parentNode.insertBefore(section,target);
    section.addEventListener('click',event=>{
      const button=event.target.closest?.('[data-p120-science-base]');
      if(!button)return;
      setBase(button.dataset.p120ScienceBase,null,{history:true,scroll:true});
    });
    return section;
  }

  function moduleCard(m){
    const selected=state.activeModuleId===m.module_id;
    const c=atlasCopy();
    return `<article class="science-layer-card" id="p120-science-module-${esc(m.module_id)}" data-p120-science-module="${esc(m.module_id)}" data-public-visibility="${esc(m.public_visibility)}" data-active-module="${selected?'true':'false'}">
      <span class="science-code">${esc(m.module_id)}</span>
      <h3>${esc(local(m,'name'))}</h3>
      <p>${esc(local(m,'public_summary'))}</p>
      <div class="boundary-note"><strong>${esc(m.public_science_label)}</strong><br>${esc(m.measurement_state)}${m.public_visibility==='summary_only'?`<br>${esc(c.boundary)}`:''}</div>
    </article>`;
  }

  function renderActivePanel(baseId){
    document.getElementById('p120-science-active-base')?.remove();
    if(baseId==='CORE')return null;
    const base=baseById(baseId);
    if(!base||base.public_visibility==='hidden')return null;
    const atlas=document.getElementById('p120-science-atlas');
    if(!atlas?.parentNode)return null;
    const section=document.createElement('section');
    section.id='p120-science-active-base';
    section.className='science-section p120-science-active-base';
    section.dataset.p120ScienceActiveBase=base.base_id;
    const modules=(base.module_ids||[]).map(publicModule).filter(Boolean);
    const c=atlasCopy();
    const content=modules.length
      ? `<div class="science-layer-grid">${modules.map(moduleCard).join('')}</div>`
      : base.base_id==='LIBRARY'
        ? `<div class="science-callout"><p>${esc(local(base,'role'))}</p><a class="doi-link" href="#science-refs">${esc(c.openLibrary)} →</a></div>`
        : `<div class="science-callout"><p>${esc(local(base,'role'))}</p></div>`;
    section.innerHTML=`<div class="section-split-head"><div><span class="eyebrow">${esc(base.base_id)}</span><h2>${esc(local(base,'label'))}</h2></div><p class="p120-science-base-role">${esc(local(base,'role'))}</p></div>${content}`;
    atlas.insertAdjacentElement('afterend',section);
    return section;
  }

  function coreVisibility(show){
    CORE_IDS.forEach(id=>document.getElementById(id)?.classList.toggle('p120-science-runtime-hidden',!show));
  }

  function updateControls(){
    document.querySelectorAll('[data-p120-science-base]').forEach(button=>{
      const active=button.dataset.p120ScienceBase===state.activeBaseId;
      button.setAttribute('aria-pressed',active?'true':'false');
      button.classList.toggle('active',active);
    });
  }

  function writeUrl(baseId,moduleId,replace=false){
    const url=new URL(location.href);
    if(baseId==='CORE'){
      url.searchParams.delete('science');
      url.searchParams.delete('module');
    }else{
      url.searchParams.set('science',baseId.toLowerCase());
      if(moduleId)url.searchParams.set('module',moduleId);else url.searchParams.delete('module');
    }
    const method=replace?'replaceState':'pushState';
    history[method]({p120ScienceBase:baseId,p120ScienceModule:moduleId||null},'',url);
  }

  function resolveRequested(){
    const params=new URLSearchParams(location.search);
    const requested=String(params.get('science')||'CORE').toUpperCase();
    const base=baseById(requested);
    const baseId=base&&base.public_visibility!=='hidden'?base.base_id:'CORE';
    const requestedModule=params.get('module');
    const module=requestedModule?publicModule(requestedModule):null;
    const moduleId=module&&module.base_id===baseId?module.module_id:null;
    return {baseId,moduleId};
  }

  function setBase(baseId,moduleId=null,options={}){
    const base=baseById(baseId);
    if(!base||base.public_visibility==='hidden')baseId='CORE';else baseId=base.base_id;
    const module=moduleId?publicModule(moduleId):null;
    state.activeModuleId=module&&module.base_id===baseId?module.module_id:null;
    state.activeBaseId=baseId;
    coreVisibility(baseId==='CORE');
    const panel=renderActivePanel(baseId);
    updateControls();
    document.documentElement.dataset.p120ScienceActiveBase=baseId;
    if(options.history)writeUrl(baseId,state.activeModuleId,false);
    if(options.replaceHistory)writeUrl(baseId,state.activeModuleId,true);
    if(options.scroll){
      requestAnimationFrame(()=>{
        if(state.activeModuleId)document.getElementById(`p120-science-module-${state.activeModuleId}`)?.scrollIntoView({behavior:'smooth',block:'center'});
        else if(baseId==='LIBRARY')document.getElementById('science-refs')?.scrollIntoView({behavior:'smooth',block:'start'});
        else (panel||document.getElementById('p120-science-atlas'))?.scrollIntoView({behavior:'smooth',block:'start'});
      });
    }
    window.dispatchEvent(new CustomEvent('p120:scientific-base-change',{detail:{baseId,stateModuleId:state.activeModuleId}}));
    return baseId;
  }

  function exposeApi(){
    const api=Object.freeze({
      version:'1.0',
      get status(){return Object.freeze({phase:state.phase,pass:state.pass,errors:[...state.errors],warnings:[...state.warnings],activeBaseId:state.activeBaseId,activeModuleId:state.activeModuleId});},
      get registry(){return state.registry;},
      get activeBaseId(){return state.activeBaseId;},
      get activeModuleId(){return state.activeModuleId;},
      setBase:(baseId,moduleId=null)=>setBase(baseId,moduleId,{history:true,scroll:true}),
      getBase:id=>baseById(id),
      getModule:id=>publicModule(id)
    });
    window.P120ScientificBase=api;
    window.P120ScienceAtlas=api;
  }

  async function waitForCore(attempt=0){
    if(window.P120_SCIENCE&&document.querySelector('.science-page')&&REQUIRED_ANCHORS.every(id=>document.getElementById(id)))return window.P120_SCIENCE;
    if(attempt>=160)return null;
    await new Promise(resolve=>setTimeout(resolve,35));
    return waitForCore(attempt+1);
  }

  async function start(){
    try{
      const response=await fetch(registryUrl,{cache:'no-store',credentials:'same-origin'});
      if(!response.ok)throw new Error(`registry HTTP ${response.status}`);
      state.registry=await response.json();
      validateRegistry(state.registry);
      const D=await waitForCore();
      validateCore(D);
      if(state.errors.length)throw new Error(state.errors.join('; '));
      ensureStyle();
      renderAtlas();
      const requested=resolveRequested();
      state.phase='ready';state.pass=true;
      exposeApi();
      setBase(requested.baseId,requested.moduleId,{replaceHistory:true,scroll:false});
      addEventListener('popstate',()=>{const r=resolveRequested();setBase(r.baseId,r.moduleId,{history:false,scroll:false});});
      document.documentElement.dataset.p120ScientificBaseMigration='production-v1';
      document.documentElement.dataset.p120ScientificBaseStatus='pass';
      window.dispatchEvent(new CustomEvent('p120:scientific-base-ready',{detail:{pass:true,version:'1.0',baseId:state.activeBaseId}}));
    }catch(error){
      if(!state.errors.length)fail(error?.message||String(error));
      state.phase='failed';state.pass=false;exposeApi();
      document.documentElement.dataset.p120ScientificBaseMigration='production-v1';
      document.documentElement.dataset.p120ScientificBaseStatus='fail';
      window.dispatchEvent(new CustomEvent('p120:scientific-base-ready',{detail:{pass:false,version:'1.0',errors:[...state.errors]}}));
      console.error('[P120 Scientific Base Migration]',error);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
