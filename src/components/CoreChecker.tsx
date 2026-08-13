import React, { useState, useRef } from 'react';
import { CheckType, AnalysisResult } from '../types';
import { SAMPLE_PRESETS } from '../data/mockData';
import { analyzeItem } from '../services/api';
import { ResultCard } from './ResultCard';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Phone as PhoneIcon, 
  Mail as MailIcon, 
  CreditCard, 
  AtSign, 
  Upload, 
  X, 
  Sparkles, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

interface CoreCheckerProps {
  onResultGenerated?: (result: AnalysisResult) => void;
  defaultType?: CheckType;
}

export const CoreChecker: React.FC<CoreCheckerProps> = ({ onResultGenerated, defaultType = 'text' }) => {
  const [activeTab, setActiveTab] = useState<CheckType>(defaultType);
  const [queryInput, setQueryInput] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Initiating Trust Intelligence Scan...');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { id: CheckType; label: string; icon: React.ReactNode; placeholder: string }[] = [
    { id: 'text', label: 'TEXT', icon: <MessageSquare className="w-4 h-4" />, placeholder: 'Paste a suspicious message here...' },
    { id: 'screenshot', label: 'SCREENSHOT', icon: <ImageIcon className="w-4 h-4" />, placeholder: 'Upload screenshot of message, chat, or alert' },
    { id: 'url', label: 'URL', icon: <LinkIcon className="w-4 h-4" />, placeholder: 'Paste a website link (e.g. https://...)' },
    { id: 'phone', label: 'PHONE', icon: <PhoneIcon className="w-4 h-4" />, placeholder: 'Enter phone number (e.g. 98765 43210)' },
    { id: 'email', label: 'EMAIL', icon: <MailIcon className="w-4 h-4" />, placeholder: 'Enter sender email address...' },
    { id: 'upi', label: 'UPI', icon: <CreditCard className="w-4 h-4" />, placeholder: 'Enter UPI ID / VPA (e.g. pay-bill@ybl)...' },
    { id: 'social', label: 'SOCIAL MESSAGE', icon: <AtSign className="w-4 h-4" />, placeholder: 'Paste social media message or username...' },
  ];

  const handleTabChange = (tabId: CheckType) => {
    setActiveTab(tabId);
    setErrorMsg(null);
    setAnalysisResult(null);
    if (tabId !== 'screenshot') {
      setScreenshotPreview(null);
    }
  };

  const handlePresetSelect = (presetValue: string) => {
    setQueryInput(presetValue);
    setErrorMsg(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('File size exceeds 10MB limit. Please select a smaller screenshot.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotPreview(reader.result as string);
        setQueryInput('Screenshot uploaded: ' + file.name);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunCheck = async () => {
    setErrorMsg(null);
    let finalQuery = queryInput.trim();

    if (activeTab === 'phone') {
      finalQuery = `${selectedCountryCode} ${finalQuery}`.trim();
    }

    if (activeTab === 'screenshot' && !screenshotPreview) {
      setErrorMsg('Please upload a screenshot image to analyze.');
      return;
    }

    if (activeTab !== 'screenshot' && !finalQuery) {
      setErrorMsg('Please enter something to check before proceeding.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Consulting Trust Intelligence Database...');

    const stepTimer = setTimeout(() => {
      setLoadingStep('Running Gemini AI scam pattern analysis...');
    }, 600);

    try {
      const result = await analyzeItem(
        activeTab,
        finalQuery,
        activeTab === 'screenshot' && screenshotPreview ? screenshotPreview : undefined
      );

      setAnalysisResult(result);
      if (onResultGenerated) {
        onResultGenerated(result);
      }
    } catch (err) {
      setErrorMsg('Analysis temporary unavailable. Please check input and try again.');
    } finally {
      clearTimeout(stepTimer);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setQueryInput('');
    setScreenshotPreview(null);
    setErrorMsg(null);
  };

  return (
    <section id="core-checker-section" className="py-12 bg-neutral-50 border-y border-neutral-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black mb-3">
            CHECK ANYTHING.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 font-medium">
            “Something doesn't feel right? Put it here.”
          </p>
        </div>

        {/* Unified Checker Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 shadow-xl overflow-hidden p-4 sm:p-8 transition-all">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-neutral-100">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide whitespace-nowrap transition-all focus:outline-none ${
                    isActive
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Preset Example Chips */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
              Try sample:
            </span>
            {SAMPLE_PRESETS[activeTab]?.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(preset.value)}
                className="text-xs font-semibold bg-neutral-100 hover:bg-black hover:text-white text-neutral-700 px-3 py-1.5 rounded-lg border border-neutral-200 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Dynamic Inputs */}
          <div className="space-y-4 mb-6">
            {/* Phone Specific Country Selector */}
            {activeTab === 'phone' && (
              <div className="flex items-center gap-3">
                <select
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="bg-neutral-100 border border-neutral-300 font-semibold text-sm text-black rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="+91">🇮🇳 India (+91)</option>
                  <option value="+1">🇺🇸 USA / Canada (+1)</option>
                  <option value="+44">🇬🇧 UK (+44)</option>
                  <option value="+971">🇦🇪 UAE (+971)</option>
                  <option value="+61">🇦🇺 Australia (+61)</option>
                  <option value="+65">🇸🇬 Singapore (+65)</option>
                </select>
                <input
                  type="tel"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Paste or type phone number..."
                  className="flex-1 bg-neutral-50 border border-neutral-300 font-semibold text-base text-black placeholder:text-neutral-400 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                />
              </div>
            )}

            {/* Screenshot Drag & Drop / File Input */}
            {activeTab === 'screenshot' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {!screenshotPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-300 hover:border-black rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-colors bg-neutral-50 hover:bg-neutral-100/60 flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-black mb-1">
                        Upload or drop screenshot here
                      </p>
                      <p className="text-xs text-neutral-500 font-medium">
                        Supports PNG, JPG, WEBP up to 10MB. Text will be extracted & analyzed.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-neutral-300 bg-neutral-900 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot preview"
                        className="w-20 h-20 object-cover rounded-xl border border-neutral-700"
                      />
                      <div className="text-white text-sm">
                        <p className="font-bold">Screenshot Attached</p>
                        <p className="text-xs text-neutral-400">Ready for Trust Intelligence OCR Scan</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setScreenshotPreview(null)}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full transition-colors"
                      aria-label="Remove screenshot"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Standard Text/URL/Email/UPI/Social Inputs */}
            {activeTab !== 'phone' && activeTab !== 'screenshot' && (
              <div className="relative">
                <textarea
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  rows={activeTab === 'text' || activeTab === 'social' ? 4 : 2}
                  placeholder={tabs.find((t) => t.id === activeTab)?.placeholder}
                  className="w-full bg-neutral-50 border border-neutral-300 font-medium text-base text-black placeholder:text-neutral-400 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-none"
                />
                {queryInput && (
                  <button
                    onClick={() => setQueryInput('')}
                    className="absolute top-3 right-3 text-neutral-400 hover:text-black p-1 text-xs font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-neutral-500 font-medium">
              🔒 Private & Anonymous • No account required
            </span>

            <button
              onClick={handleRunCheck}
              disabled={isLoading}
              className="w-full sm:w-auto bg-black hover:bg-neutral-800 disabled:bg-neutral-400 text-white text-base font-extrabold px-8 py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-3 focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>ANALYZING...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  <span>CHECK WITH TRULYTRUE</span>
                </>
              )}
            </button>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="mt-6 pt-6 border-t border-neutral-100 flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-black border-t-transparent animate-spin mb-3" />
              <p className="font-bold text-base text-black mb-1">{loadingStep}</p>
              <p className="text-xs text-neutral-500">Cross-referencing scam patterns, URLs, and community records</p>
            </div>
          )}
        </div>

        {/* Display Analysis Result Component right below */}
        {analysisResult && (
          <div className="mt-10 scroll-mt-24" id="result-display-anchor">
            <ResultCard result={analysisResult} onReset={handleReset} />
          </div>
        )}
      </div>
    </section>
  );
};
