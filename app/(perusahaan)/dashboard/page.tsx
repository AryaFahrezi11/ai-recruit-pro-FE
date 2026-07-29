'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatCard } from '@/components/dashboard/StatCard';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { 
  Users, 
  Calendar, 
  BrainCircuit, 
  Clock, 
  CalendarDays, 
  Download 
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t.dashboard.title}</h1>
          <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm">
            <CalendarDays size={16} className="text-muted-foreground" />
            {t.dashboard.last30Days}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm">
            <Download size={16} className="text-muted-foreground" />
            {t.dashboard.exportReport}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t.dashboard.activeCandidates}
          value="1,248"
          subtitle={t.dashboard.fromLastMonth}
          icon={<Users size={20} />}
          trend="up"
          trendValue="+12.5%"
          iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          title={t.dashboard.interviewsToday}
          value="34"
          subtitle={t.dashboard.scheduledNextHour}
          icon={<Calendar size={20} />}
          trend="neutral"
          trendValue="8"
          iconBgColor="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title={t.dashboard.aiSuccessRate}
          value="94.2%"
          subtitle={t.dashboard.validationAccuracy}
          icon={<BrainCircuit size={20} />}
          trend="up"
          trendValue="✓"
          iconBgColor="bg-cyan-100 dark:bg-cyan-900/30"
          iconColor="text-cyan-600 dark:text-cyan-400"
        />
        <StatCard
          title={t.dashboard.avgTime}
          value={`18 ${t.dashboard.days}`}
          subtitle={t.dashboard.daysVsAvg}
          icon={<Clock size={20} />}
          trend="down"
          trendValue="-2"
          iconBgColor="bg-slate-200 dark:bg-slate-800"
          iconColor="text-slate-600 dark:text-slate-400"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PipelineChart />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>

    </div>
  );
}
