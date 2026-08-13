import { AnalysisResult, CommunityReport, GeoScamData, PhoneIntelligenceData, CheckType } from '../types';

export const SAMPLE_PRESETS: Record<CheckType, { label: string; value: string; type: CheckType; isDemoScam?: boolean }[]> = {
  text: [
    {
      label: 'Urgent Electricity cutoff',
      value: 'URGENT: Your electricity connection will be disconnected tonight at 9:30 PM due to unpaid bill of Rs 4,820. Call Electricity Officer immediately at 9876543210 to avoid disconnection.',
      type: 'text',
      isDemoScam: true,
    },
    {
      label: 'Package Delivery Notice',
      value: 'Your courier package #IN-88912 is on hold due to missing house address. Please verify your address and pay re-delivery fee of Rs 25 at http://speedpost-customs-verify.top/track',
      type: 'text',
      isDemoScam: true,
    },
    {
      label: 'Genuine OTP Message',
      value: 'Your login OTP for HDFC NetBanking is 492018. Valid for 10 mins. Do NOT share this OTP with anyone, including bank staff.',
      type: 'text',
      isDemoScam: false,
    },
  ],
  screenshot: [
    {
      label: 'Fake Bank Alert Screenshot',
      value: 'Screenshot showing account suspension alert asking to download APK file.',
      type: 'screenshot',
      isDemoScam: true,
    },
    {
      label: 'Fake Payment Receipt',
      value: 'Screenshot of a fake Paytm payment receipt with fake transaction ID.',
      type: 'screenshot',
      isDemoScam: true,
    },
  ],
  url: [
    {
      label: 'Phishing Bank URL',
      value: 'http://hdfc-bank-security-update-kyc.xyz/login',
      type: 'url',
      isDemoScam: true,
    },
    {
      label: 'Fake E-commerce Store',
      value: 'https://iphone15-flash-sale-90off.shop',
      type: 'url',
      isDemoScam: true,
    },
    {
      label: 'Genuine Bank URL',
      value: 'https://www.hdfcbank.com',
      type: 'url',
      isDemoScam: false,
    },
  ],
  phone: [
    {
      label: 'Reported Scam Number',
      value: '+91 98765 43210',
      type: 'phone',
      isDemoScam: true,
    },
    {
      label: 'Fake Telecom Customer Care',
      value: '+91 88001 12233',
      type: 'phone',
      isDemoScam: true,
    },
    {
      label: 'Official Emergency Hotline',
      value: '+91 1800 11 4000',
      type: 'phone',
      isDemoScam: false,
    },
  ],
  email: [
    {
      label: 'Fake Support Email',
      value: 'support@hdfc-security-verify-online.net',
      type: 'email',
      isDemoScam: true,
    },
    {
      label: 'Fake Job Offer',
      value: 'hr-recruitment@google-careers-india.org',
      type: 'email',
      isDemoScam: true,
    },
    {
      label: 'Genuine Company Email',
      value: 'support@stripe.com',
      type: 'email',
      isDemoScam: false,
    },
  ],
  upi: [
    {
      label: 'Fake Utility Collector VPA',
      value: 'electricity-bill-pay@ybl',
      type: 'upi',
      isDemoScam: true,
    },
    {
      label: 'Fake Lottery Claim UPI',
      value: 'kbc-prize-tax@paytm',
      type: 'upi',
      isDemoScam: true,
    },
  ],
  social: [
    {
      label: 'Instagram Trading Bot DM',
      value: 'Hey bro! I turned $500 into $15,000 in 2 days using crypto AI trading bot. Message @crypto_guru_truly on Telegram to get started!',
      type: 'social',
      isDemoScam: true,
    },
    {
      label: 'WhatsApp Part-Time Job Scam',
      value: 'Earn Rs 5000/day by liking YouTube videos from home! No experience required. Telegram handle: @parttime_hr_jobs',
      type: 'social',
      isDemoScam: true,
    },
  ],
};

export const DEMO_PHONE_INTELLIGENCE: PhoneIntelligenceData = {
  number: '+91 98765 43210',
  countryCode: 'IN',
  riskStatus: 'LIKELY_SCAM',
  riskScore: 89,
  communityReportCount: 47,
  topCategories: [
    { category: 'UPI & Payment Scam', count: 24 },
    { category: 'Fake Bank Support', count: 15 },
    { category: 'Investment Scam', count: 8 },
  ],
  firstReported: '2026-01-14',
  latestReported: '2026-08-12',
  activityHistory: [
    { date: 'Mar 2026', count: 4 },
    { date: 'Apr 2026', count: 8 },
    { date: 'May 2026', count: 12 },
    { date: 'Jun 2026', count: 11 },
    { date: 'Jul 2026', count: 7 },
    { date: 'Aug 2026', count: 5 },
  ],
};

export const DEMO_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'REP-1092',
    targetType: 'phone',
    targetValue: '+91 98765 43210',
    category: 'UPI & Payment Scam',
    description: 'Caller impersonated electricity department officer demanding immediate UPI payment to avoid disconnection within 30 minutes.',
    status: 'Verified',
    reportedAt: '2026-08-12T14:22:00Z',
    region: { country: 'India', state: 'Bihar', district: 'Patna' },
    upvotes: 84,
    hasEvidence: true,
  },
  {
    id: 'REP-1091',
    targetType: 'url',
    targetValue: 'http://speedpost-customs-verify.top',
    category: 'Malicious Link / URL',
    description: 'SMS claimed courier package was retained at customs. Link leads to phishing page capturing credit card CVV and OTP.',
    status: 'Verified',
    reportedAt: '2026-08-12T11:05:00Z',
    region: { country: 'India', state: 'Maharashtra', district: 'Mumbai' },
    upvotes: 62,
    hasEvidence: true,
  },
  {
    id: 'REP-1090',
    targetType: 'upi',
    targetValue: 'electricity-bill-pay@ybl',
    category: 'UPI & Payment Scam',
    description: 'Fake VPA used by scammers sending reverse payment requests claiming to refund accidental money transfers.',
    status: 'Community Report',
    reportedAt: '2026-08-11T19:40:00Z',
    region: { country: 'India', state: 'Delhi', district: 'South Delhi' },
    upvotes: 29,
    hasEvidence: false,
  },
  {
    id: 'REP-1089',
    targetType: 'email',
    targetValue: 'support@hdfc-security-verify-online.net',
    category: 'Fake Bank Support',
    description: 'Phishing email threatening account freeze unless pan-card re-verification is completed on spoofed domain.',
    status: 'Under Review',
    reportedAt: '2026-08-11T09:15:00Z',
    region: { country: 'India', state: 'Karnataka', district: 'Bengaluru' },
    upvotes: 18,
    hasEvidence: true,
  },
  {
    id: 'REP-1088',
    targetType: 'social',
    targetValue: '@crypto_guru_truly',
    category: 'Investment & Crypto',
    description: 'Telegram account asking users to deposit USDT into unverified pool promising 300% return in 24 hours.',
    status: 'Disputed',
    reportedAt: '2026-08-10T16:30:00Z',
    region: { country: 'United States', state: 'California', district: 'Los Angeles' },
    upvotes: 12,
    hasEvidence: true,
  },
  {
    id: 'REP-1087',
    targetType: 'text',
    targetValue: 'Claim your $1000 Amazon Gift Card at amazon-claim-now.club',
    category: 'Lottery & Reward Scam',
    description: 'Mass SMS message sent to thousands with malicious tracking link.',
    status: 'Verified',
    reportedAt: '2026-08-09T08:12:00Z',
    region: { country: 'United Kingdom', state: 'England', district: 'London' },
    upvotes: 95,
    hasEvidence: true,
  },
];

export const DEMO_GEO_INTELLIGENCE: GeoScamData[] = [
  {
    country: 'India',
    code: 'IN',
    totalReports: 14280,
    riskLevel: 'SUSPICIOUS',
    topScams: [
      { category: 'UPI & Payment Scam', count: 5410 },
      { category: 'Fake Bank Support', count: 3200 },
      { category: 'Urgency & Phishing', count: 2890 },
      { category: 'Fake Job Offer', count: 1820 },
    ],
    states: [
      {
        name: 'Bihar',
        totalReports: 1840,
        topScams: [
          { category: 'UPI Scam', count: 720 },
          { category: 'Electricity Bill Scam', count: 480 },
          { category: 'Fake Bank Support', count: 390 },
        ],
        districts: [
          {
            name: 'Patna',
            totalReports: 420,
            topScams: [
              { category: 'UPI Scam', count: 180 },
              { category: 'Fake Bank Support', count: 140 },
              { category: 'Investment Scam', count: 100 },
            ],
          },
          {
            name: 'Gaya',
            totalReports: 280,
            topScams: [
              { category: 'Electricity Bill Scam', count: 120 },
              { category: 'UPI Scam', count: 95 },
            ],
          },
        ],
      },
      {
        name: 'Maharashtra',
        totalReports: 2950,
        topScams: [
          { category: 'Investment & Crypto', count: 1100 },
          { category: 'Fake Job Offer', count: 850 },
          { category: 'Malicious Link / URL', count: 620 },
        ],
        districts: [
          {
            name: 'Mumbai',
            totalReports: 1180,
            topScams: [
              { category: 'Investment Scam', count: 510 },
              { category: 'Fake Job Offer', count: 380 },
            ],
          },
          {
            name: 'Pune',
            totalReports: 740,
            topScams: [
              { category: 'Courier Scam', count: 290 },
              { category: 'UPI Scam', count: 220 },
            ],
          },
        ],
      },
      {
        name: 'Delhi NCR',
        totalReports: 2410,
        topScams: [
          { category: 'Fake Customer Care', count: 890 },
          { category: 'KYC Verification Scam', count: 740 },
          { category: 'E-commerce Refund', count: 510 },
        ],
      },
      {
        name: 'Karnataka',
        totalReports: 2180,
        topScams: [
          { category: 'Fake Job Offer', count: 910 },
          { category: 'Rental Property Scam', count: 580 },
        ],
      },
    ],
  },
  {
    country: 'United States',
    code: 'US',
    totalReports: 28900,
    riskLevel: 'SUSPICIOUS',
    topScams: [
      { category: 'IRS / Tax Impersonation', count: 8900 },
      { category: 'Package Delivery Phishing', count: 7400 },
      { category: 'Crypto Recovery Fraud', count: 5800 },
      { category: 'Romance Scam', count: 3200 },
    ],
    states: [
      {
        name: 'California',
        totalReports: 6200,
        topScams: [
          { category: 'Crypto Recovery', count: 2100 },
          { category: 'Tech Support Scam', count: 1800 },
        ],
      },
      {
        name: 'Texas',
        totalReports: 4500,
        topScams: [
          { category: 'Package Delivery Phishing', count: 1600 },
          { category: 'Bank Impersonation', count: 1200 },
        ],
      },
    ],
  },
  {
    country: 'United Kingdom',
    code: 'GB',
    totalReports: 12400,
    riskLevel: 'SUSPICIOUS',
    topScams: [
      { category: 'HMRC Tax Scam', count: 4100 },
      { category: 'Royal Mail Delivery Fraud', count: 3800 },
      { category: 'Authorized Push Payment', count: 2900 },
    ],
  },
];
