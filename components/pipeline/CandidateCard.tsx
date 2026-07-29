import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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
}

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
}: CandidateCardProps) {
  const { t } = useTranslation();

  let borderStyle = 'border-border';
  if (variant === 'screening') {
    borderStyle = 'border-l-4 border-l-amber-500 border-y-border border-r-border';
  }

  return (
    <div 
      onClick={onClick}
      className={`bg-card text-card-foreground p-4 rounded-lg shadow-sm border ${borderStyle} hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] select-none`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-sm">{name}</h4>
        {matchScore && (
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-md">
            {matchScore} {t.pipeline?.match}
          </span>
        )}
        {variant === 'analysis' && (
          <button className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors">
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      {!progressBar && (
        <p className="text-sm text-muted-foreground mb-3">{role}</p>
      )}

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
            {timeIcon ? (
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
