import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

/*
 P-120 WEB — MOBILE SESSION RESUME
 PATCH 2 / PASS 2 — IMPLEMENTATION & REGRESSION QA
*/

const ROOT=path.resolve(import.meta.dirname,'..');
const BASE=(process.env.P120_QA_BASE||'http://127.0.0.1:4174/p120-web').replace(/\/$/,'');
const OUT=path.join(ROOT,'qa-artifacts','mobile-session-resume-patch2-pass2');
fs.mkdirSync(OUT,{recursive:true});

const RU='p120_runtime_session_ru_v1';
const EN='p120_runtime_session_en_v1';
const ERU='p120_editorial_state_ru_v1';
const EEN='p120_editorial_state_en_v1';
const LEGACY='p120_web_prototype_v01';
const THEME='p120_web_theme_v16';
const routes=[
  {id:'ru',path:'/',locale:'ru',key:RU,other:EN,editorial:ERU,system:'/system/'},
  {id:'en',path:'/en/',locale:'en',key:EN,other:RU,editorial:EEN,system:'/en/system/'}
];
const widths=[360,390,430,480];
const themes=['ivory','graphite','museum'];
const failures=[];
const checks=[];
const matrix=[];
const edge=[];
const clicks=[];
const add=(id,pass,detail={})=>{checks.push({id,pass:Boolean(pass),...detail});if(!pass)failures.push(id);};
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);

const brand=fs.readFileSync(path.join(ROOT,'p120-brand-system-v1.0.js'),'utf8');
const runtime=fs.readFileSync(path.join(ROOT,'mobile-session-resume-v1.0.js'),'utf8');
const css=fs.readFileSync(path.join(ROOT,'mobile-session-resume-v1.0.css'),'utf8');
add('STATIC / stale shared key is not brand resume authority',!brand.includes("const SESSION_KEY = 'p120_web_prototype_v01';"));
add('STATIC / brand resume authority contains RU canonical key',brand.includes(RU));
add('STATIC / brand resume authority contains EN canonical key',brand.includes(EN));
add('STATIC / brand runtime loads PATCH 2 resume runtime',brand.includes('mobile-session-resume-v1.0.js'));
add('STATIC / mobile runtime contains RU canonical key',runtime.includes(RU));
add('STATIC / mobile runtime contains EN canonical key',runtime.includes(EN));
add('STATIC / mobile runtime never references legacy shared key',!runtime.includes(LEGACY));
add('STATIC / mobile runtime has no localStorage writes',!runtime.includes('localStorage.setItem('));
add('STATIC / mobile CSS is phone-bounded',css.includes('@media(max-width:820px)')&&css.includes('@media(min-width:821px)'));

const browser=await chromium.launch({headless:true});

async function loadInstrument(page,route){
  const response=await page.goto(BASE+route.path,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>Array.isArray(window.P120_INSTRUMENT?.items)&&window.P120_INSTRUMENT.items.length>0,null,{timeout:15000});
  const info=await page.evaluate(()=>({
    ids:window.P120_INSTRUMENT.items.map(x=>x.id),
    itemCount:window.P120_INSTRUMENT.items.length,
    href:location.href
  }));
  return {...info,http:response?.status()||0};
}

function stateFor({route,ids,answered=7,screen='test',sessionLocale=route.locale,itemIndex=answered}){
  const responses={};
  for(const id of ids.slice(0,answered)) responses[id]=3;
  return {
    participantId:route.locale==='en'?'P120-ENQA01':'P120-RUQA01',
    sessionLocale,
    screen,
    itemIndex,
    responses,
    adminModes:{},telemetry:[],
    startedAt:'2026-09-04T12:00:00.000Z',
    consentAt:'2026-09-04T12:00:01.000Z',
    lastSavedAt:'2026-09-04T12:00:02.000Z'
  };
}

async function seed(page,route,{canonical=null,canonicalRaw=null,other=null,legacy=null,editorial=null,theme='ivory',clear=true}={}){
  await page.evaluate(({route,canonical,canonicalRaw,other,legacy,editorial,theme,keys,clear})=>{
    if(clear){for(const key of keys)localStorage.removeItem(key);}
    localStorage.setItem('p120_web_theme_v16',theme);
    if(canonicalRaw!==null)localStorage.setItem(route.key,canonicalRaw);
    else if(canonical!==null)localStorage.setItem(route.key,JSON.stringify(canonical));
    if(other!==null)localStorage.setItem(route.other,JSON.stringify(other));
    if(legacy!==null)localStorage.setItem('p120_web_prototype_v01',typeof legacy==='string'?legacy:JSON.stringify(legacy));
    if(editorial!==null)localStorage.setItem(route.editorial,JSON.stringify(editorial));
  },{route,canonical,canonicalRaw,other,legacy,editorial,theme,keys:[RU,EN,ERU,EEN,LEGACY],clear});
}

async function reloadReady(page){
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.P120MobileSessionResume?.version==='1.0',null,{timeout:15000});
  await page.waitForTimeout(260);
}

async function snapshot(page){
  return page.evaluate(()=>{
    const button=document.querySelector('[data-p120-mobile-session-resume-control]');
    const menu=[...document.querySelectorAll('[data-mobile-menu],.menu-btn')].find(node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';})||null;
    const visible=node=>{if(!node)return false;const s=getComputedStyle(node),r=node.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'&&r.width>0&&r.height>0;};
    const rect=node=>node?(()=>{const r=node.getBoundingClientRect();return {top:r.top,right:r.right,bottom:r.bottom,left:r.left,width:r.width,height:r.height}})():null;
    const bstyle=button?getComputedStyle(button):null;
    const rail=document.querySelector('.editorial-resume-rail');
    const bottom=document.querySelector('.mobile-bottom-nav');
    const bottomActions=bottom?[...bottom.querySelectorAll(':scope > button,:scope > a')].length:0;
    const scripts=[...document.querySelectorAll('script[data-p120-mobile-session-resume]')].map(x=>x.src);
    const styles=[...document.querySelectorAll('link[data-p120-mobile-session-resume-style]')].map(x=>x.href);
    return {
      eligibility:window.P120MobileSessionResume?.getEligibility?.()||null,
      button:{exists:!!button,visible:visible(button),text:button?.textContent?.trim()||'',aria:button?.getAttribute('aria-label')||'',rect:rect(button),background:bstyle?.backgroundColor||'',color:bstyle?.color||'',target:button?.dataset.p120ResumeTarget||''},
      menu:{exists:!!menu,visible:visible(menu),rect:rect(menu)},
      rail:{exists:!!rail,hidden:rail?.hidden??null,authority:rail?.dataset.p120ResumeAuthority||''},
      bottomActions,
      scripts,styles,
      theme:document.body.dataset.theme||'',
      overflow:document.documentElement.scrollWidth-window.innerWidth,
      visibleHeaderMarks:[...document.querySelectorAll('.brand-mark')].filter(visible).length
    };
  });
}

for(const route of routes){
  for(const width of widths){
    const context=await browser.newContext({viewport:{width,height:900}});
    const page=await context.newPage();
    const errors=[];
    page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
    page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
    const info=await loadInstrument(page,route);
    add(`${route.id}/${width} / instrument remains 180`,info.itemCount===180,{count:info.itemCount});
    for(const theme of themes){
      errors.length=0;
      const session=stateFor({route,ids:info.ids,answered:18,screen:'test',itemIndex:18});
      await seed(page,route,{canonical:session,theme});
      const rawBefore=await page.evaluate(k=>localStorage.getItem(k),route.key);
      await reloadReady(page);
      const snap=await snapshot(page);
      const rawAfter=await page.evaluate(k=>localStorage.getItem(k),route.key);
      const row={route:route.id,width,theme,snap,errors:[...errors]};
      matrix.push(row);
      add(`${route.id}/${width}/${theme} / resumable canonical session visible`,snap.eligibility?.resumable===true&&snap.button.visible===true,{reason:snap.eligibility?.reason});
      add(`${route.id}/${width}/${theme} / progress is 10%`,snap.eligibility?.answered===18&&snap.eligibility?.total===180&&snap.eligibility?.percent===10,{eligibility:snap.eligibility});
      add(`${route.id}/${width}/${theme} / correct locale target`,snap.button.target.endsWith(route.system),{target:snap.button.target});
      add(`${route.id}/${width}/${theme} / hamburger preserved`,snap.menu.exists&&snap.menu.visible);
      add(`${route.id}/${width}/${theme} / resume aligned below hamburger`,!!snap.button.rect&&!!snap.menu.rect&&Math.abs(snap.button.rect.right-snap.menu.rect.right)<=3&&snap.button.rect.top>=snap.menu.rect.bottom+5&&snap.button.rect.top<=snap.menu.rect.bottom+16,{button:snap.button.rect,menu:snap.menu.rect});
      add(`${route.id}/${width}/${theme} / bottom navigation preserved`,snap.bottomActions===4,{count:snap.bottomActions});
      add(`${route.id}/${width}/${theme} / header mark preserved`,snap.visibleHeaderMarks===1,{count:snap.visibleHeaderMarks});
      add(`${route.id}/${width}/${theme} / no horizontal overflow`,snap.overflow<=1,{overflow:snap.overflow});
      add(`${route.id}/${width}/${theme} / canonical respondent session read-only`,rawAfter===rawBefore);
      add(`${route.id}/${width}/${theme} / single runtime and style asset`,snap.scripts.length===1&&snap.styles.length===1,{scripts:snap.scripts,styles:snap.styles});
      add(`${route.id}/${width}/${theme} / no runtime errors`,errors.length===0,{errors:[...errors]});
      if(width===390) await page.screenshot({path:path.join(OUT,`${route.id}-390-${theme}-partial.png`),fullPage:true});
    }
    await context.close();
  }
}

const edgeCases=[
  {id:'missing',prepare:()=>({}),visible:false,reason:'missing'},
  {id:'zero',prepare:(route,ids)=>({canonical:stateFor({route,ids,answered:0,screen:'preflight',itemIndex:0})}),visible:false,reason:'no_progress'},
  {id:'one',prepare:(route,ids)=>({canonical:stateFor({route,ids,answered:1,screen:'test',itemIndex:1})}),visible:true,reason:null},
  {id:'deep',prepare:(route,ids)=>({canonical:stateFor({route,ids,answered:117,screen:'test',itemIndex:117})}),visible:true,reason:null},
  {id:'179',prepare:(route,ids)=>({canonical:stateFor({route,ids,answered:179,screen:'test',itemIndex:179})}),visible:true,reason:null},
  {id:'180',prepare:(route,ids)=>({canonical:stateFor({route,ids,answered:180,screen:'results',itemIndex:179})}),visible:false,reason:'complete'},
  {id:'results-partial',prepare:(route,ids)=>({canonical:stateFor({route,ids,answered:40,screen:'results',itemIndex:40})}),visible:false,reason:'complete'},
  {id:'invalid-json',prepare:()=>({canonicalRaw:'{invalid-json'}),visible:false,reason:'invalid_json'},
  {id:'missing-responses',prepare:(route)=>({canonical:{participantId:'P120-QA0001',sessionLocale:route.locale,screen:'test'}}),visible:false,reason:'responses_invalid'},
  {id:'locale-mismatch',prepare:(route,ids)=>({canonical:stateFor({route,ids,answered:7,screen:'test',sessionLocale:route.locale==='ru'?'en':'ru'})}),visible:false,reason:'locale_mismatch'},
  {id:'legacy-only',prepare:(route,ids)=>({legacy:stateFor({route,ids,answered:7,screen:'test'})}),visible:false,reason:'missing'}
];

for(const route of routes){
  const context=await browser.newContext({viewport:{width:390,height:900}});
  const page=await context.newPage();
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
  page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
  const info=await loadInstrument(page,route);
  for(const spec of edgeCases){
    errors.length=0;
    const prepared=spec.prepare(route,info.ids)||{};
    await seed(page,route,{...prepared,theme:'ivory'});
    await reloadReady(page);
    const snap=await snapshot(page);
    edge.push({route:route.id,case:spec.id,snap,errors:[...errors]});
    add(`${route.id}/edge/${spec.id} / visibility contract`,snap.button.visible===spec.visible,{visible:snap.button.visible,reason:snap.eligibility?.reason});
    add(`${route.id}/edge/${spec.id} / reason contract`,snap.eligibility?.reason===spec.reason,{actual:snap.eligibility?.reason,expected:spec.reason});
    add(`${route.id}/edge/${spec.id} / no runtime errors`,errors.length===0,{errors:[...errors]});
  }

  const ruState=stateFor({route:{...route,locale:'ru'},ids:info.ids,answered:7,screen:'test',sessionLocale:'ru'});
  const enState=stateFor({route:{...route,locale:'en'},ids:info.ids,answered:18,screen:'test',sessionLocale:'en'});
  await page.evaluate(({ru,en})=>{localStorage.setItem('p120_runtime_session_ru_v1',JSON.stringify(ru));localStorage.setItem('p120_runtime_session_en_v1',JSON.stringify(en));}, {ru:ruState,en:enState});
  await reloadReady(page);
  const dual=await snapshot(page);
  const expected=route.locale==='ru'?7:18;
  add(`${route.id}/dual-locale / route reads only own locale session`,dual.eligibility?.answered===expected,{answered:dual.eligibility?.answered,expected});
  await context.close();
}

for(const route of routes){
  const context=await browser.newContext({viewport:{width:390,height:900}});
  const page=await context.newPage();
  const info=await loadInstrument(page,route);
  const session=stateFor({route,ids:info.ids,answered:7,screen:'test',itemIndex:7});
  await seed(page,route,{canonical:session,theme:'ivory'});
  await reloadReady(page);
  const before=await page.evaluate(k=>localStorage.getItem(k),route.key);
  await page.evaluate(()=>{
    window.name='[]';
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){
      try{const rows=JSON.parse(window.name||'[]');rows.push({path:location.pathname,key:String(key)});window.name=JSON.stringify(rows);}catch(_){}
      return original.apply(this,arguments);
    };
  });
  await page.click('[data-p120-mobile-session-resume-control]');
  await page.waitForURL(url=>url.pathname.endsWith(route.system),{timeout:15000});
  await page.waitForFunction(()=>window.P120_SESSION_CONTRACT?.sessionKey,null,{timeout:15000});
  await page.waitForTimeout(180);
  const after=await page.evaluate(({key})=>({raw:localStorage.getItem(key),writes:JSON.parse(window.name||'[]'),contract:window.P120_SESSION_CONTRACT||null,qid:document.querySelector('.qid')?.textContent?.trim()||null}),{key:route.key});
  const respondentWrites=after.writes.filter(x=>[RU,EN,LEGACY].includes(x.key));
  const afterState=JSON.parse(after.raw||'null');
  const clickRow={route:route.id,before,after,respondentWrites};
  clicks.push(clickRow);
  add(`${route.id}/click / routes to canonical System`,after.contract?.sessionKey===route.key,{contract:after.contract});
  add(`${route.id}/click / Editorial performs zero respondent writes`,respondentWrites.length===0,{writes:after.writes});
  add(`${route.id}/click / responses preserved into System`,plain(afterState?.responses)&&Object.keys(afterState.responses).length===7,{count:Object.keys(afterState?.responses||{}).length});
  add(`${route.id}/click / System restores saved continuation item`,after.qid===info.ids[7],{qid:after.qid,expected:info.ids[7]});
  await context.close();
}

for(const route of routes){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  const info=await loadInstrument(page,route);
  await seed(page,route,{canonical:stateFor({route,ids:info.ids,answered:18,screen:'test',itemIndex:18}),theme:'ivory'});
  await reloadReady(page);
  const snap=await snapshot(page);
  add(`${route.id}/desktop / resume control not visible`,snap.button.visible===false,{button:snap.button});
  add(`${route.id}/desktop / no horizontal overflow`,snap.overflow<=1,{overflow:snap.overflow});
  add(`${route.id}/desktop / header mark preserved`,snap.visibleHeaderMarks===1,{count:snap.visibleHeaderMarks});
  await context.close();
}

await browser.close();

const pass=failures.length===0;
const result={
  document_id:'P120-WEB-MSR-P2-P2-QA',
  version:'1.0',
  status:pass?'PASS':'FAIL',
  scope:'PATCH 2 / PASS 2 — Mobile Session Resume Implementation & Regression QA',
  base:BASE,
  checks_passed:checks.filter(x=>x.pass).length,
  checks_total:checks.length,
  failures,
  checks,
  matrix_summary:{routes:2,widths,themes,cases:matrix.length},
  edge_cases:edge.length,
  click_cases:clicks.length,
  matrix,edge,clicks
};
fs.writeFileSync(path.join(OUT,'P120_WEB_MOBILE_SESSION_RESUME_PATCH2_PASS2_QA.json'),JSON.stringify(result,null,2));
const md=[
  '# P-120 WEB — MOBILE SESSION RESUME',
  '## PATCH 2 / PASS 2 — IMPLEMENTATION & REGRESSION QA',
  '',
  `**Status:** ${result.status}`,
  `**Checks:** ${result.checks_passed}/${result.checks_total}`,
  `**Core mobile matrix:** ${matrix.length} cases · RU/EN · 360/390/430/480 · Ivory/Graphite/Museum`,
  `**Edge cases:** ${edge.length}`,
  `**Resume-to-System cases:** ${clicks.length}`,
  '',
  '### Failures',
  failures.length?failures.map(x=>`- ${x}`).join('\n'):'- None',
  '',
  '### Gate',
  pass?'**PASS / READY FOR CLOSURE**':'**FAIL / HOLD**'
];
fs.writeFileSync(path.join(OUT,'P120_WEB_MOBILE_SESSION_RESUME_PATCH2_PASS2_QA.md'),md.join('\n'));
console.log(JSON.stringify({status:result.status,checks:`${result.checks_passed}/${result.checks_total}`,matrix:matrix.length,edge:edge.length,clicks:clicks.length,failures},null,2));
if(!pass) process.exit(1);
