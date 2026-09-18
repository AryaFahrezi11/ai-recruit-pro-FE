'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import {
  ArrowLeft, Edit, Briefcase, Building2, MapPin, Clock, DollarSign,
  Sparkles, Sliders, FileText, CheckCircle2,
  Calendar, Users, Check, Video, BrainCircuit, GraduationCap,
  Copy, ExternalLink, Share2, Layers, ShieldCheck
} from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { getApiUrl } from '@/lib/api';
import { toast } from 'react-hot-toast';

function formatRupiah(val: string | number | null | undefined): string {
  if (!val) return '';
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : val;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(num);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
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

function JobDetailView() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [jobData, setJobData] = useState<any>(null);
  const [categories, setCategories] = useState<{ id: string; nama_kategori: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(getApiUrl('/jobs/categories'));
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Gagal memuat kategori:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!jobId) return;
    const loadJob = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetchAuth(`/api/jobs/${jobId}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Lowongan pekerjaan tidak ditemukan.');
        }
        const data = await res.json();
        setJobData(data);
      } catch (err: any) {
        console.error('Error fetching job details:', err);
        setErrorMsg(err.message || 'Terjadi kesalahan saat memuat data lowongan.');
      } finally {
        setIsLoading(false);
      }
    };
    loadJob();
  }, [jobId]);

  const handleCopyPublicLink = () => {
    if (!jobData) return;
    const url = `${window.location.origin}/applicant/dashboard?search=${encodeURIComponent(jobData.judul_posisi || '')}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success('Link pencarian lowongan disalin ke clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const categoryName = useMemo(() => {
    if (!jobData) return 'Umum';
    if (jobData.kategori?.nama_kategori) return jobData.kategori.nama_kategori;
    const found = categories.find(c => c.id === jobData.kategori_id);
    return found?.nama_kategori || jobData.department || 'Umum';
  }, [jobData, categories]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 space-y-6 animate-pulse">
        <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <div className="h-7 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
            <div className="h-60 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
            <div className="h-40 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg || !jobData) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center font-bold text-xl">
          !
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lowongan Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">{errorMsg || 'Data lowongan tidak tersedia atau telah dihapus.'}</p>
        <button
          type="button"
          onClick={() => router.push('/jobs')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          Kembali ke Daftar Lowongan
        </button>
      </div>
    );
  }

  const responsibilities = parseJsonArray(jobData.tanggung_jawab);
  const requirements = parseJsonArray(jobData.kualifikasi);
  const aiKeywords = parseJsonArray(jobData.ai_keywords_json);
  const videoQuestions = parseJsonArray(jobData.video_questions_json);
  const benefits = parseJsonArray(jobData.benefits_json);

  const isDraft = jobData.status === 'draft';
  const isClosed = jobData.status === 'closed';
  const isActive = jobData.status === 'active' || (!isDraft && !isClosed);

  const formattedSalary = (() => {
    if (!jobData.gaji_min && !jobData.gaji_max) return null;
    const min = formatRupiah(jobData.gaji_min);
    const max = formatRupiah(jobData.gaji_max);
    if (min && max) return `Rp ${min} - Rp ${max}`;
    if (min) return `Mulai dari Rp ${min}`;
    if (max) return `Hingga Rp ${max}`;
    return null;
  })();

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-300 font-sans space-y-6">

      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/jobs')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#1A4B9F] dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Kembali ke Kelola Lowongan</span>
        </button>

        <div className="flex items-center gap-2">
          {isActive && (
            <button
              type="button"
              onClick={handleCopyPublicLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              {isCopied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              <span>{isCopied ? 'Tersalin' : 'Salin Link'}</span>
            </button>
          )}

          <Link
            href={`/pipeline?jobTitle=${encodeURIComponent(jobData.judul_posisi)}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-[#1A4B9F] dark:text-blue-300 text-xs font-bold transition-colors border border-blue-100 dark:border-blue-800/50"
          >
            <Users size={14} />
            <span>Lihat Pipeline</span>
          </Link>

          <Link
            href={`/jobs/new?edit=${jobId}`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1A4B9F] hover:bg-[#133878] text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Edit size={14} />
            <span>Edit Lowongan</span>
          </Link>
        </div>
      </div>

      {/* Hero Overview Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {jobData.judul_posisi}
              </h1>
              {isActive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Dipublikasikan
                </span>
              )}
              {isDraft && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
                  Draf
                </span>
              )}
              {isClosed && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                  Ditutup
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="text-[#1A4B9F] dark:text-blue-400 font-bold flex items-center gap-1">
                <Building2 size={14} />
                {categoryName}
              </span>
              <span>•</span>
              <span>Dibuat: {formatDate(jobData.created_at || jobData.tanggal_buka)}</span>
            </div>
          </div>
        </div>

        {/* Quick Spec Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lokasi Kerja</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 truncate">
              <MapPin size={13} className="text-[#1A4B9F] shrink-0" />
              {jobData.kota || 'Indonesia'} ({jobData.lokasi_kerja || 'Hybrid'})
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipe Pekerjaan</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 truncate">
              <Briefcase size={13} className="text-[#1A4B9F] shrink-0" />
              {jobData.tipe_pekerjaan || 'Full-time'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pengalaman</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 truncate">
              <Clock size={13} className="text-[#1A4B9F] shrink-0" />
              {jobData.experience_level || 'Entry Level'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Min. Pendidikan</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 truncate">
              <GraduationCap size={13} className="text-[#1A4B9F] shrink-0" />
              {jobData.pendidikan_min || 'Semua Jurusan'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Batas Lamaran</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 truncate">
              <Calendar size={13} className="text-[#1A4B9F] shrink-0" />
              {formatDate(jobData.tanggal_tutup)}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split View: Document Style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: Clean Job Specification Document */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. Deskripsi & Ringkasan Peran */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileText size={18} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Deskripsi Pekerjaan</h2>
            </div>
            {jobData.deskripsi_pekerjaan ? (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {jobData.deskripsi_pekerjaan}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">Tidak ada deskripsi rinci yang dicantumkan.</p>
            )}
          </div>

          {/* 2. Tanggung Jawab Utama */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Layers size={18} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Tanggung Jawab Utama</h2>
            </div>
            {responsibilities.length > 0 ? (
              <ul className="space-y-2.5 pt-1">
                {responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A4B9F] dark:bg-blue-400 mt-2 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada daftar tanggung jawab yang ditambahkan.</p>
            )}
          </div>

          {/* 3. Kualifikasi & Persyaratan */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Kualifikasi & Persyaratan</h2>
            </div>
            {requirements.length > 0 ? (
              <ul className="space-y-2.5 pt-1">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <Check size={15} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada persyaratan khusus yang dicantumkan.</p>
            )}
          </div>

          {/* 4. Keahlian & Kata Kunci AI Matching */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Keahlian & Kata Kunci AI (PO-Fit)</h2>
              </div>
              <span className="text-[11px] font-bold text-slate-400">{aiKeywords.length} Keahlian</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kata kunci ini dianalisis oleh algoritma pencocokan AI untuk mengukur relevansi kualifikasi CV pelamar secara otomatis.
            </p>
            {aiKeywords.length > 0 ? (
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
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada kata kunci keahlian AI yang dimasukkan.</p>
            )}
          </div>

          {/* 5. Pertanyaan Wawancara Video Virtual AI */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Pertanyaan Wawancara Video AI</h2>
              </div>
              <span className="text-[11px] font-bold text-slate-400">{videoQuestions.length} / 5 Pertanyaan</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kandidat yang lolos tahap CV akan menjawab pertanyaan-pertanyaan ini secara virtual menggunakan analisis video AI.
            </p>
            {videoQuestions.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {videoQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#1A4B9F] text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5 shadow-2xs">
                      {i + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                      {q}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Tidak ada pertanyaan wawancara video virtual yang diatur.</p>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: AI Configuration, Salary, & Benefits Widgets */}
        <div className="lg:col-span-4 space-y-6">

          {/* Card 1: AI Screening Threshold */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit size={18} className="text-[#1A4B9F] dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Threshold AI Screening</h3>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-300 font-bold text-[10px] border border-blue-100 dark:border-slate-700">
                Otomatis
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Nilai Ambang Lolos</span>
                <span className="text-2xl font-black text-[#1A4B9F] dark:text-blue-400">
                  {jobData.cv_threshold || 60}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1A4B9F] dark:bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(jobData.cv_threshold || 60, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal pt-1">
                Kandidat dengan skor kemiripan CV di atas ambang batas ini akan direkomendasikan langsung untuk wawancara.
              </p>
            </div>
          </div>

          {/* Card 2: Kompensasi Gaji */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Estimasi Gaji</h3>
            </div>

            <div className="space-y-2">
              <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {formattedSalary ? (
                  <span>{formattedSalary} <span className="text-xs font-normal text-slate-500">/ bulan</span></span>
                ) : (
                  <span className="text-xs font-medium text-slate-400">Gaji dinegosiasikan saat penawaran</span>
                )}
              </div>

              <div>
                {jobData.tampilkan_gaji ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    <Check size={12} /> Tampil di portal pelamar
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    Disembunyikan dari pelamar
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Benefit & Tunjangan */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles size={18} className="text-[#1A4B9F] dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Benefit & Tunjangan</h3>
            </div>

            {benefits.length > 0 ? (
              <div className="space-y-2 pt-1">
                {benefits.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800"
                  >
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Tidak ada benefit tambahan yang tercatat.</p>
            )}
          </div>

          {/* Card 4: Ringkasan Kuota & Publikasi */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Users size={18} className="text-[#1A4B9F] dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Alokasi & Kuota</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Kuota Posisi</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{jobData.openings_count || 1} Orang</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Batas Pendaftaran</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(jobData.tanggal_tutup)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="font-bold text-[#1A4B9F] dark:text-blue-400 capitalize">
                  {jobData.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 animate-pulse text-xs">
          Memuat data lowongan...
        </div>
      }
    >
      <JobDetailView />
    </Suspense>
  );
}