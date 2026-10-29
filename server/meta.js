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
 const params=metaQuery(input);let rows=[],after=null;
 for(let page=0;page<30;page++){
   if(after)params.set('after',after);
   const response=await fetch(`https://graph.facebook.com/${version}/${account.account_id}${edge?'/'+edge:''}?${params}`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(20000),redirect:'error'});
   const data=await response.json();
   if(!response.ok||data.error){
     const code=data.error?.code;throw new HttpError(502,code===190?'Meta connection expired. Contact MDRS to reconnect.':`Meta could not return this report (code ${Number(code)||response.status}). Contact MDRS if this continues.`);
   }
   if(!Array.isArray(data.data))return cleanMeta(data,[token]);
   rows.push(...data.data);
   if(!data.paging?.next)return {data:cleanMeta(rows,[token])};
   after=data.paging?.cursors?.after;
   if(!after||page===29)throw new HttpError(502,'Report is too large. Please select a shorter date range.');
 }
}
