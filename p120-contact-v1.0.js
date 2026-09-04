/* P-120 CONTACT v1.1 — PASS 5 BACKEND + SECURITY INTEGRATION
   General contact correspondence only. No assessment/result/Participant ID binding.
   Browser -> protected Supabase Edge Function -> private service-role-only storage. */
(() => {
  'use strict';

  const html = document.documentElement;
  const isEn = (html.lang || '').toLowerCase().startsWith('en');
  const scriptUrl = document.currentScript?.src || document.baseURI;
  const rootUrl = new URL('./', scriptUrl);
  const contactRoutes = Object.freeze({
    ru: new URL('contact/', rootUrl).href,
    en: new URL('en/contact/', rootUrl).href
  });
  const ENDPOINT = 'https://hvjgrpssjnnprazwhikn.supabase.co/functions/v1/p120-contact-submit';
  const FORM_VERSION = 'P120-CONTACT-FORM-v1.1';
  const PRIVACY_VERSION = 'P120-CONTACT-PRIVACY-v1.0';
  const startedAt = Date.now();

  const copy = isEn ? {
    ready:'Secure contact channel ready',
    sending:'Sending…',
    success:'Message sent. Thank you. We have received your enquiry.',
    failure:'We could not send your message. Your text remains in the form. Please try again.',
    rate:'Too many requests have been sent from this connection. Please try again later.',
    validation:'Please check the highlighted fields.',
    submit:'Send message'
  } : {
    ready:'Защищённый канал связи готов',
    sending:'Отправка…',
    success:'Сообщение отправлено. Спасибо. Мы получили ваше обращение.',
    failure:'Не удалось отправить сообщение. Ваш текст остаётся в форме. Попробуйте ещё раз.',
    rate:'С этого соединения отправлено слишком много обращений. Попробуйте позже.',
    validation:'Проверьте выделенные поля.',
    submit:'Отправить сообщение'
  };

  const form = document.querySelector('[data-p120-contact-form]');
  const status = document.querySelector('[data-contact-status]');
  const counter = document.querySelector('[data-contact-counter]');
  const message = document.getElementById('contact-message');
  const submit = document.querySelector('.contact-submit');

  function enforceContactLocaleRoutes(){
    const nav = document.querySelector('.contact-header .p120-brand53-language');
    if(!nav) return;
    const ru = nav.querySelector('a[lang="ru"]');
    const en = nav.querySelector('a[lang="en"]');
    if(ru && ru.href !== contactRoutes.ru) ru.href = contactRoutes.ru;
    if(en && en.href !== contactRoutes.en) en.href = contactRoutes.en;
    if(ru){ if(isEn) ru.removeAttribute('aria-current'); else ru.setAttribute('aria-current','page'); }
    if(en){ if(isEn) en.setAttribute('aria-current','page'); else en.removeAttribute('aria-current'); }
  }

  function updateCounter(){
    if(!counter || !message) return;
    counter.textContent = `${message.value.length} / ${message.maxLength || 5000}`;
  }

  function isFieldInvalid(input){
    const value = input.value.trim();
    if(input.required && !value) return true;
    if(input.type === 'email' && value && !input.validity.valid) return true;
    if(input.id === 'contact-subject' && value.length < 3) return true;
    if(input.id === 'contact-message' && value.length < 20) return true;
    return false;
  }

  function fieldState(input,{force=false}={}){
    const wrapper = input.closest('[data-contact-field]');
    if(!wrapper || (!force && !input.dataset.contactTouched)) return false;
    const invalid = isFieldInvalid(input);
    wrapper.classList.toggle('is-invalid', invalid);
    input.setAttribute('aria-invalid', String(invalid));
    const error = wrapper.querySelector('.contact-field-error');
    if(error && error.textContent.trim()) error.hidden = !invalid;
    return invalid;
  }

  function validateAll(){
    if(!form) return false;
    let invalid = false;
    let first = null;
    form.querySelectorAll('input:not([data-contact-honeypot]),textarea').forEach(input => {
      input.dataset.contactTouched = 'true';
      if(fieldState(input,{force:true})){
        invalid = true;
        if(!first) first = input;
      }
    });
    first?.focus();
    return !invalid;
  }

  function setState(kind,text){
    if(form) form.dataset.contactState = kind;
    if(status) status.textContent = text;
  }

  function setSubmitting(active){
    if(!submit) return;
    submit.disabled = active;
    submit.setAttribute('aria-disabled', String(active));
    submit.textContent = active ? copy.sending : copy.submit;
    form?.querySelectorAll('input,textarea').forEach(control => {
      if(!control.hasAttribute('data-contact-honeypot')) control.readOnly = active;
    });
  }

  function payload(){
    return {
      name: document.getElementById('contact-name')?.value || '',
      email: document.getElementById('contact-email')?.value || '',
      subject: document.getElementById('contact-subject')?.value || '',
      message: document.getElementById('contact-message')?.value || '',
      website: form?.querySelector('[data-contact-honeypot]')?.value || '',
      started_at: startedAt,
      locale: isEn ? 'en' : 'ru',
      form_version: FORM_VERSION,
      privacy_notice_version: PRIVACY_VERSION
    };
  }

  async function send(event){
    event.preventDefault();
    event.stopPropagation();
    if(!form || !validateAll()){
      setState('validation',copy.validation);
      return;
    }

    setSubmitting(true);
    setState('submitting',copy.sending);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try{
      const response = await fetch(ENDPOINT, {
        method:'POST',
        mode:'cors',
        credentials:'omit',
        referrerPolicy:'no-referrer',
        cache:'no-store',
        headers:{'content-type':'application/json'},
        body:JSON.stringify(payload()),
        signal:controller.signal
      });
      let data = null;
      try { data = await response.json(); } catch(_) {}

      if(response.ok && data?.ok){
        setState('success',copy.success);
        form.reset();
        form.querySelectorAll('[data-contact-touched]').forEach(x=>delete x.dataset.contactTouched);
        form.querySelectorAll('[data-contact-field]').forEach(x=>x.classList.remove('is-invalid'));
        form.querySelectorAll('[aria-invalid]').forEach(x=>x.setAttribute('aria-invalid','false'));
        updateCounter();
        return;
      }
      if(response.status===429 || data?.code==='RATE_LIMIT'){
        setState('rate-limit',copy.rate);
        return;
      }
      if(response.status===400 && data?.code==='VALIDATION'){
        setState('validation',copy.validation);
        return;
      }
      setState('error',copy.failure);
    } catch(_){
      setState('error',copy.failure);
    } finally {
      clearTimeout(timeout);
      setSubmitting(false);
    }
  }

  function bindValidationPresentation(){
    if(!form) return;
    form.querySelectorAll('input:not([data-contact-honeypot]),textarea').forEach(input => {
      input.addEventListener('blur', () => {
        input.dataset.contactTouched = 'true';
        fieldState(input);
      });
      input.addEventListener('input', () => {
        if(input === message) updateCounter();
        fieldState(input);
        if(form.dataset.contactState === 'error' || form.dataset.contactState === 'validation') setState('ready',copy.ready);
      });
    });
    updateCounter();
  }

  function installRouteGuard(){
    enforceContactLocaleRoutes();
    const nav = document.querySelector('.contact-header .p120-brand53-language');
    if(!nav) return;
    new MutationObserver(mutations => {
      if(mutations.some(m => m.type === 'attributes' && m.attributeName === 'href')) queueMicrotask(enforceContactLocaleRoutes);
    }).observe(nav,{subtree:true,attributes:true,attributeFilter:['href']});
  }

  function start(){
    if(!form) return;
    form.removeAttribute('action');
    form.removeAttribute('method');
    form.dataset.p120Transport = 'edge-function-v1';
    form.addEventListener('submit',send);
    bindValidationPresentation();
    installRouteGuard();
    if(submit){ submit.disabled = false; submit.removeAttribute('aria-disabled'); }
    setState('ready',copy.ready);
    document.body.dataset.p120ContactTransport = 'edge-function-v1';
    html.dataset.p120Contact = '1.1';
    window.P120_CONTACT = Object.freeze({
      version:'1.1',
      transport:'edge-function-v1',
      endpoint:ENDPOINT,
      formVersion:FORM_VERSION,
      privacyNoticeVersion:PRIVACY_VERSION,
      routes:contactRoutes
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
