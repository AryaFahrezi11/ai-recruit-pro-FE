'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { StatCard } from '@/components/dashboard/StatCard';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { CandidateModal } from '@/components/pipeline/CandidateModal';
import { fetchAuth } from '@/lib/api/auth';
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
  FileText,
  GraduationCap,
  Activity,
  Check
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  // Mock candidates awaiting HR validation
  const pendingCandidates = [
    {
      name: "David Kim",
      role: "Sr. Frontend @ MegaWeb",
      education: "S1 Teknik Informatika (IPK 3.85)",
      stage: "human_validation",
      status: "needs_approval",
      cvScore: 95,
      videoUploaded: true,
      videoScores: { ability: 85, intelligent: 92, personality: 78, attitude: 88, emotionalIntelligence: 80 }
    },
    {
      name: "Siti Nurhaliza",
      role: "Angular Developer",
      education: "S1 Sistem Informasi (IPK 3.78)",
      stage: "human_validation",
      status: "needs_approval",
      cvScore: 89,
      videoUploaded: true,
      videoScores: { ability: 80, intelligent: 85, personality: 90, attitude: 82, emotionalIntelligence: 88 }
    }
  ];

  const [activeJobs, setActiveJobs] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchAuth('/api/jobs/my-jobs');
        if (res.ok) {
          const data = await res.json();
          const mappedJobs = data.slice(0, 3).map((j: any) => ({
            title: j.judul_posisi,
            department: j.department || 'Engineering',
            threshold: j.cv_threshold || 80,
            applicants: j.openings_count || 0,
            passed: 0,
            posted: j.created_at ? new Date(j.created_at).toLocaleDateString('id-ID') : 'Baru',
          }));
          setActiveJobs(mappedJobs);
        }
      } catch (err) {
        console.error('Failed to load company dashboard jobs', err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{t.dashboard.title}</h1>
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-bold text-[10px] rounded-full border border-primary/20">
              HR Suite
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{t.dashboard.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs">
            <CalendarDays size={15} className="text-muted-foreground" />
            {t.dashboard.last30Days}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl transition-all shadow-md shadow-primary/20 active:scale-95 cursor-pointer"
            title="Ekspor Laporan Dasbor ke PDF"
          >
            <Download size={15} />
            {t.dashboard.exportReport} (PDF)
          </button>
        </div>
      </div>

      {/* Executive Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t.dashboard.cvReceived || 'CV DITERIMA'}
          value="156"
          subtitle={t.dashboard.cvReceivedSub || 'minggu ini'}
          icon={<Users size={18} />}
          trend="up"
          trendValue="+24"
          iconBgColor="bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title={t.dashboard.passedScreening || 'LOLOS CV SCREENING'}
          value="89"
          subtitle={t.dashboard.passedScreeningSub || 'threshold >= 80%'}
          icon={<BrainCircuit size={18} />}
          trend="up"
          trendValue="57%"
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title={t.dashboard.interviewScheduled || 'WAWANCARA VIDEO'}
          value="34"
          subtitle={t.dashboard.interviewScheduledSub || 'proses analisis AI'}
          icon={<Calendar size={18} />}
          trend="neutral"
          trendValue="8"
          iconBgColor="bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title={t.dashboard.awaitingValidation || 'MENUNGGU VALIDASI HR'}
          value="12"
          subtitle={t.dashboard.awaitingValidationSub || 'siap dikonfirmasi HR'}
          icon={<Clock size={18} />}
          trend="down"
          trendValue="-3"
          iconBgColor="bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800"
          iconColor="text-rose-600 dark:text-rose-400"
        />
      </div>

      {/* PENDING HR APPROVAL PANEL */}
      <div className="bg-card p-6 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 shadow-xs relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold border border-rose-200 dark:border-rose-800 shrink-0 shadow-2xs">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-foreground">{t.dashboard.pendingApprovalTitle}</h2>
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-extrabold text-[11px] rounded-full">
                  2 Perlu Validasi
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{t.dashboard.pendingApprovalSub}</p>
            </div>
          </div>

          <Link
            href="/pipeline"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            Lihat Semua di Pipeline
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingCandidates.map((c, i) => (
            <div key={i} className="p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1b7b9e]/15 text-[#1b7b9e] dark:bg-[#1b7b9e]/30 dark:text-cyan-300 font-black flex items-center justify-center text-sm border border-[#1b7b9e]/30 shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                  {c.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground leading-snug">{c.name}</h4>
                  <p className="text-xs font-semibold text-muted-foreground">{c.role}</p>

                  {c.education && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200/80 dark:border-purple-800">
                      <GraduationCap size={12} className="text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>{c.education}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold text-[11px] rounded-md border border-emerald-200/80 dark:border-emerald-800">
                      CV Match: {c.cvScore}%
                    </span>
                    <span className="px-2.5 py-0.5 bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 font-bold text-[11px] rounded-md border border-sky-200/80 dark:border-sky-800">
                      Video Score: 84.6
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidate(c)}
                className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <UserCheck size={14} />
                {t.dashboard.validateNow}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid (Chart + Jobs & AI Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Columns (Chart + Active Jobs) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Pipeline Growth Chart */}
          <PipelineChart />

          {/* ACTIVE JOBS OVERVIEW */}
          <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-sm space-y-4 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">{t.dashboard.activeJobsTitle}</h3>
                  <p className="text-xs text-muted-foreground">{t.dashboard.activeJobsSub}</p>
                </div>
              </div>

              <Link
                href="/jobs"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-end sm:self-auto"
              >
                {t.dashboard.viewAllJobs}
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {activeJobs.map((job, idx) => (
                <div key={idx} className="p-4 bg-muted/30 border border-border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 hover:bg-muted/50 transition-colors w-full">
                  <div className="space-y-1 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">{job.title}</h4>
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] rounded-md font-bold border border-border shrink-0">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dipublikasikan {job.posted} &bull; <strong className="text-violet-600 dark:text-violet-400">Threshold: {job.threshold}%</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-border/60 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold text-foreground">{job.applicants} Pelamar</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {job.passed} Lolos Screening
                      </p>
                    </div>

                    <Link
                      href="/pipeline"
                      className="px-3.5 py-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
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

        {/* Right Column (AI Metrics & Recent Activity) */}
        <div className="space-y-6">

          {/* AI SYSTEM PERFORMANCE METRICS */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Zap size={18} className="text-amber-500" />
              <h3 className="font-bold text-base text-foreground">{t.dashboard.aiPerformanceTitle}</h3>
            </div>

            <div className="space-y-3">
              {/* Avg Cosine Similarity */}
              <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">{t.dashboard.avgCosineSimilarity}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">84.2%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '84.2%' }}></div>
                </div>
              </div>

              {/* AI vs HR Accuracy */}
              <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">{t.dashboard.aiHrAccuracy}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">94.8%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '94.8%' }}></div>
                </div>
              </div>

              {/* Avg Screening Speed */}
              <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">{t.dashboard.avgProcessingSpeed}</p>
                  <p className="text-xs text-muted-foreground">&lt; 2.5 Detik per Berkas CV</p>
                </div>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 font-extrabold text-xs rounded-lg border border-purple-200/80 dark:border-purple-800">
                  ⚡ Super Fast
                </span>
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
