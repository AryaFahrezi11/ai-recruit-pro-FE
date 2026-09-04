'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';

import {
  Search,
  Building2,
  Globe,
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
import { toast } from 'react-hot-toast';
import { api, removeAuthToken } from '@/lib/api';

function PelamarDesktopNav({ navItems, pathname }: { navItems: any[]; pathname: string }) {
  const searchParams = useSearchParams();

  return (
    <nav className="hidden lg:flex items-center gap-8">
      {navItems.map((item) => {
        const itemUrl = new URL(item.href, 'http://localhost');
        const isPathActive = pathname === itemUrl.pathname;
        const itemView = itemUrl.searchParams.get('view');
        const currentView = searchParams.get('view');
        const isViewQueryMatch = itemView === currentView || (!itemView && !currentView);
        const isActive = isPathActive && isViewQueryMatch;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`text-sm font-semibold transition-colors relative ${
              isActive
                ? 'text-[#1A4B9F] dark:text-blue-400 font-bold after:content-[""] after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-[3px] after:bg-[#1A4B9F] dark:after:bg-blue-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#1A4B9F] dark:hover:text-blue-400'
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function PelamarMobileNav({ navItems, pathname }: { navItems: any[]; pathname: string }) {
  const searchParams = useSearchParams();

  return (
    <div className="lg:hidden flex items-center justify-around bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 px-2 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const itemUrl = new URL(item.href, 'http://localhost');
        const isPathActive = pathname === itemUrl.pathname;
        const itemView = itemUrl.searchParams.get('view');
        const currentView = searchParams.get('view');
        const isViewQueryMatch = itemView === currentView || (!itemView && !currentView);
        const isActive = isPathActive && isViewQueryMatch;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap ${
              isActive ? 'text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 shadow-2xs' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Icon size={16} />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}

export default function PelamarPerfectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useAppStore();
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState<{ email: string; name: string }>({
    email: 'pelamar@example.com',
    name: 'Pelamar AI'
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Exclude public authentication pages from route guard
    const isAuthPage = pathname === '/applicant/login' || pathname === '/applicant/register';

    if (isAuthPage) {
      setIsAuthenticated(true);
      return;
    }

    // Check candidate session state in localStorage
    const loggedIn = localStorage.getItem('isPelamarLoggedIn');
    // Auth guard check
    const isLoggedIn = localStorage.getItem('isPelamarLoggedIn');
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (role === 'perusahaan') {
      router.push('/dashboard');
      return;
    }

    if (!isLoggedIn && !token) {
      if (pathname.startsWith('/applicant') && pathname !== '/applicant/login' && pathname !== '/applicant/register') {
        router.push('/applicant/login');
        return;
      }
    }

    if (isLoggedIn) {
      const savedEmail = localStorage.getItem('user_email');
      const savedName = localStorage.getItem('user_name');
      if (savedEmail || savedName) {
        const formattedName = savedName || savedEmail?.split('@')[0] || 'Pelamar AI';
        setUserProfile({ email: savedEmail || 'pelamar@example.com', name: formattedName });
      }

      // Fetch from API
      api
        .get('/users/profile')
        .then((res) => {
          if (res) {
            const email = res.email || savedEmail || 'pelamar@example.com';
            const name = res.profil?.nama_lengkap || res.email?.split('@')[0] || 'Pelamar AI';
            setUserProfile({ email, name });
            localStorage.setItem('user_email', email);
          }
        })
        .catch((err) => console.error('Failed to fetch profile in layout:', err));
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
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
    setIsProfileOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('isPelamarLoggedIn');
    removeAuthToken();
    setShowLogoutModal(false);
    toast.success('Berhasil keluar dari sistem.');
    router.push('/applicant/login');
  };

  const navItems = [
    { name: t.pelamar.nav.findJobs, href: '/applicant/dashboard', icon: Search },
    { name: t.pelamar.nav.companies, href: '/applicant/dashboard?view=companies', icon: Building2 },
    { name: t.pelamar.nav.careerResources, href: '/applicant/upload-cv', icon: BookOpen },
  ];

  // If on login/register pages, render children without candidate layout navbar
  if (pathname === '/applicant/login' || pathname === '/applicant/register') {
    return <>{children}</>;
  }

  // Prevent flash while checking session
  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Navbar - JobStreet Inspired Header */}
      <header className="no-print sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">

          {/* Left Side: Brand & Main Navigation Links */}
          <div className="flex items-center gap-8">
            <Link href="/applicant/dashboard" className="flex items-center gap-2 group">
              <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
                AI-RecruitPro
              </span>
            </Link>

            {/* Navigation Tabs */}
            <Suspense fallback={<nav className="hidden lg:flex items-center gap-1" />}>
              <PelamarDesktopNav navItems={navItems} pathname={pathname} />
            </Suspense>
          </div>

          {/* Right Controls: Language, Theme, Profile Avatar Dropdown, For Employers */}
          <div className="flex items-center gap-3 sm:gap-4">



            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            {/* Profile Avatar with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full border-2 border-[#1A4B9F]/30 hover:border-[#1A4B9F] bg-white dark:bg-slate-800 transition-all cursor-pointer shadow-xs group"
              >
                <div className="w-8 h-8 rounded-full bg-[#1A4B9F] text-white flex items-center justify-center font-bold text-sm shadow-inner">
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <ChevronDown size={15} className={`text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                    <p className="text-xs font-bold text-[#1A4B9F] dark:text-blue-400">{userProfile.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{userProfile.email}</p>
                  </div>

                  <Link
                    href="/applicant/upload-cv"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EFF6FF] dark:hover:bg-slate-800 hover:text-[#1A4B9F] transition-colors"
                  >
                    <User size={16} className="text-[#1A4B9F]" />
                    <span>{t.pelamar.profile.manageProfile}</span>
                  </Link>

                  <Link
                    href="/applicant/saved"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EFF6FF] dark:hover:bg-slate-800 hover:text-[#1A4B9F] transition-colors"
                  >
                    <Bookmark size={16} className="text-[#1A4B9F]" />
                    <span>{t.pelamar.profile.savedJobs}</span>
                  </Link>

                  <Link
                    href="/applicant/status"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EFF6FF] dark:hover:bg-slate-800 hover:text-[#1A4B9F] transition-colors"
                  >
                    <ClockCheck size={16} className="text-[#1A4B9F]" />
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
        <Suspense fallback={null}>
          <PelamarMobileNav navItems={navItems} pathname={pathname} />
        </Suspense>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        {children}
      </main>

      <Footer />

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold">Konfirmasi Keluar</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Apakah Anda yakin ingin keluar?
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              Anda perlu melakukan login kembali untuk dapat melamar pekerjaan dan mengakses fitur CV ATS.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={confirmLogout}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

