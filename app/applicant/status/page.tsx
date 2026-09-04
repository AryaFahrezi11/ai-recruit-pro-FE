'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  id: number | string;
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
  videoQuestions?: string[];
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

const DEFAULT_INTERVIEW_QUESTIONS = [
  'Ceritakan tentang diri Anda, latar belakang pengalaman, dan keahlian utama yang relevan dengan posisi ini.',
  'Jelaskan pencapaian atau tantangan terbesar yang pernah Anda selesaikan dalam pekerjaan atau proyek sebelumnya.',
  'Mengapa Anda tertarik untuk bergabung dengan perusahaan ini dan apa kontribusi yang ingin Anda berikan?'
];

const getJobVideoQuestions = (item: any): string[] => {
  const raw =
    item.job?.video_questions ||
    item.job?.video_questions_json ||
    item.video_questions ||
    item.video_questions_json ||
    item.pertanyaan_wawancara;

  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((q: any) => (typeof q === 'string' ? q.trim() : ''))
      .filter((q: string) => q.length > 0);
  }

  if (typeof raw === 'string' && raw.trim().length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((q: any) => (typeof q === 'string' ? q.trim() : ''))
          .filter((q: string) => q.length > 0);
      }
    } catch {
      return raw.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean);
    }
  }

  return [];
};

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
    videoQuestions: [
      'Ceritakan tentang diri Anda dan pengalaman relevan Anda dalam pengembangan aplikasi web modern.',
      'Bagaimana pendekatan Anda dalam memecahkan masalah teknis atau arsitektur sistem yang kompleks?',
      'Mengapa Anda tertarik melamar posisi ini di PT Tech Inovasi Nusantara?'
    ],
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

function StatusValidasiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [platformFilter, setPlatformFilter] = useState(searchParams.get('platform') || t.pelamar.status.allPlatform);
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || t.pelamar.status.allStages);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || t.pelamar.status.allStatus);

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== t.pelamar.status.allStatus && value !== t.pelamar.status.allStages && value !== t.pelamar.status.allPlatform) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Expanded application cards state
  const [expandedJobIds, setExpandedJobIds] = useState<(number | string)[]>([5, 4]);

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
        const apiParams = new URLSearchParams();
        const search = searchParams.get('search');
        const stage = searchParams.get('stage');
        const status = searchParams.get('status');
        if (search) apiParams.append('search', search);
        if (stage && stage !== 'Semua Tahapan') apiParams.append('stage', stage);
        if (status && status !== 'Semua Status') apiParams.append('status', status);
        const qs = apiParams.toString();

        const res = await api.get(qs ? `/applications/?${qs}` : '/applications/');
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
              tahapName = 'Stage 2: CV SCREENING ';
              msg = 'CV Anda sedang dalam tahap evaluasi kecocokan  oleh AI.';
            } else if (s === 'lolos_cv' || s === 'virtual_interview') {
              stageIndex = 3;
              tahapName = 'Stage 3: VIRTUAL INTERVIEW';
              msg = `Selamat! CV Anda telah LOLOS screening AI  dengan skor kecocokan ${cvScore}%. Silakan lakukan perekaman Wawancara Video Singkat.`;
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

            const customQuestions = getJobVideoQuestions(item);

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
              videoQuestions: customQuestions.length > 0 ? customQuestions : DEFAULT_INTERVIEW_QUESTIONS,
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
          setExpandedJobIds(mapped.map((m) => m.id));
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
  }, [searchParams]);

  const pipelineStagesList = [
    { number: 1, name: '1. UPLOAD CV', key: 'cv_upload' },
    { number: 2, name: '2. CV SCREENING ', key: 'cv_screening' },
    { number: 3, name: '3. VIRTUAL INTERVIEW', key: 'virtual_interview' },
    { number: 4, name: '4. AI VIDEO ANALYSIS', key: 'video_analysis' },
    { number: 5, name: '5. HUMAN VALIDATION', key: 'human_validation' }
  ];

  const toggleExpandJob = (id: number | string) => {
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
    const matchesStatus = statusFilter === t.pelamar.status.allStatus || app.status === statusFilter;
    const matchesPlatform = platformFilter === t.pelamar.status.allPlatform || app.kegiatan === platformFilter;
    const matchesStage = stageFilter === t.pelamar.status.allStages || app.tahapRekrutmen.toLowerCase().includes(stageFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesPlatform && matchesStage;
  });

  return (
    <div className="max-w-[1600px] w-full mx-auto space-y-6">

      {/* Main Page Title Banner (Matching Enterprise Blue Theme) */}
      <div className="bg-[#1A4B9F] p-6 sm:p-8 rounded-2xl text-white shadow-md space-y-2 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{t.pelamar.status.title}</h1>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-3xl font-medium">
            {t.pelamar.status.subtitle}
          </p>
        </div>
      </div>

      {/* Search & Dropdown Filter Inputs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <form
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            updateUrlParams({ search: searchTerm, stage: stageFilter, status: statusFilter, platform: platformFilter });
          }}
        >
          {/* Search Box */}
          <div className="sm:col-span-4 relative flex items-center">
            <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.pelamar.status.searchPlaceholder}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-1 focus:ring-[#1A4B9F] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            />
          </div>

          {/* Dropdown 1: Platform */}
          <div className="sm:col-span-3">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1A4B9F] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
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
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1A4B9F] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option>{t.pelamar.status.allStages}</option>
              <option value="UPLOAD CV">1. UPLOAD CV</option>
              <option value="CV SCREENING">2. CV SCREENING </option>
              <option value="VIRTUAL INTERVIEW">3. VIRTUAL INTERVIEW</option>
              <option value="VIDEO ANALYSIS">4. AI VIDEO ANALYSIS</option>
              <option value="HUMAN VALIDATION">5. HUMAN VALIDATION</option>
            </select>
          </div>

          {/* Dropdown 3: Status */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1A4B9F] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option>{t.pelamar.status.allStatus}</option>
              <option value="Dalam Proses">{t.pelamar.status.inProgress}</option>
              <option value="Lolos">{t.pelamar.status.passed}</option>
              <option value="Tidak Lolos">{t.pelamar.status.failed}</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1A4B9F] hover:bg-[#133878] text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {t.pelamar.status.searchButton}
            </button>
          </div>
        </form>
      </div>

      {/* APPLICATIONS LIST CARDS */}
      <div className="space-y-6">
        {filteredApplications.map((app) => {
          const isExpanded = expandedJobIds.includes(app.id);

          return (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200"
            >
              {/* Card Summary Header */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                  {/* Left: Logo & Job Title */}
                  <div className="flex items-start gap-4">
                    <img
                      src={app.logo}
                      alt={app.companyName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="space-y-1">
                      <h2 className="text-lg sm:text-xl font-black text-[#1A4B9F] dark:text-blue-400">
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
                      <span className="font-bold text-[#1A4B9F] dark:text-blue-400">{app.tahapRekrutmen}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">{t.pelamar.status.statusLabel}</span>
                      <span className={`font-extrabold px-3 py-1 rounded-full text-xs inline-block ${app.status === 'Lolos'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : app.status === 'Dalam Proses'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-[#1A4B9F] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Right Action: Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpandJob(app.id)}
                    className="text-xs font-extrabold text-[#1A4B9F] dark:text-blue-400 hover:underline flex items-center gap-1.5 self-start md:self-center cursor-pointer"
                  >
                    <span>{isExpanded ? t.pelamar.status.hideDetails : t.pelamar.status.showDetails}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                </div>

                {/* EXPANDED PIPELINE TRACKER & NOTIFICATION BOX */}
                {isExpanded && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-8 animate-fadeIn">

                    {/* Interactive 5-Stage Pipeline Stepper */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#1A4B9F] dark:text-blue-400 flex items-center gap-2">
                          <BarChart3 size={16} /> {t.pelamar.status.pipelineTitle}
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
                              className={`p-4 rounded-2xl border space-y-2 transition-all relative group ${isClickableCv || isClickableVideo ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : ''
                                } ${isFailed
                                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-700 dark:text-red-300'
                                  : isCurrentStage
                                    ? 'bg-[#EFF6FF] dark:bg-slate-800 border-[#DBEAFE] dark:border-slate-700 text-[#1A4B9F] dark:text-blue-400 ring-2 ring-[#1A4B9F]'
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
                                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-400 font-bold text-[9px] border border-[#DBEAFE] dark:border-slate-700 shadow-2xs">
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
                                  <Clock size={16} className="text-[#1A4B9F] dark:text-blue-400" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Official Notification Message Box */}
                    <div className={`p-6 rounded-2xl border text-xs sm:text-sm space-y-4 leading-relaxed ${app.status === 'Tidak Lolos' || app.status === 'Lowongan Telah Ditutup'
                        ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 text-red-900 dark:text-red-200'
                        : app.status === 'Lolos'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                          : 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-[#1A4B9F] dark:text-blue-300'
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
                            <CheckCircle2 size={18} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                            <span>{t.pelamar.status.progressLabel}</span>
                          </>
                        )}
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">
                        {app.statusMessage}
                      </p>

                      {/* DAFTAR PERTANYAAN WAWANCARA VIDEO DARI PERUSAHAAN */}
                      {app.currentStageIndex === 3 && (
                        <div className="mt-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                                <HelpCircle size={17} />
                              </div>
                              <div>
                                <h5 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                                  Pertanyaan Wawancara Wajib Dijawab
                                </h5>
                                <p className="text-[11px] text-slate-500">
                                  Pastikan rekaman video Anda menjawab pertanyaan berikut dari <strong>{app.companyName}</strong>:
                                </p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 w-fit shrink-0">
                              {(app.videoQuestions || DEFAULT_INTERVIEW_QUESTIONS).length} Pertanyaan
                            </span>
                          </div>

                          <div className="space-y-2.5 pt-1">
                            {(app.videoQuestions || DEFAULT_INTERVIEW_QUESTIONS).map((q, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs"
                              >
                                <span className="w-5 h-5 rounded-full bg-[#1A4B9F] text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                  {idx + 1}
                                </span>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                  {q}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SPECIAL ACTION BUTTON FOR SCENARIO 5: UPLOAD VIRTUAL INTERVIEW */}
                      {app.currentStageIndex === 3 && app.status === 'Dalam Proses' && (
                        <div className="pt-2 flex flex-wrap items-center gap-4">
                          <label className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer">
                            <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const formData = new FormData();
                                formData.append('video', file);

                                const uploadPromise = api.post(`/applications/${app.id}/upload-video`, formData);

                                toast.promise(uploadPromise, {
                                  loading: 'Sedang mengunggah video wawancara...',
                                  success: (res: any) => res.message || 'Video berhasil diunggah dan sedang diproses AI.',
                                  error: (err: any) => parseErrorMessage(err) || 'Gagal mengunggah video.'
                                }).then(() => {
                                  // Refresh data after successful upload (optional, but good UX)
                                  setTimeout(() => window.location.reload(), 2000);
                                }).catch(() => { });
                              }
                            }} />
                            <Video size={18} className="text-emerald-200" />
                            <span>Upload Video Wawancara</span>
                          </label>
                        </div>
                      )}
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
                <span className="text-xs font-bold text-[#1A4B9F] dark:text-blue-400 uppercase tracking-wider block">
                  {t.pelamar.status.cvAnalysisTitle}
                </span>
                <h3 className="font-extrabold text-2xl text-slate-800 dark:text-slate-100 mt-0.5">
                  {t.pelamar.status.cvResultTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeCvModalJob.jobTitle} &bull; {activeCvModalJob.companyName}
                </p>
              </div>

              <button
                onClick={() => setActiveCvModalJob(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Score Banner */}
            {(() => {
              const isFailedEdu = activeCvModalJob.kategori === 'tidak_memenuhi_syarat_pendidikan';
              const isPassed = activeCvModalJob.cvScore >= activeCvModalJob.threshold && !isFailedEdu;

              return (
                <div className="p-6 rounded-3xl bg-[#EFF6FF] dark:bg-slate-800/70 border border-[#DBEAFE] dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
                  {/* Circle Score */}
                  <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-md ${isPassed
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
                      : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20'
                    }`}>
                    <span className="text-3xl font-black">{activeCvModalJob.cvScore}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 mt-0.5">Kecocokan</span>
                  </div>

                  {/* Verdict Info */}
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border">
                      {isPassed ? <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" /> : <XCircle size={15} className="text-rose-600 dark:text-rose-400" />}
                      <span className={isPassed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
                        {isFailedEdu
                          ? 'Belum Memenuhi Syarat Minimal Pendidikan'
                          : isPassed
                            ? `Memenuhi Standar Kelulusan (≥ ${activeCvModalJob.threshold}%)`
                            : `Di Bawah Standar Kelulusan (< ${activeCvModalJob.threshold}%)`}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {isFailedEdu
                        ? 'Pendidikan Belum Memenuhi Ketentuan Posisi'
                        : isPassed
                          ? 'Profil Anda Sangat Cocok dengan Kriteria Lowongan'
                          : 'Profil Belum Mencapai Standar Nilai Minimal'}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isFailedEdu ? (
                        <>Tingkat pendidikan pada profil Anda belum memenuhi kualifikasi minimal yang disyaratkan untuk posisi ini.</>
                      ) : isPassed ? (
                        <>Kualifikasi profil dan keahlian Anda dinilai <strong>cocok ({activeCvModalJob.cvScore}%)</strong> dengan kriteria lowongan dan telah melampaui batas minimal kelulusan perusahaan (<strong>{activeCvModalJob.threshold}%</strong>).</>
                      ) : (
                        <>Tingkat kecocokan profil Anda saat ini sebesar <strong>{activeCvModalJob.cvScore}%</strong>, belum mencapai standar nilai kelulusan minimal yang ditentukan perusahaan (<strong>{activeCvModalJob.threshold}%</strong>).</>
                      )}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Real Data Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Pengalaman */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#DBEAFE] dark:border-slate-700 text-center space-y-2 shadow-2xs">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block">Kesesuaian Pengalaman</span>
                <span className="text-3xl font-black text-[#1A4B9F] dark:text-blue-400 block">
                  {activeCvModalJob.hybridDetails?.sbert_score ?? activeCvModalJob.cvScore}%
                </span>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Relevansi riwayat kerja & tugas (Porsi 60%)
                </p>
              </div>

              {/* Card 2: Keahlian */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#DBEAFE] dark:border-slate-700 text-center space-y-2 shadow-2xs">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block">Kesesuaian Keahlian</span>
                {!activeCvModalJob.hybridDetails?.keywords_total ? (
                  <span className="text-xl font-bold text-slate-400 block pt-1 pb-1">Sesuai Kriteria</span>
                ) : (
                  <span className="text-3xl font-black text-[#1A4B9F] dark:text-blue-400 block">
                    {activeCvModalJob.hybridDetails.keyword_score}%
                  </span>
                )}
                <p className="text-[11px] text-slate-500 leading-snug">
                  Kecocokan keterampilan khusus (Porsi 40%)
                </p>
              </div>

              {/* Card 3: Syarat Terpenuhi */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#DBEAFE] dark:border-slate-700 text-center space-y-2 shadow-2xs">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block">Keahlian Terpenuhi</span>
                {!activeCvModalJob.hybridDetails?.keywords_total ? (
                  <span className="text-xl font-bold text-slate-400 block pt-1 pb-1">Terpenuhi</span>
                ) : (
                  <span className="text-3xl font-black text-[#1A4B9F] dark:text-blue-400 block">
                    {activeCvModalJob.hybridDetails.keywords_found} <span className="text-sm font-semibold text-slate-400">dari {activeCvModalJob.hybridDetails.keywords_total}</span>
                  </span>
                )}
                <p className="text-[11px] text-slate-500 leading-snug">
                  Keahlian wajib yang ditemukan di CV
                </p>
              </div>
            </div>

            {/* AI Evaluation Notes */}
            <div className="p-6 rounded-2xl bg-[#EFF6FF] dark:bg-slate-800/80 border border-[#DBEAFE] dark:border-slate-700 space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <span className="font-extrabold text-[#1A4B9F] dark:text-blue-400 flex items-center gap-2 text-sm">
                Catatan Hasil Evaluasi CV
              </span>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <Check size={14} />
                  </div>
                  <span>
                    Kategori Kesesuaian: <strong className="font-bold text-slate-800 dark:text-slate-100 uppercase">
                      {activeCvModalJob.kategori === 'tidak_memenuhi_syarat_pendidikan'
                        ? 'Pendidikan Belum Memenuhi Syarat'
                        : activeCvModalJob.kategori
                          ? activeCvModalJob.kategori.replaceAll('_', ' ')
                          : (activeCvModalJob.cvScore >= activeCvModalJob.threshold ? 'Cocok' : 'Kurang Cocok')}
                    </strong>
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="p-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1A4B9F] shrink-0 mt-0.5">
                    <Check size={14} />
                  </div>
                  <span>
                    Nilai akhir diperoleh dari gabungan <strong>Kesesuaian Pengalaman (bobot 60%)</strong> dan <strong>Pemenuhan Keahlian (bobot 40%)</strong> terhadap standar minimal kelulusan perusahaan (<strong>{activeCvModalJob.threshold}%</strong>).
                  </span>
                </li>

                {activeCvModalJob.kategori === 'tidak_memenuhi_syarat_pendidikan' ? (
                  <li className="flex items-start gap-2.5 text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>Tingkat pendidikan pada profil/CV Anda belum memenuhi syarat minimal untuk posisi ini. Anda dapat memperbarui data pendidikan di profil Anda atau melamar posisi lain.</span>
                  </li>
                ) : activeCvModalJob.cvScore >= activeCvModalJob.threshold ? (
                  <li className="flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                    <span>Selamat! Profil Anda dinyatakan <strong>Lolos Seleksi Screening CV</strong>. Silakan pantau linimasa status lamaran untuk mengikuti tahap berikutnya (Wawancara Video).</span>
                  </li>
                ) : (
                  <li className="flex items-start gap-2.5 text-amber-800 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                    <span>Nilai kesesuaian berkas Anda saat ini belum mencapai standar minimal kelulusan ({activeCvModalJob.threshold}%). Anda tetap dapat mengeksplorasi dan melamar lowongan lain yang cocok dengan keahlian Anda.</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveCvModalJob(null)}
                className="px-6 py-2.5 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs cursor-pointer shadow-sm transition-colors"
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
                <span className="text-xs font-bold text-[#1A4B9F] dark:text-blue-400 uppercase tracking-wider block">
                  {t.pelamar.status.videoAnalysisTitle}
                </span>
                <h3 className="font-black text-2xl text-[#1A4B9F] dark:text-blue-400">
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
            <div className="p-6 rounded-3xl bg-[#EFF6FF] dark:bg-slate-800 border border-[#DBEAFE] dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
              <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shrink-0 shadow-md ${activeVideoModalJob.videoScore >= 80 ? 'bg-[#1A4B9F]' : 'bg-red-600'
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

                <h4 className="text-lg font-black text-[#1A4B9F] dark:text-blue-400">
                  {activeVideoModalJob.videoScore >= 80 ? t.pelamar.status.highMatchVideo : t.pelamar.status.lowMatchVideo}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {t.pelamar.status.algoInfoVideo}: <strong className="text-[#1A4B9F] dark:text-blue-400">{activeVideoModalJob.videoScore}% nilai komposit</strong>.
                </p>
              </div>
            </div>

            {/* 5 Video Criteria Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#DBEAFE] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Fluency &amp; Comm</span>
                <span className="text-xl font-black text-[#1A4B9F] dark:text-blue-400">{activeVideoModalJob.videoBreakdown.fluency}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#DBEAFE] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Confidence &amp; Posture</span>
                <span className="text-xl font-black text-[#1A4B9F] dark:text-blue-400">{activeVideoModalJob.videoBreakdown.confidence}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#DBEAFE] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Keyword Relevance</span>
                <span className="text-xl font-black text-[#1A4B9F] dark:text-blue-400">{activeVideoModalJob.videoBreakdown.keywords}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#DBEAFE] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Emotion &amp; Pitch Stability</span>
                <span className="text-xl font-black text-[#1A4B9F] dark:text-blue-400">{activeVideoModalJob.videoBreakdown.emotion}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#DBEAFE] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Problem Solving Logic</span>
                <span className="text-xl font-black text-[#1A4B9F] dark:text-blue-400">{activeVideoModalJob.videoBreakdown.logic}%</span>
              </div>
            </div>

            {/* AI Notes */}
            <div className="p-5 rounded-2xl bg-[#EFF6FF] dark:bg-slate-800/80 border border-[#DBEAFE] dark:border-slate-700 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <span className="font-extrabold text-[#1A4B9F] dark:text-blue-400 flex items-center gap-2">
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
                className="px-6 py-2.5 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs cursor-pointer shadow-sm transition-colors"
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

export default function StatusValidasiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A4B9F]"></div></div>}>
      <StatusValidasiContent />
    </Suspense>
  );
}
