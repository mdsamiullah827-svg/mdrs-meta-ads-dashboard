import {createPortal} from 'react-dom';
import React, {useState,useRef,useEffect} from 'react';
import {availableHistoryRange, validRange} from './reporting.js';
import './dateRangePicker.css';

const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const monthNames=Array.from({length:12},(_,i)=>new Date(2026,i,1).toLocaleString('en',{month:'long'}));
export default function DateRangePicker({value,onApply,onCancel,timezone}) {
 const previousFocus=useRef(document.activeElement);
 useEffect(()=>()=>previousFocus.current?.focus(),[]);
 const today=timezone?new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()):iso(new Date());
 const min=availableHistoryRange(today).since;
 const [range,setRange]=useState(validRange(value)?value:{since:'',until:''});
 const [choosingEnd,setChoosingEnd]=useState(false);
 const [month,setMonth]=useState(()=>{const d=new Date((value?.since||today)+'T12:00:00');return new Date(d.getFullYear(),d.getMonth(),1);});
 const select=date=>{
  if(!choosingEnd){setRange({since:date,until:''});setChoosingEnd(true);}
  else {setRange({since:date<range.since?date:range.since,until:date<range.since?range.since:date});setChoosingEnd(false);}
 };
 const move=n=>setMonth(d=>new Date(d.getFullYear(),d.getMonth()+n,1));
 const renderMonth=offset=>{
  const d=new Date(month.getFullYear(),month.getMonth()+offset,1), days=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
  return <section className="range-month" aria-label={monthNames[d.getMonth()]+' '+d.getFullYear()}>
   <h3>{monthNames[d.getMonth()]} {d.getFullYear()}</h3>
   <div className="range-grid">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(day=><span className="range-weekday" key={day}>{day}</span>)}
    {Array.from({length:d.getDay()},(_,i)=><span key={'blank'+i}/>)}
    {Array.from({length:days},(_,i)=>{const date=iso(new Date(d.getFullYear(),d.getMonth(),i+1));const endpoint=date===range.since||date===range.until;return <button type="button" key={date} aria-label={date} aria-pressed={endpoint} disabled={date<min||date>today} className={endpoint?'range-end':date>range.since&&date<range.until?'range-between':''} onClick={()=>select(date)}>{i+1}</button>;})}
   </div>
  </section>;
 };
 return createPortal(<div className="range-overlay" onKeyDown={e=>{if(e.key==='Escape')onCancel();if(e.key==='Tab'){const controls=[...e.currentTarget.querySelectorAll('button:not(:disabled),select')].filter(el=>el.getClientRects().length);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}>
  <section role="dialog" aria-modal="true" aria-label="Choose custom date range" className="range-dialog">
   <div className="range-top"><h2>Custom date range</h2><button autoFocus type="button" aria-label="Close calendar" onClick={onCancel}>×</button></div>
   <p>{choosingEnd?'Now choose the end date.':'Choose a start date, then an end date.'} Both dates are included.</p>
   <div className="range-navigation"><button type="button" aria-label="Previous month" onClick={()=>move(-1)} disabled={iso(new Date(month.getFullYear(),month.getMonth()+1,0))<min}>‹</button>
    <select aria-label="Calendar month" value={month.getMonth()} onChange={e=>setMonth(new Date(month.getFullYear(),Number(e.target.value),1))}>{monthNames.map((name,i)=><option key={name} value={i}>{name}</option>)}</select>
    <select aria-label="Calendar year" value={month.getFullYear()} onChange={e=>setMonth(new Date(Number(e.target.value),month.getMonth(),1))}>{Array.from({length:Number(today.slice(0,4))-Number(min.slice(0,4))+1},(_,i)=>Number(min.slice(0,4))+i).map(year=><option key={year}>{year}</option>)}</select>
    <button type="button" aria-label="Next month" onClick={()=>move(1)} disabled={iso(new Date(month.getFullYear(),month.getMonth()+1,1))>today}>›</button>
   </div>
   <div className="range-months">{renderMonth(0)}{renderMonth(1)}</div>
   <div className="range-selection"><span>From <strong>{range.since||'Select date'}</strong></span><span>To <strong>{range.until||'Select date'}</strong></span></div>
   <p className="range-note">Dates use the ad account timezone. Available history begins around {min}.</p>
   <div className="range-actions"><button type="button" onClick={onCancel}>Cancel</button><button className="range-apply" type="button" disabled={!validRange(range)||range.since<min||range.until>today} onClick={()=>onApply(range)}>Apply dates</button></div>
  </section>
 </div>,document.body);
}
