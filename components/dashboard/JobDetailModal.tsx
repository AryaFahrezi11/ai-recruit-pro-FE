'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X, Briefcase, Building2, MapPin, Clock, DollarSign,
  Sparkles, FileText, CheckCircle2, Calendar, Users,
  Check, Video, BrainCircuit, GraduationCap, Award,
  Share2, Edit, ExternalLink, Layers, Eye
} from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

interface JobDetailModalProps {
  jobId: string | null;
  onClose: () => void;
}

function formatRupiah(val: string | number | null | undefined): string {
  if (!val) return '';
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : val;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(num);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Tidak ditentukan';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function parseJsonArray(json: any): string[] {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function JobDetailModal({ jobId, onClose }: JobDetailModalProps) {
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch job detail
  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetchAuth(`/api/jobs/${jobId}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Lowongan pekerjaan tidak ditemukan.');
        }
        const data = await res.json();
        setJob(data);
      } catch (err: any) {
        console.error('Error fetching job details in modal:', err);
        setErrorMsg(err.message || 'Gagal memuat detail lowongan.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleCopyLink = () => {
    if (!job) return;
    const url = `${window.location.origin}/applicant/dashboard?search=${encodeURIComponent(job.judul_posisi || '')}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success('Link pencarian lowongan disalin ke clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (!jobId) return null;

  const responsibilities = parseJsonArray(job?.tanggung_jawab);
  const requirements = parseJsonArray(job?.kualifikasi);
  const aiKeywords = parseJsonArray(job?.ai_keywords_json);
  const videoQuestions = parseJsonArray(job?.video_questions_json);
  const benefits = parseJsonArray(job?.benefits_json);

  const isDraft = job?.status === 'draft';
  const isClosed = job?.status === 'closed';
  const isActive = job?.status === 'active' || (!isDraft && !isClosed);

  const formattedSalary = (() => {
    if (!job?.gaji_min && !job?.gaji_max) return null;
    const min = formatRupiah(job.gaji_min);
    const max = formatRupiah(job.gaji_max);
    if (min && max) return `Rp ${min} - Rp ${max}`;
    if (min) return `Mulai Rp ${min}`;
    if (max) return `Hingga Rp ${max}`;
    return null;
  })();

  const companyLogo = job?.perusahaan?.logo_url || '';
  const companyName = job?.perusahaan?.nama_perusahaan || 'Perusahaan Anda';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header Bar */}
        <div className="px-4 py-3 sm:px-8 sm:py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 sm:p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="max-w-full max-h-full object-contain rounded-lg sm:rounded-xl"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z'/%3E%3Cpath d='M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2'/%3E%3Cpath d='M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2'/%3E%3Cpath d='M10 6h4'/%3E%3Cpath d='M10 10h4'/%3E%3Cpath d='M10 14h4'/%3E%3Cpath d='M10 18h4'/%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <Building2 size={20} className="text-[#1A4B9F]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px] sm:max-w-none">
                  {companyName}
                </span>
                {isActive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Aktif
                  </span>
                )}
                {isDraft && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                    Draf
                  </span>
                )}
                {isClosed && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                    Ditutup
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {job?.judul_posisi || 'Memuat Lowongan...'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="Tutup (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#1A4B9F] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-500 animate-pulse">Memuat pratinjau lowongan...</p>
            </div>
          ) : errorMsg ? (
            <div className="p-8 text-center space-y-3 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40">
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{errorMsg}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          ) : (
            <>
              {/* Public Preview Info Callout */}
              <div className="p-3.5 sm:p-4 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#1A4B9F] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Eye size={16} />
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">Pratinjau Tampilan Publik</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Berikut adalah format lowongan sebagaimana dilihat oleh pelamar di portal karir AI-RecruitPro.
                    </p>
                  </div>
                </div>

                {job.openings_count > 0 && (
                  <span className="hidden sm:inline-flex px-3 py-1 bg-white dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-300 font-bold text-[11px] rounded-xl border border-blue-100 dark:border-slate-700 shadow-2xs shrink-0 items-center gap-1.5">
                    <Users size={12} />
                    <span>Kuota: {job.openings_count} Posisi</span>
                  </span>
                )}
              </div>

              {/* Public-Style Info Grid (6 Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-400 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Lokasi Penempatan</p>
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {job.kota || 'Indonesia'} ({job.lokasi_kerja || 'Hybrid'})
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-400 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <GraduationCap size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Min. Pendidikan</p>
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {job.pendidikan_min || 'Semua Jurusan'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-400 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <Briefcase size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Tipe Pekerjaan</p>
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {job.tipe_pekerjaan || 'Full-time'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-400 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <Award size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Level Pengalaman</p>
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {job.experience_level || 'Entry Level'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <DollarSign size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Rentang Gaji</p>
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {formattedSalary || 'Gaji dirahasiakan'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-400 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Batas Pendaftaran</p>
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {formatDate(job.tanggal_tutup)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits Pills */}
              {benefits.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fasilitas & Benefit Pekerjaan:</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {benefits.map((benefit, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5"
                      >
                        <Check size={13} className="text-emerald-500" />
                        <span>{benefit}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Deskripsi Pekerjaan */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <FileText size={18} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Deskripsi Pekerjaan</h3>
                </div>
                {job.deskripsi_pekerjaan ? (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {job.deskripsi_pekerjaan}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">Tidak ada rincian deskripsi pekerjaan.</p>
                )}
              </div>

              {/* Tanggung Jawab Utama */}
              {responsibilities.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <Layers size={18} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Tanggung Jawab Utama</h3>
                  </div>
                  <ul className="space-y-2 pt-0.5">
                    {responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1A4B9F] dark:bg-blue-400 mt-2 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Kualifikasi & Persyaratan */}
              {requirements.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Kualifikasi & Persyaratan</h3>
                  </div>
                  <ul className="space-y-2 pt-0.5">
                    {requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        <Check size={15} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keahlian & Kata Kunci AI Matching */}
              {aiKeywords.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Keahlian yang Dibutuhkan (AI Keywords)</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">{aiKeywords.length} Keahlian</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {aiKeywords.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-blue-50/80 dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-300 font-bold text-xs rounded-lg border border-blue-100 dark:border-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pertanyaan Wawancara Video Virtual AI */}
              {videoQuestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Video size={18} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Pertanyaan Wawancara Video Virtual</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">{videoQuestions.length} Pertanyaan</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    {videoQuestions.map((q, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800"
                      >
                        <span className="w-6 h-6 rounded-lg bg-[#1A4B9F] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                          {q}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Konfigurasi AI Screening Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={16} className="text-[#1A4B9F] dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Threshold AI Screening</span>
                  </div>
                  <span className="text-base font-black text-[#1A4B9F] dark:text-blue-400">
                    {job.cv_threshold || 60}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1A4B9F] dark:bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(job.cv_threshold || 60, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pelamar dengan skor kecocokan CV di atas ambang ini otomatis lolos ke tahap interview.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Sticky Bottom Actions Bar */}
        {job && !isLoading && (
          <div className="px-6 py-4 sm:px-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              {isCopied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              <span>{isCopied ? 'Tersalin' : 'Salin Link'}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <Link
                href={`/pipeline?jobTitle=${encodeURIComponent(job.judul_posisi)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
              >
                <Users size={14} />
                <span>Lihat Pipeline</span>
              </Link>

              <Link
                href={`/jobs/new?edit=${job.id}`}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Edit size={14} />
                <span>Edit Lowongan</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
