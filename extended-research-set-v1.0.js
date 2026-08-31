/* P-120 Extended Research Set v1.0 — presentation-only responsive interaction */
(() => {
  const init = () => {
    const root = document.getElementById('extended-research-set');
    if (!root) return;
    const modules = [...root.querySelectorAll('.extended-module details')];
    if (!modules.length) return;

    const mobile = window.matchMedia('(max-width: 680px)');
    const sync = () => {
      modules.forEach(details => {
        if (mobile.matches) {
          if (details.dataset.ersMobileState !== 'set') {
            details.open = false;
            details.dataset.ersMobileState = 'set';
          }
        } else {
          details.open = true;
          delete details.dataset.ersMobileState;
        }
      });
    };

    sync();
    if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', sync);
    else if (typeof mobile.addListener === 'function') mobile.addListener(sync);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
