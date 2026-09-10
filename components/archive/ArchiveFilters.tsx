'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Calendar as CalendarIcon, Download, Search, FilterX } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';

export function ArchiveFilters({ 
  search, setSearch, 
  jobFilter, setJobFilter, 
  date, setDate 
}: any) {
  const { t } = useTranslation();
  
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [catRes, jobRes] = await Promise.all([
          fetchAuth('/api/jobs/categories'),
          fetchAuth('/api/jobs/my-jobs')
        ]);

        const categorySet = new Set<string>();

        if (catRes.ok) {
          const catsData = await catRes.json();
          if (Array.isArray(catsData)) {
            catsData.forEach((c: any) => {
              if (c.nama_kategori && c.nama_kategori.trim()) {
                categorySet.add(c.nama_kategori.trim());
              }
            });
          }
        }

        if (jobRes.ok) {
          const jobsData = await jobRes.json();
          if (Array.isArray(jobsData)) {
            jobsData.forEach((j: any) => {
              const catName = j.kategori?.nama_kategori || j.kategori_nama || j.kategori;
              if (catName && typeof catName === 'string' && catName.trim()) {
                categorySet.add(catName.trim());
              }
            });
          }
        }

        const normalizedMap = new Map<string, string>();
        Array.from(categorySet).forEach(cat => {
          const lower = cat.toLowerCase();
          if (!normalizedMap.has(lower)) {
            normalizedMap.set(lower, cat);
          }
        });

        const sortedCategories = Array.from(normalizedMap.values()).sort((a, b) => a.localeCompare(b));
        setCategories(sortedCategories);
      } catch (err) {
        console.error('Failed to load job categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const currentMonthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
  const hasActiveFilter = Boolean(search || jobFilter || date);

  return (
    <div className="flex flex-col gap-3 bg-card p-4 rounded-t-xl border border-border border-b-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 w-full">
          
          {/* Candidate Search Input */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t.archive?.searchCandidate || "Cari nama, email, kampus..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Kategori Pekerjaan Dropdown */}
          <div className="relative min-w-[200px]">
            <select 
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground hover:bg-muted transition-colors font-medium outline-none cursor-pointer"
            >
              <option value="">Semua Kategori Pekerjaan</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker (mm/dd/yyyy) */}
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-[145px] px-3 py-2 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all [&::-webkit-calendar-picker-indicator]:opacity-60 cursor-pointer"
              title="Pilih tanggal spesifik untuk melihat data lama"
            />
          </div>

          {/* Reset Filter Button */}
          {hasActiveFilter && (
            <button
              onClick={() => { setSearch(''); setJobFilter(''); setDate(''); }}
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
      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
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
