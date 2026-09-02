import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:4179/en/science/',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>document.documentElement.dataset.p120ScientificBaseStatus==='pass',{timeout:12000});
await page.waitForTimeout(500);
const rows=await page.evaluate(()=>[...document.querySelectorAll('a[href]')].map((a,i)=>({
  i,
  raw:a.getAttribute('href'),
  href:a.href,
  text:(a.textContent||'').replace(/\s+/g,' ').trim(),
  className:a.className,
  id:a.id,
  parent:a.parentElement?.outerHTML?.slice(0,500)||'',
  outer:a.outerHTML.slice(0,800)
})).filter(x=>x.href.includes('/en/science/en/')));
console.log(JSON.stringify(rows,null,2));
if(!rows.length)process.exit(2);
await browser.close();
