'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import toast from 'react-hot-toast';

export function ArchiveTable() {
  const { t } = useTranslation();
  
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetchAuth('/api/applications/');
      if (res.ok) {
        const data = await res.json();
        // Filter for archived candidates (accepted or rejected)
        const archivedApps = (data.data || []).filter((a: any) => 
          a.status === 'Lolos' || a.status === 'ditolak' || a.status === 'Tidak Lolos'
        );
        setApplications(archivedApps);
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

  return (
    <div className="bg-card text-card-foreground border border-border border-t-0 rounded-b-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground font-semibold text-xs uppercase tracking-wider border-b border-border">
            <tr>
              <th className="px-6 py-4">Kandidat</th>
              <th className="px-6 py-4">Posisi Dilamar</th>
              <th className="px-6 py-4">Pendidikan</th>
              <th className="px-6 py-4">Tanggal Arsip</th>
              <th className="px-6 py-4">Keputusan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex justify-center mb-4">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                  Memuat data arsip...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex justify-center mb-2">
                    <FileText size={32} className="text-muted/50" />
                  </div>
                  Belum ada kandidat di arsip.
                </td>
              </tr>
            ) : (
              applications.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
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
                    <p className="text-xs">{row.job?.kategori?.nama_kategori || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {row.pelamar?.institusi_pendidikan || row.cvData?.education?.[0]?.school || '-'}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(row.updated_at || row.applied_at)}</td>
                  <td className="px-6 py-4">
                    {row.status === 'Lolos' ? (
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full border border-transparent">
                        Diterima / Lolos
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-full border border-transparent">
                        Ditolak / Diskualifikasi
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && applications.length > 0 && (
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t.archive?.showing} <strong>1</strong> {t.archive?.to} <strong>{applications.length}</strong> {t.archive?.of} <strong>{applications.length}</strong> {t.archive?.results}
          </p>
        </div>
      )}
    </div>
  );
}
