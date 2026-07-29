'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronDown, Calendar as CalendarIcon, Download } from 'lucide-react';

export function ArchiveFilters() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-t-xl border border-border border-b-0">
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Department Dropdown */}
        <button className="flex items-center justify-between min-w-[160px] px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
          <span>{t.archive?.allDepartments}</span>
          <ChevronDown size={14} className="text-muted-foreground ml-2" />
        </button>

        {/* Outcome Dropdown */}
        <button className="flex items-center justify-between min-w-[120px] px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
          <span>{t.archive?.outcome}</span>
          <ChevronDown size={14} className="text-muted-foreground ml-2" />
        </button>

        {/* Date Picker (Mock) */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="mm/dd/yyyy"
            className="w-[140px] px-3 py-2 pr-9 bg-background border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <CalendarIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
