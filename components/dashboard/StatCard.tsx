import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  iconBgColor = 'bg-primary/10',
  iconColor = 'text-primary'
}: StatCardProps) {
  return (
    <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-sm flex flex-col transition-all duration-300 hover:shadow-md hover:border-primary/40 relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none group-hover:bg-primary/10 transition-colors"></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">{title}</h3>
        <div className={`p-2.5 rounded-xl ${iconBgColor} ${iconColor} border border-border/50 shrink-0 shadow-2xs`}>
          {icon}
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <div className="text-3xl font-extrabold text-foreground mb-2 tracking-tight">{value}</div>
        
        <div className="flex items-center text-xs gap-1.5 flex-wrap">
          {trend === 'up' && (
            <span className="inline-flex items-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[11px] border border-emerald-300 dark:border-emerald-700">
              <TrendingUp size={12} className="mr-1" />
              {trendValue}
            </span>
          )}
          {trend === 'down' && (
            <span className="inline-flex items-center font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full text-[11px] border border-rose-300 dark:border-rose-700">
              <TrendingDown size={12} className="mr-1" />
              {trendValue}
            </span>
          )}
          {trend === 'neutral' && (
            <span className="inline-flex items-center font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[11px] border border-slate-300 dark:border-slate-700">
              <Minus size={12} className="mr-1" />
              {trendValue}
            </span>
          )}

          <span className="text-muted-foreground font-medium truncate">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
