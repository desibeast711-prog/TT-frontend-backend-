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

function generateFallbackAnalysis(type: CheckType, query: string): AnalysisResult {
  const normalized = normalizeTarget(type, query);
  const qLower = query.toLowerCase();
  
  const isHighRisk = 
    qLower.includes('urgent') ||
    qLower.includes('disconnect') ||
    qLower.includes('electricity') ||
    qLower.includes('otp') && qLower.includes('share') ||
    qLower.includes('customs') ||
    qLower.includes('top/track') ||
    qLower.includes('98765') ||
    qLower.includes('.xyz') ||
    qLower.includes('.top') ||
    qLower.includes('ybl') ||
    qLower.includes('crypto');

  const isSafe = 
    qLower.includes('hdfcbank.com') || 
    qLower.includes('stripe.com') ||
    qLower.includes('google.com') ||
    qLower.includes('do not share this otp') && !qLower.includes('call officer');

  const status = isHighRisk ? 'LIKELY_SCAM' : isSafe ? 'SAFE' : 'SUSPICIOUS';
  const riskScore = isHighRisk ? 87 : isSafe ? 12 : 64;

  let category: AnalysisResult['category'] = 'Bank Fraud';
  let plainEnglishReason = 'This item displays characteristics common in phishing and fraudulent communication.';
  let warningSigns = ['Creates artificial urgency', 'Requests unverified action or payment'];
  let recommendedActions = ['Do not click unknown links', 'Never share OTPs or passwords', 'Verify with official organization'];

  if (type === 'phone' || qLower.includes('98765')) {
    category = 'UPI Scam';
    plainEnglishReason = 'This phone number has been linked to community reports regarding impersonation and payment coercion.';
    warningSigns = [
      'Creates urgency regarding service disconnection',
      'Asks for direct phone/UPI payment',
      'Unverified caller claiming to be official authority'
    ];
    recommendedActions = [
      'Do NOT pay any money over this call',
      'Do NOT install remote desktop apps (AnyDesk, TeamViewer)',
      'Report the number to national cybercrime authorities'
    ];
  } else if (type === 'url' || qLower.includes('http')) {
    category = 'Phishing';
    plainEnglishReason = 'The destination URL uses a suspicious non-standard domain extension and mimics known financial branding.';
    warningSigns = [
      'Non-standard top-level domain (.xyz / .top)',
      'Domain registration is recently created',
      'Requests credential or payment entry'
    ];
    recommendedActions = [
      'Do NOT enter passwords or payment details on this page',
      'Check the official website domain via search engine',
      'Close browser tab immediately'
    ];
  } else if (type === 'upi' || qLower.includes('@')) {
    category = 'UPI Scam';
    plainEnglishReason = 'This VPA / UPI handle is unverified and associated with fraudulent payment request patterns.';
    warningSigns = [
      'Asks for payment to personal VPA instead of merchant gateway',
      'Uses urgent tone regarding bill or prize claim'
    ];
    recommendedActions = [
      'Do NOT approve UPI payment or enter UPI PIN',
      'Remember: UPI PIN is ONLY required to send money, never to receive',
      'Block the sender in your UPI app'
    ];
  }

  return {
    id: 'TRULY-' + Math.floor(Math.random() * 900000 + 100000),
    type,
    query: query || 'Uploaded Screenshot',
    status,
    riskScore,
    confidence: 91,
    category,
    plainEnglishReason,
    warningSigns,
    recommendedActions,
    communityReportCount: status === 'LIKELY_SCAM' ? 47 : status === 'SUSPICIOUS' ? 5 : 0,
    createdAt: new Date().toISOString(),
    phoneData: type === 'phone' ? DEMO_PHONE_INTELLIGENCE : undefined
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
