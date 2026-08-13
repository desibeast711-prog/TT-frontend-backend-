import React, { useState } from 'react';
import { Logo } from './Logo';
import { Menu, X, ArrowRight, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onCheckClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onCheckClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const desktopLinks = [
    { name: 'Product', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Community', path: '/community' },
    { name: 'Trust Intelligence', path: '/trust-intelligence' },
    { name: 'About', path: '/about' },
  ];

  const mobileLinks = [
    { name: 'Home', path: '/' },
    { name: 'Check Something', path: '/check' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Community', path: '/community' },
    { name: 'Trust Intelligence', path: '/trust-intelligence' },
    { name: 'About', path: '/about' },
    { name: 'Report a Scam', path: '/report' },
    { name: 'Help', path: '/contact' },
    { name: 'Privacy', path: '/privacy' },
    { name: 'Terms', path: '/terms' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const handleActionClick = () => {
    if (onCheckClick) {
      onCheckClick();
    } else {
      onNavigate('/check');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleLinkClick('/')}
          className="text-left focus:outline-none focus:ring-2 focus:ring-black rounded-lg p-1"
        >
          <Logo size="md" />
        </button>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {desktopLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`text-sm font-medium transition-colors hover:text-black focus:outline-none ${
                  isActive ? 'text-black font-semibold border-b-2 border-black pb-1' : 'text-neutral-600'
                }`}
              >
                {link.name}
              </button>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-5">
          <button
            onClick={() => handleLinkClick('/signin')}
            className="text-sm font-medium text-neutral-800 hover:text-black transition-colors focus:outline-none"
          >
            Sign In
          </button>
          <button
            onClick={handleActionClick}
            className="bg-black hover:bg-neutral-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm flex items-center gap-2 group focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <span>CHECK SOMETHING</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-3">
          <button
            onClick={handleActionClick}
            className="bg-black text-white text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5"
          >
            <span>CHECK</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-neutral-800 hover:text-black focus:outline-none focus:ring-2 focus:ring-black rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 bg-white border-b border-neutral-200 shadow-2xl z-40 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="px-6 py-8 flex flex-col gap-4">
            <div className="pb-4 border-b border-neutral-100 flex flex-col gap-2">
              <button
                onClick={handleActionClick}
                className="w-full bg-black text-white font-bold text-base py-3.5 px-6 rounded-xl flex items-center justify-between"
              >
                <span>CHECK SOMETHING</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 flex flex-col gap-1">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3">
                Navigation
              </span>
              {mobileLinks.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => handleLinkClick(link.path)}
                    className={`text-left text-base font-semibold py-3 px-3 rounded-lg transition-colors flex items-center justify-between ${
                      isActive ? 'bg-neutral-100 text-black' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{link.name}</span>
                    <span className="text-neutral-300">→</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
              <button
                onClick={() => handleLinkClick('/signin')}
                className="w-full text-center font-bold text-sm py-3 px-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => handleLinkClick('/signup')}
                className="w-full text-center font-bold text-sm py-3 px-4 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
