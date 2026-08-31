import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.P120_FOUNDER_STORY?.version==='1.0');
const data=await page.evaluate(()=>{
  const root=document.querySelector('#founder-story');
  const home=document.querySelector('.editorial-home');
  const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,left:r.left,right:r.right,width:r.width,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,display:getComputedStyle(e).display,box:getComputedStyle(e).boxSizing,padL:getComputedStyle(e).paddingLeft,padR:getComputedStyle(e).paddingRight}};
  return{vw:document.documentElement.clientWidth,body:rect(document.body),home:rect(home),root:rect(root),scenes:[...root.querySelectorAll('.founder-story__scene')].map(e=>({id:e.id,...rect(e)}))};
});
console.log('FOUNDER_MOBILE_DEBUG='+JSON.stringify(data));
await page.screenshot({path:'pass4-mobile-debug.png',fullPage:true});
await browser.close();
