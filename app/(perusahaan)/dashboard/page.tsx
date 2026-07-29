'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { StatCard } from '@/components/dashboard/StatCard';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { CandidateModal } from '@/components/pipeline/CandidateModal';
import { 
  Users, 
  Calendar, 
  BrainCircuit, 
  Clock, 
  CalendarDays, 
  Download,
  AlertCircle,
  UserCheck,
  Briefcase,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  // Mock candidates awaiting HR validation
  const pendingCandidates = [
    {
      name: "David Kim",
      role: "Sr. Frontend @ MegaWeb",
      stage: "human_validation",
      status: "needs_approval",
      cvScore: 95,
      videoUploaded: true,
      videoScores: { ability: 85, intelligent: 92, personality: 78, attitude: 88, emotionalIntelligence: 80 }
    },
    {
      name: "Siti Nurhaliza",
      role: "Angular Developer",
      stage: "human_validation",
      status: "needs_approval",
      cvScore: 89,
      videoUploaded: true,
      videoScores: { ability: 80, intelligent: 85, personality: 90, attitude: 82, emotionalIntelligence: 88 }
    }
  ];

  // Mock top active job openings
  const activeJobs = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      threshold: 80,
      applicants: 42,
      passed: 28,
      posted: '2 hari lalu',
    },
    {
      title: 'Backend Engineer (Go/Node.js)',
      department: 'Engineering',
      threshold: 85,
      applicants: 35,
      passed: 19,
      posted: '5 hari lalu',
    },
    {
      title: 'UI/UX Product Designer',
      department: 'Design',
      threshold: 75,
      applicants: 28,
      passed: 15,
      posted: '1 minggu lalu',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 animate-in fade-in duration-300">
      
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
          title={t.dashboard.cvReceived || 'CV RECEIVED'}
          value="156"
          subtitle={t.dashboard.cvReceivedSub || 'new this week'}
          icon={<Users size={20} />}
          trend="up"
          trendValue="+24"
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title={t.dashboard.passedScreening || 'PASSED CV SCREENING'}
          value="89"
          subtitle={t.dashboard.passedScreeningSub || 'above 80% threshold'}
          icon={<BrainCircuit size={20} />}
          trend="up"
          trendValue="57%"
          iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title={t.dashboard.interviewScheduled || 'INTERVIEWS SCHEDULED'}
          value="34"
          subtitle={t.dashboard.interviewScheduledSub || 'awaiting video analysis'}
          icon={<Calendar size={20} />}
          trend="neutral"
          trendValue="8"
          iconBgColor="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title={t.dashboard.awaitingValidation || 'AWAITING VALIDATION'}
          value="12"
          subtitle={t.dashboard.awaitingValidationSub || 'ready for HR decision'}
          icon={<Clock size={20} />}
          trend="down"
          trendValue="-3"
          iconBgColor="bg-violet-100 dark:bg-violet-900/30"
          iconColor="text-violet-600 dark:text-violet-400"
        />
      </div>

      {/* ==================== FEATURE 2: PENDING HR APPROVAL PANEL ==================== */}
      <div className="bg-card p-6 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
              <UserCheck size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">{t.dashboard.pendingApprovalTitle}</h2>
              <p className="text-xs text-muted-foreground">{t.dashboard.pendingApprovalSub}</p>
            </div>
          </div>

          <Link 
            href="/pipeline" 
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Lihat Semua Pipeline
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingCandidates.map((c, i) => (
            <div key={i} className="p-4 bg-muted/30 rounded-lg border border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-200 dark:border-blue-800">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{c.name}</h4>
                  <p className="text-xs text-muted-foreground">{c.role}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px]">
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold rounded">
                      CV Match: {c.cvScore}%
                    </span>
                    <span className="px-2 py-0.5 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-bold rounded">
                      Video Score: 84.6
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCandidate(c)}
                className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1 shadow-sm active:scale-95"
              >
                <UserCheck size={14} />
                {t.dashboard.validateNow}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Chart + Active Jobs) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pipeline Growth Chart */}
          <PipelineChart />

          {/* ==================== FEATURE 3: ACTIVE JOBS OVERVIEW ==================== */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-primary" />
                <div>
                  <h3 className="font-bold text-base text-foreground">{t.dashboard.activeJobsTitle}</h3>
                  <p className="text-xs text-muted-foreground">{t.dashboard.activeJobsSub}</p>
                </div>
              </div>

              <Link 
                href="/jobs" 
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                {t.dashboard.viewAllJobs}
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {activeJobs.map((job, idx) => (
                <div key={idx} className="p-4 bg-muted/30 border border-border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">{job.title}</h4>
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] rounded font-semibold">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Dipublikasikan {job.posted} &bull; <strong className="text-primary">Threshold PO-FIT: {job.threshold}%</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">{job.applicants} Pelamar</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {job.passed} Lolos Screening
                      </p>
                    </div>

                    <Link 
                      href="/pipeline" 
                      className="px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shrink-0"
                    >
                      Pipeline
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (AI System Performance + Recent Activity) */}
        <div className="space-y-6">
          
          {/* ==================== FEATURE 4: AI SYSTEM PERFORMANCE METRICS ==================== */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Zap size={18} className="text-amber-500" />
              <h3 className="font-bold text-base text-foreground">{t.dashboard.aiPerformanceTitle}</h3>
            </div>

            <div className="space-y-4">
              {/* Avg Cosine Similarity */}
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t.dashboard.avgCosineSimilarity}</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">84.2% Match</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                  PO-FIT
                </div>
              </div>

              {/* AI vs HR Accuracy */}
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t.dashboard.aiHrAccuracy}</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">94.8% Agreement</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                  ✓ High
                </div>
              </div>

              {/* Avg Screening Speed */}
              <div className="p-3 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t.dashboard.avgProcessingSpeed}</p>
                  <p className="text-xl font-bold text-violet-600 dark:text-violet-400">&lt; 2.5 Detik / CV</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold text-xs">
                  ⚡ Fast
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <RecentActivity />

        </div>

      </div>

      {/* Candidate Modal Render for Quick Validation */}
      {selectedCandidate && (
        <CandidateModal 
          candidate={selectedCandidate} 
          onClose={() => setSelectedCandidate(null)} 
        />
      )}

    </div>
  );
}
