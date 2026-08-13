import React from 'react';
import { Hero } from '../components/Hero';
import { CoreChecker } from '../components/CoreChecker';
import { TrustIntelligenceExplanation } from '../components/TrustIntelligenceExplanation';
import { GeographicIntelligence } from '../components/GeographicIntelligence';
import { CommunitySection } from '../components/CommunitySection';
import { HowItWorks } from '../components/HowItWorks';
import { PrivacySection } from '../components/PrivacySection';
import { AnalysisResult } from '../types';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onResultGenerated?: (result: AnalysisResult) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onResultGenerated }) => {
  const scrollToChecker = () => {
    const el = document.getElementById('core-checker-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('/check');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <Hero
        onCheckClick={scrollToChecker}
        onHowItWorksClick={() => onNavigate('/how-it-works')}
      />

      {/* Main Core Checker immediately below Hero */}
      <CoreChecker onResultGenerated={onResultGenerated} />

      {/* Trust Intelligence Architecture */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TrustIntelligenceExplanation />
      </div>

      {/* Geographic Threat Matrix */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GeographicIntelligence />
      </div>

      {/* How It Works Storytelling */}
      <HowItWorks />

      {/* Community Reports Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <CommunitySection onReportNewClick={() => onNavigate('/report')} />
      </div>

      {/* Privacy Guarantee Section */}
      <PrivacySection />
    </div>
  );
};
