import React from 'react';
import { Logo } from './Logo';
import { Shield, Lock, Globe, ArrowUp } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-4 pr-0 lg:pr-8">
            <div className="bg-white p-2 rounded-xl inline-block w-fit">
              <Logo size="md" />
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mt-2">
              TrulyTrue is a consumer Trust Intelligence platform empowering people to verify suspicious messages, numbers, URLs, UPI IDs, and emails before taking action.
            </p>
            <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2">
              <span className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Data Minimization
              </span>
              <span className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                Aggregated Geo Privacy
              </span>
            </div>
          </div>

          {/* Links Column 1: Checkers */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Check Anything
            </h4>
            <button onClick={() => onNavigate('/check')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              Text & SMS Checker
            </button>
            <button onClick={() => onNavigate('/check')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              Phone Number Lookup
            </button>
            <button onClick={() => onNavigate('/check')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              URL & Website Safety
            </button>
            <button onClick={() => onNavigate('/check')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              Screenshot Analysis
            </button>
            <button onClick={() => onNavigate('/check')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              UPI Handle Inspector
            </button>
          </div>

          {/* Links Column 2: Platform */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Platform
            </h4>
            <button onClick={() => onNavigate('/how-it-works')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              How It Works
            </button>
            <button onClick={() => onNavigate('/community')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              Community Feed
            </button>
            <button onClick={() => onNavigate('/trust-intelligence')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              Trust Intelligence
            </button>
            <button onClick={() => onNavigate('/report')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              Report a Scam
            </button>
            <button onClick={() => onNavigate('/about')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              About TrulyTrue
            </button>
          </div>

          {/* Links Column 3: Legal & Support */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Legal & Support
            </h4>
            <button onClick={() => onNavigate('/privacy')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              Privacy Promise
            </button>
            <button onClick={() => onNavigate('/terms')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              Terms of Service
            </button>
            <button onClick={() => onNavigate('/contact')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              Help & Contact
            </button>
            <button onClick={() => onNavigate('/profile')} className="text-left text-sm text-neutral-300 hover:text-white transition-colors">
              Account
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} TrulyTrue Inc. All rights reserved. Truth You Can Trust.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('/privacy')} className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('/terms')} className="hover:text-neutral-300 transition-colors">
              Terms
            </button>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
