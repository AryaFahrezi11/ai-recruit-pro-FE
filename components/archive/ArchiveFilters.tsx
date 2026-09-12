'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Calendar as CalendarIcon, Download, Search, FilterX } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';

export function ArchiveFilters({ 
  search, 
  jobFilter, 
  hasilFilter,
  date,
  updateUrl,
  availableJobs 
}: any) {
  const { t } = useTranslation();
  
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleSearch = () => {
    updateUrl({ search: localSearch });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const currentMonthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
  const hasActiveFilter = Boolean(search || jobFilter || date || hasilFilter);

  return (
    <div className="flex flex-col gap-3">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 w-full">
          
          {/* Candidate Search Input & Button */}
          <div className="flex relative min-w-[220px] flex-1 sm:flex-initial">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder={t.archive?.searchCandidate || "Cari nama, email, kampus..."}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-l-lg text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-r-lg transition-colors cursor-pointer border border-primary border-l-0"
            >
              Cari
            </button>
          </div>

          {/* Job Filter Dropdown */}
          <div className="relative min-w-[200px]">
            <select 
              value={jobFilter}
              onChange={(e) => updateUrl({ job: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground hover:bg-muted transition-colors font-medium outline-none cursor-pointer"
            >
              <option value="">Semua Lowongan</option>
              {availableJobs.map((job: any, idx: number) => (
                <option key={idx} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {/* Hasil Filter Dropdown */}
          <div className="relative min-w-[150px]">
            <select 
              value={hasilFilter}
              onChange={(e) => updateUrl({ hasil: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground hover:bg-muted transition-colors font-medium outline-none cursor-pointer"
            >
              <option value="">Semua Hasil</option>
              <option value="hired">Diterima (Hired)</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>

          {/* Date Picker (mm/dd/yyyy) */}
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={date}
              onChange={(e) => updateUrl({ date: e.target.value })}
              className="w-[145px] px-3 py-2 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all [&::-webkit-calendar-picker-indicator]:opacity-60 cursor-pointer"
              title="Pilih tanggal spesifik untuk melihat data lama"
            />
          </div>

          {/* Reset Filter Button */}
          {hasActiveFilter && (
            <button
              onClick={() => { setLocalSearch(''); updateUrl({ search: '', job: '', date: '', hasil: '' }); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              title="Reset semua filter"
            >
              <FilterX size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs shrink-0 cursor-pointer self-end md:self-auto"
          title="Ekspor Data Laporan Arsip ke PDF"
        >
          <Download size={15} className="text-muted-foreground" />
          {t.archive?.exportData || 'Ekspor Data'} (PDF)
        </button>
      </div>

      {/* Active Mode Banner / Notice */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium">
          <CalendarIcon size={13} className="text-primary" />
          <span>
            {date ? (
              <>Filter Tanggal: <strong className="text-foreground">{new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></>
            ) : (
              <>Default Tampilan: <strong className="text-primary font-semibold">Bulan Ini ({currentMonthName})</strong> &bull; <span className="text-slate-400">Pilih tanggal di atas untuk melihat arsip bulan/tanggal lain.</span></>
            )}
          </span>
        </div>
      </div>

    </div>
  );
}
