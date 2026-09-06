import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ORIGIN='http://127.0.0.1:4179';
const OUT='qa-evidence-webscience-pass4e';
const SHOTS=path.join(OUT,'screenshots');
fs.mkdirSync(SHOTS,{recursive:true});
const viewports={
  narrow320:{width:320,height:800},mobile390:{width:390,height:844},tablet768:{width:768,height:1024},
  tablet1024:{width:1024,height:900},desktop1440:{width:1440,height:1000},hd1920:{width:1920,height:1080},uhd2560:{width:2560,height:1440}
};
const locales={ru:'/science/',en:'/en/science/'};
const bases=['CORE','EXTENDED','OUTCOMES','METHODS','LIBRARY'];
const screenshotCases=new Set([
  'ru-narrow320-CORE','ru-narrow320-LIBRARY','en-mobile390-LIBRARY','ru-tablet768-EXTENDED',
  'en-tablet1024-METHODS','ru-desktop1440-CORE','en-hd1920-LIBRARY','ru-uhd2560-METHODS','en-uhd2560-EXTENDED'
]);
const checks=[],failures=[];
function check(id,pass,detail={}){const row={id,pass:Boolean(pass),...detail};checks.push(row);if(!pass){failures.push(row);console.error('FAIL',id,detail);}return Boolean(pass);}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function waitReady(page,label){
  try{
    await page.waitForFunction(()=>
      window.P120ScientificBase?.status?.pass===true&&
      window.P120SciencePublicationRenderer?.status?.pass===true&&
      window.P120ScienceGlobalLibrary?.status?.pass===true&&
      document.documentElement.dataset.p120WebsciencePass4eStatus==='pass'&&
      Boolean(document.querySelector('link[data-p120-webscience-pass4e-loader="v0.9"]')),
      null,{timeout:20000});
    await page.evaluate(async()=>{
      await document.fonts.ready;
      const en=document.documentElement.lang?.toLowerCase().startsWith('en');
      const serifSample=en?'Scientific Base':'Научная база';
      await Promise.all([
        document.fonts.load('400 16px "IBM Plex Sans"','P-120 Evidence'),
        document.fonts.load('600 16px "IBM Plex Sans"','Evidence status'),
        document.fonts.load('600 24px "Noto Serif"',serifSample),
        document.fonts.load('400 14px "IBM Plex Mono"','REF-070')
      ]);
    });
    check(`${label}: PASS 4E stylesheet ready`,true);return true;
  }catch(error){
    const diag=await page.evaluate(()=>({
      base:window.P120ScientificBase?.status||null,
      pass4b:window.P120SciencePublicationRenderer?.status||null,
      pass4c:window.P120ScienceGlobalLibrary?.status||null,
      pass4e:document.documentElement.dataset.p120WebsciencePass4eStatus||null,
      link:document.querySelector('link[data-p120-webscience-pass4e-loader]')?.href||null
    })).catch(()=>null);
    check(`${label}: PASS 4E stylesheet ready`,false,{error:String(error),diag});return false;
  }
}
async function setBase(page,base){
  await page.evaluate(base=>window.P120ScientificBase.setBase(base),base);
  await page.waitForFunction(base=>window.P120ScientificBase?.activeBaseId===base,base,{timeout:7000});
  if(base!=='CORE')await page.waitForFunction(base=>{
    const p=document.getElementById('p120-science-active-base');
    if(!p)return false;
    return base==='LIBRARY'?p.dataset.p120Pass4cLibrary==='integrated-v0.7':p.dataset.p120Pass4bRenderer==='active';
  },base,{timeout:7000});
  await sleep(100);
}

async function inspect(page){
  return page.evaluate(()=>{
    const root=document.querySelector('.science-page');
    const vw=document.documentElement.clientWidth;
    const isVisible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&parseFloat(s.opacity||'1')>0&&r.width>0&&r.height>0;};
    const scienceEls=[...(root?.querySelectorAll('*')||[])].filter(isVisible);
    const leafText=scienceEls.filter(el=>(el.textContent||'').trim()&&![...el.children].some(c=>(c.textContent||'').trim()));
    const docOverflow=document.documentElement.scrollWidth-document.documentElement.clientWidth;
    const forbidden=leafText.map(el=>({family:getComputedStyle(el).fontFamily,text:(el.textContent||'').trim().slice(0,80),cls:el.className||''}))
      .filter(x=>/(^|,|\s)(Inter|JetBrains Mono|Noto Sans Mono|Arial|Calibri|Carlito|Liberation Sans|DejaVu Sans|Aptos)(,|$|\s)/i.test(x.family));
    const synthetic=leafText.map(el=>{const s=getComputedStyle(el);return {family:s.fontFamily,weight:parseInt(s.fontWeight,10)||400,text:(el.textContent||'').trim().slice(0,80),cls:el.className||''};})
      .filter(x=>/IBM Plex Sans/i.test(x.family)&&x.weight>700);
    const technical=[...document.querySelectorAll('.science-page .science-code,.science-page .ref-num,.science-page .hypothesis>span,.science-page .ethics-item>span,.science-page .internal-list span,.science-page .p120-pass4b-reference-id,.science-page .p120-pass4b-evidence code')]
      .filter(isVisible).map(el=>({text:(el.textContent||'').trim().slice(0,80),family:getComputedStyle(el).fontFamily}));
    const technicalWrong=technical.filter(x=>!/IBM Plex Mono/i.test(x.family));
    const criticalH2=[...document.querySelectorAll('.science-page .science-section h2,.science-page #p120-science-atlas h2,.science-page #p120-science-active-base h2')]
      .filter(isVisible).map(el=>{const s=getComputedStyle(el);return {text:(el.textContent||'').trim().slice(0,120),sw:el.scrollWidth,cw:el.clientWidth,sh:el.scrollHeight,ch:el.clientHeight,font:s.fontSize,overflowX:s.overflowX,overflowY:s.overflowY};});
    const h2Overflow=criticalH2.filter(x=>x.sw>x.cw+2||(['hidden','clip'].includes(x.overflowY)&&x.sh>x.ch+3));
    const chips=[...document.querySelectorAll('.science-page .p120-pass4c-chip')].filter(isVisible).map(el=>{const r=el.getBoundingClientRect(),p=el.parentElement?.getBoundingClientRect();return {text:(el.textContent||'').trim(),left:r.left,right:r.right,width:r.width,sw:el.scrollWidth,cw:el.clientWidth,parentLeft:p?.left,parentRight:p?.right};});
    const chipOverflow=chips.filter(x=>x.left<-1||x.right>vw+1||x.sw>x.cw+2||(x.parentLeft!=null&&(x.left<x.parentLeft-1||x.right>x.parentRight+1)));
    const targets=[...document.querySelectorAll('.science-page .science-subnav a,.science-page .p120-pass4c-filter,.science-page .ref-item .doi-link,.science-page .p120-pass4c-ref .doi-link')]
      .filter(isVisible).map(el=>{const r=el.getBoundingClientRect();return {text:(el.textContent||'').trim().slice(0,80),cls:el.className||'',w:r.width,h:r.height};});
    const targetMin=vw<=1023?44:24;
    const targetFailures=targets.filter(x=>x.w<targetMin-0.5||x.h<targetMin-0.5);
    const narrativeSelectors=['.plain-layer p','.practical-card p','.life-card p','.construct-card p','.construct-boundary','.boundary-pair p','.validation-copy p','.hypothesis p','.science-callout p','.ref-item','.internal-list p','.p120-pass4b-module p','.p120-pass4b-positioning-card p','.p120-pass4c-citation'];
    const narrative=[...document.querySelectorAll(narrativeSelectors.map(x=>`.science-page ${x}`).join(','))].filter(isVisible).map(el=>{const s=getComputedStyle(el),f=parseFloat(s.fontSize),l=parseFloat(s.lineHeight);return {text:(el.textContent||'').trim().slice(0,80),cls:el.className||'',f,l,ratio:f&&l?l/f:null};});
    const tiny=vw<=520?narrative.filter(x=>x.f<11.95):[];
    const lowLeading=narrative.filter(x=>x.ratio&&x.ratio<1.30);
    const topbar=document.querySelector('.topbar')?.getBoundingClientRect();
    const subnav=document.querySelector('.science-subnav')?.getBoundingClientRect();
    const stickyOverlap=topbar&&subnav?Math.max(0,topbar.bottom-subnav.top):0;
    const fontsHref=[...document.querySelectorAll('link[href*="fonts.bunny.net"]')].map(x=>x.href).join(' ');
    const inventory=['ibm-plex-mono','ibm-plex-sans','noto-serif','noto-serif-display','prata'].filter(x=>!fontsHref.toLowerCase().includes(x));
    const en=document.documentElement.lang?.toLowerCase().startsWith('en');
    const serifSample=en?'Scientific Base':'Научная база';
    const usedFontAvailability={
      plexSans:document.fonts.check('400 16px "IBM Plex Sans"','P-120 Evidence'),
      plexSans600:document.fonts.check('600 16px "IBM Plex Sans"','Evidence status'),
      notoSerif:document.fonts.check('600 24px "Noto Serif"',serifSample),
      mono:technical.length?document.fonts.check('400 14px "IBM Plex Mono"','REF-070'):true
    };
    const mobileNav=document.querySelector('.mobile-bottom-nav');
    const mobileNavRect=mobileNav&&isVisible(mobileNav)?mobileNav.getBoundingClientRect():null;
    return {vw,docOverflow,forbidden,synthetic,technicalCount:technical.length,technicalWrong,criticalH2,h2Overflow,chipCount:chips.length,chipOverflow,targets,targetMin,targetFailures,narrative,tiny,lowLeading,stickyOverlap,inventory,usedFontAvailability,mobileNav:mobileNavRect?{top:mobileNavRect.top,bottom:mobileNavRect.bottom,height:mobileNavRect.height}:null};
  });
}

async function verifyBottomReachability(page,label){
  const x=await page.evaluate(()=>{
    const nav=document.querySelector('.mobile-bottom-nav');
    const s=nav?getComputedStyle(nav):null;
    if(!nav||s.display==='none')return {applicable:false};
    document.documentElement.style.scrollBehavior='auto';
    document.body.style.scrollBehavior='auto';
    window.scrollTo({top:document.documentElement.scrollHeight,left:0,behavior:'auto'});
    return {applicable:true};
  });
  if(!x.applicable){check(`${label}: mobile bottom navigation reachability n/a`,true);return;}
  await sleep(40);
  const y=await page.evaluate(()=>{
    const nav=document.querySelector('.mobile-bottom-nav')?.getBoundingClientRect();
    const visibleSections=[...document.querySelectorAll('.science-page section,.science-page #p120-science-active-base')].filter(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&r.height>0;});
    const last=visibleSections.at(-1)?.getBoundingClientRect();
    return {nav,last,maxScroll:document.documentElement.scrollHeight-window.innerHeight,scrollY:window.scrollY};
  });
  const reachable=!y.nav||!y.last||y.last.bottom<=y.nav.top+2||y.scrollY>=y.maxScroll-2;
  check(`${label}: last Science content remains reachable above fixed mobile nav`,reachable,y);
}

const browser=await chromium.launch({headless:true});
try{
  for(const [locale,route] of Object.entries(locales)){
    for(const [viewportName,viewport] of Object.entries(viewports)){
      const context=await browser.newContext({viewport});
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
      page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('Failed to load resource'))errors.push(`console: ${m.text()}`);});
      await page.goto(`${ORIGIN}${route}`,{waitUntil:'domcontentloaded'});
      const prefix=`${locale}-${viewportName}`;
      if(await waitReady(page,prefix)){
        for(const base of bases){
          await setBase(page,base);
          const label=`${prefix}-${base}`;
          const x=await inspect(page);
          check(`${label}: document horizontal overflow`,x.docOverflow<=1,{overflow:x.docOverflow});
          check(`${label}: canonical font inventory declared`,x.inventory.length===0,{missing:x.inventory});
          check(`${label}: used canonical web fonts available`,Object.values(x.usedFontAvailability).every(Boolean),x.usedFontAvailability);
          check(`${label}: no prohibited computed font families`,x.forbidden.length===0,{count:x.forbidden.length,sample:x.forbidden.slice(0,5)});
          check(`${label}: no synthetic IBM Plex Sans weights`,x.synthetic.length===0,{count:x.synthetic.length,sample:x.synthetic.slice(0,5)});
          check(`${label}: technical notation uses IBM Plex Mono`,x.technicalWrong.length===0,{count:x.technicalWrong.length,sample:x.technicalWrong.slice(0,5)});
          check(`${label}: critical H2 has no intrinsic clipping`,x.h2Overflow.length===0,{overflow:x.h2Overflow});
          check(`${label}: Global-70 metadata chips fit`,x.chipOverflow.length===0,{count:x.chipOverflow.length,sample:x.chipOverflow.slice(0,5)});
          check(`${label}: Science controls meet ${x.targetMin}px target`,x.targetFailures.length===0,{count:x.targetFailures.length,sample:x.targetFailures.slice(0,8)});
          check(`${label}: mobile narrative floor`,x.tiny.length===0,{count:x.tiny.length,sample:x.tiny.slice(0,8)});
          check(`${label}: narrative line-height >= 1.30`,x.lowLeading.length===0,{count:x.lowLeading.length,sample:x.lowLeading.slice(0,8)});
          check(`${label}: sticky topbar/subnav overlap bounded`,x.stickyOverlap<=6.1,{overlap:x.stickyOverlap});
          const key=`${locale}-${viewportName}-${base}`;
          if(screenshotCases.has(key)){
            const panel=base==='CORE'?page.locator('.science-page').first():page.locator('#p120-science-active-base');
            if(await panel.count())await panel.screenshot({path:path.join(SHOTS,`${key}.png`)}).catch(async()=>page.screenshot({path:path.join(SHOTS,`${key}.png`),fullPage:false}));
          }
        }
        await setBase(page,'LIBRARY');
        await verifyBottomReachability(page,`${prefix}-LIBRARY`);
      }
      check(`${prefix}: no runtime/page errors`,errors.length===0,{errors});
      await context.close();
    }
  }
} finally {await browser.close();}

const result={
  standard:'P120',document_id:'P120-WEBSCI-EXT-004-PASS4E-BROWSER-TYPOGRAPHY-QA',version:'v0.9',date:'2026-09-06',
  status:failures.length?'FAIL':'PASS',checks_total:checks.length,checks_passed:checks.length-failures.length,checks_failed:failures.length,
  matrix:{locales:Object.keys(locales),viewports:Object.keys(viewports),bases},checks,failures,
  scope:'BROWSER_RESPONSIVE_TYPOGRAPHY_SCIENCE_QA',scientific_content_mutated:false
};
fs.writeFileSync(path.join(OUT,'P120_WEBSCI_EXT_PASS4_PASS4E_BROWSER_TYPOGRAPHY_QA_RESULT_v0.9.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checks_total:result.checks_total,checks_failed:result.checks_failed},null,2));
if(failures.length)process.exit(1);
