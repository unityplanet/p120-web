/* P-120 WEB-EXPLORE PASS 2 — shared public page shell only. */
(() => {
  'use strict';
  const btn=document.querySelector('[data-explore-menu]');
  const drawer=document.querySelector('[data-explore-drawer]');
  function close(){if(!drawer||!btn)return;drawer.classList.remove('is-open');drawer.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false');document.body.style.overflow=''}
  function open(){if(!drawer||!btn)return;drawer.classList.add('is-open');drawer.setAttribute('aria-hidden','false');btn.setAttribute('aria-expanded','true');document.body.style.overflow='hidden'}
  btn?.addEventListener('click',()=>drawer?.classList.contains('is-open')?close():open());
  drawer?.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  window.matchMedia('(min-width:761px)').addEventListener?.('change',e=>{if(e.matches)close()});
})();
