'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/lib/store/useAppStore';
import { fetchAuth } from '@/lib/api/auth';
import { 
  Briefcase, Plus, Search, Filter, Eye, Edit, Trash2, Copy, 
  CheckCircle2, Clock, AlertCircle, Sparkles, MapPin, Users,
  ArrowRight, FileText, Check, Loader2, AlertTriangle, X
} from 'lucide-react';

interface JobItem {
  id: string;
  judul_posisi: string;
  department: string | null;
  tipe_pekerjaan: string;
  kota: string | null;
  lokasi_kerja: string;
  gaji_min: number | null;
  gaji_max: number | null;
  tampilkan_gaji: boolean;
  status: string;
  cv_threshold: number;
  interview_threshold: number;
  video_questions_json: string | null;
  experience_level: string | null;
  pendidikan_min: string | null;
  openings_count: number;
  benefits_json: string | null;
  ai_keywords_json: string | null;
  created_at: string | null;
  tanggal_tutup: string | null;
}

function formatCurrency(value: number | null): string {
  if (!value) return '-';
  return 'Rp ' + value.toLocaleString('id-ID');
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getVideoQuestionsCount(json: string | null): number {
  if (!json) return 0;
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

function JobOpeningsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const token = useAppStore(state => state.token);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'closed'>((searchParams.get('tab') as any) || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Delete Modal State
  const [jobToDelete, setJobToDelete] = useState<JobItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const apiParams = new URLSearchParams();
      const search = searchParams.get('search');
      if (search) apiParams.append('search', search);
      const qs = apiParams.toString();
      const res = await fetchAuth(qs ? `/api/jobs/my-jobs?${qs}` : '/api/jobs/my-jobs');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Gagal memuat data lowongan.');
      }
      const data: JobItem[] = await res.json();
      setJobs(data);
    } catch (err: any) {
      const msg = err.message === 'Failed to fetch'
        ? 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
        : (err.message || 'Terjadi kesalahan saat memuat lowongan.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs, searchParams]);

  const handleCopyLink = (jobTitle: string) => {
    navigator.clipboard.writeText(`https://recruitpro.ai/jobs/apply?title=${encodeURIComponent(jobTitle)}`);
    setCopiedId(jobTitle);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (job: JobItem) => {
    const newStatus = job.status === 'active' ? 'draft' : 'active';
    try {
      const res = await fetchAuth(`/api/jobs/${job.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
      }
    } catch (err) {
      console.error('Gagal mengubah status lowongan', err);
    }
  };

  const handleDeleteJob = (job: JobItem) => {
    setJobToDelete(job);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetchAuth(`/api/jobs/${jobToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== jobToDelete.id));
        setJobToDelete(null);
      }
    } catch (err) {
      console.error('Gagal menghapus lowongan', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering
  const filteredJobs = jobs.filter(job => {
    const matchesTab = activeTab === 'all' || job.status === activeTab;
    const matchesSearch = job.judul_posisi.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (job.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (job.kota || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalActive = jobs.filter(j => j.status === 'active').length;
  const totalDrafts = jobs.filter(j => j.status === 'draft').length;
  const totalClosed = jobs.filter(j => j.status === 'closed').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t.jobs.listTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.jobs.listSubtitle}</p>
        </div>

        <Link
          href="/jobs/new"
          className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md shadow-primary/20 shrink-0 active:scale-95"
        >
          <Plus size={16} />
          {t.jobs.title}
        </Link>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-5 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t.jobs.activeJobsCount}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalActive}</p>
            <span className="text-[11px] text-muted-foreground font-medium">Lowongan aktif dipublikasi</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold">
            <Briefcase size={22} />
          </div>
        </div>

        <div className="p-5 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t.jobs.draftJobsCount}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalDrafts}</p>
            <span className="text-[11px] text-muted-foreground font-medium">Tersimpan dalam draf</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold">
            <FileText size={22} />
          </div>
        </div>

        <div className="p-5 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Lowongan</p>
            <p className="text-2xl font-bold text-foreground mt-1">{jobs.length}</p>
            <span className="text-[11px] text-muted-foreground font-medium">Seluruh lowongan ({totalClosed} ditutup)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
        </div>

      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Status Filter Tabs */}
          <div className="flex gap-1.5 p-1.5 bg-muted/50 rounded-xl overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: t.jobs.allJobs, count: jobs.length },
              { id: 'active', label: t.jobs.published, count: totalActive },
              { id: 'draft', label: t.jobs.draft, count: totalDrafts },
              { id: 'closed', label: t.jobs.closed, count: totalClosed },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    updateUrlParams({ tab: tab.id });
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <form 
              className="flex items-center gap-2 flex-1 sm:w-auto"
              onSubmit={(e) => {
                e.preventDefault();
                updateUrlParams({ search: searchQuery, tab: activeTab });
              }}
            >
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari posisi, departemen, atau kota..."
                  className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Cari
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 bg-card border border-border rounded-xl text-center space-y-3">
          <Loader2 className="mx-auto text-primary animate-spin" size={36} />
          <p className="text-sm text-muted-foreground font-medium">Memuat data lowongan...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="p-12 bg-card border border-border rounded-xl text-center space-y-3">
          <AlertCircle className="mx-auto text-rose-500" size={36} />
          <h3 className="font-bold text-base text-foreground">Gagal Memuat Data</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">{error}</p>
          <button
            onClick={loadJobs}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Jobs List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="p-12 bg-card border border-border rounded-xl text-center space-y-3">
              <AlertCircle className="mx-auto text-muted-foreground" size={36} />
              <h3 className="font-bold text-base text-foreground">
                {jobs.length === 0 ? 'Belum Ada Lowongan' : 'Tidak Ada Lowongan Ditemukan'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {jobs.length === 0 
                  ? 'Anda belum membuat lowongan pekerjaan. Klik tombol "Buat Lowongan Baru" untuk memulai.'
                  : 'Tidak ada lowongan yang sesuai dengan kriteria pencarian atau status filter saat ini.'
                }
              </p>
              {jobs.length === 0 && (
                <Link 
                  href="/jobs/new"
                  className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus size={14} />
                  Buat Lowongan Baru
                </Link>
              )}
            </div>
          ) : (
            filteredJobs.map(job => {
              const isPublished = job.status === 'active';
              const isDraft = job.status === 'draft';
              const questionsCount = getVideoQuestionsCount(job.video_questions_json);
              const salaryText = (job.gaji_min || job.gaji_max)
                ? `${formatCurrency(job.gaji_min)} - ${formatCurrency(job.gaji_max)}`
                : 'Tidak ditampilkan';

              return (
                <div 
                  key={job.id} 
                  className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-all space-y-4"
                >
                
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <h3 className="font-bold text-base text-foreground">
                          {job.judul_posisi}
                        </h3>
                        {job.department && (
                          <span className="px-2.5 py-0.5 bg-muted/80 text-foreground text-[10px] font-bold rounded-md border border-border">
                            {job.department}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-3 flex-wrap">
                        <span>{job.tipe_pekerjaan}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1"><MapPin size={13} /> {job.lokasi_kerja} {job.kota ? `(${job.kota})` : ''}</span>
                        {job.tampilkan_gaji && (job.gaji_min || job.gaji_max) && (
                          <>
                            <span>&bull;</span>
                            <span className="font-semibold text-foreground">{salaryText}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isPublished && (
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-900 font-bold border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 text-xs rounded-md flex items-center gap-1.5 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-slate-800 dark:bg-slate-200"></span>
                          Dipublikasikan &bull; Active
                        </span>
                      )}
                      {isDraft && (
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-900 font-bold border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 text-xs rounded-md flex items-center gap-1.5 shadow-2xs">
                          <FileText size={13} className="text-slate-700 dark:text-slate-300" />
                          Draf &bull; Belum Dipublikasikan
                        </span>
                      )}
                      {job.status === 'closed' && (
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-xs rounded-md flex items-center gap-1.5 shadow-2xs">
                          Ditutup
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Config & Metrics Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-muted/30 border border-border rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold block mb-0.5">{t.jobs.thresholdAI}</span>
                      <span className="font-bold text-primary flex items-center gap-1">
                        <Sparkles size={13} className="text-primary" />
                        PO-FIT {job.cv_threshold}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold block mb-0.5">Wawancara Video</span>
                      <span className="font-bold text-foreground">
                        {questionsCount} Pertanyaan AI
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold block mb-0.5">Kuota Posisi</span>
                      <span className="font-bold text-foreground">
                        {job.openings_count} Orang
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold block mb-0.5">Tanggal Dibuat</span>
                      <span className="font-semibold text-muted-foreground">
                        {formatDate(job.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-border">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Batas Lamaran: <strong className="text-foreground">{job.tanggal_tutup ? formatDate(job.tanggal_tutup) : 'Belum ditentukan'}</strong>
                    </span>

                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                      
                      {/* Detail */}
                      <Link 
                        href={`/jobs/${job.id}`}
                        className="px-3.5 py-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Eye size={13} />
                        Detail
                      </Link>

                      {/* Edit */}
                      <Link 
                        href={`/jobs/new?edit=${job.id}`}
                        className="px-3.5 py-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Edit size={13} />
                        Edit
                      </Link>

                      {/* Toggle Status */}
                      <button 
                        onClick={() => handleToggleStatus(job)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors border shadow-2xs ${
                          isPublished 
                            ? 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' 
                            : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                        }`}
                      >
                        {isPublished ? 'Jadikan Draf' : 'Publikasikan'}
                      </button>

                      {/* Hapus */}
                      <button 
                        onClick={() => handleDeleteJob(job)}
                        className="px-3.5 py-1.5 bg-card border border-border text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 size={13} />
                        Hapus
                      </button>

                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground p-8 rounded-xl border border-border max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle size={36} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Hapus Lowongan</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus lowongan <strong className="text-foreground">"{jobToDelete.judul_posisi}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button 
                onClick={() => setJobToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg text-xs transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menghapus...
                  </>
                ) : (
                  <>Hapus Permanen</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function JobOpeningsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <JobOpeningsContent />
    </Suspense>
  );
}
