import React, { useState, useEffect } from 'react';
import { CommunityReport, CommunityReportLifecycle } from '../types';
import { getCommunityReports } from '../services/api';
import { ShieldCheck, Filter, ThumbsUp, AlertCircle, FileText, MapPin, Loader2 } from 'lucide-react';

interface CommunitySectionProps {
  reports?: CommunityReport[];
  onReportNewClick?: () => void;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ 
  reports,
  onReportNewClick 
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [reportList, setReportList] = useState<CommunityReport[]>(reports || []);
  const [loading, setLoading] = useState(!reports);

  useEffect(() => {
    if (!reports) {
      getCommunityReports().then((data) => {
        setReportList(data);
        setLoading(false);
      });
    }
  }, [reports]);

  const statusBadgeStyles: Record<CommunityReportLifecycle | string, string> = {
    'NEW': 'bg-neutral-100 text-neutral-800 border-neutral-300',
    'UNDER_REVIEW': 'bg-amber-100 text-amber-800 border-amber-300',
    'SUPPORTED': 'bg-blue-100 text-blue-800 border-blue-300',
    'CORROBORATED': 'bg-amber-200 text-amber-900 border-amber-400',
    'RESOLVED': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'DISPUTED': 'bg-purple-100 text-purple-800 border-purple-300',
    'REMOVED': 'bg-red-100 text-red-800 border-red-300',
    'Community Report': 'bg-neutral-100 text-neutral-800 border-neutral-300',
    'Under Review': 'bg-amber-100 text-amber-800 border-amber-300',
    'Verified': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  const filteredReports = reportList.filter((rep) => {
    if (selectedStatusFilter === 'ALL') return true;
    return rep.status === selectedStatusFilter;
  });

  const handleUpvote = (id: string) => {
    setReportList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  return (
    <div className="space-y-8">
      {/* Policy Notice */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>COMMUNITY PROTECTION GUIDELINES</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            Preserving Fair & Verified Intelligence
          </h3>
          <p className="text-neutral-300 text-sm leading-relaxed">
            Community reports are crowdsourced inputs undergoing moderation and duplicate cross-checking. TrulyTrue never automatically designates individuals or organizations as fraudsters based solely on unverified submissions.
          </p>
        </div>

        {onReportNewClick && (
          <button
            onClick={onReportNewClick}
            className="bg-white hover:bg-neutral-100 text-black font-extrabold text-sm px-6 py-3.5 rounded-xl transition-colors whitespace-nowrap shadow-sm shrink-0"
          >
            REPORT A SCAM
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <h3 className="text-2xl font-black tracking-tight text-black flex items-center gap-2">
          <span>Recent Community Incident Reports</span>
          <span className="text-xs font-bold bg-black text-white px-2.5 py-1 rounded-full">
            {filteredReports.length}
          </span>
        </h3>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {['ALL', 'Verified', 'Community Report', 'Under Review', 'Disputed'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap focus:outline-none ${
                selectedStatusFilter === st
                  ? 'bg-black text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center gap-2 text-neutral-500 font-bold text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Fetching Community Intelligence Reports...</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-12 text-center bg-neutral-50 rounded-2xl border border-neutral-200 p-8">
          <p className="text-neutral-600 font-bold text-sm">No community reports found in this view.</p>
          <p className="text-xs text-neutral-400 mt-1">Be the first to submit a report if you encounter a scam attempt.</p>
        </div>
      ) : (
        /* Reports Feed Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 font-mono">
                    {report.id.toString().slice(-8)} • {report.targetType?.toUpperCase() || 'REPORT'}
                  </span>
                  <span
                    className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                      statusBadgeStyles[report.status] || 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-black font-mono break-all mb-2">
                  {report.targetValue}
                </h4>

                <div className="inline-block bg-neutral-100 text-neutral-800 text-xs font-semibold px-2.5 py-1 rounded-md mb-3">
                  Category: {report.category}
                </div>

                <p className="text-sm text-neutral-700 leading-relaxed font-normal mb-4">
                  "{report.description}"
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>
                    {report.region?.district ? `${report.region.district}, ` : ''}
                    {report.region?.state ? `${report.region.state}, ` : ''}
                    {report.region?.country || 'India'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {report.hasEvidence && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      <FileText className="w-3 h-3" />
                      Evidence Attached
                    </span>
                  )}
                  <button
                    onClick={() => handleUpvote(report.id)}
                    className="inline-flex items-center gap-1 text-neutral-800 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg font-bold transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{report.upvotes || 1}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
