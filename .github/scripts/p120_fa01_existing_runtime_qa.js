#!/usr/bin/env node
'use strict';
const fs=require('fs'),crypto=require('crypto');
const fail=m=>{console.error('FAIL:',m);process.exitCode=1};
const pass=m=>console.log('PASS:',m);
const read=p=>fs.readFileSync(p);
const text=p=>read(p).toString('utf8');
const blobSha=p=>{const b=read(p),h=crypto.createHash('sha1');h.update(Buffer.from(`blob ${b.length}\0`));h.update(b);return h.digest('hex')};
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
const expected={
  'system/index.html':'2a67d8eebb003b891593d3f363d73e2e79cf64d9',
  'en/system/index.html':'f44d74bd3097ec198516e768a9826024e9f9b65d',
  'p120-session-contract-v1.0.js':'4b13364db56d7e94444971c2ff2487db8857dd77',
  'p120-submission-intake-v1.0.js':'173523121f1a88d9333b057d6524f3b209d52e5d',
  'p120-submission-config-v1.0.js':'a478db3611a7cae396d89d29c7a910f3ecbec7d2'
};
for(const [p,want] of Object.entries(expected)){const got=blobSha(p);got===want?pass(`${p} frozen blob ${got}`):fail(`${p} drift ${got} != ${want}`)}
function assignedObject(html,name){const tok=name+' = ',t=html.indexOf(tok),start=html.indexOf('{',t+tok.length);if(t<0||start<0)throw Error('instrument assignment missing');let dep=0,str=false,esc=false;for(let i=start;i<html.length;i++){const c=html[i];if(str){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c==='"')str=false;continue}if(c==='"'){str=true;continue}if(c==='{')dep++;if(c==='}'&&--dep===0)return JSON.parse(html.slice(start,i+1))}throw Error('instrument unterminated')}
const ru=text('system/index.html');
let I;try{I=assignedObject(ru,'window.P120_INSTRUMENT')}catch(e){fail(e.message)}
if(I){const expectedModules=[['SAT24',24],['P72',72],['P72D',48],['AO12',12],['SOMA24',24]];I.items.length===180?pass('frozen item count 180'):fail(`frozen item count ${I.items.length}`);I.modules.length===5?pass('frozen module count 5'):fail(`module count ${I.modules.length}`);let o=0;for(let i=0;i<expectedModules.length;i++){const [id,n]=expectedModules[i],slice=I.items.slice(o,o+n);I.modules[i]?.id===id&&slice.length===n&&slice.every(x=>x.module===id)?pass(`${id} exact sequence count ${n}`):fail(`${id} sequence/count drift`);o+=n}const ih=sha256(Buffer.from(JSON.stringify({modules:I.modules,items:I.items})));console.log('BASE_INSTRUMENT_SHA256='+ih)}
console.log('BASE_RUNTIME_SHA256='+sha256(read('system/index.html')));
for(const [label,needle] of Object.entries({
  render:"if(state.screen==='results')return renderResults();",
  resume:"if(state.itemIndex>=I.items.length){state.screen='results';save();renderResults();return false}",
  question:"if(state.itemIndex>=I.items.length){state.screen='results';save();return renderResults()}",
  advance:"if(state.itemIndex>=I.items.length){event('questionnaire_completed');state.screen='results';save();renderResults()}"
})){const n=ru.split(needle).length-1;n===1?pass(`Alpha completion patch anchor ${label}`):fail(`patch anchor ${label} count ${n}`)}
ru.includes('module.adminModes')&&ru.includes('state.adminModes.P72D')?pass('P72D administration-mode authority present'):fail('P72D administration-mode authority missing');
const shell=text('internal/runtime/index.html'),adapter=text('internal/runtime/p120-alpha-system-adapter-v1.0.js');
shell.includes('p120-alpha-system-adapter-v1.0.js')&&!shell.includes('p120-internal-runtime-v1.0.js')?pass('parallel runner removed from active shell'):fail('active shell still references parallel runner');
adapter.includes("new URL('system/index.html',root)")?pass('adapter loads canonical System runtime'):fail('adapter does not load canonical System');
adapter.includes("window.P120Scoring=null")&&!adapter.includes('buildPrototypeResult(')?pass('Founder Alpha participant scoring suppressed'):fail('scoring suppression boundary missing');
adapter.includes("rpe_mode==='DEFERRED'")&&adapter.includes("life_main_temporal_mode==='T3'")?pass('RPE deferred / LIFE T3 gates present'):fail('RPE/LIFE gate missing');
adapter.includes("['value','response_value','answer','selected_value','choice_value','response']")?pass('Alpha telemetry value redaction present'):fail('telemetry redaction missing');
try{const schema=JSON.parse(text('internal/contracts/p120-fa01-extension-package.schema.json'));schema.properties?.manifest?.properties?.rpe_mode?.const==='DEFERRED'?pass('extension package contract parses and defers RPE'):fail('extension package contract invalid')}catch(e){fail('extension schema JSON: '+e.message)}
if(process.exitCode)process.exit(process.exitCode);console.log('P120 CR-FA01-001 STATIC QA: PASS');
