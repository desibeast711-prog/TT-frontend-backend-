import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { PhoneIntelligence } from './PhoneIntelligence';
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
  Users
} from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult;
  onReset?: () => void;
  onReportClick?: (targetValue: string, targetType: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset, onReportClick }) => {
  const [copied, setCopied] = useState(false);

  const statusConfig = {
    SAFE: {
      label: 'SAFE',
      bgClass: 'bg-emerald-500',
      textClass: 'text-emerald-700',
      bgLightClass: 'bg-emerald-50 border-emerald-200',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
      colorHex: '#10B981',
    },
    SUSPICIOUS: {
      label: 'SUSPICIOUS',
      bgClass: 'bg-amber-500',
      textClass: 'text-amber-700',
      bgLightClass: 'bg-amber-50 border-amber-200',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
      colorHex: '#F59E0B',
    },
    LIKELY_SCAM: {
      label: 'LIKELY SCAM',
      bgClass: 'bg-red-500',
      textClass: 'text-red-700',
      bgLightClass: 'bg-red-50 border-red-200',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      icon: <ShieldAlert className="w-8 h-8 text-red-600" />,
      colorHex: '#EF4444',
    },
  };

  const currentStatus = statusConfig[result.status] || statusConfig.SUSPICIOUS;

  const handleCopyResult = () => {
    const textToCopy = `TrulyTrue Trust Check: [${currentStatus.label}] Risk Score: ${result.riskScore}/100\nQuery: ${result.query}\nReason: ${result.plainEnglishReason}\nCheck yours at trulytrue.org`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-300 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Top Header Strip with Status & Score */}
      <div className={`p-6 sm:p-10 border-b ${currentStatus.bgLightClass}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <div className={`p-3 sm:p-4 rounded-2xl bg-white shadow-sm border border-neutral-200`}>
              {currentStatus.icon}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-2xl sm:text-4xl font-black tracking-tight ${currentStatus.textClass}`}>
                  {currentStatus.label}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider bg-black text-white px-3 py-1 rounded-full">
                  {result.category}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-neutral-600">
                Analysis Confidence: {result.confidence}% • ID: {result.id}
              </p>
            </div>
          </div>

          {/* Risk Score Meter */}
          <div className="flex items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs min-w-[200px]">
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* SVG Circle Progress */}
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
                  strokeDashoffset={163 - (163 * result.riskScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute font-black text-base text-black">
                {result.riskScore}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Risk Score
              </span>
              <span className="text-sm font-bold text-black">
                {result.riskScore} / 100
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                {result.riskScore > 70 ? 'High Danger' : result.riskScore > 30 ? 'Moderate Caution' : 'Low Risk'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-10 space-y-8">
        {/* Analyzed Query Box */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-6">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
            Analyzed Input ({result.type.toUpperCase()})
          </span>
          <p className="text-base sm:text-lg font-mono font-medium text-black break-words">
            "{result.query}"
          </p>
        </div>

        {/* Plain-English Reason */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-2">
            WHY WE THINK THIS
          </h3>
          <p className="text-lg sm:text-2xl font-bold text-black leading-snug">
            “{result.plainEnglishReason}”
          </p>
        </div>

        {/* Warning Signs */}
        {result.warningSigns && result.warningSigns.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Warning Signs Identified</span>
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
              <span>What Should You Do?</span>
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
            <PhoneIntelligence phoneData={result.phoneData} />
          </div>
        )}

        {/* Community Reports Pill */}
        {result.communityReportCount > 0 && (
          <div className="bg-neutral-100 border border-neutral-200 p-4 rounded-xl flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-neutral-700" />
              <span className="font-bold text-black">
                {result.communityReportCount} community reports recorded for this pattern.
              </span>
            </div>
            <span className="text-xs font-semibold bg-white border border-neutral-200 px-3 py-1 rounded-full text-neutral-700">
              Community Sourced
            </span>
          </div>
        )}

        {/* Actions Bar */}
        <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onReportClick && (
              <button
                onClick={() => onReportClick(result.query, result.type)}
                className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4" />
                <span>REPORT SCAM</span>
              </button>
            )}
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
              <span>Check Another Item</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
