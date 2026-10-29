export async function portal(action,body){
 const r=await fetch('/api/portal?action='+encodeURIComponent(action),{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const d=await r.json();if(!r.ok){if(r.status===401)window.dispatchEvent(new Event('portal-signed-out'));throw new Error(d.error?.message||d.error||'Request failed.');}return d;
}
export async function metaFetch(url){
 const u=new URL(url,'https://graph.facebook.com');const segments=u.pathname.split('/').filter(Boolean);
 const query=Object.fromEntries(u.searchParams);const account=segments[1],edge=segments[2]||'';
 try{const data=await portal('meta',{account,edge,query});return {ok:true,json:async()=>data};}
 catch(e){return {ok:false,json:async()=>({error:{message:e.message}})};}
}
export async function askAI(account,payload){return portal('ai',{account,payload});}
