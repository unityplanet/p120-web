/* P-120 Web Editorial — Extended Research Set Navigation Integration v1.0
   Presentation/navigation only. Does not touch measurement, scoring or questionnaire logic. */
(() => {
  'use strict';

  const SECTION_ID = 'extended-research-set';
  const TEASER_ID = 'extended-research-entry';
  const MOBILE_MAX = 680;
  let sectionTemplate = '';
  let scheduled = false;

  const source = document.getElementById(SECTION_ID);
  if (source) {
    sectionTemplate = source.outerHTML;
    source.remove();
  }

  function makeSection(){
    if (!sectionTemplate) return null;
    const tpl = document.createElement('template');
    tpl.innerHTML = sectionTemplate.trim();
    const section = tpl.content.firstElementChild;
    if (!section) return null;
    section.dataset.placement = 'report-to-science';
    return section;
  }

  function makeTeaser(){
    const section = document.createElement('section');
    section.id = TEASER_ID;
    section.className = 'extended-entry-teaser';
    section.setAttribute('aria-labelledby','extended-entry-title');
    section.innerHTML = `
      <div>
        <span class="extended-entry-kicker">P-120 · OPTIONAL DEEP DIVE</span>
        <h2 id="extended-entry-title">А хотите ещё глубже?</h2>
      </div>
      <div class="extended-entry-copy">
        <p>P-120 уже даёт самостоятельный многослойный профиль. Extended Research Set позволяет исследовать отдельные стороны опыта глубже — не изменяя основной результат.</p>
        <div class="extended-entry-meta" aria-label="Будущие дополнительные исследовательские модули">
          <span>COM</span><span>MOT</span><span>SELF</span><span>LIFE</span><span>optional research</span>
        </div>
        <button type="button" class="extended-entry-button" data-open-extended>Посмотреть Extended Set</button>
      </div>`;
    return section;
  }

  function findScienceAnchor(home){
    if (!home) return null;
    const science = home.querySelector('#science-foundation') || home.querySelector('[data-section-id="science-foundation"]');
    if (!science) return null;
    let node = science.previousElementSibling;
    while (node) {
      if (node.matches?.('.act-marker') && /Акт\s*III/i.test(node.textContent || '')) return node;
      node = node.previousElementSibling;
    }
    return science;
  }

  function syncModuleDetails(root){
    if (!root) return;
    const mobile = window.matchMedia(`(max-width:${MOBILE_MAX}px)`).matches;
    root.querySelectorAll('.extended-module details').forEach(details => {
      if (mobile) {
        if (details.dataset.ersMobileState !== 'set') {
          details.open = false;
          details.dataset.ersMobileState = 'set';
        }
      } else {
        details.open = true;
        delete details.dataset.ersMobileState;
      }
    });
  }

  function integrateIntoHome(){
    const home = document.querySelector('.editorial-home');
    if (!home) return false;
    const anchor = findScienceAnchor(home);
    if (!anchor || !anchor.parentNode) return false;

    let teaser = home.querySelector(`#${TEASER_ID}`);
    if (!teaser) {
      teaser = makeTeaser();
      anchor.parentNode.insertBefore(teaser, anchor);
    }

    let section = home.querySelector(`#${SECTION_ID}`);
    if (!section) {
      section = makeSection();
      if (!section) return false;
      anchor.parentNode.insertBefore(section, anchor);
    }

    syncModuleDetails(section);
    bindExtendedControls(document);
    return true;
  }

  function closeDrawer(){
    try {
      if (typeof window.closeMobileMenu === 'function') window.closeMobileMenu();
      else document.body.classList.remove('mobile-menu-open');
    } catch (_) {
      document.body.classList.remove('mobile-menu-open');
    }
  }

  function waitForSectionAndScroll(attempt=0){
    const target = document.getElementById(SECTION_ID);
    if (target) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
      return;
    }
    if (attempt < 30) window.setTimeout(() => waitForSectionAndScroll(attempt+1), 45);
  }

  function openExtended(){
    closeDrawer();
    const home = document.querySelector('.editorial-home');
    if (home) {
      integrateIntoHome();
      waitForSectionAndScroll();
      return;
    }
    try {
      if (typeof window.goHome === 'function') window.goHome();
      else if (typeof window.navigate === 'function') window.navigate('home');
    } catch (_) {}
    window.setTimeout(() => {
      integrateIntoHome();
      waitForSectionAndScroll();
    },80);
  }

  function ensureDesktopNav(){
    document.querySelectorAll('.topnav').forEach(nav => {
      if (nav.querySelector('[data-extended-research-nav]')) return;
      const science = nav.querySelector('[data-science], .science-navlink');
      const report = nav.querySelector('[data-nav="showcase"]');
      if (!science && !report) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'navlink extended-navlink';
      btn.dataset.extendedResearchNav = 'true';
      btn.textContent = 'Ещё глубже';
      btn.addEventListener('click', openExtended);
      if (science?.parentNode === nav) nav.insertBefore(btn, science);
      else report?.insertAdjacentElement('afterend',btn);
    });
  }

  function ensureMobileDrawerEntry(){
    document.querySelectorAll('.mobile-menu-body').forEach(body => {
      if (body.querySelector('[data-mobile-jump-extended]')) return;

      const examples = body.querySelector('[data-mobile-jump-home="examples"]');
      const scienceLink = body.querySelector('[data-mobile-jump-science]');
      const scienceAction = body.querySelector('[data-science]');
      const homeAction = body.querySelector('[data-home]');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = examples ? 'mobile-menu-link extended-mobile-menu-link' : 'mobile-menu-action extended-mobile-menu-link';
      btn.dataset.mobileJumpExtended = 'true';
      btn.innerHTML = '<div><div>А хотите ещё глубже?</div><small>Extended Research Set · дополнительные модули</small></div>';
      btn.addEventListener('click', openExtended);

      if (examples?.parentNode) examples.insertAdjacentElement('afterend',btn);
      else if (scienceLink?.parentNode) scienceLink.parentNode.insertBefore(btn,scienceLink);
      else if (scienceAction?.parentNode) scienceAction.parentNode.insertBefore(btn,scienceAction);
      else if (homeAction?.parentNode) homeAction.insertAdjacentElement('afterend',btn);
      else body.prepend(btn);
    });
  }

  function bindExtendedControls(root){
    root.querySelectorAll('[data-open-extended]').forEach(btn => {
      if (btn.dataset.ersBound === 'true') return;
      btn.dataset.ersBound = 'true';
      btn.addEventListener('click',openExtended);
    });
  }

  function run(){
    scheduled = false;
    ensureDesktopNav();
    ensureMobileDrawerEntry();
    integrateIntoHome();
    bindExtendedControls(document);
  }

  function schedule(){
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(run);
  }

  const observer = new MutationObserver(schedule);
  const start = () => {
    observer.observe(document.body,{childList:true,subtree:true});
    run();
    const mq = window.matchMedia(`(max-width:${MOBILE_MAX}px)`);
    const onViewport = () => {
      const current = document.getElementById(SECTION_ID);
      syncModuleDetails(current);
    };
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change',onViewport);
    else if (typeof mq.addListener === 'function') mq.addListener(onViewport);
    document.documentElement.classList.add('ers-navigation-ready');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
