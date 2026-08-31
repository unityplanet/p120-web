(() => {
  'use strict';
  const THEMES=['ivory','graphite','museum'];
  const LABELS={ivory:'Светлая',graphite:'Графит',museum:'Музейная'};
  const STORAGE_KEYS=['p120_web_theme_v17','p120_web_theme_v08'];
  function getTheme(){const q=new URLSearchParams(location.search).get('theme');if(THEMES.includes(q))return q;for(const key of STORAGE_KEYS){try{const v=localStorage.getItem(key);if(THEMES.includes(v))return v}catch(_){}}return 'ivory'}
  function applyTheme(value,persist=false){const next=THEMES.includes(value)?value:'ivory';document.body.dataset.theme=next;document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===next)));document.querySelectorAll('[data-theme-label]').forEach(el=>el.textContent=LABELS[next]);if(persist)for(const key of STORAGE_KEYS){try{localStorage.setItem(key,next)}catch(_){}}}
  applyTheme(getTheme());document.querySelectorAll('[data-theme-choice]').forEach(btn=>btn.addEventListener('click',()=>{applyTheme(btn.dataset.themeChoice,true);document.querySelectorAll('details[open]').forEach(d=>d.removeAttribute('open'))}));
  const sections=[...document.querySelectorAll('.wp-act')];if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});sections.forEach(s=>io.observe(s))}else sections.forEach(s=>s.classList.add('is-visible'));
  document.addEventListener('click',e=>document.querySelectorAll('.wp-theme[open]').forEach(d=>{if(!d.contains(e.target))d.removeAttribute('open')}));
})();
