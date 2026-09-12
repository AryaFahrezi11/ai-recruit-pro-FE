'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FileText, Trash2, AlertTriangle, X } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import toast from 'react-hot-toast';

export function ArchiveTable({ search, jobFilter, hasilFilter, date, onJobsExtracted }: any) {
  const { t } = useTranslation();
  
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<any | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetchAuth('/api/applications/');
      if (res.ok) {
        const data = await res.json();
        const archivedApps = (data.data || []).filter((a: any) => 
          ['Lolos', 'hired', 'ditolak', 'Tidak Lolos', 'ditolak_sistem', 'rejected'].includes(a.status)
        );
        setApplications(archivedApps);

        if (onJobsExtracted) {
          const uniqueMap = new Map();
          archivedApps.forEach((app: any) => {
            if (app.job) {
              uniqueMap.set(app.job.id, app.job.judul_posisi);
            }
          });
          const uniqueJobsList = Array.from(uniqueMap.entries()).map(([id, title]) => ({ id, title }));
          onJobsExtracted(uniqueJobsList);
        }
      }
    } catch (e) {
      toast.error('Gagal memuat data arsip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleDeleteApplication = async (appId: string) => {
    try {
      setDeletingId(appId);
      const res = await fetchAuth(`/api/applications/${appId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Kandidat berhasil dihapus dari arsip');
        setApplications(prev => prev.filter(item => item.id !== appId));
      } else {
        toast.error('Gagal menghapus kandidat dari arsip');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat menghapus data');
    } finally {
      setDeletingId(null);
      setSelectedForDelete(null);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarBg = (name: string) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500'];
    const charCode = name ? name.charCodeAt(0) : 0;
    return `${colors[charCode % colors.length]} text-white`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(new Date(dateStr));
  };

  const currentYearMonth = new Date().toISOString().substring(0, 7);

  const filteredApplications = applications.filter((app) => {
    const appDateRaw = app.updated_at || app.applied_at || '';
    const appDateOnly = appDateRaw.substring(0, 10);
    const appYearMonth = appDateRaw.substring(0, 7);

    if (date) {
      if (appDateOnly !== date) return false;
    } else {
      if (appYearMonth !== currentYearMonth) return false;
    }

    if (hasilFilter) {
      if (hasilFilter === 'hired') {
        if (!['Lolos', 'hired'].includes(app.status)) return false;
      } else if (hasilFilter === 'rejected') {
        if (!['ditolak', 'Tidak Lolos', 'ditolak_sistem', 'rejected'].includes(app.status)) return false;
      }
    }

    if (jobFilter) {
      if (app.job?.id !== jobFilter) return false;
    }

    if (search) {
      const searchLower = search.toLowerCase();
      const matchName = (app.pelamar?.nama_lengkap || '').toLowerCase().includes(searchLower);
      const matchEmail = (app.pelamar?.email || '').toLowerCase().includes(searchLower);
      const matchJob = (app.job?.judul_posisi || '').toLowerCase().includes(searchLower);
      const matchCategory = (app.job?.kategori?.nama_kategori || '').toLowerCase().includes(searchLower);
      const matchUniv = (app.pelamar?.institusi_pendidikan || app.cvData?.education?.[0]?.school || '').toLowerCase().includes(searchLower);

      if (!matchName && !matchEmail && !matchJob && !matchCategory && !matchUniv) return false;
    }

    return true;
  });

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3.5 w-12 text-center">NO.</th>
              <th className="px-5 py-3.5">{t.archive?.candidate || 'CANDIDATE'}</th>
              <th className="px-5 py-3.5">{t.archive?.role || 'KATEGORI / PEKERJAAN'}</th>
              <th className="px-5 py-3.5">PENDIDIKAN</th>
              <th className="px-5 py-3.5">{t.archive?.dateClosed || 'DATE CLOSED'}</th>
              <th className="px-5 py-3.5">{t.archive?.outcome || 'OUTCOME'}</th>
              <th className="px-5 py-3.5 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex justify-center mb-4">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                  {t.archive?.loadingArchive || 'Loading data arsip...'}
                </td>
              </tr>
            ) : filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex justify-center mb-2">
                    <FileText size={32} className="text-muted/50" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">
                    {date ? 'Tidak ada data arsip pada tanggal ini.' : 'Belum ada data arsip untuk bulan ini.'}
                  </p>
                  <p className="text-xs">
                    {date ? 'Coba ganti atau reset filter tanggal untuk melihat data lain.' : 'Gunakan filter tanggal di atas untuk mencari arsip di bulan/tahun terdahulu.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredApplications.map((row, index) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4 text-center font-bold text-xs text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarBg(row.pelamar?.nama_lengkap || '')}`}>
                        {getInitials(row.pelamar?.nama_lengkap || '')}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{row.pelamar?.nama_lengkap || 'Kandidat'}</p>
                        <p className="text-xs text-muted-foreground">{row.pelamar?.email || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <p className="font-medium text-foreground">{row.job?.judul_posisi || '-'}</p>
                    <p className="text-xs text-muted-foreground/80">{row.job?.kategori?.nama_kategori || 'Umum'}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {row.pelamar?.institusi_pendidikan || row.cvData?.education?.[0]?.school || '-'}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(row.updated_at || row.applied_at)}</td>
                  <td className="px-6 py-4">
                    {row.status === 'Lolos' || row.status === 'hired' ? (
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800/50">
                        {t.archive?.hired || 'Hired / Diterima'}
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1 items-start">
                        <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-full border border-rose-200 dark:border-rose-800/50">
                          {row.status === 'ditolak_sistem' || (row.status === 'rejected' && (row.analisis_cv?.hasil === 'ditolak' || row.analisis_cv?.hasil === 'tidak_memenuhi_syarat')) ? 'Ditolak (CV Screening)' : 'Ditolak (Tahap Akhir)'}
                        </span>
                        {row.catatan_perusahaan && (
                           <span className="text-[10px] text-muted-foreground line-clamp-2 max-w-[220px]" title={row.catatan_perusahaan}>
                             {row.catatan_perusahaan}
                           </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedForDelete(row)}
                      disabled={deletingId === row.id}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-40"
                      title="Hapus dari Arsip"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredApplications.length > 0 && (
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t.archive?.showing || 'Menampilkan'} <strong>1</strong> - <strong>{filteredApplications.length}</strong> dari <strong>{filteredApplications.length}</strong> data arsip
          </p>
        </div>
      )}

      {selectedForDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-base">
                <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-950/60">
                  <AlertTriangle size={20} />
                </div>
                <span>Hapus Data Arsip</span>
              </div>
              <button
                onClick={() => setSelectedForDelete(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              Apakah Anda yakin ingin menghapus data arsip kandidat <strong className="text-foreground">{selectedForDelete.pelamar?.nama_lengkap || 'Kandidat'}</strong> untuk posisi <strong className="text-foreground">{selectedForDelete.job?.judul_posisi || 'Lowongan'}</strong>?
            </p>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-300 text-xs leading-normal">
              ⚠️ Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedForDelete(null)}
                disabled={deletingId === selectedForDelete.id}
                className="px-4 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteApplication(selectedForDelete.id)}
                disabled={deletingId === selectedForDelete.id}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span>{deletingId === selectedForDelete.id ? 'Menghapus...' : 'Ya, Hapus Arsip'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
