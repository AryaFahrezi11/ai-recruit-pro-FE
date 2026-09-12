'use client';

import React, { useState, Suspense, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ArchiveFilters } from '@/components/archive/ArchiveFilters';
import { ArchiveTable } from '@/components/archive/ArchiveTable';
import { useRouter, useSearchParams } from 'next/navigation';

function ArchiveContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const jobFilter = searchParams.get('job') || '';
  const hasilFilter = searchParams.get('hasil') || '';
  const date = searchParams.get('date') || '';

  const updateUrl = useCallback((updates: any) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val as string);
      else params.delete(key);
    });
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  const [availableJobs, setAvailableJobs] = useState<{id: string, title: string}[]>([]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t.archive?.title}</h1>
          <p className="text-sm text-muted-foreground">Arsip dari seluruh kandidat yang telah Anda proses</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <ArchiveFilters 
          search={search}
          jobFilter={jobFilter}
          hasilFilter={hasilFilter}
          date={date}
          updateUrl={updateUrl}
          availableJobs={availableJobs}
        />
        <ArchiveTable 
          search={search}
          jobFilter={jobFilter}
          hasilFilter={hasilFilter}
          date={date}
          onJobsExtracted={setAvailableJobs}
        />
      </div>
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Memuat data arsip...</div>}>
      <ArchiveContent />
    </Suspense>
  );
}
