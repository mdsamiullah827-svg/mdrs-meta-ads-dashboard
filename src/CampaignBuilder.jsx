import React, { useState, useRef } from 'react';
import { validateCampaign } from './campaignApi.js';
import { portal } from './portalApi.js';

export default function CampaignBuilder({ account, currency }) {
  const [form,setForm]=useState({account:/^act_\d+$/.test(account)?account:'',name:'',page:'',budget:'5',countries:'NP',ageMin:'18',ageMax:'65',website:'',image:'',headline:'',message:'',cta:'LEARN_MORE',ordinary:false,reviewed:false});
  const [brief,setBrief]=useState('');
  const [advice,setAdvice]=useState('');
  const [busy,setBusy]=useState(false);
  const [aiBusy,setAiBusy]=useState(false);
  const [error,setError]=useState('');
  const [created,setCreated]=useState({});
  const [attempted,setAttempted]=useState(false);
  const guard=useRef(false);
  const field=(key,label,type='text')=><label>{label}<input type={type} value={form[key]} disabled={busy||attempted} onChange={e=>setForm({...form,[key]:e.target.value,reviewed:false})}/></label>;
  const assist=async()=>{
    setAiBusy(true);setError('');
    try{
      const data=await portal('ai',{account,prompt:'Help plan a website traffic campaign on Facebook Feed, created paused. Do not claim to create anything. Business brief: '+brief+' Setup: '+JSON.stringify({...form,currency})});
      const answer=data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('\n');if(!answer)throw new Error('AI returned no text. Try a more specific brief.');
      setAdvice(answer);
    }catch(e){setError(e.message);}finally{setAiBusy(false);}
  };
  const submit=async()=>{
    if(guard.current||attempted)return;
    setError('');
    try{validateCampaign(form);}catch(e){setError(e.message);return;}
    guard.current=true;setBusy(true);setAttempted(true);
    try{const r=await fetch('/api/portal?action=campaign-create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({form:{...form,currency},requestId:crypto.randomUUID()})});const data=await r.json();setCreated(data.ids||{});if(!r.ok)throw new Error(data.error?.message||'Creation failed.');}
    catch(e){setError(e.message+' Created item IDs are shown below. Check Ads Manager before starting another setup.');}
    finally{guard.current=false;setBusy(false);}
  };
  return <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <div className="builder-panel xl:col-span-2 space-y-4">
      <h2 className="text-2xl font-bold">Create a Meta campaign</h2>
      <p>Website traffic • Single image • Facebook Feed • Created paused</p>
      <small>This creates real campaign, ad set, creative and ad objects in your authorized Meta account. No ad starts spending here. Messaging, lead forms, video and Special Ad Categories must be configured in Ads Manager.</small>
      <fieldset disabled={busy||attempted}>
        <legend className="font-bold mt-5">1. Account & campaign</legend>
        <div className="grid sm:grid-cols-2 gap-x-4"><label>Assigned Meta account<input value={account} readOnly/></label>{field('name','Campaign name')}</div>

        <small>Requires ads_management and access to the selected account and Facebook Page. A reporting-only token cannot create ads.</small>
        <legend className="font-bold mt-5">2. Budget & audience</legend>
        <p>Daily budget in account currency: <strong>{currency}</strong>. Confirm this matches the account ID. This builder currently supports currencies with 100 minor units (USD, INR, NPR, EUR, GBP, AED, AUD, CAD, SGD).</p>
        <div className="grid sm:grid-cols-2 gap-x-4">{field('budget','Daily budget','number')}{field('countries','Country codes (NP,IN,US)')}{field('ageMin','Minimum age','number')}{field('ageMax','Maximum age (65 = 65+)','number')}</div>
        <legend className="font-bold mt-5">3. Ad creative</legend>
        <div className="grid sm:grid-cols-2 gap-x-4">{field('page','Facebook Page ID')}{field('website','Destination website URL','url')}{field('image','Public HTTPS image URL','url')}{field('headline','Headline')}</div>
        <label>Primary text<textarea rows="4" value={form.message} onChange={e=>setForm({...form,message:e.target.value,reviewed:false})}/></label>
        <label>Call to action<select value={form.cta} onChange={e=>setForm({...form,cta:e.target.value,reviewed:false})}><option value="LEARN_MORE">Learn more</option><option value="SHOP_NOW">Shop now</option><option value="SIGN_UP">Sign up</option><option value="CONTACT_US">Contact us</option></select></label>
        <label><input type="checkbox" checked={form.ordinary} onChange={e=>setForm({...form,ordinary:e.target.checked,reviewed:false})}/>This is not a Special Ad Category campaign (housing, employment, financial products/services, or social issues/elections/politics).</label>
        <legend className="font-bold mt-5">4. Review & create</legend>
        <div className="p-4 rounded-xl border" style={{borderColor:'var(--line)'}}>
          <strong>{form.name||'Untitled campaign'}</strong><p>{form.budget} {currency}/day • {form.countries} • Ages {form.ageMin}–{form.ageMax} • Website traffic</p>
          <p className="mt-3 font-semibold">{form.headline||'Your headline'}</p><p className="whitespace-pre-wrap">{form.message||'Your primary text'}</p><small>{form.website||'Your destination URL'}</small>
        </div>
        <label><input type="checkbox" checked={form.reviewed} onChange={e=>setForm({...form,reviewed:e.target.checked})}/>I reviewed the account, currency, budget, audience and creative. Create these objects on Meta in PAUSED status.</label>
      </fieldset>
      <button className="builder-primary" disabled={busy||attempted||!form.reviewed||!['USD','INR','NPR','EUR','GBP','AED','AUD','CAD','SGD'].includes(currency)} onClick={submit}>{busy?'Creating on Meta…':attempted?'Creation attempted — check result below':'Create paused campaign on Meta'}</button>
      {error&&<p role="alert" className="text-rose-400 whitespace-pre-wrap">{error}</p>}
      {Object.keys(created).length>0&&<div className="p-4 rounded-xl border space-y-2"><h3 className="font-bold">{created.ad?'Created successfully — paused':'Partially created — paused'}</h3>{Object.entries(created).map(([type,id])=><p key={type}>{type}: {id}</p>)}<a className="text-blue-400 underline" href={'https://adsmanager.facebook.com/adsmanager/manage/campaigns?act='+form.account.replace('act_','')} target="_blank" rel="noreferrer">Review in Meta Ads Manager</a></div>}
      {attempted&&!busy&&<p className="text-sm">To avoid duplicates, this form will not retry automatically. Verify the account in Ads Manager before leaving this page or starting a new campaign.</p>}
    </div>
    <aside className="builder-panel self-start space-y-4">
      <h2 className="text-xl font-bold">AI setup assistant</h2>
      <p className="text-sm">Describe the business, offer, audience and language. The assistant suggests copy and setup choices; you review and enter them in the form.</p>

      <label>Your business / question<textarea rows="5" value={brief} onChange={e=>setBrief(e.target.value)} placeholder="Nepal-based interior service. Budget NPR 450/day. Help with headline and audience."/></label>
      <small>Your brief and non-secret form details are sent to Gemini only when you click below.</small>
      <button className="builder-primary" disabled={aiBusy||!brief.trim()} onClick={assist}>{aiBusy?'Thinking…':'Get AI suggestions'}</button>
      {advice&&<div className="text-sm whitespace-pre-wrap leading-relaxed border-t pt-4">{advice}</div>}
    </aside>
  </section>;
}
