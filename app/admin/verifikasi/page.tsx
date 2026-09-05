'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Building2,
  ExternalLink,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  Eye,
  X,
  Globe,
  Phone,
  LayoutGrid,
  List,
  AlertCircle,
  RefreshCw,
  CornerDownLeft,
  Users,
  Briefcase,
  XCircle
} from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { getMediaUrl } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface CompanyVerificationItem {
  id: string;
  user_id?: string;
  nama_perusahaan: string;
  industri?: string;
  ukuran?: string;
  deskripsi?: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  website_url?: string;
  logo_url?: string;
  no_telepon?: string;
  tahun_berdiri?: string | number;
  nib_number?: string;
  nib_document_url?: string;
  hr_name?: string;
  hr_whatsapp?: string;
  hr_position?: string;
  hr_id_card_url?: string;
  is_verified?: boolean;
  status?: string;
  rejection_reason?: string;
}

export default function AdminVerificationPage() {
  const [companies, setCompanies] = useState<CompanyVerificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedCompany, setSelectedCompany] = useState<CompanyVerificationItem | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [companyToReject, setCompanyToReject] = useState<CompanyVerificationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Fetch pending companies with GET search query parameter
  const loadPendingCompanies = async (searchQuery: string = activeSearch) => {
    setIsLoading(true);
    try {
      const q = typeof searchQuery === 'string' ? searchQuery.trim() : '';
      const endpoint = q
        ? `/api/admin/perusahaan/pending?search=${encodeURIComponent(q)}`
        : '/api/admin/perusahaan/pending';
      const res = await fetchAuth(endpoint, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setCompanies(Array.isArray(data) ? data : []);
      } else {
        toast.error('Gagal memuat data perusahaan');
      }
    } catch {
      toast.error('Gagal memuat data perusahaan. Periksa koneksi backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingCompanies();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    loadPendingCompanies(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    loadPendingCompanies('');
  };

  const handleApprove = async (companyId: string, companyName: string) => {
    if (
      !window.confirm(
        `Setujui akun perusahaan "${companyName || 'ini'}"? Akses dashboard rekrutmen akan langsung aktif.`
      )
    )
      return;

    setApprovingId(companyId);
    try {
      const res = await fetchAuth(`/api/admin/perusahaan/${companyId}/verify`, { method: 'PUT' });
      if (res.ok) {
        toast.success(`Akun "${companyName || 'Perusahaan'}" berhasil disetujui!`, { icon: '🎉' });
        if (selectedCompany?.id === companyId) {
          setSelectedCompany(null);
        }
        loadPendingCompanies(activeSearch);
      } else {
        toast.error('Gagal memverifikasi perusahaan');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memverifikasi perusahaan');
    } finally {
      setApprovingId(null);
    }
  };

  const handleOpenRejectModal = (company: CompanyVerificationItem) => {
    setCompanyToReject(company);
    setRejectReason(company.rejection_reason || '');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!companyToReject) return;
    if (!rejectReason.trim()) {
      toast.error('Harap masukkan alasan penolakan.');
      return;
    }

    setIsRejecting(true);
    try {
      const res = await fetchAuth(`/api/admin/perusahaan/${companyToReject.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() })
      });

      if (res.ok) {
        toast.success(
          `Verifikasi "${companyToReject.nama_perusahaan}" berhasil ditolak. Instruksi perbaikan telah dikirimkan ke perusahaan.`,
          { icon: '⚠️' }
        );
        if (selectedCompany?.id === companyToReject.id) {
          setSelectedCompany(null);
        }
        setRejectModalOpen(false);
        setCompanyToReject(null);
        setRejectReason('');
        loadPendingCompanies(activeSearch);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(typeof err.detail === 'string' ? err.detail : 'Gagal menolak verifikasi perusahaan');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memproses penolakan.');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Verifikasi Legalitas Perusahaan
            </h1>
            {!isLoading && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {companies.length} Menunggu
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Tinjau berkas legalitas (NIB &amp; ID Card HR) dan setujui perusahaan baru yang mendaftar.
          </p>
        </div>

        {/* Toolbar: GET Search Form, Refresh, View Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Search Form via GET */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari perusahaan, NIB, PIC..."
                className="w-full pl-9 pr-24 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 shadow-xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-16 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Hapus pencarian"
                >
                  <X size={13} />
                </button>
              )}
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono inline-flex items-center gap-0.5 select-none pointer-events-none">
                <CornerDownLeft size={10} /> Enter
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 shrink-0"
              title="Cari (GET)"
            >
              <Search size={13} />
              <span className="hidden sm:inline">Cari</span>
            </button>
          </form>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              title="Tampilan Tabel Kompak"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Tampilan Kartu Ringkas"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadPendingCompanies(activeSearch)}
            disabled={isLoading}
            title="Muat Ulang"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shrink-0"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Active Search Filter Banner */}
      {activeSearch && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Hasil pencarian untuk: <strong className="font-bold underline">"{activeSearch}"</strong> ({companies.length} data ditemukan)
            </span>
          </div>
          <button
            onClick={handleClearSearch}
            className="text-xs text-blue-700 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-1 shrink-0 ml-3"
          >
            <X size={13} /> Reset Filter
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
          <RefreshCw size={18} className="animate-spin text-blue-500" />
          <span className="text-sm font-medium">Memuat antrean verifikasi perusahaan...</span>
        </div>
      ) : companies.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {activeSearch ? (
            <>
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl flex items-center justify-center mb-4 border border-amber-100 dark:border-amber-800/60">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Tidak Ada Perusahaan Ditemukan
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm mt-1.5">
                Tidak ada perusahaan antrean yang sesuai dengan kata kunci pencarian "{activeSearch}".
              </p>
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
              >
                <X size={14} /> Reset Pencarian
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-800/60">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Tidak Ada Antrean Verifikasi
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm mt-1.5">
                Semua pendaftaran perusahaan telah selesai diverifikasi atau belum ada pendaftaran baru.
              </p>
            </>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Kompak & Muat Banyak) */
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5 text-center">No</th>
                  <th className="px-5 py-3.5">Perusahaan</th>
                  <th className="px-4 py-3.5">Sektor &amp; Skala Karyawan</th>
                  <th className="px-4 py-3.5">NIB / NPWP</th>
                  <th className="px-4 py-3.5">Perwakilan HRD</th>
                  <th className="px-4 py-3.5">Berkas Legalitas</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {companies.map((c, index) => {
                  const isApproving = approvingId === c.id;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-5 text-center py-3.5">{index + 1}</td>
                      {/* Perusahaan Info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {c.nama_perusahaan ? c.nama_perusahaan.slice(0, 2).toUpperCase() : <Building2 size={16} />}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => setSelectedCompany(c)}
                              className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm hover:text-blue-600 dark:hover:text-blue-400 text-left block truncate max-w-[200px]"
                              title={c.nama_perusahaan}
                            >
                              {c.nama_perusahaan || '-'}
                            </button>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate max-w-[200px]">
                              {[c.kota, c.provinsi].filter(Boolean).join(', ') || 'Lokasi belum diisi'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Sektor & Skala Karyawan */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[170px]" title={c.industri}>
                          {c.industri || '-'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5" title={c.ukuran}>
                          <Users size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{c.ukuran || '-'}</span>
                        </span>
                      </td>

                      {/* NIB / NPWP */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                          {c.nib_number || '-'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Tahun: {c.tahun_berdiri || '-'}
                        </span>
                      </td>

                      {/* Perwakilan HR */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {c.hr_name || '-'}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {c.hr_position && (
                              <span className="text-[10px] text-slate-500 capitalize truncate max-w-[90px]">
                                {c.hr_position}
                              </span>
                            )}
                            {c.hr_whatsapp && (
                              <a
                                href={`https://wa.me/${c.hr_whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-0.5 shrink-0"
                                title="Chat WhatsApp"
                              >
                                <Phone size={10} /> {c.hr_whatsapp}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Berkas Legalitas Chips */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {c.nib_document_url ? (
                            <a
                              href={getMediaUrl(c.nib_document_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#1A4B9F] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[11px] font-bold border border-blue-200 dark:border-blue-900/60 transition-colors"
                              title="Lihat Berkas NIB / NPWP"
                            >
                              <FileText size={12} /> NIB <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400">
                              NIB -
                            </span>
                          )}

                          {c.hr_id_card_url ? (
                            <a
                              href={getMediaUrl(c.hr_id_card_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-[11px] font-bold border border-emerald-200 dark:border-emerald-900/60 transition-colors"
                              title="Lihat Berkas KTP / ID Card HRD"
                            >
                              <CreditCard size={12} /> ID Card <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400">
                              ID Card -
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {c.status === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-[10px] font-bold border border-rose-200 dark:border-rose-800" title={c.rejection_reason || 'Verifikasi ditolak'}>
                            <XCircle size={10} /> Ditolak
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                            <Clock size={10} /> Menunggu
                          </span>
                        )}
                      </td>

                      {/* Aksi Buttons */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedCompany(c)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Lihat Rincian Lengkap"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => handleApprove(c.id, c.nama_perusahaan)}
                            disabled={isApproving || isRejecting}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                            title="Setujui Akun Perusahaan"
                          >
                            {isApproving ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <ShieldCheck size={14} />
                            )}
                            <span>Setujui</span>
                          </button>

                          <button
                            onClick={() => handleOpenRejectModal(c)}
                            disabled={isApproving || isRejecting}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-all disabled:opacity-50"
                            title="Tolak Verifikasi & Minta Perbaikan Dokumen"
                          >
                            <XCircle size={14} />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW (Ringkas 2-3 Kolom) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => {
            const isApproving = approvingId === c.id;
            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {c.nama_perusahaan ? c.nama_perusahaan.slice(0, 2).toUpperCase() : <Building2 size={18} />}
                      </div>
                      <div className="min-w-0">
                        <h3
                          onClick={() => setSelectedCompany(c)}
                          className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate"
                          title={c.nama_perusahaan}
                        >
                          {c.nama_perusahaan || '-'}
                        </h3>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {[c.kota, c.provinsi].filter(Boolean).join(', ') || 'Lokasi belum diisi'}
                        </span>
                      </div>
                    </div>
                    {c.status === 'REJECTED' ? (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-[10px] font-bold border border-rose-200 dark:border-rose-800">
                        Ditolak
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Compact Info Grid: Sektor, Ukuran, NIB, PIC */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 mt-3.5">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Sektor Industri</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block" title={c.industri}>
                        {c.industri || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Skala Karyawan</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block" title={c.ukuran}>
                        {c.ukuran || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">NIB / NPWP</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                        {c.nib_number || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">PIC HR</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                        {c.hr_name || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Document Chips */}
                  <div className="flex items-center gap-2 mt-3">
                    {c.nib_document_url ? (
                      <a
                        href={getMediaUrl(c.nib_document_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-1 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#1A4B9F] dark:text-blue-400 hover:bg-blue-100 text-[10px] font-bold border border-blue-200 dark:border-blue-900 inline-flex items-center justify-center gap-1"
                      >
                        <FileText size={11} /> Berkas NIB
                      </a>
                    ) : (
                      <span className="flex-1 text-center py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px]">
                        NIB (-)
                      </span>
                    )}

                    {c.hr_id_card_url ? (
                      <a
                        href={getMediaUrl(c.hr_id_card_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-1 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900 inline-flex items-center justify-center gap-1"
                      >
                        <CreditCard size={11} /> ID Card HR
                      </a>
                    ) : (
                      <span className="flex-1 text-center py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px]">
                        ID Card (-)
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCompany(c)}
                    className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors"
                    title="Lihat Rincian"
                  >
                    <Eye size={13} />
                  </button>

                  <button
                    onClick={() => handleOpenRejectModal(c)}
                    disabled={isApproving || isRejecting}
                    className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all inline-flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <XCircle size={13} />
                    <span>Tolak</span>
                  </button>

                  <button
                    onClick={() => handleApprove(c.id, c.nama_perusahaan)}
                    disabled={isApproving || isRejecting}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all inline-flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isApproving ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <ShieldCheck size={14} />
                    )}
                    <span>Setujui</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL DIALOG */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center font-bold text-base shrink-0">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedCompany.nama_perusahaan || '-'}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {[selectedCompany.industri, selectedCompany.ukuran].filter(Boolean).join(' • ') || 'Profil Perusahaan'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCompany(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
              {/* Deskripsi */}
              <div>
                <span className="block font-semibold text-slate-400 text-[11px] mb-1">
                  Deskripsi Perusahaan
                </span>
                <p className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed font-normal">
                  {selectedCompany.deskripsi || 'Tidak ada deskripsi profil perusahaan.'}
                </p>
              </div>

              {/* Data Grid: Sektor, Karyawan, NIB, Tahun, Kontak HR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-400 text-[10px] block">Sektor Industri</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-0.5 text-xs sm:text-sm">
                    <Briefcase size={14} className="text-blue-500 shrink-0" />
                    {selectedCompany.industri || '-'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 text-[10px] block">Skala / Jumlah Karyawan</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-0.5 text-xs sm:text-sm">
                    <Users size={14} className="text-emerald-500 shrink-0" />
                    {selectedCompany.ukuran || '-'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 text-[10px] block">Nomor NIB / NPWP</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {selectedCompany.nib_number || '-'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 text-[10px] block">Tahun Berdiri</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {selectedCompany.tahun_berdiri || '-'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 text-[10px] block">Nama Perwakilan HRD</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {selectedCompany.hr_name || '-'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 text-[10px] block">Jabatan HRD</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 capitalize">
                    {selectedCompany.hr_position || '-'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 text-[10px] block">WhatsApp HRD</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {selectedCompany.hr_whatsapp || '-'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 text-[10px] block">Nomor Telepon Kantor</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {selectedCompany.no_telepon || '-'}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="font-semibold text-slate-400 text-[10px] block">Website Resmi</span>
                  {selectedCompany.website_url ? (
                    <a
                      href={
                        selectedCompany.website_url.startsWith('http')
                          ? selectedCompany.website_url
                          : `https://${selectedCompany.website_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <Globe size={12} /> {selectedCompany.website_url} <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span>-</span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <span className="font-semibold text-slate-400 text-[10px] block">Alamat Kantor</span>
                  <span className="leading-relaxed">
                    {[selectedCompany.alamat, selectedCompany.kota, selectedCompany.provinsi]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </span>
                </div>
              </div>

              {/* Berkas Dokumen Fisik */}
              <div>
                <span className="font-semibold text-slate-400 text-[11px] block mb-2">
                  Dokumen Persyaratan Fisik
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Dokumen NIB */}
                  <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-800 dark:text-white block text-xs truncate">
                          Dokumen NIB/NPWP
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {selectedCompany.nib_document_url ? 'File Tersedia' : 'Belum Ada'}
                        </span>
                      </div>
                    </div>

                    {selectedCompany.nib_document_url ? (
                      <a
                        href={getMediaUrl(selectedCompany.nib_document_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700 transition-colors inline-flex items-center gap-1 shrink-0"
                      >
                        Buka <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 px-2">Kosong</span>
                    )}
                  </div>

                  {/* Dokumen ID Card*/}
                  <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                        <CreditCard size={16} />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-800 dark:text-white block text-xs truncate">
                          KTP / ID Card HR
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {selectedCompany.hr_id_card_url ? 'File Tersedia' : 'Belum Ada'}
                        </span>
                      </div>
                    </div>

                    {selectedCompany.hr_id_card_url ? (
                      <a
                        href={getMediaUrl(selectedCompany.hr_id_card_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition-colors inline-flex items-center gap-1 shrink-0"
                      >
                        Buka <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 px-2">Kosong</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5 bg-slate-50/50 dark:bg-slate-950/40">
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenRejectModal(selectedCompany)}
                  disabled={isRejecting || approvingId === selectedCompany.id}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <XCircle size={15} />
                  <span>Tolak Verifikasi</span>
                </button>

                <button
                  onClick={() => handleApprove(selectedCompany.id, selectedCompany.nama_perusahaan)}
                  disabled={approvingId === selectedCompany.id || isRejecting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {approvingId === selectedCompany.id ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  <span>Setujui Akun Perusahaan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL DIALOG */}
      {rejectModalOpen && companyToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                  <XCircle size={22} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Tolak Verifikasi Perusahaan
                  </h2>
                  <span className="text-xs text-slate-400">
                    {companyToReject.nama_perusahaan}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setCompanyToReject(null);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3.5 bg-rose-50/80 dark:bg-rose-950/30 rounded-xl border border-rose-200/80 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <AlertCircle size={14} className="shrink-0" />
                  Pemberitahuan Instruksi Otomatis
                </p>
                <span>
                  Alasan yang Anda tulis di bawah akan langsung ditampilkan kepada perwakilan perusahaan di halaman status akun mereka, dan sistem akan menginstruksikan mereka untuk memperbaiki data serta mengunggah ulang dokumen di Tahap 3.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Tuliskan catatan perbaikan atau alasan penolakan secara spesifik, misalnya: Dokumen NIB buram tidak terbaca, mohon unggah scan PDF resmi yang jelas..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-xl text-xs outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              {/* Quick Template Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Pilihan Alasan Cepat (Klik untuk memilih):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Dokumen NIB / NPWP buram atau tidak terbaca dengan jelas.',
                    'Foto ID Card / KTP HR tidak sesuai dengan nama PIC pendaftar.',
                    'Nomor NIB tidak valid atau belum terdaftar resmi di OSS.',
                    'Data profil perusahaan belum lengkap, mohon lengkapi alamat & sektor.',
                    'Website resmi perusahaan tidak dapat diakses atau tidak aktif.'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectReason(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-300 text-left transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-950/40">
              <button
                type="button"
                onClick={() => {
                  setRejectModalOpen(false);
                  setCompanyToReject(null);
                }}
                disabled={isRejecting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRejecting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <XCircle size={15} />
                )}
                <span>Kirim Penolakan &amp; Minta Lengkapi Ulang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
