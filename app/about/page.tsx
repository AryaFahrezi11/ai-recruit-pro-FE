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
  Sparkles
} from 'lucide-react';

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-[#1A4B9F] selection:text-white transition-colors duration-300">
      
      {/* -------------------- TOP NAVBAR -------------------- */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
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
            <Link href="/#job-feed-section" className="transition-colors hover:text-[#1A4B9F]">
              Lowongan Terbaru
            </Link>
            <Link href="/#categories-section" className="transition-colors hover:text-[#1A4B9F]">
              Kategori Pekerjaan
            </Link>
            <Link href="/companies" className="transition-colors hover:text-[#1A4B9F]">
              Perusahaan
            </Link>
            <Link href="/about" className="transition-colors text-[#1A4B9F] font-bold relative after:content-[''] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]">
              Tentang Kami
            </Link>
          </nav>

          {/* Right Action Controls */}
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
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-[#1A4B9F] font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              Tentang Kami
            </Link>

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

      {/* -------------------- HERO SECTION -------------------- */}
      <section className="relative pt-10 pb-12 sm:pt-16 sm:pb-20 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 transition-colors overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-slate-900 dark:text-white block">
                Tentang Kami
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
                Menghubungkan Talenta Terbaik dengan Peluang Karir Masa Depan
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl font-normal leading-relaxed mx-auto lg:mx-0">
                AI-RecruitPro adalah platform rekrutmen cerdas yang dirancang untuk menciptakan proses seleksi kerja yang transparan, efisien, dan objektif bagi pencari kerja dan perusahaan.
              </p>

              {/* Stats Strip */}
              <div className="grid grid-cols-3 sm:flex sm:flex-nowrap items-start sm:items-center gap-4 sm:gap-10 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xl sm:text-3xl font-bold block text-slate-900 dark:text-white tracking-tighter">98%</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mt-1 block leading-tight">Akurasi Match</span>
                </div>
                <div>
                  <span className="text-xl sm:text-3xl font-bold block text-slate-900 dark:text-white tracking-tighter">500k+</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mt-1 block leading-tight">Pelamar Terdaftar</span>
                </div>
                <div>
                  <span className="text-xl sm:text-3xl font-bold block text-slate-900 dark:text-white tracking-tighter">10x</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mt-1 block leading-tight">Lebih Cepat</span>
                </div>
              </div>
            </div>

            {/* Right Side: MODEL FRAME WITH FLOATING CARDS */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-full max-w-[450px] sm:max-w-[490px] aspect-[4/5] flex items-center justify-center">

                {/* Floating Analytics Glass Card 1 (Top Left) */}
                <div className="absolute top-2 -left-3 sm:-left-6 z-20 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center font-bold shrink-0">
                    <Brain size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Skill Match</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">98% Match Rate</p>
                  </div>
                </div>

                {/* Floating Analytics Glass Card 2 (Bottom Right) */}
                <div className="absolute bottom-4 -right-3 sm:-right-6 z-20 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center font-bold shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Seleksi Fair</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">100% Anti-Bias</p>
                  </div>
                </div>

                {/* Model Cutout PNG - BALANCED MEDIUM SIZE */}
                <div className="relative z-10 w-full h-full flex items-end justify-center">
                  <Image
                    src="/model_tentang_kami_hd.png"
                    alt="Model Utama AI-RecruitPro"
                    width={1024}
                    height={1024}
                    quality={100}
                    unoptimized
                    className="w-auto h-[100%] sm:h-[105%] object-contain drop-shadow-xl scale-100 sm:scale-105 origin-bottom"
                    priority
                  />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- STATS BANNER -------------------- */}
      <section className="bg-slate-50/60 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 py-10 sm:py-12 transition-colors">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold tracking-tighter text-slate-900 dark:text-white">500.000+</p>
              <p className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">Pelamar Terdaftar</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">Pencari kerja aktif dari seluruh Indonesia</p>
            </div>

            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold tracking-tighter text-slate-900 dark:text-white">2.500+</p>
              <p className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">Perusahaan Mitra</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">Startup unicorn hingga korporasi besar</p>
            </div>

            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold tracking-tighter text-slate-900 dark:text-white">98%</p>
              <p className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">Akurasi Matching</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">Pencocokan kualifikasi berbasis data NLP</p>
            </div>

            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold tracking-tighter text-slate-900 dark:text-white">10x</p>
              <p className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">Efisiensi Seleksi</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">Memangkas waktu panggilan kerja</p>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- STORY & VISION -------------------- */}
      <section className="py-10 sm:py-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column Image */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[440px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xs border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <Image
                  src="/team_meeting_model.jpg"
                  alt="Tim AI-RecruitPro Berdiskusi"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right Column Content */}
            <div className="lg:col-span-7 space-y-4">
              
              <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-slate-900 dark:text-white block">
                Visi & Misi
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Mentransformasi Rekrutmen Menjadi Lebih Transparan & Tanpa Bias
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                AI-RecruitPro lahir dari keinginan untuk memecahkan hambatan utama pencari kerja: lamaran yang hilang tanpa kepastian dan proses seleksi yang terpengaruh penilaian subjektif. Dengan mengintegrasikan sistem Natural Language Processing (NLP) dan AI Video Assessment, kami memastikan setiap kandidat mendapatkan evaluasi murni berdasarkan keahlian riil mereka.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="border-l-2 border-slate-800 dark:border-slate-200 pl-3.5 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Visi Kami</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    Menjadi platform rekrutmen AI terdepan di Asia Tenggara yang menjamin kesetaraan akses karir bagi setiap individu.
                  </p>
                </div>

                <div className="border-l-2 border-slate-400 dark:border-slate-500 pl-3.5 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Misi Kami</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    Mengeliminasi bias seleksi, memberi transparansi status pelamar, dan mempercepat pertemuan talenta dengan perusahaan impian.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------- WHY CHOOSE US -------------------- */}
      <section className="bg-slate-50/60 dark:bg-slate-950 py-10 sm:py-14 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 space-y-8">
          
          <div className="max-w-xl space-y-2">
            <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-slate-900 dark:text-white block">
              Keunggulan Utama
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Mengapa AI-RecruitPro Berbeda?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Pendekatan modern yang menempatkan kesetaraan dan kebebasan kandidat sebagai prioritas utama.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center font-bold shrink-0">
                <Brain size={18} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Analisis NLP Berbasis Konteks</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Algoritma kecerdasan kami tidak sekadar mencari kecocokan kata kunci statis, melainkan memahami kedalaman pengalaman dan keahlian riil di dalam CV Anda.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Pelacakan Status Real-Time</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Pantau setiap tahapan seleksi secara transparan dari pengulasan awal hingga tahap wawancara. Tidak ada lagi lamaran yang menggantung tanpa kejelasan.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Evaluasi Objektif Tanpa Bias</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Penilaian dirancang secara fair untuk menilai kompetensi teknis dan potensi pengembangan karir tanpa terpengaruh latar belakang personal.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------- CORE VALUES -------------------- */}
      <section className="py-10 sm:py-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-5 space-y-2">
              <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-slate-900 dark:text-white block">
                Nilai Utama
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Prinsip Kerja & Nilai Utama Kami
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Nilai-nilai fundamental yang menjadi komitmen kami dalam membangun hubungan saling percaya antara pelamar dan perusahaan.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                  <Scale size={16} />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Keadilan & Kesetaraan</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Membuka peluang karir bagi siapa pun secara objektif tanpa prasangka.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                  <Zap size={16} />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Inovasi Berkelanjutan</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Mengembangkan teknologi AI terkini untuk mempermudah proses rekrutmen.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                  <Heart size={16} />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Empati pada Pelamar</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Menghadirkan antarmuka dan pengalaman pengguna yang ramah dan solutif.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                  <Lock size={16} />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Keamanan Data (ISO)</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Menjaga kerahasiaan dokumen serta informasi pribadi pengguna secara aman.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* -------------------- CALL TO ACTION BANNER -------------------- */}
      <section className="bg-white dark:bg-slate-950 py-10 sm:py-16 transition-colors">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-8 sm:p-14 text-center space-y-5 shadow-2xl border border-slate-800 relative overflow-hidden">
            {/* Subtle Grid Background Overlay */}
            <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
            
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
                Siap Memulai Langkah Karir Berikutnya?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                Bergabunglah bersama ribuan talenta dan perusahaan yang telah merasakan kemudahan rekrutmen di AI-RecruitPro.
              </p>
              <div className="pt-1">
                <Link
                  href="/applicant/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <span>Cari Lowongan Kerja</span>
                  <ArrowRight size={16} />
                </Link>
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
