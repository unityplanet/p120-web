/* P-120 System — RU Orientation Card v1.0
   Respondent-facing presentation only. No item, order, response scale, scoring,
   persistence, missing-data or runtime behaviour changes. */
(() => {
  'use strict';
  if(!/^ru$/i.test(document.documentElement.lang||''))return;
  if(!/\/system\/(?:index\.html)?$/i.test(location.pathname))return;
  const VERSION='P2.5-RU-v1.0';
  let timer=0;

  function style(){
    if(document.getElementById('p120-system-orientation-p25-style'))return;
    const s=document.createElement('style');s.id='p120-system-orientation-p25-style';
    s.textContent=`
      .p120-system-orientation{margin:0 0 clamp(18px,2.4vw,32px);padding:clamp(22px,3vw,38px);border:1px solid var(--line);border-left:3px solid #2f7d78;background:rgba(255,254,250,.72);border-radius:18px;box-shadow:var(--shadow-soft)}
      .p120-system-orientation__kicker{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:var(--muted);margin:0 0 12px}
      .p120-system-orientation h2{font-family:"Noto Serif Display","Noto Serif",Georgia,serif;font-size:clamp(25px,3vw,40px);line-height:1.08;margin:0 0 18px;font-weight:600}
      .p120-system-orientation p{max-width:70ch;margin:.55em 0;color:var(--ink-2)}
      .p120-system-orientation__flash{margin-top:20px!important;padding-top:16px;border-top:1px solid var(--line);font-weight:700;color:var(--ink)!important}
      @media(max-width:680px){.p120-system-orientation{border-radius:14px;padding:20px 18px}.p120-system-orientation h2{font-size:27px}}
    `;document.head.appendChild(s);
  }

  function apply(){
    style();
    document.querySelectorAll('a[href*="why-p120"]').forEach(a=>{if((a.textContent||'').trim()==='Почему P-120?')a.textContent='Происхождение названия';});
    const preflight=document.querySelector('.preflight.luxury-preflight');
    if(!preflight)return false;
    let card=document.getElementById('p120-system-orientation');
    if(!card){
      card=document.createElement('section');
      card.id='p120-system-orientation';
      card.className='card p120-system-orientation';
      card.dataset.p120SystemOrientation=VERSION;
      card.setAttribute('aria-labelledby','p120-system-orientation-title');
      card.innerHTML='<p class="p120-system-orientation__kicker">Перед началом</p><h2 id="p120-system-orientation-title">Здесь нет «правильной» картины человека.</h2><p>Разные вопросы P-120 относятся к разным сторонам опыта. Ответы не обязаны складываться в идеально последовательный образ.</p><p>Не пытайтесь специально согласовывать ответы между собой или создавать более красивую картину себя.</p><p><strong>Не пытайтесь специально устранять различия между своими ответами. Они не обязательно означают ошибку.</strong></p><p class="p120-system-orientation__flash">Иногда содержательный результат состоит именно в том, что разные стороны опыта не совпадают.</p><p>Отвечайте на каждый вопрос отдельно — так, как он относится к вашему собственному опыту.</p>';
      preflight.parentNode.insertBefore(card,preflight);
    }
    document.documentElement.dataset.p120SystemOrientation=VERSION;
    return true;
  }
  function schedule(){if(timer)clearTimeout(timer);timer=setTimeout(apply,25)}
  const start=()=>{apply();new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
