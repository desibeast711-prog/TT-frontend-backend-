import React, { useState } from 'react';
import { GeoScamData } from '../types';
import { DEMO_GEO_INTELLIGENCE } from '../data/mockData';
import { Globe, MapPin, Shield, ShieldAlert, Lock, Info, ChevronRight, Search, Filter } from 'lucide-react';

interface GeographicIntelligenceProps {
  geoData?: GeoScamData[];
}

export const GeographicIntelligence: React.FC<GeographicIntelligenceProps> = ({ 
  geoData = DEMO_GEO_INTELLIGENCE 
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('IN');
  const [selectedStateName, setSelectedStateName] = useState<string>('Bihar');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Patna');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scopeMode, setScopeMode] = useState<'district' | 'state' | 'country'>('district');

  const safeGeoData = (Array.isArray(geoData) && geoData.length > 0) ? geoData : DEMO_GEO_INTELLIGENCE;
  const currentCountry = safeGeoData.find((c) => c.code === selectedCountryCode) || safeGeoData[0] || DEMO_GEO_INTELLIGENCE[0];
  const currentState = currentCountry.states?.find((s) => s.name === selectedStateName) || currentCountry.states?.[0];
  const currentDistrict = currentState?.districts?.find((d) => d.name === selectedDistrictName) || currentState?.districts?.[0];

  const categoriesList = [
    'ALL',
    'Bank Fraud',
    'UPI Scam',
    'Digital Arrest',
    'Phishing',
    'Fake Customer Support',
    'Investment Scam',
    'Fake Job Offer',
    'Delivery Scam',
  ];

  // Derive top scams depending on scope and category filter
  const baseTopScams = scopeMode === 'district' 
    ? (currentDistrict?.topScams || [])
    : scopeMode === 'state'
    ? (currentState?.topScams || [])
    : (currentCountry?.topScams || []);

  const filteredTopScams = baseTopScams.filter((scam) => {
    const matchesCat = selectedCategoryFilter === 'ALL' || scam.category === selectedCategoryFilter;
    const matchesSearch = !searchQuery || scam.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-neutral-200">
        <div>
          <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-neutral-800 mb-3">
            <Globe className="w-4 h-4 text-sky-500" />
            <span>GEOGRAPHIC THREAT MATRIX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
            Regional Scam Prevalence & Local Search
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 font-medium mt-1">
            Discover which scam types prevail in specific districts, states, and global regions.
          </p>
        </div>

        {/* Mandatory Privacy Guarantee Badge */}
        <div className="bg-neutral-900 text-white p-4 sm:p-5 rounded-2xl max-w-md flex items-start gap-3 border border-neutral-800 shadow-md">
          <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-extrabold text-white mb-1">STRICT PRIVACY PROTECTION</p>
            <p className="text-neutral-300 leading-normal">
              Locations are aggregated at district and regional levels to safeguard community reporter privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Scope Switcher & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
        {/* Scope Mode Buttons */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => setScopeMode('district')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              scopeMode === 'district' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            District Level
          </button>
          <button
            onClick={() => setScopeMode('state')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              scopeMode === 'state' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            State Level
          </button>
          <button
            onClick={() => setScopeMode('country')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              scopeMode === 'country' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Country Level
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center md:col-span-2">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district, state or scam type (e.g. Patna, Digital Arrest, UPI, Bangalore)..."
            className="w-full bg-white border border-neutral-300 font-medium text-xs text-black placeholder:text-neutral-400 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs font-bold text-neutral-400 hover:text-black"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Scam Type:
        </span>
        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategoryFilter === cat
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Region Hierarchy Selectors */}
      <div className="flex flex-wrap items-center gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2">
          Select Location:
        </span>

        {/* Country Selector */}
        <div className="flex items-center gap-2">
          {safeGeoData.map((country) => (
            <button
              key={country.code}
              onClick={() => {
                setSelectedCountryCode(country.code);
                if (country.states?.[0]) {
                  setSelectedStateName(country.states[0].name);
                  if (country.states[0].districts?.[0]) {
                    setSelectedDistrictName(country.states[0].districts[0].name);
                  }
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCountryCode === country.code
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
              }`}
            >
              {country.country}
            </button>
          ))}
        </div>

        {/* State Selector */}
        {currentCountry.states && currentCountry.states.length > 0 && (
          <div className="flex items-center gap-2 pl-3 border-l border-neutral-300">
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
            {currentCountry.states.map((st) => (
              <button
                key={st.name}
                onClick={() => {
                  setSelectedStateName(st.name);
                  if (st.districts?.[0]) {
                    setSelectedDistrictName(st.districts[0].name);
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedStateName === st.name
                    ? 'bg-neutral-800 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        )}

        {/* District Selector */}
        {currentState?.districts && currentState.districts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pl-3 border-l border-neutral-300">
            <span className="text-[11px] font-bold text-neutral-400 mr-1">District:</span>
            {currentState.districts.map((d) => (
              <button
                key={d.name}
                onClick={() => setSelectedDistrictName(d.name)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  selectedDistrictName === d.name
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Aggregated Data Card Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Geographic Focus Details */}
        <div className="lg:col-span-2 bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 text-sky-400 text-sm font-bold">
                <MapPin className="w-5 h-5" />
                <span>
                  {currentCountry?.country} {selectedStateName ? `› ${selectedStateName}` : ''} {currentDistrict ? `› ${currentDistrict.name}` : ''}
                </span>
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
                {currentCountry?.riskLevel || 'SUSPICIOUS'} THREAT
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-1">
                {scopeMode === 'district' && currentDistrict 
                  ? currentDistrict.totalReports 
                  : scopeMode === 'state' && currentState 
                  ? currentState.totalReports 
                  : (currentCountry?.totalReports || 0)}{' '}
                <span className="text-lg font-normal text-neutral-400">aggregated reports</span>
              </h3>
              <p className="text-xs text-neutral-400 font-medium">
                Verified community logs aggregated across local telecom & banking circles in {selectedDistrictName || selectedStateName}.
              </p>
            </div>

            {/* Top Scams List */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-3">
                Prevailed Scam Types in {scopeMode === 'district' ? selectedDistrictName : selectedStateName}
              </h4>

              {filteredTopScams.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-4">
                  No scam types match the selected filter query in this area.
                </p>
              ) : (
                filteredTopScams.map((scam, idx) => (
                  <div key={idx} className="bg-neutral-800 p-3.5 rounded-xl flex items-center justify-between text-sm hover:bg-neutral-75 transition-colors">
                    <span className="font-bold text-neutral-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      {scam.category}
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-300 bg-neutral-900 border border-neutral-700 px-3 py-1 rounded-md">
                      {scam.count} incidents reported
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>District Intelligence Engine: Live Aggregation</span>
            <span className="text-emerald-400 font-semibold">Zero Personal Identifier Logs</span>
          </div>
        </div>

        {/* Summary Side Card */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <h4 className="text-sm font-extrabold text-black uppercase tracking-wider mb-4">
              Local to Global Breakdown
            </h4>

            <div className="space-y-3">
              <div className="bg-white p-3.5 rounded-xl border border-neutral-200">
                <span className="text-[11px] font-bold text-neutral-400 uppercase block mb-0.5">
                  Local District ({selectedDistrictName || 'Patna'})
                </span>
                <span className="text-xl font-black text-black">
                  {(currentDistrict?.totalReports || 0).toLocaleString()} Reports
                </span>
              </div>

              {currentCountry?.states && currentCountry.states.length > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-neutral-200">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase block mb-0.5">
                    State Level ({selectedStateName})
                  </span>
                  <span className="text-xl font-black text-black">
                    {(currentState?.totalReports || 0).toLocaleString()} Reports
                  </span>
                </div>
              )}

              <div className="bg-white p-3.5 rounded-xl border border-neutral-200">
                <span className="text-[11px] font-bold text-neutral-400 uppercase block mb-0.5">
                  National / Global ({currentCountry?.country || 'India'})
                </span>
                <span className="text-xl font-black text-black">
                  {(currentCountry?.totalReports || 0).toLocaleString()} Reports
                </span>
              </div>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-xs text-sky-900 leading-relaxed font-medium">
            <Info className="w-4 h-4 text-sky-600 mb-2" />
            <p>
              Scam syndicates systematically test fake investment offers or digital arrest calls in specific district hubs before escalating globally. TrulyTrue flags these regional waves early.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

