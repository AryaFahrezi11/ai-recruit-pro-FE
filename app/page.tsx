'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAppStore } from '@/lib/store/useAppStore';
import { getBaseUrl, getMediaUrl, getApiUrl } from '@/lib/api';
import Footer from '@/components/Footer';
import { useTranslation } from '@/hooks/useTranslation';

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
  Menu,
  RotateCcw,
  RefreshCw,
  FilterX,
  Quote
} from 'lucide-react';

const slugify = (text: string) => {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

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
  responsibilities?: string[];
  requirements: string[];
  openingsCount: number;
}

function LandingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobileSidebarOpen, toggleMobileSidebar } = useAppStore();
  const { t, language } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const lang = t.landing || {
    findJob: 'Explore Jobs',
    categories: 'Job Categories',
    poFitJobs: 'Latest Openings',
    aiFeatures: 'Top Features',
    successStories: 'Success Stories',
    companyPortal: 'For Employers',
    applicantPortal: 'Login',
    heroTag: 'Platform Cari Kerja Seamless & Transparan',
    heroTitleLine1: 'Temukan Talenta yang Tepat',
    heroTitleLine2: 'di AI-RecruitPro',
    heroSubtitle: 'Kita bantu Anda find career yang paling fit dengan skill dan interest melalui proses AI yang fair dan transparan.',
    accuracyStat: 'Match Rate',
    successfulApplicants: 'Successful Hires',
    screeningProcessTime: 'Fast Screening',
    searchPlaceholder: 'Job Title, Skill, atau Company',
    locationPlaceholder: 'Location (e.g., Jakarta, Remote)',
    trending: 'Trending:',
    searchBtn: 'Search Jobs',
    poFitMatchResult: 'Your Match Score',
    dualVectorAnalysis: 'Smart Matching System',
    matched82: '92% Match',
    biasFree: 'Bias-Free Selection',
    biasFreeDesc: 'CV Anda di-review pure berdasarkan skill, no bias against background personal.',
    topEmployersTitle: 'Top Employers',
    activePartners: '500+ Hiring Partners',
    pillarsTag: 'Why AI-Recruit?',
    pillarsTitle: 'The New Way to Apply Job',
    pillarsSub: '3 simple steps untuk secure role yang paling fit buat Anda.',
    pillar1Title: '1. Auto-Match CV',
    pillar1Desc: 'Sistem akan scanning CV Anda dan provide job match recommendations yang paling precise.',
    pillar2Title: '2. Short Video Intro',
    pillar2Desc: 'Cukup record short video untuk showcase skill komunikasi dan personality Anda.',
    pillar3Title: '3. 100% Fair Assessment',
    pillar3Desc: 'Tim HR akan terima profiling summary yang objektif sebagai baseline untuk final decision.',
    exploreCategoriesTitle: 'Explore Job Categories',
    exploreCategoriesSub: 'Pilih kategori dan filter posisi sesuai expertise Anda',
    showAllCategories: 'Show All Categories',
    highPrecisionJobsTitle: 'Latest Job Openings',
    activeJobsCount: 'Showing',
    activeJobsSuffix: 'active jobs',
    resetFilters: 'Reset Filters',
    workSystem: 'Work System:',
    experienceLevel: 'Experience:',
    all: 'All',
    noJobsFound: 'Belum ada job yang match nih',
    resetFilterBtn: 'Clear Filter',
    estimatedScoreTitle: 'Estimated Match',
    skillAlignment: 'Skill Alignment',
    commVideoResponse: 'Communication & Video',
    cultureFitMatch: 'Culture Fit',
    roleDescription: 'Role Summary:',
    keyResponsibilities: 'Key Responsibilities:',
    keyQualifications: 'Requirements:',
    startPoFitSelection: 'Apply Now →',
    successStoriesTag: 'Success Stories',
    hiredInDaysTitle: 'Hired in Days',
    hiredInDaysSub: 'Dengarkan experience mereka yang sukses secure dream job via platform ini.',
    faqTag: 'FAQ',
    faqTitle: 'Candidate Information',
    footerDesc: 'Job platform yang connect Anda dengan top tech companies secara fair dan transparan.',
    copyright: 'AI-Recruit Pro. All rights reserved.',
    jobDetailsModalTitle: 'Estimated Profile Match:',
    closeModal: 'Close',
  };

  useEffect(() => {
    setMounted(true);
    fetchRealData();

    // Read initial searchParams if any
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat || 'Semua');

    const kw = searchParams.get('keyword');
    if (kw !== null) setKeyword(kw);

    const loc = searchParams.get('location');
    if (loc !== null) setLocation(loc);

    const wt = searchParams.get('workType');
    if (wt !== null) setSelectedWorkType(wt);

    const exp = searchParams.get('statusKerja') || searchParams.get('expLevel');
    if (exp !== null) setSelectedStatusKerja(exp);

    // Immediately clean URL address bar so browser refresh (F5) always reloads clean default state
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const [realJobs, setRealJobs] = useState<Job[]>([]);
  const [realCompanies, setRealCompanies] = useState<any[]>([]);

  const fetchRealData = async () => {
    try {
      // Fetch all active jobs for full categories breakdown and seamless client-side filtering
      const fetchUrl = getApiUrl('/jobs');

      const resJobs = await fetch(fetchUrl);
      if (resJobs.ok) {
        const jobsData = await resJobs.json();
        const rawJobs = Array.isArray(jobsData) ? jobsData : (jobsData?.data || []);
        // Map to Job interface
        const mappedJobs = rawJobs.map((j: any) => ({
          id: j.id, // using numeric ID isn't quite right since it's UUID, but frontend uses number in Job interface. We'll change Job interface ID to number | string
          title: j.judul_posisi,
          company: j.perusahaan?.nama_perusahaan || 'Perusahaan',
          logo: (j.perusahaan?.logo_url && j.perusahaan.logo_url !== '')
            ? getMediaUrl(j.perusahaan.logo_url)
            : '',
          location: j.kota || 'Remote',
          workType: (() => {
            const type = j.tipe_pekerjaan ? j.tipe_pekerjaan.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Full Time';
            const loc = j.lokasi_kerja === 'remote' ? 'Remote' : j.lokasi_kerja === 'hybrid' ? 'Hybrid' : 'On-site';
            return `${type} (${loc})`;
          })(),
          salary: (j.tampilkan_gaji && j.gaji_min && j.gaji_max) ? `Rp ${(j.gaji_min / 1000000).toFixed(0)} Jt - Rp ${(j.gaji_max / 1000000).toFixed(0)} Jt` : 'Gaji Dirahasiakan',
          category: j.kategori?.nama_kategori || 'Teknologi Informasi',
          experienceLevel: (() => {
            const el = j.experience_level;
            const years = 'Tahun';
            if (el === 'Entry Level') return `Entry Level (0 - 1 ${years})`;
            if (el === 'Mid Level') return `Mid Level (2 - 4 ${years})`;
            if (el === 'Senior Level') return `Senior Level (5+ ${years})`;
            if (el === 'Lead / Manager') return `Lead / Manager (8+ ${years})`;
            return el || (j.pengalaman_min_tahun > 3 ? `Senior Level (5+ ${years})` : `Mid Level (2 - 4 ${years})`);
          })(),
          educationLevel: j.pendidikan_min || '-',
          benefits: (() => { try { return j.benefits_json ? JSON.parse(j.benefits_json) : []; } catch (e) { return []; } })(),
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
          responsibilities: (() => { try { return j.tanggung_jawab ? JSON.parse(j.tanggung_jawab) : []; } catch (e) { return j.tanggung_jawab ? j.tanggung_jawab.split('\n').filter((k: string) => k.trim()) : []; } })(),
          requirements: (() => { try { return j.kualifikasi ? JSON.parse(j.kualifikasi) : []; } catch (e) { return j.kualifikasi ? j.kualifikasi.split('\n').filter((k: string) => k.trim()) : []; } })(),
        }));
        setRealJobs(mappedJobs);
      }
    } catch (err) {
      console.error("Gagal memuat data pekerjaan dari server:", err);
    }

    try {
      // Fetch Companies
      const resComp = await fetch(getApiUrl('/perusahaan/verified'));
      if (resComp.ok) {
        const compData = await resComp.json();
        const rawComp = Array.isArray(compData) ? compData : (compData?.data || []);
        const mappedComp = rawComp.map((c: any) => ({
          id: c.id,
          name: c.nama_perusahaan,
          logo: (c.logo_url && c.logo_url !== '')
            ? getMediaUrl(c.logo_url)
            : '',
          jobsCount: c.jobs_count || 0,
          rating: c.rating || 5.0
        }));
        setRealCompanies(mappedComp);
      }
    } catch (err) {
      console.error("Gagal memuat data perusahaan dari server:", err);
    }
  };

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Semua');
  const [selectedWorkType, setSelectedWorkType] = useState(searchParams.get('workType') || 'Semua');
  const [selectedStatusKerja, setSelectedStatusKerja] = useState(searchParams.get('statusKerja') || searchParams.get('expLevel') || 'Semua');

  const updateUrlParams = (updates: Record<string, string>) => {
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };
  const [savedJobs, setSavedJobs] = useState<(number | string)[]>([]);
  const [previewJobId, setPreviewJobId] = useState<number | string>(1);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const toggleSaveJob = (id: number | string) => {
    setSavedJobs(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  // Default Candidate Success Stories
  const defaultStories = useMemo(() => [
    {
      id: 'def-1',
      name: 'Rian Pratama',
      role: 'Staf Administrasi',
      rating: 5,
      category: 'Kejelasan Status',
      comment: 'Senang banget bisa langsung tau kepastian lamaran tanpa perlu H2H digantung minggu-mingguan. Prosesnya transparan & responsif!'
    },
    {
      id: 'def-2',
      name: 'Siti Rahmawati',
      role: 'Marketing Executive',
      rating: 5,
      category: 'Wawancara Video',
      comment: 'Fitur rekam wawancara video sangat praktis! Bisa rekam kapan aja dari rumah tanpa repot desak-desakan ke lokasi kantor.'
    },
    {
      id: 'def-3',
      name: 'Kevin Jonathan',
      role: 'Software Engineer',
      rating: 5,
      category: 'Rekomendasi Lowongan',
      comment: 'Loker yang direkomendasikan beneran pas sama keahlian & gaji yang diharapkan. Gak sampai seminggu udah dipanggil interview.'
    },
    {
      id: 'def-4',
      name: 'Nadia Putri',
      role: 'Data Analyst',
      rating: 5,
      category: 'Pengalaman Melamar',
      comment: 'Gak ada lagi cerita ngirim CV berasa masuk ke lubang hitam. Alur pelacakan lamarannya jelas banget dari awal sampai dapet penawaran!'
    }
  ], []);

  const [userSubmittedReviews, setUserSubmittedReviews] = useState<any[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch(getApiUrl('/reviews/public'));
        if (res.ok) {
          const data = await res.json();
          setUserSubmittedReviews(data);
        }
      } catch (e) {
        // ignore
      }
    };

    loadReviews();
  }, []);

  const displayedStories = useMemo(() => {
    // If backend returns reviews, combine them with defaults.
    // If we have enough backend reviews, maybe just use them.
    // For now, combine them, filter for 5-star, and take top 3.
    const combined = [...userSubmittedReviews, ...defaultStories];
    const fiveStarOnly = combined.filter((item) => (item.rating || 5) === 5);
    // Remove duplicates based on ID if needed, though they shouldn't conflict
    return fiveStarOnly.slice(0, 3);
  }, [userSubmittedReviews, defaultStories]);

  // FAQ Items
  const faqItems = [
    {
      q: 'Apa itu platform pencarian kerja ini?',
      a: 'AI-RecruitPro adalah platform rekrutmen berbasis AI yang menghubungkan pencari kerja dengan perusahaan secara transparan, adil, dan efisien.'
    },
    {
      q: 'Apakah perlu membuat akun untuk mencari lowongan?',
      a: 'Kamu bisa menjelajahi seluruh lowongan pekerjaan secara bebas. Namun untuk melamar dan mengunggah profil, kamu perlu masuk atau mendaftar akun terlebih dahulu.'
    },
    {
      q: 'Dari mana sumber lowongan ditampilkan?',
      a: 'Seluruh lowongan dipublikasikan langsung oleh perusahaan mitra yang terverifikasi dan secara aktif merekrut talenta terbaik.'
    },
    {
      q: 'Bagaimana cara kerja pencocokan skor AI?',
      a: 'Sistem AI menganalisis kesesuaian antara keahlian di CV Anda dengan kualifikasi pekerjaan secara objektif untuk memberikan perkiraan persentase kecocokan.'
    },
    {
      q: 'Apakah layanan ini gratis untuk pelamar kerja?',
      a: 'Ya! Seluruh layanan pencarian kerja dan pengiriman lamaran di AI-RecruitPro 100% gratis untuk pelamar.'
    }
  ];

  // Real Jobs (Fetched from DB)
  const combinedJobs = useMemo(() => {
    return realJobs;
  }, [realJobs]);

  const combinedCompanies = useMemo(() => {
    return realCompanies || [];
  }, [realCompanies]);

  const marqueeCompanies = useMemo(() => {
    if (!combinedCompanies || combinedCompanies.length === 0) return [];
    let list = [...combinedCompanies];
    while (list.length > 0 && list.length < 12) {
      list = [...list, ...combinedCompanies];
    }
    return list;
  }, [combinedCompanies]);

  // Job Categories dynamically from Real Data
  const jobCategories = useMemo(() => {
    if (!combinedJobs || combinedJobs.length === 0) {
      return [
        { name: 'Sales & Marketing', count: '0 Lowongan', icon: TrendingUp, skills: 'Sales, Digital Marketing' },
        { name: 'Finance & Accounting', count: '0 Lowongan', icon: Briefcase, skills: 'Pajak, Laporan Keuangan' },
        { name: 'Customer Service', count: '0 Lowongan', icon: Users, skills: 'Komunikasi, Problem Solving' },
        { name: 'Operations', count: '0 Lowongan', icon: Activity, skills: 'Logistik, Manajemen Proyek' },
      ];
    }

    const catMap = new Map();
    combinedJobs.forEach(job => {
      const cat = job.category || 'Umum';
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });

    const icons = [Briefcase, TrendingUp, Layers, Users, ShieldCheck, Activity];
    return Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 6)
      .map(([name, count], idx) => ({
        name,
        count: `${count} Lowongan`,
        icon: icons[idx % icons.length],
        skills: 'Keahlian relevan'
      }));
  }, [combinedJobs]);

  const marqueeCategories = useMemo(() => {
    if (!jobCategories || jobCategories.length === 0) return [];
    let list = [...jobCategories];
    while (list.length > 0 && list.length < 12) {
      list = [...list, ...jobCategories];
    }
    return list;
  }, [jobCategories]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return combinedJobs.filter((job) => {
      const matchKey = keyword === '' ||
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.company.toLowerCase().includes(keyword.toLowerCase()) ||
        job.location.toLowerCase().includes(keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(keyword.toLowerCase()) ||
        job.tags.some(t => t.toLowerCase().includes(keyword.toLowerCase()));

      const matchLoc = location === '' ||
        job.location.toLowerCase().includes(location.toLowerCase()) ||
        job.workType.toLowerCase().includes(location.toLowerCase());

      const matchCat =
        selectedCategory === 'Semua' ||
        selectedCategory === 'All' ||
        job.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim() ||
        slugify(job.category) === slugify(selectedCategory);

      const matchWork = selectedWorkType === 'Semua' || selectedWorkType === 'All' || job.workType.toLowerCase().includes(selectedWorkType.toLowerCase());

      const matchStatus =
        selectedStatusKerja === 'Semua' ||
        selectedStatusKerja === 'All' ||
        job.workType.toLowerCase().includes(selectedStatusKerja.toLowerCase()) ||
        job.tags.some(t => t.toLowerCase().includes(selectedStatusKerja.toLowerCase()));

      return matchKey && matchLoc && matchCat && matchWork && matchStatus;
    });
  }, [keyword, location, selectedCategory, selectedWorkType, selectedStatusKerja, combinedJobs]);

  const selectedPreviewJob = useMemo(() => {
    return combinedJobs.find(j => j.id === previewJobId) || combinedJobs[0];
  }, [previewJobId, combinedJobs]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-[#1A4B9F] selection:text-white transition-colors duration-300">

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 h-20 flex items-center justify-between">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-3 group"
            >
              <Image
                src="/logo_hd.png"
                alt="AI-RecruitPro Logo"
                width={280}
                height={280}
                quality={100}
                unoptimized
                className="h-13 sm:h-15 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
                priority
              />
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                AI-RecruitPro
              </span>
            </Link>
          </div>

          {/* Clean Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-900 dark:text-slate-200">
            <a href="#job-feed-section" onClick={() => setActiveSection('job-feed-section')} className={`transition-colors relative ${activeSection === 'job-feed-section' ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'}`}>
              {lang.poFitJobs || 'Lowongan Terbaru'}
            </a>
            <a href="#categories-section" onClick={() => setActiveSection('categories-section')} className={`transition-colors relative ${activeSection === 'categories-section' ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'}`}>
              {lang.categories || 'Kategori Pekerjaan'}
            </a>
            <Link href="/companies" className="transition-colors relative hover:text-[#1A4B9F]">
              Perusahaan
            </Link>
            <Link href="/about" className="transition-colors relative hover:text-[#1A4B9F]">
              Tentang Kami
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/perusahaan/login"
              className="hidden sm:inline-flex px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all items-center gap-1.5 border border-slate-200 dark:border-slate-700 shrink-0"
            >
              <Building2 size={14} />
              <span>Untuk Perusahaan</span>
            </Link>

            <Link
              href="/applicant/login"
              className="hidden sm:inline-flex px-4 py-2 bg-[#1A4B9F] hover:bg-[#133878] text-white text-xs font-bold rounded-xl transition-all items-center gap-1.5 shrink-0 shadow-2xs"
            >
              <User size={14} />
              <span>Masuk Pelamar</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg px-6 py-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">

            <a href="#job-feed-section" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              Lowongan Terbaru
            </a>
            <a href="#categories-section" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              Kategori Pekerjaan
            </a>
            <Link href="/companies" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              Perusahaan
            </Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              Tentang Kami
            </Link>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 sm:hidden">
              <Link
                href="/perusahaan/login"
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700"
              >
                <Building2 size={15} />
                <span>Untuk Perusahaan</span>
              </Link>
              <Link
                href="/applicant/login"
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] text-white text-xs font-bold shadow-sm"
              >
                <User size={15} />
                <span>Masuk Pelamar</span>
              </Link>
            </div>
          </div>
        )}
      </header>
      
      {/* Hero Section */}
      <section id="hero-search" className="relative bg-[#F4F9FF] dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden min-h-[260px] sm:min-h-[400px] lg:min-h-[480px] flex items-stretch border-b border-[#E2EFFF] dark:border-slate-800">
        
        {/* Decorative Background Bubbles (Gelembung) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Top Right Light Blue Gelembung */}
          <div className="absolute -top-[15%] -right-[5%] w-[60%] h-[80%] bg-[#E4F0FF] dark:bg-blue-900/20 rounded-[100px] rotate-[25deg] opacity-80"></div>
          
          {/* Center Light Blue Gelembung */}
          <div className="absolute top-[30%] -right-[10%] w-[70%] h-[70%] bg-[#EAF3FF] dark:bg-blue-900/10 rounded-[150px] -rotate-12 opacity-90"></div>
          
          {/* Bottom Left Solid Blue Gelembung */}
          <div className="absolute -bottom-[20%] -left-[10%] w-[35%] max-w-[450px] aspect-square bg-[#3886F6] dark:bg-[#1A4B9F]/60 rounded-full shadow-lg"></div>

          {/* Additional subtle soft blue blob for depth */}
          <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-[#EBF4FF] dark:bg-slate-800 rounded-full blur-3xl opacity-60"></div>
        </div>

        {/* Desktop Right Photo Cutout */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[62%] xl:w-[58%] z-0 pointer-events-none hidden lg:block opacity-90 mix-blend-multiply dark:mix-blend-normal">
          <div 
            className="w-full h-full"
            style={{ clipPath: 'ellipse(95% 120% at 100% 50%)' }}
          >
            <img 
              src="/hero-corporate.jpg" 
              alt="Corporate Professionals" 
              className="w-full h-full object-cover object-[20%_center]"
            />
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-[1440px] mx-auto w-full px-6 sm:px-10 lg:px-14 relative z-10 pt-9 pb-10 sm:py-12 lg:py-16 flex items-center">
          <div className="w-full max-w-[620px] lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[600px] space-y-5">
            
            {/* Header Title & Subtitle */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[45px] font-bold tracking-tighter leading-[1.08] text-slate-900 dark:text-white">
                {lang.heroTitleLine1} <br/>
                <span className="text-[#1A4B9F] dark:text-blue-400">{lang.heroTitleLine2}</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-md">
                {lang.heroSubtitle}
              </p>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-3 items-start gap-4 sm:gap-8 pt-5 mt-5 border-t border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold block text-slate-900 dark:text-white leading-none">98%</span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-1.5 block leading-tight">{lang.accuracyStat}</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold block text-slate-900 dark:text-white leading-none">10k+</span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-1.5 block leading-tight">{lang.successfulApplicants}</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold block text-slate-900 dark:text-white leading-none">5 Mnt</span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-1.5 block leading-tight">{lang.screeningProcessTime}</span>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Top Employers Banner (Infinite Marquee Auto-Scroll) */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6 sm:py-8 transition-colors overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tighter leading-tight text-slate-900 dark:text-white">
                {lang.topEmployersTitle || 'Perusahaan Populer'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal leading-relaxed">
                {'Temukan lowongan baru dan bergabung dengan perusahaan teratas pilihan kami.'}
              </p>
            </div>
          </div>

          {/* Marquee Wrapper or Empty State */}
          {combinedCompanies.length > 0 ? (
            <div className="relative w-full overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
              <div className="animate-marquee flex gap-3">
                {marqueeCompanies.map((emp, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      const compSlug = slugify(emp.name);
                      const targetUrl = compSlug && emp.id ? `/companies/${compSlug}/${emp.id}` : '/companies';
                      router.push(targetUrl);
                    }}
                    className="shrink-0 w-[145px] sm:w-[175px] p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[90px] sm:min-h-[105px] cursor-pointer group"
                  >
                    <div className="space-y-2">
                      <div className="h-7 flex items-center">
                        {emp.logo ? (
                          <img src={emp.logo} alt={emp.name} className="max-w-[85px] max-h-7 object-contain rounded-md group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 group-hover:scale-110 transition-transform">
                            <Building2 size={15} />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">{emp.name}</h3>
                    </div>

                    <div className="pt-0.5">
                      <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                        {emp.jobsCount} Lowongan
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Building2 className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
              <p className="text-slate-600 dark:text-slate-300 font-semibold text-xs">Belum ada perusahaan terverifikasi yang ditampilkan.</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Mitra perusahaan resmi AI-RecruitPro akan segera muncul di sini.</p>
            </div>
          )}
        </div>
      </section>
      {/* 3 Pillars AI Feature Showcase Section */}
      <section id="features-pillars" className="py-10 sm:py-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Image / Model */}
            <div className="relative flex justify-center items-center order-2 lg:order-1">
              <div className="relative w-full max-w-[280px] sm:max-w-sm lg:max-w-[380px]">
                {/* Decorative blob shadow */}
                <div className="absolute inset-0 bg-[#1A4B9F]/10 blur-2xl rounded-full transform -translate-y-2 scale-105"></div>
                <img 
                  src="/feature_model.jpg" 
                  alt="AI-Recruit Professional" 
                  className="relative z-10 w-full h-auto hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-100 leading-snug">
                  {lang.pillarsTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                  {lang.pillarsSub}
                </p>
              </div>

              <div className="space-y-5">
                {/* Pillar 1 */}
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 group-hover:bg-[#133878] group-hover:text-white transition-all">
                    <FileUp size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{lang.pillar1Title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {lang.pillar1Desc}
                    </p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 group-hover:bg-[#133878] group-hover:text-white transition-all">
                    <Video size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{lang.pillar2Title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {lang.pillar2Desc}
                    </p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 group-hover:bg-[#133878] group-hover:text-white transition-all">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{lang.pillar3Title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {lang.pillar3Desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Animated Marquee Section */}
      <section id="categories-section" className="py-6 sm:py-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tighter leading-tight text-slate-900 dark:text-white">
                {lang.exploreCategoriesTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal leading-relaxed">{lang.exploreCategoriesSub}</p>
            </div>
          </div>

          <div className="relative w-full overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
            <div className="animate-marquee flex gap-3">
              {marqueeCategories.map((cat, idx) => {
                const Icon = cat.icon;
                const isSelected =
                  selectedCategory !== 'Semua' &&
                  selectedCategory !== 'All' &&
                  (selectedCategory.toLowerCase().trim() === cat.name.toLowerCase().trim() ||
                   slugify(selectedCategory) === slugify(cat.name));
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      const newCat = isSelected ? 'Semua' : cat.name;
                      setSelectedCategory(newCat);
                      if (window.location.search) {
                        window.history.replaceState(null, '', window.location.pathname);
                      }
                      const feedElem = document.getElementById('job-feed-section');
                      if (feedElem) feedElem.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`shrink-0 w-[145px] sm:w-[175px] p-2.5 sm:p-3 rounded-xl border text-left flex flex-col justify-between space-y-2.5 transition-all duration-300 cursor-pointer group ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-slate-900 dark:border-white ring-2 ring-slate-900/20 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold shrink-0 ${
                      isSelected ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 group-hover:scale-110 transition-transform'
                    }`}>
                      <Icon size={15} />
                    </div>

                    <div className="space-y-0.5">
                      <h3 className="font-bold text-xs truncate text-slate-900 dark:text-white">
                        {cat.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {cat.count}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Split Feed Section */}
      <section id="job-feed-section" className="py-6 sm:py-8 px-6 sm:px-10 lg:px-14 max-w-[1440px] mx-auto w-full space-y-6">

        {/* Quick Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                <Briefcase size={16} className="text-slate-900 dark:text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-200">
                  {lang.highPrecisionJobsTitle}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {lang.activeJobsCount} <strong className="text-slate-900 dark:text-white">{filteredJobs.length}</strong> {lang.activeJobsSuffix}
                  </span>
                  {selectedCategory !== 'Semua' && selectedCategory !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1A4B9F]/10 dark:bg-blue-900/40 border border-[#1A4B9F]/30 dark:border-blue-700 text-[#1A4B9F] dark:text-blue-300 text-[11px] font-bold">
                      <span>Kategori: {selectedCategory}</span>
                      <button
                        onClick={() => {
                          setSelectedCategory('Semua');
                          if (window.location.search) {
                            window.history.replaceState(null, '', window.location.pathname);
                          }
                        }}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors cursor-pointer"
                        title="Hapus filter kategori"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Refresh / Reset Button */}
            <button
              onClick={() => {
                setKeyword('');
                setLocation('');
                setSelectedCategory('Semua');
                setSelectedWorkType('Semua');
                setSelectedStatusKerja('Semua');
                fetchRealData();
                if (window.location.search) {
                  window.history.replaceState(null, '', window.location.pathname);
                }
              }}
              title="Atur Ulang Filter & Muat Ulang Data"
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 group active:scale-95 shadow-2xs"
            >
              <RefreshCw size={13} className="group-hover:rotate-180 transition-transform duration-500 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
              <span>Reset Filter</span>
            </button>
          </div>

          {/* Controls Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cari judul posisi, keahlian, atau perusahaan..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A4B9F] transition-all"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Dropdown: Sistem Kerja */}
            <div className="md:col-span-3">
              <div className="relative">
                <select
                  value={selectedWorkType}
                  onChange={(e) => setSelectedWorkType(e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A4B9F] cursor-pointer"
                >
                  <option value="Semua">Sistem Kerja: Semua</option>
                  <option value="Remote">Sistem Kerja: Remote</option>
                  <option value="Hybrid">Sistem Kerja: Hybrid</option>
                  <option value="On-site">Sistem Kerja: On-site</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown: Status Kerja */}
            <div className="md:col-span-3">
              <div className="relative">
                <select
                  value={selectedStatusKerja}
                  onChange={(e) => setSelectedStatusKerja(e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A4B9F] cursor-pointer"
                >
                  <option value="Semua">Status Kerja: Semua</option>
                  <option value="Full Time">Status Kerja: Full Time</option>
                  <option value="Part Time">Status Kerja: Part Time</option>
                  <option value="Kontrak">Status Kerja: Kontrak</option>
                  <option value="Magang">Status Kerja: Magang</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Split Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Feed List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const isSaved = savedJobs.includes(job.id);
                const isSelected = previewJobId === job.id;

                return (
                  <div
                    key={job.id}
                    onClick={() => setPreviewJobId(job.id)}
                    className={`bg-white dark:bg-slate-900 rounded-xl border p-4 sm:p-5 flex flex-col justify-between space-y-3 cursor-pointer hover:shadow-md transition-all duration-200 relative group ${isSelected ? 'border-[#1A4B9F] shadow-2xs ring-1 ring-[#1A4B9F]/30' : 'border-slate-200/90 dark:border-slate-800'
                      }`}
                  >
                    <div className="space-y-2.5">

                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={job.logo}
                            alt={job.company}
                            className="w-10 h-10 rounded-lg object-contain border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-0.5 shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">{job.company}</span>
                              {job.isNew && (
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                                  • Baru
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                              {job.title}
                            </h3>
                          </div>
                        </div>

                        <Link
                          href="/applicant/login"
                          onClick={(e) => e.stopPropagation()}
                          title="Simpan Lowongan"
                          className="p-1.5 rounded-lg border transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/70 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Bookmark size={16} />
                        </Link>
                      </div>

                      {/* Location, WorkType & Salary Metadata */}
                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span>{job.location} • <strong className="text-slate-800 dark:text-slate-200">{job.workType}</strong> ({job.experienceLevel} • {job.educationLevel})</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <DollarSign size={13} className="text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-slate-100">{job.salary}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-slate-500 text-[11px]">{job.openingsCount} Kuota Posisi</span>
                        </div>
                      </div>

                      {/* Benefits Tag Chips */}
                      {job.benefits && job.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {job.benefits.map((b: string, i: number) => (
                            <span key={i} className="text-[11px] font-normal text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 px-2.5 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                              {b}
                            </span>
                          ))}
                        </div>
                      )}

                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-400 font-medium">
                        {language === 'en' ? 'Published:' : 'Diterbitkan:'} {job.publishDate} <span className="text-slate-300 dark:text-slate-700 mx-1">•</span> {job.postedAgo}
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          href="/applicant/login"
                          className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs shadow-2xs transition-colors"
                        >
                          {language === 'en' ? 'Apply Now' : 'Lamar'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2.5">
                <Search size={36} className="text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">{lang.noJobsFound}</h3>
                <button
                  onClick={() => { setKeyword(''); setLocation(''); setSelectedCategory('Semua'); setSelectedWorkType('Semua'); setSelectedStatusKerja('Semua'); if (window.location.search) { window.history.replaceState(null, '', window.location.pathname); } }}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold cursor-pointer"
                >
                  {lang.resetFilterBtn}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Sticky Live Preview (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">

              {selectedPreviewJob ? (
                <>
                  <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <img
                      src={selectedPreviewJob.logo}
                      alt={selectedPreviewJob.company}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">{selectedPreviewJob.company}</span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{selectedPreviewJob.title}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <span>{selectedPreviewJob.location}</span>
                        <span>•</span>
                        <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedPreviewJob.workType}</span>
                        <span>•</span>
                        <span className="text-slate-900 dark:text-slate-200 font-semibold">{selectedPreviewJob.salary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-200 text-xs mb-1">{lang.roleDescription}</h4>
                      <p className="leading-relaxed whitespace-pre-line">{selectedPreviewJob.description}</p>
                    </div>

                    {selectedPreviewJob.responsibilities && selectedPreviewJob.responsibilities.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-200 text-xs mb-1">{lang.keyResponsibilities}</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedPreviewJob.responsibilities.map((resp: string, idx: number) => (
                            <li key={idx}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-200 text-xs mb-1">{lang.keyQualifications}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedPreviewJob.requirements?.map((req: string, idx: number) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href="/applicant/login"
                    className="w-full py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {lang.startPoFitSelection}
                  </Link>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <Briefcase size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-xs">{language === 'en' ? 'No jobs to display' : 'Belum ada lowongan untuk ditampilkan'}</p>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Minimalist Light Bordered Card */}
        <div className="mt-6 p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-0.5 text-center sm:text-left">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {language === 'en' ? 'Discover More Dream Career Opportunities' : 'Temukan Lebih Banyak Peluang Karir Impian'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {language === 'en'
                ? 'Access all verified job openings and apply with a transparent AI process.'
                : 'Akses seluruh lowongan terverifikasi dan lamar pekerjaan dengan proses AI yang transparan.'}
            </p>
          </div>

          <Link
            href="/applicant/login"
            className="shrink-0 px-5 py-2 rounded-lg bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
          >
            {language === 'en' ? 'Log In & Apply Now' : 'Masuk & Lamar Sekarang'}
          </Link>
        </div>
      </section>

      {/* Success Candidate Stories */}
      <section id="success-stories" className="bg-white dark:bg-slate-950 py-10 sm:py-14 border-t border-b border-slate-100 dark:border-slate-800 transition-colors overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 space-y-8">

          {/* Section Header */}
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tighter text-slate-900 dark:text-white leading-tight">
              {language === 'en' ? 'A calmer, clearer job search.' : 'Cari kerja lebih tenang & transparan.'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              {language === 'en' 
                ? 'A few notes from people using AI-RecruitPro to make their next move with more confidence.'
                : 'Pengalaman dari mereka yang menggunakan AI-RecruitPro untuk melangkah ke karier berikutnya dengan lebih percaya diri.'}
            </p>
          </div>

          {/* Dynamic Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2 max-w-6xl mx-auto">
            {displayedStories.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-3">
                  {/* Top Bar: Stars + Category */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((starNum) => (
                        <Star
                          key={starNum}
                          size={15}
                          className={
                            starNum <= (item.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }
                        />
                      ))}
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 ml-1">
                        {(item.rating || 5).toFixed(1)}
                      </span>
                    </div>

                    {item.category && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1A4B9F] dark:text-blue-400 border border-blue-100 dark:border-blue-900/60 shrink-0">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium italic">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                </div>

                {/* Author Footer */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1A4B9F]/10 dark:bg-blue-950 text-[#1A4B9F] dark:text-blue-400 font-black flex items-center justify-center text-xs shrink-0 border border-[#1A4B9F]/20">
                    {item.name ? item.name.charAt(0) : 'P'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{item.role || 'Pelamar Kerja'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-white dark:bg-slate-900 py-10 sm:py-14 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[11px] font-medium tracking-wide shadow-2xs">
                <SlidersHorizontal size={11} className="text-slate-400" />
                <span>FAQ</span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tighter text-slate-900 dark:text-white leading-snug">
                {language === 'en' ? 'Frequently Asked Questions' : 'Pertanyaan yang sering ditanyakan'}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal max-w-md">
                {language === 'en'
                  ? 'Still confused? Find the answers below.'
                  : 'Masih bingung? Temukan jawabannya di bawah ini.'}
              </p>

              <div className="pt-1">
                <a
                  href="mailto:support@airecruitpro.com"
                  className="inline-flex items-center gap-1.5 text-blue-500 dark:text-blue-400 font-medium text-xs sm:text-sm hover:text-blue-600 dark:hover:text-blue-300 transition-colors group"
                >
                  <span>{language === 'en' ? 'Contact support' : 'Hubungi tim support'}</span>
                </a>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7">
              <div className="border-t border-slate-200/80 dark:border-slate-800 divide-y divide-slate-200/80 dark:divide-slate-800">
                {faqItems.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="transition-colors">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full py-3.5 text-left font-semibold text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                      >
                        <span className="text-xs sm:text-sm leading-snug font-semibold text-slate-900 dark:text-slate-100">
                          {faq.q}
                        </span>
                        <span className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                          <ChevronDown size={15} strokeWidth={1.5} />
                        </span>
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0 pb-0'}`}>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}

export default function PerfectlyNeatLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A4B9F]"></div></div>}>
      <LandingPageContent />
    </Suspense>
  );
}
