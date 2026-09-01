/* P-120 WEB-EXPLORE PASS 2 — Explore route reconciliation adapter v2.0
   RU public-shell routing + compact home bridge only.
   EN legacy behavior remains untouched until EN parity pass.
   Presentation/navigation only: no assessment, scoring, questionnaire or report logic. */
(() => {
  'use strict';
  const isEn=/\/en(?:\/|$)/i.test(location.pathname);
  if(isEn) return;

  const SECTION_ID='extended-research-set';
  const TEASER_ID='extended-research-entry';
  let timer=0;

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
        <span class="extended-entry-kicker">P-120 · OPTIONAL DEEP DIVE</span>
        <h2 id="extended-entry-title">Хотите глубже?</h2>
      </div>
      <div class="extended-entry-copy">
        <p>Основной P-120 остаётся самостоятельным. Отдельная Extended Research System показывает дополнительные исследовательские линзы — COM, MOT, SELF, RPE-MOD и LIFE — без пересчёта основного профиля.</p>
        <div class="extended-entry-meta" aria-label="Дополнительные исследовательские направления">
          <span>COM</span><span>MOT</span><span>SELF</span><span>RPE-MOD</span><span>LIFE</span>
        </div>
        <button type="button" class="extended-entry-button" data-open-extended-page>Открыть Extended Research System</button>
      </div>`;
    return section;
  }

  function findScienceAnchor(home){
    const science=home?.querySelector('#science-foundation')||home?.querySelector('[data-section-id="science-foundation"]');
    if(!science) return null;
    let node=science.previousElementSibling;
    while(node){
      if(node.matches?.('.act-marker')&&/Акт\s*III/i.test(node.textContent||'')) return node;
      node=node.previousElementSibling;
    }
    return science;
  }

  function reconcileHome(){
    const home=document.querySelector('.editorial-home');
    if(!home) return;
    /* PASS 2: keep the legacy node present so the bundled v1 observer does not recreate it,
       but retire it from the public scroll plane. */
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
      open.dataset.webExploreBound='true';
      open.addEventListener('click',()=>route('extended/'));
    }
  }

  function reconcileExploreMenu(){
    document.querySelectorAll('[data-ecosystem-route="deeper"],[data-ecosystem-mobile="deeper"]').forEach(btn=>{
      if(btn.hasAttribute('aria-disabled')) btn.removeAttribute('aria-disabled');
      btn.querySelector('.ecosystem-item-status,.ecosystem-mobile-status')?.remove();
      const note=btn.querySelector('.ecosystem-item-note,small');
      if(note&&note.textContent!=='Extended Research System · дополнительные исследования') note.textContent='Extended Research System · дополнительные исследования';
    });
    document.querySelectorAll('[data-ecosystem-route="together"],[data-ecosystem-mobile="together"]').forEach(btn=>{
      if(btn.hasAttribute('aria-disabled')) btn.removeAttribute('aria-disabled');
      btn.querySelector('.ecosystem-item-status,.ecosystem-mobile-status')?.remove();
      const note=btn.querySelector('.ecosystem-item-note,small');
      if(note&&note.textContent!=='Dyadic Research Layer · исследование пары') note.textContent='Dyadic Research Layer · исследование пары';
    });
    /* Retire pre-v2 duplicate navigation affordances without removing them: the bundled
       legacy observer otherwise recreates them. Explore map is the route authority. */
    document.querySelectorAll('[data-extended-research-nav],[data-mobile-jump-extended]').forEach(n=>{
      if(!n.hidden)n.hidden=true;
      if(n.getAttribute('aria-hidden')!=='true')n.setAttribute('aria-hidden','true');
      if(n.tabIndex!==-1)n.tabIndex=-1;
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
  function start(){
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click',intercept,true);
    run();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
