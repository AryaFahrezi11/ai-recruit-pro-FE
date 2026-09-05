'use client';

import React, { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getApiUrl, getMediaUrl } from '@/lib/api';
import {
  Clock,
  ShieldCheck,
  AlertCircle,
  Building2,
  User,
  CheckCircle2,
  Mail,
  Phone,
  Briefcase,
  FileCheck2,
  FileText,
  CreditCard,
  Calendar,
  ExternalLink,
  RefreshCw,
  LogOut,
  Edit,
  MessageSquare
} from 'lucide-react';

interface UserProfileData {
  user_id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string | null;
  profil?: {
    id: string;
    nama_perusahaan: string;
    nib_number?: string;
    nib_document_url?: string;
    hr_name?: string;
    hr_whatsapp?: string;
    hr_position?: string;
    hr_id_card_url?: string;
    is_verified?: boolean;
    has_completed_profile?: boolean;
    alamat?: string;
    kota?: string;
    provinsi?: string;
  };
}

export default function PendingApprovalPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchStatus = async () => {
    setIsChecking(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    if (!token) {
      setInitialLoading(false);
      setIsChecking(false);
      return;
    }

    try {
      const res = await fetch(getApiUrl('/users/profile'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: UserProfileData = await res.json();
        setProfileData(data);

        const p = data.profil;
        if (p?.is_verified) {
          toast.success('Selamat! Akun perusahaan Anda telah disetujui Admin!');
        }
      } else if (res.status === 401) {
        localStorage.clear();
        router.push('/login');
      }
    } catch {
      toast.error('Gagal memperbarui status. Periksa koneksi jaringan Anda.');
    } finally {
      setIsChecking(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const isApproved = Boolean(profileData?.profil?.is_verified);
  const isIncomplete = profileData ? !profileData.profil?.has_completed_profile : false;

  // Format real registration timestamp
  const formattedRegistrationDate = profileData?.created_at
    ? new Date(profileData.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    : '-';

  // Helper to extract clean filename
  const getCleanFileName = (path?: string) => {
    if (!path) return '-';
    const parts = path.split('/');
    const raw = parts[parts.length - 1] || path;
    return raw.length > 25 ? `${raw.slice(0, 12)}...${raw.slice(-8)}` : raw;
  };

  const supportEmailUrl = `mailto:admin@airecruitpro.com?subject=${encodeURIComponent(
    `Pertanyaan Status Verifikasi Akun Perusahaan: ${profileData?.profil?.nama_perusahaan || ''}`
  )}&body=${encodeURIComponent(
    `Halo Tim Admin AI-Recruit Pro,\n\nKami ingin mengonfirmasi status peninjauan akun perusahaan kami:\n• Perusahaan: ${
      profileData?.profil?.nama_perusahaan || '-'
    }\n• Email Akun: ${profileData?.email || '-'}\n• NIB / NPWP: ${
      profileData?.profil?.nib_number || '-'
    }\n\nTerima kasih.`
  )}`;

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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F1F7] text-[#1b7b9e] text-xs font-bold border border-[#B8E1ED]">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            ></span>
            Status Akun: {isApproved ? 'APPROVED' : isIncomplete ? 'BELUM LENGKAP' : 'PENDING APPROVAL'}
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
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-[#C2E5EF] space-y-8 text-center relative overflow-hidden w-full">
          {/* Animated Status Icon */}
          <div className="w-20 h-20 bg-[#E0F1F7] border-2 border-[#B8E1ED] rounded-3xl flex items-center justify-center text-[#1b7b9e] mx-auto shadow-sm relative">
            <Clock size={40} className="animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-black text-[10px] shadow-sm">
              !
            </div>
          </div>

          {/* Heading & Notice */}
          <div className="space-y-3 max-w-xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 font-extrabold text-xs border border-amber-200 uppercase tracking-wider">
              Verifikasi Dalam Proses
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

          {/* Real Data Details Container */}
          <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl border border-slate-200 space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-extrabold text-xs text-[#1b7b9e] uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 size={16} /> Rincian Berkas Legalitas Yang Dikirim
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                  isApproved
                    ? 'text-emerald-700 bg-emerald-100'
                    : isIncomplete
                    ? 'text-red-700 bg-red-100'
                    : 'text-amber-700 bg-amber-100'
                }`}
              >
                {isApproved ? 'Telah Disetujui' : isIncomplete ? 'Belum Lengkap' : 'Menunggu Peninjauan Admin'}
              </span>
            </div>

            {initialLoading ? (
              <div className="py-6 flex items-center justify-center text-slate-400 text-xs gap-2">
                <RefreshCw size={16} className="animate-spin" />
                <span>Memuat data legalitas dari database...</span>
              </div>
            ) : (
              <>
                {/* 1. Profil & Legalitas Text Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-0.5">
                      <Building2 size={13} /> Nama Perusahaan Resmi:
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {profileData?.profil?.nama_perusahaan || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-0.5">
                      <FileCheck2 size={13} /> Nomor NIB / NPWP:
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {profileData?.profil?.nib_number || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-0.5">
                      <Mail size={13} /> Email Akun Perusahaan:
                    </span>
                    <span className="font-medium text-slate-800 text-xs sm:text-sm break-all">
                      {profileData?.email || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-0.5">
                      <Calendar size={13} /> Waktu Pendaftaran:
                    </span>
                    <span className="font-medium text-slate-700 text-xs sm:text-sm">
                      {formattedRegistrationDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-0.5">
                      <User size={13} /> Perwakilan HRD:
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {profileData?.profil?.hr_name || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-0.5">
                      <Briefcase size={13} /> Jabatan HRD:
                    </span>
                    <span className="font-bold text-slate-800 text-sm capitalize">
                      {profileData?.profil?.hr_position || '-'}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-0.5">
                      <Phone size={13} /> Nomor WhatsApp Aktif:
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {profileData?.profil?.hr_whatsapp || '-'}
                    </span>
                  </div>
                </div>

                {/* 2. Berkas Dokumen Fisik Yang Diunggah */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-600 block mb-3">
                    Berkas Dokumen Fisik yang Diunggah ke Sistem:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Dokumen NIB/NPWP */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            Dokumen NIB / NPWP
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {profileData?.profil?.nib_document_url
                              ? getCleanFileName(profileData.profil.nib_document_url)
                              : 'Belum diunggah'}
                          </span>
                        </div>
                      </div>

                      {profileData?.profil?.nib_document_url ? (
                        <a
                          href={getMediaUrl(profileData.profil.nib_document_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs font-bold text-[#1b7b9e] hover:text-[#135a73] bg-[#E0F1F7] hover:bg-[#d0ebf5] px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                        >
                          Lihat Berkas <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                          Kosong
                        </span>
                      )}
                    </div>

                    {/* Dokumen KTP / ID Card HR */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CreditCard size={18} />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            KTP / ID Card HRD
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {profileData?.profil?.hr_id_card_url
                              ? getCleanFileName(profileData.profil.hr_id_card_url)
                              : 'Belum diunggah'}
                          </span>
                        </div>
                      </div>

                      {profileData?.profil?.hr_id_card_url ? (
                        <a
                          href={getMediaUrl(profileData.profil.hr_id_card_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs font-bold text-[#1b7b9e] hover:text-[#135a73] bg-[#E0F1F7] hover:bg-[#d0ebf5] px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                        >
                          Lihat Berkas <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                          Kosong
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-500 italic">
                  *Setelah disetujui oleh admin, akses penuh ke Dashboard HR otomatis aktif untuk akun email perusahaan Anda.
                </div>
              </>
            )}
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

            <a
              href={supportEmailUrl}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all inline-flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              Hubungi Admin
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
