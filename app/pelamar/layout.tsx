'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Search,
  Building2,
  Globe,
  Sun,
  Moon,
  User,
  Bookmark,
  ClockCheck,
  LogOut,
  ChevronDown,
  FileText,
  Briefcase,
  Sparkles,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

export default function PelamarPerfectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, language, setLanguage } = useAppStore();
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Exclude public authentication pages from route guard
    const isAuthPage = pathname === '/pelamar/login' || pathname === '/pelamar/register';

    if (isAuthPage) {
      setIsAuthenticated(true);
      return;
    }

    // Check candidate session state in localStorage
    const loggedIn = localStorage.getItem('isPelamarLoggedIn');
    if (!loggedIn || loggedIn !== 'true') {
      setIsAuthenticated(false);
      router.push('/pelamar/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  // Handle clicking outside profile dropdown to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isPelamarLoggedIn');
    setIsProfileOpen(false);
    router.push('/pelamar/login');
  };

  const navItems = [
    { name: t.pelamar.nav.findJobs, href: '/pelamar/dashboard', icon: Search },
    { name: t.pelamar.nav.companies, href: '/pelamar/dashboard?view=companies', icon: Building2 },
    { name: t.pelamar.nav.careerResources, href: '/pelamar/upload-cv', icon: BookOpen },
  ];

  // If on login/register pages, render children without candidate layout navbar
  if (pathname === '/pelamar/login' || pathname === '/pelamar/register') {
    return <>{children}</>;
  }

  // Prevent flash while checking session
  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Navbar - JobStreet Inspired Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">

          {/* Left Side: Brand & Main Navigation Links */}
          <div className="flex items-center gap-8">
            <Link href="/pelamar/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#2596be] flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:scale-105 transition-transform duration-200">
                RP
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#0c2b3d] dark:text-white leading-none">
                  AI-Recruit <span className="text-[#2596be]">Pro</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  {t.pelamar.header.portalName}
                </span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href.includes('view=') && typeof window !== 'undefined' && window.location.search.includes('view=companies') && item.href.includes('view=companies'));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${
                      isActive
                        ? 'text-[#2596be] dark:text-cyan-400 font-extrabold after:content-[""] after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-[#2596be]'
                        : 'text-slate-600 dark:text-slate-300 hover:text-[#2596be] dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Language, Theme, Profile Avatar Dropdown, For Employers */}
          <div className="flex items-center gap-3 sm:gap-4">

            {/* Toggle Language Dropdown */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Ganti Bahasa"
            >
              <Globe size={15} className="text-[#2596be]" />
              <span>{t.pelamar.header.language} ({language.toUpperCase()})</span>
            </button>

            {/* Toggle Theme Dark/Light Mode */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Ubah Tema (Gelap/Terang)"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Link Untuk Perusahaan */}
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-[#2596be] dark:text-cyan-400 hover:underline px-3 py-1.5 rounded-full hover:bg-cyan-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Building2 size={15} />
              <span>{t.pelamar.header.forEmployers}</span>
            </Link>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            {/* Profile Avatar with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full border-2 border-[#2596be]/30 hover:border-[#2596be] bg-white dark:bg-slate-800 transition-all cursor-pointer shadow-xs group"
              >
                <div className="w-8 h-8 rounded-full bg-[#2596be] text-white flex items-center justify-center font-black text-sm shadow-inner">
                  A
                </div>
                <ChevronDown size={15} className={`text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                    <p className="text-xs font-black text-[#2596be] dark:text-cyan-400">Budi Pratama</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">budi.pratama@gmail.com</p>
                  </div>

                  <Link
                    href="/pelamar/upload-cv"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#F0F8FB] dark:hover:bg-slate-800 hover:text-[#2596be] transition-colors"
                  >
                    <User size={16} className="text-[#2596be]" />
                    <span>{t.pelamar.profile.manageProfile}</span>
                  </Link>

                  <Link
                    href="/pelamar/tersimpan"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#F0F8FB] dark:hover:bg-slate-800 hover:text-[#2596be] transition-colors"
                  >
                    <Bookmark size={16} className="text-[#2596be]" />
                    <span>{t.pelamar.profile.savedJobs}</span>
                  </Link>

                  <Link
                    href="/pelamar/status"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#F0F8FB] dark:hover:bg-slate-800 hover:text-[#2596be] transition-colors"
                  >
                    <ClockCheck size={16} className="text-[#2596be]" />
                    <span>{t.pelamar.profile.applicationHistory}</span>
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>{t.pelamar.profile.logout}</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation Bar Links */}
        <div className="lg:hidden flex items-center justify-around bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 px-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap ${
                  isActive ? 'text-[#2596be] bg-white dark:bg-slate-800 shadow-2xs' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#2596be]">AI-Recruit Pro</span>
            <span>&copy; {new Date().getFullYear()} PO-FIT Recruitment Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 bg-[#F0F8FB] dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 px-4 py-1.5 rounded-full font-bold text-xs border border-[#C2E5EF] dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#2596be] animate-pulse"></span>
              {t.pelamar.footer.systemActive}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
