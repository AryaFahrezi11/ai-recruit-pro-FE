'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Briefcase, Building2, MapPin, Clock, DollarSign,
  Sparkles, Sliders, FileText, Check, Globe, X, Video, Calendar
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { fetchAuth } from '@/lib/api/auth';

function AdminJobDetailView() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const token = useAppStore(state => state.token);

  // Form State
  const [jobTitle, setJobTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{id: string, nama_kategori: string}[]>([]);
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('hybrid');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level');
  const [pendidikanMin, setPendidikanMin] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Job Description & AI Keywords
  const [summary, setSummary] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);

  // AI Configuration
  const [threshold, setThreshold] = useState<number>(60);
  const [videoQuestions, setVideoQuestions] = useState<string[]>([]);

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

  const [isLoading, setIsLoading] = useState(false);

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
    const fetchCategories = async () => {
      try {
        const res = await fetchAuth('/api/jobs/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Gagal memuat kategori", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!jobId) return;
    const loadJob = async () => {
      setIsLoading(true);
      try {
        const res = await fetchAuth(`/api/jobs/${jobId}`);
        if (!res.ok) return;
        const job = await res.json();

        setJobTitle(job.judul_posisi || '');
        setCompanyName(job.perusahaan?.nama_perusahaan || 'N/A');
        setCategoryId(job.kategori_id || '');
        setEmploymentType(job.tipe_pekerjaan || 'Full-time');
        setWorkMode(job.lokasi_kerja || 'hybrid');
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
        console.error("Gagal memuat data lowongan", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadJob();
  }, [jobId]);

  return (
    <div className="max-w-4xl mx-auto pb-24">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button 
            type="button"
            onClick={() => router.push('/admin/jobs')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-3"
          >
            <ArrowLeft size={14} />
            Kembali ke Daftar Lowongan
          </button>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            {jobTitle || "Detail Lowongan"}
          </h1>
          <p className="text-sm text-slate-500">
            Perusahaan: <strong className="text-slate-700">{companyName}</strong>
          </p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* ==================== SECTION 1: BASIC INFO ==================== */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Briefcase size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Informasi Dasar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Judul Posisi
              </label>
              <input disabled 
                type="text"
                value={jobTitle}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Kategori Pekerjaan
              </label>
              <select disabled 
                value={categoryId}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
              >
                <option value="" disabled>-- Pilih Kategori --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Tipe Pekerjaan
              </label>
              <select disabled 
                value={employmentType}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
              >
                <option value="Full-time">Full-time (Tetap)</option>
                <option value="Contract">Contract (Kontrak)</option>
                <option value="Part-time">Part-time (Paruh Waktu)</option>
                <option value="Internship">Internship (Magang)</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Lokasi & Model Kerja
              </label>
              <div className="flex gap-2">
                <select disabled 
                  value={workMode}
                  className="w-1/3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                >
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                </select>
                <input disabled 
                  type="text"
                  value={location}
                  className="w-2/3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Level Pengalaman
              </label>
              <select disabled 
                value={experienceLevel}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
              >
                <option value="Entry Level">Entry Level (0 - 1 Tahun)</option>
                <option value="Mid Level">Mid Level (2 - 4 Tahun)</option>
                <option value="Senior Level">Senior Level (5+ Tahun)</option>
                <option value="Lead / Manager">Lead / Manager (8+ Tahun)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Minimal Pendidikan
              </label>
              <select disabled 
                value={pendidikanMin}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
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
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-800">Deskripsi Pekerjaan</h2>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Ringkasan Pekerjaan
            </label>
            <textarea disabled 
              rows={4}
              value={summary}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Tanggung Jawab Utama
            </label>
            <ul className="space-y-2 mb-3">
              {responsibilities.map((resp, i) => (
                <li key={i} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                  {resp}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Kualifikasi & Persyaratan
            </label>
            <ul className="space-y-2 mb-3">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kata Kunci AI (PO-FIT)
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap gap-2 items-center min-h-[52px]">
              {aiKeywords.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-200">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* ==================== SECTION 3: AI SCREENING & EVALUATION RULES ==================== */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Sliders size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Konfigurasi Penilaian AI</h2>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  Batas Minimal Skor CV (Threshold)
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                    {threshold}% Standard
                  </span>
                </label>
              </div>
              <span className={`text-2xl font-bold ${threshold >= 60 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {threshold}%
              </span>
            </div>

            <input disabled 
              type="range" 
              min="50" max="95" step="5"
              value={threshold}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Video size={16} className="text-blue-600" />
                Pertanyaan Wawancara Video
              </label>
              <span className="text-xs text-slate-500 font-mono">
                {videoQuestions.length} / 5 Pertanyaan
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {videoQuestions.length === 0 && (
                <p className="text-xs text-slate-500 italic">Tidak ada pertanyaan wawancara yang diatur.</p>
              )}
              {videoQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    Q{i + 1}
                  </span>
                  <p className="flex-1 font-medium text-slate-800 leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== SECTION 4: COMPENSATION & BENEFITS ==================== */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <DollarSign size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Kompensasi & Benefit</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Gaji Minimum</label>
              <div className="flex gap-2">
                <select disabled value={currency} className="w-24 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800">
                  <option value="IDR">IDR (Rp)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <input disabled type="text" value={salaryMin} className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Gaji Maksimum</label>
              <input disabled type="text" value={salaryMax} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800" />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <input disabled type="checkbox" checked={showSalaryPublic} className="rounded border-slate-300 text-blue-600" />
              <label className="text-xs text-slate-700 font-medium">Tampilkan rentang gaji pada publikasi pekerjaan</label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-3">Benefit (Fasilitas)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Asuransi Kesehatan Private', 'BPJS Kesehatan & Ketenagakerjaan', 'Jam Kerja Fleksibel',
                'Remote Work Allowance', 'Tunjangan Belajar & Kursus', 'Bonus Kinerja Tahunan',
                'Laptop & Equipment Office', 'Stock Options / ESOP', 'Voucher Makan & Transportasi'
              ].map((benefit) => {
                const isSelected = selectedBenefits.includes(benefit);
                return (
                  <div key={benefit} className={`p-3 rounded-lg border text-left text-xs font-medium flex items-center justify-between ${isSelected ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <span>{benefit}</span>
                    {isSelected && <Check size={14} className="shrink-0 ml-1" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================== SECTION 5: TIMELINES & PUBLISHING ==================== */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Calendar size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Batas Waktu & Visibilitas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Batas Akhir Lamaran</label>
              <input disabled type="date" value={deadline} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Kuota / Jumlah Lowongan</label>
              <input disabled type="number" value={openingsCount} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Status Visibilitas</label>
              <select disabled value={visibility} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800">
                <option value="Public">Publik / Aktif</option>
                <option value="Internal">Khusus Internal</option>
                <option value="Draft">Draft Saja</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AdminJobDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs">Memuat data...</div>}>
      <AdminJobDetailView />
    </Suspense>
  );
}
