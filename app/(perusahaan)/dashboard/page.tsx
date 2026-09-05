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
  Check,
  UserPlus,
  MessageSquare
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  const [pendingCandidates, setPendingCandidates] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [trendCv, setTrendCv] = useState('+0');
  const [avgSpeed, setAvgSpeed] = useState('< 2.5');

  // Dashboard stats
  const [stats, setStats] = useState({
    cvReceived: 0,
    passedScreening: 0,
    interviewScheduled: 0,
    awaitingValidation: 0,
    avgCosineSimilarity: 0,
    aiHrAccuracy: 100
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetchAuth('/api/jobs/my-jobs'),
          fetchAuth('/api/applications/')
        ]);

        let jobsData = [];
        if (jobsRes.ok) {
          jobsData = await jobsRes.json();
        }
        
        let appsData = [];
        if (appsRes.ok) {
          const appsJson = await appsRes.json();
          appsData = appsJson.data || [];
        }

        // Pipeline Chart Data (Last 7 Days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartDataMap: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          chartDataMap[days[d.getDay()]] = 0;
        }
        
        // Also trend metrics calculations
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        let cvThisWeek = 0;
        let cvLastWeek = 0;
        
        let avgProcessTimeMs = 0;
        let processTimeCount = 0;

        // Calculate avg cosine similarity & fill chart map
        let totalCosine = 0;
        let cosineCount = 0;
        let rejectedByHr = 0;
        appsData.forEach((a: any) => {
          if (a.analisis_cv?.skor_kecocokan) {
            totalCosine += parseFloat(a.analisis_cv.skor_kecocokan);
            cosineCount++;
          }
          if (a.applied_at) {
            const appliedDate = new Date(a.applied_at);
            const dayStr = days[appliedDate.getDay()];
            if (chartDataMap[dayStr] !== undefined) {
              chartDataMap[dayStr]++;
            }
            if (appliedDate >= oneWeekAgo) {
              cvThisWeek++;
            } else if (appliedDate >= new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)) {
              cvLastWeek++;
            }
          }
          if (a.analisis_cv?.waktu_proses_ms) {
            avgProcessTimeMs += a.analisis_cv.waktu_proses_ms;
            processTimeCount++;
          }
          if (a.status === 'ditolak') {
             rejectedByHr++;
          }
        });
        
        const chartData = Object.keys(chartDataMap).map(k => ({ name: k, value: chartDataMap[k] }));
        setPipelineData(chartData);

        const avgScreeningSpeed = processTimeCount > 0 ? (avgProcessTimeMs / processTimeCount / 1000).toFixed(1) : '< 2.5';
        setAvgSpeed(avgScreeningSpeed.toString());

        const trendCvReceived = cvLastWeek === 0 ? `+${cvThisWeek}` : `${cvThisWeek > cvLastWeek ? '+' : ''}${((cvThisWeek - cvLastWeek) / cvLastWeek * 100).toFixed(0)}%`;
        setTrendCv(trendCvReceived);

        // Process Applications Stats to match Pipeline columns
        const cvReceived = appsData.filter((a: any) => a.status === 'upload_cv' || a.status === 'dikirim').length;
        
        const passedScreening = appsData.filter((a: any) => a.status === 'cv_screening' || a.status === 'lolos_cv' || a.status === 'ditolak_sistem').length;
        
        const interviewScheduled = appsData.filter((a: any) => a.status === 'virtual_interview' || a.status === 'video_analysis').length;
        
        const awaitingValidation = appsData.filter((a: any) => a.status === 'human_validation').length;

        // Calculate HR accuracy
        const avgCosineSimilarity = cosineCount > 0 ? (totalCosine / cosineCount).toFixed(1) : 0;
        
        // For HR Accuracy, compute from total applications that passed screening initially
        const totalPassed = appsData.filter((a: any) => !['upload_cv', 'dikirim', 'cv_screening', 'ditolak_sistem'].includes(a.status)).length;
        const hrAccuracy = totalPassed > 0 ? (100 - (rejectedByHr / totalPassed * 100)).toFixed(1) : 0;

        setStats({
          cvReceived,
          passedScreening,
          interviewScheduled,
          awaitingValidation,
          avgCosineSimilarity: avgCosineSimilarity as number,
          aiHrAccuracy: hrAccuracy as number
        });

        // Create Recent Activity
        const sortedApps = [...appsData].sort((a: any, b: any) => new Date(b.updated_at || b.applied_at).getTime() - new Date(a.updated_at || a.applied_at).getTime());
        const recent = sortedApps.slice(0, 5).map((a: any, index: number) => {
          const dateObj = new Date(a.updated_at || a.applied_at);
          
          let icon = UserPlus;
          let iconBg = 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
          let iconColor = 'text-slate-700 dark:text-slate-200';
          let actionText = 'melamar posisi';
          let target = a.job?.judul_posisi || '';

          if (a.status === 'lolos_cv' || a.status === 'video_analysis') {
            icon = BrainCircuit;
            iconBg = 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
            iconColor = 'text-slate-700 dark:text-slate-200';
            actionText = 'lolos AI screening untuk';
          } else if (a.status === 'virtual_interview') {
             icon = Calendar;
             iconBg = 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
             iconColor = 'text-slate-700 dark:text-slate-200';
             actionText = 'menunggu interview untuk';
          } else if (a.status === 'Lolos') {
             icon = CheckCircle2;
             iconBg = 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
             iconColor = 'text-slate-700 dark:text-slate-200';
             actionText = 'diterima (Lolos) pada posisi';
          } else if (a.status === 'ditolak_sistem' || a.status === 'ditolak') {
             icon = Check;
             iconBg = 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
             iconColor = 'text-slate-700 dark:text-slate-200';
             actionText = 'ditolak pada posisi';
          }

          // Format time diff nicely
          const diffMs = new Date().getTime() - dateObj.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          const diffDays = Math.floor(diffHours / 24);
          let timeStr = `${diffMins} mnt lalu`;
          if (diffDays > 0) timeStr = `${diffDays} hari lalu`;
          else if (diffHours > 0) timeStr = `${diffHours} jam lalu`;
          else if (diffMins === 0) timeStr = 'Baru saja';

          return {
            id: a.id || index,
            type: a.status,
            user: a.pelamar?.nama_lengkap || 'Candidate',
            action: actionText,
            target: target,
            time: timeStr,
            icon: icon,
            iconBg: iconBg,
            iconColor: iconColor,
          };
        });
        setRecentActivities(recent);

        // Get Pending Candidates (status === 'human_validation')
        const pending = appsData.filter((a: any) => a.status === 'human_validation').map((a: any) => ({
          id: a.id,
          name: a.pelamar?.nama_lengkap || "Candidate",
          role: a.job?.judul_posisi || "Role",
          education: "-", // Education not exposed in /api/applications/ default
          stage: "human_validation",
          status: "needs_approval",
          cvScore: Math.round(a.analisis_cv?.skor_kecocokan || 0),
          videoUploaded: true,
          videoScores: { ability: 85, intelligent: 92, personality: 78, attitude: 88, emotionalIntelligence: 80 } // Mock video scores for now as they aren't in applications/ list
        }));
        setPendingCandidates(pending);

        // Process Jobs with correct `passed` count
        const rejectedStatuses = ['upload_cv', 'dikirim', 'cv_screening', 'ditolak_sistem', 'ditolak'];
        const mappedJobs = jobsData.slice(0, 3).map((j: any) => {
          const jobApps = appsData.filter((a: any) => a.job?.id === j.id);
          const jobPassed = jobApps.filter((a: any) => !rejectedStatuses.includes(a.status)).length;
          
          return {
            id: j.id,
            title: j.judul_posisi,
            department: j.department || 'Engineering',
            threshold: j.cv_threshold || 80,
            applicants: jobApps.length,
            passed: jobPassed,
            posted: j.created_at ? new Date(j.created_at).toLocaleDateString('id-ID') : 'Baru',
          };
        });
        setActiveJobs(mappedJobs);
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
          </div>
          <p className="text-sm text-muted-foreground mt-1">{t.dashboard.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
        </div>
      </div>

      {/* Executive Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t.dashboard.cvReceived || 'CV DITERIMA'}
          value={stats.cvReceived.toString()}
          subtitle={t.dashboard.cvReceivedSub || 'minggu ini'}
          icon={<Users size={18} />}
          trend={trendCv.startsWith('-') ? 'down' : 'up'}
          trendValue={trendCv}
          iconBgColor="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          iconColor="text-slate-800 dark:text-slate-200"
        />
        <StatCard
          title={t.dashboard.passedScreening || 'LOLOS CV SCREENING'}
          value={stats.passedScreening.toString()}
          subtitle={t.dashboard.passedScreeningSub || 'threshold >= 60%'}
          icon={<BrainCircuit size={18} />}
          trend="neutral"
          trendValue="-"
          iconBgColor="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          iconColor="text-slate-800 dark:text-slate-200"
        />
        <StatCard
          title={t.dashboard.interviewScheduled || 'WAWANCARA VIDEO'}
          value={stats.interviewScheduled.toString()}
          subtitle={t.dashboard.interviewScheduledSub || 'proses analisis AI'}
          icon={<Calendar size={18} />}
          trend="neutral"
          trendValue="-"
          iconBgColor="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          iconColor="text-slate-800 dark:text-slate-200"
        />
        <StatCard
          title={t.dashboard.awaitingValidation || 'MENUNGGU VALIDASI HR'}
          value={stats.awaitingValidation.toString()}
          subtitle={t.dashboard.awaitingValidationSub || 'siap dikonfirmasi HR'}
          icon={<Clock size={18} />}
          trend="neutral"
          trendValue="-"
          iconBgColor="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          iconColor="text-slate-800 dark:text-slate-200"
        />
      </div>

      {/* PENDING HR APPROVAL PANEL */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-foreground">{t.dashboard.pendingApprovalTitle}</h2>
                {pendingCandidates.length > 0 && (
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-[11px] rounded-md">
                    {pendingCandidates.length} Perlu Validasi
                  </span>
                )}
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
          {pendingCandidates.length === 0 ? (
            <div className="col-span-1 md:col-span-2 p-8 text-center bg-muted/20 border border-border rounded-xl">
              <p className="text-sm text-muted-foreground font-medium">Tidak ada kandidat yang menunggu validasi HR saat ini.</p>
            </div>
          ) : (
            pendingCandidates.map((c, i) => (
              <div key={i} className="p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/15 text-primary dark:bg-primary/30 dark:text-blue-300 font-black flex items-center justify-center text-sm border border-primary/30 shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                    {c.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground leading-snug">{c.name}</h4>
                    <p className="text-xs font-semibold text-muted-foreground">{c.role}</p>

                    {c.education && c.education !== "-" && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        <GraduationCap size={12} className="text-slate-600 dark:text-slate-400 shrink-0" />
                        <span>{c.education}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold text-[11px] rounded-md border border-slate-200 dark:border-slate-700">
                        CV Match: {c.cvScore}%
                      </span>
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold text-[11px] rounded-md border border-slate-200 dark:border-slate-700">
                        Video Score: {c.videoScores ? ((c.videoScores.ability + c.videoScores.intelligent + c.videoScores.personality + c.videoScores.attitude + c.videoScores.emotionalIntelligence) / 5).toFixed(1) : '-'}
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
            ))
          )}
        </div>
      </div>

      {/* Main Content Grid (Chart + Jobs & AI Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Columns (Chart + Active Jobs) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Pipeline Growth Chart */}
          <PipelineChart data={pipelineData} />

          {/* ACTIVE JOBS OVERVIEW */}
          <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-sm space-y-4 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center font-bold shrink-0 border border-slate-200 dark:border-slate-700">
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
                      Dipublikasikan {job.posted} &bull; <span>Threshold: {job.threshold}%</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-border/60 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold text-foreground">{job.applicants} Pelamar</p>
                      <p className="text-[11px] text-muted-foreground font-semibold">
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
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center font-bold shrink-0 border border-slate-200 dark:border-slate-700">
                <BrainCircuit size={18} />
              </div>
              <h3 className="font-bold text-base text-foreground">{t.dashboard.aiPerformanceTitle}</h3>
            </div>

            <div className="space-y-3">
              {/* Avg Cosine Similarity */}
              <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">{t.dashboard.avgCosineSimilarity}</span>
                  <span className="font-bold text-primary">{stats.avgCosineSimilarity}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${stats.avgCosineSimilarity}%` }}></div>
                </div>
              </div>

              {/* AI vs HR Accuracy */}
              <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">{t.dashboard.aiHrAccuracy}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.aiHrAccuracy}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${stats.aiHrAccuracy}%` }}></div>
                </div>
              </div>

              {/* Avg Screening Speed */}
              <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">{t.dashboard.avgProcessingSpeed}</p>
                  <p className="text-xs text-muted-foreground">{avgSpeed} Detik per Berkas CV</p>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  Kecepatan Tinggi
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <RecentActivity activities={recentActivities} />

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
