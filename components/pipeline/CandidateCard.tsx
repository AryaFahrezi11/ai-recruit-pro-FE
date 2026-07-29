import React from 'react';
import { Clock, RefreshCw, CheckCircle2, XCircle, Loader2, FileText, Video, Brain, UserCheck } from 'lucide-react';
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
  timeInfo: string;
  variant?: 'default' | 'screening' | 'analysis';
  timeIcon?: boolean;
  avatar?: string;
  progressBar?: boolean;
  progressText?: string;
  onClick?: () => void;
  // Flowchart props
  stage?: CandidateStage;
  status?: CandidateStatus;
  cvScore?: number;
  videoUploaded?: boolean;
  videoScores?: VideoScores;
}

const stageBorderColors: Record<CandidateStage, string> = {
  upload_cv: 'border-l-4 border-l-blue-500 border-y-border border-r-border',
  cv_screening: 'border-l-4 border-l-amber-500 border-y-border border-r-border',
  interview: 'border-l-4 border-l-violet-500 border-y-border border-r-border',
  ai_analysis: 'border-l-4 border-l-cyan-500 border-y-border border-r-border',
  human_validation: 'border-l-4 border-l-teal-500 border-y-border border-r-border',
};

const stageIcons: Record<CandidateStage, React.ReactNode> = {
  upload_cv: <FileText size={12} />,
  cv_screening: <Brain size={12} />,
  interview: <Video size={12} />,
  ai_analysis: <Loader2 size={12} />,
  human_validation: <UserCheck size={12} />,
};

export function CandidateCard({
  name,
  matchScore,
  role,
  timeInfo,
  variant = 'default',
  timeIcon = false,
  avatar,
  progressBar = false,
  progressText,
  onClick,
  stage,
  status,
  cvScore,
  videoScores,
}: CandidateCardProps) {
  const { t } = useTranslation();

  // Determine border style: prefer stage-based colors, fallback to variant
  let borderStyle = 'border-border';
  if (stage) {
    borderStyle = stageBorderColors[stage];
  } else if (variant === 'screening') {
    borderStyle = 'border-l-4 border-l-amber-500 border-y-border border-r-border';
  }

  const statusConfig: Record<CandidateStatus, { icon: React.ReactNode; label: string; className: string }> = {
    pending: { icon: <Clock size={12} />, label: t.pipeline?.pending || 'Menunggu', className: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    processing: { icon: <Loader2 size={12} className="animate-spin" />, label: t.pipeline?.processing || 'Memproses AI...', className: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    video_uploaded: { icon: <CheckCircle2 size={12} />, label: t.pipeline?.videoUploaded || 'Video Terunggah', className: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    awaiting_video: { icon: <Clock size={12} />, label: t.pipeline?.awaitingVideo || 'Belum Upload Video', className: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    needs_approval: { icon: <UserCheck size={12} />, label: t.pipeline?.needsApproval || 'Butuh Persetujuan HR', className: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800' },
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-card text-card-foreground p-4 rounded-lg shadow-sm border ${borderStyle} hover:shadow-md transition-all cursor-pointer active:scale-[0.98] select-none group`}
    >
      {/* Top row: Name + Status Badge (NO badge for upload_cv as CV is already uploaded) */}
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-sm">{name}</h4>
        {stage !== 'upload_cv' && status && statusConfig[status] && (
          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusConfig[status].className}`}>
            {statusConfig[status].icon}
            {statusConfig[status].label}
          </span>
        )}
        {!status && matchScore && (
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-md">
            {matchScore} {t.pipeline?.match}
          </span>
        )}
        {!status && variant === 'analysis' && (
          <button className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors">
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      {/* Role */}
      {!progressBar && (
        <p className="text-sm text-muted-foreground mb-3">{role}</p>
      )}

      {/* CV Score indicator (for cv_screening stage) */}
      {cvScore !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t.pipeline?.cosineSimilarity}
            </span>
            <span className={`text-xs font-bold ${cvScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {cvScore}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${cvScore >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${cvScore}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className={`w-1 h-1 rounded-full ${cvScore >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <span className="text-[9px] text-muted-foreground">{t.pipeline?.threshold}</span>
          </div>
        </div>
      )}

      {/* Mini video analysis scores (for ai_analysis / human_validation) */}
      {videoScores && (
        <div className="mb-3 space-y-1">
          {[
            { label: 'ABL', value: videoScores.ability },
            { label: 'INT', value: videoScores.intelligent },
            { label: 'PER', value: videoScores.personality },
            { label: 'ATT', value: videoScores.attitude },
            { label: 'EI', value: videoScores.emotionalIntelligence },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-muted-foreground w-6">{item.label}</span>
              <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-primary/70 transition-all duration-500"
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>
              <span className="text-[9px] font-bold text-foreground w-7 text-right">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar (legacy) */}
      {progressBar ? (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">{progressText}</p>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full w-2/3"></div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center text-xs text-muted-foreground font-medium">
            {stage ? (
              <span className="mr-1.5 opacity-60">{stageIcons[stage]}</span>
            ) : timeIcon ? (
              <Clock size={14} className="mr-1.5 text-amber-500" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-primary mr-1.5"></div>
            )}
            {timeInfo}
          </div>
          {avatar && (
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
              {avatar}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
