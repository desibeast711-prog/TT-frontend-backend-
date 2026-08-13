import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400 block mb-2">
            HELP & SUPPORT
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black mb-3">
            GET IN TOUCH.
          </h1>
          <p className="text-neutral-600 font-medium text-base">
            Have questions about a check result, platform integration, or community dispute? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-2">
            <Mail className="w-6 h-6 text-sky-600" />
            <h3 className="font-bold text-black text-base">Consumer Support</h3>
            <p className="text-xs text-neutral-500">support@trulytrue.org</p>
          </div>

          <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-2">
            <Phone className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-black text-base">Dispute Desk</h3>
            <p className="text-xs text-neutral-500">disputes@trulytrue.org</p>
          </div>

          <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-2">
            <MapPin className="w-6 h-6 text-purple-600" />
            <h3 className="font-bold text-black text-base">Headquarters</h3>
            <p className="text-xs text-neutral-500">TrulyTrue Inc. • Global Trust Lab</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xl">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-black">Message Sent!</h3>
              <p className="text-xs text-neutral-500">Our support team will respond within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
              <h3 className="text-lg font-black text-black">Send a Message</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <textarea
                rows={4}
                placeholder="How can we help you?"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-4 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black resize-none"
                required
              />
              <button
                type="submit"
                className="bg-black hover:bg-neutral-800 text-white font-extrabold text-sm py-3.5 px-8 rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <span>SEND MESSAGE</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
