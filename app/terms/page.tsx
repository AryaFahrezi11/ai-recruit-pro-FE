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
  FileText
} from 'lucide-react';

export default function TermsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-[#1A4B9F] selection:text-white transition-colors duration-300">
      
      {/* -------------------- TOP NAVBAR -------------------- */}
      <Navbar />

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
