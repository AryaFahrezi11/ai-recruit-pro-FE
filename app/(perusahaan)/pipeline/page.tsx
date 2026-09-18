'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { KanbanColumn } from '@/components/pipeline/KanbanColumn';
import { CandidateCard, CandidateStage, CandidateStatus } from '@/components/pipeline/CandidateCard';
import { CandidateModal } from '@/components/pipeline/CandidateModal';
import { DataTable, ColumnDef, Pagination } from '@/components/ui/DataTable';
import {
  Filter,
  Loader2,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Eye,
  Video,
  Calendar,
  CheckCircle2,
  XCircle,
  MapPin,
  Briefcase,
  Clock,
  UserCheck,
  CornerDownLeft,
  X,
  RotateCcw,
  GraduationCap
} from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { parseErrorMessage } from '@/lib/api';
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
  pelamar?: any;
  phone?: string;
  companyName?: string;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function PipelineContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const urlJobTitle = searchParams.get('jobTitle') || searchParams.get('job') || '';
  const urlJobId = searchParams.get('jobId') || '';
  const urlStage = searchParams.get('stage') || '';

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

  const [applications, setApplications] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [pollProgress, setPollProgress] = useState<number>(0);
  const [pollMessage, setPollMessage] = useState<string>('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Filter & GET Search States (Default: Validasi HR, atau dari URL)
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [stageFilter, setStageFilter] = useState(urlStage || 'human_validation');
  const [jobFilter, setJobFilter] = useState(urlJobTitle || urlJobId || 'all');

  useEffect(() => {
    if (urlJobTitle) setJobFilter(urlJobTitle);
    else if (urlJobId) setJobFilter(urlJobId);
    if (urlStage) setStageFilter(urlStage);
  }, [urlJobTitle, urlJobId, urlStage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const [appsRes, jobsRes] = await Promise.all([
        fetchAuth('/api/applications/'),
        fetchAuth('/api/jobs/my-jobs')
      ]);
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data.data || []);
      }
      if (jobsRes.ok) {
        const jData = await jobsRes.json();
        setJobsList(jData || []);
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
        throw new Error('Gagal memperbarui Riwayat Lamaran');
      }
      toast.success('Riwayat Lamaran berhasil diperbarui');
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
    else if (s === 'rejected') {
      if (app.analisis_cv?.hasil === 'ditolak' || app.analisis_cv?.hasil === 'tidak_memenuhi_syarat') {
        currentStage = 'cv_screening';
      } else {
        currentStage = 'human_validation';
      }
    }
    else if (s === 'human_validation' || s === 'interview_lanjutan' || s === 'hired') currentStage = 'human_validation';

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
      pelamar: app.pelamar,
      phone: app.pelamar?.no_telepon || (app as any).cvData?.phone || (app as any).cv_document?.phone,
      companyName: app.job?.perusahaan?.nama_perusahaan || app.job?.nama_perusahaan || '',
    });
  };

  // Extract distinct job categories/titles for filter dropdown
  const distinctCategories = useMemo(() => {
    const categorySet = new Set<string>();
    jobsList.forEach(j => {
      if (j.judul_posisi) categorySet.add(j.judul_posisi.trim());
    });
    applications.forEach(a => {
      const catName = a.job?.kategori?.nama_kategori || a.job?.kategori_nama || a.job?.kategori;
      if (catName && typeof catName === 'string' && catName.trim()) {
        categorySet.add(catName.trim());
      } else if (a.job?.judul_posisi) {
        categorySet.add(a.job.judul_posisi.trim());
      }
    });

    const normalizedMap = new Map<string, string>();
    Array.from(categorySet).forEach(cat => {
      const lower = cat.toLowerCase();
      if (!normalizedMap.has(lower)) {
        normalizedMap.set(lower, cat);
      }
    });

    return Array.from(normalizedMap.values()).sort((a, b) => a.localeCompare(b));
  }, [applications, jobsList]);

  // Filtered applications for Table View
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Search via GET submit
      const name = (app.pelamar?.nama_lengkap || '').toLowerCase();
      const job = (app.job?.judul_posisi || '').toLowerCase();
      const uni = (app.pelamar?.institusi_pendidikan || '').toLowerCase();
      const q = activeSearch.toLowerCase().trim();
      const matchSearch = !q || name.includes(q) || job.includes(q) || uni.includes(q);

      // Category / Job Filter
      let matchJob = true;
      if (jobFilter !== 'all') {
        const appCategory = (app.job?.kategori?.nama_kategori || app.job?.kategori_nama || '').toLowerCase();
        const appJobTitle = (app.job?.judul_posisi || '').toLowerCase();
        const appJobId = (app.job?.id || app.job_id || '').toLowerCase();
        const filterLower = jobFilter.toLowerCase();

        matchJob = appCategory.includes(filterLower) || appJobTitle.includes(filterLower) || appJobId === filterLower;
      }

      // Stage Filter (Default: human_validation matches both before & during interview lanjutan)
      let matchStage = true;
      const s = app.status || 'upload_cv';
      if (stageFilter === 'all') matchStage = true;
      else if (stageFilter === 'upload_cv') matchStage = s === 'upload_cv' || s === 'dikirim';
      else if (stageFilter === 'cv_screening') matchStage = s === 'cv_screening' || s === 'lolos_cv' || s === 'ditolak_sistem';
      else if (stageFilter === 'virtual_interview') matchStage = s === 'virtual_interview';
      else if (stageFilter === 'video_analysis') matchStage = s === 'video_analysis';
      else if (stageFilter === 'human_validation') matchStage = s === 'human_validation' || s === 'interview_lanjutan';
      else if (stageFilter === 'interview_lanjutan') matchStage = s === 'interview_lanjutan';
      else if (stageFilter === 'hired') matchStage = s === 'hired' || s === 'accepted';
      else if (stageFilter === 'rejected') matchStage = s === 'rejected' || s === 'ditolak';

      return matchSearch && matchJob && matchStage;
    });
  }, [applications, activeSearch, jobFilter, stageFilter]);

  // Pipeline Kanban stage buckets
  const uploadCvApps = applications.filter(a => a.status === 'upload_cv' || a.status === 'dikirim');
  const screeningApps = applications.filter(a => a.status === 'cv_screening' || a.status === 'lolos_cv' || a.status === 'ditolak_sistem');
  const virtualInterviewApps = applications.filter(a => a.status === 'virtual_interview');
  const videoAnalysisApps = applications.filter(a => a.status === 'video_analysis');
  const humanValidationApps = applications.filter(a => a.status === 'human_validation' || a.status === 'interview_lanjutan');

  // Pagination State for Table & Mobile View
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSearch, stageFilter, jobFilter]);

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, currentPage, pageSize]);

  // Stage Badge Helper
  const renderStageBadge = (app: any) => {
    const s = app.status || 'upload_cv';

    if (s === 'upload_cv' || s === 'dikirim') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Upload CV
        </span>
      );
    }
    if (s === 'cv_screening' || s === 'lolos_cv') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          CV Screening
        </span>
      );
    }
    if (s === 'virtual_interview') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Video size={12} className="text-purple-600 dark:text-purple-400" />
          Wawancara Video
        </span>
      );
    }
    if (s === 'video_analysis') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
          Analisis AI Video
        </span>
      );
    }
    if (s === 'interview_lanjutan') {
      const intv = app.interview_details;
      return (
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700">
            <Calendar size={12} className="text-indigo-600 dark:text-indigo-400" />
            Validasi HR (Wawancara Lanjutan)
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
  };

  // CV Score Badge Helper
  const renderCvScoreBadge = (app: any) => {
    const score = Math.round(app.analisis_cv?.skor_kecocokan || 0);
    const threshold = app.analisis_cv?.threshold_digunakan || app.job?.cv_threshold || 60;
    const isFailedEdu = app.analisis_cv?.kategori === 'tidak_memenuhi_syarat_pendidikan';
    const isPassed = score >= threshold && !isFailedEdu;

    if (score === 0 && !app.analisis_cv) {
      return <span className="text-xs text-muted-foreground">-</span>;
    }

    return (
      <div className="flex flex-col items-center">
        <span className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold border ${isPassed
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
  };

  // Video Score Badge Helper
  const renderVideoScoreBadge = (app: any) => {
    const appAi = (app as any).ai_result;
    const parsePct = (val: any) => typeof val === 'string' ? parseFloat(val.replace('%', '')) : (typeof val === 'number' ? val : 0);

    const rawScore = appAi?.skor_keseluruhan !== undefined && appAi?.skor_keseluruhan !== null
      ? Number(appAi.skor_keseluruhan)
      : (app.video_score !== undefined && app.video_score !== null
          ? Number(app.video_score)
          : (appAi?.dimensi_psikologis
              ? (parsePct(appAi.dimensi_psikologis.Ability) +
                  parsePct(appAi.dimensi_psikologis.Intelligent) +
                  parsePct(appAi.dimensi_psikologis.Personality) +
                  parsePct(appAi.dimensi_psikologis.Attitude) +
                  parsePct(appAi.dimensi_psikologis['Emotional Intelligent'])) / 5
              : null));

    if (rawScore !== null) {
      const displayScore = rawScore % 1 === 0 ? rawScore : rawScore.toFixed(1);
      const kategori = appAi?.kategori_fit || (rawScore >= 80 ? 'Sangat Cocok' : rawScore >= 60 ? 'Cukup' : 'Kurang');
      const isHigh = rawScore >= 80;
      const isMid = rawScore >= 60;

      return (
        <div className="flex flex-col items-center">
          <span className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold border ${
            isHigh
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : isMid
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}>
            {displayScore} / 100
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[120px]" title={kategori}>
            {kategori}
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
  };

  // Columns for DataTable
  const tableColumns: ColumnDef<any>[] = [
    {
      key: 'no',
      header: 'No',
      render: (_, index) => (currentPage - 1) * pageSize + index + 1
    },
    {
      key: 'kandidat',
      header: 'Kandidat',
      className: 'min-w-[220px]',
      render: (app) => {
        const name = app.pelamar?.nama_lengkap || 'Kandidat';
        const edu = (app as any).cv_document?.pendidikan_tertinggi || app.pelamar?.pendidikan_terakhir || 'Pendidikan';
        const uni = app.pelamar?.institusi_pendidikan || '';

        return (
          <div className="flex items-center gap-3">
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
      render: (app) => renderStageBadge(app)
    },
    {
      key: 'cv_score',
      header: 'Skor CV ATS',
      className: 'w-32 text-center',
      headerClassName: 'text-center',
      render: (app) => renderCvScoreBadge(app)
    },
    {
      key: 'video_eval',
      header: 'Evaluasi Video AI',
      className: 'w-36 text-center',
      headerClassName: 'text-center',
      render: (app) => renderVideoScoreBadge(app)
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
    <div className="flex flex-col h-full max-w-full space-y-4 sm:space-y-6 font-sans antialiased pb-12 sm:pb-0">
      {/* Header Area & View Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1 flex items-center gap-2">
            <Briefcase size={22} className="text-primary shrink-0" />
            <span>{t.pipeline?.title || 'Pipeline & Evaluasi Pelamar'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Pantau dan kelola seluruh pelamar masuk, hasil penilaian ATS CV, evaluasi video wawancara AI, dan keputusan akhir.
          </p>
        </div>

        {/* Segmented View Toggle Switcher */}
        <div className="flex items-center p-1 bg-muted/60 border border-border rounded-xl self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            title="Tampilan Tabel / Kartu"
            className={`flex items-center justify-center p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'table'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-primary'
              }`}
          >
            <TableIcon size={16} />
          </button>

          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            title="Kanban Board"
            className={`flex items-center justify-center p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'kanban'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-primary'
              }`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* ==================== VIEW 1: TABLE / MOBILE CARDS VIEW ==================== */}
      {viewMode === 'table' && (
        <div className="space-y-3.5 sm:space-y-4 animate-in fade-in duration-200">
          {/* Filter Bar */}
          <div className="p-3 sm:p-4 bg-card rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3">
            {/* Search Input Form via GET */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 flex-1 w-full">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari pelamar, universitas, posisi..."
                  className="w-full pl-9 pr-8 sm:pr-24 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium shadow-2xs transition-colors"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 sm:right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                    title="Hapus teks"
                  >
                    <X size={13} />
                  </button>
                )}
                <span className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border font-mono items-center gap-0.5 select-none pointer-events-none">
                  <CornerDownLeft size={10} /> Enter
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                title="Cari"
              >
                <Search size={13} />
                <span>Cari</span>
              </button>
            </form>

            {/* Filter by Job Position & Stage Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex items-center gap-2.5 w-full md:w-auto">
              <div className="w-full md:w-56">
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium cursor-pointer"
                >
                  <option value="all">Semua Lowongan</option>
                  {distinctCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  {jobFilter !== 'all' && !distinctCategories.some(c => c.toLowerCase() === jobFilter.toLowerCase()) && (
                    <option value={jobFilter}>{jobFilter}</option>
                  )}
                </select>
              </div>

              <div className="w-full md:w-60">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium cursor-pointer"
                >
                  <option value="all">Semua Tahapan Seleksi</option>
                  <option value="upload_cv">Upload CV</option>
                  <option value="cv_screening">CV Screening AI</option>
                  <option value="virtual_interview">Wawancara Video</option>
                  <option value="video_analysis">Analisis AI Video</option>
                  <option value="human_validation">Validasi HR</option>
                  <option value="interview_lanjutan">Wawancara Lanjutan</option>
                  <option value="hired">Diterima (Hired)</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(activeSearch || jobFilter !== 'all' || stageFilter !== 'human_validation') && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs px-3.5 py-2.5 bg-muted/30 border border-border rounded-xl text-muted-foreground gap-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                  <Filter size={12} className="text-primary" />
                  Filter Aktif:
                </span>
                {activeSearch && (
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Pencarian: &ldquo;{activeSearch}&rdquo;
                    <button type="button" onClick={handleClearSearch} className="hover:text-blue-900 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}
                {jobFilter !== 'all' && (
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-bold text-[11px] border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                    Kategori: {jobFilter}
                    <button type="button" onClick={() => setJobFilter('all')} className="hover:text-purple-900 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}
                {stageFilter !== 'human_validation' && (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-[11px] border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    Tahap: {stageFilter === 'all' ? 'Semua Tahapan' : stageFilter}
                    <button type="button" onClick={() => setStageFilter('human_validation')} className="hover:text-amber-900 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  handleClearSearch();
                  setJobFilter('all');
                  setStageFilter('human_validation');
                }}
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <RotateCcw size={11} />
                Reset Filter
              </button>
            </div>
          )}

          {/* Desktop Table Container (Hidden on mobile screens < 768px) */}
          <div className="hidden md:block">
            <DataTable
              data={filteredApplications}
              columns={tableColumns}
              isLoading={loading}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              emptyMessage={
                activeSearch
                  ? `Tidak ada pelamar yang cocok dengan kata kunci "${activeSearch}" pada filter yang dipilih.`
                  : "Tidak ada pelamar pada tahapan filter yang dipilih saat ini."
              }
              onRowClick={(item) => openCandidateModal(item)}
            />
          </div>

          {/* Mobile Candidate Cards (Visible on screens < 768px) */}
          <div className="block md:hidden space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted"></div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted/60 rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="h-12 bg-muted/30 rounded-xl"></div>
                    <div className="h-10 bg-muted/50 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-8 bg-card border border-border rounded-2xl text-center space-y-2 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-1">
                  <UserCheck size={24} />
                </div>
                <p className="font-bold text-sm text-foreground">
                  {activeSearch
                    ? `Tidak ada pelamar dengan "${activeSearch}"`
                    : "Tidak ada pelamar pada filter saat ini"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Coba sesuaikan kata kunci pencarian atau ganti filter tahapan seleksi.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedApplications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-card border border-border/90 rounded-2xl p-4 shadow-xs hover:border-primary/40 active:scale-[0.99] transition-all space-y-3 relative overflow-hidden cursor-pointer"
                    onClick={() => openCandidateModal(app)}
                  >
                    {/* Top Row: Avatar + Name & Email + Stage Badge */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                          {(app.pelamar?.nama_lengkap || 'K').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-foreground truncate leading-tight">
                            {app.pelamar?.nama_lengkap || 'Kandidat'}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {app.pelamar?.email || '-'}
                          </p>
                        </div>
                      </div>

                      {/* Stage Badge */}
                      <div className="shrink-0">
                        {renderStageBadge(app)}
                      </div>
                    </div>

                    {/* Job Position & Education */}
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-foreground truncate">
                          {app.job?.judul_posisi || '-'}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDate(app.applied_at)}
                        </span>
                      </div>
                      {(app.pelamar?.institusi_pendidikan || (app as any).cvData?.education?.[0]?.school) && (
                        <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                          <GraduationCap size={12} className="shrink-0" />
                          <span>{app.pelamar?.institusi_pendidikan || (app as any).cvData?.education?.[0]?.school}</span>
                        </p>
                      )}
                    </div>

                    {/* AI Scores Grid */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 bg-muted/20 border border-border/50 rounded-xl">
                        <span className="text-[10px] text-muted-foreground block font-medium">Skor CV ATS</span>
                        <div className="mt-0.5">{renderCvScoreBadge(app)}</div>
                      </div>
                      <div className="p-2 bg-muted/20 border border-border/50 rounded-xl">
                        <span className="text-[10px] text-muted-foreground block font-medium">Wawancara Video</span>
                        <div className="mt-0.5">{renderVideoScoreBadge(app)}</div>
                      </div>
                    </div>

                    {/* Card Action Button */}
                    <div className="pt-1 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openCandidateModal(app)}
                        className="w-full py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                      >
                        <Eye size={14} />
                        <span>Buka Lembar Evaluasi & Detail</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Mobile Pagination */}
                {filteredApplications.length > pageSize && (
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredApplications.length}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== VIEW 2: KANBAN BOARD VIEW ==================== */}
      {viewMode === 'kanban' && (
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar animate-in fade-in duration-200">
          <div className="flex gap-6 items-start min-w-max h-full">

            {/* 1. UPLOAD CV */}
            <KanbanColumn stageKey="upload_cv" title={t.pipeline?.uploadCV || '1. Upload CV'} count={uploadCvApps.length}>
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
            <KanbanColumn stageKey="cv_screening" title={t.pipeline?.cvScreening || '2. CV Screening'} count={screeningApps.length}>
              {screeningApps.map((app) => {
                const cvScore = Math.round(app.analisis_cv?.skor_kecocokan || 0);
                const threshold = app.analisis_cv?.threshold_digunakan || app.job?.cv_threshold || 60;
                const isAiProcessed = cvScore > 0 || app.analisis_cv;
                const isFailedEdu = app.analisis_cv?.kategori === 'tidak_memenuhi_syarat_pendidikan';
                const isPassed = cvScore >= threshold && !isFailedEdu;

                const actionButtons = isAiProcessed ? (
                  <div className="flex items-center gap-1">
                    {isPassed ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'virtual_interview'); }}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-[10px] flex items-center gap-0.5 shadow-2xs cursor-pointer active:scale-95"
                      >
                        Loloskan
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'virtual_interview'); }}
                          className="px-2 py-0.5 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-md text-[10px] flex items-center gap-0.5 border border-border cursor-pointer active:scale-95"
                        >
                          Override
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'ditolak_sistem'); }}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md text-[10px] flex items-center gap-0.5 shadow-2xs cursor-pointer active:scale-95"
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
            <KanbanColumn stageKey="interview" title={t.pipeline?.virtualInterview || '3. Virtual Interview'} count={virtualInterviewApps.length}>
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
            <KanbanColumn stageKey="ai_analysis" title={t.pipeline?.videoAnalysis || '4. Analisis AI Video'} count={videoAnalysisApps.length}>
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
                    status={isCurrentAnalyzing ? 'processing' : 'video_uploaded'}
                    progressBar={isCurrentPolling}
                    progressText={pollMessage || 'Memproses Analisis AI...'}
                    progressPercent={pollProgress}
                    timeInfo={
                      isCurrentPolling
                        ? (pollMessage ? pollMessage : 'Sedang Memproses AI...')
                        : (app.video_url ? 'Video Siap Dianalisis' : 'Menunggu Video')
                    }
                    actionLabel={isCurrentAnalyzing ? undefined : "Jalankan Analisis Video"}
                    actionLoading={false}
                    onActionClick={() => handleAnalyzeVideo(app.id)}
                    onClick={() => openCandidateModal(app)}
                  />
                );
              })}
            </KanbanColumn>

            {/* 5. HUMAN VALIDATION */}
            <KanbanColumn stageKey="human_validation" title={t.pipeline?.humanValidation || '5. Validasi HR'} count={humanValidationApps.length}>
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
                    overallVideoScore={appAi?.skor_keseluruhan !== undefined && appAi?.skor_keseluruhan !== null ? Number(appAi.skor_keseluruhan) : (app.video_score !== undefined && app.video_score !== null ? Number(app.video_score) : undefined)}
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

export default function PipelinePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Memuat Pipeline...</div>}>
      <PipelineContent />
    </Suspense>
  );
}
