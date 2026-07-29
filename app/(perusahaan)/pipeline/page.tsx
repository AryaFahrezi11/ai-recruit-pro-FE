'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { KanbanColumn } from '@/components/pipeline/KanbanColumn';
import { CandidateCard } from '@/components/pipeline/CandidateCard';
import { CandidateModal } from '@/components/pipeline/CandidateModal';
import { Filter, ArrowUpDown } from 'lucide-react';

export default function PipelinePage() {
  const { t } = useTranslation();
  const [selectedCandidate, setSelectedCandidate] = useState<{name: string, role: string} | null>(null);

  return (
    <div className="flex flex-col h-full max-w-full">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t.pipeline?.title}</h1>
          <p className="text-sm text-muted-foreground font-medium">
            42 {t.pipeline?.totalCandidates} &bull; 12 {t.pipeline?.inActiveStages}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm">
            <Filter size={16} className="text-muted-foreground" />
            {t.pipeline?.filter}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm">
            <ArrowUpDown size={16} className="text-muted-foreground" />
            {t.pipeline?.sort}
          </button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 items-start min-w-max h-full">
          
          {/* NEW APPLICANTS COLUMN */}
          <KanbanColumn title={t.pipeline?.newApplicants || 'NEW APPLICANTS'} count={18}>
            <CandidateCard 
              name="Alex Mercer"
              matchScore="92%"
              role="React Developer @ TechCorp"
              timeInfo={`${t.pipeline?.applied} 2h ago`}
              onClick={() => setSelectedCandidate({ name: "Alex Mercer", role: "React Developer @ TechCorp" })}
            />
            <CandidateCard 
              name="Sarah Chen"
              matchScore="88%"
              role="UI Engineer @ StartupX"
              timeInfo={`${t.pipeline?.applied} 5h ago`}
              onClick={() => setSelectedCandidate({ name: "Sarah Chen", role: "UI Engineer @ StartupX" })}
            />
          </KanbanColumn>

          {/* SCREENING COLUMN */}
          <KanbanColumn title={t.pipeline?.screening || 'SCREENING'} count={5}>
            <CandidateCard 
              name="David Kim"
              matchScore="95%"
              role="Sr. Frontend @ MegaWeb"
              timeInfo={t.pipeline?.callTomorrow || 'Call Tomorrow'}
              variant="screening"
              timeIcon={true}
              avatar="HR"
              onClick={() => setSelectedCandidate({ name: "David Kim", role: "Sr. Frontend @ MegaWeb" })}
            />
          </KanbanColumn>

        </div>
      </div>
      
      {/* Candidate Modal Render */}
      {selectedCandidate && (
        <CandidateModal 
          candidate={selectedCandidate} 
          onClose={() => setSelectedCandidate(null)} 
        />
      )}
    </div>
  );
}
