#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/* P-120 WEB-EXPLORE PASS 5.3 — controlled navigation reconciliation wrapper.
   The historical PASS 5.3 gate predates two later controlled promotions:
   (1) About P-120 became a first-class Main top-level destination;
   (2) HG-CGA Decision Research became the fifth controlled Explore destination.
   This wrapper runs the historical gate unchanged, adjudicates only those exact
   superseded count assertions, and rejects every unrelated regression. */

const ROOT=path.resolve(import.meta.dirname,'..');
const OUT=path.join(ROOT,'qa-artifacts','pass53-about-reconciliation');
fs.mkdirSync(OUT,{recursive:true});
const child=spawnSync(process.execPath,[path.join(ROOT,'qa/pass53_brand_unification.mjs')],{
  cwd:ROOT,
  env:process.env,
  encoding:'utf8',
  stdio:['ignore','pipe','pipe']
});
process.stdout.write(child.stdout||'');
process.stderr.write(child.stderr||'');

const summaryPath=path.join(ROOT,'qa-artifacts','pass53','summary.json');
if(!fs.existsSync(summaryPath)){
  console.error('PASS 5.3 historical summary missing');
  process.exit(1);
}
const summary=JSON.parse(fs.readFileSync(summaryPath,'utf8'));
const failures=Array.isArray(summary.failures)?summary.failures:[];
const staleMainPattern=/^main (museum|ivory|graphite) (1366|1440|1920|2560|3440|3840): seven canonical top-level destinations:/;
const staleMegaPattern=/^\/(?:extended\/|together\/|creator\/|why-p120\/)? mega-menu exposes four destinations: \[[^\]]+\]$/;
const unexpected=failures.filter(x=>!staleMainPattern.test(String(x))&&!staleMegaPattern.test(String(x)));
const expectedMainStale=failures.filter(x=>staleMainPattern.test(String(x)));
const expectedMegaStale=failures.filter(x=>staleMegaPattern.test(String(x)));

const checks=[];
const failed=[];
const add=(id,pass,detail={})=>{checks.push({id,pass:Boolean(pass),...detail});if(!pass)failed.push(id);};

add('historical gate produced only controlled superseded navigation-count failures',unexpected.length===0,{unexpected});
add('historical Main stale assertion count is complete 6 widths × 3 themes',expectedMainStale.length===18,{count:expectedMainStale.length});
add('historical mega-menu stale assertion count is complete across five governed routes',expectedMegaStale.length===5,{count:expectedMegaStale.length,failures:expectedMegaStale});
add('each superseded mega-menu assertion observed exactly five cards',expectedMegaStale.every(x=>{const m=String(x).match(/\[([^\]]+)\]$/);return m&&m[1].split(',').filter(Boolean).length===5;}),{failures:expectedMegaStale});
add('historical gate otherwise executed full matrix',summary?.totals?.checks>=600,{checks:summary?.totals?.checks});

const metrics=summary.metrics||{};
let mainCases=0;
let secondaryCases=0;
for(const [key,data] of Object.entries(metrics)){
  if(!data||typeof data!=='object')continue;
  const parts=key.split(':');
  const width=Number(parts[0]);
  const name=parts[2];
  if(!Number.isFinite(width)||width<1366)continue;
  if(name==='main'){
    mainCases++;
    add(`${key} / Main has eight controlled top-level destinations`,data.visibleNavChildren===8,{count:data.visibleNavChildren,texts:data.navTexts});
    add(`${key} / About P-120 is first-class Main destination`,Array.isArray(data.navTexts)&&data.navTexts.some(t=>/^О P-120$/.test(t)),{texts:data.navTexts});
    add(`${key} / Decision Research is exposed inside Explore`,Array.isArray(data.navTexts)&&data.navTexts.some(t=>/Исследование решений/.test(t)),{texts:data.navTexts});
  }else if(name==='extended'||name==='together'){
    secondaryCases++;
    add(`${key} / secondary surface remains seven-destination top-level topology`,data.visibleNavChildren===7,{count:data.visibleNavChildren,texts:data.navTexts});
    add(`${key} / Decision Research is exposed inside Explore`,Array.isArray(data.navTexts)&&data.navTexts.some(t=>/Исследование решений/.test(t)),{texts:data.navTexts});
  }
}
add('Main reconciliation matrix complete',mainCases===18,{mainCases});
add('Secondary reconciliation matrix complete',secondaryCases===36,{secondaryCases});

const result={
  schema:'p120.pass53.navigation-reconciliation.v2',
  historical_gate_exit_status:child.status,
  historical_checks:summary?.totals?.checks??null,
  historical_failures:failures.length,
  adjudicated_superseded_main_failures:expectedMainStale.length,
  adjudicated_superseded_mega_failures:expectedMegaStale.length,
  unexpected_failures:unexpected,
  authority:{main_top_level_destinations:8,secondary_top_level_destinations:7,explore_destinations:5,about_first_class:true,decision_research_active:true},
  checks,
  failures:failed,
  verdict:failed.length?'FAIL':'PASS',
  generated_at:new Date().toISOString()
};
fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({verdict:result.verdict,checks:checks.length,failures:failed},null,2));
if(failed.length)process.exit(1);
