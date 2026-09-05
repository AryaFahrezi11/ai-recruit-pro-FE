'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api';
import {
  ShieldCheck,
  AlertCircle,
  Building2,
  CheckCircle2,
  FileCheck2,
  RefreshCw,
  LogOut,
  Edit,
  MessageSquare,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('-');
  const [nibNumber, setNibNumber] = useState('-');
  const [hrName, setHrName] = useState('-');
  const [whatsapp, setWhatsapp] = useState('-');
  const [isChecking, setIsChecking] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isIncomplete, setIsIncomplete] = useState(false);

  const fetchStatus = async () => {
    setIsChecking(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    // Read saved details from localStorage as fallback
    const savedCompany = localStorage.getItem('pendingCompanyName');
    const savedNib = localStorage.getItem('pendingNibNumber');
    const savedHr = localStorage.getItem('pendingHrName');
    const savedWa = localStorage.getItem('pendingWhatsapp');

    if (savedCompany) setCompanyName(savedCompany);
    if (savedNib) setNibNumber(savedNib);
    if (savedHr) setHrName(savedHr);
    if (savedWa) setWhatsapp(savedWa);

    if (token) {
      try {
        const res = await fetch(getApiUrl('/users/profile'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const p = data.profil;
          if (p) {
            if (p.nama_perusahaan) setCompanyName(p.nama_perusahaan);
            if (p.nib_number) setNibNumber(p.nib_number);
            if (p.hr_name) setHrName(p.hr_name);
            if (p.hr_whatsapp) setWhatsapp(p.hr_whatsapp);

            if (!p.has_completed_profile) {
              setIsIncomplete(true);
            } else if (p.is_verified) {
              setIsApproved(true);
              toast.success('Selamat! Akun perusahaan Anda telah disetujui Admin!');
            }
          }
        }
      } catch (e) {
        // network issue
      }
    }
    setIsChecking(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans antialiased">

      {/* Corporate Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 sm:px-10">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Logo Ai Recruit Pro..png"
              alt="AI-RecruitPro Logo"
              width={40}
              height={40}
              className="h-9 w-auto object-contain shrink-0"
              priority
            />
            <div className="flex flex-col justify-center">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                AI-RecruitPro
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Portal Perusahaan
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isApproved 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
              {isApproved ? 'TERVERIFIKASI' : 'MENUNGGU VERIFIKASI'}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut size={14} className="text-black dark:text-white" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 shadow-xs border border-slate-200 dark:border-slate-800 space-y-8 w-full">

          {/* Corporate Workflow Status Tracker */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Proses Pengajuan Akun</span>
              <span>Tahap 2 dari 3</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Step 1 */}
              <div className="flex flex-col gap-1.5">
                <div className="h-1.5 w-full bg-emerald-500 rounded-full"></div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> 1. Registrasi
                </span>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col gap-1.5">
                <div className={`h-1.5 w-full rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                <span className={`text-[11px] font-bold ${isApproved ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'} flex items-center gap-1`}>
                  {isApproved ? <CheckCircle2 size={12} /> : <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0"></span>} 
                  2. Verifikasi Tim
                </span>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col gap-1.5">
                <div className={`h-1.5 w-full rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                <span className={`text-[11px] font-semibold ${isApproved ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'} flex items-center gap-1`}>
                  {isApproved ? <CheckCircle2 size={12} /> : <Lock size={11} />} 
                  3. Akses Portal
                </span>
              </div>
            </div>
          </div>

          {/* Heading Section */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Verifikasi Pendaftaran Perusahaan
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Dokumen legalitas dan data perwakilan HRD Anda telah berhasil diterima. Tim Compliance Administrator sedang melakukan pengecekan keabsahan berkas NIB &amp; ID Card untuk menjaga keamanan jaringan rekrutmen.
            </p>
          </div>

          {/* Conditional Banners */}
          {isApproved ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">Persetujuan Selesai!</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">Akun perusahaan Anda telah disetujui secara penuh.</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="shrink-0 px-4 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Buka Dashboard <ArrowRight size={14} />
              </Link>
            </div>
          ) : isIncomplete ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200">Berkas Belum Lengkap</h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400">Silakan melengkapi dokumen pendukung pada Tahap 3.</p>
                </div>
              </div>
              <Link
                href="/register?step=3"
                className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit size={14} /> Lengkapi Dokumen
              </Link>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <ShieldCheck size={16} className="text-black dark:text-white shrink-0" />
              <span>Estimasi waktu verifikasi dokumen: <strong>Maksimal 1 x 24 Jam Kerja</strong>.</span>
            </div>
          )}

          {/* Submitted Data Key-Value Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 size={15} className="text-black dark:text-white" /> Berkas Legalitas Terdaftar
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase border ${
                isApproved 
                  ? 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' 
                  : isIncomplete 
                    ? 'text-rose-700 bg-rose-100 border-rose-200' 
                    : 'text-amber-800 bg-amber-100 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
              }`}>
                {isApproved ? 'Acc Admin' : isIncomplete ? 'Belum Lengkap' : 'Dalam Proses'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Nama Perusahaan</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">{companyName}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Nomor NIB / NPWP</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">{nibNumber}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Perwakilan HRD</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">{hrName}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">WhatsApp HRD</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">{whatsapp}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              onClick={fetchStatus}
              disabled={isChecking}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} className={`text-black dark:text-white ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Memeriksa...' : 'Cek Status Terbaru'}</span>
            </button>

            <button
              onClick={() => toast('Layanan Bantuan Administrator AI-Recruit Pro: WhatsApp 0812-9900-8800 (Jam Kerja: 08.00 - 17.00 WIB)', { duration: 5000, icon: '💬' })}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <MessageSquare size={14} className="text-white" />
              <span>Hubungi Admin</span>
            </button>
          </div>

        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">
        &copy; {new Date().getFullYear()} AI-RecruitPro Enterprise. Hak Cipta Dilindungi Undang-Undang.
      </footer>

    </div>
  );
}
