import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getUserProfile } from '../services/api';
import { supabase } from '../lib/supabase';
import { User, ShieldCheck, Bookmark, Bell, Flag, Clock, Loader2 } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertsOn, setAlertsOn] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getUserProfile().then((data) => {
      if (isMounted) {
        if (data) {
          setProfile(data);
          setAlertsOn(data.alertsEnabled);
        } else {
          // Default fallback if not signed in
          setProfile({
            id: 'GUEST-000',
            name: 'TrulyTrue User',
            email: 'user@trulytrue.org',
            joinedDate: 'August 2026',
            savedChecksCount: 0,
            reportsSubmittedCount: 0,
            alertsEnabled: true,
          });
        }
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    onNavigate('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-neutral-600 font-bold text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading Profile...</span>
        </div>
      </div>
    );
  }

  const currentProfile = profile || {
    id: 'GUEST-000',
    name: 'TrulyTrue User',
    email: 'user@trulytrue.org',
    joinedDate: 'August 2026',
    savedChecksCount: 0,
    reportsSubmittedCount: 0,
    alertsEnabled: true,
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Card */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center font-black text-2xl">
              {currentProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-black">{currentProfile.name}</h1>
              <p className="text-xs font-semibold text-neutral-500">{currentProfile.email}</p>
              <span className="text-[11px] text-neutral-400 font-medium">Member since {currentProfile.joinedDate}</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-extrabold px-4 py-2.5 rounded-xl transition-colors w-fit"
          >
            Sign Out
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-neutral-200 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-neutral-100 text-black rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-black">{currentProfile.savedChecksCount}</span>
              <span className="text-xs text-neutral-500 block font-medium">Saved Checks</span>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-neutral-100 text-black rounded-xl">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-black">{currentProfile.savedChecksCount}</span>
              <span className="text-xs text-neutral-500 block font-medium">Saved Items</span>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-neutral-100 text-black rounded-xl">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-black">{currentProfile.reportsSubmittedCount}</span>
              <span className="text-xs text-neutral-500 block font-medium">Submitted Reports</span>
            </div>
          </div>
        </div>

        {/* Alerts & Settings */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-black text-black uppercase tracking-tight">Trust Intelligence Alerts</h3>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-sky-600" />
              <div>
                <p className="text-sm font-bold text-black">Regional Scam Spike Alerts</p>
                <p className="text-xs text-neutral-500">Receive notifications when new high-risk scam patterns emerge in your area.</p>
              </div>
            </div>

            <button
              onClick={() => setAlertsOn(!alertsOn)}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${
                alertsOn ? 'bg-black' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  alertsOn ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
