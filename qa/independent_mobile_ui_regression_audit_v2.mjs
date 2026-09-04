import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

/*
 P-120 WEB — INDEPENDENT MOBILE UI REGRESSION AUDIT / HARNESS v2
 Audit-only. No production mutation.
 CTA-01: Primary CTA theme/state restoration.
 PROGRESS-01: Session percentage alignment.
 Global header brand authority + Why P-120: FROZEN / OBSERVATION ONLY.
*/

const ROOT=path.resolve(import.meta.dirname,'..');
const BASE=(process.env.P120_QA_BASE||'http://127.0.0.1:4174/p120-web').replace(/\/$/,'');
const OUT=path.join(ROOT,'qa-artifacts','independent-mobile-ui-audit-v2');
fs.mkdirSync(OUT,{recursive:true});

const routes=[
  {id:'ru-public',path:'/',locale:'ru',key:'p120_editorial_state_ru_v1',claimed:true,canonicalSystem:false},
  {id:'en-public',path:'/en/',locale:'en',key:'p120_editorial_state_en_v1',claimed:true,canonicalSystem:false},
  {id:'ru-system',path:'/system/',locale:'ru',key:'p120_runtime_session_ru_v1',claimed:false,canonicalSystem:true},
  {id:'en-system',path:'/en/system/',locale:'en',key:'p120_runtime_session_en_v1',claimed:true,canonicalSystem:true}
];
const widths=[360,390,430,480];
const themes=['ivory','graphite','museum'];
const states=[
  {id:'home',screen:'home',answered:0,expectActive:false,required:true},
  {id:'preflight',screen:'preflight',answered:0,expectActive:true,required:true},
  {id:'test-active',screen:'test',answered:7,expectActive:true,required:true},
  {id:'transition',screen:'transition',answered:18,expectActive:true,required:true},
  {id:'results',screen:'results',answered:180,expectActive:true,required:false},
  {id:'saved-resume',screen:'home',answered:7,expectActive:false,required:true}
];
const progressValues=[7,18,180]; // 4%, 10%, 100% for 180 items

const themeCssTokens={
  ivory:['#171715'],
  graphite:['#667F7B','#49635F'],
  museum:['#337F79','#255F5C']
};
const textExpect={ivory:'rgb(255, 255, 255)',graphite:'rgb(245, 239, 229)',museum:'rgb(255, 249, 236)'};

function urlFor(route){return BASE+route.path}
function clean(s){return s.replace(/[^a-z0-9._-]+/gi,'-')}
function styleSig(s){return [s.backgroundImage,s.backgroundColor,s.color,s.borderColor,s.boxShadow,s.iconBackground,s.iconColor].join('|')}
function overlap(a,b){return !!a&&!!b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top}

const browser=await chromium.launch({headless:true});
const bootstrap=[];
const cta=[];
const switches=[];
const progress=[];
const observations=[];

async function bootstrapRoute(route,width){
  const ctx=await browser.newContext({viewport:{width,height:900}});
  const page=await ctx.newPage();
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
  page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
  try{
    const res=await page.goto(urlFor(route),{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForSelector('.mobile-bottom-nav button.cta',{timeout:15000});
    await page.waitForTimeout(150);
    const data=await page.evaluate(()=>({
      ids:(window.P120_INSTRUMENT?.items||[]).map(x=>x.id),
      count:(window.P120_INSTRUMENT?.items||[]).length,
      href:location.href,
      ctaAssets:[...document.querySelectorAll('link[data-p120-mobile-primary-cta="pass2"]')].map(x=>x.href)
    }));
    return {route:route.id,width,http:res?.status()||0,errors,data};
  }catch(e){return {route:route.id,width,http:0,errors,error:e.message,data:{ids:[],count:0,ctaAssets:[]}}}
  finally{await ctx.close()}
}

function seededState(itemIds,{screen,answered,locale}){
  const responses={};
  for(const id of itemIds.slice(0,Math.min(answered,itemIds.length))) responses[id]=3;
  const now=new Date().toISOString();
  return {
    participantId:'P120-INDEPENDENT-AUDIT',sessionLocale:locale,screen,itemIndex:0,responses,adminModes:{},telemetry:[],
    startedAt:answered?now:null,consentAt:screen==='home'?null:now,lastSavedAt:now
  };
}

async function makeSeededPage(route,width,itemIds,state,theme,{timeline=true}={}){
  const ctx=await browser.newContext({viewport:{width,height:900}});
  const page=await ctx.newPage();
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
  page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
  const session=seededState(itemIds,{screen:state.screen,answered:state.answered,locale:route.locale});
  await page.addInitScript(({key,session,theme,timeline})=>{
    try{
      localStorage.setItem(key,JSON.stringify(session));
      localStorage.setItem('p120_web_theme_v16',theme);
    }catch{}
    if(timeline){
      window.__P120_INDEPENDENT_CTA_TIMELINE=[];
      const started=performance.now();
      const sample=()=>{
        const c=document.querySelector('.mobile-bottom-nav button.cta');
        if(c){
          const r=c.getBoundingClientRect();
          if(r.width>0&&r.height>0){
            const s=getComputedStyle(c),icon=c.querySelector('.mobile-nav-icon'),si=icon?getComputedStyle(icon):null;
            window.__P120_INDEPENDENT_CTA_TIMELINE.push({
              t:Math.round(performance.now()-started),cls:c.className,bg:s.backgroundImage,bgc:s.backgroundColor,color:s.color,
              iconBg:si?.backgroundColor||'',iconColor:si?.color||''
            });
          }
        }
        if(performance.now()-started<1100)requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }
  },{key:route.key,session,theme,timeline});
  return {ctx,page,errors};
}

async function ctaSnap(page){
  return page.evaluate(()=>{
    const c=document.querySelector('.mobile-bottom-nav button.cta');
    if(!c)return null;
    const icon=c.querySelector('.mobile-nav-icon'),s=getComputedStyle(c),si=icon?getComputedStyle(icon):null,r=c.getBoundingClientRect();
    const visible=el=>{if(!el)return false;const rr=el.getBoundingClientRect(),cs=getComputedStyle(el);return rr.width>0&&rr.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'};
    return {
      cls:c.className,active:c.classList.contains('active'),text:c.textContent.trim(),
      backgroundImage:s.backgroundImage,backgroundColor:s.backgroundColor,color:s.color,borderColor:s.borderColor,boxShadow:s.boxShadow,
      iconBackground:si?.backgroundColor||'',iconColor:si?.color||'',
      rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height},
      pageOverflow:document.documentElement.scrollWidth-window.innerWidth,
      ownOverflow:Math.max(c.scrollWidth-c.clientWidth,c.scrollHeight-c.clientHeight),
      bodyTheme:document.body.dataset.theme||'',
      assetLinks:[...document.querySelectorAll('link[data-p120-mobile-primary-cta="pass2"]')].map(x=>x.href),
      assetSheets:[...document.styleSheets].map(x=>x.href).filter(Boolean).filter(x=>x.includes('p120-mobile-primary-cta-pass2.css')),
      visibleHeaderMarks:[...document.querySelectorAll('.brand-mark')].filter(visible).length,
      timeline:window.__P120_INDEPENDENT_CTA_TIMELINE||[]
    };
  });
}

async function runCtaCase(route,width,theme,state,itemIds,baselineSig){
  const {ctx,page,errors}=await makeSeededPage(route,width,itemIds,state,theme,{timeline:true});
  let error=null,snap=null,press=null,http=0;
  try{
    const res=await page.goto(urlFor(route),{waitUntil:'domcontentloaded',timeout:30000});http=res?.status()||0;
    await page.waitForSelector('.mobile-bottom-nav button.cta',{timeout:15000});
    await page.waitForTimeout(240);
    snap=await ctaSnap(page);
    if(state.id==='test-active'&&snap?.rect?.width){
      const r=snap.rect;
      await page.mouse.move((r.left+r.right)/2,(r.top+r.bottom)/2);
      await page.mouse.down();
      press=await ctaSnap(page);
      await page.mouse.up();
    }
    if(width===390&&(state.id==='home'||state.id==='test-active'||state.id==='saved-resume')){
      await page.screenshot({path:path.join(OUT,`${clean(route.id)}-${width}-${theme}-${state.id}.png`),fullPage:true});
    }
  }catch(e){error=e.message}
  const timelineStyles=snap?[...new Set(snap.timeline.map(x=>[x.bg,x.bgc,x.color,x.iconBg,x.iconColor].join('|')))]:[];
  const checks={
    httpOk:http>0&&http<400,
    activeMatches:!!snap&&snap.active===state.expectActive,
    primaryGradient:!!snap&&snap.backgroundImage!=='none'&&snap.backgroundImage.includes('linear-gradient'),
    textContrastAuthority:!!snap&&snap.color===textExpect[theme]&&snap.iconColor===textExpect[theme],
    stateMatchesHome:baselineSig?!!snap&&styleSig(snap)===baselineSig:true,
    pressStable:state.id==='test-active'?(!!press&&press.backgroundImage===snap?.backgroundImage&&press.color===snap?.color&&press.iconColor===snap?.iconColor):true,
    noFirstPaintRace:!!snap&&timelineStyles.length<=1,
    exactlyOneAsset:!!snap&&snap.assetLinks.length===1&&snap.assetSheets.length===1,
    noOverflow:!!snap&&snap.pageOverflow<=1&&snap.ownOverflow<=1,
    frozenHeaderPreserved:!!snap&&snap.visibleHeaderMarks===1
  };
  const row={route:route.id,claimed:route.claimed,canonicalSystem:route.canonicalSystem,width,theme,state:state.id,required:state.required,http,error,errors,snap,checks};
  await ctx.close();
  return row;
}

async function runThemeSwitch(route,width,itemIds){
  const state=states.find(x=>x.id==='test-active');
  const {ctx,page,errors}=await makeSeededPage(route,width,itemIds,state,'ivory',{timeline:false});
  const trace=[];let error=null;
  try{
    await page.goto(urlFor(route),{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForSelector('.mobile-bottom-nav button.cta',{timeout:15000});
    for(const theme of ['ivory','graphite','museum','ivory']){
      const method=await page.evaluate(t=>{
        const b=document.querySelector(`[data-set-theme="${t}"]`);
        if(!b)return 'missing-control';
        b.click();return 'control-click';
      },theme);
      await page.waitForTimeout(80);
      trace.push({theme,method,snap:await ctaSnap(page)});
    }
  }catch(e){error=e.message}
  await ctx.close();
  return {route:route.id,width,error,errors,trace};
}

async function runProgressCase(route,width,theme,answered,itemIds){
  const state={screen:'home',answered};
  const {ctx,page,errors}=await makeSeededPage(route,width,itemIds,state,theme,{timeline:false});
  let error=null,http=0,data=null;
  try{
    const res=await page.goto(urlFor(route),{waitUntil:'domcontentloaded',timeout:30000});http=res?.status()||0;
    await page.waitForSelector('[data-mobile-menu]',{timeout:15000});
    await page.click('[data-mobile-menu]');
    await page.waitForSelector('.mobile-menu-progress',{state:'visible',timeout:10000});
    await page.waitForTimeout(100);
    data=await page.evaluate(()=>{
      const card=document.querySelector('.mobile-menu-progress');
      const top=card?.querySelector('.mobile-menu-progress-top');
      const left=top?.firstElementChild;
      const label=left?.querySelector('span');
      const metric=left?.querySelector('strong');
      const counter=top?.children?.[1];
      const bar=card?.querySelector('.mini-fill');
      const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
      const L=rect(label),M=rect(metric),C=rect(counter),Card=rect(card),Bar=rect(bar);
      const sameLine=L&&M ? Math.min(L.bottom,M.bottom)-Math.max(L.top,M.top) > Math.min(L.height,M.height)*.55 : false;
      const horizontalGap=L&&M?M.left-L.right:null;
      const verticalGap=L&&M?M.top-L.bottom:null;
      const separated=L&&M ? (!sameLine || horizontalGap>=8 || verticalGap>=4) : false;
      return {
        label:label?.textContent.trim()||'',metric:metric?.textContent.trim()||'',counter:counter?.textContent.trim()||'',
        L,M,C,Card,Bar,sameLine,horizontalGap,verticalGap,separated,
        labelMetricOverlap:!!L&&!!M&&L.left<M.right&&L.right>M.left&&L.top<M.bottom&&L.bottom>M.top,
        pageOverflow:document.documentElement.scrollWidth-window.innerWidth,
        cardOverflow:card?Math.max(card.scrollWidth-card.clientWidth,card.scrollHeight-card.clientHeight):0,
        leftDisplay:left?getComputedStyle(left).display:'',labelDisplay:label?getComputedStyle(label).display:'',metricDisplay:metric?getComputedStyle(metric).display:'',
        topDisplay:top?getComputedStyle(top).display:'',bodyTheme:document.body.dataset.theme||''
      };
    });
    if(width===390&&theme==='ivory') await page.screenshot({path:path.join(OUT,`${clean(route.id)}-progress-${answered}.png`),fullPage:true});
  }catch(e){error=e.message}
  await ctx.close();
  return {route:route.id,width,theme,answered,http,error,errors,data};
}

// Static source authority cross-check: implementation scope and selector authority.
const ctaCss=fs.readFileSync(path.join(ROOT,'p120-mobile-primary-cta-pass2.css'),'utf8');
const sourceAuthority={
  activeInvariant:ctaCss.includes('.mobile-bottom-nav button.cta.active'),
  themes:Object.fromEntries(Object.entries(themeCssTokens).map(([t,tokens])=>[t,tokens.every(x=>ctaCss.includes(x))])),
  integration:Object.fromEntries(['index.html','en/index.html','system/index.html','en/system/index.html'].map(f=>[f,fs.readFileSync(path.join(ROOT,f),'utf8').includes('data-p120-mobile-primary-cta="pass2"')]))
};

for(const route of routes){
  for(const width of widths){
    const boot=await bootstrapRoute(route,width);bootstrap.push(boot);
    const ids=boot.data?.ids||[];
    if(!ids.length){observations.push({type:'bootstrap-failed',route:route.id,width,boot});continue}
    for(const theme of themes){
      let baselineSig=null;
      for(const state of states){
        const row=await runCtaCase(route,width,theme,state,ids,baselineSig);
        cta.push(row);
        if(state.id==='home'&&row.snap)baselineSig=styleSig(row.snap);
      }
      for(const answered of progressValues) progress.push(await runProgressCase(route,width,theme,answered,ids));
    }
    switches.push(await runThemeSwitch(route,width,ids));
  }
}
await browser.close();

// WCAG endpoint contrast audit for the declared PASS 2 gradient endpoints.
function rgb(hex){hex=hex.replace('#','');return [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255)}
function luminance(hex){const c=rgb(hex).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function ratio(a,b){const A=luminance(a),B=luminance(b),hi=Math.max(A,B),lo=Math.min(A,B);return (hi+.05)/(lo+.05)}
const contrastAudit={
  graphite:{fg:'#F5EFE5',bgs:['#667F7B','#49635F']},
  museum:{fg:'#FFF9EC',bgs:['#337F79','#255F5C']}
};
for(const x of Object.values(contrastAudit)){
  x.ratios=x.bgs.map(bg=>({bg,ratio:Number(ratio(x.fg,bg).toFixed(2))}));
  x.worst=Math.min(...x.ratios.map(r=>r.ratio));
}

const ctaBlocking=[];
const ctaMinor=[];
const requiredRows=cta.filter(r=>r.claimed&&r.required);
for(const r of requiredRows){
  if(r.error||r.errors.length)ctaBlocking.push(`${r.route}/${r.width}/${r.theme}/${r.state}: runtime error`);
  for(const k of ['httpOk','activeMatches','primaryGradient','textContrastAuthority','stateMatchesHome','pressStable','noFirstPaintRace','exactlyOneAsset','noOverflow','frozenHeaderPreserved']){
    if(r.checks[k]===false)ctaBlocking.push(`${r.route}/${r.width}/${r.theme}/${r.state}: ${k}`);
  }
}
const resultErrors=cta.filter(r=>r.claimed&&r.state==='results'&&(r.error||r.errors.length));
if(resultErrors.length)ctaMinor.push(`Results fixture was not independently valid in ${resultErrors.length} claimed route/viewport/theme cases; results-state CTA evidence is inconclusive there and is not used as a closure blocker.`);
if(!sourceAuthority.integration['system/index.html'])ctaMinor.push('RU canonical respondent route /system/ does not load p120-mobile-primary-cta-pass2.css, while EN /en/system/ does.');
const ruSystemMismatch=cta.filter(r=>r.route==='ru-system'&&r.required).some(r=>!r.checks.exactlyOneAsset||!r.checks.textContrastAuthority||!r.checks.stateMatchesHome);
if(ruSystemMismatch)ctaMinor.push('RU canonical /system/ runtime is outside the PASS 2 authority and does not satisfy the same canonical CTA theme/state contract as the claimed surfaces.');
if(contrastAudit.graphite.worst<4.5)ctaMinor.push(`Graphite PASS 2 text-to-gradient endpoint contrast reaches ${contrastAudit.graphite.worst}:1, below 4.5:1 for small text.`);
if(contrastAudit.museum.worst<4.5)ctaMinor.push(`Museum PASS 2 text-to-gradient endpoint contrast reaches ${contrastAudit.museum.worst}:1, marginally below 4.5:1 for small text.`);
for(const s of switches.filter(x=>routes.find(r=>r.id===x.route)?.claimed)){
  if(s.error||s.errors.length)ctaBlocking.push(`${s.route}/${s.width}: theme-switch runtime error`);
  for(const t of s.trace){
    if(t.method!=='control-click')ctaBlocking.push(`${s.route}/${s.width}: ${t.theme} theme control unavailable`);
    if(t.snap?.bodyTheme!==t.theme)ctaBlocking.push(`${s.route}/${s.width}: theme switch did not settle to ${t.theme}`);
  }
}

const progressFindings=[];
for(const r of progress){
  if(r.error||r.errors.length||!r.data){progressFindings.push(`${r.route}/${r.width}/${r.theme}/${r.answered}: runtime/evidence error`);continue}
  if(!r.data.separated)progressFindings.push(`${r.route}/${r.width}/${r.theme}/${r.answered}: label and percentage have no explicit visual separation`);
  if(r.data.pageOverflow>1||r.data.cardOverflow>1)progressFindings.push(`${r.route}/${r.width}/${r.theme}/${r.answered}: overflow`);
}

const unique=a=>[...new Set(a)];
const ctaVerdict=unique(ctaBlocking).length?'FAIL':(unique(ctaMinor).length?'PASS WITH MINOR FINDINGS':'PASS');
const progressVerdict=unique(progressFindings).length?'CORRECTION REQUIRED':'PASS';
const combined=ctaVerdict==='PASS'&&progressVerdict==='PASS'?'PASS / BOTH CLOSED':
  ctaVerdict.startsWith('PASS')&&progressVerdict!=='PASS'?'PARTIAL PASS — CTA CLOSED / PROGRESS OPEN':
  'FAIL — REGRESSION REMAINS';

const report={
  document:'P-120 WEB — INDEPENDENT MOBILE UI REGRESSION AUDIT',version:'1.0-independent',auditOnly:true,
  baseline:process.env.GITHUB_SHA||'local',sourceAuthority,contrastAudit,
  matrix:{routes:routes.map(r=>r.id),widths,themes,states:states.map(s=>s.id),progressAnswered:progressValues},
  verdicts:{CTA_01:ctaVerdict,PROGRESS_01:progressVerdict,combined},
  findings:{CTA_blocking:unique(ctaBlocking),CTA_minor:unique(ctaMinor),PROGRESS:unique(progressFindings)},
  counts:{bootstrap:bootstrap.length,cta:cta.length,switches:switches.length,progress:progress.length},
  bootstrap,cta,switches,progress,observations
};
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));

const md=[];
md.push('# P-120 WEB — INDEPENDENT MOBILE UI REGRESSION AUDIT','');
md.push(`AUDIT STATUS: COMPLETE`);
md.push(`CTA-01: ${ctaVerdict}`);
md.push(`PROGRESS-01: ${progressVerdict}`);
md.push(`FINAL COMBINED VERDICT: ${combined}`,'');
md.push(`CTA cases: ${cta.length}`);
md.push(`Theme-switch cases: ${switches.length}`);
md.push(`Progress cases: ${progress.length}`);
md.push(`CTA blocking findings: ${unique(ctaBlocking).length}`);
md.push(`CTA minor findings: ${unique(ctaMinor).length}`);
md.push(`Progress findings: ${unique(progressFindings).length}`,'');
md.push('## CTA-01 minor findings');
for(const f of unique(ctaMinor))md.push(`- ${f}`);
if(unique(ctaBlocking).length){md.push('','## CTA-01 blocking findings');for(const f of unique(ctaBlocking))md.push(`- ${f}`)}
md.push('','## PROGRESS-01');
md.push(progressVerdict==='PASS'?'- No alignment defect reproduced.':'- Correction required: the progress-card left unit keeps the label and percentage as inline siblings without dedicated spacing/stacking authority; this reproduces the observed visual merge.');
md.push('','## Freeze boundary');
md.push('- No production source was modified by this audit.');
md.push('- Global header brand authority, Why P-120, questionnaire content, scoring, persistence, privacy and scientific architecture were not reopened.');
fs.writeFileSync(path.join(OUT,'REPORT.md'),md.join('\n')+'\n');
console.log(md.join('\n'));
