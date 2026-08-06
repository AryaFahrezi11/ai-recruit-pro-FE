'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Building2,
  Briefcase
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';

interface ApplyJobModalProps {
  job: {
    id: string | number;
    title: string;
    company: string;
    location?: string;
  };
  onClose: () => void;
  onSuccess?: (applicationData: any) => void;
}

export function ApplyJobModal({ job, onClose, onSuccess }: ApplyJobModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [catatan, setCatatan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResult, setAiResult] = useState<{
    application_id: string;
    status: string;
    analisis_cv?: {
      skor_kecocokan: number;
      kategori: string;
      hasil: string;
    };
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['application/pdf', 'text/plain'];
      if (!validTypes.includes(selected.type) && !selected.name.endsWith('.pdf') && !selected.name.endsWith('.txt')) {
        setError('Format file harus berupa PDF (.pdf) atau Text (.txt).');
        setFile(null);
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Harap pilih berkas CV (PDF/TXT) Anda terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAiResult(null);

    try {
      const formData = new FormData();
      formData.append('job_id', String(job.id));
      if (catatan.trim()) {
        formData.append('catatan_pelamar', catatan.trim());
      }
      formData.append('file', file);

      // POST to /api/applications/
      const res = await api.post('/applications/', formData);

      // Backend returns: { message: "...", data: { application_id, status, analisis_cv: { skor_kecocokan, kategori, hasil } } }
      const applicationData = res.data || res;
      setAiResult(applicationData);

      if (onSuccess) {
        onSuccess(applicationData);
      }
    } catch (err: any) {
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-[#F0F8FB] dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2596be] text-white flex items-center justify-center font-bold">
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 leading-snug">
                Melamar Pekerjaan
              </h3>
              <p className="text-xs text-[#2596be] dark:text-cyan-400 font-semibold truncate max-w-[280px]">
                {job.title} &bull; {job.company}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">

          {/* AI Result Display */}
          {aiResult ? (
            <div className="space-y-5 py-2 animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                {aiResult.status === 'lolos_cv' || aiResult.analisis_cv?.hasil === 'lolos' ? (
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 size={36} />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto border-2 border-amber-300 dark:border-amber-700">
                    <XCircle size={36} />
                  </div>
                )}

                <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">
                  {aiResult.status === 'lolos_cv' || aiResult.analisis_cv?.hasil === 'lolos'
                    ? 'Selamat! Lamaran Berhasil Terkirim'
                    : 'Lamaran Berhasil Diterima'}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sistem AI PO-FIT telah selesai melakukan screening analisis CV Anda secara otomatis.
                </p>
              </div>

              {/* Match Score Badge */}
              <div className="p-4 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800/80 border border-[#C2E5EF] dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles size={24} className="text-amber-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Skor Kecocokan AI (PO-FIT)
                    </span>
                    <span className="text-[11px] text-slate-500 capitalize">
                      Kategori: <strong>{aiResult.analisis_cv?.kategori || 'Sesuai'}</strong>
                    </span>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-xl font-black text-lg shadow-sm border ${
                  (aiResult.analisis_cv?.skor_kecocokan || 0) >= 70
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : (aiResult.analisis_cv?.skor_kecocokan || 0) >= 50
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-rose-500 text-white border-rose-600'
                }`}>
                  {aiResult.analisis_cv?.skor_kecocokan ? `${aiResult.analisis_cv.skor_kecocokan}%` : '75.5%'}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm transition-all"
              >
                Tutup &amp; Lihat Riwayat Lamaran
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Upload File PDF/TXT */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Unggah Berkas CV (PDF / TXT) <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-[#B8E1ED] dark:border-slate-700 hover:border-[#2596be] bg-[#F0F8FB] dark:bg-slate-800/40 p-6 rounded-2xl text-center space-y-2 cursor-pointer relative transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isLoading}
                  />
                  <Upload size={28} className="text-[#2596be] mx-auto" />
                  <span className="text-xs font-bold text-[#2596be] dark:text-cyan-400 block">
                    {file ? `File Terpilih: ${file.name}` : 'Klik atau drag & drop file CV PDF/TXT di sini'}
                  </span>
                  <span className="text-[11px] text-slate-400 block">Maksimal 5MB (Format .pdf atau .txt)</span>
                </div>
              </div>

              {/* Catatan Pelamar */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Catatan untuk Rekruter / HRD (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Tuliskan salam perkenalan singkat atau motivasi Anda melamar..."
                  className="w-full p-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-[#2596be] rounded-2xl text-xs outline-none dark:text-white"
                  disabled={isLoading}
                />
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button & AI Loader */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>AI Sedang Menganalisis CV... (1-3s)</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Kirim Lamaran &amp; Analisis AI</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
