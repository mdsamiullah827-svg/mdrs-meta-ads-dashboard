export function validateCampaign(f) {
  if (!/^act_\d+$/.test(f.account)) throw new Error('Enter a real Meta ad account ID (act_123...).');
  if (!f.name.trim() || !f.headline.trim() || !f.message.trim()) throw new Error('Campaign name, headline and primary text are required.');
  if (!/^\d+$/.test(f.page)) throw new Error('Enter your authorized Facebook Page ID.');
  for(const key of ['website','image']) { let u;try{u=new URL(f[key]);}catch{throw new Error('Use valid HTTPS website and image URLs.');}if(u.protocol!=='https:')throw new Error('Website and image URLs must use HTTPS.'); }
  if (!Number.isFinite(Number(f.budget)) || Number(f.budget)<=0) throw new Error('Daily budget must be greater than zero.');
  if (!Number.isInteger(Number(f.ageMin)) || !Number.isInteger(Number(f.ageMax)) || +f.ageMin<18 || +f.ageMax>65 || +f.ageMin>+f.ageMax) throw new Error('Use ages 18–65, with minimum no greater than maximum.');
  if (!/^[A-Z]{2}(,[A-Z]{2})*$/.test(f.countries.replaceAll(' ',''))) throw new Error('Use country codes, e.g. NP,IN.');
  if (!f.ordinary) throw new Error('Confirm that this is not a Special Ad Category campaign. Use Ads Manager for those campaigns.');
  if (!f.reviewed) throw new Error('Review the setup and confirm creation.');
}
export async function createPausedCampaign(f, token, version, record, post = fetch) {
  validateCampaign(f);
  if(!token.trim())throw new Error('A Meta token with ads_management and authorized Page access is required.');
  if(!/^v\d+\.0$/.test(version))throw new Error('Invalid Meta API version.');
  const accountResponse=await post('https://graph.facebook.com/'+version+'/'+f.account+'?fields=currency,name',{
    headers:{Authorization:'Bearer '+token}
  });
  const accountInfo=await accountResponse.json();
  if(!accountResponse.ok||accountInfo.error)throw new Error(accountInfo.error?.message||'Could not verify account currency.');
  if(accountInfo.currency!==f.currency)throw new Error('Account currency is '+accountInfo.currency+'. Select that account in the dashboard before creating the campaign.');
  const ids={};
  const send=async(edge,body)=>{
    const params=new URLSearchParams();
    for(const [key,value]of Object.entries(body))params.set(key,typeof value==='object'?JSON.stringify(value):String(value));
    let response;
    try { response=await post('https://graph.facebook.com/'+version+'/'+f.account+'/'+edge,{
      method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/x-www-form-urlencoded'},body:params
    }); } catch { throw new Error('Network response unavailable. Check Ads Manager before retrying: Meta may have created this item.'); }
    const data=await response.json();
    if(!response.ok||data.error)throw new Error(data.error?.error_user_msg||data.error?.message||'Meta rejected '+edge);
    if(!data.id)throw new Error('No ID returned for '+edge+'. Check Ads Manager before retrying.');
    return data.id;
  };
  try {
    ids.campaign=await send('campaigns',{name:f.name,objective:'OUTCOME_TRAFFIC',status:'PAUSED',special_ad_categories:[],buying_type:'AUCTION',is_adset_budget_sharing_enabled:false});record({...ids});
    ids.adset=await send('adsets',{name:f.name+' — Audience',campaign_id:ids.campaign,status:'PAUSED',daily_budget:Math.round(Number(f.budget)*100),
      billing_event:'IMPRESSIONS',optimization_goal:'LINK_CLICKS',bid_strategy:'LOWEST_COST_WITHOUT_CAP',destination_type:'WEBSITE',
      targeting:{geo_locations:{countries:f.countries.replaceAll(' ','').split(',')},age_min:+f.ageMin,age_max:+f.ageMax,publisher_platforms:['facebook'],facebook_positions:['feed']}
    });record({...ids});
    ids.creative=await send('adcreatives',{name:f.name+' — Creative',object_story_spec:{page_id:f.page,link_data:{
      link:f.website,picture:f.image,message:f.message,name:f.headline,call_to_action:{type:f.cta,value:{link:f.website}}
    }}});record({...ids});
    ids.ad=await send('ads',{name:f.name+' — Ad',adset_id:ids.adset,status:'PAUSED',creative:{creative_id:ids.creative}});record({...ids});
    return ids;
  } catch(error) { error.createdIds=ids;throw error; }
}
