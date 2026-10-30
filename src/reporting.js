export function validDate(value) {
  if(typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value+'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}
export function validRange(range) {
  return !!range && validDate(range.since) && validDate(range.until) && range.since <= range.until;
}
export function availableHistoryRange(today=new Date().toISOString().slice(0,10)) {
  const end=new Date(today+'T00:00:00Z');
  const start=new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth()-37,1));
  const days=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,0)).getUTCDate();
  start.setUTCDate(Math.min(end.getUTCDate(),days)+1);
  return {since:start.toISOString().slice(0,10),until:today};
}
export function reportingQuery(preset, range) {
  if(preset === 'Custom time') {
    if(!validRange(range)) throw new Error('Choose a valid start and end date.');
    return {time_range:JSON.stringify({since:range.since,until:range.until})};
  }
  const presets = {'Today':'today','Yesterday':'yesterday','Last 7 Days':'last_7d','Last 30 Days':'last_30d','Maximum (Lifetime)':'data_maximum'};
  if(!presets[preset]) throw new Error('Unknown reporting period.');
  return {date_preset:presets[preset]};
}
export function periodLabel(preset, custom, reported) {
  const range = preset === 'Custom time' ? custom : reported;
  return validRange(range) ? `${preset}: ${range.since} to ${range.until}` : preset;
}
