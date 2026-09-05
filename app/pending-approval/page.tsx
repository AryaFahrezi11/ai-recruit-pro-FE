'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getApiUrl, getMediaUrl } from '@/lib/api';
import {
  Clock,
  AlertCircle,
  Building2,
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
  XCircle
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
    status?: string;
    rejection_reason?: string;
    has_completed_profile?: boolean;
    alamat?: string;
    kota?: string;
    provinsi?: string;
  };
}

export default function PendingApprovalPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchStatus = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    try {
      const [profileRes, configRes] = await Promise.all([
        token
          ? fetch(getApiUrl('/users/profile'), {
              headers: { Authorization: `Bearer ${token}` }
            })
          : Promise.resolve(null),
        fetch(getApiUrl('/config/public')).catch(() => null)
      ]);

      if (configRes && configRes.ok) {
        const configData = await configRes.json();
        if (configData.admin_email) {
          setAdminEmail(configData.admin_email);
        }
      }

      if (profileRes && profileRes.ok) {
        const data: UserProfileData = await profileRes.json();
        setProfileData(data);

        const p = data.profil;
        if (p?.is_verified) {
          toast.success('Selamat! Akun perusahaan Anda telah disetujui Admin!');
        }
      } else if (profileRes && profileRes.status === 401) {
        localStorage.clear();
        router.push('/login');
      }
    } catch {
      toast.error('Gagal memperbarui status. Periksa koneksi jaringan Anda.');
    } finally {
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
  const isRejected = profileData?.profil?.status === 'REJECTED';
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

  const targetAdminEmail = adminEmail || 'admin@airecruitpro.com';
  const companyName = profileData?.profil?.nama_perusahaan || '-';
  const nibNumber = profileData?.profil?.nib_number || '-';
  const accountEmail = profileData?.email || '-';
  const hrName = profileData?.profil?.hr_name || '-';
  const hrPos = profileData?.profil?.hr_position ? ` (${profileData.profil.hr_position})` : '';
  const hrWhatsapp = profileData?.profil?.hr_whatsapp || '-';

  const emailSubject = `Konfirmasi Verifikasi Akun Perusahaan - ${companyName}`;
  const emailBody =
`Yth. Tim Administrator AI-Recruit Pro,

Saya ingin mengonfirmasi status peninjauan dan verifikasi akun perusahaan kami:

• Nama Perusahaan Resmi : ${companyName}
• Nomor NIB / NPWP       : ${nibNumber}
• Email Akun Terdaftar  : ${accountEmail}
• Perwakilan HRD         : ${hrName}${hrPos}
• Nomor WhatsApp HRD     : ${hrWhatsapp}
• Waktu Pendaftaran      : ${formattedRegistrationDate}

Seluruh dokumen persyaratan legalitas (NIB/NPWP dan ID Card HRD) telah berhasil kami unggah ke sistem. Mohon bantuannya untuk meninjau dan mengaktifkan akun perusahaan kami agar kami dapat mulai menggunakan platform AI-Recruit Pro.

Terima kasih atas perhatian dan kerja samanya.

Hormat kami,
${profileData?.profil?.hr_name || companyName}`;

  const supportEmailUrl = `mailto:${targetAdminEmail}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans antialiased transition-colors duration-300">
      {/* Top Header */}
      <header className="py-6 px-6 sm:px-12 max-w-[1600px] w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
              AI-RecruitPro
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
              Portal Perusahaan
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            title="Keluar / Ganti Akun"
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-8 text-center relative overflow-hidden">
          {/* Animated Status Icon */}
          {isRejected ? (
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-800/60 rounded-3xl flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto shadow-sm relative">
              <XCircle size={40} />
            </div>
          ) : (
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800/60 rounded-3xl flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 mx-auto shadow-sm relative">
              <Clock size={36} className="animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-black text-[10px] shadow-sm">
                !
              </div>
            </div>
          )}

          {/* Heading & Notice */}
          <div className="space-y-3 max-w-xl mx-auto">
            {isRejected ? (
              <span className="inline-block px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-extrabold text-xs border border-rose-200 dark:border-rose-800 uppercase tracking-wider">
                Verifikasi Ditolak / Perlu Perbaikan
              </span>
            ) : (
              <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 font-extrabold text-xs border border-amber-200 dark:border-amber-800 uppercase tracking-wider">
                Verifikasi Dalam Proses
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              {isRejected
                ? 'Pengajuan Verifikasi Akun Belum Disetujui'
                : 'Pendaftaran Berhasil Dikirim & Dalam Peninjauan Admin'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-2">
              {isRejected
                ? 'Admin telah meninjau pengajuan akun perusahaan Anda. Terdapat berkas legalitas atau data profil yang belum memenuhi kualifikasi. Silakan periksa catatan perbaikan dari admin di bawah ini.'
                : 'Terima kasih telah melengkapi data legalitas perusahaan & perwakilan HRD. Tim Administrator AI-Recruit Pro saat ini sedang memverifikasi keabsahan Dokumen NIB/NPWP dan ID Card Perusahaan Anda demi menjaga keamanan & kualitas ekosistem rekrutmen.'}
            </p>
          </div>

          {/* Conditional Banners */}
          {isApproved ? (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-900 dark:text-emerald-300 text-left">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Akun Perusahaan Berhasil Disetujui!</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">Verifikasi dokumen Anda telah selesai. Anda sekarang dapat mengakses dashboard rekrutmen secara penuh.</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="shrink-0 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
              >
                Buka Dashboard <ArrowRight size={14} />
              </Link>
            </div>
          ) : isRejected ? (
            <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-800/80 text-left space-y-4 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <XCircle size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-rose-900 dark:text-rose-200">
                    Pengajuan Verifikasi Memerlukan Perbaikan
                  </h3>
                  <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-1">
                    Berikut adalah catatan perbaikan resmi dari Administrator untuk perusahaan Anda:
                  </p>

                  <div className="mt-3 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    <span className="block text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
                      Catatan / Alasan Penolakan:
                    </span>
                    &ldquo;{profileData?.profil?.rejection_reason || 'Persyaratan dokumen legalitas (NIB & ID Card) belum sesuai kriteria. Mohon lengkapi dan unggah kembali dokumen resmi yang valid.'}&rdquo;
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-200/70 dark:border-rose-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                  Perbaiki data atau unggah dokumen terbaru pada Formulir Tahap 3 untuk ditinjau ulang oleh Admin.
                </p>
                <Link
                  href="/register?step=3"
                  className="shrink-0 w-full sm:w-auto px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all inline-flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Lengkapi Ulang Dokumen (Tahap 3) &rarr;
                </Link>
              </div>
            </div>
          ) : isIncomplete ? (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-900 dark:text-amber-300 text-left">
              <div className="flex items-center gap-3">
                <AlertCircle size={28} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Data &amp; Dokumen Belum Lengkap!</h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400">Mohon lengkapi profil perusahaan dan berkas fisik NIB serta KTP/ID Card di Tahap 3.</p>
                </div>
              </div>
              <Link
                href="/register?step=3"
                className="shrink-0 px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all inline-flex items-center gap-2"
              >
                <Edit size={14} /> Lengkapi Dokumen
              </Link>
            </div>
          ) : null}

          {/* Real Data Details Container */}
          <div className="bg-slate-50 dark:bg-slate-950/50 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 size={16} className="text-[#1A4B9F] dark:text-blue-400" /> Rincian Berkas Legalitas Yang Dikirim
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                  isApproved
                    ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/60'
                    : isRejected
                    ? 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/60'
                    : isIncomplete
                    ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950/60'
                    : 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/60'
                }`}
              >
                {isApproved ? 'Telah Disetujui' : isRejected ? 'Perlu Perbaikan (Ditolak)' : isIncomplete ? 'Belum Lengkap' : 'Menunggu Peninjauan Admin'}
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
                    <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5 mb-0.5">
                      <Building2 size={13} /> Nama Perusahaan Resmi:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {profileData?.profil?.nama_perusahaan || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5 mb-0.5">
                      <FileCheck2 size={13} /> Nomor NIB / NPWP:
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {profileData?.profil?.nib_number || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5 mb-0.5">
                      <Mail size={13} /> Email Akun Perusahaan:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm break-all">
                      {profileData?.email || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5 mb-0.5">
                      <Calendar size={13} /> Waktu Pendaftaran:
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                      {formattedRegistrationDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5 mb-0.5">
                      <User size={13} /> Perwakilan HRD:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {profileData?.profil?.hr_name || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5 mb-0.5">
                      <Briefcase size={13} /> Jabatan HRD:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm capitalize">
                      {profileData?.profil?.hr_position || '-'}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5 mb-0.5">
                      <Phone size={13} /> Nomor WhatsApp Aktif:
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {profileData?.profil?.hr_whatsapp || '-'}
                    </span>
                  </div>
                </div>

                {/* 2. Berkas Dokumen Fisik Yang Diunggah */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-3">
                    Berkas Dokumen Fisik yang Diunggah ke Sistem:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Dokumen NIB/NPWP */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                            Dokumen NIB / NPWP
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
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
                          className="shrink-0 text-xs font-semibold text-[#1A4B9F] dark:text-blue-400 hover:text-[#133878] dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-xl inline-flex items-center gap-1 transition-colors border border-blue-200 dark:border-blue-900/50"
                        >
                          Lihat Berkas <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/50 px-2 py-1 rounded">
                          Kosong
                        </span>
                      )}
                    </div>

                    {/* Dokumen KTP / ID Card HR */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CreditCard size={18} />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                            KTP / ID Card HRD
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
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
                          className="shrink-0 text-xs font-semibold text-[#1A4B9F] dark:text-blue-400 hover:text-[#133878] dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-xl inline-flex items-center gap-1 transition-colors border border-blue-200 dark:border-blue-900/50"
                        >
                          Lihat Berkas <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/50 px-2 py-1 rounded">
                          Kosong
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 italic">
                  *Setelah disetujui oleh admin, akses penuh ke Dashboard HR otomatis aktif untuk akun email perusahaan Anda.
                </div>
              </>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {(isRejected || isIncomplete) && (
              <Link
                href="/register?step=3"
                className={`w-full sm:w-auto px-7 py-3 rounded-full text-white font-semibold text-sm shadow-sm transition-all duration-200 inline-flex items-center justify-center gap-2 ${
                  isRejected
                    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                    : 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                }`}
              >
                <Edit size={16} />
                Lengkapi Ulang Dokumen (Tahap 3)
              </Link>
            )}

            <a
              href={supportEmailUrl}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm shadow-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              <Mail size={16} />
              Hubungi Admin
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
