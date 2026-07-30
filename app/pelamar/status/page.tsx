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
  Bot
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
  status: 'Dalam Proses' | 'Lolos' | 'Lowongan Telah Ditutup';
  statusMessage: string;
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

  // Expanded application cards state (default ID 1 open)
  const [expandedJobIds, setExpandedJobIds] = useState<number[]>([1]);

  // Modal States
  const [activeCvModalJob, setActiveCvModalJob] = useState<ApplicationItem | null>(null);
  const [activeVideoModalJob, setActiveVideoModalJob] = useState<ApplicationItem | null>(null);

  // Sample Applications List matching User Screenshot & Workflow
  const [applications, setApplications] = useState<ApplicationItem[]>([
    {
      id: 1,
      jobTitle: 'Senior Frontend Engineer (AI Solutions)',
      companyName: 'PT Tech Inovasi Nusantara',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      applyDate: '29/07/2026',
      kegiatan: 'WEBCAREER',
      tahapRekrutmen: 'CV Screening (PO-FIT)',
      currentStageIndex: 2,
      status: 'Dalam Proses',
      statusMessage: 'CV ATS-Friendly Anda telah sukses diproses oleh PO-FIT AI Engine dengan skor 92% (Lolos Ambang Batas 80%). Berkas saat ini diteruskan ke tim HR Manager untuk verifikasi wawancara video.',
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
      videoScore: 88,
      videoBreakdown: {
        fluency: 90,
        confidence: 86,
        keywords: 92,
        emotion: 85,
        logic: 88,
        notes: [
          'Artikulasi bicara sangat jernih dan tenang.',
          'Menjelaskan arsitektur state management dengan urutan logika yang sangat terstruktur.',
          'Kontak mata dan ekspresi wajah konsisten positif.'
        ]
      }
    },
    {
      id: 2,
      jobTitle: 'AIF - ADMO - Backend Engineer Intern',
      companyName: 'PT Astra Digital Mobil',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
      applyDate: '15/06/2026',
      kegiatan: 'WEBCAREER',
      tahapRekrutmen: 'AI Video Analysis',
      currentStageIndex: 4,
      status: 'Lolos',
      statusMessage: 'Selamat! Hasil AI Video Analysis & Skrining CV Anda telah dinyatakan LOLOS dengan nilai komposit 89%. Tim Human Validation (HR Manager) akan menghubungi Anda untuk penawaran (Offering).',
      cvScore: 86,
      cvBreakdown: {
        format: 85,
        experience: 84,
        skills: 90,
        achievements: 82,
        language: 88,
        notes: [
          'Latar belakang pendidikan S1 Teknik Informatika sesuai persyaratan minimal.',
          'Pengalaman proyek Node.js & REST API terverifikasi.'
        ]
      },
      videoScore: 91,
      videoBreakdown: {
        fluency: 92,
        confidence: 90,
        keywords: 94,
        emotion: 88,
        logic: 90,
        notes: [
          'Jawaban pertanyaan kepemimpinan menunjukkan kemampuan kolaborasi tim yang baik.',
          'Istilah teknis database & caching dijelaskan dengan sangat presisi.'
        ]
      }
    },
    {
      id: 3,
      jobTitle: 'AIF - SERA - QA Engineer Intern',
      companyName: 'Serasi Autoraya',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
      applyDate: '15/06/2026',
      kegiatan: 'WEBCAREER',
      tahapRekrutmen: 'Seleksi Administratif',
      currentStageIndex: 1,
      status: 'Lowongan Telah Ditutup',
      statusMessage: 'Sehubungan dengan telah ditutupnya lowongan rekrutmen, maka proses rekrutmen Anda tidak dapat kami lanjutkan. Terima kasih banyak atas waktu dan energi yang Anda luangkan untuk menjalani proses seleksi hingga tahapan ini. Sampai berjumpa di kesempatan berikutnya.',
      cvScore: 68,
      cvBreakdown: {
        format: 70,
        experience: 65,
        skills: 68,
        achievements: 60,
        language: 75,
        notes: [
          'Skor kesesuaian kata kunci QA Automation berada di bawah ambang batas (68% < 80%).',
          'Lowongan telah dipenuhi kandidat sebelumnya.'
        ]
      },
      videoScore: 70,
      videoBreakdown: {
        fluency: 72,
        confidence: 68,
        keywords: 65,
        emotion: 70,
        logic: 72,
        notes: [
          'Kandidat belum menyelesaikan jawaban rekaman video untuk pertanyaan ke-3.'
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
      
      {/* Top Header Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/pelamar/dashboard"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-[#0F766E] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Kembali ke Dashboard Pelamar
        </Link>

        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6FFFA] border border-[#99F6E4] text-[#0F766E] text-xs sm:text-sm font-bold">
          <Clock className="w-4 h-4 text-[#0F766E]" />
          Portal Status Lamaran Candidate Pro
        </span>
      </div>

      {/* Main Title & Search Filter Bar (Matching Screenshot UI) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CCFBF1] shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F766E]">
            Daftar Riwayat Lamaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau status perkembangan lamaran kerja Anda secara transparan dengan analisis kecerdasan buatan PO-FIT AI.
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
              className="w-full pl-11 pr-4 py-2.5 bg-[#F4FDFB] border border-[#CCFBF1] focus:border-[#0F766E] rounded-2xl text-xs font-bold text-slate-700 outline-none"
            />
          </div>

          {/* Dropdown 1: Platform */}
          <div className="sm:col-span-3">
            <select
              className="w-full px-4 py-2.5 bg-[#F4FDFB] border border-[#CCFBF1] focus:border-[#0F766E] rounded-2xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
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
              className="w-full px-4 py-2.5 bg-[#F4FDFB] border border-[#CCFBF1] focus:border-[#0F766E] rounded-2xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
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
              className="w-full px-4 py-2.5 bg-[#F4FDFB] border border-[#CCFBF1] focus:border-[#0F766E] rounded-2xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option>Semua Status</option>
              <option>Dalam Proses</option>
              <option>Lolos</option>
              <option>Lowongan Telah Ditutup</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-1">
            <button
              type="button"
              className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D635C] text-white rounded-2xl font-bold text-xs shadow-xs transition-colors"
            >
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* APPLICATIONS LIST CARDS (Matching Screenshot Card Style) */}
      <div className="space-y-6">
        {filteredApplications.map((app) => {
          const isExpanded = expandedJobIds.includes(app.id);

          return (
            <div
              key={app.id}
              className="bg-white rounded-3xl border border-[#CCFBF1] shadow-xs overflow-hidden transition-all duration-200"
            >
              {/* Card Summary Header */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Logo & Job Title */}
                  <div className="flex items-start gap-4">
                    <img
                      src={app.logo}
                      alt={app.companyName}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#CCFBF1] shrink-0"
                    />
                    <div className="space-y-1">
                      <h2 className="text-lg sm:text-xl font-black text-[#0F766E]">
                        {app.jobTitle}
                      </h2>
                      <span className="text-xs font-bold text-slate-500 block">
                        {app.companyName}
                      </span>
                    </div>
                  </div>

                  {/* Middle Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold">Tanggal Lamar</span>
                      <span className="font-bold text-slate-700">{app.applyDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Kegiatan</span>
                      <span className="font-bold text-slate-700">{app.kegiatan}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Tahap Rekrutmen</span>
                      <span className="font-bold text-[#0F766E]">{app.tahapRekrutmen}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Status</span>
                      <span className={`font-extrabold ${
                        app.status === 'Lolos' ? 'text-emerald-600' :
                        app.status === 'Dalam Proses' ? 'text-[#0F766E]' : 'text-red-600'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Right Action: Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpandJob(app.id)}
                    className="text-xs font-extrabold text-[#0F766E] hover:underline flex items-center gap-1.5 self-start md:self-center"
                  >
                    <span>{isExpanded ? 'Sembunyikan' : 'Tampilkan Detail'}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                </div>

                {/* EXPANDED PIPELINE TRACKER & NOTIFICATION BOX */}
                {isExpanded && (
                  <div className="pt-6 border-t border-[#CCFBF1] space-y-8 animate-fadeIn">
                    
                    {/* Interactive 5-Stage Pipeline Stepper */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#0F766E] flex items-center gap-2">
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
                          const isFailed = app.status === 'Lowongan Telah Ditutup' && app.currentStageIndex === stage.number;

                          const isClickableCv = stage.number === 2;
                          const isClickableVideo = stage.number === 4;

                          return (
                            <div
                              key={stage.number}
                              onClick={() => {
                                if (isClickableCv) setActiveCvModalJob(app);
                                if (isClickableVideo) setActiveVideoModalJob(app);
                              }}
                              className={`p-4 rounded-2xl border space-y-2 transition-all relative group cursor-pointer ${
                                isClickableCv || isClickableVideo ? 'hover:shadow-md hover:scale-[1.02]' : ''
                              } ${
                                isFailed ? 'bg-red-50 border-red-200 text-red-700' :
                                isCurrentStage ? 'bg-[#E6FFFA] border-[#99F6E4] text-[#0F766E] ring-2 ring-[#0F766E]' :
                                isPassedStage ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                                'bg-slate-50 border-slate-200 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                                <span>{stage.name}</span>
                                {(isClickableCv || isClickableVideo) && (
                                  <span className="px-2 py-0.5 rounded-full bg-white text-[#0F766E] font-bold text-[10px] border border-[#99F6E4] shadow-2xs">
                                    🔍 Klik Detail
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs font-bold pt-1">
                                <span>
                                  {isFailed ? 'Tidak Lolos' :
                                   isCurrentStage ? 'Dalam Proses AI' :
                                   isPassedStage ? 'Lolos' : 'Menunggu'}
                                </span>
                                {isPassedStage ? (
                                  <CheckCircle2 size={16} className="text-emerald-600" />
                                ) : isFailed ? (
                                  <XCircle size={16} className="text-red-600" />
                                ) : (
                                  <Clock size={16} className="text-[#0F766E]" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Official Notification Message Box (Matching Screenshot Bottom Container) */}
                    <div className={`p-6 rounded-3xl border text-xs sm:text-sm space-y-3 leading-relaxed ${
                      app.status === 'Lowongan Telah Ditutup'
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : app.status === 'Lolos'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-[#F4FDFB] border-[#CCFBF1] text-[#0F766E]'
                    }`}>
                      <div className="flex items-center gap-2 font-black text-sm">
                        {app.status === 'Lowongan Telah Ditutup' ? (
                          <>
                            <XCircle size={18} className="text-red-600 shrink-0" />
                            <span>Pemberitahuan Status Seleksi</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} className="text-[#0F766E] shrink-0" />
                            <span>Pemberitahuan Status Progress AI-Recruit Pro</span>
                          </>
                        )}
                      </div>

                      <p className="text-slate-700">
                        {app.statusMessage}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                          <span>Belum mendapatkan update informasi?</span>
                          <button
                            onClick={() => alert('Customer Support HR Developer AI-Recruit Pro: support@airecruitpro.com / WhatsApp: 0812-9900-8800')}
                            className="font-bold text-[#0F766E] hover:underline"
                          >
                            Hubungi tim perekrut
                          </button>
                          <span>atau kunjungi</span>
                          <a href="#faq" className="font-bold text-[#0F766E] hover:underline">FAQ</a>
                        </div>

                        {/* Direct Button Trigger for Stage 2 & 4 Modal Inspection */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveCvModalJob(app)}
                            className="px-4 py-1.5 rounded-full bg-white text-[#0F766E] font-bold border border-[#99F6E4] hover:bg-[#E6FFFA] transition-colors shadow-2xs"
                          >
                            📄 Skor AI CV Screening ({app.cvScore}%)
                          </button>
                          <button
                            onClick={() => setActiveVideoModalJob(app)}
                            className="px-4 py-1.5 rounded-full bg-[#0F766E] text-white font-bold hover:bg-[#0D635C] transition-colors shadow-2xs"
                          >
                            🎥 Skor AI Video Analysis ({app.videoScore}%)
                          </button>
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
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 space-y-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider block">
                  Stage 2: CV Analysis Result (PO-FIT System)
                </span>
                <h3 className="font-black text-2xl text-[#0F766E]">
                  Hasil Skrining AI Kualifikasi CV
                </h3>
                <p className="text-xs text-slate-500">
                  {activeCvModalJob.jobTitle} — {activeCvModalJob.companyName}
                </p>
              </div>

              <button
                onClick={() => setActiveCvModalJob(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Score Banner */}
            <div className="p-6 rounded-3xl bg-[#F4FDFB] border border-[#CCFBF1] flex flex-col sm:flex-row items-center gap-6">
              <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shrink-0 shadow-md ${
                activeCvModalJob.cvScore >= 80 ? 'bg-[#0F766E]' : 'bg-red-600'
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

                <h4 className="text-lg font-black text-[#0F766E]">
                  {activeCvModalJob.cvScore >= 80 ? 'High Alignment with Job Description' : 'Low Alignment with Job Requirements'}
                </h4>
                <p className="text-xs text-slate-600">
                  Algoritma PO-FIT Cosine Similarity: <strong className="text-[#0F766E]">{activeCvModalJob.cvScore}% match</strong>.
                </p>
              </div>
            </div>

            {/* 5 Criteria Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-[#CCFBF1] text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Format &amp; Structure</span>
                <span className="text-xl font-black text-[#0F766E]">{activeCvModalJob.cvBreakdown.format}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CCFBF1] text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Relevant Experience</span>
                <span className="text-xl font-black text-[#0F766E]">{activeCvModalJob.cvBreakdown.experience}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CCFBF1] text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Skills &amp; Certs</span>
                <span className="text-xl font-black text-[#0F766E]">{activeCvModalJob.cvBreakdown.skills}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CCFBF1] text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Achievements &amp; Impact</span>
                <span className="text-xl font-black text-[#0F766E]">{activeCvModalJob.cvBreakdown.achievements}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CCFBF1] text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Language &amp; Comm</span>
                <span className="text-xl font-black text-[#0F766E]">{activeCvModalJob.cvBreakdown.language}%</span>
              </div>
            </div>

            {/* AI Notes */}
            <div className="p-5 rounded-2xl bg-[#F4FDFB] border border-[#CCFBF1] space-y-3 text-xs sm:text-sm text-slate-700">
              <span className="font-extrabold text-[#0F766E] flex items-center gap-2">
                <Sparkles size={16} /> Catatan Evaluasi PO-FIT AI CV:
              </span>
              <ul className="space-y-2">
                {activeCvModalJob.cvBreakdown.notes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveCvModalJob(null)}
                className="px-6 py-2.5 rounded-full bg-[#0F766E] text-white font-bold text-xs"
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
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 space-y-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider block">
                  Stage 4: AI Video Analysis Result (Behavioral &amp; Emotion AI)
                </span>
                <h3 className="font-black text-2xl text-[#0F766E]">
                  Hasil Evaluasi Per-Kriteria Rekaman Video
                </h3>
                <p className="text-xs text-slate-500">
                  {activeVideoModalJob.jobTitle} — {activeVideoModalJob.companyName}
                </p>
              </div>

              <button
                onClick={() => setActiveVideoModalJob(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Score Banner */}
            <div className="p-6 rounded-3xl bg-[#F4FDFB] border border-[#CCFBF1] flex flex-col sm:flex-row items-center gap-6">
              <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shrink-0 shadow-md ${
                activeVideoModalJob.videoScore >= 80 ? 'bg-[#0F766E]' : 'bg-red-600'
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

                <h4 className="text-lg font-black text-[#0F766E]">
                  Penyampaian Lisan &amp; Ekspresi Emosi Sangat Terstruktur
                </h4>
                <p className="text-xs text-slate-600">
                  Model AI Speech &amp; Facial Recognition: <strong className="text-[#0F766E]">{activeVideoModalJob.videoScore}% nilai komposit</strong>.
                </p>
              </div>
            </div>

            {/* 5 Video Criteria Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-[#CCFBF1] text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Fluency &amp; Comm</span>
                <span className="text-xl font-black text-[#0F766E]">{activeVideoModalJob.videoBreakdown.fluency}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CCFBF1] text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Confidence &amp; Posture</span>
                <span className="text-xl font-black text-[#0F766E]">{activeVideoModalJob.videoBreakdown.confidence}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CCFBF1] text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Keyword Relevance</span>
                <span className="text-xl font-black text-[#0F766E]">{activeVideoModalJob.videoBreakdown.keywords}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CCFBF1] text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Emotion &amp; Pitch Stability</span>
                <span className="text-xl font-black text-[#0F766E]">{activeVideoModalJob.videoBreakdown.emotion}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CCFBF1] text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Problem Solving Logic</span>
                <span className="text-xl font-black text-[#0F766E]">{activeVideoModalJob.videoBreakdown.logic}%</span>
              </div>
            </div>

            {/* AI Notes */}
            <div className="p-5 rounded-2xl bg-[#F4FDFB] border border-[#CCFBF1] space-y-3 text-xs sm:text-sm text-slate-700">
              <span className="font-extrabold text-[#0F766E] flex items-center gap-2">
                <Bot size={16} /> Catatan Evaluasi AI Video Analysis:
              </span>
              <ul className="space-y-2">
                {activeVideoModalJob.videoBreakdown.notes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveVideoModalJob(null)}
                className="px-6 py-2.5 rounded-full bg-[#0F766E] text-white font-bold text-xs"
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
