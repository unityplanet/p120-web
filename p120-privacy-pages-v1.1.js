/* P-120 Global Privacy Page v1.1 — SANDBOX · CONTACT PROCESSING RECONCILIATION
   Governance scope: reconcile the global Privacy page with the factual Contact v1.1 pipeline.
   No production-jurisdiction claims are introduced by this sandbox notice. */
(() => {
  'use strict';

  const isEn = (document.documentElement.lang || '').toLowerCase().startsWith('en') || /\/en(?:\/|$)/i.test(location.pathname);
  const marker = '/p120-web/';
  const i = location.pathname.indexOf(marker);
  const base = i >= 0 ? location.pathname.slice(0, i) + marker : '/';
  const home = base + (isEn ? 'en/' : '');
  const routes = isEn ? {
    ip: base + 'en/intellectual-property/',
    terms: base + 'en/terms/',
    privacy: base + 'en/privacy/',
    contact: base + 'en/contact/'
  } : {
    ip: base + 'intellectual-property/',
    terms: base + 'terms/',
    privacy: base + 'privacy/',
    contact: base + 'contact/'
  };
  const counterpart = isEn ? base + 'privacy/' : base + 'en/privacy/';

  const data = {
    ru: {
      title: 'Конфиденциальность — Sandbox',
      kicker: 'P-120 · PRIVACY / SANDBOX',
      note: 'Эта страница описывает фактическую sandbox-архитектуру P-120, включая текущий канал Contact. Она не является финальной production Privacy Policy и не добавляет юрисдикционные или нормативные заявления, которые ещё не прошли отдельную legal review.',
      meta: 'Global Privacy Reconciliation v1.1 · Contact Notice P120-CONTACT-PRIVACY-v1.0 · 5 сентября 2026',
      sections: [
        ['Статус документа', 'Это sandbox privacy notice для текущей исследовательской и web-реализации P-120. Он фиксирует фактически используемые потоки данных на текущем этапе. До production-запуска остаётся отдельный gate на окончательную Privacy Policy, применимое право, роль оператора/контролёра, обязательные реквизиты и иные production disclosures.'],
        ['Разделение исследовательских и контактных данных', 'Исследовательский intake P-120 и форма Contact являются разными потоками. Contact предназначен только для общей корреспонденции и профессиональной связи; он не привязывается к Participant ID, ответам P-120, результатам assessment или персональному отчёту.'],
        ['Идентификатор участника', 'Текущая web-форма исследования использует псевдонимный Participant ID. Автоматический research intake не добавляет имя, e-mail или телефон в пакет ответов.'],
        ['Ответы и служебные данные исследования', 'В исследовательский пакет могут входить ответы на scored-items, версия формы, язык интерфейса, покрытие, выбранные режимы администрирования и временные отметки сессии. Текущая intake-реализация не включает browser telemetry в передаваемый исследовательский пакет.'],
        ['Локальное хранение', 'Состояние текущей сессии и служебные записи, включая ответы и запись о legal clickwrap, могут сохраняться локально в браузере, чтобы поддерживать продолжение сессии и фиксировать принятую версию notice.'],
        ['Исследовательское хранилище', 'После завершения scored-items текущая sandbox-конфигурация может передавать псевдонимный пакет ответов в настроенное приватное исследовательское хранилище. Browser-side access ограничен предусмотренным intake-путём; эта страница не утверждает, что текущая sandbox-конфигурация является финальной production privacy architecture.'],
        ['Contact: какие данные передаются', 'Форма Contact передаёт имя, если пользователь решил его указать, обязательный e-mail, тему сообщения, текст сообщения и язык интерфейса. Вместе с запросом передаются технические версии формы и privacy notice. Поля защиты от автоматической отправки и время начала заполнения используются сервером для технической проверки запроса и не включаются в сохранённую запись сообщения.'],
        ['Contact: цель обработки', 'Данные Contact используются для получения, обработки и ответа на обращение, а также для поддержания работоспособности и защиты контактного канала. Этот поток не используется для расчёта P-120 и не становится частью исследовательского профиля пользователя.'],
        ['Contact: хранение и срок', 'После серверной проверки имя (если указано), e-mail, тема, текст сообщения, locale и версии формы/privacy notice сохраняются в приватном contact-хранилище P-120. Для каждой записи устанавливается retention_until через 90 дней после получения; просроченные записи удаляются автоматическим ежедневным retention cleanup и также очищаются при последующих операциях хранения.'],
        ['Contact: rate limiting и технические маркеры', 'Для защиты от автоматизированной или чрезмерной отправки сервер кратковременно обрабатывает сетевой адрес соединения и e-mail для вычисления HMAC bucket-маркеров. Raw IP не включается в сохранённую запись Contact. Rate-limit buckets действуют в коротких окнах: 15 минут для краткого IP-лимита и до 24 часов для дневных IP/e-mail лимитов; просроченные маркеры удаляются. Browser telemetry в запись Contact не включается.'],
        ['Contact: граница содержания', 'Не отправляйте через Contact ответы или результаты P-120, Participant ID, медицинскую информацию, сведения об интимной жизни, пароли, платёжные данные или другие конфиденциальные материалы. Для общего обращения достаточно описать вопрос без персональных исследовательских данных.'],
        ['Production gate', 'До публичного коммерческого production-релиза должны быть отдельно утверждены финальная Privacy Policy, основания и сроки обработки/хранения для всех production flows, процесс реализации прав субъектов данных, сведения о поставщиках и передачах, payment/consumer data flows и иные обязательные элементы применимого права. Текущая reconciliation не закрывает этот production-level legal gate.']
      ]
    },
    en: {
      title: 'Privacy — Sandbox',
      kicker: 'P-120 · PRIVACY / SANDBOX',
      note: 'This page describes the factual P-120 sandbox architecture, including the current Contact channel. It is not the final production Privacy Policy and does not introduce jurisdiction-specific or statutory claims that have not yet passed separate legal review.',
      meta: 'Global Privacy Reconciliation v1.1 · Contact Notice P120-CONTACT-PRIVACY-v1.0 · 5 September 2026',
      sections: [
        ['Document status', 'This is a sandbox privacy notice for the current P-120 research and web implementation. It records the data flows actually used at this stage. A separate production gate remains open for the final Privacy Policy, applicable law, controller/operator roles, mandatory legal particulars and other production disclosures.'],
        ['Separation of research and contact data', 'The P-120 research intake and the Contact form are separate data flows. Contact is for general correspondence and professional communication only; it is not linked to a Participant ID, P-120 responses, assessment results or a personal report.'],
        ['Participant identifier', 'The current research web form uses a pseudonymous Participant ID. The automatic research intake does not add a name, e-mail address or phone number to the response package.'],
        ['Research responses and operational data', 'The research package may include scored-item responses, form version, interface locale, coverage, selected administration modes and session timestamps. The current intake implementation does not include browser telemetry in the transmitted research package.'],
        ['Local storage', 'Current-session state and operational records, including responses and the legal clickwrap record, may be stored locally in the browser to support session continuity and record the accepted notice version.'],
        ['Research storage', 'After completion of the scored items, the current sandbox configuration may transmit a pseudonymous response package to the configured private research store. Browser-side access is constrained to the configured intake path; this page does not claim that the sandbox configuration is the final production privacy architecture.'],
        ['Contact: data submitted', 'The Contact form transmits a name if the user chooses to provide one, a required e-mail address, message subject, message text and interface locale. Technical form and privacy-notice versions are transmitted with the request. Anti-bot fields and the form start time are used by the server to validate the request and are not included in the stored message record.'],
        ['Contact: processing purpose', 'Contact data is used to receive, process and respond to an enquiry and to maintain the operation and abuse protection of the contact channel. This data flow is not used to calculate P-120 and does not become part of the user’s research profile.'],
        ['Contact: storage and retention', 'After server-side validation, name (if provided), e-mail, subject, message text, locale and form/privacy-notice versions are stored in private P-120 contact storage. Each message receives a retention_until value 90 days after receipt; expired messages are removed by an automatic daily retention cleanup and are also cleared during subsequent storage operations.'],
        ['Contact: rate limiting and technical markers', 'To protect the channel against automated or excessive submission, the server briefly processes the connection network address and e-mail address to derive HMAC bucket markers. The raw IP address is not included in the stored Contact message record. Rate-limit buckets use short windows: 15 minutes for the short IP limit and up to 24 hours for daily IP/e-mail limits; expired markers are removed. Browser telemetry is not included in the Contact message record.'],
        ['Contact: content boundary', 'Do not send P-120 responses or results, Participant IDs, medical information, details about intimate life, passwords, payment information or other confidential material through Contact. A general description of the question is sufficient.'],
        ['Production gate', 'Before public commercial production release, the final Privacy Policy, processing and retention grounds for all production flows, data-subject rights workflow, provider and transfer disclosures, payment/consumer data flows and other mandatory elements of applicable law must be separately approved. This reconciliation does not close that production-level legal gate.']
      ]
    }
  };

  const d = data[isEn ? 'en' : 'ru'];
  document.title = d.title + ' — P-120';
  const root = document.querySelector('[data-p120-legal-page-root]') || document.body;
  const esc = s => String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));

  root.innerHTML = `<header class="p120-legal-page__topbar"><div class="p120-legal-page__topbar-inner"><a class="p120-legal-page__brand" href="${home}">P-120</a><span class="p120-legal-page__badge">LEGAL · SANDBOX · PRIVACY v1.1</span><nav class="p120-legal-page__lang" aria-label="Language"><a href="${counterpart}">${isEn?'RU':'EN'}</a></nav></div></header><main class="p120-legal-main"><section class="p120-legal-hero"><div><div class="p120-legal-kicker">${esc(d.kicker)}</div><h1>${esc(d.title)}</h1></div><div class="p120-legal-hero__meta">${esc(d.meta)}</div></section><aside class="p120-legal-sandbox-note">${esc(d.note)}</aside><div class="p120-legal-sections">${d.sections.map((s,n)=>`<section class="p120-legal-section"><div class="p120-legal-section__num">${String(n+1).padStart(2,'0')}</div><div><h2>${esc(s[0])}</h2><p>${esc(s[1])}</p></div></section>`).join('')}</div><nav class="p120-legal-related" aria-label="${isEn?'Related legal information':'Связанная правовая информация'}"><a href="${routes.ip}">${isEn?'Intellectual Property':'Интеллектуальная собственность'}</a><a href="${routes.terms}">${isEn?'Terms of Use':'Условия использования'}</a><a href="${routes.privacy}">${isEn?'Privacy':'Конфиденциальность'}</a><a href="${routes.contact}">${isEn?'Contact':'Контакты'}</a><a href="${home}">${isEn?'Return to P-120':'Вернуться к P-120'}</a></nav></main>`;
})();
