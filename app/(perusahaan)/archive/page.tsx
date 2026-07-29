'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ArchiveFilters } from '@/components/archive/ArchiveFilters';
import { ArchiveTable } from '@/components/archive/ArchiveTable';

export default function ArchivePage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t.archive?.title}</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col">
        <ArchiveFilters />
        <ArchiveTable />
      </div>
      
    </div>
  );
}
