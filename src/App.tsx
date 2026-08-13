import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { CheckPage } from './pages/CheckPage';
import { CommunityPage } from './pages/CommunityPage';
import { TrustIntelligencePage } from './pages/TrustIntelligencePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ReportPage } from './pages/ReportPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { ProfilePage } from './pages/ProfilePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [reportInitialValue, setReportInitialValue] = useState<string>('');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportScamFromCheck = (targetValue: string) => {
    setReportInitialValue(targetValue);
    navigateTo('/report');
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <HomePage onNavigate={navigateTo} />;
      case '/check':
        return <CheckPage onNavigate={navigateTo} />;
      case '/community':
        return <CommunityPage onNavigate={navigateTo} />;
      case '/trust-intelligence':
        return <TrustIntelligencePage onNavigate={navigateTo} />;
      case '/how-it-works':
        return <HowItWorksPage onNavigate={navigateTo} />;
      case '/about':
        return <AboutPage onNavigate={navigateTo} />;
      case '/report':
        return <ReportPage initialValue={reportInitialValue} onNavigate={navigateTo} />;
      case '/signin':
        return <SignInPage onNavigate={navigateTo} />;
      case '/signup':
        return <SignUpPage onNavigate={navigateTo} />;
      case '/profile':
        return <ProfilePage onNavigate={navigateTo} />;
      case '/privacy':
        return <PrivacyPage />;
      case '/terms':
        return <TermsPage />;
      case '/contact':
        return <ContactPage />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans selection:bg-black selection:text-white antialiased">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigateTo}
        onCheckClick={() => navigateTo('/check')}
      />

      <main className="flex-1">{renderPage()}</main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
}
