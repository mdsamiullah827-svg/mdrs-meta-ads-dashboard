import { toNodeHandler } from 'better-auth/node';
import { getAuth } from '../server/auth.js';
const allowed=new Set(['sign-in/username','sign-in/email','sign-out','get-session','change-password','two-factor/enable','two-factor/verify-totp','two-factor/verify-backup-code','two-factor/generate-backup-codes']);
export const config={api:{bodyParser:false}};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
 const url=new URL(req.url,'https://local');
 const path=url.pathname.startsWith('/api/auth/')?url.pathname.slice('/api/auth/'.length):(url.searchParams.get('authPath')||'');
 url.searchParams.delete('authPath');
 req.url='/api/auth/'+path+(url.searchParams.size?'?'+url.searchParams.toString():'');
 if(!allowed.has(path)){res.status(404).json({error:'Not found'});return;}
 try {return await toNodeHandler(getAuth())(req,res);}catch{res.status(503).json({error:'Sign-in is temporarily unavailable.'});}
}
