'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {

  const handleHomeClick = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 py-10 sm:py-14 mt-auto no-print border-t border-slate-800/80 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 space-y-10">
        
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Brand & Mission Column (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-6">
            <Link href="/" onClick={handleHomeClick} className="flex items-center gap-3 group">
              <Image
                src="/logo_hd.png"
                alt="AI-RecruitPro Logo"
                width={160}
                height={160}
                quality={100}
                unoptimized
                className="h-9 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
              />
              <span className="font-bold text-lg text-white tracking-tight">AI-RecruitPro</span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm max-w-md">
              Platform rekrutmen berbasis AI yang menghubungkan talenta terbaik dengan perusahaan teknologi terkemuka secara fair, cepat, dan transparan.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Sistem Terenkripsi & Terverifikasi</span>
            </div>
          </div>

          {/* Column 1: Navigasi Utama (Menu Navbar) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase">Menu Utama</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/" onClick={handleHomeClick} className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <a href="/#job-feed-section" className="hover:text-white transition-colors">
                  Lowongan Terbaru
                </a>
              </li>
              <li>
                <a href="/#categories-section" className="hover:text-white transition-colors">
                  Kategori Pekerjaan
                </a>
              </li>
              <li>
                <Link href="/companies" className="hover:text-white transition-colors">
                  Direktori Perusahaan
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Portal & Fitur */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase">Akses & Fitur</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/applicant/login" className="hover:text-white transition-colors">
                  Portal Pelamar Kerja
                </Link>
              </li>
              <li>
                <Link href="/perusahaan/login" className="hover:text-white transition-colors">
                  Portal Mitra Perusahaan
                </Link>
              </li>
              <li>
                <a href="/#features-pillars" className="hover:text-white transition-colors">
                  Fitur AI Matching
                </a>
              </li>
              <li>
                <a href="/#success-stories" className="hover:text-white transition-colors">
                  Kisah Sukses & Ulasan
                </a>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Registrasi Perusahaan
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Bantuan */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase">Bantuan & Legal</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors text-left cursor-pointer inline-block"
                >
                  Kontak & Support
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors text-left cursor-pointer inline-block"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors text-left cursor-pointer inline-block"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar Footer */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} AI-RecruitPro. Hak Cipta Dilindungi.</p>
          
          <div className="flex items-center gap-6">
            <span>Indonesia (ID)</span>
          </div>
        </div>

      </div>
    </footer>
  );
}




