import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  highlight?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  highlight = false,
}: StatCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-950 p-4 rounded-xl border ${highlight ? 'border-blue-500 dark:border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800'} flex items-center justify-between shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex flex-col gap-1">
        <h3 className={`text-[11px] font-semibold ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'} uppercase tracking-wider`}>{title}</h3>
        <div className="flex items-center gap-3 mt-0.5">
          <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{value}</div>
          
          {trend === 'up' && (
            <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
              <TrendingUp size={12} className="mr-0.5" />
              {trendValue}
            </span>
          )}
          {trend === 'down' && (
            <span className="inline-flex items-center text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded-md">
              <TrendingDown size={12} className="mr-0.5" />
              {trendValue}
            </span>
          )}
          {trend === 'neutral' && (
            <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
              <Minus size={12} className="mr-0.5" />
              {trendValue}
            </span>
          )}
        </div>
      </div>
      <div className={`w-10 h-10 rounded-lg ${highlight ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800/50' : 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400 border-slate-100 dark:border-slate-800'} border flex items-center justify-center shrink-0`}>
        {icon}
      </div>
    </div>
  );
}
