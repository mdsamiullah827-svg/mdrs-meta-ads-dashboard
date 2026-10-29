export async function makePDFReport({ campaigns, account, period, currency, mode }) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')]);
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pages = Math.max(1, Math.ceil(campaigns.length / 8));
  for (let page = 0; page < pages; page++) {
    const sheet = document.createElement('div');
    sheet.style.cssText = 'position:fixed;left:-12000px;top:0;width:1120px;padding:36px;background:white;color:#0f172a;font:16px system-ui;box-sizing:border-box;';
    const heading = document.createElement('h1'); heading.textContent = 'MDRS • Meta Ads Report'; sheet.appendChild(heading);
    const sub = document.createElement('p'); sub.textContent = account + ' | ' + period + ' | ' + currency; sheet.appendChild(sub);
    const meta = document.createElement('p'); meta.textContent = mode + ' • Generated ' + new Date().toLocaleString() + ' • Page ' + (page + 1) + '/' + pages; meta.style.color='#475569';sheet.appendChild(meta);
    const table = document.createElement('table'); table.style.cssText='width:100%;border-collapse:collapse;table-layout:fixed;font-size:13px';
    const addRow=(values, head=false)=>{
      const tr=document.createElement('tr');
      values.forEach((value,i)=>{const td=document.createElement(head?'th':'td');td.textContent=String(value);td.style.cssText='padding:12px 7px;border-bottom:1px solid #cbd5e1;text-align:left;overflow-wrap:anywhere;vertical-align:top;'+(i===0?'width:27%;':'')+(head?'background:#0f172a;color:white;':'');tr.appendChild(td);});
      table.appendChild(tr);
    };
    addRow(['Campaign / status','Spend','Impressions','Reach','Clicks','Results','CPR','ROAS'],true);
    const money=n=>Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2});
    campaigns.slice(page*8,page*8+8).forEach(c=>addRow([c.name+' / '+c.status,money(c.spend),money(c.impressions),money(c.reach),money(c.linkClicks),money(c.conversions)+' '+(c.resultLabel||'results'),money(c.cpa),money(c.roas)+'x']));
    sheet.appendChild(table);
    if(!campaigns.length){const p=document.createElement('p');p.textContent='No campaigns in this report.';sheet.appendChild(p);}
    document.body.appendChild(sheet);
    try {
      const canvas=await html2canvas(sheet,{scale:1.5,backgroundColor:'#ffffff',logging:false});
      if(page)pdf.addPage();
      const height=Math.min(190,canvas.height/canvas.width*277);
      pdf.addImage(canvas.toDataURL('image/png'),'PNG',10,10,277,height);
    } finally {sheet.remove();}
  }
  return pdf.output('blob');
}
