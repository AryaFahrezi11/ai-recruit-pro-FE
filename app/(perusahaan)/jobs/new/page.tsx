'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  ArrowLeft, Briefcase, Building2, MapPin, Clock, DollarSign,
  Sparkles, Sliders, FileText, Plus, Trash2, CheckCircle2,
  Calendar, Users, HelpCircle, Save, Send, Layers, Check, Globe, X, Video
} from 'lucide-react';

export default function CreateJobPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // Form State
  const [jobTitle, setJobTitle] = useState('Senior Frontend Developer');
  const [department, setDepartment] = useState('Engineering');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [location, setLocation] = useState('Jakarta, Indonesia');
  const [experienceLevel, setExperienceLevel] = useState('Senior (5+ years)');
  
  // Job Description & AI Keywords
  const [summary, setSummary] = useState(
    'Kami mencari Senior Frontend Developer yang berpengalaman dalam membangun aplikasi web modern berskala besar menggunakan React, Next.js, dan TypeScript. Anda akan memimpin tim frontend dalam merancang arsitektur komponen yang modular dan responsif.'
  );
  
  // Dynamic Lists
  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Merancang dan merawat arsitektur frontend web aplikasi berskala besar.',
    'Berkolaborasi dengan tim UI/UX dan Backend Engineer untuk mengintegrasikan REST API.',
    'Optimasi performa web apps, load time, dan pengujian aksesibilitas.'
  ]);
  const [newResp, setNewResp] = useState('');

  const [requirements, setRequirements] = useState<string[]>([
    'Minimal 4+ tahun pengalaman profesional membangun web app berbasis React & TypeScript.',
    'Memahami arsitektur Next.js (App Router), SSR, SSG, dan state management (Zustand/Redux).',
    'Fasih dalam pengujian unit test (Jest / React Testing Library) dan optimasi Web Vitals.'
  ]);
  const [newReq, setNewReq] = useState('');

  const [aiKeywords, setAiKeywords] = useState<string[]>([
    'React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Zustand', 'REST API', 'Microservices', 'Unit Testing'
  ]);
  const [keywordInput, setKeywordInput] = useState('');

  // AI Configuration
  const [threshold, setThreshold] = useState<number>(80);
  const [videoQuestions, setVideoQuestions] = useState<string[]>([
    'Ceritakan tentang proyek frontend paling kompleks yang pernah Anda kerjakan dan peran utama Anda.',
    'Bagaimana pendekatan Anda dalam melakukan optimasi performa web application yang lambat?',
    'Bagaimana cara Anda menyelesaikan konflik atau perbedaan pendapat teknis dalam tim engineer?',
    'Pengalaman Anda dalam memigrasikan monolith ke arsitektur frontend modular / micro-frontends.',
    'Apa motivasi utama Anda ingin bergabung dengan tim kami di AI Recruit Pro?'
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  // Compensation & Benefits
  const [currency, setCurrency] = useState('IDR');
  const [salaryMin, setSalaryMin] = useState('18.000.000');
  const [salaryMax, setSalaryMax] = useState('28.000.000');
  const [showSalaryPublic, setShowSalaryPublic] = useState(true);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([
    'Asuransi Kesehatan Private', 'BPJS Kesehatan & Ketenagakerjaan', 'Jam Kerja Fleksibel', 'Remote Work Allowance', 'Laptop & Equipment Office'
  ]);

  // Timelines & Publishing
  const [deadline, setDeadline] = useState('2026-08-31');
  const [openingsCount, setOpeningsCount] = useState(2);
  const [visibility, setVisibility] = useState('Public');

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 1200);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push('/pipeline');
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
          <h1 className="text-2xl font-bold text-foreground mb-1">{t.jobs.title}</h1>
          <p className="text-sm text-muted-foreground">{t.jobs.subtitle}</p>
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

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                {t.jobs.department} <span className="text-rose-500">*</span>
              </label>
              <select 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all"
              >
                <option value="Engineering">Engineering & Technology</option>
                <option value="Product">Product Management</option>
                <option value="Design">UI/UX & Design</option>
                <option value="Marketing">Marketing & Growth</option>
                <option value="Sales">Sales & Business Development</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance & Accounting</option>
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
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                </select>
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Jakarta, Indonesia"
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
          </div>
        </div>

        {/* ==================== SECTION 2: JOB DESCRIPTION & AI KEYWORDS ==================== */}
        <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">{t.jobs.roleDescription}</h2>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <Sparkles size={12} />
              AI PO-FIT Enabled
            </span>
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
                placeholder="Tambah tanggung jawab utama..."
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
                placeholder="Tambah kualifikasi / persyaratan wajib..."
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
              Kata kunci ini akan digunakan oleh AI system untuk menghitung skor kecocokan Cosine Similarity saat kandidat mengunggah CV.
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
              <span className={`text-2xl font-bold ${threshold >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
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
              <span>50% (Longgar)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">80% (Rekomendasi AI)</span>
              <span>95% (Ketat)</span>
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
                  placeholder="Ketik pertanyaan wawancara video baru..."
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
                    className={`p-3 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected 
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
              Lowongan <strong>{jobTitle}</strong> ({department}) kini aktif dan siap menerima berkas pelamar dengan aturan seleksi AI (Threshold PO-FIT {threshold}%).
            </p>
            <button 
              onClick={handleSuccessClose}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/90 transition-colors mt-4"
            >
              Ke Pipeline Rekrutmen
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
