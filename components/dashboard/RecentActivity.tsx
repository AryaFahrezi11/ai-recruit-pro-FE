'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Activity } from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string | number;
  type: string;
  user: string;
  action: string;
  target: string;
  time: string;
  icon: any; 
  iconBg: string;
  iconColor: string;
  textOverride?: React.ReactNode;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-[24px] border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col h-full hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
      
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
            <Activity size={18} className="text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{t.dashboard.recentActivity || 'Aktivitas Terbaru'}</h2>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">Log Pergerakan</p>
          </div>
        </div>
        <Link href="/pipeline" className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
          Lihat Semua
        </Link>
      </div>

      <div className="flex-1 space-y-3">
        {activities.map((activity, i) => (
          <div key={activity.id} className="group flex items-start gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${activity.iconBg} ${activity.iconColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              <activity.icon size={18} />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                {activity.textOverride ? (
                  activity.textOverride
                ) : (
                  <>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">{activity.user}</strong>{' '}
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{activity.action}</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">{activity.target}</strong>
                  </>
                )}
              </p>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                {activity.time}
              </p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500 font-medium">Belum ada aktivitas terekam.</p>
          </div>
        )}
      </div>
    </div>
  );
}
