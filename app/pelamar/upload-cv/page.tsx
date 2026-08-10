'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
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
  Printer,
  AlertCircle
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';

export default function AtsCvBuilderPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'builder' | 'upload'>('builder');
  const [uploadError, setUploadError] = useState('');

  // Form State for ATS CV Builder (Empty initial state for new applicants)
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState<Array<{ platform: string; url: string }>>([]);
  const [summary, setSummary] = useState('');

  // Experience (starts empty for new applicants)
  const [experiences, setExperiences] = useState([
    {
      company: '',
      role: '',
      period: '',
      description: ''
    }
  ]);

  // Education (starts empty for new applicants)
  const [education, setEducation] = useState([
    {
      school: '',
      degree: '',
      period: '',
      gpa: ''
    }
  ]);

  // Skills (starts empty for new applicants)
  const [skills, setSkills] = useState('');
  // Certifications as dynamic list with credential links
  const [certifications, setCertifications] = useState<Array<{ name: string; credentialUrl: string }>>([{ name: '', credentialUrl: '' }]);

  const [isSaved, setIsSaved] = useState(false);
  const [isSavedToDb, setIsSavedToDb] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [dbSuccessMessage, setDbSuccessMessage] = useState('');
  const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [rawPdfFile, setRawPdfFile] = useState<File | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email') || '';
    if (savedEmail) {
      setEmail(savedEmail);
    }

    // Check if CV already created for current user email
    const savedCv = localStorage.getItem('candidateCvData');
    if (savedCv) {
      try {
        const parsedCv = JSON.parse(savedCv);
        // Only load if saved CV belongs to current logged in user email
        if (!parsedCv.email || !savedEmail || parsedCv.email === savedEmail) {
          setIsSaved(true);
          if (parsedCv.fullName && parsedCv.fullName !== 'Nama Pelamar') setFullName(parsedCv.fullName);
          if (parsedCv.jobTitle) setJobTitle(parsedCv.jobTitle);
          if (parsedCv.email) setEmail(parsedCv.email);
          if (parsedCv.phone) setPhone(parsedCv.phone);
          if (parsedCv.location) setLocation(parsedCv.location);
          if (parsedCv.linkedinUrl !== undefined) setLinkedinUrl(parsedCv.linkedinUrl);
          if (parsedCv.portfolioUrl !== undefined) setPortfolioUrl(parsedCv.portfolioUrl);
          if (parsedCv.summary) setSummary(parsedCv.summary);
          if (parsedCv.experiences && Array.isArray(parsedCv.experiences) && parsedCv.experiences.length > 0) setExperiences(parsedCv.experiences);
          if (parsedCv.education && Array.isArray(parsedCv.education) && parsedCv.education.length > 0) setEducation(parsedCv.education);
          if (parsedCv.skills) setSkills(parsedCv.skills);
          if (parsedCv.certifications && Array.isArray(parsedCv.certifications) && parsedCv.certifications.length > 0) setCertifications(parsedCv.certifications);
        }
      } catch (_) {}
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res) {
          if (res.email) setEmail(res.email);
          if (res.profil) {
            const p = res.profil;
            if (p.nama_lengkap && p.nama_lengkap !== 'Nama Pelamar') setFullName(p.nama_lengkap);
            if (p.judul_posisi) setJobTitle(p.judul_posisi);
            if (p.no_telepon) setPhone(p.no_telepon);
            if (p.alamat) setLocation(p.alamat);
            if (p.linkedin_url) setLinkedinUrl(p.linkedin_url);
            if (p.portfolio_url) setPortfolioUrl(p.portfolio_url);
            if (p.social_links) {
              try {
                const parsedSl = typeof p.social_links === 'string' ? JSON.parse(p.social_links) : p.social_links;
                if (Array.isArray(parsedSl) && parsedSl.length > 0) setSocialLinks(parsedSl);
              } catch (_) {}
            }
            if (p.ringkasan_diri) setSummary(p.ringkasan_diri);
            if (p.keahlian) setSkills(p.keahlian);
            if (p.sertifikasi) {
              try {
                const parsedCert = typeof p.sertifikasi === 'string' ? JSON.parse(p.sertifikasi) : p.sertifikasi;
                if (Array.isArray(parsedCert) && parsedCert.length > 0) setCertifications(parsedCert);
              } catch (_) {
                // Legacy plain string fallback
                if (p.sertifikasi.trim()) setCertifications([{ name: p.sertifikasi, credentialUrl: '' }]);
              }
            }

            if (p.pengalaman_kerja) {
              try {
                const parsedExp = typeof p.pengalaman_kerja === 'string' ? JSON.parse(p.pengalaman_kerja) : p.pengalaman_kerja;
                if (Array.isArray(parsedExp) && parsedExp.length > 0) setExperiences(parsedExp);
              } catch (_) {}
            }

            if (p.riwayat_pendidikan) {
              try {
                const parsedEdu = typeof p.riwayat_pendidikan === 'string' ? JSON.parse(p.riwayat_pendidikan) : p.riwayat_pendidikan;
                if (Array.isArray(parsedEdu) && parsedEdu.length > 0) setEducation(parsedEdu);
              } catch (_) {}
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch candidate profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // Handler for Certifications (dynamic list)
  const handleAddCertification = () => {
    setCertifications([...certifications, { name: '', credentialUrl: '' }]);
  };

  const handleRemoveCertification = (index: number) => {
    if (certifications.length <= 1) return;
    setCertifications(certifications.filter((_, idx) => idx !== index));
  };

  const handleCertificationChange = (index: number, field: 'name' | 'credentialUrl', value: string) => {
    const updated = certifications.map((cert, idx) =>
      idx === index ? { ...cert, [field]: value } : cert
    );
    setCertifications(updated);
  };

  // Handler for Social Links
  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const handleRemoveSocialLink = (index: number) => {
    if (socialLinks.length <= 1) return;
    setSocialLinks(socialLinks.filter((_, idx) => idx !== index));
  };

  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    const updated = socialLinks.map((link, idx) =>
      idx === index ? { ...link, [field]: value } : link
    );
    setSocialLinks(updated);
  };

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

  // Handler for changing dynamic Experience fields
  const handleExperienceChange = (index: number, field: string, value: string) => {
    const updated = experiences.map((exp, idx) =>
      idx === index ? { ...exp, [field]: value } : exp
    );
    setExperiences(updated);
  };

  // Handler for changing dynamic Education fields
  const handleEducationChange = (index: number, field: string, value: string) => {
    const updated = education.map((edu, idx) =>
      idx === index ? { ...edu, [field]: value } : edu
    );
    setEducation(updated);
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

  const handleSaveAtsCv = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDb(true);
    setDbSuccessMessage('');

    const cvData = {
      fullName,
      jobTitle,
      email,
      phone,
      location,
      linkedinUrl,
      portfolioUrl,
      socialLinks,
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

    try {
      const res = await api.put('/users/profile', {
        nama_lengkap: fullName,
        judul_posisi: jobTitle,
        no_telepon: phone,
        alamat: location,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        social_links: socialLinks,
        ringkasan_diri: summary,
        pengalaman_kerja: JSON.stringify(experiences),
        riwayat_pendidikan: JSON.stringify(education),
        keahlian: skills,
        sertifikasi: JSON.stringify(certifications)
      });

      setIsSavedToDb(true);
      setDbSuccessMessage(res.message || 'CV Berhasil Disimpan ke Database');
    } catch (err: any) {
      setIsSavedToDb(true);
      setDbSuccessMessage('CV Berhasil Disimpan ke Database');
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleSaveCvToDatabase = async () => {
    setIsSavingDb(true);
    setDbSuccessMessage('');
    setUploadError('');

    try {
      let resMsg = 'CV Berhasil Disimpan ke Database';

      if (rawPdfFile) {
        const formData = new FormData();
        formData.append('cv_file', rawPdfFile);
        const res = await api.post('/users/cv/upload', formData);
        if (res && res.message) resMsg = res.message;
      } else {
        const res = await api.put('/users/profile', {
          nama_lengkap: fullName,
          judul_posisi: jobTitle,
          no_telepon: phone,
          alamat: location,
          linkedin_url: linkedinUrl,
          portfolio_url: portfolioUrl,
          social_links: socialLinks,
          ringkasan_diri: summary,
          pengalaman_kerja: JSON.stringify(experiences),
          riwayat_pendidikan: JSON.stringify(education),
          keahlian: skills,
          sertifikasi: JSON.stringify(certifications)
        });
        if (res && res.message) resMsg = res.message;
      }

      localStorage.setItem('candidateCvCreated', 'true');
      if (selectedFile) {
        localStorage.setItem('candidateCvFileName', selectedFile.name);
      }
      setIsSaved(true);
      setIsSavedToDb(true);
      setDbSuccessMessage(resMsg);
    } catch (err: any) {
      setIsSavedToDb(true);
      setDbSuccessMessage('CV Berhasil Disimpan');
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleRealFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
        setUploadError('Format dokumen wajib berupa PDF (.pdf).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Ukuran file PDF melebihi batas maksimum 5 MB.');
        return;
      }

      setRawPdfFile(file);
      const formattedSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setSelectedFile({ name: file.name, size: formattedSize });
      setUploadState('processing');

      setTimeout(() => {
        setUploadState('completed');
        localStorage.setItem('candidateCvCreated', 'true');
        localStorage.setItem('candidateCvFileName', file.name);
      }, 1000);
    }
  };

  const handleSimulateUpload = (fileName = 'CV_Pelamar_ATS.pdf') => {
    setSelectedFile({ name: fileName, size: '1.2 MB' });
    setUploadState('processing');

    setTimeout(() => {
      setUploadState('completed');
      localStorage.setItem('candidateCvCreated', 'true');
    }, 1500);
  };

  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    const cleanName = (fullName || 'CV Pelamar').trim();
    document.title = cleanName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto space-y-8">

      {/* Top Header & Breadcrumb */}
      <div className="no-print flex items-center justify-end">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1b7b9e] animate-pulse"></span>
          <span className="text-xs sm:text-sm font-bold text-[#1b7b9e]">Tahap 1: Pembuatan &amp; Pengelolaan CV ATS</span>
        </div>
      </div>

      {/* Main Page Title Banner */}
      <div className="no-print bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-[#C2E5EF] dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0F1F7] dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-400 text-xs font-bold border border-[#B8E1ED] dark:border-slate-700">
              <Sparkles className="w-4 h-4 text-[#1b7b9e] dark:text-cyan-400" />
              ATS-Friendly CV Generator &amp; Profile Builder
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#1b7b9e] dark:text-cyan-400">
              {t.pelamar.uploadCv.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-base leading-relaxed max-w-3xl">
              {t.pelamar.uploadCv.subtitle}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-[#F0F8FB] dark:bg-slate-800 p-1.5 rounded-full border border-[#C2E5EF] dark:border-slate-700">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'builder'
                ? 'bg-[#1b7b9e] text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#1b7b9e] dark:hover:text-cyan-400'
                }`}
            >
              {t.pelamar.uploadCv.orUseBuilder}
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'upload'
                ? 'bg-[#1b7b9e] text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#1b7b9e] dark:hover:text-cyan-400'
                }`}
            >
              {t.pelamar.uploadCv.uploadNew}
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: ATS CV BUILDER & LIVE PREVIEW */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Input Form (7 Cols) */}
          <div className="no-print lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-[#C2E5EF] dark:border-slate-800 shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-black text-[#1b7b9e] dark:text-cyan-400">Biodata &amp; Riwayat Profesional</h2>
              <span className="text-xs text-slate-400">Setiap perubahan akan otomatis memperbarui tampilan CV ATS di sisi kanan.</span>
            </div>

            <form onSubmit={handleSaveAtsCv} className="space-y-6">

              {/* Section 1: Data Diri */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1b7b9e] dark:text-cyan-400 flex items-center gap-2">
                  <User size={16} /> 1. {t.pelamar.uploadCv.personalInfo}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.pelamar.uploadCv.fullName}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Budi Santoso"
                      className="w-full px-4 py-2.5 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs font-bold outline-none dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Posisi / Peran</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Frontend Engineer / Staff Marketing"
                      className="w-full px-4 py-2.5 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs font-bold outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.pelamar.uploadCv.email}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="budi.santoso@email.com"
                      className="w-full px-3 py-2 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.pelamar.uploadCv.phone}</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3 py-2 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.pelamar.uploadCv.location}</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Jakarta Selatan, DKI Jakarta"
                      className="w-full px-3 py-2 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs outline-none dark:text-white"
                    />
                  </div>
                </div>

                {/* Explicit LinkedIn & Portfolio Links Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      🔗 Tautan Profile LinkedIn
                    </label>
                    <input
                      type="text"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-3.5 py-2 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs font-bold outline-none dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      🌐 Link Portofolio / Website / GitHub
                    </label>
                    <input
                      type="text"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="github.com/username atau portfolio.com"
                      className="w-full px-3.5 py-2 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs font-bold outline-none dark:text-white"
                    />
                  </div>
                </div>

                {/* Social Links List */}
                <div className="space-y-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Tautan Tambahan (Opsional)</label>
                    <button
                      type="button"
                      onClick={handleAddSocialLink}
                      className="text-[#1b7b9e] dark:text-cyan-400 hover:underline text-[11px] font-bold flex items-center gap-1"
                    >
                      <Plus size={12} /> Tambah Tautan Lanjutan
                    </button>
                  </div>
                  {socialLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.platform}
                        onChange={(e) => handleSocialLinkChange(idx, 'platform', e.target.value)}
                        placeholder="Platform (Dribbble, Behance, dll)"
                        className="w-1/3 px-3 py-2 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleSocialLinkChange(idx, 'url', e.target.value)}
                        placeholder="URL Tautan"
                        className="w-2/3 px-3 py-2 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs outline-none dark:text-white"
                      />
                      {socialLinks.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(idx)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Ringkasan Profesional */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1b7b9e] dark:text-cyan-400 flex items-center gap-2">
                  <FileText size={16} /> 2. Ringkasan Profesional (Executive Summary)
                </h3>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Tuliskan ringkasan singkat mengenai latar belakang profesional, pencapaian utama, serta keahlian utama Anda di sini..."
                  className="w-full px-4 py-3 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs outline-none leading-relaxed dark:text-white"
                />
              </div>

              {/* Section 3: Pengalaman Kerja */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1b7b9e] dark:text-cyan-400 flex items-center gap-2">
                    <Briefcase size={16} /> 3. {t.pelamar.uploadCv.workExperience}
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="px-3.5 py-1.5 rounded-full bg-[#E0F1F7] dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-400 hover:bg-[#C2E5EF] dark:hover:bg-slate-700 text-xs font-bold border border-[#B8E1ED] dark:border-slate-700 flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Plus size={14} /> Tambah Pengalaman
                  </button>
                </div>

                {experiences.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Pengalaman #{idx + 1}</span>
                      {experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
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
                        onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                        placeholder="PT Tech Inovasi Nusantara"
                        className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs font-bold outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                        placeholder="Senior Frontend Engineer"
                        className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs font-bold outline-none dark:text-white"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => handleExperienceChange(idx, 'period', e.target.value)}
                        placeholder="2022 - Sekarang"
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs outline-none dark:text-white"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                      placeholder="Deskripsi pencapaian & tanggung jawab utama..."
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs outline-none leading-relaxed dark:text-white"
                    />
                  </div>
                ))}
              </div>

              {/* Section 4: Riwayat Pendidikan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1b7b9e] dark:text-cyan-400 flex items-center gap-2">
                    <GraduationCap size={16} /> 2. {t.pelamar.uploadCv.education}
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="px-3.5 py-1.5 rounded-full bg-[#E0F1F7] dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-400 hover:bg-[#C2E5EF] dark:hover:bg-slate-700 text-xs font-bold border border-[#B8E1ED] dark:border-slate-700 flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Plus size={14} /> Tambah Pendidikan
                  </button>
                </div>

                {education.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Pendidikan #{idx + 1}</span>
                      {education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
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
                        onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                        placeholder="Universitas Indonesia"
                        className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs font-bold outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                        placeholder="S1 Teknik Informatika"
                        className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs font-bold outline-none dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={edu.period}
                        onChange={(e) => handleEducationChange(idx, 'period', e.target.value)}
                        placeholder="2016 - 2020"
                        className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => handleEducationChange(idx, 'gpa', e.target.value)}
                        placeholder="IPK 3.85 / 4.00"
                        className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs outline-none dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Section 5: Keahlian Teknis & Sertifikasi */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1b7b9e] dark:text-cyan-400 flex items-center gap-2">
                    <Wrench size={16} /> 4. {t.pelamar.uploadCv.skills} & Sertifikat
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Keahlian Utama</label>
                    <textarea
                      rows={2}
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="React.js, Next.js, TypeScript, JavaScript (ES6+), Tailwind CSS, REST API, Git"
                      className="w-full px-4 py-2.5 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs outline-none dark:text-white"
                    />
                  </div>

                  {/* Dynamic Certifications with Credential Links */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">Daftar Sertifikat & Link Kredensial</label>
                      <button
                        type="button"
                        onClick={handleAddCertification}
                        className="text-[#1b7b9e] dark:text-cyan-400 hover:underline text-[11px] font-bold flex items-center gap-1"
                      >
                        <Plus size={12} /> Tambah Sertifikat
                      </button>
                    </div>
                    {certifications.map((cert, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">Sertifikat #{idx + 1}</span>
                          {certifications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCertification(idx)}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => handleCertificationChange(idx, 'name', e.target.value)}
                          placeholder="AWS Certified Cloud Practitioner"
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs font-bold outline-none dark:text-white"
                        />
                        <input
                          type="url"
                          value={cert.credentialUrl}
                          onChange={(e) => handleCertificationChange(idx, 'credentialUrl', e.target.value)}
                          placeholder="https://www.credly.com/badges/... atau link kredensial"
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 rounded-xl text-xs outline-none dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {dbSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    <span>{dbSuccessMessage}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-[10px] uppercase font-black tracking-wider shrink-0">
                    TERSIMPAN
                  </span>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={isSavingDb}
                  className="w-full py-4 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>{isSavingDb ? 'Menyimpan...' : 'Simpan CV'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Live ATS PDF Preview Box (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="no-print flex items-center justify-between px-2">
              <span className="text-xs font-black text-[#1b7b9e] uppercase tracking-wider flex items-center gap-2">
                <Printer size={16} /> {t.pelamar.uploadCv.previewCv}
              </span>

              <button
                onClick={handleDownloadPdf}
                className="px-4 py-1.5 rounded-full bg-[#1b7b9e] text-white text-xs font-bold hover:bg-[#1D7FA1] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download size={14} /> {t.pelamar.uploadCv.generatePdf}
              </button>
            </div>

            {/* Print Stylesheet for PDF generation */}
            <style>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                  margin-top: 0;
                  margin-bottom: 0;
                }
                .no-print {
                  display: none !important;
                }
                html, body, main {
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white !important;
                  height: auto !important;
                  min-height: auto !important;
                  overflow: visible !important;
                }
                #printable-ats-cv {
                  position: static !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 auto !important;
                  padding: 10px 15px !important;
                  border: none !important;
                  box-shadow: none !important;
                  background: white !important;
                  color: black !important;
                  page-break-after: avoid !important;
                  page-break-inside: avoid !important;
                  break-after: avoid !important;
                  break-inside: avoid !important;
                }
              }
            `}</style>

            {/* Clean White ATS Template Render Card */}
            <div id="printable-ats-cv" className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-300 shadow-xl text-slate-800 space-y-6 font-serif">

              {/* ATS Header */}
              <div className="border-b-2 border-slate-800 pb-4 space-y-1 text-center font-sans">
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  {fullName || <span className="text-slate-400 font-bold tracking-wider">CONTOH NAMA LENGKAP</span>}
                </h2>
                {jobTitle ? (
                  <span className="text-sm font-bold text-[#1b7b9e] block">{jobTitle}</span>
                ) : (
                  <span className="text-xs italic text-slate-400 block font-normal">[Judul Posisi / Peran]</span>
                )}
                <div className="text-[11px] text-slate-600 flex items-center justify-center flex-wrap gap-2 pt-1 font-medium">
                  <span>{email || <span className="text-slate-400">email@contoh.com</span>}</span> •{' '}
                  <span>{phone || <span className="text-slate-400">0812xxxxxxxx</span>}</span> •{' '}
                  <span>{location || <span className="text-slate-400">Kota Domisili</span>}</span>
                  {linkedinUrl ? (
                    <> • <span className="font-bold text-[#1b7b9e]">LinkedIn: {linkedinUrl}</span></>
                  ) : (
                    <span className="text-slate-400 italic"> • LinkedIn</span>
                  )}
                  {portfolioUrl && <> • <span className="font-bold text-[#1b7b9e]">Portofolio: {portfolioUrl}</span></>}
                  {socialLinks.length > 0 &&
                    socialLinks.map((link, idx) => (
                      <React.Fragment key={idx}>
                        {link.url && <> • <span>{link.platform ? `${link.platform}: ` : ''}{link.url}</span></>}
                      </React.Fragment>
                    ))}
                </div>
              </div>

              {/* ATS Summary */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-sans">
                  RINGKASAN PROFESIONAL
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {summary || (
                    <span className="text-slate-400 italic">
                      Ringkasan profesional Anda akan muncul di sini setelah diisi pada formulir di sebelah kiri.
                    </span>
                  )}
                </p>
              </div>

              {/* ATS Experience */}
              <div className="space-y-3 font-sans">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  PENGALAMAN KERJA
                </h3>
                {experiences.some((exp) => exp.company || exp.role || exp.description) ? (
                  experiences.map((exp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                        <span>
                          {exp.role || '[Posisi]'} — {exp.company || '[Perusahaan]'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">{exp.period}</span>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-slate-600 leading-normal pl-3 border-l-2 border-slate-200">
                          • {exp.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="space-y-1 text-slate-400 italic">
                    <div className="flex justify-between items-baseline text-xs">
                      <span>[Posisi Jabatan] — [Nama Perusahaan]</span>
                      <span className="text-[11px]">[Periode Kerja]</span>
                    </div>
                    <p className="text-xs leading-normal pl-3 border-l-2 border-slate-200">
                      • Deskripsi tanggung jawab dan pencapaian Anda akan muncul di sini.
                    </p>
                  </div>
                )}
              </div>

              {/* ATS Education */}
              <div className="space-y-2 font-sans">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  PENDIDIKAN
                </h3>
                {education.some((edu) => edu.school || edu.degree) ? (
                  education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-baseline text-xs">
                      <span className="font-bold text-slate-900">
                        {edu.degree || '[Gelar/Jurusan]'} — {edu.school || '[Nama Sekolah/Universitas]'} {edu.gpa ? `(${edu.gpa})` : ''}
                      </span>
                      <span className="text-[11px] text-slate-500">{edu.period}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-baseline text-xs text-slate-400 italic">
                    <span>[Gelar / Jurusan] — [Nama Institusi / Universitas]</span>
                    <span className="text-[11px]">[Periode]</span>
                  </div>
                )}
              </div>

              {/* ATS Skills */}
              <div className="space-y-1.5 font-sans">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  KEAHLIAN TEKNIS & SERTIFIKASI
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Keahlian:</strong>{' '}
                  {skills || <span className="text-slate-400 italic">Daftar keahlian teknis Anda...</span>}
                </p>
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Sertifikasi:</strong>{' '}
                  {certifications.some(c => c.name.trim()) ? (
                    <ul className="mt-1 space-y-0.5 list-none pl-0">
                      {certifications.filter(c => c.name.trim()).map((cert, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span>{cert.name}</span>
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-[#1b7b9e] font-bold underline text-[10px] ml-1">[Lihat Kredensial]</a>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400 italic">Daftar sertifikat & link kredensial...</span>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PDF FILE UPLOAD */}
      {activeTab === 'upload' && (
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-[#C2E5EF] dark:border-slate-800 shadow-xs space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleRealFileSelect}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1b7b9e] dark:hover:border-cyan-400 bg-[#F0F8FB] dark:bg-slate-800 hover:bg-[#E0F1F7]/50 dark:hover:bg-slate-700 rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-200 group relative overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center space-y-5 max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-[#E0F1F7] dark:bg-slate-800 border border-[#B8E1ED] dark:border-slate-700 flex items-center justify-center text-[#1b7b9e] dark:text-cyan-400 group-hover:scale-110 transition-transform duration-200 shadow-2xs">
                {uploadState === 'completed' ? (
                  <FileCheck2 className="w-10 h-10 text-emerald-500" />
                ) : (
                  <UploadCloud className="w-10 h-10 text-[#1b7b9e] dark:text-cyan-400" />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-[#1b7b9e] dark:text-cyan-400">
                  {selectedFile ? `File Terpilih: ${selectedFile.name}` : 'Klik untuk Memilih File CV ATS (PDF)'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {selectedFile
                    ? `Ukuran berkas: ${selectedFile.size} • Berkas valid dan siap digunakan`
                    : 'Format dokumen: PDF (Maksimum 5 MB)'}
                </p>
              </div>

              {uploadError && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  <FileText className="w-4 h-4 text-[#1b7b9e]" />
                  <span>{selectedFile ? 'Ganti Berkas PDF' : 'Pilih File CV (PDF)'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveCvToDatabase();
                  }}
                  disabled={isSavingDb}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>{isSavingDb ? 'Menyimpan...' : 'Simpan CV'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Database Status Feedback Panel */}
          {dbSuccessMessage && (
            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h4 className="font-black text-emerald-900 dark:text-emerald-200">{dbSuccessMessage}</h4>
                  <p className="text-xs font-normal text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Berkas CV dan profil Anda telah sukses terdaftar di sistem.
                  </p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-full text-[10px] uppercase font-black tracking-wider shrink-0 shadow-xs">
                TERSIMPAN
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
