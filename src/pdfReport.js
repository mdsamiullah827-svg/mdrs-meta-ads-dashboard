export async function makePDFReport(report, options={}) {
  const {jsPDF} = await import('jspdf');
  if(typeof document!=='undefined' && document.fonts && /[\u0900-\u097f]/.test([report.account,...report.campaigns.map(c=>c.name)].join(' '))) await document.fonts.load('40px "Noto Sans Devanagari"','क');
  const pdf = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  // Only non-Latin text is drawn to small canvases; never screenshot the page or CSV.
  const createCanvas=options.createCanvas||(()=>document.createElement('canvas'));
  let measuring;
  const nonLatin=text=>/[^\x20-\x7e\n\r]/.test(String(text));
  const wrap=(value,width,size)=>{
    const text=String(value??'');
    pdf.setFontSize(size);
    if(!nonLatin(text))return pdf.splitTextToSize(text,width);
    measuring ||= createCanvas();const ctx=measuring.getContext('2d');ctx.font='40px "Noto Sans Devanagari", sans-serif';
    const maxWidth=width*40/(size*25.4/72);
    const segments=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].map(s=>s.segment):[...text];
    const lines=[];let line='';
    for(const ch of segments){if(ch==='\n'){lines.push(line);line='';}else if(line&&ctx.measureText(line+ch).width>maxWidth){lines.push(line);line=ch;}else line+=ch;}
    lines.push(line);return lines;
  };
  const draw=(lines,x,y,size=9)=>{
    pdf.setFontSize(size);
    for(const [i,line] of lines.entries()){
      const baseline=y+i*size*25.4/72*1.32;
      if(!nonLatin(line)){pdf.text(line,x,baseline);continue;}
      const canvas=createCanvas(),ctx=canvas.getContext('2d');ctx.font='40px "Noto Sans Devanagari", sans-serif';
      canvas.width=Math.ceil(ctx.measureText(line).width)+6;canvas.height=60;
      const painter=canvas.getContext('2d');painter.font='40px "Noto Sans Devanagari", sans-serif';painter.fillStyle='#0f172a';painter.textBaseline='alphabetic';painter.fillText(line,2,44);
      const factor=size*25.4/72/40;
      pdf.addImage(canvas.toDataURL('image/png'),'PNG',x,baseline-44*factor,canvas.width*factor,canvas.height*factor,undefined,'FAST');
    }
  };
  const widths=[75,28,30,28,24,35,28,25], left=12, bottom=193;
  let y=12;
  const text=(value,size=10)=>{
    pdf.setFontSize(size);
    const lines=wrap(value,273,size);
    draw(lines,left,y,size); y+=lines.length*size*0.45+3;
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
    const cells=[c.name+' / '+c.status,num(c.spend),num(c.impressions),num(c.reach),num(c.linkClicks),num(c.conversions)+' '+(c.resultLabel||'results'),num(c.cpa),num(c.roas)+'x'].map((v,i)=>wrap(v,widths[i]-4,9));
    if(index%20===0 && typeof window!=='undefined')await new Promise(resolve=>setTimeout(resolve,0));
    let offset=0;const count=Math.max(...cells.map(c=>c.length));
    while(offset<count) {
      let capacity=Math.floor((bottom-y-5)/4.2);
      if(capacity<1 || (offset===0 && count<=25 && count>capacity)){pdf.addPage();header();capacity=Math.floor((bottom-y-5)/4.2);}
      const n=Math.min(count-offset,capacity),height=n*4.2+5;
      if(index%2===0){pdf.setFillColor(241,245,249);pdf.rect(left,y,273,height,'F');}
      pdf.setTextColor(15,23,42);pdf.setFontSize(9);let x=left;
      cells.forEach((lines,i)=>{const slice=lines.slice(offset,offset+n);if(slice.length)draw(slice,x+2,y+4.5,9);x+=widths[i];});
      y+=height;offset+=n;
    }
  }
  if(!report.campaigns.length){y+=8;text('No campaigns in this reporting period.');}
  const pages=pdf.getNumberOfPages();
  for(let i=1;i<=pages;i++){pdf.setPage(i);pdf.setFontSize(8);pdf.setTextColor(100);pdf.text(`Page ${i} / ${pages}`,285,202,{align:'right'});}
  return pdf.output('blob');
}
