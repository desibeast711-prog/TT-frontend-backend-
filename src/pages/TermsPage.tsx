import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400 block mb-3">
            LEGAL
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black mb-4">
            TERMS OF SERVICE
          </h1>
          <p className="text-neutral-600 text-sm font-medium">
            Effective Date: August 2026 • Plain language consumer terms.
          </p>
        </div>

        <div className="prose prose-neutral max-w-none text-neutral-700 space-y-6 text-sm leading-relaxed border-t border-neutral-200 pt-8">
          <h2 className="text-xl font-bold text-black">1. Platform Purpose</h2>
          <p>
            TrulyTrue provides consumer Trust Intelligence analysis designed to assist users in evaluating suspicious communications, phone numbers, links, emails, and UPI handles.
          </p>

          <h2 className="text-xl font-bold text-black">2. Information Advisory</h2>
          <p>
            While our Trust Intelligence engine utilizes advanced multi-signal AI and community cross-verification, risk scores and verdicts represent automated advisory intelligence. Users should always verify financial or personal requests directly through official authenticated channels.
          </p>

          <h2 className="text-xl font-bold text-black">3. Community Reporting & Dispute Policy</h2>
          <p>
            Community reports are moderated crowd inputs. TrulyTrue maintains zero-tolerance for malicious defamation or false reporting. Entities wishing to dispute an inaccurate community report may submit evidence through our official dispute desk.
          </p>
        </div>
      </div>
    </div>
  );
};
