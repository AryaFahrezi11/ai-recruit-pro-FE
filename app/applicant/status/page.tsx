'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Calendar,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Video,
  FileText,
  Sparkles,
  ArrowLeft,
  Eye,
  X,
  Check,
  HelpCircle,
  Brain,
  Play,
  Volume2,
  Smile,
  MessageSquare,
  AlertCircle,
  BarChart3,
  Bot,
  ArrowRight,
  Star
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';
import { CandidateReviewModal } from '@/components/CandidateReviewModal';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';

interface ApplicationItem {
  id: number | string;
  jobTitle: string;
  companyName: string;
  logo: string;
  applyDate: string;
  kegiatan: string;
  tahapRekrutmen: string;
  currentStageIndex: number; // 1 to 5
  status: 'Dalam Proses' | 'Lolos' | 'Tidak Lolos' | 'Lowongan Telah Ditutup' | 'Tahap Akhir';
  statusMessage?: string;
  rawStatus?: string;
  catatanPerusahaan?: string;
  interviewDetails?: {
    tipe?: 'online' | 'offline' | string;
    tanggal?: string;
    waktu?: string;
    lokasi_atau_link?: string;
    catatan?: string;
  };
  hasActionRequired?: boolean;
  cvScore: number;
  threshold: number;
  kategori?: string;
  hybridDetails?: {
    sbert_score: number;
    keyword_score: number;
    keywords_found: number;
    keywords_total: number;
  };
  videoQuestions?: string[];
  videoScore: number;
  videoBreakdown: {
    fluency: number;
    confidence: number;
    keywords: number;
    emotion: number;
    logic: number;
    notes: string[];
  };
  aiResult?: any;
  generalAiDetails?: {
    recommendationLabel: string;
    compositeScore: number;
    competencies: {
      title: string;
      score: number;
      badge: string;
      desc: string;
    }[];
    strengths: string[];
    hrNotice: string;
    realDetails?: {
      durasiFormatted?: string | null;
      ringkasanJawaban?: string | null;
      pertanyaanTerjawab?: number;
      totalPertanyaan?: number;
      eyeContact?: number | null;
      posture?: number | null;
      wps?: number | null;
    };
  };
}

const buildGeneralAiDetails = (
  cvScore: number,
  videoScore: number,
  aiResult: any,
  hybridDetails?: any,
  cvCategory?: string
) => {
  const parsePct = (val: any): number | null => {
    if (val === null || val === undefined) return null;
    if (typeof val === 'string') {
      const num = parseFloat(val.replace('%', ''));
      return isNaN(num) ? null : Math.round(num);
    }
    if (typeof val === 'number') return Math.round(val);
    return null;
  };

  // 1. Skor Riil Video dari Backend
  const realVideoScore = aiResult?.skor_keseluruhan !== undefined
    ? Math.round(Number(aiResult.skor_keseluruhan))
    : (videoScore > 0 ? videoScore : null);

  // 2. Skor Riil CV dari Backend
  const realCvScore = cvScore > 0 ? cvScore : null;

  // 3. Skor Komposit Riil
  const composite = (realCvScore !== null && realVideoScore !== null)
    ? Math.round((realCvScore * 0.45) + (realVideoScore * 0.55))
    : (realVideoScore !== null ? realVideoScore : (realCvScore !== null ? realCvScore : 0));

  // 4. Dimensi Psikologis Riil dari Backend
  const abilityVal = parsePct(aiResult?.dimensi_psikologis?.Ability);
  const intelligentVal = parsePct(aiResult?.dimensi_psikologis?.Intelligent);
  const personalityVal = parsePct(aiResult?.dimensi_psikologis?.Personality);
  const attitudeVal = parsePct(aiResult?.dimensi_psikologis?.Attitude);
  const emotionVal = parsePct(aiResult?.dimensi_psikologis?.['Emotional Intelligent']);

  // 5. Parameter Pengamatan AI Riil dari Backend
  const eyeContact = aiResult?.parameter_analisis?.kontak_mata !== undefined
    ? Math.round(Number(aiResult.parameter_analisis.kontak_mata))
    : null;
  const posture = aiResult?.parameter_analisis?.gerakan_badan !== undefined
    ? Math.round(Number(aiResult.parameter_analisis.gerakan_badan))
    : null;
  const speechPacing = aiResult?.parameter_analisis?.word_per_second_percent !== undefined
    ? Math.round(Number(aiResult.parameter_analisis.word_per_second_percent))
    : null;
  const wps = aiResult?.parameter_analisis?.word_per_second !== undefined
    ? Number(aiResult.parameter_analisis.word_per_second)
    : null;

  // Label Rekomendasi Riil dari Backend
  const rawFit = aiResult?.kategori_fit;
  const recommendationLabel = rawFit
    ? rawFit
    : composite >= 75
      ? 'Rekomendasi Positif (Memenuhi Standar)'
      : composite >= 60
        ? 'Memenuhi Kualifikasi Minimum'
        : 'Perlu Pertimbangan Khusus';

  // 5 Aspek Penilaian Utama (Bahasa Umum) dari Data Riil
  const competencies = [
    {
      title: 'Kesesuaian Profil & Keahlian (CV)',
      score: realCvScore !== null ? realCvScore : 0,
      badge: realCvScore !== null
        ? (realCvScore >= 80 ? 'Sangat Relevan' : realCvScore >= 60 ? 'Cukup Sesuai' : 'Perlu Peningkatan')
        : 'Menunggu Evaluasi',
      desc: hybridDetails?.keywords_total
        ? `Keahlian wajib terpenuhi (${hybridDetails.keywords_found} dari ${hybridDetails.keywords_total} skill) dengan tingkat kesesuaian pengalaman ${hybridDetails.sbert_score}%.`
        : realCvScore !== null
          ? `Tingkat kecocokan profil dan dokumen CV Anda mencapai ${realCvScore}% terhadap kualifikasi posisi.`
          : 'Data evaluasi CV belum tersedia.'
    },
    {
      title: 'Kelancaran Komunikasi & Berbicara',
      score: abilityVal !== null ? abilityVal : (speechPacing !== null ? speechPacing : 0),
      badge: abilityVal !== null
        ? (abilityVal >= 80 ? 'Lancar & Terstruktur' : abilityVal >= 60 ? 'Cukup Teratur' : 'Perlu Peningkatan')
        : (speechPacing !== null ? (speechPacing >= 80 ? 'Lancar' : 'Wajar') : 'Belum Ada Sesi'),
      desc: wps !== null
        ? `Kecepatan bicara teratur (${wps} kata/detik) dengan artikulasi kata yang jelas dan mudah dipahami.`
        : abilityVal !== null
          ? 'Penyampaian jawaban terstruktur dan penjelasan disampaikan dengan artikulasi yang baik.'
          : 'Menunggu hasil rekaman wawancara video.'
    },
    {
      title: 'Kepercayaan Diri & Bahasa Tubuh',
      score: personalityVal !== null ? personalityVal : (eyeContact !== null ? eyeContact : 0),
      badge: personalityVal !== null
        ? (personalityVal >= 80 ? 'Percaya Diri' : personalityVal >= 60 ? 'Cukup Tenang' : 'Cenderung Gugup')
        : (eyeContact !== null ? (eyeContact >= 70 ? 'Fokus Baik' : 'Cukup') : 'Belum Ada Sesi'),
      desc: eyeContact !== null
        ? `Tingkat fokus tatapan ke arah kamera tercatat ${eyeContact}% dengan gestur tubuh yang stabil.`
        : personalityVal !== null
          ? 'Membawakan diri dengan tenang, wajar, dan mempertahankan postur profesional.'
          : 'Menunggu hasil rekaman wawancara video.'
    },
    {
      title: 'Pemahaman Masalah & Logika Berpikir',
      score: intelligentVal !== null ? intelligentVal : 0,
      badge: intelligentVal !== null
        ? (intelligentVal >= 80 ? 'Logis & Solutif' : intelligentVal >= 60 ? 'Cukup Logis' : 'Perlu Peningkatan')
        : 'Belum Ada Sesi',
      desc: aiResult?.status_jawaban_teks
        ? aiResult.status_jawaban_teks
        : intelligentVal !== null
          ? 'Menjawab pertanyaan dengan alur pemikiran terstruktur dan penyelesaian masalah yang relevan.'
          : 'Menunggu hasil rekaman wawancara video.'
    },
    {
      title: 'Sikap Kerja & Ketenangan',
      score: attitudeVal !== null ? attitudeVal : (emotionVal !== null ? emotionVal : 0),
      badge: attitudeVal !== null
        ? (attitudeVal >= 80 ? 'Positif & Santun' : attitudeVal >= 60 ? 'Cukup Baik' : 'Perlu Peningkatan')
        : (emotionVal !== null ? (emotionVal >= 70 ? 'Tenang' : 'Wajar') : 'Belum Ada Sesi'),
      desc: posture !== null
        ? `Kestabilan dan kerapian sikap duduk tercatat ${posture}% dengan pembawaan diri yang santun.`
        : attitudeVal !== null
          ? 'Menunjukkan sikap kerja yang positif, terbuka, serta antusiasme yang baik.'
          : 'Menunggu hasil rekaman wawancara video.'
    }
  ];

  // Poin Keunggulan Dinamis dari Data Riil
  const strengths: string[] = [];
  if (realCvScore !== null && realCvScore >= 70) {
    strengths.push(`Kualifikasi profil dan keahlian di CV memiliki kecocokan tinggi (${realCvScore}%) dengan posisi ini.`);
  }
  if (eyeContact !== null && eyeContact >= 70) {
    strengths.push(`Fokus kontak mata ke arah kamera sangat baik (${eyeContact}%), mencerminkan rasa percaya diri yang kuat.`);
  }
  if (abilityVal !== null && abilityVal >= 70) {
    strengths.push(`Penyampaian jawaban lisan sangat lancar dan sistematis (skor kemampuan komunikasi ${abilityVal}%).`);
  }
  if (intelligentVal !== null && intelligentVal >= 70) {
    strengths.push(`Kemampuan menguraikan solusi masalah dinilai logis dan terstruktur (skor pemahaman ${intelligentVal}%).`);
  }
  if (posture !== null && posture >= 70) {
    strengths.push(`Sikap dan postur tubuh terjaga rapi serta stabil (${posture}%) sepanjang wawancara.`);
  }
  if (strengths.length === 0) {
    strengths.push('Berkas CV dan video wawancara awal telah berhasil diproses oleh sistem AI.');
    strengths.push('Profil Anda telah masuk ke meja tim rekruter untuk proses peninjauan lebih lanjut.');
  }

  return {
    recommendationLabel,
    compositeScore: composite,
    competencies,
    strengths,
    hrNotice: 'Tahap ini merupakan Validasi Manusia (Human Validation). Hasil analisis AI bersifat sebagai bahan pertimbangan objektif awal. Tim HR perusahaan saat ini sedang meninjau hasil secara menyeluruh sebelum menentukan jadwal wawancara tatap muka atau tahap akhir.',
    realDetails: {
      durasiFormatted: aiResult?.durasi_formatted || null,
      ringkasanJawaban: aiResult?.ringkasan_jawaban || null,
      pertanyaanTerjawab: aiResult?.pertanyaan_terjawab_count,
      totalPertanyaan: aiResult?.total_pertanyaan,
      eyeContact,
      posture,
      wps
    }
  };
};

const DEFAULT_INTERVIEW_QUESTIONS = [
  'Ceritakan tentang diri Anda, latar belakang pengalaman, dan keahlian utama yang relevan dengan posisi ini.',
  'Jelaskan pencapaian atau tantangan terbesar yang pernah Anda selesaikan dalam pekerjaan atau proyek sebelumnya.',
  'Mengapa Anda tertarik untuk bergabung dengan perusahaan ini dan apa kontribusi yang ingin Anda berikan?'
];

const getJobVideoQuestions = (item: any): string[] => {
  const raw =
    item.job?.video_questions ||
    item.job?.video_questions_json ||
    item.video_questions ||
    item.video_questions_json ||
    item.pertanyaan_wawancara;

  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((q: any) => (typeof q === 'string' ? q.trim() : ''))
      .filter((q: string) => q.length > 0);
  }

  if (typeof raw === 'string' && raw.trim().length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((q: any) => (typeof q === 'string' ? q.trim() : ''))
          .filter((q: string) => q.length > 0);
      }
    } catch {
      return raw.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean);
    }
  }

  return [];
};

function StatusValidasiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Keep input value synced with URL search parameter (e.g. browser back/forward)
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    // Clear obsolete filter params if any
    params.delete('platform');
    params.delete('stage');
    params.delete('status');

    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('platform');
    params.delete('stage');
    params.delete('status');
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  };

  // Table Pagination & Detail Modal State
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetailApp, setSelectedDetailApp] = useState<ApplicationItem | null>(null);

  useEffect(() => {
    if (selectedDetailApp && selectedDetailApp.rawStatus) {
      const s = selectedDetailApp.rawStatus;
      if (s === 'hired' || s === 'accepted' || s === 'Lolos' || s === 'rejected' || s === 'ditolak_sistem' || s === 'ditolak' || s === 'Tidak Lolos') {
        const isHired = s === 'hired' || s === 'accepted' || s === 'Lolos';
        const ctx = isHired ? 'status_hired' : 'status_rejected';
        api.get(`/reviews/me/status?context_event=${ctx}`)
          .then((res: any) => {
            if (!res.has_reviewed) {
              setReviewContextEvent(ctx);
              setIsReviewModalOpen(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [selectedDetailApp]);

  // Reset page when search param changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams]);

  // Modal States
  const [activeCvModalJob, setActiveCvModalJob] = useState<ApplicationItem | null>(null);
  const [activeHumanModalJob, setActiveHumanModalJob] = useState<ApplicationItem | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewContextEvent, setReviewContextEvent] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  useEffect(() => {
    if (searchParams.get('showReview') === 'true') {
      const ctx = searchParams.get('context') || 'general';
      setReviewContextEvent(ctx);
      setIsReviewModalOpen(true);
      
      // Clean up URL so it doesn't reopen on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // Applications State
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const apiParams = new URLSearchParams();
        const search = searchParams.get('search');
        if (search) apiParams.append('search', search);
        const qs = apiParams.toString();

        const res = await api.get(qs ? `/applications/?${qs}` : '/applications/');
        const rawList = Array.isArray(res) ? res : res.data || [];

        if (rawList.length > 0) {
          const mapped: ApplicationItem[] = rawList.map((item: any, idx: number) => {
            const cvScore = Math.round(item.analisis_cv?.skor_kecocokan || item.cv_score || 0);
            const threshold = item.analisis_cv?.threshold_digunakan || item.job?.cv_threshold || 60;

            let stageIndex = 1;
            let statusLabel: 'Dalam Proses' | 'Lolos' | 'Tidak Lolos' | 'Lowongan Telah Ditutup' | 'Tahap Akhir' = 'Dalam Proses';
            let tahapName = 'Stage 1: UPLOAD CV';
            let msg = 'Profil CV Anda telah masuk pipeline. Menunggu proses seleksi AI.';

            const s = item.status || 'upload_cv';

            if (s === 'upload_cv' || s === 'dikirim') {
              stageIndex = 1;
              tahapName = 'Stage 1: UPLOAD CV';
              msg = 'Profil CV Anda telah masuk pipeline. Menunggu HR Perusahaan untuk memicu proses seleksi AI.';
            } else if (s === 'cv_screening') {
              stageIndex = 2;
              tahapName = 'Stage 2: CV SCREENING ';
              msg = 'CV Anda sedang dalam tahap evaluasi kecocokan oleh AI.';
            } else if (s === 'lolos_cv' || s === 'virtual_interview') {
              stageIndex = 3;
              tahapName = 'Stage 3: VIRTUAL INTERVIEW';
              msg = `Selamat! CV Anda telah LOLOS screening AI dengan skor kecocokan ${cvScore}%. Silakan lakukan perekaman Wawancara Video Singkat.`;
            } else if (s === 'ditolak_sistem') {
              stageIndex = 2;
              tahapName = 'Stage 2: DITOLAK (CV SCREENING)';
              statusLabel = 'Tidak Lolos';
              msg = item.catatan_perusahaan || `Mohon maaf, profil Anda belum memenuhi kriteria yang dibutuhkan pada tahap CV Screening.`;
            } else if (s === 'ditolak' || s === 'rejected') {
              if (item.analisis_cv?.hasil === 'ditolak' || item.analisis_cv?.hasil === 'tidak_memenuhi_syarat') {
                stageIndex = 2;
                tahapName = 'Stage 2: DITOLAK (CV SCREENING)';
                statusLabel = 'Tidak Lolos';
                msg = item.catatan_perusahaan || `Mohon maaf, profil Anda belum memenuhi kriteria yang dibutuhkan pada tahap CV Screening.`;
              } else {
                stageIndex = 5;
                tahapName = 'Stage 5: DITOLAK (KEPUTUSAN AKHIR)';
                statusLabel = 'Tidak Lolos';
                msg = item.catatan_perusahaan || `Mohon maaf, profil Anda belum memenuhi kriteria yang dibutuhkan untuk posisi ini pada tahap akhir.`;
              }
            } else if (s === 'video_analysis') {
              stageIndex = 4;
              tahapName = 'Stage 4: AI VIDEO ANALYSIS';
              msg = 'Video wawancara Anda sedang dianalisis oleh AI.';
            } else if (s === 'human_validation') {
              stageIndex = 5;
              tahapName = 'Stage 5: HUMAN VALIDATION';
              msg = 'Hasil evaluasi AI (CV & Video) telah lengkap dan saat ini sedang divalidasi langsung oleh tim HR perusahaan.';
            } else if (s === 'interview_lanjutan' || s === 'interview_scheduled' || s === 'interview') {
              stageIndex = 5;
              tahapName = 'Stage 5: WAWANCARA LANJUTAN';
              statusLabel = 'Tahap Akhir';
              msg = 'Anda telah lolos evaluasi awal dan diundang ke tahap Wawancara Lanjutan bersama Tim HR/User.';
            } else if (s === 'hired' || s === 'accepted' || s === 'Lolos') {
              stageIndex = 5;
              tahapName = 'Stage 5: DITERIMA (HIRED)';
              statusLabel = 'Lolos';
              msg = item.catatan_perusahaan || 'Selamat! Anda resmi dinyatakan DITERIMA bergabung di perusahaan ini.';
            } else if (s === 'Tidak Lolos') {
              stageIndex = 5;
              tahapName = 'Stage 5: KEPUTUSAN AKHIR';
              statusLabel = 'Tidak Lolos';
              msg = 'Mohon maaf, Anda belum lolos seleksi kali ini.';
            }

            const customQuestions = getJobVideoQuestions(item);

            // Extract video AI details if available
            const aiResult = item.ai_result || item.analisis_video || item.video_task?.hasil_analisis || null;
            const parsePct = (val: any) => typeof val === 'string' ? parseFloat(val.replace('%', '')) : (typeof val === 'number' ? val : 0);

            let videoScore = 0;
            let fluencyVal = 0;
            let confidenceVal = 0;
            let keywordsVal = 0;
            let emotionVal = 0;
            let logicVal = 0;
            let notesList: string[] = [];

            if (aiResult) {
              if (aiResult.skor_keseluruhan !== undefined) {
                videoScore = Math.round(Number(aiResult.skor_keseluruhan));
              }
              if (aiResult.dimensi_psikologis) {
                fluencyVal = Math.round(parsePct(aiResult.dimensi_psikologis.Ability));
                logicVal = Math.round(parsePct(aiResult.dimensi_psikologis.Intelligent));
                confidenceVal = Math.round(parsePct(aiResult.dimensi_psikologis.Personality));
                emotionVal = Math.round(parsePct(aiResult.dimensi_psikologis['Emotional Intelligent']));
                keywordsVal = Math.round(parsePct(aiResult.dimensi_psikologis.Attitude));
              }
              if (Array.isArray(aiResult.catatan) && aiResult.catatan.length > 0) {
                notesList = aiResult.catatan;
              } else if (aiResult.ringkasan_jawaban) {
                notesList = [aiResult.ringkasan_jawaban];
              } else if (aiResult.status_jawaban_teks) {
                notesList = [aiResult.status_jawaban_teks];
              }
            } else if (item.video_score) {
              videoScore = Math.round(item.video_score);
            }

            const generalAiDetails = buildGeneralAiDetails(
              cvScore,
              videoScore,
              aiResult,
              item.analisis_cv?.hybrid_details,
              item.analisis_cv?.kategori
            );

            return {
              id: item.id || idx + 1,
              jobTitle: item.job?.judul_posisi || item.judul_posisi || 'Lowongan Pekerjaan',
              companyName: item.job?.perusahaan?.nama_perusahaan || item.nama_perusahaan || 'Perusahaan Partner',
              logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
              applyDate: item.applied_at ? new Date(item.applied_at).toLocaleDateString('id-ID') : 'Baru saja',
              kegiatan: 'WEBCAREER',
              tahapRekrutmen: tahapName,
              currentStageIndex: stageIndex,
              status: statusLabel,
              statusMessage: msg,
              rawStatus: s,
              catatanPerusahaan: item.catatan_perusahaan,
              interviewDetails: item.interview_details,
              hasActionRequired: s === 'lolos_cv' || s === 'virtual_interview',
              cvScore: cvScore,
              threshold: threshold,
              kategori: item.analisis_cv?.kategori,
              hybridDetails: item.analisis_cv?.hybrid_details,
              videoQuestions: customQuestions.length > 0 ? customQuestions : DEFAULT_INTERVIEW_QUESTIONS,
              videoScore: videoScore,
              videoBreakdown: {
                fluency: fluencyVal,
                confidence: confidenceVal,
                keywords: keywordsVal,
                emotion: emotionVal,
                logic: logicVal,
                notes: notesList
              },
              aiResult: aiResult,
              generalAiDetails: generalAiDetails
            };
          });

          setApplications(mapped);

          // Update seen_statuses to clear notification dot
          try {
            const savedStatusesStr = localStorage.getItem('seen_statuses');
            let savedStatuses: Record<string, string> = {};
            if (savedStatusesStr) savedStatuses = JSON.parse(savedStatusesStr);
            
            let updated = false;
            for (const app of mapped) {
              if (savedStatuses[app.id] !== app.rawStatus) {
                savedStatuses[app.id] = app.rawStatus || app.status;
                updated = true;
              }
            }
            if (updated) {
              localStorage.setItem('seen_statuses', JSON.stringify(savedStatuses));
              // Dispatch custom event to let layout know
              window.dispatchEvent(new Event('seen_statuses_updated'));
            }
          } catch (e) {}

        } else {
          // Fallback mock scenarios if no applications in DB yet
          setApplications([]);
        }
      } catch (err) {
        console.error('Failed to fetch application status:', err);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [searchParams]);

  const pipelineStagesList = [
    { number: 1, name: '1. UPLOAD CV', key: 'cv_upload' },
    { number: 2, name: '2. CV SCREENING ', key: 'cv_screening' },
    { number: 3, name: '3. VIRTUAL INTERVIEW', key: 'virtual_interview' },
    { number: 4, name: '4. AI VIDEO ANALYSIS', key: 'video_analysis' },
    { number: 5, name: '5. HUMAN VALIDATION', key: 'human_validation' }
  ];

  // DataTable Column Definitions
  const tableColumns: ColumnDef<ApplicationItem>[] = useMemo(() => [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      className: 'w-14 font-semibold text-slate-500 dark:text-slate-400 text-center',
      headerClassName: 'text-center',
      render: (_, index) => <span>{index + 1}</span>,
    },
    {
      key: 'position_company',
      header: 'Posisi & Perusahaan',
      align: 'left',
      render: (item) => (
        <div className="flex items-center gap-3.5 py-1">
          <img
            src={item.logo}
            alt={item.companyName}
            className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
          />
          <div className="min-w-0">
            <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block hover:text-[#1A4B9F] dark:hover:text-blue-400 transition-colors line-clamp-1">
              {item.jobTitle}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block truncate">
              {item.companyName}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'applyDate',
      header: 'Tanggal Melamar',
      align: 'center',
      headerClassName: 'text-center',
      className: 'whitespace-nowrap text-center',
      render: (item) => (
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
          <Calendar size={13} className="text-slate-400" />
          <span>{item.applyDate}</span>
        </div>
      ),
    },
    {
      key: 'tahapRekrutmen',
      header: 'Tahapan Rekrutmen',
      align: 'left',
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1A4B9F] dark:text-blue-400 text-xs font-bold border border-blue-200/70 dark:border-blue-800/70">
          <Clock size={13} className="shrink-0" />
          <span className="truncate max-w-[220px]">{item.tahapRekrutmen}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (item) => {
        const isPassed = item.status === 'Lolos';
        const isTahapAkhir = item.status === 'Tahap Akhir';
        const isInProgress = item.status === 'Dalam Proses';
        const isFailed = item.status === 'Tidak Lolos' || item.status === 'Lowongan Telah Ditutup';
        const isActionRequired = item.currentStageIndex === 3 && isInProgress;
        const isWaitingHR = item.currentStageIndex === 5 && isInProgress;

        return (
          <span
            className={`font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 whitespace-nowrap ${isPassed
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : isTahapAkhir
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                : isActionRequired
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : isInProgress
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-[#1A4B9F] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
              }`}
          >
            {isPassed ? (
              <CheckCircle2 size={13} />
            ) : isTahapAkhir ? (
              <Sparkles size={13} />
            ) : isFailed ? (
              <XCircle size={13} />
            ) : isActionRequired ? (
              <AlertCircle size={13} className="animate-pulse" />
            ) : (
              <Clock size={13} />
            )}
            <span>{isActionRequired ? 'Segera Upload Video' : isWaitingHR ? 'Menunggu Keputusan HR' : item.status}</span>
          </span>
        );
      },
    },
    {
      key: 'aksi',
      header: 'Aksi',
      align: 'center',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDetailApp(item);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] active:scale-95 text-white font-bold text-xs transition-all cursor-pointer shadow-xs hover:shadow"
        >
          <Eye size={14} />
          <span>Lihat Detail</span>
        </button>
      ),
    },
  ], []);

  // Filtered list: uses committed search query from URL GET param (?search=...), NOT while typing
  const committedSearch = (searchParams.get('search') || '').toLowerCase().trim();

  const filteredApplications = useMemo(() => {
    if (!committedSearch) return applications;
    return applications.filter(app => {
      const matchJob = app.jobTitle?.toLowerCase().includes(committedSearch);
      const matchCompany = app.companyName?.toLowerCase().includes(committedSearch);
      return matchJob || matchCompany;
    });
  }, [applications, committedSearch]);

  return (
    <div className="max-w-[1600px] w-full mx-auto space-y-6">

      {/* Main Page Title Banner (Matching Enterprise Blue Theme) */}
      <div className="bg-[#1A4B9F] p-6 sm:p-8 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{t.pelamar.status.title}</h1>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-3xl font-medium">
            {t.pelamar.status.subtitle}
          </p>
        </div>
      </div>

      {/* Search Bar (GET with Search Button, Filters Removed) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          {/* Search Box */}
          <div className="relative flex-1 w-full flex items-center group">
            <Search size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#1A4B9F] pointer-events-none transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.pelamar.status.searchPlaceholder || 'Cari posisi atau perusahaan...'}
              className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 focus:border-[#1A4B9F] focus:ring-2 focus:ring-[#1A4B9F]/10 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Hapus pencarian"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 bg-[#1A4B9F] hover:bg-[#133878] active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Search size={16} />
            <span>{t.pelamar.status.searchButton || 'Cari'}</span>
          </button>
        </form>
      </div>

      {/* APPLICATIONS DATA TABLE */}
      <DataTable<ApplicationItem>
        data={filteredApplications}
        columns={tableColumns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        pageSize={10}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onRowClick={(item) => setSelectedDetailApp(item)}
        emptyTitle={committedSearch ? 'Tidak Ada Lamaran Ditemukan' : 'Belum Ada Lamaran'}
        emptyDescription={
          committedSearch
            ? `Tidak ada data lamaran yang cocok dengan kata kunci "${committedSearch}".`
            : 'Anda belum memiliki riwayat lamaran pekerjaan saat ini.'
        }
      />

      {/* MODAL DETAIL RIWAYAT LAMARAN (SIMPLE & CLEAN) */}
      {selectedDetailApp && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 shrink-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedDetailApp.logo}
                  alt={selectedDetailApp.companyName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                />
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
                    {selectedDetailApp.jobTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{selectedDetailApp.companyName}</span>
                    <span>&bull;</span>
                    <span className="inline-flex items-center gap-1 shrink-0">
                      <Calendar size={11} /> {selectedDetailApp.applyDate}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetailApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
              {/* Clean Linear Stepper Timeline */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-800">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
                Linimasa Seleksi
              </span>
              <div className="grid grid-cols-5 gap-1 text-center relative">
                {pipelineStagesList.map((stage, idx) => {
                  const isCurrent = selectedDetailApp.currentStageIndex === stage.number;
                  const isPassed = selectedDetailApp.currentStageIndex > stage.number || selectedDetailApp.status === 'Lolos';
                  const isFailed = (selectedDetailApp.status === 'Tidak Lolos' || selectedDetailApp.status === 'Lowongan Telah Ditutup') && selectedDetailApp.currentStageIndex === stage.number;

                  const shortNames = ['Berkas CV', 'Screening AI', 'Wawancara', 'Analisis Video', 'Keputusan'];

                  return (
                    <div key={stage.number} className="flex flex-col items-center gap-1.5 relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-2xs ${isFailed
                            ? 'bg-rose-500 text-white ring-4 ring-rose-100 dark:ring-rose-950/50'
                            : isPassed
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                                ? 'bg-[#1A4B9F] text-white ring-4 ring-blue-100 dark:ring-blue-950/50'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 size={16} />
                        ) : isFailed ? (
                          <XCircle size={16} />
                        ) : (
                          <span>{stage.number}</span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold leading-tight ${isFailed
                            ? 'text-rose-600 dark:text-rose-400'
                            : isCurrent
                              ? 'text-[#1A4B9F] dark:text-blue-400'
                              : isPassed
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400 dark:text-slate-500'
                          }`}
                      >
                        {shortNames[idx]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Applicant Interview Reminder Banner (Hari H) */}
            {(() => {
              const todayIso = new Date();
              // Adjust to local date string easily to avoid timezone bugs
              const localDate = new Date(todayIso.getTime() - (todayIso.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
              const interviewDate = selectedDetailApp.interviewDetails?.tanggal;
              
              if (selectedDetailApp.status === 'Tahap Akhir' && interviewDate === localDate) {
                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 border border-indigo-400 text-white shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white/20 rounded-full shrink-0 animate-pulse">
                        <AlertCircle size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm">PENGINGAT: Jadwal Wawancara Anda Hari Ini!</h4>
                        <p className="text-xs text-indigo-100 font-medium mt-1 leading-relaxed">
                          Wawancara Anda dijadwalkan hari ini pada pukul <strong>{selectedDetailApp.interviewDetails?.waktu || '-'} WIB</strong>. 
                          Mohon pastikan Anda sudah bersiap dan bergabung tepat waktu melalui tautan pada detail di bawah.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Status Alert Banner */}
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 ${selectedDetailApp.status === 'Tidak Lolos' || selectedDetailApp.status === 'Lowongan Telah Ditutup'
                  ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                  : selectedDetailApp.status === 'Lolos'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                  : selectedDetailApp.status === 'Tahap Akhir'
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                    : selectedDetailApp.currentStageIndex === 3 && selectedDetailApp.status === 'Dalam Proses'
                      ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/50 text-amber-900 dark:text-amber-200'
                      : 'bg-blue-50/80 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 text-[#1A4B9F] dark:text-blue-300'
                }`}
            >
              <div className="flex items-center gap-2 font-black text-sm">
                {selectedDetailApp.status === 'Tidak Lolos' || selectedDetailApp.status === 'Lowongan Telah Ditutup' ? (
                  <>
                    <XCircle size={17} className="text-rose-600 shrink-0" />
                    <span>Status Seleksi: Tidak Lolos</span>
                  </>
                ) : selectedDetailApp.status === 'Lolos' ? (
                  <>
                    <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
                    <span>Selamat! Anda Resmi Diterima (Lolos)</span>
                  </>
                ) : selectedDetailApp.status === 'Tahap Akhir' ? (
                  <>
                    <Sparkles size={17} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Status Seleksi: Tahap Akhir (Wawancara)</span>
                  </>
                ) : selectedDetailApp.currentStageIndex === 3 && selectedDetailApp.status === 'Dalam Proses' ? (
                  <>
                    <AlertCircle size={17} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="animate-pulse">Tindakan Diperlukan: Segera Upload Video</span>
                  </>
                ) : selectedDetailApp.currentStageIndex === 5 && selectedDetailApp.status === 'Dalam Proses' ? (
                  <>
                    <Clock size={17} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                    <span>Status Seleksi: Menunggu Keputusan HR</span>
                  </>
                ) : (
                  <>
                    <Clock size={17} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                    <span>Status Seleksi: Dalam Proses</span>
                  </>
                )}
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium">
                {selectedDetailApp.statusMessage}
              </p>
              {selectedDetailApp.catatanPerusahaan && (
                <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold">Catatan Perusahaan:</span> "{selectedDetailApp.catatanPerusahaan}"
                </div>
              )}
            </div>

            {/* Skor AI Ringkas & Tombol Lihat Detail AI */}
            {(selectedDetailApp.cvScore > 0 || selectedDetailApp.videoScore > 0) && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Skor CV</span>
                    <span className="text-base font-black text-[#1A4B9F] dark:text-blue-400">
                      {selectedDetailApp.cvScore}%
                    </span>
                  </div>
                  {selectedDetailApp.videoScore > 0 && (
                    <>
                      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Skor Video</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {selectedDetailApp.videoScore}%
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedDetailApp.cvScore > 0 && (
                    <button
                      type="button"
                      disabled={isUploadingVideo}
                      onClick={() => setActiveCvModalJob(selectedDetailApp)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#1A4B9F] dark:text-blue-400 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Detail CV
                    </button>
                  )}
                  {selectedDetailApp.currentStageIndex >= 5 && selectedDetailApp.rawStatus !== 'ditolak_sistem' && (
                    <button
                      type="button"
                      disabled={isUploadingVideo}
                      onClick={() => setActiveHumanModalJob(selectedDetailApp)}
                      className="px-3 py-1.5 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Detail AI
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Jadwal Wawancara Lanjutan (jika ada) */}
            {selectedDetailApp.interviewDetails && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Calendar size={14} className="text-indigo-600 dark:text-indigo-400" />
                    Jadwal Wawancara Lanjutan
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                    {selectedDetailApp.interviewDetails.tipe === 'offline' ? 'Offline di Kantor' : 'Online Meet'}
                  </span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-500">Waktu:</span> {selectedDetailApp.interviewDetails.tanggal} {selectedDetailApp.interviewDetails.waktu ? `(${selectedDetailApp.interviewDetails.waktu} WIB)` : ''}
                  </p>
                  {selectedDetailApp.interviewDetails.lokasi_atau_link && (
                    <p>
                      <span className="font-semibold text-slate-500">Lokasi/Link:</span>{' '}
                      {selectedDetailApp.interviewDetails.lokasi_atau_link.startsWith('http') ? (
                        <a
                          href={selectedDetailApp.interviewDetails.lokasi_atau_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 font-bold underline inline-flex items-center gap-1"
                        >
                          Buka Tautan <ExternalLink size={11} />
                        </a>
                      ) : (
                        selectedDetailApp.interviewDetails.lokasi_atau_link
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Khusus Tahap 3: Upload Video & Pertanyaan */}
            {selectedDetailApp.currentStageIndex === 3 && selectedDetailApp.status === 'Dalam Proses' && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <HelpCircle size={15} /> Pertanyaan Wawancara Video
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {(selectedDetailApp.videoQuestions || DEFAULT_INTERVIEW_QUESTIONS).length} Pertanyaan
                  </span>
                </div>
                <div className="space-y-1.5">
                  {(selectedDetailApp.videoQuestions || DEFAULT_INTERVIEW_QUESTIONS).map((q, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-snug">{q}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors ${isUploadingVideo ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={isUploadingVideo}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsUploadingVideo(true);
                            const video = document.createElement('video');
                            video.preload = 'metadata';
                            video.onloadedmetadata = () => {
                              window.URL.revokeObjectURL(video.src);
                              if (video.duration > 240) {
                                toast.error('Durasi video maksimal adalah 4 menit. Silakan persingkat video Anda.');
                                e.target.value = '';
                                setIsUploadingVideo(false);
                                return;
                              }
                              const formData = new FormData();
                              formData.append('video', file);
                              const uploadPromise = api.post(`/applications/${selectedDetailApp.id}/upload-video`, formData);
                              toast.promise(uploadPromise, {
                                loading: 'Mengunggah video wawancara...',
                                success: (res: any) => res.message || 'Video berhasil diunggah.',
                                error: (err: any) => parseErrorMessage(err) || 'Gagal mengunggah video.'
                              }).then(() => {
                                setTimeout(() => {
                                  window.location.href = window.location.pathname + '?showReview=true&context=uploaded_video';
                                }, 1500);
                              }).catch(() => {
                                setIsUploadingVideo(false);
                              });
                            };
                            video.onerror = () => {
                              toast.error('Gagal memproses file video.');
                              setIsUploadingVideo(false);
                            };
                            video.src = URL.createObjectURL(file);
                          }
                        }}
                      />
                      {isUploadingVideo ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      ) : (
                        <Video size={14} />
                      )}
                      <span>{isUploadingVideo ? 'Mengunggah...' : 'Upload Video Wawancara'}</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">*Durasi maksimal: 4 menit</span>
                  </div>
                </div>
              </div>
            )}

            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
              <button
                type="button"
                disabled={isUploadingVideo}
                onClick={() => setSelectedDetailApp(null)}
                className="px-6 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: STAGE 2 CV SCREENING PO-FIT AI RESULT */}
      {activeCvModalJob && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] max-w-3xl w-full flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 shrink-0 bg-white dark:bg-slate-900 z-10">
              <div>
                <span className="text-xs font-bold text-[#1A4B9F] dark:text-blue-400 uppercase tracking-wider block">
                  {t.pelamar.status.cvAnalysisTitle}
                </span>
                <h3 className="font-extrabold text-2xl text-slate-800 dark:text-slate-100 mt-0.5">
                  {t.pelamar.status.cvResultTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeCvModalJob.jobTitle} &bull; {activeCvModalJob.companyName}
                </p>
              </div>

              <button
                onClick={() => setActiveCvModalJob(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
              {/* Score Banner */}
              {(() => {
              const isFailedEdu = activeCvModalJob.kategori === 'tidak_memenuhi_syarat_pendidikan';
              const isPassed = activeCvModalJob.cvScore >= activeCvModalJob.threshold && !isFailedEdu;

              return (
                <div className="p-6 rounded-3xl bg-[#EFF6FF] dark:bg-slate-800/70 border border-[#DBEAFE] dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
                  {/* Circle Score */}
                  <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-md ${isPassed
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
                    : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20'
                    }`}>
                    <span className="text-3xl font-black">{activeCvModalJob.cvScore}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 mt-0.5">Kecocokan</span>
                  </div>

                  {/* Verdict Info */}
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border">
                      {isPassed ? <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" /> : <XCircle size={15} className="text-rose-600 dark:text-rose-400" />}
                      <span className={isPassed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
                        {isFailedEdu
                          ? 'Belum Memenuhi Syarat Minimal Pendidikan'
                          : isPassed
                            ? `Memenuhi Standar Kelulusan (≥ ${activeCvModalJob.threshold}%)`
                            : `Di Bawah Standar Kelulusan (< ${activeCvModalJob.threshold}%)`}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {isFailedEdu
                        ? 'Pendidikan Belum Memenuhi Ketentuan Posisi'
                        : isPassed
                          ? 'Profil Anda Sangat Cocok dengan Kriteria Lowongan'
                          : 'Profil Belum Mencapai Standar Nilai Minimal'}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isFailedEdu ? (
                        <>Tingkat pendidikan pada profil Anda belum memenuhi kualifikasi minimal yang disyaratkan untuk posisi ini.</>
                      ) : isPassed ? (
                        <>Kualifikasi profil dan keahlian Anda dinilai <strong>cocok ({activeCvModalJob.cvScore}%)</strong> dengan kriteria lowongan dan telah melampaui batas minimal kelulusan perusahaan (<strong>{activeCvModalJob.threshold}%</strong>).</>
                      ) : (
                        <>Tingkat kecocokan profil Anda saat ini sebesar <strong>{activeCvModalJob.cvScore}%</strong>, belum mencapai standar nilai kelulusan minimal yang ditentukan perusahaan (<strong>{activeCvModalJob.threshold}%</strong>).</>
                      )}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Informasi Sederhana */}
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Rangkuman Penilaian:</h4>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <strong className="block text-slate-800 dark:text-slate-200 mb-0.5">Pengalaman Kerja</strong>
                    <p>Sistem menilai latar belakang dan pengalaman kerja Anda memiliki tingkat kecocokan sekitar <strong>{Math.round(activeCvModalJob.hybridDetails?.sbert_score ?? activeCvModalJob.cvScore)}%</strong> dengan yang dicari oleh perusahaan.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong className="block text-slate-800 dark:text-slate-200 mb-0.5">Kemampuan (Skill)</strong>
                    <p>Sistem berhasil mengenali <strong>{activeCvModalJob.hybridDetails?.keywords_found || 0} kemampuan utama</strong> dari profil Anda, yang sesuai dengan kriteria pekerjaan ini.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <strong className="block text-slate-800 dark:text-slate-200 mb-0.5">Kesimpulan</strong>
                    {activeCvModalJob.kategori === 'tidak_memenuhi_syarat_pendidikan' ? (
                      <p className="text-rose-600 dark:text-rose-400 font-medium">Tingkat pendidikan pada profil Anda saat ini belum memenuhi kualifikasi minimal yang disyaratkan untuk posisi ini.</p>
                    ) : activeCvModalJob.cvScore >= activeCvModalJob.threshold ? (
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium">Selamat! Secara keseluruhan profil Anda sudah sangat baik dan memenuhi standar perusahaan.</p>
                    ) : (
                      <p>Saat ini profil Anda masih butuh peningkatan untuk bisa mencapai standar minimal ({activeCvModalJob.threshold}%). Jangan menyerah dan coba tambahkan pengalaman atau skill yang relevan di CV Anda!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
              <button
                onClick={() => setActiveCvModalJob(null)}
                className="px-6 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer shadow-sm transition-colors"
              >
                {t.pelamar.status.backToList}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: STAGE 5 HUMAN VALIDATION AI SCREENING SUMMARY */}
      {activeHumanModalJob && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] max-w-3xl w-full flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[85vh] overflow-hidden">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 shrink-0 bg-white dark:bg-slate-900 z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1A4B9F] dark:text-blue-400 text-[11px] font-extrabold border border-blue-200 dark:border-blue-800">
                  <Sparkles size={13} />
                  <span>Tahap 5 &bull; Human Validation</span>
                </div>
                <h3 className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-1 leading-tight">
                  Detail Hasil Screening AI
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm sm:max-w-md">
                  {activeHumanModalJob.jobTitle} &bull; <strong>{activeHumanModalJob.companyName}</strong>
                </p>
              </div>

              <button
                onClick={() => setActiveHumanModalJob(null)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
              {/* Composite Score Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50/70 dark:from-slate-800 dark:to-slate-800/60 border border-[#DBEAFE] dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1A4B9F] to-indigo-600 text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <span className="text-3xl font-black">
                  {activeHumanModalJob.generalAiDetails?.compositeScore !== undefined
                    ? `${activeHumanModalJob.generalAiDetails.compositeScore}%`
                    : `${activeHumanModalJob.cvScore}%`}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-100 mt-0.5">
                  Skor Gabungan
                </span>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-extrabold border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 size={15} />
                  <span>{activeHumanModalJob.generalAiDetails?.recommendationLabel || (activeHumanModalJob.aiResult?.kategori_fit || 'Hasil Evaluasi AI Selesai')}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeHumanModalJob.generalAiDetails?.compositeScore && activeHumanModalJob.generalAiDetails.compositeScore >= 75
                    ? 'Hasil Evaluasi Awal AI Sangat Baik'
                    : 'Hasil Evaluasi Awal AI Siap Divalidasi'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Profil CV Anda dinilai memiliki kecocokan <strong>{activeHumanModalJob.cvScore}%</strong>
                  {activeHumanModalJob.videoScore > 0 || activeHumanModalJob.aiResult?.skor_keseluruhan ? (
                    <> dan performa wawancara video tercatat <strong>{activeHumanModalJob.videoScore || Math.round(Number(activeHumanModalJob.aiResult?.skor_keseluruhan))}%</strong>.</>
                  ) : (
                    <>. Rekaman wawancara video sedang dianalisis.</>
                  )} Data ini dirangkum oleh AI sebagai bahan pertimbangan objektif tim HR <strong>{activeHumanModalJob.companyName}</strong>.
                </p>
              </div>
            </div>

            {/* Informasi Penilaian Sederhana */}
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Rincian Penilaian:</h4>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <strong className="block text-slate-800 dark:text-slate-200 mb-0.5">Penilaian Berkas (CV)</strong>
                    <p>Latar belakang dan pengalaman Anda dinilai cocok sekitar <strong>{activeHumanModalJob.cvScore}%</strong>. Sistem juga mengenali kemampuan-kemampuan utama yang dicari oleh perusahaan dari profil Anda.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                    <Video size={18} />
                  </div>
                  <div>
                    <strong className="block text-slate-800 dark:text-slate-200 mb-0.5">Penilaian Wawancara Video</strong>
                    <p>Performa komunikasi dan penyampaian Anda dinilai sebesar <strong>{activeHumanModalJob.videoScore > 0 ? activeHumanModalJob.videoScore : Math.round(Number(activeHumanModalJob.aiResult?.skor_keseluruhan || 0))}%</strong>. Ini sudah mencakup penilaian kejelasan Anda dalam berbicara dan ketenangan saat menjawab.</p>
                  </div>
                </div>

                {activeHumanModalJob.generalAiDetails?.realDetails?.ringkasanJawaban && (
                  <div className="flex items-start gap-3 border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <strong className="block text-slate-800 dark:text-slate-200 mb-0.5">Catatan Komunikasi Anda</strong>
                      <p className="italic">"{activeHumanModalJob.generalAiDetails.realDetails.ringkasanJawaban}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rincian Aspek Penilaian Utama (Bahasa Umum) */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Aspek Kemampuan Tambahan Anda
              </h4>

              <div className="space-y-2.5">
                {(activeHumanModalJob.generalAiDetails?.competencies || []).map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#1A4B9F] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#1A4B9F] dark:text-blue-400">{item.score}%</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold border border-slate-200 dark:border-slate-600 shadow-2xs">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-7 text-[11px]">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Poin Keunggulan Utama */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-2 text-xs text-emerald-900 dark:text-emerald-200">
              <span className="font-extrabold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <Sparkles size={15} /> Kelebihan Utama Anda yang Terlihat oleh Sistem:
              </span>
              <ul className="space-y-1.5 pl-5 list-disc text-[11px] leading-relaxed">
                {(activeHumanModalJob.generalAiDetails?.strengths || []).map((strength, sIdx) => (
                  <li key={sIdx}>{strength}</li>
                ))}
              </ul>
            </div>

            {/* Informasi Tahap Validasi Manusia */}
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-100">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>Catatan Penting Tahap Validasi Manusia (Human Validation)</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Hasil evaluasi di atas dirangkum secara otomatis oleh AI sebagai alat bantu penilaian awal. <strong>Keputusan akhir kelulusan serta jadwal wawancara tatap muka sepenuhnya divalidasi oleh Tim HR {activeHumanModalJob.companyName}.</strong> Mohon pantau Riwayat Lamaran Anda secara berkala.
              </p>
            </div>

            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
              <button
                onClick={() => setActiveHumanModalJob(null)}
                className="px-6 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer shadow-sm transition-colors"
              >
                {t.pelamar.status.backToList}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Candidate Review Modal */}
      <CandidateReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        contextEvent={reviewContextEvent}
      />

    </div>
  );
}

export default function StatusValidasiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A4B9F]"></div></div>}>
      <StatusValidasiContent />
    </Suspense>
  );
}
