/* P-120 WEB-EXPLORE PASS 4 — Explore route reconciliation adapter v2.1
   RU/EN public-shell routing + compact home bridge.
   Presentation/navigation only: no assessment, scoring, questionnaire or report logic. */
(() => {
  'use strict';
  const isEn=/\/en(?:\/|$)/i.test(location.pathname);
  const SECTION_ID='extended-research-set';
  const TEASER_ID='extended-research-entry';
  let timer=0;

  const copy=isEn?{
    kicker:'P-120 · OPTIONAL DEEP DIVE',title:'Want to go deeper?',
    body:'The core P-120 remains independent. The Extended Research System adds optional research lenses — COM, MOT, SELF, RPE-MOD and LIFE — without recalculating the core profile.',
    button:'Open Extended Research System',deeperNote:'Extended Research System · optional research layers',togetherNote:'Dyadic Research Layer · relationship research'
  }:{
    kicker:'P-120 · ДОПОЛНИТЕЛЬНОЕ УГЛУБЛЕНИЕ',title:'Хотите глубже?',
    body:'Основной P-120 остаётся самостоятельным. Система углублённых исследований добавляет отдельные исследовательские линзы — COM, MOT, SELF, RPE-MOD и LIFE — без пересчёта основного профиля.',
    button:'Открыть систему углублённых исследований',deeperNote:'Система углублённых исследований · дополнительные модули',togetherNote:'Исследование пары · диадический слой'
  };

  function projectRoot(){
    const p=location.pathname;
    const markers=['/creator/','/why-p120/','/extended/','/together/','/privacy/','/terms/','/intellectual-property/'];
    for(const m of markers){
      const i=p.indexOf(m);
      if(i>=0) return p.slice(0,i+1);
    }
    return p.endsWith('/')?p:p.replace(/[^/]*$/,'');
  }
  function route(path){ location.assign(`${location.origin}${projectRoot()}${path}`); }

  function makeTeaser(){
    const section=document.createElement('section');
    section.id=TEASER_ID;
    section.className='extended-entry-teaser';
    section.setAttribute('aria-labelledby','extended-entry-title');
    section.innerHTML=`
      <div>
        <span class="extended-entry-kicker">${copy.kicker}</span>
        <h2 id="extended-entry-title">${copy.title}</h2>
      </div>
      <div class="extended-entry-copy">
        <p>${copy.body}</p>
        <div class="extended-entry-meta" aria-label="${isEn?'Optional research directions':'Дополнительные исследовательские направления'}">
          <span>COM</span><span>MOT</span><span>SELF</span><span>RPE-MOD</span><span>LIFE</span>
        </div>
        <button type="button" class="extended-entry-button" data-open-extended-page>${copy.button}</button>
      </div>`;
    return section;
  }

  function findScienceAnchor(home){
    const science=home?.querySelector('#science-foundation')||home?.querySelector('[data-section-id="science-foundation"]');
    if(!science) return null;
    let node=science.previousElementSibling;
    while(node){
      if(node.matches?.('.act-marker')&&/(?:Акт|Act)\s*III/i.test(node.textContent||'')) return node;
      node=node.previousElementSibling;
    }
    return science;
  }

  function reconcileHome(){
    const home=document.querySelector('.editorial-home');
    if(!home) return;
    home.querySelectorAll(`#${SECTION_ID}`).forEach(n=>{
      if(!n.hidden)n.hidden=true;
      if(n.getAttribute('aria-hidden')!=='true')n.setAttribute('aria-hidden','true');
      if(n.dataset.webExploreLegacy!=='retired')n.dataset.webExploreLegacy='retired';
    });
    const anchor=findScienceAnchor(home);
    if(!anchor?.parentNode) return;
    let teaser=home.querySelector(`#${TEASER_ID}`);
    if(!teaser){teaser=makeTeaser();anchor.parentNode.insertBefore(teaser,anchor);}
    else if(teaser.dataset.webExplorePass2!=='true'){
      const fresh=makeTeaser();teaser.replaceWith(fresh);teaser=fresh;
    }
    teaser.dataset.webExplorePass2='true';
    const open=teaser.querySelector('[data-open-extended-page]');
    if(open&&open.dataset.webExploreBound!=='true'){
      open.dataset.webExploreBound='true';open.addEventListener('click',()=>route('extended/'));
    }
  }

  function reconcileExploreMenu(){
    document.querySelectorAll('[data-ecosystem-route="deeper"],[data-ecosystem-mobile="deeper"]').forEach(btn=>{
      btn.removeAttribute('aria-disabled');btn.querySelector('.ecosystem-item-status,.ecosystem-mobile-status')?.remove();
      const note=btn.querySelector('.ecosystem-item-note,small');if(note)note.textContent=copy.deeperNote;
    });
    document.querySelectorAll('[data-ecosystem-route="together"],[data-ecosystem-mobile="together"]').forEach(btn=>{
      btn.removeAttribute('aria-disabled');btn.querySelector('.ecosystem-item-status,.ecosystem-mobile-status')?.remove();
      const note=btn.querySelector('.ecosystem-item-note,small');if(note)note.textContent=copy.togetherNote;
    });
    document.querySelectorAll('[data-extended-research-nav],[data-mobile-jump-extended]').forEach(n=>{
      if(!n.hidden)n.hidden=true;if(n.getAttribute('aria-hidden')!=='true')n.setAttribute('aria-hidden','true');if(n.tabIndex!==-1)n.tabIndex=-1;
    });
  }

  /* Explore destinations and chapter navigation are intentionally different controls.
     Explore → “Хотите глубже?” opens the dedicated Extended page.
     Chapter navigation → “Ещё глубже” remains on the main page and scrolls to the
     compact Extended Research teaser. Do not intercept chapter-jump controls here. */
  function intercept(event){
    const btn=event.target.closest?.('[data-ecosystem-route],[data-ecosystem-mobile]');
    if(!btn) return;
    const key=btn.dataset.ecosystemRoute||btn.dataset.ecosystemMobile;
    if(key!=='deeper'&&key!=='together') return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    route(key==='deeper'?'extended/':'together/');
  }

  function run(){timer=0;reconcileHome();reconcileExploreMenu();document.documentElement.dataset.webExplorePass2='ready';}
  function schedule(){if(timer)clearTimeout(timer);timer=setTimeout(run,70);}
  function start(){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});document.addEventListener('click',intercept,true);run();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

/* P-120 public scientific document reconciliation v1.2
   Public presentation only. No measurement, scoring, thresholds or research-status changes. */
(() => {
  'use strict';
  const isEn=/\/en(?:\/|$)/i.test(location.pathname);
  const meta=isEn?{
    title:'P-120 vNext — Scientific Concept Paper',
    version:'Public Research Edition A4 · v1.2',
    date:'1 September 2026',
    formula:'original candidate integration and operationalization',
    pdf:'../assets/p120-scientific-concept-paper-v1.2.pdf'
  }:{
    title:'P-120 vNext — Научный концептуальный документ',
    version:'Публичная исследовательская редакция A4 · v1.2',
    date:'1 сентября 2026',
    formula:'оригинальная кандидатная интеграция и операционализация',
    pdf:'assets/p120-scientific-concept-paper-v1.2.pdf'
  };

  function applyData(){
    const D=window.P120_SCIENCE;
    if(!D?.document)return;
    D.document.title=meta.title;
    D.document.version=meta.version;
    D.document.date=meta.date;
    D.document.pages=15;
    D.document.pdf=meta.pdf;
    if(D.positioning)D.positioning.formula=meta.formula;
  }

  function replaceLeafText(root,from,to){
    root.querySelectorAll('strong,p,span,h2,h3,h4').forEach(el=>{
      if(el.children.length)return;
      const t=(el.textContent||'').trim();
      if(t===from)el.textContent=to;
    });
  }

  function applyDom(){
    applyData();
    const root=document;
    root.querySelectorAll('a[href*="p120-scientific-concept-paper-v1.1.pdf"],a[href*="p120-scientific-concept-paper-v1.2.pdf"]').forEach(a=>a.setAttribute('href',meta.pdf));
    root.querySelectorAll('.science-doc-card').forEach(card=>{
      const title=card.querySelector(':scope > strong');
      const info=card.querySelector(':scope > p');
      const formula=card.querySelector('.formula-card strong');
      if(title)title.textContent=meta.title;
      if(info)info.innerHTML=`${meta.version}<br>${meta.date} · 15 ${isEn?'pp.':'стр.'}`;
      if(formula)formula.textContent=meta.formula;
    });
    replaceLeafText(root,'P-120 vNext — Scientific Concept Paper',meta.title);
    replaceLeafText(root,'original candidate integration and operationalization',meta.formula);
    root.querySelectorAll('p').forEach(p=>{
      const t=(p.textContent||'').trim();
      if(/Академическая редакционная версия A4\s*·\s*v1\.1/i.test(t)&&/29 августа 2026/i.test(t)){
        p.innerHTML=`${meta.version}<br>${meta.date} · 15 стр.`;
      }
    });
    let style=document.getElementById('p120-science-public-v12-style');
    if(!style){
      style=document.createElement('style');
      style.id='p120-science-public-v12-style';
      style.textContent='.science-hero h1{font-family:"Noto Serif Display","Noto Serif",Georgia,"Times New Roman",serif!important;font-weight:600!important;}';
      document.head.appendChild(style);
    }
    document.documentElement.dataset.sciencePublicDocument='v1.2';
  }

  let timer=0;
  function schedule(){clearTimeout(timer);timer=setTimeout(applyDom,50);}
  function start(){
    applyDom();
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
