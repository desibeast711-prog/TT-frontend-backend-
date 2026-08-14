import React, { useState } from 'react';
import { AnalysisResult, ScamCategory } from '../types';
import { PhoneIntelligence } from './PhoneIntelligence';
import { submitReport, submitIdentifierClaim } from '../services/api';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Share2, 
  Flag, 
  RefreshCw, 
  Copy, 
  Check, 
  HelpCircle,
  Users,
  Send,
  Loader2,
  CheckCircle2,
  ShieldQuestion,
  UserCheck
} from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult;
  onReset?: () => void;
  onReportClick?: (targetValue: string, targetType: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset, onReportClick }) => {
  const [copied, setCopied] = useState(false);
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  
  // Local report states for instant live update after user reports
  const [reportCount, setReportCount] = useState(result.communityReportCount || 0);
  const [activeStatus, setActiveStatus] = useState(
    result.communityReportCount === 0 && (result.status === 'SAFE' as any || result.status === 'NOT_REPORTED') 
      ? 'NOT_REPORTED' 
      : result.status
  );
  const [activeRiskScore, setActiveRiskScore] = useState(
    result.communityReportCount === 0 ? 0 : result.riskScore
  );
  
  // Quick Report Form Inputs
  const [reportCategory, setReportCategory] = useState<ScamCategory>('UPI Scam' as ScamCategory);
  const [reportDescription, setReportDescription] = useState('');
  const [reportRegion, setReportRegion] = useState('India - Bihar - Patna');
  const [reportDate, setReportDate] = useState('');
  const [reportTxDetails, setReportTxDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  // Claim Form Inputs
  const [claimReason, setClaimReason] = useState('');
  const [claimEmail, setClaimEmail] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);

  const statusConfig = {
    NOT_REPORTED: {
      label: 'NOT REPORTED',
      bgClass: 'bg-slate-500',
      textClass: 'text-slate-800',
      bgLightClass: 'bg-slate-50 border-slate-200',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: <ShieldQuestion className="w-8 h-8 text-slate-600" />,
      colorHex: '#64748B',
    },
    SAFE: {
      label: reportCount > 0 ? 'REPORTED' : 'NOT REPORTED',
      bgClass: reportCount > 0 ? 'bg-amber-500' : 'bg-slate-500',
      textClass: reportCount > 0 ? 'text-amber-800' : 'text-slate-800',
      bgLightClass: reportCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200',
      badgeClass: reportCount > 0 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-800 border-slate-300',
      icon: reportCount > 0 ? <AlertTriangle className="w-8 h-8 text-amber-600" /> : <ShieldQuestion className="w-8 h-8 text-slate-600" />,
      colorHex: reportCount > 0 ? '#F59E0B' : '#64748B',
    },
    REPORTED: {
      label: 'REPORTED',
      bgClass: 'bg-amber-500',
      textClass: 'text-amber-800',
      bgLightClass: 'bg-amber-50 border-amber-200',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
      colorHex: '#F59E0B',
    },
    REPORTED_HIGH_RISK: {
      label: 'MULTIPLE COMMUNITY REPORTS',
      bgClass: 'bg-orange-600',
      textClass: 'text-orange-900',
      bgLightClass: 'bg-orange-50 border-orange-200',
      badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
      icon: <ShieldAlert className="w-8 h-8 text-orange-600" />,
      colorHex: '#EA580C',
    },
    SUSPICIOUS: {
      label: 'REPORTED',
      bgClass: 'bg-amber-500',
      textClass: 'text-amber-800',
      bgLightClass: 'bg-amber-50 border-amber-200',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
      colorHex: '#F59E0B',
    },
    LIKELY_SCAM: {
      label: 'MULTIPLE COMMUNITY REPORTS',
      bgClass: 'bg-orange-600',
      textClass: 'text-orange-900',
      bgLightClass: 'bg-orange-50 border-orange-200',
      badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
      icon: <ShieldAlert className="w-8 h-8 text-orange-600" />,
      colorHex: '#EA580C',
    },
  };

  const currentStatus = (statusConfig as any)[activeStatus] || statusConfig.NOT_REPORTED;

  const handleCopyResult = () => {
    const textToCopy = `TrulyTrue Decision Support Check: [${currentStatus.label}] Reports Count: ${reportCount}\nIdentifier: ${result.query}\nCheck community records at trulytrue.org`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleQuickReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportError(null);

    if (!reportDescription.trim()) {
      setReportError('Please write a short description of what happened or why you are reporting this identifier.');
      return;
    }

    setIsSubmittingReport(true);
    try {
      await submitReport({
        targetType: result.type,
        targetValue: result.query,
        category: reportCategory,
        whatHappened: reportDescription.trim(),
        approximateRegion: reportRegion,
        incidentDate: reportDate,
        transactionDetails: reportTxDetails,
      });

      const newCount = reportCount + 1;
      setReportCount(newCount);
      setActiveStatus('REPORTED');
      setActiveRiskScore(Math.max(activeRiskScore, 40));
      setReportSuccessMsg(`Report successfully logged into database! This identifier now reflects ${newCount} community report(s).`);
      setReportDescription('');
    } catch (err) {
      setReportError('Failed to save report to database. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimReason.trim()) return;

    setIsSubmittingClaim(true);
    try {
      await submitIdentifierClaim(result.type, result.query, claimReason.trim(), claimEmail);
      setClaimSuccessMsg('Ownership claim and dispute statement registered. This identifier has been marked as Disputed without removing community history.');
      setClaimReason('');
    } catch (err) {
      console.error('Claim error:', err);
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-300 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Top Header Strip with Status & Score */}
      <div className={`p-6 sm:p-10 border-b ${currentStatus.bgLightClass}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <div className={`p-3 sm:p-4 rounded-2xl bg-white shadow-xs border border-neutral-200`}>
              {currentStatus.icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <span className={`text-2xl sm:text-3xl font-black tracking-tight ${currentStatus.textClass}`}>
                  {currentStatus.label}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider bg-black text-white px-3 py-1 rounded-full">
                  {reportCount === 0 ? '0 Community Reports' : result.category}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-neutral-600">
                Decision Support ID: {result.id} • Community Signal Confidence: {result.confidence}%
              </p>
            </div>
          </div>

          {/* Report Meter */}
          <div className="flex items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs min-w-[220px]">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#E5E5E5"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke={currentStatus.colorHex}
                  strokeWidth="6"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * (reportCount > 0 ? Math.min(100, reportCount * 20) : 0)) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute font-black text-base text-black">
                {reportCount}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Community Reports
              </span>
              <span className="text-sm font-bold text-black">
                {reportCount} Logged Signal{reportCount === 1 ? '' : 's'}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                {reportCount === 0 ? 'No Community Reports' : 'Exercise Caution'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-10 space-y-8">
        {/* Community Database Report Indicator Badge */}
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          reportCount === 0
            ? 'bg-slate-50 border-slate-200 text-slate-900'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center gap-3">
            <Users className={`w-6 h-6 shrink-0 ${reportCount === 0 ? 'text-slate-600' : 'text-amber-600'}`} />
            <div>
              <p className="font-extrabold text-sm sm:text-base">
                {reportCount === 0 
                  ? 'NO COMMUNITY REPORTS FOUND IN DATABASE' 
                  : `REPORTED ${reportCount} TIME${reportCount > 1 ? 'S' : ''} FOR SUSPECTED FRAUD`}
              </p>
              <p className="text-xs text-neutral-600 font-medium mt-0.5">
                {reportCount === 0 
                  ? 'No community reports have been found for this identifier in our database.' 
                  : `This identifier has been reported in ${reportCount} community submission(s). Exercise caution and verify independently.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowQuickReport(!showQuickReport)}
              className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              <span>{showQuickReport ? 'Close Form' : 'Report This Identifier'}</span>
            </button>

            <button
              onClick={() => setShowClaimModal(!showClaimModal)}
              className="bg-white hover:bg-neutral-100 text-black border border-neutral-300 text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              title="Claim ownership or submit dispute statement"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Claim / Dispute</span>
            </button>
          </div>
        </div>

        {/* Quick Report Drawer Form */}
        {showQuickReport && (
          <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 space-y-5 border border-neutral-800 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-500" />
                <span>REPORT THIS IDENTIFIER TO COMMUNITY DATABASE</span>
              </h4>
              <span className="text-xs font-mono text-neutral-400">Target: {result.query}</span>
            </div>

            {reportSuccessMsg && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{reportSuccessMsg}</span>
              </div>
            )}

            {reportError && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs font-bold">
                {reportError}
              </div>
            )}

            <form onSubmit={handleQuickReportSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                    Report Category
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as ScamCategory)}
                    className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <option value="UPI Scam">UPI Scam / Fake Payment</option>
                    <option value="Bank Fraud">Bank Fraud / Spoofed Caller</option>
                    <option value="Phishing">Phishing Link / Credential Theft</option>
                    <option value="Fake Customer Support">Fake Customer Support / Telecom</option>
                    <option value="Digital Arrest">Digital Arrest / Coercion</option>
                    <option value="Investment Scam">Investment / Crypto Scam</option>
                    <option value="Job Scam">Fake Job Offer / Work from Home</option>
                    <option value="Delivery Scam">Courier / Package Delivery Scam</option>
                    <option value="Other">Other Reported Activity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                    Region / District
                  </label>
                  <input
                    type="text"
                    value={reportRegion}
                    onChange={(e) => setReportRegion(e.target.value)}
                    placeholder="e.g. India - Bihar - Patna"
                    className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-xs font-semibold placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                  What Happened? (Description)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the incident objectively: how contact was made, requested funds or unverified links..."
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl p-3 text-xs font-medium placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickReport(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-6 py-2 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 disabled:bg-neutral-600 transition-colors"
                >
                  {isSubmittingReport ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>SAVING TO DATABASE...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>SUBMIT REPORT TO SUPABASE</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Claim / Dispute Drawer */}
        {showClaimModal && (
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-400" />
                <span>CLAIM THIS IDENTIFIER / SUBMIT DISPUTE STATEMENT</span>
              </h4>
              <span className="text-xs font-mono text-slate-400">{result.query}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you the legitimate owner of this phone number or account? You can submit an official dispute or owner verification statement. Submitting a claim does not delete community history, but logs your official response for community transparency.
            </p>

            {claimSuccessMsg && (
              <div className="bg-blue-500/20 border border-blue-500/40 text-blue-300 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                <span>{claimSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Dispute Statement & Verification Context
                </label>
                <textarea
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  rows={3}
                  placeholder="Provide context regarding ownership or account compromise..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-xs font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Contact Email (Optional for Verification)
                </label>
                <input
                  type="email"
                  value={claimEmail}
                  onChange={(e) => setClaimEmail(e.target.value)}
                  placeholder="owner@domain.com"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClaim}
                  className="px-6 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 disabled:bg-slate-700 transition-colors"
                >
                  {isSubmittingClaim ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                  <span>SUBMIT DISPUTE & CLAIM</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Analyzed Query Box */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-6">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
            Checked Identifier ({result.type.toUpperCase()})
          </span>
          <p className="text-base sm:text-lg font-mono font-medium text-black break-words">
            "{result.query}"
          </p>
        </div>

        {/* Plain-English Reason */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-2">
            COMMUNITY DATABASE CONTEXT
          </h3>
          <p className="text-lg sm:text-2xl font-bold text-black leading-snug">
            “{reportCount > 0 
              ? `This identifier has been reported in ${reportCount} community report(s) for suspected fraud. Exercise caution.` 
              : 'No community reports have been found for this identifier in our database.'}”
          </p>
        </div>

        {/* Warning Signs */}
        {result.warningSigns && result.warningSigns.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Context & Risk Signals</span>
            </h4>
            <ul className="space-y-3">
              {result.warningSigns.map((sign, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm font-semibold text-neutral-800">
                  <span className="w-2 h-2 rounded-full bg-black mt-2 shrink-0" />
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Actions */}
        {result.recommendedActions && result.recommendedActions.length > 0 && (
          <div className="bg-black text-white rounded-2xl p-6 sm:p-8">
            <h4 className="text-sm font-extrabold uppercase tracking-widest text-neutral-300 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Recommended Decision-Support Guidance</span>
            </h4>
            <ul className="space-y-3">
              {result.recommendedActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-3 text-base font-semibold text-neutral-100">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dedicated Phone Intelligence if applicable */}
        {result.type === 'phone' && result.phoneData && (
          <div className="pt-4 border-t border-neutral-200">
            <PhoneIntelligence phoneData={{
              ...result.phoneData,
              communityReportCount: reportCount,
              riskStatus: activeStatus,
              riskScore: activeRiskScore,
            }} />
          </div>
        )}

        {/* Actions Bar */}
        <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowQuickReport(!showQuickReport)}
              className="flex-1 sm:flex-initial bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Flag className="w-4 h-4" />
              <span>{showQuickReport ? 'CLOSE FORM' : 'REPORT IDENTIFIER'}</span>
            </button>

            <button
              onClick={handleCopyResult}
              className="flex-1 sm:flex-initial bg-neutral-100 hover:bg-neutral-200 text-black font-semibold text-sm px-5 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-neutral-200"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'SHARE RESULT'}</span>
            </button>
          </div>

          {onReset && (
            <button
              onClick={onReset}
              className="w-full sm:w-auto text-neutral-600 hover:text-black font-semibold text-sm px-4 py-3 rounded-xl hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Check Another Identifier</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

