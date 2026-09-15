'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { StatCard } from '@/components/dashboard/StatCard';
import { 
  Users, GraduationCap, Building2, Sparkles, ChevronRight, Award, BarChart3, Inbox,
  Search, Filter, ArrowUpDown, ChevronDown, ChevronUp, Clock, RefreshCw, Briefcase, 
  CheckCircle2, AlertCircle, ArrowUpRight, CheckCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { fetchAuth } from '@/lib/api/auth';
import { normalizeMajorName } from '@/lib/utils/major';

function parseEduList(raw: any): Array<Record<string, any>> {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object' && raw !== null) return [raw];
  if (typeof raw === 'string') {
    try {
      let parsed = JSON.parse(raw);
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch (_) {}
      }
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'object' && parsed !== null) return [parsed];
    } catch (_) {}
    const match = raw.match(/"school"\s*:\s*"([^"]+)"/i) || raw.match(/"universitas"\s*:\s*"([^"]+)"/i);
    if (match) return [{ school: match[1] }];
    return [{ school: raw }];
  }
  return [];
}

function getMonthKeyFromDate(dateStr?: string): string {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!dateStr || dateStr === 'Terbaru' || dateStr === 'Baru Saja') return currentKey;

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
  } catch (_) {}

  return currentKey;
}

function formatMonthName(monthKey: string): string {
  const now = new Date();
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  if (monthKey === 'CURRENT') {
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  }
  if (monthKey === 'ALL') return 'Semua Periode';

  const [yearStr, monthStr] = monthKey.split('-');
  const mIndex = parseInt(monthStr, 10) - 1;
  if (months[mIndex]) {
    return `${months[mIndex]} ${yearStr}`;
  }
  return monthKey;
}

interface PopularJob {
  role: string;
  company: string;
  applicantCount: number;
  hiredCount: number;
  inProgressCount: number;
  majorCounts: Record<string, number>;
  monthCounts?: Record<string, number>;
}

interface RecentActivity {
  id: string;
  studentName: string;
  major: string;
  role: string;
  company: string;
  status: 'hired' | 'in_progress' | 'rejected';
  stageText: string;
  dateApplied: string;
}

export default function KampusDashboardPage() {
  const { t } = useTranslation();

  const [campusName, setCampusName] = useState('Universitas Harkat Negeri');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [rightPanelTab, setRightPanelTab] = useState<'jobs' | 'activity'>('jobs');

  const [stats, setStats] = useState({
    totalStudents: '0',
    employmentRate: '0%',
    partnerCompanies: '0',
    inPipeline: '0',
  });

  const [popularJobs, setPopularJobs] = useState<PopularJob[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState<Array<{ name: string; total: number; hired: number; rate: number; active: number }>>([]);

  // Search & Filter States
  const [searchDeptQuery, setSearchDeptQuery] = useState('');
  const [deptSortBy, setDeptSortBy] = useState<'total' | 'rate' | 'hired'>('rate');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');
  const [searchJobQuery, setSearchJobQuery] = useState('');

  const updateSyncTimestamp = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSyncTime(timeStr);
  };

  const loadData = async () => {
    setIsRefreshing(true);
    let currentCampus = 'Universitas Harkat Negeri';
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '';
    const savedName = typeof window !== 'undefined' 
      ? (localStorage.getItem(`campus_name_${savedEmail}`) || localStorage.getItem('campus_name') || '') 
      : '';

    try {
      // 1. Fetch campus profile to get exact university name
      const profileData = await api.get('/users/profile').catch(() => null);
      if (profileData) {
        const p = profileData.profil || profileData.profile || {};
        const u = profileData.user || {};
        let cName = p.nama_kampus || savedName || u.nama_kampus || u.name || '';
        if (!cName || cName.toLowerCase().includes('ki informatika') || cName.toLowerCase().includes('ki.informatika')) {
          cName = savedName || 'Universitas Harkat Negeri';
        }
        if (cName) {
          setCampusName(cName);
          currentCampus = cName;
        }
      } else if (savedName) {
        setCampusName(savedName);
        currentCampus = savedName;
      }

      // 2. Load all registered pelamar from backend
      const res = await fetchAuth('/api/admin/users?role=pelamar');
      const candidateUsers: any[] = res.ok ? await res.json() : [];

      const checkMatch = (sStr: string, tComp: string) => {
        if (!sStr) return false;
        if (!tComp || tComp.trim() === '' || tComp === 'Pusat Karir Kampus') return true;

        const sLower = sStr.toLowerCase().trim();
        let tLower = tComp.toLowerCase().trim();

        if (savedEmail && savedEmail.includes('@')) {
          const domainSlug = savedEmail.split('@')[1].split('.')[0];
          if (domainSlug && domainSlug.length >= 3) {
            tLower += ` ${domainSlug}`;
          }
        }

        if (sLower.includes(tLower) || tLower.includes(sLower)) return true;

        const sAlpha = sLower.replace(/[^a-z0-9]/g, '');
        const tAlpha = tLower.replace(/[^a-z0-9]/g, '');

        if (!sAlpha || !tAlpha) return false;
        if (sAlpha.includes(tAlpha) || tAlpha.includes(sAlpha)) return true;

        const kwTokens = tAlpha.split(/universitas|institut|politeknik|sekolah|tinggi|akademi|stmik|univ|ac|id/g).filter(k => k.length >= 3);
        for (const kw of kwTokens) {
          if (sAlpha.includes(kw)) return true;
        }

        const sTokens = sAlpha.split(/universitas|institut|politeknik|sekolah|tinggi|akademi|stmik|univ/g).filter(k => k.length >= 3);
        for (const kw of sTokens) {
          if (tAlpha.includes(kw)) return true;
        }

        return false;
      };

      // Match applicants whose riwayat_pendidikan matches targetCampus
      const matchedFromDb = candidateUsers.filter((u: any) => {
        const ed = parseEduList(u.profil?.riwayat_pendidikan || u.profil?.pendidikan);
        return ed.some((item: any) => checkMatch(item.school || item.universitas || item.nama_sekolah || item.kampus || (typeof item === 'string' ? item : ''), currentCampus));
      });

      // Build real metrics and breakdowns without dummy data
      const deptMap: Record<string, { total: number; hired: number; active: number }> = {};
      const companyMap: Set<string> = new Set();
      const jobMap: Record<string, PopularJob> = {};
      const activities: RecentActivity[] = [];

      let totalStudentsCount = 0;
      let hiredCount = 0;
      let inPipelineCount = 0;

      matchedFromDb.forEach((m: any) => {
        totalStudentsCount += 1;
        const edList = parseEduList(m.profil?.riwayat_pendidikan || m.profil?.pendidikan);
        const ed = edList[0] || {};
        const rawMajor = ed.degree || ed.major || ed.jurusan || ed.program_studi || m.profil?.jurusan || 'Teknik Informatika (S1)';
        const major = normalizeMajorName(rawMajor);
        const studentName = m.name || m.profil?.nama_lengkap || m.email?.split('@')[0] || 'Mahasiswa';

        const rawUserSt = String(m.status || m.profil?.status || '').toLowerCase().trim();
        const appsList = Array.isArray(m.applications) ? m.applications : [];

        let isStudentHired = false;
        let isStudentInProgress = false;

        appsList.forEach((app: any) => {
          const rawSt = String(app.status || app.rawStatus || '').toLowerCase().trim();
          const rawTahap = String(app.stageText || app.tahapan || app.tahapRekrutmen || app.statusMessage || '').toLowerCase().trim();

          let appStatus: 'hired' | 'rejected' | 'in_progress' = 'in_progress';
          if (
            rawSt === 'rejected' || rawSt === 'ditolak' || rawSt === 'ditolak_sistem' ||
            rawSt === 'tidak lolos' || rawSt === 'tidak_lolos' || rawSt === 'tidak-lolos' ||
            rawTahap.includes('ditolak') || rawTahap.includes('tidak lolos') || rawTahap.includes('gagal')
          ) {
            appStatus = 'rejected';
          } else if (
            rawSt === 'hired' || rawSt === 'diterima' || rawSt === 'accepted' ||
            rawTahap.includes('diterima') || rawTahap.includes('diterima kerja') || rawTahap.includes('hired')
          ) {
            appStatus = 'hired';
            isStudentHired = true;
          } else {
            appStatus = 'in_progress';
            isStudentInProgress = true;
          }

          const roleName = app.role || app.jobTitle || app.posisi || 'Software Engineer';
          const cName = app.company || app.companyName || app.nama_perusahaan || 'Perusahaan Mitra';
          if (cName && cName !== '-') companyMap.add(cName);

          const monthKey = getMonthKeyFromDate(app.applied_at || app.dateApplied || app.created_at);
          const jobKey = `${roleName}---${cName}`;

          if (!jobMap[jobKey]) {
            jobMap[jobKey] = {
              role: roleName,
              company: cName,
              applicantCount: 1,
              hiredCount: appStatus === 'hired' ? 1 : 0,
              inProgressCount: appStatus === 'in_progress' ? 1 : 0,
              majorCounts: { [major]: 1 },
              monthCounts: { [monthKey]: 1 }
            };
          } else {
            jobMap[jobKey].applicantCount += 1;
            if (appStatus === 'hired') jobMap[jobKey].hiredCount += 1;
            if (appStatus === 'in_progress') jobMap[jobKey].inProgressCount += 1;
            jobMap[jobKey].majorCounts[major] = (jobMap[jobKey].majorCounts[major] || 0) + 1;
            if (!jobMap[jobKey].monthCounts) jobMap[jobKey].monthCounts = {};
            jobMap[jobKey].monthCounts[monthKey] = (jobMap[jobKey].monthCounts[monthKey] || 0) + 1;
          }

          // Add to recent activity
          activities.push({
            id: app.id || `${m.id}-${activities.length}`,
            studentName,
            major,
            role: roleName,
            company: cName,
            status: appStatus,
            stageText: app.stageText || (appStatus === 'hired' ? 'Diterima Kerja' : appStatus === 'rejected' ? 'Ditolak Seleksi' : 'Dalam Seleksi'),
            dateApplied: app.applied_at || app.dateApplied || 'Terbaru',
          });
        });

        if (isStudentHired || ['hired', 'diterima', 'accepted'].includes(rawUserSt)) {
          hiredCount += 1;
        } else if (isStudentInProgress || appsList.length > 0) {
          inPipelineCount += 1;
        }

        // Department breakdown
        if (!deptMap[major]) {
          deptMap[major] = {
            total: 1,
            hired: isStudentHired ? 1 : 0,
            active: isStudentInProgress ? 1 : 0,
          };
        } else {
          deptMap[major].total += 1;
          if (isStudentHired) deptMap[major].hired += 1;
          if (isStudentInProgress) deptMap[major].active += 1;
        }
      });

      const breakdown = Object.entries(deptMap).map(([name, val]) => ({
        name,
        total: val.total,
        hired: val.hired,
        rate: Number(((val.hired / Math.max(val.total, 1)) * 100).toFixed(1)),
        active: val.active
      }));

      const sortedPopularJobs = Object.values(jobMap).sort((a, b) => b.applicantCount - a.applicantCount);

      setDepartmentBreakdown(breakdown);
      setPopularJobs(sortedPopularJobs);
      setRecentActivities(activities.slice(0, 15));

      // Compute stats
      setStats({
        totalStudents: totalStudentsCount.toLocaleString('id-ID'),
        employmentRate: totalStudentsCount > 0 ? `${((hiredCount / totalStudentsCount) * 100).toFixed(1)}%` : '0%',
        partnerCompanies: companyMap.size.toString(),
        inPipeline: inPipelineCount.toString()
      });

      updateSyncTimestamp();
    } catch (e) {
      console.error('Error loading campus dashboard data:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return departmentBreakdown
      .filter(d => d.name.toLowerCase().includes(searchDeptQuery.toLowerCase()))
      .sort((a, b) => {
        if (deptSortBy === 'rate') return b.rate - a.rate;
        if (deptSortBy === 'hired') return b.hired - a.hired;
        return b.total - a.total;
      });
  }, [departmentBreakdown, searchDeptQuery, deptSortBy]);

  // Filtered Jobs
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const availableMonths = useMemo(() => {
    const list = [
      { key: 'ALL', label: 'Semua Periode' },
      { key: currentMonthKey, label: `Bulan Ini (${formatMonthName('CURRENT')})` }
    ];
    for (let i = 1; i <= 4; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      list.push({ key: mKey, label: formatMonthName(mKey) });
    }
    return list;
  }, [currentMonthKey]);

  const filteredJobs = useMemo(() => {
    return popularJobs
      .filter(job => {
        if (selectedMonthFilter !== 'ALL') {
          const mCount = job.monthCounts?.[selectedMonthFilter] || 0;
          if (mCount === 0) return false;
        }
        if (searchJobQuery) {
          const q = searchJobQuery.toLowerCase();
          return job.role.toLowerCase().includes(q) || job.company.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => b.applicantCount - a.applicantCount);
  }, [popularJobs, selectedMonthFilter, searchJobQuery]);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4.5rem)] flex flex-col space-y-3.5 pb-2 animate-in fade-in duration-200">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card border border-border/80 rounded-2xl px-5 py-3.5 shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A4B9F]/10 border border-[#1A4B9F]/20 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground tracking-tight">
                Dasbor Pusat Karir & Penyerapan Kerja
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-[#1A4B9F] dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                {campusName}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monitoring serapan kerja lulusan & aktivitas seleksi real-time dari database
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 border border-border/70 rounded-lg text-[11px] text-muted-foreground font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sinkron DB: {lastSyncTime || 'Baru saja'}</span>
          </div>

          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 hover:bg-muted text-foreground border border-border text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            title="Muat ulang data database"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Segarkan</span>
          </button>

          <Link
            href="/campus/students"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1A4B9F] hover:bg-[#1A4B9F]/90 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
          >
            <span>Data Mahasiswa</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* 4 Executive KPI Stat Cards (Compact) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <StatCard
          title="TOTAL MAHASISWA"
          value={stats.totalStudents}
          icon={<GraduationCap size={18} />}
          trend="neutral"
          trendValue="Terdaftar di DB"
          highlight={true}
        />
        <StatCard
          title="TINGKAT PENYERAPAN"
          value={stats.employmentRate}
          icon={<Award size={18} />}
          trend="up"
          trendValue="Diterima Kerja"
        />
        <StatCard
          title="MITRA PERUSAHAAN"
          value={stats.partnerCompanies}
          icon={<Building2 size={18} />}
          trend="neutral"
          trendValue="Perusahaan Aktif"
        />
        <StatCard
          title="DALAM PIPELINE SELEKSI"
          value={stats.inPipeline}
          icon={<Sparkles size={18} />}
          trend="up"
          trendValue="Proses Seleksi"
        />
      </div>

      {/* Main Dual-Panel Workspace (Fills single screen viewport) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* Left Column (7 cols): Program Studi & Fakultas Placement Distribution */}
        <div className="lg:col-span-7 flex flex-col min-h-0 bg-card border border-border/80 rounded-2xl p-4 shadow-2xs">
          
          {/* Panel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/80 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#1A4B9F] dark:text-blue-300 flex items-center justify-center font-bold shrink-0">
                <GraduationCap size={16} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Distribusi Serapan per Program Studi
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {departmentBreakdown.length} Program Studi terdeteksi dari riwayat pendidikan pelamar
                </p>
              </div>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari program studi..."
                  value={searchDeptQuery}
                  onChange={(e) => setSearchDeptQuery(e.target.value)}
                  className="w-36 sm:w-44 pl-7 pr-2.5 py-1 text-xs bg-muted/40 border border-border rounded-lg outline-none focus:border-[#1A4B9F] transition-colors"
                />
              </div>

              <select
                value={deptSortBy}
                onChange={(e) => setDeptSortBy(e.target.value as any)}
                className="text-xs bg-muted/40 border border-border rounded-lg px-2.5 py-1 font-semibold text-foreground outline-none cursor-pointer"
                title="Urutkan"
              >
                <option value="rate">Serapan Tertinggi</option>
                <option value="total">Jumlah Mahasiswa</option>
                <option value="hired">Diterima Terbanyak</option>
              </select>
            </div>
          </div>

          {/* Panel Body: Scrollable list of departments */}
          <div className="flex-1 min-h-0 overflow-y-auto mt-3 pr-1.5 space-y-2.5">
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((dept, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-muted/20 hover:bg-muted/40 border border-border/70 rounded-xl transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground truncate" title={dept.name}>
                          {dept.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Total {dept.total} Mahasiswa &bull; <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{dept.hired} Diterima</strong> &bull; {dept.active} Dalam Seleksi
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950 text-[#1A4B9F] dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        {dept.rate}% Serapan
                      </span>
                    </div>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-linear-to-r from-[#1A4B9F] to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(dept.rate, dept.total > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                <Inbox size={28} className="opacity-40" />
                <p className="text-xs font-semibold">
                  {searchDeptQuery ? `Tidak ada program studi dengan kata kunci "${searchDeptQuery}"` : 'Belum ada data program studi mahasiswa yang terdaftar di database.'}
                </p>
                <p className="text-[11px] text-muted-foreground/80 max-w-xs">
                  Data otomatis terisi saat profil pelamar mencantumkan riwayat pendidikan pada kampus ini.
                </p>
              </div>
            )}
          </div>

          {/* Panel Footer Summary */}
          <div className="pt-2.5 mt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 font-medium">
            <span>Menampilkan {filteredDepartments.length} Program Studi</span>
            <span>Rata-Rata Serapan: <strong className="text-foreground font-bold">{stats.employmentRate}</strong></span>
          </div>

        </div>

        {/* Right Column (5 cols): Dynamic Dual-Tab (Lowongan Populer vs. Aktivitas Rekrutmen Terkini) */}
        <div className="lg:col-span-5 flex flex-col min-h-0 bg-card border border-border/80 rounded-2xl p-4 shadow-2xs">
          
          {/* Segmented Header Controls */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/80 shrink-0">
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
              <button
                onClick={() => setRightPanelTab('jobs')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  rightPanelTab === 'jobs'
                    ? 'bg-card text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 size={13} />
                <span>Lowongan Populer</span>
              </button>
              <button
                onClick={() => setRightPanelTab('activity')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  rightPanelTab === 'activity'
                    ? 'bg-card text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock size={13} />
                <span>Aktivitas Terkini</span>
              </button>
            </div>

            {rightPanelTab === 'jobs' && (
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                className="text-[11px] bg-muted/40 border border-border rounded-lg px-2 py-1 font-semibold text-foreground outline-none cursor-pointer"
                title="Filter Bulan"
              >
                {availableMonths.map(m => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* TAB 1: LOWONGAN POPULER */}
          {rightPanelTab === 'jobs' && (
            <div className="flex-1 min-h-0 flex flex-col">
              
              {/* Search Bar for Jobs */}
              <div className="relative my-2 shrink-0">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari posisi pekerjaan / perusahaan..."
                  value={searchJobQuery}
                  onChange={(e) => setSearchJobQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1 text-xs bg-muted/30 border border-border rounded-lg outline-none focus:border-[#1A4B9F] transition-colors"
                />
              </div>

              {/* Jobs List */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-muted/20 hover:bg-muted/40 border border-border/70 rounded-xl transition-all space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-foreground truncate" title={job.role}>
                            {job.role}
                          </h3>
                          <p className="text-[11px] text-muted-foreground font-medium truncate" title={job.company}>
                            {job.company}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-[#1A4B9F] dark:text-blue-300 border border-blue-200 dark:border-blue-900 rounded-full font-bold text-[10px] shrink-0">
                          {job.applicantCount} Pelamar
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[10px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={11} />
                          {job.hiredCount} Diterima
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Sparkles size={11} />
                          {job.inProgressCount} Dalam Seleksi
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                    <Briefcase size={28} className="opacity-40" />
                    <p className="text-xs font-semibold">
                      {searchJobQuery ? `Tidak ada lowongan dengan kata kunci "${searchJobQuery}"` : 'Belum ada lamaran lowongan terdaftar di database.'}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80 max-w-xs">
                      Lamaran mahasiswa ke lowongan perusahaan akan otomatis ditampilkan di sini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AKTIVITAS REKRUTMEN TERKINI */}
          {rightPanelTab === 'activity' && (
            <div className="flex-1 min-h-0 flex flex-col pt-2">
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
                {recentActivities.length > 0 ? (
                  recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 bg-muted/20 hover:bg-muted/40 border border-border/70 rounded-xl transition-all flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground truncate" title={act.studentName}>
                            {act.studentName}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            ({act.major})
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          Melamar: <strong className="text-foreground font-semibold">{act.role}</strong> &bull; {act.company}
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        {act.status === 'hired' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Diterima
                          </span>
                        )}
                        {act.status === 'in_progress' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                            Seleksi
                          </span>
                        )}
                        {act.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            Tidak Lolos
                          </span>
                        )}
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {act.dateApplied.split(' ')[0] || 'Terbaru'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                    <Clock size={28} className="opacity-40" />
                    <p className="text-xs font-semibold">
                      Belum ada riwayat aktivitas lamaran mahasiswa terdaftar.
                    </p>
                    <p className="text-[11px] text-muted-foreground/80 max-w-xs">
                      Setiap tahapan seleksi mahasiswa akan tercatat secara otomatis di sini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panel Footer */}
          <div className="pt-2.5 mt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 font-medium">
            <span>Data bersumber dari database rekrutmen</span>
            <Link 
              href="/campus/students"
              className="flex items-center gap-1 text-[#1A4B9F] dark:text-blue-400 font-bold hover:underline"
            >
              <span>Kelola Mahasiswa</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
