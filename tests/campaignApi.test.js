import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPausedCampaign, validateCampaign } from '../src/campaignApi.js';
const form={account:'act_123',name:'Test campaign',page:'123',budget:'4.50',countries:'NP',ageMin:'18',ageMax:'65',website:'https://example.com',image:'https://example.com/image.jpg',headline:'Test',message:'Test copy',ordinary:true,reviewed:true,cta:'LEARN_MORE',currency:'USD'};
test('creates four ordered objects paused with minor-unit budget', async()=>{
 const calls=[];const ids=await createPausedCampaign(form,'mock-token','v25.0',()=>{},async(url,init)=>{
  calls.push({url,init});return {ok:true,json:async()=>init.method?{id:String(calls.length)}:{currency:'USD'}};
 });
 assert.equal(calls.length,5);assert.ok(ids.ad);
 const data=calls.slice(1).map(c=>Object.fromEntries(c.init.body));
 assert.equal(data[0].status,'PAUSED');assert.equal(data[1].daily_budget,'450');assert.equal(data[1].status,'PAUSED');assert.equal(data[3].status,'PAUSED');
 assert.equal(data[1].campaign_id,ids.campaign);assert.equal(data[3].adset_id,ids.adset);
});
test('currency mismatch blocks every write',async()=>{
 let writes=0;await assert.rejects(()=>createPausedCampaign(form,'mock','v25.0',()=>{},async(u,i)=>{if(i.method)writes++;return{ok:true,json:async()=>({currency:'NPR'})};}),/currency/);assert.equal(writes,0);
});
test('partial failure preserves created IDs and does not retry',async()=>{
 let count=0;await assert.rejects(()=>createPausedCampaign(form,'mock','v25.0',()=>{},async(u,i)=>{
  if(!i.method)return{ok:true,json:async()=>({currency:'USD'})};
  count++;return{ok:count===1,json:async()=>count===1?{id:'campaign-1'}:{error:{message:'permission denied'}}};
 }),e=>e.createdIds.campaign==='campaign-1'&&/permission/.test(e.message));assert.equal(count,2);
});
test('reject invalid budget, age, URL and missing review',()=>{
 for(const change of [{budget:'0'},{ageMin:'66'},{website:'javascript:alert(1)'},{reviewed:false},{ordinary:false}])assert.throws(()=>validateCampaign({...form,...change}));
});
