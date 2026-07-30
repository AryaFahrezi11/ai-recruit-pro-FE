'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  FileCheck2,
  ChevronLeft,
  Sparkles,
  Info,
  Download,
  Edit3,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Printer
} from 'lucide-react';

export default function AtsCvBuilderPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'builder' | 'upload'>('builder');

  // Form State for ATS CV Builder
  const [fullName, setFullName] = useState('Budi Pratama');
  const [jobTitle, setJobTitle] = useState('Senior Frontend Engineer');
  const [email, setEmail] = useState('budi.pratama@gmail.com');
  const [phone, setPhone] = useState('081298765432');
  const [location, setLocation] = useState('Jakarta Selatan, Indonesia');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/budipratama');
  const [summary, setSummary] = useState(
    'Senior Frontend Engineer berpengalaman 4+ tahun dalam merancang antarmuka web performan tinggi menggunakan Next.js, React, TypeScript, dan Tailwind CSS. Terbiasa mengoptimalkan Web Vitals dan berkolaborasi dalam tim agile.'
  );

  // Experience
  const [experiences, setExperiences] = useState([
    {
      company: 'PT Tech Inovasi Nusantara',
      role: 'Senior Frontend Engineer',
      period: '2022 - Sekarang',
      description: 'Memimpin arsitektur frontend platform SaaS berbasis Next.js App Router, meningkatkan skor Lighthouse Web Vitals sebesar 40%.'
    },
    {
      company: 'Global Digital Solusindo',
      role: 'Frontend Developer',
      period: '2020 - 2022',
      description: 'Mengembangkan komponen UI reusable berbasis React & Tailwind CSS untuk sistem manajemen rekrutmen.'
    }
  ]);

  // Education
  const [education, setEducation] = useState([
    {
      school: 'Universitas Indonesia',
      degree: 'S1 Teknik Informatika',
      period: '2016 - 2020',
      gpa: 'IPK 3.85 / 4.00'
    }
  ]);

  // Skills & Certifications
  const [skills, setSkills] = useState('React.js, Next.js, TypeScript, JavaScript (ES6+), Tailwind CSS, State Management (Zustand/Redux), REST API, Git, Web Accessibility (a11y)');
  const [certifications, setCertifications] = useState('Meta Frontend Developer Professional Certificate, AWS Certified Cloud Practitioner');

  const [isSaved, setIsSaved] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);

  useEffect(() => {
    // Check if CV already created
    const savedCv = localStorage.getItem('candidateCvData');
    if (savedCv) {
      setIsSaved(true);
    }
  }, []);

  // Handler for adding dynamic Experience
  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        company: '',
        role: '',
        period: '',
        description: ''
      }
    ]);
  };

  // Handler for removing dynamic Experience
  const handleRemoveExperience = (index: number) => {
    if (experiences.length <= 1) return;
    setExperiences(experiences.filter((_, idx) => idx !== index));
  };

  // Handler for adding dynamic Education
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        school: '',
        degree: '',
        period: '',
        gpa: ''
      }
    ]);
  };

  // Handler for removing dynamic Education
  const handleRemoveEducation = (index: number) => {
    if (education.length <= 1) return;
    setEducation(education.filter((_, idx) => idx !== index));
  };

  const handleSaveAtsCv = (e: React.FormEvent) => {
    e.preventDefault();
    const cvData = {
      fullName,
      jobTitle,
      email,
      phone,
      location,
      linkedin,
      summary,
      experiences,
      education,
      skills,
      certifications,
      updatedAt: new Date().toLocaleDateString('id-ID')
    };

    localStorage.setItem('candidateCvData', JSON.stringify(cvData));
    localStorage.setItem('candidateCvCreated', 'true');
    setIsSaved(true);

    alert('✅ CV ATS-Friendly Anda berhasil dibuat & disimpan ke profil!');
  };

  const handleSimulateUpload = (fileName = 'CV_Budi_Pratama_ATS.pdf') => {
    setSelectedFile({ name: fileName, size: '1.2 MB' });
    setUploadState('processing');

    setTimeout(() => {
      setUploadState('completed');
      localStorage.setItem('candidateCvCreated', 'true');
    }, 1500);
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto space-y-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/pelamar/dashboard"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-[#0F766E] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Kembali ke Dashboard Pelamar
        </Link>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E] animate-pulse"></span>
          <span className="text-xs sm:text-sm font-bold text-[#0F766E]">Tahap 1: Pembuatan &amp; Pengelolaan CV ATS</span>
        </div>
      </div>

      {/* Main Page Title Banner */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#CCFBF1] shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6FFFA] text-[#0F766E] text-xs font-bold border border-[#99F6E4]">
              <Sparkles className="w-4 h-4 text-[#0F766E]" />
              ATS-Friendly CV Generator &amp; Profile Builder
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0F766E]">
              Buat / Unggah CV Standar ATS-Friendly
            </h1>
            <p className="text-slate-500 text-xs sm:text-base leading-relaxed max-w-3xl">
              Isi biodata Anda di bawah ini untuk menghasilkan CV ATS-Friendly otomatis yang siap dipakai melamar pekerjaan secara instan.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-[#F4FDFB] p-1.5 rounded-full border border-[#CCFBF1]">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'builder'
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#0F766E]'
              }`}
            >
              📝 Formulir CV ATS Interaktif
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#0F766E]'
              }`}
            >
              📤 Unggah File PDF CV
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: ATS CV BUILDER & LIVE PREVIEW */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Form (7 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#CCFBF1] shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-[#0F766E]">Biodata &amp; Riwayat Profesional</h2>
              <span className="text-xs text-slate-400">Setiap perubahan akan otomatis memperbarui tampilan CV ATS di sisi kanan.</span>
            </div>

            <form onSubmit={handleSaveAtsCv} className="space-y-6">
              
              {/* Section 1: Data Diri */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0F766E] flex items-center gap-2">
                  <User size={16} /> 1. Informasi Kontak Diri
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F4FDFB] border border-[#CCFBF1] focus:border-[#0F766E] rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Judul Posisi / Peran</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F4FDFB] border border-[#CCFBF1] focus:border-[#0F766E] rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4FDFB] border border-[#CCFBF1] focus:border-[#0F766E] rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4FDFB] border border-[#CCFBF1] focus:border-[#0F766E] rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Domeisili</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4FDFB] border border-[#CCFBF1] focus:border-[#0F766E] rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Ringkasan Profesional */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0F766E] flex items-center gap-2">
                  <FileText size={16} /> 2. Ringkasan Profesional (Executive Summary)
                </h3>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F4FDFB] border border-[#CCFBF1] focus:border-[#0F766E] rounded-xl text-xs outline-none leading-relaxed"
                />
              </div>

              {/* Section 3: Pengalaman Kerja */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0F766E] flex items-center gap-2">
                    <Briefcase size={16} /> 3. Pengalaman Kerja
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="px-3.5 py-1.5 rounded-full bg-[#E6FFFA] text-[#0F766E] hover:bg-[#CCFBF1] text-xs font-bold border border-[#99F6E4] flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Plus size={14} /> Tambah Pengalaman
                  </button>
                </div>

                {experiences.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F4FDFB] border border-[#CCFBF1] space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">Pengalaman #{idx + 1}</span>
                      {experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                          title="Hapus Pengalaman Ini"
                        >
                          <Trash2 size={15} /> Hapus
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].company = e.target.value;
                          setExperiences(updated);
                        }}
                        placeholder="Nama Perusahaan (misal: PT Tech Nusantara)"
                        className="px-3.5 py-2 bg-white border border-slate-200 focus:border-[#0F766E] rounded-xl text-xs font-bold outline-none"
                      />
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].role = e.target.value;
                          setExperiences(updated);
                        }}
                        placeholder="Posisi Jabatan (misal: Senior Frontend Engineer)"
                        className="px-3.5 py-2 bg-white border border-slate-200 focus:border-[#0F766E] rounded-xl text-xs font-bold outline-none"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].period = e.target.value;
                          setExperiences(updated);
                        }}
                        placeholder="Periode Kerja (misal: 2022 - Sekarang)"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-[#0F766E] rounded-xl text-xs outline-none"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].description = e.target.value;
                        setExperiences(updated);
                      }}
                      placeholder="Deskripsi pencapaian & tanggung jawab utama..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-[#0F766E] rounded-xl text-xs outline-none leading-relaxed"
                    />
                  </div>
                ))}
              </div>

              {/* Section 4: Riwayat Pendidikan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0F766E] flex items-center gap-2">
                    <GraduationCap size={16} /> 4. Riwayat Pendidikan
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="px-3.5 py-1.5 rounded-full bg-[#E6FFFA] text-[#0F766E] hover:bg-[#CCFBF1] text-xs font-bold border border-[#99F6E4] flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Plus size={14} /> Tambah Pendidikan
                  </button>
                </div>

                {education.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F4FDFB] border border-[#CCFBF1] space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">Pendidikan #{idx + 1}</span>
                      {education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                          title="Hapus Pendidikan Ini"
                        >
                          <Trash2 size={15} /> Hapus
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].school = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="Nama Sekolah / Universitas"
                        className="px-3.5 py-2 bg-white border border-slate-200 focus:border-[#0F766E] rounded-xl text-xs font-bold outline-none"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].degree = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="Gelar / Jurusan (misal: S1 Teknik Informatika)"
                        className="px-3.5 py-2 bg-white border border-slate-200 focus:border-[#0F766E] rounded-xl text-xs font-bold outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={edu.period}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].period = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="Periode (misal: 2016 - 2020)"
                        className="px-3.5 py-2 bg-white border border-slate-200 focus:border-[#0F766E] rounded-xl text-xs outline-none"
                      />
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].gpa = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="IPK / Nilai Akhir (misal: IPK 3.85 / 4.00)"
                        className="px-3.5 py-2 bg-white border border-slate-200 focus:border-[#0F766E] rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Section 5: Keahlian Teknis */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0F766E] flex items-center gap-2">
                  <Wrench size={16} /> 5. Keahlian Teknis &amp; Tools (Keywords)
                </h3>
                <textarea
                  rows={2}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Next.js, Node.js, Tailwind..."
                  className="w-full px-4 py-2.5 bg-[#F4FDFB] border border-[#CCFBF1] focus:border-[#0F766E] rounded-xl text-xs outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#0F766E] hover:bg-[#0D635C] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Simpan &amp; Perbarui Template CV ATS
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Live ATS PDF Preview Box (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black text-[#0F766E] uppercase tracking-wider flex items-center gap-2">
                <Printer size={16} /> Pratinjau Dokumen ATS-Friendly
              </span>

              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-full bg-[#0F766E] text-white text-xs font-bold hover:bg-[#0D635C] transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Download size={14} /> Cetak / Export PDF
              </button>
            </div>

            {/* Clean White ATS Template Render Card */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-300 shadow-xl text-slate-800 space-y-6 font-serif">
              
              {/* ATS Header */}
              <div className="border-b-2 border-slate-800 pb-4 space-y-1 text-center font-sans">
                <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tight">{fullName || 'NAMA LENGKAP'}</h2>
                <span className="text-sm font-bold text-[#0F766E] block">{jobTitle}</span>
                <div className="text-[11px] text-slate-600 flex items-center justify-center flex-wrap gap-2 pt-1 font-medium">
                  <span>{email}</span> • <span>{phone}</span> • <span>{location}</span> • <span>{linkedin}</span>
                </div>
              </div>

              {/* ATS Summary */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-sans">
                  RINGKASAN PROFESIONAL
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">{summary}</p>
              </div>

              {/* ATS Experience */}
              <div className="space-y-3 font-sans">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  PENGALAMAN KERJA
                </h3>
                {experiences.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                      <span>{exp.role} — {exp.company}</span>
                      <span className="text-[11px] text-slate-500 font-semibold">{exp.period}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal pl-3 border-l-2 border-slate-200">
                      • {exp.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* ATS Education */}
              <div className="space-y-2 font-sans">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  PENDIDIKAN
                </h3>
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-900">{edu.degree} — {edu.school} ({edu.gpa})</span>
                    <span className="text-[11px] text-slate-500">{edu.period}</span>
                  </div>
                ))}
              </div>

              {/* ATS Skills */}
              <div className="space-y-1.5 font-sans">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  KEAHLIAN TEKNIS &amp; SERTIFIKASI
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Keahlian:</strong> {skills}
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Sertifikasi:</strong> {certifications}
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PDF FILE UPLOAD */}
      {activeTab === 'upload' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#CCFBF1] shadow-xs space-y-6">
          <div
            onClick={() => handleSimulateUpload()}
            className="border-2 border-dashed border-slate-300 hover:border-[#0F766E] bg-[#F4FDFB] hover:bg-[#E6FFFA]/50 rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-200 group relative overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center space-y-5 max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-[#E6FFFA] border border-[#99F6E4] flex items-center justify-center text-[#0F766E] group-hover:scale-110 transition-transform duration-200 shadow-2xs">
                <UploadCloud className="w-10 h-10 text-[#0F766E]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-[#0F766E]">
                  Klik untuk Memilih File CV ATS (PDF)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Format dokumen: <span className="font-semibold text-slate-700">PDF (Maksimum 5 MB)</span>
                </p>
              </div>

              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#0F766E] text-white text-xs sm:text-sm font-bold shadow-xs">
                <FileText className="w-5 h-5 text-[#E6FFFA]" />
                Pilih File CV (PDF)
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
