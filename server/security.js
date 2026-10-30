import {validRange} from '../src/reporting.js';
export class HttpError extends Error { constructor(status,message){super(message);this.status=status;} }
export function requireAdmin(user) { if(user.role!=='admin')throw new HttpError(403,'Administrator access required.');if(!user.twoFactorEnabled)throw new HttpError(403,'Enable two-factor authentication first.'); }
export function authorizeAccount(user,account,assigned) {
  if(!account?.active)throw new HttpError(403,'Account access unavailable.');
  if(user.role!=='admin'&&!assigned)throw new HttpError(403,'Account access unavailable.');
  return account;
}
export function checkOrigin(req) {
  const expected=process.env.BETTER_AUTH_URL;
  if(req.method!=='GET'&&req.headers.origin!==expected)throw new HttpError(403,'Request origin rejected.');
}
const fields=new Set('id,name,account_id,currency,timezone_name,account_status,business_name,amount_spent,spend,impressions,reach,frequency,clicks,inline_link_clicks,ctr,inline_link_click_ctr,cpc,cpm,actions,action_values,cost_per_action_type,results,cost_per_result,purchase_roas,campaign_id,campaign_name,objective,date_start,date_stop,effective_status,status,daily_budget,lifetime_budget,video_thruplay_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,video_p100_watched_actions,unique_clicks,unique_ctr,outbound_clicks,inline_post_engagement,quality_ranking,engagement_rate_ranking,conversion_rate_ranking'.split(','));
export function metaQuery(input) {
 const query=new URLSearchParams();
 if(input?.time_range && input?.date_preset)throw new HttpError(400,'Choose either a date preset or a custom range.');
 for(const [k,v] of Object.entries(input||{})){
   if(typeof v!=='string'||v.length>1500)throw new HttpError(400,'Invalid reporting query.');
   if(k==='fields'&&v.split(',').every(f=>fields.has(f)))query.set(k,v);
   else if(k==='date_preset'&&['today','yesterday','last_7d','last_30d','data_maximum'].includes(v))query.set(k,v);
   else if(k==='time_range'){let range;try{range=JSON.parse(v);}catch{throw new HttpError(400,'Invalid date range.');}if(!validRange(range)||Object.keys(range).some(k=>!['since','until'].includes(k)))throw new HttpError(400,'Invalid date range.');query.set(k,JSON.stringify({since:range.since,until:range.until}));}
   else if(k==='level'&&['account','campaign'].includes(v))query.set(k,v);
   else if(k==='breakdowns'&&['publisher_platform,platform_position','age,gender','country,region','country'].includes(v))query.set(k,v);
   else if(k==='time_increment'&&['1','monthly'].includes(v))query.set(k,v);
   else if(k==='limit'&&/^\d+$/.test(v)&&+v>0&&+v<=500)query.set(k,v);
   else throw new HttpError(400,'Unsupported reporting query.');
 }
 return query;
}
export function cleanMeta(value,secrets=[]) {
 if(Array.isArray(value))return value.map(v=>cleanMeta(v,secrets));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!['paging','access_token','token','appsecret_proof','fbtrace_id'].includes(k)).map(([k,v])=>[k,cleanMeta(v,secrets)]));
 if(typeof value==='string')for(const secret of secrets.filter(Boolean))value=value.split(secret).join('[redacted]');
 return value;
}
