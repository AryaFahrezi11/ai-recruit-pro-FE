'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  User,
  Building2,
  GraduationCap,
  ChevronDown,
  Menu,
  X,
  Bookmark,
  ClockCheck,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';

interface NavbarProps {
  activePage?: 'home' | 'jobs' | 'categories' | 'companies' | 'about' | string;
}

export default function Navbar({ activePage }: NavbarProps) {
  const pathname = usePathname();
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authState, setAuthState] = useState<{
    isLoggedIn: boolean;
    role: string | null;
    targetUrl: string;
    displayName: string;
    accountBadge: string;
    userInitial: string;
    email: string;
  }>({
    isLoggedIn: false,
    role: null,
    targetUrl: '/applicant/dashboard',
    displayName: 'Pelamar',
    accountBadge: 'Pencari Kerja',
    userInitial: 'A',
    email: '',
  });

  useEffect(() => {
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setIsLoginDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setIsUserDropdownOpen(false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('isPelamarLoggedIn');
    localStorage.removeItem('isPerusahaanLoggedIn');
    setAuthState({
      isLoggedIn: false,
      role: null,
      targetUrl: '/applicant/dashboard',
      displayName: 'Pelamar',
      accountBadge: 'Pencari Kerja',
      userInitial: 'A',
      email: '',
    });
    window.location.href = '/';
  };

  useEffect(() => {
    setMounted(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const role = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
      const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null;
      const savedName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : null;

      if (token) {
        let url = '/applicant/dashboard';
        let badge = 'Pencari Kerja';
        let defaultName = 'Pelamar';

        if (role === 'perusahaan') {
          url = '/jobs';
          badge = 'Perusahaan';
          defaultName = 'Perusahaan';
        } else if (role === 'campus') {
          url = '/campus/dashboard';
          badge = 'Perguruan Tinggi';
          defaultName = 'Universitas';
        } else if (role === 'admin' || role === 'superadmin') {
          url = '/admin/dashboard';
          badge = 'Administrator';
          defaultName = 'Admin';
        }

        const rawName = savedName || (savedEmail ? savedEmail.split('@')[0] : null);
        const name = rawName || defaultName;
        const initial = (rawName || defaultName).charAt(0).toUpperCase() || 'U';

        setAuthState({
          isLoggedIn: true,
          role,
          targetUrl: url,
          displayName: name,
          accountBadge: badge,
          userInitial: initial,
          email: savedEmail || '',
        });

        // Sync fresh profile name & email from API if pelamar
        if (role === 'pelamar' || !role) {
          api
            .get('/users/profile')
            .then((res: any) => {
              if (res) {
                const fullName = res.profil?.nama_lengkap || res.name;
                const email = res.email || savedEmail;
                if (fullName) {
                  localStorage.setItem('user_name', fullName);
                  setAuthState((prev) => ({
                    ...prev,
                    displayName: fullName,
                    email: email || prev.email,
                    userInitial: fullName.charAt(0).toUpperCase(),
                  }));
                }
              }
            })
            .catch(() => null);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Determine active section link
  const isHome = activePage === 'home' || pathname === '/';
  const isCompanies = activePage === 'companies' || pathname?.startsWith('/companies') || pathname?.startsWith('/applicant/companies');
  const isAbout = activePage === 'about' || pathname === '/about';
  const isJobs = activePage === 'jobs';
  const isCategories = activePage === 'categories';

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-300 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 h-20 flex items-center justify-between">

        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 sm:gap-2.5 group"
          >
            <Image
              src="/logo_hd.png"
              alt="AI-RecruitPro Logo"
              width={280}
              height={280}
              quality={100}
              unoptimized
              className="h-7 sm:h-9 md:h-10 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
              priority
            />
            <span className="font-extrabold text-xs sm:text-sm md:text-base tracking-tight text-slate-900 dark:text-white leading-none">
              AI-RecruitPro
            </span>
          </Link>
        </div>

        {/* Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-900 dark:text-slate-200">
          <a
            href={isHome ? '#job-feed-section' : '/#job-feed-section'}
            className={`transition-colors relative ${isJobs ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'
              }`}
          >
            Lowongan Terbaru
          </a>
          <a
            href={isHome ? '#categories-section' : '/#categories-section'}
            className={`transition-colors relative ${isCategories ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'
              }`}
          >
            Kategori Pekerjaan
          </a>
          <Link
            href="/companies"
            className={`transition-colors relative ${isCompanies ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'
              }`}
          >
            Perusahaan
          </Link>
          <Link
            href="/about"
            className={`transition-colors relative ${isAbout ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'
              }`}
          >
            Tentang Kami
          </Link>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">

          {/* Desktop Auth Button / Dropdown */}
          <div className="relative hidden sm:block">
            {mounted && authState.isLoggedIn ? (
              <div className="relative">
                {/* Minimalist Profile Button matching applicant layout */}
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="relative flex items-center gap-2 p-1 rounded-full border-2 border-[#1A4B9F]/30 hover:border-[#1A4B9F] bg-white dark:bg-slate-800 transition-all cursor-pointer shadow-xs group"
                >
                  <div className="relative w-8 h-8 rounded-full bg-[#1A4B9F] text-white flex items-center justify-center font-bold text-sm shadow-inner">
                    {authState.userInitial}
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-slate-500 transition-transform duration-200 ${
                      isUserDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu matching applicant layout exactly */}
                {isUserDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-1.5 z-40 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                        <p className="text-xs font-bold text-[#1A4B9F] dark:text-blue-400 truncate">
                          {authState.displayName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {authState.email}
                        </p>
                      </div>

                      {authState.role === 'pelamar' || !authState.role ? (
                        <>
                          <Link
                            href="/applicant/upload-cv"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EFF6FF] dark:hover:bg-slate-800 hover:text-[#1A4B9F] transition-colors"
                          >
                            <User size={16} className="text-[#1A4B9F]" />
                            <span>Kelola Profil & CV</span>
                          </Link>

                          <Link
                            href="/applicant/saved"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EFF6FF] dark:hover:bg-slate-800 hover:text-[#1A4B9F] transition-colors"
                          >
                            <Bookmark size={16} className="text-[#1A4B9F]" />
                            <span>Lowongan Disimpan</span>
                          </Link>

                          <Link
                            href="/applicant/status"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EFF6FF] dark:hover:bg-slate-800 hover:text-[#1A4B9F] transition-colors"
                          >
                            <ClockCheck size={16} className="text-[#1A4B9F]" />
                            <span>Riwayat Lamaran</span>
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={authState.targetUrl}
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EFF6FF] dark:hover:bg-slate-800 hover:text-[#1A4B9F] transition-colors"
                        >
                          <Building2 size={16} className="text-[#1A4B9F]" />
                          <span>Buka {authState.displayName}</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1"></div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
                      >
                        <LogOut size={16} />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                  className="px-4 py-2 bg-[#1A4B9F] hover:bg-[#133878] text-white text-xs font-bold rounded-full transition-all duration-150 flex items-center gap-2 border border-[#1A4B9F] cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                >
                  <User size={14} className="text-white" />
                  <span>Login</span>
                  <ChevronDown
                    size={14}
                    className={`text-blue-100 transition-transform duration-200 ${isLoginDropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isLoginDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsLoginDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-1.5 z-40 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Pilih Akses Login
                      </div>

                      {/* 1. Pelamar */}
                      <Link
                        href="/applicant/login"
                        onClick={() => setIsLoginDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-150 group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 group-hover:border-[#1A4B9F] dark:group-hover:border-blue-400 group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 transition-all shadow-2xs">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 transition-colors">
                            Pelamar
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                            Cari lowongan & kelola CV
                          </div>
                        </div>
                      </Link>

                      {/* 2. Perusahaan */}
                      <Link
                        href="/perusahaan/login"
                        onClick={() => setIsLoginDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-150 group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 group-hover:border-[#1A4B9F] dark:group-hover:border-blue-400 group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 transition-all shadow-2xs">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 transition-colors">
                            Perusahaan
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                            Kelola lowongan & pelamar
                          </div>
                        </div>
                      </Link>

                      {/* 3. Perguruan Tinggi / Universitas */}
                      <Link
                        href="/campus/login"
                        onClick={() => setIsLoginDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-150 group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 group-hover:border-[#1A4B9F] dark:group-hover:border-blue-400 group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 transition-all shadow-2xs">
                          <GraduationCap size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 transition-colors">
                            Universitas
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                            Pantau karir alumni & mahasiswa
                          </div>
                        </div>
                      </Link>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg px-6 py-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto z-50">
          <a
            href={isHome ? '#job-feed-section' : '/#job-feed-section'}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800"
          >
            Lowongan Terbaru
          </a>
          <a
            href={isHome ? '#categories-section' : '/#categories-section'}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800"
          >
            Kategori Pekerjaan
          </a>
          <Link
            href="/companies"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800"
          >
            Perusahaan
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800"
          >
            Tentang Kami
          </Link>

          {mounted && authState.isLoggedIn ? (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href={authState.targetUrl}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#1A4B9F] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs">
                    {authState.userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 transition-colors truncate">
                      {authState.displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                      {authState.email || authState.accountBadge}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#1A4B9F] dark:text-blue-400 flex items-center gap-0.5 shrink-0 ml-2">
                  Buka Akun
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Pilih Akses Login
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/applicant/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 hover:border-[#1A4B9F] dark:hover:border-blue-500 active:scale-95 transition-all text-center group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-2 group-hover:bg-[#1A4B9F]/10 group-hover:text-[#1A4B9F] transition-colors">
                    <User size={18} />
                  </div>
                  <span className="text-xs font-bold truncate max-w-full">Pelamar</span>
                </Link>

                <Link
                  href="/perusahaan/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 hover:border-[#1A4B9F] dark:hover:border-blue-500 active:scale-95 transition-all text-center group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-2 group-hover:bg-[#1A4B9F]/10 group-hover:text-[#1A4B9F] transition-colors">
                    <Building2 size={18} />
                  </div>
                  <span className="text-xs font-bold truncate max-w-full">Perusahaan</span>
                </Link>

                <Link
                  href="/campus/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 hover:border-[#1A4B9F] dark:hover:border-blue-500 active:scale-95 transition-all text-center group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-2 group-hover:bg-[#1A4B9F]/10 group-hover:text-[#1A4B9F] transition-colors">
                    <GraduationCap size={18} />
                  </div>
                  <span className="text-xs font-bold truncate max-w-full">Universitas</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}