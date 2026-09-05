/* P-120 / ABOUT P-120 / IMPLEMENTATION PASS 1 — page interaction shell only. */
(() => {
  'use strict';
  const menu=document.querySelector('[data-about-menu]');
  const drawer=document.querySelector('[data-about-drawer]');
  const isEn=(document.documentElement.lang||'').toLowerCase().startsWith('en');
  const THEME_KEY='p120_web_theme_v16';
  const THEMES=['ivory','graphite','museum'];
  const labels=isEn?{ivory:'Light',graphite:'Graphite',museum:'Museum'}:{ivory:'Светлая',graphite:'Графит',museum:'Музейная'};
  const getTheme=()=>{try{const v=localStorage.getItem(THEME_KEY);return THEMES.includes(v)?v:'museum'}catch(_){return 'museum'}};
  const applyTheme=(theme,persist=false)=>{
    if(!THEMES.includes(theme)) return;
    document.body.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme==='graphite'?'dark':'light';
    document.querySelectorAll('[data-p120-theme]').forEach(btn=>{const active=btn.dataset.p120Theme===theme;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active))});
    document.querySelectorAll('[data-p120-theme-label]').forEach(el=>el.textContent=labels[theme]);
    if(persist){try{localStorage.setItem(THEME_KEY,theme)}catch(_){}}
  };
  applyTheme(getTheme());
  document.querySelectorAll('[data-p120-theme]').forEach(btn=>btn.addEventListener('click',()=>applyTheme(btn.dataset.p120Theme,true)));
  const close=()=>{drawer?.classList.remove('is-open');drawer?.setAttribute('aria-hidden','true');menu?.setAttribute('aria-expanded','false');document.body.style.overflow=''};
  const open=()=>{drawer?.classList.add('is-open');drawer?.setAttribute('aria-hidden','false');menu?.setAttribute('aria-expanded','true');document.body.style.overflow='hidden'};
  menu?.addEventListener('click',()=>drawer?.classList.contains('is-open')?close():open());
  drawer?.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  window.matchMedia('(min-width:761px)').addEventListener?.('change',e=>{if(e.matches)close()});
  window.addEventListener('storage',e=>{if(e.key===THEME_KEY&&THEMES.includes(e.newValue))applyTheme(e.newValue)});
})();
