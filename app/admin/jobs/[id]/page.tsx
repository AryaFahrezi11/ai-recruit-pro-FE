'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Sparkles,
  Sliders,
  FileText,
  Check,
  Globe,
  X,
  Video,
  Calendar,
  ExternalLink,
  Ban,
  CheckCircle2,
  Users,
  GraduationCap,
  Award,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

function AdminJobDetailView() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  // Form & Display State
  const [jobTitle, setJobTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState<{ id: string; nama_kategori: string }[]>([]);
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('hybrid');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level');
  const [pendidikanMin, setPendidikanMin] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobStatus, setJobStatus] = useState('active');

  // Job Description & AI Keywords
  const [summary, setSummary] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);

  // AI Configuration
  const [threshold, setThreshold] = useState<number>(60);
  const [videoQuestions, setVideoQuestions] = useState<string[]>([]);

  // Compensation & Benefits
  const [currency, setCurrency] = useState('IDR');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [showSalaryPublic, setShowSalaryPublic] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);

  // Timelines & Publishing
  const [deadline, setDeadline] = useState('');
  const [openingsCount, setOpeningsCount] = useState(1);
  const [visibility, setVisibility] = useState('Public');

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const parseJsonArray = (json: string | null): string[] => {
    if (!json) return [];
    try {
      const arr = JSON.parse(json);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const loadJob = async () => {
    if (!jobId) return;
    setIsLoading(true);
    try {
      const res = await fetchAuth(`/api/jobs/${jobId}`);
      if (!res.ok) throw new Error('Lowongan tidak ditemukan');
      const job = await res.json();

      setJobTitle(job.judul_posisi || '');
      setCompanyName(job.perusahaan?.nama_perusahaan || 'Perusahaan');
      setJobStatus(job.status || 'active');
      setCategoryId(job.kategori_id || '');
      setCategoryName(job.kategori?.nama_kategori || '');
      setEmploymentType(job.tipe_pekerjaan || 'Full-time');
      setWorkMode(job.lokasi_kerja || 'hybrid');
      setLocation(job.kota || '');
      setExperienceLevel(job.experience_level || 'Entry Level');
      setPendidikanMin(job.pendidikan_min || '');
      setSummary(job.deskripsi_pekerjaan || '');
      setResponsibilities(parseJsonArray(job.tanggung_jawab));
      setRequirements(parseJsonArray(job.kualifikasi));
      setAiKeywords(parseJsonArray(job.ai_keywords_json));
      setThreshold(job.cv_threshold || 60);
      setVideoQuestions(parseJsonArray(job.video_questions_json));
      setSalaryMin(job.gaji_min ? String(job.gaji_min) : '');
      setSalaryMax(job.gaji_max ? String(job.gaji_max) : '');
      setShowSalaryPublic(job.tampilkan_gaji || false);
      setSelectedBenefits(parseJsonArray(job.benefits_json));
      setDeadline(job.tanggal_tutup || '');
      setOpeningsCount(job.openings_count || 1);
      setVisibility(job.status === 'draft' ? 'Draft' : 'Public');
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data lowongan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetchAuth('/api/jobs/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Gagal memuat kategori', err);
      }
    };
    fetchCategories();
    loadJob();
  }, [jobId]);

  const handleToggleStatus = async () => {
    const newStatus = jobStatus === 'active' ? 'closed' : 'active';
    const actionName = newStatus === 'active' ? 'mengaktifkan' : 'menutup';

    setIsUpdatingStatus(true);
    try {
      const res = await fetchAuth(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Gagal ${actionName} lowongan`);
      }

      toast.success(`Status lowongan berhasil diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Ditutup'}`);
      setJobStatus(newStatus);
      setShowConfirmDialog(false);
    } catch (error: any) {
      toast.error(error.message || `Gagal mengubah status`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <RefreshCw size={16} className="animate-spin text-blue-600" />
          <span>Memuat detail lowongan...</span>
        </div>
      </div>
    );
  }

  const isActive = jobStatus === 'active' || jobStatus === 'published';

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-6 font-sans antialiased">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push('/admin/jobs')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Kembali ke Daftar Lowongan
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {jobTitle || 'Detail Lowongan'}
            </h1>
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Clock size={12} />
                {jobStatus === 'closed' ? 'Ditutup' : jobStatus}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-2">
            <span>Perusahaan: <strong className="text-slate-800 dark:text-slate-200">{companyName}</strong></span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">ID: {jobId}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Public Preview */}
          <Link
            href={`/jobs/${jobId}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink size={13} />
            <span>Lihat Publik</span>
          </Link>

          {/* Moderate Status */}
          <button
            type="button"
            onClick={() => setShowConfirmDialog(true)}
            className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isActive ? <Ban size={14} /> : <CheckCircle2 size={14} />}
            <span>{isActive ? 'Tutup Lowongan' : 'Aktifkan Lowongan'}</span>
          </button>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipe Pekerjaan</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block mt-1">
            {employmentType}
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lokasi & Model</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block mt-1">
            {location || 'Indonesia'} ({workMode})
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kuota Lowongan</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block mt-1 flex items-center gap-1">
            <Users size={12} className="text-blue-500" />
            {openingsCount} Orang
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Batas Lamaran</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block mt-1 flex items-center gap-1">
            <Calendar size={12} className="text-amber-500" />
            {deadline || 'Tidak ditentukan'}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* ==================== SECTION 1: INFORMASI DASAR ==================== */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Briefcase size={18} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Informasi Dasar Pekerjaan</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Judul Posisi</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-1">{jobTitle}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-1">
                {categoryName || categories.find(c => c.id === categoryId)?.nama_kategori || '-'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Level Pengalaman</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-1">{experienceLevel}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pendidikan Minimal</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-1">{pendidikanMin || '-'}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Model Tempat Kerja</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-1 uppercase">{workMode}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kota Penempatan</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-1">{location || '-'}</span>
            </div>
          </div>
        </div>

        {/* ==================== SECTION 2: DESKRIPSI & PERSYARATAN ==================== */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileText size={18} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Deskripsi &amp; Kualifikasi</h2>
          </div>

          {/* Ringkasan */}
          {summary && (
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                Ringkasan Pekerjaan
              </span>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-justify">
                {summary}
              </div>
            </div>
          )}

          {/* Tanggung Jawab */}
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              Tanggung Jawab Utama
            </span>
            {responsibilities.length > 0 ? (
              <ul className="space-y-2">
                {responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
                    <span className="flex-1 leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 italic">
                Tidak ada data tanggung jawab tercantum.
              </p>
            )}
          </div>

          {/* Kualifikasi */}
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              Kualifikasi &amp; Persyaratan
            </span>
            {requirements.length > 0 ? (
              <ul className="space-y-2">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="flex-1 leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 italic">
                Tidak ada data kualifikasi tercantum.
              </p>
            )}
          </div>

          {/* AI Keywords */}
          {aiKeywords.length > 0 && (
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-500" />
                Kata Kunci Ekstraksi AI (Keywords)
              </span>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-wrap gap-1.5">
                {aiKeywords.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ==================== SECTION 3: AI SCREENING & WAWANCARA VIDEO ==================== */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sliders size={18} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Konfigurasi Penilaian AI</h2>
          </div>

          {/* Threshold Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  Batas Minimal Skor CV (Threshold)
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold rounded">
                    ATS Automated Pass
                  </span>
                </label>
              </div>
              <span className={`text-xl font-black ${threshold >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                {threshold}%
              </span>
            </div>
            {/* Progress bar visual */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, threshold))}%` }}
              />
            </div>
          </div>

          {/* Pertanyaan Wawancara Video */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Video size={15} className="text-blue-600 dark:text-blue-400" />
                Daftar Pertanyaan Wawancara Video AI
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {videoQuestions.length} Pertanyaan
              </span>
            </div>

            <div className="space-y-2">
              {videoQuestions.length === 0 ? (
                <p className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 italic">
                  Tidak ada pertanyaan wawancara video yang diatur untuk lowongan ini.
                </p>
              ) : (
                videoQuestions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold flex items-center justify-center text-[11px] shrink-0 mt-0.5 border border-blue-200 dark:border-blue-900/60">
                      {i + 1}
                    </span>
                    <p className="flex-1 font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{q}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ==================== SECTION 4: KOMPENSASI & BENEFIT ==================== */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <DollarSign size={18} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Kompensasi &amp; Benefit</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rentang Gaji Ditawarkan</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm block mt-1">
                {salaryMin || salaryMax ? (
                  <>
                    Rp {Number(salaryMin || 0).toLocaleString('id-ID')} - Rp {Number(salaryMax || 0).toLocaleString('id-ID')}
                  </>
                ) : (
                  'Tidak dicantumkan'
                )}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                {showSalaryPublic ? '✓ Ditampilkan secara publik ke pelamar' : '✗ Dirahasiakan dari publikasi'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Visibilitas</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm block mt-1">
                {visibility}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                {visibility === 'Public' ? 'Dapat ditemukan di portal karir' : 'Akses terbatas'}
              </span>
            </div>
          </div>

          {/* Benefits Grid */}
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              Fasilitas &amp; Benefit Karyawan
            </span>
            {selectedBenefits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {selectedBenefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-between"
                  >
                    <span>{benefit}</span>
                    <Check size={14} className="shrink-0 ml-1 text-blue-600 dark:text-blue-400" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 italic">
                Tidak ada fasilitas atau benefit khusus yang dicantumkan.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !isUpdatingStatus && setShowConfirmDialog(false)}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 mb-4 mx-auto">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white text-center mb-1.5">
                Konfirmasi Status Lowongan
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs text-center mb-6 font-medium leading-relaxed">
                Yakin ingin{' '}
                {isActive ? (
                  <strong className="text-rose-600 dark:text-rose-400">menutup publikasi</strong>
                ) : (
                  <strong className="text-emerald-600 dark:text-emerald-400">mengaktifkan kembali</strong>
                )}{' '}
                lowongan <strong className="text-slate-900 dark:text-white">&ldquo;{jobTitle}&rdquo;</strong>?
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={handleToggleStatus}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-xs transition-colors shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isUpdatingStatus && <RefreshCw size={13} className="animate-spin" />}
                  <span>{isActive ? 'Ya, Tutup Lowongan' : 'Ya, Aktifkan Lowongan'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminJobDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <RefreshCw size={16} className="animate-spin text-blue-600" />
            <span>Memuat detail lowongan...</span>
          </div>
        </div>
      }
    >
      <AdminJobDetailView />
    </Suspense>
  );
}
