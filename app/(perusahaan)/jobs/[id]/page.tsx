'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { fetchAuth } from '@/lib/api/auth';
import {
  ArrowLeft, Briefcase, MapPin, Clock, DollarSign, Sparkles,
  FileText, Edit, Calendar, Users, Loader2, AlertCircle,
  Check, Video, GraduationCap, Layers
} from 'lucide-react';

interface JobDetail {
  id: string;
  judul_posisi: string;
  deskripsi_pekerjaan: string;
  kategori_id: string | null;
  kualifikasi: string | null;
  tanggung_jawab: string | null;
  tipe_pekerjaan: string;
  lokasi_kerja: string;
  kota: string | null;
  gaji_min: number | null;
  gaji_max: number | null;
  tampilkan_gaji: boolean;
  pengalaman_min_tahun: number;
  pendidikan_min: string | null;
  cv_threshold: number;
  interview_threshold: number;
  tanggal_buka: string | null;
  tanggal_tutup: string | null;
  department: string | null;
  experience_level: string | null;
  benefits_json: string | null;
  ai_keywords_json: string | null;
  video_questions_json: string | null;
  openings_count: number;
  status: string;
  created_at: string | null;
}

function parseJsonArray(json: string | null): string[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function formatCurrency(value: number | null): string {
  if (!value) return '-';
  return 'Rp ' + value.toLocaleString('id-ID');
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function JobDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const res = await fetchAuth(`/api/jobs/${jobId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || 'Gagal memuat detail lowongan.');
        }
        const data = await res.json();
        setJob(data);
      } catch (err: any) {
        setError(err.message === 'Failed to fetch'
          ? 'Tidak dapat terhubung ke server.'
          : (err.message || 'Terjadi kesalahan.'));
      } finally {
        setIsLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center">
        <Loader2 className="mx-auto text-primary animate-spin" size={36} />
        <p className="text-sm text-muted-foreground mt-3">Memuat detail lowongan...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center space-y-3">
        <AlertCircle className="mx-auto text-rose-500" size={36} />
        <h3 className="font-bold text-base text-foreground">Gagal Memuat Data</h3>
        <p className="text-xs text-muted-foreground">{error || 'Lowongan tidak ditemukan.'}</p>
        <button onClick={() => router.back()} className="mt-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
          Kembali
        </button>
      </div>
    );
  }

  const responsibilities = parseJsonArray(job.tanggung_jawab);
  const requirements = parseJsonArray(job.kualifikasi);
  const aiKeywords = parseJsonArray(job.ai_keywords_json);
  const benefits = parseJsonArray(job.benefits_json);
  const videoQuestions = parseJsonArray(job.video_questions_json);

  const statusLabel = job.status === 'active' ? 'Dipublikasikan' : job.status === 'draft' ? 'Draf' : 'Ditutup';
  const statusColor = job.status === 'active' 
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700' 
    : job.status === 'draft'
    ? 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
    : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700';

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button 
            type="button"
            onClick={() => router.push('/jobs')}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft size={14} />
            Kembali ke Daftar Lowongan
          </button>
          <h1 className="text-2xl font-bold text-foreground mb-1">{job.judul_posisi}</h1>
          <div className="flex items-center gap-3 flex-wrap mt-1">
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusColor}`}>
              {statusLabel}
            </span>
            <span className="text-xs text-muted-foreground">{job.tipe_pekerjaan}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {job.lokasi_kerja} {job.kota ? `(${job.kota})` : ''}</span>
          </div>
        </div>
        <Link
          href={`/jobs/new?edit=${job.id}`}
          className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md shadow-primary/20 shrink-0"
        >
          <Edit size={16} />
          Edit Lowongan
        </Link>
      </div>

      <div className="space-y-6">

        {/* Info Grid */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Briefcase size={16} className="text-primary" /> Informasi Umum</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground font-semibold block mb-0.5">Departemen</span>
              <span className="font-bold text-foreground">{job.department || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold block mb-0.5">Level Pengalaman</span>
              <span className="font-bold text-foreground">{job.experience_level || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold block mb-0.5">Min. Pendidikan</span>
              <span className="font-bold text-foreground">{job.pendidikan_min || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold block mb-0.5">Kuota Posisi</span>
              <span className="font-bold text-foreground">{job.openings_count} Orang</span>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold block mb-0.5">Gaji</span>
              <span className="font-bold text-foreground">
                {(job.gaji_min || job.gaji_max) ? `${formatCurrency(job.gaji_min)} - ${formatCurrency(job.gaji_max)}` : 'Tidak dicantumkan'}
                {job.tampilkan_gaji && <span className="text-emerald-600 ml-1">(Publik)</span>}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold block mb-0.5">Tanggal Dibuat</span>
              <span className="font-bold text-foreground">{formatDate(job.created_at)}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold block mb-0.5">Batas Lamaran</span>
              <span className="font-bold text-foreground">{formatDate(job.tanggal_tutup)}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold block mb-0.5">AI Threshold</span>
              <span className="font-bold text-primary flex items-center gap-1"><Sparkles size={12} className="text-amber-500" /> CV {job.cv_threshold}% • Video {job.interview_threshold}%</span>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><FileText size={16} className="text-primary" /> Deskripsi Pekerjaan</h2>
          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{job.deskripsi_pekerjaan}</p>
        </div>

        {/* Tanggung Jawab */}
        {responsibilities.length > 0 && (
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-3">Tanggung Jawab Utama</h2>
            <ul className="space-y-2">
              {responsibilities.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Kualifikasi */}
        {requirements.length > 0 && (
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-3">Kualifikasi & Persyaratan</h2>
            <ul className="space-y-2">
              {requirements.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Keywords */}
        {aiKeywords.length > 0 && (
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Sparkles size={16} className="text-amber-500" /> AI Keywords (PO-FIT)</h2>
            <div className="flex flex-wrap gap-2">
              {aiKeywords.map((kw, i) => (
                <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md border border-primary/20">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Video Questions */}
        {videoQuestions.length > 0 && (
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Video size={16} className="text-primary" /> Pertanyaan Wawancara Video ({videoQuestions.length}/5)</h2>
            <div className="space-y-2">
              {videoQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 border border-border rounded-lg text-xs">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    Q{i + 1}
                  </span>
                  <p className="font-medium text-foreground leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits */}
        {benefits.length > 0 && (
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><DollarSign size={16} className="text-primary" /> Benefit & Fasilitas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-primary/5 border border-primary/10 rounded-lg text-xs font-medium text-foreground">
                  <Check size={14} className="text-primary shrink-0" />
                  {b}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
