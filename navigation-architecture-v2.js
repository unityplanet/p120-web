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
