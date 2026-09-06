import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir='qa-evidence-pass4c';
fs.mkdirSync(outDir,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto('http://127.0.0.1:4179/science/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Array.isArray(window.P120_SCIENCE?.references)&&window.P120_SCIENCE.references.length===45,null,{timeout:15000});
  const payload=await page.evaluate(()=>{
    const refs=window.P120_SCIENCE.references;
    return {
      count:refs.length,
      keys:[...new Set(refs.flatMap(r=>Object.keys(r)))].sort(),
      references:refs,
      scienceRefsHtml:document.getElementById('science-refs')?.innerHTML||null
    };
  });
  if(payload.count!==45) throw new Error(`Core reference count ${payload.count} != 45`);
  fs.writeFileSync(path.join(outDir,'P120_WEBSCI_PASS4C_CORE45_PROBE_v0.7.json'),JSON.stringify(payload,null,2)+'\n');
  console.log(JSON.stringify({count:payload.count,keys:payload.keys,first:payload.references[0],last:payload.references.at(-1)},null,2));
} finally {
  await browser.close();
}
