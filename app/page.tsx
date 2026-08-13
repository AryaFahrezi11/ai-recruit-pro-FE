'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { getBaseUrl } from '@/lib/api';
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  Building2,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Users,
  User,
  Clock,
  ChevronRight,
  DollarSign,
  Bookmark,
  Zap,
  FileUp,
  Video,
  X,
  Bot,
  Brain,
  Layers,
  Compass,
  FileCheck2,
  Activity,
  Star,
  MessageSquareQuote,
  Lightbulb,
  ChevronDown,
  Globe,
  SlidersHorizontal,
  Check,
  Sun,
  Moon
} from 'lucide-react';

interface Job {
  id: number | string;
  title: string;
  company: string;
  logo: string;
  location: string;
  workType: string;
  salary: string;
  category: string;
  experienceLevel: string;
  educationLevel: string;
  benefits: string[];
  tags: string[];
  postedAgo: string;
  publishDate: string;
  isNew: boolean;
  applicationDeadline?: string | null;
  description: string;
  requirements: string[];
  openingsCount: number;
}

export default function PerfectlyNeatLandingPage() {
  const { theme, toggleTheme, language, setLanguage } = useAppStore();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  const lang = t.landing || {
    findJob: 'Cari Kerja',
    categories: 'Kategori Posisi',
    poFitJobs: 'Lowongan PO-FIT',
    aiFeatures: 'Fitur AI',
    successStories: 'Kisah Sukses',
    companyPortal: 'Untuk Perusahaan',
    applicantPortal: 'Masuk',
    heroTag: 'Sistem Seleksi Berbasis Person-Organization Fit (PO-FIT)',
    heroTitleLine1: 'Temukan Karir Yang',
    heroTitleLine2: 'Sesuai Potensi Anda',
    heroSubtitle: 'Mencocokkan keahlian teknis, potensi individu, dan nilai-nilai organisasi secara transparan, akurat, dan bebas dari bias seleksi.',
    accuracyStat: 'Akurasi Match AI',
    successfulApplicants: 'Pelamar Sukses',
    screeningProcessTime: 'Proses Skrining',
    searchPlaceholder: 'Jabatan, Skill, atau Perusahaan',
    locationPlaceholder: 'Lokasi (misal: Jakarta, Remote)',
    trending: 'Tren:',
    searchBtn: 'Cari Lowongan',
    poFitMatchResult: 'Hasil Match PO-FIT Anda',
    dualVectorAnalysis: 'Analisis Dual-Vector AI',
    matched82: '92% Cocok',
    biasFree: 'Bebas Dari Bias Seleksi',
    biasFreeDesc: 'Lamaran Anda dinilai murni berdasarkan kompetensi teknis dan potensi profesional.',
    topEmployersTitle: 'Perusahaan Populer',
    activePartners: '500+ Mitra Aktif',
    pillarsTag: 'Keunggulan PO-FIT AI Engine',
    pillarsTitle: 'Metodologi Rekrutmen Masa Depan',
    pillarsSub: '3 pilar penilaian cerdas yang memastikan kecocokan kandidat dengan budaya & ekspektasi perusahaan.',
    pillar1Title: '1. Analisis CV NLP Instan',
    pillar1Desc: 'CV kandidat diproses secara otomatis menggunakan ekstraksi token kata kunci dan keselarasan kualifikasi tanpa melihat faktor demografis.',
    pillar2Title: '2. Wawancara Video Multimodal',
    pillar2Desc: 'Analisis ekspresi visual dan nada respon lisan untuk mengukur kecerdasan emosional (EQ) serta gaya komunikasi kandidat.',
    pillar3Title: '3. Validasi HR Tanpa Bias',
    pillar3Desc: 'Tim HR menerima laporan agregat komprehensif untuk pengambilan keputusan akhir yang objektif dan adil.',
    exploreCategoriesTitle: 'Jelajahi Kategori Posisi Favorit',
    exploreCategoriesSub: 'Pilih kategori untuk memfilter posisi sesuai keahlian Anda',
    showAllCategories: 'Tampilkan Semua Kategori',
    highPrecisionJobsTitle: 'Lowongan Kerja Berakurasi Tinggi',
    activeJobsCount: 'Menampilkan',
    activeJobsSuffix: 'posisi kerja aktif',
    resetFilters: 'Reset Semua Filter',
    workSystem: 'Sistem Kerja:',
    experienceLevel: 'Pengalaman:',
    all: 'Semua',
    noJobsFound: 'Tidak Ada Lowongan Yang Cocok',
    resetFilterBtn: 'Reset Filter',
    estimatedScoreTitle: 'Estimasi Skor PO-FIT AI',
    skillAlignment: 'Skill Alignment (NLP)',
    commVideoResponse: 'Komunikasi & Respon Video',
    cultureFitMatch: 'Cultural Fit Match',
    roleDescription: 'Deskripsi Peran:',
    keyQualifications: 'Kualifikasi Kunci:',
    startPoFitSelection: 'Mulai Seleksi PO-FIT Untuk Posisi Ini →',
    successStoriesTag: 'Kisah Sukses Pelamar',
    hiredInDaysTitle: 'Diterima Bekerja Dalam Hitungan Hari',
    hiredInDaysSub: 'Dengarkan pengalaman pelamar yang telah mendapatkan karir impian melalui seleksi PO-FIT AI.',
    faqTag: 'Pertanyaan Umum (FAQ)',
    faqTitle: 'Informasi Untuk Pelamar',
    footerDesc: 'Platform kecerdasan bakat (Talent Intelligence) berbasis Person-Organization Fit (PO-FIT) terdepan.',
    copyright: 'AI-Recruit Pro. Seluruh hak cipta dilindungi.',
    systemStatus: 'System Ready & Active',
    jobDetailsModalTitle: 'Perkiraan Match PO-FIT AI:',
    closeModal: 'Tutup',
  };

  useEffect(() => {
    setMounted(true);
    fetchRealData();
  }, []);

  const [realJobs, setRealJobs] = useState<Job[]>([]);
  const [realCompanies, setRealCompanies] = useState<any[]>([]);

  const fetchRealData = async () => {
    try {
      const baseUrl = getBaseUrl();
      // Fetch Jobs
      const resJobs = await fetch(`${baseUrl}/jobs/`);
      if (resJobs.ok) {
        const jobsData = await resJobs.json();
        // Map to Job interface
        const mappedJobs = jobsData.data.map((j: any) => ({
          id: j.id, // using numeric ID isn't quite right since it's UUID, but frontend uses number in Job interface. We'll change Job interface ID to number | string
          title: j.judul_posisi,
          company: j.perusahaan?.nama_perusahaan || 'Perusahaan',
          logo: (j.perusahaan?.logo_url && j.perusahaan.logo_url !== '') 
                ? (j.perusahaan.logo_url.startsWith('http') ? j.perusahaan.logo_url : `http://${typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'}:8000${j.perusahaan.logo_url}`)
                : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
          location: j.kota || 'Remote',
          workType: (() => {
            const type = j.tipe_pekerjaan ? j.tipe_pekerjaan.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Full Time';
            const loc = j.lokasi_kerja === 'remote' ? 'Remote' : j.lokasi_kerja === 'hybrid' ? 'Hybrid' : 'On-site';
            return `${type} (${loc})`;
          })(),
          salary: (j.tampilkan_gaji && j.gaji_min && j.gaji_max) ? `Rp ${(j.gaji_min/1000000).toFixed(0)} Jt - Rp ${(j.gaji_max/1000000).toFixed(0)} Jt` : 'Gaji Dirahasiakan',
          category: j.kategori?.nama_kategori || 'Teknologi Informasi',
          experienceLevel: (() => {
            const el = j.experience_level;
            if (el === 'Entry Level') return 'Entry Level (0 - 1 Tahun)';
            if (el === 'Mid Level') return 'Mid Level (2 - 4 Tahun)';
            if (el === 'Senior Level') return 'Senior Level (5+ Tahun)';
            if (el === 'Lead / Manager') return 'Lead / Manager (8+ Tahun)';
            return el || (j.pengalaman_min_tahun > 3 ? 'Senior Level (5+ Tahun)' : 'Mid Level (2 - 4 Tahun)');
          })(),
          educationLevel: j.pendidikan_min || '-',
          benefits: (() => { try { return j.benefits_json ? JSON.parse(j.benefits_json) : []; } catch(e){ return []; } })(),
          tags: [j.tipe_pekerjaan, j.lokasi_kerja === 'remote' ? 'Remote' : j.lokasi_kerja === 'hybrid' ? 'Hybrid' : 'On-site'].filter(Boolean),
          postedAgo: (() => {
            const created = j.tanggal_buka ? new Date(j.tanggal_buka) : (j.created_at ? new Date(j.created_at) : new Date());
            const now = new Date();
            const createdStartOfDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
            const nowStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const diffDays = Math.floor((nowStartOfDay.getTime() - createdStartOfDay.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays <= 0) return 'Hari ini';
            if (diffDays === 1) return '1 hari yang lalu';
            return `${diffDays} hari yang lalu`;
          })(),
          publishDate: (() => {
            if (!j.tanggal_buka && !j.created_at) return '-';
            const date = j.tanggal_buka ? new Date(j.tanggal_buka) : new Date(j.created_at);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
          })(),
          applicationDeadline: (() => {
            if (!j.tanggal_tutup) return null;
            const date = new Date(j.tanggal_tutup);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          })(),
          isNew: (() => {
            const created = j.tanggal_buka ? new Date(j.tanggal_buka) : (j.created_at ? new Date(j.created_at) : new Date());
            const now = new Date();
            const createdStartOfDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
            const nowStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const diffDays = Math.floor((nowStartOfDay.getTime() - createdStartOfDay.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
          })(),
          openingsCount: j.openings_count || 1,
          description: j.deskripsi_pekerjaan || '',
          requirements: (() => { try { return j.kualifikasi ? JSON.parse(j.kualifikasi) : []; } catch(e){ return j.kualifikasi ? j.kualifikasi.split('\n').filter((k: string) => k.trim()) : []; } })(),
        }));
        setRealJobs(mappedJobs);
      }
      
      // Fetch Companies
      const resComp = await fetch(`${baseUrl}/perusahaan/verified`);
      if (resComp.ok) {
        const compData = await resComp.json();
        const mappedComp = compData.map((c: any) => ({
          name: c.nama_perusahaan,
          logo: (c.logo_url && c.logo_url !== '') 
                ? (c.logo_url.startsWith('http') ? c.logo_url : `http://${typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'}:8000${c.logo_url}`)
                : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
          jobsCount: c.jobs_count || 0,
          rating: c.rating || 5.0
        }));
        setRealCompanies(mappedComp);
      }
    } catch (err) {
      console.error("Gagal memuat data dari server:", err);
    }
  };

  // Synchronize document element class for dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedWorkType, setSelectedWorkType] = useState('Semua');
  const [selectedExpLevel, setSelectedExpLevel] = useState('Semua');
  const [savedJobs, setSavedJobs] = useState<(number | string)[]>([]);
  const [previewJobId, setPreviewJobId] = useState<number | string>(1);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleSaveJob = (id: number | string) => {
    setSavedJobs(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Job Categories
  const jobCategories = [
    { name: language === 'en' ? 'Information Technology' : 'Teknologi Informasi', count: language === 'en' ? '3,420 Openings' : '3.420 Lowongan', icon: Cpu, skills: 'React, Next.js, Node.js' },
    { name: 'AI & Data Science', count: language === 'en' ? '1,850 Openings' : '1.850 Lowongan', icon: Bot, skills: 'Python, PyTorch, Vector DB' },
    { name: language === 'en' ? 'Design & Creative' : 'Desain & Kreatif', count: language === 'en' ? '1,240 Openings' : '1.240 Lowongan', icon: Layers, skills: 'Figma, Design Tokens, UX' },
    { name: language === 'en' ? 'Product Management' : 'Manajemen Produk', count: language === 'en' ? '980 Openings' : '980 Lowongan', icon: Briefcase, skills: 'Roadmap, Agile, Analytics' },
    { name: language === 'en' ? 'Marketing & Growth' : 'Pemasaran & Growth', count: language === 'en' ? '2,150 Openings' : '2.150 Lowongan', icon: TrendingUp, skills: 'SEO, Performance, Growth' },
    { name: language === 'en' ? 'Finance & HR' : 'Keuangan & HR', count: language === 'en' ? '1,510 Openings' : '1.510 Lowongan', icon: ShieldCheck, skills: 'Talent Ops, Compensation' },
  ];

  // Top Employers (Now dynamically fetched from DB)
  // Candidate Success Stories
  const successStories = [
    {
      name: 'Rian Pratama',
      role: 'Senior Frontend Developer',
      company: 'PT Tech Inovasi Nusantara',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      comment: language === 'en' ? 'The PO-FIT AI matching process was super transparent. I didn’t need to wait weeks for CV screening!' : 'Proses matching PO-FIT AI sangat transparan. Saya tidak perlu menunggu berminggu-minggu hanya untuk kabar screening CV!',
      timeDays: language === 'en' ? '3 Days' : '3 Hari'
    },
    {
      name: 'Siti Rahmawati',
      role: 'AI & Data Specialist',
      company: 'Nusantara Intelligence',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      comment: language === 'en' ? 'The virtual video interview gave me confidence to demonstrate my soft skills alongside my technical CV.' : 'Fitur wawancara video virtual memberikan rasa percaya diri lebih untuk menyampaikan soft skill dibanding sekadar CV tertulis.',
      timeDays: language === 'en' ? '5 Days' : '5 Hari'
    }
  ];

  // FAQ Items
  const faqItems = [
    {
      q: language === 'en' ? 'How does the PO-FIT AI screening system work?' : 'Bagaimana sistem seleksi PO-FIT AI bekerja?',
      a: language === 'en' ? 'Our AI analyzes technical qualifications from your CV using NLP embeddings and measures communication style from video interviews without demographic bias.' : 'Sistem AI menganalisis kualifikasi teknis CV Anda menggunakan NLP Embeddings dan mengukur gaya komunikasi lewat wawancara video tanpa melihat faktor demografis.'
    },
    {
      q: language === 'en' ? 'Is my data secure and kept confidential?' : 'Apakah data pelamar aman dan terenkripsi?',
      a: language === 'en' ? 'Yes, all CV files and video recordings are stored with enterprise-grade encryption and accessible only by verified HR teams.' : 'Ya, seluruh berkas CV dan rekaman video disimpan dengan enkripsi standar industri dan hanya diakses oleh tim HR resmi perusahaan perekrut.'
    },
    {
      q: language === 'en' ? 'Is there any fee to apply for jobs here?' : 'Apakah ada biaya yang dikenakan untuk pelamar?',
      a: language === 'en' ? '100% Free! Applicants can apply for any active job position without any charges.' : '100% Gratis! Pelamar dapat melamar posisi pekerjaan aktif tanpa dipungut biaya apapun.'
    }
  ];

  // Real Jobs (Fetched from DB)
  const combinedJobs = useMemo(() => {
    return realJobs;
  }, [realJobs, language]);
  
  const combinedCompanies = useMemo(() => {
    return realCompanies.slice(0, 8); // maximum 8 companies
  }, [realCompanies]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return combinedJobs.filter((job) => {
      const matchKey = keyword === '' ||
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.company.toLowerCase().includes(keyword.toLowerCase()) ||
        job.tags.some(t => t.toLowerCase().includes(keyword.toLowerCase()));

      const matchLoc = location === '' ||
        job.location.toLowerCase().includes(location.toLowerCase()) ||
        job.workType.toLowerCase().includes(location.toLowerCase());

      const matchCat = selectedCategory === 'Semua' || selectedCategory === 'All' || job.category === selectedCategory;
      const matchWork = selectedWorkType === 'Semua' || selectedWorkType === 'All' || job.workType === selectedWorkType;
      const matchExp = selectedExpLevel === 'Semua' || selectedExpLevel === 'All' || job.experienceLevel === selectedExpLevel;

      return matchKey && matchLoc && matchCat && matchWork && matchExp;
    });
  }, [keyword, location, selectedCategory, selectedWorkType, selectedExpLevel, language, combinedJobs]);

  const selectedPreviewJob = useMemo(() => {
    return combinedJobs.find(j => j.id === previewJobId) || combinedJobs[0];
  }, [previewJobId, language, combinedJobs]);

  return (
    <div className="min-h-screen bg-[#F0F8FB] dark:bg-slate-950 text-[#1b7b9e] dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-[#1b7b9e] selection:text-white transition-colors duration-300">

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#C2E5EF] dark:border-slate-800 shadow-2xs transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">

          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#1b7b9e] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-105 transition-transform duration-200">
                RP
              </div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#0c2b3d] dark:text-cyan-400 leading-none">
                AI-Recruit <span className="text-[#1D7FA1] dark:text-cyan-300">Pro</span>
              </span>
            </Link>

            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F1F7] dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-300 text-xs font-bold border border-[#B8E1ED] dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#1b7b9e] dark:bg-cyan-400 animate-pulse"></span>
              {lang.systemStatus}
            </span>
          </div>

          {/* Clean Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-700 dark:text-slate-200">
            <a href="#hero-search" className="text-[#1b7b9e] dark:text-cyan-400 font-extrabold flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Compass size={17} className="text-[#1b7b9e] dark:text-cyan-400" />
              {lang.findJob}
            </a>
            <a href="#categories-section" className="hover:text-[#1b7b9e] dark:hover:text-cyan-400 transition-colors">
              {lang.categories}
            </a>
            <a href="#job-feed-section" className="hover:text-[#1b7b9e] dark:hover:text-cyan-400 transition-colors">
              {lang.poFitJobs}
            </a>
            <a href="#features-pillars" className="hover:text-[#1b7b9e] dark:hover:text-cyan-400 transition-colors">
              {lang.aiFeatures}
            </a>
            <a href="#success-stories" className="hover:text-[#1b7b9e] dark:hover:text-cyan-400 transition-colors">
              {lang.successStories}
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {mounted && (
              <>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#C2E5EF] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#1b7b9e] dark:text-cyan-400 hover:bg-[#E0F1F7] dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Globe size={15} />
                  <span>{language.toUpperCase()}</span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-[#C2E5EF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-400 hover:bg-[#E0F1F7] dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
                >
                  {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                </button>
              </>
            )}

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#1b7b9e] dark:border-cyan-500 text-xs font-bold text-[#1b7b9e] dark:text-cyan-300 hover:bg-[#E0F1F7] dark:hover:bg-slate-800 transition-colors"
            >
              <Building2 size={16} className="text-[#1b7b9e] dark:text-cyan-300" />
              {lang.companyPortal}
            </Link>

            <Link
              href="/applicant/login"
              className="px-5 py-2.5 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
            >
              <Users size={16} className="text-[#E0F1F7]" />
              {lang.applicantPortal}
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section id="hero-search" className="bg-[#1b7b9e] text-white py-20 sm:py-28 px-6 sm:px-10 lg:px-16 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-center relative z-10">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-7">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 text-[#E0F1F7] text-xs font-extrabold backdrop-blur-md shadow-xs">
              <Sparkles size={16} className="text-[#E0F1F7] animate-bounce" />
              {lang.heroTag}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              {lang.heroTitleLine1} <span className="text-white bg-white/15 px-4 py-1.5 rounded-3xl inline-block mt-1">{lang.heroTitleLine2}</span>
            </h1>

            <p className="text-[#E0F1F7]/95 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
              {lang.heroSubtitle}
            </p>

            {/* Live Counter Floating Stat Pills */}
            <div className="grid grid-cols-3 gap-4 pt-2 max-w-xl">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md space-y-0.5 text-center">
                <span className="text-2xl sm:text-3xl font-black text-white block">98%</span>
                <span className="text-xs text-[#E0F1F7] font-medium">{lang.accuracyStat}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md space-y-0.5 text-center">
                <span className="text-2xl sm:text-3xl font-black text-white block">10.000+</span>
                <span className="text-xs text-[#E0F1F7] font-medium">{lang.successfulApplicants}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md space-y-0.5 text-center">
                <span className="text-2xl sm:text-3xl font-black text-white block">5 Menit</span>
                <span className="text-xs text-[#E0F1F7] font-medium">{lang.screeningProcessTime}</span>
              </div>
            </div>

            {/* Elevated Search Widget */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 text-[#1b7b9e] dark:text-cyan-400 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">

                {/* Keyword Input */}
                <div className="sm:col-span-6 relative flex items-center">
                  <Search size={20} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={lang.searchPlaceholder}
                    className="w-full pl-12 pr-4 py-4 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b7b9e] focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-800 dark:text-slate-100"
                  />
                  {keyword && (
                    <button onClick={() => setKeyword('')} className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Location Input */}
                <div className="sm:col-span-6 relative flex items-center">
                  <MapPin size={20} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={lang.locationPlaceholder}
                    className="w-full pl-12 pr-4 py-4 bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b7b9e] focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-800 dark:text-slate-100"
                  />
                  {location && (
                    <button onClick={() => setLocation('')} className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <X size={18} />
                    </button>
                  )}
                </div>

              </div>

              {/* Bottom Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto w-full sm:w-auto">
                  <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">{lang.trending}</span>
                  {['Frontend', 'AI Specialist', 'Product', 'Remote'].map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => setKeyword(tag)}
                      className="px-3.5 py-1 rounded-full bg-[#E0F1F7] dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-300 hover:bg-[#B8E1ED] dark:hover:bg-slate-700 text-xs font-bold transition-colors whitespace-nowrap"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                <a
                  href="#job-feed-section"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white text-xs sm:text-sm font-black shadow-md transition-all duration-200"
                >
                  <Search size={18} />
                  {lang.searchBtn}
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Live Radar Preview Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-100 dark:border-slate-800 text-[#1b7b9e] dark:text-cyan-400 space-y-7 relative overflow-hidden">

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Bot size={26} className="text-[#1b7b9e] dark:text-cyan-400" />
                  <div>
                    <span className="font-bold text-sm text-[#1b7b9e] dark:text-cyan-400 block">{lang.poFitMatchResult}</span>
                    <span className="text-xs text-slate-400">{lang.dualVectorAnalysis}</span>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-[#1b7b9e] dark:text-cyan-300 bg-[#E0F1F7] dark:bg-slate-800 px-4 py-1.5 rounded-full border border-[#B8E1ED] dark:border-slate-700 shadow-2xs">
                  {lang.matched82}
                </span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2"><Cpu size={16} className="text-[#1b7b9e] dark:text-cyan-400" /> {lang.skillAlignment}</span>
                    <span className="text-[#1b7b9e] dark:text-cyan-400">94%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F0F8FB] dark:bg-slate-800 rounded-full overflow-hidden border border-[#C2E5EF] dark:border-slate-700">
                    <div className="h-full bg-[#1b7b9e] rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2"><Brain size={16} className="text-[#1b7b9e] dark:text-cyan-400" /> {lang.commVideoResponse}</span>
                    <span className="text-[#1b7b9e] dark:text-cyan-400">90%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F0F8FB] dark:bg-slate-800 rounded-full overflow-hidden border border-[#C2E5EF] dark:border-slate-700">
                    <div className="h-full bg-[#1D7FA1] rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#1b7b9e] dark:text-cyan-400" /> {lang.cultureFitMatch}</span>
                    <span className="text-[#1b7b9e] dark:text-cyan-400">92%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F0F8FB] dark:bg-slate-800 rounded-full overflow-hidden border border-[#C2E5EF] dark:border-slate-700">
                    <div className="h-full bg-[#1b7b9e] rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>

              {/* Candidate Success Guarantee Box */}
              <div className="p-4 rounded-2xl bg-[#E0F1F7] dark:bg-slate-800 border border-[#B8E1ED] dark:border-slate-700 flex items-center gap-3 text-xs">
                <CheckCircle2 size={24} className="text-[#1b7b9e] dark:text-cyan-400 shrink-0" />
                <div>
                  <span className="font-bold text-[#1b7b9e] dark:text-cyan-300 block">{lang.biasFree}</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">{lang.biasFreeDesc}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Top Employers Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-[#C2E5EF] dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-5">
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-wider">
            <span>Perusahaan Populer</span>
            <span className="hidden sm:inline">500+ Mitra Aktif</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {combinedCompanies.map((emp, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-[#C2E5EF] dark:border-slate-800 bg-[#F0F8FB] dark:bg-slate-800/80 flex items-center justify-between hover:border-[#1b7b9e] dark:hover:border-cyan-500 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={emp.logo} alt={emp.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="font-bold text-xs sm:text-sm text-[#1b7b9e] dark:text-cyan-300 truncate block">{emp.name}</span>
                    <span className="text-xs font-semibold text-[#1D7FA1] dark:text-cyan-400">{emp.jobsCount} Lowongan</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Pillars AI Feature Showcase Section */}
      <section id="features-pillars" className="py-20 bg-[#F0F8FB] dark:bg-slate-950 border-b border-[#C2E5EF] dark:border-slate-800 transition-colors">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-12">

          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1b7b9e] dark:text-cyan-300 bg-[#E0F1F7] dark:bg-slate-800 px-4 py-1.5 rounded-full border border-[#B8E1ED] dark:border-slate-700">
              {lang.pillarsTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1b7b9e] dark:text-cyan-400">
              {lang.pillarsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {lang.pillarsSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#C2E5EF] dark:border-slate-800 shadow-xs space-y-4 hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#E0F1F7] dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-400 flex items-center justify-center font-bold">
                <FileUp size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#1b7b9e] dark:text-cyan-400">{lang.pillar1Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang.pillar1Desc}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#C2E5EF] dark:border-slate-800 shadow-xs space-y-4 hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#E0F1F7] dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-400 flex items-center justify-center font-bold">
                <Video size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#1b7b9e] dark:text-cyan-400">{lang.pillar2Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang.pillar2Desc}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#C2E5EF] dark:border-slate-800 shadow-xs space-y-4 hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#E0F1F7] dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-400 flex items-center justify-center font-bold">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#1b7b9e] dark:text-cyan-400">{lang.pillar3Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang.pillar3Desc}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Categories Grid Section */}
      <section id="categories-section" className="py-16 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto w-full space-y-8">
        <div className="flex items-center justify-between border-b border-[#C2E5EF] dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1b7b9e] dark:text-cyan-400">
              {lang.exploreCategoriesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{lang.exploreCategoriesSub}</p>
          </div>
          <button
            onClick={() => setSelectedCategory('Semua')}
            className="text-xs sm:text-sm font-bold text-[#1b7b9e] dark:text-cyan-400 hover:underline cursor-pointer"
          >
            {lang.showAllCategories}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {jobCategories.map((cat, idx) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(isSelected ? 'Semua' : cat.name)}
                className={`p-5 rounded-3xl border text-left flex flex-col justify-between space-y-4 transition-all duration-200 group cursor-pointer ${isSelected
                  ? 'bg-[#1b7b9e] text-white border-[#1b7b9e] shadow-lg ring-2 ring-cyan-500/20'
                  : 'bg-white dark:bg-slate-900 border-[#C2E5EF] dark:border-slate-800 hover:border-[#1b7b9e] dark:hover:border-cyan-500 hover:shadow-md'
                  }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${isSelected ? 'bg-white text-[#1b7b9e]' : 'bg-[#E0F1F7] dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-400 group-hover:scale-105 transition-transform'
                  }`}>
                  <Icon size={24} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-[#1b7b9e] dark:text-cyan-300'}`}>
                      {cat.name}
                    </h3>
                  </div>
                  <span className={`text-xs font-bold block ${isSelected ? 'text-[#E0F1F7]' : 'text-[#1D7FA1] dark:text-cyan-400'}`}>
                    {cat.count}
                  </span>
                  <p className={`text-xs ${isSelected ? 'text-[#E0F1F7]/80' : 'text-slate-500 dark:text-slate-400'}`}>
                    Skill: {cat.skills}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Split Feed Section */}
      <section id="job-feed-section" className="py-12 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto w-full space-y-8">

        {/* Quick Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-[#C2E5EF] dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Briefcase size={24} className="text-[#1b7b9e] dark:text-cyan-400" />
              <div>
                <h2 className="text-lg font-bold text-[#1b7b9e] dark:text-cyan-400">
                  {lang.highPrecisionJobsTitle}
                </h2>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {lang.activeJobsCount} <strong className="text-[#1b7b9e] dark:text-cyan-300">{filteredJobs.length}</strong> {lang.activeJobsSuffix}
                </span>
              </div>
            </div>

            {(selectedCategory !== 'Semua' || selectedWorkType !== 'Semua' || selectedExpLevel !== 'Semua') && (
              <button
                onClick={() => { setSelectedCategory('Semua'); setSelectedWorkType('Semua'); setSelectedExpLevel('Semua'); }}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#1b7b9e] dark:hover:text-cyan-300 underline cursor-pointer"
              >
                {lang.resetFilters}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">{lang.workSystem}</span>
            {['Semua', 'Remote', 'Hybrid', 'On-site'].map((wt) => (
              <button
                key={wt}
                onClick={() => setSelectedWorkType(wt)}
                className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${selectedWorkType === wt
                  ? 'bg-[#1b7b9e] text-white shadow-xs'
                  : 'bg-[#F0F8FB] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#E0F1F7] dark:hover:bg-slate-700 border border-[#C2E5EF] dark:border-slate-700'
                  }`}
              >
                {wt === 'Semua' && language === 'en' ? 'All' : wt}
              </button>
            ))}

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

            <span className="text-slate-400 uppercase tracking-wider text-[11px]">{lang.experienceLevel}</span>
            {['Semua', 'Senior Level', 'Mid Level'].map((exp) => (
              <button
                key={exp}
                onClick={() => setSelectedExpLevel(exp)}
                className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${selectedExpLevel === exp
                  ? 'bg-[#1b7b9e] text-white shadow-xs'
                  : 'bg-[#F0F8FB] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#E0F1F7] dark:hover:bg-slate-700 border border-[#C2E5EF] dark:border-slate-700'
                  }`}
              >
                {exp === 'Semua' && language === 'en' ? 'All' : exp}
              </button>
            ))}
          </div>
        </div>

        {/* Split Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Feed List (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const isSaved = savedJobs.includes(job.id);
                const isSelected = previewJobId === job.id;

                return (
                  <div
                    key={job.id}
                    onClick={() => setPreviewJobId(job.id)}
                    className={`bg-white dark:bg-slate-900 rounded-3xl border p-6 sm:p-7 flex flex-col justify-between space-y-5 cursor-pointer hover:shadow-xl transition-all duration-200 relative group ${isSelected ? 'border-[#1b7b9e] shadow-md ring-2 ring-cyan-500/20' : 'border-[#C2E5EF] dark:border-slate-800'
                      }`}
                  >
                    <div className="space-y-4">

                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <img
                            src={job.logo}
                            alt={job.company}
                            className="w-14 h-14 rounded-2xl object-cover border border-[#C2E5EF] dark:border-slate-700 shadow-2xs group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block truncate">{job.company}</span>
                              {job.isNew && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                  Loker Terbaru
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-lg text-[#1b7b9e] dark:text-cyan-400 group-hover:text-[#1D7FA1] dark:group-hover:text-cyan-300 transition-colors line-clamp-1">
                              {job.title}
                            </h3>
                          </div>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                          className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${isSaved ? 'bg-[#E0F1F7] dark:bg-slate-800 border-[#B8E1ED] dark:border-slate-700 text-[#1b7b9e] dark:text-cyan-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                          title={isSaved ? 'Tersimpan' : 'Simpan Pekerjaan'}
                        >
                          <Bookmark size={18} className="fill-current" />
                        </button>
                      </div>

                      {/* Kuota Lowongan Badge */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E0F1F7] dark:bg-slate-800 border border-[#B8E1ED] dark:border-slate-700 text-[#1b7b9e] dark:text-cyan-300 text-xs font-extrabold">
                          <Users size={15} className="text-[#1b7b9e] dark:text-cyan-400" />
                          <span>Kuota: {job.openingsCount} Posisi</span>
                        </div>
                      </div>

                      {/* Location & Salary */}
                      <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-slate-400 shrink-0" />
                          <span>{job.location} • <strong className="text-slate-700 dark:text-slate-200">{job.workType}</strong> ({job.experienceLevel} • {job.educationLevel})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-slate-400 shrink-0" />
                          <span className="font-semibold text-[#1b7b9e] dark:text-cyan-400">{job.salary}</span>
                        </div>
                      </div>

                      {/* Benefits Pills */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {job.benefits.map((b, i) => (
                          <span key={i} className="text-[11px] font-semibold text-[#1b7b9e] dark:text-cyan-300 bg-[#E0F1F7] dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-[#B8E1ED] dark:border-slate-700">
                            ✓ {b}
                          </span>
                        ))}
                      </div>

                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs sm:text-sm">
                      <span className="text-slate-400 font-medium">Diterbitkan: {job.publishDate} <span className="text-slate-300 mx-1">•</span> {job.postedAgo}</span>

                      <div className="flex items-center gap-3">
                        <Link
                          href="/applicant/login"
                          className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-center inline-block"
                        >
                          {language === 'en' ? 'View Details' : 'Lihat Detail'}
                        </Link>
                        <Link
                          href="/applicant/login"
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-bold text-xs shadow-xs"
                        >
                          {language === 'en' ? 'Apply Now' : 'Lamar'} <ArrowRight size={15} className="text-[#E0F1F7]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-[#C2E5EF] dark:border-slate-800 text-center space-y-3">
                <Search size={44} className="text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-[#1b7b9e] dark:text-cyan-400">{lang.noJobsFound}</h3>
                <button
                  onClick={() => { setKeyword(''); setLocation(''); setSelectedCategory('Semua'); setSelectedWorkType('Semua'); setSelectedExpLevel('Semua'); }}
                  className="px-5 py-2.5 rounded-full bg-[#E0F1F7] dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-300 text-xs font-bold cursor-pointer"
                >
                  {lang.resetFilterBtn}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Sticky Live Preview (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl p-7 border border-[#C2E5EF] dark:border-slate-800 shadow-xl space-y-6">

              {selectedPreviewJob ? (
                <>
                  <div className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <img
                      src={selectedPreviewJob.logo}
                      alt={selectedPreviewJob.company}
                      className="w-16 h-16 rounded-2xl object-cover border border-[#C2E5EF] dark:border-slate-700"
                    />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#1b7b9e] dark:text-cyan-400 block">{selectedPreviewJob.company}</span>
                      <h3 className="font-bold text-xl text-[#1b7b9e] dark:text-cyan-300 leading-snug">{selectedPreviewJob.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                        <span>{selectedPreviewJob.location}</span>
                        <span>•</span>
                        <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedPreviewJob.workType}</span>
                        <span>•</span>
                        <span className="text-[#1b7b9e] dark:text-cyan-400 font-semibold">{selectedPreviewJob.salary}</span>
                        <span>•</span>
                        <span>{selectedPreviewJob.experienceLevel}</span>
                        <span>•</span>
                        <span>Min. {selectedPreviewJob.educationLevel}</span>
                        {selectedPreviewJob.applicationDeadline && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 dark:text-amber-500 font-bold">Batas Pendaftaran: {selectedPreviewJob.applicationDeadline}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <div>
                      <h4 className="font-bold text-[#1b7b9e] dark:text-cyan-400 text-sm mb-1">{lang.roleDescription}</h4>
                      <p className="leading-relaxed">{selectedPreviewJob.description}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#1b7b9e] dark:text-cyan-400 text-sm mb-1">{lang.keyQualifications}</h4>
                      <ul className="list-disc list-inside space-y-1.5">
                        {selectedPreviewJob.requirements?.map((req: string, idx: number) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href="/applicant/login"
                    className="w-full py-4 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {lang.startPoFitSelection}
                  </Link>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-sm">Belum ada lowongan untuk ditampilkan</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Success Candidate Stories Carousel Section */}
      <section id="success-stories" className="bg-white dark:bg-slate-900 border-t border-b border-[#C2E5EF] dark:border-slate-800 py-16 transition-colors">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-10">

          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1b7b9e] dark:text-cyan-300 bg-[#E0F1F7] dark:bg-slate-800 px-3.5 py-1 rounded-full border border-[#B8E1ED] dark:border-slate-700">
              {lang.successStoriesTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1b7b9e] dark:text-cyan-400">
              {lang.hiredInDaysTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {lang.hiredInDaysSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {successStories.map((story, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-[#F0F8FB] dark:bg-slate-800/80 border border-[#C2E5EF] dark:border-slate-700 space-y-6 shadow-xs relative">
                <MessageSquareQuote size={40} className="text-[#1b7b9e]/20 dark:text-cyan-400/20 absolute right-6 top-6" />
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 italic leading-relaxed">
                  "{story.comment}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <img src={story.avatar} alt={story.name} className="w-12 h-12 rounded-2xl object-cover border border-[#B8E1ED] dark:border-slate-700" />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1b7b9e] dark:text-cyan-300">{story.name}</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{story.role} {language === 'en' ? 'at' : 'di'} {story.company}</span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-[#1b7b9e] dark:text-cyan-300 bg-[#E0F1F7] dark:bg-slate-700 px-3 py-1 rounded-full border border-[#B8E1ED] dark:border-slate-600">
                    {language === 'en' ? 'Process:' : 'Proses:'} {story.timeDays}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 px-6 sm:px-10 lg:px-16 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#1b7b9e] dark:text-cyan-300 bg-[#E0F1F7] dark:bg-slate-800 px-3 py-1 rounded-full border border-[#B8E1ED] dark:border-slate-700">
            {lang.faqTag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1b7b9e] dark:text-cyan-400">
            {lang.faqTitle}
          </h2>
        </div>

        <div className="space-y-4">
          {faqItems.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-[#C2E5EF] dark:border-slate-800 shadow-2xs overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-[#1b7b9e] dark:text-cyan-300 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180 text-[#1b7b9e] dark:text-cyan-400' : 'text-slate-400'}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-[#C2E5EF] dark:border-slate-800 py-14 mt-auto transition-colors">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-xs sm:text-sm text-slate-500 dark:text-slate-400">

            <div className="space-y-4">
              <span className="font-extrabold text-xl text-[#1b7b9e] dark:text-cyan-400 block">AI-Recruit Pro</span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang.footerDesc}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-[#1b7b9e] dark:text-cyan-400 text-xs uppercase tracking-wider">{lang.findJob}</h4>
              <ul className="space-y-2">
                <li><Link href="/applicant/login" className="hover:text-[#1b7b9e] dark:hover:text-cyan-300">Dashboard Pelamar</Link></li>
                <li><Link href="/applicant/login" className="hover:text-[#1b7b9e] dark:hover:text-cyan-300">Upload CV (NLP)</Link></li>
                <li><Link href="/applicant/login" className="hover:text-[#1b7b9e] dark:hover:text-cyan-300">Wawancara Video AI</Link></li>
                <li><Link href="/applicant/login" className="hover:text-[#1b7b9e] dark:hover:text-cyan-300">Status Validasi</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-[#1b7b9e] dark:text-cyan-400 text-xs uppercase tracking-wider">{language === 'en' ? 'For Employers' : 'Untuk Perusahaan'}</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-[#1b7b9e] dark:hover:text-cyan-300">Portal HR / Dashboard</Link></li>
                <li><Link href="/pipeline" className="hover:text-[#1b7b9e] dark:hover:text-cyan-300">Pipeline Rekrutmen Kanban</Link></li>
                <li><Link href="/reviews" className="hover:text-[#1b7b9e] dark:hover:text-cyan-300">Decision Hub PO-FIT</Link></li>
                <li><Link href="/archive" className="hover:text-[#1b7b9e] dark:hover:text-cyan-300">Arsip Rekam Jejak</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-[#1b7b9e] dark:text-cyan-400 text-xs uppercase tracking-wider">{language === 'en' ? 'Methodology & Security' : 'Metodologi & Keamanan'}</h4>
              <ul className="space-y-2">
                <li>NLP Cosine Embeddings</li>
                <li>Multimodal Video Tracking</li>
                <li>Standardisasi Bias-Free HR</li>
                <li>Privasi &amp; Enkripsi Data</li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <span>&copy; {new Date().getFullYear()} {lang.copyright}</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0F1F7] dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-300 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-[#1b7b9e] dark:bg-cyan-400"></span>
                {lang.systemStatus}
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
