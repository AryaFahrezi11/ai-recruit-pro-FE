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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Verifikasi Legalitas Perusahaan</h1>
        <p className="text-slate-500 text-sm mt-1">Tinjau dan setujui perusahaan baru yang mendaftar ke AI-Recruit Pro.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            Memuat data...
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Tidak Ada Antrean</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-2">Semua perusahaan baru sudah diverifikasi. Anda bisa bersantai untuk sementara waktu!</p>
          </div>
        ) : (
          companies.map((company: any) => (
            <div key={company.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-blue-300 transition-colors flex flex-col lg:flex-row gap-6">
              
              {/* Company Identity */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 shrink-0">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 text-[10px] font-extrabold uppercase tracking-widest mb-2 border border-amber-200">
                      <Clock size={12} /> Pending Approval
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{company.nama_perusahaan}</h3>
                    <p className="text-sm text-slate-500 font-medium">{company.industri} • {company.ukuran}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Alamat Email</span>
                    <span className="font-medium text-slate-700">{company.website_url || 'Tidak Ada'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Nomor Telepon Kantor</span>
                    <span className="font-medium text-slate-700">{company.no_telepon || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Nama Perwakilan HR</span>
                    <span className="font-medium text-slate-700">{company.hr_name || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">WhatsApp Perwakilan</span>
                    <span className="font-medium text-slate-700">{company.hr_whatsapp || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Legal Documents */}
              <div className="lg:w-80 bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                    <FileText size={16} className="text-blue-500"/> Dokumen Legalitas
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">NIB / NPWP</span>
                        <span className="text-sm font-bold text-slate-700">{company.nib_number || 'Tidak dilampirkan'}</span>
                      </div>
                      <button className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md transition-colors" title="Lihat Dokumen">
                        <ExternalLink size={16} />
                      </button>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Card / KTP HR</span>
                        <span className="text-sm font-bold text-slate-700">Lampiran Foto</span>
                      </div>
                      <button className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md transition-colors" title="Lihat Dokumen">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <button 
                    onClick={() => handleApprove(company.id, company.nama_perusahaan)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow"
                  >
                    <ShieldCheck size={18} />
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
