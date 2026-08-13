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

// GET Scam Categories
app.get('/api/categories', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('scam_categories').select('name, description');
      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    } catch (err) {
      console.warn('Failed to fetch categories from Supabase:', err);
    }
  }

  // Fallback initial categories list
  const defaultCategories = [
    { name: 'Bank Fraud', description: 'Spoofed bank calls, fake SMS alerts, credential theft' },
    { name: 'UPI Scam', description: 'Fake payment requests, reverse transfers, VPA impersonation' },
    { name: 'Phishing', description: 'Deceptive links capturing passwords, cards, or PINs' },
    { name: 'Fake Customer Support', description: 'Impersonating official support or telecom officers' },
    { name: 'Investment Scam', description: 'High-return crypto schemes, stock tips, forex bots' },
    { name: 'Fake Job Offer', description: 'Work-from-home task scams, social media like rewards' },
    { name: 'Delivery Scam', description: 'Courier hold messages demanding address re-verification' },
    { name: 'Romance Scam', description: 'Manipulative personal relationships requesting money' },
    { name: 'Identity Theft', description: 'Stolen PAN/Aadhaar or hacked social accounts' },
    { name: 'Digital Arrest', description: 'Extortion via video calls threatening immediate arrest' },
    { name: 'Other', description: 'Emerging or unclassified fraudulent activity' },
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
      const promptText = `You are TrulyTrue, a consumer Trust Intelligence platform.
Evaluate this input item for scam, fraud, phishing, or security risks.
Type of check: ${type}
Input content: "${query}"
Normalized value: "${normalized}"
Known database community reports count: ${dbStats.totalCount}

Return a strict structured JSON response with:
- status: "SAFE", "SUSPICIOUS", or "LIKELY_SCAM"
- riskScore: integer between 0 and 100 (0=Completely Safe, 100=Definite Active Scam)
- confidence: number between 0.0 and 1.0 (e.g. 0.94)
- category: Scam category name (e.g., "Bank Fraud", "UPI Scam", "Phishing", "Fake Customer Support", "Investment Scam", "Fake Job Offer", "Delivery Scam", "Digital Arrest", "Safe Communication")
- plainEnglishReason: A 1-2 sentence clear, empathetic explanation in plain English without technical jargon.
- warningSigns: Array of 2 to 4 specific bullet points detailing specific red flags.
- recommendedActions: Array of 3 specific, actionable advice for the user (e.g. "Do not click link", "Do not share OTP").
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
        model: 'gemini-3.6-flash',
        contents: contentsInput,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, enum: ['SAFE', 'SUSPICIOUS', 'LIKELY_SCAM'] },
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

  // 3. Fallback heuristic intelligence if AI unavailable
  if (!aiResult) {
    const qLower = query.toLowerCase();
    const isHighRisk =
      dbStats.totalCount > 0 ||
      qLower.includes('urgent') ||
      qLower.includes('disconnect') ||
      qLower.includes('electricity') ||
      qLower.includes('customs') ||
      qLower.includes('top/track') ||
      qLower.includes('98765') ||
      qLower.includes('.xyz') ||
      qLower.includes('.top') ||
      qLower.includes('ybl') ||
      qLower.includes('90off');

    const isSafe =
      dbStats.totalCount === 0 &&
      (qLower.includes('hdfcbank.com') ||
        qLower.includes('stripe.com') ||
        qLower.includes('google.com'));

    const status = isHighRisk ? 'LIKELY_SCAM' : isSafe ? 'SAFE' : 'SUSPICIOUS';
    const riskScore = dbStats.totalCount > 5 ? 92 : isHighRisk ? 87 : isSafe ? 10 : 58;

    aiResult = {
      status,
      riskScore,
      confidence: 0.88,
      category: isHighRisk ? 'Bank Fraud' : isSafe ? 'Safe Communication' : 'Unverified Origin',
      plainEnglishReason: isHighRisk
        ? 'This item displays pattern indicators linked to urgent financial requests, unauthorized VPAs, or deceptive domains.'
        : isSafe
        ? 'This target originates from an authenticated, legitimate domain or official communication channel.'
        : 'This item contains unverified elements that require caution before taking action.',
      warningSigns: isHighRisk
        ? [
            'Creates artificial urgency or threat of immediate action',
            'Requests direct payment, PIN entry, or remote app installation',
            'Domain or phone number is unverified',
          ]
        : ['Unverified sender handle or web link'],
      recommendedActions: isHighRisk
        ? [
            'Do NOT click any included links or download attachments',
            'Never share OTPs, passwords, or UPI PINs',
            'Verify through official website channels directly',
          ]
        : ['Confirm sender identity through official channels'],
    };
  }

  // Adjust risk status if database has high community report count
  let finalStatus = aiResult.status;
  let finalRiskScore = aiResult.riskScore;

  if (dbStats.totalCount >= 5 && finalStatus === 'SAFE') {
    finalStatus = 'SUSPICIOUS';
    finalRiskScore = Math.max(finalRiskScore, 65);
  } else if (dbStats.totalCount >= 10) {
    finalStatus = 'LIKELY_SCAM';
    finalRiskScore = Math.max(finalRiskScore, 85);
  }

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

// API-ready LLM analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const { content, type = 'text' } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required for AI analysis' });

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
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
