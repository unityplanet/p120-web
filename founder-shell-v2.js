/* P-120 Founder Shell v2.1 — WEB-EXPLORE PASS 2 reconciliation.
   Shared navigation/theme/language shell for RU + EN Founder pages.
   RU Explore routes point to dedicated /extended/ and /together/ pages.
   EN parity remains deferred and preserves its previous states. */
(() => {
  'use strict';
  if(!/\/creator\/(?:index\.html)?$/i.test(location.pathname)) return;

  const isEn=/\/en\/creator\//i.test(location.pathname);
  const themeKey='p120_web_theme_v16';
  const themes=['ivory','graphite','museum'];
  const copy=isEn?{
    explore:'Explore',panel:'Explore P-120',map:'Project map',story:'Story',next:'Next',
    why:'Why P-120?',whyNote:'Origin of the name and the idea',creator:'From the Creator',creatorNote:'The personal context behind P-120',
    deeper:'Go deeper',deeperNote:'Extended Research Set · optional research',together:'Together?',togetherNote:'Dyadic research layer',coming:'Coming',
    theme:{ivory:'Ivory',graphite:'Graphite',museum:'Museum'}
  }:{
    explore:'Исследовать',panel:'Исследовать P-120',map:'Карта проекта',story:'История P-120',next:'Дальше',
    why:'Почему P-120?',whyNote:'Происхождение названия и самой идеи',creator:'От создателя',creatorNote:'Личный контекст появления P-120',
    deeper:'Хотите глубже?',deeperNote:'Extended Research System · дополнительные исследования',together:'Мы вместе?',togetherNote:'Dyadic Research Layer · исследование пары',coming:'Готовится',
    theme:{ivory:'Светлая',graphite:'Графит',museum:'Музейная'}
  };

  const paths=isEn?{
    why:'../why-p120/',creator:'./',deeper:'../#extended-research-set',home:'../',science:'../#science-foundation',self:'../../?start=1'
  }:{
    why:'../why-p120/',creator:'./',deeper:'../extended/',together:'../together/',home:'../',science:'../#science-foundation',self:'../?start=1'
  };

  function themeColor(t){return({ivory:'#f6f4ed',graphite:'#211f1c',museum:'#f7f4ec'})[t]||'#f7f4ec'}
  function themeMenu(){
    const active=document.body.dataset.theme||'museum';
    return `<details class="header-theme-menu"><summary><span class="header-theme-dot"></span><span data-theme-summary>${copy.theme[active]}</span></summary><div class="header-theme-popover">${themes.map(t=>`<button class="header-theme-option ${active===t?'active':''}" type="button" data-set-theme="${t}" aria-pressed="${active===t}"><span class="theme-swatch theme-swatch-${t}"></span><span>${copy.theme[t]}</span></button>`).join('')}</div></details>`;
  }
  function applyTheme(next,persist=true){
    const t=themes.includes(next)?next:'museum';document.body.dataset.theme=t;
    document.getElementById('theme-color-meta')?.setAttribute('content',themeColor(t));
    document.querySelectorAll('[data-set-theme]').forEach(b=>{const on=b.dataset.setTheme===t;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
    document.querySelectorAll('[data-theme-summary]').forEach(n=>n.textContent=copy.theme[t]);
    if(persist)try{localStorage.setItem(themeKey,t)}catch(_){}
  }
  function installTheme(){
    const slot=document.querySelector('[data-founder-theme-slot]');let initial='museum';try{initial=localStorage.getItem(themeKey)||'museum'}catch(_){}
    applyTheme(initial,false);if(slot)slot.innerHTML=themeMenu();applyTheme(initial,false);
    document.addEventListener('click',e=>{const b=e.target.closest('[data-set-theme]');if(!b)return;e.preventDefault();applyTheme(b.dataset.setTheme,true);b.closest('.header-theme-menu')?.removeAttribute('open');});
  }

  function item(key,title,note,reserved=false){
    return `<button type="button" class="ecosystem-item-v2" data-founder-ecosystem="${key}" ${reserved?'aria-disabled="true"':''}><span class="ecosystem-item-copy"><span class="ecosystem-item-title">${title}</span><span class="ecosystem-item-note">${note}</span></span>${reserved?`<span class="ecosystem-item-status">${copy.coming}</span>`:''}</button>`;
  }
  function mega(){
    const togetherReserved=isEn;
    return `<div class="ecosystem-nav-v2" data-founder-mega="v2"><button type="button" class="navlink ecosystem-trigger" aria-haspopup="true" aria-expanded="false">${copy.explore}</button><div class="ecosystem-panel-v2" role="navigation" aria-label="${copy.panel}"><div class="ecosystem-panel-head"><strong>${copy.panel}</strong><span>${copy.map}</span></div><div class="ecosystem-grid-v2"><section class="ecosystem-column-v2"><div class="ecosystem-column-label">${copy.story}</div>${item('why',copy.why,copy.whyNote)}${item('creator',copy.creator,copy.creatorNote)}</section><section class="ecosystem-column-v2"><div class="ecosystem-column-label">${copy.next}</div>${item('deeper',copy.deeper,copy.deeperNote)}${item('together',copy.together,copy.togetherNote,togetherReserved)}</section></div></div></div>`;
  }
  function closeMega(){document.querySelectorAll('[data-founder-mega].is-open').forEach(m=>{m.classList.remove('is-open');m.querySelector('.ecosystem-trigger')?.setAttribute('aria-expanded','false')})}
  function route(key){
    if(key==='creator'){closeMega();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return}
    if(key==='together'&&isEn)return;
    const href=paths[key];if(href)window.location.assign(href);
  }
  function installMega(){
    const slot=document.querySelector('[data-founder-explore-slot]');if(!slot)return;slot.innerHTML=mega();
    const wrap=slot.querySelector('[data-founder-mega]');const trigger=wrap?.querySelector('.ecosystem-trigger');
    trigger?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const open=!wrap.classList.contains('is-open');closeMega();if(open){wrap.classList.add('is-open');trigger.setAttribute('aria-expanded','true')}});
    wrap?.querySelectorAll('[data-founder-ecosystem]').forEach(b=>b.addEventListener('click',()=>{if(b.getAttribute('aria-disabled')==='true')return;route(b.dataset.founderEcosystem)}));
    document.addEventListener('click',e=>{if(!e.target.closest('[data-founder-mega]'))closeMega()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMega()});
  }

  function installFounderRoutes(){
    document.addEventListener('click',e=>{const b=e.target.closest('[data-founder-route]');if(!b)return;e.preventDefault();const r=b.dataset.founderRoute;if(r==='science')window.location.assign(paths.science);else if(r==='why')window.location.assign(paths.why);else if(r==='self')window.location.assign(paths.self);},true);
  }
  function start(){installTheme();installMega();installFounderRoutes();document.documentElement.dataset.founderShell='v2.1'}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
