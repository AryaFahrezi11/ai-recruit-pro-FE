'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  Check
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  location: string;
  workType: string;
  salary: string;
  category: string;
  experienceLevel: string;
  benefits: string[];
  tags: string[];
  matchEstimate: string;
  matchPercentage: number;
  postedAgo: string;
  estimatedTimeMinutes: number;
  isFeatured: boolean;
  description: string;
  requirements: string[];
  skillsScore: number;
  eqScore: number;
  cultureScore: number;
}

export default function PerfectlyNeatLandingPage() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedWorkType, setSelectedWorkType] = useState('Semua');
  const [selectedExpLevel, setSelectedExpLevel] = useState('Semua');
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [activeJobModal, setActiveJobModal] = useState<Job | null>(null);
  const [previewJobId, setPreviewJobId] = useState<number>(1);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleSaveJob = (id: number) => {
    setSavedJobs(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Job Categories
  const jobCategories = [
    { name: 'Teknologi Informasi', count: '3.420 Lowongan', icon: Cpu, skills: 'React, Next.js, Node.js' },
    { name: 'AI & Data Science', count: '1.850 Lowongan', icon: Bot, skills: 'Python, PyTorch, Vector DB' },
    { name: 'Desain & Kreatif', count: '1.240 Lowongan', icon: Layers, skills: 'Figma, Design Tokens, UX' },
    { name: 'Manajemen Produk', count: '980 Lowongan', icon: Briefcase, skills: 'Roadmap, Agile, Analytics' },
    { name: 'Pemasaran & Growth', count: '2.150 Lowongan', icon: TrendingUp, skills: 'SEO, Performance, Growth' },
    { name: 'Keuangan & HR', count: '1.510 Lowongan', icon: ShieldCheck, skills: 'Talent Ops, Compensation' },
  ];

  // Top Employers
  const topEmployers = [
    { name: 'PT Tech Inovasi Nusantara', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80', jobsCount: 14, rating: 4.9 },
    { name: 'Nusantara Intelligence', logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80', jobsCount: 9, rating: 4.8 },
    { name: 'Global Digital Solusindo', logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80', jobsCount: 18, rating: 5.0 },
    { name: 'Fintech Utama Indonesia', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80', jobsCount: 11, rating: 4.7 },
  ];

  // Candidate Success Stories
  const successStories = [
    {
      name: 'Budi Pratama',
      role: 'Senior Frontend Engineer',
      company: 'PT Tech Inovasi Nusantara',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      comment: 'Pengalaman melamar paling efisien yang pernah saya coba. Skor PO-FIT AI sangat presisi dan dalam 3 hari saya langsung mendapat penawaran kerja!',
      timeDays: '3 Hari'
    },
    {
      name: 'Siti Rahma',
      role: 'AI Specialist',
      company: 'Nusantara Intelligence',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      comment: 'Antarmuka wawancara video sangat bersahabat dan bebas cemas. Penilaian kompetensi terasa sangat transparan.',
      timeDays: '2 Hari'
    },
  ];

  // FAQ Items
  const faqItems = [
    {
      q: 'Bagaimana cara kerja penilaian PO-FIT AI?',
      a: 'PO-FIT AI menganalisis keselarasan keahlian teknis dari CV Anda, respon lisan pada wawancara video singkat, dan kesesuaian nilai kerja dengan kualifikasi perusahaan secara objektif dan transparan.'
    },
    {
      q: 'Apakah pelamar harus membayar untuk menggunakan platform ini?',
      a: 'Tidak. Seluruh alur pencarian kerja, tes keselarasan CV, hingga wawancara video untuk pelamar 100% gratis tanpa biaya apapun.'
    },
    {
      q: 'Berapa lama proses seleksi hingga mendapatkan tanggapan HR?',
      a: 'Rata-rata tim HR memberikan tanggapan dalam 1-3 hari kerja setelah Anda menyelesaikan 3 tahap seleksi awal.'
    }
  ];

  // Jobs Dataset
  const allJobs: Job[] = [
    {
      id: 1,
      title: 'Senior Frontend Engineer (AI Solutions)',
      company: 'PT Tech Inovasi Nusantara',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      location: 'Jakarta Selatan',
      workType: 'Hybrid',
      experienceLevel: 'Senior Level',
      salary: 'Rp 18.000.000 - Rp 25.000.000',
      category: 'Teknologi Informasi',
      benefits: ['Asuransi Kesehatan Premium', 'Opsi Remote Flexibility', 'Bonus Tahunan'],
      tags: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      matchEstimate: '92% AI Match',
      matchPercentage: 92,
      postedAgo: '2 jam yang lalu',
      estimatedTimeMinutes: 5,
      isFeatured: true,
      description: 'Mengembangkan UI/UX responsif dan performan tinggi menggunakan Next.js (App Router) & TypeScript untuk platform PO-FIT AI.',
      requirements: ['3+ Tahun Pengalaman React/Next.js', 'Keahlian TypeScript & Tailwind CSS', 'Pengalaman Web Vitals Optimization'],
      skillsScore: 94,
      eqScore: 90,
      cultureScore: 92
    },
    {
      id: 2,
      title: 'AI & Data Science Specialist',
      company: 'Nusantara Intelligence Corp',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
      location: 'Bandung',
      workType: 'Remote',
      experienceLevel: 'Senior Level',
      salary: 'Rp 20.000.000 - Rp 30.000.000',
      category: 'AI & Data Science',
      benefits: ['100% WFH', 'Tunjangan Laptop High-End', 'Sertifikasi Gratis'],
      tags: ['Python', 'NLP', 'PyTorch', 'Vector DB'],
      matchEstimate: '88% AI Match',
      matchPercentage: 88,
      postedAgo: '1 hari yang lalu',
      estimatedTimeMinutes: 5,
      isFeatured: true,
      description: 'Mengoptimalkan model LLM dan Cosine Similarity Cosine Embeddings untuk klasifikasi kualifikasi pelamar otomatis.',
      requirements: ['Gelar S1/S2 Ilmu Komputer/Data Science', 'Pengalaman PyTorch/Transformers', 'Ekspertis Vector Embeddings (Pinecone/Chroma)'],
      skillsScore: 90,
      eqScore: 86,
      cultureScore: 88
    },
    {
      id: 3,
      title: 'Product Manager - Recruitment SaaS',
      company: 'Global Digital Solusindo',
      logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80',
      location: 'Jakarta Pusat',
      workType: 'On-site',
      experienceLevel: 'Mid Level',
      salary: 'Rp 15.000.000 - Rp 22.000.000',
      category: 'Manajemen Produk',
      benefits: ['Makan Siang Gratis', 'Gym Membership', 'Tunjangan Kesehatan'],
      tags: ['Product Roadmap', 'Agile', 'PO-FIT Metrics'],
      matchEstimate: '85% AI Match',
      matchPercentage: 85,
      postedAgo: '3 hari yang lalu',
      estimatedTimeMinutes: 6,
      isFeatured: false,
      description: 'Memimpin roadmap produk dari konsep hingga peluncuran fitur analitik HR dan dashboard penilaian kandidat.',
      requirements: ['3+ Tahun PM di SaaS B2B', 'Memahami Metrik HR Analytics', 'Pengalaman Agile/Scrum Methodologies'],
      skillsScore: 86,
      eqScore: 84,
      cultureScore: 85
    },
    {
      id: 4,
      title: 'Fullstack Developer (React & Node.js)',
      company: 'Fintech Utama Indonesia',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
      location: 'Surabaya',
      workType: 'Hybrid',
      experienceLevel: 'Mid Level',
      salary: 'Rp 14.000.000 - Rp 20.000.000',
      category: 'Teknologi Informasi',
      benefits: ['Jam Kerja Fleksibel', 'BPJS Kesehatan & Ketenagakerjaan'],
      tags: ['React', 'Node.js', 'PostgreSQL'],
      matchEstimate: '84% AI Match',
      matchPercentage: 84,
      postedAgo: '4 hari yang lalu',
      estimatedTimeMinutes: 5,
      isFeatured: false,
      description: 'Membangun API mikroservis yang aman dan antarmuka pengguna web interaktif.',
      requirements: ['Node.js & Express / NestJS', 'React Client-side State', 'PostgreSQL & Prisma ORM'],
      skillsScore: 85,
      eqScore: 82,
      cultureScore: 84
    },
    {
      id: 5,
      title: 'UI/UX Designer (Design System)',
      company: 'Creative Digital Studio',
      logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      location: 'Jakarta Barat',
      workType: 'Hybrid',
      experienceLevel: 'Mid Level',
      salary: 'Rp 12.000.000 - Rp 17.000.000',
      category: 'Desain & Kreatif',
      benefits: ['Workshops Figma gratis', 'Makan siang Jumat'],
      tags: ['Figma', 'Design Tokens', 'Prototyping'],
      matchEstimate: '89% AI Match',
      matchPercentage: 89,
      postedAgo: '5 hari yang lalu',
      estimatedTimeMinutes: 4,
      isFeatured: false,
      description: 'Merancang Design Token dan komponen UI modern yang konsisten di seluruh produk web.',
      requirements: ['Portofolio Figma Terbukti', 'Pemahaman Micro-interactions', 'Pengalaman Design Systems'],
      skillsScore: 91,
      eqScore: 87,
      cultureScore: 89
    },
    {
      id: 6,
      title: 'DevOps & Cloud Infrastructure Engineer',
      company: 'CloudTech Infrastructure',
      logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=120&auto=format&fit=crop&q=80',
      location: 'Remote',
      workType: 'Remote',
      experienceLevel: 'Senior Level',
      salary: 'Rp 16.000.000 - Rp 24.000.000',
      category: 'Teknologi Informasi',
      benefits: ['Tunjangan Internet & Listrik', 'AWS Exam Voucher'],
      tags: ['AWS', 'Docker', 'Kubernetes'],
      matchEstimate: '86% AI Match',
      matchPercentage: 86,
      postedAgo: 'Seminggu yang lalu',
      estimatedTimeMinutes: 5,
      isFeatured: false,
      description: 'Mengelola klaster Kubernetes dan pipeline CI/CD berkinerja tinggi.',
      requirements: ['Sertifikasi AWS Cloud', 'Keahlian Kubernetes & Helm', 'Automation Infrastructure as Code (Terraform)'],
      skillsScore: 88,
      eqScore: 84,
      cultureScore: 86
    },
  ];

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchKey = keyword === '' || 
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.company.toLowerCase().includes(keyword.toLowerCase()) ||
        job.tags.some(t => t.toLowerCase().includes(keyword.toLowerCase()));

      const matchLoc = location === '' || 
        job.location.toLowerCase().includes(location.toLowerCase()) ||
        job.workType.toLowerCase().includes(location.toLowerCase());

      const matchCat = selectedCategory === 'Semua' || job.category === selectedCategory;
      const matchWork = selectedWorkType === 'Semua' || job.workType === selectedWorkType;
      const matchExp = selectedExpLevel === 'Semua' || job.experienceLevel === selectedExpLevel;

      return matchKey && matchLoc && matchCat && matchWork && matchExp;
    });
  }, [keyword, location, selectedCategory, selectedWorkType, selectedExpLevel]);

  const selectedPreviewJob = useMemo(() => {
    return allJobs.find(j => j.id === previewJobId) || allJobs[0];
  }, [previewJobId]);

  return (
    <div className="min-h-screen bg-[#F4FDFB] text-[#0F766E] font-sans antialiased flex flex-col selection:bg-[#0F766E] selection:text-white">
      
      {/* Top Navbar - Perfect Harmony (Height: 80px / h-20) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#CCFBF1] shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#0F766E] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-105 transition-transform duration-200">
                RP
              </div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#0F766E] leading-none">
                AI-Recruit <span className="text-[#0D635C]">Pro</span>
              </span>
            </Link>

            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6FFFA] text-[#0F766E] text-xs font-bold border border-[#99F6E4]">
              <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse"></span>
              PO-FIT AI Active
            </span>
          </div>

          {/* Clean Nav Links (Without Bulky Enclosers) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-700">
            <a href="#hero-search" className="text-[#0F766E] font-extrabold flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Compass size={17} className="text-[#0F766E]" />
              Cari Kerja
            </a>
            <a href="#categories-section" className="hover:text-[#0F766E] transition-colors">
              Kategori Posisi
            </a>
            <a href="#job-feed-section" className="hover:text-[#0F766E] transition-colors">
              Lowongan PO-FIT
            </a>
            <a href="#features-pillars" className="hover:text-[#0F766E] transition-colors">
              Fitur AI
            </a>
            <a href="#success-stories" className="hover:text-[#0F766E] transition-colors">
              Kisah Sukses
            </a>
          </nav>

          {/* Right Action Controls (Clean Proportions) */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#0F766E] text-xs font-bold text-[#0F766E] hover:bg-[#E6FFFA] transition-colors"
            >
              <Building2 size={16} className="text-[#0F766E]" />
              Portal Perusahaan
            </Link>

            <Link
              href="/pelamar/login"
              className="px-5 py-2.5 rounded-full bg-[#0F766E] hover:bg-[#0D635C] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
            >
              <Users size={16} className="text-[#E6FFFA]" />
              Portal Pelamar
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section id="hero-search" className="bg-[#0F766E] text-white py-20 sm:py-28 px-6 sm:px-10 lg:px-16 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-center relative z-10">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-7">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 text-[#E6FFFA] text-xs font-extrabold backdrop-blur-md shadow-xs">
              <Sparkles size={16} className="text-[#E6FFFA] animate-bounce" />
              Sistem Seleksi Berbasis Person-Organization Fit (PO-FIT)
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              Temukan Karir Yang <span className="text-white bg-white/15 px-4 py-1.5 rounded-3xl inline-block mt-1">Sesuai Potensi Anda</span>
            </h1>

            <p className="text-[#E6FFFA]/95 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
              Mencocokkan keahlian teknis, potensi individu, dan nilai-nilai organisasi secara transparan, akurat, dan bebas dari bias seleksi.
            </p>

            {/* Live Counter Floating Stat Pills */}
            <div className="grid grid-cols-3 gap-4 pt-2 max-w-xl">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md space-y-0.5 text-center">
                <span className="text-2xl sm:text-3xl font-black text-white block">98%</span>
                <span className="text-xs text-[#E6FFFA] font-medium">Akurasi Match AI</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md space-y-0.5 text-center">
                <span className="text-2xl sm:text-3xl font-black text-white block">10.000+</span>
                <span className="text-xs text-[#E6FFFA] font-medium">Pelamar Sukses</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md space-y-0.5 text-center">
                <span className="text-2xl sm:text-3xl font-black text-white block">5 Menit</span>
                <span className="text-xs text-[#E6FFFA] font-medium">Proses Skrining</span>
              </div>
            </div>

            {/* Elevated Search Widget */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-100 text-[#0F766E] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                
                {/* Keyword Input */}
                <div className="sm:col-span-6 relative flex items-center">
                  <Search size={20} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Jabatan, Skill, atau Perusahaan"
                    className="w-full pl-12 pr-4 py-4 bg-[#F4FDFB] border border-[#CCFBF1] rounded-2xl text-xs sm:text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all text-[#0F766E]"
                  />
                  {keyword && (
                    <button onClick={() => setKeyword('')} className="absolute right-3 text-slate-400 hover:text-slate-600">
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
                    placeholder="Lokasi (misal: Jakarta, Remote)"
                    className="w-full pl-12 pr-4 py-4 bg-[#F4FDFB] border border-[#CCFBF1] rounded-2xl text-xs sm:text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all text-[#0F766E]"
                  />
                  {location && (
                    <button onClick={() => setLocation('')} className="absolute right-3 text-slate-400 hover:text-slate-600">
                      <X size={18} />
                    </button>
                  )}
                </div>

              </div>

              {/* Bottom Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto w-full sm:w-auto">
                  <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Tren:</span>
                  {['Frontend', 'AI Specialist', 'Product', 'Remote'].map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => setKeyword(tag)}
                      className="px-3.5 py-1 rounded-full bg-[#E6FFFA] text-[#0F766E] hover:bg-[#CCFBF1] text-xs font-bold transition-colors whitespace-nowrap"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                <a
                  href="#job-feed-section"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl bg-[#0F766E] hover:bg-[#0D635C] text-white text-xs sm:text-sm font-black shadow-md transition-all duration-200"
                >
                  <Search size={18} />
                  Cari Lowongan
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Live Radar Preview Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-lg bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-100 text-[#0F766E] space-y-7 relative overflow-hidden">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <Bot size={26} className="text-[#0F766E]" />
                  <div>
                    <span className="font-bold text-sm text-[#0F766E] block">Hasil Match PO-FIT Anda</span>
                    <span className="text-xs text-slate-400">Analisis Dual-Vector AI</span>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-[#0F766E] bg-[#E6FFFA] px-4 py-1.5 rounded-full border border-[#99F6E4] shadow-2xs">
                  92% Cocok
                </span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span className="flex items-center gap-2"><Cpu size={16} className="text-[#0F766E]" /> Keahlian Teknis (NLP)</span>
                    <span className="text-[#0F766E]">94%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F4FDFB] rounded-full overflow-hidden border border-[#CCFBF1]">
                    <div className="h-full bg-[#0F766E] rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span className="flex items-center gap-2"><Brain size={16} className="text-[#0F766E]" /> Komunikasi &amp; Respon Video</span>
                    <span className="text-[#0F766E]">90%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F4FDFB] rounded-full overflow-hidden border border-[#CCFBF1]">
                    <div className="h-full bg-[#0D635C] rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#0F766E]" /> Keselarasan Nilai Kerja</span>
                    <span className="text-[#0F766E]">92%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F4FDFB] rounded-full overflow-hidden border border-[#CCFBF1]">
                    <div className="h-full bg-[#0F766E] rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>

              {/* Candidate Success Guarantee Box */}
              <div className="p-4 rounded-2xl bg-[#E6FFFA] border border-[#99F6E4] flex items-center gap-3 text-xs">
                <CheckCircle2 size={24} className="text-[#0F766E] shrink-0" />
                <div>
                  <span className="font-bold text-[#0F766E] block">Bebas Dari Bias Seleksi</span>
                  <span className="text-slate-600 text-[11px]">Lamaran Anda dinilai murni berdasarkan kompetensi teknis dan potensi profesional.</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Top Employers Banner */}
      <section className="bg-white border-b border-[#CCFBF1] py-10">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-5">
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-wider">
            <span>Perusahaan Terkemuka Yang Merekrut Dengan PO-FIT AI</span>
            <span className="hidden sm:inline">500+ Mitra Aktif</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {topEmployers.map((emp, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-[#CCFBF1] bg-[#F4FDFB] flex items-center justify-between hover:border-[#0F766E] transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={emp.logo} alt={emp.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="font-bold text-xs sm:text-sm text-[#0F766E] truncate block">{emp.name}</span>
                    <span className="text-xs font-semibold text-[#0D635C]">{emp.jobsCount} Lowongan</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span>{emp.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Pillars AI Feature Showcase Section */}
      <section id="features-pillars" className="py-20 bg-[#F4FDFB] border-b border-[#CCFBF1]">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F766E] bg-[#E6FFFA] px-4 py-1.5 rounded-full border border-[#99F6E4]">
              Keunggulan PO-FIT AI Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F766E]">
              Metodologi Rekrutmen Masa Depan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              3 pilar penilaian cerdas yang memastikan kecocokan kandidat dengan budaya &amp; ekspektasi perusahaan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white p-8 rounded-3xl border border-[#CCFBF1] shadow-xs space-y-4 hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#E6FFFA] text-[#0F766E] flex items-center justify-center font-bold">
                <FileUp size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#0F766E]">1. Analisis CV NLP Instan</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                CV kandidat diproses secara otomatis menggunakan ekstraksi token kata kunci dan keselarasan kualifikasi tanpa melihat faktor demografis.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#CCFBF1] shadow-xs space-y-4 hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#E6FFFA] text-[#0F766E] flex items-center justify-center font-bold">
                <Video size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#0F766E]">2. Wawancara Video Multimodal</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Analisis ekspresi visual dan nada respon lisan untuk mengukur kecerdasan emosional (EQ) serta gaya komunikasi kandidat.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#CCFBF1] shadow-xs space-y-4 hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#E6FFFA] text-[#0F766E] flex items-center justify-center font-bold">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#0F766E]">3. Validasi HR Tanpa Bias</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tim HR menerima laporan agregat komprehensif untuk pengambilan keputusan akhir yang objektif dan adil.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Categories Grid Section */}
      <section id="categories-section" className="py-16 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto w-full space-y-8">
        <div className="flex items-center justify-between border-b border-[#CCFBF1] pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F766E]">
              Jelajahi Kategori Posisi Favorit
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">Pilih kategori untuk memfilter posisi sesuai keahlian Anda</p>
          </div>
          <button
            onClick={() => setSelectedCategory('Semua')}
            className="text-xs sm:text-sm font-bold text-[#0F766E] hover:underline"
          >
            Tampilkan Semua Kategori
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
                className={`p-5 rounded-3xl border text-left flex flex-col justify-between space-y-4 transition-all duration-200 group ${
                  isSelected
                    ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-lg ring-2 ring-teal-500/20'
                    : 'bg-white border-[#CCFBF1] hover:border-[#0F766E] hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  isSelected ? 'bg-white text-[#0F766E]' : 'bg-[#E6FFFA] text-[#0F766E] group-hover:scale-105 transition-transform'
                }`}>
                  <Icon size={24} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-[#0F766E]'}`}>
                      {cat.name}
                    </h3>
                  </div>
                  <span className={`text-xs font-bold block ${isSelected ? 'text-[#E6FFFA]' : 'text-[#0D635C]'}`}>
                    {cat.count}
                  </span>
                  <p className={`text-xs ${isSelected ? 'text-[#E6FFFA]/80' : 'text-slate-500'}`}>
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
        <div className="bg-white p-5 rounded-3xl border border-[#CCFBF1] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <Briefcase size={24} className="text-[#0F766E]" />
              <div>
                <h2 className="text-lg font-bold text-[#0F766E]">
                  Lowongan Kerja Berakurasi Tinggi
                </h2>
                <span className="text-xs sm:text-sm text-slate-500">
                  Menampilkan <strong className="text-[#0F766E]">{filteredJobs.length}</strong> posisi kerja aktif
                </span>
              </div>
            </div>

            {(selectedCategory !== 'Semua' || selectedWorkType !== 'Semua' || selectedExpLevel !== 'Semua') && (
              <button
                onClick={() => { setSelectedCategory('Semua'); setSelectedWorkType('Semua'); setSelectedExpLevel('Semua'); }}
                className="text-xs font-bold text-slate-500 hover:text-[#0F766E] underline"
              >
                Reset Semua Filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">Sistem Kerja:</span>
            {['Semua', 'Remote', 'Hybrid', 'On-site'].map((wt) => (
              <button
                key={wt}
                onClick={() => setSelectedWorkType(wt)}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  selectedWorkType === wt
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-[#F4FDFB] text-slate-600 hover:bg-[#E6FFFA] border border-[#CCFBF1]'
                }`}
              >
                {wt}
              </button>
            ))}

            <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

            <span className="text-slate-400 uppercase tracking-wider text-[11px]">Pengalaman:</span>
            {['Semua', 'Senior Level', 'Mid Level'].map((exp) => (
              <button
                key={exp}
                onClick={() => setSelectedExpLevel(exp)}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  selectedExpLevel === exp
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-[#F4FDFB] text-slate-600 hover:bg-[#E6FFFA] border border-[#CCFBF1]'
                }`}
              >
                {exp}
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
                    className={`bg-white rounded-3xl border p-6 sm:p-7 flex flex-col justify-between space-y-5 cursor-pointer hover:shadow-xl transition-all duration-200 relative group ${
                      isSelected ? 'border-[#0F766E] shadow-md ring-2 ring-teal-500/20' : 'border-[#CCFBF1]'
                    }`}
                  >
                    <div className="space-y-4">
                      
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <img
                            src={job.logo}
                            alt={job.company}
                            className="w-14 h-14 rounded-2xl object-cover border border-[#CCFBF1] shadow-2xs group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-500 block truncate">{job.company}</span>
                            <h3 className="font-bold text-lg text-[#0F766E] group-hover:text-[#0D635C] transition-colors line-clamp-1">
                              {job.title}
                            </h3>
                          </div>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                          className={`p-2.5 rounded-xl border transition-colors ${
                            isSaved ? 'bg-[#E6FFFA] border-[#99F6E4] text-[#0F766E]' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                          title={isSaved ? 'Tersimpan' : 'Simpan Pekerjaan'}
                        >
                          <Bookmark size={18} className="fill-current" />
                        </button>
                      </div>

                      {/* AI Match Badge */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6FFFA] border border-[#99F6E4] text-[#0F766E] text-xs font-extrabold">
                          <Sparkles size={15} className="text-[#0F766E]" />
                          <span>{job.matchEstimate}</span>
                        </div>

                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Clock size={14} /> Estimasi Waktu Seleksi: {job.estimatedTimeMinutes} Menit
                        </span>
                      </div>

                      {/* Location & Salary */}
                      <div className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-slate-400 shrink-0" />
                          <span>{job.location} • <strong className="text-slate-700">{job.workType}</strong> ({job.experienceLevel})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-slate-400 shrink-0" />
                          <span className="font-semibold text-[#0F766E]">{job.salary}</span>
                        </div>
                      </div>

                      {/* Benefits Pills */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {job.benefits.map((b, i) => (
                          <span key={i} className="text-[11px] font-semibold text-[#0F766E] bg-[#E6FFFA] px-2.5 py-0.5 rounded-full border border-[#99F6E4]">
                            ✓ {b}
                          </span>
                        ))}
                      </div>

                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs sm:text-sm">
                      <span className="text-slate-400 font-medium">{job.postedAgo}</span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveJobModal(job); }}
                          className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
                        >
                          Lihat Detail
                        </button>
                        <Link
                          href="/pelamar/login"
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0F766E] hover:bg-[#0D635C] text-white font-bold text-xs shadow-xs"
                        >
                          Lamar <ArrowRight size={15} className="text-[#E6FFFA]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-[#CCFBF1] text-center space-y-3">
                <Search size={44} className="text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-[#0F766E]">Tidak Ada Lowongan Yang Cocok</h3>
                <button
                  onClick={() => { setKeyword(''); setLocation(''); setSelectedCategory('Semua'); setSelectedWorkType('Semua'); setSelectedExpLevel('Semua'); }}
                  className="px-5 py-2.5 rounded-full bg-[#E6FFFA] text-[#0F766E] text-xs font-bold"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Sticky Live Preview (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-3xl p-7 border border-[#CCFBF1] shadow-xl space-y-6">
              
              <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
                <img
                  src={selectedPreviewJob.logo}
                  alt={selectedPreviewJob.company}
                  className="w-16 h-16 rounded-2xl object-cover border border-[#CCFBF1]"
                />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#0F766E] block">{selectedPreviewJob.company}</span>
                  <h3 className="font-bold text-xl text-[#0F766E] leading-snug">{selectedPreviewJob.title}</h3>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                    <span>{selectedPreviewJob.location}</span>
                    <span>•</span>
                    <span className="text-[#0F766E] font-semibold">{selectedPreviewJob.salary}</span>
                  </div>
                </div>
              </div>

              {/* Score Details */}
              <div className="bg-[#F4FDFB] p-5 rounded-2xl border border-[#CCFBF1] space-y-4">
                <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-[#0F766E]">
                  <span className="flex items-center gap-2"><Sparkles size={18} className="text-[#0F766E]" /> Estimasi Skor PO-FIT AI</span>
                  <span className="text-sm text-[#0F766E] bg-white px-3.5 py-1 rounded-full shadow-2xs border border-[#99F6E4]">
                    {selectedPreviewJob.matchEstimate}
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Skill Alignment (NLP)</span>
                    <span>{selectedPreviewJob.skillsScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0F766E] rounded-full" style={{ width: `${selectedPreviewJob.skillsScore}%` }}></div>
                  </div>

                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Komunikasi &amp; Respon Video</span>
                    <span>{selectedPreviewJob.eqScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0D635C] rounded-full" style={{ width: `${selectedPreviewJob.eqScore}%` }}></div>
                  </div>

                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Cultural Fit Match</span>
                    <span>{selectedPreviewJob.cultureScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0F766E] rounded-full" style={{ width: `${selectedPreviewJob.cultureScore}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                <div>
                  <h4 className="font-bold text-[#0F766E] text-sm mb-1">Deskripsi Peran:</h4>
                  <p className="leading-relaxed">{selectedPreviewJob.description}</p>
                </div>

                <div>
                  <h4 className="font-bold text-[#0F766E] text-sm mb-1">Kualifikasi Kunci:</h4>
                  <ul className="list-disc list-inside space-y-1.5">
                    {selectedPreviewJob.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="/pelamar/login"
                className="w-full py-4 rounded-full bg-[#0F766E] hover:bg-[#0D635C] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                Mulai Seleksi PO-FIT Untuk Posisi Ini &rarr;
              </Link>

            </div>
          </div>

        </div>
      </section>

      {/* Success Candidate Stories Carousel Section */}
      <section id="success-stories" className="bg-white border-t border-b border-[#CCFBF1] py-16">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F766E] bg-[#E6FFFA] px-3.5 py-1 rounded-full border border-[#99F6E4]">
              Kisah Sukses Pelamar
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F766E]">
              Diterima Bekerja Dalam Hitungan Hari
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Dengarkan pengalaman pelamar yang telah mendapatkan karir impian melalui seleksi PO-FIT AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {successStories.map((story, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-[#F4FDFB] border border-[#CCFBF1] space-y-6 shadow-xs relative">
                <MessageSquareQuote size={40} className="text-[#0F766E]/20 absolute right-6 top-6" />
                <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed">
                  "{story.comment}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-4">
                    <img src={story.avatar} alt={story.name} className="w-12 h-12 rounded-2xl object-cover border border-[#99F6E4]" />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0F766E]">{story.name}</h4>
                      <span className="text-xs text-slate-500">{story.role} di {story.company}</span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-[#0F766E] bg-[#E6FFFA] px-3 py-1 rounded-full border border-[#99F6E4]">
                    Proses: {story.timeDays}
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
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F766E] bg-[#E6FFFA] px-3 py-1 rounded-full border border-[#99F6E4]">
            Pertanyaan Umum (FAQ)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F766E]">
            Informasi Untuk Pelamar
          </h2>
        </div>

        <div className="space-y-4">
          {faqItems.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-[#CCFBF1] shadow-2xs overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-[#0F766E] flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180 text-[#0F766E]' : 'text-slate-400'}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#CCFBF1] py-14 mt-auto">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-xs sm:text-sm text-slate-500">
            
            <div className="space-y-4">
              <span className="font-extrabold text-xl text-[#0F766E] block">AI-Recruit Pro</span>
              <p className="text-slate-500 leading-relaxed">
                Platform kecerdasan bakat (Talent Intelligence) berbasis Person-Organization Fit (PO-FIT) terdepan.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-[#0F766E] text-xs uppercase tracking-wider">Cari Pekerjaan</h4>
              <ul className="space-y-2">
                <li><Link href="/pelamar/login" className="hover:text-[#0F766E]">Dashboard Pelamar</Link></li>
                <li><Link href="/pelamar/login" className="hover:text-[#0F766E]">Upload CV (NLP)</Link></li>
                <li><Link href="/pelamar/login" className="hover:text-[#0F766E]">Wawancara Video AI</Link></li>
                <li><Link href="/pelamar/login" className="hover:text-[#0F766E]">Status Validasi</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-[#0F766E] text-xs uppercase tracking-wider">Untuk Perusahaan</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-[#0F766E]">Portal HR / Dashboard</Link></li>
                <li><Link href="/pipeline" className="hover:text-[#0F766E]">Pipeline Rekrutmen Kanban</Link></li>
                <li><Link href="/reviews" className="hover:text-[#0F766E]">Decision Hub PO-FIT</Link></li>
                <li><Link href="/archive" className="hover:text-[#0F766E]">Arsip Rekam Jejak</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-[#0F766E] text-xs uppercase tracking-wider">Metodologi &amp; Keamanan</h4>
              <ul className="space-y-2">
                <li>NLP Cosine Embeddings</li>
                <li>Multimodal Video Tracking</li>
                <li>Standardisasi Bias-Free HR</li>
                <li>Privasi &amp; Enkripsi Data</li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <span>&copy; {new Date().getFullYear()} AI-Recruit Pro. Seluruh hak cipta dilindungi.</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6FFFA] text-[#0F766E] font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
                System Ready &amp; Active
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Job Details */}
      {activeJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={activeJobModal.logo}
                  alt={activeJobModal.company}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#CCFBF1]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-500 block">{activeJobModal.company}</span>
                  <h3 className="font-bold text-xl text-[#0F766E]">{activeJobModal.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveJobModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center justify-between bg-[#E6FFFA] p-4 rounded-2xl border border-[#99F6E4]">
                <span className="font-bold text-[#0F766E]">Perkiraan Match PO-FIT AI:</span>
                <span className="font-extrabold text-[#0F766E] bg-white px-4 py-1 rounded-full shadow-2xs">
                  {activeJobModal.matchEstimate}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#0F766E] text-sm">Deskripsi Pekerjaan:</h4>
                <p className="leading-relaxed">{activeJobModal.description}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#0F766E] text-sm">Kualifikasi Kunci:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                  {activeJobModal.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveJobModal(null)}
                className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Tutup
              </button>

              <Link
                href="/pelamar/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0F766E] hover:bg-[#0D635C] text-white font-bold text-xs shadow-xs"
              >
                Masuk Portal Pelamar
                <ArrowRight size={15} className="text-[#E6FFFA]" />
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
