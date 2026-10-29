import test from 'node:test';
import assert from 'node:assert/strict';
import {reportingQuery,validRange,periodLabel} from '../src/reporting.js';
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
