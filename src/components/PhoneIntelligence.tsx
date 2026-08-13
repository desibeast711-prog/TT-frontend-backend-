import React from 'react';
import { PhoneIntelligenceData } from '../types';
import { Phone, AlertCircle, Calendar, TrendingUp, Users } from 'lucide-react';

interface PhoneIntelligenceProps {
  phoneData: PhoneIntelligenceData;
}

export const PhoneIntelligence: React.FC<PhoneIntelligenceProps> = ({ phoneData }) => {
  return (
    <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block mb-1">
            PHONE INTELLIGENCE DOSSIER
          </span>
          <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white flex items-center gap-3">
            <Phone className="w-6 h-6 text-sky-400" />
            <span>{phoneData.number}</span>
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-red-500/20 border border-red-500/40 text-red-400 font-extrabold text-sm px-4 py-2 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{(phoneData?.riskStatus || 'SUSPICIOUS').replace('_', ' ')}</span>
          </div>
          <div className="bg-neutral-800 border border-neutral-700 text-white font-bold text-sm px-4 py-2 rounded-xl">
            {phoneData.riskScore} / 100 Risk
          </div>
        </div>
      </div>

      {/* Community Reports Counter */}
      <div className="bg-neutral-800/80 border border-neutral-700 p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-neutral-700 rounded-lg text-white">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{phoneData.communityReportCount}</p>
            <p className="text-xs text-neutral-400 font-semibold">Community Incident Reports</p>
          </div>
        </div>
        <span className="text-xs font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full">
          Active Threat Pattern
        </span>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Reported Categories */}
        <div className="bg-neutral-800/40 border border-neutral-800 p-5 rounded-xl">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>Most Reported Scam Types</span>
          </h4>
          <div className="space-y-3">
            {(phoneData?.topCategories || []).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-neutral-200">{cat.category}</span>
                <span className="font-bold text-neutral-400 bg-neutral-800 px-2.5 py-0.5 rounded-md text-xs">
                  {cat.count} reports
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Report Timestamps & Activity */}
        <div className="bg-neutral-800/40 border border-neutral-800 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Timeline Activity</span>
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-neutral-800 p-3 rounded-lg">
                <span className="text-[11px] text-neutral-400 block font-semibold">First Reported</span>
                <span className="text-sm font-bold text-white">{phoneData.firstReported || 'N/A'}</span>
              </div>
              <div className="bg-neutral-800 p-3 rounded-lg">
                <span className="text-[11px] text-neutral-400 block font-semibold">Latest Incident</span>
                <span className="text-sm font-bold text-white">{phoneData.latestReported || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Activity Bar Visualization */}
          <div>
            <span className="text-[11px] text-neutral-400 font-semibold block mb-2">Monthly Activity Trend</span>
            <div className="flex items-end gap-2 h-12 pt-2">
              {(phoneData?.activityHistory || []).map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    style={{ height: `${Math.min(100, (h.count / 15) * 100)}%` }}
                    className="w-full bg-sky-500 group-hover:bg-sky-400 rounded-xs transition-all min-h-[4px]"
                  />
                  <span className="text-[9px] text-neutral-500 font-mono">{(h.date || '').split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
