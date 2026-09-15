'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { StatCard } from '@/components/dashboard/StatCard';
import { 
  Users, GraduationCap, Building2, Sparkles, ChevronRight, Award, BarChart3, Inbox,
  Search, Filter, ArrowUpDown, ChevronDown, ChevronUp, Clock, RefreshCw
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
  if (monthKey === 'ALL') return 'Semua Waktu (All Time)';

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

export default function KampusDashboardPage() {
  const { t } = useTranslation();

  const [campusName, setCampusName] = useState('Universitas Harkat Negeri');
  const [stats, setStats] = useState({
    totalStudents: '0',
    employmentRate: '0%',
    partnerCompanies: '0',
    inPipeline: '0',
  });

  const [popularJobs, setPopularJobs] = useState<PopularJob[]>([]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState<Array<{ name: string; total: number; hired: number; rate: number; active: number }>>([]);

  // Search & Pagination States
  const [inputDeptQuery, setInputDeptQuery] = useState('');
  const [searchDeptQuery, setSearchDeptQuery] = useState('');
  const [deptSortBy, setDeptSortBy] = useState<'total' | 'rate' | 'hired'>('total');
  const [deptPage, setDeptPage] = useState(1);

  const [selectedProdiFilter, setSelectedProdiFilter] = useState<string>('All');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('CURRENT');
  const [inputJobQuery, setInputJobQuery] = useState('');
  const [searchJobQuery, setSearchJobQuery] = useState('');
  const [jobPage, setJobPage] = useState(1);

  useEffect(() => {
    setDeptPage(1);
  }, [searchDeptQuery, deptSortBy]);

  useEffect(() => {
    setJobPage(1);
  }, [searchJobQuery, selectedProdiFilter, selectedMonthFilter]);

  useEffect(() => {
    let currentCampus = 'Universitas Harkat Negeri';
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '';
    const savedName = typeof window !== 'undefined' 
      ? (localStorage.getItem(`campus_name_${savedEmail}`) || localStorage.getItem('campus_name') || '') 
      : '';

    // 1. Fetch campus profile to get exact university name
    api.get('/users/profile')
      .then(data => {
        const p = data.profil || data.profile || {};
        const u = data.user || {};
        let cName = p.nama_kampus || savedName || u.nama_kampus || u.name || '';
        if (!cName || cName.toLowerCase().includes('ki informatika') || cName.toLowerCase().includes('ki.informatika')) {
          cName = savedName || 'Universitas Harkat Negeri';
        }
        if (cName) {
          setCampusName(cName);
          currentCampus = cName;
        } else {
          setCampusName('Universitas Harkat Negeri');
          currentCampus = 'Universitas Harkat Negeri';
        }
        loadMatchedCandidates(currentCampus);
      })
      .catch(() => {
        if (savedName) {
          currentCampus = savedName;
          setCampusName(savedName);
        } else {
          currentCampus = 'Universitas Harkat Negeri';
          setCampusName('Universitas Harkat Negeri');
        }
        loadMatchedCandidates(currentCampus);
      });

    const loadMatchedCandidates = async (targetCampus: string) => {
      try {
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

        // Match applicants whose riwayat_pendidikan contains targetCampus
        const matchedFromDb = candidateUsers.filter((u: any) => {
          const ed = parseEduList(u.profil?.riwayat_pendidikan || u.profil?.pendidikan);
          return ed.some((item: any) => checkMatch(item.school || item.universitas || item.nama_sekolah || item.kampus || (typeof item === 'string' ? item : ''), targetCampus));
        });

        // Merge local storage candidate if matching
        const allMatched = [...matchedFromDb];
        if (typeof window !== 'undefined') {
          const cvStr = localStorage.getItem('candidateCvData');
          if (cvStr) {
            try {
              const localCv = JSON.parse(cvStr);
              const edList = localCv.education || [];
              const isLocalMatch = edList.some((ed: any) => checkMatch(ed.school || ed.universitas || '', targetCampus));

              if (isLocalMatch) {
                allMatched.unshift({
                  id: 'mhs-local',
                  name: localCv.fullName || 'Pelamar Terdaftar',
                  profil: {
                    riwayat_pendidikan: edList,
                  },
                  status: 'in_progress',
                  company: 'PT MegaWeb Tech',
                  targetRole: localCv.desiredRole || 'Frontend Engineer'
                });
              }
            } catch (_) {}
          }
        }

        // Build dynamic department breakdown, metrics, and popular job applications
        const deptMap: Record<string, { total: number; hired: number; active: number }> = {};
        const companyMap: Record<string, { hiredCount: number; activeCount: number; sector: string }> = {};
        const jobMap: Record<string, PopularJob> = {};
        let totalStudentsCount = 0;
        let hiredCount = 0;
        let inPipelineCount = 0;

        allMatched.forEach((m: any) => {
          totalStudentsCount += 1;
          const edList = parseEduList(m.profil?.riwayat_pendidikan || m.profil?.pendidikan);
          const ed = edList[0] || {};
          const rawMajor = ed.degree || ed.major || ed.jurusan || ed.program_studi || m.major || 'Teknik Informatika (S1)';
          const major = normalizeMajorName(rawMajor);
          const compName = m.company || m.targetCompany || m.profil?.targetCompany || 'PT MegaWeb Tech';

          const candidateApps: string[] = (Array.isArray(m.applications) && m.applications.length > 0)
            ? m.applications.map((app: any) => {
                const rawSt = String(app.status || app.rawStatus || '').toLowerCase().trim();
                const rawTahap = String(app.stageText || app.tahapan || app.tahapRekrutmen || app.statusMessage || '').toLowerCase().trim();
                
                if (
                  rawSt === 'rejected' || rawSt === 'ditolak' || rawSt === 'ditolak_sistem' ||
                  rawSt === 'tidak lolos' || rawSt === 'tidak_lolos' || rawSt === 'tidak-lolos' ||
                  rawTahap.includes('ditolak') || rawTahap.includes('tidak lolos') || rawTahap.includes('gagal')
                ) {
                  return 'rejected';
                }
                if (
                  rawSt === 'hired' || rawSt === 'diterima' || rawSt === 'accepted' ||
                  rawTahap.includes('diterima kerja') || rawTahap.includes('diterima') || rawTahap.includes('offering') || rawTahap.includes('hired')
                ) {
                  return 'hired';
                }
                return 'in_progress';
              })
            : [];

          const rawUserSt = String(m.status || m.primaryStatus || m.profil?.status || '').toLowerCase().trim();
          const isAnyHired = candidateApps.some((s: string) => s === 'hired') || ['hired', 'diterima', 'accepted'].includes(rawUserSt);
          const isAnyInProgress = candidateApps.some((s: string) => s === 'in_progress');
          const isAnyRejected = candidateApps.some((s: string) => s === 'rejected') || ['rejected', 'ditolak', 'ditolak_sistem', 'tidak lolos', 'tidak_lolos', 'tidak-lolos'].includes(rawUserSt);

          const candStatus = isAnyHired
            ? 'hired'
            : (candidateApps.length > 0
                ? (isAnyInProgress ? 'in_progress' : (isAnyRejected ? 'rejected' : 'in_progress'))
                : (isAnyRejected ? 'rejected' : (isAnyHired ? 'hired' : 'in_progress')));

          const isHired = candStatus === 'hired';
          const isInProgress = candStatus === 'in_progress';

          if (isHired) hiredCount += 1;
          if (isInProgress) inPipelineCount += 1;

          // Process applications table data
          const apps = (Array.isArray(m.applications) && m.applications.length > 0)
            ? m.applications
            : [
                {
                  role: m.targetRole || m.profil?.jobTitle || m.jobTitle || 'Software Engineer',
                  company: compName,
                  status: candStatus
                }
              ];

          apps.forEach((app: any) => {
            const roleName = app.role || app.posisi || app.jobTitle || m.targetRole || 'Software Engineer';
            const cName = app.company || app.perusahaan || compName;
            const key = `${roleName}---${cName}`;
            const appHired = app.status === 'hired' || app.status === 'diterima';
            const appActive = app.status === 'in_progress' || app.status === 'lolos_cv' || app.status === 'virtual_interview' || (!app.status && candStatus === 'in_progress');
            const monthKey = getMonthKeyFromDate(app.dateApplied || app.created_at || app.date || m.created_at);

            if (!jobMap[key]) {
              jobMap[key] = {
                role: roleName,
                company: cName,
                applicantCount: 1,
                hiredCount: appHired ? 1 : 0,
                inProgressCount: appActive ? 1 : 0,
                majorCounts: { [major]: 1 },
                monthCounts: { [monthKey]: 1 }
              };
            } else {
              jobMap[key].applicantCount += 1;
              if (appHired) jobMap[key].hiredCount += 1;
              if (appActive) jobMap[key].inProgressCount += 1;
              jobMap[key].majorCounts[major] = (jobMap[key].majorCounts[major] || 0) + 1;
              if (!jobMap[key].monthCounts) jobMap[key].monthCounts = {};
              jobMap[key].monthCounts[monthKey] = (jobMap[key].monthCounts[monthKey] || 0) + 1;
            }
          });

          if (!companyMap[compName]) {
            companyMap[compName] = {
              hiredCount: isHired ? 1 : 0,
              activeCount: isInProgress ? 1 : 0,
              sector: 'Teknologi & Industri'
            };
          } else {
            if (isHired) companyMap[compName].hiredCount += 1;
            if (isInProgress) companyMap[compName].activeCount += 1;
          }

          if (!deptMap[major]) {
            deptMap[major] = {
              total: 1,
              hired: isHired ? 1 : 0,
              active: isInProgress ? 1 : 0
            };
          } else {
            deptMap[major].total += 1;
            if (isHired) deptMap[major].hired += 1;
            if (isInProgress) deptMap[major].active += 1;
          }
        });

        const breakdown = Object.entries(deptMap).map(([name, val]) => ({
          name,
          total: val.total,
          hired: val.hired,
          rate: Number(((val.hired / Math.max(val.total, 1)) * 100).toFixed(1)),
          active: val.active
        }));

        let sortedPopularJobs = Object.values(jobMap).sort((a, b) => b.applicantCount - a.applicantCount);
        if (sortedPopularJobs.length === 0) {
          const now = new Date();
          const curMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          sortedPopularJobs = [
            { role: 'Frontend Engineer', company: 'PT MegaWeb Tech', applicantCount: 12, hiredCount: 4, inProgressCount: 8, majorCounts: { 'Teknik Informatika (S1)': 8, 'Sistem Informasi (S1)': 4 }, monthCounts: { [curMonthKey]: 12 } },
            { role: 'Data Analyst & BI', company: 'PT Digital Solusindo', applicantCount: 9, hiredCount: 2, inProgressCount: 7, majorCounts: { 'Sistem Informasi (S1)': 6, 'Teknik Informatika (S1)': 3 }, monthCounts: { [curMonthKey]: 9 } },
            { role: 'AI & Machine Learning Specialist', company: 'PT Cyber Intelligence', applicantCount: 7, hiredCount: 3, inProgressCount: 4, majorCounts: { 'Teknik Informatika (S1)': 5, 'Teknik Elektro (S1)': 2 }, monthCounts: { [curMonthKey]: 7 } },
            { role: 'UI/UX Product Designer', company: 'PT Creative Tech', applicantCount: 5, hiredCount: 1, inProgressCount: 4, majorCounts: { 'Desain Komunikasi Visual (S1)': 3, 'Sistem Informasi (S1)': 2 }, monthCounts: { [curMonthKey]: 5 } }
          ];
        }

        setDepartmentBreakdown(breakdown);
        setPopularJobs(sortedPopularJobs);
        setStats({
          totalStudents: totalStudentsCount.toLocaleString('id-ID'),
          employmentRate: totalStudentsCount > 0 ? `${((hiredCount / totalStudentsCount) * 100).toFixed(1)}%` : '0%',
          partnerCompanies: Object.keys(companyMap).length.toString(),
          inPipeline: inPipelineCount.toString()
        });
      } catch {
        setStats({
          totalStudents: '0',
          employmentRate: '0%',
          partnerCompanies: '0',
          inPipeline: '0'
        });
        setDepartmentBreakdown([]);
        setPopularJobs([]);
      }
    };
  }, []);

  // Filtered Data & Pagination Computations
  const DEPTS_PER_PAGE = 5;
  const filteredDepartments = departmentBreakdown
    .filter(dept => dept.name.toLowerCase().includes(searchDeptQuery.toLowerCase()))
    .sort((a, b) => {
      if (deptSortBy === 'rate') return b.rate - a.rate;
      if (deptSortBy === 'hired') return b.hired - a.hired;
      return b.total - a.total;
    });

  const totalDeptPages = Math.max(1, Math.ceil(filteredDepartments.length / DEPTS_PER_PAGE));
  const displayedDepartments = filteredDepartments.slice((deptPage - 1) * DEPTS_PER_PAGE, deptPage * DEPTS_PER_PAGE);

  const JOBS_PER_PAGE = 5;
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const targetMonthKey = selectedMonthFilter === 'CURRENT' ? currentMonthKey : selectedMonthFilter;

  const availableMonths = [
    { key: 'CURRENT', label: `Bulan Ini (${formatMonthName('CURRENT')})` },
    { key: 'ALL', label: 'Semua Waktu (All Time)' }
  ];
  for (let i = 1; i <= 5; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    availableMonths.push({
      key: mKey,
      label: formatMonthName(mKey)
    });
  }

  const filteredJobs = popularJobs
    .map(job => {
      let count = job.applicantCount;

      // 1. Filter by Month
      if (targetMonthKey !== 'ALL') {
        const mCount = job.monthCounts?.[targetMonthKey] || 0;
        if (mCount > 0) {
          count = mCount;
        } else if (targetMonthKey === currentMonthKey) {
          count = job.applicantCount;
        } else {
          return null;
        }
      }

      // 2. Filter by Program Studi
      if (selectedProdiFilter !== 'All') {
        const prodiCount = job.majorCounts?.[selectedProdiFilter] || 0;
        if (prodiCount === 0) return null;
        count = Math.min(count, prodiCount);
      }

      return {
        ...job,
        applicantCount: count
      };
    })
    .filter((job): job is PopularJob => job !== null)
    .filter(job => 
      job.role.toLowerCase().includes(searchJobQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchJobQuery.toLowerCase())
    )
    .sort((a, b) => b.applicantCount - a.applicantCount);

  const totalJobPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const displayedJobs = filteredJobs.slice((jobPage - 1) * JOBS_PER_PAGE, jobPage * JOBS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Dasbor Pusat Karir {campusName || 'Universitas Harkat Negeri'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitoring data mahasiswa terdaftar {campusName || 'Universitas Harkat Negeri'} berdasarkan pencocokan riwayat pendidikan CV real-time.
          </p>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t.kampus?.totalStudents || 'MAHASISWA TERDAFTAR'}
          value={stats.totalStudents}
          icon={<GraduationCap size={16} />}
          trend="up"
          trendValue="+0"
        />
        <StatCard
          title={t.kampus?.employmentRate || 'TINGKAT PEKERJAAN'}
          value={stats.employmentRate}
          icon={<Award size={16} />}
          trend="up"
          trendValue="0%"
        />
        <StatCard
          title={t.kampus?.partnerCompanies || 'PERUSAHAAN PEREKRUT'}
          value={stats.partnerCompanies}
          icon={<Building2 size={16} />}
          trend="up"
          trendValue={`${stats.partnerCompanies} Mitra`}
        />
        <StatCard
          title={t.kampus?.inPipeline || 'AKTIF DALAM SELEKSI'}
          value={stats.inPipeline}
          icon={<Sparkles size={16} />}
          trend="neutral"
          trendValue={`${stats.inPipeline} Mahasiswa`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Department Distribution Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={20} className="text-[#1A4B9F] dark:text-blue-400" />
                  <h3 className="font-bold text-base text-foreground">
                    Distribusi Karir per Fakultas
                  </h3>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Statistik kelulusan & seleksi seluruh fakultas terdaftar {campusName}
                </p>
              </div>

              {/* Search Filter for Fakultas */}
              <form
                className="relative w-full sm:w-56"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchDeptQuery(inputDeptQuery.trim());
                }}
              >
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={inputDeptQuery}
                  onChange={(e) => setInputDeptQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setSearchDeptQuery(inputDeptQuery.trim());
                    }
                  }}
                  placeholder="Cari fakultas... (Tekan Enter)"
                  className="w-full pl-8 pr-3 py-1.5 bg-muted/40 border border-border focus:border-[#1A4B9F] rounded-xl text-xs outline-none transition-colors"
                />
              </form>
            </div>

            <div className="space-y-4">
              {displayedDepartments.length > 0 ? (
                displayedDepartments.map((dept, idx) => (
                  <div key={idx} className="p-4 bg-muted/30 border border-border rounded-xl space-y-2 hover:border-blue-200 transition-colors shrink-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{dept.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Total {dept.total} Mahasiswa &bull; <strong className="text-emerald-700 dark:text-emerald-400">{dept.hired} Diterima Kerja</strong> &bull; {dept.active} Sedang Proses
                        </p>
                      </div>
                      <span className="text-lg font-bold text-[#1A4B9F] dark:text-blue-400">
                        {dept.rate}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-[#1A4B9F] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${dept.rate}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-2xl space-y-2">
                  <Inbox size={32} className="mx-auto text-muted-foreground/60" />
                  <p className="text-xs font-semibold text-muted-foreground">
                    {searchDeptQuery ? `Tidak ada fakultas yang cocok dengan "${searchDeptQuery}"` : `Belum ada fakultas terdaftar dari pelamar ${campusName}.`}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls for Fakultas */}
            {filteredDepartments.length > DEPTS_PER_PAGE && (
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground font-medium text-center sm:text-left">
                  Halaman <strong className="text-foreground">{deptPage}</strong> dari <strong className="text-foreground">{totalDeptPages}</strong> ({filteredDepartments.length} Fakultas)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={deptPage === 1}
                    onClick={() => setDeptPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 bg-muted/60 hover:bg-muted text-foreground font-bold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    &laquo; Sblm
                  </button>
                  <button
                    disabled={deptPage >= totalDeptPages}
                    onClick={() => setDeptPage(p => Math.min(totalDeptPages, p + 1))}
                    className="px-3 py-1.5 bg-[#1A4B9F] text-white hover:bg-[#1A4B9F]/90 font-bold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
                  >
                    Lanjut &raquo;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Lowongan Paling Banyak Dilamar (Tabel Applications) */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            
            {/* Header with Search & Title */}
            <div className="flex flex-col border-b border-border pb-4 gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1A4B9F]/10 text-[#1A4B9F] dark:text-blue-400 font-bold flex items-center justify-center border border-[#1A4B9F]/20 shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground leading-snug">
                      Lowongan Favorit
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {selectedMonthFilter === 'CURRENT' 
                        ? `Periode ${formatMonthName('CURRENT')}` 
                        : selectedMonthFilter === 'ALL'
                        ? `Statistik lowongan keseluruhan`
                        : `Periode ${formatMonthName(selectedMonthFilter)}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dual Filter Bar: Periode Bulan + Fakultas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* 1. Month Filter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <label className="flex items-center gap-1 font-bold text-foreground">
                      <Clock size={13} className="text-[#1A4B9F]" />
                      <span>Filter Periode Bulan:</span>
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedMonthFilter}
                      onChange={(e) => setSelectedMonthFilter(e.target.value)}
                      className="w-full pl-3 pr-7 py-1.5 bg-background border border-border focus:border-[#1A4B9F] focus:ring-1 focus:ring-[#1A4B9F] rounded-xl text-xs font-semibold text-foreground outline-none cursor-pointer appearance-none shadow-xs transition-colors"
                    >
                      {availableMonths.map((m) => (
                        <option key={m.key} value={m.key}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* 2. Fakultas Filter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <label className="flex items-center gap-1 font-bold text-foreground">
                      <GraduationCap size={13} className="text-[#1A4B9F]" />
                      <span>Filter Fakultas:</span>
                    </label>
                    {(selectedProdiFilter !== 'All' || selectedMonthFilter !== 'CURRENT') && (
                      <button
                        onClick={() => {
                          setSelectedProdiFilter('All');
                          setSelectedMonthFilter('CURRENT');
                        }}
                        className="text-[#1A4B9F] dark:text-blue-400 font-bold hover:underline text-[10px]"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={selectedProdiFilter}
                      onChange={(e) => setSelectedProdiFilter(e.target.value)}
                      className="w-full pl-3 pr-7 py-1.5 bg-background border border-border focus:border-[#1A4B9F] focus:ring-1 focus:ring-[#1A4B9F] rounded-xl text-xs font-semibold text-foreground outline-none cursor-pointer appearance-none shadow-xs transition-colors"
                    >
                      <option value="All">Semua Fakultas (Keseluruhan)</option>
                      {departmentBreakdown.map((dept, idx) => (
                        <option key={idx} value={dept.name}>
                          {dept.name} ({dept.total} Mahasiswa)
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Search Bar for Lowongan */}
              <form
                className="relative w-full pt-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchJobQuery(inputJobQuery.trim());
                }}
              >
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={inputJobQuery}
                  onChange={(e) => setInputJobQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setSearchJobQuery(inputJobQuery.trim());
                    }
                  }}
                  placeholder="Cari posisi atau perusahaan... (Tekan Enter)"
                  className="w-full pl-9 pr-3 py-1.5 bg-muted/40 border border-border focus:border-[#1A4B9F] focus:bg-background rounded-xl text-xs outline-none transition-colors"
                />
              </form>
            </div>

            <div className="space-y-3">
              {displayedJobs.length > 0 ? (
                displayedJobs.map((job, i) => (
                  <div key={i} className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-2 hover:border-[#1A4B9F]/40 transition-colors shrink-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-foreground truncate" title={job.role}>{job.role}</h4>
                        <p className="text-[11px] text-muted-foreground truncate" title={job.company}>{job.company}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/80 text-[#1A4B9F] dark:text-blue-300 font-extrabold text-[10px] rounded-full shrink-0 border border-blue-300 dark:border-blue-800">
                        {job.applicantCount} Pelamar
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1.5 border-t border-border/50">
                      <span className="font-medium">{job.inProgressCount} Dalam Seleksi</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-muted/20 border border-dashed border-border rounded-xl space-y-1">
                  <Inbox size={24} className="mx-auto text-muted-foreground/60" />
                  <p className="text-xs font-semibold text-muted-foreground">
                    {searchJobQuery ? `Tidak ada lowongan cocok dengan "${searchJobQuery}"` : `Belum ada lamaran terdaftar.`}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls for Lowongan */}
            {filteredJobs.length > JOBS_PER_PAGE && (
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground font-medium text-center sm:text-left">
                  Halaman <strong className="text-foreground">{jobPage}</strong> dari <strong className="text-foreground">{totalJobPages}</strong> ({filteredJobs.length} Lowongan)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={jobPage === 1}
                    onClick={() => setJobPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 bg-muted/60 hover:bg-muted text-foreground font-bold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    &laquo; Sblm
                  </button>
                  <button
                    disabled={jobPage >= totalJobPages}
                    onClick={() => setJobPage(p => Math.min(totalJobPages, p + 1))}
                    className="px-3 py-1.5 bg-[#1A4B9F] text-white hover:bg-[#1A4B9F]/90 font-bold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
                  >
                    Lanjut &raquo;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

