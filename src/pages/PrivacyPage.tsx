import React from 'react';
import { PrivacySection } from '../components/PrivacySection';
import { Lock, ShieldCheck, EyeOff } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl">
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400 block mb-3">
            LEGAL & PRIVACY PLEDGE
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black mb-4">
            PRIVACY POLICY
          </h1>
          <p className="text-base sm:text-xl text-neutral-600 font-normal leading-relaxed">
            TrulyTrue is engineered around privacy preservation. We believe consumer safety should never come at the cost of personal data exploitation.
          </p>
        </div>

        <PrivacySection />

        <div className="prose prose-neutral max-w-none text-neutral-700 space-y-6 text-sm leading-relaxed border-t border-neutral-200 pt-8">
          <h2 className="text-xl font-bold text-black">1. Information We Process</h2>
          <p>
            When you use the TrulyTrue Trust Checker, the query string, link, email address, phone number, or uploaded screenshot image is evaluated strictly to identify fraud and phishing patterns. Personal identity markers (such as personal recipient names or private account numbers) are redacted or stripped during analysis.
          </p>

          <h2 className="text-xl font-bold text-black">2. Geographic Location Aggregation</h2>
          <p>
            Scam report geographic data is aggregated strictly at the country, state/province, and district levels. We do not store or track exact street addresses or user device coordinates.
          </p>

          <h2 className="text-xl font-bold text-black">3. Community Reports & Identity Protection</h2>
          <p>
            Submissions to our public Community feed do not display personal reporter emails or personal identity data unless explicitly requested by law enforcement process.
          </p>
        </div>
      </div>
    </div>
  );
};
