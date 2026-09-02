import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const BASE='http://127.0.0.1:4174';
const OUT='qa-evidence-fullpage-stitch-v1-0';
const routes=[
  ['RU Editorial','/'],['EN Editorial','/en/'],
  ['RU System','/system/'],['EN System','/en/system/'],
  ['RU Science','/science/'],['EN Science','/en/science/'],
  ['RU Why P-120','/why-p120/'],['EN Why P-120','/en/why-p120/'],
  ['RU Creator','/creator/'],['EN Creator','/en/creator/'],
  ['RU Extended','/extended/'],['EN Extended','/en/extended/'],
  ['RU Together','/together/'],['EN Together','/en/together/'],
  ['RU Privacy','/privacy/'],['EN Privacy','/en/privacy/'],
  ['RU Terms','/terms/'],['EN Terms','/en/terms/'],
  ['RU IP','/intellectual-property/'],['EN IP','/en/intellectual-property/']
];
const devices={desktop:{width:1440,height:1000},mobile:{width:390,height:844}};
const slug=route=>route==='/'?'root':route.replace(/^\//,'').replace(/\/$/,'').replaceAll('/','__');
const report={version:'P120 Independent Full-Page Stitched Visual Evidence v1.0',generated_at:new Date().toISOString(),captures:[],failures:[]};

fs.rmSync(OUT,{recursive:true,force:true});
for(const d of Object.keys(devices)) fs.mkdirSync(path.join(OUT,d),{recursive:true});
const browser=await chromium.launch({headless:true});

async function settle(page){
  await page.waitForLoadState('networkidle',{timeout:9000}).catch(()=>{});
  await page.waitForTimeout(700);
}

async function prepare(page){
  // Trigger every ordinary scroll/intersection state once before the stitched pass.
  await page.evaluate(async()=>{
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const h=Math.max(document.documentElement.scrollHeight,document.body?.scrollHeight||0);
    const step=Math.max(420,Math.floor(innerHeight*.72));
    for(let y=0;y<=h;y+=step){scrollTo(0,y);await sleep(30)}
    scrollTo(0,0);await sleep(220);
  });
}

async function captureStitched(page,viewport,outPath){
  const doc=await page.evaluate(()=>({
    height:Math.max(document.documentElement.scrollHeight,document.body?.scrollHeight||0),
    width:document.documentElement.clientWidth,
    bg:getComputedStyle(document.body).backgroundColor||'#f6f4ed'
  }));
  const H=viewport.height;
  const last=Math.max(0,doc.height-H);
  const positions=[];
  for(let y=0;y<last;y+=H) positions.push(y);
  if(!positions.length||positions.at(-1)!==last) positions.push(last);

  const pieces=[];
  let outputY=0;
  for(let i=0;i<positions.length;i++){
    const y=positions[i];
    await page.evaluate(v=>window.scrollTo(0,v),y);
    await page.waitForTimeout(120);
    const raw=await page.screenshot({type:'jpeg',quality:82,animations:'disabled'});
    let top=0;
    // The final viewport normally overlaps the previous slice because it is anchored
    // to the document bottom. Crop only that overlap, preserving every page pixel once.
    if(i===positions.length-1 && i>0){
      const priorEnd=positions[i-1]+H;
      top=Math.max(0,priorEnd-y);
    }
    const take=Math.max(1,H-top);
    const piece=await sharp(raw).extract({left:0,top,width:viewport.width,height:take}).jpeg({quality:82}).toBuffer();
    pieces.push({input:piece,top:outputY,left:0});
    outputY+=take;
  }
  await sharp({create:{width:viewport.width,height:outputY,channels:3,background:'#f6f4ed'}})
    .composite(pieces).jpeg({quality:82,mozjpeg:true}).toFile(outPath);
  return {document_height:doc.height,stitched_height:outputY,slices:positions.length};
}

for(const [name,route] of routes){
  for(const [device,viewport] of Object.entries(devices)){
    const context=await browser.newContext({viewport,deviceScaleFactor:1});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    let status=null;
    try{
      const res=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});
      status=res?.status()??null;
      await settle(page);
      await prepare(page);
      const outPath=path.join(OUT,device,`${slug(route)}.jpg`);
      const meta=await captureStitched(page,viewport,outPath);
      report.captures.push({name,route,device,status,lang:await page.evaluate(()=>document.documentElement.lang||''),errors,...meta,file:outPath});
      if(status!==200||errors.length)report.failures.push({route,device,status,errors});
    }catch(e){report.failures.push({route,device,error:String(e)});}
    await context.close();
  }
}
await browser.close();
report.summary={pages:routes.length,captures:report.captures.length,failures:report.failures.length,pass:report.failures.length===0};
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
let md=`# P120 Independent Full-Page Stitched Visual Evidence v1.0\n\n**Generated:** ${report.generated_at}\n\n**Pages:** ${routes.length}\n**Captures:** ${report.captures.length}\n**Result:** ${report.summary.pass?'PASS':'FAIL'}\n\n| Route | Device | HTTP | Lang | Document px | Stitched px | Slices |\n|---|---|---:|---|---:|---:|---:|\n`;
for(const r of report.captures)md+=`| \`${r.route}\` | ${r.device} | ${r.status} | ${r.lang} | ${r.document_height} | ${r.stitched_height} | ${r.slices} |\n`;
if(report.failures.length)md+=`\n## Failures\n\n${report.failures.map(x=>'- '+JSON.stringify(x)).join('\n')}\n`;
fs.writeFileSync(path.join(OUT,'REPORT.md'),md);
console.log(md);
if(report.failures.length)process.exit(1);
