'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import {
  ArrowLeft, Briefcase, Building2, MapPin, Clock, DollarSign,
  Sparkles, Sliders, FileText, Plus, Trash2, CheckCircle2,
  Calendar, Users, HelpCircle, Save, Send, Layers, Check, Globe, X, Video
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { fetchAuth } from '@/lib/api/auth';
import { getApiUrl } from '@/lib/api';

function CreateJobForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const token = useAppStore(state => state.token);

  // Form State
  const [jobTitle, setJobTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{ id: string, nama_kategori: string }[]>([]);
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('hybrid');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level');
  const [pendidikanMin, setPendidikanMin] = useState('');

  // Job Description & AI Keywords
  const [summary, setSummary] = useState('');

  // Dynamic Lists
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResp, setNewResp] = useState('');

  const [requirements, setRequirements] = useState<string[]>([]);
  const [newReq, setNewReq] = useState('');

  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  // AI Configuration
  const [threshold, setThreshold] = useState<number>(60);
  const [videoQuestions, setVideoQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');

  // Compensation & Benefits
  const [currency, setCurrency] = useState('IDR');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [showSalaryPublic, setShowSalaryPublic] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);

  // Timelines & Publishing
  const [deadline, setDeadline] = useState('');
  const [openingsCount, setOpeningsCount] = useState(1);
  const [visibility, setVisibility] = useState('Public');

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  // Add Item Handlers
  const handleAddResponsibility = () => {
    if (newResp.trim()) {
      setResponsibilities([...responsibilities, newResp.trim()]);
      setNewResp('');
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleAddRequirement = () => {
    if (newReq.trim()) {
      setRequirements([...requirements, newReq.trim()]);
      setNewReq('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!aiKeywords.includes(keywordInput.trim())) {
        setAiKeywords([...aiKeywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (tag: string) => {
    setAiKeywords(aiKeywords.filter(t => t !== tag));
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim() && videoQuestions.length < 5) {
      setVideoQuestions([...videoQuestions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setVideoQuestions(videoQuestions.filter((_, i) => i !== index));
  };

  const toggleBenefit = (benefit: string) => {
    if (selectedBenefits.includes(benefit)) {
      setSelectedBenefits(selectedBenefits.filter(b => b !== benefit));
    } else {
      setSelectedBenefits([...selectedBenefits, benefit]);
    }
  };

  const parseJsonArray = (json: string | null): string[] => {
    if (!json) return [];
    try {
      const arr = JSON.parse(json);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await fetch(getApiUrl('/jobs/categories'));
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          if (!editId && data.length > 0) {
            setCategoryId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Gagal memuat kategori", err);
      }
    };
    fetchCategories();
  }, [editId]);

  // Load existing job data for edit mode
  useEffect(() => {
    if (!editId) return;
    const loadJob = async () => {
      setIsLoadingEdit(true);
      try {
        const res = await fetchAuth(`/api/jobs/${editId}`);
        if (!res.ok) return;
        const job = await res.json();

        setJobTitle(job.judul_posisi || '');
        setCategoryId(job.kategori_id || '');
        setEmploymentType(job.tipe_pekerjaan || 'Full-time');
        setWorkMode(job.lokasi_kerja || 'Hybrid');
        setLocation(job.kota || '');
        setExperienceLevel(job.experience_level || 'Entry Level');
        setPendidikanMin(job.pendidikan_min || '');
        setSummary(job.deskripsi_pekerjaan || '');
        setResponsibilities(parseJsonArray(job.tanggung_jawab));
        setRequirements(parseJsonArray(job.kualifikasi));
        setAiKeywords(parseJsonArray(job.ai_keywords_json));
        setThreshold(job.cv_threshold || 60);
        setVideoQuestions(parseJsonArray(job.video_questions_json));
        setSalaryMin(job.gaji_min ? String(job.gaji_min) : '');
        setSalaryMax(job.gaji_max ? String(job.gaji_max) : '');
        setShowSalaryPublic(job.tampilkan_gaji || false);
        setSelectedBenefits(parseJsonArray(job.benefits_json));
        setDeadline(job.tanggal_tutup || '');
        setOpeningsCount(job.openings_count || 1);
        setVisibility(job.status === 'draft' ? 'Draft' : 'Public');
      } catch (err) {
        console.error("Gagal memuat data lowongan untuk diedit", err);
      } finally {
        setIsLoadingEdit(false);
      }
    };
    loadJob();
  }, [editId]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      judul_posisi: jobTitle,
      deskripsi_pekerjaan: summary,
      kategori_id: categoryId,
      kualifikasi: JSON.stringify(requirements),
      tanggung_jawab: JSON.stringify(responsibilities),
      tipe_pekerjaan: employmentType,
      lokasi_kerja: workMode,
      kota: location,
      gaji_min: parseFloat(salaryMin.replace(/[^0-9.-]+/g, "")),
      gaji_max: parseFloat(salaryMax.replace(/[^0-9.-]+/g, "")),
      tampilkan_gaji: showSalaryPublic,
      pengalaman_min_tahun: parseInt(experienceLevel) || 0, // Simplified for now
      cv_threshold: threshold,
      interview_threshold: threshold, // Using same threshold for now
      tanggal_buka: new Date().toISOString().split('T')[0],
      tanggal_tutup: deadline,
      department: "Umum", // Or remove entirely if using category_id
      experience_level: experienceLevel,
      pendidikan_min: pendidikanMin,
      benefits_json: JSON.stringify(selectedBenefits),
      ai_keywords_json: JSON.stringify(aiKeywords),
      video_questions_json: JSON.stringify(videoQuestions),
      openings_count: openingsCount,
      status: visibility === 'Draft' ? 'draft' : 'active'
    };

    try {
      const url = editId
        ? getApiUrl(`/jobs/${editId}`)
        : getApiUrl('/jobs/');
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        const errData = await res.json();
        setErrorMsg(`Gagal menyimpan loker: ${errData.detail || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan jaringan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push('/jobs');
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-300">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft size={14} />
            {t.jobs.backToPrevious}
          </button>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {editId ? 'Edit Lowongan' : t.jobs.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {editId ? 'Perbarui informasi lowongan Anda.' : t.jobs.subtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handlePublish} className="space-y-8">

        {/* ==================== SECTION 1: BASIC INFO ==================== */}
        <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Briefcase size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">{t.jobs.basicInfo}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-2">
                {t.jobs.jobTitle} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder={t.jobs.jobTitlePlaceholder}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Kategori Pekerjaan <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all"
              >
                <option value="" disabled>-- Pilih Kategori --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
                ))}
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                {t.jobs.employmentType} <span className="text-rose-500">*</span>
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all"
              >
                <option value="Full-time">Full-time (Tetap)</option>
                <option value="Contract">Contract (Kontrak)</option>
                <option value="Part-time">Part-time (Paruh Waktu)</option>
                <option value="Internship">Internship (Magang)</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            {/* Work Mode & Location */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                {t.jobs.workLocation} <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-1/3 px-3 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                >
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                </select>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Misal: Jakarta, Indonesia"
                  className="w-2/3 px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                {t.jobs.experienceLevel} <span className="text-rose-500">*</span>
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all"
              >
                <option value="Entry Level">Entry Level (0 - 1 Tahun)</option>
                <option value="Mid Level">Mid Level (2 - 4 Tahun)</option>
                <option value="Senior Level">Senior Level (5+ Tahun)</option>
                <option value="Lead / Manager">Lead / Manager (8+ Tahun)</option>
              </select>
            </div>

            {/* Minimal Pendidikan */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Minimal Pendidikan
              </label>
              <select
                value={pendidikanMin}
                onChange={(e) => setPendidikanMin(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all"
              >
                <option value="" disabled>-- Pilih Pendidikan --</option>
                <option value="SMA/SMK">SMA / SMK Sederajat</option>
                <option value="D3">D3 (Diploma)</option>
                <option value="S1">S1 (Sarjana)</option>
                <option value="S2">S2 (Magister)</option>
                <option value="S3">S3 (Doktor)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================== SECTION 2: JOB DESCRIPTION & AI KEYWORDS ==================== */}
        <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">{t.jobs.roleDescription}</h2>
            </div>
          </div>

          {/* Role Summary */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              {t.jobs.roleSummary} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={t.jobs.roleSummaryPlaceholder}
              className="w-full p-4 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all resize-none"
            ></textarea>
          </div>

          {/* Key Responsibilities */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              {t.jobs.keyResponsibilities}
            </label>
            <ul className="space-y-2 mb-3">
              {responsibilities.map((resp, i) => (
                <li key={i} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg text-xs text-foreground">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                    {resp}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResponsibility(i)}
                    className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={newResp}
                onChange={(e) => setNewResp(e.target.value)}
                placeholder="Misal: Merancang arsitektur frontend web aplikasi berskala besar"
                className="flex-1 px-4 py-2 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResponsibility())}
              />
              <button
                type="button"
                onClick={handleAddResponsibility}
                className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                Tambah
              </button>
            </div>
          </div>

          {/* Qualifications & Requirements */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              {t.jobs.requirements}
            </label>
            <ul className="space-y-2 mb-3">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg text-xs text-foreground">
                  <span className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    {req}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(i)}
                    className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={newReq}
                onChange={(e) => setNewReq(e.target.value)}
                placeholder="Misal: Minimal 3 tahun pengalaman di bidang terkait"
                className="flex-1 px-4 py-2 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                Tambah
              </button>
            </div>
          </div>

          {/* AI PO-FIT Keywords */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t.jobs.aiKeywords}
            </label>
            <p className="text-[11px] text-muted-foreground mb-3">
              Keahlian ini akan ditambahkan sebagai bobot utama perhitungan AI saat membandingkan kecocokan dengan CV kandidat.
            </p>

            <div className="p-3 bg-muted/30 border border-border rounded-lg flex flex-wrap gap-2 items-center min-h-[52px]">
              {aiKeywords.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md border border-primary/20">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(tag)}
                    className="hover:text-rose-500 transition-colors ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
                placeholder={t.jobs.aiKeywordsPlaceholder}
                className="flex-1 bg-transparent text-xs text-foreground focus:outline-none min-w-[200px] py-1"
              />
            </div>
          </div>
        </div>

        {/* ==================== SECTION 3: AI SCREENING & EVALUATION RULES ==================== */}
        <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Sliders size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">{t.jobs.aiConfig}</h2>
          </div>

          {/* Threshold Slider */}
          <div className="p-5 bg-muted/20 border border-border rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  {t.jobs.thresholdScore}
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded">
                    {threshold}% Standard
                  </span>
                </label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t.jobs.thresholdHelp}
                </p>
              </div>
              <span className={`text-2xl font-bold ${threshold >= 60 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {threshold}%
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />

            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>30% (Longgar)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">60% (Rekomendasi AI)</span>
              <span>80% (Ketat)</span>
            </div>
          </div>

          {/* Virtual Video Interview Questions */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Video size={16} className="text-primary" />
                {t.jobs.videoQuestions}
              </label>
              <span className="text-xs text-muted-foreground font-mono">
                {videoQuestions.length} / 5 Pertanyaan
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {videoQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 border border-border rounded-lg text-xs">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    Q{i + 1}
                  </span>
                  <p className="flex-1 font-medium text-foreground leading-relaxed">{q}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(i)}
                    className="text-muted-foreground hover:text-rose-500 p-1 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {videoQuestions.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Misal: Ceritakan pengalaman proyek terbesar yang pernah Anda kerjakan"
                  className="flex-1 px-4 py-2 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQuestion())}
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus size={14} />
                  {t.jobs.addQuestion}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ==================== SECTION 4: COMPENSATION & BENEFITS ==================== */}
        <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <DollarSign size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">{t.jobs.compensation}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Currency & Min Salary */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                {t.jobs.salaryMin}
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-24 px-3 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="IDR">IDR (Rp)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <input
                  type="text"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Misal: 8.000.000"
                  className="flex-1 px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Max Salary */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                {t.jobs.salaryMax}
              </label>
              <input
                type="text"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="Misal: 15.000.000"
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="showSalary"
                checked={showSalaryPublic}
                onChange={(e) => setShowSalaryPublic(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="showSalary" className="text-xs text-foreground font-medium cursor-pointer">
                Tampilkan rentang gaji pada deskripsi publik di portal pelamar
              </label>
            </div>
          </div>

          {/* Benefits Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-3">
              {t.jobs.benefits}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Asuransi Kesehatan Private',
                'BPJS Kesehatan & Ketenagakerjaan',
                'Jam Kerja Fleksibel',
                'Remote Work Allowance',
                'Tunjangan Belajar & Kursus',
                'Bonus Kinerja Tahunan',
                'Laptop & Equipment Office',
                'Stock Options / ESOP',
                'Voucher Makan & Transportasi'
              ].map((benefit) => {
                const isSelected = selectedBenefits.includes(benefit);
                return (
                  <button
                    key={benefit}
                    type="button"
                    onClick={() => toggleBenefit(benefit)}
                    className={`p-3 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between ${isSelected
                        ? 'bg-primary/10 border-primary text-primary shadow-sm'
                        : 'bg-muted/20 border-border text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <span>{benefit}</span>
                    {isSelected && <Check size={14} className="shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================== SECTION 5: TIMELINES & PUBLISHING ==================== */}
        <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Calendar size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">{t.jobs.timelines}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                {t.jobs.deadline}
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                {t.jobs.openingsCount}
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={openingsCount}
                onChange={(e) => setOpeningsCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Visibilitas Lowongan
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="Public">Publik di Portal Rekrutmen</option>
                <option value="Internal">Khusus Undangan Internal</option>
                <option value="Draft">Simpan Draf Saja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border py-4 px-6 shadow-xl">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2.5 border border-border hover:bg-muted text-foreground text-xs font-semibold rounded-lg transition-colors"
            >
              Batal
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-5 py-2.5 border border-border hover:bg-muted text-foreground text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                {t.jobs.saveDraft}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {t.jobs.publishJob}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </form>

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground p-8 rounded-xl border border-border max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-bold text-foreground">{t.jobs.jobPublishedSuccess}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Lowongan <strong>{jobTitle}</strong> ({categories.find(c => c.id === categoryId)?.nama_kategori}) kini aktif dan siap menerima berkas pelamar dengan aturan seleksi AI (Threshold PO-FIT {threshold}%).
            </p>
            <button
              onClick={handleSuccessClose}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/90 transition-colors mt-4"
            >
              Kembali Ke Jobs Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Error Modal Overlay */}
      {errorMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground p-8 rounded-xl border border-border max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2">
              <X size={36} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Gagal Menyimpan</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {errorMsg}
            </p>
            <button
              onClick={() => setErrorMsg(null)}
              className="w-full py-3 bg-rose-600 text-white font-semibold rounded-lg text-xs hover:bg-rose-700 transition-colors mt-4"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function CreateJobPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse text-xs">Memuat data form...</div>}>
      <CreateJobForm />
    </Suspense>
  );
}

