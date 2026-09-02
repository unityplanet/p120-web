/* P-120 PASS 3 — locale-isolated respondent session contract v1.0 */
(()=>{
  'use strict';
  const LEGACY_KEY='p120_web_prototype_v01';
  const path=location.pathname.replace(/\/+/g,'/');
  const locale=/\/en\/system(?:\/|$)/i.test(path)?'en':'ru';
  const sessionKey=`p120_runtime_session_${locale}_v1`;
  const otherKey=locale==='en'?'p120_runtime_session_ru_v1':'p120_runtime_session_en_v1';
  const safeParse=(raw)=>{try{return raw?JSON.parse(raw):null}catch(_){return null}};
  const validState=(s)=>Boolean(s&&typeof s==='object'&&!Array.isArray(s));

  try{
    if(!localStorage.getItem(sessionKey)){
      const legacy=safeParse(localStorage.getItem(LEGACY_KEY));
      if(validState(legacy)){
        const migrated={...legacy,sessionLocale:locale,migration:{sourceKey:LEGACY_KEY,migratedAt:new Date().toISOString(),mode:'COPY_PRESERVE_LEGACY'}};
        localStorage.setItem(sessionKey,JSON.stringify(migrated));
      }
    }
  }catch(_){}

  window.P120_SESSION_KEY=sessionKey;
  window.P120_SESSION_CONTRACT=Object.freeze({
    version:'1.0',
    locale,
    sessionKey,
    otherLocaleKey:otherKey,
    legacyKey:LEGACY_KEY,
    migrationMode:'COPY_PRESERVE_LEGACY',
    crossLocaleWrites:false
  });
})();
