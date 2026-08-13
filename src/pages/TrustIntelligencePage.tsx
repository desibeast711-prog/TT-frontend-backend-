import React from 'react';
import { TrustIntelligenceExplanation } from '../components/TrustIntelligenceExplanation';
import { PrivacySection } from '../components/PrivacySection';
import { Shield, Cpu, Lock, CheckCircle2 } from 'lucide-react';

interface TrustIntelligencePageProps {
  onNavigate: (path: string) => void;
}

export const TrustIntelligencePage: React.FC<TrustIntelligencePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400 block mb-3">
            PLATFORM ARCHITECTURE
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black mb-4">
            WHAT IS TRUST INTELLIGENCE?
          </h1>
          <p className="text-base sm:text-xl text-neutral-600 font-normal leading-relaxed">
            Trust Intelligence replaces traditional, reactive cybersecurity dashboards with proactive consumer clarity. It combines artificial intelligence, community reports, domain reputation, and evidence verification into instant, plain-English advice.
          </p>
        </div>

        {/* Deep Explanation Component */}
        <TrustIntelligenceExplanation />

        {/* Privacy Section */}
        <PrivacySection />
      </div>
    </div>
  );
};
