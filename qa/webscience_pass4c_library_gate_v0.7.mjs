import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT='qa-evidence-webscience-pass4c';fs.mkdirSync(`${OUT}/screenshots`,{recursive:true});
const checks=[];const check=(name,ok,detail={})=>{checks.push({name,pass:Boolean(ok),detail});if(!ok)console.error('FAIL',name,detail);};
const browser=await chromium.launch({headless:true});
const cases=[['ru','science/'],['en','en/science/']];
const views=[['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]];
try{
 for(const [locale,route] of cases)for(const [view,viewport] of views){
  const context=await browser.newContext({viewport});
  const page=await context.newPage();
  await page.addInitScript(()=>{localStorage.setItem('__p120_4c_sentinel','LOCAL');sessionStorage.setItem('__p120_4c_sentinel','SESSION');});
  await page.goto(`http://127.0.0.1:4179/${route}?science=library`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.P120ScienceGlobalLibrary?.status?.pass===true&&document.querySelector('[data-p120-pass4c-library="integrated-v0.7"]'),null,{timeout:20000});
  const base=await page.evaluate(()=>({
    core:window.P120_SCIENCE?.references?.length,
    global:window.P120ScienceGlobalLibrary?.library?.references?.length,
    pass4b:window.P120SciencePublicationRenderer?.status?.pass,
    base:window.P120ScientificBase?.activeBaseId,
    registry:{measurement:window.P120ScientificBase?.registry?.measurement_mutation_allowed,scoring:window.P120ScientificBase?.registry?.scoring_mutation_allowed,session:window.P120ScientificBase?.registry?.session_storage_access},
    domAll:document.querySelectorAll('[data-p120-global-reference]').length,
    domCore:document.querySelectorAll('[data-p120-global-reference][data-source-layer="CORE45"]').length,
    domExt:document.querySelectorAll('[data-p120-global-reference][data-source-layer="PASS4_EXTENSION"]').length,
    oldCoreHidden:document.getElementById('science-refs')?.classList.contains('p120-pass4c-core-native-hidden'),
    storage:[localStorage.getItem('__p120_4c_sentinel'),sessionStorage.getItem('__p120_4c_sentinel')],
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
  }));
  check(`${locale}-${view} Core remains 45`,base.core===45,base);
  check(`${locale}-${view} Global is 70`,base.global===70&&base.domAll===70,base);
  check(`${locale}-${view} partition 45+25`,base.domCore===45&&base.domExt===25,base);
  check(`${locale}-${view} PASS4B preserved`,base.pass4b===true&&base.base==='LIBRARY',base);
  check(`${locale}-${view} old Core bibliography de-duplicated in library view`,base.oldCoreHidden===true,base);
  check(`${locale}-${view} protected registry boundaries`,base.registry.measurement===false&&base.registry.scoring===false&&base.registry.session==='PROHIBITED',base.registry);
  check(`${locale}-${view} storage isolation`,base.storage[0]==='LOCAL'&&base.storage[1]==='SESSION',base.storage);
  check(`${locale}-${view} horizontal overflow`,base.overflow<=1,{overflow:base.overflow});

  const filterCounts={CORE45:45,PASS4_EXTENSION:25,'COM-12':5,'MOT-12':5,'SELF-12':8,'LIFE-12/18':9,METHODS:4,'EXT-SYS':2};
  for(const [filter,expected] of Object.entries(filterCounts)){
    await page.locator(`[data-pass4c-filter="${filter}"]`).click();
    await page.waitForTimeout(30);
    const n=await page.locator('[data-p120-global-reference]').count();
    check(`${locale}-${view} filter ${filter}`,n===expected,{n,expected});
  }
  await page.locator('[data-pass4c-filter="ALL"]').click();
  const search=page.locator('[data-pass4c-search]');await search.fill('Mallory');await page.waitForTimeout(30);
  check(`${locale}-${view} text search`,await page.locator('[data-p120-global-reference]').count()===2,{count:await page.locator('[data-p120-global-reference]').count()});
  await search.fill('');await page.waitForTimeout(30);
  const coreRoleLeak=await page.locator('[data-source-layer="CORE45"]').evaluateAll(nodes=>nodes.some(n=>/Evidence role|Роль в доказательной базе/.test(n.textContent||'')));
  check(`${locale}-${view} no inferred Core role labels`,coreRoleLeak===false,{coreRoleLeak});
  const extBound=await page.locator('[data-source-layer="PASS4_EXTENSION"]').evaluateAll(nodes=>nodes.every(n=>(n.textContent||'').includes('PASS 4 EXTENSION')&&n.querySelectorAll('.p120-pass4c-chip').length>=3));
  check(`${locale}-${view} extension bindings rendered`,extBound===true,{extBound});

  await page.goto(`http://127.0.0.1:4179/${route}?science=library&ref=REF-050`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.P120ScienceGlobalLibrary?.status?.pass===true&&document.querySelector('#p120-global-ref-REF-050[data-deep-linked="true"]'),null,{timeout:20000});
  check(`${locale}-${view} REF deep link`,await page.locator('#p120-global-ref-REF-050[data-deep-linked="true"]').count()===1,{});
  await page.screenshot({path:`${OUT}/screenshots/${locale}-${view}-global70.png`,fullPage:true});

  await page.evaluate(()=>window.P120ScientificBase.setBase('EXTENDED'));
  await page.waitForFunction(()=>window.P120ScientificBase?.activeBaseId==='EXTENDED'&&document.querySelector('[data-p120-pass4b-renderer="active"]'));
  const leave=await page.evaluate(()=>({oldCoreHidden:document.getElementById('science-refs')?.classList.contains('p120-pass4c-core-native-hidden'),modules:document.querySelectorAll('.p120-pass4b-module').length,pass4c:window.P120ScienceGlobalLibrary?.status?.pass}));
  check(`${locale}-${view} leaving library restores Core bibliography`,leave.oldCoreHidden===false,leave);
  check(`${locale}-${view} non-library PASS4B surface preserved`,leave.modules===4&&leave.pass4c===true,leave);
  await context.close();
 }
} finally {await browser.close();}
const result={document_id:'P120-WEBSCI-EXT-004-PASS4C-QA',version:'v0.7',date:'2026-09-06',status:checks.every(x=>x.pass)?'PASS':'FAIL',checks_total:checks.length,checks_passed:checks.filter(x=>x.pass).length,checks_failed:checks.filter(x=>!x.pass).length,checks};
fs.writeFileSync(`${OUT}/P120_WEBSCI_EXT_PASS4_PASS4C_QA_RESULT_v0.7.json`,JSON.stringify(result,null,2)+'\n');
console.log(`PASS 4C browser gate: ${result.checks_passed}/${result.checks_total}`);if(result.status!=='PASS')process.exit(1);
