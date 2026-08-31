/* P-120 production public runtime v1.1 — generated, source order preserved */

/* === extended-research-navigation-v1.0.js === */
/* P-120 Web Editorial — Extended Research Set Navigation Integration v1.1
   Presentation/navigation only. Does not touch measurement, scoring or questionnaire logic. */
(() => {
  'use strict';

  const SECTION_ID = 'extended-research-set';
  const TEASER_ID = 'extended-research-entry';
  const MOBILE_MAX = 680;
  let sectionTemplate = '';
  let timer = 0;

  const source = document.getElementById(SECTION_ID);
  if (source) {
    sectionTemplate = source.outerHTML;
    source.remove();
  }

  function makeSection(){
    if (!sectionTemplate) return null;
    const tpl = document.createElement('template');
    tpl.innerHTML = sectionTemplate.trim();
    const section = tpl.content.firstElementChild;
    if (!section) return null;
    section.dataset.placement = 'report-to-science';
    return section;
  }

  function makeTeaser(){
    const section = document.createElement('section');
    section.id = TEASER_ID;
    section.className = 'extended-entry-teaser';
    section.setAttribute('aria-labelledby','extended-entry-title');
    section.innerHTML = `
      <div>
        <span class="extended-entry-kicker">P-120 · OPTIONAL DEEP DIVE</span>
        <h2 id="extended-entry-title">А хотите ещё глубже?</h2>
      </div>
      <div class="extended-entry-copy">
        <p>P-120 уже даёт самостоятельный многослойный профиль. Extended Research Set позволяет исследовать отдельные стороны опыта глубже — не изменяя основной результат.</p>
        <div class="extended-entry-meta" aria-label="Будущие дополнительные исследовательские модули">
          <span>COM</span><span>MOT</span><span>SELF</span><span>LIFE</span><span>optional research</span>
        </div>
        <button type="button" class="extended-entry-button" data-open-extended>Посмотреть Extended Set</button>
      </div>`;
    return section;
  }

  function findScienceAnchor(home){
    if (!home) return null;
    const science = home.querySelector('#science-foundation') || home.querySelector('[data-section-id="science-foundation"]');
    if (!science) return null;
    let node = science.previousElementSibling;
    while (node) {
      if (node.matches?.('.act-marker') && /Акт\s*III/i.test(node.textContent || '')) return node;
      node = node.previousElementSibling;
    }
    return science;
  }

  function syncModuleDetails(root){
    if (!root) return;
    const mobile = window.matchMedia(`(max-width:${MOBILE_MAX}px)`).matches;
    root.querySelectorAll('.extended-module details').forEach(details => {
      if (mobile) {
        if (details.dataset.ersMobileState !== 'set') {
          details.open = false;
          details.dataset.ersMobileState = 'set';
        }
      } else {
        details.open = true;
        delete details.dataset.ersMobileState;
      }
    });
  }

  function integrateIntoHome(){
    const home = document.querySelector('.editorial-home');
    if (!home) return false;
    const anchor = findScienceAnchor(home);
    if (!anchor || !anchor.parentNode) return false;

    let teaser = home.querySelector(`#${TEASER_ID}`);
    if (!teaser) {
      teaser = makeTeaser();
      anchor.parentNode.insertBefore(teaser, anchor);
    }

    let section = home.querySelector(`#${SECTION_ID}`);
    if (!section) {
      section = makeSection();
      if (!section) return false;
      anchor.parentNode.insertBefore(section, anchor);
    }

    syncModuleDetails(section);
    bindExtendedControls(document);
    return true;
  }

  function closeDrawer(){
    try {
      if (typeof window.closeMobileMenu === 'function') window.closeMobileMenu();
      else document.body.classList.remove('mobile-menu-open');
    } catch (_) {
      document.body.classList.remove('mobile-menu-open');
    }
  }

  function waitForSectionAndScroll(attempt=0){
    const target = document.getElementById(SECTION_ID);
    if (target) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
      return;
    }
    if (attempt < 30) window.setTimeout(() => waitForSectionAndScroll(attempt+1), 45);
  }

  function openExtended(){
    closeDrawer();
    const home = document.querySelector('.editorial-home');
    if (home) {
      integrateIntoHome();
      waitForSectionAndScroll();
      return;
    }
    try {
      if (typeof window.goHome === 'function') window.goHome();
      else if (typeof window.navigate === 'function') window.navigate('home');
    } catch (_) {}
    window.setTimeout(() => {
      integrateIntoHome();
      waitForSectionAndScroll();
    },80);
  }

  function ensureDesktopNav(){
    document.querySelectorAll('.topnav').forEach(nav => {
      if (nav.querySelector('[data-extended-research-nav]')) return;
      const science = nav.querySelector('[data-science], .science-navlink');
      const report = nav.querySelector('[data-nav="showcase"]');
      if (!science && !report) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'navlink extended-navlink';
      btn.dataset.extendedResearchNav = 'true';
      btn.textContent = 'Ещё глубже';
      btn.addEventListener('click', openExtended);
      if (science?.parentNode === nav) nav.insertBefore(btn, science);
      else report?.insertAdjacentElement('afterend',btn);
    });
  }

  function ensureMobileDrawerEntry(){
    document.querySelectorAll('.mobile-menu-body').forEach(body => {
      if (body.querySelector('[data-mobile-jump-extended]')) return;
      const examples = body.querySelector('[data-mobile-jump-home="examples"]');
      const scienceLink = body.querySelector('[data-mobile-jump-science]');
      const scienceAction = body.querySelector('[data-science]');
      const homeAction = body.querySelector('[data-home]');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = examples ? 'mobile-menu-link extended-mobile-menu-link' : 'mobile-menu-action extended-mobile-menu-link';
      btn.dataset.mobileJumpExtended = 'true';
      btn.innerHTML = '<div><div>А хотите ещё глубже?</div><small>Extended Research Set · дополнительные модули</small></div>';
      btn.addEventListener('click', openExtended);
      if (examples?.parentNode) examples.insertAdjacentElement('afterend',btn);
      else if (scienceLink?.parentNode) scienceLink.parentNode.insertBefore(btn,scienceLink);
      else if (scienceAction?.parentNode) scienceAction.parentNode.insertBefore(btn,scienceAction);
      else if (homeAction?.parentNode) homeAction.insertAdjacentElement('afterend',btn);
      else body.prepend(btn);
    });
  }

  function bindExtendedControls(root){
    root.querySelectorAll('[data-open-extended]').forEach(btn => {
      if (btn.dataset.ersBound === 'true') return;
      btn.dataset.ersBound = 'true';
      btn.addEventListener('click',openExtended);
    });
  }

  function run(){
    timer = 0;
    ensureDesktopNav();
    ensureMobileDrawerEntry();
    integrateIntoHome();
    bindExtendedControls(document);
  }

  function schedule(delay=70){
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(run,delay);
  }

  const start = () => {
    const watch = document.getElementById('app') || document.body;
    new MutationObserver(() => schedule()).observe(watch,{childList:true,subtree:true});
    run();
    const mq = window.matchMedia(`(max-width:${MOBILE_MAX}px)`);
    const onViewport = () => syncModuleDetails(document.getElementById(SECTION_ID));
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change',onViewport);
    else if (typeof mq.addListener === 'function') mq.addListener(onViewport);
    document.documentElement.classList.add('ers-navigation-ready');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();


/* === chapter-navigation-v1.0.js === */
/* P-120 Web Editorial — Chapter Navigation v1.1
   Presentation/navigation only. No measurement, scoring, questionnaire or report-engine changes. */
(() => {
  'use strict';

  const DESKTOP_MIN = 1121;
  const NAV_ID = 'p120-chapter-navigation';
  const MOBILE_GROUP_ATTR = 'data-p120-chapter-mobile';
  const chapters = [
    {id:'architecture',index:'01',label:'Архитектура',target:'why-important',note:'Акт I · внутренняя система'},
    {id:'two-systems',index:'02',label:'Две системы',target:'two-systems',note:'Акт II · встреча архитектур'},
    {id:'result',index:'03',label:'Результат',target:'showcase',note:'что покажет P-120'},
    {id:'extended',index:'04',label:'Ещё глубже',target:'extended-research-set',note:'optional Extended Research Set'},
    {id:'science',index:'05',label:'Наука',target:'science-foundation',note:'Акт III · научная опора'}
  ];

  let timer=0;
  let scrollScheduled = false;
  let activeId = chapters[0].id;

  function reducedMotion(){ return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches; }
  function closeDrawer(){
    try { if (typeof window.closeMobileMenu === 'function') window.closeMobileMenu(); else document.body.classList.remove('mobile-menu-open'); }
    catch (_) { document.body.classList.remove('mobile-menu-open'); }
  }
  function homeRoot(){ return document.querySelector('.editorial-home'); }
  function targetElement(chapter){ return document.getElementById(chapter.target); }
  function topOffset(){
    const topbar = document.querySelector('.topbar');
    const height = Math.max(58, Math.round(topbar?.getBoundingClientRect().height || 70));
    document.documentElement.style.setProperty('--chapter-nav-top', `${height}px`);
    return height;
  }
  function smoothScroll(target){
    if (!target) return;
    const extra = window.innerWidth >= DESKTOP_MIN ? 58 : 14;
    const y = window.scrollY + target.getBoundingClientRect().top - topOffset() - extra;
    window.scrollTo({top:Math.max(0,y),behavior:reducedMotion()?'auto':'smooth'});
  }
  function waitForTarget(chapter,attempt=0){
    const target = targetElement(chapter);
    if (target) { smoothScroll(target); window.setTimeout(updateFromScroll, reducedMotion()?0:260); return; }
    if (attempt < 45) window.setTimeout(() => waitForTarget(chapter,attempt+1),45);
  }
  function openChapter(chapter){
    closeDrawer();
    const home = homeRoot();
    if (home && targetElement(chapter)) { smoothScroll(targetElement(chapter)); return; }
    try { if (typeof window.goHome === 'function') window.goHome(); else if (typeof window.navigate === 'function') window.navigate('home'); } catch (_) {}
    window.setTimeout(() => waitForTarget(chapter),70);
  }
  function makeDesktopNav(){
    const nav = document.createElement('nav');
    nav.id = NAV_ID;
    nav.className = 'chapter-jump-nav';
    nav.setAttribute('aria-label','Навигация по главам P-120');
    nav.innerHTML = `<div class="chapter-jump-nav-inner"><div class="chapter-jump-prefix">По главам</div><div class="chapter-jump-track">${chapters.map(ch => `<button type="button" class="chapter-jump-button" data-chapter-jump="${ch.id}" aria-label="${ch.index}. ${ch.label}"><span class="chapter-jump-index">${ch.index}</span><span>${ch.label}</span></button>`).join('')}<span class="chapter-jump-progress" aria-hidden="true"><i></i></span></div></div>`;
    nav.querySelectorAll('[data-chapter-jump]').forEach(btn => { const chapter = chapters.find(ch => ch.id === btn.dataset.chapterJump); if (chapter) btn.addEventListener('click',() => openChapter(chapter)); });
    return nav;
  }
  function ensureDesktopNav(){
    const home = homeRoot();
    if (!home) { document.getElementById(NAV_ID)?.remove(); document.documentElement.classList.remove('chapter-nav-visible'); return false; }
    let nav = document.getElementById(NAV_ID);
    if (!nav) { nav = makeDesktopNav(); document.body.appendChild(nav); }
    topOffset(); return true;
  }
  function makeMobileGroup(){
    const group = document.createElement('div');
    group.className = 'mobile-menu-group chapter-mobile-group';
    group.setAttribute(MOBILE_GROUP_ATTR,'v1.0');
    group.innerHTML = `<span class="eyebrow">По главам</span>${chapters.map(ch => `<button type="button" class="mobile-menu-link chapter-mobile-link" data-chapter-mobile="${ch.id}"><div><div><span class="chapter-mobile-index">${ch.index}</span>${ch.label}</div><small>${ch.note}</small></div></button>`).join('')}`;
    group.querySelectorAll('[data-chapter-mobile]').forEach(btn => { const chapter = chapters.find(ch => ch.id === btn.dataset.chapterMobile); if (chapter) btn.addEventListener('click',() => openChapter(chapter)); });
    return group;
  }
  function ensureMobileGroup(){
    document.querySelectorAll('.mobile-menu-body').forEach(body => {
      if (body.querySelector(`[${MOBILE_GROUP_ATTR}]`)) return;
      const groups = [...body.querySelectorAll(':scope > .mobile-menu-group')];
      const sectionsGroup = groups.find(g => /Разделы/i.test(g.querySelector('.eyebrow')?.textContent || ''));
      const themeGroup = groups.find(g => /Тема оформления/i.test(g.querySelector('.eyebrow')?.textContent || ''));
      const group = makeMobileGroup();
      if (sectionsGroup?.parentNode === body) sectionsGroup.insertAdjacentElement('afterend',group);
      else if (themeGroup?.parentNode === body) body.insertBefore(group,themeGroup);
      else body.appendChild(group);
    });
  }
  function sectionPositions(){
    const offset = topOffset() + (window.innerWidth >= DESKTOP_MIN ? 76 : 20);
    return chapters.map(ch => { const el = targetElement(ch); if (!el) return null; return {chapter:ch,top:window.scrollY + el.getBoundingClientRect().top - offset}; }).filter(Boolean).sort((a,b) => a.top-b.top);
  }
  function setActive(id){
    activeId = id || chapters[0].id;
    const index = Math.max(0,chapters.findIndex(ch => ch.id === activeId));
    document.documentElement.style.setProperty('--chapter-progress',`${((index+1)/chapters.length)*100}%`);
    document.querySelectorAll('[data-chapter-jump]').forEach(btn => { const active = btn.dataset.chapterJump === activeId; btn.classList.toggle('is-active',active); if (active) btn.setAttribute('aria-current','location'); else btn.removeAttribute('aria-current'); });
    document.querySelectorAll('[data-chapter-mobile]').forEach(btn => { const active = btn.dataset.chapterMobile === activeId; btn.classList.toggle('is-active',active); if (active) btn.setAttribute('aria-current','location'); else btn.removeAttribute('aria-current'); });
  }
  function updateFromScroll(){
    scrollScheduled = false;
    const home = homeRoot();
    if (!home) { document.documentElement.classList.remove('chapter-nav-visible'); return; }
    const first = document.getElementById('why-important');
    const showThreshold = Math.max(260,Math.min(window.innerHeight*.58,(first?.offsetHeight || window.innerHeight)*.44));
    document.documentElement.classList.toggle('chapter-nav-visible',window.innerWidth >= DESKTOP_MIN && window.scrollY > showThreshold);
    const positions = sectionPositions(); if (!positions.length) return;
    const probe = window.scrollY + topOffset() + 120;
    let current = positions[0].chapter;
    for (const item of positions) { if (item.top <= probe) current = item.chapter; else break; }
    setActive(current.id);
  }
  function scheduleScroll(){ if (scrollScheduled) return; scrollScheduled = true; window.requestAnimationFrame(updateFromScroll); }
  function run(){ timer=0; ensureDesktopNav(); ensureMobileGroup(); updateFromScroll(); }
  function schedule(){ if(timer) clearTimeout(timer); timer=setTimeout(run,70); }
  function start(){
    const observer = new MutationObserver(schedule);
    observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
    window.addEventListener('scroll',scheduleScroll,{passive:true});
    window.addEventListener('resize',scheduleScroll,{passive:true});
    run(); document.documentElement.classList.add('chapter-navigation-ready');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();


/* === language-switch-v1.0.js === */
/* P-120 Web Editorial — RU/EN language switch v1.1 */
(() => {
  'use strict';
  const path = location.pathname;
  const isEn = /\/en\/(?:index\.html)?$/i.test(path);
  const rootPath = isEn
    ? path.replace(/\/en\/(?:index\.html)?$/i,'/')
    : path.replace(/index\.html$/i,'');
  const normalizedRoot = rootPath.endsWith('/') ? rootPath : rootPath + '/';
  const rootHref = normalizedRoot;
  const enHref = normalizedRoot + 'en/';
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
    if(isEn) return;
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

  const isEn = /\/en\/(?:index\.html)?$/i.test(location.pathname);
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

  const routes = {
    why:{status:'active',href:isEn?'../why-p120/':'why-p120/'},
    creator:{status:'reserved',route:'creator'},
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

  function ensureMobile(){
    document.querySelectorAll('.mobile-menu-body').forEach(body=>{
      if(!publicScreen()){
        body.querySelectorAll('[data-ecosystem-mobile-group]').forEach(x=>x.remove());
        return;
      }
      const first=groupByLabel(body,/^(Навигация|Navigation)$/i);
      const sections=groupByLabel(body,/^(Разделы|Sections)$/i);
      if(first?.querySelector('.eyebrow')) first.querySelector('.eyebrow').textContent='P-120';
      if(sections?.querySelector('.eyebrow')) sections.querySelector('.eyebrow').textContent=copy.core;

      let story=body.querySelector('[data-ecosystem-mobile-group="story"]');
      if(!story){story=makeMobileGroup('story',copy.story,[['why',copy.why,copy.whyNote],['creator',copy.creator,copy.creatorNote]]);}
      let next=body.querySelector('[data-ecosystem-mobile-group="next"]');
      if(!next){next=makeMobileGroup('next',copy.next,[['deeper',copy.deeper,copy.deeperNote],['together',copy.together,copy.togetherNote]]);}

      const chapter=body.querySelector('[data-p120-chapter-mobile]');
      const language=body.querySelector('.p120-language-mobile-group');
      const theme=groupByLabel(body,/^(Тема оформления|Theme)$/i);
      const anchor=sections || first || body.querySelector('.mobile-menu-progress');
      if(anchor?.parentNode===body){
        anchor.insertAdjacentElement('afterend',story);
        story.insertAdjacentElement('afterend',next);
      } else {
        body.append(story,next);
      }
      if(chapter?.parentNode===body) next.insertAdjacentElement('afterend',chapter);
      if(language?.parentNode===body){
        const after=chapter?.parentNode===body?chapter:next;
        after.insertAdjacentElement('afterend',language);
      }
      if(theme?.parentNode===body){
        const after=language?.parentNode===body?language:(chapter?.parentNode===body?chapter:next);
        after.insertAdjacentElement('afterend',theme);
      }
    });
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

