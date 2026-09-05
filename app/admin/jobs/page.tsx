'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Briefcase,
  Building2,
  MapPin,
  Eye,
  Ban,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Filter,
  X,
  Clock,
  Layers,
  Users
} from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';

interface JobItem {
  id: string;
  judul_posisi: string;
  tipe_pekerjaan: string;
  lokasi_kerja?: string;
  kota: string;
  status: string;
  gaji_min?: number;
  gaji_max?: number;
  tampilkan_gaji?: boolean;
  openings_count?: number;
  created_at: string;
  perusahaan?: {
    nama_perusahaan: string;
    logo_url?: string;
    kota?: string;
  };
  kategori?: {
    nama_kategori: string;
  };
}

function AdminJobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [filterType, setFilterType] = useState(searchParams.get('type') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [activeSearch, setActiveSearch] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);

  // Confirm Modal
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    jobId: string;
    jobTitle: string;
    currentStatus: string;
  }>({
    isOpen: false,
    jobId: '',
    jobTitle: '',
    currentStatus: ''
  });

  const loadJobs = async (searchQuery: string = activeSearch, statusQuery: string = filterStatus) => {
    setIsLoading(true);
    try {
      const apiParams = new URLSearchParams();
      apiParams.append('limit', '200');
      apiParams.append('include_all', 'true');
      if (statusQuery) apiParams.append('status', statusQuery);
      if (searchQuery.trim()) apiParams.append('search', searchQuery.trim());

      const res = await fetchAuth(`/api/jobs?${apiParams.toString()}`);
      if (!res.ok) throw new Error('Failed to load jobs');
      const data = await res.json();
      const jobsData = Array.isArray(data) ? data : data.data || [];
      setJobs(jobsData);
    } catch (error) {
      toast.error('Gagal memuat data lowongan pekerjaan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadJobs(activeSearch, filterStatus);
  }, [filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setCurrentPage(1);
    loadJobs(searchInput, filterStatus);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    setFilterStatus('');
    setFilterType('');
    setCurrentPage(1);
    loadJobs('', '');
  };

  const openConfirmDialog = (job: JobItem) => {
    setConfirmDialog({
      isOpen: true,
      jobId: job.id,
      jobTitle: job.judul_posisi,
      currentStatus: job.status
    });
  };

  const handleUpdateStatus = async () => {
    if (!confirmDialog.jobId) return;

    const newStatus = confirmDialog.currentStatus === 'active' ? 'closed' : 'active';
    const actionName = newStatus === 'active' ? 'mengaktifkan' : 'menutup';

    setIsUpdatingStatus(true);
    try {
      const res = await fetchAuth(`/api/jobs/${confirmDialog.jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Gagal ${actionName} lowongan`);
      }

      toast.success(`Status lowongan berhasil diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Ditutup'}`);
      loadJobs(activeSearch, filterStatus);
    } catch (error: any) {
      toast.error(error.message || `Gagal mengubah status`);
    } finally {
      setIsUpdatingStatus(false);
      setConfirmDialog({ isOpen: false, jobId: '', jobTitle: '', currentStatus: '' });
    }
  };

  // Client-side additional filtering (e.g. Type)
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchType = filterType ? j.tipe_pekerjaan.toLowerCase() === filterType.toLowerCase() : true;
      const matchLocalSearch = activeSearch
        ? j.judul_posisi.toLowerCase().includes(activeSearch.toLowerCase()) ||
          (j.perusahaan?.nama_perusahaan || '').toLowerCase().includes(activeSearch.toLowerCase()) ||
          (j.kota || '').toLowerCase().includes(activeSearch.toLowerCase())
        : true;
      return matchType && matchLocalSearch;
    });
  }, [jobs, filterType, activeSearch]);

  // Metric Stats
  const metrics = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter((j) => j.status === 'active' || j.status === 'published').length;
    const closed = jobs.filter((j) => j.status === 'closed' || j.status === 'draft').length;
    const uniqueCompanies = new Set(
      jobs.map((j) => j.perusahaan?.nama_perusahaan).filter(Boolean)
    ).size;

    return { total, active, closed, uniqueCompanies };
  }, [jobs]);

  // Format Salary
  const formatSalary = (min?: number, max?: number, isPublic?: boolean) => {
    if (isPublic === false || (!min && !max)) return 'Dirahasiakan';
    const fmt = (num: number) => `Rp ${(num / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Min ${fmt(min)}`;
    if (max) return `Hingga ${fmt(max)}`;
    return 'Dirahasiakan';
  };

  // DataTable Column Definitions
  const tableColumns: ColumnDef<JobItem>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      className: 'w-12 text-center text-slate-500 dark:text-slate-400 font-semibold',
      headerClassName: 'w-12 text-center',
      render: (_, index) => (currentPage - 1) * 10 + index + 1
    },
    {
      key: 'judul_posisi',
      header: 'Lowongan & Posisi',
      align: 'left',
      render: (job) => (
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-slate-900 dark:text-white text-xs truncate" title={job.judul_posisi}>
            {job.judul_posisi}
          </span>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              ID: {job.id.substring(0, 8)}...
            </span>
            {job.kategori?.nama_kategori && (
              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.2 rounded border border-blue-200 dark:border-blue-900/60">
                {job.kategori.nama_kategori}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'perusahaan',
      header: 'Perusahaan',
      align: 'left',
      render: (job) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200 dark:border-slate-700">
            {job.perusahaan?.nama_perusahaan ? job.perusahaan.nama_perusahaan.slice(0, 2).toUpperCase() : <Building2 size={14} />}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block truncate">
              {job.perusahaan?.nama_perusahaan || '-'}
            </span>
            {job.perusahaan?.kota && (
              <span className="text-[11px] text-slate-400 block truncate">
                {job.perusahaan.kota}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'lokasi_tipe',
      header: 'Lokasi & Tipe',
      align: 'left',
      render: (job) => (
        <div className="flex flex-col gap-1">
          <span className="text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1">
            <MapPin size={12} className="text-rose-500 shrink-0" />
            <span className="truncate">{job.kota || 'Indonesia'}</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold uppercase border border-slate-200 dark:border-slate-700">
              {job.tipe_pekerjaan}
            </span>
            {job.lokasi_kerja && (
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-[#1A4B9F] dark:text-blue-300 rounded text-[10px] font-semibold uppercase border border-blue-200 dark:border-blue-900/60">
                {job.lokasi_kerja}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'gaji_kuota',
      header: 'Gaji & Kuota',
      align: 'left',
      render: (job) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {formatSalary(job.gaji_min, job.gaji_max, job.tampilkan_gaji)}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Users size={11} className="text-slate-400" />
            {job.openings_count ? `${job.openings_count} Kuota` : '1 Kuota'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'left',
      render: (job) => {
        const isActive = job.status === 'active' || job.status === 'published';
        return isActive ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Aktif
          </span>
        ) : job.status === 'closed' ? (
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700">
            <XCircle size={13} className="text-slate-400" />
            Ditutup
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
            <Clock size={13} className="text-amber-500" />
            {job.status}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      className: 'w-36 text-right',
      headerClassName: 'w-36 text-right',
      render: (job) => {
        const isActive = job.status === 'active' || job.status === 'published';
        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* View Detail Admin */}
            <Link
              href={`/admin/jobs/${job.id}`}
              title="Lihat Detail Lowongan"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Eye size={15} />
            </Link>

            {/* View Public Page */}
            <Link
              href={`/jobs/${job.id}`}
              target="_blank"
              title="Buka Halaman Publik"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <ExternalLink size={15} />
            </Link>

            {/* Toggle Status */}
            <button
              onClick={() => openConfirmDialog(job)}
              title={isActive ? 'Tutup / Takedown Lowongan' : 'Aktifkan Kembali Lowongan'}
              className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-rose-100 dark:hover:bg-rose-950/50 hover:text-rose-600 border-slate-200 dark:border-slate-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-950/50 hover:text-emerald-600 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isActive ? <Ban size={15} /> : <CheckCircle2 size={15} />}
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 font-sans antialiased">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Manajemen Lowongan
            </h1>
            {!isLoading && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {jobs.length} Lowongan
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
            Pantau publikasi lowongan kerja, moderasi status, dan periksa kesesuaian data perusahaan.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Search Input Form via GET */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari posisi atau kota..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-black hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              Cari
            </button>
          </form>

          {/* Filter Status */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="closed">Ditutup</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Filter Tipe Pekerjaan */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value="">Semua Tipe</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadJobs(activeSearch, filterStatus)}
            disabled={isLoading}
            title="Muat Ulang"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/60">
            <Briefcase size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Lowongan
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {metrics.total}
            </span>
          </div>
        </div>

        {/* Stat 2: Aktif */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900/60">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Lowongan Aktif
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {metrics.active}
            </span>
          </div>
        </div>

        {/* Stat 3: Ditutup */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900/60">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ditutup / Draft
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {metrics.closed}
            </span>
          </div>
        </div>

        {/* Stat 4: Perusahaan */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-900/60">
            <Building2 size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Perusahaan Aktif
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {metrics.uniqueCompanies}
            </span>
          </div>
        </div>
      </div>

      {/* Active Filter Notification Banner */}
      {(activeSearch || filterStatus || filterType) && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Menampilkan filter:&nbsp;
              {activeSearch && <span>Pencarian: &ldquo;<strong>{activeSearch}</strong>&rdquo;&nbsp;</span>}
              {filterStatus && <span>• Status: <strong>{filterStatus}</strong>&nbsp;</span>}
              {filterType && <span>• Tipe: <strong>{filterType}</strong>&nbsp;</span>}
              ({filteredJobs.length} lowongan ditemukan)
            </span>
          </div>
          <button
            onClick={handleClearSearch}
            className="text-xs text-blue-700 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-1 shrink-0 ml-3 cursor-pointer"
          >
            <X size={13} /> Reset Filter
          </button>
        </div>
      )}

      {/* Standardized Reusable DataTable Component with 10 Rows Pagination */}
      <DataTable<JobItem>
        data={filteredJobs}
        columns={tableColumns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        pageSize={10}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        emptyTitle={activeSearch ? 'Tidak Ada Lowongan Ditemukan' : 'Belum Ada Lowongan Pekerjaan'}
        emptyDescription={
          activeSearch
            ? `Tidak ada data lowongan yang cocok dengan kata kunci "${activeSearch}".`
            : 'Belum ada data lowongan pekerjaan yang terdaftar untuk kriteria filter ini.'
        }
      />

      {/* Modal Konfirmasi Moderasi Status Lowongan */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !isUpdatingStatus && setConfirmDialog({ isOpen: false, jobId: '', jobTitle: '', currentStatus: '' })}
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
                {confirmDialog.currentStatus === 'active' ? (
                  <strong className="text-rose-600 dark:text-rose-400">menutup publikasi</strong>
                ) : (
                  <strong className="text-emerald-600 dark:text-emerald-400">mengaktifkan kembali</strong>
                )}{' '}
                lowongan <strong className="text-slate-900 dark:text-white">&ldquo;{confirmDialog.jobTitle}&rdquo;</strong>?
                {confirmDialog.currentStatus === 'active' && (
                  <span className="block mt-1 text-slate-400 text-[11px]">
                    Lowongan yang ditutup tidak dapat dilamar oleh kandidat di platform.
                  </span>
                )}
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => setConfirmDialog({ isOpen: false, jobId: '', jobTitle: '', currentStatus: '' })}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={handleUpdateStatus}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-xs transition-colors shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                    confirmDialog.currentStatus === 'active'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isUpdatingStatus && <RefreshCw size={13} className="animate-spin" />}
                  <span>{confirmDialog.currentStatus === 'active' ? 'Ya, Tutup Lowongan' : 'Ya, Aktifkan Lowongan'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <RefreshCw size={16} className="animate-spin text-blue-600" />
            <span>Memuat manajemen lowongan...</span>
          </div>
        </div>
      }
    >
      <AdminJobsContent />
    </Suspense>
  );
}
