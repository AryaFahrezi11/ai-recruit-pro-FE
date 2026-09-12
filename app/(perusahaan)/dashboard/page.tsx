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

  // Date filter state
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

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

        // Pipeline Chart Data (Based on Date Filter)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartDataMap: Record<string, number> = {};
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        // Populate chart map with days in range
        let curr = new Date(start);
        while (curr <= end) {
          const rangeDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
          let keyStr = '';
          if (rangeDays <= 7) {
            keyStr = days[curr.getDay()];
          } else {
            keyStr = `${curr.getDate()}/${curr.getMonth()+1}`;
          }
          if (!chartDataMap[keyStr]) chartDataMap[keyStr] = 0;
          curr.setDate(curr.getDate() + 1);
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
            if (appliedDate >= start && appliedDate <= end) {
              const rangeDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
              let keyStr = '';
              if (rangeDays <= 7) {
                keyStr = days[appliedDate.getDay()];
              } else {
                keyStr = `${appliedDate.getDate()}/${appliedDate.getMonth()+1}`;
              }
              if (chartDataMap[keyStr] !== undefined) {
                chartDataMap[keyStr]++;
              }
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
        const pending = appsData.filter((a: any) => a.status === 'human_validation').map((a: any) => {
          let videoScores: any = "Belum ada";
          if (a.ai_result?.dimensi_psikologis) {
            const parseScore = (val: string) => parseFloat(val.replace('%', ''));
            videoScores = {
              ability: parseScore(a.ai_result.dimensi_psikologis.Ability || '0'),
              intelligent: parseScore(a.ai_result.dimensi_psikologis.Intelligent || '0'),
              personality: parseScore(a.ai_result.dimensi_psikologis.Personality || '0'),
              attitude: parseScore(a.ai_result.dimensi_psikologis.Attitude || '0'),
              emotionalIntelligence: parseScore(a.ai_result.dimensi_psikologis['Emotional Intelligent'] || '0')
            };
          }
          return {
            id: a.id,
            name: a.pelamar?.nama_lengkap || "Candidate",
            role: a.job?.judul_posisi || "Role",
            education: "-",
            stage: "human_validation",
            status: "needs_approval",
            cvScore: Math.round(a.analisis_cv?.skor_kecocokan || 0),
            videoUploaded: !!a.video_url,
            videoScores: videoScores
          };
        });
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
  }, [startDate, endDate]);

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-16 animate-in fade-in duration-500 font-sans">
      
      {/* Global Header & Date Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.dashboard.title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-7 pr-2 py-1.5 text-[11px] font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all cursor-pointer"
            />
            <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-slate-400 text-xs font-medium px-1">-</span>
          <div className="relative">
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-7 pr-2 py-1.5 text-[11px] font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all cursor-pointer"
            />
            <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 1: Dense Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title={t.dashboard.cvReceived || 'Total CV Masuk'}
          value={stats.cvReceived.toString()}
          icon={<Users size={16} />}
          trend={trendCv.startsWith('-') ? 'down' : 'up'}
          trendValue={trendCv}
        />
        <StatCard
          title={t.dashboard.passedScreening || 'Lolos AI (Threshold)'}
          value={stats.passedScreening.toString()}
          icon={<BrainCircuit size={16} />}
          trend="neutral"
          trendValue="-"
        />
        <StatCard
          title={t.dashboard.interviewScheduled || 'Wawancara Terjadwal'}
          value={stats.interviewScheduled.toString()}
          icon={<Calendar size={16} />}
          trend="neutral"
          trendValue="-"
        />
        <StatCard
          title={t.dashboard.awaitingValidation || 'Perlu Validasi HR'}
          value={stats.awaitingValidation.toString()}
          icon={<Clock size={16} />}
          trend="neutral"
          trendValue="-"
          highlight={stats.awaitingValidation > 0}
        />
      </div>

      {/* Row 2: Action Items (Left 50%) & Pipeline (Right 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left: Pending Validation List (Dense) */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Tindakan Diperlukan</h2>
              {pendingCandidates.length > 0 && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 font-bold text-[10px] uppercase rounded">
                  {pendingCandidates.length} Antrean
                </span>
              )}
            </div>
            <Link href="/pipeline" className="text-[11px] font-bold text-blue-600 hover:underline">
              Buka Pipeline
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {pendingCandidates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                <CheckCircle2 size={24} className="text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Tidak ada antrean validasi.</p>
              </div>
            ) : (
              pendingCandidates.map((c, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg flex items-center justify-between gap-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-black flex items-center justify-center text-xs shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[150px] sm:max-w-[200px]">{c.name}</h4>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase truncate max-w-[150px] sm:max-w-[200px]">{c.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-500">CV: {c.cvScore}%</span>
                      <span className="text-[10px] font-bold text-slate-500">
                        Vid: {typeof c.videoScores === 'string' ? 'N/A' : ((c.videoScores.ability + c.videoScores.intelligent + c.videoScores.personality + c.videoScores.attitude + c.videoScores.emotionalIntelligence) / 5).toFixed(1) + '%'}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedCandidate(c)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 dark:bg-white dark:text-slate-900 dark:hover:bg-blue-500 text-white font-bold text-[10px] rounded-md transition-colors shadow-sm"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Chart & AI Speed */}
        <div className="flex flex-col gap-4">
          <PipelineChart data={pipelineData} />
          
          {/* AI Metrics Compact */}
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Akurasi AI vs HR</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.aiHrAccuracy}%</span>
             </div>
             <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Rata-rata Waktu</span>
                <span className="text-xl font-black text-slate-800 dark:text-slate-200">{avgSpeed} <span className="text-[10px] font-semibold text-slate-500">dtk/CV</span></span>
             </div>
          </div>
        </div>
      </div>

      {/* Row 3: Active Jobs Dense Table */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Lowongan Pekerjaan Aktif</h2>
          <Link href="/jobs" className="text-[11px] font-bold text-blue-600 hover:underline">
            Kelola Lowongan
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="py-2.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Posisi</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Departemen</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dibuat</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Pelamar</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Lolos AI</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activeJobs.map((job, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="py-2.5 px-4 text-xs font-bold text-slate-900 dark:text-slate-100">{job.title}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded">
                      {job.department}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[11px] font-medium text-slate-500">{job.posted}</td>
                  <td className="py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 text-right">{job.applicants}</td>
                  <td className="py-2.5 px-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right">{job.passed}</td>
                  <td className="py-2.5 px-4 text-center">
                    <Link href={`/pipeline`} className="text-[10px] font-bold text-slate-600 hover:text-blue-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      Lihat
                    </Link>
                  </td>
                </tr>
              ))}
              {activeJobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-slate-500">Tidak ada lowongan aktif.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
