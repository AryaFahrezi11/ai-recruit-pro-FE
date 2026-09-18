'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Calendar as CalendarIcon, Download, Search, FilterX } from 'lucide-react';

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
    <div className="flex flex-col gap-3.5">
      
      {/* Search Bar & Export PDF - Responsive Row/Stack */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5">
        
        {/* Candidate Search Input & Button */}
        <div className="flex relative w-full sm:max-w-md">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t.archive?.searchCandidate || "Cari nama, email, kampus..."}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-8 py-2 bg-background border border-border rounded-l-xl text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  updateUrl({ search: '' });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-1"
                title="Hapus pencarian"
              >
                &times;
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-r-xl transition-colors cursor-pointer border border-primary border-l-0 shrink-0 shadow-xs"
          >
            Cari
          </button>
        </div>

        {/* Action button Export (PDF) */}
        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs shrink-0 cursor-pointer w-full sm:w-auto active:scale-95"
          title="Ekspor Data Laporan Arsip ke PDF"
        >
          <Download size={15} className="text-muted-foreground" />
          <span>{t.archive?.exportData || 'Ekspor Data'} (PDF)</span>
        </button>
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2.5 w-full">
        
        {/* Job Filter Dropdown */}
        <div className="relative flex-1 min-w-[150px]">
          <select 
            value={jobFilter}
            onChange={(e) => updateUrl({ job: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground hover:bg-muted transition-colors font-medium outline-none cursor-pointer"
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
        <div className="relative flex-1 min-w-[130px]">
          <select 
            value={hasilFilter}
            onChange={(e) => updateUrl({ hasil: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground hover:bg-muted transition-colors font-medium outline-none cursor-pointer"
          >
            <option value="">Semua Hasil</option>
            <option value="hired">Diterima (Hired)</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        {/* Date Picker & Reset Filter Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto col-span-1 sm:col-span-2 lg:col-span-1">
          <input 
            type="date" 
            value={date}
            onChange={(e) => updateUrl({ date: e.target.value })}
            className="flex-1 sm:flex-initial sm:w-[150px] px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all [&::-webkit-calendar-picker-indicator]:opacity-60 cursor-pointer"
            title="Pilih tanggal spesifik untuk melihat data lama"
          />

          {hasActiveFilter && (
            <button
              onClick={() => { setLocalSearch(''); updateUrl({ search: '', job: '', date: '', hasil: '' }); }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 active:scale-95"
              title="Reset semua filter"
            >
              <FilterX size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Mode Banner / Notice */}
      <div className="flex items-start sm:items-center justify-between pt-0.5 text-[11px] text-muted-foreground leading-relaxed">
        <div className="flex items-start sm:items-center gap-1.5 font-medium flex-wrap">
          <CalendarIcon size={13} className="text-primary mt-0.5 sm:mt-0 shrink-0" />
          <span>
            {date ? (
              <>Filter Tanggal: <strong className="text-foreground">{new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></>
            ) : (
              <>Default Tampilan: <strong className="text-primary font-semibold">Bulan Ini ({currentMonthName})</strong> &bull; <span className="text-muted-foreground">Pilih tanggal di atas untuk mencari arsip bulan/tahun lain.</span></>
            )}
          </span>
        </div>
      </div>

    </div>
  );
}
