'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import {
  Building2,
  User,
  Menu,
  X,
  Lock,
  CheckCircle2
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-[#1A4B9F] selection:text-white transition-colors duration-300">
      
      {/* -------------------- TOP NAVBAR -------------------- */}
      <Navbar />

      {/* -------------------- CONTENT SECTION -------------------- */}
      <section className="flex-grow bg-slate-50/60 dark:bg-slate-950 py-10 sm:py-16 transition-colors">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          
          <div className="mb-10 text-center space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-2">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tighter leading-[1.08] text-slate-900 dark:text-white">
              Kebijakan Privasi
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200/80 dark:border-slate-800 space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base font-normal">
            
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                1. Komitmen Kami
              </h2>
              <p>
                AI-RecruitPro menjamin kerahasiaan dan keamanan data pribadi pelamar serta perusahaan secara menyeluruh. Kami berkomitmen untuk melindungi informasi Anda dengan standar keamanan tertinggi (standar ISO 27001) dan mematuhi peraturan perlindungan data yang berlaku di Indonesia.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                2. Pengumpulan Informasi
              </h2>
              <p>Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, termasuk namun tidak terbatas pada:</p>
              <ul className="space-y-3 pl-2">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Data Profil:</strong> Nama, alamat email, nomor telepon, pendidikan, dan pengalaman kerja.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Dokumen Pelamar:</strong> Resume/CV, portofolio, transkrip akademik, dan dokumen pendukung lainnya.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Data Perusahaan:</strong> Nomor Induk Berusaha (NIB), profil perusahaan, dan identitas HR yang valid.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                3. Penggunaan Analisis AI
              </h2>
              <p>
                Analisis AI kami (Natural Language Processing & Video Assessment) dirancang untuk memproses data kualifikasi teknis dan kompetensi secara murni. Sistem kecerdasan buatan kami berjalan obyektif dan independen tanpa memproses identitas pribadi sensitif (seperti ras, agama, atau gender) untuk memastikan seleksi yang adil (Anti-Bias).
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                4. Pembagian Data
              </h2>
              <p>
                Data dokumen Anda (seperti CV dan Transkrip) hanya dapat diakses oleh perekrut resmi pada posisi yang Anda lamar. Kami tidak akan pernah menjual informasi pribadi Anda kepada pihak ketiga untuk tujuan pemasaran tanpa persetujuan eksplisit dari Anda.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                5. Kendali Pengguna
              </h2>
              <p>
                Anda memiliki kendali penuh atas data Anda. Anda dapat mengakses, memperbarui, atau menghapus akun dan seluruh data yang terkait dengannya kapan saja melalui pengaturan profil di dashboard Anda.
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
