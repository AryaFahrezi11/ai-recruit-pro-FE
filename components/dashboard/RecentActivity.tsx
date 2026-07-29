'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { UserPlus, BrainCircuit, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react';

export function RecentActivity() {
  const { t } = useTranslation();

  const activities = [
    {
      id: 1,
      type: 'application',
      user: 'Sarah Jenkins',
      action: t.dashboard.appliedFor,
      target: 'Senior Frontend Engineer',
      time: `10 ${t.dashboard.minsAgo}`,
      icon: UserPlus,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 2,
      type: 'ai',
      user: 'Michael Chen',
      action: 'AI Screening completed for', // Keep some static or add to dictionary if strictly needed, but we'll mix static for now or use generic
      target: 'Score: 92/100',
      time: `45 ${t.dashboard.minsAgo}`,
      icon: BrainCircuit,
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      textOverride: (
        <>
          AI Screening completed for <strong>Michael Chen</strong>. Score: 92/100
        </>
      ),
    },
    {
      id: 3,
      type: 'interview',
      user: 'David Rodriguez',
      action: 'Interview scheduled with',
      target: 'by Emma Tech Lead',
      time: `2 ${t.dashboard.hoursAgo}`,
      icon: Calendar,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      textOverride: (
        <>
          Interview scheduled with <strong>David Rodriguez</strong> by <strong>Emma Tech Lead</strong>
        </>
      ),
    },
    {
      id: 4,
      type: 'feedback',
      user: 'Elena Rostova',
      action: 'Hiring manager submitted feedback for',
      target: '',
      time: `3 ${t.dashboard.hoursAgo}`,
      icon: MessageSquare,
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      textOverride: (
        <>
          Hiring manager submitted feedback for <strong>Elena Rostova</strong>
        </>
      ),
    },
    {
      id: 5,
      type: 'offer',
      user: 'James Wilson',
      action: 'Offer accepted by',
      target: '(Product Manager)',
      time: t.dashboard.yesterday,
      icon: CheckCircle2,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      textOverride: (
        <>
          Offer accepted by <strong>James Wilson</strong> (Product Manager)
        </>
      ),
    },
  ];

  return (
    <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm h-full transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">{t.dashboard.recentActivity}</h2>
        <button className="text-sm text-primary font-medium hover:underline">
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
