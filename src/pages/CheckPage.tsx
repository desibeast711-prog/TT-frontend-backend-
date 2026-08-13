import React from 'react';
import { CoreChecker } from '../components/CoreChecker';
import { AnalysisResult, CheckType } from '../types';
import { Shield, Sparkles } from 'lucide-react';

interface CheckPageProps {
  onNavigate: (path: string) => void;
  onResultGenerated?: (result: AnalysisResult) => void;
  defaultType?: CheckType;
}

export const CheckPage: React.FC<CheckPageProps> = ({ onNavigate, onResultGenerated, defaultType = 'text' }) => {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-4 py-1.5 rounded-full text-xs font-bold text-neutral-800 mb-4 shadow-2xs">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>UNIFIED TRUST CHECKER</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black mb-4">
            CHECK SOMETHING NOW.
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 font-medium">
            Paste suspicious messages, phone numbers, links, emails, UPI IDs, social media messages or drop a screenshot. Free & instant.
          </p>
        </div>

        <CoreChecker onResultGenerated={onResultGenerated} defaultType={defaultType} />
      </div>
    </div>
  );
};
