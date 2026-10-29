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
