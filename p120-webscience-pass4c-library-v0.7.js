/* P-120 WEB-SCIENCE EXT PASS 4C Library Integration v0.7
   Unifies frozen Core-45 identity and PASS 4 REF-046..070 into one navigable library.
   Presentation/navigation only. No questionnaire, scoring, thresholds, session,
   persistence or report-calculation access. */
(()=>{
  'use strict';
  const VERSION='0.7';
  const FILE='webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json';
  const SCHEMA='P120-WEBSCI-GLOBAL-LIBRARY-INTEGRATED-001';
  const dedicated=/(?:^|\/)(?:en\/)?science\/?(?:index\.html)?$/i.test(location.pathname);
  if(!dedicated)return;
  if(window.P120ScienceGlobalLibrary?.version===VERSION)return;
  const currentScript=document.currentScript;
  const scriptUrl=currentScript?.src||new URL('p120-webscience-pass4c-library-v0.7.js',location.href).href;
  const dataUrl=new URL(FILE,scriptUrl).href;
  const state={version:VERSION,phase:'loading',pass:false,errors:[],library:null,filter:'ALL',query:''};
  const isEn=()=>document.documentElement.lang?.toLowerCase().startsWith('en')||/\/en\/science\/?/i.test(location.pathname);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fail=m=>state.errors.push(String(m));
  const norm=v=>String(v??'').toLowerCase().replace(/\s+/g,' ').trim();

  function validate(l){
    if(!l||l.schema_id!==SCHEMA)fail(`library schema mismatch: ${l?.schema_id||'missing'}`);
    const c=l?.contract||{};
    if(c.core_reference_count!==45||c.extension_reference_count!==25||c.global_reference_count!==70)fail('45/25/70 contract mismatch');
    if(c.core_array_mutated!==false)fail('Core mutation boundary broken');
    if(l?.binding_model?.no_inferred_core_roles!==true)fail('no-inferred-Core-role boundary missing');
    const refs=l?.references||[];
    if(refs.length!==70)fail(`global reference count ${refs.length} != 70`);
    const expected=Array.from({length:70},(_,i)=>`REF-${String(i+1).padStart(3,'0')}`);
    if(JSON.stringify(refs.map(r=>r.id))!==JSON.stringify(expected))fail('REF-001..070 continuity failed');
    const core=refs.filter(r=>r.source_layer==='CORE45'),ext=refs.filter(r=>r.source_layer==='PASS4_EXTENSION');
    if(core.length!==45||ext.length!==25)fail('source-layer partition mismatch');
    if(core.some(r=>r.modules?.length||r.role!==null||r.binding_state!=='SOURCE_NATIVE_CITATION_DOI_ONLY'))fail('Core source-native binding boundary broken');
    if(ext.some(r=>!r.modules?.length||!r.role||r.binding_state!=='SOURCE_AUTHORIZED_MODULE_ROLE_BINDING'))fail('PASS 4 extension role binding incomplete');
    const dois=refs.map(r=>r.doi).filter(Boolean);
    if(new Set(dois).size!==dois.length)fail('global DOI deduplication failed');
    if(l?.deduplication?.global_reference_identity_unique!==true)fail('global identity uniqueness not established');
  }

  function copy(){return isEn()?{
    eyebrow:'INTEGRATED SCIENTIFIC LIBRARY',title:'Core-45 / Global-70 Scientific Library',
    lead:'One navigable library preserves the frozen 45-reference Core and adds the separately governed 25-reference PASS 4 extension. Core reference roles are not inferred where the source object does not provide them.',
    all:'All 70',core:'Core 45',ext:'PASS 4 · 25',search:'Search author, title, DOI or reference ID',showing:'Showing',of:'of',
    source:'Source layer',role:'Evidence role',modules:'Bound modules',native:'Core source-native citation/DOI only',
    boundary:'Reference count is coverage metadata, not a validity metric. Module/role filters apply only where a controlled binding exists.'
  }:{
    eyebrow:'ИНТЕГРИРОВАННАЯ НАУЧНАЯ БИБЛИОТЕКА',title:'Научная библиотека Core-45 / Global-70',
    lead:'Единая навигационная библиотека сохраняет замороженные 45 источников Core и добавляет отдельно управляемое расширение PASS 4 из 25 источников. Для Core не выводятся роли, которых нет в исходном объекте.',
    all:'Все 70',core:'Core 45',ext:'PASS 4 · 25',search:'Поиск по автору, названию, DOI или REF-ID',showing:'Показано',of:'из',
    source:'Слой источника',role:'Роль в доказательной базе',modules:'Привязанные модули',native:'Core: только исходные citation/DOI',
    boundary:'Количество источников отражает покрытие, а не валидность. Фильтры по модулям и ролям применяются только там, где существует контролируемая привязка.'
  }}

  function ensureStyle(){
    if(document.getElementById('p120-webscience-pass4c-style'))return;
    const s=document.createElement('style');s.id='p120-webscience-pass4c-style';s.textContent=`
      .p120-pass4c-core-native-hidden{display:none!important}
      .p120-pass4c-controls{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:12px;align-items:center;margin:18px 0}
      .p120-pass4c-search{width:100%;min-height:44px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:inherit;padding:10px 13px;font:inherit}
      .p120-pass4c-filters{display:flex;flex-wrap:wrap;gap:7px}
      .p120-pass4c-filter{appearance:none;border:1px solid var(--line);border-radius:999px;background:var(--card);color:inherit;padding:8px 11px;cursor:pointer;font:inherit;font-size:12px}
      .p120-pass4c-filter[aria-pressed="true"]{outline:2px solid currentColor;outline-offset:2px}
      .p120-pass4c-status{font-size:12px;color:var(--muted);margin:10px 0 14px}
      .p120-pass4c-list{display:grid;gap:9px}
      .p120-pass4c-ref{border:1px solid var(--line);border-radius:16px;background:var(--card);padding:17px;scroll-margin-top:96px}
      .p120-pass4c-ref[data-source-layer="PASS4_EXTENSION"]{border-left-width:3px}
      .p120-pass4c-ref[data-deep-linked="true"]{outline:2px solid currentColor;outline-offset:3px}
      .p120-pass4c-meta{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
      .p120-pass4c-chip{border:1px solid var(--line);border-radius:999px;padding:4px 7px;font-size:10px;letter-spacing:.04em}
      .p120-pass4c-citation{font-size:13px;line-height:1.55}
      @media(max-width:760px){.p120-pass4c-controls{grid-template-columns:1fr}.p120-pass4c-filters{display:grid;grid-template-columns:1fr 1fr}.p120-pass4c-filter{width:100%}}
      @media(max-width:420px){.p120-pass4c-filters{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function matches(r){
    const f=state.filter;
    if(f==='CORE45'&&r.source_layer!=='CORE45')return false;
    if(f==='PASS4_EXTENSION'&&r.source_layer!=='PASS4_EXTENSION')return false;
    if(!['ALL','CORE45','PASS4_EXTENSION'].includes(f)&&!(r.modules||[]).includes(f))return false;
    if(!state.query)return true;
    return norm([r.id,r.citation,r.doi,r.role,...(r.modules||[])].join(' ')).includes(norm(state.query));
  }

  function refHtml(r){
    const c=copy();
    const extension=r.source_layer==='PASS4_EXTENSION';
    return `<article class="p120-pass4c-ref" id="p120-global-ref-${esc(r.id)}" data-p120-global-reference="${esc(r.id)}" data-source-layer="${esc(r.source_layer)}">
      <span class="p120-pass4b-label">${esc(r.id)} · ${esc(extension?'PASS 4 EXTENSION':'CORE 45')}</span>
      <div class="p120-pass4c-citation">${esc(r.citation)}</div>
      <div class="p120-pass4c-meta">
        <span class="p120-pass4c-chip">${esc(c.source)}: ${esc(r.source_layer)}</span>
        ${extension?`<span class="p120-pass4c-chip">${esc(c.role)}: ${esc(r.role)}</span>${(r.modules||[]).map(m=>`<span class="p120-pass4c-chip">${esc(m)}</span>`).join('')}`:`<span class="p120-pass4c-chip">${esc(c.native)}</span>`}
      </div>
      ${r.doi?`<a class="doi-link" href="https://doi.org/${esc(r.doi)}" target="_blank" rel="noopener noreferrer">doi:${esc(r.doi)}</a>`:''}
    </article>`;
  }

  function filters(){
    const c=copy();
    const fixed=[['ALL',c.all],['CORE45',c.core],['PASS4_EXTENSION',c.ext]];
    const modules=['COM-12','MOT-12','SELF-12','LIFE-12/18','METHODS','EXT-SYS'];
    return [...fixed,...modules.map(x=>[x,x])].map(([id,label])=>`<button class="p120-pass4c-filter" type="button" data-pass4c-filter="${esc(id)}" aria-pressed="${state.filter===id?'true':'false'}">${esc(label)}</button>`).join('');
  }

  function drawList(root){
    const refs=(state.library.references||[]).filter(matches);const c=copy();
    root.querySelector('[data-pass4c-status]').textContent=`${c.showing} ${refs.length} ${c.of} 70`;
    root.querySelector('[data-pass4c-list]').innerHTML=refs.map(refHtml).join('');
    root.querySelectorAll('[data-pass4c-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.pass4cFilter===state.filter?'true':'false'));
    applyDeepLink(root,false);
  }

  function applyDeepLink(root,scroll=true){
    const id=new URLSearchParams(location.search).get('ref');
    root.querySelectorAll('[data-deep-linked]').forEach(x=>x.removeAttribute('data-deep-linked'));
    if(!/^REF-\d{3}$/.test(id||''))return;
    const target=root.querySelector(`#p120-global-ref-${CSS.escape(id)}`);
    if(!target)return;
    target.dataset.deepLinked='true';if(scroll)target.scrollIntoView({behavior:'smooth',block:'center'});
  }

  function renderLibrary(){
    if(window.P120ScientificBase?.activeBaseId!=='LIBRARY')return;
    const panel=document.getElementById('p120-science-active-base');if(!panel)return;
    document.getElementById('science-refs')?.classList.add('p120-pass4c-core-native-hidden');
    const c=copy();
    panel.dataset.p120Pass4cLibrary='integrated-v0.7';
    panel.innerHTML=`
      <div class="section-split-head"><div><span class="eyebrow">${esc(c.eyebrow)}</span><h2>${esc(c.title)}</h2></div><p>${esc(c.lead)}</p></div>
      <div class="p120-pass4b-library-summary"><div class="p120-pass4b-library-stat"><strong>45</strong><span>CORE</span></div><div class="p120-pass4b-library-stat"><strong>25</strong><span>PASS 4</span></div><div class="p120-pass4b-library-stat"><strong>70</strong><span>GLOBAL</span></div></div>
      <div class="p120-pass4b-boundary-note">${esc(c.boundary)}</div>
      <div class="p120-pass4c-controls"><input class="p120-pass4c-search" data-pass4c-search type="search" autocomplete="off" placeholder="${esc(c.search)}" value="${esc(state.query)}"><div class="p120-pass4c-filters">${filters()}</div></div>
      <div class="p120-pass4c-status" data-pass4c-status></div><div class="p120-pass4c-list" data-pass4c-list></div>`;
    panel.addEventListener('click',e=>{const b=e.target.closest?.('[data-pass4c-filter]');if(!b)return;state.filter=b.dataset.pass4cFilter;drawList(panel);});
    panel.querySelector('[data-pass4c-search]')?.addEventListener('input',e=>{state.query=e.target.value;drawList(panel);});
    drawList(panel);applyDeepLink(panel,true);
  }

  function setCoreNativeVisibility(baseId=window.P120ScientificBase?.activeBaseId){
    const core=document.getElementById('science-refs');
    if(!core)return;
    core.classList.toggle('p120-pass4c-core-native-hidden',baseId==='LIBRARY');
  }
  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(()=>{setCoreNativeVisibility();renderLibrary();}));}
  function handleBaseChange(event){
    const next=event?.detail?.baseId||window.P120ScientificBase?.activeBaseId||'CORE';
    setCoreNativeVisibility(next);
    schedule();
  }
  function expose(){window.P120ScienceGlobalLibrary=Object.freeze({version:VERSION,get status(){return Object.freeze({phase:state.phase,pass:state.pass,errors:[...state.errors],filter:state.filter,query:state.query});},get library(){return state.library;},render:schedule});}
  async function wait(attempt=0){if(window.P120SciencePublicationRenderer?.status?.pass===true&&window.P120ScientificBase?.status?.pass===true)return true;if(attempt>=180)return false;await new Promise(r=>setTimeout(r,35));return wait(attempt+1);}
  async function start(){
    try{
      if(!await wait())throw new Error('PASS 4B renderer not ready');
      const r=await fetch(dataUrl,{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw new Error(`integrated library HTTP ${r.status}`);
      state.library=await r.json();validate(state.library);if(state.errors.length)throw new Error(state.errors.join('; '));
      ensureStyle();state.phase='ready';state.pass=true;expose();schedule();
      addEventListener('p120:scientific-base-change',handleBaseChange);addEventListener('popstate',schedule);
      document.documentElement.dataset.p120WebsciencePass4c='library-v0.7';document.documentElement.dataset.p120WebsciencePass4cStatus='pass';
      dispatchEvent(new CustomEvent('p120:webscience-pass4c-ready',{detail:{pass:true,version:VERSION}}));
    }catch(error){if(!state.errors.length)fail(error?.message||String(error));state.phase='failed';state.pass=false;expose();document.documentElement.dataset.p120WebsciencePass4cStatus='fail';console.error('[P120 WEB-SCIENCE PASS 4C]',error);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

/* WEB-SCIENCE EXT PASS 4E — controlled Science visual QA stylesheet loader.
   PASS 4C library logic above remains unchanged except for this exact additive loader. */
(()=>{
  'use strict';
  const dedicated=/(?:^|\/)(?:en\/)?science\/?(?:index\.html)?$/i.test(location.pathname);
  if(!dedicated)return;
  if(document.querySelector('[data-p120-webscience-pass4e-loader]'))return;
  const owner=document.currentScript;
  const ownerUrl=owner?.src||new URL('p120-webscience-pass4c-library-v0.7.js',location.href).href;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=new URL('p120-webscience-pass4e-visual-v0.9.css?v=websci4e09',ownerUrl).href;
  link.dataset.p120WebsciencePass4eLoader='v0.9';
  link.addEventListener('load',()=>{
    document.documentElement.dataset.p120WebsciencePass4e='visual-v0.9';
    document.documentElement.dataset.p120WebsciencePass4eStatus='pass';
    dispatchEvent(new CustomEvent('p120:webscience-pass4e-ready',{detail:{pass:true,version:'0.9'}}));
  },{once:true});
  link.addEventListener('error',()=>{
    document.documentElement.dataset.p120WebsciencePass4eStatus='fail';
    console.error('[P120 WEB-SCIENCE PASS 4E] visual stylesheet load failed');
    dispatchEvent(new CustomEvent('p120:webscience-pass4e-ready',{detail:{pass:false,version:'0.9'}}));
  },{once:true});
  document.head.appendChild(link);
})();
