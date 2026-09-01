/* P-120 Legal Runtime v1.0 — SANDBOX
   Rights-holder display label: DEC.
   Presentation/legal-access layer only. Does not alter measurement, scoring,
   questionnaire wording, report calculations, or scientific authorities. */
(() => {
  'use strict';

  const NOTICE_VERSION = 'P120-IP-SANDBOX-v1.0';
  const ACCEPTANCE_KEY = 'p120_legal_acceptance_v1';
  const RIGHTSHOLDER = 'DEC';
  const ENVIRONMENT = 'SANDBOX';
  const isEn = (document.documentElement.lang || '').toLowerCase().startsWith('en') ||
    /\/en(?:\/|$)/i.test(location.pathname);

  const copy = isEn ? {
    footer: '© 2026 DEC. All rights reserved. P-120 materials, including text, assessment items, original selection and arrangement of materials, visual and interface design, software code, report formats and methodological documentation, are protected by applicable intellectual property laws. Unauthorized reproduction, extraction, adaptation, redistribution or commercial use is prohibited except where expressly permitted by applicable law.',
    ip: 'Intellectual Property',
    terms: 'Terms of Use',
    privacy: 'Privacy',
    sandbox: 'SANDBOX LEGAL LAYER · DEC is the current test-environment rights-holder label.',
    modalKicker: 'P-120 · LEGAL ACCEPTANCE · SANDBOX',
    modalTitle: 'Before you begin',
    clickwrap: 'By starting P-120, you confirm that you have reviewed the Terms of Use, Intellectual Property Notice and Privacy Policy. Access to the assessment is provided for personal use. Systematic copying, automated bulk harvesting, publication or redistribution of the item bank, and obtaining or disclosing non-public scoring materials without DEC’s authorization are prohibited except where expressly permitted by applicable law.',
    accept: 'Accept & begin',
    cancel: 'Not now',
    close: 'Close',
    result: '© 2026 DEC · P-120 result and assessment materials are protected. Your lawfully provided result/report may be retained for personal use; other use remains subject to the Intellectual Property Notice and applicable law.',
    resultLink: 'Intellectual Property & Permitted Use'
  } : {
    footer: '© 2026 DEC. Все права защищены. Материалы P-120, включая тексты, формулировки заданий, оригинальный подбор и расположение материалов, графические и интерфейсные решения, программный код, отчётные формы и методическую документацию, охраняются применимым законодательством об интеллектуальной собственности. Несанкционированное воспроизведение, извлечение, адаптация, распространение и коммерческое использование запрещены, кроме случаев, прямо допускаемых применимым законодательством.',
    ip: 'Интеллектуальная собственность',
    terms: 'Условия использования',
    privacy: 'Конфиденциальность',
    sandbox: 'SANDBOX LEGAL LAYER · DEC — обозначение правообладателя в текущей тестовой среде.',
    modalKicker: 'P-120 · ПРАВОВОЕ СОГЛАСИЕ · SANDBOX',
    modalTitle: 'Перед началом',
    clickwrap: 'Начиная прохождение P-120, вы подтверждаете, что ознакомились с Условиями использования, Уведомлением об интеллектуальной собственности и Политикой конфиденциальности. Доступ к тесту предоставляется для личного прохождения. Систематическое копирование, автоматизированный массовый сбор, публикация или распространение банка заданий, а также получение или раскрытие непубличных scoring-материалов без разрешения DEC запрещены, кроме случаев, когда такие действия прямо допускаются применимым законодательством.',
    accept: 'Принимаю и начинаю',
    cancel: 'Не сейчас',
    close: 'Закрыть',
    result: '© 2026 DEC · Материалы результата и формы P-120 охраняются. Законно предоставленный результат/отчёт можно сохранить для личного использования; иное использование регулируется Уведомлением об интеллектуальной собственности и применимым законодательством.',
    resultLink: 'Интеллектуальная собственность и условия использования'
  };

  function projectBase(){
    const marker = '/p120-web/';
    const path = location.pathname;
    const i = path.indexOf(marker);
    return i >= 0 ? path.slice(0, i) + marker : '/';
  }

  const base = projectBase();
  const routes = isEn ? {
    ip: base + 'en/intellectual-property/',
    terms: base + 'en/terms/',
    privacy: base + 'en/privacy/'
  } : {
    ip: base + 'intellectual-property/',
    terms: base + 'terms/',
    privacy: base + 'privacy/'
  };

  function installCss(){
    if (document.querySelector('link[data-p120-legal-css]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = base + 'p120-legal-v1.0.css?v=legal10';
    link.dataset.p120LegalCss = 'v1.0';
    document.head.appendChild(link);
  }

  function readAcceptance(){
    try {
      const value = JSON.parse(localStorage.getItem(ACCEPTANCE_KEY) || 'null');
      if (!value || typeof value !== 'object') return null;
      return value.notice_version === NOTICE_VERSION && value.rightsholder === RIGHTSHOLDER ? value : null;
    } catch (_) {
      return null;
    }
  }

  function saveAcceptance(){
    const record = {
      schema: 'p120.legal-acceptance.v1.0',
      notice_version: NOTICE_VERSION,
      rightsholder: RIGHTSHOLDER,
      environment: ENVIRONMENT,
      acceptance_method: 'affirmative_clickwrap',
      accepted_at: new Date().toISOString(),
      locale: isEn ? 'en' : 'ru'
    };
    try { localStorage.setItem(ACCEPTANCE_KEY, JSON.stringify(record)); } catch (_) {}
    window.dispatchEvent(new CustomEvent('p120:legal-accepted', {detail: record}));
    return record;
  }

  function link(href, label){
    return `<a href="${href}" data-p120-legal-link>${label}</a>`;
  }

  function ensureFooter(){
    if (document.querySelector('[data-p120-legal-footer]')) return;
    const footer = document.createElement('footer');
    footer.className = 'p120-legal-footer' + (/\/why-p120\//i.test(location.pathname) ? ' p120-legal-footer--dark' : '');
    footer.dataset.p120LegalFooter = 'v1.0';
    footer.innerHTML = `
      <div class="p120-legal-footer__inner">
        <p class="p120-legal-footer__notice">${copy.footer}</p>
        <nav class="p120-legal-footer__links" aria-label="${isEn ? 'Legal information' : 'Правовая информация'}">
          ${link(routes.ip, copy.ip)}
          ${link(routes.terms, copy.terms)}
          ${link(routes.privacy, copy.privacy)}
        </nav>
        <p class="p120-legal-footer__sandbox">${copy.sandbox}</p>
      </div>`;
    document.body.appendChild(footer);
  }

  let modal = null;
  let pendingStartButton = null;

  function closeModal(){
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('p120-legal-modal-open');
    window.setTimeout(() => {
      if (modal && !modal.classList.contains('is-open')) {
        modal.remove();
        modal = null;
      }
    }, 180);
  }

  function ensureModal(){
    if (modal && document.body.contains(modal)) return modal;
    modal = document.createElement('div');
    modal.className = 'p120-legal-modal';
    modal.dataset.p120LegalModal = 'v1.0';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'p120-legal-modal-title');
    modal.innerHTML = `
      <div class="p120-legal-modal__backdrop" data-p120-legal-dismiss></div>
      <section class="p120-legal-modal__panel">
        <div class="p120-legal-modal__kicker">${copy.modalKicker}</div>
        <h2 id="p120-legal-modal-title">${copy.modalTitle}</h2>
        <p class="p120-legal-modal__copy">${copy.clickwrap}</p>
        <div class="p120-legal-modal__links">
          ${link(routes.terms, copy.terms)}
          ${link(routes.ip, copy.ip)}
          ${link(routes.privacy, copy.privacy)}
        </div>
        <div class="p120-legal-modal__actions">
          <button type="button" class="p120-legal-accept" data-p120-legal-accept>${copy.accept}</button>
          <button type="button" class="p120-legal-cancel" data-p120-legal-dismiss>${copy.cancel}</button>
        </div>
        <p class="p120-legal-modal__version">${NOTICE_VERSION} · © 2026 DEC</p>
      </section>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-p120-legal-dismiss]').forEach(node => node.addEventListener('click', closeModal));
    modal.querySelector('[data-p120-legal-accept]').addEventListener('click', () => {
      saveAcceptance();
      const button = pendingStartButton;
      pendingStartButton = null;
      document.documentElement.classList.remove('p120-legal-assessment-locked');
      closeModal();
      if (button && document.contains(button)) {
        window.setTimeout(() => button.click(), 0);
      }
    });
    return modal;
  }

  function openModal(startButton=null){
    pendingStartButton = startButton;
    const el = ensureModal();
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('p120-legal-modal-open');
    window.setTimeout(() => el.querySelector('[data-p120-legal-accept]')?.focus(), 0);
  }

  function assessmentVisible(){
    return !!document.querySelector('.question-card, .transition');
  }

  function guardAssessment(){
    if (!assessmentVisible()) {
      document.documentElement.classList.remove('p120-legal-assessment-locked');
      return;
    }
    if (readAcceptance()) {
      document.documentElement.classList.remove('p120-legal-assessment-locked');
      return;
    }
    document.documentElement.classList.add('p120-legal-assessment-locked');
    if (!modal?.classList.contains('is-open')) openModal(null);
  }

  function ensureResultNotice(){
    const results = document.querySelector('.luxury-results-hero');
    if (!results || document.querySelector('[data-p120-result-rights]')) return;
    const notice = document.createElement('aside');
    notice.className = 'p120-result-rights';
    notice.dataset.p120ResultRights = 'v1.0';
    notice.innerHTML = `<p>${copy.result}</p><a href="${routes.ip}">${copy.resultLink} →</a>`;
    results.insertAdjacentElement('afterend', notice);
  }

  function interceptStart(event){
    const button = event.target.closest?.('#start');
    if (!button || button.disabled || readAcceptance()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openModal(button);
  }

  function interceptAssessmentInteraction(event){
    if (readAcceptance() || !assessmentVisible()) return;
    if (event.target.closest?.('.p120-legal-modal')) return;
    if (event.target.closest?.('.question-card, .transition')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      guardAssessment();
    }
  }

  let timer = 0;
  function run(){
    timer = 0;
    ensureFooter();
    ensureResultNotice();
    guardAssessment();
  }
  function schedule(){
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(run, 60);
  }

  function start(){
    installCss();
    document.addEventListener('click', interceptStart, true);
    document.addEventListener('click', interceptAssessmentInteraction, true);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
    });
    const root = document.getElementById('app') || document.body;
    new MutationObserver(schedule).observe(root, {childList:true, subtree:true});
    run();
    window.P120Legal = Object.freeze({
      version: '1.0',
      noticeVersion: NOTICE_VERSION,
      rightsholder: RIGHTSHOLDER,
      environment: ENVIRONMENT,
      getAcceptance: readAcceptance,
      openAcceptance: () => openModal(null),
      routes: Object.freeze({...routes})
    });
    document.documentElement.dataset.p120Legal = 'v1.0';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
