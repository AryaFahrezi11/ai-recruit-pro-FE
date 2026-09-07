'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import {
  Building2,
  Users,
  Target,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Brain,
  Zap,
  Menu,
  X,
  User,
  Scale,
  Heart,
  Award,
  Lock,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#1A4B9F] selection:text-white transition-colors">
      
      {/* -------------------- TOP NAVBAR (EXACTLY IDENTICAL TO LANDING PAGE) -------------------- */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-3 group"
            >
              <Image
                src="/Logo Ai Recruit Pro..png"
                alt="AI-RecruitPro Logo"
                width={70}
                height={70}
                className="h-13 sm:h-15 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
                priority
              />
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                AI-RecruitPro
              </span>
            </Link>
          </div>

          {/* Clean Nav Links - EXACTLY matches Landing Page */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-900 dark:text-slate-200">
            <Link href="/#job-feed-section" className="hover:text-[#1A4B9F] transition-colors">
              Lowongan Terbaru
            </Link>
            <Link href="/#categories-section" className="hover:text-[#1A4B9F] transition-colors">
              Kategori Pekerjaan
            </Link>
            <Link href="/companies" className="hover:text-[#1A4B9F] transition-colors">
              Perusahaan
            </Link>
            <Link href="/#success-stories" className="hover:text-[#1A4B9F] transition-colors">
              Kisah Sukses
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/applicant/login"
              className="hidden sm:inline-flex px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <User size={15} />
              <span>Masuk</span>
            </Link>

            <Link
              href="/perusahaan/login"
              className="hidden sm:inline-flex px-4 py-2 bg-[#1A4B9F] hover:bg-[#133878] text-white text-sm font-bold rounded-lg transition-colors items-center gap-1.5 shadow-2xs"
            >
              <Building2 size={15} />
              <span>Untuk Perusahaan</span>
            </Link>

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
          <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg px-6 py-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            <Link href="/#job-feed-section" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              Lowongan Terbaru
            </Link>
            <Link href="/#categories-section" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              Kategori Pekerjaan
            </Link>
            <Link href="/companies" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              Perusahaan
            </Link>
            <Link href="/#success-stories" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              Kisah Sukses
            </Link>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 sm:hidden">
              <Link
                href="/applicant/login"
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold border border-slate-200 dark:border-slate-700"
              >
                <User size={16} />
                <span>Masuk</span>
              </Link>
              <Link
                href="/perusahaan/login"
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A4B9F] hover:bg-[#133878] text-white text-sm font-bold shadow-sm"
              >
                <Building2 size={16} />
                <span>Untuk Perusahaan</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* -------------------- HERO SECTION (CLEAN HUMANIST WHITE BRAND DESIGN) -------------------- */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-6 sm:px-10 lg:px-16 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 transition-colors">
        
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-sans font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
                Menghubungkan Talenta Terbaik Indonesia dengan Peluang Karir Masa Depan
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl font-normal leading-relaxed mx-auto lg:mx-0">
                AI-RecruitPro adalah platform rekrutmen berbasis kecerdasan buatan (AI) dan Natural Language Processing (NLP) yang dirancang untuk menciptakan proses seleksi kerja yang transparan, cepat, dan objektif bagi pencari kerja dan perusahaan.
              </p>



              {/* Stats Strip */}
              <div className="grid grid-cols-3 sm:flex sm:flex-nowrap items-start sm:items-center gap-4 sm:gap-12 pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-2xl sm:text-4xl font-extrabold block text-[#1A4B9F] dark:text-blue-400">98%</span>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mt-1 block leading-tight">Akurasi Match</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-4xl font-extrabold block text-[#1A4B9F] dark:text-blue-400">500k+</span>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mt-1 block leading-tight">Pelamar Terdaftar</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-4xl font-extrabold block text-[#1A4B9F] dark:text-blue-400">10x</span>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mt-1 block leading-tight">Lebih Cepat</span>
                </div>
              </div>
            </div>

            {/* Right Side: CLEAN CORPORATE MODEL FRAME */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-full max-w-[460px] aspect-[4/5] flex items-center justify-center">
                
                {/* Modern Soft Background Card Accent */}
                <div className="absolute inset-0 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md pointer-events-none" />

                {/* Floating Analytics Glass Card 1 (Top Left) */}
                <div className="absolute top-4 -left-4 sm:-left-6 z-20 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-md flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A4B9F] flex items-center justify-center font-bold shrink-0">
                    <Brain size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Skill Match</p>
                    <p className="text-sm font-extrabold text-[#1A4B9F]">98% Match Rate</p>
                  </div>
                </div>

                {/* Floating Analytics Glass Card 2 (Bottom Right) */}
                <div className="absolute bottom-6 -right-3 sm:-right-6 z-20 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-md flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seleksi Fair</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">100% Anti-Bias</p>
                  </div>
                </div>

                {/* Model Cutout PNG */}
                <div className="relative z-10 w-full h-full flex items-end justify-center pt-6">
                  <Image
                    src="/model_tentang_kami_transparent.png"
                    alt="Model Utama AI-RecruitPro"
                    width={440}
                    height={480}
                    className="w-auto h-[96%] object-contain drop-shadow-md"
                    priority
                  />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- STATS BANNER -------------------- */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 transition-colors">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="space-y-2">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#1A4B9F]">500.000+</p>
              <p className="text-[#1A4B9F] font-bold text-base">Pelamar Terdaftar</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Pencari kerja aktif dari seluruh Indonesia</p>
            </div>

            <div className="space-y-2">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#1A4B9F]">2.500+</p>
              <p className="text-[#1A4B9F] font-bold text-base">Perusahaan Mitra</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Startup unicorn hingga korporasi besar</p>
            </div>

            <div className="space-y-2">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#1A4B9F]">98%</p>
              <p className="text-[#1A4B9F] font-bold text-base">Akurasi Matching</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Pencocokan kualifikasi berbasis data NLP</p>
            </div>

            <div className="space-y-2">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#1A4B9F]">10x</p>
              <p className="text-[#1A4B9F] font-bold text-base">Efisiensi Seleksi</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Memangkas waktu panggilan kerja</p>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- STORY & VISION -------------------- */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column Image */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[460px] aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Image
                  src="/team_meeting_model.jpg"
                  alt="Tim AI-RecruitPro Berdiskusi"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right Column Content */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Mentransformasi Rekrutmen Menjadi Lebih Transparan & Tanpa Bias
              </h2>

              <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
                AI-RecruitPro lahir dari keinginan untuk memecahkan hambatan utama pencari kerja: lamaran yang hilang tanpa kepastian dan proses seleksi yang terpengaruh penilaian subjektif. Dengan mengintegrasikan sistem Natural Language Processing (NLP) dan AI Video Assessment, kami memastikan setiap kandidat mendapatkan evaluasi murni berdasarkan keahlian riil mereka.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="border-l-4 border-[#1A4B9F] pl-4 space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Visi Kami</h3>
                  <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                    Menjadi platform rekrutmen AI terdepan di Asia Tenggara yang menjamin kesetaraan akses karir bagi setiap individu.
                  </p>
                </div>

                <div className="border-l-4 border-emerald-500 pl-4 space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Misi Kami</h3>
                  <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                    Mengeliminasi bias seleksi, memberi transparansi status pelamar, dan mempercepat pertemuan talenta dengan perusahaan impian.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- WHY CHOOSE US -------------------- */}
      <section className="bg-white dark:bg-slate-900 py-20 px-6 sm:px-10 lg:px-16 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1400px] mx-auto space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Mengapa AI-RecruitPro Berbeda?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
              Pendekatan modern yang menempatkan kesetaraan dan kebebasan kandidat sebagai prioritas utama.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#E8F1FC] dark:bg-blue-900/30 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center font-bold">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Analisis NLP Berbasis Konteks</h3>
              <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                Algoritma kecerdasan kami tidak sekadar mencari kecocokan kata kunci statis, melainkan memahami kedalaman pengalaman dan keahlian riil di dalam CV Anda.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#E8F1FC] dark:bg-blue-900/30 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center font-bold">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pelacakan Status Real-Time</h3>
              <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                Pantau setiap tahapan seleksi secara transparan dari pengulasan awal hingga tahap wawancara. Tidak ada lagi lamaran yang menggantung tanpa kejelasan.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#E8F1FC] dark:bg-blue-900/30 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center font-bold">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Evaluasi Objektif Tanpa Bias</h3>
              <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                Penilaian dirancang secara fair untuk menilai kompetensi teknis dan potensi pengembangan karir tanpa terpengaruh latar belakang personal.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------- CORE VALUES -------------------- */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Prinsip Kerja & Nilai Utama Kami
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
              Nilai-nilai fundamental yang menjadi komitmen kami dalam membangun hubungan saling percaya antara pelamar dan perusahaan.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
              <Scale className="text-[#1A4B9F] dark:text-blue-400 mb-1" size={26} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Keadilan & Kesetaraan</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Membuka peluang karir bagi siapa pun secara objektif tanpa prasangka.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
              <Zap className="text-[#1A4B9F] dark:text-blue-400 mb-1" size={26} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Inovasi Berkelanjutan</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Mengembangkan teknologi AI terkini untuk mempermudah proses rekrutmen.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
              <Heart className="text-[#1A4B9F] dark:text-blue-400 mb-1" size={26} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Empati pada Pelamar</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Menghadirkan antarmuka dan pengalaman pengguna yang ramah dan solutif.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
              <Lock className="text-[#1A4B9F] dark:text-blue-400 mb-1" size={26} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Keamanan Data (ISO)</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Menjaga kerahasiaan dokumen serta informasi pribadi pengguna secara aman.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------- CALL TO ACTION BANNER (BRAND NAVY) -------------------- */}
      <section className="bg-[#1A4B9F] text-white py-16 px-6 sm:px-10 lg:px-16">
        <div className="max-w-[1200px] mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Siap Memulai Langkah Karir Berikutnya?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto font-normal">
            Bergabunglah bersama ribuan talenta dan perusahaan yang telah merasakan kemudahan rekrutmen di AI-RecruitPro.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/applicant/register"
              className="px-8 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm rounded-md transition-all shadow-md"
            >
              Cari Lowongan Kerja
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------- FOOTER -------------------- */}
      <Footer />

    </div>
  );
}
