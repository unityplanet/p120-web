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
