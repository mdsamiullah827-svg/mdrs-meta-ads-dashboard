import { metaFetch, askAI } from './portalApi.js';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { buildCampaignCSV } from './csvExport.js';
import CampaignBuilder from './CampaignBuilder.jsx';
import { makePDFReport } from './pdfReport.js';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Activity, TrendingUp, TrendingDown, DollarSign, Users, MousePointer,
  Target, Zap, AlertTriangle, CheckCircle2, Sparkles, Filter, Search,
  Play, Pause, RefreshCw, Download, Upload, Settings, ChevronRight,
  BarChart3, PieChart as PieChartIcon, Layers, Eye, ShoppingBag,
  ArrowUpRight, ArrowDownRight, Sun, Moon, MessageSquare, Sliders,
  Check, X, Smartphone, Monitor, Instagram, Facebook, Globe, HelpCircle,
  Send, Loader2, Award, Flame, ShieldAlert, FileSpreadsheet, Key,
  Link2, Unlink, Building2, ExternalLink, Info, Share2, Lock, Copy, ShieldCheck, Rocket
} from 'lucide-react';

// ==========================================
// INITIAL MOCK DATA & ACCOUNTS
// ==========================================
const AD_ACCOUNTS = [
  { id: 'act_101', name: 'M.D.R.S. Digital Services - Main Ad Account', currency: 'INR', industry: 'Agency / Mixed' },
  { id: 'act_102', name: 'Aura E-Commerce - Global Scaling', currency: 'USD', industry: 'E-Commerce' },
  { id: 'act_103', name: 'Apex B2B SaaS - Lead Generation', currency: 'INR', industry: 'B2B Tech' },
  { id: 'act_104', name: 'Lumina Skincare - Brand & Retargeting', currency: 'USD', industry: 'Beauty & Cosmetics' }
];

const INITIAL_CAMPAIGNS = [
  {
    id: 'cmp_1',
    accountId: 'act_101',
    name: 'Q4_Scale_Advantage+_Shopping_US',
    status: 'ACTIVE',
    objective: 'Conversions (Sales)',
    dailyBudget: 450,
    spend: 3120.50,
    impressions: 245800,
    reach: 162400,
    linkClicks: 5890,
    landingPageViews: 5120,
    addToCart: 980,
    conversions: 342,
    revenue: 14706.00,
    qualityRanking: 'Above Average',
    engagementRanking: 'Above Average',
    conversionRanking: 'Above Average',
    creativeFormat: '9:16 UGC Reels Video',
    creativeHeadline: 'Stop wasting 4 hours a day on manual reporting 🚀',
    primaryPlacement: 'Instagram Reels',
    historyMultiplier: 1.0
  },
  {
    id: 'cmp_2',
    accountId: 'act_101',
    name: 'Retargeting_Warm_30Days_Catalog_Carousel',
    status: 'ACTIVE',
    objective: 'Conversions (Sales)',
    dailyBudget: 200,
    spend: 1890.00,
    impressions: 98400,
    reach: 24100,
    linkClicks: 1320,
    landingPageViews: 1150,
    addToCart: 290,
    conversions: 98,
    revenue: 4704.00,
    qualityRanking: 'Average',
    engagementRanking: 'Below Average (Bottom 35%)',
    conversionRanking: 'Average',
    creativeFormat: '1:1 Dynamic Product Carousel',
    creativeHeadline: 'Still thinking about it? Take 15% off today!',
    primaryPlacement: 'Facebook Feed',
    historyMultiplier: 0.85
  },
  {
    id: 'cmp_3',
    accountId: 'act_101',
    name: 'Cold_Lookalike_1%_LeadGen_Webinar',
    status: 'ACTIVE',
    objective: 'Lead Generation',
    dailyBudget: 300,
    spend: 2410.25,
    impressions: 195000,
    reach: 142000,
    linkClicks: 4680,
    landingPageViews: 1920,
    addToCart: 540,
    conversions: 145,
    revenue: 7250.00,
    qualityRanking: 'Above Average',
    engagementRanking: 'Above Average',
    conversionRanking: 'Below Average (Bottom 20%)',
    creativeFormat: '4:5 Founder Story Video',
    creativeHeadline: 'Free Masterclass: Scale Your Meta ROAS in 2025',
    primaryPlacement: 'Instagram Stories',
    historyMultiplier: 0.95
  },
  {
    id: 'cmp_4',
    accountId: 'act_101',
    name: 'Broad_Interest_TechFounders_Static',
    status: 'ACTIVE',
    objective: 'Traffic / Awareness',
    dailyBudget: 150,
    spend: 1180.00,
    impressions: 184000,
    reach: 151000,
    linkClicks: 1950,
    landingPageViews: 1210,
    addToCart: 110,
    conversions: 19,
    revenue: 1140.00,
    qualityRanking: 'Below Average (Bottom 35%)',
    engagementRanking: 'Average',
    conversionRanking: 'Below Average (Bottom 20%)',
    creativeFormat: '1:1 Static Infographic',
    creativeHeadline: 'The All-In-One Growth Suite for Modern Brands',
    primaryPlacement: 'Audience Network',
    historyMultiplier: 0.7
  },
  {
    id: 'cmp_5',
    accountId: 'act_101',
    name: 'VIP_HighLTV_Lookalike_2%_Reels_HookB',
    status: 'ACTIVE',
    objective: 'Conversions (Sales)',
    dailyBudget: 180,
    spend: 1420.00,
    impressions: 112000,
    reach: 89000,
    linkClicks: 3580,
    landingPageViews: 3290,
    addToCart: 710,
    conversions: 268,
    revenue: 11524.00,
    qualityRanking: 'Above Average',
    engagementRanking: 'Above Average',
    conversionRanking: 'Above Average',
    creativeFormat: '9:16 Split-Screen Before/After Reel',
    creativeHeadline: 'Why 10,000+ marketers switched to this workflow',
    primaryPlacement: 'Instagram Reels',
    historyMultiplier: 1.15
  },
  {
    id: 'cmp_6',
    accountId: 'act_101',
    name: 'Holiday_Promo_Teaser_Video_Test',
    status: 'PAUSED',
    objective: 'Conversions (Sales)',
    dailyBudget: 120,
    spend: 640.00,
    impressions: 54000,
    reach: 41000,
    linkClicks: 790,
    landingPageViews: 680,
    addToCart: 95,
    conversions: 28,
    revenue: 1260.00,
    qualityRanking: 'Average',
    engagementRanking: 'Average',
    conversionRanking: 'Average',
    creativeFormat: '9:16 Motion Graphics Video',
    creativeHeadline: 'Early Access VIP Flash Sale Starts Now',
    primaryPlacement: 'Instagram Stories',
    historyMultiplier: 0.9
  }
];

const INITIAL_TIME_SERIES = [
  { date: 'Day 1', spend: 1320, conversions: 108, roas: 3.65, ctr: 2.14, clicks: 2150, impressions: 100467 },
  { date: 'Day 2', spend: 1410, conversions: 119, roas: 3.78, ctr: 2.21, clicks: 2390, impressions: 108144 },
  { date: 'Day 3', spend: 1380, conversions: 112, roas: 3.61, ctr: 2.18, clicks: 2280, impressions: 104587 },
  { date: 'Day 4', spend: 1520, conversions: 134, roas: 3.92, ctr: 2.35, clicks: 2640, impressions: 112340 },
  { date: 'Day 5', spend: 1610, conversions: 142, roas: 3.95, ctr: 2.41, clicks: 2890, impressions: 119917 },
  { date: 'Day 6', spend: 1690, conversions: 136, roas: 3.68, ctr: 2.29, clicks: 2790, impressions: 121834 },
  { date: 'Today', spend: 1730.75, conversions: 149, roas: 3.81, ctr: 2.38, clicks: 3070, impressions: 128991 }
];

const PLACEMENT_DATA = [
  { name: 'Instagram Reels', spend: 4120, conversions: 425, roas: 4.62, ctr: 2.95, cpa: 9.69, bounceRate: 18 },
  { name: 'Instagram Stories', spend: 2450, conversions: 210, roas: 3.85, ctr: 2.42, cpa: 11.67, bounceRate: 24 },
  { name: 'Facebook Feed', spend: 2380, conversions: 192, roas: 3.48, ctr: 1.95, cpa: 12.40, bounceRate: 29 },
  { name: 'Instagram Feed', spend: 920, conversions: 58, roas: 2.84, ctr: 1.68, cpa: 15.86, bounceRate: 32 },
  { name: 'Audience Network', spend: 790.75, conversions: 15, roas: 0.85, ctr: 1.12, cpa: 52.71, bounceRate: 68 }
];

const DEMOGRAPHICS_DATA = [
  { age: '18-24', male: 120, female: 165, totalResults: 285, roas: 3.1, spend: 1450, impressions: 42000, reach: 31000, clicks: 980, cpa: 5.09 },
  { age: '25-34', male: 310, female: 395, totalResults: 705, roas: 4.4, spend: 4280, impressions: 118000, reach: 84000, clicks: 3120, cpa: 6.07 },
  { age: '35-44', male: 225, female: 260, totalResults: 485, roas: 4.1, spend: 3120, impressions: 86000, reach: 61000, clicks: 2150, cpa: 6.43 },
  { age: '45-54', male: 95, female: 110, totalResults: 205, roas: 2.9, spend: 1240, impressions: 34000, reach: 24500, clicks: 690, cpa: 6.05 },
  { age: '55-64', male: 30, female: 34, totalResults: 64, roas: 2.4, spend: 390, impressions: 14000, reach: 10200, clicks: 240, cpa: 6.09 },
  { age: '65+', male: 12, female: 14, totalResults: 26, roas: 2.1, spend: 180.75, impressions: 6500, reach: 4900, clicks: 95, cpa: 6.95 }
];

const REGION_DATA = [
  { name: 'Bagmati Province (Kathmandu)', country: 'NP', spend: 3420, impressions: 112000, reach: 78000, clicks: 2890, conversions: 385, cpa: 8.88, ctr: 2.58, roas: 4.45 },
  { name: 'Maharashtra (Mumbai / Pune)', country: 'IN', spend: 2680, impressions: 94000, reach: 68000, clicks: 2310, conversions: 268, cpa: 10.00, ctr: 2.46, roas: 4.12 },
  { name: 'Delhi NCR', country: 'IN', spend: 1950, impressions: 68000, reach: 49000, clicks: 1640, conversions: 182, cpa: 10.71, ctr: 2.41, roas: 3.85 },
  { name: 'Madhesh Province', country: 'NP', spend: 1420, impressions: 56000, reach: 41000, clicks: 1380, conversions: 164, cpa: 8.66, ctr: 2.46, roas: 4.18 },
  { name: 'California / Texas', country: 'US', spend: 840, impressions: 18500, reach: 14200, clicks: 460, conversions: 48, cpa: 17.50, ctr: 2.49, roas: 3.60 },
  { name: 'Dubai / Abu Dhabi', country: 'AE', spend: 350.75, impressions: 11200, reach: 8900, clicks: 270, conversions: 29, cpa: 12.09, ctr: 2.41, roas: 3.92 }
];

const COUNTRY_DATA = [
  { country: 'India (IN)', code: 'IN', spend: 5120, impressions: 185000, reach: 132000, clicks: 4420, conversions: 510, cpa: 10.04, ctr: 2.39, roas: 4.05 },
  { country: 'Nepal (NP)', code: 'NP', spend: 4350, impressions: 168000, reach: 119000, clicks: 4270, conversions: 549, cpa: 7.92, ctr: 2.54, roas: 4.38 },
  { country: 'United States (US)', code: 'US', spend: 840, impressions: 18500, reach: 14200, clicks: 460, conversions: 48, cpa: 17.50, ctr: 2.49, roas: 3.60 },
  { country: 'United Arab Emirates (AE)', code: 'AE', spend: 350.75, impressions: 11200, reach: 8900, clicks: 270, conversions: 29, cpa: 12.09, ctr: 2.41, roas: 3.92 }
];

const DEVICE_SPLIT = [
  { name: 'iOS Mobile (iPhone)', value: 58, roas: 4.15, color: '#3b82f6' },
  { name: 'Android Mobile', value: 31, roas: 3.42, color: '#10b981' },
  { name: 'Desktop Web', value: 9, roas: 3.88, color: '#8b5cf6' },
  { name: 'Tablet / iPad', value: 2, roas: 2.10, color: '#f59e0b' }
];

const getCurrencySymbol = (currencyCode = 'USD') => {
  const code = String(currencyCode || 'USD').toUpperCase().trim();
  const map = {
    USD: '$',
    INR: '₹',
    NPR: 'NPR ',
    EUR: '€',
    GBP: '£',
    AED: 'AED ',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$'
  };
  return map[code] || `${code} `;
};

const formatCurrency = (val, decimals = 2, symbol = '$') => {
  if (val === undefined || val === null || isNaN(val)) return `${symbol}0.00`;
  const locale = symbol === '₹' || symbol === 'NPR ' ? 'en-IN' : 'en-US';
  return (
    symbol +
    Number(val).toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  );
};

const formatNumber = (val, symbol = '$') => {
  if (val === undefined || val === null || isNaN(val)) return '0';
  const locale = symbol === '₹' || symbol === 'NPR ' ? 'en-IN' : 'en-US';
  return Math.round(Number(val)).toLocaleString(locale);
};

const formatCompact = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0';
  if (val >= 10000000) return (val / 10000000).toFixed(2) + ' Cr';
  if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
  return Math.round(Number(val)).toLocaleString('en-US');
};

// Map Meta API indicator / action_type to clean human-readable Result Label
const formatMetaIndicatorLabel = (indicator = '') => {
  const ind = String(indicator || '').toLowerCase();
  if (!ind) return 'Results';
  if (ind.includes('messaging_conversation_started')) return 'Msg Conversations';
  if (ind.includes('messaging_first_reply')) return 'Msg Replies';
  if (ind.includes('total_messaging_connection') || ind.includes('messaging')) return 'Msg Leads';
  if (ind.includes('purchase') || ind.includes('fb_pixel_purchase')) return 'Purchases';
  if (ind.includes('lead')) return 'Leads';
  if (ind.includes('landing_page_view')) return 'Landing Page Views';
  if (ind.includes('link_click')) return 'Link Clicks';
  if (ind.includes('thruplay') || ind.includes('video_view')) return 'Video Views';
  if (ind.includes('post_engagement')) return 'Post Engagements';
  if (ind.includes('page_engagement')) return 'Page Engagements';
  if (ind.includes('like')) return 'Page Likes';
  if (ind.includes('add_to_cart')) return 'Add to Cart';
  if (ind.includes('reach')) return 'Reach';
  return 'Results';
};

// Exact Meta Ads Manager "Results" & "Cost Per Result" extractor
const extractExactMetaResults = (
  actions = [],
  actionValues = [],
  objective = '',
  costPerActionType = [],
  nativeResults = [],
  nativeCostPerResult = [],
  spend = 0
) => {
  const obj = String(objective || '').toUpperCase();
  const getAct = (types) => {
    if (!Array.isArray(actions)) return { count: 0, matchedType: null };
    for (const t of types) {
      const found = actions.find((a) => a.action_type === t);
      if (found && found.value !== undefined && parseFloat(found.value) > 0) {
        return { count: parseFloat(found.value), matchedType: t };
      }
    }
    return { count: 0, matchedType: null };
  };

  const getCostPerAct = (types) => {
    if (!Array.isArray(costPerActionType)) return 0;
    for (const t of types) {
      const found = costPerActionType.find((a) => a.action_type === t);
      if (found && found.value !== undefined && parseFloat(found.value) > 0) {
        return parseFloat(found.value);
      }
    }
    return 0;
  };

  const getVal = (types) => {
    if (!Array.isArray(actionValues)) return 0;
    for (const t of types) {
      const found = actionValues.find((a) => a.action_type === t);
      if (found && found.value !== undefined) return parseFloat(found.value);
    }
    return 0;
  };

  const purchaseTypes = [
    'omni_purchase',
    'purchase',
    'offsite_conversion.fb_pixel_purchase',
    'onsite_web_purchase'
  ];
  const leadTypes = [
    'lead',
    'onsite_conversion.lead_grouped',
    'offsite_conversion.fb_pixel_lead',
    'omni_complete_registration',
    'complete_registration'
  ];
  // Strict priority: 7d messaging conversations started first (exact Meta Ads Manager standard for WhatsApp/Messenger/IG DM ads)
  const messageTypes = [
    'onsite_conversion.messaging_conversation_started_7d',
    'onsite_conversion.total_messaging_connection',
    'onsite_conversion.messaging_first_reply'
  ];
  const linkClickTypes = ['link_click', 'inline_link_click'];
  const lpvTypes = ['landing_page_view', 'omni_landing_page_view'];
  const pageLikeTypes = ['like', 'page_like'];
  const thruPlayTypes = ['video_thruplay_watched_actions', 'video_view'];
  const postEngagementTypes = ['post_engagement', 'page_engagement'];
  const appInstallTypes = ['omni_app_install', 'mobile_app_install', 'app_install'];
  const atcTypes = ['omni_add_to_cart', 'add_to_cart', 'offsite_conversion.fb_pixel_add_to_cart'];

  const purchaseObj = getAct(purchaseTypes);
  const leadObj = getAct(leadTypes);
  const messageObj = getAct(messageTypes);
  const linkClickObj = getAct(linkClickTypes);
  const lpvObj = getAct(lpvTypes);
  const pageLikeObj = getAct(pageLikeTypes);
  const thruPlayObj = getAct(thruPlayTypes);
  const postEngObj = getAct(postEngagementTypes);
  const appInstallObj = getAct(appInstallTypes);
  const atcObj = getAct(atcTypes);

  const purchases = purchaseObj.count;
  const leads = leadObj.count;
  const messages = messageObj.count;
  const linkClicks = linkClickObj.count;
  const lpv = lpvObj.count;
  const pageLikes = pageLikeObj.count;
  const thruPlays = thruPlayObj.count;
  const postEngagement = postEngObj.count;
  const appInstalls = appInstallObj.count;
  const atc = atcObj.count;
  const purchaseRevenue = getVal(purchaseTypes);

  const exactCostPerMessage =
    getCostPerAct(messageTypes) || (messages > 0 && spend > 0 ? spend / messages : 0);
  const exactCostPerLead =
    getCostPerAct(leadTypes) || (leads > 0 && spend > 0 ? spend / leads : 0);
  const exactCostPerPurchase =
    getCostPerAct(purchaseTypes) || (purchases > 0 && spend > 0 ? spend / purchases : 0);

  // 1. First check if Meta Graph API returned native 'results' array (100% identical to Ads Manager "Results" column)
  if (Array.isArray(nativeResults) && nativeResults.length > 0) {
    const firstRes = nativeResults[0];
    const rawVal = firstRes?.values?.[0]?.value;
    const parsedCount = rawVal !== undefined ? parseFloat(rawVal) : 0;
    if (parsedCount > 0) {
      const indicator = firstRes.indicator || '';
      const label = formatMetaIndicatorLabel(indicator);
      let nativeCpr = 0;
      if (Array.isArray(nativeCostPerResult) && nativeCostPerResult.length > 0) {
        const cprVal = nativeCostPerResult[0]?.values?.[0]?.value;
        if (cprVal !== undefined) nativeCpr = parseFloat(cprVal);
      }
      if (!nativeCpr && indicator) {
        const cleanInd = indicator.replace(/^actions:/, '');
        nativeCpr = getCostPerAct([cleanInd, indicator]);
      }
      if (!nativeCpr && spend > 0) {
        nativeCpr = spend / parsedCount;
      }

      return {
        primaryResultCount: parsedCount,
        primaryResultLabel: label,
        exactCpr: nativeCpr,
        purchases,
        leads,
        messages,
        exactCostPerMessage,
        exactCostPerLead,
        exactCostPerPurchase,
        linkClicks,
        lpv,
        atc,
        postEngagement,
        thruPlays,
        purchaseRevenue
      };
    }
  }

  // 2. Fallback: Match Meta Ads Manager "Results" column logic for every campaign objective
  let primaryResultCount = 0;
  let primaryResultLabel = 'Results';
  let matchedTypesForCost = [];

  if (obj.includes('SALES') || obj.includes('CONVERSIONS') || obj.includes('PRODUCT_CATALOG')) {
    if (purchases > 0) {
      primaryResultCount = purchases;
      primaryResultLabel = 'Purchases';
      matchedTypesForCost = purchaseTypes;
    } else if (messages > 0) {
      primaryResultCount = messages;
      primaryResultLabel = 'Msg Conversations';
      matchedTypesForCost = messageTypes;
    } else if (leads > 0) {
      primaryResultCount = leads;
      primaryResultLabel = 'Leads';
      matchedTypesForCost = leadTypes;
    } else if (atc > 0) {
      primaryResultCount = atc;
      primaryResultLabel = 'Add to Cart';
      matchedTypesForCost = atcTypes;
    } else {
      primaryResultCount = lpv > 0 ? lpv : linkClicks;
      primaryResultLabel = lpv > 0 ? 'Landing Page Views' : 'Link Clicks';
      matchedTypesForCost = lpv > 0 ? lpvTypes : linkClickTypes;
    }
  } else if (obj.includes('LEAD')) {
    if (leads > 0) {
      primaryResultCount = leads;
      primaryResultLabel = 'Leads';
      matchedTypesForCost = leadTypes;
    } else if (messages > 0) {
      primaryResultCount = messages;
      primaryResultLabel = 'Msg Conversations';
      matchedTypesForCost = messageTypes;
    } else {
      primaryResultCount = linkClicks;
      primaryResultLabel = 'Link Clicks';
      matchedTypesForCost = linkClickTypes;
    }
  } else if (obj.includes('MESSAGE')) {
    primaryResultCount = messages > 0 ? messages : linkClicks;
    primaryResultLabel = messages > 0 ? 'Msg Conversations' : 'Link Clicks';
    matchedTypesForCost = messages > 0 ? messageTypes : linkClickTypes;
  } else if (obj.includes('ENGAGEMENT') || obj.includes('POST_ENGAGEMENT') || obj.includes('PAGE_LIKES')) {
    if (messages > 0) {
      primaryResultCount = messages;
      primaryResultLabel = 'Msg Conversations';
      matchedTypesForCost = messageTypes;
    } else if (pageLikes > 0 && obj.includes('PAGE_LIKES')) {
      primaryResultCount = pageLikes;
      primaryResultLabel = 'Page Likes';
      matchedTypesForCost = pageLikeTypes;
    } else if (thruPlays > 0 && postEngagement === 0) {
      primaryResultCount = thruPlays;
      primaryResultLabel = 'ThruPlays';
      matchedTypesForCost = thruPlayTypes;
    } else if (postEngagement > 0) {
      primaryResultCount = postEngagement;
      primaryResultLabel = 'Post Engagements';
      matchedTypesForCost = postEngagementTypes;
    } else {
      primaryResultCount = linkClicks;
      primaryResultLabel = 'Clicks';
      matchedTypesForCost = linkClickTypes;
    }
  } else if (obj.includes('VIDEO_VIEWS')) {
    primaryResultCount = thruPlays > 0 ? thruPlays : postEngagement;
    primaryResultLabel = 'ThruPlays / Views';
    matchedTypesForCost = thruPlays > 0 ? thruPlayTypes : postEngagementTypes;
  } else if (obj.includes('TRAFFIC') || obj.includes('LINK_CLICKS')) {
    if (messages > 0 && lpv === 0) {
      primaryResultCount = messages;
      primaryResultLabel = 'Msg Conversations';
      matchedTypesForCost = messageTypes;
    } else {
      primaryResultCount = lpv > 0 ? lpv : linkClicks;
      primaryResultLabel = lpv > 0 ? 'Landing Page Views' : 'Link Clicks';
      matchedTypesForCost = lpv > 0 ? lpvTypes : linkClickTypes;
    }
  } else if (obj.includes('APP')) {
    primaryResultCount = appInstalls > 0 ? appInstalls : linkClicks;
    primaryResultLabel = appInstalls > 0 ? 'App Installs' : 'Link Clicks';
    matchedTypesForCost = appInstalls > 0 ? appInstallTypes : linkClickTypes;
  } else {
    // Fallback priority when objective is account-level or general
    if (messages > 0 && messages >= purchases && messages >= leads) {
      primaryResultCount = messages;
      primaryResultLabel = 'Msg Conversations';
      matchedTypesForCost = messageTypes;
    } else if (purchases > 0) {
      primaryResultCount = purchases;
      primaryResultLabel = 'Purchases';
      matchedTypesForCost = purchaseTypes;
    } else if (leads > 0) {
      primaryResultCount = leads;
      primaryResultLabel = 'Leads';
      matchedTypesForCost = leadTypes;
    } else if (lpv > 0) {
      primaryResultCount = lpv;
      primaryResultLabel = 'Landing Page Views';
      matchedTypesForCost = lpvTypes;
    } else if (linkClicks > 0) {
      primaryResultCount = linkClicks;
      primaryResultLabel = 'Link Clicks';
      matchedTypesForCost = linkClickTypes;
    } else if (postEngagement > 0) {
      primaryResultCount = postEngagement;
      primaryResultLabel = 'Engagements';
      matchedTypesForCost = postEngagementTypes;
    }
  }

  const apiDirectCpr = getCostPerAct(matchedTypesForCost);
  const exactCpr =
    apiDirectCpr > 0
      ? apiDirectCpr
      : primaryResultCount > 0 && spend > 0
      ? spend / primaryResultCount
      : 0;

  return {
    primaryResultCount,
    primaryResultLabel,
    exactCpr,
    purchases,
    leads,
    messages,
    exactCostPerMessage,
    exactCostPerLead,
    exactCostPerPurchase,
    linkClicks,
    lpv,
    atc,
    postEngagement,
    thruPlays,
    purchaseRevenue
  };
};

export default function App({ portalUser, portalAccounts }) {
  const [darkMode, setDarkMode] = useState(true);
  const [csvExport, setCsvExport] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }, [pdfUrl]);
  useEffect(() => {
    return () => { if (csvExport) URL.revokeObjectURL(csvExport.url); };
  }, [csvExport]);
  const [activeTab, setActiveTab] = useState('overview');
  const [adAccounts, setAdAccounts] = useState(portalAccounts);
  const [selectedAccount, setSelectedAccount] = useState(portalAccounts[0]?.id || '');
  const [datePreset, setDatePreset] = useState('Last 30 Days');
  const [liveSync, setLiveSync] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [livePulseCount, setLivePulseCount] = useState(0);
  const [exactAccountOverview, setExactAccountOverview] = useState(null);

  const [campaigns, setCampaigns] = useState([]);
  const [timeSeries, setTimeSeries] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [demographics, setDemographics] = useState([]);
  const [regionsData, setRegionsData] = useState([]);
  const [countriesData, setCountriesData] = useState([]);
  const [geoViewMode, setGeoViewMode] = useState('region');
  const [deviceSplit, setDeviceSplit] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('spend');
  const [sortOrder, setSortOrder] = useState('desc');
  const [appliedOptimizations, setAppliedOptimizations] = useState([]);
  const [simulatedLiftModal, setSimulatedLiftModal] = useState(null);
  const [notificationToast, setNotificationToast] = useState(null);
  const [primaryChartMetric, setPrimaryChartMetric] = useState('spend');
  const [secondaryChartMetric, setSecondaryChartMetric] = useState('conversions');

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState('');
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiSelectedFocus, setAiSelectedFocus] = useState('Full Account Audit & Scaling Plan');

  const metaApiVersion = 'server';
  const [isLiveApiModalOpen, setIsLiveApiModalOpen] = useState(false);
  const isLiveApiConnected = true;
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(false);
  const [isFetchingLiveInsights, setIsFetchingLiveInsights] = useState(false);
  const [apiErrorMsg, setApiErrorMsg] = useState(null);
  const [discoveredLiveAccounts, setDiscoveredLiveAccounts] = useState(portalAccounts);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const isClientLockedMode = portalUser.role !== 'admin';
  const clientBrandName = portalAccounts[0]?.industry || portalUser.name;
  const [copiedLinkSuccess, setCopiedLinkSuccess] = useState(false);
  const activeFetchIdRef = useRef(0);

  const [newCampaignForm, setNewCampaignForm] = useState({
    name: '',
    dailyBudget: 250,
    spend: 1200,
    impressions: 95000,
    reach: 72000,
    linkClicks: 2100,
    landingPageViews: 1750,
    conversions: 95,
    revenue: 4200,
    creativeFormat: '9:16 UGC Reels Video',
    primaryPlacement: 'Instagram Reels'
  });

  const showToast = (title, message) => {
    setNotificationToast({ title, message });
    setTimeout(() => {
      setNotificationToast(null);
    }, 4500);
  };

  const activeCurrencyCode = useMemo(() => {
    const acc = adAccounts.find((a) => a.id === selectedAccount);
    return acc?.currency ? String(acc.currency).toUpperCase() : 'USD';
  }, [adAccounts, selectedAccount]);

  const activeCurrencySymbol = useMemo(() => {
    return getCurrencySymbol(activeCurrencyCode);
  }, [activeCurrencyCode]);

  const fmtMoney = (val, decimals = 2) => formatCurrency(val, decimals, activeCurrencySymbol);

  const mapDatePresetToMeta = (preset) => {
    switch (preset) {
      case 'Today': return 'today';
      case 'Yesterday': return 'yesterday';
      case 'Last 7 Days': return 'last_7d';
      case 'Last 30 Days': return 'last_30d';
      // Meta Graph API v20.0+ / v21.0 requires 'data_maximum' instead of deprecated 'maximum'
      case 'Maximum (Lifetime)': return 'data_maximum';
      case 'Custom (Q4 Peak)': return 'data_maximum';
      default: return 'last_30d';
    }
  };

  const extractMetaActionMetric = (actionsArr, actionTypes) => {
    if (!Array.isArray(actionsArr)) return 0;
    for (const type of actionTypes) {
      const found = actionsArr.find((a) => a.action_type === type);
      if (found && found.value) return parseFloat(found.value);
    }
    return 0;
  };

  const handleFetchAllManagedAccounts = () => fetchLiveAccountTelemetry(selectedAccount, null, datePreset, portalAccounts);

  const fetchLiveAccountTelemetry = async (
    accountIdToFetch,
    tokenOverride,
    presetOverride,
    accountsPoolOverride
  ) => {
    if (!accountIdToFetch) return;

    // Increment request tracker so slow responses from a previous Ad Account never overwrite the newly selected Ad Account
    const currentFetchId = ++activeFetchIdRef.current;

    setIsFetchingLiveInsights(true);
    setExactAccountOverview(null); setCampaigns([]); setTimeSeries([]); setPlacements([]); setDemographics([]); setRegionsData([]); setCountriesData([]);
    setApiErrorMsg(null);
    const metaPreset = mapDatePresetToMeta(presetOverride || datePreset);
    const pool = accountsPoolOverride || discoveredLiveAccounts;

    // Build a helper for date query param with automatic fallback if 'data_maximum' isn't supported on older API versions
    const getDateQueryParam = (presetCode) => `date_preset=${presetCode}`;

    try {
      const targetAccountIds =
        accountIdToFetch === 'ALL_MANAGED_ACCOUNTS'
          ? pool.slice(0, 5).map((a) => a.id)
          : [accountIdToFetch];

      const primaryAct = targetAccountIds[0];

      // 0. Fetch exact Ad Account currency & name metadata + Account-Level summary
      const accInfoUrl = `https://graph.facebook.com/${metaApiVersion}/${primaryAct}?fields=id,name,currency,account_status,business_name,amount_spent`;
      let accSummaryInsightsUrl = `https://graph.facebook.com/${metaApiVersion}/${primaryAct}/insights?level=account&${getDateQueryParam(metaPreset)}&fields=spend,impressions,reach,frequency,clicks,inline_link_clicks,ctr,inline_link_click_ctr,cpc,cpm,actions,action_values,cost_per_action_type,results,cost_per_result,purchase_roas`;

      let [accInfoRes, accSumRes] = await Promise.all([
        metaFetch(accInfoUrl),
        metaFetch(accSummaryInsightsUrl)
      ]);
      const accInfoJson = await accInfoRes.json();
      let accSumJson = await accSumRes.json();

      // Fallback if the user selected 'v19.0' where 'maximum' or 'results' is not supported
      let effectiveMetaPreset = metaPreset;
      if (accSumJson?.error) {
        if (metaPreset === 'data_maximum') {
          effectiveMetaPreset = 'maximum';
        }
        accSummaryInsightsUrl = `https://graph.facebook.com/${metaApiVersion}/${primaryAct}/insights?level=account&date_preset=${effectiveMetaPreset}&fields=spend,impressions,reach,frequency,clicks,inline_link_clicks,ctr,inline_link_click_ctr,cpc,cpm,actions,action_values,cost_per_action_type,purchase_roas`;
        accSumRes = await metaFetch(accSummaryInsightsUrl);
        accSumJson = await accSumRes.json();
      }

      if (currentFetchId !== activeFetchIdRef.current) return;

      if (accInfoJson && !accInfoJson.error) {
        setAdAccounts((prev) => {
          const exists = prev.some((a) => a.id === primaryAct);
          if (!exists) {
            return [
              ...prev,
              {
                id: primaryAct,
                name: accInfoJson.name || primaryAct,
                currency: accInfoJson.currency || 'USD',
                industry: accInfoJson.business_name || 'Meta Ad Account'
              }
            ];
          }
          return prev.map((a) =>
            a.id === primaryAct
              ? {
                  ...a,
                  name: accInfoJson.name || a.name,
                  currency: accInfoJson.currency || a.currency
                }
              : a
          );
        });
      }

      const campaignFields = [
        'campaign_id',
        'campaign_name',
        'objective',
        'spend',
        'impressions',
        'reach',
        'clicks',
        'inline_link_clicks',
        'ctr',
        'inline_link_click_ctr',
        'cpc',
        'cpm',
        'frequency',
        'actions',
        'action_values',
        'cost_per_action_type',
        'results',
        'cost_per_result',
        'purchase_roas',
        'quality_ranking',
        'engagement_rate_ranking',
        'conversion_rate_ranking'
      ].join(',');

      const fallbackCampaignFields = [
        'campaign_id',
        'campaign_name',
        'objective',
        'spend',
        'impressions',
        'reach',
        'clicks',
        'inline_link_clicks',
        'ctr',
        'inline_link_click_ctr',
        'cpc',
        'cpm',
        'frequency',
        'actions',
        'action_values',
        'cost_per_action_type',
        'purchase_roas',
        'quality_ranking',
        'engagement_rate_ranking',
        'conversion_rate_ranking'
      ].join(',');

      const campaignPromises = targetAccountIds.map(async (actId) => {
        // Fetch BOTH all campaign insights (which includes deleted/archived campaigns that spent in the period) AND campaign metadata
        let insightsUrl = `https://graph.facebook.com/${metaApiVersion}/${actId}/insights?level=campaign&date_preset=${effectiveMetaPreset}&fields=${campaignFields}&limit=500`;
        const campaignsMetaUrl = `https://graph.facebook.com/${metaApiVersion}/${actId}/campaigns?fields=id,name,effective_status,status,daily_budget,lifetime_budget,objective&limit=500`;

        let [insRes, cmpRes] = await Promise.all([metaFetch(insightsUrl), metaFetch(campaignsMetaUrl)]);
        let insJson = await insRes.json();
        const cmpJson = await cmpRes.json();

        // Fallback if 'results,cost_per_result' fields are unsupported on older API version
        if (insJson?.error) {
          insightsUrl = `https://graph.facebook.com/${metaApiVersion}/${actId}/insights?level=campaign&date_preset=${effectiveMetaPreset}&fields=${fallbackCampaignFields}&limit=500`;
          insRes = await metaFetch(insightsUrl);
          insJson = await insRes.json();
        }

        const insightMap = {};
        if (Array.isArray(insJson?.data)) {
          insJson.data.forEach((row) => {
            if (row.campaign_id) {
              insightMap[row.campaign_id] = row;
            }
          });
        }

        const metaCampaignMap = {};
        if (Array.isArray(cmpJson?.data)) {
          cmpJson.data.forEach((c) => {
            if (c.id) {
              metaCampaignMap[c.id] = c;
            }
          });
        }

        // Union of all campaign IDs from both insights and campaign list so archived/completed campaigns with spend are NEVER lost
        const allCampaignIds = Array.from(
          new Set([...Object.keys(insightMap), ...Object.keys(metaCampaignMap)])
        );

        return allCampaignIds.map((cid) => {
          const c = metaCampaignMap[cid] || {};
          const row = insightMap[cid] || {};
          const spend = parseFloat(row.spend || 0);
          const impressions = parseInt(row.impressions || 0, 10);
          const reach = parseInt(row.reach || 0, 10);
          const allClicks = parseInt(row.clicks || 0, 10);
          const objective = row.objective || c.objective || 'OUTCOME_ENGAGEMENT';

          const exactMetrics = extractExactMetaResults(
            row.actions,
            row.action_values,
            objective,
            row.cost_per_action_type,
            row.results,
            row.cost_per_result,
            spend
          );
          const linkClicks =
            exactMetrics.linkClicks || parseInt(row.inline_link_clicks || row.clicks || 0, 10);

          const dailyBudget = c.daily_budget
            ? parseFloat(c.daily_budget) / 100
            : c.lifetime_budget
            ? parseFloat(c.lifetime_budget) / 100
            : 0;

          const effectiveStatus = c.effective_status || c.status || (spend > 0 ? 'ACTIVE' : 'COMPLETED');

          return {
            id: cid,
            accountId: actId,
            name: row.campaign_name || c.name || 'Meta Campaign',
            status: effectiveStatus,
            objective,
            dailyBudget,
            spend,
            impressions,
            reach,
            allClicks,
            linkClicks,
            landingPageViews: exactMetrics.lpv,
            addToCart: exactMetrics.atc,
            conversions: exactMetrics.primaryResultCount,
            resultLabel: exactMetrics.primaryResultLabel,
            exactCpr: exactMetrics.exactCpr,
            purchases: exactMetrics.purchases,
            leads: exactMetrics.leads,
            messages: exactMetrics.messages,
            exactCostPerMessage: exactMetrics.exactCostPerMessage,
            revenue: exactMetrics.purchaseRevenue,
            qualityRanking: row.quality_ranking || 'Average',
            engagementRanking: row.engagement_rate_ranking || 'Average',
            conversionRanking: row.conversion_rate_ranking || 'Average',
            creativeFormat: String(objective).replace('OUTCOME_', ''),
            creativeHeadline: `${exactMetrics.primaryResultLabel} • ${effectiveStatus}`,
            primaryPlacement: 'Meta Ads Manager',
            historyMultiplier: 1.0
          };
        });
      });

      const nestedCampaigns = await Promise.all(campaignPromises);
      if (currentFetchId !== activeFetchIdRef.current) return;

      // Sort campaigns so active/spending campaigns appear at the top
      const flatCampaigns = nestedCampaigns
        .flat()
        .sort((a, b) => b.spend - a.spend || b.impressions - a.impressions);
      setCampaigns(flatCampaigns);

      // Sum campaign-level metrics and track spend by result type so Cost Per Result / Cost Per Msg is 100% accurate
      const campAgg = flatCampaigns.reduce(
        (acc, cur) => {
          acc.spend += cur.spend;
          acc.impressions += cur.impressions;
          acc.reach += cur.reach;
          acc.allClicks += cur.allClicks || cur.linkClicks;
          acc.linkClicks += cur.linkClicks;
          acc.lpv += cur.landingPageViews;
          acc.atc += cur.addToCart;
          acc.conversions += cur.conversions;
          acc.purchases += cur.purchases || 0;
          acc.leads += cur.leads || 0;
          acc.messages += cur.messages || 0;
          acc.revenue += cur.revenue || 0;

          if (cur.messages > 0) {
            acc.messageCampaignSpend += cur.spend;
          }
          if (cur.spend > 0 && cur.conversions > 0 && cur.resultLabel) {
            acc.labelCounts[cur.resultLabel] = (acc.labelCounts[cur.resultLabel] || 0) + cur.conversions;
            acc.labelSpend[cur.resultLabel] = (acc.labelSpend[cur.resultLabel] || 0) + cur.spend;
          }
          return acc;
        },
        {
          spend: 0,
          impressions: 0,
          reach: 0,
          allClicks: 0,
          linkClicks: 0,
          lpv: 0,
          atc: 0,
          conversions: 0,
          purchases: 0,
          leads: 0,
          messages: 0,
          messageCampaignSpend: 0,
          revenue: 0,
          labelCounts: {},
          labelSpend: {}
        }
      );

      // Determine the dominant primary result type for this specific Ad Account
      let dominantLabel = 'Results';
      const sortedLabels = Object.entries(campAgg.labelCounts).sort((a, b) => b[1] - a[1]);
      if (sortedLabels.length > 0) {
        dominantLabel = sortedLabels[0][0];
      }

      // Store exact Account-Level totals from Meta Ads Manager, cross-verified with Campaign Totals
      const accRow = Array.isArray(accSumJson?.data) && accSumJson.data.length > 0 ? accSumJson.data[0] : null;
      if (accRow) {
        const sp = parseFloat(accRow.spend || 0) || campAgg.spend;
        const parsedResults = extractExactMetaResults(
          accRow.actions,
          accRow.action_values,
          '',
          accRow.cost_per_action_type,
          accRow.results,
          accRow.cost_per_result,
          sp
        );
        const imp = parseInt(accRow.impressions || 0, 10) || campAgg.impressions;
        const rch = parseInt(accRow.reach || 0, 10) || campAgg.reach;
        const allClicks = parseInt(accRow.clicks || 0, 10) || campAgg.allClicks;
        const lnk =
          parsedResults.linkClicks ||
          parseInt(accRow.inline_link_clicks || accRow.clicks || 0, 10) ||
          campAgg.linkClicks;

        const exactCpm = imp > 0 ? (sp / imp) * 1000 : parseFloat(accRow.cpm || 0);
        const exactCtr = parseFloat(accRow.ctr || 0) || (imp > 0 ? (allClicks / imp) * 100 : 0);
        const exactLinkCtr =
          parseFloat(accRow.inline_link_click_ctr || 0) || (imp > 0 ? (lnk / imp) * 100 : 0);
        const exactCpc = lnk > 0 ? sp / lnk : parseFloat(accRow.cpc || 0);

        const totalRev = parsedResults.purchaseRevenue || campAgg.revenue;
        const directRoas =
          Array.isArray(accRow.purchase_roas) && accRow.purchase_roas.length > 0
            ? parseFloat(accRow.purchase_roas[0].value || 0)
            : sp > 0 && totalRev > 0
            ? totalRev / sp
            : 0;

        // If the account primarily runs Messaging campaigns, show exact Messaging Conversations & Cost Per Message
        const totalMessages = parsedResults.messages || campAgg.messages;
        const totalPurchases = parsedResults.purchases || campAgg.purchases;
        const totalLeads = parsedResults.leads || campAgg.leads;

        let totalConv = parsedResults.primaryResultCount;
        let finalLabel = parsedResults.primaryResultLabel;
        let exactAccountCpr = parsedResults.exactCpr;

        if (dominantLabel.includes('Msg') && totalMessages > 0) {
          totalConv = totalMessages;
          finalLabel = 'Msg Conversations';
          // Calculate Cost Per Message from messaging campaigns' spend (or Meta's direct cost_per_action_type)
          exactAccountCpr =
            campAgg.messageCampaignSpend > 0
              ? campAgg.messageCampaignSpend / totalMessages
              : parsedResults.exactCostPerMessage || sp / totalMessages;
        } else if (campAgg.labelCounts[dominantLabel] > 0) {
          totalConv = campAgg.labelCounts[dominantLabel];
          finalLabel = dominantLabel;
          const labelSp = campAgg.labelSpend[dominantLabel] || sp;
          exactAccountCpr = labelSp / totalConv;
        } else if (campAgg.conversions > 0 && totalConv === 0) {
          totalConv = campAgg.conversions;
          finalLabel = dominantLabel;
          exactAccountCpr = sp / totalConv;
        }

        setExactAccountOverview({
          spend: sp,
          impressions: imp,
          reach: rch,
          frequency: rch > 0 ? imp / rch : parseFloat(accRow.frequency || 0),
          allClicks,
          linkClicks: lnk,
          ctr: exactCtr,
          linkCtr: exactLinkCtr,
          cpc: exactCpc,
          cpm: exactCpm,
          landingPageViews: parsedResults.lpv || campAgg.lpv,
          addToCart: parsedResults.atc || campAgg.atc,
          conversions: totalConv,
          resultLabel: finalLabel,
          exactCpr: exactAccountCpr,
          purchases: totalPurchases,
          leads: totalLeads,
          messages: totalMessages,
          exactCostPerMessage:
            campAgg.messageCampaignSpend > 0 && totalMessages > 0
              ? campAgg.messageCampaignSpend / totalMessages
              : parsedResults.exactCostPerMessage,
          revenue: totalRev,
          roas: directRoas
        });
      } else {
        // Fallback to summed campaign data if account-level insight row is empty
        const sp = campAgg.spend;
        const imp = campAgg.impressions;
        const rch = campAgg.reach;
        const lnk = campAgg.linkClicks;
        const domCount = campAgg.labelCounts[dominantLabel] || campAgg.conversions;
        const domSpend = campAgg.labelSpend[dominantLabel] || sp;
        setExactAccountOverview({
          spend: sp,
          impressions: imp,
          reach: rch,
          frequency: rch > 0 ? imp / rch : 0,
          allClicks: campAgg.allClicks,
          linkClicks: lnk,
          ctr: imp > 0 ? ((campAgg.allClicks || lnk) / imp) * 100 : 0,
          linkCtr: imp > 0 ? (lnk / imp) * 100 : 0,
          cpc: lnk > 0 ? sp / lnk : 0,
          cpm: imp > 0 ? (sp / imp) * 1000 : 0,
          landingPageViews: campAgg.lpv,
          addToCart: campAgg.atc,
          conversions: domCount,
          resultLabel: dominantLabel,
          exactCpr: domCount > 0 ? domSpend / domCount : 0,
          purchases: campAgg.purchases,
          leads: campAgg.leads,
          messages: campAgg.messages,
          exactCostPerMessage:
            campAgg.messages > 0 && campAgg.messageCampaignSpend > 0
              ? campAgg.messageCampaignSpend / campAgg.messages
              : 0,
          revenue: campAgg.revenue,
          roas: sp > 0 && campAgg.revenue > 0 ? campAgg.revenue / sp : 0
        });
      }

      // Fetch Time-Series, Placements, Age/Gender & Country/Region in parallel for the selected Ad Account
      const timeSeriesUrl = `https://graph.facebook.com/${metaApiVersion}/${primaryAct}/insights?date_preset=${effectiveMetaPreset}&time_increment=1&fields=date_start,spend,impressions,inline_link_clicks,clicks,ctr,actions,action_values&limit=90`;
      const placementUrl = `https://graph.facebook.com/${metaApiVersion}/${primaryAct}/insights?date_preset=${effectiveMetaPreset}&breakdowns=publisher_platform,platform_position&fields=spend,impressions,reach,inline_link_clicks,clicks,ctr,cpc,cpm,actions,action_values&limit=50`;
      const demoUrl = `https://graph.facebook.com/${metaApiVersion}/${primaryAct}/insights?date_preset=${effectiveMetaPreset}&breakdowns=age,gender&fields=spend,impressions,reach,inline_link_clicks,clicks,actions,action_values&limit=100`;
      const regionUrl = `https://graph.facebook.com/${metaApiVersion}/${primaryAct}/insights?date_preset=${effectiveMetaPreset}&breakdowns=country,region&fields=spend,impressions,reach,inline_link_clicks,clicks,ctr,actions,action_values&limit=100`;
      const countryUrl = `https://graph.facebook.com/${metaApiVersion}/${primaryAct}/insights?date_preset=${effectiveMetaPreset}&breakdowns=country&fields=spend,impressions,reach,inline_link_clicks,clicks,ctr,actions,action_values&limit=100`;

      const [tsRes, plRes, demoRes, regRes, cntRes] = await Promise.all([
        metaFetch(timeSeriesUrl),
        metaFetch(placementUrl),
        metaFetch(demoUrl),
        metaFetch(regionUrl),
        metaFetch(countryUrl)
      ]);

      const [tsJson, plJson, demoJson, regJson, cntJson] = await Promise.all([
        tsRes.json(),
        plRes.json(),
        demoRes.json(),
        regRes.json(),
        cntRes.json()
      ]);

      if (currentFetchId !== activeFetchIdRef.current) return;

      // 1. Update Time Series (Always replace so previous account's chart never lingers)
      if (Array.isArray(tsJson?.data) && tsJson.data.length > 0) {
        const mappedSeries = tsJson.data.map((d) => {
          const sp = parseFloat(d.spend || 0);
          const imp = parseInt(d.impressions || 0, 10);
          const exact = extractExactMetaResults(d.actions, d.action_values, '');
          const clk = exact.linkClicks || parseInt(d.inline_link_clicks || d.clicks || 0, 10);
          const conv = exact.primaryResultCount;
          const rev = exact.purchaseRevenue;

          return {
            date: d.date_start ? d.date_start.slice(5) : 'Day',
            spend: +sp.toFixed(2),
            conversions: conv,
            roas: sp > 0 && rev > 0 ? +(rev / sp).toFixed(2) : 0,
            ctr: imp > 0 ? +((clk / imp) * 100).toFixed(2) : 0,
            clicks: clk,
            impressions: imp
          };
        });
        setTimeSeries(mappedSeries);
      } else {
        setTimeSeries([{ date: datePreset, spend: 0, conversions: 0, roas: 0, ctr: 0, clicks: 0, impressions: 0 }]);
      }

      // 2. Update Placements (Always replace so previous account's placements never linger)
      if (Array.isArray(plJson?.data) && plJson.data.length > 0) {
        const mappedPlacements = plJson.data
          .map((p) => {
            const sp = parseFloat(p.spend || 0);
            const imp = parseInt(p.impressions || 0, 10);
            const rch = parseInt(p.reach || 0, 10);
            const exact = extractExactMetaResults(p.actions, p.action_values, '');
            const clk = exact.linkClicks || parseInt(p.inline_link_clicks || p.clicks || 0, 10);
            const conv = exact.primaryResultCount;
            const rev = exact.purchaseRevenue;

            const platformName = (p.publisher_platform || 'Meta').replace(/_/g, ' ').toUpperCase();
            const posName = (p.platform_position || 'Feed')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase());
            const label = `${platformName} - ${posName}`.trim();

            return {
              name: label,
              platform: platformName,
              position: posName,
              spend: +sp.toFixed(2),
              impressions: imp,
              reach: rch,
              clicks: clk,
              cpm: imp > 0 ? +((sp / imp) * 1000).toFixed(2) : 0,
              conversions: conv,
              resultLabel: exact.primaryResultLabel,
              roas: sp > 0 && rev > 0 ? +(rev / sp).toFixed(2) : 0,
              ctr: imp > 0 ? +((clk / imp) * 100).toFixed(2) : +parseFloat(p.ctr || 0).toFixed(2),
              cpa: conv > 0 ? +(sp / conv).toFixed(2) : 0,
              bounceRate: 0
            };
          })
          .sort((a, b) => b.spend - a.spend);
        setPlacements(mappedPlacements);
      } else {
        setPlacements([]);
      }

      // 3. Update Age & Gender Demographics (Always replace so previous account's age data never lingers)
      if (Array.isArray(demoJson?.data) && demoJson.data.length > 0) {
        const ageGroups = {};
        demoJson.data.forEach((row) => {
          const age = row.age || 'Unknown';
          if (!ageGroups[age]) {
            ageGroups[age] = {
              age,
              male: 0,
              female: 0,
              unknownGender: 0,
              totalResults: 0,
              spend: 0,
              impressions: 0,
              reach: 0,
              clicks: 0,
              revenue: 0
            };
          }
          const exact = extractExactMetaResults(row.actions, row.action_values, '');
          const resCount = exact.primaryResultCount;
          const clk = exact.linkClicks || parseInt(row.inline_link_clicks || row.clicks || 0, 10);

          if (row.gender === 'male') ageGroups[age].male += resCount;
          else if (row.gender === 'female') ageGroups[age].female += resCount;
          else ageGroups[age].unknownGender += resCount;

          ageGroups[age].totalResults += resCount;
          ageGroups[age].spend += parseFloat(row.spend || 0);
          ageGroups[age].impressions += parseInt(row.impressions || 0, 10);
          ageGroups[age].reach += parseInt(row.reach || 0, 10);
          ageGroups[age].clicks += clk;
          ageGroups[age].revenue += exact.purchaseRevenue;
        });

        const formattedDemo = Object.values(ageGroups)
          .map((g) => ({
            ...g,
            spend: +g.spend.toFixed(2),
            cpa: g.totalResults > 0 ? +(g.spend / g.totalResults).toFixed(2) : 0,
            ctr: g.impressions > 0 ? +((g.clicks / g.impressions) * 100).toFixed(2) : 0,
            roas: g.spend > 0 && g.revenue > 0 ? +(g.revenue / g.spend).toFixed(2) : 0
          }))
          .sort((a, b) => a.age.localeCompare(b.age));

        setDemographics(formattedDemo);
      } else {
        setDemographics([]);
      }

      // 4. Update Region & Country Geolocation Breakdown (Always replace on account switch)
      if (Array.isArray(regJson?.data) && regJson.data.length > 0) {
        const mappedRegions = regJson.data
          .map((r) => {
            const sp = parseFloat(r.spend || 0);
            const imp = parseInt(r.impressions || 0, 10);
            const rch = parseInt(r.reach || 0, 10);
            const exact = extractExactMetaResults(r.actions, r.action_values, '');
            const clk = exact.linkClicks || parseInt(r.inline_link_clicks || r.clicks || 0, 10);
            const conv = exact.primaryResultCount;
            const rev = exact.purchaseRevenue;

            return {
              name: `${r.region || 'Region'} (${r.country || 'Global'})`,
              region: r.region || 'All Regions',
              country: r.country || 'Global',
              spend: +sp.toFixed(2),
              impressions: imp,
              reach: rch,
              clicks: clk,
              conversions: conv,
              resultLabel: exact.primaryResultLabel,
              cpa: conv > 0 ? +(sp / conv).toFixed(2) : 0,
              ctr: imp > 0 ? +((clk / imp) * 100).toFixed(2) : 0,
              roas: sp > 0 && rev > 0 ? +(rev / sp).toFixed(2) : 0
            };
          })
          .sort((a, b) => b.spend - a.spend);
        setRegionsData(mappedRegions);
      } else {
        setRegionsData([]);
      }

      if (Array.isArray(cntJson?.data) && cntJson.data.length > 0) {
        const countryNames = {
          IN: 'India (IN)',
          NP: 'Nepal (NP)',
          US: 'United States (US)',
          AE: 'United Arab Emirates (AE)',
          GB: 'United Kingdom (GB)',
          CA: 'Canada (CA)',
          AU: 'Australia (AU)',
          SA: 'Saudi Arabia (SA)',
          QA: 'Qatar (QA)',
          MY: 'Malaysia (MY)',
          SG: 'Singapore (SG)',
          BD: 'Bangladesh (BD)',
          PK: 'Pakistan (PK)'
        };
        const mappedCountries = cntJson.data
          .map((c) => {
            const sp = parseFloat(c.spend || 0);
            const imp = parseInt(c.impressions || 0, 10);
            const rch = parseInt(c.reach || 0, 10);
            const exact = extractExactMetaResults(c.actions, c.action_values, '');
            const clk = exact.linkClicks || parseInt(c.inline_link_clicks || c.clicks || 0, 10);
            const conv = exact.primaryResultCount;
            const rev = exact.purchaseRevenue;
            const code = c.country || 'GL';

            return {
              country: countryNames[code] || `Country (${code})`,
              code,
              spend: +sp.toFixed(2),
              impressions: imp,
              reach: rch,
              clicks: clk,
              conversions: conv,
              resultLabel: exact.primaryResultLabel,
              cpa: conv > 0 ? +(sp / conv).toFixed(2) : 0,
              ctr: imp > 0 ? +((clk / imp) * 100).toFixed(2) : 0,
              roas: sp > 0 && rev > 0 ? +(rev / sp).toFixed(2) : 0
            };
          })
          .sort((a, b) => b.spend - a.spend);
        setCountriesData(mappedCountries);
      } else {
        setCountriesData([]);
      }

      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      if (currentFetchId === activeFetchIdRef.current) {
        setApiErrorMsg(err.message || 'Error fetching live insights from Meta API.');
      }
    } finally {
      if (currentFetchId === activeFetchIdRef.current) {
        setIsFetchingLiveInsights(false);
      }
    }
  };

  const generatedClientUrl = window.location.origin;

  const fallbackCopyText = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(textArea);
  };

  const handleCopyClientLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedClientUrl);
      } else {
        fallbackCopyText(generatedClientUrl);
      }
    } catch (err) {
      fallbackCopyText(generatedClientUrl);
    }
    setCopiedLinkSuccess(true);
    showToast('Client Live Link Copied!', 'Aap ye link client ko WhatsApp ya Email par bhej sakte hain.');
    setTimeout(() => setCopiedLinkSuccess(false), 3000);
  };

  useEffect(() => {
    if (isLiveApiConnected) {
      fetchLiveAccountTelemetry(selectedAccount, null, datePreset);
    }
  }, [selectedAccount, datePreset, isLiveApiConnected]);

  useEffect(() => {
    if (!liveSync) return;

    // IMPORTANT: When Live Meta API is connected, NEVER run random demo simulation! Only poll real Meta Graph API.
    if (isLiveApiConnected) {
      const livePoll = setInterval(() => {
        fetchLiveAccountTelemetry(selectedAccount, null, datePreset);
      }, 60000);
      return () => clearInterval(livePoll);
    }

    const interval = setInterval(() => {
      setLivePulseCount((c) => c + 1);
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      setCampaigns((prevCampaigns) =>
        prevCampaigns.map((cmp) => {
          if (cmp.status !== 'ACTIVE') return cmp;

          const impDelta = Math.floor(Math.random() * 140) + 30;
          const reachDelta = Math.floor(impDelta * (cmp.id === 'cmp_2' ? 0.22 : 0.68));
          const clickDelta = Math.floor(Math.random() * 6) + (Math.random() > 0.4 ? 1 : 0);
          const lpvDelta = cmp.id === 'cmp_3'
            ? Math.floor(clickDelta * 0.42)
            : Math.floor(clickDelta * 0.86);
          const atcDelta = Math.random() > 0.55 ? 1 : 0;
          const convDelta = Math.random() > (cmp.id === 'cmp_1' || cmp.id === 'cmp_5' ? 0.62 : 0.82) ? 1 : 0;
          const spendDelta = +(Math.random() * 2.4 + 0.45).toFixed(2);
          const revDelta = convDelta > 0 ? +(convDelta * (42 + Math.random() * 15)).toFixed(2) : 0;

          return {
            ...cmp,
            impressions: cmp.impressions + impDelta,
            reach: Math.min(cmp.impressions + impDelta, cmp.reach + reachDelta),
            linkClicks: cmp.linkClicks + clickDelta,
            landingPageViews: cmp.landingPageViews + lpvDelta,
            addToCart: cmp.addToCart + atcDelta,
            conversions: cmp.conversions + convDelta,
            spend: +(cmp.spend + spendDelta).toFixed(2),
            revenue: +(cmp.revenue + revDelta).toFixed(2)
          };
        })
      );

      setTimeSeries((prevSeries) => {
        const updated = [...prevSeries];
        const lastIdx = updated.length - 1;
        const lastPoint = { ...updated[lastIdx] };
        const addSpend = +(Math.random() * 5.5 + 1.2).toFixed(2);
        const addConv = Math.random() > 0.45 ? 1 : 0;
        const addClicks = Math.floor(Math.random() * 12) + 2;
        const addImp = Math.floor(Math.random() * 420) + 100;

        lastPoint.spend = +(lastPoint.spend + addSpend).toFixed(2);
        lastPoint.conversions = lastPoint.conversions + addConv;
        lastPoint.clicks = lastPoint.clicks + addClicks;
        lastPoint.impressions = lastPoint.impressions + addImp;
        lastPoint.ctr = +((lastPoint.clicks / lastPoint.impressions) * 100).toFixed(2);
        lastPoint.roas = +(((lastPoint.conversions * 44.5) / lastPoint.spend)).toFixed(2);

        updated[lastIdx] = lastPoint;
        return updated;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [liveSync, isLiveApiConnected, selectedAccount, null, datePreset]);

  const dateMultiplier = useMemo(() => {
    if (isLiveApiConnected) return 1.0;
    switch (datePreset) {
      case 'Today': return 0.16;
      case 'Yesterday': return 0.18;
      case 'Last 7 Days': return 1.0;
      case 'Last 30 Days': return 3.85;
      case 'Maximum (Lifetime)': return 5.2;
      default: return 1.0;
    }
  }, [datePreset, isLiveApiConnected]);

  const enrichedCampaigns = useMemo(() => {
    return campaigns.map((c) => {
      const m = dateMultiplier;
      const spend = c.spend * m;
      const impressions = Math.round(c.impressions * m);
      const reach = Math.round(c.reach * m);
      const linkClicks = Math.round(c.linkClicks * m);
      const landingPageViews = Math.round(c.landingPageViews * m);
      const addToCart = Math.round(c.addToCart * m);
      const conversions = Math.round(c.conversions * m);
      const revenue = c.revenue * m;

      const ctr = impressions > 0 ? (linkClicks / impressions) * 100 : 0;
      const cpc = linkClicks > 0 ? spend / linkClicks : 0;
      const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
      // Use exact Meta API cost_per_result / cost_per_action_type when available
      const cpa =
        isLiveApiConnected && c.exactCpr > 0
          ? c.exactCpr
          : conversions > 0
          ? spend / conversions
          : 0;
      const roas = spend > 0 ? revenue / spend : 0;
      const frequency = reach > 0 ? impressions / reach : 1;
      const lpvRate = linkClicks > 0 ? (landingPageViews / linkClicks) * 100 : 0;
      const convRate = landingPageViews > 0 ? (conversions / landingPageViews) * 100 : 0;

      return {
        ...c,
        spend,
        impressions,
        reach,
        linkClicks,
        landingPageViews,
        addToCart,
        conversions,
        revenue,
        ctr,
        cpc,
        cpm,
        cpa,
        roas,
        frequency,
        lpvRate,
        convRate
      };
    });
  }, [campaigns, dateMultiplier, isLiveApiConnected]);

  const activeScopeCampaigns = useMemo(() => {
    if (selectedCampaignId) {
      return enrichedCampaigns.filter((c) => c.id === selectedCampaignId);
    }
    return enrichedCampaigns;
  }, [enrichedCampaigns, selectedCampaignId]);

  const totals = useMemo(() => {
    // When Live Meta API is connected and no single campaign filter is active, use the exact Account-Level Insights from Meta Ads Manager
    if (isLiveApiConnected && !selectedCampaignId && exactAccountOverview) {
      const o = exactAccountOverview;
      const cpa =
        o.exactCpr > 0
          ? o.exactCpr
          : o.conversions > 0
          ? o.spend / o.conversions
          : 0;
      const cpm = o.impressions > 0 ? (o.spend / o.impressions) * 1000 : (o.cpm || 0);
      const roas = o.roas > 0 ? o.roas : (o.spend > 0 && o.revenue > 0 ? o.revenue / o.spend : 0);
      const lpvRate = o.linkClicks > 0 ? (o.landingPageViews / o.linkClicks) * 100 : 0;
      return {
        ...o,
        cpm,
        cpa,
        roas,
        lpvRate
      };
    }

    const agg = activeScopeCampaigns.reduce(
      (acc, cur) => {
        acc.spend += cur.spend;
        acc.impressions += cur.impressions;
        acc.reach += cur.reach;
        acc.linkClicks += cur.linkClicks;
        acc.landingPageViews += cur.landingPageViews;
        acc.addToCart += cur.addToCart;
        acc.conversions += cur.conversions;
        acc.revenue += cur.revenue;
        if (cur.resultLabel && cur.conversions > 0) acc.resultLabel = cur.resultLabel;
        return acc;
      },
      {
        spend: 0,
        impressions: 0,
        reach: 0,
        linkClicks: 0,
        landingPageViews: 0,
        addToCart: 0,
        conversions: 0,
        revenue: 0,
        resultLabel: 'Results'
      }
    );

    const ctr = agg.impressions > 0 ? (agg.linkClicks / agg.impressions) * 100 : 0;
    const cpc = agg.linkClicks > 0 ? agg.spend / agg.linkClicks : 0;
    const cpm = agg.impressions > 0 ? (agg.spend / agg.impressions) * 1000 : 0;
    const cpa = agg.conversions > 0 ? agg.spend / agg.conversions : 0;
    const roas = agg.spend > 0 ? agg.revenue / agg.spend : 0;
    const frequency = agg.reach > 0 ? agg.impressions / agg.reach : 0;
    const lpvRate = agg.linkClicks > 0 ? (agg.landingPageViews / agg.linkClicks) * 100 : 0;

    return { ...agg, ctr, linkCtr: ctr, cpc, cpm, cpa, roas, frequency, lpvRate };
  }, [activeScopeCampaigns, isLiveApiConnected, selectedCampaignId, exactAccountOverview]);

  const filteredCampaigns = useMemo(() => {
    return enrichedCampaigns
      .filter((c) => {
        if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
        if (
          searchQuery.trim() &&
          !c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(c.creativeHeadline || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(c.primaryPlacement || '').toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField] ?? 0;
        const valB = b[sortField] ?? 0;
        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [enrichedCampaigns, searchQuery, statusFilter, sortField, sortOrder]);

  const aiSuggestions = useMemo(() => {
    const suggestions = [];

    enrichedCampaigns.forEach((c) => {
      if (c.frequency > 3.2 && c.status === 'ACTIVE') {
        suggestions.push({
          id: `fatigue_${c.id}`,
          campaignId: c.id,
          campaignName: c.name,
          category: 'Creative Fatigue Alert',
          severity: 'Critical',
          badgeColor: 'rose',
          title: `High Ad Frequency (${c.frequency.toFixed(2)}x) Causing CTR Decay`,
          problem: `Your audience in "${c.name}" has seen the same ${c.creativeFormat} creative an average of ${c.frequency.toFixed(2)} times. Engagement Rate Ranking has dropped to ${c.engagementRanking} and CTR is ${c.ctr.toFixed(2)}%.`,
          recommendation: `Duplicate the winning ad set, exclude 14-day purchasers, and introduce 2 new 9:16 UGC Reels hooks in the first 3 seconds to reset auction fatigue.`,
          expectedImpact: `+28% CTR recovery & -19% CPA reduction`,
          projectedRoasLift: +0.42,
          projectedCpaDrop: -2.15,
          actionType: 'FIX_FATIGUE',
          applied: appliedOptimizations.includes(`fatigue_${c.id}`)
        });
      }
    });

    enrichedCampaigns.forEach((c) => {
      if (c.lpvRate < 65 && c.linkClicks > 300 && c.status === 'ACTIVE') {
        suggestions.push({
          id: `funnel_${c.id}`,
          campaignId: c.id,
          campaignName: c.name,
          category: 'Funnel Drop-off Warning',
          severity: 'Critical',
          badgeColor: 'amber',
          title: `Severe Click-to-Landing-Page Drop-off (${(100 - c.lpvRate).toFixed(1)}% Lost Traffic)`,
          problem: `"${c.name}" generated ${formatNumber(c.linkClicks)} Link Clicks, but only ${formatNumber(c.landingPageViews)} resulted in Landing Page Views (${c.lpvRate.toFixed(1)}% LPV rate vs 85% benchmark).`,
          recommendation: `Enable Meta Instant Experience / pre-loading, compress mobile hero images, and verify that the Meta Pixel & Conversions API (CAPI) fire immediately inside the <head>.`,
          expectedImpact: `+38% more Landing Page Views for $0 extra spend`,
          projectedRoasLift: +0.55,
          projectedCpaDrop: -3.10,
          actionType: 'FIX_FUNNEL',
          applied: appliedOptimizations.includes(`funnel_${c.id}`)
        });
      }
    });

    const highPerformers = enrichedCampaigns.filter((c) => c.roas >= 3.8 && c.status === 'ACTIVE');
    const lowPerformers = enrichedCampaigns.filter((c) => c.roas < 1.5 && c.status === 'ACTIVE');

    if (highPerformers.length > 0 && lowPerformers.length > 0) {
      const best = highPerformers.sort((a, b) => b.roas - a.roas)[0];
      const worst = lowPerformers.sort((a, b) => a.roas - b.roas)[0];
      suggestions.push({
        id: `budget_${best.id}_${worst.id}`,
        campaignId: best.id,
        targetPauseId: worst.id,
        campaignName: `${best.name} ↔ ${worst.name}`,
        category: 'Smart Budget Reallocation',
        severity: 'High Impact',
        badgeColor: 'emerald',
        title: `Shift Budget from Underperforming Ads to Top Winner (${best.roas.toFixed(2)}x)`,
        problem: `"${worst.name}" is operating at a ${fmtMoney(worst.cpa)} Cost Per Result, whereas "${best.name}" is delivering results at ${fmtMoney(best.cpa)} Cost Per Result.`,
        recommendation: `Scale "${best.name}" daily budget by +20% (within Meta's safe learning phase threshold) and reduce "${worst.name}" budget.`,
        expectedImpact: `+25% more results without increasing total ad budget`,
        projectedRoasLift: +0.68,
        projectedCpaDrop: -2.85,
        actionType: 'REALLOCATE_BUDGET',
        applied: appliedOptimizations.includes(`budget_${best.id}_${worst.id}`)
      });
    }

    const audNet = placements.find((p) => p.name === 'Audience Network');
    const igReels = placements.find((p) => p.name === 'Instagram Reels');
    if (audNet && audNet.roas < 1.2 && audNet.spend > 0) {
      suggestions.push({
        id: 'placement_aud_net',
        campaignId: 'cmp_4',
        campaignName: 'Account-Wide Placement Liquidity',
        category: 'Placement Optimization',
        severity: 'Quick Win',
        badgeColor: 'violet',
        title: `Eliminate Low-Performing Placement Spend Bleed`,
        problem: `Audience Network has consumed ${fmtMoney(audNet.spend * dateMultiplier)} at ${fmtMoney(audNet.cpa)} Cost Per Result, while Instagram placements deliver much higher efficiency.`,
        recommendation: `Exclude Audience Network from Traffic/Broad ad sets and reallocate 100% of that placement liquidity to Instagram Reels & Feed.`,
        expectedImpact: `Save ${fmtMoney(audNet.spend * dateMultiplier * 0.85)} in wasted spend`,
        projectedRoasLift: +0.34,
        projectedCpaDrop: -1.65,
        actionType: 'OPTIMIZE_PLACEMENT',
        applied: appliedOptimizations.includes('placement_aud_net')
      });
    }

    return suggestions;
  }, [enrichedCampaigns, placements, appliedOptimizations, dateMultiplier, activeCurrencySymbol]);

  const handleApplyOptimization = (suggestion) => {
    if (isClientLockedMode) return;
    if (appliedOptimizations.includes(suggestion.id)) return;

    setAppliedOptimizations((prev) => [...prev, suggestion.id]);

    if (suggestion.actionType === 'FIX_FATIGUE') {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === suggestion.campaignId
            ? {
                ...c,
                reach: Math.round(c.impressions / 2.1),
                linkClicks: Math.round(c.linkClicks * 1.28),
                conversions: Math.round(c.conversions * 1.22),
                revenue: +(c.revenue * 1.24).toFixed(2),
                engagementRanking: 'Above Average',
                creativeHeadline: c.creativeHeadline + ' [Refreshed Hook v2]'
              }
            : c
        )
      );
    } else if (suggestion.actionType === 'FIX_FUNNEL') {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === suggestion.campaignId
            ? {
                ...c,
                landingPageViews: Math.round(c.linkClicks * 0.86),
                conversions: Math.round(c.conversions * 1.32),
                revenue: +(c.revenue * 1.32).toFixed(2),
                conversionRanking: 'Above Average'
              }
            : c
        )
      );
    } else if (suggestion.actionType === 'REALLOCATE_BUDGET') {
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id === suggestion.campaignId) {
            return {
              ...c,
              dailyBudget: Math.round(c.dailyBudget * 1.25),
              conversions: Math.round(c.conversions * 1.25),
              revenue: +(c.revenue * 1.26).toFixed(2)
            };
          }
          if (c.id === suggestion.targetPauseId) {
            return {
              ...c,
              dailyBudget: 30,
              spend: +(c.spend * 0.5).toFixed(2)
            };
          }
          return c;
        })
      );
    } else if (suggestion.actionType === 'OPTIMIZE_PLACEMENT') {
      setPlacements((prev) =>
        prev.map((p) => {
          if (p.name === 'Audience Network') {
            return { ...p, spend: 45, conversions: 4, roas: 2.1, cpa: 11.25, bounceRate: 35 };
          }
          if (p.name === 'Instagram Reels') {
            return { ...p, spend: p.spend + 745, conversions: p.conversions + 82, roas: 4.88, cpa: 9.21 };
          }
          return p;
        })
      );
    }

    showToast(
      'Optimization Applied to Meta Ads!',
      `${suggestion.category} executed. Live campaign metrics & ROAS projections updated.`
    );
  };

  const toggleCampaignStatus = (id, e) => { e.stopPropagation(); showToast('Read-only report', 'Use Meta Ads Manager to change campaign status.'); };

  const handleAskGeminiStrategist = async (customQuery) => {
    setAiError('');
    setIsAiLoading(true);
    setAiResponse(null);

    const activeAccountObj = adAccounts.find((a) => a.id === selectedAccount) || AD_ACCOUNTS[0];
    const targetCampaign = selectedCampaignId
      ? enrichedCampaigns.find((c) => c.id === selectedCampaignId)
      : null;

    const metricsSummary = targetCampaign
      ? `Selected Campaign: "${targetCampaign.name}" (${targetCampaign.objective})
         Currency: ${activeCurrencyCode} (${activeCurrencySymbol}),
         Spend: ${fmtMoney(targetCampaign.spend)}, ROAS: ${targetCampaign.roas.toFixed(2)}x, Cost Per Result: ${fmtMoney(targetCampaign.cpa)},
         CTR: ${targetCampaign.ctr.toFixed(2)}%, CPC: ${fmtMoney(targetCampaign.cpc)}, Frequency: ${targetCampaign.frequency.toFixed(2)}x,
         Link Clicks: ${targetCampaign.linkClicks}, Landing Page Views: ${targetCampaign.landingPageViews} (${targetCampaign.lpvRate.toFixed(1)}% LPV rate),
         Results (${targetCampaign.resultLabel || 'Conversions'}): ${targetCampaign.conversions}`
      : `Account Summary (${activeAccountObj.name} - ${datePreset} - Currency: ${activeCurrencyCode}):
         Total Spend: ${fmtMoney(totals.spend)}, Total Results (${totals.resultLabel || 'Conversions'}): ${formatNumber(totals.conversions)},
         Cost Per Result (CPR): ${fmtMoney(totals.cpa)}, Blended ROAS: ${totals.roas.toFixed(2)}x,
         CTR: ${totals.ctr.toFixed(2)}%, CPC: ${fmtMoney(totals.cpc)}, Frequency: ${totals.frequency.toFixed(2)}x,
         Link Clicks: ${formatNumber(totals.linkClicks)}, Landing Page Views: ${formatNumber(totals.landingPageViews)} (${totals.lpvRate.toFixed(1)}%).`;

    const systemPrompt = `You are an elite Meta Ads Media Buyer & Performance Marketing Strategist.
Analyze the user's real-time Meta Ads dashboard metrics (in ${activeCurrencyCode} ${activeCurrencySymbol}) and return a structured JSON strategic optimization plan with ultra-specific, data-backed recommendations, creative hooks, and scaling rules.`;

    const userQuery = `Focus Mode: ${aiSelectedFocus}.
User Question: ${customQuery || aiPromptInput || 'Provide a comprehensive scaling & creative optimization strategy based on my live Meta Ads metrics.'}

Live Dashboard Telemetry:
${metricsSummary}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            executiveSummary: { type: 'STRING' },
            estimatedRoasPotential: { type: 'STRING' },
            actionSteps: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING' },
                  priority: { type: 'STRING' },
                  detail: { type: 'STRING' },
                  metricTarget: { type: 'STRING' }
                },
                propertyOrdering: ['title', 'priority', 'detail', 'metricTarget']
              }
            },
            adCopyHooks: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  angle: { type: 'STRING' },
                  hookText: { type: 'STRING' },
                  visualDirection: { type: 'STRING' }
                },
                propertyOrdering: ['angle', 'hookText', 'visualDirection']
              }
            }
          },
          propertyOrdering: ['executiveSummary', 'estimatedRoasPotential', 'actionSteps', 'adCopyHooks']
        }
      }
    };

    try {
      const data = await askAI(selectedAccount, payload);
      const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('');
      if (!text) throw new Error('AI returned no answer.');
      setAiResponse(JSON.parse(text));
    } catch (err) { setAiError(err.message); setAiResponse(null); }
    finally { setIsAiLoading(false); }
  };

  const handleAddCustomCampaign = (e) => {
    e.preventDefault();
    if (!newCampaignForm.name.trim()) return;

    const newCmp = {
      id: `cmp_custom_${Date.now()}`,
      accountId: selectedAccount,
      name: newCampaignForm.name,
      status: 'ACTIVE',
      objective: 'Conversions (Sales)',
      dailyBudget: Number(newCampaignForm.dailyBudget) || 200,
      spend: Number(newCampaignForm.spend) || 1000,
      impressions: Number(newCampaignForm.impressions) || 80000,
      reach: Number(newCampaignForm.reach) || 60000,
      linkClicks: Number(newCampaignForm.linkClicks) || 1800,
      landingPageViews: Number(newCampaignForm.landingPageViews) || 1500,
      addToCart: Math.round((Number(newCampaignForm.conversions) || 80) * 2.8),
      conversions: Number(newCampaignForm.conversions) || 80,
      revenue: Number(newCampaignForm.revenue) || 3600,
      qualityRanking: 'Above Average',
      engagementRanking: 'Above Average',
      conversionRanking: 'Above Average',
      creativeFormat: newCampaignForm.creativeFormat,
      creativeHeadline: 'Custom Imported Campaign Creative',
      primaryPlacement: newCampaignForm.primaryPlacement,
      historyMultiplier: 1.0
    };

    setCampaigns((prev) => [newCmp, ...prev]);
    setNewCampaignForm({ ...newCampaignForm, name: '' });
    showToast('Local Scenario Added!', `"${newCmp.name}" added to real-time telemetry and AI audit engine.`);
    setActiveTab('overview');
  };

  const handleExportCSV = () => {
    try {
      const csv = buildCampaignCSV(enrichedCampaigns, activeCurrencyCode);
      const filename = `Meta_Ads_Report_${datePreset.replace(/[^a-zA-Z0-9_-]+/g, '_')}.csv`;
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      setPdfUrl('');
      setCsvExport({ url, csv, filename, campaigns: enrichedCampaigns.map(c => ({...c})), currency: activeCurrencyCode, period: datePreset, account: adAccounts.find(a=>a.id===selectedAccount)?.name || selectedAccount, mode: isLiveApiConnected ? 'Meta API data' : 'DEMO SAMPLE DATA' });
    } catch (error) {
      showToast('Export failed', error.message || 'Please try again.');
    }
  };

  const handleExportPDF = async () => {
    if (!csvExport || pdfBusy) return;
    setPdfBusy(true);
    try {
      const blob = await makePDFReport(csvExport);
      setPdfUrl(URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' })));
    } catch (error) { showToast('PDF export failed', error.message || 'Please try again.'); }
    finally { setPdfBusy(false); }
  };

  // Client-Friendly Primary 8 Cards (Includes Reach, Impressions, CPM, CTR, ROAS, Spend, Results & CPR)
  const primaryClientCards = [
    {
      title: '1. Total Amount Spent',
      hindiSub: 'Exact Ad Spend in Period',
      value: fmtMoney(totals.spend),
      subtitle: `Currency: ${activeCurrencyCode} (${activeCurrencySymbol}) • ${datePreset}`,
      icon: DollarSign,
      color: 'from-blue-600/20 to-indigo-600/10 border-blue-500/40 text-blue-400',
      badge: 'Exact Meta Spend'
    },
    {
      title: `2. Total ${totals.resultLabel || 'Results'}`,
      hindiSub: 'Total Leads, Sales & Messages',
      value: formatNumber(totals.conversions, activeCurrencySymbol),
      subtitle:
        totals.leads > 0 || totals.messages > 0 || totals.purchases > 0
          ? `Purchases: ${totals.purchases || 0} • Leads: ${totals.leads || 0} • Msg: ${totals.messages || 0}`
          : `Active Campaign Conversions`,
      icon: Target,
      color: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/40 text-emerald-400',
      badge: totals.resultLabel || 'Conversions'
    },
    {
      title: `3. Cost Per ${totals.resultLabel ? totals.resultLabel.replace(/s$/, '') : 'Result'}`,
      hindiSub: 'Average Cost Per Result (CPR)',
      value: totals.conversions > 0 ? fmtMoney(totals.cpa) : `${activeCurrencySymbol}0.00`,
      subtitle:
        totals.messages > 0 && totals.exactCostPerMessage > 0
          ? `Cost Per Msg: ${fmtMoney(totals.exactCostPerMessage)} (${formatNumber(totals.messages)} Msgs)`
          : totals.conversions > 0
          ? `Exact Cost Per ${totals.resultLabel || 'Result'}`
          : 'No results in period',
      icon: Activity,
      color: 'from-violet-600/20 to-purple-600/10 border-violet-500/40 text-violet-400',
      badge: 'Exact CPR / CPA'
    },
    {
      title: '4. Unique Reach',
      hindiSub: 'Unique People Reached',
      value: formatNumber(totals.reach, activeCurrencySymbol),
      subtitle: `Ad Frequency: ${totals.frequency.toFixed(2)}x per person`,
      icon: Users,
      color: 'from-cyan-600/20 to-blue-600/10 border-cyan-500/40 text-cyan-400',
      badge: `${totals.frequency.toFixed(2)}x Freq`
    },
    {
      title: '5. Total Impressions & CPM',
      hindiSub: 'Total Ad Views & Cost per 1,000 Views',
      value: formatNumber(totals.impressions, activeCurrencySymbol),
      subtitle: `Exact CPM (Cost per 1k Impr.): ${fmtMoney(totals.cpm)}`,
      icon: Eye,
      color: 'from-amber-600/20 to-orange-600/10 border-amber-500/40 text-amber-400',
      badge: `CPM: ${fmtMoney(totals.cpm)}`
    },
    {
      title: '6. CTR (Click-Through Rate)',
      hindiSub: 'Percentage of Viewers Who Clicked',
      value: `${totals.ctr.toFixed(2)}%`,
      subtitle: `Link Clicks: ${formatNumber(totals.linkClicks, activeCurrencySymbol)} • Avg CPC: ${fmtMoney(totals.cpc)}`,
      icon: TrendingUp,
      color: 'from-indigo-600/20 to-blue-600/10 border-indigo-500/40 text-indigo-400',
      badge: `CPC: ${fmtMoney(totals.cpc)}`
    },
    {
      title: '7. Link Clicks & LPV',
      hindiSub: 'Ad Clicks & Landing Page Views',
      value: formatNumber(totals.linkClicks, activeCurrencySymbol),
      subtitle: `Landing Page Views: ${formatNumber(totals.landingPageViews, activeCurrencySymbol)} (${totals.lpvRate.toFixed(1)}%)`,
      icon: MousePointer,
      color: 'from-teal-600/20 to-emerald-600/10 border-teal-500/40 text-teal-400',
      badge: `${totals.ctr.toFixed(2)}% CTR`
    },
    {
      title: '8. Purchase ROAS & Value',
      hindiSub: 'Return on Ad Spend & Revenue',
      value: `${totals.roas.toFixed(2)}x ROAS`,
      subtitle: `Total Conversion Value: ${fmtMoney(totals.revenue)}`,
      icon: Award,
      color: 'from-pink-600/20 to-rose-600/10 border-pink-500/40 text-pink-400',
      badge: totals.revenue > 0 ? 'Live ROAS' : 'Lead / Msg Obj'
    }
  ];

  const funnelSteps = useMemo(() => {
    const imp = Math.max(1, totals.impressions);
    return [
      {
        label: '1. Impressions',
        value: totals.impressions,
        pct: 100,
        stepConv: `CPM: ${fmtMoney(totals.cpm)}`,
        color: 'from-blue-600 to-indigo-600'
      },
      {
        label: '2. Unique Reach',
        value: totals.reach,
        pct: (totals.reach / imp) * 100,
        stepConv: `${totals.frequency.toFixed(2)}x Freq`,
        color: 'from-indigo-600 to-violet-600'
      },
      {
        label: '3. Link Clicks',
        value: totals.linkClicks,
        pct: totals.ctr,
        stepConv: `${totals.ctr.toFixed(2)}% CTR`,
        color: 'from-cyan-600 to-blue-600'
      },
      {
        label: '4. Landing Page Views',
        value: totals.landingPageViews,
        pct: (totals.landingPageViews / imp) * 100,
        stepConv: `${totals.lpvRate.toFixed(1)}% LPV`,
        color: 'from-teal-600 to-emerald-600'
      },
      {
        label: `5. ${totals.resultLabel || 'Results'}`,
        value: totals.conversions,
        pct: (totals.conversions / imp) * 100,
        stepConv: `CPR: ${totals.conversions > 0 ? fmtMoney(totals.cpa) : fmtMoney(0)}`,
        color: 'from-emerald-500 to-green-500'
      }
    ];
  }, [totals, activeCurrencySymbol]);

  const renderRankingBadge = (ranking) => {
    if (ranking.includes('Above')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" /> Above Avg
        </span>
      );
    }
    if (ranking.includes('Below')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <AlertTriangle className="w-3 h-3" /> {ranking.replace('Below Average ', '')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/15 text-slate-300 border border-slate-500/30">
        Average
      </span>
    );
  };

  return (
    <div data-theme={darkMode ? 'dark' : 'light'} className={`min-h-screen overflow-x-hidden transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {csvExport && (
        <div className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="csv-title"
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 text-white p-6 shadow-xl">
            <h2 id="csv-title" className="text-lg font-bold">Export report</h2>
            <p className="mt-2 text-sm text-slate-300">Save the report to your device. Your browser may ask where to save it.</p>
            <p className="mt-2 text-xs text-slate-400 break-all">{csvExport.filename}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={csvExport.url} download={csvExport.filename}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">Download CSV</a>
              {pdfUrl ? <a href={pdfUrl} download={csvExport.filename.replace(/\.csv$/, '.pdf')} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">Download PDF</a> : <button disabled={pdfBusy} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold" onClick={handleExportPDF}>{pdfBusy ? 'Preparing PDF…' : 'Prepare PDF'}</button>}
              <button className="px-4 py-2 rounded-lg bg-slate-700" onClick={() => window.print()}>Print / Save as PDF</button>
              <button className="px-4 py-2 rounded-lg bg-slate-700" onClick={async () => {
                try {
                  await navigator.clipboard.writeText(csvExport.csv);
                  showToast('CSV copied', 'Paste into a text file and save with a .csv extension.');
                } catch {
                  showToast('Copy unavailable', 'Use Download CSV in a full browser tab.');
                }
              }}>Copy CSV</button>
              <button className="px-4 py-2 rounded-lg bg-slate-800" disabled={pdfBusy} onClick={() => { setCsvExport(null); setPdfUrl(''); }}>Close</button>
            </div>
            <p className="mt-4 text-xs text-slate-400">If the embedded preview blocks downloads, <a
              href={window.location.origin + window.location.pathname} target="_blank" rel="noopener noreferrer"
              className="text-blue-400 underline">open the dashboard in a new tab</a>, then export again.</p>
          </section>
        </div>
      )}

      {csvExport && <section className="print-report">
        <h1>MDRS — Meta Ads Report</h1>
        <p>{csvExport.account} • {csvExport.period} • {csvExport.currency} • {csvExport.mode}</p>
        <table><thead><tr>{['Campaign','Status','Spend','Impressions','Reach','Clicks','Results','CPR','ROAS'].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>{csvExport.campaigns.map(c=><tr key={c.id}>{[c.name,c.status,c.spend,c.impressions,c.reach,c.linkClicks,c.conversions,c.cpa,c.roas].map((v,i)=><td key={i}>{typeof v === 'number' ? v.toLocaleString(undefined,{maximumFractionDigits:2}) : v}</td>)}</tr>)}</tbody></table>
      </section>}

      {notificationToast && (
        <div className="fixed bottom-20 lg:bottom-5 left-4 right-4 sm:left-auto sm:right-5 z-50 flex items-start gap-3 max-w-md p-4 rounded-xl bg-slate-900 border border-emerald-500/50 text-white shadow-2xl shadow-emerald-950/50 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-emerald-300">{notificationToast.title}</p>
            <p className="text-slate-300 mt-0.5">{notificationToast.message}</p>
          </div>
          <button onClick={() => setNotificationToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLiveApiModalOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5"><div className="builder-panel max-w-lg"><h2 className="text-xl font-bold">Server-managed connection</h2><p>Accounts are assigned in Manage clients. Tokens are stored only on the server. Contact MDRS if your data needs reconnection.</p><button className="builder-primary" onClick={()=>setIsLiveApiModalOpen(false)}>Close</button></div></div>}

      {isShareModalOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5"><div className="builder-panel max-w-lg"><h2 className="text-xl font-bold">Share secure client portal</h2><p>Each client must sign in. The server grants access only to their assigned business, even if this link is forwarded.</p><input readOnly value={generatedClientUrl}/><button className="builder-primary" onClick={handleCopyClientLink}>{copiedLinkSuccess?'Copied':'Copy login link'}</button><button className="builder-primary" onClick={()=>setIsShareModalOpen(false)}>Close</button></div></div>}

      {simulatedLiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">7-Day Optimization Impact Forecast</h3>
              </div>
              <button onClick={() => setSimulatedLiftModal(null)} className="p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-400">
                  {simulatedLiftModal.category}
                </span>
                <p className="font-semibold mt-1">{simulatedLiftModal.title}</p>
                <p className="text-xs text-slate-400 mt-1">{simulatedLiftModal.recommendation}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  <span className="text-xs text-slate-400">Current Blended ROAS</span>
                  <p className="text-2xl font-bold mt-1">{totals.roas.toFixed(2)}x</p>
                  <span className="text-xs text-slate-400 mt-2 block">Current Avg CPR / CPA</span>
                  <p className="text-lg font-semibold">{fmtMoney(totals.cpa)}</p>
                </div>
                <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
                  <span className="text-xs text-emerald-300 font-medium">Projected ROAS (Post-Fix)</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {(totals.roas + simulatedLiftModal.projectedRoasLift).toFixed(2)}x
                    <span className="text-xs ml-1.5 font-normal text-emerald-300">
                      (+{simulatedLiftModal.projectedRoasLift}x)
                    </span>
                  </p>
                  <span className="text-xs text-emerald-300 mt-2 block">Projected Avg CPR / CPA</span>
                  <p className="text-lg font-semibold text-emerald-400">
                    {fmtMoney(Math.max(1, totals.cpa * 0.82))}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSimulatedLiftModal(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 hover:bg-slate-800"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleApplyOptimization(simulatedLiftModal);
                  setSimulatedLiftModal(null);
                }}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30"
              >
                Apply Optimization Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR (App-Like Experience on Phones) */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-2 py-1.5 backdrop-blur-xl flex items-center justify-around ${
        darkMode ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-slate-200 shadow-lg'
      }`}>
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3, badge: null },
          ...(!isClientLockedMode ? [{ id: 'create-campaign', label: 'Create', icon: Rocket, badge: null }] : []),
          { id: 'campaigns', label: 'Campaigns', icon: Layers, badge: campaigns.length },
          { id: 'audience', label: 'Audience', icon: PieChartIcon, badge: null },
          { id: 'ai-hub', label: 'AI Tips', icon: Sparkles, badge: aiSuggestions.filter((s) => !s.applied).length },
          ...(!isClientLockedMode ? [{ id: 'data-input', label: 'API Sync', icon: Key, badge: null }] : [])
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
                isActive
                  ? 'text-blue-400 bg-blue-600/15'
                  : darkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-blue-400' : ''}`} />
              <span className="truncate max-w-[64px]">{item.label}</span>
              {item.badge !== null && item.badge > 0 && (
                <span className="absolute -top-0.5 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen pb-20 lg:pb-0">
        <aside className={`w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r flex flex-col justify-between ${
          darkMode ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="px-4 py-3.5 lg:p-5 flex items-center justify-between border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                {/* Custom M.D.R.S Digital Services Brand Logo */}
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 p-[1.5px] shadow-lg shadow-blue-600/30 shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500/30 rounded-full blur-sm" />
                    <span className="font-black text-[11px] lg:text-xs tracking-tighter bg-gradient-to-r from-white via-blue-200 to-emerald-300 bg-clip-text text-transparent leading-none">
                      MDRS
                    </span>
                    <span className="text-[7px] font-bold tracking-widest text-blue-400 uppercase mt-0.5 leading-none">
                      DIGITAL
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs sm:text-sm tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent truncate">
                      M.D.R.S DIGITAL SERVICES
                    </span>
                  </div>
                  <p className="text-[10px] lg:text-[11px] text-slate-400 font-medium">
                    Global Meta Ads Intelligence
                  </p>
                </div>
              </div>

              {/* Quick Mobile Theme & Export Controls */}
              <div className="flex items-center gap-1.5 lg:hidden">
                <button
                  onClick={handleExportCSV}
                  title="Export CSV / PDF Report"
                  className={`p-2 rounded-xl border transition ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800 text-slate-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  title="Toggle Theme"
                  className={`p-2 rounded-xl border transition ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800 text-amber-400'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <nav className="hidden lg:flex p-3 lg:flex-col gap-1.5 overflow-x-auto">
              {[
                { id: 'overview', label: 'Executive Overview', icon: BarChart3, badge: null },
                ...(!isClientLockedMode ? [{ id: 'create-campaign', label: 'Create Campaign', icon: Rocket, badge: null }] : []),
                { id: 'campaigns', label: 'Campaigns & Creatives', icon: Layers, badge: campaigns.length },
                { id: 'audience', label: 'Audience & Placements', icon: PieChartIcon, badge: null },
                { id: 'ai-hub', label: 'AI Optimization Hub', icon: Sparkles, badge: aiSuggestions.filter(s => !s.applied).length, badgeColor: 'bg-rose-500 text-white' },
                ...(!isClientLockedMode ? [{ id: 'data-input', label: 'Data Sync & API Setup', icon: FileSpreadsheet, badge: null }] : [])
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : darkMode
                        ? 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        item.badgeColor ? item.badgeColor : isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="hidden lg:block p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Meta Account Health</span>
              <span className="text-xs font-bold text-emerald-400">
                {Math.min(99, 82 + appliedOptimizations.length * 4)} / 100
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(99, 82 + appliedOptimizations.length * 4)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pixel & CAPI Event Match Quality: <strong className="text-emerald-400">8.9/10</strong>
            </p>
            <button
              onClick={() => setActiveTab('ai-hub')}
              className="mt-3 w-full py-2 px-3 rounded-xl text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> View {aiSuggestions.filter(s => !s.applied).length} Active Fixes
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className={`sticky top-0 z-30 border-b px-3 sm:px-5 lg:px-8 py-3 backdrop-blur-md ${
            darkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/95 border-slate-200'
          }`}>
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              {/* Account Selector & Currency Row */}
              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 w-full xl:w-auto">
                {isClientLockedMode ? (
                  <div className="flex items-center justify-between w-full sm:w-auto gap-2.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          {clientBrandName || adAccounts.find((a) => a.id === selectedAccount)?.name || 'Live Client Telemetry'}
                        </span>
                        <span className="text-[10px] text-emerald-400 block truncate">Private account report</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="relative flex-1 sm:flex-initial min-w-[200px] max-w-full">
                    <select
                      value={selectedAccount}
                      onChange={(e) => {
                        setSelectedAccount(e.target.value);
                        setSelectedCampaignId(null);
                      }}
                      className={`w-full pl-3 pr-8 py-2 rounded-xl text-xs sm:text-sm font-semibold border appearance-none cursor-pointer truncate focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? 'bg-slate-900 border-slate-800 text-slate-100'
                          : 'bg-slate-100 border-slate-300 text-slate-900'
                      }`}
                    >
                      {adAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.currency || 'USD'}) - {acc.id}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="w-4 h-4 text-slate-400 rotate-90 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {activeCurrencyCode} ({activeCurrencySymbol})
                  </span>

                  {isFetchingLiveInsights && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-semibold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="hidden sm:inline">Syncing...</span>
                    </span>
                  )}

                  {selectedCampaignId && (
                    <button
                      onClick={() => setSelectedCampaignId(null)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 text-[11px] font-semibold hover:bg-blue-600/30"
                    >
                      1 Filtered <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons & Date Range Presets */}
              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 w-full xl:w-auto">
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  {!isClientLockedMode && (
                    <>
                      <button
                        onClick={() => setIsLiveApiModalOpen(true)}
                        className={`flex-1 sm:flex-initial justify-center flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                          isLiveApiConnected
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                        }`}
                      >
                        <Key className="w-3.5 h-3.5 shrink-0" />
                        <span>{isLiveApiConnected ? 'API Connected' : 'Connect Meta API'}</span>
                      </button>

                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition"
                      >
                        <Share2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Share Client Link</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      if (isLiveApiConnected) {
                        fetchLiveAccountTelemetry(selectedAccount, null, datePreset);
                      } else {
                        setLiveSync(!liveSync);
                      }
                    }}
                    className={`w-full sm:w-auto justify-center flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isLiveApiConnected || liveSync
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : darkMode
                        ? 'bg-slate-900 border-slate-800 text-slate-400'
                        : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      {(isLiveApiConnected || liveSync) && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveApiConnected || liveSync ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    </span>
                    <span>{isLiveApiConnected ? 'REFRESH LIVE' : liveSync ? 'LIVE STREAM' : 'PAUSED'}</span>
                    <span className="text-[10px] opacity-75">({lastSyncTime})</span>
                  </button>
                </div>

                {/* Horizontally Scrollable Date Presets on Mobile */}
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                  <div className={`flex items-center p-1 rounded-xl border w-full sm:w-auto justify-between sm:justify-start shrink-0 ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Maximum (Lifetime)'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setDatePreset(preset)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap transition ${
                          datePreset === preset
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {preset === 'Maximum (Lifetime)' ? 'Lifetime' : preset}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleExportCSV}
                    title="Export CSV / PDF Report"
                    className={`hidden lg:flex p-2 rounded-xl border transition shrink-0 ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                        : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    title="Toggle Theme"
                    className={`hidden lg:flex p-2 rounded-xl border transition shrink-0 ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-amber-400'
                        : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="p-3 sm:p-5 lg:p-8 space-y-6 sm:space-y-8 max-w-[1600px] w-full mx-auto">
            {activeTab === 'overview' && (
              <>
                {/* SIMPLE CLIENT-FRIENDLY SUMMARY BANNER */}
                <section className={`p-4 sm:p-5 rounded-2xl border ${
                  darkMode
                    ? 'bg-gradient-to-r from-blue-950/60 via-slate-900 to-emerald-950/40 border-blue-500/30'
                    : 'bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200'
                }`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] sm:text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          isLiveApiConnected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {isLiveApiConnected ? '✓ Exact Meta Ads Manager Live Data' : 'Demo Sample Data'}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          • Period: <strong className="text-slate-200">{datePreset}</strong>
                        </span>
                      </div>
                      <h1 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight pt-0.5 break-words">
                        {adAccounts.find((a) => a.id === selectedAccount)?.name || 'Ad Account Summary'} ({activeCurrencyCode})
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        During this period, your total ad spend is <strong className="text-blue-400 font-bold">{fmtMoney(totals.spend)}</strong>, reaching <strong className="text-cyan-400 font-bold">{formatNumber(totals.reach, activeCurrencySymbol)} unique people</strong> (<strong className="text-amber-300 font-bold">{formatNumber(totals.impressions, activeCurrencySymbol)} Impressions</strong> @ <strong className="text-amber-400 font-bold">{fmtMoney(totals.cpm)} CPM</strong>) with a <strong className="text-indigo-300 font-bold">{totals.ctr.toFixed(2)}% CTR</strong> and generating <strong className="text-emerald-400 font-bold">{formatNumber(totals.conversions, activeCurrencySymbol)} {totals.resultLabel || 'Results'}</strong> (CPR: <strong className="text-violet-400 font-bold">{totals.conversions > 0 ? fmtMoney(totals.cpa) : `${activeCurrencySymbol}0.00`}</strong> • ROAS: <strong className="text-pink-400 font-bold">{totals.roas.toFixed(2)}x</strong>).
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                      {!isLiveApiConnected && !isClientLockedMode && (
                        <button
                          onClick={() => setIsLiveApiModalOpen(true)}
                          className="justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2"
                        >
                          <Key className="w-4 h-4 shrink-0" /> Connect Real Meta Ads Account
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActiveTab('ai-hub');
                          handleAskGeminiStrategist();
                        }}
                        className="justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 transition"
                      >
                        <Sparkles className="w-4 h-4 shrink-0" /> AI Growth Tips
                      </button>
                    </div>
                  </div>
                </section>

                {/* 6 MAIN CLIENT-FRIENDLY KPI CARDS */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Main Performance Numbers (8 Core Meta Metrics: Spend, Results, CPR, Reach, Impressions/CPM, CTR, Clicks & ROAS)
                    </h2>
                    <span className="text-xs text-slate-400">
                      Showing values in <strong className="text-slate-200">{activeCurrencyCode} ({activeCurrencySymbol})</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {primaryClientCards.map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <div
                          key={idx}
                          className={`p-5 rounded-2xl border bg-gradient-to-br transition-all hover:-translate-y-0.5 ${
                            darkMode
                              ? `${card.color} bg-slate-900/90`
                              : 'bg-white border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                                {card.title}
                              </span>
                              <span className="text-[11px] text-slate-400">{card.hindiSub}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                              <Icon className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="my-3 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                              {card.value}
                            </span>
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-950/70 text-slate-300 border border-slate-800">
                              {card.badge}
                            </span>
                          </div>

                          <div className="pt-2.5 border-t border-slate-800/60 text-xs text-slate-300 flex items-center justify-between">
                            <span>{card.subtitle}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className={`rounded-2xl border p-5 ${
                  darkMode
                    ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-500/30'
                    : 'bg-indigo-50/60 border-indigo-200'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base lg:text-lg font-bold">
                            Automated Meta Ads Optimization Engine
                          </h2>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            {aiSuggestions.filter((s) => !s.applied).length} Actionable Opportunities
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Real-time diagnostics detecting creative fatigue, funnel drop-offs, and ROAS scaling bottlenecks
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('ai-hub')}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      Open Full AI Strategist Hub <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiSuggestions.map((sug) => (
                      <div
                        key={sug.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                          sug.applied
                            ? 'bg-emerald-950/20 border-emerald-500/30 opacity-80'
                            : darkMode
                            ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                                sug.badgeColor === 'rose'
                                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                  : sug.badgeColor === 'amber'
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                  : sug.badgeColor === 'emerald'
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-violet-500/15 text-violet-400 border-violet-500/30'
                              }`}
                            >
                              {sug.severity} • {sug.category}
                            </span>
                            <span className="text-xs font-semibold text-emerald-400">{sug.expectedImpact}</span>
                          </div>

                          <h3 className="font-bold text-sm sm:text-base">{sug.title}</h3>
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{sug.problem}</p>
                          <div className="mt-2.5 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/15 text-xs text-slate-300">
                            <strong className="text-blue-400">Fix: </strong>
                            {sug.recommendation}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/70">
                          <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            Target: {sug.campaignName}
                          </span>
                          <div className="flex items-center gap-2">
                            {!sug.applied ? (
                              <>
                                <button
                                  onClick={() => setSimulatedLiftModal(sug)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
                                >
                                  Simulate Impact
                                </button>
                                <button
                                  disabled={isClientLockedMode} onClick={() => handleApplyOptimization(sug)}
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow shadow-blue-600/30 transition flex items-center gap-1"
                                >
                                  <Zap className="w-3.5 h-3.5" /> Simulate Fix
                                </button>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 px-3 py-1 rounded-lg bg-emerald-500/10">
                                <Check className="w-3.5 h-3.5" /> Optimization Active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className={`lg:col-span-2 p-4 sm:p-5 rounded-2xl border ${
                    darkMode ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                      <div>
                        <h3 className="font-bold text-sm sm:text-base">Performance Trajectory & Scaling Efficiency</h3>
                        <p className="text-xs text-slate-400">
                          Compare Spend vs. ROAS, Conversions, or Outbound CTR over time
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                        <select
                          value={primaryChartMetric}
                          onChange={(e) => setPrimaryChartMetric(e.target.value)}
                          className={`w-full sm:w-auto px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-slate-100 border-slate-300 text-blue-700'
                          }`}
                        >
                          <option value="spend">Left: Spend ({activeCurrencySymbol})</option>
                          <option value="clicks">Left: Link Clicks</option>
                          <option value="impressions">Left: Impressions</option>
                        </select>
                        <select
                          value={secondaryChartMetric}
                          onChange={(e) => setSecondaryChartMetric(e.target.value)}
                          className={`w-full sm:w-auto px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-100 border-slate-300 text-emerald-700'
                          }`}
                        >
                          <option value="conversions">Right: Results</option>
                          <option value="roas">Right: ROAS (x)</option>
                          <option value="ctr">Right: CTR (%)</option>
                        </select>
                      </div>
                    </div>

                    <div className="h-64 sm:h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeSeries} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#e2e8f0'} />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                          <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} />
                          <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                              borderColor: darkMode ? '#1e293b' : '#cbd5e1',
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}
                          />
                          <Legend />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey={primaryChartMetric}
                            name={primaryChartMetric.toUpperCase()}
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorPrimary)"
                          />
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey={secondaryChartMetric}
                            name={secondaryChartMetric.toUpperCase()}
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorSecondary)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                    darkMode ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-base">Meta Conversion Funnel</h3>
                          <p className="text-xs text-slate-400">Impression-to-Purchase progression & drop-offs</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                          {((totals.conversions / (totals.linkClicks || 1)) * 100).toFixed(2)}% Click-to-Sale
                        </span>
                      </div>

                      <div className="space-y-3.5 mt-4">
                        {funnelSteps.map((step, i) => {
                          const widthVisual = Math.max(18, 100 - i * 14);
                          return (
                            <div key={step.label} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-300">{step.label}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">{formatNumber(step.value)}</span>
                                  {step.stepConv && (
                                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 font-medium">
                                      {step.stepConv}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="w-full bg-slate-800/60 h-6 rounded-lg overflow-hidden p-0.5">
                                <div
                                  className={`h-full rounded-md bg-gradient-to-r ${step.color} transition-all duration-500 flex items-center justify-end pr-2`}
                                  style={{ width: `${widthVisual}%` }}
                                >
                                  <span className="text-[10px] font-bold text-white/90">
                                    {i === 0 ? '100%' : `${step.pct < 1 ? step.pct.toFixed(2) : step.pct.toFixed(1)}%`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300">
                        <strong className="text-amber-400">Funnel Diagnostic:</strong> Link Click → Landing Page View retention is{' '}
                        <strong>{totals.lpvRate.toFixed(1)}%</strong>. Optimizing mobile page speed above 85% unlocks ~190 extra conversions/week.
                      </p>
                    </div>
                  </div>
                </section>
              </>
            )}

            {(activeTab === 'overview' || activeTab === 'audience') && (
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base lg:text-lg font-bold flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-400" /> Complete Placements, Customer Age Groups & Country/Region Intelligence
                    </h2>
                    <p className="text-xs text-slate-400">
                      Full visual charts and granular telemetry tables for every Ad Placement, Customer Age Bracket, and Geographic Location
                    </p>
                  </div>
                </div>

                {/* ROW 1: PLACEMENTS & AGE GROUP CHARTS + COMPLETE TABLES */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* 1. COMPLETE PLACEMENTS BREAKDOWN (CHART + TABLE) */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                    darkMode ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-base flex items-center gap-2">
                            <Instagram className="w-4 h-4 text-pink-400" /> 1. Placements Performance (Platform & Position)
                          </h3>
                          <p className="text-xs text-slate-400">
                            Spend ({activeCurrencySymbol}), Results, CTR & CPA across Facebook, Instagram, Messenger & Audience Network
                          </p>
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          {placements.length} Placements
                        </span>
                      </div>

                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={placements.slice(0, 8)}
                            layout="vertical"
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#e2e8f0'} />
                            <XAxis type="number" stroke="#64748b" fontSize={11} />
                            <YAxis
                              dataKey="name"
                              type="category"
                              stroke="#94a3b8"
                              fontSize={10}
                              width={145}
                              tick={{ fill: darkMode ? '#cbd5e1' : '#334155' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                                borderColor: '#1e293b',
                                borderRadius: '10px',
                                fontSize: '12px'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="spend" name={`Spend (${activeCurrencySymbol})`} fill="#3b82f6" radius={[0, 6, 6, 0]} />
                            <Bar dataKey="conversions" name="Results" fill="#10b981" radius={[0, 6, 6, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Complete Placements Table */}
                      <div className="mt-4 overflow-x-auto max-h-64 border-t border-slate-800/70 pt-3">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                              <th className="py-2 px-2">Placement Name</th>
                              <th className="py-2 px-2 text-right">Spend</th>
                              <th className="py-2 px-2 text-right">Results</th>
                              <th className="py-2 px-2 text-right">Cost/Result</th>
                              <th className="py-2 px-2 text-right">Impr.</th>
                              <th className="py-2 px-2 text-right">CTR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {placements.map((pl, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/30">
                                <td className="py-2 px-2 font-semibold text-slate-200">{pl.name}</td>
                                <td className="py-2 px-2 text-right font-bold text-blue-400">{fmtMoney(pl.spend)}</td>
                                <td className="py-2 px-2 text-right font-bold text-emerald-400">{formatNumber(pl.conversions)}</td>
                                <td className="py-2 px-2 text-right text-violet-300">{pl.conversions > 0 ? fmtMoney(pl.cpa) : '—'}</td>
                                <td className="py-2 px-2 text-right text-slate-300">{formatNumber(pl.impressions || 0)}</td>
                                <td className="py-2 px-2 text-right text-cyan-400">{Number(pl.ctr || 0).toFixed(2)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* 2. COMPLETE AGE GROUP & GENDER CUSTOMER DATA (CHART + TABLE) */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                    darkMode ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-base flex items-center gap-2">
                            <Users className="w-4 h-4 text-violet-400" /> 2. Customer Age Group & Gender Breakdown
                          </h3>
                          <p className="text-xs text-slate-400">
                            Complete customer demographics showing Male vs. Female Results, Spend & Cost Per Result by Age
                          </p>
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/30">
                          {demographics.length} Age Brackets
                        </span>
                      </div>

                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={demographics} margin={{ top: 5, right: 15, left: -5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#e2e8f0'} />
                            <XAxis dataKey="age" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                                borderColor: '#1e293b',
                                borderRadius: '10px',
                                fontSize: '12px'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="female" name="Female Results" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="male" name="Male Results" stackId="a" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="spend" name={`Spend (${activeCurrencySymbol})`} fill="#10b981" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Complete Age Group Customer Table */}
                      <div className="mt-4 overflow-x-auto max-h-64 border-t border-slate-800/70 pt-3">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                              <th className="py-2 px-2">Age Group</th>
                              <th className="py-2 px-2 text-right">Spend</th>
                              <th className="py-2 px-2 text-right">Total Results</th>
                              <th className="py-2 px-2 text-right">Male / Female</th>
                              <th className="py-2 px-2 text-right">Cost/Result</th>
                              <th className="py-2 px-2 text-right">Impressions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {demographics.map((dm, idx) => {
                              const totRes = dm.totalResults !== undefined ? dm.totalResults : (dm.male || 0) + (dm.female || 0);
                              const cpaVal = dm.cpa !== undefined ? dm.cpa : totRes > 0 ? dm.spend / totRes : 0;
                              return (
                                <tr key={idx} className="hover:bg-slate-800/30">
                                  <td className="py-2 px-2 font-bold text-white">{dm.age} yrs</td>
                                  <td className="py-2 px-2 text-right font-semibold text-blue-400">{fmtMoney(dm.spend)}</td>
                                  <td className="py-2 px-2 text-right font-bold text-emerald-400">{formatNumber(totRes)}</td>
                                  <td className="py-2 px-2 text-right text-slate-300">
                                    <span className="text-blue-400">{formatNumber(dm.male)}M</span> / <span className="text-pink-400">{formatNumber(dm.female)}F</span>
                                  </td>
                                  <td className="py-2 px-2 text-right text-violet-300">{totRes > 0 ? fmtMoney(cpaVal) : '—'}</td>
                                  <td className="py-2 px-2 text-right text-slate-300">{formatNumber(dm.impressions || 0)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROW 2: COUNTRY & REGION GEOLOCATION DATA (CHART + TABLE) & DEVICE SPLIT */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* 3. COUNTRY & REGION GEOLOCATION PERFORMANCE */}
                  <div className={`xl:col-span-2 p-5 rounded-2xl border ${
                    darkMode ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-bold text-base flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-400" /> 3. Country & State/Region Performance Breakdown
                        </h3>
                        <p className="text-xs text-slate-400">
                          See exactly which Countries and Provinces/States are generating your highest Results & lowest CPR
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start">
                        <button
                          onClick={() => setGeoViewMode('region')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            geoViewMode === 'region'
                              ? 'bg-blue-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          State / Region ({regionsData.length})
                        </button>
                        <button
                          onClick={() => setGeoViewMode('country')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            geoViewMode === 'country'
                              ? 'bg-blue-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Countries ({countriesData.length})
                        </button>
                      </div>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={geoViewMode === 'region' ? regionsData.slice(0, 10) : countriesData.slice(0, 10)}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#e2e8f0'} />
                          <XAxis
                            dataKey={geoViewMode === 'region' ? 'name' : 'country'}
                            stroke="#94a3b8"
                            fontSize={10}
                            interval={0}
                            angle={-15}
                            textAnchor="end"
                            height={50}
                          />
                          <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} />
                          <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                              borderColor: '#1e293b',
                              borderRadius: '10px',
                              fontSize: '12px'
                            }}
                          />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="spend"
                            name={`Spend (${activeCurrencySymbol})`}
                            fill="#3b82f6"
                            radius={[6, 6, 0, 0]}
                          />
                          <Bar
                            yAxisId="right"
                            dataKey="conversions"
                            name="Results"
                            fill="#10b981"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Complete Country / Region Table */}
                    <div className="mt-4 overflow-x-auto max-h-64 border-t border-slate-800/70 pt-3">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                            <th className="py-2 px-2">{geoViewMode === 'region' ? 'State / Region (Country)' : 'Country'}</th>
                            <th className="py-2 px-2 text-right">Amount Spent</th>
                            <th className="py-2 px-2 text-right">Results</th>
                            <th className="py-2 px-2 text-right">Cost / Result</th>
                            <th className="py-2 px-2 text-right">Reach</th>
                            <th className="py-2 px-2 text-right">Impressions</th>
                            <th className="py-2 px-2 text-right">Clicks (CTR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {(geoViewMode === 'region' ? regionsData : countriesData).map((loc, i) => (
                            <tr key={i} className="hover:bg-slate-800/30">
                              <td className="py-2 px-2 font-semibold text-white">
                                {geoViewMode === 'region' ? loc.name : loc.country}
                              </td>
                              <td className="py-2 px-2 text-right font-bold text-blue-400">{fmtMoney(loc.spend)}</td>
                              <td className="py-2 px-2 text-right font-bold text-emerald-400">{formatNumber(loc.conversions)}</td>
                              <td className="py-2 px-2 text-right text-violet-300">
                                {loc.conversions > 0 ? fmtMoney(loc.cpa) : '—'}
                              </td>
                              <td className="py-2 px-2 text-right text-slate-300">{formatNumber(loc.reach || 0)}</td>
                              <td className="py-2 px-2 text-right text-slate-300">{formatNumber(loc.impressions || 0)}</td>
                              <td className="py-2 px-2 text-right text-cyan-400">
                                {formatNumber(loc.clicks || 0)} ({Number(loc.ctr || 0).toFixed(2)}%)
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 4. DEVICE & OS ATTRIBUTION */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                    darkMode ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <h3 className="font-bold text-base">4. Device & OS Attribution</h3>
                      <p className="text-xs text-slate-400">Traffic share & conversion efficiency by customer device</p>
                    </div>

                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deviceSplit}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={72}
                            paddingAngle={4}
                          >
                            {deviceSplit.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                              borderColor: '#1e293b',
                              borderRadius: '10px',
                              fontSize: '12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/60">
                      {deviceSplit.map((d) => (
                        <div key={d.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                            <span className="truncate text-slate-200 font-medium">{d.name}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-slate-400">{d.value}% Share</span>
                            <span className="font-bold text-emerald-400">{d.roas}x ROAS</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {(activeTab === 'overview' || activeTab === 'campaigns') && (
              <section className={`rounded-2xl border overflow-hidden ${
                darkMode ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base lg:text-lg font-bold">
                      Campaigns, Ad Relevance Diagnostics & Creative Telemetry
                    </h2>
                    <p className="text-xs text-slate-400">
                      Tap or click any campaign to filter all dashboard charts by that specific campaign
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-60">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search campaign, hook..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:flex items-center gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300'
                        }`}
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active Only</option>
                        <option value="PAUSED">Paused Only</option>
                      </select>

                      <select
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300'
                        }`}
                      >
                        <option value="spend">Sort: Spend</option>
                        <option value="conversions">Sort: Results</option>
                        <option value="cpa">Sort: Cost/Result</option>
                        <option value="roas">Sort: ROAS</option>
                        <option value="ctr">Sort: CTR</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* MOBILE-FRIENDLY CAMPAIGN CARDS (Shown on Smartphones < 768px so no horizontal scrolling is needed) */}
                <div className="md:hidden divide-y divide-slate-800/70">
                  {filteredCampaigns.map((cmp) => {
                    const isSelected = selectedCampaignId === cmp.id;
                    return (
                      <div
                        key={cmp.id}
                        onClick={() => setSelectedCampaignId(isSelected ? null : cmp.id)}
                        className={`p-4 space-y-3 transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/15'
                            : darkMode
                            ? 'hover:bg-slate-800/30'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-bold text-sm block break-words leading-snug">{cmp.name}</span>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                              {cmp.creativeFormat} • Budget: {cmp.dailyBudget > 0 ? `${fmtMoney(cmp.dailyBudget, 0)}/d` : 'AdSet'}
                            </span>
                          </div>
                          <span
                            className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cmp.status === 'ACTIVE'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cmp.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                            {cmp.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                            <span className="text-[10px] text-slate-400 block">Spent</span>
                            <span className="text-xs font-bold text-white mt-0.5 block">{fmtMoney(cmp.spend)}</span>
                          </div>
                          <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                            <span className="text-[10px] text-slate-400 block">{cmp.resultLabel || 'Results'}</span>
                            <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                              {formatNumber(cmp.conversions, activeCurrencySymbol)}
                            </span>
                          </div>
                          <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                            <span className="text-[10px] text-slate-400 block">Cost / Result</span>
                            <span className="text-xs font-bold text-violet-300 mt-0.5 block">
                              {cmp.conversions > 0 ? fmtMoney(cmp.cpa) : '—'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                          <span>Reach: <strong className="text-slate-200">{formatNumber(cmp.reach)}</strong></span>
                          <span>Impr: <strong className="text-amber-300">{formatNumber(cmp.impressions)}</strong> (CPM: {fmtMoney(cmp.cpm)})</span>
                          <span>CTR: <strong className="text-blue-400">{cmp.ctr.toFixed(2)}%</strong></span>
                          <span>ROAS: <strong className="text-emerald-400">{cmp.roas.toFixed(2)}x</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP & TABLET DATA TABLE (Shown on screens >= 768px) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b text-[11px] uppercase tracking-wider font-semibold ${
                        darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Campaign Name</th>
                        <th className="py-3.5 px-3 text-right">Budget</th>
                        <th className="py-3.5 px-3 text-right">Amount Spent ({activeCurrencySymbol})</th>
                        <th className="py-3.5 px-3 text-right">Results</th>
                        <th className="py-3.5 px-3 text-right">Cost Per Result</th>
                        <th className="py-3.5 px-3 text-right">Reach</th>
                        <th className="py-3.5 px-3 text-right">Impressions & CPM</th>
                        <th className="py-3.5 px-3 text-right">Clicks & CTR</th>
                        <th className="py-3.5 px-3 text-right">CPC</th>
                        <th className="py-3.5 px-4 text-right">ROAS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {filteredCampaigns.map((cmp) => {
                        const isSelected = selectedCampaignId === cmp.id;
                        return (
                          <tr
                            key={cmp.id}
                            onClick={() => setSelectedCampaignId(isSelected ? null : cmp.id)}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? 'bg-blue-600/15 hover:bg-blue-600/20'
                                : darkMode
                                ? 'hover:bg-slate-800/40'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  cmp.status === 'ACTIVE'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${cmp.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                {cmp.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm truncate">{cmp.name}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                  {cmp.creativeFormat}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-3 text-right font-medium text-slate-300">
                              {cmp.dailyBudget > 0 ? `${fmtMoney(cmp.dailyBudget, 0)}/d` : 'AdSet Budget'}
                            </td>
                            <td className="py-3.5 px-3 text-right font-bold text-white">
                              {fmtMoney(cmp.spend)}
                            </td>
                            <td className="py-3.5 px-3 text-right font-bold text-emerald-400">
                              {formatNumber(cmp.conversions, activeCurrencySymbol)}
                              <span className="block text-[10px] font-normal text-slate-400">
                                {cmp.resultLabel || 'Results'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right font-semibold text-violet-300">
                              {cmp.conversions > 0 ? fmtMoney(cmp.cpa) : '—'}
                            </td>
                            <td className="py-3.5 px-3 text-right font-medium text-slate-200">
                              {formatNumber(cmp.reach, activeCurrencySymbol)}
                              <span className="block text-[10px] text-slate-400">{cmp.frequency.toFixed(2)}x freq</span>
                            </td>
                            <td className="py-3.5 px-3 text-right text-slate-200 font-medium">
                              {formatNumber(cmp.impressions, activeCurrencySymbol)}
                              <span className="block text-[10px] text-amber-400">CPM: {fmtMoney(cmp.cpm)}</span>
                            </td>
                            <td className="py-3.5 px-3 text-right font-medium">
                              {formatNumber(cmp.linkClicks, activeCurrencySymbol)}
                              <span className="block text-[10px] text-blue-400">{cmp.ctr.toFixed(2)}% CTR</span>
                            </td>
                            <td className="py-3.5 px-3 text-right text-slate-300">
                              {fmtMoney(cmp.cpc)}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <span className="px-2 py-0.5 rounded-lg font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                {cmp.roas.toFixed(2)}x
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'ai-hub' && (
              <section className="space-y-6">
                <div className={`p-6 rounded-2xl border ${
                  darkMode
                    ? 'bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-slate-900 border-blue-500/30'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Powered by Gemini 3 Flash
                      </span>
                      <h2 className="text-xl lg:text-2xl font-bold mt-2">
                        AI Meta Ads Strategist & Creative Lab
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Generate custom scaling roadmaps, diagnose auction bottlenecks, and write high-converting Reels ad scripts grounded in your live metrics.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        'Full Account Audit & Scaling Plan',
                        'Fix Creative Fatigue & Write Reels Hooks',
                        'Landing Page Conversion Rate Audit',
                        'Advantage+ Shopping Bidding Strategy'
                      ].map((focus) => (
                        <button
                          key={focus}
                          onClick={() => setAiSelectedFocus(focus)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                            aiSelectedFocus === focus
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {focus}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <p className="text-sm">AI requests use the server-managed connection.</p>
                    {aiError && <p role="alert" className="text-sm text-amber-400">{aiError}</p>}
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={aiPromptInput}
                      onChange={(e) => setAiPromptInput(e.target.value)}
                      placeholder="Ask anything about your Meta Ads (e.g., 'How do I scale Q4_Scale_Advantage+ from $450/day to $1,500/day without resetting learning?')"
                      className={`flex-1 px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    <button
                      onClick={() => handleAskGeminiStrategist()}
                      disabled={isAiLoading}
                      className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Telemetry...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Generate AI Strategy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {aiResponse && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className={`lg:col-span-2 p-6 rounded-2xl border space-y-5 ${
                      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-400" /> Strategic Media Buying Blueprint
                        </h3>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Target ROAS Potential: {aiResponse.estimatedRoasPotential}
                        </span>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        {aiResponse.executiveSummary}
                      </p>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Prioritized Optimization Steps
                        </h4>
                        {aiResponse.actionSteps?.map((step, i) => (
                          <div key={i} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-blue-400">
                                {i + 1}. {step.title}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                                {step.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{step.detail}</p>
                            <div className="text-[11px] font-semibold text-emerald-400 pt-1">
                              KPI Goal: {step.metricTarget}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border space-y-4 ${
                      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <h3 className="font-bold text-lg flex items-center gap-2 border-b border-slate-800 pb-4">
                        <Flame className="w-5 h-5 text-amber-400" /> High-Converting Ad Hooks
                      </h3>
                      <div className="space-y-4">
                        {aiResponse.adCopyHooks?.map((hook, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                            <span className="text-[11px] font-bold uppercase text-violet-400">
                              Angle {idx + 1}: {hook.angle}
                            </span>
                            <p className="text-sm font-semibold text-white">
                              {hook.hookText}
                            </p>
                            <p className="text-xs text-slate-400">
                              <strong className="text-slate-300">Visual Direction:</strong> {hook.visualDirection}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {!isClientLockedMode && activeTab === 'create-campaign' && <CampaignBuilder key={selectedAccount} account={selectedAccount} currency={activeCurrencyCode} />}

            {!isClientLockedMode && activeTab === 'data-input' && (
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl border ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
                    <Upload className="w-5 h-5 text-blue-400" /> Inject Custom Campaign Data
                  </h2>
                  <p className="text-xs text-slate-400 mb-5">
                    Add your own live Meta Ads campaign numbers to immediately see KPI calculations, funnel diagnostics, and AI improvement suggestions.
                  </p>

                  <form onSubmit={handleAddCustomCampaign} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Campaign Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Q4_BlackFriday_Reels_Broad"
                        value={newCampaignForm.name}
                        onChange={(e) => setNewCampaignForm({ ...newCampaignForm, name: e.target.value })}
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Daily Budget ($)', key: 'dailyBudget' },
                        { label: 'Amount Spent ($)', key: 'spend' },
                        { label: 'Impressions', key: 'impressions' },
                        { label: 'Unique Reach', key: 'reach' },
                        { label: 'Link Clicks', key: 'linkClicks' },
                        { label: 'Landing Page Views', key: 'landingPageViews' },
                        { label: 'Conversions / Sales', key: 'conversions' },
                        { label: 'Conversion Value ($)', key: 'revenue' }
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{field.label}</label>
                          <input
                            type="number"
                            step="any"
                            value={newCampaignForm[field.key]}
                            onChange={(e) => setNewCampaignForm({ ...newCampaignForm, [field.key]: e.target.value })}
                            className={`w-full px-3 py-2 rounded-xl text-xs border ${
                              darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                            }`}
                          />
                        </div>
                      ))}

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">Primary Placement</label>
                        <select
                          value={newCampaignForm.primaryPlacement}
                          onChange={(e) => setNewCampaignForm({ ...newCampaignForm, primaryPlacement: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl text-xs border ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        >
                          <option>Instagram Reels</option>
                          <option>Instagram Stories</option>
                          <option>Facebook Feed</option>
                          <option>Audience Network</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition"
                    >
                      Add Campaign to Live Dashboard & Run AI Audit
                    </button>
                  </form>
                </div>

                <div className="builder-panel"><h2 className="font-bold">Server-managed connections</h2><p>Use Manage clients to assign accounts. Add Meta credentials only to Vercel server environment variables, then redeploy. Client users cannot access these settings.</p><p>Custom data entered here is a local scenario only; it does not edit Meta.</p></div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}