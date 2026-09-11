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
  Star,
  User
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';
import { ParseSkills, renderSkillsText } from '@/components/ui/ParseSkills';
import { CandidateReviewModal } from '@/components/CandidateReviewModal';

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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [aiResult, setAiResult] = useState<{
    application_id: string;
    status: string;
    analisis_cv?: {
      skor_kecocokan: number;
      kategori: string;
      hasil: string;
    };
  } | null>(null);
  const [pendingAiResult, setPendingAiResult] = useState<any>(null);

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
      setPendingAiResult(applicationData);
      setShowReviewModal(true);
      setAiResult(applicationData);
    } catch (err: any) {
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const initialLetter = cvData?.fullName ? cvData.fullName.charAt(0).toUpperCase() : 'P';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[560px] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">

        {/* Modal Header */}
        <div className="p-5 sm:px-7 sm:pt-7 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center shrink-0">
              <Briefcase size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight leading-tight">
                Kirim Lamaran
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate max-w-[280px] sm:max-w-[340px]">
                <span className="text-[#1A4B9F] dark:text-blue-400 font-bold">{job.title}</span> di {job.company}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        {aiResult ? (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 rounded-full flex items-center justify-center mx-auto mb-1">
              <CheckCircle2 size={32} />
            </div>
            
            <div className="space-y-2 max-w-sm mx-auto">
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Lamaran Terkirim!
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-normal">
                Profil Anda telah berhasil dikirim ke <span className="font-bold text-slate-700 dark:text-slate-300">{job.company}</span>. Tim rekrutmen akan segera meninjau profil Anda.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Kembali ke Beranda
              </button>
              <button
                onClick={() => onSuccess && onSuccess(aiResult)}
                className="flex-1 py-3 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs sm:text-sm transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Progres Lamaran</span>
                <ChevronDown size={16} className="-rotate-90" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

            <div className="p-5 sm:px-7 space-y-5 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              
              {/* Review CV Profile */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-end">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Review Profil Anda <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-normal text-slate-400">Data ini yang akan dikirim</span>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
                  
                  {/* Author Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1A4B9F]/10 dark:bg-blue-950/80 text-[#1A4B9F] dark:text-blue-400 font-black flex items-center justify-center text-sm shrink-0 border border-[#1A4B9F]/20">
                      {initialLetter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">{cvData?.fullName || 'Nama Pelamar'}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal truncate">{cvData?.jobTitle || 'Kandidat Profesional'}</p>
                    </div>
                  </div>

                  {/* Skills Preview */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Keahlian Teratas</span>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
                        {cvData?.skills 
                          ? renderSkillsText(cvData.skills).substring(0, 75) + (renderSkillsText(cvData.skills).length > 75 ? '...' : '') 
                          : 'Tidak ada skill tercantum'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCvDetail(!showCvDetail)}
                      className="inline-flex items-center gap-1 text-[#1A4B9F] dark:text-blue-400 font-bold text-xs hover:underline cursor-pointer transition-colors pt-1"
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
                      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5 font-sans max-h-[45vh] overflow-y-auto custom-scrollbar shadow-inner text-slate-900">

                        {/* ATS Header */}
                        <div className="border-b border-slate-300 pb-4 space-y-1 text-center font-sans">
                          <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                            {cvData?.fullName || <span>NAMA PELAMAR</span>}
                          </h2>
                          {cvData?.jobTitle && (
                            <span className="text-xs font-semibold text-slate-600 block">{cvData.jobTitle}</span>
                          )}
                          <div className="text-[11px] text-slate-500 flex items-center justify-center flex-wrap gap-2 pt-1 font-normal">
                            <span>{cvData?.email || 'email@contoh.com'}</span> •{' '}
                            <span>{cvData?.phone || '0812xxxxxxxx'}</span> •{' '}
                            <span>{cvData?.location || 'Kota Domisili'}</span>
                            {cvData?.linkedinUrl && <> • <span className="font-bold text-slate-700">LinkedIn: {cvData.linkedinUrl}</span></>}
                          </div>
                        </div>

                        {/* ATS Summary */}
                        <div className="space-y-1.5">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                            RINGKASAN PROFESIONAL
                          </h3>
                          <p className="text-xs text-slate-700 leading-relaxed font-normal text-justify">
                            {cvData?.summary || <span className="italic text-slate-400">Ringkasan profesional Anda akan muncul di sini.</span>}
                          </p>
                        </div>

                        {/* ATS Experience */}
                        <div className="space-y-2.5 font-sans">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                            PENGALAMAN KERJA
                          </h3>
                          {cvData?.experiences && cvData.experiences.length > 0 ? (
                            cvData.experiences.map((exp: any, idx: number) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-baseline text-xs font-bold text-slate-800">
                                  <span>{exp.role || '[Posisi]'} - {exp.company || '[Perusahaan]'}</span>
                                  <span className="text-[10px] text-slate-500 font-normal">{exp.period}</span>
                                </div>
                                {exp.description && (
                                  <p className="text-xs text-slate-600 leading-normal pl-3 border-l-2 border-slate-300 text-justify font-normal">
                                    • {exp.description}
                                  </p>
                                )}
                               </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic font-normal">Pengalaman kerja belum diisi.</p>
                          )}
                        </div>

                        {/* ATS Education */}
                        <div className="space-y-2 font-sans">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                            PENDIDIKAN
                          </h3>
                          {cvData?.education && cvData.education.length > 0 ? (
                            cvData.education.map((edu: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-baseline text-xs">
                                <span className="font-bold text-slate-800">
                                  {edu.degree || '[Gelar]'} - {edu.school || '[Universitas]'} {edu.gpa ? '(' + edu.gpa + ')' : ''}
                                </span>
                                <span className="text-[10px] text-slate-500 font-normal">{edu.period}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic font-normal">Riwayat pendidikan belum diisi.</p>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Confirmation / Privacy Banner */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
                      <FileText size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Konfirmasi Profil</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-normal">
                        Pastikan profil Anda sudah sesuai. Data ini akan dievaluasi oleh sistem rekrutmen kami.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2.5">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-7 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs sm:text-sm transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Kirim Lamaran</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {showReviewModal && (
        <CandidateReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          contextEvent="applied_job"
        />
      )}

    </div>
  );
}
