'use client';

import React, { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api';
import {
  Clock,
  ShieldCheck,
  AlertCircle,
  Building2,
  User,
  CheckCircle2,
  Mail,
  Phone,
  ArrowLeft,
  MessageSquare,
  HelpCircle,
  FileCheck2,
  Lock,
  RefreshCw,
  LogOut,
  Edit
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
    <div className="min-h-screen bg-[#F0F8FB] text-[#1b7b9e] flex flex-col justify-between font-sans antialiased">

      {/* Top Header */}
      <header className="py-6 px-6 sm:px-12 max-w-[1600px] w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#1b7b9e] text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
            RP
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-[#0c2b3d] leading-none">
              AI-Recruit <span className="text-[#1D7FA1]">Pro</span>
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
              Portal Perusahaan
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E0F1F7] text-[#1b7b9e] text-xs font-bold border border-[#B8E1ED]">
            <span className={`w-2.5 h-2.5 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            Status Akun: {isApproved ? 'APPROVED' : 'PENDING APPROVAL'}
          </div>

          <button
            onClick={handleLogout}
            title="Keluar / Ganti Akun"
            className="p-2 rounded-xl border border-[#B8E1ED] text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-[#C2E5EF] space-y-8 text-center relative overflow-hidden">

          {/* Animated Clock Icon */}
          <div className="w-20 h-20 bg-[#E0F1F7] border-2 border-[#B8E1ED] rounded-3xl flex items-center justify-center text-[#1b7b9e] mx-auto shadow-sm relative">
            <Clock size={40} className="animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-black text-[10px] shadow-sm">
              !
            </div>
          </div>

          {/* Heading & Notice */}
          <div className="space-y-3 max-w-xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 font-extrabold text-xs border border-amber-200 uppercase tracking-wider">
              Verification In Progress • ID: #REG-89123
            </span>

            <h1 className="text-2xl sm:text-4xl font-black text-[#1b7b9e] leading-tight">
              Pendaftaran Berhasil Dikirim &amp; Dalam Peninjauan Admin
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
              Terima kasih telah melengkapi data legalitas perusahaan &amp; perwakilan HRD. Tim Administrator AI-Recruit Pro saat ini sedang memverifikasi keabsahan Dokumen NIB/NPWP dan ID Card Perusahaan Anda demi menjaga keamanan &amp; kualitas ekosistem rekrutmen.
            </p>
          </div>

          {/* Conditional Alerts */}
          {isApproved ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-900 text-left">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={28} className="text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Akun Perusahaan Berhasil Disetujui!</h3>
                  <p className="text-xs text-emerald-700">Verifikasi dokumen Anda telah selesai. Anda sekarang dapat mengakses dashboard rekrutmen secara penuh.</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="shrink-0 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all"
              >
                Masuk ke Dashboard &rarr;
              </Link>
            </div>
          ) : isIncomplete ? (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-900 text-left">
              <div className="flex items-center gap-3">
                <AlertCircle size={28} className="text-amber-600 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Data &amp; Dokumen Belum Lengkap!</h3>
                  <p className="text-xs text-amber-700">Mohon lengkapi profil perusahaan dan berkas fisik NIB serta KTP/ID Card di Tahap 3.</p>
                </div>
              </div>
              <Link
                href="/register?step=3"
                className="shrink-0 px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2"
              >
                <Edit size={16} /> Lengkapi Dokumen (Tahap 3)
              </Link>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F0F8FB] border border-[#C2E5EF] flex items-center justify-center gap-3 text-xs sm:text-sm font-bold text-[#1b7b9e]">
              <ShieldCheck size={20} className="shrink-0" />
              <span>Estimasi Waktu Persetujuan: Maksimal 1 x 24 Jam Kerja</span>
            </div>
          )}

          {/* Submitted Data Summary Box */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-extrabold text-xs text-[#1b7b9e] uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 size={16} /> Rincian Berkas Legalitas Yang Dikirim
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                isApproved 
                  ? 'text-emerald-700 bg-emerald-100' 
                  : isIncomplete 
                    ? 'text-red-700 bg-red-100' 
                    : 'text-amber-700 bg-amber-100'
              }`}>
                {isApproved ? 'Telah Disetujui' : isIncomplete ? 'Belum Lengkap' : 'Menunggu Acc Admin'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Nama Perusahaan Resmi:</span>
                <span className="font-bold text-slate-800 text-sm">{companyName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Nomor NIB / NPWP:</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{nibNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Perwakilan HRD:</span>
                <span className="font-bold text-slate-800 text-sm">{hrName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Nomor WhatsApp Aktif:</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{whatsapp}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 italic">
              *Setelah disetujui oleh admin, akses penuh ke Dashboard HR otomatis aktif untuk akun email perusahaan Anda.
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={fetchStatus}
              disabled={isChecking}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#1b7b9e] text-[#1b7b9e] hover:bg-[#E0F1F7] font-extrabold text-xs sm:text-sm transition-all inline-flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
              <span>{isChecking ? 'Memeriksa...' : 'Periksa Status Ulang'}</span>
            </button>

            {isIncomplete && (
              <Link
                href="/register?step=3"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all inline-flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Lengkapi Data Tahap 3
              </Link>
            )}

            <button
              onClick={() => toast('Customer Support Administrator AI-Recruit Pro dapat dihubungi melalui WhatsApp Admin: 0812-9900-8800 (Jam Kerja: 08.00 - 17.00 WIB)', { duration: 5000, icon: '📞' })}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all inline-flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              Hubungi Admin
            </button>
          </div>

        </div>
      </main>

      <Footer />

    </div>
  );
}
