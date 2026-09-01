import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base=process.env.P120_QA_BASE||'http://127.0.0.1:8765/';
const out=path.join(process.cwd(),'qa-artifacts','founder-art-serif-lab-v01');
fs.mkdirSync(out,{recursive:true});
const assert=(cond,msg)=>{if(!cond)throw new Error(msg);console.log('PASS',msg)};
const fonts={
  prata:{family:'Prata',weight:'400'},
  cormorant:{family:'Cormorant Garamond',weight:'500'},
  playfair:{family:'Playfair Display',weight:'500'}
};
const scenes=['fnd-00','fnd-06','fnd-10'];

const browser=await chromium.launch({headless:true});
try{
  for(const [key,expect] of Object.entries(fonts)){
    const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
    await page.goto(`${base}lab/art-serif/?font=${key}`,{waitUntil:'networkidle'});
    await page.waitForSelector('#preview');
    const creator=page.frames().find(f=>/\/creator\/?(?:$|[?#])/.test(f.url()));
    assert(creator,`${key}: creator production iframe loaded`);
    await creator.waitForSelector('#fnd-10');
    await page.waitForFunction(()=>document.querySelector('#status')?.textContent?.includes('loaded'),null,{timeout:20000});
    const status=await page.locator('#status').textContent();
    assert(status?.toLowerCase().includes('loaded'),`${key}: candidate webfont loaded`);

    for(const scene of scenes){
      const target=creator.locator(`#${scene}`);
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      const selector=scene==='fnd-00'?`#${scene} .founder-story__display`:scene==='fnd-06'?`#${scene} .founder-story__display--turn`:`#${scene} .founder-story__display--north`;
      const computed=await creator.locator(selector).first().evaluate(el=>{const c=getComputedStyle(el);return{family:c.fontFamily,weight:c.fontWeight,style:c.fontStyle}});
      assert(computed.family.toLowerCase().includes(expect.family.toLowerCase()),`${key}/${scene}: selected family applied`);
      assert(String(computed.weight)===expect.weight,`${key}/${scene}: tuned display weight applied`);
      assert(computed.style==='normal',`${key}/${scene}: display remains roman`);
      await page.screenshot({path:path.join(out,`${key}-${scene}.png`),fullPage:false});
    }

    const prodAssets=await creator.locator('link[href],script[src]').evaluateAll(els=>els.map(e=>e.getAttribute('href')||e.getAttribute('src')||''));
    assert(!prodAssets.some(x=>x.includes('art-serif-lab')),
      `${key}: production iframe source does not load lab assets`);
    await page.close();
  }

  const baseline=await browser.newPage({viewport:{width:1440,height:1000}});
  await baseline.goto(`${base}creator/`,{waitUntil:'networkidle'});
  assert(await baseline.locator('#p120-art-serif-lab-style').count()===0,'production /creator/ contains no lab style');
  assert(await baseline.locator('#p120-art-serif-lab-font').count()===0,'production /creator/ contains no lab font link');
  await baseline.close();

  console.log('Founder Art Serif Lab v0.1 QA: PASS');
} finally {
  await browser.close();
}
