import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

/*
 P-120 WEB — INDEPENDENT MOBILE UI REGRESSION AUDIT / v3
 Audit-only, full mobile width/theme/locale surface with actual Home -> Preflight -> Test -> Saved Resume flow.
 Transition/results active-state binding is independently verified from source authority and the same .cta.active cascade.
 PROGRESS-01 tests actual 4% runtime, then 10%/100% text-width stress in the same canonical component.
 No production source is mutated.
*/

const ROOT=path.resolve(import.meta.dirname,'..');
const BASE=(process.env.P120_QA_BASE||'http://127.0.0.1:4174/p120-web').replace(/\/$/,'');
const OUT=path.join(ROOT,'qa-artifacts','independent-mobile-ui-audit-v3');
fs.mkdirSync(OUT,{recursive:true});

const routes=[
  {id:'ru-public',path:'/',key:'p120_editorial_state_ru_v1',locale:'ru',claimed:true,canonical:false},
  {id:'en-public',path:'/en/',key:'p120_editorial_state_en_v1',locale:'en',claimed:true,canonical:false},
  {id:'ru-system',path:'/system/',key:'p120_runtime_session_ru_v1',locale:'ru',claimed:false,canonical:true},
  {id:'en-system',path:'/en/system/',key:'p120_runtime_session_en_v1',locale:'en',claimed:true,canonical:true}
];
const widths=[360,390,430,480];
const themes=['ivory','graphite','museum'];
const expectedText={ivory:'rgb(255, 255, 255)',graphite:'rgb(245, 239, 229)',museum:'rgb(255, 249, 236)'};

const browser=await chromium.launch({headless:true});
const rows=[];
const progressRows=[];
const sourceFindings=[];

const ctaCss=fs.readFileSync(path.join(ROOT,'p120-mobile-primary-cta-pass2.css'),'utf8');
const systemSource=fs.readFileSync(path.join(ROOT,'system/index.html'),'utf8');
const enSystemSource=fs.readFileSync(path.join(ROOT,'en/system/index.html'),'utf8');
const rootSource=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const enRootSource=fs.readFileSync(path.join(ROOT,'en/index.html'),'utf8');
const sourceAuthority={
  explicitCtaActive:/button\.cta(?:,|[^\n]*button\.cta\.active)|button\.cta\.active/.test(ctaCss),
  assessmentBinding:/function isAssessmentScreen\(\)\{return \['preflight','test','transition','results'\]\.includes\(state\.screen\)\}/.test(systemSource),
  renderBinding:/const activeTest=isAssessmentScreen\(\)\?'active':''/.test(systemSource),
  integration:{
    'ru-public':rootSource.includes('data-p120-mobile-primary-cta="pass2"'),
    'en-public':enRootSource.includes('data-p120-mobile-primary-cta="pass2"'),
    'ru-system':systemSource.includes('data-p120-mobile-primary-cta="pass2"'),
    'en-system':enSystemSource.includes('data-p120-mobile-primary-cta="pass2"')
  },
  progressMarkupInline:/mobile-menu-progress-top"><div><span>Текущая сессия<\/span><strong>\$\{pct\(\)\}%<\/strong><\/div>/.test(systemSource),
  progressLeftLayoutRule:/\.mobile-menu-progress-top\{display:flex/.test(systemSource)&&!/\.mobile-menu-progress-top\s*>\s*div/.test(systemSource)
};

function sig(s){return [s.bg,s.bgc,s.color,s.border,s.shadow,s.iconBg,s.iconColor].join('|')}
function uniq(a){return [...new Set(a)]}
function clean(s){return s.replace(/[^a-z0-9._-]+/gi,'-')}
function rectObj(r){return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}}

async function snap(page){
  return page.evaluate(()=>{
    const c=document.querySelector('.mobile-bottom-nav button.cta');
    if(!c)return null;
    const s=getComputedStyle(c),icon=c.querySelector('.mobile-nav-icon'),si=icon?getComputedStyle(icon):null,r=c.getBoundingClientRect();
    const visible=e=>{if(!e)return false;const q=e.getBoundingClientRect(),cs=getComputedStyle(e);return q.width>0&&q.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'};
    return {
      cls:c.className,active:c.classList.contains('active'),label:c.textContent.trim(),
      bg:s.backgroundImage,bgc:s.backgroundColor,color:s.color,border:s.borderColor,shadow:s.boxShadow,
      iconBg:si?.backgroundColor||'',iconColor:si?.color||'',rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height},
      theme:document.body.dataset.theme||'',pageOverflow:document.documentElement.scrollWidth-window.innerWidth,ownOverflow:Math.max(c.scrollWidth-c.clientWidth,c.scrollHeight-c.clientHeight),
      assetLinks:[...document.querySelectorAll('link[data-p120-mobile-primary-cta="pass2"]')].map(x=>x.href),
      assetSheets:[...document.styleSheets].map(x=>x.href).filter(Boolean).filter(x=>x.includes('p120-mobile-primary-cta-pass2.css')),
      headerMarks:[...document.querySelectorAll('.brand-mark')].filter(visible).length,
      timeline:window.__P120_CTA_TIMELINE||[]
    };
  });
}

async function progressGeometry(page,value,total){
  return page.evaluate(({value,total})=>{
    const card=document.querySelector('.mobile-menu-progress'),top=card?.querySelector('.mobile-menu-progress-top'),left=top?.firstElementChild;
    const label=left?.querySelector('span'),metric=left?.querySelector('strong'),counter=top?.children?.[1],bar=card?.querySelector('.mini-fill');
    if(metric)metric.textContent=value+'%';
    if(counter)counter.textContent=(value===100?total:Math.round(total*value/100))+' из '+total;
    if(bar)bar.style.width=value+'%';
    const R=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
    const L=R(label),M=R(metric),C=R(counter),Card=R(card),Bar=R(bar);
    const sameLine=!!L&&!!M&&(Math.min(L.bottom,M.bottom)-Math.max(L.top,M.top)>Math.min(L.height,M.height)*.55);
    const gap=!!L&&!!M?M.left-L.right:null;
    const verticalGap=!!L&&!!M?M.top-L.bottom:null;
    return {
      value,label:label?.textContent.trim()||'',metric:metric?.textContent.trim()||'',counter:counter?.textContent.trim()||'',L,M,C,Card,Bar,sameLine,gap,verticalGap,
      separated:!!L&&!!M&&(!sameLine||gap>=8||verticalGap>=4),
      pageOverflow:document.documentElement.scrollWidth-window.innerWidth,
      cardOverflow:card?Math.max(card.scrollWidth-card.clientWidth,card.scrollHeight-card.clientHeight):0,
      leftDisplay:left?getComputedStyle(left).display:'',labelDisplay:label?getComputedStyle(label).display:'',metricDisplay:metric?getComputedStyle(metric).display:''
    };
  },{value,total});
}

async function runCase(route,width,theme){
  const ctx=await browser.newContext({viewport:{width,height:900}});
  const page=await ctx.newPage();
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
  page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
  await page.addInitScript(({key,theme})=>{
    try{localStorage.removeItem(key);localStorage.setItem('p120_web_theme_v16',theme)}catch{}
    window.__P120_CTA_TIMELINE=[];const t0=performance.now();
    const f=()=>{const c=document.querySelector('.mobile-bottom-nav button.cta');if(c){const r=c.getBoundingClientRect();if(r.width&&r.height){const s=getComputedStyle(c),i=c.querySelector('.mobile-nav-icon'),si=i?getComputedStyle(i):null;window.__P120_CTA_TIMELINE.push({t:Math.round(performance.now()-t0),bg:s.backgroundImage,bgc:s.backgroundColor,color:s.color,iconBg:si?.backgroundColor||'',iconColor:si?.color||''})}}if(performance.now()-t0<900)requestAnimationFrame(f)};requestAnimationFrame(f);
  },{key:route.key,theme});

  const result={route:route.id,width,theme,claimed:route.claimed,canonical:route.canonical,errors};
  try{
    const response=await page.goto(BASE+route.path,{waitUntil:'domcontentloaded',timeout:20000});result.http=response?.status()||0;
    await page.waitForSelector('.mobile-bottom-nav button.cta',{timeout:8000});await page.waitForTimeout(180);

    // HOME — real state.
    result.home=await snap(page);
    const homeSig=result.home?sig(result.home):null;

    // Direct CSS-state toggle independently isolates .active cascade behavior at this exact theme/width/locale.
    await page.evaluate(()=>document.querySelector('.mobile-bottom-nav button.cta')?.classList.add('active'));
    result.cssActive=await snap(page);
    await page.evaluate(()=>document.querySelector('.mobile-bottom-nav button.cta')?.classList.remove('active'));

    // PREFLIGHT — real navigation state.
    await page.click('.mobile-bottom-nav [data-mobile-start]');await page.waitForSelector('#consent',{timeout:6000});await page.waitForTimeout(50);
    result.preflight=await snap(page);
    // Actual press state while CTA is active.
    if(result.preflight?.rect?.width){const r=result.preflight.rect;await page.mouse.move((r.left+r.right)/2,(r.top+r.bottom)/2);await page.mouse.down();result.press=await snap(page);await page.mouse.up()}

    // TEST — real assessment state.
    await page.check('#consent');await page.click('#start');await page.waitForSelector('.choice',{timeout:6000});await page.waitForTimeout(50);
    result.test=await snap(page);

    // Create one legitimate response, then return Home -> actual resumable state.
    await page.locator('.choice').first().click();await page.waitForTimeout(70);
    await page.click('.mobile-bottom-nav [data-home]');await page.waitForTimeout(70);
    result.savedResume=await snap(page);

    // Theme switching in a real resumable state; CTA must remain primary and stable.
    result.switches=[];
    for(const target of themes){
      const method=await page.evaluate(t=>{const b=document.querySelector(`[data-set-theme="${t}"]`);if(!b)return 'missing';b.click();return 'control-click'},target);
      await page.waitForTimeout(70);result.switches.push({target,method,s:await snap(page)});
    }
    // Return to requested starting theme before progress check.
    await page.evaluate(t=>document.querySelector(`[data-set-theme="${t}"]`)?.click(),theme);await page.waitForTimeout(60);

    // Seed exactly 7 answered items in the current route's own state key => actual 4% runtime after reload.
    const seeded=await page.evaluate(({key,locale})=>{
      const ids=(window.P120_INSTRUMENT?.items||[]).map(x=>x.id),responses={};for(const id of ids.slice(0,7))responses[id]=3;
      let s={};try{s=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
      s={...s,participantId:s.participantId||'P120-INDEPENDENT-AUDIT',sessionLocale:locale,screen:'home',itemIndex:0,responses,lastSavedAt:new Date().toISOString()};
      localStorage.setItem(key,JSON.stringify(s));return {count:ids.length};
    },{key:route.key,locale:route.locale});
    result.itemCount=seeded.count;
    await page.reload({waitUntil:'domcontentloaded',timeout:20000});await page.waitForSelector('[data-mobile-menu]',{timeout:8000});await page.waitForTimeout(100);
    result.resume4=await snap(page);
    await page.click('[data-mobile-menu]');await page.waitForSelector('.mobile-menu-progress',{state:'visible',timeout:6000});await page.waitForTimeout(80);
    result.progressActualText=await page.locator('.mobile-menu-progress-top').innerText();
    result.progress4=await progressGeometry(page,4,seeded.count);
    result.progress10=await progressGeometry(page,10,seeded.count);
    result.progress100=await progressGeometry(page,100,seeded.count);

    if(width===390){await page.screenshot({path:path.join(OUT,`${clean(route.id)}-${width}-${theme}-menu-progress.png`),fullPage:true})}

    const timelineStyles=result.home?[...new Set(result.home.timeline.map(x=>[x.bg,x.bgc,x.color,x.iconBg,x.iconColor].join('|')))]:[];
    result.checks={
      httpOk:result.http>0&&result.http<400,
      homeInactive:!!result.home&&!result.home.active,
      cssActivePreservesPrimary:!!result.cssActive&&homeSig===sig(result.cssActive),
      preflightActive:!!result.preflight?.active,
      preflightPreservesPrimary:!!result.preflight&&homeSig===sig(result.preflight),
      testActive:!!result.test?.active,
      testPreservesPrimary:!!result.test&&homeSig===sig(result.test),
      savedResumeInactive:!!result.savedResume&&!result.savedResume.active,
      savedResumePreservesPrimary:!!result.savedResume&&homeSig===sig(result.savedResume),
      pressPreservesPrimary:!!result.press&&result.preflight?.bg===result.press.bg&&result.preflight?.color===result.press.color&&result.preflight?.iconColor===result.press.iconColor,
      expectedText:!!result.home&&result.home.color===expectedText[theme]&&result.home.iconColor===expectedText[theme],
      oneAsset:!!result.home&&result.home.assetLinks.length===1&&result.home.assetSheets.length===1,
      noCtaOverflow:[result.home,result.preflight,result.test,result.savedResume].filter(Boolean).every(x=>x.pageOverflow<=1&&x.ownOverflow<=1),
      headerPreserved:[result.home,result.preflight,result.test,result.savedResume].filter(Boolean).every(x=>x.headerMarks===1),
      noFirstPaintRace:timelineStyles.length<=1,
      themeSwitchWorks:result.switches.every(x=>x.method==='control-click'&&x.s?.theme===x.target),
      actual4Percent:/4%/.test(result.progressActualText),
      progressSeparated:[result.progress4,result.progress10,result.progress100].every(x=>x.separated),
      progressNoOverflow:[result.progress4,result.progress10,result.progress100].every(x=>x.pageOverflow<=1&&x.cardOverflow<=1)
    };
  }catch(e){result.error=e.message}
  rows.push(result);
  for(const v of [4,10,100]) if(result[`progress${v}`]) progressRows.push({route:route.id,width,theme,value:v,data:result[`progress${v}`]});
  await ctx.close();
}

// Execute in bounded parallel batches to keep the audit fast but deterministic.
const cases=[];for(const r of routes)for(const w of widths)for(const t of themes)cases.push([r,w,t]);
const concurrency=4;
for(let i=0;i<cases.length;i+=concurrency){await Promise.all(cases.slice(i,i+concurrency).map(([r,w,t])=>runCase(r,w,t)))}
await browser.close();

// Contrast review of declared PASS 2 endpoints.
function rgb(hex){hex=hex.replace('#','');return [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255)}
function lum(hex){const c=rgb(hex).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function contrast(a,b){const A=lum(a),B=lum(b);return (Math.max(A,B)+.05)/(Math.min(A,B)+.05)}
const contrastAudit={
  graphite:{fg:'#F5EFE5',bgs:['#667F7B','#49635F']},museum:{fg:'#FFF9EC',bgs:['#337F79','#255F5C']}
};
for(const o of Object.values(contrastAudit)){o.ratios=o.bgs.map(bg=>({bg,ratio:+contrast(o.fg,bg).toFixed(2)}));o.worst=Math.min(...o.ratios.map(x=>x.ratio))}

const ctaBlocking=[],ctaMinor=[],progressFindings=[];
for(const r of rows.filter(x=>x.claimed)){
  if(r.error||r.errors?.length){ctaBlocking.push(`${r.route}/${r.width}/${r.theme}: runtime error`);continue}
  for(const k of ['httpOk','homeInactive','cssActivePreservesPrimary','preflightActive','preflightPreservesPrimary','testActive','testPreservesPrimary','savedResumeInactive','savedResumePreservesPrimary','pressPreservesPrimary','expectedText','oneAsset','noCtaOverflow','headerPreserved','noFirstPaintRace','themeSwitchWorks']) if(r.checks?.[k]===false) ctaBlocking.push(`${r.route}/${r.width}/${r.theme}: ${k}`);
}
if(!sourceAuthority.integration['ru-system'])ctaMinor.push('RU canonical /system/ does not load the PASS 2 CTA stylesheet, while /en/system/ does; authority coverage is asymmetric.');
const ruSystem=rows.filter(x=>x.route==='ru-system');
if(ruSystem.some(r=>r.checks&&!r.checks.oneAsset))ctaMinor.push('RU canonical /system/ is outside the isolated PASS 2 asset authority in all audited widths/themes.');
if(contrastAudit.graphite.worst<4.5)ctaMinor.push(`Graphite CTA gradient reaches ${contrastAudit.graphite.worst}:1 text contrast at its lighter endpoint (<4.5:1 for small CTA text).`);
if(contrastAudit.museum.worst<4.5)ctaMinor.push(`Museum CTA gradient reaches ${contrastAudit.museum.worst}:1 at its lighter endpoint, marginally below 4.5:1.`);
if(!sourceAuthority.assessmentBinding||!sourceAuthority.renderBinding)ctaBlocking.push('Source binding for transition/results active CTA could not be independently confirmed.');

for(const r of rows){
  if(r.error||!r.checks){progressFindings.push(`${r.route}/${r.width}/${r.theme}: runtime evidence gap`);continue}
  if(!r.checks.actual4Percent)progressFindings.push(`${r.route}/${r.width}/${r.theme}: actual 4% session not rendered`);
  if(!r.checks.progressSeparated)progressFindings.push(`${r.route}/${r.width}/${r.theme}: 4/10/100 metric remains visually merged with label`);
  if(!r.checks.progressNoOverflow)progressFindings.push(`${r.route}/${r.width}/${r.theme}: progress card overflow`);
}

const CTA_blocking=uniq(ctaBlocking),CTA_minor=uniq(ctaMinor),PROGRESS=uniq(progressFindings);
const CTA_01=CTA_blocking.length?'FAIL':(CTA_minor.length?'PASS WITH MINOR FINDINGS':'PASS');
const PROGRESS_01=PROGRESS.length?'CORRECTION REQUIRED':'PASS';
const combined=CTA_01.startsWith('PASS')&&PROGRESS_01==='PASS'?'PASS / BOTH CLOSED':CTA_01.startsWith('PASS')?'PARTIAL PASS — CTA CLOSED / PROGRESS OPEN':'FAIL — REGRESSION REMAINS';

const report={document:'P-120 WEB — INDEPENDENT MOBILE UI REGRESSION AUDIT',version:'v3',auditOnly:true,sourceAuthority,contrastAudit,matrix:{routes:routes.map(x=>x.id),widths,themes,actualStates:['Home','Preflight','Test active','Saved resume','menu opened'],sourceBoundStates:['Transition','Results'],progressValues:[4,10,100]},verdicts:{CTA_01,PROGRESS_01,combined},findings:{CTA_blocking,CTA_minor,PROGRESS},counts:{cases:rows.length,progressGeometryCases:progressRows.length},rows,progressRows};
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
const md=[
  '# P-120 WEB — INDEPENDENT MOBILE UI REGRESSION AUDIT','',
  `AUDIT STATUS: COMPLETE`,`CTA-01: ${CTA_01}`,`PROGRESS-01: ${PROGRESS_01}`,`FINAL COMBINED VERDICT: ${combined}`,'',
  `Runtime route/width/theme cases: ${rows.length}`,`Progress 4/10/100 geometry cases: ${progressRows.length}`,`CTA blocking findings: ${CTA_blocking.length}`,`CTA minor findings: ${CTA_minor.length}`,`PROGRESS findings: ${PROGRESS.length}`,'',
  '## CTA-01 minor findings',...CTA_minor.map(x=>`- ${x}`),'',
  '## PROGRESS-01',PROGRESS_01==='PASS'?'- No defect reproduced.':'- CORRECTION REQUIRED. The left progress unit has no dedicated stack/gap authority; label and percentage remain inline siblings, reproducing the observed merge.','',
  '## Freeze boundary','- Audit-only: no production source modification.','- Global header brand authority and Why P-120 were not reopened.','- Questionnaire, scoring, persistence, privacy, safety and scientific architecture were not modified.'
];
if(CTA_blocking.length)md.splice(md.indexOf('## PROGRESS-01'),0,'## CTA-01 blocking findings',...CTA_blocking.map(x=>`- ${x}`),'');
fs.writeFileSync(path.join(OUT,'REPORT.md'),md.join('\n')+'\n');
console.log(md.join('\n'));
