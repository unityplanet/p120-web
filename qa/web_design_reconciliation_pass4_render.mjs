import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const ROOT=path.resolve(import.meta.dirname,'..');
const BASE=(process.env.P120_QA_BASE||'http://127.0.0.1:4174/p120-web').replace(/\/$/,'');
const OUT=path.join(ROOT,'qa-artifacts','web-design-pass4');
fs.mkdirSync(OUT,{recursive:true});
const results=[];
function check(name,ok,detail=''){results.push({name,ok:!!ok,detail});if(!ok)console.error(`FAIL ${name}${detail?` — ${detail}`:''}`);else console.log(`PASS ${name}`);}

const expected=['human-entry','definition','human-atlas','system-depth','route-map','synthetic-example','research-boundary','entry-point'];

const browser=await chromium.launch({headless:true});
try{
  for(const spec of [
    {locale:'ru',url:`${BASE}/`,width:1440,height:1050,sessionKey:'p120_runtime_session_ru_v1',systemSuffix:'/system/'},
    {locale:'en',url:`${BASE}/en/`,width:1440,height:1050,sessionKey:'p120_runtime_session_en_v1',systemSuffix:'/en/system/'}
  ]){
    const page=await browser.newPage({viewport:{width:spec.width,height:spec.height}});
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto(spec.url,{waitUntil:'networkidle'});
    await page.waitForSelector('.editorial-home[data-p120-homepage-pass4="1.0"]',{timeout:12000});
    await page.waitForSelector('[data-p120-home4-root="1"]',{timeout:4000});

    const state=await page.evaluate(()=>({
      version:window.P120HomepageDesignPass4?.version,
      mode:window.P120HomepageDesignPass4?.mode,
      pass2:window.P120HomepageArchitecturePass2?.version||null,
      scenes:[...document.querySelectorAll('[data-p120-home-scene]')].map(x=>x.getAttribute('data-p120-home-scene')),
      routes:document.querySelectorAll('.p120-home4-route').length,
      examples:document.querySelectorAll('[data-p120-home-scene="synthetic-example"] .p120-home4-profile').length,
      oldActs:document.querySelectorAll('.editorial-home .act-marker').length,
      oldExamples:document.querySelectorAll('.editorial-home .examples-grid').length,
      questions:document.querySelectorAll('.editorial-home .question-card').length,
      bodyWidth:document.body.scrollWidth,
      viewport:window.innerWidth,
      family:document.querySelector('.editorial-home')?.dataset.p120HomepageFamily||null,
      h1:document.querySelector('.p120-home4 h1')?.textContent?.trim()||''
    }));
    check(`${spec.locale}.VERSION`,state.version==='1.0',state.version);
    check(`${spec.locale}.MODE`,state.mode==='PUBLIC_COMPOSITION_RECONCILIATION',state.mode);
    check(`${spec.locale}.PASS2_NOT_ACTIVE`,state.pass2===null,String(state.pass2));
    check(`${spec.locale}.SCENE_SEQUENCE`,JSON.stringify(state.scenes)===JSON.stringify(expected),JSON.stringify(state.scenes));
    check(`${spec.locale}.ROUTE_COUNT`,state.routes===7,String(state.routes));
    check(`${spec.locale}.ONE_EXAMPLE`,state.examples===1,String(state.examples));
    check(`${spec.locale}.OLD_ACTS_REMOVED`,state.oldActs===0,String(state.oldActs));
    check(`${spec.locale}.OLD_EXAMPLES_REMOVED`,state.oldExamples===0,String(state.oldExamples));
    check(`${spec.locale}.NO_QUESTIONNAIRE_IN_HOME`,state.questions===0,String(state.questions));
    check(`${spec.locale}.FAMILY_EDITORIAL`,state.family==='editorial',state.family);
    check(`${spec.locale}.HERO_PRESENT`,state.h1.length>20,state.h1);
    check(`${spec.locale}.NO_HORIZONTAL_OVERFLOW_WIDE`,state.bodyWidth<=state.viewport+2,`${state.bodyWidth}/${state.viewport}`);
    check(`${spec.locale}.NO_CONSOLE_ERRORS`,errors.length===0,errors.join(' | ').slice(0,800));
    await page.screenshot({path:path.join(OUT,`${spec.locale}-wide.png`),fullPage:true});

    const itemId=await page.evaluate(()=>window.P120_INSTRUMENT?.items?.[0]?.id||null);
    check(`${spec.locale}.INSTRUMENT_READ_AVAILABLE`,!!itemId,String(itemId));
    if(itemId){
      const raw=JSON.stringify({sessionLocale:spec.locale,responses:{[itemId]:1},screen:'questionnaire'});
      await page.evaluate(({key,raw})=>localStorage.setItem(key,raw),{key:spec.sessionKey,raw});
      await page.reload({waitUntil:'networkidle'});
      await page.waitForSelector('.editorial-home[data-p120-homepage-pass4="1.0"]',{timeout:12000});
      const resume=page.locator('[data-p120-home4-resume="1"]').first();
      await resume.waitFor({state:'visible',timeout:6000});
      const href=await resume.getAttribute('href');
      const after=await page.evaluate(key=>localStorage.getItem(key),spec.sessionKey);
      check(`${spec.locale}.RESUME_VISIBLE`,await resume.isVisible());
      check(`${spec.locale}.RESUME_SYSTEM_TARGET`,new URL(href).pathname.endsWith(spec.systemSuffix),href||'');
      check(`${spec.locale}.SESSION_BYTE_PRESERVED`,after===raw,after||'');
    }

    await page.setViewportSize({width:390,height:844});
    await page.reload({waitUntil:'networkidle'});
    await page.waitForSelector('.editorial-home[data-p120-homepage-pass4="1.0"]',{timeout:12000});
    const mobile=await page.evaluate(()=>({bodyWidth:document.body.scrollWidth,viewport:window.innerWidth,scenes:document.querySelectorAll('[data-p120-home-scene]').length,heroVisible:!!document.querySelector('.p120-home4-hero')}));
    check(`${spec.locale}.MOBILE_SCENES`,mobile.scenes===8,String(mobile.scenes));
    check(`${spec.locale}.NO_HORIZONTAL_OVERFLOW_MOBILE`,mobile.bodyWidth<=mobile.viewport+2,`${mobile.bodyWidth}/${mobile.viewport}`);
    check(`${spec.locale}.MOBILE_HERO`,mobile.heroVisible);
    await page.screenshot({path:path.join(OUT,`${spec.locale}-mobile.png`),fullPage:true});
    await page.close();
  }

  const system=await browser.newPage({viewport:{width:1280,height:900}});
  await system.goto(`${BASE}/system/`,{waitUntil:'networkidle'});
  const systemState=await system.evaluate(()=>({pass4:!!document.querySelector('[data-p120-homepage-pass4]'),home4:!!document.querySelector('[data-p120-home4-root]')}));
  check('SYSTEM_NO_PASS4_ROOT',!systemState.pass4&&!systemState.home4,JSON.stringify(systemState));
  await system.close();
}finally{
  await browser.close();
}

const out={schema:'p120.web_design_reconciliation.pass4.render.v1',base:BASE,passed:results.filter(x=>x.ok).length,failed:results.filter(x=>!x.ok).length,checks:results};
fs.writeFileSync(path.join(OUT,'render-gate.json'),JSON.stringify(out,null,2)+'\n');
if(out.failed)process.exit(1);
