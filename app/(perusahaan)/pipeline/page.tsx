'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { KanbanColumn } from '@/components/pipeline/KanbanColumn';
import { CandidateCard, CandidateStage, CandidateStatus } from '@/components/pipeline/CandidateCard';
import { CandidateModal } from '@/components/pipeline/CandidateModal';
import { Filter, ArrowUpDown, Download } from 'lucide-react';

interface CandidateData {
  name: string;
  role: string;
  education?: string;
  university?: string;
  stage: CandidateStage;
  status?: CandidateStatus;
  cvScore?: number;
  videoUploaded?: boolean;
  videoScores?: {
    ability: number;
    intelligent: number;
    personality: number;
    attitude: number;
    emotionalIntelligence: number;
  };
}

export default function PipelinePage() {
  const { t } = useTranslation();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

  return (
    <div className="flex flex-col h-full max-w-full">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t.pipeline.title}</h1>
          <p className="text-sm text-muted-foreground font-medium">
            42 {t.pipeline.totalCandidates} &bull; 28 {t.pipeline.inActiveStages}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
            title="Ekspor Laporan Pipeline ke PDF"
          >
            <Download size={16} className="text-muted-foreground" />
            Ekspor PDF Pipeline
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm">
            <Filter size={16} className="text-muted-foreground" />
            {t.pipeline.filter}
          </button>
        </div>
      </div>

      {/* Kanban Board Area — 5 Columns matching flowchart */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 items-start min-w-max h-full">
          
          {/* 1. UPLOAD CV */}
          <KanbanColumn title={t.pipeline.uploadCV} count={8}>
            <CandidateCard 
              name="Rina Permata"
              role="Frontend Developer"
              education="S1 Sistem Informasi (IPK 3.91)"
              university="Universitas Indonesia"
              stage="upload_cv"
              timeInfo={`${t.pipeline.uploadedAgo} 1h ago`}
              onClick={() => setSelectedCandidate({ name: "Rina Permata", role: "Frontend Developer", stage: "upload_cv", education: "S1 Sistem Informasi (IPK 3.91)", university: "Universitas Indonesia" })}
            />
            <CandidateCard 
              name="Budi Santoso"
              role="Backend Engineer"
              education="S1 Teknik Informatika (IPK 3.75)"
              university="Institut Teknologi Bandung"
              stage="upload_cv"
              timeInfo={`${t.pipeline.uploadedAgo} 3h ago`}
              onClick={() => setSelectedCandidate({ name: "Budi Santoso", role: "Backend Engineer", stage: "upload_cv", education: "S1 Teknik Informatika (IPK 3.75)", university: "Institut Teknologi Bandung" })}
            />
            <CandidateCard 
              name="Dewi Lestari"
              role="UI/UX Designer"
              education="S1 DKV (IPK 3.80)"
              university="Universitas Gadjah Mada"
              stage="upload_cv"
              timeInfo={`${t.pipeline.uploadedAgo} 5h ago`}
              onClick={() => setSelectedCandidate({ name: "Dewi Lestari", role: "UI/UX Designer", stage: "upload_cv", education: "S1 DKV (IPK 3.80)", university: "Universitas Gadjah Mada" })}
            />
          </KanbanColumn>

          {/* 2. CV SCREENING (PO-FIT) */}
          <KanbanColumn title={t.pipeline.cvScreening} count={6}>
            <CandidateCard 
              name="Alex Mercer"
              role="React Developer @ TechCorp"
              education="S1 Teknik Komputer (IPK 3.65)"
              university="Universitas Indonesia"
              stage="cv_screening"
              status="processing"
              cvScore={92}
              timeInfo={t.pipeline.cosineSimilarity}
              onClick={() => setSelectedCandidate({ name: "Alex Mercer", role: "React Developer @ TechCorp", stage: "cv_screening", cvScore: 92, status: "processing", education: "S1 Teknik Komputer (IPK 3.65)", university: "Universitas Indonesia" })}
            />
            <CandidateCard 
              name="Sarah Chen"
              role="UI Engineer @ StartupX"
              education="S1 Computer Science (IPK 3.88)"
              university="Universitas Bina Nusantara"
              stage="cv_screening"
              status="pending"
              cvScore={88}
              timeInfo={t.pipeline.cosineSimilarity}
              onClick={() => setSelectedCandidate({ name: "Sarah Chen", role: "UI Engineer @ StartupX", stage: "cv_screening", cvScore: 88, status: "pending", education: "S1 Computer Science (IPK 3.88)", university: "Universitas Bina Nusantara" })}
            />
          </KanbanColumn>

          {/* 3. VIRTUAL INTERVIEW */}
          <KanbanColumn title={t.pipeline.virtualInterview} count={5}>
            <CandidateCard 
              name="David Kim"
              role="Sr. Frontend @ MegaWeb"
              education="S1 Teknik Informatika (IPK 3.85)"
              university="Universitas Indonesia"
              stage="interview"
              status="video_uploaded"
              cvScore={95}
              videoUploaded={true}
              timeInfo={t.pipeline.interviewDone}
              onClick={() => setSelectedCandidate({ name: "David Kim", role: "Sr. Frontend @ MegaWeb", stage: "interview", cvScore: 95, status: "video_uploaded", videoUploaded: true, education: "S1 Teknik Informatika (IPK 3.85)", university: "Universitas Indonesia" })}
            />
            <CandidateCard 
              name="Anisa Rahmawati"
              role="React Developer"
              education="S1 Informatika (IPK 3.70)"
              university="Universitas Telkom"
              stage="interview"
              status="awaiting_video"
              cvScore={84}
              videoUploaded={false}
              timeInfo={t.pipeline.waitingInterview}
              onClick={() => setSelectedCandidate({ name: "Anisa Rahmawati", role: "React Developer", stage: "interview", cvScore: 84, status: "awaiting_video", videoUploaded: false, education: "S1 Informatika (IPK 3.70)", university: "Universitas Telkom" })}
            />
          </KanbanColumn>

          {/* 4. AI VIDEO ANALYSIS */}
          <KanbanColumn title={t.pipeline.videoAnalysis} count={4}>
            <CandidateCard 
              name="David Kim"
              role="Sr. Frontend @ MegaWeb"
              education="S1 Teknik Informatika (IPK 3.85)"
              university="Universitas Indonesia"
              stage="ai_analysis"
              status="processing"
              videoScores={{ ability: 85, intelligent: 92, personality: 78, attitude: 88, emotionalIntelligence: 80 }}
              timeInfo={t.pipeline.analyzing}
              onClick={() => setSelectedCandidate({ 
                name: "David Kim", role: "Sr. Frontend @ MegaWeb", stage: "ai_analysis", status: "processing",
                cvScore: 95, videoUploaded: true, education: "S1 Teknik Informatika (IPK 3.85)", university: "Universitas Indonesia",
                videoScores: { ability: 85, intelligent: 92, personality: 78, attitude: 88, emotionalIntelligence: 80 }
              })}
            />
          </KanbanColumn>

          {/* 5. HUMAN VALIDATION */}
          <KanbanColumn title={t.pipeline.humanValidation} count={3}>
            <CandidateCard 
              name="David Kim"
              role="Sr. Frontend @ MegaWeb"
              education="S1 Teknik Informatika (IPK 3.85)"
              university="Universitas Indonesia"
              stage="human_validation"
              status="needs_approval"
              videoScores={{ ability: 85, intelligent: 92, personality: 78, attitude: 88, emotionalIntelligence: 80 }}
              timeInfo={t.pipeline.awaitingDecision}
              onClick={() => setSelectedCandidate({ 
                name: "David Kim", role: "Sr. Frontend @ MegaWeb", stage: "human_validation", status: "needs_approval",
                cvScore: 95, videoUploaded: true, education: "S1 Teknik Informatika (IPK 3.85)", university: "Universitas Indonesia",
                videoScores: { ability: 85, intelligent: 92, personality: 78, attitude: 88, emotionalIntelligence: 80 }
              })}
            />
            <CandidateCard 
              name="Siti Nurhaliza"
              role="Angular Developer"
              education="S1 Sistem Informasi (IPK 3.78)"
              university="Universitas Padjadjaran"
              stage="human_validation"
              status="needs_approval"
              videoScores={{ ability: 80, intelligent: 85, personality: 90, attitude: 82, emotionalIntelligence: 88 }}
              timeInfo={t.pipeline.awaitingDecision}
              onClick={() => setSelectedCandidate({ 
                name: "Siti Nurhaliza", role: "Angular Developer", stage: "human_validation", status: "needs_approval",
                cvScore: 89, videoUploaded: true, education: "S1 Sistem Informasi (IPK 3.78)", university: "Universitas Padjadjaran",
                videoScores: { ability: 80, intelligent: 85, personality: 90, attitude: 82, emotionalIntelligence: 88 }
              })}
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
