import React from 'react';
import { Inbox } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  count: number;
  stageKey?: 'upload_cv' | 'cv_screening' | 'interview' | 'ai_analysis' | 'human_validation' | string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const stageAccentColors: Record<string, { dot: string; badge: string }> = {
  upload_cv: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
  cv_screening: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  interview: { dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
  ai_analysis: { dot: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
  human_validation: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
};

export function KanbanColumn({ title, count, stageKey, icon, children }: KanbanColumnProps) {
  const accent = (stageKey && stageAccentColors[stageKey]) || {
    dot: 'bg-primary',
    badge: 'bg-muted text-muted-foreground'
  };

  return (
    <div className="flex-shrink-0 w-80 flex flex-col bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 h-[calc(100vh-14rem)] overflow-hidden shadow-2xs">
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full ${accent.dot} shrink-0 shadow-2xs`} />
          <h3 className="font-extrabold text-xs tracking-tight text-foreground truncate">
            {title}
          </h3>
        </div>
        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs ${accent.badge}`}>
          {count}
        </span>
      </div>

      {/* Column Content / Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {count === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
            <Inbox size={24} className="mb-1.5 opacity-40" />
            <span className="text-[11px] font-medium">Belum ada kandidat</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
