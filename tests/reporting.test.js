import test from 'node:test';
import assert from 'node:assert/strict';
import {reportingQuery,validRange,periodLabel,availableHistoryRange} from '../src/reporting.js';
import {metaQuery} from '../server/security.js';
import {readMeta} from '../server/meta.js';
test('Today and custom periods survive frontend and backend validation unchanged',()=>{
 assert.equal(metaQuery(reportingQuery('Today')).get('date_preset'),'today');
 const range={since:'2026-10-01',until:'2026-10-30'};
 const query=metaQuery(reportingQuery('Custom time',range));
 assert.deepEqual(JSON.parse(query.get('time_range')),range);
 assert.equal(query.has('date_preset'),false);
 assert.equal(periodLabel('Custom time',range),'Custom time: 2026-10-01 to 2026-10-30');
 assert.ok(validRange({since:'2024-02-29',until:'2024-02-29'}));
 for(const range of [{since:'2026-02-29',until:'2026-03-01'},{since:'2026-10-30',until:'2026-10-01'},{since:'',until:''}]){
  assert.equal(validRange(range),false);assert.throws(()=>metaQuery({time_range:JSON.stringify(range)}));
 }
 assert.throws(()=>metaQuery({date_preset:'today',time_range:JSON.stringify(range)}));
 assert.throws(()=>metaQuery({time_range:JSON.stringify({...range,token:'injected'})}));
});
test('Lifetime uses an explicit supported window and returns its actual dates',async()=>{
 const previous=globalThis.fetch;process.env.META_TOKEN_TEST='test-only-placeholder';
 const calls=[];
 try {
  globalThis.fetch=async url=>{
   const u=new URL(url);calls.push(u);
   if(!u.pathname.endsWith('/insights'))return {ok:true,json:async()=>({timezone_name:'Asia/Kathmandu'})};
   assert.equal(u.searchParams.has('date_preset'),false);
   assert.ok(validRange(JSON.parse(u.searchParams.get('time_range'))));
   return {ok:true,json:async()=>({data:[{spend:'123.45'}]})};
  };
  const result=await readMeta({account_id:'act_222',token_ref:'META_TOKEN_TEST'},'insights',{date_preset:'data_maximum',fields:'spend'});
  assert.deepEqual(result.reporting_range,JSON.parse(calls[1].searchParams.get('time_range')));
  assert.equal(result.data[0].spend,'123.45');assert.equal(calls.length,2);
  assert.deepEqual(availableHistoryRange('2026-10-30'),{since:'2023-10-01',until:'2026-10-30'});
  assert.ok(validRange(availableHistoryRange('2024-03-31')));
  globalThis.fetch=async()=>({ok:false,status:400,json:async()=>({error:{code:3018}})});
  await assert.rejects(readMeta({account_id:'act_222',token_ref:'META_TOKEN_TEST'},'insights',{time_range:JSON.stringify({since:'2010-01-01',until:'2010-02-01'})}),e=>e.status===400&&e.message.includes('37 months'));
 }finally{globalThis.fetch=previous;delete process.env.META_TOKEN_TEST;}
});

test('PDF export ignores CSV BOM and extra metadata instead of screenshotting the dashboard',async()=>{
 const {makePDFReport}=await import('../src/pdfReport.js');
 const blob=await makePDFReport({csv:'\uFEFFCampaign,Spend',account:'Molabis',period:'2026-10-01 to 2026-10-30',currency:'USD',mode:'Test',campaigns:[{name:'Campaign',status:'ACTIVE',spend:12.5,conversions:1}]});
 assert.equal(blob.type,'application/pdf');assert.ok(blob.size>1000);
 assert.equal((await blob.text()).slice(0,4),'%PDF');
});
test('Meta proxy keeps selected account and Today range, disables cache, and reports upstream errors',async()=>{
 const previous=globalThis.fetch;process.env.META_TOKEN_TEST='test-only-placeholder';
 try {
  globalThis.fetch=async(url,options)=>{
   const u=new URL(url);assert.equal(u.pathname,'/v23.0/act_222/insights');assert.equal(u.searchParams.get('date_preset'),'today');assert.equal(options.cache,'no-store');
   return {ok:true,json:async()=>({data:[{spend:'12.34',date_start:'2026-10-30'}]})};
  };
  const account={account_id:'act_222',token_ref:'META_TOKEN_TEST'};
  assert.equal((await readMeta(account,'insights',{date_preset:'today',fields:'spend,date_start'})).data[0].spend,'12.34');
  globalThis.fetch=async()=>({ok:false,status:400,json:async()=>({error:{code:190,message:'private upstream detail'}})});
  await assert.rejects(readMeta(account,'insights',{date_preset:'today'}),e=>e.status===502&&!e.message.includes('private upstream detail'));
 } finally {globalThis.fetch=previous;delete process.env.META_TOKEN_TEST;}
});
