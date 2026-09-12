'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
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
import { DataTable, ColumnDef } from '@/components/ui/DataTable';

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
  const urlSearch = (searchParams.get('search') || '').toLowerCase();
  const filteredJobs = jobs.filter(job => {
    const matchesTab = activeTab === 'all' || job.status === activeTab;
    const matchesSearch = !urlSearch || 
                          job.judul_posisi.toLowerCase().includes(urlSearch) || 
                          (job.department || '').toLowerCase().includes(urlSearch) ||
                          (job.kota || '').toLowerCase().includes(urlSearch);
    return matchesTab && matchesSearch;
  });

  const totalActive = jobs.filter(j => j.status === 'active').length;
  const totalDrafts = jobs.filter(j => j.status === 'draft').length;
  const totalClosed = jobs.filter(j => j.status === 'closed').length;

  const columns = useMemo<ColumnDef<JobItem>[]>(() => [
    {
      key: 'no',
      header: 'No.',
      align: 'center',
      className: 'w-12',
      render: (_, index) => <span className="font-semibold text-muted-foreground">{index + 1}</span>
    },
    {
      key: 'position',
      header: 'Posisi & Lokasi',
      render: (job) => (
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-sm text-foreground">{job.judul_posisi}</h3>
            {job.department && (
              <span className="px-2 py-0.5 bg-muted/80 text-foreground text-[10px] font-bold rounded-md border border-border">
                {job.department}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 flex-wrap">
            <span>{job.tipe_pekerjaan}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1"><MapPin size={11} /> {job.lokasi_kerja} {job.kota ? `(${job.kota})` : ''}</span>
          </p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (job) => {
        if (job.status === 'active') {
          return (
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800 text-[10px] rounded-lg flex items-center gap-1.5 w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Dipublikasikan
            </span>
          );
        } else if (job.status === 'draft') {
          return (
             <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold border border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800 text-[10px] rounded-lg flex items-center gap-1.5 w-max">
              <FileText size={11} className="text-amber-600 dark:text-amber-400" />
              Draf
            </span>
          )
        } else {
          return (
             <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-[10px] rounded-lg w-max">
              Ditutup
            </span>
          )
        }
      }
    },
    {
      key: 'metrics',
      header: 'Info & Analytics',
      render: (job) => (
        <div className="text-[11px] text-muted-foreground space-y-1">
           <div><span className="font-semibold">Threshold AI:</span> <span className="text-primary font-bold">{job.cv_threshold}%</span></div>
           <div><span className="font-semibold">Pertanyaan:</span> <span className="text-foreground font-medium">{getVideoQuestionsCount(job.video_questions_json)}</span></div>
           <div><span className="font-semibold">Kuota Posisi:</span> <span className="text-foreground font-medium">{job.openings_count}</span></div>
        </div>
      )
    },
    {
      key: 'deadline',
      header: 'Batas Lamaran',
      render: (job) => (
        <span className="text-xs font-semibold text-foreground">
           {job.tanggal_tutup ? formatDate(job.tanggal_tutup) : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (job) => (
        <div className="flex items-center justify-end gap-1.5">
          {job.status === 'active' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleCopyLink(job.judul_posisi); }}
              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Salin Link Publik"
            >
              {copiedId === job.judul_posisi ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
          <Link
            href={`/jobs/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            title="Lihat Detail"
          >
            <Eye size={14} />
          </Link>
          <Link
            href={`/jobs/new?edit=${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
            title="Edit Lowongan"
          >
            <Edit size={14} />
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleStatus(job); }}
            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            title={job.status === 'active' ? 'Ubah ke Draf' : 'Publikasikan'}
          >
             {job.status === 'active' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteJob(job); }}
            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
            title="Hapus Lowongan"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ], [copiedId]);

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

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Status Filter Tabs */}
          <div className="flex gap-1 p-1 bg-muted/60 rounded-xl overflow-x-auto w-full sm:w-auto border border-border/50">
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
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'
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

      {/* Jobs Table */}
      {!error && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredJobs}
            isLoading={isLoading}
            pageSize={10}
            emptyTitle={jobs.length === 0 ? 'Belum Ada Lowongan' : 'Tidak Ada Lowongan Ditemukan'}
            emptyDescription={jobs.length === 0 
              ? 'Anda belum membuat lowongan pekerjaan. Klik tombol "Buat Lowongan Baru" untuk memulai.'
              : 'Tidak ada lowongan yang sesuai dengan kriteria pencarian atau status filter saat ini.'
            }
          />
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
