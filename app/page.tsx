'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAppStore } from '@/lib/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { getBaseUrl, getMediaUrl, getApiUrl } from '@/lib/api';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
  Menu
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
  responsibilities?: string[];
  requirements: string[];
  openingsCount: number;
}

function LandingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage } = useAppStore();
  const { t } = useTranslation();
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
  }, [searchParams]);

  const [realJobs, setRealJobs] = useState<Job[]>([]);
  const [realCompanies, setRealCompanies] = useState<any[]>([]);

  const fetchRealData = async () => {
    try {
      // Fetch Jobs with Query Params
      const apiParams = new URLSearchParams();
      const kw = searchParams.get('keyword');
      const loc = searchParams.get('location');
      const cat = searchParams.get('category');
      const type = searchParams.get('workType');
      const exp = searchParams.get('expLevel');

      if (kw) apiParams.append('keyword', kw);
      if (loc) apiParams.append('location', loc);
      if (cat && cat !== 'Semua' && cat !== 'All') apiParams.append('category', cat);
      if (type && type !== 'Semua' && type !== 'All') apiParams.append('tipe_pekerjaan', type);
      if (exp && exp !== 'Semua' && exp !== 'All') apiParams.append('experience_level', exp);

      const qs = apiParams.toString();
      const fetchUrl = qs ? getApiUrl(`/jobs/?${qs}`) : getApiUrl('/jobs/');

      const resJobs = await fetch(fetchUrl);
      if (resJobs.ok) {
        const jobsData = await resJobs.json();
        // Map to Job interface
        const mappedJobs = jobsData.data.map((j: any) => ({
          id: j.id, // using numeric ID isn't quite right since it's UUID, but frontend uses number in Job interface. We'll change Job interface ID to number | string
          title: j.judul_posisi,
          company: j.perusahaan?.nama_perusahaan || 'Perusahaan',
          logo: (j.perusahaan?.logo_url && j.perusahaan.logo_url !== '')
            ? getMediaUrl(j.perusahaan.logo_url)
            : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
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
            if (el === 'Entry Level') return 'Entry Level (0 - 1 Tahun)';
            if (el === 'Mid Level') return 'Mid Level (2 - 4 Tahun)';
            if (el === 'Senior Level') return 'Senior Level (5+ Tahun)';
            if (el === 'Lead / Manager') return 'Lead / Manager (8+ Tahun)';
            return el || (j.pengalaman_min_tahun > 3 ? 'Senior Level (5+ Tahun)' : 'Mid Level (2 - 4 Tahun)');
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

      // Fetch Companies
      const resComp = await fetch(getApiUrl('/perusahaan/verified'));
      if (resComp.ok) {
        const compData = await resComp.json();
        const mappedComp = compData.map((c: any) => ({
          name: c.nama_perusahaan,
          logo: (c.logo_url && c.logo_url !== '')
            ? getMediaUrl(c.logo_url)
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

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Semua');
  const [selectedWorkType, setSelectedWorkType] = useState(searchParams.get('workType') || 'Semua');
  const [selectedExpLevel, setSelectedExpLevel] = useState(searchParams.get('expLevel') || 'Semua');

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'Semua' && value !== 'All') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/?${params.toString()}`, { scroll: false });
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

  // Candidate Success Stories
  const successStories = [
    {
      name: 'Rian Pratama',
      role: 'Staf Administrasi',
      company: 'PT Maju Bersama',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      comment: language === 'en' ? 'The matching process was super transparent. I didn’t need to wait weeks for CV screening!' : 'Proses pencocokan kerjanya sangat transparan. Saya tidak perlu menunggu berminggu-minggu hanya untuk kabar panggilan kerja!',
      timeDays: language === 'en' ? '3 Days' : '3 Hari'
    },
    {
      name: 'Siti Rahmawati',
      role: 'Marketing Executive',
      company: 'Nusantara Global',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      comment: language === 'en' ? 'The virtual video interview gave me confidence to demonstrate my soft skills alongside my technical CV.' : 'Fitur wawancara video virtual memberikan rasa percaya diri lebih untuk menunjukkan kemampuan komunikasi saya dibanding sekadar CV.',
      timeDays: language === 'en' ? '5 Days' : '5 Hari'
    },
    {
      name: 'Kevin Jonathan',
      role: 'Software Engineer',
      company: 'Techindo Solutions',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      comment: language === 'en' ? 'The AI analysis of my technical test was spot on and incredibly fast. It felt like they truly understood my capabilities.' : 'Analisis AI dari tes teknikal saya sangat akurat dan luar biasa cepat. Rasanya mereka benar-benar memahami kapasitas saya.',
      timeDays: language === 'en' ? '2 Days' : '2 Hari'
    },
    {
      name: 'Nadia Putri',
      role: 'Data Analyst',
      company: 'Fintech Asia',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
      comment: language === 'en' ? 'No more black holes of resumes. I tracked my application every step of the way and got an offer the same week.' : 'Bukan lagi seperti mengirim CV ke lubang hitam. Saya bisa melacak setiap tahap dan mendapat tawaran dalam minggu yang sama.',
      timeDays: language === 'en' ? '4 Days' : '4 Hari'
    }
  ];

  // FAQ Items
  const faqItems = [
    {
      q: language === 'en' ? 'Is AI-RecruitPro completely free for applicants?' : 'Apakah AI-RecruitPro gratis untuk pelamar?',
      a: language === 'en' ? 'Absolutely! Our platform is 100% free for job seekers. You will never be charged a dime from registration until you get hired.' : 'Tentu saja! Platform ini 100% gratis untuk pencari kerja. Kamu tidak akan dipungut biaya sepeser pun dari awal daftar sampai diterima kerja.'
    },
    {
      q: language === 'en' ? 'Who can see my CV and video recordings?' : 'Siapa saja yang bisa melihat CV dan rekaman video saya?',
      a: language === 'en' ? 'We take your privacy seriously. Your data, CV, and interview recordings can only be accessed by the HR or recruitment team of the specific company you applied to.' : 'Privasi kamu sangat kami jaga. Data, CV, dan rekaman wawancara kamu hanya bisa dilihat oleh HRD atau tim rekrutmen dari perusahaan yang kamu lamar secara langsung.'
    },
    {
      q: language === 'en' ? 'How does the selection process actually work?' : 'Gimana sih sebenarnya proses seleksi di sini?',
      a: language === 'en' ? 'It’s super simple. Once you upload your CV, our system automatically finds the best matching jobs for you. If it’s a match, you just do a quick video interview so companies can see your true potential.' : 'Gampang banget kok. Begitu kamu upload CV, sistem akan otomatis nyari lowongan yang paling cocok buat kamu. Kalau udah match, kamu tinggal ikutin wawancara video singkat biar perusahaan bisa lihat langsung potensi kamu.'
    }
  ];

  // Real Jobs (Fetched from DB)
  const combinedJobs = useMemo(() => {
    return realJobs;
  }, [realJobs, language]);

  const combinedCompanies = useMemo(() => {
    return realCompanies.slice(0, 8); // maximum 8 companies
  }, [realCompanies]);

  // Job Categories dynamically from Real Data
  const jobCategories = useMemo(() => {
    if (!combinedJobs || combinedJobs.length === 0) {
      return [
        { name: language === 'en' ? 'Sales & Marketing' : 'Sales & Marketing', count: language === 'en' ? '0 Openings' : '0 Lowongan', icon: TrendingUp, skills: 'Sales, Digital Marketing' },
        { name: language === 'en' ? 'Finance & Accounting' : 'Finance & Accounting', count: language === 'en' ? '0 Openings' : '0 Lowongan', icon: Briefcase, skills: 'Pajak, Laporan Keuangan' },
        { name: language === 'en' ? 'Customer Service' : 'Customer Service', count: language === 'en' ? '0 Openings' : '0 Lowongan', icon: Users, skills: 'Komunikasi, Problem Solving' },
        { name: language === 'en' ? 'Operations' : 'Operations', count: language === 'en' ? '0 Openings' : '0 Lowongan', icon: Activity, skills: 'Logistik, Manajemen Proyek' },
      ];
    }

    const catMap = new Map();
    combinedJobs.forEach(job => {
      const cat = job.category || (language === 'en' ? 'General' : 'Umum');
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });

    const icons = [Briefcase, TrendingUp, Layers, Users, ShieldCheck, Activity];
    return Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 6)
      .map(([name, count], idx) => ({
        name,
        count: language === 'en' ? `${count} Openings` : `${count} Lowongan`,
        icon: icons[idx % icons.length],
        skills: language === 'en' ? 'Relevant skills' : 'Keahlian relevan'
      }));
  }, [combinedJobs, language]);

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
      const matchWork = selectedWorkType === 'Semua' || selectedWorkType === 'All' || job.workType.toLowerCase().includes(selectedWorkType.toLowerCase());
      const matchExp = selectedExpLevel === 'Semua' || selectedExpLevel === 'All' || job.experienceLevel.toLowerCase().includes(selectedExpLevel.toLowerCase());

      return matchKey && matchLoc && matchCat && matchWork && matchExp;
    });
  }, [keyword, location, selectedCategory, selectedWorkType, selectedExpLevel, language, combinedJobs]);

  const selectedPreviewJob = useMemo(() => {
    return combinedJobs.find(j => j.id === previewJobId) || combinedJobs[0];
  }, [previewJobId, language, combinedJobs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-[#1A4B9F] selection:text-white transition-colors duration-300">

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
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
              className="flex items-center gap-2 group"
            >
              <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
                AI-RecruitPro
              </span>
            </Link>
          </div>

          {/* Clean Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-900 dark:text-slate-200">

            <a href="#categories-section" onClick={() => setActiveSection('categories-section')} className={`transition-colors relative ${activeSection === 'categories-section' ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'}`}>
              {lang.categories}
            </a>
            <a href="#job-feed-section" onClick={() => setActiveSection('job-feed-section')} className={`transition-colors relative ${activeSection === 'job-feed-section' ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'}`}>
              {lang.poFitJobs}
            </a>
            <a href="#features-pillars" onClick={() => setActiveSection('features-pillars')} className={`transition-colors relative ${activeSection === 'features-pillars' ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'}`}>
              {lang.aiFeatures}
            </a>
            <a href="#success-stories" onClick={() => setActiveSection('success-stories')} className={`transition-colors relative ${activeSection === 'success-stories' ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]' : 'hover:text-[#1A4B9F]'}`}>
              {lang.successStories}
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {mounted && <LanguageSwitcher />}

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-sm text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              {lang.companyPortal}
            </Link>

            <Link
              href="/applicant/login"
              className="hidden sm:inline-flex px-5 py-2.5 bg-[#1A4B9F] hover:bg-[#1C41C5] text-white text-sm font-semibold rounded-md transition-colors items-center gap-1.5"
            >
              {lang.applicantPortal}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-bold text-sm"
            >
              <Globe size={18} />
              <span>{language.toUpperCase()}</span>
            </button>
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

            <a href="#categories-section" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              {lang.categories}
            </a>
            <a href="#job-feed-section" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              {lang.poFitJobs}
            </a>
            <a href="#features-pillars" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              {lang.aiFeatures}
            </a>
            <a href="#success-stories" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
              {lang.successStories}
            </a>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:hidden">
              <Link
                href="/login"
                className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-full border border-[#1A4B9F] dark:border-slate-400 text-sm font-bold text-slate-900 dark:text-white"
              >
                <Building2 size={16} />
                {lang.companyPortal}
              </Link>

              <Link
                href="/applicant/login"
                className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white text-sm font-bold shadow-md"
              >
                <Users size={16} />
                {lang.applicantPortal}
              </Link>
            </div>
          </div>
        )}
      </header>
      
      {/* Hero Section */}
      <section id="hero-search" className="relative pt-12 pb-16 sm:pt-28 sm:pb-32 px-6 sm:px-10 lg:px-16 bg-[#1A4B9F] text-white overflow-hidden">
        
        {/* Jobstreet/SEEK Style Abstract Background Curves */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <svg className="absolute w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <path d="M-200 800 C 400 800, 600 200, 1000 -100" fill="none" stroke="white" strokeWidth="60" opacity="0.25" />
            <path d="M-100 900 C 500 900, 700 300, 1100 0" fill="none" stroke="white" strokeWidth="20" opacity="0.25" />
            <path d="M800 1000 C 1200 800, 1300 400, 1600 200" fill="none" stroke="white" strokeWidth="80" opacity="0.15" />
          </svg>
        </div>
        
        

        {/* Content Container (Stable Grid Layout) */}
        <div className="max-w-[1400px] mx-auto relative z-10 flex py-4">
          
          {/* Left Content Container */}
          <div className="flex-1 w-full max-w-[650px] lg:max-w-[480px] xl:max-w-[560px] 2xl:max-w-[650px] space-y-8 relative z-10">
            
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-sans font-bold tracking-tight leading-[1.15] text-white">
                {lang.heroTitleLine1} <br/> 
                <span className="text-white">{lang.heroTitleLine2}</span>
              </h1>
              <p className="text-lg text-blue-100 max-w-xl font-normal leading-relaxed">
                {lang.heroSubtitle}
              </p>
            </div>

            {/* Standard Corporate Search Widget */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                updateUrlParams({ keyword, location });
                document.getElementById('job-feed-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-6 shadow-2xl shadow-[#1A4B9F]/30 rounded-md"
            >
              <div className="flex flex-col sm:flex-row bg-white rounded-md overflow-hidden p-1.5 gap-1">
                
                {/* Keyword Input */}
                <div className="flex-1 relative flex items-center border-b sm:border-b-0 sm:border-r border-slate-200">
                  <Search size={22} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={lang.searchPlaceholder}
                    className="w-full pl-12 pr-4 py-3.5 bg-white text-base text-slate-900 font-medium placeholder-slate-400 focus:outline-none"
                  />
                  {keyword && (
                    <button type="button" onClick={() => setKeyword('')} className="absolute right-4 text-slate-400 hover:text-slate-600">
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Location Input */}
                <div className="flex-1 relative flex items-center">
                  <MapPin size={22} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={lang.locationPlaceholder}
                    className="w-full pl-12 pr-4 py-3.5 bg-white text-base text-slate-900 font-medium placeholder-slate-400 focus:outline-none"
                  />
                  {location && (
                    <button type="button" onClick={() => setLocation('')} className="absolute right-4 text-slate-400 hover:text-slate-600">
                      <X size={18} />
                    </button>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="w-full sm:w-auto px-10 py-3.5 bg-[#1A4B9F] hover:bg-[#1C41C5] text-white text-base font-bold rounded transition-colors"
                >
                  {lang.searchBtn}
                </button>
              </div>

              {/* Clean Trending Tags */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-4 text-sm text-blue-100">
                <span className="font-semibold shrink-0">{lang.trending}</span>
                <div className="flex flex-wrap gap-2">
                  {(language === 'en' ? ['Software Engineer', 'Data Analyst', 'Product Manager'] : ['Software Engineer', 'Data Analyst', 'Product Manager']).map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setKeyword(tag)}
                      className="hover:underline hover:text-white transition-colors text-left"
                    >
                      {tag}{idx < 2 ? <span className="hidden sm:inline">,</span> : ''}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Clean Corporate Stats */}
            <div className="grid grid-cols-3 sm:flex sm:flex-nowrap items-start sm:items-center gap-4 sm:gap-12 pt-8 mt-8 border-t border-white/20">
              <div>
                <span className="text-xl sm:text-3xl font-bold block text-white">{lang.accuracyStat}</span>
                <span className="text-[9px] sm:text-xs text-blue-200 uppercase tracking-wider font-semibold mt-1 block leading-tight">98% Match</span>
              </div>
              <div>
                <span className="text-xl sm:text-3xl font-bold block text-white">10k+</span>
                <span className="text-[9px] sm:text-xs text-blue-200 uppercase tracking-wider font-semibold mt-1 block leading-tight">{lang.successfulApplicants}</span>
              </div>
              <div>
                <span className="text-xl sm:text-3xl font-bold block text-white">5 Mnt</span>
                <span className="text-[9px] sm:text-xs text-blue-200 uppercase tracking-wider font-semibold mt-1 block leading-tight">{lang.screeningProcessTime}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Content: Fully Visible Image with Perfect Clean Curve */}
        <div className="absolute inset-y-0 right-0 w-[100%] lg:w-[65%] xl:w-[60%] z-0 pointer-events-none">
          <div 
            className="w-full h-full hidden lg:block"
            style={{ clipPath: 'ellipse(95% 120% at 100% 50%)' }}
          >
            <img 
              src="/hero-corporate.jpg" 
              alt="Corporate Professionals" 
              className="w-full h-full object-cover object-[20%_center]"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10"></div>
          </div>
        </div>

      </section>

      {/* Top Employers Banner (Jobstreet Style) */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 transition-colors">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-200">
                {lang.topEmployersTitle || 'Perusahaan Populer'}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Temukan lowongan baru dan bergabung dengan perusahaan teratas pilihan kami.
              </p>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {combinedCompanies.map((emp, idx) => (
              <div key={idx} className="shrink-0 w-[240px] p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg hover:border-slate-300 transition-all flex flex-col justify-between min-h-[190px] snap-start cursor-pointer">
                
                <div className="space-y-6">
                  <div className="h-12 flex items-center">
                    <img src={emp.logo} alt={emp.name} className="max-w-[120px] max-h-12 object-contain rounded-md" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-200 line-clamp-2">{emp.name}</h3>
                </div>

                <div className="mt-6">
                  <div className="inline-block px-3 py-1.5 bg-[#E8F1FC] dark:bg-blue-900/30 text-[#1A4B9F] dark:text-blue-400 text-xs font-bold rounded">
                    {emp.jobsCount} Pekerjaan
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>
      {/* 3 Pillars AI Feature Showcase Section */}
      <section id="features-pillars" className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Image / Model */}
            <div className="relative flex justify-center items-center order-2 lg:order-1">
              <div className="relative w-full max-w-sm xl:max-w-md">
                {/* Decorative blob shadow */}
                <div className="absolute inset-0 bg-[#1A4B9F]/10 blur-3xl rounded-full transform -translate-y-4 scale-105"></div>
                <img 
                  src="/feature_model.jpg" 
                  alt="AI-Recruit Professional" 
                  className="relative z-10 w-full h-auto hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-10 order-1 lg:order-2">
              <div className="space-y-4">
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-200 leading-tight">
                  {lang.pillarsTitle}
                </h2>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
                  {lang.pillarsSub}
                </p>
              </div>

              <div className="space-y-8">
                {/* Pillar 1 */}
                <div className="flex gap-5 group">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 group-hover:bg-[#133878] group-hover:text-white transition-all">
                    <FileUp size={26} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200">{lang.pillar1Title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {lang.pillar1Desc}
                    </p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="flex gap-5 group">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 group-hover:bg-[#133878] group-hover:text-white transition-all">
                    <Video size={26} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200">{lang.pillar2Title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {lang.pillar2Desc}
                    </p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="flex gap-5 group">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 group-hover:bg-[#133878] group-hover:text-white transition-all">
                    <ShieldCheck size={26} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200">{lang.pillar3Title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {lang.pillar3Desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section id="categories-section" className="py-16 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto w-full space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-200">
              {lang.exploreCategoriesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{lang.exploreCategoriesSub}</p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('Semua');
            }}
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 hover:underline cursor-pointer"
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
                onClick={() => {
                  const newCat = isSelected ? 'Semua' : cat.name;
                  setSelectedCategory(newCat);
                }}
                className={`p-5 rounded-3xl border text-left flex flex-col justify-between space-y-4 transition-all duration-200 group cursor-pointer ${isSelected
                  ? 'bg-[#1A4B9F] text-white border-[#1A4B9F] shadow-lg ring-2 ring-slate-400/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#1A4B9F] dark:hover:border-slate-300 hover:shadow-md'
                  }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${isSelected ? 'bg-white text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 group-hover:scale-105 transition-transform'
                  }`}>
                  <Icon size={24} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {cat.name}
                    </h3>
                  </div>
                  <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-[#1A4B9F] dark:text-slate-200'}`}>
                    {cat.count}
                  </span>
                  <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
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
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Briefcase size={24} className="text-slate-900 dark:text-slate-200" />
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200">
                  {lang.highPrecisionJobsTitle}
                </h2>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {lang.activeJobsCount} <strong className="text-slate-900 dark:text-white">{filteredJobs.length}</strong> {lang.activeJobsSuffix}
                </span>
              </div>
            </div>

            {(selectedCategory !== 'Semua' || selectedWorkType !== 'Semua' || selectedExpLevel !== 'Semua') && (
              <button
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSelectedWorkType('Semua');
                  setSelectedExpLevel('Semua');
                  updateUrlParams({ category: 'Semua', workType: 'Semua', expLevel: 'Semua' });
                }}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
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
                onClick={() => {
                  setSelectedWorkType(wt);
                }}
                className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${selectedWorkType === wt
                  ? 'bg-[#1A4B9F] text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
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
                onClick={() => {
                  setSelectedExpLevel(exp);
                }}
                className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${selectedExpLevel === exp
                  ? 'bg-[#1A4B9F] text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
              >
                {exp === 'Semua' && language === 'en' ? 'All' : exp}
              </button>
            ))}

            <button
              onClick={() => updateUrlParams({ category: selectedCategory, workType: selectedWorkType, expLevel: selectedExpLevel })}
              className="ml-auto px-5 py-1.5 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold shadow-md transition-all cursor-pointer"
            >
              Terapkan Filter
            </button>
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
                    className={`bg-white dark:bg-slate-900 rounded-3xl border p-6 sm:p-7 flex flex-col justify-between space-y-5 cursor-pointer hover:shadow-xl transition-all duration-200 relative group ${isSelected ? 'border-[#1A4B9F] shadow-md ring-2 ring-slate-400/20' : 'border-slate-200 dark:border-slate-800'
                      }`}
                  >
                    <div className="space-y-4">

                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <img
                            src={job.logo}
                            alt={job.company}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:scale-105 transition-transform"
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
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-200 group-hover:text-[#1A4B9F] dark:group-hover:text-white transition-colors line-clamp-1">
                              {job.title}
                            </h3>
                          </div>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                          className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${isSaved ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                          title={isSaved ? 'Tersimpan' : 'Simpan Pekerjaan'}
                        >
                          <Bookmark size={18} className="fill-current" />
                        </button>
                      </div>

                      {/* Kuota Lowongan Badge */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold">
                          <Users size={15} className="text-slate-900 dark:text-slate-200" />
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
                          <span className="font-semibold text-slate-900 dark:text-slate-200">{job.salary}</span>
                        </div>
                      </div>

                      {/* Benefits Pills */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {job.benefits.map((b, i) => (
                          <span key={i} className="text-[11px] font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
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
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs shadow-xs"
                        >
                          {language === 'en' ? 'Apply Now' : 'Lamar'} <ArrowRight size={15} className="text-white" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Search size={44} className="text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-200">{lang.noJobsFound}</h3>
                <button
                  onClick={() => { setKeyword(''); setLocation(''); setSelectedCategory('Semua'); setSelectedWorkType('Semua'); setSelectedExpLevel('Semua'); }}
                  className="px-5 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold cursor-pointer"
                >
                  {lang.resetFilterBtn}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Sticky Live Preview (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">

              {selectedPreviewJob ? (
                <>
                  <div className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <img
                      src={selectedPreviewJob.logo}
                      alt={selectedPreviewJob.company}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">{selectedPreviewJob.company}</span>
                      <h3 className="font-bold text-xl text-slate-900 dark:text-white leading-snug">{selectedPreviewJob.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                        <span>{selectedPreviewJob.location}</span>
                        <span>•</span>
                        <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedPreviewJob.workType}</span>
                        <span>•</span>
                        <span className="text-slate-900 dark:text-slate-200 font-semibold">{selectedPreviewJob.salary}</span>
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
                      <h4 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-1">{lang.roleDescription}</h4>
                      <p className="leading-relaxed whitespace-pre-line">{selectedPreviewJob.description}</p>
                    </div>

                    {selectedPreviewJob.responsibilities && selectedPreviewJob.responsibilities.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-1">{lang.keyResponsibilities}</h4>
                        <ul className="list-disc list-inside space-y-1.5">
                          {selectedPreviewJob.responsibilities.map((resp: string, idx: number) => (
                            <li key={idx}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-1">{lang.keyQualifications}</h4>
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
                    className="w-full py-4 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
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

      {/* Success Candidate Stories (Bento Box Style) */}
      <section id="success-stories" className="bg-slate-50 dark:bg-slate-950 border-t border-b border-slate-200 dark:border-slate-800 py-24 transition-colors">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
              {lang.hiredInDaysTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {lang.hiredInDaysSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {successStories.slice(0, 3).map((story, idx) => (
              <div key={idx} className="w-full p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between min-h-[250px]">
                <MessageSquareQuote size={48} className="text-slate-100 dark:text-slate-700 absolute right-6 top-6 z-0" />
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 italic leading-relaxed font-medium z-10 relative">
                  "{story.comment}"
                </p>

                <div className="flex items-end justify-between pt-6 border-t border-slate-100 dark:border-slate-700/50 mt-auto z-10 relative">
                  <div className="flex items-center gap-4">
                    <img src={story.avatar} alt={story.name} className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-white dark:border-slate-800" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{story.name}</h4>
                      <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 block mt-0.5 leading-tight">{story.role}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase font-bold text-slate-400 mb-1">{language === 'en' ? 'Hired In' : 'Diproses'}</span>
                    <span className="text-xs font-bold text-[#1A4B9F] dark:text-blue-400 bg-[#E8F1FC] dark:bg-blue-900/30 px-3 py-1 rounded-full whitespace-nowrap">
                      {story.timeDays}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-6">
            <button className="group flex items-center gap-3 px-8 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500 transition-all shadow-sm hover:shadow-md cursor-pointer">
              {language === 'en' ? 'View 500+ Success Stories' : 'Lihat 500+ Kisah Sukses Lainnya'}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </button>
          </div>

        </div>
      </section>

      {/* FAQ Section (Clean Naked Accordion) */}
      <section className="bg-white dark:bg-slate-950 py-12 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-10">
          
          <div className="text-center space-y-3">
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {lang.faqTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              {language === 'en' 
                ? 'Still confused? Find the answers below.' 
                : 'Masih bingung? Temukan jawabannya di bawah ini.'}
            </p>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="border-b border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-4 sm:py-5 text-left font-bold text-slate-900 dark:text-white flex items-start justify-between gap-6 cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <span className="text-base sm:text-lg leading-snug">{faq.q}</span>
                    <span className={`flex-shrink-0 transition-transform duration-300 mt-0.5 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown size={22} strokeWidth={2.5} className="text-slate-900 dark:text-white" />
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pb-8 pr-12 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Enterprise Footer */}
      <footer className="bg-slate-950 text-slate-300 py-16 sm:py-20 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 space-y-16">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
            <div className="lg:col-span-2 space-y-6 pr-0 lg:pr-12">
              <span className="font-bold text-2xl text-white block">AI-RecruitPro</span>
              <p className="text-slate-400 leading-relaxed text-sm">
                {lang.footerDesc}
              </p>
              <div className="flex gap-4 pt-2">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#1A4B9F] hover:border-[#1A4B9F] hover:text-white transition-all cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></div>
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:text-white transition-all cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></div>
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white transition-all cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></div>
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="font-bold text-white text-sm tracking-wider uppercase">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/applicant/login" className="hover:text-white transition-colors">Kandidat</Link></li>
                <li><Link href="/perusahaan/login" className="hover:text-white transition-colors">Perusahaan</Link></li>
                <li><Link href="/applicant/login" className="hover:text-white transition-colors">Fitur Wawancara Video</Link></li>
                <li><Link href="/applicant/login" className="hover:text-white transition-colors">Sistem NLP</Link></li>
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="font-bold text-white text-sm tracking-wider uppercase">Perusahaan</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Tentang Kami</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Karier</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Kontak</Link></li>
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="font-bold text-white text-sm tracking-wider uppercase">Legal & Keamanan</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Keamanan Data (ISO 27001)</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} AI-RecruitPro. {language === 'en' ? 'All rights reserved.' : 'Hak cipta dilindungi.'}</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">Status Sistem</Link>
              <span className="text-slate-600">|</span>
              <button className="hover:text-white transition-colors cursor-pointer">Bahasa: {language === 'en' ? 'English' : 'Indonesia'}</button>
            </div>
          </div>
        </div>
      </footer>

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
