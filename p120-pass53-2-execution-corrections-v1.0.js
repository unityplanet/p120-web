/* P-120 WEB-EXPLORE PASS 5.3.2 — main execution corrections
   Presentation-only adapter for the existing main-page controls.
   No questionnaire, scoring, session schema, persistence, report or scientific changes. */
(() => {
  'use strict';

  const scriptUrl=document.currentScript?.src||document.baseURI;
  const path=location.pathname.replace(/index\.html$/i,'');
  const isMain=/^(?:\/|\/en\/)$/.test(path);
  if(!isMain || window.P120_PASS532?.ready) return;

  const html=document.documentElement;
  const isEn=(html.lang||'').toLowerCase().startsWith('en')||/\/en\//i.test(location.pathname);
  const THEME_KEY='p120_web_theme_v16';
  const labels=isEn
    ?{ivory:'Ivory',graphite:'Graphite',museum:'Museum'}
    :{ivory:'Светлая',graphite:'Графит',museum:'Музейная'};
  const themes=Object.keys(labels);

  function ensureCss(){
    if(document.querySelector('link[data-p120-pass532]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL('p120-pass53-2-execution-corrections-v1.0.css?v=532',scriptUrl).href;
    link.dataset.p120Pass532='5.3.2';
    document.head.appendChild(link);
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
      node.querySelector('.ecosystem-trigger')?.setAttribute('aria-expanded','false');
    });
  }

  function syncMenu(menu){
    if(!menu) return;
    menu.classList.add('p120-main-theme532');
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
    label.textContent=labels[theme];
    summary.setAttribute('aria-label',isEn?`Theme: ${labels[theme]}`:`Тема: ${labels[theme]}`);
    menu.querySelectorAll('[data-set-theme]').forEach(btn=>{
      const active=btn.dataset.setTheme===theme;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',String(active));
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

  function syncAll(){
    document.querySelectorAll('.header-theme-menu').forEach(syncMenu);
    html.dataset.p120Pass532='ready';
  }

  function start(){
    ensureCss();
    syncAll();
    const root=document.getElementById('app')||document.body;
    if(root)new MutationObserver(()=>requestAnimationFrame(syncAll)).observe(root,{childList:true,subtree:true});
    if(document.body)new MutationObserver(()=>requestAnimationFrame(syncAll)).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
    window.addEventListener('storage',event=>{if(event.key===THEME_KEY)syncAll()});
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'){
        document.querySelectorAll('.header-theme-menu[open]').forEach(d=>d.removeAttribute('open'));
        html.classList.remove('p120-main-theme-menu-open');
      }
    });
    document.addEventListener('click',event=>{
      if(!event.target.closest?.('.header-theme-menu')){
        html.classList.remove('p120-main-theme-menu-open');
      }
    },true);
  }

  window.P120_PASS532=Object.freeze({version:'5.3.2',ready:true,sync:syncAll});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
