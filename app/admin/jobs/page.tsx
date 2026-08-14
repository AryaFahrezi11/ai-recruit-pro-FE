'use client';

import React, { useEffect, useState } from 'react';
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

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, jobId: string, status: string}>({ isOpen: false, jobId: '', status: '' });

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      // Fetch jobs with a large limit. For a real production app, this should have pagination.
      const res = await fetchAuth('/api/jobs?limit=200');
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
  }, []);

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
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Lowongan</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau dan kelola semua lowongan pekerjaan yang dipublikasikan di platform.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari posisi atau perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-2 w-64 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Lowongan</th>
                <th className="px-6 py-4">Perusahaan</th>
                <th className="px-6 py-4">Lokasi & Tipe</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Memuat data lowongan...</td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Tidak ada lowongan ditemukan.</td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{job.judul_posisi}</span>
                        <span className="text-slate-500 text-xs mt-0.5">ID: {job.id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700">{job.perusahaan?.nama_perusahaan || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1">
                          <span className="text-slate-600 text-xs flex items-center gap-1">
                            {job.kota || '-'}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase w-max">
                            {job.tipe_pekerjaan}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      {job.status === 'active' || job.status === 'published' ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                           Active
                         </span>
                      ) : (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                           {job.status}
                         </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/admin/jobs/${job.id}`}
                            title="Lihat Detail Lowongan"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                          >
                            <Eye size={16} />
                          </Link>
                          <button 
                            onClick={() => openConfirmDialog(job.id, job.status)}
                            title={job.status === 'active' ? "Tutup Lowongan (Banned/Takedown)" : "Aktifkan Lowongan"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              job.status === 'active' 
                                ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' 
                                : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'
                            }`}
                          >
                            {job.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4 mx-auto">
                <AlertTriangle className="text-amber-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                Konfirmasi Aksi
              </h3>
              <p className="text-slate-500 text-sm text-center mb-6">
                Yakin ingin {confirmDialog.status === 'active' ? <span className="font-semibold text-rose-500">menutup</span> : <span className="font-semibold text-emerald-500">mengaktifkan</span>} lowongan ini?
                {confirmDialog.status === 'active' && ' Kandidat tidak akan bisa melamar lagi.'}
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDialog({ isOpen: false, jobId: '', status: '' })}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-colors shadow-sm ${
                    confirmDialog.status === 'active' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
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
