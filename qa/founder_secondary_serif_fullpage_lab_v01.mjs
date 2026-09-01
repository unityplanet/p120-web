import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base=process.env.P120_QA_BASE||'http://127.0.0.1:8765/';
const out=path.join(process.cwd(),'qa-artifacts','founder-secondary-serif-fullpage-v01');
fs.mkdirSync(out,{recursive:true});
const assert=(cond,msg)=>{if(!cond)throw new Error(msg);console.log('PASS',msg)};
const fonts={prata:{family:'Prata',weight:'400'},cormorant:{family:'Cormorant Garamond',weight:'500'},playfair:{family:'Playfair Display',weight:'500'}};
const checkpoints=['fnd-02','fnd-06','fnd-07','fnd-09','fnd-10'];
const browser=await chromium.launch({headless:true});
try{
  const sizes={};
  for(const [key,expect] of Object.entries(fonts)){
    const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
    await page.goto(`${base}lab/secondary-serif/?font=${key}`,{waitUntil:'networkidle'});
    const creator=page.frames().find(f=>/\/creator\/?(?:$|[?#])/.test(f.url()));
    assert(creator,`${key}: production creator iframe loaded`);
    await creator.waitForSelector('#fnd-10');
    await page.waitForFunction(()=>document.querySelector('#status')?.textContent?.includes('loaded'),null,{timeout:20000});

    for(const scene of checkpoints){
      const selector=scene==='fnd-07'?`#${scene} .founder-story__coordinate-copy > p:not(.founder-story__eyebrow)`:scene==='fnd-09'?`#${scene} .founder-story__boundary-copy > p:not(.founder-story__marginal-note)`:scene==='fnd-10'?`#${scene} .founder-story__reading > p:not(.founder-story__marginal-note)`:`#${scene} .founder-story__reading > p:not(.founder-story__marginal-note)`;
      const target=creator.locator(selector).first();
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(220);
      const computed=await target.evaluate(el=>{const c=getComputedStyle(el);return{family:c.fontFamily,weight:c.fontWeight,style:c.fontStyle,size:parseFloat(c.fontSize)}});
      assert(computed.family.toLowerCase().includes(expect.family.toLowerCase()),`${key}/${scene}: secondary serif applied`);
      assert(String(computed.weight)===expect.weight,`${key}/${scene}: tuned weight applied`);
      assert(computed.style==='normal',`${key}/${scene}: secondary serif remains roman`);
      if(scene==='fnd-06')sizes[key]=computed.size;
    }

    const display=await creator.locator('#fnd-06 .founder-story__display--turn').evaluate(el=>getComputedStyle(el).fontFamily);
    assert(display.toLowerCase().includes('noto'),`${key}: large Noto display remains protected`);
    const marginal=await creator.locator('#fnd-06 .founder-story__marginal-note').evaluate(el=>{const c=getComputedStyle(el);return{family:c.fontFamily,style:c.fontStyle,weight:c.fontWeight}});
    assert(marginal.family.toLowerCase().includes('ibm plex sans'),`${key}: Plex marginal voice protected`);
    assert(marginal.style==='italic' && String(marginal.weight)==='300',`${key}: Plex Light Italic remains 300 italic`);
    const overflow=await creator.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1);
    assert(overflow,`${key}: no horizontal overflow`);

    await creator.locator('#fnd-06').scrollIntoViewIfNeeded();await page.waitForTimeout(180);
    await page.screenshot({path:path.join(out,`${key}-fnd-06.png`),fullPage:false});
    await creator.locator('#fnd-09').scrollIntoViewIfNeeded();await page.waitForTimeout(180);
    await page.screenshot({path:path.join(out,`${key}-fnd-09.png`),fullPage:false});
    await page.close();
  }
  assert(sizes.cormorant>sizes.prata*1.07,'Cormorant optical compensation is materially larger than Prata');
  assert(sizes.playfair>=sizes.prata,'Playfair optical compensation is not smaller than Prata');

  const prod=await browser.newPage({viewport:{width:1440,height:1000}});
  await prod.goto(`${base}creator/`,{waitUntil:'networkidle'});
  assert(await prod.locator('#p120-secondary-serif-lab-style').count()===0,'production /creator/ has no full-page lab style');
  assert(await prod.locator('#p120-secondary-serif-lab-font').count()===0,'production /creator/ has no full-page lab font link');
  await prod.close();
  fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify({fnd06ComputedSizes:sizes},null,2));
  console.log('Founder Secondary Serif Full-Page Lab v0.1 QA: PASS');
} finally {await browser.close();}
