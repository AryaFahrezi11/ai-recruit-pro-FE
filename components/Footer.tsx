'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShieldCheck, FileText, Lock, Mail, Phone, MapPin, HelpCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

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
                <button
                  onClick={() => setActiveModal('contact')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Kontak & Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Kebijakan Privasi
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Syarat & Ketentuan
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar Footer */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} AI-RecruitPro. Hak Cipta Dilindungi.</p>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Sistem Normal</span>
            </div>
            <span className="text-slate-700">|</span>
            <span>Indonesia (ID)</span>
          </div>
        </div>

      </div>

      {/* Interactive Modals (Privacy, Terms, Contact) */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-800 relative space-y-5 max-h-[85vh] overflow-y-auto">
            
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Privacy Modal */}
            {activeModal === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-400">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Kebijakan Privasi</h3>
                </div>
                <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    AI-RecruitPro menjamin kerahasiaan dan keamanan data pribadi pelamar serta perusahaan secara menyeluruh.
                  </p>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>Data dokumen (CV, Transkrip) hanya diakses oleh perekrut resmi pada posisi yang Anda lamar.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>Analisis AI berjalan obyektif dan independen tanpa memproses identitas pribadi sensitif.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>Anda memiliki kendali penuh untuk memperbarui atau menghapus akun kapan saja.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terms Modal */}
            {activeModal === 'terms' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-indigo-400">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Syarat & Ketentuan Penggunaan</h3>
                </div>
                <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Penggunaan layanan AI-RecruitPro tunduk pada prinsip transparansi dan integritas profesional:
                  </p>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-slate-300">
                    <p>1. <strong>Keabsahan Informasi:</strong> Pengguna menjamin kebenaran seluruh dokumen dan data yang diunggah.</p>
                    <p>2. <strong>Kerahasiaan Perusahaan:</strong> Informasi mengenai proses seleksi dan soal wawancara bersifat rahasia.</p>
                    <p>3. <strong>Penggunaan Wajar:</strong> Dilarang keras melakukan manipulasi sistem atau aktivitas yang merugikan pengguna lain.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Modal */}
            {activeModal === 'contact' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-400">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <HelpCircle size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Hubungi Tim Bantuan</h3>
                </div>
                <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Memiliki pertanyaan atau kendala saat mengunggah CV / video wawancara? Tim layanan pelanggan kami siap membantu Anda.
                  </p>
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-blue-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Email Layanan</div>
                        <div className="text-white font-medium">support@airecruitpro.id</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Hotline WhatsApp</div>
                        <div className="text-white font-medium">+62 812-3456-7890</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-purple-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Lokasi</div>
                        <div className="text-white font-medium">Jakarta, Indonesia</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup Informasi
              </button>
            </div>

          </div>
        </div>
      )}
    </footer>
  );
}




