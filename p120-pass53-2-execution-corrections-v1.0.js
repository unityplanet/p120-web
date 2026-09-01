/* P-120 WEB-EXPLORE PASS 5.3.2 — main execution corrections
   Presentation-only adapter for the existing main-page controls.
   No questionnaire, scoring, session schema, persistence, report or scientific changes. */
(() => {
  'use strict';

  const scriptUrl=document.currentScript?.src||document.baseURI;
  const scriptPath=new URL(scriptUrl,document.baseURI).pathname;
  const rootPath=scriptPath.replace(/[^/]*$/,'');
  const pagePath=location.pathname.replace(/index\.html$/i,'');
  const isMain=pagePath===rootPath||pagePath===`${rootPath}en/`;
  if(!isMain || window.P120_PASS532?.ready) return;

  const html=document.documentElement;
  const isEn=(html.lang||'').toLowerCase().startsWith('en')||pagePath===`${rootPath}en/`;
  const THEME_KEY='p120_web_theme_v16';
  const labels=isEn
    ?{ivory:'Ivory',graphite:'Graphite',museum:'Museum'}
    :{ivory:'Светлая',graphite:'Графит',museum:'Музейная'};
  const themes=Object.keys(labels);

  function ensureCss(){
    if(!document.querySelector('link[data-p120-pass532]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=new URL('p120-pass53-2-execution-corrections-v1.0.css?v=532',scriptUrl).href;
      link.dataset.p120Pass532='5.3.2';
      document.head.appendChild(link);
    }
    /* The mega menu keeps its subtle opacity fade, but its geometry no longer scales
       during opening. This removes a transform-only bounding-box drift that the visual
       gate correctly treats as instability, without changing menu position or content. */
    if(!document.getElementById('p120-pass532-stable-floating-geometry')){
      const style=document.createElement('style');
      style.id='p120-pass532-stable-floating-geometry';
      style.textContent='.ecosystem-panel-v2{transition:opacity .16s ease,visibility .16s!important}';
      document.head.appendChild(style);
    }
  }

  function currentTheme(){
    const bodyTheme=document.body?.dataset?.theme;
    if(themes.includes(bodyTheme)) return bodyTheme;
    try{
      const stored=localStorage.getItem(THEME_KEY);
      if(themes.includes(stored)) return stored;
    }catch(_){}
    return 'ivory';
  }

  function closeOtherFloatingMenus(except=null){
    document.querySelectorAll('.header-theme-menu[open]').forEach(d=>{if(d!==except)d.removeAttribute('open')});
    document.querySelectorAll('.p120-brand53-mega[open]').forEach(d=>d.removeAttribute('open'));
    document.querySelectorAll('.ecosystem-nav-v2.is-open').forEach(node=>{
      node.classList.remove('is-open');
      const trigger=node.querySelector('.ecosystem-trigger');
      if(trigger?.getAttribute('aria-expanded')!=='false')trigger?.setAttribute('aria-expanded','false');
    });
  }

  function syncMenu(menu){
    if(!menu) return;
    if(!menu.classList.contains('p120-main-theme532'))menu.classList.add('p120-main-theme532');
    const summary=menu.querySelector(':scope>summary');
    if(!summary) return;
    let dot=summary.querySelector('.header-theme-dot');
    if(!dot){dot=document.createElement('span');dot.className='header-theme-dot';summary.prepend(dot)}
    let label=summary.querySelector('.p120-main-theme532-label');
    if(!label){
      [...summary.childNodes].forEach(node=>{if(node.nodeType===Node.TEXT_NODE)node.remove()});
      label=document.createElement('span');
      label.className='p120-main-theme532-label';
      dot.insertAdjacentElement('afterend',label);
    }
    const theme=currentTheme();
    const nextLabel=labels[theme];
    if(label.textContent!==nextLabel)label.textContent=nextLabel;
    const ariaLabel=isEn?`Theme: ${nextLabel}`:`Тема: ${nextLabel}`;
    if(summary.getAttribute('aria-label')!==ariaLabel)summary.setAttribute('aria-label',ariaLabel);
    menu.querySelectorAll('[data-set-theme]').forEach(btn=>{
      const active=btn.dataset.setTheme===theme;
      if(btn.classList.contains('active')!==active)btn.classList.toggle('active',active);
      const pressed=String(active);
      if(btn.getAttribute('aria-pressed')!==pressed)btn.setAttribute('aria-pressed',pressed);
    });
    if(!menu.dataset.p120Pass532Bound){
      menu.dataset.p120Pass532Bound='true';
      menu.addEventListener('toggle',()=>{
        if(menu.open){
          closeOtherFloatingMenus(menu);
          html.classList.add('p120-main-theme-menu-open');
        }else html.classList.remove('p120-main-theme-menu-open');
      });
      menu.addEventListener('click',event=>{
        const btn=event.target.closest?.('[data-set-theme]');
        if(!btn) return;
        window.setTimeout(()=>{syncAll();menu.removeAttribute('open')},0);
      },true);
    }
  }

  let syncQueued=false;
  function syncAll(){
    syncQueued=false;
    document.querySelectorAll('.header-theme-menu').forEach(syncMenu);
    if(html.dataset.p120Pass532!=='ready')html.dataset.p120Pass532='ready';
  }
  function scheduleSync(){
    if(syncQueued)return;
    syncQueued=true;
    requestAnimationFrame(syncAll);
  }

  function start(){
    syncAll();
    const root=document.getElementById('app')||document.body;
    if(root)new MutationObserver(scheduleSync).observe(root,{childList:true,subtree:true});
    if(document.body)new MutationObserver(scheduleSync).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
    window.addEventListener('storage',event=>{if(event.key===THEME_KEY)scheduleSync()});
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'){
        document.querySelectorAll('.header-theme-menu[open]').forEach(d=>d.removeAttribute('open'));
        html.classList.remove('p120-main-theme-menu-open');
      }
    });
    document.addEventListener('click',event=>{
      if(!event.target.closest?.('.header-theme-menu')) html.classList.remove('p120-main-theme-menu-open');
    },true);
  }

  ensureCss();
  window.P120_PASS532=Object.freeze({version:'5.3.2',ready:true,sync:syncAll});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
