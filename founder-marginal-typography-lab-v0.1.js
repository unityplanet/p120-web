/* P-120 Founder Marginal Typography Lab v0.1
   Experimental only. No effect without ?marginal=light or ?marginal=italic.
*/
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const mode = params.get('marginal');
  if (!['light','italic'].includes(mode)) return;

  document.documentElement.dataset.fndMarginal = mode;

  function mark(selector, index){
    const node = document.querySelector(selector);
    if (!node) return;
    node.classList.add('founder-story__marginal-note');
    node.dataset.noteIndex = index;
  }

  function apply(){
    mark('#fnd-02 .founder-story__reading > p:last-child', '01');
    mark('#fnd-06 .founder-story__reading > p:nth-child(2)', '02');
    mark('#fnd-09 .founder-story__boundary-copy > p:nth-child(3)', '03');

    if (document.querySelector('.founder-type-lab')) return;
    const lab = document.createElement('nav');
    lab.className = 'founder-type-lab';
    lab.setAttribute('aria-label','Founder typography preview');
    const base = new URL(location.href);
    base.searchParams.delete('marginal');
    const light = new URL(base.href); light.searchParams.set('marginal','light');
    const italic = new URL(base.href); italic.searchParams.set('marginal','italic');
    lab.innerHTML = `<span class="founder-type-lab__label">TYPE LAB</span><a href="${light.pathname}${light.search}${light.hash}" aria-current="${mode==='light'}">LIGHT</a><a href="${italic.pathname}${italic.search}${italic.hash}" aria-current="${mode==='italic'}">ITALIC</a>`;
    document.body.appendChild(lab);
  }

  if (document.querySelector('#fnd-02')) apply();
  else {
    const mo = new MutationObserver(() => {
      if (document.querySelector('#fnd-02')) { apply(); mo.disconnect(); }
    });
    mo.observe(document.documentElement,{childList:true,subtree:true});
  }
})();
