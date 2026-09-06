import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ORIGIN='http://127.0.0.1:4179';
const OUT='qa-evidence-webscience-pass4e-probe';
const SHOTS=path.join(OUT,'screenshots');
fs.mkdirSync(SHOTS,{recursive:true});

const viewports={
  narrow320:{width:320,height:800},
  mobile390:{width:390,height:844},
  tablet768:{width:768,height:1024},
  tablet1024:{width:1024,height:900},
  desktop1440:{width:1440,height:1000},
  hd1920:{width:1920,height:1080},
  uhd2560:{width:2560,height:1440}
};
const locales={ru:'/science/',en:'/en/science/'};
const bases=['CORE','EXTENDED','OUTCOMES','METHODS','LIBRARY'];
const representative=new Set([
  'ru-narrow320-LIBRARY','en-mobile390-LIBRARY','ru-tablet768-EXTENDED','en-tablet1024-METHODS',
  'ru-desktop1440-CORE','en-hd1920-LIBRARY','ru-uhd2560-METHODS','en-uhd2560-EXTENDED'
]);
const result={
  standard:'P120',document_id:'P120-WEBSCI-EXT-004-PASS4E-DIAGNOSTIC-PROBE',version:'v0.9',date:'2026-09-06',
  baseline:'89683b678b76dde7df1cdeccc05d6e8541573b5b',
  matrix:{locales:Object.keys(locales),viewports,bases},runs:[],summary:{}
};

function cssNum(v){const n=parseFloat(v);return Number.isFinite(n)?n:null;}
function ratio(line,font){const l=cssNum(line),f=cssNum(font);return l&&f?l/f:null;}

async function waitReady(page){
  await page.waitForFunction(()=>
    window.P120ScientificBase?.status?.pass===true&&
    window.P120SciencePublicationRenderer?.status?.pass===true&&
    window.P120ScienceGlobalLibrary?.status?.pass===true,
    null,{timeout:20000});
  await page.evaluate(()=>document.fonts.ready);
}

async function setBase(page,base){
  await page.evaluate(base=>window.P120ScientificBase.setBase(base),base);
  await page.waitForFunction(base=>window.P120ScientificBase?.activeBaseId===base,base,{timeout:7000});
  if(base!=='CORE')await page.waitForFunction(base=>{
    const panel=document.getElementById('p120-science-active-base');
    if(!panel)return false;
    if(base==='LIBRARY')return panel.dataset.p120Pass4cLibrary==='integrated-v0.7';
    return panel.dataset.p120Pass4bRenderer==='active';
  },base,{timeout:7000});
  await page.waitForTimeout(120);
}

async function inspect(page,locale,viewportName,base){
  return page.evaluate(({locale,viewportName,base})=>{
    const vw=document.documentElement.clientWidth;
    const vh=document.documentElement.clientHeight;
    const visible=el=>{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&parseFloat(s.opacity||'1')>0&&r.width>0&&r.height>0;
    };
    const sample=(sel)=>{
      const el=document.querySelector(sel); if(!el||!visible(el))return null;
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return {selector:sel,text:(el.textContent||'').trim().slice(0,180),fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,letterSpacing:s.letterSpacing,width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom,whiteSpace:s.whiteSpace,overflowWrap:s.overflowWrap,wordBreak:s.wordBreak};
    };
    const candidates=[
      '.science-hero h1','.science-hero .lead','.science-status-label','.science-status p',
      '#p120-science-atlas h2','#p120-science-atlas .section-split-head p',
      '#p120-science-active-base h2','#p120-science-active-base .section-split-head p',
      '#p120-science-active-base .p120-pass4b-module h3','#p120-science-active-base .p120-pass4b-module p',
      '#p120-science-active-base .p120-pass4c-ref','#p120-science-active-base .p120-pass4c-chip',
      '#p120-science-active-base .p120-pass4c-filter','#science-refs .ref-item'
    ].map(sample).filter(Boolean);

    const all=[...document.querySelectorAll('.science-page *,#p120-science-atlas *,#p120-science-active-base *')].filter(visible);
    const textEls=all.filter(el=>(el.textContent||'').trim().length>0&&![...el.children].some(ch=>(ch.textContent||'').trim().length>0));
    const viewportSpills=textEls.map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,cls:el.className||'',text:(el.textContent||'').trim().slice(0,120),left:r.left,right:r.right,width:r.width};}).filter(x=>x.left<-1||x.right>vw+1);
    const intrinsicOverflows=textEls.map(el=>({
      tag:el.tagName,cls:el.className||'',text:(el.textContent||'').trim().slice(0,120),
      scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,
      overflowX:getComputedStyle(el).overflowX,overflowY:getComputedStyle(el).overflowY
    })).filter(x=>x.scrollWidth>x.clientWidth+2&&x.clientWidth>0);

    const controls=[...document.querySelectorAll('#p120-science-atlas button,#p120-science-active-base button,#p120-science-active-base a,.science-subnav a,.p120-language-switch a')].filter(visible).map(el=>{
      const r=el.getBoundingClientRect();return {tag:el.tagName,cls:el.className||'',text:(el.textContent||'').trim().slice(0,80),width:r.width,height:r.height};
    });
    const smallTouch=controls.filter(x=>x.height<44||x.width<44);

    const plexWeightRisks=textEls.map(el=>{const s=getComputedStyle(el);return {tag:el.tagName,cls:el.className||'',text:(el.textContent||'').trim().slice(0,100),family:s.fontFamily,weight:s.fontWeight};}).filter(x=>/IBM Plex Sans/i.test(x.family)&&parseInt(x.weight,10)>700);
    const prohibitedFamily=textEls.map(el=>{const s=getComputedStyle(el);return {tag:el.tagName,cls:el.className||'',text:(el.textContent||'').trim().slice(0,100),family:s.fontFamily};}).filter(x=>/(^|,|\s)(Inter|JetBrains Mono|Noto Sans Mono|Arial|Calibri|Carlito|Liberation Sans|DejaVu Sans|Aptos)(,|$|\s)/i.test(x.family));

    const paragraphs=[...document.querySelectorAll('.science-page p,#p120-science-atlas p,#p120-science-active-base p,.p120-pass4c-citation')].filter(visible).map(el=>{const s=getComputedStyle(el);const f=parseFloat(s.fontSize),l=parseFloat(s.lineHeight);return {cls:el.className||'',text:(el.textContent||'').trim().slice(0,100),font:f,line:l,ratio:f&&l?l/f:null};});
    const lowLeading=paragraphs.filter(x=>x.ratio&&x.ratio<1.30);
    const tinyNarrative=paragraphs.filter(x=>x.font&&x.font<12);

    const topbar=document.querySelector('.topbar')?.getBoundingClientRect();
    const subnav=document.querySelector('.science-subnav')?.getBoundingClientRect();
    const stickyOverlap=topbar&&subnav?Math.max(0,topbar.bottom-subnav.top):0;
    const docOverflow=document.documentElement.scrollWidth-document.documentElement.clientWidth;

    const fontChecks={
      status:document.fonts.status,
      ibmPlexSans:document.fonts.check('400 16px "IBM Plex Sans"','P-120 Притяжение'),
      ibmPlexSans600:document.fonts.check('600 16px "IBM Plex Sans"','Evidence status'),
      ibmPlexMono:document.fonts.check('400 16px "IBM Plex Mono"','REF-070'),
      notoSerif:document.fonts.check('400 16px "Noto Serif"','Научная база'),
      notoSerifDisplay:document.fonts.check('600 32px "Noto Serif Display"','Scientific Base'),
      prata:document.fonts.check('400 24px Prata','P-120')
    };

    const library=base==='LIBRARY'?{
      refs:document.querySelectorAll('[data-p120-global-reference]').length,
      chips:document.querySelectorAll('.p120-pass4c-chip').length,
      longestChip:[...document.querySelectorAll('.p120-pass4c-chip')].map(el=>({text:(el.textContent||'').trim(),w:el.getBoundingClientRect().width,sw:el.scrollWidth,cw:el.clientWidth})).sort((a,b)=>b.text.length-a.text.length).slice(0,8)
    }:null;

    return {locale,viewportName,base,vw,vh,docOverflow,fontChecks,samples:candidates,viewportSpills,intrinsicOverflows,controls,smallTouch,plexWeightRisks,prohibitedFamily,paragraphs,lowLeading,tinyNarrative,sticky:{topbar:topbar?{top:topbar.top,bottom:topbar.bottom,height:topbar.height}:null,subnav:subnav?{top:subnav.top,bottom:subnav.bottom,height:subnav.height}:null,overlap:stickyOverlap},library};
  },{locale,viewportName,base});
}

const browser=await chromium.launch({headless:true});
try{
  for(const [locale,route] of Object.entries(locales)){
    for(const [viewportName,viewport] of Object.entries(viewports)){
      const context=await browser.newContext({viewport});
      const page=await context.newPage();
      const runtimeErrors=[];
      page.on('pageerror',e=>runtimeErrors.push(`pageerror: ${e.message}`));
      page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('Failed to load resource'))runtimeErrors.push(`console: ${m.text()}`);});
      await page.goto(`${ORIGIN}${route}`,{waitUntil:'domcontentloaded'});
      await waitReady(page);
      for(const base of bases){
        await setBase(page,base);
        const row=await inspect(page,locale,viewportName,base);
        row.runtimeErrors=[...runtimeErrors];
        result.runs.push(row);
        const key=`${locale}-${viewportName}-${base}`;
        if(representative.has(key))await page.screenshot({path:path.join(SHOTS,`${key}.png`),fullPage:false});
      }
      await context.close();
    }
  }
} finally {await browser.close();}

const all=result.runs;
result.summary={
  run_count:all.length,
  document_overflow_runs:all.filter(r=>r.docOverflow>1).length,
  viewport_spill_count:all.reduce((n,r)=>n+r.viewportSpills.length,0),
  intrinsic_overflow_count:all.reduce((n,r)=>n+r.intrinsicOverflows.length,0),
  small_touch_count:all.reduce((n,r)=>n+r.smallTouch.length,0),
  plex_synthetic_weight_risk_count:all.reduce((n,r)=>n+r.plexWeightRisks.length,0),
  prohibited_computed_family_count:all.reduce((n,r)=>n+r.prohibitedFamily.length,0),
  low_leading_count:all.reduce((n,r)=>n+r.lowLeading.length,0),
  tiny_narrative_count:all.reduce((n,r)=>n+r.tinyNarrative.length,0),
  sticky_overlap_runs:all.filter(r=>r.sticky.overlap>1).length,
  runtime_error_runs:all.filter(r=>r.runtimeErrors.length).length,
  font_check_failures:all.reduce((n,r)=>n+Object.entries(r.fontChecks).filter(([k,v])=>k!=='status'&&v!==true).length,0)
};
fs.writeFileSync(path.join(OUT,'P120_WEBSCI_EXT_PASS4_PASS4E_DIAGNOSTIC_PROBE_v0.9.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.summary,null,2));
