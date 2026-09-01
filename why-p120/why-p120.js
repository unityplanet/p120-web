(() => {
  'use strict';

  /* Why P-120 mobile corrective pass v2.
     Layout-only: preserves the approved visual language and fixes two mobile
     cascade/reveal conflicts visible on the Brand Origin route.

     ACT 1 root cause:
     .wp-venn-six used left:50% + translateX(-50%), but the generic [data-reveal]
     animation later overwrote transform. On reveal it became transform:none,
     leaving the object positioned from the viewport midpoint and pushing it right.
     We center it with left/right + auto margins instead, so reveal transforms can
     no longer break horizontal geometry.

     ACT 2 root cause:
     the older base mobile stylesheet still declares a two-column .wp-semantic grid.
     The newer semantic-object layer did not explicitly reset grid-template-columns,
     so P.01–P.06 were laid out in pairs and their text overlapped. */
  if (!document.getElementById('wp-mobile-origin-corrective-v2')) {
    const style=document.createElement('style');
    style.id='wp-mobile-origin-corrective-v2';
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

  /* ACT 2 — one semantic rail on phones; no typography/design changes. */
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
}
`;
    document.head.appendChild(style);
  }

  document.body.removeAttribute('data-theme');
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
