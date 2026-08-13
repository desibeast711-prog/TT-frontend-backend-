import React from 'react';
import { Cpu, Users, Shield, Zap, FileSearch, Lock, ArrowDown } from 'lucide-react';

export const TrustIntelligenceExplanation: React.FC = () => {
  const signalSources = [
    { title: 'AI Analysis', desc: 'Gemini 3.6 Flash deep language & OCR model identifying pressure tactics, fake links, and spoofing.', icon: <Cpu className="w-6 h-6 text-sky-500" /> },
    { title: 'Community Reports', desc: 'Crowdsourced verified reports from victims and observant citizens cross-checked for duplicate spikes.', icon: <Users className="w-6 h-6 text-emerald-500" /> },
    { title: 'Reputation Signals', desc: 'Domain registration age, SSL certificate validity, telecom circle registry, and merchant VPA checks.', icon: <Shield className="w-6 h-6 text-indigo-500" /> },
    { title: 'Scam Patterns', desc: 'Real-time catalog of recurring fraud scripts: electricity cutoffs, courier customs holds, fake customer care.', icon: <Zap className="w-6 h-6 text-amber-500" /> },
    { title: 'Public Intelligence', desc: 'Official cybercrime bulletins, bank advisory warnings, and public domain blocklists.', icon: <FileSearch className="w-6 h-6 text-purple-500" /> },
    { title: 'Evidence Logs', desc: 'Screenshot OCR validation and transaction header analysis verifying claim authenticity.', icon: <Lock className="w-6 h-6 text-rose-500" /> },
  ];

  return (
    <section className="py-16 bg-neutral-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl my-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-sky-400">
            THE ENGINE BEHIND THE CERTAINTY
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            TRUST INTELLIGENCE ARCHITECTURE
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
            Unlike static blacklists that update days too late, TrulyTrue synthesizes 6 dynamic signal streams in real time.
          </p>
        </div>

        {/* 6 Input Signals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signalSources.map((source, i) => (
            <div key={i} className="bg-neutral-800/70 border border-neutral-700/80 rounded-2xl p-6 flex flex-col gap-3">
              <div className="p-3 bg-neutral-900 rounded-xl w-fit border border-neutral-700">
                {source.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{source.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">{source.desc}</p>
            </div>
          ))}
        </div>

        {/* Flow Connector Arrow */}
        <div className="flex flex-col items-center justify-center gap-2 text-neutral-400">
          <div className="w-px h-10 bg-gradient-to-b from-neutral-700 to-sky-500" />
          <ArrowDown className="w-6 h-6 text-sky-400 animate-bounce" />
        </div>

        {/* Central Engine Hub */}
        <div className="bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-800 border-2 border-sky-500/50 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-sky-400">
            MULTI-SIGNAL SYNTHESIS
          </span>
          <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            TRULYTRUE TRUST ANALYSIS
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
            Every input is weighted, cross-checked against duplicate submissions, and scored on a 0–100 scale.
          </p>
        </div>

        {/* Output Verdicts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-emerald-950/60 border border-emerald-500/40 p-5 rounded-2xl text-emerald-400">
            <span className="block text-xl font-black mb-1">SAFE</span>
            <span className="text-xs text-emerald-300/80 font-medium">Authentic & Verified</span>
          </div>
          <div className="bg-amber-950/60 border border-amber-500/40 p-5 rounded-2xl text-amber-400">
            <span className="block text-xl font-black mb-1">SUSPICIOUS</span>
            <span className="text-xs text-amber-300/80 font-medium">Exercise Caution</span>
          </div>
          <div className="bg-red-950/60 border border-red-500/40 p-5 rounded-2xl text-red-400">
            <span className="block text-xl font-black mb-1">LIKELY SCAM</span>
            <span className="text-xs text-red-300/80 font-medium">Active Threat Pattern</span>
          </div>
        </div>
      </div>
    </section>
  );
};
