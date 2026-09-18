'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { fetchAuth } from '@/lib/api/auth';
import { 
  Plus, Search, Eye, Edit, Trash2, Copy, 
  CheckCircle2, Clock, AlertCircle, MapPin,
  FileText, Check, AlertTriangle
} from 'lucide-react';
import { DataTable, ColumnDef, Pagination } from '@/components/ui/DataTable';
import { JobDetailModal } from '@/components/dashboard/JobDetailModal';

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
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
    setCurrentPage(1);
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

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  const totalActive = jobs.filter(j => j.status === 'active').length;
  const totalDrafts = jobs.filter(j => j.status === 'draft').length;
  const totalClosed = jobs.filter(j => j.status === 'closed').length;

  const columns = useMemo<ColumnDef<JobItem>[]>(() => [
    {
      key: 'no',
      header: 'No.',
      align: 'center',
      className: 'w-12',
      render: (_, index) => <span className="font-semibold text-muted-foreground">{(currentPage - 1) * pageSize + index + 1}</span>
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
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setPreviewJobId(job.id); }}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Lihat Detail (Pratinjau Publik)"
          >
            <Eye size={14} />
          </button>
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
  ], [copiedId, currentPage]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">{t.jobs.listTitle}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{t.jobs.listSubtitle}</p>
        </div>

        <Link
          href="/jobs/new"
          className="w-full sm:w-auto justify-center px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md shadow-primary/20 shrink-0 active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          {t.jobs.title}
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          
          {/* Status Filter Tabs */}
          <div className="grid grid-cols-4 sm:flex gap-1 p-1 bg-muted/60 rounded-xl w-full sm:w-auto border border-border/50 no-scrollbar">
            {[
              { id: 'all', label: t.jobs.allJobs, shortLabel: 'Semua', count: jobs.length },
              { id: 'active', label: t.jobs.published, shortLabel: 'Aktif', count: totalActive },
              { id: 'draft', label: t.jobs.draft, shortLabel: 'Draf', count: totalDrafts },
              { id: 'closed', label: t.jobs.closed, shortLabel: 'Ditutup', count: totalClosed },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setCurrentPage(1);
                    updateUrlParams({ tab: tab.id });
                  }}
                  className={`px-1.5 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 sm:gap-1.5 ${
                    isActive 
                      ? 'bg-background text-foreground shadow-xs' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }`}
                >
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="w-full sm:w-auto">
            <form 
              className="flex items-center gap-2 w-full sm:w-auto"
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentPage(1);
                updateUrlParams({ search: searchQuery, tab: activeTab });
              }}
            >
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari lowongan, departemen, atau kota..."
                  className="w-full pl-9 pr-8 py-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary font-medium transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                      updateUrlParams({ search: '', tab: activeTab });
                    }}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground text-xs p-0.5 rounded-full"
                    title="Hapus pencarian"
                  >
                    &times;
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Cari
              </button>
            </form>
          </div>
      </div>

      {/* Error State */}
      {!isLoading && error && (
        <div className="p-8 sm:p-12 bg-card border border-border rounded-xl text-center space-y-3">
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

      {/* Desktop Jobs Table (Hidden on Mobile) */}
      {!error && (
        <div className="hidden md:block bg-card rounded-xl border border-border shadow-xs overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredJobs}
            isLoading={isLoading}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onRowClick={(job) => setPreviewJobId(job.id)}
            emptyTitle={jobs.length === 0 ? 'Belum Ada Lowongan' : 'Tidak Ada Lowongan Ditemukan'}
            emptyDescription={jobs.length === 0 
              ? 'Anda belum membuat lowongan pekerjaan. Klik tombol "Buat Lowongan Baru" untuk memulai.'
              : 'Tidak ada lowongan yang sesuai dengan kriteria pencarian atau status filter saat ini.'
            }
          />
        </div>
      )}

      {/* Mobile Jobs Card List (Visible on screens < 768px) */}
      {!error && (
        <div className="block md:hidden space-y-3">
          {isLoading ? (
            // Mobile Skeleton Loader
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3 animate-pulse">
                  <div className="flex justify-between items-start gap-2">
                    <div className="h-5 bg-muted rounded-md w-1/2"></div>
                    <div className="h-5 bg-muted rounded-full w-16"></div>
                  </div>
                  <div className="h-4 bg-muted/60 rounded w-1/3"></div>
                  <div className="h-12 bg-muted/30 rounded-xl"></div>
                  <div className="h-8 bg-muted/50 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            // Mobile Empty State
            <div className="p-8 bg-card border border-border rounded-2xl text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <FileText size={24} />
              </div>
              <h3 className="font-bold text-sm text-foreground">
                {jobs.length === 0 ? 'Belum Ada Lowongan' : 'Tidak Ada Lowongan Ditemukan'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {jobs.length === 0 
                  ? 'Anda belum membuat lowongan pekerjaan. Buat lowongan pertama Anda sekarang.'
                  : 'Tidak ada lowongan yang cocok dengan filter atau kata kunci pencarian.'
                }
              </p>
              {jobs.length === 0 && (
                <Link
                  href="/jobs/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-xs"
                >
                  <Plus size={14} />
                  Buat Lowongan Baru
                </Link>
              )}
            </div>
          ) : (
            // Mobile Job Cards
            <>
              <div className="space-y-3">
                {paginatedJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="bg-card border border-border/90 rounded-2xl p-4 shadow-xs hover:border-primary/40 active:scale-[0.99] transition-all space-y-3 relative overflow-hidden cursor-pointer"
                    onClick={() => setPreviewJobId(job.id)}
                  >
                    {/* Top Row: Title + Status Pill */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground leading-snug break-words">
                          {job.judul_posisi}
                        </h3>
                        {job.department && (
                          <span className="inline-block px-2 py-0.5 bg-muted/80 text-muted-foreground text-[10px] font-semibold rounded-md border border-border/60">
                            {job.department}
                          </span>
                        )}
                      </div>

                      {/* Status Pill */}
                      <div className="shrink-0">
                        {job.status === 'active' ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/80 text-[10px] rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Aktif
                          </span>
                        ) : job.status === 'draft' ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/80 text-[10px] rounded-full flex items-center gap-1.5">
                            <FileText size={10} className="text-amber-600 dark:text-amber-400" />
                            Draf
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-[10px] rounded-full">
                            Ditutup
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Job Meta: Location & Type */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-muted/50 text-[11px] font-semibold text-foreground">
                        {job.tipe_pekerjaan}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin size={12} className="text-muted-foreground shrink-0" />
                        {job.lokasi_kerja} {job.kota ? `(${job.kota})` : ''}
                      </span>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/50 text-[11px]">
                      <div className="text-center">
                        <div className="text-[10px] text-muted-foreground">Threshold</div>
                        <div className="font-bold text-primary text-xs mt-0.5">{job.cv_threshold}%</div>
                      </div>
                      <div className="text-center border-x border-border/50">
                        <div className="text-[10px] text-muted-foreground">Pertanyaan</div>
                        <div className="font-bold text-foreground text-xs mt-0.5">{getVideoQuestionsCount(job.video_questions_json)} soal</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-muted-foreground">Batas Lamaran</div>
                        <div className="font-semibold text-foreground text-[10px] mt-0.5 truncate">
                          {job.tanggal_tutup ? formatDate(job.tanggal_tutup) : '-'}
                        </div>
                      </div>
                    </div>

                    {/* Touch-Friendly Action Bar */}
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setPreviewJobId(job.id)}
                        className="flex-1 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                      >
                        <Eye size={14} />
                        <span>Detail</span>
                      </button>
                      
                      <Link
                        href={`/jobs/new?edit=${job.id}`}
                        className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </Link>

                      <div className="flex items-center gap-1">
                        {job.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => handleCopyLink(job.judul_posisi)}
                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 transition-colors active:scale-95"
                            title="Salin Link Publik"
                          >
                            {copiedId === job.judul_posisi ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(job)}
                          className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 transition-colors active:scale-95"
                          title={job.status === 'active' ? 'Ubah ke Draf' : 'Publikasikan'}
                        >
                          {job.status === 'active' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job)}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 transition-colors active:scale-95"
                          title="Hapus Lowongan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Pagination */}
              {filteredJobs.length > pageSize && (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredJobs.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Public-Style Job Detail Modal Preview */}
      {previewJobId && (
        <JobDetailModal
          jobId={previewJobId}
          onClose={() => setPreviewJobId(null)}
        />
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
