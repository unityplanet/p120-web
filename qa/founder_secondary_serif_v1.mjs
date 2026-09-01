import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base=process.env.P120_QA_BASE||'http://127.0.0.1:8765/';
const out=path.join(process.cwd(),'qa-artifacts','founder-secondary-serif-v1');
fs.mkdirSync(out,{recursive:true});
const assert=(cond,msg)=>{if(!cond)throw new Error(msg);console.log('PASS',msg)};

const browser=await chromium.launch({headless:true});
try{
  const cases=[
    {name:'ru-desktop-museum',url:'creator/',w:1440,h:1000,theme:'museum'},
    {name:'ru-desktop-graphite',url:'creator/',w:1440,h:1000,theme:'graphite'},
    {name:'ru-desktop-ivory',url:'creator/',w:1440,h:1000,theme:'ivory'},
    {name:'ru-mobile-museum',url:'creator/',w:390,h:844,theme:'museum'},
    {name:'en-desktop-museum',url:'en/creator/',w:1440,h:1000,theme:'museum'}
  ];

  for(const c of cases){
    const page=await browser.newPage({viewport:{width:c.w,height:c.h}});
    await page.goto(base+c.url,{waitUntil:'networkidle'});
    await page.waitForSelector('#fnd-10',{timeout:20000});
    await page.evaluate(theme=>{
      document.body.dataset.theme=theme;
      document.querySelectorAll('.founder-story__reveal').forEach(el=>el.classList.add('is-visible'));
    },c.theme);
    await page.evaluate(()=>document.fonts.load('400 24px Prata'));
    await page.waitForTimeout(300);

    const body=await page.locator('#fnd-06 .founder-story__reading > p:nth-child(3)').evaluate(el=>{const s=getComputedStyle(el);return{family:s.fontFamily,weight:s.fontWeight,style:s.fontStyle}});
    assert(body.family.toLowerCase().includes('prata'),`${c.name}: Prata applied to secondary literary copy`);
    assert(body.weight==='400',`${c.name}: Prata production weight 400`);
    assert(body.style==='normal',`${c.name}: Prata remains roman`);

    const display=await page.locator('#fnd-06 .founder-story__display--turn').evaluate(el=>getComputedStyle(el).fontFamily);
    assert(display.toLowerCase().includes('noto serif'),`${c.name}: Noto display architecture preserved`);

    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert(overflow<=1,`${c.name}: no horizontal overflow`);

    if(c.url==='creator/'){
      await page.waitForSelector('.founder-story__marginal-note');
      const note=await page.locator('#fnd-06 .founder-story__marginal-note').evaluate(el=>{const s=getComputedStyle(el);return{family:s.fontFamily,weight:s.fontWeight,style:s.fontStyle}});
      assert(note.family.toLowerCase().includes('ibm plex sans'),`${c.name}: Plex marginal voice preserved`);
      assert(note.weight==='300'&&note.style==='italic',`${c.name}: Plex Light Italic role preserved`);
    }

    await page.locator('#fnd-06').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await page.screenshot({path:path.join(out,`${c.name}-fnd06.png`),fullPage:false});
    await page.close();
  }
  console.log('Founder Secondary Serif v1 QA: PASS');
} finally {
  await browser.close();
}
