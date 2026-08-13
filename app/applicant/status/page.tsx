'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Video,
  FileText,
  Sparkles,
  ArrowLeft,
  Eye,
  X,
  Check,
  HelpCircle,
  Brain,
  Play,
  Volume2,
  Smile,
  MessageSquare,
  AlertCircle,
  BarChart3,
  Bot,
  ArrowRight
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';

interface ApplicationItem {
  id: number;
  jobTitle: string;
  companyName: string;
  logo: string;
  applyDate: string;
  kegiatan: string;
  tahapRekrutmen: string;
  currentStageIndex: number; // 1 to 5
  status: 'Dalam Proses' | 'Lolos' | 'Tidak Lolos' | 'Lowongan Telah Ditutup';
  statusMessage: string;
  hasActionRequired?: boolean;
  cvScore: number;
  threshold: number;
  kategori?: string;
  hybridDetails?: {
    sbert_score: number;
    keyword_score: number;
    keywords_found: number;
    keywords_total: number;
  };
  videoScore: number;
  videoBreakdown: {
    fluency: number;
    confidence: number;
    keywords: number;
    emotion: number;
    logic: number;
    notes: string[];
  };
}

const initialMockApplications: ApplicationItem[] = [
  {
    id: 5,
    jobTitle: 'Senior Frontend Engineer (AI Solutions)',
    companyName: 'PT Tech Inovasi Nusantara',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    applyDate: '29/07/2026',
    kegiatan: 'WEBCAREER',
    tahapRekrutmen: 'Stage 3: Wawancara Video (Tindakan Diperlukan)',
    currentStageIndex: 3,
    status: 'Dalam Proses',
    hasActionRequired: true,
    statusMessage: 'CV ATS-Friendly Anda telah LOLOS skrining AI dengan skor 92%! Silakan lakukan perekaman Wawancara Video Singkat (Virtual Interview) untuk melanjutkan proses seleksi ke tahap berikutnya.',
    cvScore: 92,
    threshold: 60,
    kategori: 'Frontend Engineer',
    hybridDetails: {
      sbert_score: 90,
      keyword_score: 94,
      keywords_found: 8,
      keywords_total: 10
    },
    videoScore: 0,
    videoBreakdown: {
      fluency: 0,
      confidence: 0,
      keywords: 0,
      emotion: 0,
      logic: 0,
      notes: [
        'Kandidat belum melakukan perekaman Wawancara Video Singkat.'
      ]
    }
  }
];

export default function StatusValidasiPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('Semua Tahapan');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  // Expanded application cards state
  const [expandedJobIds, setExpandedJobIds] = useState<number[]>([5, 4]);

  // Modal States
  const [activeCvModalJob, setActiveCvModalJob] = useState<ApplicationItem | null>(null);
  const [activeVideoModalJob, setActiveVideoModalJob] = useState<ApplicationItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Applications State
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/applications/');
        const rawList = Array.isArray(res) ? res : res.data || [];

        if (rawList.length > 0) {
          const mapped: ApplicationItem[] = rawList.map((item: any, idx: number) => {
            const cvScore = Math.round(item.analisis_cv?.skor_kecocokan || item.cv_score || 0);
            const threshold = item.analisis_cv?.threshold_digunakan || item.job?.cv_threshold || 60;
            
            let stageIndex = 1;
            let statusLabel: 'Dalam Proses' | 'Lolos' | 'Tidak Lolos' | 'Lowongan Telah Ditutup' = 'Dalam Proses';
            let tahapName = 'Stage 1: UPLOAD CV';
            let msg = 'Profil CV Anda telah masuk pipeline. Menunggu proses seleksi AI.';
            
            const s = item.status || 'upload_cv';
            
            if (s === 'upload_cv' || s === 'dikirim') {
              stageIndex = 1;
              tahapName = 'Stage 1: UPLOAD CV';
              msg = 'Profil CV Anda telah masuk pipeline. Menunggu HR Perusahaan untuk memicu proses seleksi AI.';
            } else if (s === 'cv_screening') {
              stageIndex = 2;
              tahapName = 'Stage 2: CV SCREENING (PO-FIT)';
              msg = 'CV Anda sedang dalam tahap evaluasi kecocokan (PO-FIT) oleh AI.';
            } else if (s === 'lolos_cv' || s === 'virtual_interview') {
              stageIndex = 3;
              tahapName = 'Stage 3: VIRTUAL INTERVIEW';
              msg = `Selamat! CV Anda telah LOLOS screening AI (PO-FIT) dengan skor kecocokan ${cvScore}%. Silakan lakukan perekaman Wawancara Video Singkat.`;
            } else if (s === 'ditolak_sistem' || s === 'ditolak') {
              stageIndex = 2;
              tahapName = 'Stage 2: CV SCREENING (Ditolak)';
              statusLabel = 'Tidak Lolos';
              msg = `Mohon maaf, profil Anda belum memenuhi kriteria threshold AI (Skor: ${cvScore}%).`;
            } else if (s === 'video_analysis') {
              stageIndex = 4;
              tahapName = 'Stage 4: AI VIDEO ANALYSIS';
              msg = 'Video wawancara Anda sedang dianalisis oleh AI.';
            } else if (s === 'human_validation') {
              stageIndex = 5;
              tahapName = 'Stage 5: HUMAN VALIDATION';
              msg = 'Hasil analisis AI sedang divalidasi oleh tim rekrutmen.';
            } else if (s === 'Lolos') {
              stageIndex = 5;
              tahapName = 'Stage 5: KEPUTUSAN AKHIR';
              statusLabel = 'Lolos';
              msg = 'Selamat! Anda dinyatakan Lolos seleksi.';
            } else if (s === 'Tidak Lolos') {
              stageIndex = 5;
              tahapName = 'Stage 5: KEPUTUSAN AKHIR';
              statusLabel = 'Tidak Lolos';
              msg = 'Mohon maaf, Anda belum lolos seleksi kali ini.';
            }

            return {
              id: item.id || idx + 1,
              jobTitle: item.job?.judul_posisi || item.judul_posisi || 'Lowongan Pekerjaan',
              companyName: item.job?.perusahaan?.nama_perusahaan || item.nama_perusahaan || 'Perusahaan Partner',
              logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
              applyDate: item.applied_at ? new Date(item.applied_at).toLocaleDateString('id-ID') : 'Baru saja',
              kegiatan: 'WEBCAREER',
              tahapRekrutmen: tahapName,
              currentStageIndex: stageIndex,
              status: statusLabel,
              statusMessage: msg,
              hasActionRequired: s === 'lolos_cv' || s === 'virtual_interview',
              cvScore: cvScore,
              threshold: threshold,
              kategori: item.analisis_cv?.kategori,
              hybridDetails: item.analisis_cv?.hybrid_details,
              videoScore: 0,
              videoBreakdown: {
                fluency: 0,
                confidence: 0,
                keywords: 0,
                emotion: 0,
                logic: 0,
                notes: ['Tahap wawancara video belum dimulai.']
              }
            };
          });

          setApplications(mapped);
          setExpandedJobIds(mapped.map((m) => Number(m.id)));
        } else {
          // Fallback mock scenarios if no applications in DB yet
          setApplications(initialMockApplications);
        }
      } catch (err) {
        console.error('Failed to fetch application status:', err);
        setApplications(initialMockApplications);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const pipelineStagesList = [
    { number: 1, name: '1. UPLOAD CV', key: 'cv_upload' },
    { number: 2, name: '2. CV SCREENING (PO-FIT)', key: 'cv_screening' },
    { number: 3, name: '3. VIRTUAL INTERVIEW', key: 'virtual_interview' },
    { number: 4, name: '4. AI VIDEO ANALYSIS', key: 'video_analysis' },
    { number: 5, name: '5. HUMAN VALIDATION', key: 'human_validation' }
  ];

  const toggleExpandJob = (id: number) => {
    if (expandedJobIds.includes(id)) {
      setExpandedJobIds(expandedJobIds.filter(jobId => jobId !== id));
    } else {
      setExpandedJobIds([...expandedJobIds, id]);
    }
  };

  // Filtered list
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Semua Status' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1600px] w-full mx-auto space-y-8">

      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-end">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0F1F7] dark:bg-slate-800 border border-[#B8E1ED] dark:border-slate-700 text-[#2596be] dark:text-cyan-400 text-xs sm:text-sm font-bold">
          <Clock className="w-4 h-4 text-[#2596be]" />
          Portal Status Lamaran Candidate Pro
        </span>
      </div>

      {/* Main Title & Search Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-[#C2E5EF] dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1b7b9e] dark:text-cyan-400">{t.pelamar.status.title}</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            {t.pelamar.status.subtitle}
          </p>
        </div>

        {/* Search & Dropdown Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search Box */}
          <div className="sm:col-span-4 relative flex items-center">
            <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.pelamar.status.searchPlaceholder}
              className="w-full pl-11 pr-4 py-2.5 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#2596be] rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            />
          </div>

          {/* Dropdown 1: Platform */}
          <div className="sm:col-span-3">
            <select
              className="w-full px-4 py-2.5 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#2596be] rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option>{t.pelamar.status.allPlatform}</option>
              <option>WEBCAREER</option>
              <option>JOBFAIR VIRTUAL</option>
            </select>
          </div>

          {/* Dropdown 2: Tahapan */}
          <div className="sm:col-span-2">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#2596be] rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option>{t.pelamar.status.allStages}</option>
              <option>CV Screening</option>
              <option>AI Video Analysis</option>
              <option>Human Validation</option>
            </select>
          </div>

          {/* Dropdown 3: Status */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#2596be] rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option>{t.pelamar.status.allStatus}</option>
              <option>{t.pelamar.status.inProgress}</option>
              <option>{t.pelamar.status.passed}</option>
              <option>{t.pelamar.status.failed}</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-1">
            <button
              type="button"
              className="w-full py-2.5 bg-[#2596be] hover:bg-[#1D7FA1] text-white rounded-2xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {t.pelamar.status.searchButton}
            </button>
          </div>
        </div>
      </div>

      {/* APPLICATIONS LIST CARDS */}
      <div className="space-y-6">
        {filteredApplications.map((app) => {
          const isExpanded = expandedJobIds.includes(app.id);

          return (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-[#C2E5EF] dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200"
            >
              {/* Card Summary Header */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                  {/* Left: Logo & Job Title */}
                  <div className="flex items-start gap-4">
                    <img
                      src={app.logo}
                      alt={app.companyName}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#C2E5EF] dark:border-slate-700 shrink-0"
                    />
                    <div className="space-y-1">
                      <h2 className="text-lg sm:text-xl font-black text-[#2596be] dark:text-cyan-400">
                        {app.jobTitle}
                      </h2>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                        {app.companyName}
                      </span>
                    </div>
                  </div>

                  {/* Middle Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold">{t.pelamar.status.applyDate}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{app.applyDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">{t.pelamar.status.activity}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{app.kegiatan}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">{t.pelamar.status.recruitmentStage}</span>
                      <span className="font-bold text-[#2596be] dark:text-cyan-400">{app.tahapRekrutmen}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">{t.pelamar.status.statusLabel}</span>
                      <span className={`font-extrabold px-3 py-1 rounded-full text-xs inline-block ${
                        app.status === 'Lolos'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : app.status === 'Dalam Proses'
                          ? 'bg-cyan-100 text-[#2596be] border border-cyan-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Right Action: Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpandJob(app.id)}
                    className="text-xs font-extrabold text-[#2596be] hover:underline flex items-center gap-1.5 self-start md:self-center cursor-pointer"
                  >
                    <span>{isExpanded ? t.pelamar.status.hideDetails : t.pelamar.status.showDetails}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                </div>

                {/* EXPANDED PIPELINE TRACKER & NOTIFICATION BOX */}
                {isExpanded && (
                  <div className="pt-6 border-t border-[#C2E5EF] dark:border-slate-800 space-y-8 animate-fadeIn">

                    {/* Interactive 5-Stage Pipeline Stepper */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#2596be] dark:text-cyan-400 flex items-center gap-2">
                          <BarChart3 size={16} /> {t.pelamar.status.pipelineTitle}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 italic">
                          {t.pelamar.status.pipelineHint}
                        </span>
                      </div>

                      {/* 5 Dynamic Pipeline Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        {pipelineStagesList.map((stage) => {
                          const isCurrentStage = app.currentStageIndex === stage.number;
                          const isPassedStage = app.currentStageIndex > stage.number || app.status === 'Lolos';
                          const isFailed = (app.status === 'Tidak Lolos' || app.status === 'Lowongan Telah Ditutup') && app.currentStageIndex === stage.number;

                          const isClickableCv = stage.number === 2 && app.cvScore > 0;
                          const isClickableVideo = stage.number === 4 && app.videoScore > 0;

                          return (
                            <div
                              key={stage.number}
                              onClick={() => {
                                if (isClickableCv) setActiveCvModalJob(app);
                                if (isClickableVideo) setActiveVideoModalJob(app);
                              }}
                              className={`p-4 rounded-2xl border space-y-2 transition-all relative group ${
                                isClickableCv || isClickableVideo ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : ''
                              } ${
                                isFailed
                                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-700 dark:text-red-300'
                                  : isCurrentStage
                                  ? 'bg-[#E0F1F7] dark:bg-slate-800 border-[#B8E1ED] text-[#2596be] dark:text-cyan-400 ring-2 ring-[#2596be]'
                                  : isPassedStage
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500'
                              }`}
                            >
                              <div className="flex flex-col gap-1.5 pb-2 mb-2 border-b border-black/5 dark:border-white/5">
                                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider leading-tight">
                                  {stage.name}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-80">
                                <span>{t.pelamar.status.viewDetails}</span>
                                {(isClickableCv || isClickableVideo) && (
                                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 font-bold text-[9px] border border-[#B8E1ED] shadow-2xs">
                                    {t.pelamar.status.clickDetail}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs font-bold pt-1">
                                <span>
                                  {isFailed
                                    ? t.pelamar.status.failed
                                    : isCurrentStage
                                    ? app.status === 'Dalam Proses' ? t.pelamar.status.inProgress : t.pelamar.status.active
                                    : isPassedStage
                                    ? t.pelamar.status.passed
                                    : t.pelamar.status.waiting}
                                </span>
                                {isPassedStage ? (
                                  <CheckCircle2 size={16} className="text-emerald-600" />
                                ) : isFailed ? (
                                  <XCircle size={16} className="text-red-600" />
                                ) : (
                                  <Clock size={16} className="text-[#2596be]" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Official Notification Message Box */}
                    <div className={`p-6 rounded-3xl border text-xs sm:text-sm space-y-4 leading-relaxed ${
                      app.status === 'Tidak Lolos' || app.status === 'Lowongan Telah Ditutup'
                        ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 text-red-900 dark:text-red-200'
                        : app.status === 'Lolos'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                        : 'bg-[#F0F8FB] dark:bg-slate-800/80 border-[#C2E5EF] dark:border-slate-700 text-[#2596be] dark:text-cyan-300'
                    }`}>
                      <div className="flex items-center gap-2 font-black text-sm">
                        {app.status === 'Tidak Lolos' || app.status === 'Lowongan Telah Ditutup' ? (
                          <>
                            <XCircle size={18} className="text-red-600 shrink-0" />
                            <span>{t.pelamar.status.resultLabel}</span>
                          </>
                        ) : app.status === 'Lolos' ? (
                          <>
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                            <span>{t.pelamar.status.hiredLabel}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} className="text-[#2596be] shrink-0" />
                            <span>{t.pelamar.status.progressLabel}</span>
                          </>
                        )}
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">
                        {app.statusMessage}
                      </p>

                      {/* SPECIAL ACTION BUTTON FOR SCENARIO 5: UPLOAD VIRTUAL INTERVIEW */}
                      {app.currentStageIndex === 3 && app.status === 'Dalam Proses' && (
                        <div className="pt-2">
                          <Link
                            href="/applicant/interviews"
                            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all animate-bounce cursor-pointer"
                          >
                            <Video size={18} className="text-cyan-200" />
                            <span>{t.pelamar.status.startInterview}</span>
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                          <span>{t.pelamar.status.noUpdate}</span>
                          <button
                            onClick={() => toast('Customer Support HR Developer AI-Recruit Pro: support@airecruitpro.com / WhatsApp: 0812-9900-8800', { duration: 5000, icon: '📞' })}
                            className="font-bold text-[#2596be] dark:text-cyan-400 hover:underline cursor-pointer"
                          >
                            {t.pelamar.status.contactSupport}
                          </button>
                        </div>

                        {/* Direct Button Trigger for Stage 2 & 4 Modal Inspection */}
                        <div className="flex items-center gap-2">
                          {app.cvScore > 0 && (
                            <button
                              onClick={() => setActiveCvModalJob(app)}
                              className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 font-bold border border-[#B8E1ED] dark:border-slate-700 hover:bg-[#E0F1F7] transition-colors shadow-2xs cursor-pointer"
                            >
                              {t.pelamar.status.cvScoreDetails} ({app.cvScore}%)
                            </button>
                          )}

                          {app.videoScore > 0 && (
                            <button
                              onClick={() => setActiveVideoModalJob(app)}
                              className="px-4 py-1.5 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-bold transition-colors shadow-2xs cursor-pointer"
                            >
                              {t.pelamar.status.videoAnalysisDetails} ({app.videoScore}%)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: STAGE 2 CV SCREENING PO-FIT AI RESULT */}
      {activeCvModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-10 space-y-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-[#2596be] dark:text-cyan-400 uppercase tracking-wider block">
                  {t.pelamar.status.cvAnalysisTitle}
                </span>
                <h3 className="font-black text-2xl text-[#2596be] dark:text-cyan-400">
                  {t.pelamar.status.cvResultTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeCvModalJob.jobTitle} — {activeCvModalJob.companyName}
                </p>
              </div>

              <button
                onClick={() => setActiveCvModalJob(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Score Banner */}
            <div className="p-6 rounded-3xl bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
              <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shrink-0 shadow-md ${activeCvModalJob.cvScore >= activeCvModalJob.threshold ? 'bg-[#2596be]' : 'bg-red-600'
                }`}>
                <span className="text-3xl font-black">{activeCvModalJob.cvScore}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">SCORE</span>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                {activeCvModalJob.cvScore >= activeCvModalJob.threshold ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                    <CheckCircle2 size={16} /> {t.pelamar.status.passedThreshold}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-extrabold border border-red-300">
                    <XCircle size={16} /> {t.pelamar.status.failedThreshold}
                  </div>
                )}

                <h4 className="text-lg font-black text-[#2596be] dark:text-cyan-400">
                  {activeCvModalJob.cvScore >= activeCvModalJob.threshold ? t.pelamar.status.highMatch : t.pelamar.status.lowMatch}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {t.pelamar.status.algoInfo}: <strong className="text-[#2596be] dark:text-cyan-400">{activeCvModalJob.cvScore}% match</strong>.
                </p>
              </div>
            </div>

            {/* Real AI Data Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-2">
                <span className="text-xs font-extrabold text-slate-500 uppercase block">Kesesuaian Profil</span>
                <span className="text-3xl font-black text-[#2596be] dark:text-cyan-400">{activeCvModalJob.hybridDetails?.sbert_score ?? activeCvModalJob.cvScore}%</span>
                <p className="text-[10px] text-slate-500">Kesesuaian pengalaman dan latar belakang</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-2">
                <span className="text-xs font-extrabold text-slate-500 uppercase block">Kecocokan Kriteria Utama</span>
                {!activeCvModalJob.hybridDetails?.keywords_total ? (
                  <span className="text-xl font-bold text-slate-400 block pt-1 pb-1">Tidak Diatur</span>
                ) : (
                  <span className="text-3xl font-black text-[#2596be] dark:text-cyan-400">{activeCvModalJob.hybridDetails?.keyword_score ?? 0}%</span>
                )}
                <p className="text-[10px] text-slate-500">Berdasarkan syarat spesifik lowongan</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-2">
                <span className="text-xs font-extrabold text-slate-500 uppercase block">Kriteria Terpenuhi</span>
                {!activeCvModalJob.hybridDetails?.keywords_total ? (
                  <span className="text-xl font-bold text-slate-400 block pt-1 pb-1">-</span>
                ) : (
                  <span className="text-3xl font-black text-[#2596be] dark:text-cyan-400">
                    {activeCvModalJob.hybridDetails?.keywords_found ?? 0} <span className="text-lg text-slate-400">/ {activeCvModalJob.hybridDetails?.keywords_total}</span>
                  </span>
                )}
                <p className="text-[10px] text-slate-500">Jumlah syarat yang terpenuhi di CV</p>
              </div>
            </div>

            {/* AI Notes */}
            <div className="p-5 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800/80 border border-[#C2E5EF] dark:border-slate-700 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <span className="font-extrabold text-[#2596be] dark:text-cyan-400 flex items-center gap-2">
                <Sparkles size={16} /> {t.pelamar.status.cvNotes}
              </span>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Kategori Kecocokan: <strong className="uppercase">{activeCvModalJob.kategori ? activeCvModalJob.kategori.replace('_', ' ') : '-'}</strong></span>
                </li>
                <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Skor akhir adalah gabungan dari kesesuaian profil keseluruhan dan pemenuhan kriteria wajib perusahaan.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveCvModalJob(null)}
                className="px-6 py-2.5 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-bold text-xs cursor-pointer"
              >
                {t.pelamar.status.backToList}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: STAGE 4 AI VIDEO ANALYSIS RESULT */}
      {activeVideoModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-10 space-y-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-[#2596be] dark:text-cyan-400 uppercase tracking-wider block">
                  {t.pelamar.status.videoAnalysisTitle}
                </span>
                <h3 className="font-black text-2xl text-[#2596be] dark:text-cyan-400">
                  {t.pelamar.status.videoResultTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeVideoModalJob.jobTitle} — {activeVideoModalJob.companyName}
                </p>
              </div>

              <button
                onClick={() => setActiveVideoModalJob(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Score Banner */}
            <div className="p-6 rounded-3xl bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
              <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shrink-0 shadow-md ${activeVideoModalJob.videoScore >= 80 ? 'bg-[#2596be]' : 'bg-red-600'
                }`}>
                <span className="text-3xl font-black">{activeVideoModalJob.videoScore}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">VIDEO SCORE</span>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                {activeVideoModalJob.videoScore >= 80 ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                    <CheckCircle2 size={16} /> {t.pelamar.status.passedThresholdVideo}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-extrabold border border-red-300">
                    <XCircle size={16} /> {t.pelamar.status.failedThresholdVideo}
                  </div>
                )}

                <h4 className="text-lg font-black text-[#2596be] dark:text-cyan-400">
                  {activeVideoModalJob.videoScore >= 80 ? t.pelamar.status.highMatchVideo : t.pelamar.status.lowMatchVideo}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {t.pelamar.status.algoInfoVideo}: <strong className="text-[#2596be] dark:text-cyan-400">{activeVideoModalJob.videoScore}% nilai komposit</strong>.
                </p>
              </div>
            </div>

            {/* 5 Video Criteria Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Fluency &amp; Comm</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeVideoModalJob.videoBreakdown.fluency}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Confidence &amp; Posture</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeVideoModalJob.videoBreakdown.confidence}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Keyword Relevance</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeVideoModalJob.videoBreakdown.keywords}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Emotion &amp; Pitch Stability</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeVideoModalJob.videoBreakdown.emotion}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Problem Solving Logic</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeVideoModalJob.videoBreakdown.logic}%</span>
              </div>
            </div>

            {/* AI Notes */}
            <div className="p-5 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800/80 border border-[#C2E5EF] dark:border-slate-700 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <span className="font-extrabold text-[#2596be] dark:text-cyan-400 flex items-center gap-2">
                <Bot size={16} /> Catatan Evaluasi AI Video Analysis:
              </span>
              <ul className="space-y-2">
                {activeVideoModalJob.videoBreakdown.notes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveVideoModalJob(null)}
                className="px-6 py-2.5 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-bold text-xs cursor-pointer"
              >
                {t.pelamar.status.backToList}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
