import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

/*
 P-120 WEB — INDEPENDENT MOBILE UI REGRESSION AUDIT
 CTA-01: primary CTA theme/state authority
 PROGRESS-01: session percentage alignment

 AUDIT-ONLY. No production mutation. Header brand authority and Why P-120 remain frozen.
*/

const ROOT=path.resolve(import.meta.dirname,'..');
const BASE=process.env.P120_QA_BASE||'http://127.0.0.1:4174/p120-web';
const OUT=path.join(ROOT,'qa-artifacts','independent-mobile-ui-audit');
fs.mkdirSync(OUT,{recursive:true});

const routes=[
  {id:'ru-public',path:'/',locale:'ru',key:'p120_editorial_state_ru_v1',claimed:true,canonicalSystem:false},
  {id:'en-public',path:'/en/',locale:'en',key:'p120_editorial_state_en_v1',claimed:true,canonicalSystem:false},
  {id:'ru-system',path:'/system/',locale:'ru',key:'p120_runtime_session_ru_v1',claimed:false,canonicalSystem:true},
  {id:'en-system',path:'/en/system/',locale:'en',key:'p120_runtime_session_en_v1',claimed:true,canonicalSystem:true}
];
const widths=[360,390,430,480];
const themes=['ivory','graphite','museum'];
const ctaStates=[
  {id:'home',screen:'home',answered:0,expectActive:false},
  {id:'preflight',screen:'preflight',answered:0,expectActive:true},
  {id:'test-active',screen:'test',answered:7,expectActive:true},
  {id:'transition',screen:'transition',answered:18,expectActive:true},
  {id:'results',screen:'results',answered:180,expectActive:true},
  {id:'saved-resume',screen:'home',answered:7,expectActive:false}
];
const progressValues=[7,18,180];
const themeExpect={
  ivory:{starts:['rgb(23, 23, 21)'],text:'rgb(255, 255, 255)',icon:'rgb(255, 255, 255)'},
  graphite:{starts:['rgb(102, 127, 123)','rgb(73, 99, 95)'],text:'rgb(245, 239, 229)',icon:'rgb(245, 239, 229)'},
  museum:{starts:['rgb(51, 127, 121)','rgb(37, 95, 92)'],text:'rgb(255, 249, 236)',icon:'rgb(255, 249, 236)'}
};

function styleSignature(x){return [x.backgroundImage,x.backgroundColor,x.color,x.borderColor,x.boxShadow,x.iconBackground,x.iconColor].join('|')}
function cssEscape(s){return String(s).replaceAll('/','-').replaceAll(' ','-')}

const browser=await chromium.launch({headless:true});
const cta=[];
const progress=[];
const structural=[];
const observations=[];

async function initialInfo(page,route){
  const response=await page.goto(BASE+route.path,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('.mobile-bottom-nav button.cta',{timeout:15000});
  return page.evaluate(()=>({
    itemIds:(window.P120_INSTRUMENT?.items||[]).map(x=>x.id),
    itemCount:(window.P120_INSTRUMENT?.items||[]).length,
    bodyTheme:document.body.dataset.theme||'',
    href:location.href
  })).then(x=>({...x,http:response?.status()||0}));
}

async function seed(page,route,info,{screen,answered,theme}){
  await page.evaluate(({key,screen,answered,theme,itemIds,locale})=>{
    const responses={};
    for(const id of itemIds.slice(0,answered)) responses[id]=3;
    const now=new Date().toISOString();
    localStorage.setItem(key,JSON.stringify({
      participantId:'P120-AUDIT',sessionLocale:locale,screen,itemIndex:0,responses,adminModes:{},telemetry:[],startedAt:answered?now:null,consentAt:screen==='home'?null:now,lastSavedAt:now
    }));
    localStorage.setItem('p120_web_theme_v16',theme);
  },{key:route.key,screen,answered,theme,itemIds:info.itemIds,locale:route.locale});
}

async function reloadWithTimeline(page){
  await page.addInitScript(()=>{
    window.__p120IndependentAuditTimeline=[];
    const started=performance.now();
    const tick=()=>{
      const c=document.querySelector('.mobile-bottom-nav button.cta');
      if(c){
        const s=getComputedStyle(c),i=c.querySelector('.mobile-nav-icon'),si=i?getComputedStyle(i):null;
        window.__p120IndependentAuditTimeline.push({
          t:Math.round(performance.now()-started),
          cls:c.className,
          bg:s.backgroundImage,
          bgc:s.backgroundColor,
          color:s.color,
          iconBg:si?.backgroundColor||'',
          iconColor:si?.color||''
        });
      }
      if(performance.now()-started<900) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('.mobile-bottom-nav button.cta',{timeout:15000});
  await page.waitForTimeout(220);
}

async function ctaSnapshot(page){
  return page.evaluate(()=>{
    const c=document.querySelector('.mobile-bottom-nav button.cta');
    const i=c?.querySelector('.mobile-nav-icon');
    const s=c?getComputedStyle(c):null,si=i?getComputedStyle(i):null;
    const r=c?.getBoundingClientRect();
    const links=[...document.querySelectorAll('link[data-p120-mobile-primary-cta="pass2"]')].map(x=>x.href);
    const sheetHrefs=[...document.styleSheets].map(x=>x.href).filter(Boolean).filter(x=>x.includes('p120-mobile-primary-cta-pass2.css'));
    const headerMarks=[...document.querySelectorAll('.brand-mark')].filter(el=>{const cs=getComputedStyle(el),rr=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&rr.width>0&&rr.height>0});
    return {
      exists:!!c,active:c?.classList.contains('active')||false,text:c?.textContent.trim()||'',
      backgroundImage:s?.backgroundImage||'',backgroundColor:s?.backgroundColor||'',color:s?.color||'',borderColor:s?.borderColor||'',boxShadow:s?.boxShadow||'',opacity:s?.opacity||'',
      iconBackground:si?.backgroundColor||'',iconColor:si?.color||'',
      rect:r?{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}:null,
      overflow:document.documentElement.scrollWidth-window.innerWidth,
      ctaClientOverflow:c?Math.max(c.scrollWidth-c.clientWidth,c.scrollHeight-c.clientHeight):0,
      assetLinks:links,assetSheets:sheetHrefs,
      visibleHeaderMarks:headerMarks.length,
      bodyTheme:document.body.dataset.theme||'',
      timeline:window.__p120IndependentAuditTimeline||[]
    };
  });
}

for(const route of routes){
  for(const width of widths){
    const context=await browser.newContext({viewport:{width,height:900}});
    const page=await context.newPage();
    const pageErrors=[];
    page.on('console',m=>{if(m.type()==='error')pageErrors.push(`console:${m.text()}`)});
    page.on('pageerror',e=>pageErrors.push(`pageerror:${e.message}`));
    let info;
    try{info=await initialInfo(page,route)}catch(e){observations.push({type:'route-load-failure',route:route.id,width,error:e.message});await context.close();continue}

    structural.push({route:route.id,width,http:info.http,itemCount:info.itemCount});

    for(const theme of themes){
      let baseline=null;
      for(const stateSpec of ctaStates){
        pageErrors.length=0;
        await seed(page,route,info,{...stateSpec,theme});
        let stateLoadError=null;
        try{await reloadWithTimeline(page)}catch(e){stateLoadError=e.message}
        let snap=null;
        if(!stateLoadError){
          try{snap=await ctaSnapshot(page)}catch(e){stateLoadError=e.message}
        }
        if(snap&&stateSpec.id==='home') baseline=snap;

        let press=null;
        if(snap&&stateSpec.id==='test-active'){
          try{
            const locator=page.locator('.mobile-bottom-nav button.cta');
            const box=await locator.boundingBox();
            if(box){
              await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
              await page.mouse.down();
              press=await ctaSnapshot(page);
              await page.mouse.up();
            }
          }catch(e){press={error:e.message}}
        }

        const expected=themeExpect[theme];
        const canonicalSurface=!!snap && expected.starts.every(x=>snap.backgroundImage.includes(x));
        const textMatch=!!snap && snap.color===expected.text && snap.iconColor===expected.icon;
        const stateMatchesBaseline=!!snap&&!!baseline ? styleSignature(snap)===styleSignature(baseline) : null;
        const pressSurfaceStable=press&&press.backgroundImage ? press.backgroundImage===snap.backgroundImage && press.color===snap.color && press.iconColor===snap.iconColor : null;
        const timelineSurfaces=snap?[...new Set(snap.timeline.map(x=>`${x.bg}|${x.bgc}|${x.color}|${x.iconBg}|${x.iconColor}`))]:[];
        const noFirstPaintSurfaceRace=!!snap && timelineSurfaces.length<=1;

        cta.push({
          route:route.id,claimed:route.claimed,canonicalSystem:route.canonicalSystem,width,theme,state:stateSpec.id,screen:stateSpec.screen,answered:stateSpec.answered,
          stateLoadError,errors:[...pageErrors],snap,
          checks:{
            expectedActive:stateSpec.expectActive,activeMatches:!!snap&&snap.active===stateSpec.expectActive,
            canonicalSurface,textMatch,stateMatchesBaseline,pressSurfaceStable,noFirstPaintSurfaceRace,
            singleAsset:!!snap&&snap.assetLinks.length===1&&snap.assetSheets.length===1,
            noOverflow:!!snap&&snap.overflow<=1&&snap.ctaClientOverflow<=1,
            headerMarkPreserved:!!snap&&snap.visibleHeaderMarks===1
          }
        });

        if(width===390 && (stateSpec.id==='home'||stateSpec.id==='test-active'||stateSpec.id==='saved-resume') && snap){
          await page.screenshot({path:path.join(OUT,`${cssEscape(route.id)}-390-${theme}-${stateSpec.id}.png`),fullPage:true});
        }
      }

      // Real theme-switch authority while CTA is active.
      pageErrors.length=0;
      await seed(page,route,info,{screen:'test',answered:7,theme:'ivory'});
      try{await reloadWithTimeline(page)}catch{}
      const switchTrace=[];
      for(const target of ['graphite','museum','ivory']){
        const method=await page.evaluate(t=>{
          const b=document.querySelector(`[data-set-theme="${t}"]`);
          if(b){b.click();return 'control-click'}
          document.body.dataset.theme=t;localStorage.setItem('p120_web_theme_v16',t);return 'fallback-direct';
        },target);
        await page.waitForTimeout(80);
        const s=await ctaSnapshot(page);
        switchTrace.push({target,method,s});
      }
      cta.push({route:route.id,width,theme:'switch-cycle',state:'test-active',switchTrace,errors:[...pageErrors]});

      // Progress card values 4%, 10%, 100% (7, 18, 180 of 180).
      for(const answered of progressValues){
        pageErrors.length=0;
        await seed(page,route,info,{screen:'home',answered,theme});
        let loadError=null;
        try{await page.reload({waitUntil:'domcontentloaded',timeout:30000});await page.waitForSelector('[data-mobile-menu]',{timeout:15000})}catch(e){loadError=e.message}
        if(!loadError){
          await page.click('[data-mobile-menu]');
          await page.waitForSelector('.mobile-menu-progress',{state:'visible',timeout:10000});
          await page.waitForTimeout(80);
        }
        const data=loadError?null:await page.evaluate(()=>{
          const card=document.querySelector('.mobile-menu-progress');
          const top=card?.querySelector('.mobile-menu-progress-top');
          const left=top?.firstElementChild;
          const label=left?.querySelector('span');
          const metric=left?.querySelector('strong');
          const counter=top?.children?.[1];
          const bar=card?.querySelector('.mini-fill');
          const rr=x=>x?(()=>{const r=x.getBoundingClientRect();return {x:r.x,y:r.y,left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}})():null;
          const L=rr(label),M=rr(metric),C=rr(counter),Card=rr(card),Bar=rr(bar);
          const horizontalGap=L&&M?M.left-L.right:null;
          const verticalGap=L&&M?M.top-L.bottom:null;
          const sameLine=L&&M?Math.min(L.bottom,M.bottom)-Math.max(L.top,M.top)>Math.min(L.height,M.height)*0.55:false;
          const visualSeparation=L&&M ? (!sameLine || horizontalGap>=8 || verticalGap>=4) : false;
          return {
            label:label?.textContent.trim()||'',metric:metric?.textContent.trim()||'',counter:counter?.textContent.trim()||'',
            labelRect:L,metricRect:M,counterRect:C,cardRect:Card,barRect:Bar,horizontalGap,verticalGap,sameLine,visualSeparation,
            overflow:document.documentElement.scrollWidth-window.innerWidth,
            cardOverflow:card?Math.max(card.scrollWidth-card.clientWidth,card.scrollHeight-card.clientHeight):0,
            topDisplay:top?getComputedStyle(top).display:'',leftDisplay:left?getComputedStyle(left).display:'',
            metricDisplay:metric?getComputedStyle(metric).display:'',labelDisplay:label?getComputedStyle(label).display:'',
            bodyTheme:document.body.dataset.theme||''
          };
        });
        progress.push({route:route.id,width,theme,answered,loadError,errors:[...pageErrors],data});
        if(width===390&&theme==='ivory'&&data){
          await page.screenshot({path:path.join(OUT,`${cssEscape(route.id)}-progress-${answered}.png`),fullPage:true});
        }
        if(!loadError){try{await page.click('[data-mobile-menu]')}catch{}}
      }
    }
    await context.close();
  }
}
await browser.close();

// Findings are deliberately computed from independent runtime evidence, not implementation-chat status.
const normalCta=cta.filter(x=>x.checks);
const claimedCta=normalCta.filter(x=>x.claimed);
const ruSystemCta=normalCta.filter(x=>x.route==='ru-system');
const ctaBlocking=[];
const ctaMinor=[];
for(const row of claimedCta){
  if(row.stateLoadError||row.errors?.length) ctaBlocking.push(`${row.route}/${row.width}/${row.theme}/${row.state}: runtime error`);
  for(const k of ['activeMatches','canonicalSurface','textMatch','singleAsset','noOverflow','headerMarkPreserved']) if(row.checks[k]===false) ctaBlocking.push(`${row.route}/${row.width}/${row.theme}/${row.state}: ${k}`);
  if(row.state!=='home'&&row.checks.stateMatchesBaseline===false) ctaBlocking.push(`${row.route}/${row.width}/${row.theme}/${row.state}: active/saved state changes primary CTA surface`);
  if(row.state==='test-active'&&row.checks.pressSurfaceStable===false) ctaBlocking.push(`${row.route}/${row.width}/${row.theme}: press state changes primary surface`);
  if(row.checks.noFirstPaintSurfaceRace===false) ctaBlocking.push(`${row.route}/${row.width}/${row.theme}/${row.state}: first-paint CTA surface race`);
}
const ruSystemMissing=ruSystemCta.some(x=>x.snap&&x.snap.assetLinks.length===0);
const ruSystemCanonicalMismatch=ruSystemCta.some(x=>x.snap&&!x.checks.canonicalSurface);
if(ruSystemMissing) ctaMinor.push('RU canonical /system/ route does not load PASS 2 CTA authority.');
if(ruSystemCanonicalMismatch) ctaMinor.push('RU canonical /system/ route does not match the stated canonical PASS 2 theme surfaces.');

// Worst-endpoint contrast from the declared canonical gradients (WCAG relative luminance, text vs each endpoint).
function hexRgb(h){h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255)}
function lum(h){const c=hexRgb(h).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function contrast(a,b){const A=lum(a),B=lum(b),hi=Math.max(A,B),lo=Math.min(A,B);return (hi+.05)/(lo+.05)}
const contrastAudit={
  ivory:['#FFFFFF','#171715','#263D3A'],
  graphite:['#F5EFE5','#667F7B','#49635F'],
  museum:['#FFF9EC','#337F79','#255F5C']
};
for(const [theme,[fg,...bgs]] of Object.entries(contrastAudit)){
  const ratios=bgs.map(bg=>({bg,ratio:Number(contrast(fg,bg).toFixed(2))}));
  contrastAudit[theme]={fg,ratios,worst:Math.min(...ratios.map(x=>x.ratio))};
}
if(contrastAudit.graphite.worst<4.5) ctaMinor.push(`Graphite canonical gradient has a worst-endpoint text contrast of ${contrastAudit.graphite.worst}:1 (<4.5:1 for small text).`);
if(contrastAudit.museum.worst<4.5) ctaMinor.push(`Museum canonical gradient has a worst-endpoint text contrast of ${contrastAudit.museum.worst}:1 (<4.5:1 for small text).`);

const progressBlocking=[];
for(const row of progress){
  if(row.loadError||row.errors?.length||!row.data){progressBlocking.push(`${row.route}/${row.width}/${row.theme}/${row.answered}: runtime/evidence error`);continue}
  if(!row.data.visualSeparation) progressBlocking.push(`${row.route}/${row.width}/${row.theme}/${row.answered}: session label and percentage are not visually separated`);
  if(row.data.overflow>1||row.data.cardOverflow>1) progressBlocking.push(`${row.route}/${row.width}/${row.theme}/${row.answered}: overflow`);
}

const ctaVerdict=ctaBlocking.length?'FAIL':(ctaMinor.length?'PASS WITH MINOR FINDINGS':'PASS');
const progressVerdict=progressBlocking.length?'CORRECTION REQUIRED':'PASS';
const combined=ctaVerdict==='PASS'&&progressVerdict==='PASS'?'PASS / BOTH CLOSED':
  ctaBlocking.length?'PARTIAL PASS — CTA IMPLEMENTATION NOT FULLY CLOSED / PROGRESS OPEN':
  progressVerdict!=='PASS'?'PARTIAL PASS — CTA CLOSED WITH MINOR FINDINGS / PROGRESS OPEN':'PASS WITH MINOR FINDINGS';

const report={
  document:'P-120 WEB — INDEPENDENT MOBILE UI REGRESSION AUDIT',
  classification:'MOBILE VISUAL / UX / CSS STATE AUTHORITY / RESPONSIVE REGRESSION',
  baseline:process.env.GITHUB_SHA||'local',
  scope:{routes:routes.map(x=>x.id),widths,themes,ctaStates:ctaStates.map(x=>x.id),progressAnswered:progressValues},
  verdicts:{CTA_01:ctaVerdict,PROGRESS_01:progressVerdict,combined},
  findings:{ctaBlocking:[...new Set(ctaBlocking)],ctaMinor:[...new Set(ctaMinor)],progressBlocking:[...new Set(progressBlocking)]},
  contrastAudit,
  structural,cta,progress,observations
};
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));

const md=[];
md.push('# P-120 WEB — INDEPENDENT MOBILE UI REGRESSION AUDIT','');
md.push(`CTA-01: ${ctaVerdict}`);
md.push(`PROGRESS-01: ${progressVerdict}`);
md.push(`COMBINED: ${combined}`,'');
md.push(`CTA RUNTIME ROWS: ${normalCta.length}`);
md.push(`PROGRESS RUNTIME ROWS: ${progress.length}`);
md.push(`CTA BLOCKING FINDINGS: ${[...new Set(ctaBlocking)].length}`);
md.push(`CTA MINOR FINDINGS: ${[...new Set(ctaMinor)].length}`);
md.push(`PROGRESS FINDINGS: ${[...new Set(progressBlocking)].length}`,'');
md.push('## CTA minor findings');
for(const x of [...new Set(ctaMinor)])md.push(`- ${x}`);
md.push('','## Progress finding summary');
if(progressBlocking.length)md.push('- The mobile menu progress left unit renders label + percentage as inline siblings with no explicit spacing/stacking authority; the defect is reproducible across the audited matrix.');
else md.push('- No session percentage alignment defect reproduced.');
md.push('','## Freeze boundary');
md.push('- Global header brand authority was observed only; no source mutation was performed.');
md.push('- Why P-120, questionnaire content, scoring, persistence, privacy and scientific architecture were not modified.');
fs.writeFileSync(path.join(OUT,'REPORT.md'),md.join('\n')+'\n');
console.log(md.join('\n'));
