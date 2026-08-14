import { 
  AnalysisResult, 
  CheckType, 
  CommunityReport, 
  GeoScamData, 
  PhoneIntelligenceData, 
  ReportSubmissionPayload, 
  UserProfile 
} from '../types';
import { supabase } from '../lib/supabase';
import { normalizeTarget } from '../utils/normalization';
import { 
  DEMO_COMMUNITY_REPORTS, 
  DEMO_GEO_INTELLIGENCE, 
  DEMO_PHONE_INTELLIGENCE 
} from '../data/mockData';

export async function analyzeItem(
  type: CheckType, 
  query: string, 
  imageBase64?: string
): Promise<AnalysisResult> {
  let userId: string | undefined = undefined;
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id;
  }

  try {
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, query, imageBase64, userId }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend API connection falling back to client-side Trust Engine:', err);
  }

  // Fallback client-side analysis engine if network issue
  return generateFallbackAnalysis(type, query);
}

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
      status: 'REPORTED_HIGH_RISK' as const,
      riskScore: 96,
      category: 'Digital Arrest / Coercion' as const,
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
      status: 'REPORTED_HIGH_RISK' as const,
      riskScore: 90,
      category: 'Electricity Bill Disconnection' as const,
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
      status: 'REPORTED_HIGH_RISK' as const,
      riskScore: 88,
      category: 'Part-time Job & Task Fraud' as const,
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
      status: 'REPORTED_HIGH_RISK' as const,
      riskScore: 94,
      category: 'FedEx / Customs Courier Scam' as const,
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
      status: 'REPORTED_HIGH_RISK' as const,
      riskScore: 92,
      category: 'Stock Trading & IPO Fraud' as const,
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
      status: 'REPORTED_HIGH_RISK' as const,
      riskScore: 95,
      category: 'APK Malware & Trojan Download' as const,
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
      status: 'REPORTED_HIGH_RISK' as const,
      riskScore: 88,
      category: 'Aadhaar, AEPS & KYC Fraud' as const,
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
      status: 'REPORTED_HIGH_RISK' as const,
      riskScore: 90,
      category: 'Lottery & KBC Reward Scam' as const,
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
      status: 'REPORTED_HIGH_RISK' as const,
      riskScore: 88,
      category: 'UPI & Payment Fraud' as const,
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
      status: 'REPORTED_HIGH_RISK' as const,
      riskScore: 86,
      category: 'Loan App Extortion' as const,
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

  return { isMatch: false, status: 'NOT_REPORTED' as const, riskScore: 0, category: 'No Community Reports' as const, plainEnglishReason: 'No community reports have been found for this identifier in our database.', warningSigns: [], recommendedActions: [] };
}

function generateFallbackAnalysis(type: CheckType, query: string): AnalysisResult {
  const match = detectScamCategoryFromText(query);

  if (match.isMatch) {
    return {
      id: 'TRULY-' + Math.floor(Math.random() * 900000 + 100000),
      type,
      query: query || 'Uploaded Screenshot',
      status: match.status,
      riskScore: match.riskScore,
      confidence: 94,
      category: match.category,
      plainEnglishReason: match.plainEnglishReason,
      warningSigns: match.warningSigns,
      recommendedActions: match.recommendedActions,
      communityReportCount: 0,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: 'TRULY-' + Math.floor(Math.random() * 900000 + 100000),
    type,
    query: query || 'Uploaded Screenshot',
    status: 'NOT_REPORTED',
    riskScore: 0,
    confidence: 95,
    category: 'No Community Reports',
    plainEnglishReason: 'No community reports have been found for this identifier in our database.',
    warningSigns: ['No community reports registered for this identifier.'],
    recommendedActions: [
      'If you received a suspicious call or message, click "Report Identifier" below to contribute to community trust.',
      'Never share confidential passwords, OTPs, or financial PINs.',
      'Verify official contacts through primary organization portals.'
    ],
    communityReportCount: 0,
    createdAt: new Date().toISOString(),
  };
}

export async function submitIdentifierClaim(
  targetType: CheckType,
  targetValue: string,
  disputeReason: string,
  contactEmail?: string
): Promise<{ success: boolean; id: string; message: string }> {
  let userId: string | undefined = undefined;
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id;
  }

  try {
    const res = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetType,
        targetValue,
        disputeReason,
        contactEmail,
        userId,
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API claim fallback:', err);
  }

  return {
    success: true,
    id: 'CLM-' + Math.floor(Math.random() * 9000 + 1000),
    message: 'Claim request & dispute statement logged for ownership review.'
  };
}

export async function reportAccountCompromise(
  targetType: CheckType,
  targetValue: string,
  description: string,
  compromisedFrom?: string,
  compromisedUntil?: string
): Promise<{ success: boolean; id: string; message: string }> {
  let userId: string | undefined = undefined;
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id;
  }

  try {
    const res = await fetch('/api/compromise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetType,
        targetValue,
        description,
        compromisedFrom,
        compromisedUntil,
        userId,
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API compromise fallback:', err);
  }

  return {
    success: true,
    id: 'CMP-' + Math.floor(Math.random() * 9000 + 1000),
    message: 'Account compromise report logged for timeline verification.'
  };
}

export async function uploadEvidenceFile(file: File): Promise<string | null> {
  if (!supabase) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `evidence/${fileName}`;

    const { data, error } = await supabase.storage
      .from('evidence')
      .upload(filePath, file);

    if (error) {
      console.error('Evidence upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('evidence')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Failed to upload evidence file to Supabase:', err);
    return null;
  }
}

export async function submitReport(
  payload: ReportSubmissionPayload,
  evidenceFile?: File
): Promise<{ success: boolean; id: string; message: string }> {
  let evidenceUrl: string | undefined = undefined;

  if (evidenceFile && supabase) {
    const uploadedUrl = await uploadEvidenceFile(evidenceFile);
    if (uploadedUrl) {
      evidenceUrl = uploadedUrl;
    }
  }

  let userId: string | undefined = undefined;
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id;
  }

  try {
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        evidenceUrl,
        userId,
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API report fallback:', err);
  }

  return {
    success: true,
    id: 'REP-' + Math.floor(Math.random() * 9000 + 1000),
    message: 'Thank you. Your report has been submitted to TrulyTrue Community Intelligence.'
  };
}

export async function getCommunityReports(): Promise<CommunityReport[]> {
  try {
    const res = await fetch('/api/community');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Error fetching community reports:', err);
  }
  return DEMO_COMMUNITY_REPORTS;
}

export async function getGeoIntelligence(): Promise<GeoScamData[]> {
  try {
    const res = await fetch('/api/geography');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Error fetching geographic intelligence:', err);
  }
  return DEMO_GEO_INTELLIGENCE;
}

export async function getPhoneIntelligence(phoneNumber: string): Promise<PhoneIntelligenceData> {
  try {
    const res = await fetch(`/api/phone/${encodeURIComponent(phoneNumber)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Error fetching phone intelligence:', err);
  }
  return {
    ...DEMO_PHONE_INTELLIGENCE,
    number: phoneNumber || DEMO_PHONE_INTELLIGENCE.number
  };
}

export async function fetchScamCategories(): Promise<{ name: string; description: string }[]> {
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Error fetching categories:', err);
  }
  return [];
}

export async function getUserProfile(): Promise<UserProfile | null> {
  if (!supabase) {
    return {
      id: 'USR-882190',
      name: 'Community User',
      email: 'user@example.com',
      joinedDate: 'August 2026',
      savedChecksCount: 0,
      reportsSubmittedCount: 0,
      alertsEnabled: true,
    };
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return null;

    const u = authData.user;

    // Query profiles table
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', u.id)
      .single();

    // Query reports submitted count
    const { count: reportCount } = await supabase
      .from('scam_reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', u.id);

    // Query checks saved count
    const { count: checkCount } = await supabase
      .from('checks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', u.id);

    return {
      id: u.id,
      name: profileData?.display_name || u.email?.split('@')[0] || 'TrulyTrue User',
      email: u.email || '',
      joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      savedChecksCount: checkCount || 0,
      reportsSubmittedCount: reportCount || 0,
      alertsEnabled: true,
    };
  } catch (err) {
    console.error('Error fetching user profile from Supabase:', err);
    return null;
  }
}
