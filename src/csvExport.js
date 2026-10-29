const cell = value => {
  let text = String(value ?? '');
  // Treat user/API strings as text, not spreadsheet formulas.
  if (typeof value === 'string' && /^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
};
const fixed = value => Number.isFinite(Number(value)) ? Number(value).toFixed(2) : '0.00';

export function buildCampaignCSV(campaigns, currency = 'USD') {
  const headers = ['Campaign Name', 'Status', 'Currency', 'Daily Budget', 'Spend',
    'Impressions', 'Reach', 'Frequency', 'Link Clicks', 'CTR (%)', 'CPC',
    'Landing Page Views', 'Results', 'Result Type', 'Cost Per Result', 'Revenue', 'ROAS (x)'];
  const rows = campaigns.map(c => [
    c.name, c.status, currency, fixed(c.dailyBudget), fixed(c.spend),
    c.impressions, c.reach, fixed(c.frequency), c.linkClicks, fixed(c.ctr),
    fixed(c.cpc), c.landingPageViews, c.conversions, c.resultLabel || 'Conversions',
    fixed(c.cpa), fixed(c.revenue), fixed(c.roas)
  ]);
  return '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
