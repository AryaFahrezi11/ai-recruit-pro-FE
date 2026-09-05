import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Video, 
  Brain, 
  UserCheck, 
  GraduationCap, 
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export type CandidateStage = 'upload_cv' | 'cv_screening' | 'interview' | 'ai_analysis' | 'human_validation';
export type CandidateStatus = 'pending' | 'processing' | 'video_uploaded' | 'awaiting_video' | 'needs_approval' | 'interview_lanjutan' | 'hired' | 'rejected';

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
  education?: string;
  university?: string;
  appliedJob?: string;
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
  status?: CandidateStatus | string;
  cvScore?: number;
  threshold?: number;
  videoUploaded?: boolean;
  videoScores?: VideoScores;
}

const stageAccents: Record<CandidateStage, { border: string; avatarBg: string; text: string }> = {
  upload_cv: { 
    border: 'border-l-[3px] border-l-blue-500', 
    avatarBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    text: 'text-blue-600 dark:text-blue-400'
  },
  cv_screening: { 
    border: 'border-l-[3px] border-l-amber-500', 
    avatarBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-400'
  },
  interview: { 
    border: 'border-l-[3px] border-l-purple-500', 
    avatarBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    text: 'text-purple-600 dark:text-purple-400'
  },
  ai_analysis: { 
    border: 'border-l-[3px] border-l-indigo-500', 
    avatarBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    text: 'text-indigo-600 dark:text-indigo-400'
  },
  human_validation: { 
    border: 'border-l-[3px] border-l-emerald-500', 
    avatarBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-400'
  },
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
  stage = 'upload_cv',
  status,
  cvScore,
  threshold = 60,
  videoScores,
}: CandidateCardProps) {
  const { t } = useTranslation();

  const accent = stageAccents[stage] || stageAccents.upload_cv;

  // Generate initials
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'KD';

  // Status configuration
  const statusConfig: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    pending: { 
      icon: <Clock size={10} />, 
      label: t.pipeline?.pending || 'Menunggu', 
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800' 
    },
    processing: { 
      icon: <Loader2 size={10} className="animate-spin" />, 
      label: t.pipeline?.processing || 'Memproses AI...', 
      className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800' 
    },
    video_uploaded: { 
      icon: <CheckCircle2 size={10} />, 
      label: t.pipeline?.videoUploaded || 'Video Terunggah', 
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' 
    },
    awaiting_video: { 
      icon: <Video size={10} />, 
      label: t.pipeline?.awaitingVideo || 'Menunggu Video', 
      className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800' 
    },
    needs_approval: { 
      icon: <UserCheck size={10} />, 
      label: 'Validasi HR', 
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800' 
    },
    interview_lanjutan: {
      icon: <Calendar size={10} />,
      label: 'Wawancara Lanjutan',
      className: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/60 dark:text-indigo-200 dark:border-indigo-700'
    }
  };

  // Video average score
  const avgVideoScore = videoScores 
    ? Math.round(
        (videoScores.ability + 
         videoScores.intelligent + 
         videoScores.personality + 
         videoScores.attitude + 
         videoScores.emotionalIntelligence) / 5
      )
    : null;

  const isCvPassed = cvScore !== undefined ? cvScore >= threshold : false;

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-[0.99] select-none group relative ${accent.border}`}
    >
      {/* Header: Avatar, Name, Role & Status */}
      <div className="flex items-start gap-2.5">
        <div className={`w-8 h-8 rounded-lg ${accent.avatarBg} font-extrabold text-[11px] flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10 shadow-2xs`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <h4 className="font-extrabold text-xs text-foreground truncate group-hover:text-primary transition-colors">
              {name}
            </h4>
            {status && statusConfig[status] && (
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${statusConfig[status].className}`}>
                {statusConfig[status].icon}
                <span>{statusConfig[status].label}</span>
              </span>
            )}
          </div>

          <p className="text-[11px] font-medium text-muted-foreground truncate mt-0.5">
            {appliedJob || role}
          </p>
        </div>
      </div>

      {/* Education & Origin Institution (Clean single line) */}
      {(education || university) && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium mt-2 pt-2 border-t border-border/50">
          <GraduationCap size={11} className="shrink-0 text-muted-foreground/80" />
          <span className="truncate">
            {education || 'Pendidikan'} {university ? `• ${university}` : ''}
          </span>
        </div>
      )}

      {/* Metrics Row (ATS Match Score & AI Video) - Compact & Elegant */}
      {(cvScore !== undefined || avgVideoScore !== null) && (
        <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
          {cvScore !== undefined && (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
              isCvPassed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}>
              <span>ATS {cvScore}% Match</span>
              <span>{isCvPassed ? '✓' : '✗'}</span>
            </div>
          )}

          {avgVideoScore !== null && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
              <Brain size={11} className="text-indigo-600 dark:text-indigo-400" />
              <span>AI Video {avgVideoScore}/100</span>
            </div>
          )}
        </div>
      )}

      {/* Footer: Date / Time & Quick Action */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-border/50 mt-2.5 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1 truncate font-medium">
          <Clock size={11} className="shrink-0 text-muted-foreground/70" />
          <span className="truncate">{timeInfo}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {customActions}
          {actionLabel && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onActionClick) onActionClick(e);
              }}
              disabled={actionLoading}
              className="px-2.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {actionLoading ? <Loader2 size={10} className="animate-spin" /> : <Brain size={10} />}
              <span>{actionLoading ? 'Memproses...' : actionLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
