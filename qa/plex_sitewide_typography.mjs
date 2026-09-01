import { chromium } from 'playwright';
import fs from 'node:fs';

const base=process.env.P120_QA_BASE || 'http://127.0.0.1:8765/';
const out='qa-artifacts/plex-sitewide';
fs.mkdirSync(out,{recursive:true});
const errors=[];
const assert=(ok,msg)=>{if(ok)console.log('PASS',msg);else{errors.push(msg);console.error('FAIL',msg)}};
const browser=await chromium.launch({headless:true});

const pages=[
  ['ru-home',''],
  ['en-home','en/'],
  ['ru-why','why-p120/'],
  ['en-why','en/why-p120/'],
  ['ru-creator','creator/'],
  ['en-creator','en/creator/'],
];

for(const [name,path] of pages){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(new URL(path,base).href,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(name==='en-why'?1500:700);
  await page.evaluate(()=>document.fonts?.ready);
  const bodyFont=await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily);
  assert(bodyFont.includes('IBM Plex Sans'),`${name}: functional/body sans is IBM Plex Sans (${bodyFont})`);
  const dims=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  assert(dims.sw<=dims.cw+2,`${name}: no desktop horizontal overflow (${dims.sw}/${dims.cw})`);
  await page.screenshot({path:`${out}/${name}-1440.png`,fullPage:false});
  await page.close();
}

// Preserve Noto as editorial/literary layer on the major surfaces.
{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForTimeout(700);await page.evaluate(()=>document.fonts?.ready);
  const h=page.locator('h1').first();
  if(await h.count()) assert((await h.evaluate(el=>getComputedStyle(el).fontFamily)).includes('Noto Serif'),'RU home: Noto editorial heading preserved');
  await page.close();
}
{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(`${base}why-p120/`,{waitUntil:'domcontentloaded'});await page.waitForTimeout(700);await page.evaluate(()=>document.fonts?.ready);
  assert((await page.locator('.wp-display').first().evaluate(el=>getComputedStyle(el).fontFamily)).includes('Noto Serif'),'Why P-120: Noto display layer preserved');
  await page.close();
}
{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(`${base}creator/`,{waitUntil:'domcontentloaded'});await page.waitForSelector('#founder-story');await page.waitForTimeout(700);await page.evaluate(()=>document.fonts?.ready);
  assert((await page.locator('.founder-story__display').first().evaluate(el=>getComputedStyle(el).fontFamily)).includes('Noto Serif'),'Creator: Noto display layer preserved');
  assert((await page.locator('.founder-story__eyebrow').first().evaluate(el=>getComputedStyle(el).fontFamily)).includes('IBM Plex Sans'),'Creator: service eyebrow uses Plex Sans');
  assert((await page.locator('.founder-vo__index').first().evaluate(el=>getComputedStyle(el).fontFamily)).includes('IBM Plex Sans'),'Creator: FND index uses Plex Sans');

  await page.locator('#fnd-03').scrollIntoViewIfNeeded();await page.waitForTimeout(800);
  const geom=await page.evaluate(()=>{
    const root=document.querySelector('.founder-vo__distance');
    const a=root?.querySelector('span:first-child')?.getBoundingClientRect();
    const l=root?.querySelector('.founder-vo__distance-line')?.getBoundingClientRect();
    const b=root?.querySelector('span:last-child')?.getBoundingClientRect();
    return a&&l&&b?{leftOverlap:a.right-l.left,rightOverlap:l.right-b.left,aRight:a.right,lLeft:l.left,lRight:l.right,bLeft:b.left}:null;
  });
  assert(!!geom,'Creator: distance field geometry available');
  if(geom){
    assert(geom.leftOverlap>=6,`Creator: line enters left label by ${geom.leftOverlap.toFixed(1)}px`);
    assert(geom.rightOverlap>=6,`Creator: line enters right label by ${geom.rightOverlap.toFixed(1)}px`);
  }
  await page.screenshot({path:`${out}/creator-distance-corrected-1440.png`,fullPage:false});
  await page.close();
}

// Mobile regression on the two typography-heavy public surfaces.
for(const [name,path] of [['home-mobile',''],['creator-mobile','creator/'],['why-mobile','why-p120/']]){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(new URL(path,base).href,{waitUntil:'domcontentloaded'});await page.waitForTimeout(650);await page.evaluate(()=>document.fonts?.ready);
  const dims=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  assert(dims.sw<=dims.cw+2,`${name}: no mobile horizontal overflow (${dims.sw}/${dims.cw})`);
  await page.close();
}

await browser.close();
if(errors.length){console.error(`Plex sitewide typography QA FAILED: ${errors.length} issue(s)`);process.exit(1)}
console.log('Plex sitewide typography QA: PASS');
