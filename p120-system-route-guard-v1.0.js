/* P-120 System Route Guard v1.0
   Presentation/routing boundary only. No measurement, item, response, scoring, or interpretation logic. */
(() => {
  'use strict';

  const isSystemRoute = /(?:^|\/)system(?:\/|index\.html)?$/i.test(location.pathname);
  if (!isSystemRoute) return;

  let timer = 0;

  function localeHref(locale) {
    const url = new URL(location.href);
    let p = url.pathname;
    if (locale === 'en') {
      if (/\/en\/system(?:\/|\/index\.html)?$/i.test(p)) {
        p = p.replace(/\/index\.html$/i, '/');
      } else {
        p = p.replace(/\/system(?:\/|\/index\.html)?$/i, '/en/system/');
      }
    } else {
      p = p.replace(/\/en\/system(?:\/|\/index\.html)?$/i, '/system/');
      p = p.replace(/\/index\.html$/i, '/');
    }
    url.pathname = p;
    url.search = '';
    url.hash = '';
    return url.href;
  }

  function sync() {
    timer = 0;
    const current = /\/en\/system(?:\/|\/index\.html)?$/i.test(location.pathname) ? 'en' : 'ru';
    document.querySelectorAll('.p120-language-switch a[lang],.p120-language-mobile-options a[lang]').forEach(a => {
      const locale = a.getAttribute('lang') === 'en' ? 'en' : 'ru';
      const href = localeHref(locale);
      if (a.href !== href) a.href = href;
      if (locale === current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(sync, 0);
  }

  document.addEventListener('click', event => {
    const a = event.target.closest?.('.p120-language-switch a[lang],.p120-language-mobile-options a[lang]');
    if (!a) return;
    const locale = a.getAttribute('lang') === 'en' ? 'en' : 'ru';
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(localeHref(locale));
  }, true);

  const start = () => {
    sync();
    new MutationObserver(schedule).observe(document.body, {childList:true,subtree:true,attributes:true,attributeFilter:['href','aria-current']});
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();

/* Conceptual Entry PASS 2.5 — RU system orientation loader.
   Presentation-only; EN parity remains blocked until RU freeze. */
(() => {
  'use strict';
  if(!/^ru$/i.test(document.documentElement.lang||''))return;
  if(!/\/system\/(?:index\.html)?$/i.test(location.pathname))return;
  if(document.querySelector('script[data-p120-system-orientation-loader]'))return;
  const s=document.createElement('script');
  s.src='p120-system-orientation-ru-v1.0.js?v=cec25';
  s.dataset.p120SystemOrientationLoader='P2.5-RU-v1.0';
  document.head.appendChild(s);
})();
