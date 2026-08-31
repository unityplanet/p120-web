/* P-120 Web Editorial — RU/EN language switch v1.0 */
(() => {
  'use strict';
  const isEn = /(^|\/)en\/?(?:index\.html)?$/i.test(location.pathname) || /\/en\//i.test(location.pathname);
  const rootHref = isEn ? '../' : './';
  const enHref = isEn ? './' : 'en/';
  let scheduled=false;

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

  function run(){scheduled=false;desktopSwitch();mobileSwitch()}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(run)}
  const start=()=>{
    document.documentElement.lang=isEn?'en':'ru';
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
    run();
    launchRussianAssessment();
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
