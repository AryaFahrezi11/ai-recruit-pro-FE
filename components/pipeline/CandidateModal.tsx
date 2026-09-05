'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';
import {
  X, Play, CheckCircle2, XCircle,
  Check, Lightbulb, FileText, Video, BarChart3,
  Upload, Brain, UserCheck, Scan, Download, ExternalLink,
  Clock, AlertCircle, Sparkles, Briefcase, Mail, Phone, Lock, Archive, GraduationCap, Building2, ArrowRight,
  HelpCircle, Calendar, Send, Edit3, Copy, MapPin
} from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { ParseSkills } from '@/components/ui/ParseSkills';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CandidateModalProps {
  candidate: {
    id?: string;
    applicationId?: string;
    name: string;
    role: string;
    education?: string;
    university?: string;
    stage?: 'upload_cv' | 'cv_screening' | 'interview' | 'ai_analysis' | 'human_validation' | string;
    status?: 'pending' | 'processing' | 'video_uploaded' | 'awaiting_video' | 'needs_approval' | 'interview_lanjutan' | 'hired' | 'rejected' | string;
    cvScore?: number;
    videoUploaded?: boolean;
    videoScores?: {
      ability: number;
      intelligent: number;
      personality: number;
      attitude: number;
      emotionalIntelligence: number;
    };
    aiResult?: any;
    videoUrl?: string;
    cvData?: any;
    cvDocument?: any;
    jobData?: any;
    analisisCv?: any;
    isPolling?: boolean;
    pollProgress?: number;
    pollMessage?: string;
    interviewDetails?: any;
    catatanPerusahaan?: string;
  };
  onClose: () => void;
  onStatusUpdated?: () => void;
}

const STAGE_ORDER = ['upload_cv', 'cv_screening', 'interview', 'ai_analysis', 'human_validation'];

function formatDateIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// Step Indicator Component
function StepIndicator({ currentStage, isInterviewLanjutan, t }: { currentStage?: string; isInterviewLanjutan?: boolean; t: ReturnType<typeof import('@/hooks/useTranslation').useTranslation>['t'] }) {
  const steps = [
    { key: 'upload_cv', label: t.modal.stepUploadCV, icon: <Upload size={13} /> },
    { key: 'cv_screening', label: t.modal.stepCVScreening, icon: <FileText size={13} /> },
    { key: 'interview', label: t.modal.stepInterview, icon: <Video size={13} /> },
    { key: 'ai_analysis', label: t.modal.stepAIAnalysis, icon: <Brain size={13} /> },
    { 
      key: 'human_validation', 
      label: isInterviewLanjutan ? `${t.modal.stepValidation || 'Validasi HR'} (Wawancara)` : (t.modal.stepValidation || 'Validasi HR'), 
      icon: <UserCheck size={13} /> 
    },
  ];

  const currentIndex = steps.findIndex(s => s.key === currentStage);

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-muted/20 border-b border-border/80 overflow-x-auto no-scrollbar gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${isCompleted
                ? 'bg-emerald-500 text-white'
                : isActive
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-sm'
                  : 'bg-muted text-muted-foreground border border-border/40'
                }`}>
                {isCompleted ? <Check size={13} strokeWidth={2.5} /> : step.icon}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap hidden sm:inline ${
                isActive ? 'text-primary font-semibold' : isPending ? 'text-muted-foreground/60' : 'text-foreground'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 min-w-3 h-0.5 mx-1.5 sm:mx-3 rounded-full transition-all ${
                isCompleted ? 'bg-emerald-500' : 'bg-border/60'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function CandidateModal({ candidate, onClose, onStatusUpdated }: CandidateModalProps) {
  const [decisionModal, setDecisionModal] = useState<'none' | 'interview_user' | 'reject' | 'hire'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isInterviewLanjutan = candidate.status === 'interview_lanjutan' || !!candidate.interviewDetails;
  const interviewData = candidate.interviewDetails;

  // Wawancara Lanjutan form
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const [intvType, setIntvType] = useState<'online' | 'offline'>(interviewData?.tipe || 'online');
  const [intvDate, setIntvDate] = useState<string>(interviewData?.tanggal || getDefaultDate());
  const [intvTime, setIntvTime] = useState(interviewData?.waktu || '14:00');
  const [intvLocationUrl, setIntvLocationUrl] = useState(interviewData?.lokasi_atau_link || 'https://meet.google.com/');
  const [intvNotes, setIntvNotes] = useState(interviewData?.catatan || 'Mohon hadir tepat waktu dan siapkan resume portofolio.');

  useEffect(() => {
    if (candidate.interviewDetails) {
      setIntvType(candidate.interviewDetails.tipe || 'online');
      setIntvDate(candidate.interviewDetails.tanggal || getDefaultDate());
      setIntvTime(candidate.interviewDetails.waktu || '14:00');
      setIntvLocationUrl(candidate.interviewDetails.lokasi_atau_link || 'https://meet.google.com/');
      setIntvNotes(candidate.interviewDetails.catatan || 'Mohon hadir tepat waktu dan siapkan resume portofolio.');
    }
  }, [candidate.interviewDetails]);

  // Tolak form
  const [rejectReasonPreset, setRejectReasonPreset] = useState('Kualifikasi pengalaman teknis belum memenuhi kriteria minimum yang dibutuhkan saat ini.');
  const [rejectReasonCustom, setRejectReasonCustom] = useState('');

  // Terima form
  const [hireOfferingNotes, setHireOfferingNotes] = useState('Selamat! Kandidat dinyatakan lolos seluruh tahapan seleksi dan menerima penawaran kerja.');

  const targetAppId = candidate.id || candidate.applicationId;

  const executeDecision = async (newStatus: string, bodyPayload: any) => {
    if (!targetAppId) {
      toast.error('ID Lamaran tidak ditemukan');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchAuth(`/api/applications/${targetAppId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...bodyPayload
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Gagal memperbarui status kandidat');
      }

      setDecisionModal('none');
      setArchiveStatus(newStatus as any);
      toast.success(
        newStatus === 'interview_lanjutan'
          ? 'Undangan wawancara lanjutan & email notifikasi berhasil dikirimkan!'
          : newStatus === 'hired'
          ? 'Kandidat berhasil diterima (Hired)! Email selamat telah dikirimkan.'
          : 'Lamaran kandidat berhasil ditolak dan dipindahkan ke Arsip.'
      );

      onStatusUpdated?.();

      setTimeout(() => {
        onClose();
        if (newStatus === 'hired' || newStatus === 'rejected') {
          router.push('/archive');
        }
      }, 1500);

    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses keputusan');
    } finally {
      setIsSubmitting(false);
    }
  };
  const { t } = useTranslation();
  const router = useRouter();
  const stage = candidate.stage || 'upload_cv';
  const stageIndex = STAGE_ORDER.indexOf(stage);
  const threshold = candidate.analisisCv?.threshold_digunakan ?? candidate.jobData?.cv_threshold ?? 60;

  // Archive feedback banner state
  const [archiveStatus, setArchiveStatus] = useState<'idle' | 'hired' | 'rejected' | 'interview_lanjutan'>('idle');

  // Determine initial active tab based on stage
  const getInitialTab = (stg: string) => {
    switch (stg) {
      case 'upload_cv': return 'upload';
      case 'cv_screening': return 'cv_analysis';
      case 'interview': return 'interview_status';
      case 'ai_analysis': return 'video_analysis';
      case 'human_validation': return 'full_validation';
      default: return 'upload';
    }
  };

  const [showCvDetail, setShowCvDetail] = useState(false);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(getInitialTab(stage));

  useEffect(() => {
    setActiveTab(getInitialTab(stage));
  }, [stage]);

  const parsePercent = (val: any) => {
    if (typeof val === 'string') return parseFloat(val.replace('%', ''));
    if (typeof val === 'number') return val;
    return 0;
  };
  const aiResult = candidate.aiResult;
  const isVideoUploaded = (candidate.videoUploaded !== undefined
    ? candidate.videoUploaded
    : (candidate.status === 'video_uploaded' || candidate.name.includes('David'))) || !!candidate.videoUrl;
  const isVideoAnalysisCompleted = stageIndex >= 4 || candidate.stage === 'human_validation' || !!(aiResult && (aiResult.status === 'SUKSES' || aiResult.skor_keseluruhan !== undefined));

  // Extract individual psychological scores from real AI result
  const abilityScore = aiResult?.dimensi_psikologis?.Ability ? parsePercent(aiResult.dimensi_psikologis.Ability) : (candidate.videoScores?.ability || 85);
  const intelligentScore = aiResult?.dimensi_psikologis?.Intelligent ? parsePercent(aiResult.dimensi_psikologis.Intelligent) : (candidate.videoScores?.intelligent || 92);
  const personalityScore = aiResult?.dimensi_psikologis?.Personality ? parsePercent(aiResult.dimensi_psikologis.Personality) : (candidate.videoScores?.personality || 78);
  const attitudeScore = aiResult?.dimensi_psikologis?.Attitude ? parsePercent(aiResult.dimensi_psikologis.Attitude) : (candidate.videoScores?.attitude || 88);
  const emotionalIntelligenceScore = aiResult?.dimensi_psikologis?.['Emotional Intelligent'] ? parsePercent(aiResult.dimensi_psikologis['Emotional Intelligent']) : (candidate.videoScores?.emotionalIntelligence || 60);

  // Overall Score (Rata-rata 5 Dimensi atau dari skor_keseluruhan AI)
  const overallVideoScore = aiResult?.skor_keseluruhan !== undefined
    ? Number(aiResult.skor_keseluruhan).toFixed(1)
    : ((abilityScore + intelligentScore + personalityScore + attitudeScore + emotionalIntelligenceScore) / 5).toFixed(1);

  // Video Duration formatted
  const videoDurationDisplay = aiResult?.durasi_formatted || aiResult?.durasi_teks || "00:00";

  // Daftar pertanyaan wawancara dari lowongan pekerjaan yang dilamar
  const candidateQuestions: string[] = (() => {
    const raw =
      candidate.jobData?.video_questions ||
      candidate.jobData?.video_questions_json;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((q: any) => (typeof q === 'string' ? q.trim() : '')).filter((q: string) => q.length > 0);
    }
    if (typeof raw === 'string' && raw.trim().length > 0) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((q: any) => (typeof q === 'string' ? q.trim() : '')).filter((q: string) => q.length > 0);
        }
      } catch {
        return raw.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean);
      }
    }
    return [];
  })();

  // Radar Chart data (Istilah umum kompetensi kerja)
  const radarData = [
    { subject: 'Komunikasi', A: abilityScore, fullMark: 100 },
    { subject: 'Pemahaman', A: intelligentScore, fullMark: 100 },
    { subject: 'Percaya Diri', A: personalityScore, fullMark: 100 },
    { subject: 'Sikap Kerja', A: attitudeScore, fullMark: 100 },
    { subject: 'Ketenangan', A: emotionalIntelligenceScore, fullMark: 100 },
  ];

  // Observasi Sikap & Bahasa Tubuh (Gabungan kualitatif deskriptif + persentase konsistensi)
  const eyeContactVal = aiResult?.parameter_analisis?.kontak_mata !== undefined ? Math.round(aiResult.parameter_analisis.kontak_mata) : 90;
  const postureVal = aiResult?.parameter_analisis?.gerakan_badan !== undefined ? Math.round(aiResult.parameter_analisis.gerakan_badan) : 85;
  const speechVal = aiResult?.parameter_analisis?.word_per_second_percent !== undefined ? Math.round(aiResult.parameter_analisis.word_per_second_percent) : 82;
  const gestureVal = aiResult?.parameter_analisis?.gerakan_tangan !== undefined ? Math.round(aiResult.parameter_analisis.gerakan_tangan) : 78;
  const headVal = aiResult?.parameter_analisis?.gerakan_kepala !== undefined ? Math.round(aiResult.parameter_analisis.gerakan_kepala) : 72;

  const videoObservations = [
    {
      label: 'Fokus & Kontak Mata',
      statusText: eyeContactVal >= 75 ? 'Sangat Terfokus ke Kamera' : eyeContactVal >= 50 ? 'Cukup Fokus & Interaktif' : 'Kurang Menatap Kamera',
      value: eyeContactVal,
      badgeColor: eyeContactVal >= 70 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dotColor: eyeContactVal >= 70 ? 'bg-emerald-500' : 'bg-blue-500'
    },
    {
      label: 'Kerapian & Postur Duduk',
      statusText: postureVal >= 75 ? 'Tegap & Sangat Stabil' : postureVal >= 50 ? 'Cukup Tenang & Wajar' : 'Banyak Pergerakan Duduk',
      value: postureVal,
      badgeColor: postureVal >= 70 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dotColor: postureVal >= 70 ? 'bg-emerald-500' : 'bg-blue-500'
    },
    {
      label: 'Kelancaran & Kecepatan Bicara',
      statusText: speechVal >= 70 ? 'Lancar & Teratur' : speechVal >= 50 ? 'Tempo Wajar & Cukup Jelas' : 'Tempo Kurang Teratur',
      value: speechVal,
      badgeColor: speechVal >= 70 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dotColor: speechVal >= 70 ? 'bg-emerald-500' : 'bg-blue-500'
    },
    {
      label: 'Gestur Tangan & Keaktifan',
      statusText: gestureVal >= 60 ? 'Alami & Mendukung Penjelasan' : gestureVal >= 30 ? 'Cukup Wajar' : 'Minim Gestur Tangan',
      value: gestureVal,
      badgeColor: gestureVal >= 60 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dotColor: gestureVal >= 60 ? 'bg-emerald-500' : 'bg-blue-500'
    },
    {
      label: 'Respon Wajah & Anggukan',
      statusText: headVal >= 60 ? 'Responsif & Ekspresif' : headVal >= 40 ? 'Tenang & Terkendali' : 'Cenderung Kaku',
      value: headVal,
      badgeColor: headVal >= 60 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dotColor: headVal >= 60 ? 'bg-emerald-500' : 'bg-blue-500'
    },
  ];

  // Handle Decision (Hire / Reject / Interview Lanjutan) -> Move to Archive
  const handleDecision = (outcome: 'hired' | 'rejected' | 'interview_lanjutan') => {
    setArchiveStatus(outcome);
    setTimeout(() => {
      onClose();
      if (outcome === 'hired' || outcome === 'rejected') {
        router.push('/archive');
      } else {
        toast.success('Undangan wawancara langsung berhasil dijadwalkan!');
      }
    }, 1800);
  };

  // Define tabs with required min stage index
  const modalTabs = [
    { id: 'upload', label: t.modal.detailPelamar, icon: <Upload size={14} />, minStageIndex: 0 },
    { id: 'cv_analysis', label: t.modal.cvAnalysis, icon: <FileText size={14} />, minStageIndex: 1 },
    { id: 'interview_status', label: t.modal.statusVideoWawancara, icon: <Video size={14} />, minStageIndex: 2 },
    { id: 'video_analysis', label: t.modal.videoAnalysis, icon: <BarChart3 size={14} />, minStageIndex: 3 },
    { 
      id: 'full_validation', 
      label: t.modal.humanValidation || 'Validasi HR', 
      badge: isInterviewLanjutan ? 'Wawancara' : undefined,
      icon: <UserCheck size={14} />, 
      minStageIndex: 4 
    },
  ];

  const safeEmailName = (candidate.name || 'candidate').toLowerCase().replaceAll(' ', '.');
  const safeFileName = (candidate.name || 'candidate').replaceAll(' ', '_');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-card text-card-foreground w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Archive Feedback Overlay Banner */}
        {archiveStatus !== 'idle' && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              archiveStatus === 'hired'
                ? 'bg-emerald-500/10 text-emerald-500'
                : archiveStatus === 'interview_lanjutan'
                ? 'bg-indigo-500/10 text-indigo-500'
                : 'bg-rose-500/10 text-rose-500'
            }`}>
              {archiveStatus === 'hired' && <CheckCircle2 size={36} />}
              {archiveStatus === 'rejected' && <XCircle size={36} />}
              {archiveStatus === 'interview_lanjutan' && <Video size={36} />}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              {archiveStatus === 'hired' && 'Kandidat Diterima'}
              {archiveStatus === 'rejected' && 'Lamaran Ditolak'}
              {archiveStatus === 'interview_lanjutan' && 'Wawancara Langsung Dijadwalkan'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
              {archiveStatus === 'interview_lanjutan' ? (
                <span>Undangan wawancara langsung telah disiapkan untuk kandidat...</span>
              ) : (
                <>
                  <Archive size={16} />
                  {t.modal.dipindahkanArchive}
                </>
              )}
            </p>
            <div className="w-48 bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-primary animate-pulse w-full"></div>
            </div>
          </div>
        )}

        {/* Flowchart Step Indicator */}
        <StepIndicator currentStage={stage} isInterviewLanjutan={isInterviewLanjutan} t={t} />

        {/* Header Navigation Tabs — ONLY allow previous & current stage tabs */}
        <div className="flex items-center justify-between px-6 border-b border-border bg-card/60 backdrop-blur-xs gap-4">
          <div className="flex-1 min-w-0 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar -mb-px">
            {modalTabs.map((tab) => {
              const isAccessible = stageIndex >= tab.minStageIndex || (tab.id === 'full_validation' && (stageIndex >= 4 || isVideoAnalysisCompleted));

              if (!isAccessible) {
                return (
                  <div
                    key={tab.id}
                    className="flex items-center gap-1.5 px-3 py-3.5 text-xs font-medium text-muted-foreground/40 cursor-not-allowed opacity-50 select-none whitespace-nowrap shrink-0"
                    title={t.modal.tahapBelumDicapai}
                  >
                    <Lock size={12} />
                    <span>{tab.label}</span>
                  </div>
                );
              }

              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-2.5 sm:px-3 py-3.5 font-semibold text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                      isActive 
                        ? 'bg-primary/15 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="shrink-0 p-1.5 -mr-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/50 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">

          {/* ==================== TAB 1: UPLOAD CV (Tahap 1) ==================== */}
          {activeTab === 'upload' && (
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* Candidate Info Header */}
              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row justify-between gap-4 sm:gap-4 items-start">
                <div className="flex gap-3 sm:gap-4 items-start sm:items-center w-full sm:w-auto">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl sm:text-2xl border border-blue-200 dark:border-blue-800">
                    {candidate.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">{candidate.name}</h2>
                    <p className="text-xs sm:text-sm font-medium text-primary flex items-center gap-1.5 mt-0.5">
                      <Briefcase size={14} className="shrink-0" />
                      <span className="truncate">{candidate.role}</span>
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="flex items-center gap-1 font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/60 px-2 py-0.5 rounded w-max"><GraduationCap size={13} /> <span className="truncate max-w-[120px] sm:max-w-[200px]">{candidate.university || candidate.cvData?.education?.[0]?.school || 'Pendidikan Tidak Tersedia'}</span></span>
                      <span className="flex items-center gap-1 w-max"><Mail size={12} className="shrink-0" /> <span className="truncate max-w-[150px] sm:max-w-none">{candidate.cvData?.email || 'email_tidak_tersedia@contoh.com'}</span></span>
                      <span className="flex items-center gap-1 w-max"><Phone size={12} className="shrink-0" /> {candidate.cvData?.phone || 'Nomor tidak tersedia'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-border">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Baru Saja</span>
                </div>
              </div>

              {/* Uploaded Document Card */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                {/* Job Details Card */}
                {candidate.jobData && (
                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm mb-6 mt-4">
                    <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                      <Briefcase size={18} className="text-primary" />
                      Detail Lowongan yang Dilamar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Posisi</p>
                        <p className="text-sm font-semibold text-foreground">{candidate.jobData.judul_posisi || '-'}</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Tipe Pekerjaan</p>
                        <p className="text-sm font-semibold text-foreground capitalize">
                          {candidate.jobData.tipe_pekerjaan ? candidate.jobData.tipe_pekerjaan.replace('_', ' ') : '-'}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Lokasi</p>
                        <p className="text-sm font-semibold text-foreground capitalize">
                          {candidate.jobData.lokasi_kerja === 'remote' ? 'Remote (WFH)' : candidate.jobData.lokasi_kerja === 'hybrid' ? 'Hybrid' : 'On-site'}
                          {candidate.jobData.kota ? ` - ${candidate.jobData.kota}` : ''}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Kualifikasi Min.</p>
                        <p className="text-sm font-semibold text-foreground">
                          {candidate.jobData.pendidikan_min || 'Umum'} 
                          {candidate.jobData.pengalaman_min_tahun > 0 ? ` (${candidate.jobData.pengalaman_min_tahun} Tahun)` : ''}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Departemen</p>
                        <p className="text-sm font-semibold text-foreground">{candidate.jobData.department || 'Umum'}</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Batas Minimal AI (CV)</p>
                        <p className="text-sm font-semibold text-amber-600">{candidate.jobData.cv_threshold}% Kecocokan</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Kata Kunci (AI)</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {candidate.jobData.ai_keywords && candidate.jobData.ai_keywords.length > 0 ? (
                            candidate.jobData.ai_keywords.slice(0, 3).map((kw: string, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] rounded font-medium truncate max-w-[80px]">
                                {kw}
                              </span>
                            ))
                          ) : '-'}
                          {candidate.jobData.ai_keywords && candidate.jobData.ai_keywords.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] rounded font-medium">
                              +{candidate.jobData.ai_keywords.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Periode Lowongan</p>
                        <p className="text-sm font-semibold text-foreground">
                          {candidate.jobData.tanggal_buka && candidate.jobData.tanggal_tutup ? 
                            `${new Date(candidate.jobData.tanggal_buka).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} - ${new Date(candidate.jobData.tanggal_tutup).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}` : '-'}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Rentang Gaji</p>
                        <p className="text-sm font-semibold text-foreground">
                          {candidate.jobData.tampilkan_gaji && candidate.jobData.gaji_min && candidate.jobData.gaji_max 
                            ? `Rp ${(candidate.jobData.gaji_min / 1000000).toFixed(0)}Jt - Rp ${(candidate.jobData.gaji_max / 1000000).toFixed(0)}Jt` 
                            : 'Dirahasiakan'}
                        </p>
                      </div>
                    </div>

                    {/* Collapsible Detailed Job Info */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <button 
                        onClick={() => setShowJobDetail(!showJobDetail)}
                        className="w-full flex items-center justify-between text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        Lihat Deskripsi Pekerjaan Lengkap
                        {showJobDetail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {showJobDetail && (
                        <div className="mt-4 space-y-4 text-sm animate-in slide-in-from-top-2 border-t border-border/50 pt-4">
                          {candidate.jobData.deskripsi_pekerjaan && candidate.jobData.deskripsi_pekerjaan.length > 0 && (
                            <div>
                              <h4 className="font-bold text-foreground mb-1">Deskripsi Pekerjaan</h4>
                              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                {candidate.jobData.deskripsi_pekerjaan.map((desc: string, i: number) => (
                                  <li key={i}>{desc}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {candidate.jobData.tanggung_jawab && candidate.jobData.tanggung_jawab.length > 0 && (
                            <div>
                              <h4 className="font-bold text-foreground mb-1">Tanggung Jawab Utama</h4>
                              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                {candidate.jobData.tanggung_jawab.map((resp: string, i: number) => (
                                  <li key={i}>{resp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {candidate.jobData.kualifikasi && candidate.jobData.kualifikasi.length > 0 && (
                            <div>
                              <h4 className="font-bold text-foreground mb-1">Kualifikasi yang Dibutuhkan</h4>
                              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                {candidate.jobData.kualifikasi.map((req: string, i: number) => (
                                  <li key={i}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {candidate.jobData.benefits && candidate.jobData.benefits.length > 0 && (
                            <div>
                              <h4 className="font-bold text-foreground mb-1">Benefit & Keuntungan</h4>
                              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                {candidate.jobData.benefits.map((benefit: string, i: number) => (
                                  <li key={i}>{benefit}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {candidate.jobData.ai_keywords && candidate.jobData.ai_keywords.length > 0 && (
                            <div>
                              <h4 className="font-bold text-foreground mb-1 flex items-center gap-2"><Sparkles size={14} className="text-amber-500" /> Kriteria Syarat Utama</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {candidate.jobData.ai_keywords.map((kw: string, i: number) => (
                                  <span key={i} className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-800 rounded font-medium">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Candidate Extracted ATS CV Preview */}
                {candidate.cvData ? (
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-foreground mb-4">Pratinjau CV Terstruktur (ATS)</h4>
                    <div className="bg-white p-8 sm:p-10 rounded-lg border border-slate-300 shadow-sm text-slate-800 space-y-6 font-serif overflow-hidden">
                      {/* ATS Header */}
                      <div className="border-b-2 border-slate-800 pb-4 space-y-1 text-center font-sans">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                          {candidate.cvData.fullName || <span className="text-slate-400 font-bold tracking-wider">NAMA PELAMAR</span>}
                        </h2>
                        {candidate.cvData.jobTitle ? (
                          <span className="text-sm font-bold text-[#1b7b9e] block">{candidate.cvData.jobTitle}</span>
                        ) : (
                          <span className="text-xs italic text-slate-400 block font-normal">[Judul Posisi / Peran]</span>
                        )}
                        <div className="text-[11px] text-slate-600 flex items-center justify-center flex-wrap gap-2 pt-1 font-medium">
                          <span>{candidate.cvData.email || <span className="text-slate-400">email@contoh.com</span>}</span> •{' '}
                          <span>{candidate.cvData.phone || <span className="text-slate-400">0812xxxxxxxx</span>}</span> •{' '}
                          <span>{candidate.cvData.location || <span className="text-slate-400">Kota Domisili</span>}</span>
                          {candidate.cvData.linkedinUrl ? (
                            <> • <span className="font-bold text-[#1b7b9e]">LinkedIn: {candidate.cvData.linkedinUrl}</span></>
                          ) : (
                            <span className="text-slate-400 italic"> • LinkedIn</span>
                          )}
                          {candidate.cvData.portfolioUrl && <> • <span className="font-bold text-[#1b7b9e]">Portofolio: {candidate.cvData.portfolioUrl}</span></>}
                          {candidate.cvData.socialLinks && candidate.cvData.socialLinks.length > 0 &&
                            candidate.cvData.socialLinks.map((link: any, idx: number) => (
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
                        <p className="text-xs text-slate-700 leading-relaxed font-sans text-justify whitespace-pre-line">
                          {candidate.cvData.summary || (
                            <span className="text-slate-400 italic">
                              Ringkasan profesional kandidat tidak tersedia.
                            </span>
                          )}
                        </p>
                      </div>

                      {/* ATS Experience */}
                      <div className="space-y-3 font-sans">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                          PENGALAMAN KERJA
                        </h3>
                        {candidate.cvData.experiences && candidate.cvData.experiences.length > 0 && candidate.cvData.experiences.some((exp: any) => exp.company || exp.role || exp.description) ? (
                          candidate.cvData.experiences.map((exp: any, idx: number) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                                <span>
                                  {exp.role || '[Posisi]'} — {exp.company || '[Perusahaan]'}
                                </span>
                                <span className="text-[11px] text-slate-500 font-semibold">{exp.period}</span>
                              </div>
                              {exp.description && (
                                <p className="text-xs text-slate-600 leading-normal pl-3 border-l-2 border-slate-200 text-justify whitespace-pre-line">
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
                              • Deskripsi tanggung jawab dan pencapaian belum diisi.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* ATS Education */}
                      <div className="space-y-3 font-sans">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                          PENDIDIKAN
                        </h3>
                        {candidate.cvData.education && candidate.cvData.education.length > 0 && candidate.cvData.education.some((edu: any) => edu.school || edu.institution || edu.degree) ? (
                          candidate.cvData.education.map((edu: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-baseline text-xs text-slate-900">
                              <span className="font-bold">
                                {edu.degree || '[Gelar]'} — {edu.school || edu.institution || '[Institusi]'} {edu.gpa ? `(${edu.gpa})` : ''}
                              </span>
                              <span className="text-[11px] text-slate-500 font-semibold">{edu.period}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex justify-between items-baseline text-xs text-slate-400 italic">
                            <span>[Tingkat Gelar] — [Nama Institusi] (IPK)</span>
                            <span className="text-[11px]">[Periode Belajar]</span>
                          </div>
                        )}
                      </div>

                      {/* ATS Skills & Certifications */}
                      <div className="space-y-3 font-sans pb-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                          KEAHLIAN TEKNIS & SERTIFIKASI
                        </h3>
                        <div className="space-y-2 text-xs">
                          <div className="text-slate-700">
                            <span className="font-bold text-slate-900 block mb-1">Keahlian:</span>
                            <ParseSkills skillsStr={candidate.cvData.skills} fallbackText="Tidak ada keahlian yang ditambahkan." />
                          </div>
                          {candidate.cvData.certifications && candidate.cvData.certifications.length > 0 && candidate.cvData.certifications.some((cert: any) => cert.name) && (
                            <div className="text-slate-700">
                              <span className="font-bold text-slate-900 block mb-1">Sertifikasi:</span>
                              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                                {candidate.cvData.certifications.map((cert: any, idx: number) => (
                                  <li key={idx}>
                                    {cert.name}{' '}
                                    {cert.credentialUrl && (
                                      <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-[#1b7b9e] hover:underline font-bold ml-1">
                                        [Lihat Kredensial]
                                      </a>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-muted/20 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1">{t.modal.pendidikanTerakhir}</p>
                      <p className="text-sm font-semibold text-foreground">{t.modal.pendidikanDemo}</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1">{t.modal.pengalamanKerja}</p>
                      <p className="text-sm font-semibold text-foreground">{t.modal.pengalamanDemo}</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1">{t.modal.keahlianUtama}</p>
                      <p className="text-sm font-semibold text-foreground">{t.modal.keahlianDemo}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==================== TAB 2: CV SCREENING (Tahap 2) ==================== */}
          {activeTab === 'cv_analysis' && stageIndex >= 1 && (
            <div className="max-w-4xl mx-auto py-2 animate-in fade-in duration-300 space-y-6">
              <div className="pb-2 border-b border-border">
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <FileText className="text-primary" size={22} />
                  {t.modal.hasilAnalisisCV}
                </h2>
              </div>

              {/* Main Score Card */}
              {(() => {
                const isFailedEducation = candidate.analisisCv?.kategori === 'tidak_memenuhi_syarat_pendidikan';
                const isPassed = (candidate.cvScore || 0) >= threshold && !isFailedEducation;

                return (
                  <>
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row items-center gap-6">
                      <div className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-md ${isPassed
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                        : 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20'
                        }`}>
                        <span className="text-3xl font-extrabold tracking-tight">{candidate.cvScore || 0}%</span>
                        <span className="text-[11px] font-semibold opacity-90 tracking-wide mt-0.5">Kecocokan</span>
                      </div>

                      <div className="flex-1 text-center sm:text-left space-y-2.5">
                        <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isPassed
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}>
                            {isPassed ? <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" /> : <XCircle size={14} className="text-rose-600 dark:text-rose-400" />}
                            {isFailedEducation
                              ? "Tidak Memenuhi Syarat Pendidikan Minimal"
                              : isPassed 
                                ? `Memenuhi Standar Kelulusan (≥ ${threshold}%)`
                                : `Di Bawah Standar Kelulusan (< ${threshold}%)`}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-foreground">
                          {isFailedEducation
                            ? "Kualifikasi Pendidikan Belum Memenuhi Ketentuan"
                            : isPassed ? t.modal.kecocokanTinggi : t.modal.kecocokanRendah}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {isFailedEducation ? (
                            <>
                              Pendidikan terakhir kandidat (<strong>{candidate.cvDocument?.pendidikan_tertinggi || candidate.education || 'Tidak tercantum'}</strong>) belum memenuhi syarat minimal yang ditentukan perusahaan (<strong>{candidate.jobData?.pendidikan_min || 'Sesuai Ketentuan'}</strong>).
                            </>
                          ) : isPassed ? (
                            <>
                              Profil, pengalaman kerja, dan keahlian kandidat dinilai <strong>cocok ({candidate.cvScore || 0}%)</strong> dengan kriteria lowongan dan telah melampaui batas minimal kelulusan (<strong>{threshold}%</strong>).
                            </>
                          ) : (
                            <>
                              Tingkat kecocokan profil kandidat saat ini sebesar <strong>{candidate.cvScore || 0}%</strong>, belum mencapai batas nilai minimal yang ditetapkan perusahaan yaitu <strong>{threshold}%</strong>.
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar vs Threshold */}
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-foreground">Tingkat Kecocokan dengan Kriteria Posisi</span>
                        <span className={`font-bold text-sm ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {candidate.cvScore || 0}% Match
                        </span>
                      </div>
                      <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(100, Math.max(0, candidate.cvScore || 0))}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-muted-foreground font-medium pt-0.5">
                        <span>0% (Sangat Rendah)</span>
                        <span className="font-semibold text-foreground flex items-center gap-1.5 bg-muted/60 px-2.5 py-0.5 rounded-md border border-border">
                          <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                          Batas Minimal Kelulusan: <strong className="text-primary">{threshold}%</strong>
                        </span>
                        <span>100% (Sangat Cocok)</span>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Detail Evaluasi */}
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
                <div>
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    Rincian Penilaian Kualifikasi
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Sistem mengevaluasi profil kandidat secara transparan berdasarkan 2 komponen utama:
                  </p>
                </div>

                {candidate.analisisCv?.hybrid_details ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Aspek 1: Kesesuaian Pengalaman Kerja */}
                    <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-border/80 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Briefcase size={14} className="text-primary shrink-0" />
                            Kesesuaian Pengalaman Kerja
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            Porsi 60%
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Mengukur relevansi riwayat karier, deskripsi tugas, dan tanggung jawab kandidat sebelumnya terhadap kebutuhan posisi yang dilamar.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-border/60 flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">Nilai Relevansi:</span>
                        <span className="text-base font-extrabold text-foreground">
                          {candidate.analisisCv.hybrid_details.sbert_score}%
                        </span>
                      </div>
                    </div>

                    {/* Aspek 2: Pemenuhan Keahlian Wajib */}
                    <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-border/80 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            Pemenuhan Keahlian Wajib
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Porsi 40%
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Memeriksa langsung penguasaan keahlian dan keterampilan utama yang disyaratkan dalam kriteria lowongan pekerjaan.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between flex-wrap gap-1">
                        <span className="text-[11px] text-muted-foreground">
                          Memenuhi <strong>{candidate.analisisCv.hybrid_details.keywords_found}</strong> dari <strong>{candidate.analisisCv.hybrid_details.keywords_total}</strong> keahlian wajib
                        </span>
                        <span className="text-base font-extrabold text-foreground">
                          {candidate.analisisCv.hybrid_details.keyword_score}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/30 p-4 rounded-xl border border-border text-xs text-muted-foreground leading-relaxed">
                    Sistem membandingkan dokumen CV kandidat dengan uraian kualifikasi pekerjaan. Tingkat kesesuaian keseluruhan kandidat adalah <strong>{candidate.cvScore || 0}%</strong> terhadap batas ambang kelulusan <strong>{threshold}%</strong>.
                  </div>
                )}
              </div>

              {/* Action Bar for CV Screening / Tahap Awal */}
              {(stage === 'cv_screening' || stage === 'upload_cv') && (
                <div className="p-4 bg-muted/30 border border-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                  <div className="text-xs text-muted-foreground font-medium">
                    Loloskan kandidat ini untuk melanjutkan ke tahap <strong className="text-foreground">Wawancara Video AI</strong>.
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setDecisionModal('reject')}
                      className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors cursor-pointer"
                    >
                      Tolak Lamaran
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => executeDecision('virtual_interview', {})}
                      className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      <Video size={14} />
                      Loloskan & Kirim Undangan Wawancara Video
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 3: VIRTUAL INTERVIEW (Tahap 3) ==================== */}
          {activeTab === 'interview_status' && stageIndex >= 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">

              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <Video size={20} className="text-primary" />
                      Status Pengunggahan Video Wawancara
                    </h3>
                  </div>
                </div>

                {/* If Video IS Uploaded */}
                {isVideoUploaded ? (
                  <div className="p-6 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 size={32} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-base text-foreground">Video Wawancara Telah Diunggah</h4>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            Sudah Upload
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Kandidat telah menyelesaikan perekaman dan mengunggah video wawancara virtual sesuai instruksi. Rekaman video telah berhasil disimpan di sistem dan siap untuk dievaluasi pada tahap selanjutnya.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* If Video IS NOT Uploaded Yet */
                  <div className="p-6 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                        <Clock size={32} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-base text-foreground">Menunggu Video Wawancara</h4>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                            Menunggu
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Tautan wawancara virtual telah dikirimkan ke email kandidat ({candidate.cvData?.email || 'email kandidat'}). Sistem sedang menunggu kandidat menyelesaikan sesi rekaman wawancara.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Daftar Pertanyaan Wawancara Posisi Ini */}
              {candidateQuestions.length > 0 && (
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <HelpCircle size={17} className="text-primary" />
                      <span>Pertanyaan Wawancara untuk Posisi Ini</span>
                    </h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {candidateQuestions.length} Pertanyaan
                    </span>
                  </div>
                  <div className="space-y-2 pt-1">
                    {candidateQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/60 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          {idx + 1}
                        </span>
                        <p className="font-medium text-foreground leading-relaxed">
                          {q}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== TAB 4: AI VIDEO ANALYSIS (Tahap 4) ==================== */}
          {activeTab === 'video_analysis' && stageIndex >= 3 && (
            <div className="max-w-5xl mx-auto py-2 animate-in fade-in duration-300 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Status Analisis Video</h2>
              </div>

              {/* KONDISI 1: SUDAH SELESAI */}
              {isVideoAnalysisCompleted ? (
                <div className="p-6 sm:p-8 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 size={32} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-foreground">Analisis Video Selesai</h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                          Sudah Selesai
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Sistem telah selesai mengevaluasi rekaman wawancara kandidat ini. Seluruh ringkasan kompetensi, grafik penilaian, video wawancara, dan opsi keputusan pelamar dapat Anda lihat secara lengkap pada tahap Validasi HR.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-start">
                    <button
                      onClick={() => setActiveTab('full_validation')}
                      className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm rounded-lg transition-all flex items-center gap-2 shadow-sm active:scale-95"
                    >
                      <span>Lihat Hasil Lengkap di Validasi HR</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : candidate.isPolling ? (
                /* KONDISI 2: SEDANG DI-SCREENING */
                <div className="p-8 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-primary shrink-0">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-foreground">Sedang Melakukan Evaluasi Wawancara</h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                          Sedang di-Screening
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Sistem sedang mengevaluasi respon jawaban, gaya berbicara, dan ketenangan kandidat. Proses ini berjalan secara otomatis.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${candidate.pollProgress || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold px-1">
                      <span className="text-muted-foreground text-[11px] truncate max-w-[80%]">
                        {candidate.pollMessage || "Sedang memproses rekaman..."}
                      </span>
                      <span className="text-primary font-bold">{Math.round(candidate.pollProgress || 0)}%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-card/80 border border-border/80 rounded-lg text-xs text-muted-foreground">
                    💡 <strong>Info:</strong> Anda dapat menutup jendela ini dan melanjutkan pekerjaan lain. Penilaian tetap berjalan di latar belakang dan status akan otomatis diperbarui setelah selesai.
                  </div>
                </div>
              ) : isVideoUploaded ? (
                /* KONDISI 3: DALAM ANTREAN */
                <div className="p-8 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                      <Clock size={32} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-foreground">Video Siap Dievaluasi</h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          Dalam Antrean
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Rekaman wawancara telah diterima dan siap untuk dievaluasi. Untuk memulai proses evaluasi kandidat ini, silakan tekan tombol <strong>"Jalankan Analisis Video"</strong> pada daftar pelamar di halaman utama.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-amber-200/60 dark:border-amber-800/40 text-xs">
                    <div className="bg-card/80 p-3 rounded-lg border border-border/80">
                      <span className="text-muted-foreground block text-[11px]">Status Saat Ini</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">Menunggu Antrean Analisis</span>
                    </div>
                    <div className="bg-card/80 p-3 rounded-lg border border-border/80">
                      <span className="text-muted-foreground block text-[11px]">Durasi Video</span>
                      <span className="font-semibold text-foreground">{videoDurationDisplay}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* KONDISI 4: BELUM ADA VIDEO */
                <div className="p-8 bg-muted/40 border border-border rounded-xl text-center space-y-3">
                  <AlertCircle className="mx-auto text-muted-foreground" size={36} />
                  <h4 className="font-bold text-base text-foreground">Belum Ada Rekaman Video</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Kandidat belum mengunggah rekaman video wawancara. Analisis akan siap setelah video selesai diunggah.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 5: HUMAN VALIDATION (Tahap 5 - ALL COMBINED & DECISION) ==================== */}
          {activeTab === 'full_validation' && stageIndex >= 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">

              <div>
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <UserCheck size={22} className="text-primary" />
                  {isInterviewLanjutan ? '5. Validasi HR (Wawancara Lanjutan)' : (t.modal.semuaHasilAI || '5. Validasi HR & Keputusan')}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isInterviewLanjutan 
                    ? 'Kandidat sedang dalam tahap wawancara lanjutan bersama HR/User. Tinjau detail pelaksanaan dan tentukan keputusan kelulusan akhir.'
                    : 'Evaluasi menyeluruh berkas CV, hasil wawancara AI, dan tentukan langkah seleksi berikutnya.'}
                </p>
              </div>

              {/* Alert Callout jika Sedang Wawancara Lanjutan */}
              {isInterviewLanjutan && (
                <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200">
                          Tahap 5: Validasi HR (Wawancara Lanjutan)
                        </h4>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-200 text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                          🗓️ Jadwal Aktif
                        </span>
                      </div>
                      <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80 mt-1">
                        Kandidat telah dijadwalkan wawancara pada <strong>{formatDateIndo(interviewData?.tanggal)} • {interviewData?.waktu || '-'} WIB</strong> ({interviewData?.tipe === 'offline' ? 'Tatap Muka di Kantor' : 'Online via Google Meet'}).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setDecisionModal('hire')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      Terima (Hired)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionModal('reject')}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <XCircle size={14} />
                      Tolak
                    </button>
                  </div>
                </div>
              )}

              {/* Overview Summary Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Kesesuaian Berkas CV</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{candidate.cvScore || 0}% Cocok</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">✓ Memenuhi Standar Kualifikasi</span>
                  </div>
                  <FileText className="text-emerald-500" size={28} />
                </div>

                <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Skor Evaluasi Wawancara</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{overallVideoScore} / 100</p>
                    <span className="text-[10px] text-blue-600 font-semibold">{aiResult?.kategori_fit || 'Hasil Analisis AI'}</span>
                  </div>
                  <BarChart3 className="text-blue-500" size={28} />
                </div>

                <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Rekaman Wawancara</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{videoDurationDisplay}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      ✓ {candidate.aiResult?.kualitas_teks || 'Kualitas Audio & Video Jelas'}
                    </span>
                  </div>
                  <Video className="text-violet-500" size={28} />
                </div>
              </div>

              {/* Banner Rangkuman & Kategori Fit (dari Analisis Video) */}
              {aiResult && (
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 mt-0.5">
                    <Sparkles size={20} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-primary">
                        {aiResult.kategori_fit || 'Kandidat Memenuhi Kriteria'}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                        Rekomendasi Evaluasi
                      </span>
                    </div>
                    <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-line">
                      {aiResult.ringkasan_jawaban || "Kandidat menunjukkan profil kompetensi yang solid dan memenuhi kriteria awal posisi ini."}
                    </p>
                  </div>
                </div>
              )}

              {/* Combined Grid: Kolom Kiri (Video & Observasi Sikap) & Kolom Kanan (Radar, Aspek Kompetensi & Keputusan) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Side: Video Player, Info Rekaman & 5 Parameter Observasi */}
                <div className="space-y-4">
                  {/* Kartu Video Wawancara & Detail Rekaman */}
                  <div className="p-4 bg-card rounded-xl border border-border shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <Video size={16} className="text-primary" />
                        <span>Rekaman Video Wawancara</span>
                      </h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {videoDurationDisplay}
                      </span>
                    </div>

                    {/* Mini Video */}
                    <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-video border border-border">
                      {candidate.videoUrl ? (
                        <video controls src={candidate.videoUrl} className="w-full h-full object-contain bg-black" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                          <Video size={36} className="mb-2 opacity-50" />
                          <p className="text-xs">Video wawancara tidak tersedia</p>
                        </div>
                      )}
                    </div>

                    {/* Evaluasi & Rangkuman Jawaban Tiap Soal Wawancara */}
                    {candidateQuestions.length > 0 && (
                      <div className="pt-3 border-t border-border/70 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <HelpCircle size={14} className="text-primary" />
                            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                              Evaluasi & Rangkuman Tiap Soal
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {candidate.aiResult?.status_jawaban_teks || `${candidateQuestions.length} Pertanyaan`}
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          {candidateQuestions.map((q, idx) => {
                            const detail = (candidate.aiResult?.analisis_pertanyaan || []).find(
                              (p: any) => p.nomor === idx + 1 || (p.pertanyaan && p.pertanyaan.toLowerCase().trim() === q.toLowerCase().trim())
                            );
                            const status = detail?.status || (candidate.aiResult ? "Terjawab" : "Menunggu Evaluasi");
                            const isAnswered = status === "Terjawab";
                            const isPartial = status === "Terjawab Sebagian";
                            const isUnanswered = status === "Tidak Terjawab";

                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border text-xs transition-all ${
                                  isAnswered
                                    ? "bg-card border-border/80 hover:border-emerald-500/40"
                                    : isPartial
                                    ? "bg-amber-500/5 border-amber-500/30"
                                    : isUnanswered
                                    ? "bg-rose-500/5 border-rose-500/30"
                                    : "bg-muted/30 border-border/50"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 flex-1">
                                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                      {idx + 1}
                                    </span>
                                    <span className="text-foreground font-semibold leading-relaxed">
                                      {q}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {detail?.skor_relevansi !== undefined && detail.skor_relevansi > 0 && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                        {detail.skor_relevansi}% Relevan
                                      </span>
                                    )}
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                        isAnswered
                                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                                          : isPartial
                                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400"
                                          : isUnanswered
                                          ? "bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400"
                                          : "bg-muted text-muted-foreground border-border"
                                      }`}
                                    >
                                      {isAnswered ? (
                                        <>
                                          <CheckCircle2 size={11} />
                                          <span>Terjawab</span>
                                        </>
                                      ) : isPartial ? (
                                        <>
                                          <AlertCircle size={11} />
                                          <span>Terjawab Sebagian</span>
                                        </>
                                      ) : isUnanswered ? (
                                        <>
                                          <XCircle size={11} />
                                          <span>Tidak Terjawab</span>
                                        </>
                                      ) : (
                                        status
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {/* Ringkasan Jawaban AI untuk soal ini */}
                                {detail?.ringkasan && (
                                  <div className="mt-2.5 pt-2 border-t border-border/50 space-y-1.5">
                                    <div className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                                      <Sparkles size={11} />
                                      <span>Rangkuman Jawaban Kandidat:</span>
                                    </div>
                                    <p className="text-[11px] text-foreground/85 leading-relaxed bg-muted/40 p-2.5 rounded-md border border-border/40">
                                      {detail.ringkasan}
                                    </p>
                                    {detail.kutipan && (
                                      <div className="text-[10px] text-muted-foreground italic leading-relaxed pl-1 pt-0.5">
                                        &ldquo;{detail.kutipan}&rdquo;
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Side: Radar Chart, 5 Aspek Kompetensi & Decision Buttons */}
                <div className="space-y-4">
                  {/* Observasi Perilaku & Gaya Komunikasi */}
                  <div className="p-4 bg-card rounded-xl border border-border shadow-sm space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <Scan size={16} className="text-primary" />
                        <span>Observasi Sikap & Bahasa Tubuh Rekaman</span>
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Catatan pengamatan fisik rekaman video yang menjadi dasar pertimbangan nilai kompetensi.
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      {videoObservations.map((item, index) => (
                        <div key={index} className="p-2.5 bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg border border-border/70 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold text-foreground block truncate">
                              {item.label}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                              <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`} />
                              {item.statusText}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${item.badgeColor}`}>
                            {item.value}% Konsisten
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evaluasi Kompetensi & Keputusan HR (Gabungan Radar Chart & Bar) */}
                  <div className="p-5 bg-card rounded-xl border border-border shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <BarChart3 size={16} className="text-primary" />
                        Hasil Evaluasi Kompetensi
                      </h3>
                      <span className="text-xs font-bold text-primary px-2.5 py-1 bg-primary/10 rounded-md">
                        Rata-rata: {overallVideoScore}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
                      {/* Radar Chart */}
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="currentColor" className="text-border" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10 }} className="text-muted-foreground" />
                            <Radar name="Candidate" dataKey="A" stroke="#1b7b9e" fill="#1b7b9e" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Read-Only Competency Bars */}
                      <div className="space-y-3.5">
                        {[
                          { label: 'Komunikasi & Artikulasi', score: Math.round(abilityScore), color: 'bg-blue-600' },
                          { label: 'Pemahaman & Respon', score: Math.round(intelligentScore), color: 'bg-indigo-600' },
                          { label: 'Kepercayaan Diri', score: Math.round(personalityScore), color: 'bg-amber-600' },
                          { label: 'Sikap Kerja & Profesionalisme', score: Math.round(attitudeScore), color: 'bg-emerald-600' },
                          { label: 'Ketenangan & Emosi', score: Math.round(emotionalIntelligenceScore), color: 'bg-cyan-600' },
                        ].map((item, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-medium text-foreground">{item.label}</span>
                              <span className="font-bold text-primary">{item.score} / 100</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                                style={{ width: `${item.score}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Keputusan Akhir HR & Detail Wawancara Lanjutan */}
                    <div className="space-y-3 pt-4 border-t border-border/70">
                      {isInterviewLanjutan ? (
                        /* DETAIL KHUSUS: WAWANCARA LANJUTAN TERJADWAL */
                        <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                <Calendar size={14} />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
                                  Validasi HR: Detail Wawancara Lanjutan
                                </h4>
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                  Menunggu Pelaksanaan Sesi Wawancara
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (interviewData) {
                                  setIntvType(interviewData.tipe || 'online');
                                  setIntvDate(interviewData.tanggal || getDefaultDate());
                                  setIntvTime(interviewData.waktu || '14:00');
                                  setIntvLocationUrl(interviewData.lokasi_atau_link || '');
                                  setIntvNotes(interviewData.catatan || '');
                                }
                                setDecisionModal('interview_user');
                              }}
                              className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                            >
                              <Edit3 size={11} /> Ubah Jadwal
                            </button>
                          </div>

                          {/* Detail Info Card */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-900 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/60 shadow-2xs">
                            <div>
                              <span className="text-[10px] text-muted-foreground block font-medium">Jadwal Pelaksanaan:</span>
                              <span className="font-bold text-foreground flex items-center gap-1 mt-0.5 text-[11px]">
                                <Clock size={12} className="text-indigo-600" />
                                {formatDateIndo(interviewData?.tanggal)} • {interviewData?.waktu || '-'} WIB
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground block font-medium">Metode Pertemuan:</span>
                              <span className="font-bold text-foreground flex items-center gap-1 mt-0.5 text-[11px]">
                                {interviewData?.tipe === 'offline' ? (
                                  <>🏢 Tatap Muka di Kantor</>
                                ) : (
                                  <>🌐 Online (Google Meet / Zoom)</>
                                )}
                              </span>
                            </div>
                            <div className="sm:col-span-2 pt-1 border-t border-border/40">
                              <span className="text-[10px] text-muted-foreground block font-medium">
                                {interviewData?.tipe === 'offline' ? 'Lokasi / Ruangan Kantor:' : 'Tautan Ruang Meeting:'}
                              </span>
                              {interviewData?.tipe === 'offline' ? (
                                <span className="font-medium text-foreground block text-xs mt-0.5">
                                  {interviewData?.lokasi_atau_link || '-'}
                                </span>
                              ) : (
                                <div className="flex items-center gap-2 mt-0.5">
                                  <a
                                    href={interviewData?.lokasi_atau_link || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-xs truncate max-w-xs"
                                  >
                                    <ExternalLink size={12} />
                                    {interviewData?.lokasi_atau_link || 'https://meet.google.com'}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (interviewData?.lokasi_atau_link) {
                                        navigator.clipboard.writeText(interviewData.lokasi_atau_link);
                                        toast.success('Tautan Google Meet disalin!');
                                      }
                                    }}
                                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-muted hover:bg-muted/80 text-foreground cursor-pointer border border-border flex items-center gap-1"
                                  >
                                    <Copy size={10} /> Salin
                                  </button>
                                </div>
                              )}
                            </div>
                            {interviewData?.catatan && (
                              <div className="sm:col-span-2 pt-1 border-t border-border/40">
                                <span className="text-[10px] text-muted-foreground block font-medium">Catatan / Arahan Tim HR:</span>
                                <p className="text-[11px] text-muted-foreground mt-0.5 italic">
                                  "{interviewData.catatan}"
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Tombol Keputusan Terima / Tolak setelah wawancara lanjutan */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wider block">
                              Keputusan Akhir Hasil Wawancara Lanjutan:
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setDecisionModal('hire')}
                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                              >
                                <CheckCircle2 size={15} />
                                Terima Kandidat (Hired)
                              </button>
                              <button
                                type="button"
                                onClick={() => setDecisionModal('reject')}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                              >
                                <XCircle size={15} />
                                Tolak Lamaran
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Standar: Belum Dijadwalkan Wawancara Lanjutan */
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Keputusan Akhir HR
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setDecisionModal('hire')}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                            >
                              <CheckCircle2 size={16} />
                              Terima Kandidat
                            </button>
                            <button
                              type="button"
                              onClick={() => setDecisionModal('reject')}
                              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                            >
                              <XCircle size={16} />
                              Tolak Lamaran
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDecisionModal('interview_user')}
                            className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-98 shadow-2xs cursor-pointer"
                          >
                            <Calendar size={15} />
                            Jadwalkan Wawancara Lanjutan (User / Tatap Muka)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}


        {/* ================= MODAL: WAWANCARA LANJUTAN ================= */}
        {decisionModal === 'interview_user' && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <Calendar className="text-indigo-600 dark:text-indigo-400" size={18} />
                  Jadwalkan Wawancara Lanjutan
                </h3>
                <button 
                  type="button"
                  onClick={() => setDecisionModal('none')}
                  className="text-muted-foreground hover:text-foreground text-xs font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Kandidat <strong>{candidate.name}</strong> akan menerima email undangan resmi dan informasi jadwal akan tampil di portal status pelamar miliknya.
              </p>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-foreground mb-1.5">Tipe Wawancara</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIntvType('online');
                        setIntvLocationUrl('https://meet.google.com/');
                      }}
                      className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        intvType === 'online' 
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300' 
                          : 'bg-muted/40 border-border text-muted-foreground'
                      }`}
                    >
                      🌐 Online (Google Meet / Zoom)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIntvType('offline');
                        setIntvLocationUrl('Kantor Pusat Perusahaan, Lantai 3 Ruang Meeting A');
                      }}
                      className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        intvType === 'offline' 
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300' 
                          : 'bg-muted/40 border-border text-muted-foreground'
                      }`}
                    >
                      🏢 Tatap Muka (Offline di Kantor)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1.5">Tanggal Wawancara</label>
                    <input
                      type="date"
                      value={intvDate}
                      onChange={(e) => setIntvDate(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1.5">Jam Waktu (WIB)</label>
                    <input
                      type="time"
                      value={intvTime}
                      onChange={(e) => setIntvTime(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    {intvType === 'online' ? 'Tautan Meeting (Google Meet / Zoom)' : 'Alamat & Ruangan Pertemuan'}
                  </label>
                  <input
                    type="text"
                    value={intvLocationUrl}
                    onChange={(e) => setIntvLocationUrl(e.target.value)}
                    placeholder={intvType === 'online' ? 'https://meet.google.com/xyz-abcd-efg' : 'Jl. Sudirman No. 12, Lantai 3 Ruang A'}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">Instruksi Tambahan untuk Pelamar</label>
                  <textarea
                    rows={2}
                    value={intvNotes}
                    onChange={(e) => setIntvNotes(e.target.value)}
                    className="w-full p-2.5 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setDecisionModal('none')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    if (!intvDate) {
                      toast.error('Silakan tentukan tanggal wawancara terlebih dahulu');
                      return;
                    }
                    executeDecision('interview_lanjutan', {
                      interview_details: {
                        tipe: intvType,
                        tanggal: intvDate,
                        waktu: intvTime,
                        lokasi_atau_link: intvLocationUrl,
                        catatan: intvNotes
                      },
                      catatan_perusahaan: intvNotes
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mengirim Undangan...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Kirim Undangan Wawancara</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: TOLAK LAMARAN ================= */}
        {decisionModal === 'reject' && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <XCircle className="text-rose-600" size={18} />
                  Konfirmasi Penolakan Lamaran
                </h3>
                <button 
                  type="button"
                  onClick={() => setDecisionModal('none')}
                  className="text-muted-foreground hover:text-foreground text-xs font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Lamaran <strong>{candidate.name}</strong> akan ditolak dan dipindahkan ke halaman Arsip. Alasan penolakan di bawah akan ditampilkan ke pelamar dan dikirimkan via email sebagai feedback transparan.
              </p>

              <div className="space-y-3 text-xs">
                <label className="block font-bold text-foreground">Pilih Alasan Umum Penolakan:</label>
                <div className="space-y-1.5">
                  {[
                    'Kualifikasi pengalaman teknis belum memenuhi kriteria minimum yang dibutuhkan saat ini.',
                    'Hasil evaluasi skor wawancara belum mencapai passing grade kelulusan posisi ini.',
                    'Kuota penerimaan lowongan untuk posisi ini telah terpenuhi.',
                    'Kandidat lain memiliki kecocokan latar belakang proyek yang lebih spesifik.'
                  ].map((reasonText) => (
                    <button
                      type="button"
                      key={reasonText}
                      onClick={() => setRejectReasonPreset(reasonText)}
                      className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                        rejectReasonPreset === reasonText
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-800 dark:text-rose-200 font-bold'
                          : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      • {reasonText}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">Catatan Tambahan Khusus (Opsional):</label>
                  <textarea
                    rows={2}
                    value={rejectReasonCustom}
                    onChange={(e) => setRejectReasonCustom(e.target.value)}
                    placeholder="Tambahkan catatan khusus untuk kandidat jika diperlukan..."
                    className="w-full p-2.5 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-rose-500/20 outline-none resize-none font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setDecisionModal('none')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    const finalReason = rejectReasonCustom.trim() 
                      ? `${rejectReasonPreset} Catatan: ${rejectReasonCustom.trim()}`
                      : rejectReasonPreset;
                    executeDecision('rejected', { catatan_perusahaan: finalReason });
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Tolak & Kirim Email'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: TERIMA KANDIDAT ================= */}
        {decisionModal === 'hire' && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-600" size={18} />
                  Konfirmasi Penerimaan Kandidat (Hired)
                </h3>
                <button 
                  type="button"
                  onClick={() => setDecisionModal('none')}
                  className="text-muted-foreground hover:text-foreground text-xs font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Selamat! Anda akan menerima <strong>{candidate.name}</strong> untuk posisi <strong>{candidate.role}</strong>. Status lamaran akan berubah menjadi <strong>Hired</strong> dan email penawaran akan dikirimkan.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-foreground mb-1.5">Pesan Penawaran / Instruksi Onboarding:</label>
                  <textarea
                    rows={3}
                    value={hireOfferingNotes}
                    onChange={(e) => setHireOfferingNotes(e.target.value)}
                    className="w-full p-2.5 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setDecisionModal('none')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => executeDecision('hired', { catatan_perusahaan: hireOfferingNotes })}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Terima & Kirim Offering'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
