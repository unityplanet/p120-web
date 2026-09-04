import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT=path.resolve(import.meta.dirname,'..');
const BASE=process.env.P120_QA_BASE || 'http://127.0.0.1:4173';
const OUT=path.join(ROOT,'qa-artifacts','footer-link-correction-pass1');
fs.mkdirSync(OUT,{recursive:true});

const PROJECT_PREFIX='/p120-web/';
const PROD_ORIGIN='https://unityplanet.github.io';
const specs=[
  {file:'system/index.html',route:'/system/',prodRoute:'/p120-web/system/'},
  {file:'science/index.html',route:'/science/',prodRoute:'/p120-web/science/'},
  {file:'en/system/index.html',route:'/en/system/',prodRoute:'/p120-web/en/system/'},
  {file:'en/science/index.html',route:'/en/science/',prodRoute:'/p120-web/en/science/'}
];

const failures=[];
const source=[];
const runtime=[];
function fail(message,detail=''){failures.push({message,detail});}

function attr(html,tag,attrName,required=''){
  const re=new RegExp(`<${tag}\\b[^>]*${attrName}=["']([^"']+)["'][^>]*>`,'i');
  const m=html.match(re);
  if(!m){fail(`missing ${tag}[${attrName}]`,required);return null;}
  return m[1];
}
function stylesheetHref(html,dataAttr){
  const re=new RegExp(`<link\\b[^>]*${dataAttr}=["'][^"']+["'][^>]*href=["']([^"']+)["'][^>]*>|<link\\b[^>]*href=["']([^"']+)["'][^>]*${dataAttr}=["'][^"']+["'][^>]*>`,'i');
  const m=html.match(re);
  return m?.[1]||m?.[2]||null;
}

for(const spec of specs){
  const html=fs.readFileSync(path.join(ROOT,spec.file),'utf8');
  const baseHref=attr(html,'base','href',spec.file);
  const brandHref=stylesheetHref(html,'data-p120-brand-system');
  const correctionHref=stylesheetHref(html,'data-p120-pass53-visual-corrections');
  if(!brandHref) fail('missing canonical brand stylesheet link',spec.file);
  if(!correctionHref) fail('missing visual-corrections stylesheet link',spec.file);

  const pageUrl=new URL(spec.prodRoute,PROD_ORIGIN);
  const baseUrl=baseHref?new URL(baseHref,pageUrl):pageUrl;
  const brandResolved=brandHref?new URL(brandHref,baseUrl):null;
  const correctionResolved=correctionHref?new URL(correctionHref,baseUrl):null;
  const expectedBrand=PROJECT_PREFIX+'p120-brand-system-v1.0.css';
  const expectedCorrection=PROJECT_PREFIX+'p120-pass53-visual-corrections-v1.0.css';

  if(brandResolved?.pathname!==expectedBrand) fail('canonical brand stylesheet escapes GitHub Pages project prefix',`${spec.file}: ${brandResolved?.pathname}`);
  if(correctionResolved?.pathname!==expectedCorrection) fail('footer correction stylesheet escapes GitHub Pages project prefix',`${spec.file}: ${correctionResolved?.pathname}`);
  if(/^\.\.\//.test(brandHref||'')) fail('base-aware route retains parent-prefixed brand href',`${spec.file}: ${brandHref}`);
  if(/^\.\.\//.test(correctionHref||'')) fail('base-aware route retains parent-prefixed correction href',`${spec.file}: ${correctionHref}`);

  source.push({file:spec.file,baseHref,brandHref,correctionHref,brandResolved:brandResolved?.href,correctionResolved:correctionResolved?.href});
}

const browser=await chromium.launch({headless:true});
for(const spec of specs){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  const errors=[];
  page.on('console',msg=>{if(msg.type()==='error') errors.push(`console:${msg.text()}`)});
  page.on('pageerror',err=>errors.push(`page:${err.message}`));
  const response=await page.goto(BASE+spec.route,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('[data-p120-legal-footer] .p120-site-footer__chapters',{timeout:15000});
  await page.waitForTimeout(500);
  const data=await page.evaluate(()=>{
    const chapters=document.querySelector('.p120-site-footer__chapters');
    const links=[...chapters.querySelectorAll('a')];
    const legalLinks=[...document.querySelectorAll('.p120-site-footer__legal .p120-legal-footer__links a')];
    const correction=[...document.styleSheets].find(s=>s.href?.includes('p120-pass53-visual-corrections-v1.0.css'));
    const brand=[...document.styleSheets].find(s=>s.href?.includes('p120-brand-system-v1.0.css'));
    const cs=getComputedStyle(chapters);
    return {
      baseURI:document.baseURI,
      correctionHref:correction?.href||null,
      brandHref:brand?.href||null,
      chapters:{display:cs.display,gridTemplateColumns:cs.gridTemplateColumns,columnGap:cs.columnGap,rowGap:cs.rowGap},
      links:links.map(a=>{const s=getComputedStyle(a);const r=a.getBoundingClientRect();return {text:a.textContent.trim(),decoration:s.textDecorationLine,fontSize:s.fontSize,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width)};}),
      legalLinks:legalLinks.map(a=>({text:a.textContent.trim(),decoration:getComputedStyle(a).textDecorationLine}))
    };
  });

  if((response?.status()||0)>=400) fail('route HTTP failure',`${spec.route}: ${response?.status()}`);
  if(!data.correctionHref) fail('footer correction stylesheet not present at runtime',spec.route);
  if(!data.brandHref) fail('canonical brand stylesheet not present at runtime',spec.route);
  if(data.chapters.display!=='grid') fail('mobile footer chapter navigation is not grid',`${spec.route}: ${JSON.stringify(data.chapters)}`);
  if(data.links.length!==5) fail('unexpected footer chapter link count',`${spec.route}: ${data.links.length}`);
  if(data.links.some(x=>x.decoration!=='none')) fail('footer chapter link fell back to default underline',`${spec.route}: ${JSON.stringify(data.links)}`);
  if(data.legalLinks.some(x=>x.decoration!=='none')) fail('legal footer link uses browser text underline instead of controlled border treatment',`${spec.route}: ${JSON.stringify(data.legalLinks)}`);
  if(errors.length) fail('runtime console/page errors',`${spec.route}: ${errors.join(' | ')}`);

  await page.screenshot({path:path.join(OUT,spec.file.replaceAll('/','-')+'.png'),fullPage:true});
  runtime.push({route:spec.route,http:response?.status()||0,errors,data});
  await context.close();
}
await browser.close();

const report={
  document:'P-120 WEB — FOOTER LINK PRESENTATION CORRECTION / PASS 1',
  classification:'BASE-AWARE ASSET RESOLUTION + MOBILE FOOTER REGRESSION QA',
  projectPrefix:PROJECT_PREFIX,
  source,runtime,failures,
  status:failures.length?'FAIL':'PASS'
};
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(OUT,'REPORT.md'),`# P-120 WEB — FOOTER LINK PRESENTATION CORRECTION / PASS 1\n\nSTATUS: ${report.status}\n\nBASE-AWARE ROUTES: ${source.length}\nRUNTIME MOBILE CASES: ${runtime.length}\nFAILURES: ${failures.length}\n`);

if(failures.length){
  console.error(JSON.stringify(failures,null,2));
  process.exit(1);
}
console.log(`FOOTER LINK PRESENTATION CORRECTION / PASS 1 — PASS (${source.length} base-aware routes; ${runtime.length} mobile runtime cases)`);
