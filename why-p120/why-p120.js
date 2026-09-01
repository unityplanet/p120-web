(() => {
  'use strict';

  /* Why P-120 mobile corrective pass v3.
     Layout-only corrections preserve the approved visual language.

     ACT 1: the reveal transform used to override translateX(-50%) on the
     symbolic 9−3=6 object. Centering now uses left/right auto margins.

     ACT 2: the legacy mobile stylesheet still declared a two-column semantic
     grid. P.01–P.06 are explicitly restored to one vertical rail on phones.

     ACT 3: .wp-pi-caption had the same transform collision as ACT 1. The generic
     reveal state removed translateX(-50%), leaving the caption anchored at 50%
     and overflowing the right edge. Mobile centering now uses left/right auto
     margins, independent of reveal transforms. */
  if (!document.getElementById('wp-mobile-origin-corrective-v3')) {
    const style=document.createElement('style');
    style.id='wp-mobile-origin-corrective-v3';
    style.textContent=`
@media(max-width:720px){
  /* ACT 1 — keep the approved symbolic object, only repair its anchor. */
  .wp-venn-six{
    left:0!important;
    right:0!important;
    margin-left:auto!important;
    margin-right:auto!important;
    transform:none!important;
  }
  .wp-venn-six[data-reveal]{transform:translateY(20px)!important}
  .wp-act1.is-visible .wp-venn-six[data-reveal],
  .wp-venn-six[data-reveal].is-visible{transform:none!important}

  /* ACT 2 — one semantic rail on phones; typography/design stay intact. */
  .wp-act2 .wp-act-inner{display:block!important}
  .wp-semantic{
    display:grid!important;
    grid-template-columns:minmax(0,1fr)!important;
    grid-auto-flow:row!important;
    gap:0!important;
    width:100%!important;
    max-width:none!important;
    margin-top:30px!important;
    padding-left:34px!important;
  }
  .wp-semantic-item{
    grid-column:1/-1!important;
    width:100%!important;
    min-width:0!important;
    grid-template-columns:52px minmax(0,1fr)!important;
    gap:10px!important;
    margin:0!important;
  }
  .wp-semantic-copy{min-width:0!important}
  .wp-semantic-term{white-space:normal!important}
  .wp-semantic>.wp-act2-note{
    grid-column:1/-1!important;
    margin:18px 0 0 auto!important;
  }

  /* ACT 3 — center the caption without relying on translateX. */
  .wp-pi-caption{
    left:0!important;
    right:0!important;
    width:min(280px,calc(100% - 36px))!important;
    max-width:min(280px,calc(100% - 36px))!important;
    margin-left:auto!important;
    margin-right:auto!important;
    text-align:center!important;
    transform:none!important;
  }
  .wp-pi-caption[data-reveal]{transform:translateY(20px)!important}
  .wp-act3.is-visible .wp-pi-caption[data-reveal],
  .wp-pi-caption[data-reveal].is-visible{transform:none!important}
}
@media(max-width:420px){
  .wp-semantic{
    grid-template-columns:minmax(0,1fr)!important;
    padding-left:30px!important;
  }
  .wp-semantic-item{
    grid-template-columns:48px minmax(0,1fr)!important;
    gap:9px!important;
  }
  .wp-pi-caption{
    width:min(260px,calc(100% - 32px))!important;
    max-width:min(260px,calc(100% - 32px))!important;
  }
}

/* Route-level localization for generated/persistent microcopy. */
.wp-fixed-editorial-theme[data-wp-lang="ru"] .wp-header:after{content:"ПРОИСХОЖДЕНИЕ НАЗВАНИЯ"!important}
.wp-fixed-editorial-theme[data-wp-lang="en"] .wp-header:after{content:"BRAND ORIGIN"!important}
`;
    document.head.appendChild(style);
  }

  /* Keep RU and EN visually identical while preventing language leakage.
     Person / Profile / Pattern / Perception / Presence / Partnership remain in
     English by design: they are the six literal P-expansions; their explanatory
     lines are localized underneath. */
  function localizeRouteCopy(){
    const isEn=(document.documentElement.lang||'ru').toLowerCase().startsWith('en');
    document.body.dataset.wpLang=isEn?'en':'ru';

    const caption=document.querySelector('.wp-pi-caption');
    if(caption){
      caption.innerHTML=isEn
        ? 'A finite instrument<br>for something that is not finite.'
        : 'Конечный инструмент<br>для того, что не имеет конца.';
    }

    const brandSmall=document.querySelector('.wp-brand-lockup small');
    if(brandSmall) brandSmall.textContent=isEn?'research architecture':'исследовательская архитектура';

    const mobileHome=document.querySelector('.wp-mobile-menu');
    if(mobileHome) mobileHome.textContent=isEn?'Home':'На главную';

    const brandLine=document.querySelector('.wp-brand-line .tag');
    if(brandLine) brandLine.textContent=isEn
      ? 'Science. Structure. Depth.  The person in full complexity.'
      : 'Наука. Структура. Глубина.  Человек во всей сложности.';

    const footerTagline=document.querySelector('.wp-footer-inner > span');
    if(footerTagline) footerTagline.textContent=isEn
      ? 'Scientific credibility above mythology.'
      : 'Научная достоверность важнее мифологии.';

    const footerLink=document.querySelector('.wp-footer a');
    if(footerLink) footerLink.textContent=isEn?'Return to the site →':'Вернуться на сайт →';

    document.querySelectorAll('.wp-semantic-term').forEach(el=>{
      el.setAttribute('lang','en');
    });

    document.title=isEn
      ? 'Why P-120? — P-120 · Brand Origin'
      : 'Почему P-120? — P-120 · Происхождение названия';
  }

  document.body.removeAttribute('data-theme');
  localizeRouteCopy();

  const scenes=[...document.querySelectorAll('.wp-act,.wp-symbol-bridge')];
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if('IntersectionObserver' in window&&!reduce){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    scenes.forEach(scene=>io.observe(scene));
  }else{
    scenes.forEach(scene=>scene.classList.add('is-visible'));
  }
})();
