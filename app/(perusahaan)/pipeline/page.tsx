'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { KanbanColumn } from '@/components/pipeline/KanbanColumn';
import { CandidateCard, CandidateStage, CandidateStatus } from '@/components/pipeline/CandidateCard';
import { CandidateModal } from '@/components/pipeline/CandidateModal';
import { Filter, ArrowUpDown, Download, Loader2 } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { api, parseErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

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
  cvData?: any;
  cvDocument?: any;
  jobData?: any;
  analisisCv?: any;
  aiResult?: any;
  videoUrl?: string;
  isPolling?: boolean;
  pollProgress?: number;
}

export default function PipelinePage() {
  const { t } = useTranslation();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [pollProgress, setPollProgress] = useState<number>(0);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetchAuth('/api/applications/');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      setLoading(true);
      const res = await fetchAuth(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error('Gagal memperbarui status lamaran');
      }
      toast.success('Status lamaran berhasil diperbarui');
      loadApplications(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || parseErrorMessage(error) || 'Gagal memperbarui status');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (applicationId: string) => {
    try {
      setAnalyzingId(applicationId);
      const res = await fetchAuth(`/api/applications/${applicationId}/analyze`, { method: 'POST' });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Gagal menjalankan analisis AI');
      }

      toast.success('Analisis AI Berhasil');
      loadApplications(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || parseErrorMessage(error) || 'Gagal menjalankan analisis AI');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleAnalyzeVideo = async (applicationId: string) => {
    try {
      setAnalyzingId(applicationId);
      const res = await fetchAuth(`/api/applications/${applicationId}/analyze-video`, { method: 'POST' });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Gagal menjalankan analisis AI Video');
      }

      toast.success('Analisis AI Video dimulai. Mohon tunggu...');

      // Start polling simulation
      setPollingId(applicationId);
      setPollProgress(0);

      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 5 + 2;
        if (currentProgress > 95) currentProgress = 95;
        setPollProgress(currentProgress);
      }, 1000);

      // Polling the backend
      const pollBackend = setInterval(async () => {
        try {
          const checkRes = await fetchAuth('/api/applications/', { method: 'GET' });
          if (checkRes.ok) {
            const data = await checkRes.json();
            const app = data.data?.find((a: any) => a.id === applicationId);
            if (app && app.status === 'human_validation') {
              clearInterval(progressInterval);
              clearInterval(pollBackend);
              setPollProgress(100);
              setTimeout(() => {
                setPollingId(null);
                setAnalyzingId(null);
                loadApplications();
                toast.success('Analisis Video Selesai!');
              }, 500);
            }
          }
        } catch (e) {
          // ignore poll errors
        }
      }, 3000);

    } catch (error: any) {
      toast.error(error.message || parseErrorMessage(error) || 'Gagal menjalankan analisis AI Video');
      setAnalyzingId(null);
    }
  };

  const uploadCvApps = applications.filter(a => a.status === 'upload_cv' || a.status === 'dikirim');
  const screeningApps = applications.filter(a => a.status === 'cv_screening' || a.status === 'lolos_cv' || a.status === 'ditolak_sistem');
  const virtualInterviewApps = applications.filter(a => a.status === 'virtual_interview');
  const videoAnalysisApps = applications.filter(a => a.status === 'video_analysis');
  const humanValidationApps = applications.filter(a => a.status === 'human_validation');

  return (
    <div className="flex flex-col h-full max-w-full">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t.pipeline.title}</h1>
          <p className="text-sm text-muted-foreground font-medium">
            {applications.length} {t.pipeline.totalCandidates} &bull; {uploadCvApps.length + screeningApps.length + virtualInterviewApps.length + videoAnalysisApps.length + humanValidationApps.length} {t.pipeline.inActiveStages}
          </p>
        </div>
      </div>

      {/* Kanban Board Area — 5 Columns matching flowchart */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 items-start min-w-max h-full">

          {/* 1. UPLOAD CV */}
          <KanbanColumn title={t.pipeline.uploadCV} count={uploadCvApps.length}>
            {uploadCvApps.map((app) => (
              <CandidateCard
                key={app.id}
                name={app.pelamar?.nama_lengkap || 'Kandidat'}
                role={(app as any).cvData?.jobTitle || app.job?.judul_posisi || 'Posisi'}
                appliedJob={app.job?.judul_posisi}
                education={app.pelamar?.pendidikan_terakhir || (app as any).cvData?.education?.[0]?.degree}
                university={app.pelamar?.institusi_pendidikan || (app as any).cvData?.education?.[0]?.school}
                stage="upload_cv"
                status="processing"
                timeInfo="Otomatis Memproses AI..."
                onClick={() => setSelectedCandidate({ name: app.pelamar?.nama_lengkap || 'Kandidat', role: (app as any).cvData?.jobTitle || app.job?.judul_posisi || '', stage: "upload_cv", education: app.pelamar?.pendidikan_terakhir, university: app.pelamar?.institusi_pendidikan, cvData: (app as any).cvData, cvDocument: (app as any).cv_document, jobData: app.job })}
              />
            ))}

          </KanbanColumn>

          {/* 2. CV SCREENING  */}
          <KanbanColumn title={t.pipeline.cvScreening} count={screeningApps.length}>
            {screeningApps.map((app) => {
              const cvScore = Math.round(app.analisis_cv?.skor_kecocokan || 0);
              const threshold = app.analisis_cv?.threshold_digunakan || app.job?.cv_threshold || 60;
              const isAiProcessed = cvScore > 0 || app.analisis_cv;
              const isFailedEdu = app.analisis_cv?.kategori === 'tidak_memenuhi_syarat_pendidikan';
              const isPassed = cvScore >= threshold && !isFailedEdu;

              const actionButtons = isAiProcessed ? (
                <div className="flex items-center gap-1.5">
                  {isPassed ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'virtual_interview'); }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-md transition-colors shadow-2xs whitespace-nowrap"
                    >
                      Lanjut Wawancara
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'virtual_interview'); }}
                        className="px-2 py-1 bg-[#2596be] hover:bg-[#1D7FA1] text-white text-[10px] font-bold rounded-md transition-colors shadow-2xs whitespace-nowrap"
                        title="Lanjutkan ke wawancara meskipun nilai kurang dari threshold"
                      >
                        Override
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'ditolak'); }}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-md transition-colors shadow-2xs whitespace-nowrap"
                      >
                        Diskualifikasi
                      </button>
                    </>
                  )}
                </div>
              ) : undefined;

              return (
                <CandidateCard
                  key={app.id}
                  name={app.pelamar?.nama_lengkap || 'Kandidat'}
                  role={(app as any).cvData?.jobTitle || app.job?.judul_posisi || 'Posisi'}
                  appliedJob={app.job?.judul_posisi}
                  education={app.pelamar?.pendidikan_terakhir || (app as any).cvData?.education?.[0]?.degree}
                  university={app.pelamar?.institusi_pendidikan || (app as any).cvData?.education?.[0]?.school}
                  stage="cv_screening"
                  cvScore={cvScore}
                  threshold={threshold}
                  status={app.status === 'lolos_cv' ? undefined : (app.status === 'ditolak_sistem' ? undefined : 'processing')}
                  timeInfo={t.pipeline.cosineSimilarity}
                  customActions={actionButtons}
                  onClick={() => setSelectedCandidate({ name: app.pelamar?.nama_lengkap || 'Kandidat', role: (app as any).cvData?.jobTitle || app.job?.judul_posisi || '', stage: "cv_screening", cvScore: cvScore, status: app.status, education: (app as any).cv_document?.pendidikan_tertinggi || app.pelamar?.pendidikan_terakhir, university: app.pelamar?.institusi_pendidikan, cvData: (app as any).cvData, cvDocument: (app as any).cv_document, jobData: app.job, analisisCv: app.analisis_cv, aiResult: (app as any).ai_result, videoUrl: (app as any).video_url })}
                />
              );
            })}
          </KanbanColumn>

          {/* 3. VIRTUAL INTERVIEW */}
          <KanbanColumn title={t.pipeline.virtualInterview} count={virtualInterviewApps.length}>
            {virtualInterviewApps.map((app) => (
              <CandidateCard
                key={app.id}
                name={app.pelamar?.nama_lengkap || 'Kandidat'}
                role={(app as any).cvData?.jobTitle || app.job?.judul_posisi || 'Posisi'}
                appliedJob={app.job?.judul_posisi}
                stage="interview"
                status="awaiting_video"
                timeInfo="Menunggu Jadwal/Video"
                onClick={() => setSelectedCandidate({ name: app.pelamar?.nama_lengkap || 'Kandidat', role: (app as any).cvData?.jobTitle || app.job?.judul_posisi || '', stage: "interview", cvScore: Math.round(app.analisis_cv?.skor_kecocokan || 0), education: app.pelamar?.pendidikan_terakhir, university: app.pelamar?.institusi_pendidikan, cvData: (app as any).cvData, cvDocument: (app as any).cv_document, jobData: app.job, analisisCv: app.analisis_cv, aiResult: (app as any).ai_result, videoUrl: (app as any).video_url })}
              />
            ))}
          </KanbanColumn>

          {/* 4. AI VIDEO ANALYSIS */}
          <KanbanColumn title={t.pipeline.videoAnalysis} count={videoAnalysisApps.length}>
            {videoAnalysisApps.map((app) => (
              <CandidateCard
                key={app.id}
                name={app.pelamar?.nama_lengkap || 'Kandidat'}
                role={(app as any).cvData?.jobTitle || app.job?.judul_posisi || 'Posisi'}
                appliedJob={app.job?.judul_posisi}
                stage="ai_analysis"
                status="processing"
                timeInfo="Menunggu Analisis AI"
                actionLabel="Jalankan Analisis Video"
                actionLoading={analyzingId === app.id}
                onActionClick={() => handleAnalyzeVideo(app.id)}
                onClick={() => setSelectedCandidate({ name: app.pelamar?.nama_lengkap || 'Kandidat', role: (app as any).cvData?.jobTitle || app.job?.judul_posisi || '', stage: "ai_analysis", cvScore: Math.round(app.analisis_cv?.skor_kecocokan || 0), education: app.pelamar?.pendidikan_terakhir, university: app.pelamar?.institusi_pendidikan, cvData: (app as any).cvData, cvDocument: (app as any).cv_document, jobData: app.job, analisisCv: app.analisis_cv, aiResult: (app as any).ai_result, videoUrl: (app as any).video_url, isPolling: pollingId === app.id, pollProgress: pollingId === app.id ? pollProgress : undefined })}
              />
            ))}
          </KanbanColumn>

          {/* 5. HUMAN VALIDATION */}
          <KanbanColumn title={t.pipeline.humanValidation} count={humanValidationApps.length}>
            {humanValidationApps.map((app) => (
              <CandidateCard
                key={app.id}
                name={app.pelamar?.nama_lengkap || 'Kandidat'}
                role={(app as any).cvData?.jobTitle || app.job?.judul_posisi || 'Posisi'}
                appliedJob={app.job?.judul_posisi}
                stage="human_validation"
                status="needs_approval"
                timeInfo="Menunggu Keputusan"
                onClick={() => setSelectedCandidate({ name: app.pelamar?.nama_lengkap || 'Kandidat', role: (app as any).cvData?.jobTitle || app.job?.judul_posisi || '', stage: "human_validation", cvScore: Math.round(app.analisis_cv?.skor_kecocokan || 0), education: app.pelamar?.pendidikan_terakhir, university: app.pelamar?.institusi_pendidikan, cvData: (app as any).cvData, cvDocument: (app as any).cv_document, jobData: app.job, analisisCv: app.analisis_cv, aiResult: (app as any).ai_result, videoUrl: (app as any).video_url })}
              />
            ))}
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
