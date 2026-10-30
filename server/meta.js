import {availableHistoryRange} from '../src/reporting.js';
import { HttpError,cleanMeta,metaQuery } from './security.js';
export function tokenFor(account){
 if(!/^META_TOKEN_[A-Z0-9_]+$/.test(account.token_ref))throw new HttpError(503,'Account connection needs administrator attention.');
 const token=process.env[account.token_ref];if(!token)throw new HttpError(503,'Account connection needs administrator attention.');return token;
}
export async function readMeta(account,edge,input){
 if(!['','insights','campaigns'].includes(edge))throw new HttpError(400,'Unsupported reporting endpoint.');
 if(!/^act_\d+$/.test(account.account_id))throw new HttpError(400,'Invalid account.');
 const token=tokenFor(account), version=process.env.META_API_VERSION||'v23.0';
 if(!/^v\d+\.0$/.test(version))throw new HttpError(503,'Meta API version is not configured.');
 const params=metaQuery(input);let rows=[],after=null,reportingRange=null;
 if(edge==='insights'&&params.get('date_preset')==='data_maximum'){
   const info=await readMeta(account,'',{fields:'timezone_name'});
   let today=new Date().toISOString().slice(0,10);
   if(info.timezone_name) today=new Intl.DateTimeFormat('en-CA',{timeZone:info.timezone_name,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
   reportingRange=availableHistoryRange(today);
   params.delete('date_preset');params.set('time_range',JSON.stringify(reportingRange));
 }

 for(let page=0;page<30;page++){
   if(after)params.set('after',after);
   const response=await fetch(`https://graph.facebook.com/${version}/${account.account_id}${edge?'/'+edge:''}?${params}`,{cache:'no-store',headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(20000),redirect:'error'});
   const data=await response.json();
   if(!response.ok||data.error){
     const code=data.error?.code;
     if(code===3018)throw new HttpError(400,'Meta rejected this historical date range. Select a start date within the last 37 months using Custom time.');
     throw new HttpError(502,code===190?'Meta connection expired. Contact MDRS to reconnect.':`Meta could not return this report (code ${Number(code)||response.status}). Contact MDRS if this continues.`);
   }
   if(!Array.isArray(data.data))return cleanMeta(data,[token]);
   rows.push(...data.data);
   if(!data.paging?.next)return {data:cleanMeta(rows,[token]),...(reportingRange?{reporting_range:reportingRange}:{})};
   after=data.paging?.cursors?.after;
   if(!after||page===29)throw new HttpError(502,'Report is too large. Please select a shorter date range.');
 }
}
