(() => {
  'use strict';
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
