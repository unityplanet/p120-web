(() => {
  'use strict';

  /* Mobile corrective pass: the base mobile stylesheet still carries an older
     two-column semantic grid. The current P.01–P.06 object is a one-column
     timeline, so force that contract at phone widths after all page styles. */
  if (!document.getElementById('wp-mobile-origin-corrective-v1')) {
    const style=document.createElement('style');
    style.id='wp-mobile-origin-corrective-v1';
    style.textContent=`
@media(max-width:720px){
  .wp-act2 .wp-act-inner{display:block!important}
  .wp-semantic{
    grid-template-columns:minmax(0,1fr)!important;
    gap:0!important;
    width:100%!important;
    max-width:none!important;
    margin-top:24px!important;
    padding-left:34px!important;
  }
  .wp-semantic-item{
    grid-column:1/-1!important;
    width:100%!important;
    min-width:0!important;
    grid-template-columns:52px minmax(0,1fr)!important;
    gap:12px!important;
    padding:12px 0 13px!important;
  }
  .wp-semantic-copy{min-width:0!important}
  .wp-semantic-term{
    font-size:14px!important;
    line-height:1.18!important;
    letter-spacing:.10em!important;
    white-space:normal!important;
  }
  .wp-semantic-detail{font-size:11px!important}
  .wp-semantic>.wp-act2-note{
    grid-column:1/-1!important;
    margin:20px 0 0 auto!important;
  }
}
@media(max-width:420px){
  .wp-semantic{grid-template-columns:minmax(0,1fr)!important}
  .wp-semantic-item{
    grid-template-columns:48px minmax(0,1fr)!important;
    gap:10px!important;
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
