import React from 'react';
import { Lock, EyeOff, ShieldCheck, MapPin, Server } from 'lucide-react';

export const PrivacySection: React.FC = () => {
  const guarantees = [
    {
      title: 'Data Minimization By Design',
      desc: 'We store zero unneeded personal message content. Analyzed queries are processed strictly for threat identification and discarded or stripped of personal names/numbers.',
      icon: <Lock className="w-6 h-6 text-black" />,
    },
    {
      title: 'Aggregated Location Intelligence',
      desc: 'Location records are aggregated strictly at country, state, and district levels. We never collect, store, or display an individual user’s exact GPS coordinates or IP location.',
      icon: <MapPin className="w-6 h-6 text-black" />,
    },
    {
      title: 'Protected Reporter Identity',
      desc: 'Submitting a scam report is 100% anonymous by default. Your name, email, and personal device details are never publicly connected to community reports.',
      icon: <EyeOff className="w-6 h-6 text-black" />,
    },
    {
      title: 'Zero Ad-Tracking & Selling',
      desc: 'TrulyTrue never sells consumer verification queries to data brokers or ad networks. Your security queries remain strictly confidential.',
      icon: <Server className="w-6 h-6 text-black" />,
    },
  ];

  return (
    <section className="py-16 bg-neutral-100 text-black border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400 block mb-3">
            THE TRULYTRUE PRIVACY COMMITMENT
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black mb-4">
            YOUR SAFETY SHOULD NOT COST YOUR PRIVACY.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 font-medium leading-relaxed">
            Protecting citizens against fraud requires absolute integrity. Here is how we guarantee your digital rights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {guarantees.map((item, idx) => (
            <div key={idx} className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm flex flex-col gap-3">
              <div className="p-3 bg-neutral-100 rounded-xl w-fit">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-black">{item.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
