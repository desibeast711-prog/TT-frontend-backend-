import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { normalizeTarget, extractDomainFromUrl } from './src/utils/normalization.js';
import { DEMO_COMMUNITY_REPORTS, DEMO_GEO_INTELLIGENCE, DEMO_PHONE_INTELLIGENCE } from './src/data/mockData.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// 1. Initialize Gemini AI Client (Server-side ONLY)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 2. Initialize Supabase Client (Server-side using public anon key or service role if provided)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('TrulyTrue Server: Supabase client connected.');
} else {
  console.log('TrulyTrue Server: Supabase credentials not set. Running in resilient hybrid mode.');
}

// Helper function to query DB report counts for a normalized target
async function getTargetReportStats(normalizedValue: string) {
  if (!supabase || !normalizedValue) {
    return {
      totalCount: 0,
      verifiedCount: 0,
      topCategories: [] as { category: string; count: number }[],
      firstReported: null as string | null,
      latestReported: null as string | null,
      regions: [] as string[],
      recentReports: [] as any[],
    };
  }

  try {
    const { data: reports, error } = await supabase
      .from('scam_reports')
      .select('*')
      .eq('normalized_value', normalizedValue)
      .neq('status', 'removed')
      .order('created_at', { ascending: false });

    if (error || !reports) {
      return {
        totalCount: 0,
        verifiedCount: 0,
        topCategories: [],
        firstReported: null,
        latestReported: null,
        regions: [],
        recentReports: [],
      };
    }

    const totalCount = reports.length;
    const verifiedCount = reports.filter((r) => r.status === 'verified').length;
    const firstReported = reports.length > 0 ? reports[reports.length - 1].created_at : null;
    const latestReported = reports.length > 0 ? reports[0].created_at : null;

    // Aggregate category counts
    const catMap: Record<string, number> = {};
    const regionSet = new Set<string>();

    reports.forEach((r) => {
      if (r.scam_category) {
        catMap[r.scam_category] = (catMap[r.scam_category] || 0) + 1;
      }
      if (r.district || r.state || r.country) {
        const regStr = [r.district, r.state, r.country].filter(Boolean).join(', ');
        if (regStr) regionSet.add(regStr);
      }
    });

    const topCategories = Object.entries(catMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalCount,
      verifiedCount,
      topCategories,
      firstReported,
      latestReported,
      regions: Array.from(regionSet),
      recentReports: reports.slice(0, 5),
    };
  } catch (err) {
    console.error('Error fetching target stats from Supabase:', err);
    return {
      totalCount: 0,
      verifiedCount: 0,
      topCategories: [],
      firstReported: null,
      latestReported: null,
      regions: [],
      recentReports: [],
    };
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(ai),
    supabaseConfigured: Boolean(supabase),
  });
});

// Helper function to auto-seed scam_categories in Supabase if empty
async function ensureScamCategoriesSeeded() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from('scam_categories').select('id').limit(1);
    if (!error && (!data || data.length === 0)) {
      console.log('TrulyTrue Server: scam_categories table is empty. Auto-seeding trending categories...');
      const categoriesToSeed = [
        { name: 'Digital Arrest / Coercion', description: 'Impersonation of CBI, Police, Customs, TRAI, or Narcotics officers threatening video call arrest.' },
        { name: 'Part-time Job & Task Fraud', description: 'Fake work-from-home offers demanding YouTube likes, merchant ratings, or prepaid commission tasks.' },
        { name: 'Electricity Bill Disconnection', description: 'Urgent threats of power or service disconnection unless immediate payment is made to a personal number.' },
        { name: 'FedEx / Customs Courier Scam', description: 'Calls/SMS claiming an illegal package with drugs or passports was seized in your name.' },
        { name: 'Stock Trading & IPO Fraud', description: 'WhatsApp groups promising 1000% returns, fake institutional trading apps, or bogus IPO allotments.' },
        { name: 'APK Malware & Trojan Download', description: 'Malicious Android APK files disguised as banking updates or government scheme apps.' },
        { name: 'Bank Fraud & Spoofed Calls', description: 'Spoofed helpline numbers, fake fraud alerts, or callers claiming to be bank managers.' },
        { name: 'UPI & Payment Fraud', description: 'Reverse payment scams, fake payment screenshots, or QR codes sent with claim PIN is needed to receive money.' },
        { name: 'Fake Customer Support', description: 'Impersonation of Amazon, Flipkart, Swiggy, Airtel, or bank helpline numbers on search engines.' },
        { name: 'Phishing & Credential Theft', description: 'Fake website portals mimicking banks, tax portals, or streaming services to steal credentials.' },
        { name: 'Loan App Extortion', description: 'Instant loan apps charging 300% interest, harvesting contacts, and using photo manipulation.' },
        { name: 'Aadhaar, AEPS & KYC Fraud', description: 'Phishing links or biometric spoofing threatening account/SIM blockage due to pending Aadhaar or PAN KYC.' },
        { name: 'Investment & Crypto Scam', description: 'Fraudulent crypto presales, fake wallet drainer links, automated trading bots, or forex deposit schemes.' },
        { name: 'Lottery & KBC Reward Scam', description: 'SMS or letters claiming you won 25 Lakhs in KBC or lucky draw, demanding processing tax upfront.' },
        { name: 'Marketplace & OLX Fraud', description: 'Fake army/defense personnel or buyers sending QR codes to pay advance token.' },
        { name: 'Romance & Pig Butchering', description: 'Manipulative online relationships building trust before pitching fake crypto/trading investments.' },
        { name: 'AI Voice Cloning Fraud', description: 'Cloned voice calls mimicking a family member crying or in emergency demanding immediate bail.' },
        { name: 'Identity Theft & Impersonation', description: 'Hacked social media accounts asking friends for urgent money or gift cards.' },
        { name: 'Courier Address Update Fraud', description: 'Fake redelivery notifications demanding address correction fees via suspicious links.' },
        { name: 'Refund & Remote Access Scam', description: 'Claims of mistaken refunds requiring AnyDesk, TeamViewer, or RustDesk app installation.' },
        { name: 'Social Media & Telegram Spam', description: 'Automated DM spam, fake giveaways, or account takeover links.' },
        { name: 'Other Emerging Fraud', description: 'Uncategorized or novel fraudulent tactics.' }
      ];
      await supabase.from('scam_categories').upsert(categoriesToSeed, { onConflict: 'name' });
      console.log('TrulyTrue Server: Auto-seeded scam_categories successfully.');
    }
  } catch (err) {
    console.warn('Error auto-seeding scam_categories:', err);
  }
}

// Auto-seed on server startup
ensureScamCategoriesSeeded();

// Helper to detect specific trending scam categories from message text
function detectScamCategoryFromText(text: string) {
  const qLower = (text || '').toLowerCase();

  // 1. Digital Arrest & Law Enforcement Impersonation
  if (
    qLower.includes('digital arrest') ||
    (qLower.includes('cbi') && (qLower.includes('warrant') || qLower.includes('arrest') || qLower.includes('notice') || qLower.includes('case'))) ||
    qLower.includes('narcotics') || qLower.includes('ncb') ||
    (qLower.includes('trai') && (qLower.includes('disconnect') || qLower.includes('blocked') || qLower.includes('police'))) ||
    qLower.includes('mumbai police') ||
    qLower.includes('cyber crime') ||
    qLower.includes('video call arrest') ||
    qLower.includes('skype call')
  ) {
    return {
      isMatch: true,
      status: 'REPORTED_HIGH_RISK',
      riskScore: 96,
      category: 'Digital Arrest / Coercion',
      plainEnglishReason: 'CRITICAL WARNING: Matches the active Digital Arrest / Coercion scam tactic. Impersonators pose as CBI, Police, or TRAI officers via video calls threatening immediate legal action.',
      warningSigns: [
        'Impersonates law enforcement or government agency (CBI/Police/TRAI)',
        'Creates extreme pressure with threats of instant arrest via video call',
        'Demands secret money transfers to unverified accounts to "clear your name"'
      ],
      recommendedActions: [
        'Disconnect any active video or voice call immediately',
        'Remember: Real police or CBI officers NEVER conduct arrests or demand money over Skype/WhatsApp calls',
        'Report the incident immediately on national cybercrime portal (1930 in India)'
      ]
    };
  }

  // 2. Electricity / Utility Bill Disconnection Scam
  if (
    qLower.includes('electricity') ||
    qLower.includes('power supply') ||
    qLower.includes('sdv') ||
    (qLower.includes('bill') && (qLower.includes('disconnect') || qLower.includes('unpaid'))) ||
    qLower.includes('power cut') ||
    qLower.includes('electricity officer')
  ) {
    return {
      isMatch: true,
      status: 'REPORTED_HIGH_RISK',
      riskScore: 90,
      category: 'Electricity Bill Disconnection',
      plainEnglishReason: 'HIGH RISK: Matches the widespread Electricity Bill Disconnection fraud. Scammers send fake SMS warnings threatening power cut-off within hours to coerce direct payments.',
      warningSigns: [
        'Creates artificial urgency with strict deadlines (e.g. power cut at 9:30 PM)',
        'Directs you to call a personal mobile number instead of official bill payment portals',
        'Demands money transfer or remote app installation to resolve bill updates'
      ],
      recommendedActions: [
        'Do NOT call the mobile number provided in the message',
        'Check your bill status only on your official state electricity board app or website',
        'Ignore threats of immediate disconnection sent via unofficial personal numbers'
      ]
    };
  }

  // 3. Part-Time Job / Telegram Task Fraud
  if (
    qLower.includes('part time job') ||
    qLower.includes('work from home') ||
    (qLower.includes('youtube') && (qLower.includes('like') || qLower.includes('subscribe') || qLower.includes('review'))) ||
    (qLower.includes('telegram') && (qLower.includes('task') || qLower.includes('daily') || qLower.includes('earn'))) ||
    qLower.includes('prepaid task') ||
    qLower.includes('merchant rating')
  ) {
    return {
      isMatch: true,
      status: 'REPORTED_HIGH_RISK',
      riskScore: 88,
      category: 'Part-time Job & Task Fraud',
      plainEnglishReason: 'HIGH RISK: Matches the rampant Part-Time Task & Telegram Job Scam pattern. Victims are lured with small payments for simple tasks before being forced to deposit large "prepaid fees".',
      warningSigns: [
        'Promises unrealistic daily income (Rs 2000 - 10000/day) for trivial tasks',
        'Moves communication to private Telegram or WhatsApp groups',
        'Requires "prepaid investment" or recharge deposits to unlock earned task commission'
      ],
      recommendedActions: [
        'Do NOT deposit any money to claim task earnings',
        'Never trust unsolicited job offers received on WhatsApp or Telegram',
        'Block the recruiter and exit any associated group chats immediately'
      ]
    };
  }

  // 4. FedEx / Customs Courier Parcel Scam
  if (
    qLower.includes('fedex') ||
    qLower.includes('customs') ||
    qLower.includes('courier') ||
    (qLower.includes('parcel') && (qLower.includes('seized') || qLower.includes('illegal') || qLower.includes('drugs') || qLower.includes('passport'))) ||
    qLower.includes('taiwan parcel') ||
    qLower.includes('mdma')
  ) {
    return {
      isMatch: true,
      status: 'REPORTED_HIGH_RISK',
      riskScore: 94,
      category: 'FedEx / Customs Courier Scam',
      plainEnglishReason: 'CRITICAL WARNING: Matches the FedEx / Customs Courier Fraud pattern. Scammers falsely claim a package containing illegal items/passports was sent in your name to extort money.',
      warningSigns: [
        'Claims an illegal package with contraband/drugs was intercepted by Customs',
        'Threatens criminal charges unless money is paid to clear customs or police clearance',
        'Transfers calls to fake officers demanding online funds transfer'
      ],
      recommendedActions: [
        'Do NOT pay any clearance or verification fees',
        'Official courier companies and customs do NOT request money via personal UPI or bank accounts',
        'Verify courier status directly on official courier tracking portals'
      ]
    };
  }

  // 5. Stock Trading & IPO Investment Fraud
  if (
    qLower.includes('ipo allotment') ||
    qLower.includes('upper circuit') ||
    qLower.includes('stock tips') ||
    (qLower.includes('trading') && (qLower.includes('guaranteed') || qLower.includes('1000%') || qLower.includes('group'))) ||
    qLower.includes('institutional account') ||
    qLower.includes('sebi registered')
  ) {
    return {
      isMatch: true,
      status: 'REPORTED_HIGH_RISK',
      riskScore: 92,
      category: 'Stock Trading & IPO Fraud',
      plainEnglishReason: 'HIGH RISK: Matches illegal Stock Trading & IPO Fraud. Scammers create fake trading apps and WhatsApp groups guaranteeing 100% stock gains or guaranteed IPO allotments.',
      warningSigns: [
        'Promises guaranteed stock market returns or secret institutional IPO allocations',
        'Requires installing unverified APK or third-party trading apps outside official app stores',
        'Asks for funds transfer to personal or generic company bank accounts instead of SEBI brokers'
      ],
      recommendedActions: [
        'Only trade through SEBI-registered stockbrokers (Zerodha, Groww, AngelOne, ICICI Direct)',
        'Never transfer funds to personal bank accounts for stock trading',
        'Report fraudulent trading apps to cybercrime authorities'
      ]
    };
  }

  // 6. APK Malware / Trojan Download
  if (
    qLower.includes('.apk') ||
    (qLower.includes('download') && (qLower.includes('app') || qLower.includes('update') || qLower.includes('apk'))) ||
    qLower.includes('pm yojna') ||
    qLower.includes('anydesk') ||
    qLower.includes('teamviewer') ||
    qLower.includes('rustdesk')
  ) {
    return {
      isMatch: true,
      status: 'REPORTED_HIGH_RISK',
      riskScore: 95,
      category: 'APK Malware & Trojan Download',
      plainEnglishReason: 'CRITICAL MALWARE THREAT: Contains prompts to download unverified Android APK files or remote access apps (AnyDesk/TeamViewer) capable of hijacking banking OTPs.',
      warningSigns: [
        'Prompts download of .apk files directly from web links or WhatsApp instead of Google Play',
        'Asks to enable "Install from Unknown Sources" or grants Accessibility permissions',
        'Monitors incoming SMS messages to steal OTPs and access financial accounts silently'
      ],
      recommendedActions: [
        'NEVER download or install .apk files received via WhatsApp, SMS, or unknown links',
        'Install apps exclusively from official Google Play Store or Apple App Store',
        'If already downloaded, uninstall the app immediately and change banking passwords'
      ]
    };
  }

  // 7. Aadhaar / PAN / Bank KYC Freeze Threat
  if (
    (qLower.includes('kyc') && (qLower.includes('update') || qLower.includes('pending') || qLower.includes('block') || qLower.includes('expire'))) ||
    qLower.includes('pan card link') ||
    qLower.includes('aadhaar link') ||
    qLower.includes('account suspended') ||
    qLower.includes('sbi kyc') ||
    qLower.includes('hdfc kyc')
  ) {
    return {
      isMatch: true,
      status: 'REPORTED_HIGH_RISK',
      riskScore: 88,
      category: 'Aadhaar, AEPS & KYC Fraud',
      plainEnglishReason: 'HIGH RISK: Matches Fake KYC & Bank Account Suspension Fraud. Scammers send phishing links claiming your bank account or SIM card will be frozen without instant update.',
      warningSigns: [
        'Threatens immediate account or SIM card blocking due to pending KYC',
        'Includes a phishing link leading to a fake bank credential harvesting page',
        'Requests full card numbers, CVVs, net banking passwords, or OTPs'
      ],
      recommendedActions: [
        'Do NOT click the link or provide credentials',
        'Banks NEVER ask for KYC updates or sensitive passwords via SMS links',
        'Update KYC only by visiting your official bank branch or official net banking portal'
      ]
    };
  }

  // 8. Lottery & KBC Reward Scam
  if (
    qLower.includes('lottery') ||
    qLower.includes('kbc') ||
    qLower.includes('won prize') ||
    qLower.includes('lucky draw') ||
    qLower.includes('25 lakh') ||
    qLower.includes('kaun banega crorepati')
  ) {
    return {
      isMatch: true,
      status: 'REPORTED_HIGH_RISK',
      riskScore: 90,
      category: 'Lottery & KBC Reward Scam',
      plainEnglishReason: 'HIGH RISK: Matches Fake Lottery & KBC Reward Scam. Scammers falsely notify you of a huge lottery win and demand "processing tax" or "registration fees" upfront.',
      warningSigns: [
        'Claims you won a lottery for a contest you never entered',
        'Demands advance tax, GST, or registration fee payments to release winnings',
        'Uses forged letters or fake audio messages claiming official authorization'
      ],
      recommendedActions: [
        'Do NOT pay any money to claim a prize',
        'Legitimate lotteries or contests never ask winners to pay fees upfront',
        'Block and report the sender immediately'
      ]
    };
  }

  // 9. UPI QR & Reverse Payment Scam
  if (
    qLower.includes('reverse payment') ||
    (qLower.includes('qr code') && qLower.includes('scan')) ||
    qLower.includes('enter upi pin') ||
    qLower.includes('send money to receive') ||
    qLower.includes('accidental transfer')
  ) {
    return {
      isMatch: true,
      status: 'REPORTED_HIGH_RISK',
      riskScore: 88,
      category: 'UPI & Payment Fraud',
      plainEnglishReason: 'HIGH RISK: Matches UPI PIN & QR Code Fraud. Scammers trick victims into scanning QR codes or entering UPI PINs under the guise of receiving payments or refunds.',
      warningSigns: [
        'Claims you need to scan a QR code or enter your UPI PIN to RECEIVE money',
        'Claims money was transferred to your account by mistake and demands immediate refund',
        'Uses spoofed SMS or fake payment app screenshot confirmations'
      ],
      recommendedActions: [
        'REMEMBER: UPI PIN is ONLY required to SEND or DEDUCT money, NEVER to receive',
        'Check your bank account balance directly in your UPI app to verify incoming funds',
        'Do NOT enter your UPI PIN if someone claims they sent you money'
      ]
    };
  }

  // 10. Loan App Extortion
  if (
    qLower.includes('instant loan') ||
    qLower.includes('loan approved') ||
    qLower.includes('nbfc loan') ||
    qLower.includes('photo leakage') ||
    qLower.includes('contact list access')
  ) {
    return {
      isMatch: true,
      status: 'REPORTED_HIGH_RISK',
      riskScore: 86,
      category: 'Loan App Extortion',
      plainEnglishReason: 'HIGH RISK: Matches Illegal Instant Loan App Extortion. Unregistered loan apps auto-disburse small sums, harvest device contact lists, and use harassment tactics.',
      warningSigns: [
        'Disburses loans without proper documentation or credit checks',
        'Requires permission to access your full contact list and gallery',
        'Uses aggressive threats, extortion, and morphed images sent to your contacts'
      ],
      recommendedActions: [
        'Do NOT install unauthorized loan apps outside RBI-registered lists',
        'Report predatory loan app extortion to cybercrime authorities immediately',
        'Revoke device permissions for suspicious loan applications'
      ]
    };
  }

  return { isMatch: false, status: 'NOT_REPORTED', riskScore: 0, category: 'No Community Reports', plainEnglishReason: 'No community reports have been found for this identifier in our database.', warningSigns: [], recommendedActions: [] };
}

// GET Scam Categories
app.get('/api/categories', async (req, res) => {
  if (supabase) {
    try {
      await ensureScamCategoriesSeeded();
      const { data, error } = await supabase.from('scam_categories').select('name, description');
      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    } catch (err) {
      console.warn('Failed to fetch categories from Supabase:', err);
    }
  }

  // Fallback initial categories list with trending scams
  const defaultCategories = [
    { name: 'Digital Arrest / Coercion', description: 'Impersonation of CBI, Police, Customs, TRAI, or Narcotics officers threatening video call arrest.' },
    { name: 'Part-time Job & Task Fraud', description: 'Fake work-from-home offers demanding YouTube likes, merchant ratings, or prepaid commission tasks.' },
    { name: 'Electricity Bill Disconnection', description: 'Urgent threats of power or service disconnection unless immediate payment is made to a personal number.' },
    { name: 'FedEx / Customs Courier Scam', description: 'Calls/SMS claiming an illegal package with drugs or passports was seized in your name.' },
    { name: 'Stock Trading & IPO Fraud', description: 'WhatsApp groups promising 1000% returns, fake institutional trading apps, or bogus IPO allotments.' },
    { name: 'APK Malware & Trojan Download', description: 'Malicious Android APK files disguised as banking updates or government scheme apps.' },
    { name: 'Bank Fraud & Spoofed Calls', description: 'Spoofed helpline numbers, fake fraud alerts, or callers claiming to be bank managers.' },
    { name: 'UPI & Payment Fraud', description: 'Reverse payment scams, fake payment screenshots, or QR codes sent with claim PIN is needed to receive money.' },
    { name: 'Fake Customer Support', description: 'Impersonation of Amazon, Flipkart, Swiggy, Airtel, or bank helpline numbers on search engines.' },
    { name: 'Phishing & Credential Theft', description: 'Fake website portals mimicking banks, tax portals, or streaming services to steal credentials.' },
    { name: 'Loan App Extortion', description: 'Instant loan apps charging 300% interest, harvesting contacts, and using photo manipulation.' },
    { name: 'Aadhaar, AEPS & KYC Fraud', description: 'Phishing links or biometric spoofing threatening account/SIM blockage due to pending Aadhaar or PAN KYC.' },
    { name: 'Investment & Crypto Scam', description: 'Fraudulent crypto presales, fake wallet drainer links, automated trading bots, or forex deposit schemes.' },
    { name: 'Lottery & KBC Reward Scam', description: 'SMS or letters claiming you won 25 Lakhs in KBC or lucky draw, demanding processing tax upfront.' },
    { name: 'Marketplace & OLX Fraud', description: 'Fake army/defense personnel or buyers sending QR codes to pay advance token.' },
    { name: 'Romance & Pig Butchering', description: 'Manipulative online relationships building trust before pitching fake crypto/trading investments.' },
    { name: 'AI Voice Cloning Fraud', description: 'Cloned voice calls mimicking a family member crying or in emergency demanding immediate bail.' },
    { name: 'Identity Theft & Impersonation', description: 'Hacked social media accounts asking friends for urgent money or gift cards.' },
    { name: 'Other Emerging Fraud', description: 'Emerging or unclassified fraudulent activity' },
  ];
  res.json(defaultCategories);
});

// Main AI Trust Intelligence Checker endpoint
app.post('/api/check', async (req, res) => {
  const { type = 'text', query = '', imageBase64, userId } = req.body;

  if (!query && !imageBase64) {
    return res.status(400).json({ error: 'Either text query or screenshot image is required.' });
  }

  const normalized = normalizeTarget(type, query);

  // 1. Fetch real community reports stats for this target from Supabase
  const dbStats = await getTargetReportStats(normalized);

  // 2. Perform AI evaluation if Gemini is available
  let aiResult: any = null;
  if (ai) {
    try {
      const promptText = `You are TrulyTrue, an advanced decision-support Consumer Trust & Fraud Intelligence platform.
Evaluate this input item for active fraud risk signals, scam tactics, and community report patterns.
Type of check: ${type}
Input content: "${query}"
Normalized value: "${normalized}"
Known database community reports count: ${dbStats.totalCount}

CRITICAL INTELLIGENCE & SCAM CATEGORIZATION RULES:
1. NEVER use the words "SAFE", "TRUSTED", "LEGITIMATE", "SCAMMER", or "CRIMINAL".
2. TEXT / MESSAGE / SCREENSHOT EVALUATION:
   When evaluating text messages, SMS snippets, WhatsApp messages, emails, or call scripts, perform a deep content pattern analysis for trending scam tactics in India and globally, including:
   - "Digital Arrest / Coercion": CBI, Police, TRAI, Narcotics video call arrest threats
   - "Electricity Bill Disconnection": Urgent power cut-off threats unless paid to personal number
   - "Part-time Job & Task Fraud": YouTube likes, rating tasks, prepaid Telegram task commission
   - "FedEx / Customs Courier Scam": Seized parcel with drugs/passports demanding clearance fee
   - "Stock Trading & IPO Fraud": Guaranteed 1000% returns, fake trading apps, bogus IPOs
   - "APK Malware & Trojan Download": Direct APK download links, AnyDesk/TeamViewer remote apps
   - "Aadhaar, AEPS & KYC Fraud": Account/SIM freeze threats unless PAN/Aadhaar KYC updated
   - "Lottery & KBC Reward Scam": Won 25 Lakhs in lucky draw, advance processing tax
   - "UPI & Payment Fraud": Reverse payment, scan QR code to receive money, enter UPI PIN
   - "Loan App Extortion": Instant loan disbursement, contact harvesting, blackmail

   If the text contains ANY of these active scam tactics:
   - Return status: "REPORTED_HIGH_RISK" (or "REPORTED")
   - Return riskScore: between 75 and 96 depending on coercion severity
   - Return category: The EXACT matching specific scam category from the list above
   - Return plainEnglishReason: A 1-2 sentence detailed breakdown of the exact scam tactic detected.
   - Return warningSigns: 3 to 4 specific red flag bullet points detailing the tactics.
   - Return recommendedActions: 3 specific protective guidance steps.

3. PLAIN IDENTIFIER EVALUATION (phone, email, upi, url with 0 community reports and no message context):
   If the query is just a plain raw phone number, email, or URL with 0 community reports in our database AND no message text:
   - status: "NOT_REPORTED"
   - riskScore: 0
   - category: "No Community Reports"
   - plainEnglishReason: "No community reports have been found for this identifier in our database."

4. COMMUNITY DATABASE RECORDS:
   If Known database community reports count is 1 or more:
   - Reflect the count in plainEnglishReason: "This identifier has been reported in ${dbStats.totalCount} community report(s) for suspected fraud."
   - status: "REPORTED" (count=1) or "REPORTED_HIGH_RISK" (count>=2)
   - riskScore: Math.min(95, 40 + dbStats.totalCount * 10)

Return a strict structured JSON response with:
- status: "NOT_REPORTED", "REPORTED", or "REPORTED_HIGH_RISK"
- riskScore: integer between 0 and 100
- confidence: number between 0.0 and 1.0 (e.g. 0.95)
- category: Specific scam category name
- plainEnglishReason: A 1-2 sentence decision-support explanation.
- warningSigns: Array of 3 to 4 bullet points.
- recommendedActions: Array of 3 specific advice points.
`;

      let contentsInput: any = promptText;

      if (type === 'screenshot' && imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        contentsInput = {
          parts: [
            { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
            { text: promptText },
          ],
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: contentsInput,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, enum: ['NOT_REPORTED', 'REPORTED', 'REPORTED_HIGH_RISK'] },
              riskScore: { type: Type.INTEGER },
              confidence: { type: Type.NUMBER },
              category: { type: Type.STRING },
              plainEnglishReason: { type: Type.STRING },
              warningSigns: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'status',
              'riskScore',
              'confidence',
              'category',
              'plainEnglishReason',
              'warningSigns',
              'recommendedActions',
            ],
          },
        },
      });

      if (response.text) {
        aiResult = JSON.parse(response.text.trim());
      }
    } catch (err) {
      console.error('Gemini API analysis error in server route:', err);
    }
  }

  // 3. Fallback heuristic intelligence if AI unavailable or overrides needed
  const patternAnalysis = detectScamCategoryFromText(query);

  if (!aiResult) {
    if (patternAnalysis.isMatch) {
      aiResult = {
        status: patternAnalysis.status,
        riskScore: patternAnalysis.riskScore,
        confidence: 0.92,
        category: patternAnalysis.category,
        plainEnglishReason: patternAnalysis.plainEnglishReason,
        warningSigns: patternAnalysis.warningSigns,
        recommendedActions: patternAnalysis.recommendedActions,
      };
    } else if (dbStats.totalCount === 0) {
      aiResult = {
        status: 'NOT_REPORTED',
        riskScore: 0,
        confidence: 0.95,
        category: 'No Community Reports',
        plainEnglishReason: 'No community reports have been found for this identifier in our database.',
        warningSigns: ['No community reports registered for this identifier.'],
        recommendedActions: [
          'If you received a suspicious message from this contact, click "Report Identifier" below to contribute to community trust.',
          'Never share confidential passwords, OTPs, or financial PINs with callers.',
          'Verify official numbers from trusted company websites.',
        ],
      };
    } else {
      const isHighRisk = dbStats.totalCount >= 2;
      const status = isHighRisk ? 'REPORTED_HIGH_RISK' : 'REPORTED';
      const riskScore = Math.min(95, 40 + dbStats.totalCount * 10);

      aiResult = {
        status,
        riskScore,
        confidence: 0.88,
        category: dbStats.topCategories.length > 0 ? dbStats.topCategories[0].category : 'Suspected Fraud',
        plainEnglishReason: `This identifier has been reported in ${dbStats.totalCount} community report(s) for suspected fraud. Exercise caution.`,
        warningSigns: ['Community reports logged for this identifier.'],
        recommendedActions: [
          'Never share OTPs, PINs, or sensitive banking details.',
          'Independently verify sender identity through official channels.',
        ],
      };
    }
  }

  // Enforce pattern analysis override for text/message queries if high-risk pattern detected
  if (patternAnalysis.isMatch && dbStats.totalCount === 0) {
    aiResult.status = patternAnalysis.status;
    aiResult.riskScore = Math.max(aiResult.riskScore, patternAnalysis.riskScore);
    aiResult.category = patternAnalysis.category;
    aiResult.plainEnglishReason = patternAnalysis.plainEnglishReason;
    if (!aiResult.warningSigns || aiResult.warningSigns.length === 0) {
      aiResult.warningSigns = patternAnalysis.warningSigns;
    }
    if (!aiResult.recommendedActions || aiResult.recommendedActions.length === 0) {
      aiResult.recommendedActions = patternAnalysis.recommendedActions;
    }
  } else if (dbStats.totalCount === 0 && !patternAnalysis.isMatch && (type === 'phone' || type === 'email' || type === 'upi' || type === 'url')) {
    aiResult.status = 'NOT_REPORTED';
    aiResult.riskScore = 0;
    aiResult.category = 'No Community Reports';
    aiResult.plainEnglishReason = 'No community reports have been found for this identifier in our database.';
  } else if (dbStats.totalCount === 1) {
    aiResult.status = 'REPORTED';
    aiResult.riskScore = Math.max(aiResult.riskScore, 40);
    aiResult.plainEnglishReason = `This identifier has been reported in 1 community report for suspected fraud. Please exercise caution.`;
  } else if (dbStats.totalCount >= 2) {
    aiResult.status = dbStats.totalCount >= 5 ? 'REPORTED_HIGH_RISK' : 'REPORTED';
    aiResult.riskScore = Math.max(aiResult.riskScore, Math.min(95, 50 + dbStats.totalCount * 8));
    aiResult.plainEnglishReason = `This identifier has been reported in ${dbStats.totalCount} community reports for suspected fraud. Exercise caution and verify through official channels.`;
  }

  const finalStatus = aiResult.status;
  const finalRiskScore = aiResult.riskScore;

  const resultPayload = {
    id: 'TRULY-' + Math.floor(Math.random() * 900000 + 100000),
    type,
    query: query || 'Uploaded Screenshot',
    imageUrl: imageBase64 ? 'uploaded' : undefined,
    status: finalStatus,
    riskScore: finalRiskScore,
    confidence: Math.round((aiResult.confidence || 0.9) * 100),
    category: aiResult.category,
    plainEnglishReason: aiResult.plainEnglishReason,
    warningSigns: aiResult.warningSigns || [],
    recommendedActions: aiResult.recommendedActions || [],
    communityReportCount: dbStats.totalCount,
    verifiedReportCount: dbStats.verifiedCount,
    firstReported: dbStats.firstReported,
    latestReported: dbStats.latestReported,
    topCategories: dbStats.topCategories,
    createdAt: new Date().toISOString(),
    phoneData:
      type === 'phone'
        ? {
            number: query,
            normalized,
            countryCode: 'IN',
            riskStatus: finalStatus,
            riskScore: finalRiskScore,
            communityReportCount: dbStats.totalCount,
            topCategories: dbStats.topCategories,
            firstReported: dbStats.firstReported || 'Not reported yet',
            latestReported: dbStats.latestReported || 'None',
            regions: dbStats.regions,
          }
        : undefined,
  };

  // 4. Save check audit log to Supabase if connected
  if (supabase) {
    try {
      await supabase.from('checks').insert({
        user_id: userId || null,
        input_type: type,
        input_value: query || 'Screenshot',
        normalized_value: normalized,
        result: resultPayload,
        risk_score: finalRiskScore,
        ai_confidence: aiResult.confidence,
        scam_category: aiResult.category,
      });
    } catch (e) {
      console.warn('Could not record check to Supabase:', e);
    }
  }

  return res.json(resultPayload);
});

// Dedicated Phone Intelligence Route
app.get('/api/phone/:number', async (req, res) => {
  const number = req.params.number;
  const normalized = normalizeTarget('phone', number);
  const stats = await getTargetReportStats(normalized);

  const riskScore = stats.totalCount > 10 ? 92 : stats.totalCount > 0 ? 75 : 15;
  const riskStatus = riskScore > 75 ? 'LIKELY_SCAM' : riskScore > 40 ? 'SUSPICIOUS' : 'SAFE';

  res.json({
    number,
    normalized,
    countryCode: 'IN',
    riskStatus,
    riskScore,
    communityReportCount: stats.totalCount,
    verifiedReports: stats.verifiedCount,
    topCategories: stats.topCategories,
    firstReported: stats.firstReported || 'No community reports yet',
    latestReported: stats.latestReported || 'No community reports yet',
    regions: stats.regions,
  });
});

// Dedicated URL Intelligence Route
app.get('/api/url', async (req, res) => {
  const queryUrl = (req.query.query as string) || '';
  const normalized = normalizeTarget('url', queryUrl);
  const domain = extractDomainFromUrl(queryUrl);
  const stats = await getTargetReportStats(normalized);

  const riskScore = stats.totalCount > 5 ? 88 : stats.totalCount > 0 ? 65 : 10;
  const riskLevel = riskScore > 70 ? 'LIKELY_SCAM' : riskScore > 35 ? 'SUSPICIOUS' : 'SAFE';

  res.json({
    url: queryUrl,
    normalized,
    domain,
    riskScore,
    riskLevel,
    communityReportCount: stats.totalCount,
    topCategories: stats.topCategories,
    firstReported: stats.firstReported || 'No community reports yet',
    latestReported: stats.latestReported || 'No community reports yet',
  });
});

// Dedicated Email Intelligence Route
app.get('/api/email', async (req, res) => {
  const queryEmail = (req.query.query as string) || '';
  const normalized = normalizeTarget('email', queryEmail);
  const stats = await getTargetReportStats(normalized);

  const riskScore = stats.totalCount > 5 ? 88 : stats.totalCount > 0 ? 65 : 10;
  const riskLevel = riskScore > 70 ? 'LIKELY_SCAM' : riskScore > 35 ? 'SUSPICIOUS' : 'SAFE';

  res.json({
    email: queryEmail,
    normalized,
    riskScore,
    riskLevel,
    communityReportCount: stats.totalCount,
    topCategories: stats.topCategories,
    firstReported: stats.firstReported || 'No community reports yet',
    latestReported: stats.latestReported || 'No community reports yet',
  });
});

// Dedicated UPI Intelligence Route
app.get('/api/upi', async (req, res) => {
  const queryUpi = (req.query.query as string) || '';
  const normalized = normalizeTarget('upi', queryUpi);
  const stats = await getTargetReportStats(normalized);

  const riskScore = stats.totalCount > 5 ? 90 : stats.totalCount > 0 ? 70 : 10;
  const riskLevel = riskScore > 70 ? 'LIKELY_SCAM' : riskScore > 35 ? 'SUSPICIOUS' : 'SAFE';

  res.json({
    upiId: queryUpi,
    normalized,
    riskScore,
    riskLevel,
    communityReportCount: stats.totalCount,
    topCategories: stats.topCategories,
    firstReported: stats.firstReported || 'No community reports yet',
    latestReported: stats.latestReported || 'No community reports yet',
  });
});

// GET Community Reports
app.get('/api/community', async (req, res) => {
  if (supabase) {
    try {
      const { data: reports, error } = await supabase
        .from('scam_reports')
        .select('*')
        .neq('status', 'removed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && reports) {
        const formatted = reports.map((r) => ({
          id: r.id,
          targetType: r.target_type,
          targetValue: r.target_value,
          category: r.scam_category || 'Uncategorized',
          description: r.description || '',
          status:
            r.status === 'verified'
              ? 'Verified'
              : r.status === 'under_review'
              ? 'Under Review'
              : r.status === 'disputed'
              ? 'Disputed'
              : 'Community Report',
          reportedAt: r.created_at,
          region: {
            country: r.country || 'India',
            state: r.state || '',
            district: r.district || '',
          },
          upvotes: 1,
          hasEvidence: Boolean(r.evidence_url),
        }));
        return res.json(formatted);
      }
    } catch (err) {
      console.warn('Failed to query community reports from Supabase:', err);
    }
  }

  // Fallback to sample reports if DB empty or unconfigured
  res.json(DEMO_COMMUNITY_REPORTS);
});

// GET Geographic Intelligence
app.get('/api/geography', async (req, res) => {
  if (supabase) {
    try {
      const { data: geoData, error } = await supabase
        .from('v_geographic_aggregates')
        .select('*');

      if (!error && geoData && geoData.length > 0) {
        // Group by country
        const countryMap: Record<string, any> = {};
        geoData.forEach((row) => {
          const c = row.country || 'India';
          if (!countryMap[c]) {
            countryMap[c] = {
              country: c,
              code: c === 'India' ? 'IN' : c === 'United States' ? 'US' : 'GB',
              totalReports: 0,
              riskLevel: 'SUSPICIOUS',
              states: [],
              topScams: [],
            };
          }
          countryMap[c].totalReports += Number(row.total_reports || 0);
        });

        return res.json(Object.values(countryMap));
      }
    } catch (err) {
      console.warn('Failed to query geo aggregates from Supabase:', err);
    }
  }

  res.json(DEMO_GEO_INTELLIGENCE);
});

// Alias route for backwards compatibility
app.get('/api/geo', (req, res) => {
  res.redirect('/api/geography');
});

// POST Scam Report Submission
app.post('/api/report', async (req, res) => {
  const {
    targetType,
    targetValue,
    category,
    whatHappened,
    approximateRegion,
    evidenceFileName,
    evidenceUrl,
    userId,
    country = 'India',
    state,
    district,
    city,
  } = req.body;

  if (!targetValue || !whatHappened) {
    return res.status(400).json({ error: 'Target value and description are required.' });
  }

  const normalized = normalizeTarget(targetType, targetValue);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('scam_reports')
        .insert({
          user_id: userId || null,
          target_type: targetType || 'other',
          target_value: targetValue,
          normalized_value: normalized,
          scam_category: category || 'Other',
          description: whatHappened,
          country,
          state: state || approximateRegion || null,
          district: district || null,
          city: city || null,
          evidence_url: evidenceUrl || null,
          status: 'community_report',
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase report insert error:', error);
        return res.status(500).json({ error: 'Failed to save report to database.' });
      }

      return res.json({
        success: true,
        id: data.id,
        message: 'Report submitted successfully to TrulyTrue Community Intelligence.',
        normalized_value: normalized,
      });
    } catch (err) {
      console.error('Error saving report in Supabase:', err);
    }
  }

  // Fallback response if Supabase not configured
  return res.json({
    success: true,
    id: 'REP-' + Math.floor(Math.random() * 9000 + 1000),
    message: 'Report received successfully. Connect Supabase to persist community reports permanently.',
    normalized_value: normalized,
  });
});

// POST "Claim This Identifier" (Dispute / Owner Verification Architecture)
app.post('/api/claim', async (req, res) => {
  const { targetType, targetValue, disputeReason, contactEmail, userId } = req.body;
  if (!targetValue || !disputeReason) {
    return res.status(400).json({ error: 'Target identifier and dispute statement are required.' });
  }

  const normalized = normalizeTarget(targetType || 'phone', targetValue);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('identifier_claims')
        .insert({
          target_type: targetType || 'phone',
          target_value: targetValue,
          normalized_value: normalized,
          claimed_by_user_id: userId || null,
          dispute_reason: disputeReason,
          verification_status: 'PENDING_VERIFICATION'
        })
        .select()
        .single();

      if (!error && data) {
        // Also update scam_reports to record owner_disputed = true without deleting community reports
        await supabase
          .from('scam_reports')
          .update({
            owner_disputed: true,
            owner_response: disputeReason,
            status: 'DISPUTED'
          })
          .eq('normalized_value', normalized);

        return res.json({
          success: true,
          id: data.id,
          message: 'Claim request submitted successfully. The identifier is marked as Disputed / Under Review without removing community reports.'
        });
      }
    } catch (err) {
      console.warn('Supabase claim insert error:', err);
    }
  }

  return res.json({
    success: true,
    id: 'CLM-' + Math.floor(Math.random() * 9000 + 1000),
    message: 'Claim & dispute received. Marked for ownership review.'
  });
});

// POST Account Compromise Declaration (Separate from Scam Reports)
app.post('/api/compromise', async (req, res) => {
  const { targetType, targetValue, compromisedFrom, compromisedUntil, description, userId } = req.body;
  if (!targetValue || !description) {
    return res.status(400).json({ error: 'Target identifier and compromise details are required.' });
  }

  const normalized = normalizeTarget(targetType || 'phone', targetValue);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('account_compromises')
        .insert({
          target_type: targetType || 'phone',
          target_value: targetValue,
          normalized_value: normalized,
          reported_by_owner_id: userId || null,
          compromised_from: compromisedFrom || null,
          compromised_until: compromisedUntil || null,
          description,
          status: 'REPORTED'
        })
        .select()
        .single();

      if (!error && data) {
        // Update scam_reports flag for compromise
        await supabase
          .from('scam_reports')
          .update({
            is_compromised: true,
            compromised_at: compromisedFrom || new Date().toISOString()
          })
          .eq('normalized_value', normalized);

        return res.json({
          success: true,
          id: data.id,
          message: 'Account compromise declaration logged successfully.'
        });
      }
    } catch (err) {
      console.warn('Supabase compromise insert error:', err);
    }
  }

  return res.json({
    success: true,
    id: 'CMP-' + Math.floor(Math.random() * 9000 + 1000),
    message: 'Compromise report logged for ownership timeline audit.'
  });
});

// API-ready LLM analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const { content, type = 'text' } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required for AI analysis' });

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Analyze this content for potential fraud or scam signals:\nType: ${type}\nContent: "${content}"`,
      });
      return res.json({ analysis: response.text });
    } catch (err) {
      console.error('API Analyze error:', err);
    }
  }

  res.json({
    analysis: 'Content contains potential urgency signals. Avoid clicking unverified links or sharing credentials.',
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrulyTrue full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
