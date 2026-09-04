import React from 'react';
import { Clock, RefreshCw, CheckCircle2, XCircle, Loader2, FileText, Video, Brain, UserCheck, GraduationCap, Building2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export type CandidateStage = 'upload_cv' | 'cv_screening' | 'interview' | 'ai_analysis' | 'human_validation';
export type CandidateStatus = 'pending' | 'processing' | 'video_uploaded' | 'awaiting_video' | 'needs_approval';

interface VideoScores {
  ability: number;
  intelligent: number;
  personality: number;
  attitude: number;
  emotionalIntelligence: number;
}

interface CandidateCardProps {
  name: string;
  matchScore?: string;
  role: string;
  education?: string; // Information on highest education
  university?: string; // Information on candidate's origin university
  appliedJob?: string; // Information on the job applied for
  timeInfo: string;
  variant?: 'default' | 'screening' | 'analysis';
  timeIcon?: boolean;
  avatar?: string;
  progressBar?: boolean;
  progressText?: string;
  onClick?: () => void;
  // Custom Action Button
  actionLabel?: string;
  actionLoading?: boolean;
  onActionClick?: (e: React.MouseEvent) => void;
  customActions?: React.ReactNode;
  // Flowchart props
  stage?: CandidateStage;
  status?: CandidateStatus;
  cvScore?: number;
  threshold?: number;
  videoUploaded?: boolean;
  videoScores?: VideoScores;
}

const stageBorderColors: Record<CandidateStage, string> = {
  upload_cv: 'border-l-4 border-l-blue-600 border-y-border border-r-border',
  cv_screening: 'border-l-4 border-l-amber-600 border-y-border border-r-border',
  interview: 'border-l-4 border-l-violet-600 border-y-border border-r-border',
  ai_analysis: 'border-l-4 border-l-cyan-600 border-y-border border-r-border',
  human_validation: 'border-l-4 border-l-[#2596be] border-y-border border-r-border',
};

export function CandidateCard({
  name,
  matchScore,
  role,
  education,
  university,
  appliedJob,
  timeInfo,
  variant = 'default',
  onClick,
  actionLabel,
  actionLoading,
  onActionClick,
  customActions,
  stage,
  status,
  cvScore,
  threshold = 60,
  videoScores,
}: CandidateCardProps) {
  const { t } = useTranslation();

  // Determine border style
  let borderStyle = 'border-border';
  if (stage) {
    borderStyle = stageBorderColors[stage];
  } else if (variant === 'screening') {
    borderStyle = 'border-l-4 border-l-amber-600 border-y-border border-r-border';
  }

  const statusConfig: Record<CandidateStatus, { icon: React.ReactNode; label: string; className: string }> = {
    pending: { 
      icon: <Clock size={12} />, 
      label: t.pipeline?.pending || 'Menunggu', 
      className: 'bg-amber-100 text-amber-900 font-bold border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700' 
    },
    processing: { 
      icon: <Loader2 size={12} className="animate-spin" />, 
      label: t.pipeline?.processing || 'Memproses AI...', 
      className: 'bg-blue-100 text-blue-900 font-bold border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700' 
    },
    video_uploaded: { 
      icon: <CheckCircle2 size={12} />, 
      label: t.pipeline?.videoUploaded || 'Video Terunggah', 
      className: 'bg-emerald-100 text-emerald-900 font-bold border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700' 
    },
    awaiting_video: { 
      icon: <Clock size={12} />, 
      label: t.pipeline?.awaitingVideo || 'Belum Upload Video', 
      className: 'bg-amber-100 text-amber-900 font-bold border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700' 
    },
    needs_approval: { 
      icon: <UserCheck size={12} />, 
      label: t.pipeline?.needsApproval || 'Butuh Persetujuan HR', 
      className: 'bg-violet-100 text-violet-900 font-bold border-violet-300 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-700' 
    },
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-card text-card-foreground p-4 rounded-lg shadow-sm border ${borderStyle} hover:shadow-md hover:border-primary/60 transition-all cursor-pointer active:scale-[0.98] select-none group`}
    >
      {/* Top row: Name + Status Badge */}
      <div className="flex justify-between items-start mb-1.5">
        <h4 className="font-bold text-sm text-foreground">{name}</h4>
        {stage !== 'upload_cv' && status && statusConfig[status] && (
          <span className={`flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full border shadow-2xs ${statusConfig[status].className}`}>
            {statusConfig[status].icon}
            {statusConfig[status].label}
          </span>
        )}
        {!status && matchScore && (
          <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md border border-primary/20">
            {matchScore} {t.pipeline?.match}
          </span>
        )}
      </div>

      {/* Role */}
      <p className="text-xs font-medium text-muted-foreground mb-3">{role}</p>

      {/* Education, University & Applied Job */}
      {(education || university || appliedJob) && (
        <div className="flex flex-col gap-1 mb-3">
          {education && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
              <GraduationCap size={12} className="shrink-0 text-primary/70" />
              <span className="truncate">{education}</span>
            </div>
          )}
          {university && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
              <Building2 size={12} className="shrink-0 text-primary/70" />
              <span className="truncate">{university}</span>
            </div>
          )}
          {appliedJob && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium mt-1 pt-1 border-t border-border/40">
              <span className="shrink-0 text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-400 rounded-md uppercase tracking-wider font-bold">APPLIED</span>
              <span className="truncate text-foreground font-semibold">{appliedJob}</span>
            </div>
          )}
        </div>
      )}

      {/* CV Score indicator (for cv_screening stage) */}
      {cvScore !== undefined && (
        <div className="mb-3 p-2 bg-muted/40 rounded-lg border border-border/80">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t.pipeline?.cosineSimilarity}
            </span>
            <span className={`text-xs font-bold ${cvScore >= threshold ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {cvScore}% Match
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${cvScore >= threshold ? 'bg-emerald-600' : 'bg-rose-600'}`}
              style={{ width: `${cvScore}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] font-semibold text-muted-foreground">Standar Kelulusan: {threshold}%</span>
            <span className={`text-[9px] font-bold ${cvScore >= threshold ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {cvScore >= threshold ? '✓ Lolos' : '✗ Tidak Memenuhi Standar'}
            </span>
          </div>
        </div>
      )}

      {/* Mini video analysis scores (for ai_analysis / human_validation) */}
      {videoScores && (
        <div className="mb-3 space-y-1 p-2 bg-muted/40 rounded-lg border border-border/80">
          {[
            { label: 'Ability', value: videoScores.ability },
            { label: 'Intelligent', value: videoScores.intelligent },
            { label: 'Personality', value: videoScores.personality },
            { label: 'Attitude', value: videoScores.attitude },
            { label: 'Emotional Eq.', value: videoScores.emotionalIntelligence },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-[10px]">
              <span className="text-slate-600 dark:text-slate-400 font-medium">{item.label}</span>
              <span className="font-bold text-foreground">{item.value} / 100</span>
            </div>
          ))}
        </div>
      )}

      {/* Time info & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60 mt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
          <Clock size={12} className="text-muted-foreground shrink-0" />
          <span>{timeInfo}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {customActions}
          {actionLabel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onActionClick) onActionClick(e);
              }}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-[#2596be] hover:bg-[#1D7FA1] text-white text-[10px] font-bold rounded-md transition-colors flex items-center gap-1 disabled:opacity-75"
            >
              {actionLoading ? <Loader2 size={10} className="animate-spin" /> : <Brain size={10} />}
              {actionLoading ? 'Memproses...' : actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
