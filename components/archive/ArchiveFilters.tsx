'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Calendar as CalendarIcon, Download, Search } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';

export function ArchiveFilters({ 
  search, setSearch, 
  jobFilter, setJobFilter, 
  date, setDate 
}: any) {
  const { t } = useTranslation();
  
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetchAuth('/api/jobs/my-jobs');
        if (res.ok) {
          const data = await res.json();
          const activeJobs = (Array.isArray(data) ? data : []).filter((j: any) => j.status === 'active');
          setJobs(activeJobs);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-t-xl border border-border border-b-0">
      
      <div className="flex flex-wrap items-center gap-3 flex-1 w-full sm:w-auto">
        {/* Candidate Search Input */}
        <div className="relative min-w-[240px] flex-1 sm:flex-initial">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder={t.archive?.searchCandidate || "Search kandidat di arsip (nama, role, kampus)..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Job Dropdown */}
        <select 
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="min-w-[150px] px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground hover:bg-muted transition-colors font-medium outline-none"
        >
          <option value="">{t.archive?.allJobs || "Semua Pekerjaan"}</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id}>
              {job.judul_posisi}
            </option>
          ))}
        </select>

        {/* Date Picker (Mock) */}
        <div className="relative">
          <input 
            type="date" 
            placeholder="mm/dd/yyyy"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-[140px] px-3 py-2 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all [&::-webkit-calendar-picker-indicator]:opacity-50"
          />
        </div>
      </div>

      <button 
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs shrink-0 cursor-pointer"
        title="Ekspor Data Laporan Arsip ke PDF"
      >
        <Download size={16} className="text-muted-foreground" />
        {t.archive?.exportData} (PDF)
      </button>

    </div>
  );
}
