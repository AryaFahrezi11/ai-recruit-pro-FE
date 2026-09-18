'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Building2,
  GraduationCap,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Briefcase,
  Layers,
  Info
} from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';

interface NavbarProps {
  activePage?: 'home' | 'jobs' | 'categories' | 'companies' | 'about' | string;
}

export default function Navbar({ activePage }: NavbarProps) {
  const pathname = usePathname();
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine active section link
  const isHome = activePage === 'home' || pathname === '/';
  const isCompanies = activePage === 'companies' || pathname?.startsWith('/companies') || pathname?.startsWith('/applicant/companies');
  const isAbout = activePage === 'about' || pathname === '/about';
  const isJobs = activePage === 'jobs';
  const isCategories = activePage === 'categories';

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.04)] transition-all duration-300 font-sans">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 h-18 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Modern Brand Logo */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center focus:outline-hidden"
          >
            <BrandLogo size="md" showBadge={true} showSubtitle={false} />
          </Link>
        </div>

        {/* Modern Pill Nav Links (Center) */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-full border border-slate-200/70 dark:border-slate-700/60 shadow-2xs backdrop-blur-md">
          <a
            href={isHome ? '#job-feed-section' : '/#job-feed-section'}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              isJobs
                ? 'bg-white dark:bg-slate-900 text-[#1A4B9F] dark:text-blue-400 font-bold shadow-xs ring-1 ring-blue-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#1A4B9F] dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase size={14} className={isJobs ? 'text-[#1A4B9F] dark:text-blue-400' : 'opacity-60'} />
            <span>Lowongan Terbaru</span>
          </a>

          <a
            href={isHome ? '#categories-section' : '/#categories-section'}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              isCategories
                ? 'bg-white dark:bg-slate-900 text-[#1A4B9F] dark:text-blue-400 font-bold shadow-xs ring-1 ring-blue-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#1A4B9F] dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800'
            }`}
          >
            <Layers size={14} className={isCategories ? 'text-[#1A4B9F] dark:text-blue-400' : 'opacity-60'} />
            <span>Kategori Pekerjaan</span>
          </a>

          <Link
            href="/companies"
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              isCompanies
                ? 'bg-white dark:bg-slate-900 text-[#1A4B9F] dark:text-blue-400 font-bold shadow-xs ring-1 ring-blue-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#1A4B9F] dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 size={14} className={isCompanies ? 'text-[#1A4B9F] dark:text-blue-400' : 'opacity-60'} />
            <span>Perusahaan</span>
          </Link>

          <Link
            href="/about"
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              isAbout
                ? 'bg-white dark:bg-slate-900 text-[#1A4B9F] dark:text-blue-400 font-bold shadow-xs ring-1 ring-blue-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#1A4B9F] dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800'
            }`}
          >
            <Info size={14} className={isAbout ? 'text-[#1A4B9F] dark:text-blue-400' : 'opacity-60'} />
            <span>Tentang Kami</span>
          </Link>
        </nav>

        {/* Right Action: Modern Login Portal Button */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Desktop Portal Login Dropdown */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
              className="group relative px-4.5 py-2.5 bg-gradient-to-r from-[#1A4B9F] via-blue-600 to-[#2563EB] hover:from-[#153e85] hover:via-[#1a4b9f] hover:to-blue-700 text-white text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2.5 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-white/15"
            >
              <div className="w-5 h-5 rounded-lg bg-white/15 flex items-center justify-center">
                <User size={12} className="text-white" />
              </div>
              <span className="tracking-wide">Masuk Portal</span>
              <ChevronDown
                size={14}
                className={`text-blue-100 transition-transform duration-300 ease-out ${
                  isLoginDropdownOpen ? 'rotate-180 text-white' : 'group-hover:translate-y-0.5'
                }`}
              />
            </button>

            {/* Premium Dropdown Menu */}
            {isLoginDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsLoginDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-3 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-2 z-40 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Pilih Portal Akses</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </div>

                  {/* 1. Pelamar */}
                  <Link
                    href="/applicant/login"
                    onClick={() => setIsLoginDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/90 transition-all duration-150 group border border-transparent hover:border-blue-100 dark:hover:border-slate-700"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform">
                      <User size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                        <span>Pelamar Kerja</span>
                        <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#1A4B9F] dark:text-blue-400" />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight truncate">
                        Cari lowongan & screening AI
                      </div>
                    </div>
                  </Link>

                  {/* 2. Perusahaan */}
                  <Link
                    href="/perusahaan/login"
                    onClick={() => setIsLoginDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/90 transition-all duration-150 group border border-transparent hover:border-violet-100 dark:hover:border-slate-700"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                      <Building2 size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                        <span>Perusahaan</span>
                        <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight truncate">
                        Kelola rekrutmen & pelamar
                      </div>
                    </div>
                  </Link>

                  {/* 3. Perguruan Tinggi / Universitas */}
                  <Link
                    href="/campus/login"
                    onClick={() => setIsLoginDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/90 transition-all duration-150 group border border-transparent hover:border-emerald-100 dark:hover:border-slate-700"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                      <GraduationCap size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                        <span>Universitas</span>
                        <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight truncate">
                        Karir alumni & rekrutmen kampus
                      </div>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 cursor-pointer active:scale-95 transition-transform"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 shadow-2xl px-6 py-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto z-50 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-1">
            <a
              href={isHome ? '#job-feed-section' : '/#job-feed-section'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Briefcase size={18} className="text-[#1A4B9F] dark:text-blue-400" />
              <span>Lowongan Terbaru</span>
            </a>
            <a
              href={isHome ? '#categories-section' : '/#categories-section'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Layers size={18} className="text-[#1A4B9F] dark:text-blue-400" />
              <span>Kategori Pekerjaan</span>
            </a>
            <Link
              href="/companies"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Building2 size={18} className="text-[#1A4B9F] dark:text-blue-400" />
              <span>Perusahaan</span>
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Info size={18} className="text-[#1A4B9F] dark:text-blue-400" />
              <span>Tentang Kami</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Pilih Akses Login Portal
            </div>
            <Link
              href="/applicant/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
                <span>Pelamar Kerja</span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
            <Link
              href="/perusahaan/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Building2 size={16} />
                </div>
                <span>Perusahaan</span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
            <Link
              href="/campus/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <GraduationCap size={16} />
                </div>
                <span>Universitas</span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
