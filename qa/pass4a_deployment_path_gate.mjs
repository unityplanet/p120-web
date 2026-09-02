import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ORIGIN='http://127.0.0.1:4179';
const PROJECT='/p120-web';
const ROOT=`${ORIGIN}${PROJECT}`;
const OUT='qa-evidence-pass4a';
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
    const out=[];
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let n;
    while((n=walker.nextNode())){
      const text=(n.nodeValue||'').replace(/\s+/g,' ').trim();
      if(!text||!/[А-Яа-яЁё]/.test(text))continue;
      const el=n.parentElement;
      if(!el)continue;
      const s=getComputedStyle(el);
      if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)continue;
      if(!el.getClientRects().length)continue;
      out.push({text,tag:el.tagName.toLowerCase(),id:el.id||null,cls:el.className||null});
    }
    return [...new Map(out.map(x=>[`${x.text}|${x.tag}|${x.id}|${x.cls}`,x])).values()].slice(0,80);
  });
}

async function selectBase(page,base){
  if(base==='CORE') await page.evaluate(()=>window.P120ScientificBase?.setBase('CORE'));
  else await page.locator(`[data-p120-science-base="${base}"]`).click();
  await page.waitForFunction(expected=>document.documentElement.dataset.p120ScienceActiveBase===expected,base,{timeout:6000});
  await page.waitForTimeout(120);
}

async function testRoute(browser,{locale,viewportName,viewport}){
  const isEn=locale==='en';
  const route=isEn?`${ROOT}/en/science/`:`${ROOT}/science/`;
  const label=`${locale.toUpperCase()} ${viewportName}`;
  const context=await browser.newContext({viewport});
  const page=await context.newPage();
  const consoleErrors=[];
  const pageErrors=[];
  const badResponses=[];
  const failedRequests=[];
  const sameOriginRequests=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('pageerror',e=>pageErrors.push(e.message));
  page.on('response',r=>{
    const u=new URL(r.url());
    if(u.origin===ORIGIN)sameOriginRequests.push({url:r.url(),status:r.status(),type:r.request().resourceType()});
    if(r.status()>=400)badResponses.push({url:r.url(),status:r.status(),type:r.request().resourceType()});
  });
  page.on('requestfailed',r=>failedRequests.push({url:r.url(),type:r.resourceType(),failure:r.failure()}));

  const nav=await page.goto(route,{waitUntil:'domcontentloaded',timeout:30000});
  check(`${label}: page HTTP 200`,nav?.status()===200,{status:nav?.status(),route});
  try{
    await page.waitForFunction(()=>document.documentElement.dataset.p120ScientificBaseStatus==='pass'&&window.P120ScientificBase?.status?.pass===true,null,{timeout:15000});
    check(`${label}: Scientific Base runtime PASS`,true);
  }catch(error){
    const diag=await page.evaluate(()=>({dataset:{...document.documentElement.dataset},api:window.P120ScientificBase?.status||null})).catch(()=>null);
    check(`${label}: Scientific Base runtime PASS`,false,{error:String(error),diag});
  }
  await page.waitForTimeout(900);

  const meta=await page.evaluate(()=>{
    const science=document.querySelector('[data-p120-scientific-base-runtime]');
    const enLoc=document.querySelector('[data-p120-en-science-localization]');
    const atlas=document.querySelector('#p120-science-atlas');
    const visible=el=>Boolean(el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getClientRects().length);
    return {
      pageUrl:location.href,
      baseURI:document.baseURI,
      scienceRaw:science?.getAttribute('src')||null,
      scienceResolved:science?.src||null,
      enLocRaw:enLoc?.getAttribute('src')||null,
      enLocResolved:enLoc?.src||null,
      atlasExists:Boolean(atlas),
      atlasVisible:visible(atlas),
      activeBase:window.P120ScientificBase?.activeBaseId||null,
      scrollWidth:document.documentElement.scrollWidth,
      clientWidth:document.documentElement.clientWidth
    };
  });

  const expectedBase=isEn?`${ROOT}/en/`:`${ROOT}/`;
  const expectedScience=`${ROOT}/p120-scientific-base-runtime-v1.0.js?v=sbm10`;
  check(`${label}: document.baseURI models project subpath`,meta.baseURI===expectedBase,{actual:meta.baseURI,expected:expectedBase});
  check(`${label}: Science runtime browser URL inside project`,meta.scienceResolved===expectedScience,{raw:meta.scienceRaw,resolved:meta.scienceResolved,expected:expectedScience});
  const scienceStatus=sameOriginRequests.find(x=>x.url===expectedScience)?.status ?? null;
  check(`${label}: Science runtime HTTP 200`,scienceStatus===200,{scienceStatus,expectedScience});

  if(isEn){
    const expectedLoc=`${ROOT}/p120-en-science-localization-runtime-v1.0.js?v=ensci10`;
    check(`${label}: EN localization browser URL inside project`,meta.enLocResolved===expectedLoc,{raw:meta.enLocRaw,resolved:meta.enLocResolved,expected:expectedLoc});
    const locStatus=sameOriginRequests.find(x=>x.url===expectedLoc)?.status ?? null;
    check(`${label}: EN localization runtime HTTP 200`,locStatus===200,{locStatus,expectedLoc});
  }

  const escaped=[...new Map(sameOriginRequests.filter(x=>{
    const u=new URL(x.url);
    return !u.pathname.startsWith(`${PROJECT}/`);
  }).map(x=>[x.url,x])).values()];
  check(`${label}: no same-origin asset request escapes /p120-web/`,escaped.length===0,{escaped});
  check(`${label}: Atlas exists`,meta.atlasExists,{meta});
  check(`${label}: Atlas visible`,meta.atlasVisible,{meta});
  check(`${label}: CORE default`,meta.activeBase==='CORE',{activeBase:meta.activeBase});

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

  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  check(`${label}: no horizontal overflow`,overflow<=1,{overflow});

  if(isEn){
    await page.waitForTimeout(400);
    const cyr=await visibleCyrillic(page);
    check(`${label}: no visible unintended Cyrillic`,cyr.length===0,{cyrillic:cyr});
  }

  check(`${label}: no HTTP >=400 responses`,badResponses.length===0,{badResponses});
  check(`${label}: no failed requests`,failedRequests.length===0,{failedRequests});
  check(`${label}: no console errors`,consoleErrors.length===0,{consoleErrors});
  check(`${label}: no page errors`,pageErrors.length===0,{pageErrors});

  await page.screenshot({path:path.join(SHOTS,`${locale}-${viewportName}.png`),fullPage:true});
  await context.close();
  return {locale,viewportName,route,meta,requests:sameOriginRequests};
}

const browser=await chromium.launch({headless:true});
const routeEvidence=[];
try{
  for(const locale of ['ru','en']){
    for(const [viewportName,viewport] of Object.entries(viewports)){
      routeEvidence.push(await testRoute(browser,{locale,viewportName,viewport}));
    }
  }
} finally {
  await browser.close();
}

const report={
  document_id:'P120-WEB-PASS4A-QA-001',
  version:'1.0',
  date:'2026-09-02',
  scope:'Deployment-Path Reconciliation / dedicated Scientific Base routes',
  project_path:'/p120-web/',
  status:failures.length?'FAIL':'PASS',
  checks_total:checks.length,
  checks_passed:checks.filter(x=>x.pass).length,
  checks_failed:failures.length,
  failures,
  checks,
  routeEvidence,
  prohibited_target:'/en/science/en/ was not modified or special-cased by PASS 4A'
};
await writeFile(path.join(OUT,'P120_PASS4A_QA_v1.0.json'),JSON.stringify(report,null,2));
await writeFile(path.join(OUT,'SUMMARY.txt'),`P120 WEB PASS 4A QA\nSTATUS: ${report.status}\nCHECKS: ${report.checks_passed}/${report.checks_total}\nFAILURES: ${report.checks_failed}\nPROJECT PATH: /p120-web/\n`);
console.log(JSON.stringify({status:report.status,checks_total:report.checks_total,checks_passed:report.checks_passed,checks_failed:report.checks_failed,failures},null,2));
if(failures.length)process.exit(1);
