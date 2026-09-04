/* P-120 CONTACT v1.0 — PASS 4 STATIC FRONTEND / TRANSPORT OFF
   Client-side presentation and route guard only.
   No fetch/XHR, no persistence, no Supabase, no email, no analytics. */
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
  const copy = isEn ? {
    status:'Submission channel disabled'
  } : {
    status:'Канал отправки отключён'
  };

  const form = document.querySelector('[data-p120-contact-form]');
  const status = document.querySelector('[data-contact-status]');
  const counter = document.querySelector('[data-contact-counter]');
  const message = document.getElementById('contact-message');

  function enforceContactLocaleRoutes(){
    const nav = document.querySelector('.contact-header .p120-brand53-language');
    if(!nav) return;
    const ru = nav.querySelector('a[lang="ru"]');
    const en = nav.querySelector('a[lang="en"]');
    if(ru && ru.href !== contactRoutes.ru) ru.href = contactRoutes.ru;
    if(en && en.href !== contactRoutes.en) en.href = contactRoutes.en;
    if(ru){
      if(isEn) ru.removeAttribute('aria-current');
      else ru.setAttribute('aria-current','page');
    }
    if(en){
      if(isEn) en.setAttribute('aria-current','page');
      else en.removeAttribute('aria-current');
    }
  }

  function hardenTransportOff(){
    if(!form) return;
    form.dataset.p120Transport = 'off';
    form.removeAttribute('action');
    form.querySelectorAll('input,textarea,select').forEach(control => {
      control.removeAttribute('name');
    });
    form.querySelectorAll('button').forEach(button => {
      if(button.classList.contains('contact-submit') || button.type === 'submit'){
        button.type = 'button';
        button.disabled = true;
        button.setAttribute('aria-disabled','true');
      }
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if(status) status.textContent = copy.status;
    }, true);
  }

  function updateCounter(){
    if(!counter || !message) return;
    counter.textContent = `${message.value.length} / ${message.maxLength || 5000}`;
  }

  function fieldState(input){
    const wrapper = input.closest('[data-contact-field]');
    if(!wrapper || !input.dataset.contactTouched) return;
    let invalid = false;
    if(input.required && !input.value.trim()) invalid = true;
    else if(input.type === 'email' && input.value && !input.validity.valid) invalid = true;
    else if(input.id === 'contact-subject' && input.value.trim() && input.value.trim().length < 3) invalid = true;
    else if(input.id === 'contact-message' && input.value.trim() && input.value.trim().length < 20) invalid = true;

    wrapper.classList.toggle('is-invalid', invalid);
    input.setAttribute('aria-invalid', String(invalid));
    const error = wrapper.querySelector('.contact-field-error');
    if(error) error.hidden = !invalid;
  }

  function bindValidationPresentation(){
    if(!form) return;
    form.querySelectorAll('input,textarea').forEach(input => {
      input.addEventListener('blur', () => {
        input.dataset.contactTouched = 'true';
        fieldState(input);
      });
      input.addEventListener('input', () => {
        if(input === message) updateCounter();
        fieldState(input);
      });
    });
    updateCounter();
  }

  function installRouteGuard(){
    enforceContactLocaleRoutes();
    const nav = document.querySelector('.contact-header .p120-brand53-language');
    if(!nav) return;
    new MutationObserver(mutations => {
      if(mutations.some(m => m.type === 'attributes' && m.attributeName === 'href')){
        queueMicrotask(enforceContactLocaleRoutes);
      }
    }).observe(nav,{subtree:true,attributes:true,attributeFilter:['href']});
  }

  function start(){
    hardenTransportOff();
    bindValidationPresentation();
    installRouteGuard();
    if(status) status.textContent = copy.status;
    document.body.dataset.p120ContactTransport = 'off';
    html.dataset.p120Contact = '1.0';
    window.P120_CONTACT_STATIC = Object.freeze({
      version:'1.0',
      transport:'off',
      routes:contactRoutes
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
