import React from 'react';
import { Logo } from '../components/Logo';
import { ShieldCheck, Heart, Users, Lock } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="space-y-6">
          <Logo size="lg" showTagline />
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-none pt-4">
            REBUILDING TRUST<br />
            FOR EVERYONE.
          </h1>
          <p className="text-xl text-neutral-600 font-normal leading-relaxed max-w-3xl">
            TrulyTrue was founded with one clear conviction: Consumer protection should not be locked behind complex enterprise cybersecurity dashboards or confusing technical jargon.
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-neutral-200">
          <div className="bg-neutral-50 p-8 rounded-2xl border border-neutral-200 space-y-3">
            <div className="p-3 bg-black text-white rounded-xl w-fit">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-black">Human-First Clarity</h3>
            <p className="text-neutral-600 leading-relaxed text-sm">
              When an elderly parent or busy working professional receives an urgent text about electricity disconnection or bank account freeze, they need an immediate, plain-English answer — not a threat score matrix.
            </p>
          </div>

          <div className="bg-neutral-50 p-8 rounded-2xl border border-neutral-200 space-y-3">
            <div className="p-3 bg-black text-white rounded-xl w-fit">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-black">Community Immunity</h3>
            <p className="text-neutral-600 leading-relaxed text-sm">
              Scammers thrive on isolation. By aggregating verified community reports across regions and telecom channels, TrulyTrue builds a shared defensive shield that protects entire families.
            </p>
          </div>
        </div>

        {/* Principles list */}
        <div className="bg-black text-white p-8 sm:p-12 rounded-3xl space-y-8">
          <h2 className="text-3xl font-black tracking-tight text-white">OUR CORE COMMITMENTS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-emerald-400 font-bold text-lg block">01. 100% Free Access</span>
              <p className="text-neutral-300 text-xs leading-relaxed">Basic checking will always remain free for consumers worldwide without mandatory registration.</p>
            </div>
            <div className="space-y-2">
              <span className="text-sky-400 font-bold text-lg block">02. Privacy First</span>
              <p className="text-neutral-300 text-xs leading-relaxed">Zero data selling. Minimal personal retention. Aggregated location mapping.</p>
            </div>
            <div className="space-y-2">
              <span className="text-purple-400 font-bold text-lg block">03. Unbiased Moderation</span>
              <p className="text-neutral-300 text-xs leading-relaxed">No automatic criminalization without verified evidence and dispute procedures.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
