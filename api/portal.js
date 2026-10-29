import { randomUUID,randomBytes } from 'node:crypto';
import { fromNodeHeaders } from 'better-auth/node';
import { getAuth,getPool } from '../server/auth.js';
import { HttpError,requireAdmin,authorizeAccount,checkOrigin,cleanMeta,metaQuery } from '../server/security.js';
import { readMeta,tokenFor } from '../server/meta.js';
import { createPausedCampaign,validateCampaign } from '../server/campaignApi.js';
export const config={maxDuration:60};
const validText=(v,max=150)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
async function rate(key,max,windowSeconds=60){
 const {rows}=await getPool().query(`INSERT INTO portal_rate_limits(key,count,expires_at) VALUES($1,1,now()+$2*interval '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN portal_rate_limits.expires_at<now() THEN 1 ELSE portal_rate_limits.count+1 END,expires_at=CASE WHEN portal_rate_limits.expires_at<now() THEN now()+$2*interval '1 second' ELSE portal_rate_limits.expires_at END RETURNING count`,[key,windowSeconds]);
 if(rows[0].count>max)throw new HttpError(429,'Too many requests. Please try again later.');
}
async function audit(user,action,target){await getPool().query('INSERT INTO portal_audit(actor_id,action,target) VALUES($1,$2,$3)',[user.id,action,target]);}
async function accountFor(user,id){
 const {rows}=await getPool().query(`SELECT a.*,c.active AS client_active,EXISTS(SELECT 1 FROM portal_memberships m WHERE m.client_id=a.client_id AND m.user_id=$2) AS assigned FROM portal_accounts a JOIN portal_clients c ON c.id=a.client_id WHERE a.account_id=$1`,[id,user.id]);
 const a=rows[0];return authorizeAccount(user,a?{...a,active:a.active&&a.client_active}:null,a?.assigned);
}
async function sessionUser(req){
 const s=await getAuth().api.getSession({headers:fromNodeHeaders(req.headers)});if(!s)throw new HttpError(401,'Please sign in.');
 const {rows}=await getPool().query('SELECT id,name,email,username,role,banned,"twoFactorEnabled","mustChangePassword" FROM "user" WHERE id=$1',[s.user.id]);
 const u=rows[0];if(!u||u.banned)throw new HttpError(401,'Access has been disabled.');return u;
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('Vercel-CDN-Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');
 const action=new URL(req.url,'https://local').searchParams.get('action');
 try {
  if(!['GET','POST'].includes(req.method))throw new HttpError(405,'Method not allowed.');
  checkOrigin(req);
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(JSON.stringify(body).length>50000)throw new HttpError(413,'Request too large.');
  if(action==='recovery'&&req.method==='POST'){
   await rate('recovery:'+String(req.headers['x-forwarded-for']||'unknown').split(',')[0],3,3600);
   if(validText(body.username,40))await getPool().query('INSERT INTO portal_recovery(id,username) VALUES($1,$2)',[randomUUID(),body.username.toLowerCase()]);
   return res.json({message:'Recovery request received. Contact MDRS to verify your identity and receive new sign-in details.'});
  }
  const user=await sessionUser(req);
  if(action==='me'&&req.method==='GET')return res.json({user});
  if(action==='password'&&req.method==='POST'){
    if(!validText(body.newPassword,128)||body.newPassword.length<12||body.newPassword===body.currentPassword)throw new HttpError(400,'Use a new password with at least 12 characters.');
    await getAuth().api.changePassword({headers:fromNodeHeaders(req.headers),body:{currentPassword:body.currentPassword,newPassword:body.newPassword,revokeOtherSessions:true}});
    await getPool().query('UPDATE "user" SET "mustChangePassword"=false WHERE id=$1',[user.id]);await audit(user,'password_changed',user.id);return res.json({ok:true});
  }
  if(user.mustChangePassword)throw new HttpError(403,'Change your temporary password first.');
  if(user.role==='admin'&&!user.twoFactorEnabled)throw new HttpError(403,'Enable two-factor authentication first.');
  await rate('portal:'+user.id,180);
  if(action==='accounts'&&req.method==='GET'){
   const {rows}=await getPool().query(`SELECT a.account_id AS id,a.name,a.currency,c.name AS industry FROM portal_accounts a JOIN portal_clients c ON c.id=a.client_id WHERE a.active AND c.active AND ($2 OR EXISTS(SELECT 1 FROM portal_memberships m WHERE m.client_id=a.client_id AND m.user_id=$1)) ORDER BY a.name`,[user.id,user.role==='admin']);
   return res.json({accounts:rows});
  }
  if(action==='meta'&&req.method==='POST'){
    const account=await accountFor(user,body.account);return res.json(await readMeta(account,body.edge,body.query));
  }
  if(action==='ai'&&req.method==='POST'){
    const account=await accountFor(user,body.account);await rate('ai:'+user.id,10,3600);
    const key=process.env.GEMINI_API_KEY;if(!key)throw new HttpError(503,'AI is not configured yet. Contact MDRS.');
    const rangeInput=body.reportQuery||{date_preset:'last_30d'};
    if(Object.keys(rangeInput).some(k=>!['date_preset','time_range'].includes(k)))throw new HttpError(400,'Invalid AI reporting period.');
    const reportQuery=Object.fromEntries(metaQuery(rangeInput));
    const report=await readMeta(account,'insights',{...reportQuery,fields:'date_start,date_stop,spend,impressions,reach,clicks,ctr,actions,action_values,purchase_roas'});
    const prompt=body.payload?.contents?.[0]?.parts?.filter(p=>typeof p.text==='string').map(p=>p.text).join('\n')||body.prompt;
    if(!validText(prompt,20000))throw new HttpError(400,'Enter a shorter question.');
    const payload={contents:[{parts:[{text:prompt+'\nVerified account data (only this account): '+JSON.stringify(report)}]}],systemInstruction:{parts:[{text:'You are a reporting assistant. Explain only the provided account data. No tools or account changes are available. Do not claim to access other clients or apply changes. Never guarantee results. Currency: '+account.currency}]} ,generationConfig:{maxOutputTokens:4000}};
    if(body.payload?.generationConfig?.responseSchema){payload.generationConfig.responseMimeType='application/json';payload.generationConfig.responseSchema=body.payload.generationConfig.responseSchema;}
    const model=process.env.GEMINI_MODEL||'gemini-3.8-flash';
    if(!/^[a-z0-9.-]+$/.test(model))throw new HttpError(503,'AI model is not configured.');
    const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(payload),signal:AbortSignal.timeout(40000)});
    if(!response.ok){
      if(response.status===429)throw new HttpError(429,'AI quota or rate limit reached. Contact MDRS or try again later.');
      if([400,401,403].includes(response.status))throw new HttpError(502,'AI request or API key configuration was rejected. Contact MDRS.');
      if(response.status===404)throw new HttpError(502,'Configured AI model is unavailable. Contact MDRS.');
      throw new HttpError(502,'AI service unavailable. Try again later.');
    }
    const data=await response.json();return res.json(cleanMeta({candidates:data.candidates},[key]));
  }
  requireAdmin(user);
  if(action==='admin'&&req.method==='GET'){
    const [clients,accounts,users,auditRows,recovery]=await Promise.all([
      getPool().query('SELECT * FROM portal_clients ORDER BY created_at DESC'),getPool().query('SELECT * FROM portal_accounts ORDER BY name'),
      getPool().query(`SELECT u.id,u.name,u.email,u.username,u.banned,u."mustChangePassword",m.client_id FROM "user" u LEFT JOIN portal_memberships m ON m.user_id=u.id WHERE u.role<>'admin' ORDER BY u.name`),
      getPool().query('SELECT action,target,created_at FROM portal_audit ORDER BY id DESC LIMIT 50'),getPool().query('SELECT * FROM portal_recovery WHERE NOT resolved ORDER BY created_at DESC LIMIT 50')]);
    const tokenRefs=Object.keys(process.env).filter(k=>/^META_TOKEN_[A-Z0-9_]+$/.test(k));
    return res.json({clients:clients.rows,accounts:accounts.rows.map(a=>({...a,connected:!!process.env[a.token_ref]})),users:users.rows,audit:auditRows.rows,recovery:recovery.rows,tokenRefs,aiConfigured:!!process.env.GEMINI_API_KEY});
  }
  if(req.method!=='POST')throw new HttpError(405,'Method not allowed.');
  if(action==='client-create'){
    if(!validText(body.name))throw new HttpError(400,'Business name is required.');
    const id=randomUUID();await getPool().query('INSERT INTO portal_clients(id,name) VALUES($1,$2)',[id,body.name.trim()]);await audit(user,'client_created',id);return res.json({id});
  }
  if(action==='account-save'){
    if(!/^act_\d+$/.test(body.accountId)||!/^META_TOKEN_[A-Z0-9_]+$/.test(body.tokenRef))throw new HttpError(400,'Use a valid account ID and server token reference.');
    const c=await getPool().query('SELECT id FROM portal_clients WHERE id=$1 AND active',[body.clientId]);if(!c.rowCount)throw new HttpError(400,'Choose an active business.');
    const existing=await getPool().query('SELECT client_id FROM portal_accounts WHERE account_id=$1',[body.accountId]);if(existing.rowCount&&existing.rows[0].client_id!==body.clientId)throw new HttpError(409,'This account is already assigned to another business.');
    const info=await readMeta({account_id:body.accountId,token_ref:body.tokenRef},'',{fields:'id,name,currency'});
    if(info.id!==body.accountId||!info.currency)throw new HttpError(400,'Meta account verification failed.');
    await getPool().query(`INSERT INTO portal_accounts(account_id,client_id,name,currency,token_ref) VALUES($1,$2,$3,$4,$5) ON CONFLICT(account_id) DO UPDATE SET name=EXCLUDED.name,currency=EXCLUDED.currency,token_ref=EXCLUDED.token_ref`,[info.id,body.clientId,info.name,info.currency,body.tokenRef]);
    await audit(user,'account_verified_and_assigned',info.id);return res.json({ok:true});
  }
  if(action==='user-create'){
    if(!/^[a-z0-9_]{3,40}$/.test(body.username)||!validText(body.name)||!/^\S+@\S+\.\S+$/.test(body.email))throw new HttpError(400,'Enter name, email and a unique lowercase username (3–40 letters, numbers or underscores).');
    const c=await getPool().query('SELECT id FROM portal_clients WHERE id=$1 AND active',[body.clientId]);if(!c.rowCount)throw new HttpError(400,'Choose an active business.');
    const password=randomBytes(18).toString('base64url');
    const created=await getAuth().api.createUser({body:{email:body.email,name:body.name,password,role:'user',data:{username:body.username,displayUsername:body.username,mustChangePassword:true}}});
    await getPool().query('INSERT INTO portal_memberships(user_id,client_id) VALUES($1,$2)',[created.user.id,body.clientId]);await audit(user,'user_created',created.user.id);
    return res.json({username:body.username,temporaryPassword:password});
  }
  if(action==='user-access'||action==='user-reset'){
    const result=await getPool().query('SELECT id,role,username FROM "user" WHERE id=$1',[body.userId]);const target=result.rows[0];
    if(!target||target.role==='admin')throw new HttpError(403,'Only client accounts can be managed here.');
    if(action==='user-access'){
      if(typeof body.enabled!=='boolean')throw new HttpError(400,'Invalid access status.');
      await getPool().query('UPDATE "user" SET banned=$2 WHERE id=$1',[target.id,!body.enabled]);await getPool().query('DELETE FROM session WHERE "userId"=$1',[target.id]);await audit(user,body.enabled?'user_enabled':'user_disabled',target.id);return res.json({ok:true});
    }
    const password=randomBytes(18).toString('base64url');
    await getAuth().api.setUserPassword({body:{userId:target.id,newPassword:password},headers:fromNodeHeaders(req.headers)});
    await getPool().query('UPDATE "user" SET "mustChangePassword"=true WHERE id=$1',[target.id]);await getPool().query('DELETE FROM session WHERE "userId"=$1',[target.id]);
    await getPool().query('UPDATE portal_recovery SET resolved=true WHERE username=$1',[target.username]);await audit(user,'user_password_reset',target.id);return res.json({username:target.username,temporaryPassword:password});
  }
  if(action==='client-access'){
    if(typeof body.enabled!=='boolean')throw new HttpError(400,'Invalid access status.');await getPool().query('UPDATE portal_clients SET active=$2 WHERE id=$1',[body.clientId,body.enabled]);await audit(user,'client_access_changed',body.clientId);return res.json({ok:true});
  }
  if(action==='campaign-create'){
    const account=await accountFor(user,body.form?.account);const form={...body.form,currency:account.currency};
    try{validateCampaign(form);}catch{throw new HttpError(400,'Review all campaign fields and confirmations.');}
    if(!['USD','INR','NPR','EUR','GBP','AED','AUD','CAD','SGD'].includes(account.currency))throw new HttpError(400,'Unsupported campaign currency.');
    if(!/^[a-f0-9-]{36}$/.test(body.requestId))throw new HttpError(400,'Request ID required.');
    const job=await getPool().query(`INSERT INTO portal_campaign_jobs(id,actor_id,account_id,status) VALUES($1,$2,$3,'started') ON CONFLICT DO NOTHING RETURNING id`,[body.requestId,user.id,account.account_id]);
    if(!job.rowCount)throw new HttpError(409,'Creation already attempted. Check Ads Manager before retrying.');
    let ids={};try{ids=await createPausedCampaign(form,tokenFor(account),process.env.META_API_VERSION||'v23.0',progress=>{ids=progress;});await getPool().query('UPDATE portal_campaign_jobs SET status=$2,ids=$3 WHERE id=$1',[body.requestId,'complete',ids]);await audit(user,'paused_campaign_created',account.account_id);return res.json({ids});}
    catch{await getPool().query('UPDATE portal_campaign_jobs SET status=$2,ids=$3 WHERE id=$1',[body.requestId,'needs_review',ids]);return res.status(502).json({error:{message:'Creation did not complete. Check Ads Manager before retrying; partial objects may exist.'},ids});}
  }
  throw new HttpError(404,'Not found.');
 }catch(error){
  const status=error instanceof HttpError?error.status:400;
  return res.status(status).json({error:{message:error instanceof HttpError?error.message:'Request could not be completed. Check the supplied details or contact MDRS.'}});
 }
}
