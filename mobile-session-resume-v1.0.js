/* P-120 WEB — Mobile Session Resume v1.0
   PATCH 2 / PASS 2. Read-only public resume affordance.
   Homepage PASS 2 adds a Main-only presentation loader; session authority is unchanged.
   No measurement, scoring, questionnaire, report, submission or respondent-session writes. */
(()=>{
  'use strict';
  if(window.P120MobileSessionResume?.version==='1.0') return;

  const scriptUrl=document.currentScript?.src||document.baseURI;
  const rootUrl=new URL('./',scriptUrl);
  const isEn=(document.documentElement.lang||'').toLowerCase().startsWith('en')||/\/en(?:\/|$)/i.test(location.pathname);
  const locale=isEn?'en':'ru';
  const sessionKey=isEn?'p120_runtime_session_en_v1':'p120_runtime_session_ru_v1';
  const systemUrl=new URL(isEn?'en/system/':'system/',rootUrl).href;
  const publicUrl=new URL(isEn?'en/':'./',rootUrl).href;
  const CONTROL_ID='p120-mobile-session-resume';
  const STYLE_ATTR='data-p120-mobile-session-resume-style';
  const copy=isEn?{
    label:'Resume',
    aria:(pct)=>`Resume saved P-120 research, ${pct}% complete`
  }:{
    label:'Продолжить',
    aria:(pct)=>`Продолжить сохранённое исследование P-120, выполнено ${pct}%`
  };

  const normalizePath=(value)=>{
    const clean=String(value||'/').replace(/\/{2,}/g,'/');
    return clean.endsWith('/')?clean:`${clean}/`;
  };
  const isPublicMain=normalizePath(location.pathname)===normalizePath(new URL(publicUrl).pathname);
  const isObject=(value)=>!!(value&&typeof value==='object'&&!Array.isArray(value));
  const validAnswer=(value)=>value!==undefined&&value!==null&&value!=='';
  let observer=null;
  let frame=0;

  function ensureHomepagePass2(){
    if(!isPublicMain) return;
    if(window.P120HomepageArchitecturePass2?.version==='1.0') return;
    if(document.querySelector('script[data-p120-homepage-pass2-loader]')) return;
    const script=document.createElement('script');
    script.src=new URL('homepage/homepage-architecture-pass2.js?v=1',rootUrl).href;
    script.defer=true;
    script.dataset.p120HomepagePass2Loader='1.0';
    document.head.appendChild(script);
  }

  function ensureCss(){
    if(document.querySelector(`link[${STYLE_ATTR}]`)) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL('mobile-session-resume-v1.0.css?v=1',rootUrl).href;
    link.setAttribute(STYLE_ATTR,'1.0');
    document.head.appendChild(link);
  }

  function parseSession(){
    try{
      const raw=localStorage.getItem(sessionKey);
      if(!raw) return {raw:null,session:null,reason:'missing'};
      const parsed=JSON.parse(raw);
      if(!isObject(parsed)) return {raw,session:null,reason:'invalid_state'};
      return {raw,session:parsed,reason:null};
    }catch(_){
      return {raw:null,session:null,reason:'invalid_json'};
    }
  }

  function getEligibility(){
    const instrument=window.P120_INSTRUMENT;
    const items=Array.isArray(instrument?.items)?instrument.items:[];
    if(!items.length) return {resumable:false,reason:'instrument_unavailable',locale,sessionKey,answered:0,total:0,percent:0};

    const parsed=parseSession();
    const session=parsed.session;
    if(!session) return {resumable:false,reason:parsed.reason,locale,sessionKey,answered:0,total:items.length,percent:0};
    if(!isObject(session.responses)) return {resumable:false,reason:'responses_invalid',locale,sessionKey,answered:0,total:items.length,percent:0};
    if(session.sessionLocale!=null&&String(session.sessionLocale).toLowerCase()!==locale){
      return {resumable:false,reason:'locale_mismatch',locale,sessionKey,answered:0,total:items.length,percent:0};
    }

    const ids=new Set(items.map(item=>item?.id).filter(Boolean));
    let answered=0;
    for(const [id,value] of Object.entries(session.responses)){
      if(ids.has(id)&&validAnswer(value)) answered+=1;
    }
    const total=items.length;
    const percent=total?Math.round(answered/total*100):0;
    if(answered<1) return {resumable:false,reason:'no_progress',locale,sessionKey,answered,total,percent,session};
    if(answered>=total||session.screen==='results') return {resumable:false,reason:'complete',locale,sessionKey,answered,total,percent,session};
    return {resumable:true,reason:null,locale,sessionKey,answered,total,percent,session};
  }

  function menuButton(){
    const candidates=[...document.querySelectorAll('[data-mobile-menu],.menu-btn')];
    return candidates.find(node=>{
      const rect=node.getBoundingClientRect();
      const style=getComputedStyle(node);
      return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0;
    })||candidates[0]||null;
  }

  function makeControl(){
    const button=document.createElement('button');
    button.type='button';
    button.id=CONTROL_ID;
    button.className='p120-mobile-session-resume';
    button.setAttribute('data-p120-mobile-session-resume-control','1.0');
    button.innerHTML='<span class="p120-mobile-session-resume__label"></span><span class="p120-mobile-session-resume__progress"></span>';
    button.addEventListener('click',()=>{ location.assign(systemUrl); });
    document.body.appendChild(button);
    return button;
  }

  function positionControl(button){
    const menu=menuButton();
    if(!button||!menu) return;
    const rect=menu.getBoundingClientRect();
    const right=Math.max(10,Math.round(window.innerWidth-rect.right));
    const top=Math.max(10,Math.round(rect.bottom+8));
    button.style.setProperty('--p120-resume-top',`${top}px`);
    button.style.setProperty('--p120-resume-right',`${right}px`);
    button.dataset.p120ResumeAnchor='hamburger';
  }

  function reconcileLegacyRail(eligibility){
    const rail=document.querySelector('.editorial-resume-rail');
    if(!rail) return;
    rail.dataset.p120ResumeAuthority='canonical-system-session';
    rail.hidden=!eligibility.resumable;
  }

  function reconcile(){
    frame=0;
    if(!isPublicMain) return;
    ensureCss();
    const eligibility=getEligibility();
    reconcileLegacyRail(eligibility);
    let button=document.getElementById(CONTROL_ID);
    if(!eligibility.resumable){
      button?.remove();
      return;
    }
    if(!button) button=makeControl();
    const label=button.querySelector('.p120-mobile-session-resume__label');
    const progress=button.querySelector('.p120-mobile-session-resume__progress');
    if(label&&label.textContent!==copy.label) label.textContent=copy.label;
    const pct=`${eligibility.percent}%`;
    if(progress&&progress.textContent!==pct) progress.textContent=pct;
    button.setAttribute('aria-label',copy.aria(eligibility.percent));
    button.dataset.p120ResumeLocale=locale;
    button.dataset.p120ResumeAnswered=String(eligibility.answered);
    button.dataset.p120ResumeTotal=String(eligibility.total);
    button.dataset.p120ResumeTarget=systemUrl;
    positionControl(button);
  }

  function schedule(){
    if(frame) return;
    frame=requestAnimationFrame(reconcile);
  }

  function start(){
    if(!isPublicMain) return;
    ensureHomepagePass2();
    ensureCss();
    const root=document.getElementById('app')||document.body;
    observer=new MutationObserver(schedule);
    observer.observe(root,{childList:true,subtree:true});
    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('storage',event=>{if(event.key===sessionKey) schedule();});
    reconcile();
    window.setTimeout(schedule,80);
    window.setTimeout(schedule,260);
    window.setTimeout(schedule,700);
  }

  window.P120MobileSessionResume=Object.freeze({
    version:'1.0',
    locale,
    sessionKey,
    systemUrl,
    publicUrl,
    isPublicMain,
    getEligibility,
    reconcile:schedule
  });

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
