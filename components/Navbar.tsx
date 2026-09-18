'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  User,
  Building2,
  GraduationCap,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

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
            className="flex items-center gap-3 group"
          >
            <Image
              src="/logo_hd.png"
              alt="AI-RecruitPro Logo"
              width={280}
              height={280}
              quality={100}
              unoptimized
              className="h-13 sm:h-15 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
              priority
            />
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
              AI-RecruitPro
            </span>
          </Link>
        </div>

        {/* Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-900 dark:text-slate-200">
          <a
            href={isHome ? '#job-feed-section' : '/#job-feed-section'}
            className={`transition-colors relative ${
              isJobs ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'
            }`}
          >
            Lowongan Terbaru
          </a>
          <a
            href={isHome ? '#categories-section' : '/#categories-section'}
            className={`transition-colors relative ${
              isCategories ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'
            }`}
          >
            Kategori Pekerjaan
          </a>
          <Link
            href="/companies"
            className={`transition-colors relative ${
              isCompanies ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'
            }`}
          >
            Perusahaan
          </Link>
          <Link
            href="/about"
            className={`transition-colors relative ${
              isAbout ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'
            }`}
          >
            Tentang Kami
          </Link>
        </nav>

        {/* Right Action Controls: Login Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Desktop Portal Login Dropdown */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
              className="px-4 py-2 bg-[#1A4B9F] hover:bg-[#133878] text-white text-xs font-bold rounded-xl transition-all duration-150 flex items-center gap-2 border border-[#1A4B9F] cursor-pointer shadow-xs hover:scale-105 active:scale-95"
            >
              <User size={14} className="text-white" />
              <span>Login</span>
              <ChevronDown
                size={14}
                className={`text-blue-100 transition-transform duration-200 ${
                  isLoginDropdownOpen ? 'rotate-180' : ''
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

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 mb-1">
              Pilih Akses Login
            </div>
            <Link
              href="/applicant/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-[#1A4B9F] transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                <User size={15} />
              </div>
              <span>Pelamar</span>
            </Link>
            <Link
              href="/perusahaan/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-[#1A4B9F] transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                <Building2 size={15} />
              </div>
              <span>Perusahaan</span>
            </Link>
            <Link
              href="/campus/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-[#1A4B9F] transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                <GraduationCap size={15} />
              </div>
              <span>Universitas</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}