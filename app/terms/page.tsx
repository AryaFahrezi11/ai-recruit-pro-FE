'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import {
  Building2,
  User,
  Menu,
  X,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function TermsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-2">
              <FileText size={32} />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tighter leading-[1.08] text-slate-900 dark:text-white">
              Syarat & Ketentuan
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200/80 dark:border-slate-800 space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base font-normal">
            
            <div className="space-y-4">
              <p>
                Selamat datang di AI-RecruitPro. Dengan mengakses dan menggunakan platform ini, Anda menyetujui dan tunduk pada Syarat dan Ketentuan berikut. Harap membaca dengan saksama. Penggunaan layanan AI-RecruitPro tunduk pada prinsip transparansi dan integritas profesional.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                1. Keabsahan Informasi
              </h2>
              <p>
                Pengguna (baik pelamar maupun perusahaan) menjamin kebenaran, keaslian, dan kemutakhiran seluruh dokumen dan data yang diunggah. Memalsukan dokumen atau memberikan informasi yang menyesatkan dapat mengakibatkan penangguhan atau penghapusan akun secara permanen.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                2. Kerahasiaan Perusahaan
              </h2>
              <p>
                Segala informasi mengenai proses seleksi, struktur wawancara, dan materi soal tes yang disediakan oleh perusahaan bersifat sangat rahasia. Pelamar setuju untuk tidak menyebarluaskan, mendistribusikan, atau mereproduksi informasi tersebut ke pihak manapun.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                3. Penggunaan Wajar & Anti Manipulasi
              </h2>
              <p>
                Pengguna dilarang keras melakukan manipulasi sistem, menggunakan bot otomatis untuk melamar, memalsukan hasil penilaian AI, atau melakukan aktivitas lain yang merugikan fungsi normal platform maupun pengguna lainnya. Pelanggaran terhadap aturan ini dapat dikenakan sanksi hingga jalur hukum yang berlaku.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                4. Batasan Tanggung Jawab
              </h2>
              <p>
                Meskipun AI-RecruitPro menyediakan algoritma kecocokan (AI Matching) yang tingkat akurasinya tinggi, keputusan penerimaan akhir sepenuhnya merupakan hak prerogatif mutlak dari perusahaan yang merekrut. AI-RecruitPro tidak menjamin penempatan kerja secara pasti.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                5. Perubahan Syarat dan Ketentuan
              </h2>
              <p>
                AI-RecruitPro berhak sewaktu-waktu memperbarui atau mengubah Syarat dan Ketentuan ini. Perubahan akan diinformasikan kepada pengguna melalui platform. Melanjutkan penggunaan platform setelah perubahan berarti Anda menyetujui syarat yang telah diperbarui.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------- FOOTER -------------------- */}
      <Footer />

    </div>
  );
}
