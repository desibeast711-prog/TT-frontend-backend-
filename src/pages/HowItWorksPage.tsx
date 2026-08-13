import React from 'react';
import { HowItWorks } from '../components/HowItWorks';
import { ArrowRight } from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white py-12">
      <HowItWorks />

      <div className="max-w-4xl mx-auto px-4 text-center pb-20">
        <div className="bg-black text-white p-10 sm:p-14 rounded-3xl space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            READY TO CHECK SOMETHING?
          </h2>
          <p className="text-neutral-300 text-base sm:text-lg max-w-xl mx-auto">
            Try paste an SMS, phone number, email address, or link right now. Free, instant, and private.
          </p>
          <button
            onClick={() => onNavigate('/check')}
            className="bg-white hover:bg-neutral-100 text-black font-extrabold text-base px-8 py-4 rounded-full transition-all inline-flex items-center gap-3 shadow-md"
          >
            <span>CHECK SOMETHING NOW</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
