'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Building2, ExternalLink, FileText, CheckCircle2, Clock } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

export default function AdminVerificationPage() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPendingCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAuth('/api/admin/perusahaan/pending', { method: 'GET' });
      const data = await res.json();
      setCompanies(data);
    } catch (error) {
      toast.error('Gagal memuat data perusahaan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingCompanies();
  }, []);

  const handleApprove = async (companyId: string, companyName: string) => {
    if (!window.confirm(`Setujui akun perusahaan "${companyName}"? Mereka akan diberikan akses penuh ke portal perusahaan.`)) return;
    
    try {
      await fetchAuth(`/api/admin/perusahaan/${companyId}/verify`, { method: 'PUT' });
      toast.success(`${companyName} berhasil diverifikasi!`, { icon: '🎉' });
      loadPendingCompanies();
    } catch (error) {
      toast.error('Gagal memverifikasi perusahaan');
    }
  };

  return (
    <div className="space-y-6 font-sans antialiased">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Verifikasi Legalitas Perusahaan</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">Tinjau dan setujui perusahaan baru yang mendaftar ke AI-RecruitPro.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-8 text-center text-xs font-semibold text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Memuat data...
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-black dark:text-white rounded-full flex items-center justify-center mb-3 border border-slate-200 dark:border-slate-700">
              <CheckCircle2 size={28} className="text-black dark:text-white" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Tidak Ada Antrean</h3>
            <p className="text-slate-500 text-xs max-w-sm mt-1 font-medium">Semua perusahaan baru sudah diverifikasi. Anda bisa bersantai untuk sementara waktu!</p>
          </div>
        ) : (
          companies.map((company: any) => (
            <div key={company.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-6">
              
              {/* Company Identity */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                    <Building2 size={24} className="text-black dark:text-white" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-2 border border-amber-200 dark:border-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span> Menunggu Peninjauan
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{company.nama_perusahaan}</h3>
                    <p className="text-xs text-slate-500 font-medium">{company.industri} • {company.ukuran}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="col-span-2">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Deskripsi Perusahaan</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-xs mt-1 leading-relaxed">{company.deskripsi || 'Tidak Ada Deskripsi'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Lokasi / Alamat Lengkap</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-xs leading-relaxed block mt-1">
                      {company.alamat ? `${company.alamat}, ` : ''}{company.kota || ''}{company.provinsi ? `, ${company.provinsi}` : ''}
                      {!company.alamat && !company.kota && !company.provinsi && 'Tidak Ada Lokasi'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Tahun Berdiri</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{company.tahun_berdiri || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Website Resmi</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{company.website_url || 'Tidak Ada'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Nomor Telepon Kantor</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{company.no_telepon || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Nama Perwakilan HR</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{company.hr_name || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">WhatsApp Perwakilan</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{company.hr_whatsapp || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Legal Documents */}
              <div className="lg:w-80 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <FileText size={16} className="text-black dark:text-white"/> Dokumen Legalitas
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">NIB / NPWP</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{company.nib_number || 'Tidak dilampirkan'}</span>
                      </div>
                      <button className="text-black dark:text-white hover:text-slate-700 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md transition-colors" title="Lihat Dokumen">
                        <ExternalLink size={16} className="text-black dark:text-white" />
                      </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Card / KTP HR</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Lampiran Foto</span>
                      </div>
                      <button className="text-black dark:text-white hover:text-slate-700 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md transition-colors" title="Lihat Dokumen">
                        <ExternalLink size={16} className="text-black dark:text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => handleApprove(company.id, company.nama_perusahaan)}
                    className="w-full bg-black hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-sm cursor-pointer"
                  >
                    <ShieldCheck size={18} className="text-white" />
                    Approve Perusahaan
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
