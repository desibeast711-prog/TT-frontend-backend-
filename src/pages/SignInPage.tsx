import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SignInPageProps {
  onNavigate: (path: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [signedIn, setSignedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password');
        setLoading(false);
        return;
      }
    }

    setSignedIn(true);
    setLoading(false);
    setTimeout(() => {
      onNavigate('/profile');
    }, 1000);
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setErrorMsg('');
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/profile',
        },
      });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
    } else {
      setSignedIn(true);
      setTimeout(() => onNavigate('/profile'), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <Logo size="md" />
          <h2 className="text-2xl font-black text-black pt-2">Welcome Back</h2>
          <p className="text-xs text-neutral-500 font-medium">
            Sign in to access saved checks and alert notifications.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {signedIn ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="font-bold text-lg text-black">Signed in successfully!</p>
            <p className="text-xs text-neutral-500">Redirecting to your profile...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Social Logins */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="w-full bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('apple')}
                className="w-full bg-black text-white hover:bg-neutral-800 font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.09c.68-.83 1.14-1.99.01-3.09-1.01.04-2.25.68-2.96 1.51-.62.72-1.16 1.89-.01 2.99 1.13.09 2.28-.58 2.96-1.41z" />
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 absolute">
                Or with Email
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" className="text-xs font-semibold text-neutral-500 hover:text-black">
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SIGNING IN...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs font-semibold text-neutral-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/signup')}
                  className="text-black font-extrabold underline"
                >
                  Create Account
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
