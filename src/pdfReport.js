export async function makePDFReport(report) {
  // Preserve non-Latin campaign names with browser font shaping.
  if (/[^\x00-\x7f]/.test(JSON.stringify(report))) return makeRasterPDFReport(report);
  const {jsPDF} = await import('jspdf');
  const pdf = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  const widths=[75,28,30,28,24,35,28,25], left=12, bottom=193;
  let y=12;
  const text=(value,size=10)=>{
    pdf.setFontSize(size);
    const lines=pdf.splitTextToSize(String(value),273);
    pdf.text(lines,left,y); y+=lines.length*size*0.45+3;
  };
  const header=()=>{
    y=15;pdf.setTextColor(15,23,42);pdf.setFont('helvetica','bold');
    text('MDRS | Meta Ads Report',18);pdf.setFont('helvetica','normal');
    text(report.account,11);text('Period: '+report.period,11);
    text('Currency: '+report.currency+' | Timezone: '+(report.timezone||'Ad account timezone'),9);
    text(report.mode+' | Generated: '+new Date().toISOString(),8);
    y+=3;pdf.setFillColor(15,23,42);pdf.rect(left,y,273,10,'F');pdf.setTextColor(255);pdf.setFontSize(8);
    let x=left;['Campaign / status','Spend','Impressions','Reach','Clicks','Results','CPR','ROAS'].forEach((label,i)=>{pdf.text(label,x+2,y+6);x+=widths[i];});
    y+=10;pdf.setTextColor(15,23,42);
  };
  header();
  const num=value=>Number(value||0).toLocaleString('en-US',{maximumFractionDigits:2});
  for(const [index,c] of report.campaigns.entries()) {
    pdf.setFontSize(9);
    const cells=[c.name+' / '+c.status,num(c.spend),num(c.impressions),num(c.reach),num(c.linkClicks),num(c.conversions)+' '+(c.resultLabel||'results'),num(c.cpa),num(c.roas)+'x'].map((v,i)=>pdf.splitTextToSize(v,widths[i]-4));
    let offset=0;const count=Math.max(...cells.map(c=>c.length));
    while(offset<count) {
      let capacity=Math.floor((bottom-y-5)/4.2);
      if(capacity<1 || (offset===0 && count<=25 && count>capacity)){pdf.addPage();header();capacity=Math.floor((bottom-y-5)/4.2);}
      const n=Math.min(count-offset,capacity),height=n*4.2+5;
      if(index%2===0){pdf.setFillColor(241,245,249);pdf.rect(left,y,273,height,'F');}
      pdf.setTextColor(15,23,42);pdf.setFontSize(9);let x=left;
      cells.forEach((lines,i)=>{const slice=lines.slice(offset,offset+n);if(slice.length)pdf.text(slice,x+2,y+4.5,{lineHeightFactor:1.32});x+=widths[i];});
      y+=height;offset+=n;
    }
  }
  if(!report.campaigns.length){y+=8;text('No campaigns in this reporting period.');}
  const pages=pdf.getNumberOfPages();
  for(let i=1;i<=pages;i++){pdf.setPage(i);pdf.setFontSize(8);pdf.setTextColor(100);pdf.text(`Page ${i} / ${pages}`,285,202,{align:'right'});}
  return pdf.output('blob');
}

async function makeRasterPDFReport({ campaigns, account, period, currency, mode, timezone }) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')]);
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pages = Math.max(1, Math.ceil(campaigns.length / 8));
  for (let page = 0; page < pages; page++) {
    const sheet = document.createElement('div');
    sheet.style.cssText = 'position:fixed;left:-12000px;top:0;width:1120px;padding:36px;background:white;color:#0f172a;font:16px/1.6 system-ui;isolation:isolate;box-sizing:border-box;';
    const heading = document.createElement('h1'); heading.style.cssText='display:block;position:static;font:700 28px/1.4 system-ui;margin:0 0 16px;padding:0;height:auto;'; heading.textContent = 'MDRS • Meta Ads Report'; sheet.appendChild(heading);
    const sub = document.createElement('p'); sub.style.cssText='display:block;position:static;font:16px/1.6 system-ui;white-space:normal;overflow-wrap:anywhere;margin:0 0 16px;padding:0;height:auto;'; sub.textContent = account + ' | ' + period + ' | ' + currency + ' | ' + (timezone || 'Ad account timezone'); sheet.appendChild(sub);
    const meta = document.createElement('p'); meta.textContent = mode + ' • Generated ' + new Date().toLocaleString() + ' • Page ' + (page + 1) + '/' + pages; meta.style.cssText='display:block;position:static;color:#475569;font:13px/1.6 system-ui;margin:0 0 24px;padding:0;height:auto;';sheet.appendChild(meta);
    const table = document.createElement('table'); table.style.cssText='width:100%;border-collapse:collapse;table-layout:fixed;font:13px/1.6 system-ui;margin-top:16px;position:static';
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
      const canvas=await html2canvas(sheet,{scale:1.25,backgroundColor:'#ffffff',logging:false});
      if(page)pdf.addPage();
      const ratio=Math.min(277/canvas.width,190/canvas.height);
      pdf.addImage(canvas.toDataURL('image/jpeg',0.9),'JPEG',10,10,canvas.width*ratio,canvas.height*ratio);
    } finally {sheet.remove();}
  }
  return pdf.output('blob');
}
