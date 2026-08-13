import React from 'react';
import { ArrowDown, ShieldAlert, CheckCircle2, Sparkles } from 'lucide-react';

interface HeroProps {
  onCheckClick: () => void;
  onHowItWorksClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onCheckClick, onHowItWorksClick }) => {
  return (
    <section className="relative pt-12 pb-12 sm:pt-20 sm:pb-16 bg-white text-black overflow-hidden">
      {/* Background subtle mesh grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: `24px 24px`
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200/80 px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-800 mb-8 sm:mb-10 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CONSUMER TRUST INTELLIGENCE PLATFORM</span>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-500 font-normal">AI + Community Protection</span>
          </div>

          {/* Huge Editorial Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-black mb-8">
            KNOW BEFORE<br />
            <span className="text-neutral-900">YOU TRUST.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-2xl text-neutral-600 font-normal leading-relaxed max-w-2xl mb-10 sm:mb-12">
            Check a message, number, link, screenshot or email before you act.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-12 sm:mb-16">
            <button
              onClick={onCheckClick}
              className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white font-bold text-base px-8 py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3 group focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              <span>CHECK SOMETHING</span>
              <ArrowDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={onHowItWorksClick}
              className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold text-base px-8 py-4 rounded-full border border-neutral-200/80 transition-all duration-200 flex items-center justify-center"
            >
              HOW IT WORKS
            </button>
          </div>

          {/* Trust Highlights Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-8 border-t border-neutral-100 w-full text-left sm:text-center text-xs font-semibold text-neutral-500">
            <div className="flex items-center gap-2 sm:justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instant AI Verification</span>
            </div>
            <div className="flex items-center gap-2 sm:justify-center">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Scam Pattern Detection</span>
            </div>
            <div className="flex items-center gap-2 sm:justify-center">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Plain-English Reasons</span>
            </div>
            <div className="flex items-center gap-2 sm:justify-center">
              <span className="w-2 h-2 rounded-full bg-black shrink-0" />
              <span>100% Free & No Account Needed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
