import React from 'react';
import { CommunitySection } from '../components/CommunitySection';
import { GeographicIntelligence } from '../components/GeographicIntelligence';
import { Users, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';

interface CommunityPageProps {
  onNavigate: (path: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400 block mb-3">
            TRULYTRUE PUBLIC COMMUNITY
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black mb-4">
            COMMUNITY TRUST INTELLIGENCE
          </h1>
          <p className="text-base sm:text-xl text-neutral-600 font-normal leading-relaxed">
            Real-time scam reports submitted by citizens, cross-verified by AI and human moderation to protect everyone.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-2xl">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Active Community Reports
            </span>
            <span className="text-3xl font-black text-black">42,890+</span>
            <span className="text-xs text-neutral-500 block mt-1">Cross-checked across regions</span>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-2xl">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Verification Accuracy
            </span>
            <span className="text-3xl font-black text-black">99.2%</span>
            <span className="text-xs text-neutral-500 block mt-1">Dual-layer duplicate filtering</span>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-2xl">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Citizens Protected
            </span>
            <span className="text-3xl font-black text-black">1.4 Million</span>
            <span className="text-xs text-neutral-500 block mt-1">Free consumer access</span>
          </div>
        </div>

        {/* Community Feed Component */}
        <CommunitySection onReportNewClick={() => onNavigate('/report')} />

        {/* Geographic Intelligence Map */}
        <div className="pt-8 border-t border-neutral-200">
          <GeographicIntelligence />
        </div>
      </div>
    </div>
  );
};
