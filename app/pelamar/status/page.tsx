'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
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
  ArrowRight
} from 'lucide-react';

interface ApplicationItem {
  id: number;
  jobTitle: string;
  companyName: string;
  logo: string;
  applyDate: string;
  kegiatan: string;
  tahapRekrutmen: string;
  currentStageIndex: number; // 1 to 5
  status: 'Dalam Proses' | 'Lolos' | 'Tidak Lolos' | 'Lowongan Telah Ditutup';
  statusMessage: string;
  hasActionRequired?: boolean;
  cvScore: number;
  cvBreakdown: {
    format: number;
    experience: number;
    skills: number;
    achievements: number;
    language: number;
    notes: string[];
  };
  videoScore: number;
  videoBreakdown: {
    fluency: number;
    confidence: number;
    keywords: number;
    emotion: number;
    logic: number;
    notes: string[];
  };
}

export default function StatusValidasiPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('Semua Tahapan');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  // Expanded application cards state (default ID 5 & 4 open)
  const [expandedJobIds, setExpandedJobIds] = useState<number[]>([5, 4]);

  // Modal States
  const [activeCvModalJob, setActiveCvModalJob] = useState<ApplicationItem | null>(null);
  const [activeVideoModalJob, setActiveVideoModalJob] = useState<ApplicationItem | null>(null);

  // 5 Representative Status Scenarios
  const [applications, setApplications] = useState<ApplicationItem[]>([
    // 5. PROSES: Disuruh upload virtual interview (Action Required)
    {
      id: 5,
      jobTitle: 'Senior Frontend Engineer (AI Solutions)',
      companyName: 'PT Tech Inovasi Nusantara',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      applyDate: '29/07/2026',
      kegiatan: 'WEBCAREER',
      tahapRekrutmen: 'Stage 3: Wawancara Video (Tindakan Diperlukan)',
      currentStageIndex: 3,
      status: 'Dalam Proses',
      hasActionRequired: true,
      statusMessage: 'CV ATS-Friendly Anda telah LOLOS skrining AI dengan skor 92%! Silakan lakukan perekaman Wawancara Video Singkat (Virtual Interview) untuk melanjutkan proses seleksi ke tahap berikutnya.',
      cvScore: 92,
      cvBreakdown: {
        format: 88,
        experience: 95,
        skills: 92,
        achievements: 85,
        language: 90,
        notes: [
          '3+ tahun pengalaman Frontend Engineer sangat relevan dengan kualifikasi senior.',
          'Kata kunci Next.js, TypeScript, dan Tailwind CSS cocok 100% dengan Job Description.',
          'Struktur dokumen ATS-Friendly terbaca sempurna oleh parser OCR AI.'
        ]
      },
      videoScore: 0,
      videoBreakdown: {
        fluency: 0,
        confidence: 0,
        keywords: 0,
        emotion: 0,
        logic: 0,
        notes: [
          'Kandidat belum melakukan perekaman Wawancara Video Singkat.'
        ]
      }
    },
    // 4. Selesai sampai human validation dan diterima tanpa adanya additional interview
    {
      id: 4,
      jobTitle: 'AIF - ADMO - Senior Backend Engineer',
      companyName: 'PT Astra Digital Mobil',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
      applyDate: '01/07/2026',
      kegiatan: 'WEBCAREER',
      tahapRekrutmen: 'Stage 5: Human Validation (Diterima / Fast-Track)',
      currentStageIndex: 5,
      status: 'Lolos',
      statusMessage: '🎉 Selamat! Anda dinyatakan DITERIMA (HIRED) secara langsung tanpa perlu wawancara tambahan, berdasarkan skor komposit AI PO-FIT Anda yang sangat unggul (96%). Surat Penawaran Kerja (Offering Letter) resmi telah dikirimkan ke email Anda.',
      cvScore: 96,
      cvBreakdown: {
        format: 95,
        experience: 98,
        skills: 96,
        achievements: 94,
        language: 95,
        notes: [
          'Kualifikasi CV & pengalaman arsitektur microservices sangat menonjol.',
          'Format dokumen ATS 100% terstruktur sempurna.'
        ]
      },
      videoScore: 95,
      videoBreakdown: {
        fluency: 96,
        confidence: 94,
        keywords: 96,
        emotion: 92,
        logic: 95,
        notes: [
          'Penyampaian lisan & artikulasi bahasa sangat lugas dan profesional.',
          'Lolos kriteria penilaian komposit tanpa syarat wawancara fisik tambahan.'
        ]
      }
    },
    // 3. Tidak lolos tahap human validation (additional interview)
    {
      id: 3,
      jobTitle: 'Senior Fullstack Developer (Node.js & React)',
      companyName: 'Fintech Utama Indonesia',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
      applyDate: '10/06/2026',
      kegiatan: 'WEBCAREER',
      tahapRekrutmen: 'Stage 5: Human Validation (Wawancara HR)',
      currentStageIndex: 5,
      status: 'Tidak Lolos',
      statusMessage: 'Wawancara tambahan (Human Validation) bersama HR Manager telah selesai dilaksanakan. Terima kasih banyak atas waktu Anda, namun tim HR memutuskan belum dapat melanjutkan berkas Anda ke tahap penawaran kerja (Offering).',
      cvScore: 88,
      cvBreakdown: {
        format: 86,
        experience: 90,
        skills: 88,
        achievements: 85,
        language: 90,
        notes: [
          'CV lolos skrining otomatis dengan kualifikasi teknis yang baik.'
        ]
      },
      videoScore: 85,
      videoBreakdown: {
        fluency: 86,
        confidence: 84,
        keywords: 88,
        emotion: 82,
        logic: 85,
        notes: [
          'Skor analisis AI video dalam rentang baik.',
          'Hasil wawancara tatap muka akhir menentukan alokasi kandidat lain.'
        ]
      }
    },
    // 2. Tidak lolos tahap interview video
    {
      id: 2,
      jobTitle: 'Data Analyst & BI Specialist',
      companyName: 'Nusantara Intelligence Corp',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
      applyDate: '20/06/2026',
      kegiatan: 'WEBCAREER',
      tahapRekrutmen: 'Stage 4: AI Video Analysis',
      currentStageIndex: 4,
      status: 'Tidak Lolos',
      statusMessage: 'Maaf, hasil evaluasi AI Video Wawancara Anda memperoleh skor komposit 64% (di bawah ambang batas minimum 80%). Indikator respon lisan & analisis ekspresi emosi belum memenuhi kriteria evaluasi lowongan ini.',
      cvScore: 86,
      cvBreakdown: {
        format: 85,
        experience: 87,
        skills: 86,
        achievements: 84,
        language: 88,
        notes: [
          'Skor CV lolos tahap awal skrining kualifikasi.'
        ]
      },
      videoScore: 64,
      videoBreakdown: {
        fluency: 62,
        confidence: 60,
        keywords: 68,
        emotion: 65,
        logic: 65,
        notes: [
          'Skor ketenangan lisan & relevansi kata kunci lisan di bawah threshold 80%.',
          'Jawaban pertanyaan kepemimpinan terpotong sebelum durasi usai.'
        ]
      }
    },
    // 1. Tidak lolos tahap CV
    {
      id: 1,
      jobTitle: 'AIF - SERA - QA Automation Engineer',
      companyName: 'Serasi Autoraya',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
      applyDate: '15/06/2026',
      kegiatan: 'WEBCAREER',
      tahapRekrutmen: 'Stage 2: Skrining CV (PO-FIT)',
      currentStageIndex: 2,
      status: 'Tidak Lolos',
      statusMessage: 'Maaf, hasil analisis CV ATS-Friendly Anda memperoleh skor 68% (di bawah ambang batas minimum 80%). Kualifikasi kata kunci teknis & sertifikasi belum memenuhi kriteria kualifikasi lowongan ini.',
      cvScore: 68,
      cvBreakdown: {
        format: 70,
        experience: 65,
        skills: 68,
        achievements: 60,
        language: 75,
        notes: [
          'Skor kesesuaian kata kunci QA Automation berada di bawah ambang batas (68% < 80%).',
          'Pengalaman alat pengujian otomatisasi tidak tercantum secara spesifik.'
        ]
      },
      videoScore: 0,
      videoBreakdown: {
        fluency: 0,
        confidence: 0,
        keywords: 0,
        emotion: 0,
        logic: 0,
        notes: [
          'Tidak memenuhi syarat untuk tahap wawancara video.'
        ]
      }
    }
  ]);

  const pipelineStagesList = [
    { number: 1, name: '1. UPLOAD CV', key: 'cv_upload' },
    { number: 2, name: '2. CV SCREENING (PO-FIT)', key: 'cv_screening' },
    { number: 3, name: '3. VIRTUAL INTERVIEW', key: 'virtual_interview' },
    { number: 4, name: '4. AI VIDEO ANALYSIS', key: 'video_analysis' },
    { number: 5, name: '5. HUMAN VALIDATION', key: 'human_validation' }
  ];

  const toggleExpandJob = (id: number) => {
    if (expandedJobIds.includes(id)) {
      setExpandedJobIds(expandedJobIds.filter(jobId => jobId !== id));
    } else {
      setExpandedJobIds([...expandedJobIds, id]);
    }
  };

  // Filtered list
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Semua Status' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1600px] w-full mx-auto space-y-8">

      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-end">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0F1F7] dark:bg-slate-800 border border-[#B8E1ED] dark:border-slate-700 text-[#2596be] dark:text-cyan-400 text-xs sm:text-sm font-bold">
          <Clock className="w-4 h-4 text-[#2596be]" />
          Portal Status Lamaran Candidate Pro
        </span>
      </div>

      {/* Main Title & Search Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-[#C2E5EF] dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2596be] dark:text-cyan-400">
            Daftar Riwayat Lamaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau status perkembangan 5 contoh skenario lamaran kerja secara transparan dengan analisis kecerdasan buatan PO-FIT AI.
          </p>
        </div>

        {/* Search & Dropdown Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search Box */}
          <div className="sm:col-span-4 relative flex items-center">
            <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Temukan Posisi atau Nama Perusahaan..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#2596be] rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            />
          </div>

          {/* Dropdown 1: Platform */}
          <div className="sm:col-span-3">
            <select
              className="w-full px-4 py-2.5 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#2596be] rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option>Semua Platform</option>
              <option>WEBCAREER</option>
              <option>JOBFAIR VIRTUAL</option>
            </select>
          </div>

          {/* Dropdown 2: Tahapan */}
          <div className="sm:col-span-2">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#2596be] rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option>Semua Tahapan</option>
              <option>CV Screening</option>
              <option>AI Video Analysis</option>
              <option>Human Validation</option>
            </select>
          </div>

          {/* Dropdown 3: Status */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#2596be] rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option>Semua Status</option>
              <option>Dalam Proses</option>
              <option>Lolos</option>
              <option>Tidak Lolos</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-1">
            <button
              type="button"
              className="w-full py-2.5 bg-[#2596be] hover:bg-[#1D7FA1] text-white rounded-2xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* APPLICATIONS LIST CARDS */}
      <div className="space-y-6">
        {filteredApplications.map((app) => {
          const isExpanded = expandedJobIds.includes(app.id);

          return (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-[#C2E5EF] dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200"
            >
              {/* Card Summary Header */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                  {/* Left: Logo & Job Title */}
                  <div className="flex items-start gap-4">
                    <img
                      src={app.logo}
                      alt={app.companyName}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#C2E5EF] dark:border-slate-700 shrink-0"
                    />
                    <div className="space-y-1">
                      <h2 className="text-lg sm:text-xl font-black text-[#2596be] dark:text-cyan-400">
                        {app.jobTitle}
                      </h2>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                        {app.companyName}
                      </span>
                    </div>
                  </div>

                  {/* Middle Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold">Tanggal Lamar</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{app.applyDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Kegiatan</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{app.kegiatan}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Tahap Rekrutmen</span>
                      <span className="font-bold text-[#2596be] dark:text-cyan-400">{app.tahapRekrutmen}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Status</span>
                      <span className={`font-extrabold px-3 py-1 rounded-full text-xs inline-block ${
                        app.status === 'Lolos'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : app.status === 'Dalam Proses'
                          ? 'bg-cyan-100 text-[#2596be] border border-cyan-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Right Action: Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpandJob(app.id)}
                    className="text-xs font-extrabold text-[#2596be] hover:underline flex items-center gap-1.5 self-start md:self-center cursor-pointer"
                  >
                    <span>{isExpanded ? 'Sembunyikan' : 'Tampilkan Detail'}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                </div>

                {/* EXPANDED PIPELINE TRACKER & NOTIFICATION BOX */}
                {isExpanded && (
                  <div className="pt-6 border-t border-[#C2E5EF] dark:border-slate-800 space-y-8 animate-fadeIn">

                    {/* Interactive 5-Stage Pipeline Stepper */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#2596be] dark:text-cyan-400 flex items-center gap-2">
                          <BarChart3 size={16} /> Timeline Kemajuan Seleksi:
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 italic">
                          💡 Klik <strong>Stage 2 (CV Screening)</strong> atau <strong>Stage 4 (AI Video)</strong> untuk melihat rincian skor AI.
                        </span>
                      </div>

                      {/* 5 Dynamic Pipeline Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        {pipelineStagesList.map((stage) => {
                          const isCurrentStage = app.currentStageIndex === stage.number;
                          const isPassedStage = app.currentStageIndex > stage.number || app.status === 'Lolos';
                          const isFailed = (app.status === 'Tidak Lolos' || app.status === 'Lowongan Telah Ditutup') && app.currentStageIndex === stage.number;

                          const isClickableCv = stage.number === 2 && app.cvScore > 0;
                          const isClickableVideo = stage.number === 4 && app.videoScore > 0;

                          return (
                            <div
                              key={stage.number}
                              onClick={() => {
                                if (isClickableCv) setActiveCvModalJob(app);
                                if (isClickableVideo) setActiveVideoModalJob(app);
                              }}
                              className={`p-4 rounded-2xl border space-y-2 transition-all relative group ${
                                isClickableCv || isClickableVideo ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : ''
                              } ${
                                isFailed
                                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-700 dark:text-red-300'
                                  : isCurrentStage
                                  ? 'bg-[#E0F1F7] dark:bg-slate-800 border-[#B8E1ED] text-[#2596be] dark:text-cyan-400 ring-2 ring-[#2596be]'
                                  : isPassedStage
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                                <span>{stage.name}</span>
                                {(isClickableCv || isClickableVideo) && (
                                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 font-bold text-[10px] border border-[#B8E1ED] shadow-2xs">
                                    🔍 Klik Detail
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs font-bold pt-1">
                                <span>
                                  {isFailed
                                    ? 'Tidak Lolos'
                                    : isCurrentStage
                                    ? app.status === 'Dalam Proses' ? 'Dalam Proses' : 'Aktif'
                                    : isPassedStage
                                    ? 'Lolos'
                                    : 'Menunggu'}
                                </span>
                                {isPassedStage ? (
                                  <CheckCircle2 size={16} className="text-emerald-600" />
                                ) : isFailed ? (
                                  <XCircle size={16} className="text-red-600" />
                                ) : (
                                  <Clock size={16} className="text-[#2596be]" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Official Notification Message Box */}
                    <div className={`p-6 rounded-3xl border text-xs sm:text-sm space-y-4 leading-relaxed ${
                      app.status === 'Tidak Lolos' || app.status === 'Lowongan Telah Ditutup'
                        ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 text-red-900 dark:text-red-200'
                        : app.status === 'Lolos'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                        : 'bg-[#F0F8FB] dark:bg-slate-800/80 border-[#C2E5EF] dark:border-slate-700 text-[#2596be] dark:text-cyan-300'
                    }`}>
                      <div className="flex items-center gap-2 font-black text-sm">
                        {app.status === 'Tidak Lolos' || app.status === 'Lowongan Telah Ditutup' ? (
                          <>
                            <XCircle size={18} className="text-red-600 shrink-0" />
                            <span>Pemberitahuan Status Seleksi (Hasil Evaluasi)</span>
                          </>
                        ) : app.status === 'Lolos' ? (
                          <>
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                            <span>Pemberitahuan Kelulusan Seleksi (HIRED)</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} className="text-[#2596be] shrink-0" />
                            <span>Pemberitahuan Status Progress AI-Recruit Pro</span>
                          </>
                        )}
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">
                        {app.statusMessage}
                      </p>

                      {/* SPECIAL ACTION BUTTON FOR SCENARIO 5: UPLOAD VIRTUAL INTERVIEW */}
                      {app.currentStageIndex === 3 && app.status === 'Dalam Proses' && (
                        <div className="pt-2">
                          <Link
                            href="/pelamar/wawancara"
                            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all animate-bounce cursor-pointer"
                          >
                            <Video size={18} className="text-cyan-200" />
                            <span>Mulai Wawancara Video AI Sekarang</span>
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                          <span>Belum mendapatkan update informasi?</span>
                          <button
                            onClick={() => alert('Customer Support HR Developer AI-Recruit Pro: support@airecruitpro.com / WhatsApp: 0812-9900-8800')}
                            className="font-bold text-[#2596be] dark:text-cyan-400 hover:underline cursor-pointer"
                          >
                            Hubungi tim perekrut
                          </button>
                        </div>

                        {/* Direct Button Trigger for Stage 2 & 4 Modal Inspection */}
                        <div className="flex items-center gap-2">
                          {app.cvScore > 0 && (
                            <button
                              onClick={() => setActiveCvModalJob(app)}
                              className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 font-bold border border-[#B8E1ED] dark:border-slate-700 hover:bg-[#E0F1F7] transition-colors shadow-2xs cursor-pointer"
                            >
                              📄 Skor AI CV ({app.cvScore}%)
                            </button>
                          )}

                          {app.videoScore > 0 && (
                            <button
                              onClick={() => setActiveVideoModalJob(app)}
                              className="px-4 py-1.5 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-bold transition-colors shadow-2xs cursor-pointer"
                            >
                              🎥 Skor AI Video ({app.videoScore}%)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: STAGE 2 CV SCREENING PO-FIT AI RESULT */}
      {activeCvModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-10 space-y-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-[#2596be] dark:text-cyan-400 uppercase tracking-wider block">
                  Stage 2: CV Analysis Result (PO-FIT System)
                </span>
                <h3 className="font-black text-2xl text-[#2596be] dark:text-cyan-400">
                  Hasil Skrining AI Kualifikasi CV
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeCvModalJob.jobTitle} — {activeCvModalJob.companyName}
                </p>
              </div>

              <button
                onClick={() => setActiveCvModalJob(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Score Banner */}
            <div className="p-6 rounded-3xl bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
              <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shrink-0 shadow-md ${activeCvModalJob.cvScore >= 80 ? 'bg-[#2596be]' : 'bg-red-600'
                }`}>
                <span className="text-3xl font-black">{activeCvModalJob.cvScore}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">SCORE</span>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                {activeCvModalJob.cvScore >= 80 ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                    <CheckCircle2 size={16} /> PASSES THRESHOLD (Score &ge; 80%)
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-extrabold border border-red-300">
                    <XCircle size={16} /> BELUM MEMENUHI THRESHOLD (Score &lt; 80%)
                  </div>
                )}

                <h4 className="text-lg font-black text-[#2596be] dark:text-cyan-400">
                  {activeCvModalJob.cvScore >= 80 ? 'High Alignment with Job Description' : 'Low Alignment with Job Requirements'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Algoritma PO-FIT Cosine Similarity: <strong className="text-[#2596be] dark:text-cyan-400">{activeCvModalJob.cvScore}% match</strong>.
                </p>
              </div>
            </div>

            {/* 5 Criteria Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Format &amp; Structure</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeCvModalJob.cvBreakdown.format}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Relevant Experience</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeCvModalJob.cvBreakdown.experience}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Skills &amp; Certs</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeCvModalJob.cvBreakdown.skills}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Achievements &amp; Impact</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeCvModalJob.cvBreakdown.achievements}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Language &amp; Comm</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeCvModalJob.cvBreakdown.language}%</span>
              </div>
            </div>

            {/* AI Notes */}
            <div className="p-5 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800/80 border border-[#C2E5EF] dark:border-slate-700 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <span className="font-extrabold text-[#2596be] dark:text-cyan-400 flex items-center gap-2">
                <Sparkles size={16} /> Catatan Evaluasi PO-FIT AI CV:
              </span>
              <ul className="space-y-2">
                {activeCvModalJob.cvBreakdown.notes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveCvModalJob(null)}
                className="px-6 py-2.5 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-bold text-xs cursor-pointer"
              >
                Tutup Scorecard CV
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: STAGE 4 AI VIDEO ANALYSIS RESULT */}
      {activeVideoModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-10 space-y-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-[#2596be] dark:text-cyan-400 uppercase tracking-wider block">
                  Stage 4: AI Video Analysis Result (Behavioral &amp; Emotion AI)
                </span>
                <h3 className="font-black text-2xl text-[#2596be] dark:text-cyan-400">
                  Hasil Evaluasi Per-Kriteria Rekaman Video
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeVideoModalJob.jobTitle} — {activeVideoModalJob.companyName}
                </p>
              </div>

              <button
                onClick={() => setActiveVideoModalJob(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Score Banner */}
            <div className="p-6 rounded-3xl bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
              <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shrink-0 shadow-md ${activeVideoModalJob.videoScore >= 80 ? 'bg-[#2596be]' : 'bg-red-600'
                }`}>
                <span className="text-3xl font-black">{activeVideoModalJob.videoScore}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">VIDEO SCORE</span>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                {activeVideoModalJob.videoScore >= 80 ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                    <CheckCircle2 size={16} /> PASSES VIDEO THRESHOLD (Score &ge; 80%)
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-extrabold border border-red-300">
                    <XCircle size={16} /> BELUM MEMENUHI THRESHOLD (Score &lt; 80%)
                  </div>
                )}

                <h4 className="text-lg font-black text-[#2596be] dark:text-cyan-400">
                  {activeVideoModalJob.videoScore >= 80 ? 'Penyampaian Lisan & Ekspresi Emosi Sangat Terstruktur' : 'Hasil Evaluasi Video Belum Memenuhi Threshold'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Model AI Speech &amp; Facial Recognition: <strong className="text-[#2596be] dark:text-cyan-400">{activeVideoModalJob.videoScore}% nilai komposit</strong>.
                </p>
              </div>
            </div>

            {/* 5 Video Criteria Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Fluency &amp; Comm</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeVideoModalJob.videoBreakdown.fluency}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Confidence &amp; Posture</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeVideoModalJob.videoBreakdown.confidence}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Keyword Relevance</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeVideoModalJob.videoBreakdown.keywords}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Emotion &amp; Pitch Stability</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeVideoModalJob.videoBreakdown.emotion}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Problem Solving Logic</span>
                <span className="text-xl font-black text-[#2596be] dark:text-cyan-400">{activeVideoModalJob.videoBreakdown.logic}%</span>
              </div>
            </div>

            {/* AI Notes */}
            <div className="p-5 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800/80 border border-[#C2E5EF] dark:border-slate-700 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <span className="font-extrabold text-[#2596be] dark:text-cyan-400 flex items-center gap-2">
                <Bot size={16} /> Catatan Evaluasi AI Video Analysis:
              </span>
              <ul className="space-y-2">
                {activeVideoModalJob.videoBreakdown.notes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveVideoModalJob(null)}
                className="px-6 py-2.5 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-bold text-xs cursor-pointer"
              >
                Tutup Scorecard Video AI
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
