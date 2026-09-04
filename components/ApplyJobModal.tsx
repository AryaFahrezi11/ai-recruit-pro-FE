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
  Briefcase,
  Clock,
  ChevronDown,
  ChevronUp,
  Lock,
  Shield,
  Plus,
  Trash2,
  Camera,
  Video,
  Wrench,
  Check,
  Star
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

      // POST to /api/applications/
      const res = await api.post('/applications/', payload);

      // Backend returns: { message: "...", data: { application_id, status, analisis_cv: { skor_kecocokan, kategori, hasil } } }
      const applicationData = res.data || res;
      setAiResult(applicationData);
      // Wait for the user to explicitly click "Lihat Progres" before triggering onSuccess
    } catch (err: any) {
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col max-h-[95vh]">

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-[#F0F8FB] dark:bg-slate-800/50 shrink-0">
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
        {aiResult ? (
          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-5 py-2 animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 dark:border-emerald-700">
                  <CheckCircle2 size={36} />
                </div>

                <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">
                  Lamaran Berhasil Terkirim
                </h4>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs sm:text-sm transition-all border border-slate-200 dark:border-slate-700"
                >
                  Kembali
                </button>
                <button
                  onClick={() => onSuccess && onSuccess(aiResult)}
                  className="w-full py-3.5 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm transition-all shadow-sm shadow-[#2596be]/30"
                >
                  Lihat Progres Lamaran
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              {/* Review CV Profile */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Profil CV Terstruktur (ATS-Friendly) <span className="text-red-500">*</span>
                </label>
                <div className="bg-[#F0F8FB] dark:bg-slate-800/40 p-5 rounded-2xl border border-[#B8E1ED] dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2596be] text-white flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{cvData?.fullName || 'Nama Pelamar'}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{cvData?.jobTitle || 'Kandidat Profesional'}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <p><span className="font-semibold text-slate-500">Keahlian Utama:</span> {cvData?.skills ? renderSkillsText(cvData.skills).substring(0, 40) + (renderSkillsText(cvData.skills).length > 40 ? '...' : '') : 'Tidak ada skill tercantum'}</p>
                      <button
                        type="button"
                        onClick={() => setShowCvDetail(!showCvDetail)}
                        className="text-[#2596be] font-bold text-[10px] hover:underline flex items-center gap-0.5"
                      >
                        {showCvDetail ? (
                          <><ChevronUp size={12} /> Tutup Detail</>
                        ) : (
                          <><ChevronDown size={12} /> Lihat Detail CV</>
                        )}
                      </button>
                    </div>
                  </div>

                  {showCvDetail && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-2 animate-in slide-in-from-top-2">
                      <div className="bg-white p-8 sm:p-10 rounded-lg border border-slate-300 shadow-sm text-slate-800 space-y-6 font-serif max-h-[60vh] overflow-y-auto custom-scrollbar">

                        {/* ATS Header */}
                        <div className="border-b-2 border-slate-800 pb-4 space-y-1 text-center font-sans">
                          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                            {cvData?.fullName || <span className="text-slate-400 font-bold tracking-wider">NAMA PELAMAR</span>}
                          </h2>
                          {cvData?.jobTitle ? (
                            <span className="text-sm font-bold text-[#1b7b9e] block">{cvData.jobTitle}</span>
                          ) : (
                            <span className="text-xs italic text-slate-400 block font-normal">[Judul Posisi / Peran]</span>
                          )}
                          <div className="text-[11px] text-slate-600 flex items-center justify-center flex-wrap gap-2 pt-1 font-medium">
                            <span>{cvData?.email || <span className="text-slate-400">email@contoh.com</span>}</span> •{' '}
                            <span>{cvData?.phone || <span className="text-slate-400">0812xxxxxxxx</span>}</span> •{' '}
                            <span>{cvData?.location || <span className="text-slate-400">Kota Domisili</span>}</span>
                            {cvData?.linkedinUrl ? (
                              <> • <span className="font-bold text-[#1b7b9e]">LinkedIn: {cvData.linkedinUrl}</span></>
                            ) : (
                              <span className="text-slate-400 italic"> • LinkedIn</span>
                            )}
                            {cvData?.portfolioUrl && <> • <span className="font-bold text-[#1b7b9e]">Portofolio: {cvData.portfolioUrl}</span></>}
                            {cvData?.socialLinks && cvData.socialLinks.length > 0 &&
                              cvData.socialLinks.map((link: any, idx: number) => (
                                <React.Fragment key={idx}>
                                  {link.url && <> • <span>{link.platform ? `${link.platform}: ` : ''}{link.url}</span></>}
                                </React.Fragment>
                              ))}
                          </div>
                        </div>

                        {/* ATS Summary */}
                        <div className="space-y-1.5">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-sans">
                            RINGKASAN PROFESIONAL
                          </h3>
                          <p className="text-xs text-slate-700 leading-relaxed font-sans text-justify">
                            {cvData?.summary || (
                              <span className="text-slate-400 italic">
                                Ringkasan profesional Anda akan muncul di sini.
                              </span>
                            )}
                          </p>
                        </div>

                        {/* ATS Experience */}
                        <div className="space-y-3 font-sans">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                            PENGALAMAN KERJA
                          </h3>
                          {cvData?.experiences && cvData.experiences.length > 0 && cvData.experiences.some((exp: any) => exp.company || exp.role || exp.description) ? (
                            cvData.experiences.map((exp: any, idx: number) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                                  <span>
                                    {exp.role || '[Posisi]'} — {exp.company || '[Perusahaan]'}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-semibold">{exp.period}</span>
                                </div>
                                {exp.description && (
                                  <p className="text-xs text-slate-600 leading-normal pl-3 border-l-2 border-slate-200 text-justify">
                                    • {exp.description}
                                  </p>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="space-y-1 text-slate-400 italic">
                              <div className="flex justify-between items-baseline text-xs">
                                <span>[Posisi Jabatan] — [Nama Perusahaan]</span>
                                <span className="text-[11px]">[Periode Kerja]</span>
                              </div>
                              <p className="text-xs leading-normal pl-3 border-l-2 border-slate-200 text-justify">
                                • Deskripsi tanggung jawab dan pencapaian Anda akan muncul di sini.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* ATS Education */}
                        <div className="space-y-2 font-sans">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                            PENDIDIKAN
                          </h3>
                          {cvData?.education && cvData.education.length > 0 && cvData.education.some((edu: any) => edu.school || edu.degree) ? (
                            cvData.education.map((edu: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-baseline text-xs">
                                <span className="font-bold text-slate-900">
                                  {edu.degree || '[Gelar/Jurusan]'} — {edu.school || '[Nama Sekolah/Universitas]'} {edu.gpa ? `(${edu.gpa})` : ''}
                                </span>
                                <span className="text-[11px] text-slate-500">{edu.period}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex justify-between items-baseline text-xs text-slate-400 italic">
                              <span>[Gelar / Jurusan] — [Nama Institusi / Universitas]</span>
                              <span className="text-[11px]">[Periode]</span>
                            </div>
                          )}
                        </div>

                        {/* ATS Skills */}
                        <div className="space-y-1.5 font-sans">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                            KEAHLIAN TEKNIS & SERTIFIKASI
                          </h3>
                          <div className="text-xs text-slate-700 leading-relaxed text-justify">
                            <strong className="text-slate-900 block mb-1">Keahlian:</strong>
                            <ParseSkills skillsStr={cvData?.skills} fallbackText="Daftar keahlian teknis Anda..." />
                          </div>
                          <div className="text-xs text-slate-700 leading-relaxed">
                            <strong className="text-slate-900">Sertifikasi:</strong>{' '}
                            {cvData?.certifications && cvData.certifications.some((c: any) => c.name && c.name.trim()) ? (
                              <ul className="mt-1 space-y-0.5 list-none pl-0">
                                {cvData.certifications.filter((c: any) => c.name && c.name.trim()).map((cert: any, idx: number) => (
                                  <li key={idx} className="flex items-center gap-1.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                    <span>{cert.name}</span>
                                    {cert.credentialUrl && (
                                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-[#1b7b9e] font-bold underline text-[10px] ml-1">[Lihat Kredensial]</a>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-slate-400 italic">Daftar sertifikat & link kredensial...</span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1.5 mt-2">
                    <CheckCircle2 size={12} />
                    Profil ini akan dinilai secara otomatis oleh AI
                  </div>
                </div>
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Modal Footer (Sticky Submit Button) */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sedang Mengirim Lamaran...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Kirim Lamaran Sekarang</span>
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
