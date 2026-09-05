'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { UserPlus, BrainCircuit, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react';

interface ActivityItem {
  id: string | number;
  type: string;
  user: string;
  action: string;
  target: string;
  time: string;
  icon: any; // lucide icon component
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
    <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm h-full transition-colors duration-300">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center font-bold shrink-0 border border-slate-200 dark:border-slate-700">
            <UserPlus size={18} />
          </div>
          <h2 className="text-base font-bold text-foreground">{t.dashboard.recentActivity}</h2>
        </div>
        <button className="text-xs text-primary font-bold hover:underline">
          {t.dashboard.viewAll}
        </button>
      </div>

      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.iconBg} ${activity.iconColor}`}>
              <activity.icon size={18} />
            </div>
            <div>
              <p className="text-sm text-card-foreground leading-snug">
                {activity.textOverride ? (
                  activity.textOverride
                ) : (
                  <>
                    <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
