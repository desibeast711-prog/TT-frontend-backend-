import React from 'react';
import { Send, Cpu, CheckCircle, ShieldAlert, HeartHandshake } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'SUBMIT',
      subhead: 'Check anything suspicious in seconds.',
      desc: 'Paste a message, website URL, phone number, email address, UPI handle, or simply drag and drop a screenshot.',
      icon: <Send className="w-8 h-8 text-black" />,
      accentColor: 'border-black',
    },
    {
      number: '02',
      title: 'ANALYZE',
      subhead: 'Multi-signal Trust Intelligence engine.',
      desc: 'TrulyTrue evaluates the input across AI scam pattern recognition, reputation databases, domain age, and crowdsourced community incident reports.',
      icon: <Cpu className="w-8 h-8 text-sky-600" />,
      accentColor: 'border-sky-500',
    },
    {
      number: '03',
      title: 'UNDERSTAND',
      subhead: 'Instant status, risk score, and plain English reason.',
      desc: 'Receive a clear verdict: SAFE, SUSPICIOUS, or LIKELY SCAM. Read a plain-language explanation without technical cybersecurity jargon.',
      icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
      accentColor: 'border-emerald-500',
    },
    {
      number: '04',
      title: 'ACT',
      subhead: 'Clear, immediate step-by-step guidance.',
      desc: 'Know exactly what to do next — whether to block a number, avoid sharing OTPs, or verify through official channels.',
      icon: <ShieldAlert className="w-8 h-8 text-amber-600" />,
      accentColor: 'border-amber-500',
    },
    {
      number: '05',
      title: 'PROTECT',
      subhead: 'Shield your family and community.',
      desc: 'Report active scam patterns to update our global Trust Intelligence network and prevent others from falling victim.',
      icon: <HeartHandshake className="w-8 h-8 text-red-600" />,
      accentColor: 'border-red-500',
    },
  ];

  return (
    <section className="py-20 bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400 block mb-3">
            HOW TRULYTRUE WORKS
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-black mb-6">
            SIMPLICITY IN FIVE STEPS.
          </h2>
          <p className="text-lg sm:text-xl text-neutral-600 font-normal leading-relaxed">
            Designed like a consumer technology product — intuitive, human, and built for instant certainty.
          </p>
        </div>

        {/* Vertical Step Cards */}
        <div className="space-y-10 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`bg-neutral-50 border-l-4 ${step.accentColor} border-y border-r border-neutral-200 rounded-3xl p-8 sm:p-12 shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-6 items-center`}
            >
              <div className="md:col-span-3 flex items-center gap-4">
                <span className="text-5xl sm:text-7xl font-black tracking-tight text-neutral-300 font-mono">
                  {step.number}
                </span>
                <div className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                  {step.icon}
                </div>
              </div>

              <div className="md:col-span-9 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
                    {step.title}
                  </h3>
                  <span className="text-xs font-bold bg-neutral-200 text-neutral-800 px-3 py-1 rounded-full">
                    Step {step.number}
                  </span>
                </div>
                <p className="text-base sm:text-xl font-bold text-neutral-800">
                  {step.subhead}
                </p>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-medium pt-1 max-w-2xl">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
