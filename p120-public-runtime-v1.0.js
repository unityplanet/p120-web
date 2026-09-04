/* P-120 production public runtime v1.1 — generated, source order preserved */

/* === extended-research-navigation-v1.0.js === */
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
     Explore -> “Хотите глубже?” opens the dedicated Extended page.
     Chapter navigation -> “Ещё глубже” remains on the main page and scrolls to the
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
    status:'Research Candidate · 18+',
    formula:'original candidate integration and operationalization',
    pages:14,
    pdf:'../assets/p120-scientific-concept-paper-en-v1.2.pdf'
  }:{
    title:'P-120 vNext — Научный концептуальный документ',
    version:'Публичная исследовательская редакция A4 · v1.2',
    date:'1 сентября 2026',
    status:'Исследовательская версия · 18+',
    formula:'оригинальная кандидатная интеграция и операционализация',
    pages:15,
    pdf:'assets/p120-scientific-concept-paper-v1.2.pdf'
  };

  function applyData(){
    const D=window.P120_SCIENCE;
    if(!D?.document)return;
    D.document.title=meta.title;
    D.document.version=meta.version;
    D.document.date=meta.date;
    D.document.status=meta.status;
    D.document.pages=meta.pages;
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
    root.querySelectorAll('a[href*="p120-scientific-concept-paper"]').forEach(a=>a.setAttribute('href',meta.pdf));
    root.querySelectorAll('.science-doc-card').forEach(card=>{
      const title=card.querySelector(':scope > strong');
      const info=card.querySelector(':scope > p');
      const formula=card.querySelector('.formula-card strong');
      if(title)title.textContent=meta.title;
      if(info)info.innerHTML=`${meta.version}<br>${meta.date} · ${meta.pages} ${isEn?'pp.':'стр.'}`;
      if(formula)formula.textContent=meta.formula;
    });
    replaceLeafText(root,'P-120 vNext — Scientific Concept Paper',meta.title);
    replaceLeafText(root,'original candidate integration and operationalization',meta.formula);
    if(isEn){
      replaceLeafText(root,'Исследовательская версия · 18+',meta.status);
      replaceLeafText(root,'Академическая редакционная версия A4 · v1.1',meta.version);
      replaceLeafText(root,'29 августа 2026',meta.date);
    }else{
      root.querySelectorAll('p').forEach(p=>{
        const t=(p.textContent||'').trim();
        if(/Академическая редакционная версия A4\s*·\s*v1\.1/i.test(t)&&/29 августа 2026/i.test(t)){
          p.innerHTML=`${meta.version}<br>${meta.date} · ${meta.pages} стр.`;
        }
      });
    }
    let style=document.getElementById('p120-science-public-v12-style');
    if(!style){
      style=document.createElement('style');
      style.id='p120-science-public-v12-style';
      style.textContent='.science-hero h1{font-family:"Noto Serif Display","Noto Serif",Georgia,"Times New Roman",serif!important;font-weight:600!important;}';
      document.head.appendChild(style);
    }
    document.documentElement.dataset.sciencePublicDocument=isEn?'v1.2-en':'v1.2-ru';
  }

  let timer=0;
  function schedule(){clearTimeout(timer);timer=setTimeout(applyDom,50);}
  function start(){
    applyDom();
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();


/* === chapter-navigation-v1.0.js === */
/* P-120 Web Editorial — Chapter Navigation v1.6.0
   Presentation/navigation only. No measurement, scoring, questionnaire or report-engine changes. */
(()=>{
  'use strict';

  const DESKTOP_MIN=1121;
  const QUICK_MAX=820;
  const NAV_ID='p120-chapter-navigation';
  const MOBILE_GROUP_ATTR='data-p120-chapter-mobile';
  const QUICK_NAV_ID='p120-mobile-quick-chapters';
  const QUICK_PANEL_ID='p120-mobile-quick-chapters-panel';
  const isEn=/\/en(?:\/|$)/i.test(location.pathname);
  const chapters=[
    {id:'architecture',index:'01',label:'Архитектура',target:'why-important',note:'Акт I · внутренняя система'},
    {id:'two-systems',index:'02',label:'Две системы',target:'two-systems',note:'Акт II · встреча архитектур'},
    {id:'result',index:'03',label:'Результат',target:'showcase',note:'что покажет P-120'},
    {id:'extended',index:'04',label:'Ещё глубже',target:'extended-research-entry',note:'optional Extended Research Set'},
    {id:'science',index:'05',label:'Наука',target:'science-foundation',note:'Акт III · научная опора'}
  ];
  const quickCopy=isEn?{
    aria:'P-120 chapter navigation',trigger:'Chapters',
    labels:{architecture:'Architecture','two-systems':'Two systems',result:'Result',extended:'Go deeper',science:'Science'}
  }:{
    aria:'Навигация по главам P-120',trigger:'По главам',
    labels:{architecture:'Архитектура','two-systems':'Две системы',result:'Результат',extended:'Ещё глубже',science:'Наука'}
  };

  let timer=0,scrollScheduled=false,scrollFrame=0,restoreScrollBehavior=null,activeId=chapters[0].id;
  const trace={version:'1.6.0',calls:0,frames:0,start:null,destination:null,delta:null,lastWritten:null,lastObserved:null,maxObserved:null,target:null,ended:false};
  window.P120_CHAPTER_SCROLL_TRACE=trace;

  function reducedMotion(){return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}
  function closeDrawer(){try{if(typeof window.closeMobileMenu==='function')window.closeMobileMenu();else document.body.classList.remove('mobile-menu-open');}catch(_){document.body.classList.remove('mobile-menu-open');}}
  function homeRoot(){return document.querySelector('.editorial-home');}
  function targetElement(chapter){return document.getElementById(chapter.target);}
  function scrollRoot(){return document.scrollingElement||document.documentElement;}
  function quickLabel(chapter){return quickCopy.labels[chapter.id]||chapter.label;}
  function setScrollTop(value){
    const root=scrollRoot();
    const next=Math.max(0,value);
    root.scrollTop=next;
    trace.lastWritten=next;
    trace.lastObserved=root.scrollTop;
    trace.maxObserved=Math.max(trace.maxObserved??root.scrollTop,root.scrollTop);
  }
  function beginOwnedScroll(){
    if(restoreScrollBehavior){restoreScrollBehavior();restoreScrollBehavior=null;}
    const html=document.documentElement,body=document.body,htmlInline=html.style.scrollBehavior,bodyInline=body?.style.scrollBehavior||'';
    html.style.scrollBehavior='auto';if(body)body.style.scrollBehavior='auto';
    restoreScrollBehavior=()=>{html.style.scrollBehavior=htmlInline;if(body)body.style.scrollBehavior=bodyInline;restoreScrollBehavior=null;};
    setScrollTop(scrollRoot().scrollTop);
  }
  function endOwnedScroll(){if(!restoreScrollBehavior)return;const restore=restoreScrollBehavior;requestAnimationFrame(()=>restore());}
  function topOffset(){const topbar=document.querySelector('.topbar');const height=Math.max(58,Math.round(topbar?.getBoundingClientRect().height||70));document.documentElement.style.setProperty('--chapter-nav-top',`${height}px`);return height;}
  function easeInOutCubic(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function scrollOffset(){if(window.innerWidth<DESKTOP_MIN)return topOffset()+14;const nav=document.querySelector('.chapter-jump-nav-inner');const navHeight=Math.max(48,Math.round(nav?.getBoundingClientRect().height||48));return topOffset()+navHeight+18;}
  function smoothScroll(target){
    if(!target||!target.isConnected)return;
    if(scrollFrame){cancelAnimationFrame(scrollFrame);scrollFrame=0;}
    beginOwnedScroll();
    const root=scrollRoot(),start=root.scrollTop,destination=Math.max(0,start+target.getBoundingClientRect().top-scrollOffset()),delta=destination-start;
    Object.assign(trace,{calls:trace.calls+1,frames:0,start,destination,delta,lastWritten:start,lastObserved:root.scrollTop,maxObserved:root.scrollTop,target:target.id,ended:false,reduced:reducedMotion()});
    if(reducedMotion()||Math.abs(delta)<2){setScrollTop(destination);updateFromScroll();trace.ended=true;endOwnedScroll();return;}
    const duration=Math.min(760,Math.max(360,Math.abs(delta)*.42)),t0=performance.now();
    const step=now=>{
      const p=Math.min(1,(now-t0)/duration);
      trace.frames+=1;
      setScrollTop(start+delta*easeInOutCubic(p));
      if(p<1){scrollFrame=requestAnimationFrame(step);return;}
      scrollFrame=0;
      const live=document.getElementById(target.id);
      if(live&&live.isConnected){const correction=live.getBoundingClientRect().top-scrollOffset();trace.correction=correction;if(Math.abs(correction)>2)setScrollTop(scrollRoot().scrollTop+correction);}
      updateFromScroll();trace.ended=true;trace.endTop=scrollRoot().scrollTop;endOwnedScroll();
    };
    scrollFrame=requestAnimationFrame(step);
  }
  function waitForTarget(chapter,attempt=0){const target=targetElement(chapter);if(target){setActive(chapter.id);smoothScroll(target);return;}if(attempt<45)window.setTimeout(()=>waitForTarget(chapter,attempt+1),45);}
  function openChapter(chapter){closeQuick();closeDrawer();const home=homeRoot(),target=targetElement(chapter);if(home&&target){setActive(chapter.id);smoothScroll(target);return;}try{if(typeof window.goHome==='function')window.goHome();else if(typeof window.navigate==='function')window.navigate('home');}catch(_){}window.setTimeout(()=>waitForTarget(chapter),70);}

  function makeDesktopNav(){const nav=document.createElement('nav');nav.id=NAV_ID;nav.className='chapter-jump-nav';nav.setAttribute('aria-label','Навигация по главам P-120');nav.innerHTML=`<div class="chapter-jump-nav-inner"><div class="chapter-jump-prefix">По главам</div><div class="chapter-jump-track">${chapters.map(ch=>`<button type="button" class="chapter-jump-button" data-chapter-jump="${ch.id}" aria-label="${ch.index}. ${ch.label}"><span class="chapter-jump-index">${ch.index}</span><span>${ch.label}</span></button>`).join('')}<span class="chapter-jump-progress" aria-hidden="true"><i></i></span></div></div>`;nav.querySelectorAll('[data-chapter-jump]').forEach(btn=>{const chapter=chapters.find(ch=>ch.id===btn.dataset.chapterJump);if(chapter)btn.addEventListener('click',()=>openChapter(chapter));});return nav;}
  function ensureDesktopNav(){const home=homeRoot();if(!home){document.getElementById(NAV_ID)?.remove();document.documentElement.classList.remove('chapter-nav-visible');return false;}let nav=document.getElementById(NAV_ID);if(!nav){nav=makeDesktopNav();document.body.appendChild(nav);}topOffset();return true;}

  function makeMobileGroup(){const group=document.createElement('div');group.className='mobile-menu-group chapter-mobile-group';group.setAttribute(MOBILE_GROUP_ATTR,'v1.0');group.innerHTML=`<span class="eyebrow">По главам</span>${chapters.map(ch=>`<button type="button" class="mobile-menu-link chapter-mobile-link" data-chapter-mobile="${ch.id}"><div><div><span class="chapter-mobile-index">${ch.index}</span>${ch.label}</div><small>${ch.note}</small></div></button>`).join('')}`;group.querySelectorAll('[data-chapter-mobile]').forEach(btn=>{const chapter=chapters.find(ch=>ch.id===btn.dataset.chapterMobile);if(chapter)btn.addEventListener('click',()=>openChapter(chapter));});return group;}
  function ensureMobileGroup(){document.querySelectorAll('.mobile-menu-body').forEach(body=>{if(body.querySelector(`[${MOBILE_GROUP_ATTR}]`))return;const groups=[...body.querySelectorAll(':scope > .mobile-menu-group')],sectionsGroup=groups.find(g=>/Разделы/i.test(g.querySelector('.eyebrow')?.textContent||'')),themeGroup=groups.find(g=>/Тема оформления/i.test(g.querySelector('.eyebrow')?.textContent||'')),group=makeMobileGroup();if(sectionsGroup?.parentNode===body)sectionsGroup.insertAdjacentElement('afterend',group);else if(themeGroup?.parentNode===body)body.insertBefore(group,themeGroup);else body.appendChild(group);});}

  function closeQuick(){document.querySelectorAll(`#${QUICK_NAV_ID}.is-open`).forEach(nav=>{nav.classList.remove('is-open');nav.querySelector('[data-chapter-quick-trigger]')?.setAttribute('aria-expanded','false');});}
  function makeMobileQuick(){
    const wrap=document.createElement('div');
    wrap.id=QUICK_NAV_ID;
    wrap.className='chapter-mobile-quick';
    wrap.dataset.p120MobileQuickChapters='1.0';
    wrap.innerHTML=`<div class="chapter-mobile-quick-panel" id="${QUICK_PANEL_ID}" role="navigation" aria-label="${quickCopy.aria}">${chapters.map(ch=>`<button type="button" class="chapter-mobile-quick-item" data-chapter-quick="${ch.id}"><span class="chapter-mobile-quick-item-index">${ch.index}</span><span>${quickLabel(ch)}</span></button>`).join('')}</div><button type="button" class="chapter-mobile-quick-trigger" data-chapter-quick-trigger aria-expanded="false" aria-controls="${QUICK_PANEL_ID}" aria-label="${quickCopy.aria}"><span class="chapter-mobile-quick-current-index">01</span><span class="chapter-mobile-quick-current-label">${quickLabel(chapters[0])}</span><span class="chapter-mobile-quick-chevron" aria-hidden="true">⌃</span></button>`;
    const trigger=wrap.querySelector('[data-chapter-quick-trigger]');
    trigger.addEventListener('click',()=>{const open=!wrap.classList.contains('is-open');closeQuick();if(open){wrap.classList.add('is-open');trigger.setAttribute('aria-expanded','true');}});
    wrap.querySelectorAll('[data-chapter-quick]').forEach(btn=>{const chapter=chapters.find(ch=>ch.id===btn.dataset.chapterQuick);if(chapter)btn.addEventListener('click',()=>openChapter(chapter));});
    return wrap;
  }
  function syncMobileQuick(){
    const wrap=document.getElementById(QUICK_NAV_ID);if(!wrap)return;
    const chapter=chapters.find(ch=>ch.id===activeId)||chapters[0];
    const index=wrap.querySelector('.chapter-mobile-quick-current-index'),label=wrap.querySelector('.chapter-mobile-quick-current-label');
    if(index&&index.textContent!==chapter.index)index.textContent=chapter.index;
    const nextLabel=quickLabel(chapter);if(label&&label.textContent!==nextLabel)label.textContent=nextLabel;
    wrap.querySelectorAll('[data-chapter-quick]').forEach(btn=>{const active=btn.dataset.chapterQuick===chapter.id;btn.classList.toggle('is-active',active);if(active)btn.setAttribute('aria-current','location');else btn.removeAttribute('aria-current');});
  }
  function ensureMobileQuick(){
    const home=homeRoot(),existing=document.getElementById(QUICK_NAV_ID);
    if(!home||window.innerWidth>QUICK_MAX){existing?.remove();document.documentElement.classList.remove('chapter-mobile-quick-visible');return false;}
    if(!existing)document.body.appendChild(makeMobileQuick());
    syncMobileQuick();
    return true;
  }

  function sectionPositions(){const offset=topOffset()+(window.innerWidth>=DESKTOP_MIN?76:20);return chapters.map(ch=>{const el=targetElement(ch);if(!el)return null;return{chapter:ch,top:window.scrollY+el.getBoundingClientRect().top-offset};}).filter(Boolean).sort((a,b)=>a.top-b.top);}
  function setActive(id){
    activeId=id||chapters[0].id;
    const index=Math.max(0,chapters.findIndex(ch=>ch.id===activeId));
    document.documentElement.style.setProperty('--chapter-progress',`${((index+1)/chapters.length)*100}%`);
    document.querySelectorAll('[data-chapter-jump]').forEach(btn=>{const active=btn.dataset.chapterJump===activeId;btn.classList.toggle('is-active',active);if(active)btn.setAttribute('aria-current','location');else btn.removeAttribute('aria-current');});
    document.querySelectorAll('[data-chapter-mobile]').forEach(btn=>{const active=btn.dataset.chapterMobile===activeId;btn.classList.toggle('is-active',active);if(active)btn.setAttribute('aria-current','location');else btn.removeAttribute('aria-current');});
    syncMobileQuick();
  }
  function updateFromScroll(){
    scrollScheduled=false;
    const home=homeRoot();
    if(!home){document.documentElement.classList.remove('chapter-nav-visible','chapter-mobile-quick-visible');closeQuick();return;}
    const first=document.getElementById('why-important'),showThreshold=Math.max(260,Math.min(window.innerHeight*.58,(first?.offsetHeight||window.innerHeight)*.44));
    document.documentElement.classList.toggle('chapter-nav-visible',window.innerWidth>=DESKTOP_MIN&&window.scrollY>showThreshold);
    const quickVisible=window.innerWidth<=QUICK_MAX&&window.scrollY>showThreshold;
    document.documentElement.classList.toggle('chapter-mobile-quick-visible',quickVisible);
    if(!quickVisible)closeQuick();
    const positions=sectionPositions();if(!positions.length)return;
    const probe=window.scrollY+topOffset()+120;let current=positions[0].chapter;
    for(const item of positions){if(item.top<=probe)current=item.chapter;else break;}
    setActive(current.id);
  }
  function scheduleScroll(){if(scrollScheduled)return;scrollScheduled=true;window.requestAnimationFrame(updateFromScroll);}
  function run(){timer=0;ensureDesktopNav();ensureMobileGroup();ensureMobileQuick();updateFromScroll();}
  function schedule(){if(timer)clearTimeout(timer);timer=setTimeout(run,70);}
  function start(){
    const observer=new MutationObserver(schedule);observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
    const bodyObserver=new MutationObserver(()=>{if(document.body.classList.contains('mobile-menu-open'))closeQuick();});bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
    window.addEventListener('scroll',scheduleScroll,{passive:true});window.addEventListener('resize',scheduleScroll,{passive:true});
    document.addEventListener('click',e=>{if(e.target.closest?.('[data-mobile-menu]'))closeQuick();else if(!e.target.closest?.(`#${QUICK_NAV_ID}`))closeQuick();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeQuick();});
    run();document.documentElement.classList.add('chapter-navigation-ready');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();


/* === language-switch-v1.0.js === */
/* P-120 Web Editorial — RU/EN language switch v1.2 */
(() => {
  'use strict';
  const path = location.pathname;
  const scienceMatch = path.match(/^(.*?)(en\/)?science\/?(?:index\.html)?$/i);
  const isScience = Boolean(scienceMatch);
  const isEn = isScience ? Boolean(scienceMatch[2]) : /\/en\/(?:index\.html)?$/i.test(path);
  let rootHref;
  let enHref;
  if (isScience) {
    const base = scienceMatch[1];
    rootHref = `${base}science/`;
    enHref = `${base}en/science/`;
  } else {
    const rootPath = isEn
      ? path.replace(/\/en\/(?:index\.html)?$/i,'/')
      : path.replace(/index\.html$/i,'');
    const normalizedRoot = rootPath.endsWith('/') ? rootPath : rootPath + '/';
    rootHref = normalizedRoot;
    enHref = normalizedRoot + 'en/';
  }
  let timer=0;

  function desktopSwitch(){
    document.querySelectorAll('.topbar-tools').forEach(host=>{
      if(host.querySelector('.p120-language-switch')) return;
      const box=document.createElement('nav');
      box.className='p120-language-switch p120-language-switch-desktop';
      box.setAttribute('aria-label',isEn?'Language':'Язык');
      box.innerHTML=`<a href="${rootHref}" lang="ru" ${!isEn?'aria-current="page"':''}>RU</a><a href="${enHref}" lang="en" ${isEn?'aria-current="page"':''}>EN</a>`;
      host.prepend(box);
    });
  }

  function mobileSwitch(){
    document.querySelectorAll('.mobile-menu-body').forEach(host=>{
      if(host.querySelector('.p120-language-mobile-group')) return;
      const group=document.createElement('section');
      group.className='p120-language-mobile-group';
      group.setAttribute('aria-label',isEn?'Language':'Язык');
      group.innerHTML=`<div class="p120-language-mobile-label">${isEn?'Language':'Язык'}</div><div class="p120-language-mobile-options"><a href="${rootHref}" lang="ru" ${!isEn?'aria-current="page"':''}>Русский</a><a href="${enHref}" lang="en" ${isEn?'aria-current="page"':''}>English</a></div>`;
      const theme=Array.from(host.querySelectorAll('.eyebrow')).find(x=>/Тема оформления|Theme/i.test(x.textContent||''));
      const themeSection=theme?.closest('section,div');
      if(themeSection?.parentNode===host) host.insertBefore(group,themeSection);
      else host.append(group);
    });
  }

  function launchRussianAssessment(){
    if(isEn || isScience) return;
    const params=new URLSearchParams(location.search);
    const start=params.get('start');
    const resume=params.get('resume');
    if(!start && !resume) return;
    let attempts=0;
    const tick=()=>{
      attempts++;
      const buttons=Array.from(document.querySelectorAll('button'));
      let target=null;
      if(resume) target=document.querySelector('#editorialResume,[data-mobile-resume]') || buttons.find(b=>/Продолжить/.test((b.textContent||'').trim()));
      if(!target && start) target=buttons.find(b=>/^(Пройти P-120|Начать P-120)/.test((b.textContent||'').trim())) || document.querySelector('[data-mobile-start]');
      if(target){
        history.replaceState(null,'',location.pathname+location.hash);
        target.click();
      } else if(attempts<40) setTimeout(tick,75);
    };
    setTimeout(tick,80);
  }

  function run(){timer=0;desktopSwitch();mobileSwitch()}
  function schedule(){
    if(timer) clearTimeout(timer);
    timer=setTimeout(run,60);
  }
  const start=()=>{
    document.documentElement.lang=isEn?'en':'ru';
    const watch=document.getElementById('app')||document.body;
    new MutationObserver(schedule).observe(watch,{childList:true,subtree:true});
    run();
    launchRussianAssessment();
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();


/* === navigation-architecture-v2.js === */
/* P-120 Navigation Architecture v2
   Ecosystem navigation only. No assessment, scoring, questionnaire, or bottom-nav changes. */
(() => {
  'use strict';

  const isEn = /\/en(?:\/|$)/i.test(location.pathname);
  const copy = isEn ? {
    trigger:'Explore', panel:'Explore P-120', map:'Project map',
    story:'Story', next:'Next', core:'Core', page:'On this page',
    why:'Why P-120?', whyNote:'Origin of the name and the idea',
    creator:'From the Creator', creatorNote:'The personal context behind P-120',
    deeper:'Go deeper', deeperNote:'Extended Research Set · optional research',
    together:'Together?', togetherNote:'Dyadic research layer',
    coming:'Coming', language:'Language'
  } : {
    trigger:'Исследовать', panel:'Исследовать P-120', map:'Карта проекта',
    story:'История P-120', next:'Дальше', core:'Основное', page:'На этой странице',
    why:'Почему P-120?', whyNote:'Происхождение названия и самой идеи',
    creator:'От создателя', creatorNote:'Личный контекст появления P-120',
    deeper:'Хотите глубже?', deeperNote:'Extended Research Set · дополнительные исследования',
    together:'Мы вместе?', togetherNote:'Dyadic research layer · исследование пары',
    coming:'Готовится', language:'Language'
  };

  /* Dedicated Story routes are language-relative:
     /why-p120/ + /creator/ in RU, /en/why-p120/ + /en/creator/ in EN. */
  const routes = {
    why:{status:'active',href:'why-p120/'},
    creator:{status:'active',href:'creator/'},
    deeper:{status:'active',target:'extended-research-set'},
    together:{status:'reserved',route:'together'}
  };

  let timer=0;

  function publicScreen(){
    try { if (typeof window.isAssessmentScreen === 'function' && window.isAssessmentScreen()) return false; } catch(_) {}
    if (document.querySelector('.question-card,.preflight,.transition,.results-grid')) return false;
    return !!document.querySelector('.editorial-home,.science-page,[data-science-root],#science-top,.topnav');
  }

  function closeDrawer(){
    try { if (typeof window.closeMobileMenu === 'function') window.closeMobileMenu(); else document.body.classList.remove('mobile-menu-open'); }
    catch(_) { document.body.classList.remove('mobile-menu-open'); }
  }

  function scrollTarget(id,attempt=0){
    const target=document.getElementById(id);
    if(target){
      const topbar=document.querySelector('.topbar');
      const offset=Math.max(70,Math.round(topbar?.getBoundingClientRect().height||70))+22;
      const y=window.scrollY+target.getBoundingClientRect().top-offset;
      window.scrollTo({top:Math.max(0,y),behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      return;
    }
    if(attempt<40) setTimeout(()=>scrollTarget(id,attempt+1),45);
  }

  function openHomeTarget(id){
    closeDrawer(); closeDesktop();
    const target=document.getElementById(id);
    if(document.querySelector('.editorial-home') && target){scrollTarget(id);return;}
    try { if(typeof window.goHome==='function') window.goHome(); else if(typeof window.navigate==='function') window.navigate('home'); } catch(_) {}
    setTimeout(()=>scrollTarget(id),75);
  }

  function activate(key){
    const route=routes[key];
    if(!route || route.status!=='active') return;
    if(route.href){
      closeDrawer(); closeDesktop();
      window.location.assign(route.href);
      return;
    }
    openHomeTarget(route.target);
  }

  function itemMarkup(key,title,note){
    const r=routes[key]; const reserved=r.status!=='active';
    return `<button type="button" class="ecosystem-item-v2" data-ecosystem-route="${key}" ${reserved?'aria-disabled="true"':''}><span class="ecosystem-item-copy"><span class="ecosystem-item-title">${title}</span><span class="ecosystem-item-note">${note}</span></span>${reserved?`<span class="ecosystem-item-status">${copy.coming}</span>`:''}</button>`;
  }

  function closeDesktop(){
    document.querySelectorAll('.ecosystem-nav-v2.is-open').forEach(nav=>{
      nav.classList.remove('is-open');
      nav.querySelector('.ecosystem-trigger')?.setAttribute('aria-expanded','false');
    });
  }

  function makeDesktop(){
    const wrap=document.createElement('div');
    wrap.className='ecosystem-nav-v2';
    wrap.dataset.navigationArchitecture='v2';
    wrap.innerHTML=`<button type="button" class="navlink ecosystem-trigger" aria-haspopup="true" aria-expanded="false">${copy.trigger}</button><div class="ecosystem-panel-v2" role="navigation" aria-label="${copy.panel}"><div class="ecosystem-panel-head"><strong>${copy.panel}</strong><span>${copy.map}</span></div><div class="ecosystem-grid-v2"><section class="ecosystem-column-v2"><div class="ecosystem-column-label">${copy.story}</div>${itemMarkup('why',copy.why,copy.whyNote)}${itemMarkup('creator',copy.creator,copy.creatorNote)}</section><section class="ecosystem-column-v2"><div class="ecosystem-column-label">${copy.next}</div>${itemMarkup('deeper',copy.deeper,copy.deeperNote)}${itemMarkup('together',copy.together,copy.togetherNote)}</section></div></div>`;
    const trigger=wrap.querySelector('.ecosystem-trigger');
    trigger.addEventListener('click',e=>{
      e.stopPropagation();
      const open=!wrap.classList.contains('is-open');
      closeDesktop();
      if(open){wrap.classList.add('is-open');trigger.setAttribute('aria-expanded','true');}
    });
    wrap.querySelectorAll('[data-ecosystem-route]').forEach(btn=>{
      btn.addEventListener('click',()=>{if(btn.getAttribute('aria-disabled')==='true')return;activate(btn.dataset.ecosystemRoute);});
    });
    return wrap;
  }

  function ensureDesktop(){
    document.querySelectorAll('.topnav').forEach(nav=>{
      const existing=nav.querySelector(':scope > .ecosystem-nav-v2');
      if(!publicScreen()){existing?.remove();return;}
      if(existing)return;
      nav.appendChild(makeDesktop());
    });
  }

  function mobileItem(key,title,note){
    const reserved=routes[key].status!=='active';
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='mobile-menu-link ecosystem-mobile-link-v2';
    btn.dataset.ecosystemMobile=key;
    if(reserved)btn.setAttribute('aria-disabled','true');
    btn.innerHTML=`<div><div>${title}</div><small>${note}</small></div>${reserved?`<span class="ecosystem-mobile-status">${copy.coming}</span>`:''}`;
    btn.addEventListener('click',()=>{if(reserved)return;activate(key);});
    return btn;
  }

  function makeMobileGroup(kind,title,items){
    const group=document.createElement('div');
    group.className=`mobile-menu-group ecosystem-mobile-group-v2 ecosystem-mobile-${kind}`;
    group.dataset.ecosystemMobileGroup=kind;
    group.innerHTML=`<div class="ecosystem-mobile-section-label"><span>${title}</span><span class="ecosystem-mobile-section-count">${String(items.length).padStart(2,'0')}</span></div>`;
    items.forEach(item=>group.appendChild(mobileItem(...item)));
    return group;
  }

  function groupByLabel(body,re){
    return [...body.querySelectorAll(':scope > .mobile-menu-group')].find(g=>re.test((g.querySelector('.eyebrow')?.textContent||'').trim()));
  }

  /* MutationObserver-safe placement. The former unconditional re-parenting of
     already-correct drawer groups continuously restarted mobile entry animations
     and could cancel touch targets while the drawer was open. */
  function setTextIfChanged(node,value){
    if(node && node.textContent!==value) node.textContent=value;
  }

  function placeAfterIfNeeded(node,anchor,parent){
    if(!node || !anchor || anchor.parentNode!==parent) return;
    if(node.parentNode===parent && anchor.nextElementSibling===node) return;
    anchor.insertAdjacentElement('afterend',node);
  }

  function ensureMobile(){
    document.querySelectorAll('.mobile-menu-body').forEach(body=>{
      if(!publicScreen()){
        body.querySelectorAll('[data-ecosystem-mobile-group]').forEach(x=>x.remove());
        return;
      }
      const first=groupByLabel(body,/^(Навигация|Navigation|P-120)$/i);
      const sections=groupByLabel(body,/^(Разделы|Sections|Основное|Core)$/i);
      setTextIfChanged(first?.querySelector('.eyebrow'),'P-120');
      setTextIfChanged(sections?.querySelector('.eyebrow'),copy.core);

      let story=body.querySelector('[data-ecosystem-mobile-group="story"]');
      if(!story) story=makeMobileGroup('story',copy.story,[['why',copy.why,copy.whyNote],['creator',copy.creator,copy.creatorNote]]);
      let next=body.querySelector('[data-ecosystem-mobile-group="next"]');
      if(!next) next=makeMobileGroup('next',copy.next,[['deeper',copy.deeper,copy.deeperNote],['together',copy.together,copy.togetherNote]]);

      const chapter=body.querySelector('[data-p120-chapter-mobile]');
      const language=body.querySelector('.p120-language-mobile-group');
      const theme=groupByLabel(body,/^(Тема оформления|Theme)$/i);
      const anchor=sections || first || body.querySelector('.mobile-menu-progress');

      if(anchor?.parentNode===body){
        let cursor=anchor;
        for(const node of [story,next,chapter,language,theme]){
          if(!node) continue;
          placeAfterIfNeeded(node,cursor,body);
          cursor=node;
        }
      } else {
        for(const node of [story,next,chapter,language,theme]){
          if(node && node.parentNode!==body) body.appendChild(node);
        }
      }
    });
  }

  /* Some English public components created before the dedicated EN Story routes
     still carry ../why-p120/. Keep those clicks inside /en/ without touching the
     large generated English index.html. */
  function interceptLegacyEnglishStoryLinks(event){
    if(!isEn) return;
    const a=event.target.closest?.('a[href]');
    if(!a) return;
    const raw=a.getAttribute('href')||'';
    if(raw==='../why-p120/'){
      event.preventDefault();
      window.location.assign(new URL('why-p120/',document.baseURI).href);
    } else if(raw==='../creator/'){
      event.preventDefault();
      window.location.assign(new URL('creator/',document.baseURI).href);
    }
  }

  function run(){
    timer=0;
    ensureDesktop();
    ensureMobile();
    document.documentElement.classList.toggle('nav-architecture-v2-ready',publicScreen());
  }
  function schedule(){if(timer)clearTimeout(timer);timer=setTimeout(run,70);}
  function start(){
    const root=document.getElementById('app')||document.body;
    new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
    document.addEventListener('click',e=>{if(!e.target.closest('.ecosystem-nav-v2'))closeDesktop();});
    document.addEventListener('click',interceptLegacyEnglishStoryLinks,true);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDesktop();});
    run();
    window.P120_NAV_V2_ROUTES=routes;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();


/* === depth-statement-v1.2.js === */
/* P-120 Web Editorial — final depth statement hook v1.3
   Splits the two closing statements into explicit staircase lines.
   Public editorial presentation only. */
(() => {
  'use strict';

  const maps = new Map([
    ['Не для того, чтобы поместить себя в коробку.', ['Не для того,','чтобы поместить себя','в коробку.']],
    ['А чтобы увидеть себя объёмнее.', ['А чтобы','увидеть себя','объёмнее.']],
    ['Not to put yourself in a box.', ['Not to','put yourself','in a box.']],
    ['But to see yourself in greater depth.', ['But to','see yourself','in greater depth.']]
  ]);
  const leadTexts = new Set(['Не для того, чтобы поместить себя в коробку.','Not to put yourself in a box.']);
  const depthTexts = new Set(['А чтобы увидеть себя объёмнее.','But to see yourself in greater depth.']);
  let timer=0;

  function normalized(el){return (el.textContent||'').replace(/\s+/g,' ').trim()}
  function candidate(texts){
    const root=document.querySelector('.editorial-home')||document.getElementById('app')||document.body;
    return [...root.querySelectorAll('p,h1,h2,h3,h4,div,span,strong')].find(el=>{
      if(el.dataset.p120Staircase==='true') return false;
      if(el.children.length) return false;
      return texts.has(normalized(el));
    });
  }
  function frameFor(depth,lead){
    if(!depth) return null;
    let node=depth.parentElement;
    for(let i=0;i<6&&node;i++,node=node.parentElement){
      const t=normalized(node);
      if((lead&&node.contains(lead))||/поместить себя в коробку|put yourself in a box/i.test(t)) return node;
    }
    return depth.parentElement;
  }
  function staircase(el){
    if(!el||el.dataset.p120Staircase==='true') return;
    const full=normalized(el);
    const lines=maps.get(full);
    if(!lines) return;
    if(/\/en\/(?:index\.html)?$/i.test(location.pathname)&&/[А-Яа-яЁё]/.test(full)) return;
    el.dataset.p120Staircase='true';
    el.textContent='';
    const wrap=document.createElement('span');
    wrap.className='p120-stair-lines';
    lines.forEach((line,i)=>{
      const s=document.createElement('span');
      s.className='p120-stair-line';
      s.style.setProperty('--step',String(i));
      s.textContent=line;
      wrap.appendChild(s);
    });
    el.appendChild(wrap);
  }
  function run(){
    timer=0;
    const depth=candidate(depthTexts);
    const lead=candidate(leadTexts);
    if(depth){depth.classList.add('p120-depth-statement');staircase(depth)}
    if(lead){lead.classList.add('p120-depth-lead');staircase(lead)}
    const styledDepth=document.querySelector('.p120-depth-statement');
    const styledLead=document.querySelector('.p120-depth-lead');
    frameFor(styledDepth,styledLead)?.classList.add('p120-depth-frame');
  }
  function schedule(delay=70){
    if(timer) clearTimeout(timer);
    timer=window.setTimeout(run,delay);
  }
  function start(){
    const watch=document.getElementById('app')||document.body;
    new MutationObserver(()=>schedule()).observe(watch,{childList:true,subtree:true,characterData:true});
    run();
    schedule(220);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();

