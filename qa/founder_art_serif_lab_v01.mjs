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
const targetSelectors=[
  '#fnd-06 .founder-story__reading > p:nth-child(3)',
  '#fnd-06 .founder-story__reading > p:nth-child(4)'
];

const browser=await chromium.launch({headless:true});
try{
  for(const [key,expect] of Object.entries(fonts)){
    const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
    await page.goto(`${base}lab/art-serif/?font=${key}`,{waitUntil:'networkidle'});
    await page.waitForSelector('#preview');
    const creator=page.frames().find(f=>/\/creator\/?(?:#fnd-06)?(?:$|[?#])/.test(f.url()));
    assert(creator,`${key}: creator production iframe loaded`);
    await creator.waitForSelector('#fnd-06');
    await page.waitForFunction(()=>document.querySelector('#status')?.textContent?.includes('loaded'),null,{timeout:20000});
    const status=await page.locator('#status').textContent();
    assert(status?.toLowerCase().includes('loaded'),`${key}: candidate webfont loaded`);

    for(const selector of targetSelectors){
      const loc=creator.locator(selector);
      assert(await loc.count()===1,`${key}: target paragraph exists`);
      const computed=await loc.evaluate(el=>{const c=getComputedStyle(el);return{family:c.fontFamily,weight:c.fontWeight,style:c.fontStyle}});
      assert(computed.family.toLowerCase().includes(expect.family.toLowerCase()),`${key}: selected family applied to target copy`);
      assert(String(computed.weight)===expect.weight,`${key}: tuned body-copy weight applied`);
      assert(computed.style==='normal',`${key}: body-copy candidate remains roman`);
    }

    const display=await creator.locator('#fnd-06 .founder-story__display--turn').evaluate(el=>{const c=getComputedStyle(el);return{family:c.fontFamily,weight:c.fontWeight}});
    assert(/Noto Serif/i.test(display.family),`${key}: FND-06 monumental statement remains Noto`);
    assert(String(display.weight)==='500',`${key}: Noto display weight remains production 500`);

    const note=await creator.locator('#fnd-06 .founder-story__reading > p:nth-child(2)').evaluate(el=>{const c=getComputedStyle(el);return{family:c.fontFamily,weight:c.fontWeight,style:c.fontStyle}});
    assert(/IBM Plex Sans/i.test(note.family),`${key}: marginal note keeps Plex Sans role`);
    assert(String(note.weight)==='300' && note.style==='italic',`${key}: marginal note keeps Light Italic role`);

    const scene=creator.locator('#fnd-06');
    await scene.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({path:path.join(out,`${key}-fnd-06-body-copy.png`),fullPage:false});

    const prodAssets=await creator.locator('link[href],script[src]').evaluateAll(els=>els.map(e=>e.getAttribute('href')||e.getAttribute('src')||''));
    assert(!prodAssets.some(x=>x.includes('art-serif-lab')),`${key}: production iframe source does not load lab assets`);
    await page.close();
  }

  const baseline=await browser.newPage({viewport:{width:1440,height:1000}});
  await baseline.goto(`${base}creator/#fnd-06`,{waitUntil:'networkidle'});
  assert(await baseline.locator('#p120-art-serif-lab-style').count()===0,'production /creator/ contains no lab style');
  assert(await baseline.locator('#p120-art-serif-lab-font').count()===0,'production /creator/ contains no lab font link');
  const baselineDisplay=await baseline.locator('#fnd-06 .founder-story__display--turn').evaluate(el=>getComputedStyle(el).fontFamily);
  assert(/Noto Serif/i.test(baselineDisplay),'production FND-06 display remains Noto');
  await baseline.close();

  console.log('Founder Secondary Art Serif Lab v0.2 QA: PASS');
} finally {
  await browser.close();
}
