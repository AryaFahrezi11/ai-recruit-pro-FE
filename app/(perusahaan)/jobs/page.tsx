'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Briefcase, Plus, Search, Filter, Eye, Edit, Trash2, Copy, 
  CheckCircle2, Clock, AlertCircle, Sparkles, MapPin, Users,
  ArrowRight, FileText, Check
} from 'lucide-react';

interface JobItem {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  mode: string;
  salary: string;
  status: 'published' | 'draft' | 'closed';
  threshold: number;
  questionsCount: number;
  applicantsCount: number;
  passedCount: number;
  dateCreated: string;
}

export default function JobOpeningsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mock list of jobs
  const [jobs, setJobs] = useState<JobItem[]>([
    {
      id: 'job-1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      type: 'Full-time',
      location: 'Jakarta',
      mode: 'Hybrid',
      salary: 'Rp 18.000.000 - Rp 25.000.000',
      status: 'published',
      threshold: 80,
      questionsCount: 5,
      applicantsCount: 42,
      passedCount: 28,
      dateCreated: '27 Jul 2026',
    },
    {
      id: 'job-2',
      title: 'Backend Engineer (Go/Node.js)',
      department: 'Engineering',
      type: 'Full-time',
      location: 'Bandung',
      mode: 'Remote',
      salary: 'Rp 16.000.000 - Rp 22.000.000',
      status: 'published',
      threshold: 85,
      questionsCount: 5,
      applicantsCount: 35,
      passedCount: 19,
      dateCreated: '24 Jul 2026',
    },
    {
      id: 'job-3',
      title: 'UI/UX Product Designer',
      department: 'Design',
      type: 'Full-time',
      location: 'Jakarta',
      mode: 'On-site',
      salary: 'Rp 14.000.000 - Rp 19.000.000',
      status: 'draft',
      threshold: 75,
      questionsCount: 4,
      applicantsCount: 0,
      passedCount: 0,
      dateCreated: '28 Jul 2026',
    },
    {
      id: 'job-4',
      title: 'AI Machine Learning Specialist',
      department: 'Engineering',
      type: 'Full-time',
      location: 'Jakarta',
      mode: 'Hybrid',
      salary: 'Rp 22.000.000 - Rp 30.000.000',
      status: 'draft',
      threshold: 80,
      questionsCount: 5,
      applicantsCount: 0,
      passedCount: 0,
      dateCreated: '28 Jul 2026',
    },
    {
      id: 'job-5',
      title: 'HR Talent Acquisition Officer',
      department: 'HR',
      type: 'Contract',
      location: 'Jakarta',
      mode: 'On-site',
      salary: 'Rp 8.000.000 - Rp 12.000.000',
      status: 'closed',
      threshold: 70,
      questionsCount: 3,
      applicantsCount: 54,
      passedCount: 12,
      dateCreated: '10 Jun 2026',
    },
  ]);

  const handleCopyLink = (jobTitle: string) => {
    navigator.clipboard.writeText(`https://recruitpro.ai/jobs/apply?title=${encodeURIComponent(jobTitle)}`);
    setCopiedId(jobTitle);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleJobStatus = (id: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === id) {
        const newStatus = job.status === 'published' ? 'draft' : 'published';
        return { ...job, status: newStatus };
      }
      return job;
    }));
  };

  const handleDeleteJob = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus draf lowongan "${title}"?`)) {
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  // Filtering
  const filteredJobs = jobs.filter(job => {
    const matchesTab = activeTab === 'all' || job.status === activeTab;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || job.department === departmentFilter;

    return matchesTab && matchesSearch && matchesDept;
  });

  const totalPublished = jobs.filter(j => j.status === 'published').length;
  const totalDrafts = jobs.filter(j => j.status === 'draft').length;
  const totalApplicants = jobs.reduce((acc, curr) => acc + curr.applicantsCount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t.jobs.listTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.jobs.listSubtitle}</p>
        </div>

        <Link
          href="/jobs/new"
          className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md shadow-primary/20 shrink-0 active:scale-95"
        >
          <Plus size={16} />
          {t.jobs.title}
        </Link>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-5 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t.jobs.activeJobsCount}</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{totalPublished}</p>
            <span className="text-[11px] text-muted-foreground font-medium">Lowongan aktif dipublikasi</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center font-bold">
            <Briefcase size={22} />
          </div>
        </div>

        <div className="p-5 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t.jobs.draftJobsCount}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{totalDrafts}</p>
            <span className="text-[11px] text-muted-foreground font-medium">Tersimpan dalam draf</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold">
            <FileText size={22} />
          </div>
        </div>

        <div className="p-5 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t.jobs.totalApplicantsCount}</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">{totalApplicants}</p>
            <span className="text-[11px] text-muted-foreground font-medium">Dari seluruh lowongan aktif</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
        </div>

      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Status Filter Tabs */}
          <div className="flex gap-1.5 p-1.5 bg-muted/50 rounded-xl overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: t.jobs.allJobs, count: jobs.length },
              { id: 'published', label: t.jobs.published, count: totalPublished },
              { id: 'draft', label: t.jobs.draft, count: totalDrafts },
              { id: 'closed', label: t.jobs.closed, count: jobs.filter(j => j.status === 'closed').length },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Department Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari posisi atau departemen..."
                className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary font-medium"
              />
            </div>

            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3.5 py-2 bg-muted/30 border border-border rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="All">Semua Departemen</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="HR">HR</option>
            </select>
          </div>

        </div>

      </div>

      {/* Jobs List Grid */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="p-12 bg-card border border-border rounded-xl text-center space-y-3">
            <AlertCircle className="mx-auto text-muted-foreground" size={36} />
            <h3 className="font-bold text-base text-foreground">Tidak Ada Lowongan Ditemukan</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Tidak ada lowongan yang sesuai dengan kriteria pencarian atau status filter saat ini.
            </p>
          </div>
        ) : (
          filteredJobs.map(job => {
            const isPublished = job.status === 'published';
            const isDraft = job.status === 'draft';

            return (
              <div 
                key={job.id} 
                className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-all space-y-4"
              >
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                      <h3 className="font-bold text-base text-foreground hover:text-primary transition-colors cursor-pointer">
                        {job.title}
                      </h3>
                      <span className="px-2.5 py-0.5 bg-muted/80 text-foreground text-[10px] font-bold rounded-md border border-border">
                        {job.department}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-3 flex-wrap">
                      <span>{job.type}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><MapPin size={13} /> {job.mode} ({job.location})</span>
                      <span>&bull;</span>
                      <span className="font-semibold text-foreground">{job.salary}</span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPublished && (
                      <span className="px-3.5 py-1 bg-emerald-100 text-emerald-950 font-bold border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700 text-xs rounded-full flex items-center gap-1.5 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                        Dipublikasikan • Active
                      </span>
                    )}
                    {isDraft && (
                      <span className="px-3.5 py-1 bg-slate-100 text-slate-900 font-bold border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 text-xs rounded-full flex items-center gap-1.5 shadow-2xs">
                        <FileText size={13} className="text-slate-600 dark:text-slate-400" />
                        Draf • Belum Dipublikasikan
                      </span>
                    )}
                    {job.status === 'closed' && (
                      <span className="px-3.5 py-1 bg-rose-100 text-rose-950 font-bold border border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700 text-xs rounded-full flex items-center gap-1.5 shadow-2xs">
                        Ditutup
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Config & Metrics Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-muted/30 border border-border rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold block mb-0.5">{t.jobs.thresholdAI}</span>
                    <span className="font-bold text-primary flex items-center gap-1">
                      <Sparkles size={13} className="text-amber-500" />
                      PO-FIT {job.threshold}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold block mb-0.5">Wawancara Video</span>
                    <span className="font-bold text-foreground">
                      {job.questionsCount} Pertanyaan AI
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold block mb-0.5">Pelamar Masuk</span>
                    <span className="font-bold text-foreground">
                      {job.applicantsCount} Pelamar <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">({job.passedCount} Lolos CV)</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold block mb-0.5">Tanggal Dibuat</span>
                    <span className="font-semibold text-muted-foreground">
                      {job.dateCreated}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-border">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Status: <strong className="text-foreground">{job.status.toUpperCase()}</strong>
                  </span>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    
                    {/* Copy Link (For Published Jobs) */}
                    {isPublished && (
                      <button 
                        onClick={() => handleCopyLink(job.title)}
                        className="px-3.5 py-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                        title="Salin link pendaftaran pelamar"
                      >
                        {copiedId === job.title ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        {copiedId === job.title ? 'Tersalin!' : t.jobs.copyLink}
                      </button>
                    )}

                    {/* Edit Job */}
                    <Link 
                      href="/jobs/new"
                      className="px-3.5 py-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Edit size={13} />
                      {t.jobs.editJob}
                    </Link>

                    {/* View Pipeline (For Published Jobs) */}
                    {isPublished && (
                      <Link 
                        href="/pipeline"
                        className="px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Eye size={13} />
                        {t.jobs.viewPipeline}
                      </Link>
                    )}

                    {/* Toggle Status (Publish / Unpublish) */}
                    <button 
                      onClick={() => toggleJobStatus(job.id)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors border shadow-2xs ${
                        isPublished 
                          ? 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' 
                          : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {isPublished ? 'Jadikan Draf' : 'Publikasikan Sekarang'}
                    </button>

                    {/* Delete Job (For Drafts) */}
                    {isDraft && (
                      <button 
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-100/80 dark:hover:bg-rose-950/40 rounded-lg transition-colors ml-1"
                        title="Hapus Draf"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}

                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
