'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { StatCard } from '@/components/dashboard/StatCard';
import { 
  Users, GraduationCap, Building2, CheckCircle2, TrendingUp, 
  ArrowRight, Briefcase, Sparkles, ChevronRight, Award, BarChart3
} from 'lucide-react';

export default function KampusDashboardPage() {
  const { t } = useTranslation();

  // Mock Top Recruiting Companies
  const topCompanies = [
    { name: 'PT MegaWeb Tech', sector: 'Software & Technology', hiredCount: 42, activeCount: 18, logo: 'MW' },
    { name: 'PT FinanceCorp Indonesia', sector: 'Banking & Financial', hiredCount: 28, activeCount: 12, logo: 'FC' },
    { name: 'PT DataGlobal Solusindo', sector: 'AI & Data Analytics', hiredCount: 24, activeCount: 15, logo: 'DG' },
    { name: 'PT Creative Design Hub', sector: 'Digital Product Design', hiredCount: 18, activeCount: 8, logo: 'CD' },
  ];

  // Mock Department Breakdown
  const departmentBreakdown = [
    { name: 'Teknik Informatika (S1)', total: 420, hired: 310, rate: 73.8, active: 65 },
    { name: 'Sistem Informasi (S1)', total: 350, hired: 245, rate: 70.0, active: 52 },
    { name: 'Desain Komunikasi Visual (S1)', total: 280, hired: 182, rate: 65.0, active: 38 },
    { name: 'Teknik Elektro (S1)', total: 200, hired: 118, rate: 59.0, active: 30 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {t.kampus?.dashboardTitle || 'Dasbor Rekrutmen Kampus'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.kampus?.dashboardSubtitle || 'Pantau karir mahasiswa terdaftar, tingkat kelulusan kerja, dan mitra perusahaan.'}
          </p>
        </div>

        <Link 
          href="/kampus/mahasiswa"
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-md shadow-violet-600/20 shrink-0 active:scale-95"
        >
          <Users size={16} />
          Lihat Data & Tracker Mahasiswa
        </Link>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t.kampus?.totalStudents || 'MAHASISWA TERDAFTAR'}
          value="1,250"
          subtitle="Tercatat dalam portal karir"
          icon={<GraduationCap size={20} />}
          trend="up"
          trendValue="+142"
          iconBgColor="bg-violet-100 dark:bg-violet-950/50"
          iconColor="text-violet-600 dark:text-violet-400"
        />
        <StatCard
          title={t.kampus?.employmentRate || 'TINGKAT DITERIMA KERJA'}
          value="68.4%"
          subtitle="855 Mahasiswa telah bekerja"
          icon={<Award size={20} />}
          trend="up"
          trendValue="+5.2%"
          iconBgColor="bg-emerald-100 dark:bg-emerald-950/50"
          iconColor="text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          title={t.kampus?.partnerCompanies || 'PERUSAHAAN PEREKRUT'}
          value="48"
          subtitle="Mitra industri aktif"
          icon={<Building2 size={20} />}
          trend="up"
          trendValue="+8 Mitra"
          iconBgColor="bg-blue-100 dark:bg-blue-950/50"
          iconColor="text-blue-700 dark:text-blue-400"
        />
        <StatCard
          title={t.kampus?.inPipeline || 'AKTIF DALAM SELEKSI'}
          value="185"
          subtitle="Sedang proses di AI Pipeline"
          icon={<Sparkles size={20} />}
          trend="neutral"
          trendValue="185 Mahasiswa"
          iconBgColor="bg-amber-100 dark:bg-amber-950/50"
          iconColor="text-amber-800 dark:text-amber-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Department Distribution Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-violet-600" />
                <h3 className="font-bold text-base text-foreground">
                  {t.kampus?.departmentDistribution || 'Distribusi Karir per Program Studi'}
                </h3>
              </div>

              <Link href="/kampus/mahasiswa" className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1">
                Filter Jurusan
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {departmentBreakdown.map((dept, idx) => (
                <div key={idx} className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{dept.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Total {dept.total} Mahasiswa &bull; <strong className="text-emerald-700 dark:text-emerald-400">{dept.hired} Diterima Kerja</strong> &bull; {dept.active} Sedang Proses
                      </p>
                    </div>
                    <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                      {dept.rate}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-violet-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${dept.rate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Top Hiring Companies */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-violet-600" />
                <h3 className="font-bold text-base text-foreground">
                  {t.kampus?.topCompanies || 'Top Perusahaan Perekrut'}
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {topCompanies.map((c, i) => (
                <div key={i} className="p-3.5 bg-muted/30 border border-border rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center text-xs border border-violet-300 shrink-0">
                      {c.logo}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{c.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{c.sector}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{c.hiredCount} Diterima</p>
                    <p className="text-[10px] text-muted-foreground">{c.activeCount} Dalam Proses</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <Link 
                href="/kampus/mahasiswa"
                className="text-xs font-bold text-violet-600 hover:underline flex items-center justify-center gap-1"
              >
                Lihat Seluruh Mahasiswa Terdaftar
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
