'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Plus, Search, Filter, Briefcase, MapPin, Clock, Users, CheckCircle2,
  AlertCircle, FileText, ExternalLink, Copy, Check, MoreVertical, Edit,
  Trash2, Sparkles, Sliders, Eye, ArrowUpRight
} from 'lucide-react';

export interface JobItem {
  id: string;
  title: string;
  department: string;
  type: string;
  mode: string;
  location: string;
  status: 'published' | 'draft' | 'closed';
  threshold: number;
  applicantsCount: number;
  passedCount: number;
  questionsCount: number;
  dateCreated: string;
  deadline: string;
  salary: string;
}

const INITIAL_JOBS: JobItem[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    type: 'Full-time',
    mode: 'Hybrid',
    location: 'Jakarta',
    status: 'published',
    threshold: 80,
    applicantsCount: 42,
    passedCount: 28,
    questionsCount: 5,
    dateCreated: '27 Jul 2026',
    deadline: '31 Aug 2026',
    salary: 'Rp 18.000.000 - Rp 28.000.000',
  },
  {
    id: 'job-2',
    title: 'Backend Engineer (Go/Node.js)',
    department: 'Engineering',
    type: 'Full-time',
    mode: 'Remote',
    location: 'Indonesia',
    status: 'published',
    threshold: 85,
    applicantsCount: 35,
    passedCount: 19,
    questionsCount: 5,
    dateCreated: '24 Jul 2026',
    deadline: '25 Aug 2026',
    salary: 'Rp 20.000.000 - Rp 30.000.000',
  },
  {
    id: 'job-3',
    title: 'UI/UX Product Designer',
    department: 'Design',
    type: 'Full-time',
    mode: 'On-site',
    location: 'Jakarta',
    status: 'published',
    threshold: 75,
    applicantsCount: 28,
    passedCount: 15,
    questionsCount: 4,
    dateCreated: '20 Jul 2026',
    deadline: '20 Aug 2026',
    salary: 'Rp 14.000.000 - Rp 22.000.000',
  },
  {
    id: 'job-4',
    title: 'Product Manager AI',
    department: 'Product',
    type: 'Full-time',
    mode: 'Hybrid',
    location: 'Jakarta',
    status: 'draft',
    threshold: 80,
    applicantsCount: 0,
    passedCount: 0,
    questionsCount: 5,
    dateCreated: '28 Jul 2026 (Draf)',
    deadline: 'Belum diatur',
    salary: 'Rp 25.000.000 - Rp 38.000.000',
  },
  {
    id: 'job-5',
    title: 'DevOps & Cloud Engineer',
    department: 'Engineering',
    type: 'Contract',
    mode: 'Remote',
    location: 'Indonesia',
    status: 'draft',
    threshold: 80,
    applicantsCount: 0,
    passedCount: 0,
    questionsCount: 4,
    dateCreated: '27 Jul 2026 (Draf)',
    deadline: 'Belum diatur',
    salary: 'Rp 16.000.000 - Rp 25.000.000',
  },
  {
    id: 'job-6',
    title: 'Data Scientist (NLP / Machine Learning)',
    department: 'Engineering',
    type: 'Full-time',
    mode: 'Hybrid',
    location: 'Bandung',
    status: 'published',
    threshold: 80,
    applicantsCount: 18,
    passedCount: 9,
    questionsCount: 5,
    dateCreated: '15 Jul 2026',
    deadline: '15 Aug 2026',
    salary: 'Rp 22.000.000 - Rp 35.000.000',
  },
  {
    id: 'job-7',
    title: 'HR Talent Acquisition Specialist',
    department: 'HR',
    type: 'Full-time',
    mode: 'On-site',
    location: 'Jakarta',
    status: 'draft',
    threshold: 75,
    applicantsCount: 0,
    passedCount: 0,
    questionsCount: 3,
    dateCreated: '25 Jul 2026 (Draf)',
    deadline: 'Belum diatur',
    salary: 'Rp 10.000.000 - Rp 15.000.000',
  },
  {
    id: 'job-8',
    title: 'QA Automation Engineer',
    department: 'Engineering',
    type: 'Full-time',
    mode: 'Remote',
    location: 'Indonesia',
    status: 'closed',
    threshold: 80,
    applicantsCount: 52,
    passedCount: 31,
    questionsCount: 4,
    dateCreated: '01 Jun 2026',
    deadline: '01 Jul 2026 (Selesai)',
    salary: 'Rp 15.000.000 - Rp 22.000.000',
  },
];

export default function JobsPage() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobItem[]>(INITIAL_JOBS);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle Job Status (Publish <-> Draft)
  const toggleJobStatus = (jobId: string) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        const newStatus = job.status === 'published' ? 'draft' : 'published';
        showToast(
          newStatus === 'published' 
            ? `Lowongan "${job.title}" telah dipublikasikan!` 
            : `Lowongan "${job.title}" disimpan sebagai draf.`
        );
        return { ...job, status: newStatus };
      }
      return job;
    }));
  };

  // Copy Public Link
  const handleCopyLink = (jobTitle: string) => {
    navigator.clipboard.writeText('http://localhost:3000/wawancara');
    showToast(`Link pendaftaran "${jobTitle}" disalin ke clipboard!`);
  };

  // Delete Job
  const handleDeleteJob = (jobId: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus draf lowongan "${title}"?`)) {
      setJobs(jobs.filter(j => j.id !== jobId));
      showToast(`Lowongan "${title}" telah dihapus.`);
    }
  };

  // Filtered jobs
  const filteredJobs = jobs.filter(job => {
    const matchesTab = activeTab === 'all' || job.status === activeTab;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || job.department === departmentFilter;
    return matchesTab && matchesSearch && matchesDept;
  });

  // Metrics
  const totalPublished = jobs.filter(j => j.status === 'published').length;
  const totalDrafts = jobs.filter(j => j.status === 'draft').length;
  const totalApplicants = jobs.reduce((acc, j) => acc + j.applicantsCount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Notification Floating Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white dark:bg-card dark:text-card-foreground border border-border px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t.jobs.listTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.jobs.listSubtitle}</p>
        </div>

        <Link 
          href="/jobs/new"
          className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          {t.sidebar.createNewJob}
        </Link>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t.jobs.activeJobsCount}</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{totalPublished}</p>
            <span className="text-[10px] text-muted-foreground">Lowongan aktif dipublikasi</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="p-5 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t.jobs.draftJobsCount}</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{totalDrafts}</p>
            <span className="text-[10px] text-muted-foreground">Tersimpan dalam draf</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <FileText size={24} />
          </div>
        </div>

        <div className="p-5 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t.jobs.totalApplicantsCount}</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{totalApplicants}</p>
            <span className="text-[10px] text-muted-foreground">Dari seluruh lowongan aktif</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Status Filter Tabs */}
          <div className="flex gap-1 p-1 bg-muted/40 rounded-lg overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: t.jobs.allJobs, count: jobs.length },
              { id: 'published', label: t.jobs.published, count: totalPublished },
              { id: 'draft', label: t.jobs.draft, count: totalDrafts },
              { id: 'closed', label: t.jobs.closed, count: jobs.filter(j => j.status === 'closed').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id 
                    ? 'bg-card text-primary shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
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
                className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
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
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-base text-foreground hover:text-primary transition-colors cursor-pointer">
                        {job.title}
                      </h3>
                      <span className="px-2.5 py-0.5 bg-muted text-muted-foreground text-[10px] font-semibold rounded-full border border-border">
                        {job.department}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                      <span>{job.type}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {job.mode} ({job.location})</span>
                      <span>&bull;</span>
                      <span>{job.salary}</span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPublished && (
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Dipublikasikan • Active
                      </span>
                    )}
                    {isDraft && (
                      <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
                        <FileText size={12} />
                        Draf • Belum Dipublikasikan
                      </span>
                    )}
                    {job.status === 'closed' && (
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-border text-xs font-semibold rounded-full flex items-center gap-1.5">
                        Ditutup
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Config & Metrics Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/20 border border-border rounded-lg text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">{t.jobs.thresholdAI}</span>
                    <span className="font-bold text-primary flex items-center gap-1">
                      <Sparkles size={12} className="text-amber-500" />
                      PO-FIT {job.threshold}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Wawancara Video</span>
                    <span className="font-semibold text-foreground">
                      {job.questionsCount} Pertanyaan AI
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Pelamar Masuk</span>
                    <span className="font-semibold text-foreground">
                      {job.applicantsCount} Pelamar <span className="text-emerald-600 text-[10px]">({job.passedCount} Lolos CV)</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Batas Pendaftaran</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Clock size={12} className="text-muted-foreground" />
                      {job.deadline}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground">
                    Dibuat: {job.dateCreated}
                  </span>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    
                    {/* Copy Link (For Published Jobs) */}
                    {isPublished && (
                      <button 
                        onClick={() => handleCopyLink(job.title)}
                        className="px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                        title="Salin link pendaftaran pelamar"
                      >
                        <Copy size={13} />
                        {t.jobs.copyLink}
                      </button>
                    )}

                    {/* Edit Job */}
                    <Link 
                      href="/jobs/new"
                      className="px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Edit size={13} />
                      {t.jobs.editJob}
                    </Link>

                    {/* View Pipeline (For Published Jobs) */}
                    {isPublished && (
                      <Link 
                        href="/pipeline"
                        className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Eye size={13} />
                        {t.jobs.viewPipeline}
                      </Link>
                    )}

                    {/* Toggle Status (Publish / Unpublish) */}
                    <button 
                      onClick={() => toggleJobStatus(job.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                        isPublished 
                          ? 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100' 
                          : 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                      }`}
                    >
                      {isPublished ? 'Jadikan Draf' : 'Publikasikan Sekarang'}
                    </button>

                    {/* Delete Job (For Drafts) */}
                    {isDraft && (
                      <button 
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
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
