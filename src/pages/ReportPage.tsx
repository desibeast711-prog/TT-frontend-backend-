import React, { useState } from 'react';
import { CheckType, ScamCategory } from '../types';
import { submitReport } from '../services/api';
import { Flag, Upload, CheckCircle2, ShieldAlert, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface ReportPageProps {
  initialValue?: string;
  initialType?: CheckType;
  onNavigate: (path: string) => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ 
  initialValue = '', 
  initialType = 'phone',
  onNavigate 
}) => {
  const [targetType, setTargetType] = useState<CheckType>(initialType);
  const [targetValue, setTargetValue] = useState(initialValue);
  const [category, setCategory] = useState<ScamCategory>('UPI Scam' as ScamCategory);
  const [whatHappened, setWhatHappened] = useState('');
  const [approximateRegion, setApproximateRegion] = useState('India - Bihar - Patna');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories: ScamCategory[] = [
    'Bank Fraud' as ScamCategory,
    'UPI Scam' as ScamCategory,
    'Phishing' as ScamCategory,
    'Fake Customer Support' as ScamCategory,
    'Investment Scam' as ScamCategory,
    'Crypto Scam' as ScamCategory,
    'Job Scam' as ScamCategory,
    'Delivery Scam' as ScamCategory,
    'Romance Scam' as ScamCategory,
    'Identity Theft' as ScamCategory,
    'Digital Arrest' as ScamCategory,
    'Other' as ScamCategory,
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!targetValue.trim()) {
      setError('Please specify the phone number, link, email, or UPI ID you are reporting.');
      return;
    }

    if (!whatHappened.trim()) {
      setError('Please describe what happened during this incident.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Split region string into country, state, district if provided
      const regionParts = approximateRegion.split('-').map(s => s.trim());
      const country = regionParts[0] || 'India';
      const state = regionParts[1] || '';
      const district = regionParts[2] || '';

      const res = await submitReport(
        {
          targetType,
          targetValue: targetValue.trim(),
          category,
          whatHappened: whatHappened.trim(),
          approximateRegion,
          evidenceFileName: evidenceFile?.name || undefined,
        },
        evidenceFile || undefined
      );

      setSubmittedId(res.id);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 font-extrabold text-xs px-4 py-1.5 rounded-full mb-3">
            <Flag className="w-3.5 h-3.5" />
            <span>REPORT SCAM INCIDENT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black mb-2">
            SHIELD YOUR COMMUNITY.
          </h1>
          <p className="text-neutral-600 font-medium text-sm sm:text-base">
            Report a suspicious phone number, URL, email, UPI ID, message or social account to help us alert others.
          </p>
        </div>

        {submittedId ? (
          <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black">
              REPORT SUBMITTED SUCCESSFULLY
            </h2>
            <p className="text-neutral-600 text-sm max-w-md mx-auto">
              Reference ID: <span className="font-mono font-bold text-black">{submittedId}</span>
              <br />
              Your report has been queued for duplicate cross-checking and moderation. Thank you for protecting the community.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={() => {
                  setSubmittedId(null);
                  setTargetValue('');
                  setWhatHappened('');
                  setEvidenceFile(null);
                }}
                className="bg-black text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-neutral-800 transition-colors"
              >
                Submit Another Report
              </button>
              <button
                onClick={() => onNavigate('/community')}
                className="bg-neutral-100 text-black font-semibold px-6 py-3 rounded-xl text-sm hover:bg-neutral-200 transition-colors"
              >
                View Community Feed
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            {/* Target Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                1. What are you reporting?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {(['phone', 'url', 'email', 'upi', 'text', 'social'] as CheckType[]).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTargetType(t)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-colors ${
                      targetType === t
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder={
                  targetType === 'phone'
                    ? '+91 XXXXX XXXXX'
                    : targetType === 'url'
                    ? 'https://phishing-link.com'
                    : targetType === 'email'
                    ? 'support@fake-domain.com'
                    : targetType === 'upi'
                    ? 'scammer@ybl'
                    : 'Paste suspicious item value...'
                }
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 font-mono text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                2. Select Scam Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ScamCategory)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 font-semibold text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                3. What happened?
              </label>
              <textarea
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                rows={4}
                placeholder="Describe how the scam occurred, message details, demands made, or links sent..."
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-4 text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-black resize-none"
                required
              />
            </div>

            {/* Approximate Region */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                4. Approximate Region (Country - State - District)
              </label>
              <input
                type="text"
                value={approximateRegion}
                onChange={(e) => setApproximateRegion(e.target.value)}
                placeholder="e.g. India - Bihar - Patna"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
              <span className="text-[11px] text-neutral-400 font-medium block mt-1">
                🔒 Exact street address or GPS location is never collected or displayed.
              </span>
            </div>

            {/* Evidence Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                5. Evidence Upload (Optional Screenshot or Chat PDF)
              </label>
              <div className="border border-dashed border-neutral-300 bg-neutral-50 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-neutral-500" />
                  <span className="text-xs font-semibold text-neutral-700">
                    {evidenceFile ? evidenceFile.name : 'Attach screenshot / chat log (PNG, JPG)'}
                  </span>
                </div>
                <label className="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-neutral-800">
                  Browse File
                  <input type="file" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Architecture / Fairness Guarantee Notice */}
            <div className="bg-neutral-100 p-4 rounded-xl text-xs text-neutral-600 space-y-1">
              <p className="font-bold text-black flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Moderation & Fair Dispute Policy
              </p>
              <p>
                All reports undergo duplicate clustering, rate-limit validation, and human dispute review before verification. Unverified reports are marked strictly as 'Community Report'.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-400 text-white font-extrabold text-base py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Report...</span>
                </>
              ) : (
                <>
                  <Flag className="w-5 h-5" />
                  <span>SUBMIT REPORT TO TRULYTRUE</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
