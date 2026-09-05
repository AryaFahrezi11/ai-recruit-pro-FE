'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Briefcase, Eye, Ban, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface JobItem {
  id: string;
  judul_posisi: string;
  tipe_pekerjaan: string;
  kota: string;
  status: string;
  created_at: string;
  perusahaan?: { nama_perusahaan: string };
  openings_count?: number;
}

function AdminJobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, jobId: string, status: string}>({ isOpen: false, jobId: '', status: '' });

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const apiParams = new URLSearchParams();
      apiParams.append('limit', '200');
      const search = searchParams.get('search');
      if (search) apiParams.append('search', search);
      const qs = apiParams.toString();

      // Fetch jobs with a large limit. For a real production app, this should have pagination.
      const res = await fetchAuth(`/api/jobs?${qs}`);
      if (!res.ok) throw new Error('Failed to load jobs');
      const data = await res.json();
      // The API might return an array directly or { data: [...] }
      const jobsData = Array.isArray(data) ? data : (data.data || []);
      setJobs(jobsData);
    } catch (error) {
      toast.error('Gagal memuat data lowongan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [searchParams]);

  const openConfirmDialog = (jobId: string, currentStatus: string) => {
    setConfirmDialog({ isOpen: true, jobId, status: currentStatus });
  };

  const handleUpdateStatus = async () => {
    if (!confirmDialog.jobId) return;

    const newStatus = confirmDialog.status === 'active' ? 'closed' : 'active';
    const actionName = newStatus === 'active' ? 'mengaktifkan' : 'menutup';
    
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
      
      toast.success(`Status lowongan berhasil diubah menjadi ${newStatus}`);
      loadJobs();
    } catch (error: any) {
      toast.error(error.message || `Gagal mengubah status`);
    } finally {
      setConfirmDialog({ isOpen: false, jobId: '', status: '' });
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.judul_posisi.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (j.perusahaan?.nama_perusahaan || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans antialiased">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Manajemen Lowongan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">Pantau dan kelola semua lowongan pekerjaan yang dipublikasikan di platform.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <form 
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              updateUrlParams({ search: searchQuery });
            }}
          >
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white" />
              <input 
                type="text"
                placeholder="Cari posisi atau perusahaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              Cari
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Lowongan</th>
                <th className="px-6 py-4">Perusahaan</th>
                <th className="px-6 py-4">Lokasi & Tipe</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">Memuat data lowongan...</td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">Tidak ada lowongan ditemukan.</td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{job.judul_posisi}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">ID: {job.id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{job.perusahaan?.nama_perusahaan || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1">
                          <span className="text-slate-600 dark:text-slate-400 text-xs flex items-center gap-1">
                            {job.kota || '-'}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold uppercase w-max border border-slate-200 dark:border-slate-700">
                            {job.tipe_pekerjaan}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      {job.status === 'active' || job.status === 'published' ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white animate-pulse"></span>
                           Active
                         </span>
                      ) : (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                           {job.status}
                         </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link 
                            href={`/admin/jobs/${job.id}`}
                            title="Lihat Detail Lowongan"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                          >
                            <Eye size={15} className="text-black dark:text-white" />
                          </Link>
                          <button 
                            onClick={() => openConfirmDialog(job.id, job.status)}
                            title={job.status === 'active' ? "Tutup Lowongan (Banned/Takedown)" : "Aktifkan Lowongan"}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                          >
                            {job.status === 'active' ? <Ban size={15} className="text-black dark:text-white" /> : <CheckCircle size={15} className="text-black dark:text-white" />}
                          </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Custom Confirm Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setConfirmDialog({ isOpen: false, jobId: '', status: '' })}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4 mx-auto">
                <AlertTriangle className="text-black dark:text-white" size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white text-center mb-2">
                Konfirmasi Aksi
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs text-center mb-6 font-medium">
                Yakin ingin {confirmDialog.status === 'active' ? <span className="font-bold text-rose-600">menutup</span> : <span className="font-bold text-emerald-600">mengaktifkan</span>} lowongan ini?
                {confirmDialog.status === 'active' && ' Kandidat tidak akan bisa melamar lagi.'}
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDialog({ isOpen: false, jobId: '', status: '' })}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white font-semibold text-xs bg-black hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Ya, Lanjutkan
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}>
      <AdminJobsContent />
    </Suspense>
  );
}
