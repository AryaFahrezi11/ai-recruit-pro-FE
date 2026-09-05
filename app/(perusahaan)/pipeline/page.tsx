'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { KanbanColumn } from '@/components/pipeline/KanbanColumn';
import { CandidateCard, CandidateStage, CandidateStatus } from '@/components/pipeline/CandidateCard';
import { CandidateModal } from '@/components/pipeline/CandidateModal';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { 
  Filter, 
  ArrowUpDown, 
  Download, 
  Loader2, 
  LayoutGrid, 
  Table as TableIcon, 
  Search, 
  Eye, 
  Video, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Clock,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { api, parseErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface CandidateData {
  id?: string;
  applicationId?: string;
  name: string;
  role: string;
  education?: string;
  university?: string;
  stage: CandidateStage;
  status?: CandidateStatus;
  cvScore?: number;
  videoUploaded?: boolean;
  videoScores?: {
    ability: number;
    intelligent: number;
    personality: number;
    attitude: number;
    emotionalIntelligence: number;
  };
  cvData?: any;
  cvDocument?: any;
  jobData?: any;
  analisisCv?: any;
  aiResult?: any;
  videoUrl?: string;
  isPolling?: boolean;
  pollProgress?: number;
  pollMessage?: string;
  interviewDetails?: any;
  catatanPerusahaan?: string;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function PipelinePage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [pollProgress, setPollProgress] = useState<number>(0);
  const [pollMessage, setPollMessage] = useState<string>('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Filter States for Table View
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetchAuth('/api/applications/');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat data pelamar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // Resume polling on page refresh if there is any pending video analysis
  useEffect(() => {
    if (!pollingId && applications.length > 0) {
      const pendingApp = applications.find(a => a.status === 'video_analysis');
      if (pendingApp) {
        setPollingId(pendingApp.id);
        setPollMessage('Memeriksa status antrean...');
      }
    }
  }, [applications, pollingId]);

  // Real-time backend progress polling
  useEffect(() => {
    if (!pollingId) return;

    let isSubscribed = true;

    const checkProgress = async () => {
      try {
        const res = await fetchAuth(`/api/applications/${pollingId}/video-progress`);
        if (!res.ok || !isSubscribed) return;
        const data = await res.json();

        if (!isSubscribed) return;

        if (data.status === 'completed' || (data.progress !== undefined && data.progress >= 100)) {
          setPollProgress(100);
          setPollMessage('Analisis AI Video Selesai!');
          toast.success('Analisis Video Selesai!');
          setTimeout(() => {
            if (isSubscribed) {
              setPollingId(null);
              setPollMessage('');
              setAnalyzingId(null);
              loadApplications();
            }
          }, 800);
        } else if (data.status === 'failed') {
          toast.error(data.error || 'Analisis video gagal diproses.');
          setPollingId(null);
          setPollMessage('');
          setAnalyzingId(null);
          loadApplications();
        } else {
          setPollProgress(data.progress || 0);
          if (data.message) {
            setPollMessage(data.message);
          }
        }
      } catch (e) {
        // ignore fetch error
      }
    };

    checkProgress();
    const pollBackend = setInterval(checkProgress, 2000);

    return () => {
      isSubscribed = false;
      clearInterval(pollBackend);
    };
  }, [pollingId]);

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      setLoading(true);
      const res = await fetchAuth(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error('Gagal memperbarui status lamaran');
      }
      toast.success('Status lamaran berhasil diperbarui');
      loadApplications();
    } catch (error: any) {
      toast.error(error.message || parseErrorMessage(error) || 'Gagal memperbarui status');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeVideo = async (applicationId: string) => {
    try {
      setAnalyzingId(applicationId);
      const res = await fetchAuth(`/api/applications/${applicationId}/analyze-video`, { method: 'POST' });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Gagal menjalankan analisis AI Video');
      }

      toast.success('Analisis AI Video dimasukkan ke antrean. Mohon tunggu...');
      setPollingId(applicationId);
      setPollProgress(0);
      setPollMessage('Menunggu giliran antrean AI...');

    } catch (error: any) {
      toast.error(error.message || parseErrorMessage(error) || 'Gagal menjalankan analisis AI Video');
      setAnalyzingId(null);
    }
  };

  // Helper to construct CandidateData and open modal
  const openCandidateModal = (app: any) => {
    const cvScore = Math.round(app.analisis_cv?.skor_kecocokan || 0);
    const parsePct = (val: any) => typeof val === 'string' ? parseFloat(val.replace('%', '')) : (typeof val === 'number' ? val : 0);
    const appAi = (app as any).ai_result;
    const dynamicVideoScores = appAi?.dimensi_psikologis ? {
      ability: Math.round(parsePct(appAi.dimensi_psikologis.Ability)),
      intelligent: Math.round(parsePct(appAi.dimensi_psikologis.Intelligent)),
      personality: Math.round(parsePct(appAi.dimensi_psikologis.Personality)),
      attitude: Math.round(parsePct(appAi.dimensi_psikologis.Attitude)),
      emotionalIntelligence: Math.round(parsePct(appAi.dimensi_psikologis['Emotional Intelligent'])),
    } : undefined;

    let currentStage: CandidateStage = 'upload_cv';
    const s = app.status || 'upload_cv';
    if (s === 'cv_screening' || s === 'lolos_cv' || s === 'ditolak_sistem') currentStage = 'cv_screening';
    else if (s === 'virtual_interview') currentStage = 'interview';
    else if (s === 'video_analysis') currentStage = 'ai_analysis';
    else if (s === 'human_validation' || s === 'interview_lanjutan' || s === 'hired' || s === 'rejected') currentStage = 'human_validation';

    setSelectedCandidate({

      id: app.id,
      applicationId: app.id,
      name: app.pelamar?.nama_lengkap || 'Kandidat',
      role: (app as any).cvData?.jobTitle || app.job?.judul_posisi || 'Posisi',
      stage: currentStage,
      status: app.status,
      cvScore: cvScore,
      education: (app as any).cv_document?.pendidikan_tertinggi || app.pelamar?.pendidikan_terakhir,
      university: app.pelamar?.institusi_pendidikan,
      cvData: (app as any).cvData,
      cvDocument: (app as any).cv_document,
      jobData: app.job,
      analisisCv: app.analisis_cv,
      aiResult: (app as any).ai_result,
      videoUrl: (app as any).video_url,
      videoScores: dynamicVideoScores,
      isPolling: pollingId === app.id,
      pollProgress: pollingId === app.id ? pollProgress : undefined,
      pollMessage: pollingId === app.id ? pollMessage : undefined,
      interviewDetails: app.interview_details || (app as any).interviewDetails,
      catatanPerusahaan: app.catatan_perusahaan || (app as any).catatanPerusahaan,
    });
  };

  // Extract distinct job titles for filter dropdown
  const distinctJobs = useMemo(() => {
    const set = new Set<string>();
    applications.forEach(a => {
      const title = a.job?.judul_posisi;
      if (title) set.add(title);
    });
    return Array.from(set);
  }, [applications]);

  // Filtered applications for Table View
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Search
      const name = (app.pelamar?.nama_lengkap || '').toLowerCase();
      const job = (app.job?.judul_posisi || '').toLowerCase();
      const uni = (app.pelamar?.institusi_pendidikan || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || name.includes(q) || job.includes(q) || uni.includes(q);

      // Job Filter
      const matchJob = jobFilter === 'all' || app.job?.judul_posisi === jobFilter;

      // Stage Filter
      let matchStage = true;
      const s = app.status || 'upload_cv';
      if (stageFilter === 'upload_cv') matchStage = s === 'upload_cv' || s === 'dikirim';
      else if (stageFilter === 'cv_screening') matchStage = s === 'cv_screening' || s === 'lolos_cv' || s === 'ditolak_sistem';
      else if (stageFilter === 'virtual_interview') matchStage = s === 'virtual_interview';
      else if (stageFilter === 'video_analysis') matchStage = s === 'video_analysis';
      else if (stageFilter === 'human_validation') matchStage = s === 'human_validation';
      else if (stageFilter === 'interview_lanjutan') matchStage = s === 'interview_lanjutan';
      else if (stageFilter === 'hired') matchStage = s === 'hired' || s === 'accepted';
      else if (stageFilter === 'rejected') matchStage = s === 'rejected' || s === 'ditolak';

      return matchSearch && matchJob && matchStage;
    });
  }, [applications, searchQuery, jobFilter, stageFilter]);

  // Pipeline Kanban stage buckets
  const uploadCvApps = applications.filter(a => a.status === 'upload_cv' || a.status === 'dikirim');
  const screeningApps = applications.filter(a => a.status === 'cv_screening' || a.status === 'lolos_cv' || a.status === 'ditolak_sistem');
  const virtualInterviewApps = applications.filter(a => a.status === 'virtual_interview');
  const videoAnalysisApps = applications.filter(a => a.status === 'video_analysis');
  const humanValidationApps = applications.filter(a => a.status === 'human_validation' || a.status === 'interview_lanjutan');

  // Columns for DataTable
  const tableColumns: ColumnDef<any>[] = [
    {
      key: 'no',
      header: 'No',
      render: (app, index) => index + 1
    },
    {
      key: 'kandidat',
      header: 'Kandidat',
      className: 'min-w-[220px]',
      render: (app) => {
        const name = app.pelamar?.nama_lengkap || 'Kandidat';
        const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
        const edu = (app as any).cv_document?.pendidikan_tertinggi || app.pelamar?.pendidikan_terakhir || 'Pendidikan';
        const uni = app.pelamar?.institusi_pendidikan || '';

        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
              {initials || 'KD'}
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs text-foreground block truncate hover:underline cursor-pointer" onClick={() => openCandidateModal(app)}>
                {name}
              </span>
              <span className="text-[11px] text-muted-foreground truncate block">
                {edu} {uni ? `• ${uni}` : ''}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'posisi',
      header: 'Posisi Dilamar',
      className: 'min-w-[180px]',
      render: (app) => {
        const jobTitle = app.job?.judul_posisi || 'Posisi';
        const city = app.job?.kota || '';
        const jobType = app.job?.tipe_pekerjaan || '';

        return (
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-foreground block truncate">
              {jobTitle}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              {city && (
                <span className="flex items-center gap-0.5">
                  <MapPin size={10} /> {city}
                </span>
              )}
              {jobType && (
                <span className="px-1.5 py-0.2 rounded bg-muted/60 border border-border">
                  {jobType}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'tahapan',
      header: 'Tahapan & Status',
      className: 'min-w-[170px]',
      render: (app) => {
        const s = app.status || 'upload_cv';

        if (s === 'upload_cv' || s === 'dikirim') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              1. Upload CV
            </span>
          );
        }
        if (s === 'cv_screening' || s === 'lolos_cv') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              2. CV Screening
            </span>
          );
        }
        if (s === 'virtual_interview') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Video size={12} className="text-purple-600 dark:text-purple-400" />
              3. Wawancara Video
            </span>
          );
        }
        if (s === 'video_analysis') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              4. Analisis AI Video
            </span>
          );
        }
        if (s === 'interview_lanjutan') {
          const intv = app.interview_details;
          return (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700">
                <Calendar size={12} className="text-indigo-600 dark:text-indigo-400" />
                5. Validasi HR (Wawancara Lanjutan)
              </span>
              {intv?.tanggal && (
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 pl-1">
                  <Clock size={10} />
                  <span>{formatDate(intv.tanggal)} {intv.waktu ? `• ${intv.waktu} WIB` : ''}</span>
                </div>
              )}
            </div>
          );
        }
        if (s === 'hired' || s === 'accepted') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={12} className="text-emerald-600" />
              Diterima (Hired)
            </span>
          );
        }
        if (s === 'rejected' || s === 'ditolak_sistem' || s === 'ditolak') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <XCircle size={12} className="text-rose-600" />
              Ditolak
            </span>
          );
        }
        return (
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
              <UserCheck size={12} className="text-slate-600 dark:text-slate-400" />
              5. Validasi HR
            </span>
            <span className="block text-[10px] text-muted-foreground pl-1 font-medium">
              Menunggu Keputusan HR
            </span>
          </div>
        );
      }
    },
    {
      key: 'cv_score',
      header: 'Skor CV ATS',
      className: 'w-32 text-center',
      headerClassName: 'text-center',
      render: (app) => {
        const score = Math.round(app.analisis_cv?.skor_kecocokan || 0);
        const threshold = app.analisis_cv?.threshold_digunakan || app.job?.cv_threshold || 60;
        const isFailedEdu = app.analisis_cv?.kategori === 'tidak_memenuhi_syarat_pendidikan';
        const isPassed = score >= threshold && !isFailedEdu;

        if (score === 0 && !app.analisis_cv) {
          return <span className="text-xs text-muted-foreground">-</span>;
        }

        return (
          <div className="flex flex-col items-center">
            <span className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold border ${
              isPassed 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}>
              {score}% Match
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              Min. {threshold}%
            </span>
          </div>
        );
      }
    },
    {
      key: 'video_eval',
      header: 'Evaluasi Video AI',
      className: 'w-36 text-center',
      headerClassName: 'text-center',
      render: (app) => {
        const appAi = (app as any).ai_result;
        const parsePct = (val: any) => typeof val === 'string' ? parseFloat(val.replace('%', '')) : (typeof val === 'number' ? val : 0);
        
        if (appAi?.dimensi_psikologis) {
          const avgScore = Math.round(
            (parsePct(appAi.dimensi_psikologis.Ability) +
             parsePct(appAi.dimensi_psikologis.Intelligent) +
             parsePct(appAi.dimensi_psikologis.Personality) +
             parsePct(appAi.dimensi_psikologis.Attitude) +
             parsePct(appAi.dimensi_psikologis['Emotional Intelligent'])) / 5
          );

          return (
            <div className="flex flex-col items-center">
              <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
                {avgScore} / 100
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                5 Aspek Teranalisis
              </span>
            </div>
          );
        }

        if (app.status === 'video_analysis') {
          return (
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Memproses...
            </span>
          );
        }

        if (app.status === 'virtual_interview') {
          return (
            <span className="text-[11px] text-muted-foreground font-medium">
              Menunggu Video
            </span>
          );
        }

        return <span className="text-xs text-muted-foreground">-</span>;
      }
    },
    {
      key: 'applied_at',
      header: 'Tanggal Masuk',
      className: 'w-32 text-center text-xs text-muted-foreground font-medium',
      headerClassName: 'text-center',
      render: (app) => formatDate(app.applied_at)
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      className: 'w-28 text-right',
      headerClassName: 'text-right',
      render: (app) => (
        <button
          type="button"
          onClick={() => openCandidateModal(app)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          title="Buka Lembar Evaluasi & Hasil AI Lengkap"
        >
          <Eye size={13} />
          <span>Detail</span>
        </button>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full max-w-full space-y-6 font-sans antialiased">
      {/* Header Area & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Briefcase size={22} className="text-primary" />
            {t.pipeline?.title || 'Pipeline & Evaluasi Pelamar'}
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Pantau dan kelola seluruh pelamar masuk, hasil penilaian ATS CV, evaluasi video wawancara AI, dan keputusan akhir.
          </p>
        </div>

        {/* Segmented View Toggle Switcher */}
        <div className="flex items-center p-1 bg-muted/60 border border-border rounded-xl self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TableIcon size={14} />
            <span>Tampilan Tabel</span>
          </button>
          
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid size={14} />
            <span>Kanban Board</span>
          </button>
        </div>
      </div>

      {/* ==================== VIEW 1: TABLE VIEW ==================== */}
      {viewMode === 'table' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Filter Bar */}
          <div className="p-4 bg-card rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pelamar, universitas, atau posisi lowongan..."
                className="w-full pl-9 pr-4 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
              />
            </div>

            {/* Filter by Job Position */}
            <div className="w-full md:w-56">
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium cursor-pointer"
              >
                <option value="all">Semua Lowongan Posisi</option>
                {distinctJobs.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            {/* Filter by Stage / Status */}
            <div className="w-full md:w-52">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium cursor-pointer"
              >
                <option value="all">Semua Tahapan Seleksi</option>
                <option value="upload_cv">1. Upload CV</option>
                <option value="cv_screening">2. CV Screening AI</option>
                <option value="virtual_interview">3. Wawancara Video</option>
                <option value="video_analysis">4. Analisis AI Video</option>
                <option value="human_validation">5. Validasi HR (Semua)</option>
                <option value="interview_lanjutan">5. Validasi HR (Wawancara Lanjutan)</option>
                <option value="hired">Diterima (Hired)</option>
                <option value="rejected">Ditolak (Rejected)</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <DataTable
            data={filteredApplications}
            columns={tableColumns}
            isLoading={loading}
            pageSize={10}
            emptyMessage="Tidak ada pelamar yang cocok dengan kriteria pencarian atau filter yang dipilih."
            onRowClick={(item) => openCandidateModal(item)}
          />
        </div>
      )}

      {/* ==================== VIEW 2: KANBAN BOARD VIEW ==================== */}
      {viewMode === 'kanban' && (
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar animate-in fade-in duration-200">
          <div className="flex gap-6 items-start min-w-max h-full">

            {/* 1. UPLOAD CV */}
            <KanbanColumn title={t.pipeline?.uploadCV || '1. Upload CV'} count={uploadCvApps.length}>
              {uploadCvApps.map((app) => (
                <CandidateCard
                  key={app.id}
                  name={app.pelamar?.nama_lengkap || 'Kandidat'}
                  role={(app as any).cvData?.jobTitle || app.job?.judul_posisi || 'Posisi'}
                  appliedJob={app.job?.judul_posisi}
                  education={app.pelamar?.pendidikan_terakhir || (app as any).cvData?.education?.[0]?.degree}
                  university={app.pelamar?.institusi_pendidikan || (app as any).cvData?.education?.[0]?.school}
                  stage="upload_cv"
                  status="processing"
                  timeInfo="Otomatis Memproses AI..."
                  onClick={() => openCandidateModal(app)}
                />
              ))}
            </KanbanColumn>

            {/* 2. CV SCREENING  */}
            <KanbanColumn title={t.pipeline?.cvScreening || '2. CV Screening'} count={screeningApps.length}>
              {screeningApps.map((app) => {
                const cvScore = Math.round(app.analisis_cv?.skor_kecocokan || 0);
                const threshold = app.analisis_cv?.threshold_digunakan || app.job?.cv_threshold || 60;
                const isAiProcessed = cvScore > 0 || app.analisis_cv;
                const isFailedEdu = app.analisis_cv?.kategori === 'tidak_memenuhi_syarat_pendidikan';
                const isPassed = cvScore >= threshold && !isFailedEdu;

                const actionButtons = isAiProcessed ? (
                  <div className="flex items-center gap-1.5">
                    {isPassed ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'virtual_interview'); }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        Loloskan
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'virtual_interview'); }}
                          className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-md text-[11px] flex items-center gap-1 border border-border cursor-pointer"
                        >
                          Override
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'ditolak_sistem'); }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          Tolak
                        </button>
                      </>
                    )}
                  </div>
                ) : undefined;

                return (
                  <CandidateCard
                    key={app.id}
                    name={app.pelamar?.nama_lengkap || 'Kandidat'}
                    role={(app as any).cvData?.jobTitle || app.job?.judul_posisi || 'Posisi'}
                    appliedJob={app.job?.judul_posisi}
                    education={app.pelamar?.pendidikan_terakhir || (app as any).cvData?.education?.[0]?.degree}
                    university={app.pelamar?.institusi_pendidikan || (app as any).cvData?.education?.[0]?.school}
                    stage="cv_screening"
                    cvScore={cvScore}
                    threshold={threshold}
                    status={app.status === 'lolos_cv' ? undefined : (app.status === 'ditolak_sistem' ? undefined : 'processing')}
                    timeInfo={t.pipeline?.cosineSimilarity || 'Perhitungan Relevansi AI'}
                    customActions={actionButtons}
                    onClick={() => openCandidateModal(app)}
                  />
                );
              })}
            </KanbanColumn>

            {/* 3. VIRTUAL INTERVIEW */}
            <KanbanColumn title={t.pipeline?.virtualInterview || '3. Virtual Interview'} count={virtualInterviewApps.length}>
              {virtualInterviewApps.map((app) => (
                <CandidateCard
                  key={app.id}
                  name={app.pelamar?.nama_lengkap || 'Kandidat'}
                  role={(app as any).cvData?.jobTitle || app.job?.judul_posisi || 'Posisi'}
                  appliedJob={app.job?.judul_posisi}
                  stage="interview"
                  status="awaiting_video"
                  timeInfo="Menunggu Jadwal/Video"
                  onClick={() => openCandidateModal(app)}
                />
              ))}
            </KanbanColumn>

            {/* 4. AI VIDEO ANALYSIS */}
            <KanbanColumn title={t.pipeline?.videoAnalysis || '4. Analisis AI Video'} count={videoAnalysisApps.length}>
              {videoAnalysisApps.map((app) => {
                const isCurrentPolling = pollingId === app.id;
                const isCurrentAnalyzing = analyzingId === app.id || isCurrentPolling;
                
                return (
                  <CandidateCard
                    key={app.id}
                    name={app.pelamar?.nama_lengkap || 'Kandidat'}
                    role={(app as any).cvData?.jobTitle || app.job?.judul_posisi || 'Posisi'}
                    appliedJob={app.job?.judul_posisi}
                    stage="ai_analysis"
                    status="processing"
                    timeInfo={
                      isCurrentPolling
                        ? (pollMessage ? `${pollMessage} (${Math.round(pollProgress)}%)` : `Memproses AI (${Math.round(pollProgress)}%)...`)
                        : "Menunggu Analisis AI"
                    }
                    actionLabel={isCurrentPolling ? `${Math.round(pollProgress)}% Memproses` : "Jalankan Analisis Video"}
                    actionLoading={isCurrentAnalyzing}
                    onActionClick={() => handleAnalyzeVideo(app.id)}
                    onClick={() => openCandidateModal(app)}
                  />
                );
              })}
            </KanbanColumn>

            {/* 5. HUMAN VALIDATION */}
            <KanbanColumn title={t.pipeline?.humanValidation || '5. Validasi HR'} count={humanValidationApps.length}>
              {humanValidationApps.map((app) => {
                const appAi = (app as any).ai_result;
                const parsePct = (val: any) => typeof val === 'string' ? parseFloat(val.replace('%', '')) : (typeof val === 'number' ? val : 0);
                const dynamicVideoScores = appAi?.dimensi_psikologis ? {
                  ability: Math.round(parsePct(appAi.dimensi_psikologis.Ability)),
                  intelligent: Math.round(parsePct(appAi.dimensi_psikologis.Intelligent)),
                  personality: Math.round(parsePct(appAi.dimensi_psikologis.Personality)),
                  attitude: Math.round(parsePct(appAi.dimensi_psikologis.Attitude)),
                  emotionalIntelligence: Math.round(parsePct(appAi.dimensi_psikologis['Emotional Intelligent'])),
                } : undefined;

                const isIntvLanjutan = app.status === 'interview_lanjutan';
                const intv = app.interview_details;

                return (
                  <CandidateCard
                    key={app.id}
                    name={app.pelamar?.nama_lengkap || 'Kandidat'}
                    role={(app as any).cvData?.jobTitle || app.job?.judul_posisi || 'Posisi'}
                    appliedJob={app.job?.judul_posisi}
                    stage="human_validation"
                    status="needs_approval"
                    timeInfo={
                      isIntvLanjutan
                        ? (intv?.tanggal ? `🗓️ ${formatDate(intv.tanggal)}` : 'Wawancara Terjadwal')
                        : 'Menunggu Keputusan'
                    }
                    customActions={
                      isIntvLanjutan ? (
                        <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <Calendar size={10} /> Wawancara Lanjutan
                        </span>
                      ) : undefined
                    }
                    videoScores={dynamicVideoScores}
                    onClick={() => openCandidateModal(app)}
                  />
                );
              })}
            </KanbanColumn>

          </div>
        </div>
      )}

      {/* Candidate Modal Render */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onStatusUpdated={loadApplications}
        />
      )}
    </div>
  );
}
