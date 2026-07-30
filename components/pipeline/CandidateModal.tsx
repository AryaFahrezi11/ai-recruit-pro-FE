'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  X, Play, CheckCircle2, XCircle,
  Check, Lightbulb, FileText, Video, BarChart3,
  Upload, Brain, UserCheck, Scan, Download, ExternalLink,
  Clock, AlertCircle, Sparkles, Briefcase, Mail, Phone, Lock, Archive, GraduationCap, Building2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';

interface CandidateModalProps {
  candidate: { 
    name: string; 
    role: string;
    education?: string;
    university?: string;
    stage?: 'upload_cv' | 'cv_screening' | 'interview' | 'ai_analysis' | 'human_validation' | string;
    status?: 'pending' | 'processing' | 'video_uploaded' | 'awaiting_video' | 'needs_approval' | string;
    cvScore?: number;
    videoUploaded?: boolean;
    videoScores?: {
      ability: number;
      intelligent: number;
      personality: number;
      attitude: number;
      emotionalIntelligence: number;
    };
  };
  onClose: () => void;
}

const STAGE_ORDER = ['upload_cv', 'cv_screening', 'interview', 'ai_analysis', 'human_validation'];

// Step Indicator Component
function StepIndicator({ currentStage, t }: { currentStage?: string; t: ReturnType<typeof import('@/hooks/useTranslation').useTranslation>['t'] }) {
  const steps = [
    { key: 'upload_cv', label: t.modal.stepUploadCV, icon: <Upload size={14} /> },
    { key: 'cv_screening', label: t.modal.stepCVScreening, icon: <FileText size={14} /> },
    { key: 'interview', label: t.modal.stepInterview, icon: <Video size={14} /> },
    { key: 'ai_analysis', label: t.modal.stepAIAnalysis, icon: <Brain size={14} /> },
    { key: 'human_validation', label: t.modal.stepValidation, icon: <UserCheck size={14} /> },
  ];

  const currentIndex = steps.findIndex(s => s.key === currentStage);

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isCompleted 
                  ? 'bg-emerald-500 text-white' 
                  : isActive 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? <Check size={14} /> : step.icon}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${
                isActive ? 'text-primary font-semibold' : isPending ? 'text-muted-foreground opacity-60' : 'text-foreground'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                isCompleted ? 'bg-emerald-500' : 'bg-muted'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function CandidateModal({ candidate, onClose }: CandidateModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const stage = candidate.stage || 'upload_cv';
  const stageIndex = STAGE_ORDER.indexOf(stage);

  // Archive feedback banner state
  const [archiveStatus, setArchiveStatus] = useState<'idle' | 'hired' | 'rejected'>('idle');

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

  const [activeTab, setActiveTab] = useState<string>(getInitialTab(stage));

  useEffect(() => {
    setActiveTab(getInitialTab(stage));
  }, [stage]);

  const isVideoUploaded = candidate.videoUploaded !== undefined 
    ? candidate.videoUploaded 
    : (candidate.status === 'video_uploaded' || candidate.name.includes('David'));

  // Radar Chart data
  const radarData = [
    { subject: t.modal.ability, A: candidate.videoScores?.ability || 85, fullMark: 100 },
    { subject: t.modal.intelligent, A: candidate.videoScores?.intelligent || 92, fullMark: 100 },
    { subject: t.modal.personality, A: candidate.videoScores?.personality || 78, fullMark: 100 },
    { subject: t.modal.attitude, A: candidate.videoScores?.attitude || 88, fullMark: 100 },
    { subject: t.modal.emotionalIntelligence, A: candidate.videoScores?.emotionalIntelligence || 80, fullMark: 100 },
  ];

  // Video analysis parameters
  const videoParams = [
    { label: t.modal.gerakanTangan, value: 78, color: 'bg-blue-500' },
    { label: t.modal.gerakanBadan, value: 85, color: 'bg-violet-500' },
    { label: t.modal.gerakanKepala, value: 72, color: 'bg-amber-500' },
    { label: t.modal.interaksiMata, value: 90, color: 'bg-emerald-500' },
    { label: t.modal.wordPerSecond, value: 82, color: 'bg-cyan-500' },
  ];

  // Handle Decision (Hire / Reject) -> Move to Archive
  const handleDecision = (outcome: 'hired' | 'rejected') => {
    setArchiveStatus(outcome);
    setTimeout(() => {
      onClose();
      router.push('/archive');
    }, 1800);
  };

  // Define tabs with required min stage index
  const modalTabs = [
    { id: 'upload', label: t.modal.detailPelamar, icon: <Upload size={15} />, minStageIndex: 0 },
    { id: 'cv_analysis', label: t.modal.cvAnalysis, icon: <FileText size={15} />, minStageIndex: 1 },
    { id: 'interview_status', label: t.modal.statusVideoWawancara, icon: <Video size={15} />, minStageIndex: 2 },
    { id: 'video_analysis', label: t.modal.videoAnalysis, icon: <BarChart3 size={15} />, minStageIndex: 3 },
    { id: 'full_validation', label: t.modal.humanValidation, icon: <UserCheck size={15} />, minStageIndex: 4 },
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
              archiveStatus === 'hired' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {archiveStatus === 'hired' ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              {archiveStatus === 'hired' ? t.modal.kandidatDiterima : t.modal.kandidatDitolak}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
              <Archive size={16} />
              {t.modal.dipindahkanArchive}
            </p>
            <div className="w-48 bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-primary animate-pulse w-full"></div>
            </div>
          </div>
        )}

        {/* Flowchart Step Indicator */}
        <StepIndicator currentStage={stage} t={t} />

        {/* Header Navigation Tabs — ONLY allow previous & current stage tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto custom-scrollbar">
            {modalTabs.map((tab) => {
              const isAccessible = stageIndex >= tab.minStageIndex;

              if (!isAccessible) {
                return (
                  <div 
                    key={tab.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground/40 cursor-not-allowed opacity-50 select-none whitespace-nowrap"
                    title={t.modal.tahapBelumDicapai}
                  >
                    <Lock size={12} />
                    <span>{tab.label}</span>
                  </div>
                );
              }

              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 -mb-[17px] font-semibold text-xs sm:text-sm transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ml-4"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
          
          {/* ==================== TAB 1: UPLOAD CV (Tahap 1) ==================== */}
          {activeTab === 'upload' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Candidate Info Header */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row justify-between gap-4 items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-2xl border border-blue-200 dark:border-blue-800">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{candidate.name}</h2>
                    <p className="text-sm font-medium text-primary flex items-center gap-1.5 mt-0.5">
                      <Briefcase size={14} />
                      {candidate.role}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/60 px-2 py-0.5 rounded"><GraduationCap size={13} /> {candidate.university || 'Universitas Indonesia'}</span>
                      <span className="flex items-center gap-1"><Mail size={12} /> {safeEmailName}@email.com</span>
                      <span className="flex items-center gap-1"><Phone size={12} /> +62 812-9876-5432</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-900">
                    {t.modal.tahapUploadTitle}
                  </span>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
              </div>

              {/* Uploaded Document Card */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  {t.modal.berkasCV}
                </h3>

                <div className="p-4 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm">
                      PDF
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{`CV_${safeFileName}.pdf`}</p>
                      <p className="text-xs text-muted-foreground">2.4 MB • Applicant Portal</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-card border border-border hover:bg-muted text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5">
                      <Download size={14} />
                      Download
                    </button>
                    <button className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5">
                      <ExternalLink size={14} />
                      Preview CV
                    </button>
                  </div>
                </div>

                {/* Candidate Extracted Bio Preview */}
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

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg flex items-center gap-3">
                  <Clock className="text-blue-500 shrink-0" size={20} />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>{t.modal.statusBerkas}:</strong> {t.modal.berkasSiap}
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 2: CV SCREENING (Tahap 2) ==================== */}
          {activeTab === 'cv_analysis' && stageIndex >= 1 && (
            <div className="max-w-4xl mx-auto py-2 animate-in fade-in duration-300 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">{t.modal.hasilAnalisisCV}</h2>
                <p className="text-sm text-muted-foreground">
                  {t.modal.deskripsiScreening}
                </p>
              </div>

              {/* Main Score Card */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row items-center gap-6">
                <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shrink-0 shadow-lg ${
                  (candidate.cvScore || 87) >= 80 
                    ? 'bg-emerald-500 shadow-emerald-500/20 text-white' 
                    : 'bg-rose-500 shadow-rose-500/20 text-white'
                }`}>
                  <span className="text-3xl font-bold">{candidate.cvScore || 87}%</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90">Score</span>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      (candidate.cvScore || 87) >= 80 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {(candidate.cvScore || 87) >= 80 ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {(candidate.cvScore || 87) >= 80 ? t.modal.lolosAmbang : t.modal.gagalAmbang}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground">
                    {(candidate.cvScore || 87) >= 80 ? t.modal.kecocokanTinggi : t.modal.kecocokanRendah}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sistem PO-FIT Cosine Similarity: <strong>{candidate.cvScore || 87}%</strong> match.
                  </p>
                </div>
              </div>

              {/* Progress Bar vs Threshold */}
              <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span>Cosine Similarity Score</span>
                  <span className="text-primary">{candidate.cvScore || 87}% Match</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${(candidate.cvScore || 87) >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${candidate.cvScore || 87}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1.5">
                  <span>0%</span>
                  <span className="font-bold text-rose-500">{t.modal.ambangBatasMin}</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Detail Category Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: t.modal.formatStruktur, score: 85 },
                  { label: t.modal.pengalamanRelevan, score: 92 },
                  { label: t.modal.keahlianSertifikasi, score: 88 },
                  { label: t.modal.prestasiDampak, score: 75 },
                  { label: t.modal.bahasaKomunikasi, score: 84 },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-card border border-border rounded-lg text-center">
                    <p className="text-[10px] text-muted-foreground font-medium mb-1 truncate">{item.label}</p>
                    <p className="text-lg font-bold text-primary">{item.score}%</p>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  {t.modal.saranPerbaikan}
                </h3>
                <ul className="space-y-2.5 text-xs text-foreground">
                  <li className="flex gap-2 items-start">
                    <Check className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                    <span>3+ years experience matching job requirements.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                    <span>Microservices & state management keywords matched.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={14} />
                    <span>Verify technical leadership during Virtual Interview stage.</span>
                  </li>
                </ul>
              </div>

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
                      {t.modal.statusVideoWawancara}
                    </h3>
                  </div>

                  {isVideoUploaded ? (
                    <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      {t.modal.videoSudahDiunggah}
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold rounded-full flex items-center gap-1.5">
                      <Clock size={14} />
                      {t.modal.videoBelumDiunggah}
                    </span>
                  )}
                </div>

                {/* If Video IS Uploaded */}
                {isVideoUploaded ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video border border-border group cursor-pointer shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80" alt="Video preview" className="w-full h-full object-cover opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4">
                        <span className="self-end px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono rounded">
                          00:15:32
                        </span>
                        <div className="flex items-center justify-between text-white">
                          <button className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center hover:scale-105 transition-transform">
                            <Play size={20} fill="currentColor" className="ml-0.5" />
                          </button>
                          <span className="text-xs font-medium">Recorded on 2026-07-28 14:20</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t.modal.durasiVideo}:</span>
                          <span className="font-semibold text-foreground">{t.modal.durasiDemo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t.modal.pertanyaanSelesai}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quality:</span>
                          <span className="font-semibold text-foreground">{t.modal.kualitasMedia}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg">
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                          {t.modal.transcriptHighlight}
                        </p>
                        <p className="text-xs italic text-foreground/80 leading-relaxed">
                          {t.modal.transkripCuplikan}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* If Video IS NOT Uploaded Yet */
                  <div className="p-8 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl text-center space-y-3">
                    <AlertCircle className="mx-auto text-amber-500" size={36} />
                    <h4 className="font-bold text-base text-foreground">{t.modal.videoBelumDiunggah}</h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      {t.modal.undanganTerkirim}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==================== TAB 4: AI VIDEO ANALYSIS (Tahap 4) ==================== */}
          {activeTab === 'video_analysis' && stageIndex >= 3 && (
            <div className="max-w-5xl mx-auto py-2 animate-in fade-in duration-300 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">{t.modal.parameterAnalisis}</h2>
                <p className="text-sm text-muted-foreground">
                  {t.modal.deskripsiVideo}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 5 Video Parameters */}
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Scan size={18} className="text-primary" />
                    {t.modal.parameterAnalisis}
                  </h3>

                  <div className="space-y-4">
                    {videoParams.map((param, index) => (
                      <div key={index} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-foreground">{param.label}</span>
                          <span className="font-bold text-primary">{param.value}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${param.color}`}
                            style={{ width: `${param.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5 Output Scores & Radar Chart */}
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <BarChart3 size={18} className="text-primary" />
                    {t.modal.nilaiOutput}
                  </h3>

                  <div className="min-h-[220px] w-full">
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                        <PolarGrid stroke="currentColor" className="text-border" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10 }} className="text-muted-foreground" />
                        <Radar name="Candidate" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-muted/30 rounded border border-border">
                      <p className="text-[10px] text-muted-foreground">{t.modal.ability}</p>
                      <p className="font-bold text-blue-600 dark:text-blue-400">{candidate.videoScores?.ability || 85}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded border border-border">
                      <p className="text-[10px] text-muted-foreground">{t.modal.intelligent}</p>
                      <p className="font-bold text-violet-600 dark:text-violet-400">{candidate.videoScores?.intelligent || 92}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded border border-border">
                      <p className="text-[10px] text-muted-foreground">{t.modal.personality}</p>
                      <p className="font-bold text-amber-600 dark:text-amber-400">{candidate.videoScores?.personality || 78}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded border border-border">
                      <p className="text-[10px] text-muted-foreground">{t.modal.attitude}</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{candidate.videoScores?.attitude || 88}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded border border-border col-span-2">
                      <p className="text-[10px] text-muted-foreground">{t.modal.emotionalIntelligence}</p>
                      <p className="font-bold text-cyan-600 dark:text-cyan-400">{candidate.videoScores?.emotionalIntelligence || 80}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== TAB 5: HUMAN VALIDATION (Tahap 5 - ALL COMBINED & DECISION) ==================== */}
          {activeTab === 'full_validation' && stageIndex >= 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div>
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <UserCheck size={22} className="text-primary" />
                  {t.modal.semuaHasilAI}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t.modal.deskripsiHumanValidation}
                </p>
              </div>

              {/* Overview Summary Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{t.modal.cvAnalysis}</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{candidate.cvScore || 87}% Match</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">✓ Threshold ≥80%</span>
                  </div>
                  <FileText className="text-emerald-500" size={28} />
                </div>

                <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{t.modal.videoAnalysis}</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">84.6 / 100</p>
                    <span className="text-[10px] text-blue-600 font-semibold">5 Metrics</span>
                  </div>
                  <BarChart3 className="text-blue-500" size={28} />
                </div>

                <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{t.modal.statusVideoWawancara}</p>
                    <p className="text-sm font-bold text-foreground mt-1">15:32</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">✓ Complete</span>
                  </div>
                  <Video className="text-violet-500" size={28} />
                </div>
              </div>

              {/* Combined Grid: Video + Radar + Sliders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Side: Video Preview & Radar */}
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-xl border border-border shadow-sm space-y-3">
                    <h4 className="font-bold text-sm text-foreground flex items-center justify-between">
                      <span>Video & Radar Score</span>
                      <span className="text-xs font-normal text-muted-foreground">00:15:32</span>
                    </h4>

                    {/* Mini Video */}
                    <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-video border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80" alt="Video thumbnail" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-10 h-10 rounded-full bg-primary/90 text-white flex items-center justify-center">
                          <Play size={18} fill="currentColor" className="ml-0.5" />
                        </button>
                      </div>
                    </div>

                    {/* Radar Chart */}
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                          <PolarGrid stroke="currentColor" className="text-border" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 9 }} className="text-muted-foreground" />
                          <Radar name="Candidate" dataKey="A" stroke="#0f766e" fill="#0f766e" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Right Side: Human Validation Form & Decision Buttons */}
                <div className="p-6 bg-card rounded-xl border border-border shadow-sm flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                      <UserCheck size={18} className="text-primary" />
                      {t.modal.penilaianManual}
                    </h3>

                    {/* Sliders */}
                    <div className="space-y-4">
                      {[
                        { label: t.modal.ability, score: Math.round((candidate.videoScores?.ability || 85) / 10) },
                        { label: t.modal.intelligent, score: Math.round((candidate.videoScores?.intelligent || 92) / 10) },
                        { label: t.modal.personality, score: Math.round((candidate.videoScores?.personality || 78) / 10) },
                        { label: t.modal.attitude, score: Math.round((candidate.videoScores?.attitude || 88) / 10) },
                        { label: t.modal.emotionalIntelligence, score: Math.round((candidate.videoScores?.emotionalIntelligence || 80) / 10) },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-1 text-xs font-medium">
                            <span>{item.label}</span>
                            <span className="font-bold text-primary">{item.score} / 10</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="10" 
                            defaultValue={item.score}
                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Notes textarea */}
                    <div className="mt-5">
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        {t.modal.catatanHR}
                      </label>
                      <textarea 
                        className="w-full p-3 bg-muted/30 border border-border rounded-lg text-xs resize-none h-20 focus:outline-none focus:border-primary transition-all"
                        placeholder={t.modal.masukkanCatatan}
                      ></textarea>
                    </div>
                  </div>

                  {/* Decision Buttons (Triggers Archive Transfer) */}
                  <div className="space-y-2 pt-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDecision('hired')}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <CheckCircle2 size={16} />
                        {t.modal.terima}
                      </button>
                      <button 
                        onClick={() => handleDecision('rejected')}
                        className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <XCircle size={16} />
                        {t.modal.tolak}
                      </button>
                    </div>
                    <button className="w-full py-2 bg-card border border-border hover:bg-muted font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 text-foreground">
                      <Video size={14} />
                      {t.modal.interviewTambahan}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
