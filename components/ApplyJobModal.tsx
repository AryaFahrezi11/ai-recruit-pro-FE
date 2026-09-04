'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';
import { ParseSkills, renderSkillsText } from '@/components/ui/ParseSkills';

interface ApplyJobModalProps {
  job: {
    id: string | number;
    title: string;
    company: string;
    location?: string;
  };
  cvData: any;
  onClose: () => void;
  onSuccess?: (applicationData: any) => void;
}

export function ApplyJobModal({ job, cvData, onClose, onSuccess }: ApplyJobModalProps) {
  const [catatan, setCatatan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCvDetail, setShowCvDetail] = useState(false);
  const [aiResult, setAiResult] = useState<{
    application_id: string;
    status: string;
    analisis_cv?: {
      skor_kecocokan: number;
      kategori: string;
      hasil: string;
    };
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cvData) {
      setError('Data Profil CV belum lengkap. Harap lengkapi profil Anda terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAiResult(null);

    try {
      const payload = {
        job_id: String(job.id),
        catatan_pelamar: catatan.trim(),
        cv_data: cvData,
      };

      const res = await api.post('/applications/', payload);
      const applicationData = res.data || res;
      setAiResult(applicationData);
    } catch (err: any) {
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[600px] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">

        {/* Modal Header */}
        <div className="p-6 sm:px-8 sm:pt-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-blue-900/30 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Briefcase size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">
                Kirim Lamaran
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-[320px] truncate">
                <span className="text-[#1A4B9F] dark:text-blue-400 font-bold">{job.title}</span> di {job.company}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition-all"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Content */}
        {aiResult ? (
          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 dark:ring-emerald-900/10 mb-2">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            
            <div className="space-y-3 max-w-sm mx-auto">
              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Lamaran Terkirim!
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Profil Anda telah berhasil dikirim ke <span className="font-bold text-slate-700 dark:text-slate-300">{job.company}</span>. Tim rekrutmen akan segera meninjau profil Anda.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all"
              >
                Kembali ke Beranda
              </button>
              <button
                onClick={() => onSuccess && onSuccess(aiResult)}
                className="flex-1 py-4 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
              >
                Lihat Progres Lamaran
                <ChevronDown size={16} className="-rotate-90" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

            <div className="p-6 sm:px-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              
              {/* Review CV Profile */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="block text-sm font-black text-slate-800 dark:text-slate-200">
                    Review Profil Anda <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-semibold text-slate-400">Data ini yang akan dikirim</span>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1A4B9F] to-blue-600 text-white flex items-center justify-center shrink-0 shadow-inner">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white truncate">{cvData?.fullName || 'Nama Pelamar'}</h4>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{cvData?.jobTitle || 'Kandidat Profesional'}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 text-sm text-slate-600 dark:text-slate-300 flex flex-col gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Keahlian Teratas</span>
                      <p className="font-medium">
                        {cvData?.skills 
                          ? renderSkillsText(cvData.skills).substring(0, 60) + (renderSkillsText(cvData.skills).length > 60 ? '...' : '') 
                          : 'Tidak ada skill tercantum'}
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowCvDetail(!showCvDetail)}
                      className="inline-flex items-center gap-1.5 text-[#1A4B9F] dark:text-blue-400 font-bold text-xs hover:underline self-start transition-colors"
                    >
                      {showCvDetail ? (
                        <><ChevronUp size={14} /> Sembunyikan Detail CV</>
                      ) : (
                        <><ChevronDown size={14} /> Lihat Detail Lengkap CV</>
                      )}
                    </button>
                  </div>

                  {/* CV Detail Expand */}
                  {showCvDetail && (
                    <div className="pt-2 animate-in slide-in-from-top-2">
                      <div className="bg-white p-6 rounded-xl border border-slate-300 space-y-6 font-serif max-h-[50vh] overflow-y-auto custom-scrollbar shadow-md">

                        {/* ATS Header */}
                        <div className="border-b-2 border-black pb-5 space-y-1 text-center font-sans">
                          <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                            {cvData?.fullName || <span className="text-black">NAMA PELAMAR</span>}
                          </h2>
                          {cvData?.jobTitle && (
                            <span className="text-sm font-bold text-black block">{cvData.jobTitle}</span>
                          )}
                          <div className="text-[11px] text-black flex items-center justify-center flex-wrap gap-2 pt-2 font-medium">
                            <span>{cvData?.email || 'email@contoh.com'}</span> •{' '}
                            <span>{cvData?.phone || '0812xxxxxxxx'}</span> •{' '}
                            <span>{cvData?.location || 'Kota Domisili'}</span>
                            {cvData?.linkedinUrl && <> • <span className="font-bold text-black">LinkedIn: {cvData.linkedinUrl}</span></>}
                          </div>
                        </div>

                        {/* ATS Summary */}
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1 font-sans">
                            RINGKASAN PROFESIONAL
                          </h3>
                          <p className="text-xs text-black leading-relaxed font-sans text-justify">
                            {cvData?.summary || <span className="text-black italic">Ringkasan profesional Anda akan muncul di sini.</span>}
                          </p>
                        </div>

                        {/* ATS Experience */}
                        <div className="space-y-3 font-sans">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1">
                            PENGALAMAN KERJA
                          </h3>
                          {cvData?.experiences && cvData.experiences.length > 0 ? (
                            cvData.experiences.map((exp: any, idx: number) => (
                              <div key={idx} className="space-y-1.5">
                                <div className="flex justify-between items-baseline text-xs font-bold text-black">
                                  <span>{exp.role || '[Posisi]'} — {exp.company || '[Perusahaan]'}</span>
                                  <span className="text-[11px] text-black font-semibold">{exp.period}</span>
                                </div>
                                {exp.description && (
                                  <p className="text-xs text-black leading-normal pl-3 border-l-2 border-black text-justify">
                                    • {exp.description}
                                  </p>
                                )}
                               </div>
                            ))
                          ) : (
                            <p className="text-xs text-black italic">Pengalaman kerja belum diisi.</p>
                          )}
                        </div>

                        {/* ATS Education */}
                        <div className="space-y-2 font-sans">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1">
                            PENDIDIKAN
                          </h3>
                          {cvData?.education && cvData.education.length > 0 ? (
                            cvData.education.map((edu: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-baseline text-xs">
                                <span className="font-bold text-black">
                                  {edu.degree || '[Gelar]'} — {edu.school || '[Universitas]'} {edu.gpa ? `(${edu.gpa})` : ''}
                                </span>
                                <span className="text-[11px] text-black font-semibold">{edu.period}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-black italic">Riwayat pendidikan belum diisi.</p>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Privacy Banner */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-600">
                      <FileText size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Konfirmasi Profil</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Pastikan profil Anda sudah sesuai. Data ini akan dievaluasi oleh sistem rekrutmen kami.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm font-bold flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Modal Footer (Sticky Submit Button) */}
            <div className="p-6 sm:px-8 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] text-white font-black text-sm shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Kirim Lamaran</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
