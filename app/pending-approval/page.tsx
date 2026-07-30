'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Lock
} from 'lucide-react';

export default function PendingApprovalPage() {
  const [companyName, setCompanyName] = useState('PT Tokopedia Indonesia');
  const [nibNumber, setNibNumber] = useState('9120101928123');
  const [hrName, setHrName] = useState('Bambang Setyono');
  const [whatsapp, setWhatsapp] = useState('081298765432');

  useEffect(() => {
    // Read submitted details from localStorage if present
    const savedCompany = localStorage.getItem('pendingCompanyName');
    const savedNib = localStorage.getItem('pendingNibNumber');
    const savedHr = localStorage.getItem('pendingHrName');
    const savedWa = localStorage.getItem('pendingWhatsapp');

    if (savedCompany) setCompanyName(savedCompany);
    if (savedNib) setNibNumber(savedNib);
    if (savedHr) setHrName(savedHr);
    if (savedWa) setWhatsapp(savedWa);
  }, []);

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

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E0F1F7] text-[#1b7b9e] text-xs font-bold border border-[#B8E1ED]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          Status Akun: PENDING APPROVAL
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

          {/* Time Estimate Banner */}
          <div className="p-4 rounded-2xl bg-[#F0F8FB] border border-[#C2E5EF] flex items-center justify-center gap-3 text-xs sm:text-sm font-bold text-[#1b7b9e]">
            <ShieldCheck size={20} className="shrink-0" />
            <span>Estimasi Waktu Persetujuan: Maksimal 1 x 24 Jam Kerja</span>
          </div>

          {/* Submitted Data Summary Box */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-extrabold text-xs text-[#1b7b9e] uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 size={16} /> Rincian Berkas Legalitas Yang Dikirim
              </span>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-md">
                Menunggu Acc Admin
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
              *Setelah disetujui oleh admin, pemberitahuan resmi dan akses penuh ke Dashboard HR akan otomatis dikirimkan melalui email perusahaan Anda.
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Kembali ke Beranda
            </Link>

            <button
              onClick={() => alert('Customer Support Administrator AI-Recruit Pro dapat dihubungi melalui WhatsApp Admin: 0812-9900-8800 (Jam Kerja: 08.00 - 17.00 WIB)')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all inline-flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              Hubungi Support Admin Developer
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#C2E5EF] bg-white text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} AI-Recruit Pro Account Approval Engine. All Rights Reserved.
      </footer>

    </div>
  );
}
