'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { getApiUrl } from '@/lib/api';
import {
  Building2,
  User,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  MessageSquare
} from 'lucide-react';

export default function ContactPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [contactData, setContactData] = useState({
    email: 'support@airecruitpro.id',
    whatsapp: '+62 812-3456-7890',
    location: 'Jakarta, Indonesia'
  });

  useEffect(() => {
    fetch(getApiUrl('/config/public'))
      .then(res => res.json())
      .then(data => {
        setContactData({
          email: data.admin_email || 'support@airecruitpro.id',
          whatsapp: data.support_whatsapp || '+62 812-3456-7890',
          location: data.lokasi_kantor_pusat || 'Jakarta, Indonesia'
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-[#1A4B9F] selection:text-white transition-colors duration-300">
      
      {/* -------------------- TOP NAVBAR -------------------- */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
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

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-900 dark:text-slate-200">
            <Link href="/#job-feed-section" className="transition-colors hover:text-[#1A4B9F]">Lowongan Terbaru</Link>
            <Link href="/#categories-section" className="transition-colors hover:text-[#1A4B9F]">Kategori Pekerjaan</Link>
            <Link href="/companies" className="transition-colors hover:text-[#1A4B9F]">Perusahaan</Link>
            <Link href="/about" className="transition-colors hover:text-[#1A4B9F]">Tentang Kami</Link>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/perusahaan/login"
              className="hidden sm:inline-flex px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all items-center gap-1.5 border border-slate-200 dark:border-slate-700 shrink-0"
            >
              <Building2 size={14} />
              <span>Untuk Perusahaan</span>
            </Link>

            <Link
              href="/applicant/login"
              className="hidden sm:inline-flex px-4 py-2 bg-[#1A4B9F] hover:bg-[#133878] text-white text-xs font-bold rounded-xl transition-all items-center gap-1.5 shrink-0 shadow-2xs"
            >
              <User size={14} />
              <span>Masuk Pelamar</span>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg px-6 py-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            <Link href="/#job-feed-section" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">Lowongan Terbaru</Link>
            <Link href="/#categories-section" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">Kategori Pekerjaan</Link>
            <Link href="/companies" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">Perusahaan</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">Tentang Kami</Link>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 sm:hidden">
              <Link
                href="/applicant/login"
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700"
              >
                <User size={14} />
                <span>Masuk Pelamar</span>
              </Link>
              <Link
                href="/perusahaan/login"
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A4B9F] text-white text-xs font-bold shadow-2xs"
              >
                <Building2 size={14} />
                <span>Untuk Perusahaan</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* -------------------- CONTENT SECTION -------------------- */}
      <section className="flex-grow bg-slate-50/60 dark:bg-slate-950 py-10 sm:py-16 transition-colors">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          
          <div className="mb-10 text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tighter leading-[1.08] text-slate-900 dark:text-white">
              Hubungi Tim Bantuan
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-lg mx-auto">
              Memiliki pertanyaan terkait platform, proses registrasi, atau kendala teknis? Tim layanan pelanggan AI-RecruitPro siap sedia membantu Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Informasi Kontak</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <Mail size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Layanan</p>
                    <a href={`mailto:${contactData.email}`} className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:text-blue-500 transition-colors">{contactData.email}</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Hotline / WhatsApp</p>
                    <a href={`https://wa.me/${contactData.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:text-emerald-500 transition-colors">{contactData.whatsapp}</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Kantor Pusat</p>
                    <p className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">{contactData.location}</p>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Gedung AI-Recruit Tower Lt. 10</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 text-white flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                 <MessageSquare size={180} />
               </div>
               
               <div className="relative z-10 space-y-5">
                 <h2 className="text-2xl font-bold text-white leading-tight">Perlu Bantuan Cepat?</h2>
                 <p className="text-sm text-slate-400 leading-relaxed">
                   Tim dukungan kami aktif memonitor pertanyaan Anda pada jam operasional kerja:
                   <br/><br/>
                   <strong className="text-slate-200">Senin - Jumat: 09.00 - 18.00 WIB</strong>
                 </p>
                 
                 <div className="pt-4">
                   <a
                     href={`mailto:${contactData.email}`}
                     className="inline-flex w-full justify-center items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg transition-all cursor-pointer active:scale-95"
                   >
                     <span>Kirim Pesan via Email</span>
                   </a>
                 </div>
               </div>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------- FOOTER -------------------- */}
      <Footer />

    </div>
  );
}
