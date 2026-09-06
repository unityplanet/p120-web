/* P-120 WEB-EXPLORE PASS 5.3 — Sitewide Brand Lockup, Bubble Navigation & Naming Canon
   Presentation/navigation/theme bridge only. No measurement, scoring, report,
   questionnaire, submission, Supabase, privacy, safety or scientific-authority mutations. */
(() => {
  'use strict';
  if (window.P120_BRAND_SYSTEM?.version === '5.3') return;

  const scriptUrl = document.currentScript?.src || document.baseURI;
  const rootUrl = new URL('./', scriptUrl);
  const html = document.documentElement;
  const isEn = (html.lang || '').toLowerCase().startsWith('en') || /\/en(?:\/|$)/i.test(location.pathname);
  const THEME_KEY = 'p120_web_theme_v16';
  const SESSION_KEY = isEn ? 'p120_runtime_session_en_v1' : 'p120_runtime_session_ru_v1';
  const THEMES = ['ivory','graphite','museum'];
  const copy = isEn ? {
    descriptor:'RESEARCH ARCHITECTURE',
    about:'About P-120', aboutNote:'System and architecture', why:'Why P-120?', unique:'What makes it different', shows:'What it shows', report:'Report', science:'Scientific Base', explore:'Explore',
    exploreTitle:'Explore P-120', map:'Project map', story:'Story of P-120', next:'Next',
    whyNote:'Origin of the name and the idea', creator:'From the Creator', creatorNote:'The personal context behind P-120',
    deeper:'Go deeper', deeperNote:'Extended Research Set · optional research', together:'Together?', togetherNote:'Dyadic research layer · relationship research',
    decisionResearch:'Decision research', decisionResearchNote:'Human-governed cognitive analysis research',
    contact:'Contact', contactNote:'Write to P-120',
    language:'Language', theme:'Theme', light:'Light', graphite:'Graphite', museum:'Museum',
    brand:'P-120 — Research Architecture'
  } : {
    descriptor:'ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА',
    about:'О P-120', aboutNote:'Система и её архитектура', why:'Почему P-120?', unique:'Уникальность', shows:'Что покажет', report:'Отчёт', science:'Научная база', explore:'Исследовать',
    exploreTitle:'Исследовать P-120', map:'Карта проекта', story:'История P-120', next:'Дальше',
    whyNote:'Происхождение названия и самой идеи', creator:'От создателя', creatorNote:'Личный контекст появления P-120',
    deeper:'Хотите глубже?', deeperNote:'Система углублённых исследований', together:'Мы вместе?', togetherNote:'Исследование пары',
    decisionResearch:'Исследование решений', decisionResearchNote:'Проект управляемого когнитивного анализа',
    contact:'Контакты', contactNote:'Связаться с P-120',
    language:'Язык', theme:'Тема', light:'Светлая', graphite:'Графит', museum:'Музейная',
    brand:'P-120 — Исследовательская архитектура'
  };

  function ensureCss(){
    if (!document.querySelector('link[data-p120-brand-system]')) {
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=new URL('p120-brand-system-v1.0.css?v=532',rootUrl).href;
      link.dataset.p120BrandSystem='5.3';
      document.head.appendChild(link);
    }
    if (!document.querySelector('link[data-p120-pass53-visual-corrections]')) {
      const correction=document.createElement('link');
      correction.rel='stylesheet';
      correction.href=new URL('p120-pass53-visual-corrections-v1.0.css?v=532',rootUrl).href;
      correction.dataset.p120Pass53VisualCorrections='5.3.2';
      document.head.appendChild(correction);
    }
  }

  // PASS 2.1: install the canonical styles as soon as the runtime executes,
  // not after DOMContentLoaded. Static governed routes already load the same files.
  ensureCss();

  function kind(){
    const p=location.pathname.toLowerCase();
    if(p.includes('/research/how-we-decide/')) return 'research/how-we-decide';
    for(const k of ['intellectual-property','privacy','terms','about','why-p120','creator','extended','together','science','contact']){
      if(p.includes(`/${k}/`)) return k;
    }
    return 'main';
  }
  const pageKind=kind();
  const isMain=pageKind==='main';

  // PATCH 2 / PASS 2 — load the read-only mobile resume bridge only on the
  // locale-matched public Main route. Respondent storage remains System-owned.
  const normalizeResumePath=(value)=>{
    const clean=String(value||'/').replace(/\/{2,}/g,'/');
    return clean.endsWith('/')?clean:`${clean}/`;
  };
  const publicMainPath=new URL(isEn?'en/':'./',rootUrl).pathname;
  const isPublicMain=normalizeResumePath(location.pathname)===normalizeResumePath(publicMainPath);
  function ensureMobileSessionResume(){
    if(!isPublicMain||document.querySelector('script[data-p120-mobile-session-resume]')) return;
    const runtime=document.createElement('script');
    runtime.src=new URL('mobile-session-resume-v1.0.js?v=1',rootUrl).href;
    runtime.async=false;
    runtime.dataset.p120MobileSessionResume='2.2';
    document.head.appendChild(runtime);
  }
  ensureMobileSessionResume();

  function localeRoot(en=isEn){return new URL(en?'en/':'./',rootUrl).href;}
  function routeFor(k,en=isEn){
    if(k==='main') return localeRoot(en);
    return new URL(`${en?'en/':''}${k}/`,rootUrl).href;
  }
  function counterpart(en){return routeFor(pageKind,en);}
  function homeAnchor(id){return `${localeRoot(isEn)}#${id}`;}
  function safeText(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function brandMarkup(){
    return `<span class="brand-mark" aria-hidden="true"><span class="brand-orbit"></span><span class="brand-node brand-node-a"></span><span class="brand-node brand-node-b"></span></span><span class="brand-lockup"><span class="brand">P-120</span><span class="brand-sub">${copy.descriptor}</span></span>`;
  }

  function hasCanonicalBrandMarkup(node){
    const mark=node.querySelector(':scope > .brand-mark');
    const lockup=node.querySelector(':scope > .brand-lockup');
    return !!(mark&&lockup&&mark.querySelector(':scope > .brand-orbit')&&mark.querySelector(':scope > .brand-node-a')&&mark.querySelector(':scope > .brand-node-b')&&lockup.querySelector(':scope > .brand')&&lockup.querySelector(':scope > .brand-sub'));
  }

  function patchBrand(){
    const nodes=document.querySelectorAll('.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand');
    nodes.forEach(node=>{
      if(node.dataset.p120CanonicalBrand==='5.3'){
        const descriptor=node.querySelector(':scope > .brand-lockup > .brand-sub');
        if(descriptor&&descriptor.textContent.trim()!==copy.descriptor) descriptor.textContent=copy.descriptor;
        if(node.tagName==='A') node.href=localeRoot(isEn);
        node.setAttribute('aria-label',isEn?'P-120 — home':'P-120 — на главную');
        return;
      }
      if(!hasCanonicalBrandMarkup(node)) node.innerHTML=brandMarkup();
      else {
        const descriptor=node.querySelector(':scope > .brand-lockup > .brand-sub');
        if(descriptor&&descriptor.textContent.trim()!==copy.descriptor) descriptor.textContent=copy.descriptor;
      }
      node.classList.add('p120-brand53-brand');
      node.dataset.p120CanonicalBrand='5.3';
      if(node.tagName==='A') node.href=localeRoot(isEn);
      node.setAttribute('aria-label',isEn?'P-120 — home':'P-120 — на главную');
    });
  }

  function megaMarkup(){
    const current=(k)=>pageKind===k?' aria-current="page"':'';
    return `<details class="p120-brand53-mega"><summary>${copy.explore}</summary><div class="p120-brand53-mega-panel" role="navigation" aria-label="${copy.exploreTitle}"><div class="p120-brand53-mega-head"><strong>${copy.exploreTitle}</strong><span>${copy.map}</span></div><div class="p120-brand53-mega-grid"><section class="p120-brand53-mega-column"><div class="p120-brand53-mega-label">${copy.story}</div><a class="p120-brand53-mega-card" href="${routeFor('why-p120')}"${current('why-p120')}><strong>${copy.why}</strong><small>${copy.whyNote}</small></a><a class="p120-brand53-mega-card" href="${routeFor('creator')}"${current('creator')}><strong>${copy.creator}</strong><small>${copy.creatorNote}</small></a></section><section class="p120-brand53-mega-column"><div class="p120-brand53-mega-label">${copy.next}</div><a class="p120-brand53-mega-card" href="${routeFor('extended')}"${current('extended')}><strong>${copy.deeper}</strong><small>${copy.deeperNote}</small></a><a class="p120-brand53-mega-card" href="${routeFor('together')}"${current('together')}><strong>${copy.together}</strong><small>${copy.togetherNote}</small></a><a class="p120-brand53-mega-card" href="${routeFor('research/how-we-decide')}"${current('research/how-we-decide')}><strong>${copy.decisionResearch}</strong><small>${copy.decisionResearchNote}</small></a></section></div></div></details>`;
  }

  function staticNavMarkup(){
    const aboutCurrent=pageKind==='about'?' aria-current="page"':'';
    const whyCurrent=pageKind==='why-p120'?' aria-current="page"':'';
    return `<a class="p120-brand53-navitem" href="${routeFor('about')}"${aboutCurrent}>${copy.about}</a><a class="p120-brand53-navitem" href="${routeFor('why-p120')}"${whyCurrent}>${copy.why}</a><a class="p120-brand53-navitem" href="${homeAnchor('why-p120')}">${copy.unique}</a><a class="p120-brand53-navitem" href="${homeAnchor('what-p120-shows')}">${copy.shows}</a><a class="p120-brand53-navitem" href="${homeAnchor('showcase')}">${copy.report}</a><a class="p120-brand53-navitem" href="${routeFor('science')}">${copy.science}</a>${megaMarkup()}`;
  }

  function directText(node){return [...node.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent||'').join('').trim();}
  function patchAboutRoutes(){
    const href=routeFor('about');
    document.querySelectorAll('a').forEach(link=>{
      if(directText(link)!==copy.about) return;
      link.href=href;
      if(pageKind==='about') link.setAttribute('aria-current','page');
      else if(link.getAttribute('aria-current')==='page') link.removeAttribute('aria-current');
    });
    if(!isPublicMain) return;
    document.querySelectorAll('button[data-nav="why-important"],button[data-p120-about-route]').forEach(btn=>{
      btn.removeAttribute('data-nav');
      btn.dataset.p120AboutRoute=href;
      btn.onclick=e=>{e.preventDefault();location.href=href;};
    });
    const menu=document.querySelector('.mobile-menu');
    const group=menu?.querySelector('.mobile-menu-body > .mobile-menu-group');
    if(!group) return;
    let action=group.querySelector('[data-p120-about-discovery]');
    if(!action){
      action=document.createElement('button');
      action.type='button';
      action.className='mobile-menu-action';
      action.dataset.p120AboutDiscovery='5.3';
      action.innerHTML='<div><div></div><small></small></div>';
      const home=group.querySelector('[data-home]');
      if(home) home.insertAdjacentElement('afterend',action); else group.prepend(action);
    }
    const title=action.querySelector(':scope > div > div');
    const note=action.querySelector(':scope > div > small');
    if(title&&title.textContent!==copy.about) title.textContent=copy.about;
    if(note&&note.textContent!==copy.aboutNote) note.textContent=copy.aboutNote;
    action.setAttribute('aria-label',`${copy.about} — ${copy.aboutNote}`);
    action.onclick=e=>{e.preventDefault();location.href=href;};
  }

  function patchNav(){
    if(isMain){
      document.querySelectorAll('.topnav').forEach(nav=>nav.classList.add('p120-brand53-nav'));
      patchAboutRoutes();
      return;
    }
    document.querySelectorAll('.explore-mainnav,.creator-nav,.wp-nav,.p120-brand53-nav').forEach(nav=>{
      if(nav.dataset.p120CanonicalNav==='5.3') return;
      nav.innerHTML=staticNavMarkup();
      nav.classList.add('p120-brand53-nav');
      nav.dataset.p120CanonicalNav='5.3';
    });
    patchAboutRoutes();
  }

  function themeLabel(t){return t==='ivory'?copy.light:t==='graphite'?copy.graphite:copy.museum;}
  function loadTheme(){
    try{const t=localStorage.getItem(THEME_KEY);return THEMES.includes(t)?t:'ivory';}catch(_){return 'ivory';}
  }
  let currentTheme=loadTheme();

  function applyTheme(next,{persist=true}={}){
    currentTheme=THEMES.includes(next)?next:'ivory';
    if(document.body) document.body.dataset.theme=currentTheme;
    html.style.colorScheme=currentTheme==='graphite'?'dark':'light';
    if(persist){try{localStorage.setItem(THEME_KEY,currentTheme);}catch(_){}}
    document.querySelectorAll('[data-p120-theme]').forEach(btn=>{
      const active=btn.dataset.p120Theme===currentTheme;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',String(active));
    });
    document.querySelectorAll('[data-p120-theme-label]').forEach(node=>node.textContent=themeLabel(currentTheme));
  }

  // PATCH 3 / PASS 2 — Main quick utilities reuse the canonical theme authority.
  // Main's theme setter is closure-local, so bridge through an already-bound
  // legacy data-set-theme control instead of creating a second theme engine.
  function applyUtilityTheme(next){
    if(!THEMES.includes(next)) return;
    if(isMain){
      const bridge=[...document.querySelectorAll('[data-set-theme]')].find(btn=>btn.dataset.setTheme===next);
      if(bridge){
        try{
          bridge.click();
          currentTheme=next;
          applyTheme(next,{persist:false});
          return;
        }catch(_){}
      }
    }
    applyTheme(next);
  }

  function toolsMarkup(){
    return `<div class="p120-brand53-tools" data-p120-brand53-tools><nav class="p120-brand53-language" aria-label="${copy.language}"><a href="${counterpart(false)}" lang="ru" ${!isEn?'aria-current="page"':''}>RU</a><a href="${counterpart(true)}" lang="en" ${isEn?'aria-current="page"':''}>EN</a></nav><details class="p120-brand53-theme"><summary aria-label="${copy.theme}"><span class="p120-brand53-theme-dot" aria-hidden="true"></span><span data-p120-theme-label>${themeLabel(currentTheme)}</span></summary><div class="p120-brand53-theme-popover">${THEMES.map(t=>`<button type="button" class="p120-brand53-theme-option" data-p120-theme="${t}" aria-pressed="false"><span class="p120-brand53-theme-swatch ${t}" aria-hidden="true"></span><span>${themeLabel(t)}</span></button>`).join('')}</div></details></div>`;
  }

  function findHeaderInner(){return document.querySelector('.topbar-inner,.explore-topbar__inner,.creator-topbar__inner,.wp-header-inner,.p120-brand53-header__inner');}
  function ensureTools(){
    const inner=findHeaderInner();
    if(!inner || inner.querySelector('[data-p120-brand53-tools]')) return;
    /* Science uses the same mature application header shell as Main and already
       carries locale/theme/mobile utilities inside .topbar-tools. Injecting a
       second canonical utility block creates a mobile second row, so preserve
       the existing Science utility authority instead of duplicating it. */
    if(pageKind==='science' && inner.querySelector('.topbar-tools')) return;
    const tpl=document.createElement('template'); tpl.innerHTML=toolsMarkup();
    const tools=tpl.content.firstElementChild;
    if(isMain){
      const mainTools=inner.querySelector('.topbar-tools');
      if(!mainTools) return;
      tools.classList.add('p120-brand53-tools--main-quick');
      mainTools.prepend(tools);
    } else {
      const anchor=inner.querySelector('.explore-menu-btn,.creator-tools,.wp-header-tools');
      if(anchor?.classList.contains('wp-header-tools')) anchor.prepend(tools);
      else if(anchor){
        if(anchor.classList.contains('creator-tools')) anchor.classList.add('p120-brand53-legacy-tools');
        inner.insertBefore(tools,anchor);
      }
      else inner.appendChild(tools);
    }
    tools.querySelectorAll('[data-p120-theme]').forEach(btn=>btn.addEventListener('click',e=>{
      e.preventDefault(); applyUtilityTheme(btn.dataset.p120Theme); tools.querySelector('.p120-brand53-theme')?.removeAttribute('open');
    }));
    tools.querySelector('.p120-brand53-theme')?.addEventListener('toggle',e=>{
      if(e.currentTarget.open) closeMegaMenus();
    });
    applyTheme(currentTheme,{persist:false});
  }

  function ensureLegalHeader(){
    if(!document.body?.classList.contains('p120-legal-page') || document.querySelector('.p120-brand53-header')) return;
    const header=document.createElement('header');
    header.className='p120-brand53-header';
    header.innerHTML=`<div class="p120-brand53-header__inner"><a class="p120-brand53-brand" href="${localeRoot(isEn)}" aria-label="${isEn?'P-120 — home':'P-120 — на главную'}">${brandMarkup()}</a><nav class="p120-brand53-nav" aria-label="${isEn?'Main navigation':'Основная навигация'}">${staticNavMarkup()}</nav></div>`;
    document.body.insertBefore(header,document.body.firstChild);
  }

  function patchHeaderClasses(){
    document.querySelectorAll('.explore-topbar,.creator-topbar,.wp-header').forEach(h=>h.classList.add('p120-brand53-header'));
    document.querySelectorAll('.explore-topbar__inner,.creator-topbar__inner,.wp-header-inner').forEach(i=>i.classList.add('p120-brand53-header__inner'));
  }

  function patchLanguageRoutes(){
    const navs=document.querySelectorAll('.explore-lang-switch,.creator-language,.wp-lang-switch,.p120-language-switch,.p120-brand53-language');
    navs.forEach(nav=>{
      const ru=nav.querySelector('a[lang="ru"]'); const en=nav.querySelector('a[lang="en"]');
      if(ru) ru.href=counterpart(false); if(en) en.href=counterpart(true);
    });
  }

  function readSession(){
    try{
      const value=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
      return value&&typeof value==='object'?value:null;
    }catch(_){return null;}
  }

  function patchResumeRail(){
    if(!isMain) return;
    const rail=document.querySelector('.editorial-resume-rail');
    const instrument=window.P120_INSTRUMENT;
    const session=readSession();
    if(!rail || !instrument?.items?.length || !instrument?.modules?.length || !session) return;

    const rawIndex=Number(session.itemIndex);
    const itemIndex=Number.isFinite(rawIndex)?Math.max(0,Math.min(rawIndex,instrument.items.length-1)):0;
    const item=instrument.items[itemIndex];
    const module=instrument.modules.find(m=>m.id===item?.module);
    if(!item || !module) return;

    const moduleItems=instrument.items.filter(x=>x.module===module.id);
    const moduleItemIndex=Math.max(0,moduleItems.findIndex(x=>x.id===item.id));
    const moduleIndex=Math.max(0,instrument.modules.findIndex(m=>m.id===module.id));
    const answered=instrument.items.filter(x=>session.responses?.[x.id]!=null).length;
    const percent=Math.round(answered/instrument.items.length*100);
    const sessionId=String(session.participantId||'P120').trim();

    rail.classList.add('p120-resume53');
    let info=rail.querySelector('.p120-resume53__copy');
    if(!info){
      info=document.createElement('div');
      info.className='p120-resume53__copy';
      rail.prepend(info);
    }
    const nextInfo=isEn
      ? `<div class="p120-resume53__topline"><span class="p120-resume53__state">Saved research</span><span class="p120-resume53__progress">${percent}% complete</span></div><div class="p120-resume53__module">Segment ${String(moduleIndex+1).padStart(2,'0')} / ${String(instrument.modules.length).padStart(2,'0')} · ${safeText(module.name)} · ${safeText(module.title)}</div><div class="p120-resume53__meta"><span>Next · <strong>question ${moduleItemIndex+1} of ${moduleItems.length}</strong></span><span>Instrument · <strong>P-120</strong></span><span class="p120-resume53__session">Session · ${safeText(sessionId)}</span></div>`
      : `<div class="p120-resume53__topline"><span class="p120-resume53__state">Сохранённое исследование</span><span class="p120-resume53__progress">${percent}% пройдено</span></div><div class="p120-resume53__module">Сегмент ${String(moduleIndex+1).padStart(2,'0')} / ${String(instrument.modules.length).padStart(2,'0')} · ${safeText(module.name)} · ${safeText(module.title)}</div><div class="p120-resume53__meta"><span>Следующий · <strong>вопрос ${moduleItemIndex+1} из ${moduleItems.length}</strong></span><span>Инструмент · <strong>P-120</strong></span><span class="p120-resume53__session">Сессия · ${safeText(sessionId)}</span></div>`;
    if(info.innerHTML!==nextInfo) info.innerHTML=nextInfo;

    const resume=rail.querySelector('#editorialResume');
    const restart=rail.querySelector('#homeRestart');
    let actions=rail.querySelector('.p120-resume53__actions');
    if(!actions){actions=document.createElement('div');actions.className='p120-resume53__actions';rail.appendChild(actions);}
    if(resume){resume.textContent=isEn?`Resume research · question ${moduleItemIndex+1}`:`Продолжить исследование · вопрос ${moduleItemIndex+1}`;if(resume.parentElement!==actions)actions.appendChild(resume);}
    if(restart){restart.textContent=isEn?'New session':'Новая сессия';if(restart.parentElement!==actions)actions.appendChild(restart);}
    rail.querySelectorAll(':scope > span').forEach(old=>old.remove());
  }

  function ensureFooterContact(inner){
    const legal=inner.querySelector('.p120-site-footer__legal');
    if(!legal) return;
    let service=legal.querySelector('.p120-site-footer__service');
    if(!service){
      service=document.createElement('nav');
      service.className='p120-site-footer__service p120-legal-footer__links';
      service.style.marginTop='12px';
      legal.appendChild(service);
    }
    const serviceLabel=isEn?'Contact':'Связь';
    if(service.getAttribute('aria-label')!==serviceLabel) service.setAttribute('aria-label',serviceLabel);
    let link=service.querySelector('a[data-p120-contact-discovery]')||service.querySelector('a');
    if(!link){
      link=document.createElement('a');
      link.dataset.p120ContactDiscovery='5.3';
      service.appendChild(link);
    } else if(!link.dataset.p120ContactDiscovery){
      link.dataset.p120ContactDiscovery='5.3';
    }
    const href=routeFor('contact');
    if(link.href!==href) link.href=href;
    if(link.textContent!==copy.contact) link.textContent=copy.contact;
    if(pageKind==='contact'){
      if(link.getAttribute('aria-current')!=='page') link.setAttribute('aria-current','page');
    } else if(link.hasAttribute('aria-current')) link.removeAttribute('aria-current');
  }

  function patchMobileContact(){
    if(!isPublicMain) return;
    const menu=document.querySelector('.mobile-menu');
    const group=menu?.querySelector('.mobile-menu-body > .mobile-menu-group');
    if(!group) return;
    let action=group.querySelector('[data-p120-contact-discovery]');
    if(!action){
      action=document.createElement('button');
      action.type='button';
      action.className='mobile-menu-action';
      action.dataset.p120ContactDiscovery='5.3';
      action.innerHTML='<div><div></div><small></small></div>';
      const science=group.querySelector('[data-science]');
      if(science) science.insertAdjacentElement('afterend',action); else group.appendChild(action);
      action.addEventListener('click',()=>{location.href=routeFor('contact');});
    }
    const title=action.querySelector(':scope > div > div');
    const note=action.querySelector(':scope > div > small');
    if(title&&title.textContent!==copy.contact) title.textContent=copy.contact;
    if(note&&note.textContent!==copy.contactNote) note.textContent=copy.contactNote;
    const aria=`${copy.contact} — ${copy.contactNote}`;
    if(action.getAttribute('aria-label')!==aria) action.setAttribute('aria-label',aria);
  }

  function patchFooter(){
    document.querySelectorAll('.home-footer,.wp-footer,.explore-footer').forEach(node=>node.classList.add('p120-footer-superseded'));
    document.querySelectorAll('[data-p120-legal-footer]').forEach(footer=>{
      footer.classList.add('p120-site-footer');
      const inner=footer.querySelector('.p120-legal-footer__inner');
      if(!inner) return;
      inner.classList.add('p120-site-footer__inner');
      if(inner.dataset.p120UnifiedFooter==='5.3.1'){
        const brand=inner.querySelector('.p120-footer-brand');
        if(brand && brand.textContent!==copy.brand) brand.textContent=copy.brand;
        ensureFooterContact(inner);
        return;
      }
      const notice=inner.querySelector('.p120-legal-footer__notice');
      const legalLinks=inner.querySelector('.p120-legal-footer__links');
      const sandbox=inner.querySelector('.p120-legal-footer__sandbox');
      if(!notice || !legalLinks || !sandbox) return;

      const brand=document.createElement('section');
      brand.className='p120-site-footer__brand';
      brand.innerHTML=`<span class="p120-site-footer__mark" aria-hidden="true"></span><div class="p120-site-footer__brandcopy"><p class="p120-footer-brand">${copy.brand}</p><small>${isEn?'Research Candidate · 18+ · one architecture, multiple research chapters':'Research Candidate · 18+ · одна архитектура, несколько исследовательских глав'}</small></div>`;

      const chapters=document.createElement('nav');
      chapters.className='p120-site-footer__chapters';
      chapters.setAttribute('aria-label',isEn?'P-120 chapters':'Разделы P-120');
      chapters.innerHTML=`<a href="${routeFor('why-p120')}">${copy.why}</a><a href="${routeFor('creator')}">${copy.creator}</a><a href="${routeFor('extended')}">${copy.deeper}</a><a href="${routeFor('together')}">${copy.together}</a><a href="${routeFor('research/how-we-decide')}">${copy.decisionResearch}</a><a href="${routeFor('science')}">${copy.science}</a>`;

      const legal=document.createElement('section');
      legal.className='p120-site-footer__legal';
      legal.append(notice,legalLinks);

      inner.replaceChildren(brand,chapters,legal,sandbox);
      inner.dataset.p120UnifiedFooter='5.3.1';
      ensureFooterContact(inner);
    });
  }

  function patchDescriptor(){
    document.querySelectorAll('.brand-sub,.explore-brand small,.creator-lockup>span,.wp-brand-lockup small').forEach(n=>{
      if(n.textContent.trim().toUpperCase()!==copy.descriptor) n.textContent=copy.descriptor;
    });
  }

  function closeMegaMenus(except=null){
    document.querySelectorAll('.p120-brand53-mega[open]').forEach(d=>{if(d!==except)d.removeAttribute('open');});
    document.querySelectorAll('.ecosystem-nav-v2.is-open').forEach(n=>{
      n.classList.remove('is-open'); n.querySelector('.ecosystem-trigger')?.setAttribute('aria-expanded','false');
    });
  }
  function closeThemeMenus(except=null){document.querySelectorAll('.p120-brand53-theme[open]').forEach(d=>{if(d!==except)d.removeAttribute('open');});}

  function bindGlobalInteractions(){
    if(html.dataset.p120Brand53Bound==='true') return;
    html.dataset.p120Brand53Bound='true';
    document.addEventListener('toggle',e=>{
      const d=e.target;
      if(!(d instanceof HTMLDetailsElement) || !d.open) return;
      if(d.classList.contains('p120-brand53-mega')){closeMegaMenus(d);closeThemeMenus();}
      if(d.classList.contains('p120-brand53-theme')){closeThemeMenus(d);closeMegaMenus();}
    },true);
    document.addEventListener('click',e=>{
      if(!e.target.closest?.('.p120-brand53-mega,.ecosystem-nav-v2')) closeMegaMenus();
      if(!e.target.closest?.('.p120-brand53-theme')) closeThemeMenus();
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMegaMenus();closeThemeMenus();}});
    document.addEventListener('click',e=>{
      const btn=e.target.closest?.('[data-set-theme],[data-explore-theme],[data-p120-theme]');
      if(!btn) return;
      const next=btn.dataset.setTheme||btn.dataset.exploreTheme||btn.dataset.p120Theme;
      if(THEMES.includes(next)) window.setTimeout(()=>applyTheme(next),0);
    },true);
    window.addEventListener('storage',e=>{if(e.key===THEME_KEY&&THEMES.includes(e.newValue))applyTheme(e.newValue,{persist:false});});
  }

  let running=false;
  let reconcileCount=0;
  function reconcile(){
    if(running) return; running=true;
    try{
      reconcileCount++;
      ensureLegalHeader();
      patchHeaderClasses();
      patchBrand();
      patchNav();
      patchAboutRoutes();
      patchLanguageRoutes();
      ensureTools();
      patchDescriptor();
      patchResumeRail();
      patchMobileContact();
      patchFooter();
      if(document.body && document.body.dataset.theme!==currentTheme) applyTheme(currentTheme,{persist:false});
      html.classList.add('p120-brand53-ready');
      html.dataset.p120BrandSystem='5.3';
      html.dataset.p120PageKind=pageKind;
    } finally {running=false;}
  }

  const RECONCILE_SELECTOR='.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand,.topnav,.explore-mainnav,.creator-nav,.wp-nav,.explore-topbar,.creator-topbar,.wp-header,.p120-brand53-header,.editorial-resume-rail,.mobile-menu,[data-p120-legal-footer]';
  function touchesReconcileSurface(node){
    if(!(node instanceof Element)) return false;
    return node.matches(RECONCILE_SELECTOR)||!!node.querySelector(RECONCILE_SELECTOR);
  }
  function mutationNeedsReconcile(mutations){
    return mutations.some(m=>[...m.addedNodes,...m.removedNodes].some(touchesReconcileSurface));
  }
  let reconcileQueued=false;
  function queueReconcile(){
    if(reconcileQueued) return;
    reconcileQueued=true;
    requestAnimationFrame(()=>{reconcileQueued=false;reconcile();});
  }

  function start(){
    bindGlobalInteractions();
    applyTheme(currentTheme,{persist:false});
    reconcile();
    if(document.body) new MutationObserver(mutations=>{if(mutationNeedsReconcile(mutations))queueReconcile();}).observe(document.body,{childList:true,subtree:true});
    if(document.body) new MutationObserver(()=>{
      const t=document.body.dataset.theme;
      if(THEMES.includes(t)&&t!==currentTheme){currentTheme=t;try{localStorage.setItem(THEME_KEY,t);}catch(_){} reconcile();}
    }).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
  }

  window.P120_BRAND_SYSTEM=Object.freeze({version:'5.3',revision:'5.3.2',themeKey:THEME_KEY,descriptor:copy.descriptor,brand:copy.brand,root:rootUrl.href,reconcile,getReconcileCount:()=>reconcileCount});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();