import { chromium } from 'playwright';
import fs from 'fs';import path from 'path';
const base=process.env.P120_QA_BASE||'http://127.0.0.1:8765/';
const out=path.join(process.cwd(),'qa-artifacts','founder-distance-field-v11');fs.mkdirSync(out,{recursive:true});
const assert=(c,m)=>{if(!c)throw new Error(m);console.log('PASS',m)};
const browser=await chromium.launch({headless:true});
const cases=[
  {lang:'ru',url:'creator/',left:'ОЩУЩЕНИЕ',right:'СЛОВО'},
  {lang:'en',url:'en/creator/',left:'FEELING',right:'WORD'}
];
try{
  for(const c of cases){
    for(const vp of [{name:'desktop',width:1440,height:1000,min:8,max:16},{name:'mobile',width:390,height:844,min:5,max:11}]){
      const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},reducedMotion:'reduce'});
      await page.goto(base+c.url,{waitUntil:'networkidle'});
      await page.waitForSelector('#fnd-03 .founder-vo__distance');
      await page.locator('#fnd-03').scrollIntoViewIfNeeded();await page.waitForTimeout(180);
      assert(await page.locator('link[data-p120-founder-distance="v1.1"]').count()===1,`${c.lang}/${vp.name}: distance micro-layer loaded once`);
      const labels=page.locator('#fnd-03 .founder-vo__distance > span');
      assert(await labels.count()===2,`${c.lang}/${vp.name}: two axis labels`);
      assert((await labels.nth(0).innerText()).trim()===c.left,`${c.lang}/${vp.name}: left label localized`);
      assert((await labels.nth(1).innerText()).trim()===c.right,`${c.lang}/${vp.name}: right label localized`);
      const style=await labels.nth(0).evaluate(el=>{const s=getComputedStyle(el);return{family:s.fontFamily,weight:s.fontWeight,transform:s.textTransform}});
      assert(style.family.toLowerCase().includes('ibm plex sans'),`${c.lang}/${vp.name}: IBM Plex Sans label role`);
      assert(String(style.weight)==='300',`${c.lang}/${vp.name}: label weight 300`);
      assert(style.transform==='uppercase',`${c.lang}/${vp.name}: labels uppercase`);
      const geo=await page.evaluate(()=>{
        const d=document.querySelector('#fnd-03 .founder-vo__distance');const a=d.children[0].getBoundingClientRect();const l=d.children[1].getBoundingClientRect();const b=d.children[2].getBoundingClientRect();
        return{leftOverlap:a.right-l.left,rightOverlap:l.right-b.left,lineY:l.top+l.height/2,leftBottom:a.bottom,rightBottom:b.bottom,cols:getComputedStyle(d).gridTemplateColumns};
      });
      assert(geo.leftOverlap>=vp.min&&geo.leftOverlap<=vp.max,`${c.lang}/${vp.name}: left line overlap ${geo.leftOverlap.toFixed(1)}px within target`);
      assert(geo.rightOverlap>=vp.min&&geo.rightOverlap<=vp.max,`${c.lang}/${vp.name}: right line overlap ${geo.rightOverlap.toFixed(1)}px within target`);
      assert(Math.abs(geo.lineY-geo.leftBottom)<=4.5&&Math.abs(geo.lineY-geo.rightBottom)<=4.5,`${c.lang}/${vp.name}: labels optically seated on axis`);
      if(vp.name==='mobile') assert(geo.cols.split(' ').length>=3,`${c.lang}/${vp.name}: distance field remains one horizontal axis`);
      const noto=await page.locator('#fnd-03 .founder-story__beat').first().evaluate(el=>getComputedStyle(el).fontFamily);
      assert(noto.toLowerCase().includes('noto serif'),`${c.lang}/${vp.name}: main FND-03 phrase remains Noto`);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      assert(overflow<=1,`${c.lang}/${vp.name}: no horizontal overflow`);
      const box=await page.locator('#fnd-03').boundingBox();
      await page.screenshot({path:path.join(out,`${c.lang}-${vp.name}-distance.png`),clip:{x:0,y:Math.max(0,box.y),width:vp.width,height:Math.min(vp.height,Math.max(420,box.height))}});
      await page.close();
    }
  }
  console.log('Founder Distance Field v1.1 QA: PASS');
} finally {await browser.close();}
