import {chromium} from 'playwright';
import fs from 'fs';
const BASE='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const report={generated_at:new Date().toISOString(),language:[],mobile_start:[],overflow:[],science_assets:[]};

for(const route of ['/system/','/en/system/']){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(BASE+route,{waitUntil:'networkidle'});await page.waitForTimeout(500);
  const switches=await page.locator('.p120-language-switch-desktop').evaluateAll(ns=>ns.map((n,i)=>({i,html:n.outerHTML,links:[...n.querySelectorAll('a')].map(a=>({text:a.textContent.trim(),href:a.href,lang:a.lang,current:a.getAttribute('aria-current')}))})));
  const target=route==='/system/'?'en':'ru';
  const anchors=page.locator(`.p120-language-switch-desktop a[lang="${target}"]`);
  const count=await anchors.count();
  const clicks=[];
  for(let i=0;i<count;i++){
    const a=anchors.nth(i);clicks.push({i,visible:await a.isVisible(),href:await a.getAttribute('href')});
  }
  report.language.push({route,switches,clicks});
  await page.close();
}

for(const route of ['/','/en/']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(BASE+route,{waitUntil:'networkidle'});await page.waitForTimeout(500);
  const els=page.locator('[data-mobile-start]');const count=await els.count();const candidates=[];
  for(let i=0;i<count;i++){const el=els.nth(i);candidates.push({i,visible:await el.isVisible(),classes:await el.getAttribute('class'),text:(await el.innerText()).trim().slice(0,80)});}
  const bottom=page.locator('.mobile-bottom-nav [data-mobile-start]').first();
  let final=null,error=null;
  if(await bottom.count()){
    try{await bottom.click();await page.waitForTimeout(400);final=new URL(page.url()).pathname}catch(e){error=String(e)}
  }
  report.mobile_start.push({route,candidates,bottom_count:await bottom.count(),final,error});
  await page.close();
}

for(const route of ['/privacy/','/intellectual-property/']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(BASE+route,{waitUntil:'networkidle'});await page.waitForTimeout(500);
  const diag=await page.evaluate(()=>{
    const vw=document.documentElement.clientWidth;
    const bad=[...document.querySelectorAll('body *')].map((el,idx)=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return {idx,tag:el.tagName,id:el.id,cls:el.className&&String(el.className).slice(0,120),text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,120),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),overflowX:cs.overflowX,whiteSpace:cs.whiteSpace,wordBreak:cs.wordBreak,overflowWrap:cs.overflowWrap}}).filter(x=>x.right>vw+2||x.left<-2).sort((a,b)=>(b.right-vw)-(a.right-vw));
    return {vw,scrollWidth:document.documentElement.scrollWidth,bad:bad.slice(0,25)};
  });
  report.overflow.push({route,...diag});
  await page.close();
}

{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const events=[];
 page.on('response',r=>{if(r.url().startsWith(BASE)&&r.status()>=400)events.push({status:r.status(),url:r.url()})});
 await page.goto(BASE+'/en/science/',{waitUntil:'networkidle'});await page.waitForTimeout(400);
 const tags=await page.evaluate(()=>[...document.querySelectorAll('link[href],script[src]')].map(el=>({tag:el.tagName,raw:el.getAttribute(el.tagName==='LINK'?'href':'src'),resolved:el.tagName==='LINK'?el.href:el.src})).filter(x=>/navigation-unification|extended-research-navigation/.test(x.raw||'')));
 report.science_assets.push({route:'/en/science/',tags,events});await page.close();
}

await browser.close();
fs.writeFileSync('P120_INDEPENDENT_RENDER_DIAGNOSTICS_v1.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
