import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoIcon } from './LogoIcon';
import { useAuth } from '../hooks/useAuth';
import { Menu, X } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-6 py-5 bg-transparent">
      <div className="max-w-[88rem] mx-auto flex items-center justify-between">
        {/* LEFT: Aegis logo & 24px wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[#2E2A47] hover:opacity-90 transition-opacity"
          aria-label="Aegis Claims System"
        >
          <div className="w-[28px] h-[28px] flex items-center justify-center">
            <LogoIcon size={26} />
          </div>
          <span className="font-semibold text-[24px] tracking-tight leading-none text-[#2E2A47]">
            Aegis
          </span>
        </Link>

        {/* CENTER NAVIGATION: Desktop (Platform | Policies | Claims | Architecture) */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            type="button"
            onClick={() => scrollToSection('introduction')}
            className="text-sm font-medium text-black/70 hover:text-black transition-colors duration-200"
          >
            Platform
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('policies')}
            className="text-sm font-medium text-black/70 hover:text-black transition-colors duration-200"
          >
            Policies
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('claims')}
            className="text-sm font-medium text-black/70 hover:text-black transition-colors duration-200"
          >
            Claims
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('technology')}
            className="text-sm font-medium text-black/70 hover:text-black transition-colors duration-200"
          >
            Architecture
          </button>
        </nav>

        {/* RIGHT: Sign In & Open Dashboard Black Pill Button */}
        <div className="hidden md:flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-black/80 hover:text-black transition-colors duration-200"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/dashboard')}
            className="bg-black text-white hover:bg-gray-800 text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-200 shadow-sm"
          >
            Open Dashboard
          </button>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-black hover:bg-black/5 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200/80 px-6 py-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={() => scrollToSection('introduction')}
              className="text-left py-2 text-base font-medium text-black hover:text-neutral-600"
            >
              Platform
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('policies')}
              className="text-left py-2 text-base font-medium text-black hover:text-neutral-600"
            >
              Policies
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('claims')}
              className="text-left py-2 text-base font-medium text-black hover:text-neutral-600"
            >
              Claims
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('technology')}
              className="text-left py-2 text-base font-medium text-black hover:text-neutral-600"
            >
              Architecture
            </button>
          </div>
          <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="w-full text-center py-2.5 text-sm font-medium text-black hover:bg-black/5 rounded-full border border-neutral-300"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/dashboard');
              }}
              className="w-full text-center py-2.5 text-sm font-medium bg-black text-white hover:bg-gray-800 rounded-full"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
