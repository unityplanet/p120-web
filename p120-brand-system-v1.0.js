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
  const THEMES = ['ivory','graphite','museum'];
  const copy = isEn ? {
    descriptor:'RESEARCH ARCHITECTURE',
    about:'About P-120', why:'Why P-120?', unique:'What makes it different', shows:'What it shows', report:'Report', science:'Scientific Base', explore:'Explore',
    exploreTitle:'Explore P-120', map:'Project map', story:'Story of P-120', next:'Next',
    whyNote:'Origin of the name and the idea', creator:'From the Creator', creatorNote:'The personal context behind P-120',
    deeper:'Go deeper', deeperNote:'Extended Research Set · optional research', together:'Together?', togetherNote:'Dyadic research layer · relationship research',
    language:'Language', theme:'Theme', light:'Light', graphite:'Graphite', museum:'Museum',
    brand:'P-120 — Research Architecture'
  } : {
    descriptor:'ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА',
    about:'О P-120', why:'Почему P-120?', unique:'Уникальность', shows:'Что покажет', report:'Отчёт', science:'Научная база', explore:'Исследовать',
    exploreTitle:'Исследовать P-120', map:'Карта проекта', story:'История P-120', next:'Дальше',
    whyNote:'Происхождение названия и самой идеи', creator:'От создателя', creatorNote:'Личный контекст появления P-120',
    deeper:'Хотите глубже?', deeperNote:'Система углублённых исследований', together:'Мы вместе?', togetherNote:'Исследование пары',
    language:'Язык', theme:'Тема', light:'Светлая', graphite:'Графит', museum:'Музейная',
    brand:'P-120 — Исследовательская архитектура'
  };

  function ensureCss(){
    if (document.querySelector('link[data-p120-brand-system]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL('p120-brand-system-v1.0.css?v=53',rootUrl).href;
    link.dataset.p120BrandSystem='5.3';
    document.head.appendChild(link);
  }

  function kind(){
    const p=location.pathname.toLowerCase();
    for(const k of ['intellectual-property','privacy','terms','why-p120','creator','extended','together']){
      if(p.includes(`/${k}/`)) return k;
    }
    return 'main';
  }
  const pageKind=kind();
  const isMain=pageKind==='main';

  function localeRoot(en=isEn){return new URL(en?'en/':'./',rootUrl).href;}
  function routeFor(k,en=isEn){
    if(k==='main') return localeRoot(en);
    return new URL(`${en?'en/':''}${k}/`,rootUrl).href;
  }
  function counterpart(en){return routeFor(pageKind,en);}
  function homeAnchor(id){return `${localeRoot(isEn)}#${id}`;}

  function brandMarkup(){
    return `<span class="brand-mark" aria-hidden="true"><span class="brand-orbit"></span><span class="brand-node brand-node-a"></span><span class="brand-node brand-node-b"></span></span><span class="brand-lockup"><span class="brand">P-120</span><span class="brand-sub">${copy.descriptor}</span></span>`;
  }

  function patchBrand(){
    const nodes=document.querySelectorAll('.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand');
    nodes.forEach(node=>{
      if(node.dataset.p120CanonicalBrand==='5.3') return;
      node.innerHTML=brandMarkup();
      node.classList.add('p120-brand53-brand');
      node.dataset.p120CanonicalBrand='5.3';
      if(node.tagName==='A') node.href=localeRoot(isEn);
      node.setAttribute('aria-label',isEn?'P-120 — home':'P-120 — на главную');
    });
  }

  function megaMarkup(){
    const current=(k)=>pageKind===k?' aria-current="page"':'';
    return `<details class="p120-brand53-mega"><summary>${copy.explore}</summary><div class="p120-brand53-mega-panel" role="navigation" aria-label="${copy.exploreTitle}"><div class="p120-brand53-mega-head"><strong>${copy.exploreTitle}</strong><span>${copy.map}</span></div><div class="p120-brand53-mega-grid"><section class="p120-brand53-mega-column"><div class="p120-brand53-mega-label">${copy.story}</div><a class="p120-brand53-mega-card" href="${routeFor('why-p120')}"${current('why-p120')}><strong>${copy.why}</strong><small>${copy.whyNote}</small></a><a class="p120-brand53-mega-card" href="${routeFor('creator')}"${current('creator')}><strong>${copy.creator}</strong><small>${copy.creatorNote}</small></a></section><section class="p120-brand53-mega-column"><div class="p120-brand53-mega-label">${copy.next}</div><a class="p120-brand53-mega-card" href="${routeFor('extended')}"${current('extended')}><strong>${copy.deeper}</strong><small>${copy.deeperNote}</small></a><a class="p120-brand53-mega-card" href="${routeFor('together')}"${current('together')}><strong>${copy.together}</strong><small>${copy.togetherNote}</small></a></section></div></div></details>`;
  }

  function staticNavMarkup(){
    const whyCurrent=pageKind==='why-p120'?' aria-current="page"':'';
    return `<a class="p120-brand53-navitem" href="${homeAnchor('why-important')}">${copy.about}</a><a class="p120-brand53-navitem" href="${routeFor('why-p120')}"${whyCurrent}>${copy.why}</a><a class="p120-brand53-navitem" href="${homeAnchor('why-p120')}">${copy.unique}</a><a class="p120-brand53-navitem" href="${homeAnchor('what-p120-shows')}">${copy.shows}</a><a class="p120-brand53-navitem" href="${homeAnchor('showcase')}">${copy.report}</a><a class="p120-brand53-navitem" href="${homeAnchor('science-foundation')}">${copy.science}</a>${megaMarkup()}`;
  }

  function patchNav(){
    if(isMain){
      document.querySelectorAll('.topnav').forEach(nav=>nav.classList.add('p120-brand53-nav'));
      return;
    }
    document.querySelectorAll('.explore-mainnav,.creator-nav,.wp-nav,.p120-brand53-nav').forEach(nav=>{
      if(nav.dataset.p120CanonicalNav==='5.3') return;
      nav.innerHTML=staticNavMarkup();
      nav.classList.add('p120-brand53-nav');
      nav.dataset.p120CanonicalNav='5.3';
    });
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

  function toolsMarkup(){
    return `<div class="p120-brand53-tools" data-p120-brand53-tools><nav class="p120-brand53-language" aria-label="${copy.language}"><a href="${counterpart(false)}" lang="ru" ${!isEn?'aria-current="page"':''}>RU</a><a href="${counterpart(true)}" lang="en" ${isEn?'aria-current="page"':''}>EN</a></nav><details class="p120-brand53-theme"><summary aria-label="${copy.theme}"><span class="p120-brand53-theme-dot" aria-hidden="true"></span><span data-p120-theme-label>${themeLabel(currentTheme)}</span></summary><div class="p120-brand53-theme-popover">${THEMES.map(t=>`<button type="button" class="p120-brand53-theme-option" data-p120-theme="${t}" aria-pressed="false"><span class="p120-brand53-theme-swatch ${t}" aria-hidden="true"></span><span>${themeLabel(t)}</span></button>`).join('')}</div></details></div>`;
  }

  function findHeaderInner(){return document.querySelector('.explore-topbar__inner,.creator-topbar__inner,.wp-header-inner,.p120-brand53-header__inner');}
  function ensureTools(){
    if(isMain) return;
    const inner=findHeaderInner();
    if(!inner || inner.querySelector('[data-p120-brand53-tools]')) return;
    const tpl=document.createElement('template'); tpl.innerHTML=toolsMarkup();
    const tools=tpl.content.firstElementChild;
    const anchor=inner.querySelector('.explore-menu-btn,.creator-tools,.wp-header-tools');
    if(anchor?.classList.contains('wp-header-tools')) anchor.prepend(tools);
    else if(anchor) inner.insertBefore(tools,anchor);
    else inner.appendChild(tools);
    tools.querySelectorAll('[data-p120-theme]').forEach(btn=>btn.addEventListener('click',e=>{
      e.preventDefault(); applyTheme(btn.dataset.p120Theme); tools.querySelector('.p120-brand53-theme')?.removeAttribute('open');
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

  function patchFooter(){
    const exact=copy.brand;
    document.querySelectorAll('.explore-footer strong').forEach(n=>{if(n.textContent.trim()!==exact)n.textContent=exact;});
    document.querySelectorAll('.wp-footer-inner>strong').forEach(n=>{if(n.textContent.trim()!==exact)n.textContent=exact;});
    document.querySelectorAll('.home-footer>span:first-child').forEach(n=>{if(n.textContent.trim()!==exact)n.textContent=exact;});
    document.querySelectorAll('[data-p120-legal-footer] .p120-legal-footer__inner').forEach(inner=>{
      let brand=inner.querySelector('.p120-footer-brand');
      if(!brand){brand=document.createElement('p');brand.className='p120-footer-brand';inner.prepend(brand);}
      if(brand.textContent!==exact) brand.textContent=exact;
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
  function reconcile(){
    if(running) return; running=true;
    try{
      ensureLegalHeader();
      patchHeaderClasses();
      patchBrand();
      patchNav();
      patchLanguageRoutes();
      ensureTools();
      patchDescriptor();
      patchFooter();
      if(document.body && document.body.dataset.theme!==currentTheme) applyTheme(currentTheme,{persist:false});
      html.classList.add('p120-brand53-ready');
      html.dataset.p120BrandSystem='5.3';
    } finally {running=false;}
  }

  function start(){
    ensureCss();
    bindGlobalInteractions();
    applyTheme(currentTheme,{persist:false});
    reconcile();
    const root=document.getElementById('app')||document.body;
    if(root) new MutationObserver(()=>requestAnimationFrame(reconcile)).observe(root,{childList:true,subtree:true});
    if(document.body) new MutationObserver(()=>{
      const t=document.body.dataset.theme;
      if(THEMES.includes(t)&&t!==currentTheme){currentTheme=t;try{localStorage.setItem(THEME_KEY,t);}catch(_){} reconcile();}
    }).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
  }

  window.P120_BRAND_SYSTEM=Object.freeze({version:'5.3',themeKey:THEME_KEY,descriptor:copy.descriptor,brand:copy.brand,root:rootUrl.href,reconcile});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
