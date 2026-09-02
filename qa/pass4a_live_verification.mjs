import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const LIVE='https://unityplanet.github.io';
const PROJECT='/p120-web';
const ROOT=`${LIVE}${PROJECT}`;
const OUT='qa-evidence-pass4a-live';
const SHOTS=path.join(OUT,'screenshots');
await mkdir(SHOTS,{recursive:true});

const checks=[];
const failures=[];
const check=(id,pass,detail={})=>{const row={id,pass:Boolean(pass),...detail};checks.push(row);if(!pass)failures.push(row);return pass;};
const states=['CORE','EXTENDED','OUTCOMES','METHODS','LIBRARY'];
const viewports={desktop:{width:1440,height:1000},mobile:{width:390,height:844}};

async function visibleCyrillic(page){
  return page.evaluate(()=>{
    const root=document.querySelector('.science-page');
    if(!root)return [];
    const rows=[];
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let n;
    while((n=walker.nextNode())){
      const text=(n.nodeValue||'').replace(/\s+/g,' ').trim();
      if(!text||!/[А-Яа-яЁё]/.test(text))continue;
      const el=n.parentElement;
      if(!el)continue;
      const style=getComputedStyle(el);
      if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0||!el.getClientRects().length)continue;
      rows.push({text,tag:el.tagName.toLowerCase(),id:el.id||null,cls:typeof el.className==='string'?el.className:null});
    }
    return [...new Map(rows.map(x=>[`${x.text}|${x.tag}|${x.id}|${x.cls}`,x])).values()].slice(0,100);
  });
}

async function selectBase(page,state){
  if(state==='CORE') await page.evaluate(()=>window.P120ScientificBase?.setBase('CORE'));
  else await page.locator(`[data-p120-science-base="${state}"]`).click();
  await page.waitForFunction(expected=>document.documentElement.dataset.p120ScienceActiveBase===expected,state,{timeout:7000});
  await page.waitForTimeout(150);
}

async function verify(browser,locale,viewportName,viewport){
  const isEn=locale==='en';
  const route=isEn?`${ROOT}/en/science/`:`${ROOT}/science/`;
  const label=`${locale.toUpperCase()} ${viewportName}`;
  const context=await browser.newContext({viewport});
  const page=await context.newPage();
  const consoleErrors=[];
  const pageErrors=[];
  const failedRequests=[];
  const responses=[];

  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('pageerror',e=>pageErrors.push(e.message));
  page.on('requestfailed',r=>failedRequests.push({url:r.url(),type:r.resourceType(),failure:r.failure()}));
  page.on('response',r=>responses.push({url:r.url(),status:r.status(),type:r.request().resourceType()}));

  const nav=await page.goto(route,{waitUntil:'domcontentloaded',timeout:30000});
  check(`${label}: page HTTP 200`,nav?.status()===200,{route,status:nav?.status()});
  try{
    await page.waitForFunction(()=>document.documentElement.dataset.p120ScientificBaseStatus==='pass'&&window.P120ScientificBase?.status?.pass===true,null,{timeout:15000});
    check(`${label}: Scientific Base runtime status PASS`,true);
  }catch(error){
    const diag=await page.evaluate(()=>({dataset:{...document.documentElement.dataset},api:window.P120ScientificBase?.status||null})).catch(()=>null);
    check(`${label}: Scientific Base runtime status PASS`,false,{error:String(error),diag});
  }
  await page.waitForTimeout(1200);

  const meta=await page.evaluate(()=>{
    const sci=document.querySelector('[data-p120-scientific-base-runtime]');
    const loc=document.querySelector('[data-p120-en-science-localization]');
    const atlas=document.querySelector('#p120-science-atlas');
    const visible=el=>Boolean(el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getClientRects().length);
    return {
      pageUrl:location.href,
      baseURI:document.baseURI,
      scienceRaw:sci?.getAttribute('src')||null,
      scienceResolved:sci?.src||null,
      localizationRaw:loc?.getAttribute('src')||null,
      localizationResolved:loc?.src||null,
      atlasExists:Boolean(atlas),
      atlasVisible:visible(atlas),
      activeBase:window.P120ScientificBase?.activeBaseId||null,
      extendedSetCount:document.querySelectorAll('#extended-research-set').length,
      scrollWidth:document.documentElement.scrollWidth,
      clientWidth:document.documentElement.clientWidth
    };
  });

  const expectedScience=`${ROOT}/p120-scientific-base-runtime-v1.0.js?v=sbm10`;
  const scienceResponse=responses.find(r=>r.url===expectedScience);
  check(`${label}: Scientific Base runtime resolves inside /p120-web/`,meta.scienceResolved===expectedScience,{raw:meta.scienceRaw,resolved:meta.scienceResolved,expected:expectedScience});
  check(`${label}: Scientific Base runtime HTTP 200`,scienceResponse?.status===200,{response:scienceResponse||null});

  if(isEn){
    const expectedLoc=`${ROOT}/p120-en-science-localization-runtime-v1.0.js?v=ensci10`;
    const locResponse=responses.find(r=>r.url===expectedLoc);
    check(`${label}: EN localization runtime resolves inside /p120-web/`,meta.localizationResolved===expectedLoc,{raw:meta.localizationRaw,resolved:meta.localizationResolved,expected:expectedLoc});
    check(`${label}: EN localization runtime HTTP 200`,locResponse?.status===200,{response:locResponse||null});
  }

  const sameOrigin=responses.filter(r=>{try{return new URL(r.url).origin===LIVE}catch{return false}});
  const escaped=[...new Map(sameOrigin.filter(r=>!new URL(r.url).pathname.startsWith(`${PROJECT}/`)).map(r=>[r.url,r])).values()];
  check(`${label}: no same-origin request escapes /p120-web/`,escaped.length===0,{escaped});
  check(`${label}: Scientific Evidence Atlas exists`,meta.atlasExists,{meta});
  check(`${label}: Scientific Evidence Atlas visible`,meta.atlasVisible,{meta});
  check(`${label}: CORE is default`,meta.activeBase==='CORE',{activeBase:meta.activeBase});

  for(const state of states){
    try{
      await selectBase(page,state);
      const active=await page.evaluate(()=>window.P120ScientificBase?.activeBaseId||null);
      check(`${label}: ${state} selectable`,active===state,{active});
    }catch(error){
      check(`${label}: ${state} selectable`,false,{error:String(error)});
    }
  }
  await selectBase(page,'CORE').catch(()=>{});

  if(isEn){
    await page.waitForTimeout(500);
    const cyr=await visibleCyrillic(page);
    check(`${label}: no visible unintended Cyrillic`,cyr.length===0,{cyrillic:cyr});
  }

  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  check(`${label}: no horizontal overflow`,overflow<=1,{overflow});
  check(`${label}: legacy #extended-research-set still present and untouched by PASS 4A behavior`,meta.extendedSetCount===1,{count:meta.extendedSetCount});

  const badSameOrigin=[...new Map(responses.filter(r=>{
    try{return new URL(r.url).origin===LIVE&&r.status>=400}catch{return false}
  }).map(r=>[`${r.url}|${r.status}`,r])).values()];
  const failedSameOrigin=failedRequests.filter(r=>{try{return new URL(r.url).origin===LIVE}catch{return false}});
  check(`${label}: no same-origin HTTP errors`,badSameOrigin.length===0,{badSameOrigin});
  check(`${label}: no same-origin failed requests`,failedSameOrigin.length===0,{failedSameOrigin});
  check(`${label}: no console errors`,consoleErrors.length===0,{consoleErrors});
  check(`${label}: no page errors`,pageErrors.length===0,{pageErrors});

  await page.screenshot({path:path.join(SHOTS,`${locale}-${viewportName}.png`),fullPage:true});
  await context.close();
  return {locale,viewportName,route,meta,scienceResponse:scienceResponse||null};
}

const browser=await chromium.launch({headless:true});
const evidence=[];
try{
  for(const locale of ['ru','en']){
    for(const [viewportName,viewport] of Object.entries(viewports)){
      evidence.push(await verify(browser,locale,viewportName,viewport));
    }
  }
} finally {
  await browser.close();
}

const report={
  document_id:'P120-WEB-PASS4A-LIVE-001',
  version:'1.0',
  date:'2026-09-02',
  target:'https://unityplanet.github.io/p120-web/',
  expectedProductionHead:'563c1a932702dd47c3608772311468a3f10628f1',
  status:failures.length?'FAIL':'PASS',
  checks_total:checks.length,
  checks_passed:checks.filter(x=>x.pass).length,
  checks_failed:failures.length,
  failures,
  checks,
  evidence,
  pass4bBoundary:'#extended-research-set observed only; no mutation performed'
};
await writeFile(path.join(OUT,'P120_PASS4A_LIVE_VERIFICATION_v1.0.json'),JSON.stringify(report,null,2));
await writeFile(path.join(OUT,'SUMMARY.txt'),`P120 WEB PASS 4A LIVE VERIFICATION\nSTATUS: ${report.status}\nCHECKS: ${report.checks_passed}/${report.checks_total}\nFAILURES: ${report.checks_failed}\nTARGET: ${report.target}\nEXPECTED HEAD: ${report.expectedProductionHead}\n`);
console.log(JSON.stringify({status:report.status,checks_total:report.checks_total,checks_passed:report.checks_passed,checks_failed:report.checks_failed,failures},null,2));
if(failures.length)process.exit(1);
