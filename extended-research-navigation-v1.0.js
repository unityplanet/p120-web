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

  function intercept(event){
    const btn=event.target.closest?.('[data-ecosystem-route],[data-ecosystem-mobile],[data-chapter-jump="extended"],[data-chapter-mobile="extended"]');
    if(!btn) return;
    const key=btn.dataset.ecosystemRoute||btn.dataset.ecosystemMobile;
    const extendedChapter=btn.dataset.chapterJump==='extended'||btn.dataset.chapterMobile==='extended';
    if(!extendedChapter&&key!=='deeper'&&key!=='together') return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    route((extendedChapter||key==='deeper')?'extended/':'together/');
  }

  function run(){timer=0;reconcileHome();reconcileExploreMenu();document.documentElement.dataset.webExplorePass2='ready';}
  function schedule(){if(timer)clearTimeout(timer);timer=setTimeout(run,70);}
  function start(){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});document.addEventListener('click',intercept,true);run();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
