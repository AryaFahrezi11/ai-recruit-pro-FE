'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Users, Search, Filter, GraduationCap, CheckCircle2, XCircle, Clock, 
  Building2, Eye, FileText, ChevronRight, X, Sparkles, Award, ExternalLink, 
  Download, Video, Play, RefreshCw, FileCheck, Check
} from 'lucide-react';

interface ApplicationHistory {
  company: string;
  role: string;
  status: 'hired' | 'rejected' | 'in_progress';
  stageText: string;
  poFitScore: number;
  dateApplied: string;
}

interface StudentItem {
  id: string;
  nim: string;
  name: string;
  major: string;
  gpa: number;
  batch: string;
  primaryStatus: 'hired' | 'rejected' | 'in_progress';
  targetCompany: string;
  targetRole: string;
  avgPoFit: number;
  cvFileName: string;
  videoDuration: string;
  videoScores: {
    ability: number;
    intelligent: number;
    personality: number;
    attitude: number;
    emotionalIntelligence: number;
  };
  applications: ApplicationHistory[];
}

export default function KampusMahasiswaPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [majorFilter, setMajorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'hired' | 'in_progress' | 'rejected'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [modalTab, setModalTab] = useState<'applications' | 'cv' | 'video'>('applications');
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Mock Students Data
  const [students] = useState<StudentItem[]>([
    {
      id: 'mhs-1',
      nim: '2206018291',
      name: 'David Kim',
      major: 'Teknik Informatika (S1)',
      gpa: 3.85,
      batch: '2022',
      primaryStatus: 'hired',
      targetCompany: 'PT MegaWeb Tech',
      targetRole: 'Senior Frontend Developer',
      avgPoFit: 95,
      cvFileName: 'CV_David_Kim_Teknik_Informatika_2026.pdf',
      videoDuration: '15 Menit 32 Detik',
      videoScores: { ability: 85, intelligent: 92, personality: 78, attitude: 88, emotionalIntelligence: 80 },
      applications: [
        { company: 'PT MegaWeb Tech', role: 'Senior Frontend Developer', status: 'hired', stageText: 'Diterima Kerja (Tahap 5 Validasi HR)', poFitScore: 95, dateApplied: '15 Jul 2026' },
        { company: 'PT FinanceCorp', role: 'Frontend Engineer', status: 'rejected', stageText: 'Ditolak (Skor PO-FIT 74% dibawah threshold 60%)', poFitScore: 74, dateApplied: '02 Jun 2026' }
      ]
    },
    {
      id: 'mhs-2',
      nim: '2206019482',
      name: 'Siti Nurhaliza',
      major: 'Teknik Informatika (S1)',
      gpa: 3.78,
      batch: '2022',
      primaryStatus: 'in_progress',
      targetCompany: 'PT FinanceCorp Indonesia',
      targetRole: 'Angular Developer',
      avgPoFit: 89,
      cvFileName: 'CV_Siti_Nurhaliza_Angular_Dev.pdf',
      videoDuration: '14 Menit 10 Detik',
      videoScores: { ability: 80, intelligent: 85, personality: 90, attitude: 82, emotionalIntelligence: 88 },
      applications: [
        { company: 'PT FinanceCorp Indonesia', role: 'Angular Developer', status: 'in_progress', stageText: 'Sedang Proses (Tahap 5 Validasi HR)', poFitScore: 89, dateApplied: '20 Jul 2026' },
        { company: 'PT Creative Design Hub', role: 'Web Designer', status: 'rejected', stageText: 'Ditolak (Tahap 3 Wawancara Video)', poFitScore: 78, dateApplied: '10 Jun 2026' }
      ]
    },
    {
      id: 'mhs-3',
      nim: '2206020193',
      name: 'Rina Permata',
      major: 'Sistem Informasi (S1)',
      gpa: 3.91,
      batch: '2022',
      primaryStatus: 'hired',
      targetCompany: 'PT DataGlobal Solusindo',
      targetRole: 'AI Data Analyst',
      avgPoFit: 92,
      cvFileName: 'CV_Rina_Permata_Data_Analyst.pdf',
      videoDuration: '16 Menit 45 Detik',
      videoScores: { ability: 90, intelligent: 94, personality: 86, attitude: 91, emotionalIntelligence: 87 },
      applications: [
        { company: 'PT DataGlobal Solusindo', role: 'AI Data Analyst', status: 'hired', stageText: 'Diterima Kerja (Tahap 5 Validasi HR)', poFitScore: 92, dateApplied: '18 Jul 2026' }
      ]
    },
    {
      id: 'mhs-4',
      nim: '2206021840',
      name: 'Alex Mercer',
      major: 'Sistem Informasi (S1)',
      gpa: 3.65,
      batch: '2022',
      primaryStatus: 'in_progress',
      targetCompany: 'PT MegaWeb Tech',
      targetRole: 'Fullstack Engineer',
      avgPoFit: 88,
      cvFileName: 'CV_Alex_Mercer_Fullstack.pdf',
      videoDuration: '12 Menit 50 Detik',
      videoScores: { ability: 88, intelligent: 86, personality: 82, attitude: 85, emotionalIntelligence: 84 },
      applications: [
        { company: 'PT MegaWeb Tech', role: 'Fullstack Engineer', status: 'in_progress', stageText: 'Sedang Proses (Tahap 4 Analisis Video AI)', poFitScore: 88, dateApplied: '22 Jul 2026' }
      ]
    },
    {
      id: 'mhs-5',
      nim: '2206022910',
      name: 'Budi Santoso',
      major: 'Desain Komunikasi Visual (S1)',
      gpa: 3.55,
      batch: '2022',
      primaryStatus: 'rejected',
      targetCompany: 'PT Creative Design Hub',
      targetRole: 'UI/UX Product Designer',
      avgPoFit: 72,
      cvFileName: 'CV_Budi_Santoso_Designer.pdf',
      videoDuration: '10 Menit 15 Detik',
      videoScores: { ability: 75, intelligent: 70, personality: 78, attitude: 76, emotionalIntelligence: 72 },
      applications: [
        { company: 'PT Creative Design Hub', role: 'UI/UX Product Designer', status: 'rejected', stageText: 'Ditolak pada Seleksi CV (Skor PO-FIT 72% < Threshold 60%)', poFitScore: 72, dateApplied: '12 Jul 2026' }
      ]
    }
  ]);

  // Filtering
  const filteredStudents = students.filter(s => {
    const matchesMajor = majorFilter === 'All' || s.major.includes(majorFilter);
    const matchesStatus = statusFilter === 'all' || s.primaryStatus === statusFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.nim.includes(searchQuery) || 
                          s.targetCompany.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMajor && matchesStatus && matchesSearch;
  });

  const countHired = students.filter(s => s.primaryStatus === 'hired').length;
  const countInProgress = students.filter(s => s.primaryStatus === 'in_progress').length;
  const countRejected = students.filter(s => s.primaryStatus === 'rejected').length;

  const openStudentModal = (student: StudentItem) => {
    setSelectedStudent(student);
    setModalTab('applications');
    setIsPlayingVideo(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {t.kampus?.studentsTitle || 'Pelacak Rekrutmen Mahasiswa'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.kampus?.studentsSubtitle || 'Status penerimaan kerja mahasiswa secara real-time di berbagai perusahaan.'}
          </p>
        </div>

        <button 
          onClick={() => window.print()}
          className="px-4 py-2 bg-card border border-border hover:bg-muted text-foreground font-semibold text-xs rounded-xl transition-all flex items-center gap-2 shadow-2xs shrink-0 cursor-pointer"
          title="Ekspor Laporan Rekrutmen Mahasiswa ke PDF"
        >
          <Download size={16} className="text-muted-foreground" />
          Ekspor PDF Mahasiswa
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Status Filter Tabs */}
          <div className="flex gap-1.5 p-1.5 bg-muted/50 rounded-xl overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: 'Semua Mahasiswa', count: students.length },
              { id: 'hired', label: 'Diterima Kerja', count: countHired },
              { id: 'in_progress', label: 'Dalam Seleksi', count: countInProgress },
              { id: 'rejected', label: 'Belum Lolos', count: countRejected },
            ].map(tab => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive 
                      ? 'bg-violet-600 text-white shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Major Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NIM, perusahaan..."
                className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-violet-600 font-medium"
              />
            </div>

            <select 
              value={majorFilter}
              onChange={(e) => setMajorFilter(e.target.value)}
              className="px-3.5 py-2 bg-muted/30 border border-border rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:border-violet-600 cursor-pointer"
            >
              <option value="All">Semua Jurusan</option>
              <option value="Teknik Informatika">Teknik Informatika</option>
              <option value="Sistem Informasi">Sistem Informasi</option>
              <option value="Desain Komunikasi Visual">DKV</option>
            </select>
          </div>

        </div>

      </div>

      {/* Student Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground border-b border-border font-bold">
                <th className="p-4">{t.kampus?.studentName || 'NAMA MAHASISWA'}</th>
                <th className="p-4">{t.kampus?.nim || 'NIM'}</th>
                <th className="p-4">{t.kampus?.major || 'PROGRAM STUDI'}</th>
                <th className="p-4">{t.kampus?.gpa || 'IPK'}</th>
                <th className="p-4">{t.kampus?.targetCompany || 'PERUSAHAAN TARGET'}</th>
                <th className="p-4">{t.kampus?.recruitmentStatus || 'STATUS REKRUTMEN'}</th>
                <th className="p-4 text-right">AKSI / MEDIA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  
                  {/* Name + Avatar */}
                  <td className="p-4 font-bold text-foreground">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center text-xs border border-violet-300 shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground">Angkatan {s.batch}</p>
                      </div>
                    </div>
                  </td>

                  {/* NIM */}
                  <td className="p-4 font-mono font-bold text-muted-foreground">{s.nim}</td>

                  {/* Major */}
                  <td className="p-4 font-medium text-foreground">{s.major}</td>

                  {/* GPA */}
                  <td className="p-4 font-bold text-violet-600 dark:text-violet-400">{s.gpa}</td>

                  {/* Target Company & Role */}
                  <td className="p-4">
                    <p className="font-bold text-foreground">{s.targetCompany}</p>
                    <p className="text-[10px] text-muted-foreground">{s.targetRole}</p>
                  </td>

                  {/* Recruitment Status Badge */}
                  <td className="p-4">
                    {s.primaryStatus === 'hired' && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-950 font-bold border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700 text-[11px] rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 size={12} className="text-emerald-700 dark:text-emerald-400" />
                        Diterima Kerja
                      </span>
                    )}
                    {s.primaryStatus === 'in_progress' && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-950 font-bold border border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700 text-[11px] rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                        <Clock size={12} className="text-blue-700 dark:text-blue-400" />
                        Sedang Dalam Seleksi
                      </span>
                    )}
                    {s.primaryStatus === 'rejected' && (
                      <span className="px-3 py-1 bg-rose-100 text-rose-950 font-bold border border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700 text-[11px] rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                        <XCircle size={12} className="text-rose-700 dark:text-rose-400" />
                        Belum Lolos
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openStudentModal(s)}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Eye size={13} />
                        Lihat CV & Video
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal (CV, Video & Recruitment History) */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-violet-600 text-white font-bold text-lg flex items-center justify-center border border-violet-400 shadow-md">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{selectedStudent.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    NIM: <strong className="font-mono text-foreground">{selectedStudent.nim}</strong> &bull; {selectedStudent.major} (Angkatan {selectedStudent.batch})
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-border gap-2 overflow-x-auto">
              {[
                { id: 'applications', label: 'Riwayat Lamaran Perusahaan', icon: Building2 },
                { id: 'cv', label: 'Berkas CV Mahasiswa', icon: FileText },
                { id: 'video', label: 'Rekaman Video Wawancara AI', icon: Video },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = modalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id as typeof modalTab)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap -mb-px ${
                      isActive 
                        ? 'border-violet-600 text-violet-600 bg-violet-50/50 dark:bg-violet-950/30 rounded-t-lg' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ==================== TAB 1: APPLICATIONS HISTORY ==================== */}
            {modalTab === 'applications' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* GPA & AI Fit Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/40 border border-border rounded-xl">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">IPK Mahasiswa</span>
                    <span className="text-xl font-bold text-violet-600 dark:text-violet-400">{selectedStudent.gpa} / 4.00</span>
                  </div>
                  <div className="p-4 bg-muted/40 border border-border rounded-xl">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Rata-Rata Skor AI PO-FIT</span>
                    <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{selectedStudent.avgPoFit}% Match</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {selectedStudent.applications.map((app, idx) => (
                    <div key={idx} className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-sm text-foreground">{app.company}</h5>
                          <p className="text-xs text-muted-foreground">{app.role}</p>
                        </div>

                        {app.status === 'hired' && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-950 font-bold border border-emerald-300 text-[10px] rounded-full">
                            ✓ Diterima
                          </span>
                        )}
                        {app.status === 'in_progress' && (
                          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-950 font-bold border border-blue-300 text-[10px] rounded-full">
                            ⏳ Dalam Seleksi
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-950 font-bold border border-rose-300 text-[10px] rounded-full">
                            ✗ Belum Lolos
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground font-medium pt-1 border-t border-border/60">
                        Status Detail: <strong className="text-foreground">{app.stageText}</strong> &bull; Melamar: {app.dateApplied}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== TAB 2: CV DOCUMENT PREVIEW ==================== */}
            {modalTab === 'cv' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-foreground">{selectedStudent.cvFileName}</h5>
                      <p className="text-[11px] text-muted-foreground">Dokumen CV Resmi Mahasiswa &bull; PDF (2.4 MB)</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => toast.success(`Mengunduh berkas ${selectedStudent.cvFileName}...`)}
                    className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Download size={14} />
                    Unduh CV
                  </button>
                </div>

                {/* CV Content Preview Mockup */}
                <div className="p-5 bg-card border border-border rounded-xl space-y-4 shadow-inner">
                  <div className="border-b border-border pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-base text-foreground">{selectedStudent.name}</h4>
                      <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">{selectedStudent.major}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-950 font-bold text-xs rounded-md border border-emerald-300">
                      CV Status: Terverifikasi Kampus
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <h6 className="font-bold text-foreground mb-1 uppercase tracking-wider text-[10px] text-muted-foreground">Pendidikan Terakhir</h6>
                      <p className="font-semibold text-foreground">{selectedStudent.major} - Universitas Indonesia (IPK: {selectedStudent.gpa})</p>
                    </div>

                    <div>
                      <h6 className="font-bold text-foreground mb-1 uppercase tracking-wider text-[10px] text-muted-foreground">Ringkasan Keahlian Utama</h6>
                      <div className="flex flex-wrap gap-1.5">
                        {['React.js', 'TypeScript', 'Next.js', 'Node.js', 'REST API', 'Tailwind CSS', 'Git & CI/CD'].map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-muted text-foreground text-[10px] font-bold rounded border border-border">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h6 className="font-bold text-foreground mb-1 uppercase tracking-wider text-[10px] text-muted-foreground">Pengalaman Proyek & Magang</h6>
                      <p className="text-muted-foreground leading-relaxed">
                        • Lead Engineer Proyek Akhir Sistem Manajemen Rekrutmen AI (2026)<br/>
                        • Software Engineer Intern di PT Technology Indonesia (6 Bulan)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 3: VIDEO RECORDING PREVIEW ==================== */}
            {modalTab === 'video' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                
                {/* Mock Video Player */}
                <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-border flex items-center justify-center shadow-xl group">
                  <div className="text-center space-y-3 p-4">
                    <div className="w-16 h-16 rounded-full bg-violet-600/90 text-white flex items-center justify-center mx-auto shadow-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsPlayingVideo(!isPlayingVideo)}>
                      {isPlayingVideo ? <RefreshCw size={28} className="animate-spin" /> : <Play size={28} className="ml-1" />}
                    </div>
                    <p className="text-xs font-bold text-white">
                      {isPlayingVideo ? 'Memutar Rekaman Wawancara Video...' : 'Putar Rekaman Video Wawancara Virtual'}
                    </p>
                    <p className="text-[10px] text-slate-400">Durasi Rekaman: {selectedStudent.videoDuration}</p>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] text-white font-mono bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-lg">
                    <span>02:15 / 15:32</span>
                    <span>1080p FHD &bull; 48kHz Audio</span>
                  </div>
                </div>

                {/* 5 Video Parameter Scores */}
                <div className="space-y-3">
                  <h5 className="font-bold text-xs text-foreground uppercase tracking-wider">Hasil Ekstraksi 5 Parameter Gestur Video AI</h5>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { key: 'ability', label: 'Ability', score: selectedStudent.videoScores.ability },
                      { key: 'intelligent', label: 'Intelligent', score: selectedStudent.videoScores.intelligent },
                      { key: 'personality', label: 'Personality', score: selectedStudent.videoScores.personality },
                      { key: 'attitude', label: 'Attitude', score: selectedStudent.videoScores.attitude },
                      { key: 'emotionalIntelligence', label: 'Emotional Eq.', score: selectedStudent.videoScores.emotionalIntelligence },
                    ].map(param => (
                      <div key={param.key} className="p-2.5 bg-muted/30 border border-border rounded-xl text-center">
                        <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">{param.label}</p>
                        <span className="text-base font-bold text-violet-600 dark:text-violet-400">{param.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Transcript Excerpt */}
                <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-1.5">
                  <h6 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <FileCheck size={14} className="text-violet-600" />
                    Sorotan Transkrip Jawaban Wawancara
                  </h6>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    &quot;...dalam proyek akhir perguruan tinggi, saya memimpin 4 rekan mahasiswa untuk merancang sistem rekrutmen AI berbasis Cosine Similarity yang meningkatkan efisiensi screening CV hingga 30%...&quot;
                  </p>
                </div>

              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-border">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
