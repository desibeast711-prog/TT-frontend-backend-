export type CheckType = 'text' | 'screenshot' | 'url' | 'phone' | 'email' | 'upi' | 'social';

export type RiskStatus = 'SAFE' | 'SUSPICIOUS' | 'LIKELY_SCAM';

export type ScamCategory =
  | 'Bank Fraud'
  | 'UPI Scam'
  | 'Phishing'
  | 'Fake Customer Support'
  | 'Investment Scam'
  | 'Crypto Scam'
  | 'Job Scam'
  | 'Lottery Scam'
  | 'Delivery Scam'
  | 'Romance Scam'
  | 'Identity Theft'
  | 'Impersonation'
  | 'Account Takeover'
  | 'Digital Arrest'
  | 'Malware'
  | 'Refund Scam'
  | 'KYC Scam'
  | 'Loan Scam'
  | 'Marketplace Scam'
  | 'Social Media Scam'
  | 'Urgency & Phishing'
  | 'UPI & Payment Scam'
  | 'Fake Bank Support'
  | 'Investment & Crypto'
  | 'Fake Job Offer'
  | 'E-commerce & Delivery'
  | 'Romance & Impersonation'
  | 'Malicious Link / URL'
  | 'Lottery & Reward Scam'
  | 'Safe Communication'
  | 'Other';

export type CommunityReportStatus = 
  | 'Community Report' 
  | 'Under Review' 
  | 'Verified' 
  | 'Disputed' 
  | 'Removed';

export interface PhoneIntelligenceData {
  number: string;
  countryCode: string;
  riskStatus: RiskStatus;
  riskScore: number;
  communityReportCount: number;
  topCategories: { category: string; count: number }[];
  firstReported: string;
  latestReported: string;
  activityHistory: { date: string; count: number }[];
}

export interface AnalysisResult {
  id: string;
  type: CheckType;
  query: string;
  imageUrl?: string;
  status: RiskStatus;
  riskScore: number;
  confidence: number;
  category: ScamCategory;
  plainEnglishReason: string;
  warningSigns: string[];
  recommendedActions: string[];
  communityReportCount: number;
  createdAt: string;
  phoneData?: PhoneIntelligenceData;
}

export interface CommunityReport {
  id: string;
  targetType: CheckType;
  targetValue: string;
  category: ScamCategory;
  description: string;
  status: CommunityReportStatus;
  reportedAt: string;
  region: {
    country: string;
    state?: string;
    district?: string;
  };
  upvotes: number;
  hasEvidence: boolean;
}

export interface GeoScamData {
  country: string;
  code: string;
  totalReports: number;
  riskLevel: RiskStatus;
  states?: {
    name: string;
    totalReports: number;
    districts?: {
      name: string;
      totalReports: number;
      topScams: { category: string; count: number }[];
    }[];
    topScams: { category: string; count: number }[];
  }[];
  topScams: { category: string; count: number }[];
}

export interface ReportSubmissionPayload {
  targetType: CheckType;
  targetValue: string;
  category: ScamCategory;
  whatHappened: string;
  approximateRegion: string;
  evidenceFileName?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  savedChecksCount: number;
  reportsSubmittedCount: number;
  alertsEnabled: boolean;
}
